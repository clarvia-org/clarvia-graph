"""OpenAI Responses API adapter and test doubles."""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

from app.domain.errors import MissingDependencyError
from app.domain.ports import LlmGenerationResult, LlmPort, StructuredLlmResult
from app.infrastructure.dependencies import require_module
from app.llm.schema import LEX_RESPONSE_JSON_SCHEMA, LexResponse
from app.llm.url_normalize import normalize_source_url

_OPENAI_INCLUDE = ["web_search_call.action.sources"]


class OpenAiConfigurationError(RuntimeError):
    """Raised when the OpenAI adapter cannot run (missing key or SDK)."""


def extract_web_search_source_urls(payload: Mapping[str, Any]) -> frozenset[str]:
    """Collect normalised HTTPS URLs from a Responses API payload."""
    urls: set[str] = set()
    _walk_for_search_urls(payload, urls)
    return frozenset(urls)


def count_web_search_calls(payload: Mapping[str, Any]) -> int:
    """Count completed web_search_call output items in a Responses payload."""
    output = payload.get("output")
    if not isinstance(output, list):
        return 0
    return sum(
        1
        for item in output
        if isinstance(item, Mapping) and item.get("type") == "web_search_call"
    )


def _walk_for_search_urls(node: Any, urls: set[str]) -> None:
    if isinstance(node, Mapping):
        node_type = node.get("type")
        if node_type == "web_search_call":
            action = node.get("action")
            if isinstance(action, Mapping):
                sources = action.get("sources")
                if isinstance(sources, list):
                    for source in sources:
                        if isinstance(source, Mapping):
                            url = source.get("url")
                            if isinstance(url, str) and url.startswith(
                                ("https://", "http://")
                            ):
                                urls.add(normalize_source_url(url))
        for value in node.values():
            _walk_for_search_urls(value, urls)
    elif isinstance(node, list):
        for item in node:
            _walk_for_search_urls(item, urls)


def _parse_structured_response(payload: Mapping[str, Any]) -> LexResponse:
    text = _extract_output_text(payload)
    if not text:
        raise ValueError("missing_structured_output")
    data = json.loads(text)
    return LexResponse.model_validate(data)


def _extract_output_text(payload: Mapping[str, Any]) -> str:
    output_text = payload.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    output = payload.get("output")
    if not isinstance(output, list):
        return ""

    chunks: list[str] = []
    for item in output:
        if not isinstance(item, Mapping):
            continue
        if item.get("type") != "message":
            continue
        content = item.get("content")
        if not isinstance(content, list):
            continue
        for part in content:
            if not isinstance(part, Mapping):
                continue
            if part.get("type") in {"output_text", "text"}:
                text = part.get("text")
                if isinstance(text, str):
                    chunks.append(text)
    return "".join(chunks)


@dataclass(slots=True)
class OpenAIResponsesAdapter(LlmPort):
    """Production adapter using the OpenAI Responses API (blueprint section 14)."""

    api_key: str
    model: str
    max_output_tokens: int
    client: Any | None = None

    def _client(self) -> Any:
        if self.client is not None:
            return self.client
        if not self.api_key.strip():
            raise OpenAiConfigurationError(
                "openai_api_key is required for model calls."
            )
        try:
            openai = require_module("openai")
        except MissingDependencyError as exc:
            raise OpenAiConfigurationError("openai package is not installed.") from exc
        return openai.OpenAI(api_key=self.api_key)

    def generate(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        force_web_search: bool = False,
    ) -> LlmGenerationResult:
        structured = self.generate_structured(
            system_prompt=system_prompt,
            runtime_envelope=runtime_envelope,
            json_schema=LEX_RESPONSE_JSON_SCHEMA,
            schema_name="lex_response_v1",
            enable_web_search=True,
            force_web_search=force_web_search,
        )
        return LlmGenerationResult(
            response=LexResponse.model_validate(structured.data),
            openai_response_id=structured.openai_response_id,
            web_search_source_urls=structured.web_search_source_urls,
            web_search_calls=structured.web_search_calls,
        )

    def generate_structured(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        json_schema: dict[str, object],
        schema_name: str,
        enable_web_search: bool,
        force_web_search: bool = False,
        reasoning_effort: str | None = None,
        max_output_tokens: int | None = None,
    ) -> StructuredLlmResult:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "instructions": system_prompt,
            "input": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": runtime_envelope,
                        }
                    ],
                }
            ],
            "include": _OPENAI_INCLUDE if enable_web_search else [],
            "reasoning": {"effort": reasoning_effort or "medium"},
            "max_output_tokens": (
                max_output_tokens
                if max_output_tokens is not None
                else self.max_output_tokens
            ),
            "store": False,
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": schema_name,
                    "strict": True,
                    "schema": json_schema,
                }
            },
        }
        if enable_web_search:
            kwargs["tools"] = [{"type": "web_search"}]
            kwargs["tool_choice"] = (
                {"type": "web_search"} if force_web_search else "auto"
            )
        response = self._client().responses.create(**kwargs)
        payload = _response_to_mapping(response)
        text = _extract_output_text(payload)
        if not text:
            status = payload.get("status")
            incomplete = payload.get("incomplete_details")
            raise ValueError(
                "missing_structured_output"
                + (f":status={status}" if status else "")
                + (f":incomplete={incomplete}" if incomplete else "")
            )
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"invalid_structured_json:{exc.msg}:pos={exc.pos}:len={len(text)}"
            ) from exc
        if not isinstance(data, dict):
            raise ValueError("missing_structured_output")
        return StructuredLlmResult(
            data=data,
            openai_response_id=_response_id(payload),
            web_search_source_urls=(
                extract_web_search_source_urls(payload)
                if enable_web_search
                else frozenset()
            ),
            web_search_calls=(
                count_web_search_calls(payload) if enable_web_search else 0
            ),
        )


def _response_to_mapping(response: Any) -> dict[str, Any]:
    if hasattr(response, "model_dump"):
        dumped = response.model_dump()
        if isinstance(dumped, dict):
            return dumped
    if isinstance(response, Mapping):
        return dict(response)
    raise TypeError("unexpected_openai_response_type")


def _response_id(payload: Mapping[str, Any]) -> str | None:
    response_id = payload.get("id")
    return str(response_id) if response_id else None


@dataclass
class FakeLlmAdapter(LlmPort):
    """Scripted LLM for unit tests; never contacts the network."""

    responses: list[LlmGenerationResult] = field(default_factory=list)
    structured_responses: list[StructuredLlmResult] = field(default_factory=list)
    calls: list[dict[str, bool | str]] = field(default_factory=list)
    default_error: Exception | None = None

    def generate(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        force_web_search: bool = False,
    ) -> LlmGenerationResult:
        self.calls.append(
            {
                "force_web_search": force_web_search,
                "system_prompt_len": str(len(system_prompt)),
                "envelope_len": str(len(runtime_envelope)),
                "mode": "generate",
            }
        )
        if self.default_error is not None:
            raise self.default_error
        index = sum(1 for call in self.calls if call.get("mode") == "generate") - 1
        if index >= len(self.responses):
            if not self.responses:
                raise RuntimeError("FakeLlmAdapter has no scripted response remaining.")
            return self.responses[-1]
        return self.responses[index]

    def generate_structured(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        json_schema: dict[str, object],
        schema_name: str,
        enable_web_search: bool,
        force_web_search: bool = False,
        reasoning_effort: str | None = None,
        max_output_tokens: int | None = None,
    ) -> StructuredLlmResult:
        self.calls.append(
            {
                "force_web_search": force_web_search,
                "system_prompt_len": str(len(system_prompt)),
                "envelope_len": str(len(runtime_envelope)),
                "mode": "structured",
                "schema_name": schema_name,
                "enable_web_search": enable_web_search,
                "reasoning_effort": reasoning_effort or "",
                "max_output_tokens": str(max_output_tokens or ""),
            }
        )
        if self.default_error is not None:
            raise self.default_error
        index = sum(1 for call in self.calls if call.get("mode") == "structured") - 1
        if index >= len(self.structured_responses):
            if not self.structured_responses:
                raise RuntimeError(
                    "FakeLlmAdapter has no scripted structured response remaining."
                )
            return self.structured_responses[-1]
        return self.structured_responses[index]


def generation_result_from_response(
    response: LexResponse,
    *,
    source_urls: frozenset[str] | None = None,
    web_search_calls: int = 1,
    openai_response_id: str | None = "fake-response-id",
) -> LlmGenerationResult:
    """Build generation evidence from a structured response for tests."""
    if source_urls is None:
        urls = frozenset(
            normalize_source_url(url)
            for url in (
                *(source.url for source in response.sources),
                *(contact.website for contact in response.contacts),
            )
        )
    else:
        urls = source_urls
    calls = web_search_calls if response.action == "answer" else 0
    return LlmGenerationResult(
        response=response,
        openai_response_id=openai_response_id,
        web_search_source_urls=urls,
        web_search_calls=calls,
    )


__all__ = [
    "OpenAiConfigurationError",
    "OpenAIResponsesAdapter",
    "FakeLlmAdapter",
    "extract_web_search_source_urls",
    "count_web_search_calls",
    "generation_result_from_response",
]
