"""Regression tests for two-pass research/writer validation."""

from __future__ import annotations

import pytest
from app.domain.ports import StructuredLlmResult
from app.infrastructure.openai import FakeLlmAdapter
from app.llm.clarify_decline import render_clarification_body, render_decline_body
from app.llm.deterministic_renderer import render_research_brief_fallback
from app.llm.research_schema import (
    LexResearchBrief,
    ResearchContact,
    ResearchImmediateAction,
    ResearchJurisdiction,
    ResearchSource,
)
from app.llm.research_validation import ResearchValidationError, validate_research_brief
from app.llm.scenario_validation import validate_no_unsupported_scenarios
from app.llm.writer_schema import LexWrittenResponse
from app.llm.writer_validation import WriterValidationError, validate_written_response
from app.pipeline.two_pass import ensure_lex_signoff


def _brief(**overrides: object) -> LexResearchBrief:
    base = {
        "response_version": "lex_research_brief_v1",
        "action": "answer",
        "language": "en",
        "situation_stage": "imminent_death",
        "safety_status": "ordinary",
        "jurisdictions": [
            ResearchJurisdiction(
                country_code="LU", subdivision="Luxembourg", role="care_location"
            )
        ],
        "user_facts": [
            "Mother lives in Haus Omega hospice in Luxembourg",
            "Only a few days of expected life remaining",
        ],
        "completed_actions": [],
        "current_question": "What should the family prepare to do after she dies?",
        "missing_fields": [],
        "off_topic_label": None,
        "immediate_actions": [
            ResearchImmediateAction(
                id="A1",
                action="Ask hospice staff what they arrange at the time of death",
                explanation="Hospice teams usually involve the treating doctor.",
                timing="now",
                handled_by=["Haus Omega staff", "treating doctor"],
                documents=[],
                source_ids=[1],
                contact_ids=[1],
                required=True,
            ),
            ResearchImmediateAction(
                id="A2",
                action="Prepare identity documents for the death declaration",
                explanation="The commune will need ID documents soon after death.",
                timing="before_death",
                handled_by=["family"],
                documents=["ID cards", "family booklet if available"],
                source_ids=[1],
                contact_ids=[],
                required=True,
            ),
            ResearchImmediateAction(
                id="A3",
                action="Compare funeral directors or use a recognised directory",
                explanation="A funeral director can handle many formalities.",
                timing="next_few_days",
                handled_by=["family", "funeral director"],
                documents=[],
                source_ids=[2],
                contact_ids=[2, 3],
                required=True,
            ),
        ],
        "later_topics": ["pension claims", "bank notifications", "estate declaration"],
        "contacts": [
            ResearchContact(
                id=1,
                name="Haus Omega / Omega 90",
                kind="support_service",
                country_code="LU",
                website="https://www.vdl.lu",
                phone=None,
                email=None,
                commercial=False,
                note="Hospice and bereavement support",
                source_id=1,
            ),
            ResearchContact(
                id=2,
                name="Funeral directory example A",
                kind="funeral_provider",
                country_code="LU",
                website="https://example-a.lu",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=2,
            ),
            ResearchContact(
                id=3,
                name="Funeral directory example B",
                kind="funeral_provider",
                country_code="LU",
                website="https://example-b.lu",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=2,
            ),
        ],
        "sources": [
            ResearchSource(
                id=1,
                title="Declaring a death",
                publisher="Guichet.lu",
                url="https://guichet.public.lu",
            ),
            ResearchSource(
                id=2,
                title="Funeral federation members",
                publisher="FPF",
                url="https://fpf.lu",
            ),
        ],
        "research_status": "adequate",
    }
    base.update(overrides)
    return LexResearchBrief.model_validate(base)


def test_hospice_brief_rejects_police_action() -> None:
    brief = _brief(
        immediate_actions=[
            ResearchImmediateAction(
                id="A1",
                action="Call the police if the death seems suspicious",
                explanation="Police handle unexpected deaths.",
                timing="now",
                handled_by=["police"],
                documents=[],
                source_ids=[1],
                contact_ids=[],
                required=True,
            ),
            ResearchImmediateAction(
                id="A2",
                action="Prepare documents",
                explanation="Gather IDs.",
                timing="before_death",
                handled_by=["family"],
                documents=["ID"],
                source_ids=[1],
                contact_ids=[],
                required=True,
            ),
            ResearchImmediateAction(
                id="A3",
                action="Contact funeral directors",
                explanation="Compare providers.",
                timing="next_few_days",
                handled_by=["family"],
                documents=[],
                source_ids=[2],
                contact_ids=[2, 3],
                required=True,
            ),
        ]
    )
    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            brief,
            web_search_source_urls=frozenset(
                {"https://guichet.public.lu", "https://fpf.lu", "https://www.vdl.lu", "https://example-a.lu", "https://example-b.lu"}
            ),
            web_search_calls=1,
            conversation_text="mother in haus omega hospice",
        )
    assert exc.value.code == "unsupported_exceptional_scenario"



def test_writer_rejects_sources_section_and_formulaic_opening() -> None:
    brief = _brief()
    written = LexWrittenResponse(
        response_version="lex_written_response_v1",
        body_markdown=(
            "Below is a short, practical checklist of next steps.\n\n"
            "Ask the hospice team what they arrange.[1]\n\n"
            "Sources checked:\n"
            "[1] Guichet\n"
        ),
        used_action_ids=["A1", "A2", "A3"],
        used_source_ids=[1, 2],
        used_contact_ids=[1, 2, 3],
    )
    with pytest.raises(WriterValidationError) as exc:
        validate_written_response(written, brief)
    assert exc.value.code in {
        "formulaic_opening",
        "duplicate_source_or_contact_section",
    }


def test_writer_rejects_invented_police_scenario() -> None:
    brief = _brief()
    written = LexWrittenResponse(
        response_version="lex_written_response_v1",
        body_markdown=(
            "After the death, call the police if anything seems suspicious.[1]\n"
            "Also prepare the identity documents.[1]\n"
            "Compare funeral directors.[2]\n"
        ),
        used_action_ids=["A1", "A2", "A3"],
        used_source_ids=[1, 2],
        used_contact_ids=[1],
    )
    with pytest.raises(WriterValidationError) as exc:
        validate_written_response(written, brief)
    assert exc.value.code == "unsupported_exceptional_scenario"


def test_clarify_and_decline_templates() -> None:
    clarify = _brief(
        action="clarify",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        missing_fields=["death_country", "residence_country"],
        later_topics=[],
    )
    body = render_clarification_body(clarify)
    assert "Which country" in body
    decline = _brief(
        action="decline",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        later_topics=[],
        off_topic_label="a divorce petition",
    )
    assert "divorce" in render_decline_body(decline).casefold()


def test_deterministic_fallback_and_signoff() -> None:
    brief = _brief()
    body = render_research_brief_fallback(brief)
    assert "Haus Omega" in body or "hospice" in body.casefold() or "Ask hospice" in body
    assert "pension" in body.casefold()
    signed = ensure_lex_signoff(body + "\n\nLex.")
    assert signed.count("Lex.") == 1


def test_genuine_immediate_risk_allowed() -> None:
    assert (
        validate_no_unsupported_scenarios(
            text="Call emergency services now.",
            safety_status="immediate_risk",
            user_facts=["Active self-harm risk right now"],
        )
        is None
    )


def test_fake_structured_adapter_supports_two_schemas() -> None:
    brief = _brief()
    written = LexWrittenResponse(
        response_version="lex_written_response_v1",
        body_markdown=(
            "I'm sorry you're going through this. Ask the hospice team what they "
            "will arrange when the time comes.[1] Prepare identity documents for "
            "the commune declaration.[1] Compare two funeral directors when you "
            "are ready.[2]"
        ),
        used_action_ids=["A1", "A2", "A3"],
        used_source_ids=[1, 2],
        used_contact_ids=[1, 2, 3],
    )
    llm = FakeLlmAdapter(
        structured_responses=[
            StructuredLlmResult(
                data=brief.model_dump(mode="json"),
                openai_response_id="r1",
                web_search_source_urls=frozenset(
                    {
                        "https://guichet.public.lu",
                        "https://fpf.lu",
                        "https://www.vdl.lu",
                        "https://example-a.lu",
                        "https://example-b.lu",
                    }
                ),
                web_search_calls=1,
            ),
            StructuredLlmResult(
                data=written.model_dump(mode="json"),
                openai_response_id="w1",
                web_search_source_urls=frozenset(),
                web_search_calls=0,
            ),
        ]
    )
    first = llm.generate_structured(
        system_prompt="r",
        runtime_envelope="e",
        json_schema={},
        schema_name="lex_research_brief_v1",
        enable_web_search=True,
    )
    second = llm.generate_structured(
        system_prompt="w",
        runtime_envelope="e",
        json_schema={},
        schema_name="lex_written_response_v1",
        enable_web_search=False,
    )
    assert first.data["action"] == "answer"
    assert "hospice" in str(second.data["body_markdown"]).casefold()
