"""Model generation, validation, and bounded retry (blueprint section 18.5)."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.domain.ports import LlmGenerationResult, LlmPort
from app.llm.schema import LexContact, LexResponse, LexSource
from app.llm.url_normalize import normalize_source_url, normalize_source_url_set
from app.llm.validation import LexValidationError, validate_lex_response

_CITATION_RE = re.compile(r"\[(\d+)\]")
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
    """Raised after one regeneration attempt still fails validation."""

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


def run_model_pipeline(
    llm: LlmPort,
    *,
    system_prompt: str,
    runtime_envelope: str,
) -> LlmGenerationResult:
    """Generate, validate, retry once on failure, then fail closed."""
    first = llm.generate(
        system_prompt=system_prompt,
        runtime_envelope=runtime_envelope,
        force_web_search=False,
    )
    first = _normalize_model_response(first)
    try:
        validate_lex_response(
            first.response,
            web_search_source_urls=first.web_search_source_urls,
            web_search_calls=first.web_search_calls,
        )
        return first
    except LexValidationError as first_error:
        # If normalize left a forbidden dash, strip again hard before retrying.
        if first_error.code == "em_dash":
            first = _force_strip_em_dash(first)
            try:
                validate_lex_response(
                    first.response,
                    web_search_source_urls=first.web_search_source_urls,
                    web_search_calls=first.web_search_calls,
                )
                return first
            except LexValidationError:
                pass
        force_search = _should_force_search_on_retry(first_error, first)
        second = llm.generate(
            system_prompt=system_prompt,
            runtime_envelope=runtime_envelope,
            force_web_search=force_search,
        )
        second = _normalize_model_response(second)
        second = _force_strip_em_dash(second)
        try:
            validate_lex_response(
                second.response,
                web_search_source_urls=second.web_search_source_urls,
                web_search_calls=second.web_search_calls,
            )
            return second
        except LexValidationError as second_error:
            raise ModelPipelineFailure(
                second_error.code, attempt_count=2
            ) from second_error


def _force_strip_em_dash(result: LlmGenerationResult) -> LlmGenerationResult:
    """Last-resort removal of U+2014 from body and contact notes."""
    response = result.response
    body = response.body_markdown.replace("\u2014", " - ")
    contacts = [
        contact.model_copy(
            update={"note": contact.note.replace("\u2014", " - ")}
        )
        for contact in response.contacts
    ]
    sources = [
        source.model_copy(
            update={
                "title": source.title.replace("\u2014", " - "),
                "publisher": source.publisher.replace("\u2014", " - "),
            }
        )
        for source in response.sources
    ]
    if (
        body == response.body_markdown
        and contacts == list(response.contacts)
        and sources == list(response.sources)
    ):
        return result
    return LlmGenerationResult(
        response=response.model_copy(
            update={
                "body_markdown": body,
                "contacts": contacts,
                "sources": sources,
            }
        ),
        openai_response_id=result.openai_response_id,
        web_search_source_urls=result.web_search_source_urls,
        web_search_calls=result.web_search_calls,
    )


def _normalize_model_response(result: LlmGenerationResult) -> LlmGenerationResult:
    """Deterministic fixes so common model slips pass blueprint validation."""
    response = result.response
    body = _normalize_dashes(response.body_markdown)
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
        allowed = normalize_source_url_set(result.web_search_source_urls)
        body, sources, contacts = _repair_search_evidence(
            body, sources, contacts, allowed
        )

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
    """Replace dash-like Unicode so validation never sees U+2014."""
    import unicodedata

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
                pieces.append(" - ")
            else:
                pieces.append("-")
        else:
            pieces.append(char)
    # Final hard strip of the forbidden code point.
    return "".join(pieces).replace("\u2014", " - ")


def _repair_search_evidence(
    body: str,
    sources: list[LexSource],
    contacts: list[LexContact],
    allowed: frozenset[str],
) -> tuple[str, list[LexSource], list[LexContact]]:
    """Drop/remap sources and contacts that cite URLs outside the search set."""
    kept_sources: list[LexSource] = []
    old_to_new: dict[int, int] = {}
    for source in sources:
        if normalize_source_url(source.url) not in allowed:
            continue
        new_id = len(kept_sources) + 1
        old_to_new[source.id] = new_id
        kept_sources.append(source.model_copy(update={"id": new_id}))

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
        website = contact.website
        if normalize_source_url(website) not in allowed:
            website = source_by_new[new_source_id].url
        if normalize_source_url(website) not in allowed:
            continue
        kept_contacts.append(
            contact.model_copy(
                update={
                    "id": len(kept_contacts) + 1,
                    "source_id": new_source_id,
                    "website": website,
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


__all__ = ["ModelPipelineFailure", "run_model_pipeline"]
