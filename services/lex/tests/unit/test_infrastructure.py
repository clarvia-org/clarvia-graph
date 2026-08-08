"""Phase 2 infrastructure: memory adapters work; deferred ports still fail closed."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any

import pytest
from app.domain.errors import MissingDependencyError
from app.domain.ids import task_name_for_message
from app.domain.labels import LEX_PENDING
from app.domain.models import (
    GmailMessageRef,
    ParsedMessage,
    ProcessingStatus,
    new_queued_record,
)
from app.domain.ports import EnqueueOutcome
from app.infrastructure.clock import FakeClock, SystemClock
from app.infrastructure.daily_usage import FirestoreDailyUsage, InMemoryDailyUsage
from app.infrastructure.dependencies import require_module
from app.infrastructure.factory import build_adapters
from app.infrastructure.firestore import (
    FirestoreMessageState,
    document_path,
    document_to_record,
    record_to_document,
)
from app.infrastructure.gmail import GoogleGmailAdapter
from app.infrastructure.google_errors import is_already_exists
from app.infrastructure.memory import (
    InMemoryGmail,
    InMemoryMessageState,
    InMemoryTaskQueue,
)
from app.infrastructure.openai import FakeLlmAdapter, generation_result_from_response
from app.infrastructure.rate_limit import FirestoreRateLimit
from app.infrastructure.tasks import CloudTasksAdapter, build_task_payload

from .conftest import build_settings, make_answer_response


def test_memory_gmail_lists_and_labels() -> None:
    gmail = InMemoryGmail()
    gmail.add_inbox_message(message_id="m1", thread_id="t1")
    gmail.ensure_labels()
    refs = gmail.list_eligible_message_refs(max_results=10)
    assert len(refs) == 1
    gmail.add_label(message_id="m1", label=LEX_PENDING)
    assert gmail.list_eligible_message_refs(max_results=10) == []


def test_memory_gmail_fetch_and_send() -> None:
    gmail = InMemoryGmail()
    ref = gmail.seed_parsed_message(
        ParsedMessage(
            message_id="m1",
            thread_id="t1",
            from_address="user@example.com",
            reply_to=None,
            to_addresses=("user@example.com",),
            cc_addresses=(),
            subject="Question",
            body_text="Hello",
            return_path="user@example.com",
        )
    )
    parsed = gmail.fetch_parsed_message(ref)
    assert parsed.body_text == "Hello"
    sent_id = gmail.send_reply(raw_message="raw", thread_id="t1")
    assert sent_id == "sent-1"
    assert gmail.send_reply_calls == 1


def test_memory_task_queue_is_idempotent() -> None:
    queue = InMemoryTaskQueue()
    ref = GmailMessageRef(message_id="m1", thread_id="t1")
    assert queue.enqueue_process(ref) is EnqueueOutcome.CREATED
    assert queue.enqueue_process(ref) is EnqueueOutcome.ALREADY_EXISTS
    assert queue.task_names == [task_name_for_message("m1")]


def test_memory_state_lease_round_trip() -> None:
    clock = FakeClock()
    state = InMemoryMessageState(clock=clock)
    record = new_queued_record(message_key="m1", thread_id="t1", now=clock.now())
    assert state.create_record(record) is True
    assert state.create_record(record) is False
    decision = state.try_acquire_lease("m1", worker_id="w1", lease_duration_seconds=600)
    assert decision.acquired
    held = state.try_acquire_lease("m1", worker_id="w2", lease_duration_seconds=600)
    assert not held.acquired
    marked = state.mark_status("m1", ProcessingStatus.FAILED, error_code="x")
    assert marked is not None
    assert marked.status is ProcessingStatus.FAILED


def test_firestore_rate_limit_transaction() -> None:
    clock = FakeClock()

    class Document:
        def __init__(self) -> None:
            self.data: dict[str, object] | None = None

        def get(self, transaction: object = None) -> _FakeSnapshot:
            if self.data is None:
                return _FakeSnapshot(None, exists=False)
            return _FakeSnapshot(self.data)

        def set(self, payload: dict[str, object], merge: bool = False) -> None:
            if self.data is None:
                self.data = payload
            else:
                self.data = {**self.data, **payload}

    class Client:
        def __init__(self) -> None:
            self.docs: dict[str, Document] = {}

        def document(self, path: str) -> Document:
            return self.docs.setdefault(path, Document())

        def transaction(self) -> _FakeTransaction:
            return _FakeTransaction()

    def transactional(fn: object) -> object:
        def runner(transaction: object) -> object:
            return fn(transaction)  # type: ignore[operator]

        return runner

    settings = build_settings(environment="development", hmac_secret="secret")
    client = Client()
    store = FirestoreRateLimit(
        settings=settings,
        clock=clock,
        client=client,
        transactional=transactional,
    )
    sender_hmac = "abc123"
    for _ in range(10):
        decision = store.try_accept_model_eligible(
            sender_hmac=sender_hmac,
            now=clock.now(),
            daily_limit=10,
        )
        assert decision.allowed
    blocked = store.try_accept_model_eligible(
        sender_hmac=sender_hmac,
        now=clock.now(),
        daily_limit=10,
    )
    assert not blocked.allowed
    store.mark_notice_sent(sender_hmac=sender_hmac, now=clock.now())


def test_llm_fake_adapter_generates_without_network() -> None:
    adapter = FakeLlmAdapter(
        responses=[generation_result_from_response(make_answer_response())]
    )
    result = adapter.generate(
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert result.response.action == "answer"


def test_system_clock_returns_aware_datetime() -> None:
    now = SystemClock().now()
    assert now.tzinfo is not None


def test_factory_builds_memory_backend() -> None:
    adapters = build_adapters(build_settings(adapter_backend="memory"))
    assert isinstance(adapters.gmail, InMemoryGmail)
    assert isinstance(adapters.tasks, InMemoryTaskQueue)
    assert isinstance(adapters.state, InMemoryMessageState)
    assert isinstance(adapters.daily_usage, InMemoryDailyUsage)
    assert adapters.rate_limit is not None
    assert isinstance(adapters.llm, FakeLlmAdapter)


def test_factory_builds_gcp_backend_without_network() -> None:
    settings = build_settings(
        adapter_backend="gcp",
        cloud_tasks_target_url="https://example.test/internal/process",
        cloud_tasks_invoker_service_account="lex@example.test",
    )
    adapters = build_adapters(settings)
    assert isinstance(adapters.gmail, GoogleGmailAdapter)
    assert isinstance(adapters.tasks, CloudTasksAdapter)
    assert isinstance(adapters.state, FirestoreMessageState)
    assert isinstance(adapters.daily_usage, FirestoreDailyUsage)


def test_google_gmail_fetch_with_injected_service() -> None:
    import base64
    from email.message import EmailMessage
    from email.policy import SMTP

    message = EmailMessage(policy=SMTP)
    message["From"] = "user@example.com"
    message["To"] = "lex@clarvia.org"
    message.set_content("Parsed body", subtype="plain", charset="utf-8")
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("ascii")

    class MessagesApi:
        def get(self, *, userId: str, id: str, format: str) -> object:
            return SimpleNamespace(execute=lambda: {"raw": raw})

    class UsersApi:
        def messages(self) -> MessagesApi:
            return MessagesApi()

    class Service:
        def users(self) -> UsersApi:
            return UsersApi()

    adapter = GoogleGmailAdapter(settings=build_settings(), service=Service())
    parsed = adapter.fetch_parsed_message(
        GmailMessageRef(message_id="m1", thread_id="t1")
    )
    assert "Parsed body" in parsed.body_text


def test_google_gmail_send_with_injected_service() -> None:
    sent: list[dict[str, str]] = []

    class MessagesApi:
        def send(self, *, userId: str, body: dict[str, str]) -> object:
            sent.append(body)
            return SimpleNamespace(execute=lambda: {"id": "sent-1"})

    class UsersApi:
        def messages(self) -> MessagesApi:
            return MessagesApi()

        def threads(self) -> object:
            raise AssertionError("threads not used in this test")

    class Service:
        def users(self) -> UsersApi:
            return UsersApi()

    adapter = GoogleGmailAdapter(settings=build_settings(), service=Service())
    raw_payload = "YWJj"  # base64url already
    message_id = adapter.send_reply(raw_message=raw_payload, thread_id="t1")
    assert message_id == "sent-1"
    assert sent == [{"raw": raw_payload, "threadId": "t1"}]


class _FakeLabelsApi:
    def __init__(self) -> None:
        self.created: list[str] = []

    def list(self, *, userId: str) -> Any:
        return SimpleNamespace(execute=lambda: {"labels": []})

    def create(self, *, userId: str, body: dict[str, str]) -> Any:
        self.created.append(body["name"])
        return SimpleNamespace(
            execute=lambda: {"id": f"id-{body['name']}", "name": body["name"]}
        )


class _FakeMessagesApi:
    def __init__(self) -> None:
        self.modified: list[tuple[str, list[str]]] = []
        self._list_payload = {
            "messages": [
                {"id": "m1", "threadId": "t1"},
                {"id": "bad"},
            ]
        }

    def list(self, *, userId: str, q: str, maxResults: int) -> Any:
        return SimpleNamespace(execute=lambda: self._list_payload)

    def modify(self, *, userId: str, id: str, body: dict[str, Sequence[str]]) -> Any:
        self.modified.append((id, list(body["addLabelIds"])))
        return SimpleNamespace(execute=lambda: {})


class _FakeUsers:
    def __init__(self) -> None:
        self.labels_api = _FakeLabelsApi()
        self.messages_api = _FakeMessagesApi()

    def labels(self) -> _FakeLabelsApi:
        return self.labels_api

    def messages(self) -> _FakeMessagesApi:
        return self.messages_api


class _FakeGmailService:
    def __init__(self) -> None:
        self.users_api = _FakeUsers()

    def users(self) -> _FakeUsers:
        return self.users_api


def test_google_gmail_list_and_label_with_injected_service() -> None:
    service = _FakeGmailService()
    adapter = GoogleGmailAdapter(settings=build_settings(), service=service)
    adapter.ensure_labels()
    assert set(service.users_api.labels_api.created) == {
        "LEX_PENDING",
        "LEX_PROCESSED",
        "LEX_IGNORED",
        "LEX_FAILED",
        "LEX_RATE_LIMITED",
    }
    refs = adapter.list_eligible_message_refs(max_results=10)
    assert refs == [GmailMessageRef(message_id="m1", thread_id="t1")]
    adapter.add_label(message_id="m1", label=LEX_PENDING)
    assert service.users_api.messages_api.modified == [("m1", ["id-LEX_PENDING"])]


def test_cloud_tasks_build_and_enqueue() -> None:
    created: list[dict[str, Any]] = []

    class Client:
        def create_task(self, *, request: dict[str, Any]) -> None:
            created.append(request)

    settings = build_settings(
        adapter_backend="gcp",
        cloud_tasks_target_url="https://example.test/internal/process",
        cloud_tasks_invoker_service_account="lex@example.test",
    )
    adapter = CloudTasksAdapter(settings=settings, client=Client())
    ref = GmailMessageRef(message_id="m1", thread_id="t1")
    assert build_task_payload(ref)["gmail_message_id"] == "m1"
    task = adapter.build_task(ref)
    assert task["name"].endswith(task_name_for_message("m1"))
    assert adapter.enqueue_process(ref) is EnqueueOutcome.CREATED
    assert created

    class ConflictClient:
        def create_task(self, *, request: dict[str, Any]) -> None:
            raise type("AlreadyExists", (Exception,), {})()

    conflict = CloudTasksAdapter(settings=settings, client=ConflictClient())
    assert conflict.enqueue_process(ref) is EnqueueOutcome.ALREADY_EXISTS


class _FakeSnapshot:
    def __init__(self, data: dict[str, Any] | None, *, exists: bool = True) -> None:
        self._data = data
        self.exists = exists

    def to_dict(self) -> dict[str, Any] | None:
        return self._data


class _FakeDocument:
    def __init__(self) -> None:
        self.data: dict[str, Any] | None = None
        self.create_calls = 0
        self.updates: list[dict[str, Any]] = []

    def get(self, transaction: Any = None) -> _FakeSnapshot:
        if self.data is None:
            return _FakeSnapshot(None, exists=False)
        return _FakeSnapshot(self.data)

    def create(self, payload: dict[str, Any]) -> None:
        self.create_calls += 1
        if self.data is not None:
            raise type("AlreadyExists", (Exception,), {})()
        self.data = payload

    def update(self, payload: dict[str, Any]) -> None:
        assert self.data is not None
        self.data = {**self.data, **payload}
        self.updates.append(payload)


class _FakeTransaction:
    def update(self, document: _FakeDocument, payload: dict[str, Any]) -> None:
        document.update(payload)

    def set(
        self, document: _FakeDocument, payload: dict[str, Any], merge: bool = False
    ) -> None:
        if document.data is None:
            document.data = payload
        else:
            document.data = {**document.data, **payload}


class _FakeFirestoreClient:
    def __init__(self) -> None:
        self.docs: dict[str, _FakeDocument] = {}

    def document(self, path: str) -> _FakeDocument:
        return self.docs.setdefault(path, _FakeDocument())

    def transaction(self) -> _FakeTransaction:
        return _FakeTransaction()


def test_firestore_mapping_and_operations() -> None:
    clock = FakeClock()
    client = _FakeFirestoreClient()

    def transactional(fn: Any) -> Any:
        def runner(transaction: Any) -> Any:
            return fn(transaction)

        return runner

    settings = build_settings(environment="development")
    state = FirestoreMessageState(
        settings=settings, clock=clock, client=client, transactional=transactional
    )
    now = clock.now()
    record = new_queued_record(message_key="m1", thread_id="t1", now=now)
    assert document_path("development", "m1").endswith("/messages/m1")
    assert record_to_document(record)["status"] == "queued"
    mapped = document_to_record("m1", record_to_document(record))
    assert mapped.message_key == "m1"

    assert state.create_record(record) is True
    assert state.create_record(record) is False
    loaded = state.get_record("m1")
    assert loaded is not None
    decision = state.try_acquire_lease("m1", worker_id="w1", lease_duration_seconds=600)
    assert decision.acquired
    marked = state.mark_status("m1", ProcessingStatus.FAILED, error_code="boom")
    assert marked is not None
    assert marked.last_error_code == "boom"
    assert state.mark_status("missing", ProcessingStatus.FAILED) is None


class _SweepCollection:
    def where(self, field: str, op: str, value: object) -> _SweepCollection:
        return self

    def stream(self) -> list[object]:
        doc = SimpleNamespace(reference=SimpleNamespace(delete=lambda: None))
        return [doc]


class _SweepClient:
    def collection(self, path: str) -> _SweepCollection:
        return _SweepCollection()


class _FakeFirestoreClientWithCollection(_SweepClient):
    def document(self, path: str) -> _FakeDocument:
        return _FakeFirestoreClient().document(path)


def test_firestore_message_state_sweep_expired() -> None:
    clock = FakeClock()
    client = _FakeFirestoreClientWithCollection()
    state = FirestoreMessageState(
        settings=build_settings(environment="development"),
        clock=clock,
        client=client,
        transactional=lambda fn: fn,
    )
    deleted = state.sweep_expired(now=clock.now())
    assert deleted == 1


def test_firestore_rate_limit_sweep_expired() -> None:
    clock = FakeClock()
    store = FirestoreRateLimit(
        settings=build_settings(),
        clock=clock,
        client=_SweepClient(),
    )
    deleted = store.sweep_expired(now=clock.now())
    assert deleted == 1


def test_firestore_daily_usage_transaction_and_metrics() -> None:
    clock = FakeClock()

    class Document:
        def __init__(self) -> None:
            self.data: dict[str, object] | None = None

        def get(self, transaction: object = None) -> _FakeSnapshot:
            if self.data is None:
                return _FakeSnapshot(None, exists=False)
            return _FakeSnapshot(self.data)

        def set(self, payload: dict[str, object], merge: bool = False) -> None:
            if self.data is None:
                self.data = payload
            else:
                self.data = {**self.data, **payload}

    class Client:
        def __init__(self) -> None:
            self.docs: dict[str, Document] = {}

        def document(self, path: str) -> Document:
            return self.docs.setdefault(path, Document())

        def transaction(self) -> _FakeTransaction:
            return _FakeTransaction()

        def collection(self, path: str) -> _SweepCollection:
            return _SweepCollection()

    def transactional(fn: object) -> object:
        def runner(transaction: object) -> object:
            return fn(transaction)  # type: ignore[operator]

        return runner

    usage = FirestoreDailyUsage(
        settings=build_settings(),
        clock=clock,
        client=Client(),
        transactional=transactional,
    )
    now = clock.now()
    allowed = usage.try_consume_llm_call(now=now, global_limit=5, force_open=False)
    assert allowed.allowed
    usage.record_email_sent(now=now)
    usage.increment_failures(now=now)
    forced = usage.try_consume_llm_call(now=now, global_limit=5, force_open=True)
    assert not forced.allowed
    assert usage.sweep_expired(now=now) == 1


def test_document_to_record_tolerates_naive_datetimes() -> None:
    naive = datetime(2026, 7, 25, 12, 0, 0)
    record = document_to_record(
        "m1",
        {
            "thread_id": "t1",
            "status": "queued",
            "discovered_at": naive,
            "updated_at": naive,
            "attempt_count": 0,
        },
    )
    assert record.discovered_at.tzinfo == UTC


def test_is_already_exists_recognises_common_shapes() -> None:
    assert is_already_exists(type("AlreadyExists", (Exception,), {})())
    assert is_already_exists(type("Conflict", (Exception,), {})())

    class WithCode(Exception):
        def code(self) -> int:
            return 6

    assert is_already_exists(WithCode())
    assert not is_already_exists(RuntimeError("nope"))


def test_require_module_missing() -> None:
    with pytest.raises(MissingDependencyError):
        require_module("lex_email_missing_module_xyz")
