"""One search-enabled generation call, then repair or coerce to a sendable body."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from app.domain.ports import LlmGenerationResult, LlmPort, StructuredLlmResult
from app.llm.schema import LexContact, LexSource
from app.llm.url_liveness import strip_dead_urls
from app.llm.url_normalize import match_search_url
from app.llm.validation import LexValidationError, validate_lex_response

_LOG = logging.getLogger(__name__)
_CITATION_RE = re.compile(r"\[(\d+)\]")
_SIGN_OFF_RE = re.compile(r"(?:\n|^)Lex\.\s*$")
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
    stripped = _normalize_newlines(body).rstrip()
    if _SIGN_OFF_RE.search(stripped):
        return stripped
    return f"{stripped}\n\nLex."


def _strip_answer_grounding(body: str) -> str:
    body = _CITATION_RE.sub("", body)
    body = re.sub(r"[ \t]+\n", "\n", body)
    return re.sub(r" {2,}", " ", body)


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
    body = _normalize_dashes(_normalize_newlines(response.body_markdown))
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

    body_folded = body.casefold()
    missing_names = [
        contact.name
        for contact in contacts
        if contact.name.strip() and contact.name.casefold() not in body_folded
    ]
    if missing_names:
        bullets = "\n".join(f"- {name}" for name in missing_names)
        insert = f"\n\nOrganisations and contacts:\n{bullets}\n"
        stripped = body.rstrip()
        if stripped.endswith("Lex."):
            body = stripped[:-4].rstrip() + insert + "\nLex."
        else:
            body = stripped + insert + "\n\nLex."

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
    """Normalise awkward hyphen variants; leave em dashes in place."""
    import unicodedata

    pieces: list[str] = []
    for char in text:
        if char in {"-", "_", "\u2014"}:
            pieces.append(char)
            continue
        category = unicodedata.category(char)
        name = unicodedata.name(char, "")
        if "EM DASH" in name:
            pieces.append(char)
            continue
        is_dash_like = (
            category == "Pd"
            or char in _DASH_CHARS
            or char == "\u00ad"
            or "DASH" in name
            or "HYPHEN" in name
            or name == "MINUS SIGN"
        )
        if is_dash_like:
            if "HORIZONTAL BAR" in name or ord(char) >= 0x2015:
                pieces.append(" - ")
            else:
                pieces.append("-")
        else:
            pieces.append(char)
    return "".join(pieces)


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
    for source in sources:
        matched = match_search_url(source.url, search_urls)
        if matched is None:
            continue
        new_id = len(kept_sources) + 1
        old_to_new[source.id] = new_id
        kept_sources.append(source.model_copy(update={"id": new_id, "url": matched}))

    # Remap citation markers; drop markers whose sources were removed.
    def _rewrite_marker(match: re.Match[str]) -> str:
        old_id = int(match.group(1))
        new_id = old_to_new.get(old_id)
        return f"[{new_id}]" if new_id is not None else ""

    body = _CITATION_RE.sub(_rewrite_marker, body)
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

    # Ensure every remaining source is cited or used by a contact.
    cited_markers = {int(match) for match in _CITATION_RE.findall(body)}
    used_by_contact = {contact.source_id for contact in kept_contacts}
    for source in kept_sources:
        if source.id in cited_markers or source.id in used_by_contact:
            continue
        # Append a citation before sign-off.
        insert = f" [{source.id}]"
        stripped = body.rstrip()
        if stripped.endswith("Lex."):
            body = stripped[:-4].rstrip() + insert + "\n\nLex."
        else:
            body = stripped + insert + "\n\nLex."
        cited_markers.add(source.id)

    return body, kept_sources, kept_contacts


__all__ = ["CountingLlmAdapter", "ModelPipelineFailure", "run_model_pipeline"]
