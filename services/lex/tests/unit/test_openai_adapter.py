"""Tests for OpenAI adapter parsing, helper utilities, and fake LLM behaviour."""

from __future__ import annotations

import pytest
from app.domain.errors import NotImplementedForPhase
from app.infrastructure.openai import (
    FakeLlmAdapter,
    OpenAIResponsesAdapter,
    _extract_output_text,
    _parse_structured_response,
    count_web_search_calls,
    extract_web_search_source_urls,
    generation_result_from_response,
)
from app.llm.schema import LexJurisdiction, LexResponse

from .conftest import make_answer_response


def test_extract_urls_from_nested_web_search_payload() -> None:
    payload = {
        "output": [
            {
                "type": "web_search_call",
                "action": {
                    "sources": [
                        {"url": "https://guichet.public.lu/guide"},
                        {"url": "http://example.lu/page/"},
                    ]
                },
            },
            {
                "type": "message",
                "content": [{"type": "output_text", "text": "{}"}],
            },
        ]
    }
    urls = extract_web_search_source_urls(payload)
    assert "https://guichet.public.lu/guide" in urls
    assert "http://example.lu/page" in urls
    assert count_web_search_calls(payload) == 1


def test_fake_llm_records_force_web_search_flag() -> None:
    response = make_answer_response()
    llm = FakeLlmAdapter(responses=[generation_result_from_response(response)])
    llm.generate(
        system_prompt="prompt",
        runtime_envelope="envelope",
        force_web_search=True,
    )
    assert llm.calls[0]["force_web_search"] is True


def test_openai_adapter_builds_tool_choice_for_forced_search() -> None:
    captured: dict[str, object] = {}

    class ResponsesApi:
        @staticmethod
        def create(**kwargs: object) -> dict[str, object]:
            captured.update(kwargs)
            return {
                "id": "resp-1",
                "output_text": make_answer_response().model_dump_json(),
                "output": [
                    {
                        "type": "web_search_call",
                        "action": {"sources": [{"url": "https://guichet.public.lu"}]},
                    }
                ],
            }

    class Client:
        responses = ResponsesApi()

    adapter = OpenAIResponsesAdapter(
        api_key="test-key",
        model="gpt-6-luna",
        max_output_tokens=2400,
        client=Client(),
    )
    adapter.generate(
        system_prompt="prompt",
        runtime_envelope="envelope",
        force_web_search=True,
    )
    assert captured["tool_choice"] == {"type": "web_search"}
    assert captured["store"] is False


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


def test_eval_report_helpers(tmp_path: object) -> None:
    from pathlib import Path

    from app.ops.eval_report import (
        default_report_dir,
        load_report_json,
        render_markdown_report,
        write_report,
    )
    from app.ops.pilot_harness import PilotRunResult, PilotSuiteResult

    assert isinstance(tmp_path, Path)
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
    from app.domain.models import ConversationRole
    from app.email.parsing import build_conversation_thread

    messages = [
        (
            ConversationRole.USER,
            "First message about mother in Luxembourg hospice. " * 20,
        ),
        (ConversationRole.ASSISTANT, "Thanks, I will look into that. " * 20),
        (ConversationRole.USER, "Weather is nice today. " * 20),
        (ConversationRole.USER, "She already obtained the family booklet. " * 5),
        (ConversationRole.USER, "Latest question about the commune declaration."),
    ]
    thread = build_conversation_thread(messages, max_thread_chars=350)
    text = "\n".join(item.text for item in thread)
    assert "omitted" in text
    assert "family booklet" in text or "Luxembourg" in text or "Latest question" in text


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
            LexJurisdiction(country_code="LU", subdivision=None, role="death_location")
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
