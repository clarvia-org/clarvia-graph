"""Unit tests for research degrade (dialogue ladder)."""

from __future__ import annotations

from app.llm.research_degrade import degrade_failed_research_brief
from app.llm.research_schema import (
    ResearchImmediateAction,
    ResearchJurisdiction,
    ResearchSource,
)
from app.llm.research_validation import validate_research_brief

from tests.unit.test_two_pass import _brief


def test_degrade_empty_answer_becomes_clarify() -> None:
    brief = _brief(sources=[], immediate_actions=[], contacts=[])
    degraded = degrade_failed_research_brief(
        brief,
        conversation_text=(
            "My mother is in hospice in Luxembourg with only a few days remaining."
        ),
        last_error="answer_without_source",
    )
    assert degraded is not None
    assert degraded.action == "clarify"
    assert degraded.missing_fields
    assert not degraded.sources
    assert not degraded.immediate_actions


def test_degrade_restores_answer_after_dropping_material_ungrounded_fact() -> None:
    conversation = (
        "My mother is in Haus Omega hospice in Luxembourg with only a few days "
        "remaining. What should we prepare after she dies?"
    )
    brief = _brief(
        user_facts=[
            "Mother lives in Haus Omega hospice in Luxembourg",
            "The family owns a vineyard in Chile",
        ]
    )
    degraded = degrade_failed_research_brief(
        brief,
        conversation_text=conversation,
        last_error="user_fact_not_grounded",
        web_search_source_urls=frozenset(
            {"https://guichet.public.lu", "https://fpf.lu"}
        ),
        web_search_calls=1,
    )
    assert degraded is not None
    assert degraded.action == "answer"
    assert "Chile" not in "\n".join(degraded.user_facts)
    assert any("Luxembourg" in fact for fact in degraded.user_facts)


def test_degrade_sets_explicit_clarify_action() -> None:
    brief = _brief(
        sources=[
            ResearchSource(
                id=1,
                title="Guide",
                publisher="X",
                url="https://invented.example/nope",
            )
        ],
        immediate_actions=[
            ResearchImmediateAction(
                id="A1",
                action="Do something",
                explanation="Ungrounded source only.",
                timing="now",
                handled_by=["family"],
                documents=[],
                source_ids=[1],
                contact_ids=[],
                required=True,
            )
        ],
        contacts=[],
    )
    degraded = degrade_failed_research_brief(
        brief,
        conversation_text=(
            "Father died yesterday after a car accident in Germany. What now?"
        ),
        last_error="unsupported_source_url",
        web_search_source_urls=frozenset({"https://guichet.public.lu"}),
        web_search_calls=1,
    )
    assert degraded is not None
    assert degraded.action == "clarify"
    assert "subdivision" in degraded.missing_fields or "death_country" in (
        degraded.missing_fields
    )


def test_sparse_first_turn_degrades_to_clarify_with_asks() -> None:
    """Weak input still yields a dialogue move, not silence."""
    brief = _brief(
        sources=[],
        contacts=[],
        immediate_actions=[],
        user_facts=[],
        jurisdictions=[],
    )
    degraded = degrade_failed_research_brief(
        brief,
        conversation_text="My father died. What do I do?",
        last_error="answer_without_source",
    )
    assert degraded is not None
    assert degraded.action == "clarify"
    assert degraded.missing_fields
    assert "death_country" in degraded.missing_fields


def test_second_turn_facts_allow_answer_path() -> None:
    """After clarify asks are answered, a grounded brief can answer."""
    conversation = (
        "My father died in Luxembourg yesterday. He lived in Luxembourg City. "
        "What should we do first?"
    )
    brief = _brief(
        situation_stage="recent_death",
        user_facts=[
            "Father died in Luxembourg yesterday",
            "He lived in Luxembourg City",
        ],
    )
    validate_research_brief(
        brief,
        web_search_source_urls=frozenset(
            {"https://guichet.public.lu", "https://fpf.lu"}
        ),
        web_search_calls=1,
        conversation_text=conversation,
    )
    assert brief.action == "answer"
    assert len(brief.immediate_actions) >= 3


def test_degrade_strips_already_known_missing_fields() -> None:
    """Conflicting missing_fields must not abort the last-resort clarify."""
    brief = _brief(
        missing_fields=["death_country", "care_country"],
        jurisdictions=[
            ResearchJurisdiction(
                country_code="LU",
                subdivision="Luxembourg",
                role="death_location",
            ),
            ResearchJurisdiction(
                country_code="LU",
                subdivision=None,
                role="care_location",
            ),
        ],
        sources=[],
        contacts=[],
        immediate_actions=[],
    )
    degraded = degrade_failed_research_brief(
        brief,
        conversation_text=(
            "मेरो आमा लक्जेम्बर्गको अस्पतालमा हुनुहुन्छ। उहाँको मृत्यु नजिक छ। "
            "अब परिवारले के गर्नुपर्छ?"
        ),
        last_error="missing_field_already_known",
    )
    assert degraded is not None
    assert degraded.action == "clarify"
    assert "death_country" not in degraded.missing_fields
    assert "care_country" not in degraded.missing_fields
    assert degraded.missing_fields
    validate_research_brief(
        degraded,
        conversation_text=(
            "मेरो आमा लक्जेम्बर्गको अस्पतालमा हुनुहुन्छ। उहाँको मृत्यु नजिक छ। "
            "अब परिवारले के गर्नुपर्छ?"
        ),
    )
