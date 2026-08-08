"""Synthetic evaluation suite for Phase 4 validation thresholds."""

from __future__ import annotations

import pytest
from app.infrastructure.openai import generation_result_from_response
from app.llm.validation import LexValidationError, validate_lex_response

from tests.evals import load_anchor_fixtures
from tests.evals.fixture_builder import fixture_generation, fixture_response


def test_anchor_catalog_has_minimum_coverage() -> None:
    anchors = load_anchor_fixtures()
    assert len(anchors) >= 20
    categories = {anchor["category"] for anchor in anchors}
    assert "provider_neutrality" in categories
    assert "prompt_injection" in categories
    assert "validation" in categories


def test_anchor_action_fixtures_pass_validation() -> None:
    anchors = load_anchor_fixtures()
    action_cases = [a for a in anchors if "expected_action" in a]
    assert len(action_cases) >= 10

    for anchor in action_cases:
        response = fixture_response(str(anchor["fixture"]))
        generation = generation_result_from_response(response)
        validate_lex_response(
            response,
            web_search_source_urls=generation.web_search_source_urls,
            web_search_calls=generation.web_search_calls,
        )
        assert response.action == anchor["expected_action"]


def test_anchor_validation_failures_match_expected_codes() -> None:
    anchors = load_anchor_fixtures()
    failure_cases = [a for a in anchors if "expected_validation_code" in a]
    assert len(failure_cases) >= 8

    for anchor in failure_cases:
        generation = fixture_generation(str(anchor["fixture"]))
        with pytest.raises(LexValidationError) as exc:
            validate_lex_response(
                generation.response,
                web_search_source_urls=generation.web_search_source_urls,
                web_search_calls=generation.web_search_calls,
            )
        assert exc.value.code == anchor["expected_validation_code"]
