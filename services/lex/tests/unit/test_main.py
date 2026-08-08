"""Tests for the FastAPI application (app.main)."""

from __future__ import annotations

import pytest
from app import __version__
from app.domain.ids import task_name_for_message
from app.domain.labels import LEX_PENDING, LEX_PROCESSED
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.factory import Adapters
from app.infrastructure.memory import (
    InMemoryGmail,
    InMemoryMessageState,
    InMemoryTaskQueue,
)
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.main import create_app
from app.services.processor import PROCESS_STATUS_SENT
from fastapi.testclient import TestClient

from .conftest import build_settings, fake_llm_for_responses, make_answer_response


def _build_client(
    *,
    processing_enabled: bool = True,
    processing_mode: str = "public",
    internal_auth_token: str = "",
    prompt_path: str | None = None,
) -> tuple[TestClient, InMemoryGmail, InMemoryTaskQueue, InMemoryMessageState]:
    clock = FakeClock()
    gmail = InMemoryGmail()
    tasks = InMemoryTaskQueue()
    state = InMemoryMessageState(clock=clock)
    settings_kwargs: dict[str, object] = {
        "processing_enabled": processing_enabled,
        "processing_mode": processing_mode,
        "adapter_backend": "memory",
        "internal_auth_token": internal_auth_token,
        "hmac_secret": "main-test-secret",
    }
    if prompt_path is not None:
        settings_kwargs["prompt_path"] = prompt_path
    settings = build_settings(**settings_kwargs)
    app = create_app(
        settings,
        adapters=Adapters(
            gmail=gmail,
            tasks=tasks,
            state=state,
            rate_limit=InMemoryRateLimit(),
            daily_usage=InMemoryDailyUsage(),
            llm=fake_llm_for_responses(make_answer_response()),
            clock=clock,
        ),
    )
    return TestClient(app), gmail, tasks, state


@pytest.fixture
def client() -> TestClient:
    client, *_ = _build_client()
    return client


def test_health_returns_status_and_versions(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body == {
        "status": "ok",
        "version": __version__,
        "prompt_version": "lex-v1",
        "schema_version": "lex_response_v1",
    }


def test_health_does_not_leak_prompt_or_config(client: TestClient) -> None:
    text = client.get("/health").text
    assert "IDENTITY" not in text
    assert "gcp_project_id" not in text
    assert "OPENAI_API_KEY" not in text


def test_internal_poll_discovers_and_enqueues() -> None:
    client, gmail, tasks, state = _build_client()
    gmail.add_inbox_message(message_id="m1", thread_id="t1")

    response = client.post("/internal/poll")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["discovered"] == 1
    assert body["enqueued"] == 1
    assert tasks.task_names == [task_name_for_message("m1")]
    assert state.get_record("m1") is not None
    assert LEX_PENDING in gmail.labels_for("m1")


def test_internal_poll_disabled_is_a_no_op() -> None:
    client, gmail, tasks, _state = _build_client(processing_enabled=False)
    gmail.add_inbox_message(message_id="m1", thread_id="t1")

    response = client.post("/internal/poll")

    assert response.status_code == 200
    assert response.json()["status"] == "disabled"
    assert tasks.task_names == []


def test_internal_process_acquires_lease_and_sends(
    synthetic_prompt: str,
) -> None:
    client, gmail, _tasks, state = _build_client(prompt_path=synthetic_prompt)
    from app.domain.models import ParsedMessage

    gmail.seed_parsed_message(
        ParsedMessage(
            message_id="m1",
            thread_id="t1",
            from_address="user@example.com",
            reply_to=None,
            to_addresses=("user@example.com",),
            cc_addresses=(),
            subject="Question",
            body_text="What should I do after a death in Luxembourg?",
            return_path="user@example.com",
        )
    )
    response = client.post(
        "/internal/process", json={"gmail_message_id": "m1", "thread_id": "t1"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == PROCESS_STATUS_SENT
    assert body["attempt_count"] == 1
    record = state.get_record("m1")
    assert record is not None
    assert record.status.value == "sent"
    assert LEX_PROCESSED in gmail.labels_for("m1")

    second = client.post("/internal/process", json={"gmail_message_id": "m1"})
    assert second.json()["status"] == "already_done"


def test_internal_auth_token_is_enforced_when_configured() -> None:
    client, gmail, _tasks, _state = _build_client(internal_auth_token="secret")
    gmail.add_inbox_message(message_id="m1", thread_id="t1")

    denied = client.post("/internal/poll")
    assert denied.status_code == 401

    allowed = client.post("/internal/poll", headers={"X-Lex-Internal-Token": "secret"})
    assert allowed.status_code == 200
    assert allowed.json()["enqueued"] == 1


def test_internal_retention_endpoint() -> None:
    client, _gmail, _tasks, state = _build_client()
    from datetime import UTC, datetime

    from app.domain.models import new_queued_record

    expired_at = datetime(2020, 1, 1, tzinfo=UTC)
    state.create_record(
        new_queued_record(
            message_key="old",
            thread_id="t-old",
            now=expired_at,
            expires_at=expired_at,
        )
    )

    response = client.post("/internal/retention")
    assert response.status_code == 200
    body = response.json()
    assert body["messages_deleted"] >= 1
    assert state.get_record("old") is None


def test_no_openapi_docs_exposed(client: TestClient) -> None:
    assert client.get("/openapi.json").status_code == 404
    assert client.get("/docs").status_code == 404
