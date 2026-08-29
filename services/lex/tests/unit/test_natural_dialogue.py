"""Partial answers, single-topic briefs, and Writer-composed clarify turns."""

from __future__ import annotations

import pytest
from app.llm.research_degrade import degrade_failed_research_brief
from app.llm.research_schema import ResearchImmediateAction, ResearchJurisdiction
from app.llm.research_validation import (
    ResearchValidationError,
    requires_full_immediate_checklist,
    validate_research_brief,
)
from app.llm.writer_schema import LexWrittenResponse
from app.llm.writer_validation import validate_written_response
from tests.unit.test_two_pass import _brief

_URLS = frozenset(
    {
        "https://guichet.public.lu",
        "https://fpf.lu",
    }
)

_ASHES_ACTION = ResearchImmediateAction(
    id="A1",
    action="Check official rules on scattering ashes at sea in Ukraine",
    explanation="Ukrainian law and local permits govern scattering at sea.",
    timing="next_few_days",
    handled_by=["family"],
    documents=[],
    source_ids=[1],
    contact_ids=[],
    required=True,
)


def test_exploratory_single_action_answer_passes() -> None:
    brief = _brief(
        situation_stage="later_administration",
        current_question="Can ashes be scattered at sea in Ukraine?",
        jurisdictions=[
            ResearchJurisdiction(
                country_code="UA", subdivision=None, role="burial_or_cremation_location"
            )
        ],
        user_facts=["The family wants to scatter ashes at sea in Ukraine"],
        immediate_actions=[_ASHES_ACTION],
        contacts=[],
        later_topics=["vessel or shoreline permit if required"],
        missing_fields=[],
    )
    validate_research_brief(
        brief,
        web_search_source_urls=_URLS,
        web_search_calls=1,
        conversation_text="Can ashes be scattered at sea in Ukraine?",
    )
    assert not requires_full_immediate_checklist(brief)


def test_general_imminent_two_actions_still_fails() -> None:
    hospice = _brief()
    brief = _brief(immediate_actions=list(hospice.immediate_actions[:2]))
    assert requires_full_immediate_checklist(brief)
    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            brief,
            web_search_source_urls=_URLS,
            web_search_calls=1,
            conversation_text=(
                "My mother is in Haus Omega hospice in Luxembourg with only a "
                "few days of expected life remaining. What should the family "
                "prepare to do after she dies?"
            ),
        )
    assert exc.value.code == "immediate_action_count"


def test_single_topic_recent_death_allows_one_action() -> None:
    brief = _brief(
        situation_stage="recent_death",
        current_question="Can ashes be scattered at sea in Ukraine?",
        user_facts=["Father died last month", "Family is asking about ashes at sea in Ukraine"],
        immediate_actions=[_ASHES_ACTION],
        contacts=[],
        missing_fields=[],
    )
    validate_research_brief(
        brief,
        web_search_source_urls=_URLS,
        web_search_calls=1,
        conversation_text=(
            "Can ashes be scattered at sea in Ukraine? Father died last month."
        ),
    )
    assert not requires_full_immediate_checklist(brief)


def test_writer_allows_short_clarify_and_empty_actions() -> None:
    brief = _brief(
        action="clarify",
        research_status="not_needed",
        immediate_actions=[],
        sources=[],
        contacts=[],
        missing_fields=["death_country"],
        later_topics=[],
    )
    validate_written_response(
        LexWrittenResponse(
            response_version="lex_written_response_v1",
            body_markdown=(
                "I'm sorry this is a lot to hold. Tell me which country this is "
                "in, if you know it, and I will continue from there."
            ),
            used_action_ids=[],
            used_source_ids=[],
            used_contact_ids=[],
        ),
        brief,
    )


def test_writer_allows_short_single_topic_answer() -> None:
    brief = _brief(
        situation_stage="later_administration",
        current_question="Can ashes be scattered at sea in Ukraine?",
        immediate_actions=[_ASHES_ACTION],
        contacts=[],
        missing_fields=[],
    )
    validate_written_response(
        LexWrittenResponse(
            response_version="lex_written_response_v1",
            body_markdown=(
                "Ukraine treats scattering ashes at sea as a permitted option "
                "when the family follows the official burial and environmental "
                "rules. I can be more specific if you tell me the region and "
                "whether a funeral director is already involved.[1]"
            ),
            used_action_ids=["A1"],
            used_source_ids=[1],
            used_contact_ids=[],
        ),
        brief,
    )


def test_degrade_keeps_single_topic_partial_answer() -> None:
    conversation = (
        "Can ashes be scattered at sea in Ukraine? Father died last month."
    )
    brief = _brief(
        situation_stage="recent_death",
        current_question="Can ashes be scattered at sea in Ukraine?",
        user_facts=["Father died last month", "Family is asking about ashes at sea in Ukraine"],
        immediate_actions=[_ASHES_ACTION],
        contacts=[],
        missing_fields=[],
        later_topics=["permits if scattering from a vessel"],
    )
    degraded = degrade_failed_research_brief(
        brief,
        conversation_text=conversation,
        last_error="immediate_action_count",
        web_search_source_urls=_URLS,
        web_search_calls=1,
    )
    assert degraded is not None
    assert degraded.action == "answer"
    assert degraded.sources
    assert len(degraded.immediate_actions) == 1
