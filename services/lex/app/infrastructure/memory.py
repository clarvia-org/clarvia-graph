"""In-memory adapters: the default local backend and the unit-test doubles.

These implementations are deliberately faithful rather than convenient. The
state store applies the same lease rule as Firestore under a lock, so a
concurrency test exercises real semantics instead of a simplification.

The Gmail double stores raw MIME for parsing tests and records outbound sends
with decoded headers for thread idempotency checks.
"""

from __future__ import annotations

import base64
import threading
from dataclasses import dataclass, replace
from datetime import datetime
from email import message_from_bytes
from email.policy import default as default_policy

from app.domain.errors import GmailSendUncertainError
from app.domain.ids import task_name_for_message
from app.domain.labels import INBOX_LABEL, LEX_LABELS
from app.domain.lease import LeaseDecision, LeaseOutcome, evaluate_lease
from app.domain.models import (
    GmailMessageRef,
    LexAction,
    ParsedMessage,
    ProcessingRecord,
    ProcessingStatus,
)
from app.domain.ports import ClockPort, EnqueueOutcome
from app.email.parsing import ParseLimits, parse_raw_message
from app.infrastructure.clock import SystemClock
from app.ops.ttl import message_expires_at


@dataclass(frozen=True, slots=True)
class SentOutboundMessage:
    """Decoded outbound send metadata for idempotency simulation."""

    gmail_message_id: str
    thread_id: str
    message_id: str | None
    request_id: str | None
    raw: str


class InMemoryGmail:
    """A Gmail double holding message identifiers, MIME, and labels."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._threads: dict[str, str] = {}
        self._labels: dict[str, set[str]] = {}
        self._known_labels: set[str] = set()
        self._raw_messages: dict[str, bytes] = {}
        self._parsed_overrides: dict[str, ParsedMessage] = {}
        self.send_reply_calls = 0
        self.last_sent_raw: str | None = None
        self.sent_messages: list[tuple[str, str]] = []
        self.simulate_timeout_after_accept = False
        self._sent_outbound: list[SentOutboundMessage] = []

    # -- test/local seeding -------------------------------------------------
    def add_inbox_message(
        self, *, message_id: str, thread_id: str, labels: set[str] | None = None
    ) -> GmailMessageRef:
        with self._lock:
            self._threads[message_id] = thread_id
            self._labels[message_id] = {INBOX_LABEL} | (labels or set())
        return GmailMessageRef(message_id=message_id, thread_id=thread_id)

    def seed_raw_message(
        self,
        *,
        message_id: str,
        thread_id: str,
        raw: bytes,
        labels: set[str] | None = None,
    ) -> GmailMessageRef:
        with self._lock:
            self._threads[message_id] = thread_id
            self._labels[message_id] = {INBOX_LABEL} | (labels or set())
            self._raw_messages[message_id] = raw
        return GmailMessageRef(message_id=message_id, thread_id=thread_id)

    def seed_parsed_message(self, parsed: ParsedMessage) -> GmailMessageRef:
        with self._lock:
            self._threads[parsed.message_id] = parsed.thread_id
            self._labels[parsed.message_id] = {INBOX_LABEL}
            self._parsed_overrides[parsed.message_id] = parsed
        return GmailMessageRef(message_id=parsed.message_id, thread_id=parsed.thread_id)

    def labels_for(self, message_id: str) -> set[str]:
        with self._lock:
            return set(self._labels.get(message_id, set()))

    def remove_label(self, *, message_id: str, label: str) -> None:
        """Simulate a lost label update (for example a failed poll)."""
        with self._lock:
            self._labels.get(message_id, set()).discard(label)

    @property
    def created_labels(self) -> set[str]:
        with self._lock:
            return set(self._known_labels)

    # -- GmailPort ----------------------------------------------------------
    def ensure_labels(self) -> None:
        with self._lock:
            self._known_labels.update(LEX_LABELS)

    def list_eligible_message_refs(self, *, max_results: int) -> list[GmailMessageRef]:
        with self._lock:
            eligible = [
                GmailMessageRef(
                    message_id=message_id, thread_id=self._threads[message_id]
                )
                for message_id, labels in self._labels.items()
                if INBOX_LABEL in labels and labels.isdisjoint(LEX_LABELS)
            ]
        return eligible[:max_results]

    def add_label(self, *, message_id: str, label: str) -> None:
        with self._lock:
            self._labels.setdefault(message_id, set()).add(label)

    def fetch_parsed_message(self, ref: GmailMessageRef) -> ParsedMessage:
        with self._lock:
            override = self._parsed_overrides.get(ref.message_id)
            if override is not None:
                return override
            raw = self._raw_messages.get(ref.message_id)
        if raw is None:
            return ParsedMessage(
                message_id=ref.message_id,
                thread_id=ref.thread_id,
                from_address="user@example.com",
                reply_to=None,
                to_addresses=("user@example.com",),
                cc_addresses=(),
                subject="Question",
                body_text="What should I do after a death in Luxembourg?",
                return_path="user@example.com",
            )
        return parse_raw_message(
            raw,
            message_id=ref.message_id,
            thread_id=ref.thread_id,
            limits=ParseLimits(max_body_chars=100_000, max_thread_chars=120_000),
        )

    def fetch_thread_parsed_messages(
        self, *, thread_id: str
    ) -> list[ParsedMessage]:
        with self._lock:
            message_ids = [
                message_id
                for message_id, mapped_thread in self._threads.items()
                if mapped_thread == thread_id
            ]
        # Insertion order of dict keys preserves seed/send chronology in tests.
        return [
            self.fetch_parsed_message(
                GmailMessageRef(message_id=message_id, thread_id=thread_id)
            )
            for message_id in message_ids
        ]

    def send_reply(self, *, raw_message: str, thread_id: str | None) -> str:
        with self._lock:
            self.send_reply_calls += 1
            self.last_sent_raw = raw_message
            resolved_thread = thread_id or ""
            self.sent_messages.append((raw_message, resolved_thread))
            sent_id = f"sent-{self.send_reply_calls}"
            message_id, request_id = _extract_outbound_headers(raw_message)
            self._sent_outbound.append(
                SentOutboundMessage(
                    gmail_message_id=sent_id,
                    thread_id=resolved_thread,
                    message_id=message_id,
                    request_id=request_id,
                    raw=raw_message,
                )
            )
            if resolved_thread:
                padding = "=" * (-len(raw_message) % 4)
                self._raw_messages[sent_id] = base64.urlsafe_b64decode(
                    raw_message + padding
                )
                self._threads[sent_id] = resolved_thread
                self._labels.setdefault(sent_id, set())
            if self.simulate_timeout_after_accept:
                raise GmailSendUncertainError()
        return sent_id

    def find_outbound_in_thread(
        self,
        *,
        thread_id: str,
        outbound_message_id: str,
        request_id: str,
    ) -> str | None:
        with self._lock:
            for item in self._sent_outbound:
                if item.thread_id != thread_id:
                    continue
                if (
                    item.message_id == outbound_message_id
                    or item.request_id == request_id
                ):
                    return item.gmail_message_id
        return None

    def sweep_expired_threads(self, *, now: datetime) -> int:
        """In-memory no-op; production uses the Google adapter when enabled."""
        _ = now
        return 0


def _extract_outbound_headers(raw_message: str) -> tuple[str | None, str | None]:
    try:
        decoded = base64.urlsafe_b64decode(raw_message.encode("ascii"))
    except (ValueError, UnicodeEncodeError):
        return None, None
    message = message_from_bytes(decoded, policy=default_policy)  # type: ignore[arg-type]
    message_id = message.get("Message-ID")
    request_id = message.get("X-Lex-Request-ID")
    return (
        str(message_id) if message_id else None,
        str(request_id) if request_id else None,
    )


class InMemoryTaskQueue:
    """A task queue double keyed by deterministic task name."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._tasks: dict[str, GmailMessageRef] = {}

    @property
    def task_names(self) -> list[str]:
        with self._lock:
            return sorted(self._tasks)

    def enqueue_process(self, ref: GmailMessageRef) -> EnqueueOutcome:
        name = task_name_for_message(ref.message_id)
        with self._lock:
            if name in self._tasks:
                return EnqueueOutcome.ALREADY_EXISTS
            self._tasks[name] = ref
        return EnqueueOutcome.CREATED


class InMemoryMessageState:
    """A state store applying the lease rule atomically under a lock."""

    def __init__(self, *, clock: ClockPort | None = None) -> None:
        self._clock: ClockPort = clock or SystemClock()
        self._lock = threading.RLock()
        self._records: dict[str, ProcessingRecord] = {}

    def get_record(self, message_key: str) -> ProcessingRecord | None:
        with self._lock:
            return self._records.get(message_key)

    def create_record(self, record: ProcessingRecord) -> bool:
        with self._lock:
            if record.message_key in self._records:
                return False
            expires = record.expires_at or message_expires_at(
                self._clock.now(), record.status
            )
            self._records[record.message_key] = replace(record, expires_at=expires)
            return True

    def try_acquire_lease(
        self,
        message_key: str,
        *,
        worker_id: str,
        lease_duration_seconds: int,
    ) -> LeaseDecision:
        with self._lock:
            decision = evaluate_lease(
                self._records.get(message_key),
                now=self._clock.now(),
                worker_id=worker_id,
                lease_duration_seconds=lease_duration_seconds,
            )
            if (
                decision.outcome is LeaseOutcome.ACQUIRED
                and decision.record is not None
            ):
                self._records[message_key] = decision.record
            return decision

    def mark_status(
        self,
        message_key: str,
        status: ProcessingStatus,
        *,
        error_code: str | None = None,
    ) -> ProcessingRecord | None:
        with self._lock:
            existing = self._records.get(message_key)
            if existing is None:
                return None
            updated = replace(
                existing,
                status=status,
                updated_at=self._clock.now(),
                last_error_code=error_code or existing.last_error_code,
                lease_until=None,
                lease_owner=None,
                expires_at=message_expires_at(self._clock.now(), status),
            )
            self._records[message_key] = updated
            return updated

    def update_metadata(
        self,
        message_key: str,
        *,
        sender_hmac: str | None = None,
        visible_recipient_count: int | None = None,
    ) -> ProcessingRecord | None:
        with self._lock:
            existing = self._records.get(message_key)
            if existing is None:
                return None
            updated = replace(
                existing,
                sender_hmac=sender_hmac
                if sender_hmac is not None
                else existing.sender_hmac,
                visible_recipient_count=(
                    visible_recipient_count
                    if visible_recipient_count is not None
                    else existing.visible_recipient_count
                ),
                updated_at=self._clock.now(),
            )
            self._records[message_key] = updated
            return updated

    def record_successful_send(
        self,
        message_key: str,
        *,
        action: LexAction,
        language: str,
        openai_response_id: str | None,
        outbound_message_id: str,
        sent_gmail_message_id: str,
        model: str,
        prompt_version: str,
        schema_version: str,
        pipeline_version: str | None = None,
        writer_fallback_used: bool | None = None,
    ) -> ProcessingRecord | None:
        with self._lock:
            existing = self._records.get(message_key)
            if existing is None:
                return None
            updated = replace(
                existing,
                status=ProcessingStatus.SENT,
                action=action,
                language=language,
                openai_response_id=openai_response_id,
                outbound_message_id=outbound_message_id,
                sent_gmail_message_id=sent_gmail_message_id,
                model=model,
                prompt_version=prompt_version,
                schema_version=schema_version,
                pipeline_version=pipeline_version,
                writer_fallback_used=writer_fallback_used,
                updated_at=self._clock.now(),
                lease_until=None,
                lease_owner=None,
                expires_at=message_expires_at(self._clock.now(), ProcessingStatus.SENT),
            )
            self._records[message_key] = updated
            return updated

    def sweep_expired(self, *, now: datetime) -> int:
        with self._lock:
            expired = [
                key
                for key, record in self._records.items()
                if record.expires_at is not None and record.expires_at <= now
            ]
            for key in expired:
                del self._records[key]
            return len(expired)


__all__ = [
    "SentOutboundMessage",
    "InMemoryGmail",
    "InMemoryTaskQueue",
    "InMemoryMessageState",
]
