"""Worker lease semantics and Phase 2/3 idempotency (blueprint 7.2, 27.1)."""

from __future__ import annotations

import inspect
import itertools
import threading
from dataclasses import replace

import pytest
from app.config import Settings
from app.domain.lease import LeaseOutcome, evaluate_lease
from app.domain.models import ParsedMessage, ProcessingStatus, new_queued_record
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.services.processor import (
    PROCESS_STATUS_ALREADY_DONE,
    PROCESS_STATUS_DISABLED,
    PROCESS_STATUS_SENT,
    Processor,
)

from .conftest import build_settings, fake_llm_for_responses, make_answer_response

LEASE_SECONDS = 600
HMAC_SECRET = "lease-test-secret"


def enabled_settings(**overrides: object) -> Settings:
    return build_settings(
        processing_enabled=True,
        processing_mode="public",
        lease_duration_seconds=LEASE_SECONDS,
        hmac_secret=HMAC_SECRET,
        **overrides,
    )


def eligible_parsed(message_id: str, thread_id: str) -> ParsedMessage:
    return ParsedMessage(
        message_id=message_id,
        thread_id=thread_id,
        from_address="user@example.com",
        reply_to=None,
        to_addresses=("user@example.com",),
        cc_addresses=(),
        subject="Question",
        body_text="What should I do after a death in Luxembourg?",
        return_path="user@example.com",
    )


class Harness:
    def __init__(self, settings: Settings | None = None, *, prompt_path: str) -> None:
        self.clock = FakeClock()
        self.state = InMemoryMessageState(clock=self.clock)
        self.gmail = InMemoryGmail()
        self.rate_limit = InMemoryRateLimit()
        self.daily_usage = InMemoryDailyUsage()
        self._worker_ids = itertools.count(1)
        self.processor = Processor(
            settings=settings or enabled_settings(prompt_path=prompt_path),
            state=self.state,
            gmail=self.gmail,
            rate_limit=self.rate_limit,
            daily_usage=self.daily_usage,
            llm=fake_llm_for_responses(make_answer_response()),
            clock=self.clock,
            worker_id_factory=lambda: f"worker-{next(self._worker_ids)}",
        )

    def seed_eligible(self, message_id: str = "m1", thread_id: str = "t1") -> None:
        self.state.create_record(
            new_queued_record(
                message_key=message_id, thread_id=thread_id, now=self.clock.now()
            )
        )
        self.gmail.seed_parsed_message(eligible_parsed(message_id, thread_id))


@pytest.fixture
def harness(synthetic_prompt: str) -> Harness:
    h = Harness(prompt_path=synthetic_prompt)
    h.seed_eligible()
    return h


def test_acquiring_the_lease_completes_with_sent_status(harness: Harness) -> None:
    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_SENT
    assert result.attempt_count == 1
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.SENT


def test_worker_creates_the_record_when_the_poll_record_is_missing(
    synthetic_prompt: str,
) -> None:
    harness = Harness(prompt_path=synthetic_prompt)
    harness.gmail.seed_parsed_message(eligible_parsed("m1", "t1"))

    result = harness.processor.run(gmail_message_id="m1", thread_id="t1")

    assert result.status == PROCESS_STATUS_SENT
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.thread_id == "t1"


def test_second_worker_cannot_reprocess_after_successful_send(
    harness: Harness,
) -> None:
    first = harness.processor.run(gmail_message_id="m1")
    second = harness.processor.run(gmail_message_id="m1")

    assert first.status == PROCESS_STATUS_SENT
    assert second.status == PROCESS_STATUS_ALREADY_DONE


def test_concurrent_workers_produce_exactly_one_lease_holder(harness: Harness) -> None:
    worker_count = 12
    barrier = threading.Barrier(worker_count)
    results: list[str] = []
    lock = threading.Lock()

    def attempt() -> None:
        barrier.wait()
        outcome = harness.processor.run(gmail_message_id="m1")
        with lock:
            results.append(outcome.status)

    threads = [threading.Thread(target=attempt) for _ in range(worker_count)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert results.count(PROCESS_STATUS_SENT) == 1
    assert harness.gmail.send_reply_calls == 1
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.attempt_count == 1


def test_expired_lease_is_recovered_by_the_next_worker(
    synthetic_prompt: str,
) -> None:
    harness = Harness(prompt_path=synthetic_prompt)
    harness.seed_eligible(message_id="m2", thread_id="t2")
    harness.state.try_acquire_lease(
        "m2", worker_id="worker-stuck", lease_duration_seconds=LEASE_SECONDS
    )

    harness.clock.advance(LEASE_SECONDS + 1)
    recovered = harness.processor.run(gmail_message_id="m2")

    assert recovered.status == PROCESS_STATUS_SENT
    assert recovered.attempt_count == 2
    record = harness.state.get_record("m2")
    assert record is not None
    assert record.status is ProcessingStatus.SENT


@pytest.mark.parametrize(
    "status",
    [
        ProcessingStatus.SENT,
        ProcessingStatus.IGNORED,
        ProcessingStatus.RATE_LIMITED,
        ProcessingStatus.FAILED,
    ],
)
def test_terminal_messages_cannot_be_leased_again(
    harness: Harness, status: ProcessingStatus
) -> None:
    harness.seed_eligible()
    harness.state.mark_status("m1", status)

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_ALREADY_DONE
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is status


def test_a_message_with_an_outbound_reply_is_never_reprocessed(
    synthetic_prompt: str,
) -> None:
    """Guards the case where the send succeeded but the status update was lost."""
    harness = Harness(prompt_path=synthetic_prompt)
    harness.state.create_record(
        replace(
            new_queued_record(
                message_key="m1", thread_id="t1", now=harness.clock.now()
            ),
            sent_gmail_message_id="sent-1",
        )
    )

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_ALREADY_DONE


@pytest.mark.parametrize(
    ("processing_enabled", "processing_mode"),
    [(False, "public"), (True, "disabled")],
)
def test_disabled_switches_stop_the_worker(
    processing_enabled: bool, processing_mode: str, synthetic_prompt: str
) -> None:
    harness = Harness(
        build_settings(
            processing_enabled=processing_enabled,
            processing_mode=processing_mode,
            prompt_path=synthetic_prompt,
        ),
        prompt_path=synthetic_prompt,
    )

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_DISABLED
    assert harness.state.get_record("m1") is None


def test_processor_wires_gmail_rate_limit_and_llm_ports() -> None:
    parameters = set(inspect.signature(Processor.__init__).parameters)
    assert "gmail" in parameters
    assert "rate_limit" in parameters
    assert "daily_usage" in parameters
    assert "llm" in parameters


def test_missing_record_yields_a_failed_status(synthetic_prompt: str) -> None:
    """A record deleted between creation and lease must not crash the worker."""

    class VanishingState(InMemoryMessageState):
        def create_record(self, record: object) -> bool:
            return True

    clock = FakeClock()
    settings = enabled_settings(prompt_path=synthetic_prompt)
    processor = Processor(
        settings=settings,
        state=VanishingState(clock=clock),
        gmail=InMemoryGmail(),
        rate_limit=InMemoryRateLimit(),
        daily_usage=InMemoryDailyUsage(),
        llm=fake_llm_for_responses(make_answer_response()),
        clock=clock,
    )

    assert processor.run(gmail_message_id="ghost").status == "failed"


def test_evaluate_lease_reports_not_found_for_missing_records() -> None:
    decision = evaluate_lease(
        None, now=FakeClock().now(), worker_id="w", lease_duration_seconds=60
    )
    assert decision.outcome is LeaseOutcome.NOT_FOUND
    assert decision.acquired is False
    assert decision.record is None


def test_mark_status_on_unknown_key_returns_none(harness: Harness) -> None:
    assert harness.state.mark_status("nope", ProcessingStatus.FAILED) is None


def test_mark_status_records_an_error_code_and_clears_the_lease(
    harness: Harness,
) -> None:
    harness.processor.run(gmail_message_id="m1")

    updated = harness.state.mark_status(
        "m1", ProcessingStatus.FAILED, error_code="transient_upstream"
    )

    assert updated is not None
    assert updated.last_error_code == "transient_upstream"
    assert updated.lease_until is None
    assert updated.lease_owner is None
