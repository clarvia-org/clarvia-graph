"""Tests for OpenAI adapter parsing and fake LLM behaviour."""

from __future__ import annotations

from app.infrastructure.openai import (
    FakeLlmAdapter,
    OpenAIResponsesAdapter,
    count_web_search_calls,
    extract_web_search_source_urls,
    generation_result_from_response,
)

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
        model="gpt-5.6-luna",
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
