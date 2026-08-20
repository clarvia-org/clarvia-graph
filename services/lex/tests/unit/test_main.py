"""Tests for the FastAPI application (app.main)."""

from __future__ import annotations

import base64
from datetime import UTC, datetime

import pytest
from app import __version__
from app.domain.ids import task_name_for_message
from app.domain.labels import LEX_PENDING, LEX_PROCESSED
from app.domain.models import GmailMessageRef
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
from app.services.ask_auth import SIGNATURE_HEADER, TIMESTAMP_HEADER, sign_ask_payload
from app.services.processor import PROCESS_STATUS_SENT
from fastapi.testclient import TestClient

from .conftest import build_settings, fake_llm_for_responses, make_answer_response

ASK_SECRET = "ask-test-secret"
ASK_QUESTION = (
    "My father died last week in Paris. I live in France. What do I need to do first?"
)


def _build_client(
    *,
    processing_enabled: bool = True,
    processing_mode: str = "public",
    internal_auth_token: str = "",
    prompt_path: str | None = None,
    website_hmac_secret: str = ASK_SECRET,
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
        "website_hmac_secret": website_hmac_secret,
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


def _ask_body(*, consent: bool = True) -> str:
    flag = "true" if consent else "false"
    return (
        '{"email":"user@example.com","question":"'
        + ASK_QUESTION
        + '","consent":'
        + flag
        + "}"
    )


def _ask_headers(body: str) -> dict[str, str]:
    timestamp = datetime.now(UTC).isoformat()
    return {
        "Content-Type": "application/json",
        TIMESTAMP_HEADER: timestamp,
        SIGNATURE_HEADER: sign_ask_payload(ASK_SECRET, timestamp, body),
    }


def test_ask_ingest_inserts_and_enqueues() -> None:
    client, gmail, tasks, state = _build_client()
    body = _ask_body()

    response = client.post("/v1/ask", content=body, headers=_ask_headers(body))

    assert response.status_code == 202
    assert response.json() == {"status": "accepted"}
    assert tasks.task_names == [task_name_for_message("ask-1")]
    record = state.get_record("ask-1")
    assert record is not None
    parsed = gmail.fetch_parsed_message(
        GmailMessageRef(message_id="ask-1", thread_id="ask-thread-1")
    )
    assert parsed.from_address == "user@example.com"
    assert parsed.delivery_channel == "web"
    assert "Paris" in parsed.body_text


def test_ask_ingest_fails_closed_when_website_secret_unset() -> None:
    client, *_ = _build_client(website_hmac_secret="")
    body = _ask_body()
    response = client.post("/v1/ask", content=body, headers=_ask_headers(body))
    assert response.status_code == 401


def test_ask_ingest_rejects_missing_hmac() -> None:
    client, *_ = _build_client()
    body = _ask_body()
    response = client.post(
        "/v1/ask", content=body, headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 401


def test_ask_ingest_does_not_accept_internal_token() -> None:
    client, *_ = _build_client(internal_auth_token="secret")
    body = _ask_body()
    response = client.post(
        "/v1/ask",
        content=body,
        headers={"Content-Type": "application/json", "X-Lex-Internal-Token": "secret"},
    )
    assert response.status_code == 401


def test_ask_ingest_disabled_does_not_insert() -> None:
    client, gmail, tasks, _state = _build_client(processing_enabled=False)
    body = _ask_body()
    response = client.post("/v1/ask", content=body, headers=_ask_headers(body))
    assert response.status_code == 503
    assert response.json()["code"] == "processing_disabled"
    assert tasks.task_names == []
    assert gmail.list_eligible_message_refs(max_results=10) == []


def test_ask_ingest_requires_consent() -> None:
    client, *_ = _build_client()
    body = _ask_body(consent=False)
    response = client.post("/v1/ask", content=body, headers=_ask_headers(body))
    assert response.status_code == 400
    assert response.json() == {"status": "invalid", "code": "consent_required"}


def test_ask_ingest_then_process_quotes_question(
    synthetic_prompt: str,
) -> None:
    client, gmail, _tasks, _state = _build_client(prompt_path=synthetic_prompt)
    body = _ask_body()
    accepted = client.post("/v1/ask", content=body, headers=_ask_headers(body))
    assert accepted.status_code == 202

    processed = client.post(
        "/internal/process",
        json={"gmail_message_id": "ask-1", "thread_id": "ask-thread-1"},
    )
    assert processed.status_code == 200
    assert processed.json()["status"] == PROCESS_STATUS_SENT
    assert gmail.last_sent_raw is not None
    padding = "=" * (-len(gmail.last_sent_raw) % 4)
    decoded = base64.urlsafe_b64decode(gmail.last_sent_raw + padding).decode("utf-8")
    assert "Paris" in decoded
