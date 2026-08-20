"""Port interfaces (Protocols) for external systems.

The domain never imports a concrete SDK. Phase 2 implements discovery, durable
task creation, and message state; parsing, model calls, and sending remain
deferred and their stubs raise ``NotImplementedForPhase``.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Protocol, runtime_checkable

from app.domain.lease import LeaseDecision
from app.domain.models import (
    GmailMessageRef,
    LexAction,
    ParsedMessage,
    ProcessingRecord,
    ProcessingStatus,
)
from app.llm.schema import LexResponse


class EnqueueOutcome(str, Enum):
    """Whether a durable task was newly created or already existed.

    An existing task is a success, not an error: the deterministic task name
    means the work is already scheduled exactly once.
    """

    CREATED = "created"
    ALREADY_EXISTS = "already_exists"


@runtime_checkable
class GmailPort(Protocol):
    """Gmail access (never accepts an impersonated mailbox from a request)."""

    def ensure_labels(self) -> None:
        """Create any missing Lex lifecycle labels."""
        ...

    def list_eligible_message_refs(self, *, max_results: int) -> list[GmailMessageRef]:
        """Inbox messages carrying none of the Lex lifecycle labels."""
        ...

    def add_label(self, *, message_id: str, label: str) -> None: ...

    def fetch_parsed_message(self, ref: GmailMessageRef) -> ParsedMessage: ...

    def fetch_thread_parsed_messages(
        self, *, thread_id: str
    ) -> list[ParsedMessage]:
        """Return thread messages in chronological order (Gmail source of truth)."""
        ...

    def insert_inbound(self, *, raw_message: str) -> GmailMessageRef:
        """Insert base64url MIME into the Lex mailbox as a new inbound message.

        ``raw_message`` is Gmail API ``raw`` (same encoding as send). Used for
        clarvia.org Ask us intake. Does not send SMTP as the visitor.
        """
        ...

    def send_reply(
        self,
        *,
        raw_message: str,
        thread_id: str | None,
    ) -> str:
        """Send a MIME message via Gmail API ``users.messages.send``.

        ``raw_message`` must be the base64url string returned by
        :func:`app.email.composition.encode_for_gmail_api` — it is passed to
        the API ``raw`` field without further encoding.

        When ``thread_id`` is ``None`` or empty, the message is sent as a
        stand-alone mail (no Gmail ``threadId``), used for daily-limit notices.
        """
        ...

    def find_outbound_in_thread(
        self,
        *,
        thread_id: str,
        outbound_message_id: str,
        request_id: str,
    ) -> str | None:
        """Return Gmail message id if an outbound Lex reply already exists."""
        ...

    def sweep_expired_threads(self, *, now: datetime) -> int:
        """Move expired threads to Trash when retention is enabled; else no-op."""
        ...


@runtime_checkable
class TaskQueuePort(Protocol):
    """Durable task creation with deterministic, idempotent task names."""

    def enqueue_process(self, ref: GmailMessageRef) -> EnqueueOutcome: ...


@runtime_checkable
class MessageStatePort(Protocol):
    """Idempotent per-message state store."""

    def get_record(self, message_key: str) -> ProcessingRecord | None: ...

    def create_record(self, record: ProcessingRecord) -> bool:
        """Create the record; return ``False`` when one already exists."""
        ...

    def try_acquire_lease(
        self,
        message_key: str,
        *,
        worker_id: str,
        lease_duration_seconds: int,
    ) -> LeaseDecision:
        """Atomically take the processing lease when the rules allow it."""
        ...

    def mark_status(
        self,
        message_key: str,
        status: ProcessingStatus,
        *,
        error_code: str | None = None,
    ) -> ProcessingRecord | None: ...

    def update_metadata(
        self,
        message_key: str,
        *,
        sender_hmac: str | None = None,
        visible_recipient_count: int | None = None,
    ) -> ProcessingRecord | None: ...

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
    ) -> ProcessingRecord | None: ...

    def sweep_expired(self, *, now: datetime) -> int:
        """Delete metadata records whose ``expires_at`` is in the past."""
        ...

    def list_expired_processing_leases(
        self, *, now: datetime, limit: int = 50
    ) -> list[ProcessingRecord]:
        """Return non-terminal processing records whose lease has expired.

        Used to re-enqueue work that crashed after acquiring a lease when Cloud
        Tasks stopped retrying (for example after a mistaken 2xx on lease_held).
        """
        ...


@dataclass(frozen=True, slots=True)
class LlmGenerationResult:
    """Structured model output plus operational web-search evidence."""

    response: LexResponse
    openai_response_id: str | None
    web_search_source_urls: frozenset[str]
    web_search_calls: int


@dataclass(frozen=True, slots=True)
class StructuredLlmResult:
    """Raw structured JSON payload plus web-search evidence."""

    data: dict[str, object]
    openai_response_id: str | None
    web_search_source_urls: frozenset[str]
    web_search_calls: int


@runtime_checkable
class LlmPort(Protocol):
    """Structured Lex response generation."""

    def generate(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        force_web_search: bool = False,
    ) -> LlmGenerationResult: ...

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
    ) -> StructuredLlmResult: ...


@runtime_checkable
class ClockPort(Protocol):
    """Time source, injectable for deterministic tests."""

    def now(self) -> datetime: ...


__all__ = [
    "EnqueueOutcome",
    "GmailPort",
    "TaskQueuePort",
    "MessageStatePort",
    "LlmGenerationResult",
    "StructuredLlmResult",
    "LlmPort",
    "ClockPort",
]
