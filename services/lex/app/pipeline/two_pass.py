"""Two-pass Lex generation: research (with search) then writer (no search)."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime

from app.conversation import (
    build_research_envelope,
    build_writer_envelope,
    prepare_cleaned_conversation,
    select_relevant_writer_history,
)
from app.domain.models import ParsedMessage
from app.domain.ports import LlmPort
from app.llm.clarify_decline import render_clarification_body, render_decline_body
from app.llm.deterministic_renderer import render_research_brief_fallback
from app.llm.prompt_loader import load_prompt
from app.llm.research_degrade import degrade_failed_research_brief
from app.llm.research_schema import (
    LEX_RESEARCH_BRIEF_JSON_SCHEMA,
    RESEARCH_SCHEMA_VERSION,
    LexResearchBrief,
)
from app.llm.research_validation import ResearchValidationError, validate_research_brief
from app.llm.schema import LexContact, LexResponse, LexSource
from app.llm.writer_schema import (
    LEX_WRITTEN_RESPONSE_JSON_SCHEMA,
    WRITER_SCHEMA_VERSION,
    LexWrittenResponse,
)
from app.llm.writer_validation import WriterValidationError, validate_written_response
from app.services.model_pipeline import _normalize_dashes

_SIGN_OFF_RE = re.compile(r"(?:\n|^)Lex\.\s*$")
PIPELINE_VERSION = "two-pass-v1"


@dataclass(frozen=True, slots=True)
class TwoPassPipelineFailure(Exception):
    code: str
    attempt_count: int = 1

    def __str__(self) -> str:
        return self.code


@dataclass(frozen=True, slots=True)
class PreparedLexResponse:
    """Outbound-ready model payload after two-pass (or template) generation."""

    body_markdown: str
    language: str
    action: str
    sources: tuple[LexSource, ...]
    contacts: tuple[LexContact, ...]
    openai_response_id: str | None
    schema_version: str
    prompt_version: str
    pipeline_version: str = PIPELINE_VERSION
    used_fallback_renderer: bool = False


def ensure_lex_signoff(body: str) -> str:
    """Strip accidental model sign-off and append exactly one ``Lex.``."""
    stripped = _normalize_dashes(body).rstrip()
    stripped = _SIGN_OFF_RE.sub("", stripped).rstrip()
    return f"{stripped}\n\nLex."


def _settings_value(settings: object, name: str, default: object) -> object:
    return getattr(settings, name, default)


def _to_lex_sources(brief: LexResearchBrief) -> tuple[LexSource, ...]:
    return tuple(
        LexSource(
            id=source.id,
            title=source.title,
            publisher=source.publisher,
            url=source.url,
        )
        for source in brief.sources
    )


def _to_lex_contacts(brief: LexResearchBrief) -> tuple[LexContact, ...]:
    return tuple(
        LexContact(
            id=contact.id,
            name=contact.name,
            kind=contact.kind,
            country_code=contact.country_code,
            website=contact.website,
            phone=contact.phone,
            email=contact.email,
            commercial=contact.commercial,
            note=contact.note,
            source_id=contact.source_id,
        )
        for contact in brief.contacts
    )


def _filter_used_sources(
    brief: LexResearchBrief, written: LexWrittenResponse
) -> tuple[LexSource, ...]:
    used = set(written.used_source_ids)
    for marker in re.findall(r"\[(\d+)\]", written.body_markdown):
        used.add(int(marker))
    for contact_id in written.used_contact_ids:
        for contact in brief.contacts:
            if contact.id == contact_id:
                used.add(contact.source_id)
    selected = [source for source in brief.sources if source.id in used] or list(
        brief.sources
    )
    return tuple(
        LexSource(
            id=source.id,
            title=source.title,
            publisher=source.publisher,
            url=source.url,
        )
        for source in selected
    )


def run_two_pass_pipeline(
    llm: LlmPort,
    *,
    settings: object,
    parsed: ParsedMessage,
    thread_messages: list[ParsedMessage],
    current_date_utc: datetime,
) -> PreparedLexResponse:
    """Research → validate → (clarify/decline template | writer) → compose body."""
    research_prompt_version = str(
        _settings_value(settings, "research_prompt_version", "lex-research-v1")
    )
    writer_prompt_version = str(
        _settings_value(settings, "writer_prompt_version", "lex-writer-v1")
    )
    combined_prompt = f"{research_prompt_version}/{writer_prompt_version}"
    research_schema = str(
        _settings_value(settings, "research_schema_version", RESEARCH_SCHEMA_VERSION)
    )
    writer_schema = str(
        _settings_value(settings, "writer_schema_version", WRITER_SCHEMA_VERSION)
    )
    pipeline_version = str(
        _settings_value(settings, "pipeline_version", PIPELINE_VERSION)
    )

    cleaned = prepare_cleaned_conversation(
        parsed=parsed,
        thread_messages=thread_messages,
        settings=settings,
    )
    research_prompt = load_prompt(settings.resolved_research_prompt_path)  # type: ignore[attr-defined]

    brief, research_response_id = _run_research_with_retry(
        llm,
        settings=settings,
        system_prompt=research_prompt,
        cleaned=cleaned,
        parsed=parsed,
        current_date_utc=current_date_utc,
        research_prompt_version=research_prompt_version,
    )

    if brief.action == "clarify":
        body = ensure_lex_signoff(render_clarification_body(brief))
        return PreparedLexResponse(
            body_markdown=body,
            language=brief.language,
            action="clarify",
            sources=(),
            contacts=(),
            openai_response_id=research_response_id,
            schema_version=research_schema,
            prompt_version=combined_prompt,
            pipeline_version=pipeline_version,
        )

    if brief.action == "decline":
        body = ensure_lex_signoff(render_decline_body(brief))
        return PreparedLexResponse(
            body_markdown=body,
            language=brief.language,
            action="decline",
            sources=(),
            contacts=(),
            openai_response_id=research_response_id,
            schema_version=research_schema,
            prompt_version=combined_prompt,
            pipeline_version=pipeline_version,
        )

    writer_prompt = load_prompt(settings.resolved_writer_prompt_path)  # type: ignore[attr-defined]
    max_writer_chars = int(_settings_value(settings, "max_writer_history_chars", 20_000))
    relevant = select_relevant_writer_history(cleaned, max_chars=max_writer_chars)
    written, used_fallback, writer_response_id = _run_writer_with_retry(
        llm,
        settings=settings,
        system_prompt=writer_prompt,
        latest_user_message=cleaned.latest_user_message,
        conversation_text=cleaned.conversation_text,
        relevant_history=relevant,
        brief=brief,
    )

    body = ensure_lex_signoff(written.body_markdown)
    if used_fallback:
        sources = _to_lex_sources(brief)
        contacts = _to_lex_contacts(brief)
    else:
        sources = _filter_used_sources(brief, written)
        if written.used_contact_ids:
            wanted = set(written.used_contact_ids)
            contacts = tuple(
                contact
                for contact in _to_lex_contacts(brief)
                if contact.id in wanted
            )
        else:
            contacts = _to_lex_contacts(brief)

    return PreparedLexResponse(
        body_markdown=body,
        language=brief.language,
        action="answer",
        sources=sources,
        contacts=contacts,
        openai_response_id=writer_response_id or research_response_id,
        schema_version=f"{research_schema}/{writer_schema}",
        prompt_version=combined_prompt,
        pipeline_version=pipeline_version,
        used_fallback_renderer=used_fallback,
    )


def _run_research_with_retry(
    llm: LlmPort,
    *,
    settings: object,
    system_prompt: str,
    cleaned: object,
    parsed: ParsedMessage,
    current_date_utc: datetime,
    research_prompt_version: str,
) -> tuple[LexResearchBrief, str | None]:
    last_error = "research_failed"
    force_search = False
    correction: str | None = None
    max_tokens = int(_settings_value(settings, "research_max_output_tokens", 3200))
    last_brief: LexResearchBrief | None = None
    last_response_id: str | None = None
    last_search_urls: frozenset[str] | None = None
    last_search_calls: int | None = None
    conversation_text = cleaned.conversation_text  # type: ignore[attr-defined]
    for _attempt in range(2):
        envelope = build_research_envelope(
            cleaned=cleaned,  # type: ignore[arg-type]
            parsed=parsed,
            current_date_utc=current_date_utc,
            research_prompt_version=research_prompt_version,
            correction=correction,
        )
        try:
            result = llm.generate_structured(
                system_prompt=system_prompt,
                runtime_envelope=envelope,
                json_schema=LEX_RESEARCH_BRIEF_JSON_SCHEMA,  # type: ignore[arg-type]
                schema_name="lex_research_brief_v1",
                enable_web_search=True,
                force_web_search=force_search,
                reasoning_effort="medium",
                max_output_tokens=max_tokens,
            )
            brief = LexResearchBrief.model_validate(result.data)
            last_brief = brief
            last_response_id = result.openai_response_id
            last_search_urls = result.web_search_source_urls
            last_search_calls = result.web_search_calls
            validate_research_brief(
                brief,
                web_search_source_urls=result.web_search_source_urls,
                web_search_calls=result.web_search_calls,
                conversation_text=conversation_text,
            )
            return brief, result.openai_response_id
        except ResearchValidationError as exc:
            last_error = exc.code
            correction = exc.safe_retry_instruction
            force_search = exc.code in {
                "answer_without_search",
                "unsupported_source_url",
                "unsupported_contact_website",
            }
        except Exception as exc:  # noqa: BLE001
            last_error = getattr(exc, "code", type(exc).__name__)
            correction = (
                "The previous research brief failed. Correct it using only the "
                "cleaned conversation and verified web-search sources."
            )

    if last_brief is not None:
        degraded = degrade_failed_research_brief(
            last_brief,
            conversation_text=conversation_text,
            last_error=last_error,
            web_search_source_urls=last_search_urls,
            web_search_calls=last_search_calls,
        )
        if degraded is not None:
            return degraded, last_response_id

    raise TwoPassPipelineFailure(str(last_error), attempt_count=2)


def _run_writer_with_retry(
    llm: LlmPort,
    *,
    settings: object,
    system_prompt: str,
    latest_user_message: str,
    conversation_text: str,
    relevant_history: list,
    brief: LexResearchBrief,
) -> tuple[LexWrittenResponse, bool, str | None]:
    correction: str | None = None
    last_error = "writer_failed"
    max_tokens = int(_settings_value(settings, "writer_max_output_tokens", 1800))
    for _attempt in range(2):
        envelope = build_writer_envelope(
            latest_user_message=latest_user_message,
            relevant_history=relevant_history,
            brief=brief,
            correction=correction,
        )
        try:
            result = llm.generate_structured(
                system_prompt=system_prompt,
                runtime_envelope=envelope,
                json_schema=LEX_WRITTEN_RESPONSE_JSON_SCHEMA,  # type: ignore[arg-type]
                schema_name="lex_written_response_v1",
                enable_web_search=False,
                force_web_search=False,
                reasoning_effort="low",
                max_output_tokens=max_tokens,
            )
            written = LexWrittenResponse.model_validate(result.data)
            validate_written_response(
                written,
                brief,
                latest_user_message=latest_user_message,
                conversation_text=conversation_text,
            )
            return written, False, result.openai_response_id
        except WriterValidationError as exc:
            last_error = exc.code
            correction = exc.safe_retry_instruction
        except Exception as exc:  # noqa: BLE001
            last_error = getattr(exc, "code", type(exc).__name__)
            correction = (
                "The previous draft failed. Rewrite using only the verified "
                "research brief."
            )
    fallback_body = render_research_brief_fallback(brief)
    written = LexWrittenResponse(
        response_version="lex_written_response_v1",
        body_markdown=fallback_body,
        used_action_ids=[action.id for action in brief.immediate_actions],
        used_source_ids=[source.id for source in brief.sources],
        used_contact_ids=[contact.id for contact in brief.contacts],
    )
    _ = last_error
    return written, True, None


def prepared_to_lex_response(prepared: PreparedLexResponse) -> LexResponse:
    """Adapt PreparedLexResponse into legacy LexResponse for source rendering."""
    return LexResponse(
        response_version="lex_response_v1",
        action=prepared.action,  # type: ignore[arg-type]
        language=prepared.language,
        jurisdictions=[],
        body_markdown=prepared.body_markdown,
        contacts=list(prepared.contacts),
        sources=list(prepared.sources),
        research_status=(
            "adequate" if prepared.action == "answer" else "not_needed"
        ),
    )


__all__ = [
    "PIPELINE_VERSION",
    "PreparedLexResponse",
    "TwoPassPipelineFailure",
    "ensure_lex_signoff",
    "run_two_pass_pipeline",
    "prepared_to_lex_response",
]
