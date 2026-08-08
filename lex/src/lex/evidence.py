"""Agent-facing JSON evidence helpers (presentation only).

Does not modify law files, adapters, frontmatter serialization, or fidelity.
"""

from __future__ import annotations

import re
import unicodedata
from datetime import date, datetime
from typing import Any

from lex.errors import ErrorCode, LexError
from lex.frontmatter import parse_frontmatter
from lex.markdown import ANCHOR_RE, HEADING_RE, provision_markdown_slice

_HTML_TAG_RE = re.compile(r"<[^>]+>")
_APOSTROPHES = {
    "\u2019",  # ’
    "\u2018",  # ‘
    "\u02bc",  # ʼ
    "\u2032",  # ′
    "\u00b4",  # ´
    "\u0060",  # `
    "\uff07",  # ＇
}

MATCHED_ON_ORDER = (
    "id",
    "title",
    "official_id",
    "eli_uri",
    "document_type",
    "heading",
    "body",
)

_PASSTHROUGH_META = (
    "country",
    "language",
    "title",
    "document_type",
    "status",
    "official_id",
    "eli_uri",
    "source_url",
    "source_sha256",
    "source_attribution",
    "published_at",
    "consolidated_at",
    "retrieved_at",
    "warning",
)


def normalize_for_search(text: str) -> str:
    """Casefold + diacritic fold + typographic apostrophe normalize."""
    folded = "".join(ch if ch not in _APOSTROPHES else "'" for ch in text)
    decomposed = unicodedata.normalize("NFD", folded.casefold())
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def provision_heading_path(body: str, anchor: str) -> list[str]:
    """Build heading_path per BLUEPRINT §7.6 (structural stack + provision)."""
    lines = body.splitlines()
    provision_heading_lines: dict[int, str] = {}

    for i, line in enumerate(lines):
        anchor_match = ANCHOR_RE.fullmatch(line.strip())
        if not anchor_match:
            continue
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j < len(lines) and HEADING_RE.match(lines[j]):
            provision_heading_lines[j] = anchor_match.group(1)

    stack: list[tuple[int, str]] = []
    result: list[str] | None = None

    for i, line in enumerate(lines):
        heading_match = HEADING_RE.match(line)
        if not heading_match:
            continue
        level = len(heading_match.group(1))
        label = heading_match.group(2).strip()

        if i in provision_heading_lines:
            if provision_heading_lines[i] == anchor:
                result = [entry[1] for entry in stack] + [label]
            continue

        # Document-title H1 does not enter the structural stack.
        if level == 1:
            continue

        while stack and stack[-1][0] >= level:
            stack.pop()
        stack.append((level, label))

    if result is None:
        raise LexError(
            ErrorCode.LEX_PROVISION_NOT_FOUND,
            "",
            f"Provision anchor not found: {anchor}",
        )
    return result


def provision_plain_text(markdown: str) -> str:
    """Strip anchors and heading markers for plain-text counts."""
    lines: list[str] = []
    for line in markdown.splitlines():
        if ANCHOR_RE.fullmatch(line.strip()):
            continue
        heading = HEADING_RE.match(line)
        if heading:
            lines.append(heading.group(2).strip())
            continue
        cleaned = _HTML_TAG_RE.sub("", line).strip()
        if cleaned:
            lines.append(cleaned)
    return "\n".join(lines)


def _optional_str(meta: dict[str, Any], key: str) -> str | None:
    value = meta.get(key)
    if value is None:
        return None
    text = str(value)
    return text if text else None


def jsonable_meta_value(value: Any) -> Any:
    """Coerce YAML-parsed scalars to JSON-serializable forms.

    Unquoted frontmatter dates become datetime.date / datetime.datetime via
    yaml.safe_load; json.dumps cannot serialize those.
    """
    if isinstance(value, datetime):
        text = value.isoformat()
        if text.endswith("+00:00"):
            return text[:-6] + "Z"
        return text
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: jsonable_meta_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [jsonable_meta_value(item) for item in value]
    return value


def jsonable_metadata(meta: dict[str, Any]) -> dict[str, Any]:
    """Return a JSON-serializable copy of parsed frontmatter."""
    return {key: jsonable_meta_value(value) for key, value in meta.items()}


def build_provision_evidence(markdown: str, anchor: str) -> dict[str, Any]:
    """Build §7.6 provision JSON evidence from a whole-law Markdown file."""
    meta, body = parse_frontmatter(markdown)
    if not meta:
        raise LexError(ErrorCode.LEX_INVALID_DATA, "", "Missing frontmatter")

    document_id = str(meta.get("id", ""))
    provision_md = provision_markdown_slice(body, anchor, document_id=document_id)
    heading_path = provision_heading_path(body, anchor)
    plain = provision_plain_text(provision_md)
    label = heading_path[-1] if heading_path else anchor

    title = _optional_str(meta, "title") or ""
    publisher = _optional_str(meta, "source_attribution")
    source_url = _optional_str(meta, "source_url")
    eli_uri = _optional_str(meta, "eli_uri")
    official_id = _optional_str(meta, "official_id")
    locator = source_url or eli_uri or ""

    formatted_parts = [part for part in (title, label, publisher, locator) if part]
    formatted = " ".join(formatted_parts)

    evidence: dict[str, Any] = {
        "provision_id": f"{document_id}/{anchor}",
        "document_id": document_id,
        "anchor": anchor,
        "title": title,
    }
    for key in _PASSTHROUGH_META:
        if key == "title":
            continue
        if key not in meta:
            continue
        value = meta[key]
        if value is None:
            continue
        if key == "warning":
            evidence[key] = str(value)
        else:
            evidence[key] = jsonable_meta_value(value)

    for key in ("country", "language", "document_type", "status"):
        if key in evidence and evidence[key] is not None:
            evidence[key] = str(evidence[key])

    evidence["heading_path"] = heading_path
    evidence["markdown"] = provision_md
    evidence["plain_text"] = plain
    evidence["character_count"] = len(plain)
    evidence["word_count"] = len(plain.split()) if plain.strip() else 0

    citation: dict[str, Any] = {
        "label": label,
        "document_title": title,
        "formatted": formatted,
    }
    if publisher is not None:
        citation["publisher"] = publisher
    if official_id is not None:
        citation["official_id"] = official_id
    if eli_uri is not None:
        citation["eli_uri"] = eli_uri
    if source_url is not None:
        citation["source_url"] = source_url
    evidence["citation"] = citation

    return evidence


def search_field_matches(
    *,
    law_id: str,
    title: str,
    official_id: str,
    eli_uri: str,
    document_type: str,
    headings: list[str],
    body: str,
    needle: str,
) -> list[str]:
    """Return every matching field name in MATCHED_ON_ORDER."""
    matched: list[str] = []
    if needle and needle in normalize_for_search(law_id):
        matched.append("id")
    if needle and needle in normalize_for_search(title):
        matched.append("title")
    if needle and needle in normalize_for_search(official_id):
        matched.append("official_id")
    if needle and needle in normalize_for_search(eli_uri):
        matched.append("eli_uri")
    if needle and needle in normalize_for_search(document_type):
        matched.append("document_type")
    if needle and any(needle in normalize_for_search(h) for h in headings):
        matched.append("heading")
    if needle and needle in normalize_for_search(body):
        matched.append("body")
    return matched


def search_rank_score(
    *,
    law_id: str,
    title: str,
    matched_on: list[str],
    needle: str,
) -> int | None:
    """BLUEPRINT §7.4 rank score (lower is better), or None if no match."""
    if not matched_on:
        return None
    norm_id = normalize_for_search(law_id)
    norm_title = normalize_for_search(title)
    if "id" in matched_on and norm_id == needle:
        return 1
    if "title" in matched_on and norm_title == needle:
        return 2
    if "title" in matched_on:
        return 3
    if "heading" in matched_on:
        return 4
    return 5
