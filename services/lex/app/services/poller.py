"""Inbox discovery: create one durable task per new message (blueprint 6).

The poll request never does model work. For each eligible message it writes the
Firestore record, creates a deterministically named task, and applies
``LEX_PENDING``. Repeating the poll is harmless: the label removes the message
from the query, the record key is the Gmail message ID, and the task name is
deterministic, so a duplicate create is reported as ``ALREADY_EXISTS``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.domain.ids import message_key
from app.domain.labels import LEX_PENDING
from app.domain.models import GmailMessageRef, ProcessingStatus, new_queued_record
from app.domain.ports import (
    ClockPort,
    EnqueueOutcome,
    GmailPort,
    MessageStatePort,
    TaskQueuePort,
)
from app.logging import get_logger, log_event

if TYPE_CHECKING:
    from app.config import Settings

_logger = get_logger("lex.poller")

POLL_STATUS_DISABLED = "disabled"
POLL_STATUS_COMPLETED = "completed"


@dataclass(frozen=True, slots=True)
class PollResult:
    """Counts only. No identifiers of people and no message content."""

    status: str
    discovered: int = 0
    enqueued: int = 0
    already_pending: int = 0
    failed: int = 0

    def as_dict(self) -> dict[str, int | str]:
        return {
            "status": self.status,
            "discovered": self.discovered,
            "enqueued": self.enqueued,
            "already_pending": self.already_pending,
            "failed": self.failed,
        }


class Poller:
    """Discovers eligible inbox messages and schedules processing."""

    def __init__(
        self,
        *,
        settings: Settings,
        gmail: GmailPort,
        tasks: TaskQueuePort,
        state: MessageStatePort,
        clock: ClockPort,
    ) -> None:
        self._settings = settings
        self._gmail = gmail
        self._tasks = tasks
        self._state = state
        self._clock = clock

    @property
    def enabled(self) -> bool:
        """Both operational switches must allow work (blueprint 26.6)."""
        return (
            self._settings.processing_enabled
            and self._settings.processing_mode != "disabled"
        )

    def run(self) -> PollResult:
        if not self.enabled:
            log_event(_logger, "poll_skipped", status=POLL_STATUS_DISABLED)
            return PollResult(status=POLL_STATUS_DISABLED)

        self._gmail.ensure_labels()
        refs = self._gmail.list_eligible_message_refs(
            max_results=self._settings.poll_max_results
        )

        enqueued = 0
        already_pending = 0
        failed = 0
        for ref in refs:
            try:
                outcome = self._discover(ref)
            except Exception:
                # One unhealthy message must not stop discovery of the rest.
                # The exception text may contain provider detail, so only a
                # stable code is logged.
                failed += 1
                log_event(
                    _logger,
                    "poll_message_failed",
                    gmail_message_id=ref.message_id,
                    gmail_thread_id=ref.thread_id,
                    error_code="poll_message_failed",
                )
                continue
            if outcome is EnqueueOutcome.CREATED:
                enqueued += 1
            else:
                already_pending += 1

        result = PollResult(
            status=POLL_STATUS_COMPLETED,
            discovered=len(refs),
            enqueued=enqueued,
            already_pending=already_pending,
            failed=failed,
        )
        log_event(_logger, "poll_completed", status=POLL_STATUS_COMPLETED)
        return result

    def _discover(self, ref: GmailMessageRef) -> EnqueueOutcome:
        key = message_key(ref.message_id)
        if self._state.get_record(key) is None:
            self._state.create_record(
                new_queued_record(
                    message_key=key,
                    thread_id=ref.thread_id,
                    now=self._clock.now(),
                )
            )
        outcome = self._tasks.enqueue_process(ref)
        self._gmail.add_label(message_id=ref.message_id, label=LEX_PENDING)
        log_event(
            _logger,
            "message_discovered",
            gmail_message_id=ref.message_id,
            gmail_thread_id=ref.thread_id,
            status=ProcessingStatus.QUEUED.value,
        )
        return outcome


__all__ = ["PollResult", "Poller", "POLL_STATUS_DISABLED", "POLL_STATUS_COMPLETED"]
