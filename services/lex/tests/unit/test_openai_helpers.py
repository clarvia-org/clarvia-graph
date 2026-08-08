"""Small coverage fills for OpenAI helpers and domain errors."""

from __future__ import annotations

import pytest
from app.domain.errors import NotImplementedForPhase
from app.infrastructure.openai import (
    count_web_search_calls,
    extract_web_search_source_urls,
)
from app.infrastructure.openai import _extract_output_text, _parse_structured_response
from app.llm.schema import LexJurisdiction, LexResponse


def test_not_implemented_for_phase_message() -> None:
    err = NotImplementedForPhase("phase2_feature")
    assert err.code == "phase2_feature"
    assert "phase2_feature" in str(err)


def test_count_web_search_calls_and_extract_urls() -> None:
    assert count_web_search_calls({"output": "nope"}) == 0
    payload = {
        "output": [
            {
                "type": "web_search_call",
                "action": {
                    "sources": [
                        {"url": "https://guichet.public.lu/path"},
                        {"url": "http://example.com"},
                        {"url": 123},
                    ]
                },
            },
            {"type": "message"},
        ]
    }
    assert count_web_search_calls(payload) == 1
    urls = extract_web_search_source_urls(payload)
    assert any("guichet.public.lu" in url for url in urls)


def test_extract_output_text_variants() -> None:
    assert _extract_output_text({"output_text": "  hello  "}) == "  hello  "
    assert _extract_output_text({"output": "x"}) == ""
    nested = {
        "output": [
            {
                "type": "message",
                "content": [
                    {"type": "output_text", "text": "part-a"},
                    {"type": "text", "text": "part-b"},
                    {"type": "other", "text": "skip"},
                    "ignore",
                ],
            },
            "skip-item",
            {"type": "reasoning"},
        ]
    }
    assert _extract_output_text(nested) == "part-apart-b"


def test_parse_structured_response_round_trip() -> None:
    response = LexResponse(
        response_version="lex_response_v1",
        action="clarify",
        language="en",
        jurisdictions=[
            LexJurisdiction(
                country_code="LU", subdivision=None, role="death_location"
            )
        ],
        body_markdown="Which country?\n\nLex.",
        contacts=[],
        sources=[],
        research_status="not_needed",
    )
    payload = {"output_text": response.model_dump_json()}
    parsed = _parse_structured_response(payload)
    assert parsed.action == "clarify"
    with pytest.raises(ValueError):
        _parse_structured_response({"output": []})
