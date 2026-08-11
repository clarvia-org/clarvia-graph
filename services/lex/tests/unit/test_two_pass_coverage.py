"""Coverage-focused tests for two-pass pipeline, envelopes, and validators."""

from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
import tempfile

import pytest
from app.conversation import (
    CleanedConversation,
    build_research_envelope,
    build_writer_envelope,
    prepare_cleaned_conversation,
    select_relevant_writer_history,
)
from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.domain.ports import StructuredLlmResult
from app.infrastructure.openai import FakeLlmAdapter
from app.llm.clarify_decline import render_clarification_body
from app.llm.deterministic_renderer import render_research_brief_fallback
from app.llm.research_schema import ResearchImmediateAction
from app.llm.research_validation import ResearchValidationError, validate_research_brief
from app.llm.writer_schema import LexWrittenResponse
from app.llm.writer_validation import WriterValidationError, validate_written_response
from app.pipeline.two_pass import (
    TwoPassPipelineFailure,
    prepared_to_lex_response,
    run_two_pass_pipeline,
)
from tests.unit.conftest import build_settings
from tests.unit.test_two_pass import _brief

_URLS = frozenset(
    {
        "https://guichet.public.lu",
        "https://guichet.public.lu/en/citoyens/hospice",
        "https://fpf.lu",
        "https://fpf.lu/members/a",
        "https://fpf.lu/members/b",
    }
)

_LONG_WRITER_BODY = (
    "I'm sorry you're going through this with your mother at Haus Omega. "
    "Right now the most useful steps are practical and close to the care team. "
    "Ask the hospice staff what they arrange at the time of death, including how "
    "the treating doctor is involved and what paperwork they prepare.[1] "
    "Prepare identity documents for the death declaration so the commune can act "
    "quickly once the time comes.[1] "
    "Compare funeral directors using a recognised directory when you feel ready, "
    "rather than locking into one firm too early.[2] "
    "Keep notes of what the hospice already handles so the family does not repeat "
    "work. Tell close relatives who will speak with staff. "
    "If burial or cremation preferences are already known, write them down for the "
    "funeral director. Check whether a family booklet or equivalent civil-status "
    "document is available. Confirm who holds the health insurance card and any "
    "advance directives. "
    "Later topics such as pensions and banks can wait until the first formalities "
    "are underway. We can go through those when you are ready. "
    "For now, stay close to the hospice plan, keep documents together, and use "
    "two funeral options for orientation rather than a single commercial name. "
    "That keeps the next hours clearer for everyone involved. "
    "If anything about the medical situation changes, ask the staff again what "
    "they will do first. "
    "You do not need to resolve estate questions today. "
    "Focus on the care setting, the declaration path, and choosing how funeral "
    "support will be organised.[1][2]"
)

# Synthetic prompts so public CI never needs runtime-private/ live prompt files.
_SYNTHETIC_PROMPT_DIR = Path(tempfile.mkdtemp(prefix="lex-two-pass-"))
(_SYNTHETIC_PROMPT_DIR / "research.txt").write_text(
    "SYNTHETIC RESEARCH PROMPT\nLex.\n", encoding="utf-8"
)
(_SYNTHETIC_PROMPT_DIR / "writer.txt").write_text(
    "SYNTHETIC WRITER PROMPT\nLex.\n", encoding="utf-8"
)


def _parsed(
    *,
    message_id: str = "m-latest",
    body: str = (
        "My mother is in Haus Omega hospice in Luxembourg with only a few days "
        "of expected life remaining. What should the family prepare to do after "
        "she dies?"
    ),
    subject: str = "Hospice next steps",
) -> ParsedMessage:
    return ParsedMessage(
        message_id=message_id,
        thread_id="thread-1",
        from_address="tommi@clarvia.org",
        reply_to=None,
        to_addresses=("lex@clarvia.org",),
        cc_addresses=(),
        subject=subject,
        body_text=body,
        date_header="2026-07-25",
    )


def _settings():
    return build_settings(
        generation_pipeline="two_pass",
        research_prompt_path=str(_SYNTHETIC_PROMPT_DIR / "research.txt"),
        writer_prompt_path=str(_SYNTHETIC_PROMPT_DIR / "writer.txt"),
    )


def _structured(data: dict[str, object], *, response_id: str, search: bool = True):
    return StructuredLlmResult(
        data=data,
        openai_response_id=response_id,
        web_search_source_urls=_URLS if search else frozenset(),
        web_search_calls=1 if search else 0,
    )


def test_prepare_and_research_envelope_include_subject_body_and_history() -> None:
    settings = _settings()
    latest = _parsed()
    prior = ParsedMessage(
        message_id="m1",
        thread_id="thread-1",
        from_address="tommi@clarvia.org",
        reply_to=None,
        to_addresses=("lex@clarvia.org",),
        cc_addresses=(),
        subject="Hospice",
        body_text="Mother lives in Haus Omega hospice in Luxembourg.",
        date_header="2026-07-24",
    )
    cleaned = prepare_cleaned_conversation(
        parsed=latest,
        thread_messages=[prior, latest],
        settings=settings,
    )
    assert cleaned.conversation_message_count == 2
    envelope = build_research_envelope(
        cleaned=cleaned,
        parsed=latest,
        current_date_utc=datetime(2026, 7, 25, tzinfo=UTC),
        research_prompt_version="lex-research-v1",
        correction="Retry with web search.",
    )
    assert "<subject>" in envelope
    assert "Hospice next steps" in envelope
    assert "<body>" in envelope
    assert "research_prompt_version: lex-research-v1" in envelope
    assert 'role="USER"' in envelope
    assert "message_id=" in envelope
    assert "<CORRECTION>" in envelope
    relevant = select_relevant_writer_history(cleaned, max_chars=20_000)
    writer_env = build_writer_envelope(
        latest_user_message=cleaned.latest_user_message,
        relevant_history=relevant,
        brief=_brief(),
        correction="Tighten the draft.",
    )
    assert "<VERIFIED_RESEARCH_BRIEF>" in writer_env
    assert "<CORRECTION>" in writer_env


def test_two_pass_answer_path_uses_writer_and_headers() -> None:
    brief = _brief()
    written = LexWrittenResponse(
        response_version="lex_written_response_v1",
        body_markdown=_LONG_WRITER_BODY,
        used_action_ids=["A1", "A2", "A3"],
        used_source_ids=[1, 2],
        used_contact_ids=[1, 2, 3],
    )
    llm = FakeLlmAdapter(
        structured_responses=[
            _structured(brief.model_dump(mode="json"), response_id="r1"),
            _structured(
                written.model_dump(mode="json"), response_id="w1", search=False
            ),
        ]
    )
    prepared = run_two_pass_pipeline(
        llm,
        settings=_settings(),
        parsed=_parsed(),
        thread_messages=[_parsed()],
        current_date_utc=datetime(2026, 7, 25, tzinfo=UTC),
    )
    assert prepared.action == "answer"
    assert prepared.prompt_version == "lex-research-v1/lex-writer-v1"
    assert prepared.pipeline_version == "two-pass-v1"
    assert prepared.body_markdown.rstrip().endswith("Lex.")
    assert prepared.openai_response_id == "w1"
    assert prepared.used_fallback_renderer is False
    lex = prepared_to_lex_response(prepared)
    assert lex.action == "answer"
    assert lex.sources


def test_two_pass_clarify_and_decline_skip_writer() -> None:
    clarify = _brief(
        action="clarify",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        user_facts=[],
        missing_fields=["death_country"],
        later_topics=[],
    )
    decline = _brief(
        action="decline",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        user_facts=[],
        later_topics=[],
        off_topic_label="a divorce petition",
    )
    for payload, expected in ((clarify, "clarify"), (decline, "decline")):
        llm = FakeLlmAdapter(
            structured_responses=[
                _structured(payload.model_dump(mode="json"), response_id="r1")
            ]
        )
        prepared = run_two_pass_pipeline(
            llm,
            settings=_settings(),
            parsed=_parsed(body="Need help with paperwork after a death."),
            thread_messages=[],
            current_date_utc=datetime(2026, 7, 25, tzinfo=UTC),
        )
        assert prepared.action == expected
        assert prepared.body_markdown.rstrip().endswith("Lex.")


def test_two_pass_writer_fallback_after_validation_failures() -> None:
    brief = _brief()
    bad_writer = LexWrittenResponse(
        response_version="lex_written_response_v1",
        body_markdown="Below is a short, practical checklist.\n\nLex.",
        used_action_ids=["A1", "A2", "A3"],
        used_source_ids=[1],
        used_contact_ids=[1],
    )
    llm = FakeLlmAdapter(
        structured_responses=[
            _structured(brief.model_dump(mode="json"), response_id="r1"),
            _structured(
                bad_writer.model_dump(mode="json"), response_id="w1", search=False
            ),
            _structured(
                bad_writer.model_dump(mode="json"), response_id="w2", search=False
            ),
        ]
    )
    prepared = run_two_pass_pipeline(
        llm,
        settings=_settings(),
        parsed=_parsed(),
        thread_messages=[_parsed()],
        current_date_utc=datetime(2026, 7, 25, tzinfo=UTC),
    )
    assert prepared.used_fallback_renderer is True
    assert prepared.action == "answer"
    assert "Lex." in prepared.body_markdown


def test_two_pass_research_failure_raises_after_retry() -> None:
    bad = _brief(sources=[], immediate_actions=[])
    llm = FakeLlmAdapter(
        structured_responses=[
            _structured(bad.model_dump(mode="json"), response_id="r1"),
            _structured(bad.model_dump(mode="json"), response_id="r2"),
        ]
    )
    with pytest.raises(TwoPassPipelineFailure):
        run_two_pass_pipeline(
            llm,
            settings=_settings(),
            parsed=_parsed(),
            thread_messages=[_parsed()],
            current_date_utc=datetime(2026, 7, 25, tzinfo=UTC),
        )


def test_valid_long_writer_body_passes() -> None:
    validate_written_response(
        LexWrittenResponse(
            response_version="lex_written_response_v1",
            body_markdown=_LONG_WRITER_BODY,
            used_action_ids=["A1", "A2", "A3"],
            used_source_ids=[1, 2],
            used_contact_ids=[1, 2, 3],
        ),
        _brief(),
    )


def test_writer_rejects_url_continuation_signoff_and_short_body() -> None:
    brief = _brief()
    cases = [
        (
            "Ask hospice staff what they arrange.[1]\nhttps://example.com\n",
            "url_in_body",
        ),
        (
            "Ask hospice staff what they arrange.[1]\n\n"
            "We're happy to help with anything else.",
            "continuation_or_footer_in_body",
        ),
        (
            "Ask hospice staff what they arrange.[1]\n\nLex.",
            "writer_includes_signoff",
        ),
        (
            "Ask hospice staff.[1] Prepare documents.[1] Compare directors.[2]",
            "body_too_short",
        ),
    ]
    for body, code in cases:
        with pytest.raises(WriterValidationError) as exc:
            validate_written_response(
                LexWrittenResponse(
                    response_version="lex_written_response_v1",
                    body_markdown=body,
                    used_action_ids=["A1", "A2", "A3"],
                    used_source_ids=[1, 2],
                    used_contact_ids=[1],
                ),
                brief,
            )
        assert exc.value.code == code


def test_writer_rejects_phone_robotic_heading_and_too_many_headings() -> None:
    brief = _brief()
    with pytest.raises(WriterValidationError) as exc:
        validate_written_response(
            LexWrittenResponse(
                response_version="lex_written_response_v1",
                body_markdown=_LONG_WRITER_BODY + " Call +352 621 00 00 00 now.",
                used_action_ids=["A1", "A2", "A3"],
                used_source_ids=[1, 2],
                used_contact_ids=[1, 2, 3],
            ),
            brief,
        )
    assert exc.value.code == "unsupported_phone_or_email"

    with pytest.raises(WriterValidationError) as exc2:
        validate_written_response(
            LexWrittenResponse(
                response_version="lex_written_response_v1",
                body_markdown=(
                    "Action plan\n\n"
                    + _LONG_WRITER_BODY
                ),
                used_action_ids=["A1", "A2", "A3"],
                used_source_ids=[1, 2],
                used_contact_ids=[1, 2, 3],
            ),
            brief,
        )
    assert exc2.value.code == "robotic_heading"

    with pytest.raises(WriterValidationError) as exc3:
        validate_written_response(
            LexWrittenResponse(
                response_version="lex_written_response_v1",
                body_markdown=(
                    "## One\n\n## Two\n\n## Three\n\n" + _LONG_WRITER_BODY
                ),
                used_action_ids=["A1", "A2", "A3"],
                used_source_ids=[1, 2],
                used_contact_ids=[1, 2, 3],
            ),
            brief,
        )
    assert exc3.value.code == "too_many_headings"


def test_research_rejects_ungrounded_facts_and_deferred_topics() -> None:
    conversation = (
        "My mother is in Haus Omega hospice in Luxembourg with only a few days "
        "remaining. What should we prepare after she dies?"
    )
    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            _brief(user_facts=["The family owns a vineyard in Chile"]),
            web_search_source_urls=_URLS,
            web_search_calls=1,
            conversation_text=conversation,
        )
    assert exc.value.code == "user_fact_not_grounded"

    deferred = _brief(
        immediate_actions=[
            ResearchImmediateAction(
                id="A1",
                action="Ask hospice staff what they arrange",
                explanation="Staff coordinate the doctor.",
                timing="now",
                handled_by=["staff"],
                documents=[],
                source_ids=[1],
                contact_ids=[1],
                required=True,
            ),
            ResearchImmediateAction(
                id="A2",
                action="Prepare identity documents",
                explanation="Needed for the commune.",
                timing="before_death",
                handled_by=["family"],
                documents=["ID"],
                source_ids=[1],
                contact_ids=[],
                required=True,
            ),
            ResearchImmediateAction(
                id="A3",
                action="Start the pension claim immediately",
                explanation="Survivor pension paperwork.",
                timing="next_few_days",
                handled_by=["family"],
                documents=[],
                source_ids=[1],
                contact_ids=[],
                required=True,
            ),
        ]
    )
    with pytest.raises(ResearchValidationError) as exc2:
        validate_research_brief(
            deferred,
            web_search_source_urls=_URLS,
            web_search_calls=1,
            conversation_text=conversation,
        )
    assert exc2.value.code == "deferred_topic_in_immediate_actions"


def test_research_focused_follow_up_and_missing_field_conflicts() -> None:
    brief = _brief(
        situation_stage="focused_follow_up",
        current_question="How do survivor pensions work in Luxembourg?",
        immediate_actions=[
            ResearchImmediateAction(
                id="A1",
                action="Check survivor pension eligibility",
                explanation="CNAP handles survivor pensions in Luxembourg.",
                timing="next_few_days",
                handled_by=["family"],
                documents=[],
                source_ids=[1],
                contact_ids=[],
                required=True,
            )
        ],
        later_topics=[],
    )
    validate_research_brief(
        brief,
        web_search_source_urls=_URLS,
        web_search_calls=1,
        conversation_text=(
            "Mother lived in Luxembourg. How do survivor pensions work in Luxembourg?"
        ),
    )

    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            _brief(missing_fields=["death_country"]),
            web_search_source_urls=_URLS,
            web_search_calls=1,
            conversation_text="Death was in Luxembourg at the hospice.",
        )
    assert exc.value.code == "missing_field_already_known"


def test_clarify_template_fallback_and_deterministic_renderer_branches() -> None:
    clarify = _brief(
        action="clarify",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        missing_fields=["care_country", "subdivision", "asset_country"],
        later_topics=[],
    )
    body = render_clarification_body(clarify)
    assert "care" in body.casefold() or "details" in body.casefold()

    single = _brief(
        action="clarify",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        missing_fields=["care_country"],
        later_topics=[],
    )
    assert "care" in render_clarification_body(single).casefold()

    follow = _brief(
        situation_stage="focused_follow_up",
        current_question="What about pensions?",
        completed_actions=["Notified the commune"],
        immediate_actions=[
            ResearchImmediateAction(
                id="A1",
                action="Ask about survivor pension",
                explanation="Check eligibility.",
                timing="next_few_days",
                handled_by=[],
                documents=[],
                source_ids=[],
                contact_ids=[],
                required=True,
            )
        ],
        later_topics=[],
    )
    rendered = render_research_brief_fallback(follow)
    assert "Regarding:" in rendered
    assert "already mentioned" in rendered.casefold()


def test_select_relevant_writer_history_skips_truncation_marker() -> None:
    cleaned = CleanedConversation(
        latest_user_message="Follow-up",
        prior_messages=[
            ConversationMessage(
                role=ConversationRole.USER,
                text="[Earlier thread messages omitted due to length.]",
            ),
            ConversationMessage(
                role=ConversationRole.USER,
                text="Mother lived in Luxembourg.",
                message_id="m1",
                date="2026-07-20",
            ),
        ],
        conversation_message_count=3,
        conversation_truncated=True,
        conversation_text="Follow-up",
    )
    selected = select_relevant_writer_history(cleaned, max_messages=2)
    assert len(selected) == 1
    assert "Luxembourg" in selected[0].text


def test_writer_later_topics_allowed_in_brief_ask() -> None:
    brief = _brief(
        later_topics=[
            "pension claims",
            "bank notifications",
            "estate declaration",
            "utility cancellations",
        ]
    )
    with_ask = (
        _LONG_WRITER_BODY
        + " Once those are underway, I can also help with pension claims, "
        + "bank notifications, and estate declaration - reply with the pension "
        + "scheme name and country if you want that next."
    )
    validate_written_response(
        LexWrittenResponse(
            response_version="lex_written_response_v1",
            body_markdown=with_ask,
            used_action_ids=["A1", "A2", "A3"],
            used_source_ids=[1, 2],
            used_contact_ids=[1, 2, 3],
        ),
        brief,
    )

    follow = _brief(
        situation_stage="focused_follow_up",
        current_question="How do survivor pensions work?",
        immediate_actions=[
            ResearchImmediateAction(
                id="A1",
                action="Check survivor pension eligibility",
                explanation="Ask CNAP about survivor pensions.",
                timing="next_few_days",
                handled_by=["family"],
                documents=[],
                source_ids=[1],
                contact_ids=[],
                required=True,
            )
        ],
        later_topics=[],
    )
    with pytest.raises(WriterValidationError) as exc2:
        validate_written_response(
            LexWrittenResponse(
                response_version="lex_written_response_v1",
                body_markdown=(
                    "For pensions, first get the death certificate from the commune "
                    "and arrange burial with a funeral director."
                ),
                used_action_ids=["A1"],
                used_source_ids=[1],
                used_contact_ids=[],
            ),
            follow,
        )
    assert exc2.value.code == "focused_follow_up_dump"


def test_config_aliases_and_prompt_resolvers() -> None:
    settings = build_settings(
        lex_aliases="info@clarvia.org, Support@Clarvia.org",
        generation_pipeline="two_pass",
    )
    assert "info@clarvia.org" in settings.resolved_lex_aliases
    assert settings.resolved_research_prompt_path.is_absolute()
    assert settings.resolved_writer_prompt_path.is_absolute()


def test_eval_report_helpers(tmp_path) -> None:
    from app.ops.eval_report import (
        default_report_dir,
        load_report_json,
        render_markdown_report,
        write_report,
    )
    from app.ops.pilot_harness import PilotRunResult, PilotSuiteResult

    assert "runtime-private" in str(default_report_dir(private=True))
    assert "tests" in str(default_report_dir(private=False))

    suite = PilotSuiteResult(
        results=[
            PilotRunResult(
                case_id="c1",
                category="english",
                expected_status="sent",
                actual_status="failed",
                send_count=0,
                llm_call_count=0,
                footer_ok=True,
                continuation_ok=True,
                duplicate_send=False,
            )
        ]
    )
    json_path, md_path = write_report(suite, tmp_path, basename="cov")
    assert json_path.exists() and md_path.exists()
    payload = load_report_json(json_path)
    assert payload["failed"] == 1
    md = render_markdown_report(payload)
    assert "Failed cases" in md


def test_relevance_truncation_keeps_material_facts() -> None:
    from app.email.parsing import build_conversation_thread

    messages = [
        (ConversationRole.USER, "First message about mother in Luxembourg hospice. " * 20),
        (ConversationRole.ASSISTANT, "Thanks, I will look into that. " * 20),
        (ConversationRole.USER, "Weather is nice today. " * 20),
        (ConversationRole.USER, "She already obtained the family booklet. " * 5),
        (ConversationRole.USER, "Latest question about the commune declaration."),
    ]
    thread = build_conversation_thread(messages, max_thread_chars=350)
    text = "\n".join(item.text for item in thread)
    assert "omitted" in text
    assert "family booklet" in text or "Luxembourg" in text or "Latest question" in text


def test_fake_llm_structured_exhaustion_and_error() -> None:
    llm = FakeLlmAdapter(structured_responses=[])
    with pytest.raises(RuntimeError):
        llm.generate_structured(
            system_prompt="s",
            runtime_envelope="e",
            json_schema={},
            schema_name="x",
            enable_web_search=False,
        )
    llm_err = FakeLlmAdapter(default_error=RuntimeError("boom"))
    with pytest.raises(RuntimeError):
        llm_err.generate_structured(
            system_prompt="s",
            runtime_envelope="e",
            json_schema={},
            schema_name="x",
            enable_web_search=False,
        )


def test_research_clarify_decline_validation_branches() -> None:
    validate_research_brief(
        _brief(
            action="clarify",
            research_status="not_needed",
            immediate_actions=[],
            sources=[],
            contacts=[],
            user_facts=[],
            missing_fields=["death_or_planning_status"],
            later_topics=[],
        )
    )
    validate_research_brief(
        _brief(
            action="decline",
            research_status="not_needed",
            immediate_actions=[],
            sources=[],
            contacts=[],
            user_facts=[],
            later_topics=[],
            off_topic_label="tax advice",
        )
    )
    with pytest.raises(ResearchValidationError):
        validate_research_brief(
            _brief(
                action="clarify",
                research_status="not_needed",
                immediate_actions=[],
                sources=[],
                contacts=[],
                user_facts=[],
                missing_fields=[],
                later_topics=[],
            )
        )
    # Decline auto-sanitizes: actions, sources, contacts are stripped
    decline_brief = _brief(
        action="decline",
        research_status="not_needed",
        user_facts=[],
        later_topics=[],
        off_topic_label="tax advice",
    )
    validate_research_brief(decline_brief)
    assert decline_brief.immediate_actions == []
    assert decline_brief.sources == []
    assert decline_brief.contacts == []
