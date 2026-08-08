"""Discovery behaviour and poll idempotency (blueprint 6, 27.1)."""

from __future__ import annotations

import pytest
from app.config import Settings
from app.domain.ids import task_name_for_message
from app.domain.labels import LEX_LABELS, LEX_PENDING, eligible_message_query
from app.domain.models import GmailMessageRef, ProcessingStatus
from app.infrastructure.clock import FakeClock
from app.infrastructure.memory import (
    InMemoryGmail,
    InMemoryMessageState,
    InMemoryTaskQueue,
)
from app.services.poller import POLL_STATUS_COMPLETED, POLL_STATUS_DISABLED, Poller

from .conftest import build_settings


def enabled_settings(**overrides: object) -> Settings:
    return build_settings(
        processing_enabled=True, processing_mode="public", **overrides
    )


class Harness:
    def __init__(self, settings: Settings) -> None:
        self.clock = FakeClock()
        self.gmail = InMemoryGmail()
        self.tasks = InMemoryTaskQueue()
        self.state = InMemoryMessageState(clock=self.clock)
        self.poller = Poller(
            settings=settings,
            gmail=self.gmail,
            tasks=self.tasks,
            state=self.state,
            clock=self.clock,
        )


@pytest.fixture
def harness() -> Harness:
    return Harness(enabled_settings())


def test_new_message_creates_exactly_one_task(harness: Harness) -> None:
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")

    result = harness.poller.run()

    assert result.status == POLL_STATUS_COMPLETED
    assert (result.discovered, result.enqueued, result.already_pending) == (1, 1, 0)
    assert harness.tasks.task_names == [task_name_for_message("m1")]


def test_discovery_writes_a_queued_record_without_content(harness: Harness) -> None:
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")

    harness.poller.run()

    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.QUEUED
    assert record.thread_id == "t1"
    assert record.attempt_count == 0
    assert record.lease_until is None
    # Phase 2 has no sender identity or audience yet.
    assert record.sender_hmac == ""
    assert record.visible_recipient_count == 0


def test_discovered_message_is_labelled_pending(harness: Harness) -> None:
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")

    harness.poller.run()

    assert LEX_PENDING in harness.gmail.labels_for("m1")
    assert harness.gmail.created_labels == set(LEX_LABELS)


def test_repeat_poll_creates_no_further_work(harness: Harness) -> None:
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")

    first = harness.poller.run()
    second = harness.poller.run()

    assert first.enqueued == 1
    # The pending label removes the message from the query entirely.
    assert (second.discovered, second.enqueued) == (0, 0)
    assert harness.tasks.task_names == [task_name_for_message("m1")]


def test_repeat_poll_after_lost_label_still_enqueues_once(harness: Harness) -> None:
    """A dropped label must not produce a second task or a second record."""
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")
    harness.poller.run()
    discovered_at = harness.state.get_record("m1")
    assert discovered_at is not None

    harness.gmail.remove_label(message_id="m1", label=LEX_PENDING)
    harness.clock.advance(120)
    second = harness.poller.run()

    assert (second.discovered, second.enqueued, second.already_pending) == (1, 0, 1)
    assert harness.tasks.task_names == [task_name_for_message("m1")]
    unchanged = harness.state.get_record("m1")
    assert unchanged is not None
    assert unchanged.discovered_at == discovered_at.discovered_at


def test_messages_carrying_a_lex_label_are_not_eligible(harness: Harness) -> None:
    harness.gmail.add_inbox_message(
        message_id="done", thread_id="t9", labels={"LEX_PROCESSED"}
    )

    result = harness.poller.run()

    assert result.discovered == 0
    assert harness.tasks.task_names == []


def test_poll_respects_max_results() -> None:
    harness = Harness(enabled_settings(poll_max_results=2))
    for index in range(5):
        harness.gmail.add_inbox_message(message_id=f"m{index}", thread_id="t")

    result = harness.poller.run()

    assert result.discovered == 2
    assert len(harness.tasks.task_names) == 2


@pytest.mark.parametrize(
    ("processing_enabled", "processing_mode"),
    [(False, "public"), (True, "disabled"), (False, "disabled")],
)
def test_disabled_switches_do_no_work(
    processing_enabled: bool, processing_mode: str
) -> None:
    harness = Harness(
        build_settings(
            processing_enabled=processing_enabled, processing_mode=processing_mode
        )
    )
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")

    result = harness.poller.run()

    assert result.status == POLL_STATUS_DISABLED
    assert result.discovered == 0
    assert harness.tasks.task_names == []
    assert harness.state.get_record("m1") is None
    assert harness.gmail.labels_for("m1") == {"INBOX"}


def test_one_bad_message_does_not_stop_the_poll(harness: Harness) -> None:
    harness.gmail.add_inbox_message(message_id="bad", thread_id="t1")
    harness.gmail.add_inbox_message(message_id="good", thread_id="t2")

    original_add_label = harness.gmail.add_label

    def failing_add_label(*, message_id: str, label: str) -> None:
        if message_id == "bad":
            raise RuntimeError("gmail unavailable")
        original_add_label(message_id=message_id, label=label)

    harness.gmail.add_label = failing_add_label  # type: ignore[method-assign]

    result = harness.poller.run()

    assert result.discovered == 2
    assert result.failed == 1
    assert result.enqueued == 1
    assert LEX_PENDING in harness.gmail.labels_for("good")


def test_poll_never_sends_or_parses(harness: Harness) -> None:
    harness.gmail.add_inbox_message(message_id="m1", thread_id="t1")

    harness.poller.run()

    assert harness.gmail.send_reply_calls == 0


def test_eligible_query_excludes_every_lex_label() -> None:
    query = eligible_message_query()
    assert query.startswith("in:inbox")
    for label in LEX_LABELS:
        assert f"-label:{label}" in query


def test_duplicate_enqueue_is_reported_as_already_exists(harness: Harness) -> None:
    ref = GmailMessageRef(message_id="m1", thread_id="t1")

    first = harness.tasks.enqueue_process(ref)
    second = harness.tasks.enqueue_process(ref)

    assert first.value == "created"
    assert second.value == "already_exists"
    assert harness.tasks.task_names == [task_name_for_message("m1")]
