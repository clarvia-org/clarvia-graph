"""Reliability: lease_held must be retryable; crashes must requeue."""

from __future__ import annotations

from dataclasses import replace
from datetime import timedelta

from app.domain.ids import task_name_for_message
from app.domain.models import ProcessingStatus, new_queued_record
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import (
    InMemoryGmail,
    InMemoryMessageState,
    InMemoryTaskQueue,
)
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.services.poller import Poller
from app.services.processor import (
    PROCESS_STATUS_LEASE_HELD,
    Processor,
)

from .conftest import build_settings
from .test_main import _build_client


def test_lease_held_returns_http_503() -> None:
    client, gmail, _tasks, state = _build_client()
    gmail.add_inbox_message(message_id="m1", thread_id="t1")
    # Hold an active lease far in the future relative to FakeClock epoch.
    now = state._clock.now()
    state.create_record(
        new_queued_record(message_key="m1", thread_id="t1", now=now)
    )
    record = state.get_record("m1")
    assert record is not None
    state._records["m1"] = replace(
        record,
        status=ProcessingStatus.PROCESSING,
        lease_until=now + timedelta(minutes=10),
        lease_owner="other-worker",
        attempt_count=1,
        updated_at=now,
    )
    response = client.post(
        "/internal/process", json={"gmail_message_id": "m1", "thread_id": "t1"}
    )
    assert response.status_code == 503
    assert response.json()["status"] == PROCESS_STATUS_LEASE_HELD


def test_worker_crash_requeues_for_retry() -> None:
    class BoomGmail(InMemoryGmail):
        def fetch_parsed_message(self, ref):  # type: ignore[no-untyped-def]
            raise BrokenPipeError("simulated gmail blip")

    clock = FakeClock()
    settings = build_settings(
        processing_enabled=True,
        processing_mode="public",
        adapter_backend="memory",
        hmac_secret="test-secret",
        max_process_attempts=8,
    )
    gmail = BoomGmail()
    state = InMemoryMessageState(clock=clock)
    state.create_record(
        new_queued_record(message_key="m1", thread_id="t1", now=clock.now())
    )
    processor = Processor(
        settings=settings,
        state=state,
        gmail=gmail,
        rate_limit=InMemoryRateLimit(),
        daily_usage=InMemoryDailyUsage(),
        llm=None,  # type: ignore[arg-type]
        clock=clock,
    )
    try:
        processor.run(gmail_message_id="m1", thread_id="t1")
        raise AssertionError("expected BrokenPipeError")
    except BrokenPipeError:
        pass
    record = state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.QUEUED
    assert record.lease_until is None
    assert record.last_error_code and record.last_error_code.startswith("crash:")


def test_poller_recovers_expired_processing_lease() -> None:
    clock = FakeClock()
    settings = build_settings(
        processing_enabled=True,
        processing_mode="public",
        adapter_backend="memory",
        hmac_secret="test-secret",
    )
    gmail = InMemoryGmail()
    tasks = InMemoryTaskQueue()
    state = InMemoryMessageState(clock=clock)
    now = clock.now()
    state.create_record(
        new_queued_record(message_key="stuck", thread_id="t-stuck", now=now)
    )
    record = state.get_record("stuck")
    assert record is not None
    state._records["stuck"] = replace(
        record,
        status=ProcessingStatus.PROCESSING,
        lease_until=now - timedelta(minutes=1),
        lease_owner="dead-worker",
        attempt_count=1,
        updated_at=now,
    )
    poller = Poller(
        settings=settings,
        gmail=gmail,
        tasks=tasks,
        state=state,
        clock=clock,
    )
    result = poller.run()
    assert result.recovered == 1
    assert task_name_for_message("stuck") in tasks.task_names
