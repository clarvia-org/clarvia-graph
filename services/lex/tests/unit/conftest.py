"""Shared fixtures and builders for unit tests."""

from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import pytest
from app.config import Settings
from app.infrastructure.openai import FakeLlmAdapter, generation_result_from_response
from app.llm.schema import LexContact, LexJurisdiction, LexResponse, LexSource


def build_settings(**overrides: Any) -> Settings:
    """Construct Settings without reading a local .env, for deterministic tests.

    Processor fixtures use the live single-pass ``generate`` path.
    Two-pass tests set ``generation_pipeline="two_pass"`` when they call
    ``run_two_pass_pipeline`` directly.
    """
    values = {"generation_pipeline": "single_pass", **overrides}
    return Settings(_env_file=None, **values)  # type: ignore[call-arg]


_CONFIG_ENV_VARS = (
    "ENVIRONMENT",
    "GCP_PROJECT_ID",
    "GCP_REGION",
    "LEX_MAILBOX",
    "OPENAI_MODEL",
    "PROMPT_VERSION",
    "PROMPT_PATH",
    "LEX_PROMPT_PATH",
    "SCHEMA_VERSION",
    "PROCESSING_MODE",
    "PROCESSING_ENABLED",
    "ADAPTER_BACKEND",
    "POLL_MAX_RESULTS",
    "LEASE_DURATION_SECONDS",
    "CLOUD_TASKS_QUEUE",
    "CLOUD_TASKS_LOCATION",
    "CLOUD_TASKS_TARGET_URL",
    "CLOUD_TASKS_INVOKER_SERVICE_ACCOUNT",
    "FIRESTORE_DATABASE",
    "INTERNAL_AUTH_TOKEN",
    "HMAC_SECRET",
    "LEX_WEBSITE_HMAC_SECRET",
    "LEX_ALIASES",
    "GLOBAL_DAILY_LLM_LIMIT",
    "FORCE_CIRCUIT_OPEN",
    "ALLOWLIST_SENDERS",
    "ALLOWLIST_SENDER_HMACS",
    "RETENTION_TRASH_GMAIL",
    "MAX_VISIBLE_RECIPIENTS",
    "MAX_SENDER_REQUESTS_PER_DAY",
    "MAX_BODY_CHARS",
    "MAX_THREAD_CHARS",
    "LEX_GENERATION_PIPELINE",
    "PIPELINE_VERSION",
    "MAX_OUTPUT_TOKENS",
    "RESEARCH_PROMPT_VERSION",
    "WRITER_PROMPT_VERSION",
    "RESEARCH_SCHEMA_VERSION",
    "WRITER_SCHEMA_VERSION",
    "LEX_RESEARCH_PROMPT_PATH",
    "LEX_WRITER_PROMPT_PATH",
    "LOG_LEVEL",
)


@pytest.fixture
def clean_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Remove Lex config environment variables for deterministic defaults."""
    for name in _CONFIG_ENV_VARS:
        monkeypatch.delenv(name, raising=False)


def make_answer_response(**overrides: object) -> LexResponse:
    """A minimal, valid action='answer' response for validation tests."""
    data: dict[str, object] = {
        "response_version": "lex_response_v1",
        "action": "answer",
        "language": "en",
        "jurisdictions": [
            LexJurisdiction(country_code="LU", subdivision=None, role="death_location")
        ],
        "body_markdown": "Contact the Commune office for registration [1].\n\nLex.",
        "contacts": [
            LexContact(
                id=1,
                name="Commune office",
                kind="authority",
                country_code="LU",
                website="https://guichet.public.lu",
                phone=None,
                email=None,
                commercial=False,
                note="Handles death registration.",
                source_id=1,
            )
        ],
        "sources": [
            LexSource(
                id=1,
                title="Death registration guide",
                publisher="Government of Luxembourg",
                url="https://guichet.public.lu",
            )
        ],
        "research_status": "adequate",
    }
    data.update(overrides)
    return LexResponse.model_validate(data)


def make_decline_response(**overrides: object) -> LexResponse:
    data: dict[str, object] = {
        "response_version": "lex_response_v1",
        "action": "decline",
        "language": "en",
        "jurisdictions": [],
        "body_markdown": "Lex helps with bereavement and end of life only.\n\nLex.",
        "contacts": [],
        "sources": [],
        "research_status": "not_needed",
    }
    data.update(overrides)
    return LexResponse.model_validate(data)


def make_clarify_response(**overrides: object) -> LexResponse:
    """A minimal, valid action='clarify' response."""
    data: dict[str, object] = {
        "response_version": "lex_response_v1",
        "action": "clarify",
        "language": "en",
        "jurisdictions": [],
        "body_markdown": "Which country was the person living in?\n\nLex.",
        "contacts": [],
        "sources": [],
        "research_status": "not_needed",
    }
    data.update(overrides)
    return LexResponse.model_validate(data)


def fake_llm_for_responses(*responses: LexResponse) -> FakeLlmAdapter:
    """Build a fake LLM that returns scripted generation results in order."""
    return FakeLlmAdapter(
        responses=[generation_result_from_response(response) for response in responses]
    )


@pytest.fixture
def answer_response() -> LexResponse:
    return make_answer_response()


@pytest.fixture
def decline_response() -> LexResponse:
    return make_decline_response()


@pytest.fixture
def synthetic_prompt(tmp_path: object) -> Iterator[str]:
    """Yield a path to a small synthetic prompt file (never the real prompt)."""
    from pathlib import Path

    assert isinstance(tmp_path, Path)
    prompt_file = tmp_path / "synthetic-prompt.txt"
    prompt_file.write_text(
        "SYNTHETIC TEST PROMPT\nYou are a test.\nLex.\n", encoding="utf-8"
    )
    yield str(prompt_file)
