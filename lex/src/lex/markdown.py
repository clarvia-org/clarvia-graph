from __future__ import annotations

import re
from dataclasses import dataclass

from lex.errors import ErrorCode, LexError
from lex.frontmatter import parse_frontmatter, serialize_frontmatter

ANCHOR_RE = re.compile(r'<a\s+id="([^"]+)"></a>')
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")


@dataclass(frozen=True)
class ProvisionBlock:
    anchor: str
    heading_level: int
    start: int
    end: int


def normalize_anchor(raw: str) -> str:
    """Normalize an official identifier to a provision anchor."""
    lowered = raw.strip().lower()
    collapsed = re.sub(r"[^a-z0-9]+", "-", lowered)
    return collapsed.strip("-")


def extract_provision(markdown: str, anchor: str) -> str:
    """Extract one provision block from a normalized law Markdown file."""
    metadata, body = parse_frontmatter(markdown)
    if not metadata:
        raise LexError(ErrorCode.LEX_INVALID_DATA, "", "Missing frontmatter")

    provision_body = provision_markdown_slice(body, anchor, document_id=str(metadata.get("id", "")))

    provision_meta = dict(metadata)
    # Insert provision after warning, else after retrieved_at.
    ordered: dict[str, object] = {}
    inserted = False
    for key, value in provision_meta.items():
        ordered[key] = value
        if key == "warning" or (key == "retrieved_at" and "warning" not in provision_meta):
            ordered["provision"] = anchor
            inserted = True
    if not inserted:
        ordered["provision"] = anchor

    return serialize_frontmatter(ordered) + "\n" + provision_body


def provision_markdown_slice(body: str, anchor: str, *, document_id: str = "") -> str:
    """Return the provision Markdown slice (anchor + heading + body) from a law body."""
    lines = body.splitlines()
    blocks = _index_provisions(lines)
    match = next((block for block in blocks if block.anchor == anchor), None)
    if match is None:
        raise LexError(
            ErrorCode.LEX_PROVISION_NOT_FOUND,
            document_id,
            f"Provision anchor not found: {anchor}",
        )
    return "\n".join(lines[match.start : match.end]).rstrip() + "\n"


def _index_provisions(lines: list[str]) -> list[ProvisionBlock]:
    blocks: list[ProvisionBlock] = []
    i = 0
    while i < len(lines):
        anchor_match = ANCHOR_RE.fullmatch(lines[i].strip())
        if not anchor_match:
            i += 1
            continue

        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j >= len(lines):
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                "",
                f"Anchor {anchor_match.group(1)} is not followed by a heading",
            )

        heading_match = HEADING_RE.match(lines[j])
        if not heading_match:
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                "",
                f"Anchor {anchor_match.group(1)} is not followed by a heading",
            )

        level = len(heading_match.group(1))
        end = len(lines)
        k = j + 1
        while k < len(lines):
            next_anchor = ANCHOR_RE.fullmatch(lines[k].strip())
            if next_anchor:
                m = k + 1
                while m < len(lines) and not lines[m].strip():
                    m += 1
                if m < len(lines):
                    next_heading = HEADING_RE.match(lines[m])
                    if next_heading and len(next_heading.group(1)) <= level:
                        end = k
                        break
            k += 1

        blocks.append(
            ProvisionBlock(
                anchor=anchor_match.group(1),
                heading_level=level,
                start=i,
                end=end,
            )
        )
        i = j + 1

    return blocks
