"""One search-enabled generation call, then repair or coerce to a sendable body."""

from __future__ import annotations

import logging
import re
import unicodedata
from collections.abc import Sequence
from dataclasses import dataclass

from app.domain.ports import LlmGenerationResult, LlmPort, StructuredLlmResult
from app.llm.schema import LexContact, LexSource
from app.llm.url_liveness import strip_dead_urls
from app.llm.url_normalize import (
    match_search_url,
    repair_email_domain_typos,
    source_dedup_key,
)
from app.llm.validation import LexValidationError, validate_lex_response

_LOG = logging.getLogger(__name__)
_CITATION_RE = re.compile(r"\[(\d+)\]")
_SIGN_OFF_RE = re.compile(r"(?:\n|^)Lex\.\s*$")
_PAREN_SPAN_RE = re.compile(r"([ \t]+)\(([^()\n]{2,120})\)")
_WORD_TOKEN_RE = re.compile(r"\S+")
# Schema/URL failures we can still send as a sourced answer after repair.
# Any other validation code (neutrality, HTML, donation, unknown future
# content-quality codes) is demoted to clarify so we do not stamp "adequate".
_KEEP_SOURCED_ANSWER_CODES = frozenset(
    {
        "answer_without_search",
        "unsupported_source_url",
        "unsupported_contact_website",
        "answer_without_source",
        "answer_research_not_adequate",
        "citation_without_source",
        "uncited_source",
        "contact_without_source",
        "contact_not_in_body",
        "non_contiguous_source_ids",
        "non_contiguous_contact_ids",
        "missing_sign_off",
        "duplicate_source_url",
        "contact_email_domain_typo",
    }
)
_DASH_CHARS = (
    "\u2010",  # hyphen
    "\u2011",  # non-breaking hyphen
    "\u2012",  # figure dash
    "\u2013",  # en dash
    "\u2014",  # em dash
    "\u2015",  # horizontal bar
    "\u2212",  # minus
    "\ufe58",  # small em dash
    "\ufe63",  # small hyphen-minus
    "\uff0d",  # fullwidth hyphen-minus
)


@dataclass(frozen=True, slots=True)
class ModelPipelineFailure(Exception):
    """Raised when generation cannot produce a usable body."""

    code: str
    attempt_count: int

    def __str__(self) -> str:
        return self.code


def _should_force_search_on_retry(
    error: LexValidationError,
    result: LlmGenerationResult,
) -> bool:
    if error.code == "answer_without_search":
        return True
    return (
        result.response.action == "answer"
        and result.web_search_calls < 1
        and error.code
        in {
            "unsupported_source_url",
            "unsupported_contact_website",
            "answer_without_source",
        }
    )


def _is_retryable_provider_error(exc: BaseException) -> bool:
    """True when Cloud Tasks should retry (outage / 5xx / rate limit)."""
    status = getattr(exc, "status_code", None)
    if isinstance(status, int) and (status == 429 or status >= 500):
        return True
    name = type(exc).__name__
    if name in {
        "APIConnectionError",
        "APITimeoutError",
        "RateLimitError",
        "InternalServerError",
    }:
        return True
    return isinstance(exc, TimeoutError | ConnectionError | OSError)


@dataclass(slots=True)
class CountingLlmAdapter:
    """Count ``generate`` calls so one inbound mail cannot exceed the budget."""

    inner: LlmPort
    remaining: int
    used: int = 0

    def generate(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        force_web_search: bool = False,
    ) -> LlmGenerationResult:
        if self.used >= self.remaining:
            raise ModelPipelineFailure("llm_call_budget", attempt_count=self.used)
        self.used += 1
        return self.inner.generate(
            system_prompt=system_prompt,
            runtime_envelope=runtime_envelope,
            force_web_search=force_web_search,
        )

    def generate_structured(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        json_schema: dict[str, object],
        schema_name: str,
        enable_web_search: bool,
        force_web_search: bool = False,
        reasoning_effort: str | None = None,
        max_output_tokens: int | None = None,
    ) -> StructuredLlmResult:
        return self.inner.generate_structured(
            system_prompt=system_prompt,
            runtime_envelope=runtime_envelope,
            json_schema=json_schema,
            schema_name=schema_name,
            enable_web_search=enable_web_search,
            force_web_search=force_web_search,
            reasoning_effort=reasoning_effort,
            max_output_tokens=max_output_tokens,
        )


def _try_generate(
    llm: LlmPort,
    *,
    system_prompt: str,
    runtime_envelope: str,
    force_web_search: bool,
) -> LlmGenerationResult | None:
    try:
        result = llm.generate(
            system_prompt=system_prompt,
            runtime_envelope=runtime_envelope,
            force_web_search=force_web_search,
        )
    except Exception as exc:  # noqa: BLE001 — empty JSON vs provider outage
        if _is_retryable_provider_error(exc):
            raise
        _LOG.warning(
            "lex_generate_unusable force_web_search=%s error_type=%s error=%s",
            force_web_search,
            type(exc).__name__,
            str(exc)[:200],
            exc_info=True,
        )
        return None
    return _normalize_model_response(result)


def run_model_pipeline(
    llm: LlmPort,
    *,
    system_prompt: str,
    runtime_envelope: str,
) -> LlmGenerationResult:
    """Generate once; retry only when a parsed body failed validation."""
    first = _try_generate(
        llm,
        system_prompt=system_prompt,
        runtime_envelope=runtime_envelope,
        force_web_search=False,
    )
    if first is None:
        raise ModelPipelineFailure("missing_structured_output", attempt_count=1)
    try:
        validate_lex_response(
            first.response,
            web_search_source_urls=first.web_search_source_urls,
            web_search_calls=first.web_search_calls,
        )
        return first
    except LexValidationError as first_error:
        force_search = _should_force_search_on_retry(first_error, first)

    second = _try_generate(
        llm,
        system_prompt=system_prompt,
        runtime_envelope=runtime_envelope,
        force_web_search=force_search,
    )
    candidate = second if second is not None else first
    try:
        validate_lex_response(
            candidate.response,
            web_search_source_urls=candidate.web_search_source_urls,
            web_search_calls=candidate.web_search_calls,
        )
        return candidate
    except LexValidationError as error:
        _LOG.info("lex_response_coerced code=%s", error.code)
        return _coerce_sendable(candidate, reason=error.code)


def _normalize_newlines(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def _ensure_lex_signoff(body: str) -> str:
    stripped = body.rstrip()
    if _SIGN_OFF_RE.search(stripped):
        return stripped
    return f"{stripped}\n\nLex."


def _strip_answer_grounding(body: str) -> str:
    body = _CITATION_RE.sub("", body)
    body = re.sub(r"[ \t]+\n", "\n", body)
    return re.sub(r" {2,}", " ", body)


def _fold_text(text: str) -> str:
    """Case- and diacritic-insensitive fold (including Turkish dotted/dotless i)."""
    decomposed = unicodedata.normalize("NFD", text.replace("ı", "i").replace("İ", "i"))
    stripped = "".join(
        ch for ch in decomposed if unicodedata.category(ch) != "Mn"
    )
    return unicodedata.normalize("NFC", stripped).casefold()


def _strip_redundant_parentheticals(body: str) -> str:
    """Collapse redundant 'x y (X Y)' or 'Prefix X Y (X Y)' parentheticals."""
    out_lines: list[str] = []
    for line in body.split("\n"):
        pos = 0
        rebuilt: list[str] = []
        for match in _PAREN_SPAN_RE.finditer(line):
            inner = match.group(2).strip()
            inner_words = inner.split()
            before = line[pos : match.start()]
            prev_tokens = list(_WORD_TOKEN_RE.finditer(before))
            k = len(inner_words)
            if k >= 1 and len(prev_tokens) >= k:
                first_tok = prev_tokens[-k]
                candidate_span = before[first_tok.start() :]
                cleaned_candidate = candidate_span.lstrip("(\"'«„[")
                leading_punct = candidate_span[
                    : len(candidate_span) - len(cleaned_candidate)
                ]
                if _fold_text(cleaned_candidate) == _fold_text(inner):
                    rebuilt.append(before[: first_tok.start()] + leading_punct + inner)
                    pos = match.end()
                    continue
            rebuilt.append(line[pos : match.end()])
            pos = match.end()
        rebuilt.append(line[pos:])
        out_lines.append("".join(rebuilt))
    return "\n".join(out_lines)


def _find_matching_span_in_body(target: str, body: str) -> str | None:
    """Find a verbatim substring in body matching target after diacritic folding."""
    target_words = target.split()
    k = len(target_words)
    if k == 0:
        return None
    target_folded = _fold_text(" ".join(target_words))
    tokens = list(_WORD_TOKEN_RE.finditer(body))
    if len(tokens) < k:
        return None
    for idx in range(len(tokens) - k + 1):
        raw_span = body[tokens[idx].start() : tokens[idx + k - 1].end()]
        trimmed = raw_span.strip(".,;:!?()[]\"'«»„“”")
        if (
            "\n" not in trimmed
            and _fold_text(" ".join(trimmed.split())) == target_folded
        ):
            return trimmed
    return None


def _reconcile_contact_name(name: str, body: str) -> str | None:
    """Return an existing substring of body that represents this contact name."""
    if not name.strip():
        return None
    if name.casefold() in body.casefold():
        return name
    direct = _find_matching_span_in_body(name, body)
    if direct is not None:
        return direct
    for sep in (", ", " (", " - ", " / "):
        if sep in name:
            prefix = name.split(sep, 1)[0].strip()
            if len(prefix) >= 8:
                if prefix.casefold() in body.casefold():
                    return prefix
                matched = _find_matching_span_in_body(prefix, body)
                if matched is not None:
                    return matched
    return None


def _insert_contact_name_inline(body: str, name: str, source_id: int) -> str:
    """Weave a missing contact name inline before its [source_id] citation."""
    marker_pattern = re.compile(rf"(?:[ \t]*\[\d+\])*?[ \t]*\[{source_id}\]")
    match = marker_pattern.search(body)
    if match is not None:
        idx = match.start()
        return f"{body[:idx]} ({name}){body[idx:]}"
    stripped = body.rstrip()
    if stripped.endswith("Lex."):
        return f"{stripped[:-4].rstrip()} ({name}) [{source_id}]\n\nLex."
    return f"{stripped} ({name}) [{source_id}]\n\nLex."


def _ensure_all_sources_cited(
    body: str,
    sources: Sequence[LexSource],
    contacts: Sequence[LexContact],
) -> str:
    """Ensure every source.id appears at least once as [id] in body_markdown."""
    cited_markers = {int(match) for match in _CITATION_RE.findall(body)}
    for source in sources:
        if source.id in cited_markers:
            continue
        inserted = False
        for contact in contacts:
            if contact.source_id == source.id and contact.name.strip():
                pos = body.casefold().find(contact.name.casefold())
                if pos != -1:
                    end_pos = pos + len(contact.name)
                    line_end = body.find("\n", end_pos)
                    if line_end == -1:
                        line_end = len(body)
                    clause = body[end_pos:line_end]
                    punct_match = re.search(r"[.;!?]", clause)
                    insert_at = (
                        end_pos + punct_match.start()
                        if punct_match is not None
                        else end_pos
                    )
                    body = f"{body[:insert_at]} [{source.id}]{body[insert_at:]}"
                    inserted = True
                    break
        if not inserted:
            insert = f" [{source.id}]"
            stripped = body.rstrip()
            if stripped.endswith("Lex."):
                body = stripped[:-4].rstrip() + insert + "\n\nLex."
            else:
                body = stripped + insert + "\n\nLex."
        cited_markers.add(source.id)
    return body


def _coerce_sendable(
    result: LlmGenerationResult, *, reason: str
) -> LlmGenerationResult:
    """Drop ungrounded extras so a parsed body can still be mailed."""
    response = result.response
    body = _normalize_dashes(_normalize_newlines(response.body_markdown))
    sources = list(response.sources)
    contacts = list(response.contacts)
    action = response.action
    research_status = response.research_status

    keep_sourced_answer = (
        action == "answer"
        and reason in _KEEP_SOURCED_ANSWER_CODES
        and result.web_search_calls >= 1
        and bool(result.web_search_source_urls)
        and bool(sources)
    )
    if action == "answer" and not keep_sourced_answer:
        action = "clarify"
        research_status = "not_needed"
        sources = []
        contacts = []
        body = _strip_answer_grounding(body)
    elif action == "answer":
        research_status = "adequate"
    if action == "clarify":
        research_status = "not_needed"
    if action == "decline":
        sources = []
        contacts = []
        research_status = "not_needed"

    body = _ensure_lex_signoff(body)
    if not body.replace("Lex.", "").strip():
        raise ModelPipelineFailure("empty_body", attempt_count=2)

    repaired = response.model_copy(
        update={
            "action": action,
            "research_status": research_status,
            "body_markdown": body,
            "sources": sources,
            "contacts": contacts,
        }
    )
    return LlmGenerationResult(
        response=repaired,
        openai_response_id=result.openai_response_id,
        web_search_source_urls=result.web_search_source_urls,
        web_search_calls=result.web_search_calls,
    )


def _normalize_model_response(result: LlmGenerationResult) -> LlmGenerationResult:
    """Deterministic fixes so common model slips pass blueprint validation."""
    response = result.response
    body = _strip_redundant_parentheticals(
        _normalize_dashes(_normalize_newlines(response.body_markdown))
    )
    sources = [
        source.model_copy(
            update={
                "title": _normalize_dashes(source.title),
                "publisher": _normalize_dashes(source.publisher),
            }
        )
        for source in response.sources
    ]
    contacts = [
        contact.model_copy(
            update={
                "name": _normalize_dashes(contact.name),
                "note": _normalize_dashes(contact.note),
            }
        )
        for contact in response.contacts
    ]

    if response.action == "answer" and result.web_search_source_urls:
        body, sources, contacts = _repair_search_evidence(
            body,
            sources,
            contacts,
            search_urls=list(result.web_search_source_urls),
        )

    if sources or contacts:
        body, sources, contacts = strip_dead_urls(body, sources, contacts)

    if contacts:
        contact_websites = [contact.website for contact in contacts]
        known_urls = [
            *result.web_search_source_urls,
            *(source.url for source in sources),
        ]
        body = repair_email_domain_typos(body, contact_websites, known_urls=known_urls)
        contacts = [
            contact.model_copy(
                update={
                    "email": (
                        repair_email_domain_typos(
                            contact.email, contact_websites, known_urls=known_urls
                        )
                        if contact.email is not None
                        else None
                    ),
                    "note": repair_email_domain_typos(
                        contact.note, contact_websites, known_urls=known_urls
                    ),
                }
            )
            for contact in contacts
        ]

    reconciled_contacts: list[LexContact] = []
    for contact in contacts:
        if not contact.name.strip():
            reconciled_contacts.append(contact)
            continue
        matched_name = _reconcile_contact_name(contact.name, body)
        if matched_name is not None:
            reconciled_contacts.append(
                contact.model_copy(update={"name": matched_name})
                if matched_name != contact.name
                else contact
            )
        else:
            body = _insert_contact_name_inline(body, contact.name, contact.source_id)
            reconciled_contacts.append(contact)
    contacts = reconciled_contacts

    if sources:
        body = _ensure_all_sources_cited(body, sources, contacts)

    body = _normalize_dashes(body)

    if (
        body == response.body_markdown
        and sources == list(response.sources)
        and contacts == list(response.contacts)
    ):
        return result
    repaired = response.model_copy(
        update={
            "body_markdown": body,
            "sources": sources,
            "contacts": contacts,
        }
    )
    return LlmGenerationResult(
        response=repaired,
        openai_response_id=result.openai_response_id,
        web_search_source_urls=result.web_search_source_urls,
        web_search_calls=result.web_search_calls,
    )


def _normalize_dashes(text: str) -> str:
    """Normalise dash-like Unicode and strip em dashes (U+2014)."""

    pieces: list[str] = []
    for char in text:
        if char in {"-", "_"}:
            pieces.append(char)
            continue
        category = unicodedata.category(char)
        name = unicodedata.name(char, "")
        is_dash_like = (
            category == "Pd"
            or char in _DASH_CHARS
            or char == "\u00ad"
            or "DASH" in name
            or "HYPHEN" in name
            or name == "MINUS SIGN"
        )
        if is_dash_like:
            if ord(char) >= 0x2014 or "EM DASH" in name or "HORIZONTAL BAR" in name:
                pieces.append("\u2014")
            else:
                pieces.append("-")
        else:
            pieces.append(char)
    normalized = "".join(pieces)
    normalized = re.sub(r"`([^`\n]+)`", r"\1", normalized)
    return re.sub(r"[ \t]*\u2014[ \t]*", " - ", normalized)


def _repair_search_evidence(
    body: str,
    sources: list[LexSource],
    contacts: list[LexContact],
    *,
    search_urls: list[str],
) -> tuple[str, list[LexSource], list[LexContact]]:
    """Rewrite or drop sources/contacts using search-grounded URLs."""
    kept_sources: list[LexSource] = []
    old_to_new: dict[int, int] = {}
    seen_dedup: dict[str, int] = {}
    for source in sources:
        matched = match_search_url(source.url, search_urls)
        if matched is None:
            continue
        dedup_key = source_dedup_key(matched)
        existing_id = seen_dedup.get(dedup_key)
        if existing_id is not None:
            old_to_new[source.id] = existing_id
            continue
        new_id = len(kept_sources) + 1
        seen_dedup[dedup_key] = new_id
        old_to_new[source.id] = new_id
        kept_sources.append(source.model_copy(update={"id": new_id, "url": matched}))

    # Remap citation markers; drop markers whose sources were removed.
    def _rewrite_marker(match: re.Match[str]) -> str:
        old_id = int(match.group(1))
        new_id = old_to_new.get(old_id)
        return f"[{new_id}]" if new_id is not None else ""

    body = _CITATION_RE.sub(_rewrite_marker, body)
    body = re.sub(r"(\[\d+\])(?:\s*\1)+", r"\1", body)
    body = re.sub(r"[ \t]+\n", "\n", body)
    body = re.sub(r" {2,}", " ", body)

    source_by_new = {source.id: source for source in kept_sources}
    kept_contacts: list[LexContact] = []
    for contact in contacts:
        new_source_id = old_to_new.get(contact.source_id)
        if new_source_id is None:
            continue
        website = match_search_url(contact.website, search_urls)
        if website is None:
            website = source_by_new[new_source_id].url
        if match_search_url(website, search_urls) is None:
            continue
        kept_contacts.append(
            contact.model_copy(
                update={
                    "id": len(kept_contacts) + 1,
                    "source_id": new_source_id,
                    "website": match_search_url(website, search_urls) or website,
                }
            )
        )

    body = _ensure_all_sources_cited(body, kept_sources, kept_contacts)

    return body, kept_sources, kept_contacts


__all__ = ["CountingLlmAdapter", "ModelPipelineFailure", "run_model_pipeline"]
