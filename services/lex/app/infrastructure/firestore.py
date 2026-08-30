"""Firestore message-state adapter (blueprint 7.1, 7.2, 23.1).

Documents live at ``environments/{environment}/messages/{gmailMessageId}`` and
hold operational metadata only — never bodies, subjects, names, or addresses.
The sender is represented by an HMAC and the audience by a count.

The lease is taken inside a Firestore transaction, but the decision itself
comes from :func:`app.domain.lease.evaluate_lease`, so the in-memory backend
and Firestore cannot drift apart. The client and the ``transactional``
decorator are injectable, which keeps the mapping and transaction body
unit-testable without credentials or network access.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from app.domain.lease import LeaseDecision, evaluate_lease
from app.domain.models import LexAction, ProcessingRecord, ProcessingStatus
from app.domain.ports import ClockPort
from app.infrastructure.dependencies import require_module
from app.infrastructure.google_errors import is_already_exists
from app.ops.ttl import message_expires_at

if TYPE_CHECKING:
    from app.config import Settings

ENVIRONMENTS_COLLECTION = "environments"
MESSAGES_COLLECTION = "messages"


def document_path(environment: str, message_key: str) -> str:
    """Firestore path for one message record (blueprint 7.1)."""
    return (
        f"{ENVIRONMENTS_COLLECTION}/{environment}"
        f"/{MESSAGES_COLLECTION}/{message_key}"
    )


def record_to_document(record: ProcessingRecord) -> dict[str, Any]:
    """Map a record to its stored fields. The message key stays the doc ID."""
    return {
        "thread_id": record.thread_id,
        "status": record.status.value,
        "discovered_at": record.discovered_at,
        "updated_at": record.updated_at,
        "lease_until": record.lease_until,
        "lease_owner": record.lease_owner,
        "attempt_count": record.attempt_count,
        "llm_call_count": record.llm_call_count,
        "sender_hmac": record.sender_hmac,
        "visible_recipient_count": record.visible_recipient_count,
        "action": record.action.value if record.action else None,
        "language": record.language,
        "model": record.model,
        "prompt_version": record.prompt_version,
        "schema_version": record.schema_version,
        "pipeline_version": record.pipeline_version,
        "writer_fallback_used": record.writer_fallback_used,
        "openai_response_id": record.openai_response_id,
        "outbound_message_id": record.outbound_message_id,
        "sent_gmail_message_id": record.sent_gmail_message_id,
        "last_error_code": record.last_error_code,
        "expires_at": record.expires_at,
    }


def _as_datetime(value: Any) -> datetime | None:
    if not isinstance(value, datetime):
        return None
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def document_to_record(message_key: str, data: dict[str, Any]) -> ProcessingRecord:
    """Map stored fields back to a record, tolerating older documents."""
    discovered_at = _as_datetime(data.get("discovered_at")) or datetime.now(UTC)
    action_value = data.get("action")
    return ProcessingRecord(
        message_key=message_key,
        thread_id=str(data.get("thread_id") or ""),
        status=ProcessingStatus(data.get("status", ProcessingStatus.QUEUED.value)),
        discovered_at=discovered_at,
        updated_at=_as_datetime(data.get("updated_at")) or discovered_at,
        lease_until=_as_datetime(data.get("lease_until")),
        lease_owner=data.get("lease_owner"),
        attempt_count=int(data.get("attempt_count", 0)),
        llm_call_count=int(data.get("llm_call_count", 0)),
        sender_hmac=str(data.get("sender_hmac") or ""),
        visible_recipient_count=int(data.get("visible_recipient_count", 0)),
        action=LexAction(action_value) if action_value else None,
        language=data.get("language"),
        model=data.get("model"),
        prompt_version=data.get("prompt_version"),
        schema_version=data.get("schema_version"),
        pipeline_version=data.get("pipeline_version"),
        writer_fallback_used=data.get("writer_fallback_used"),
        openai_response_id=data.get("openai_response_id"),
        outbound_message_id=data.get("outbound_message_id"),
        sent_gmail_message_id=data.get("sent_gmail_message_id"),
        last_error_code=data.get("last_error_code"),
        expires_at=_as_datetime(data.get("expires_at")),
    )


def build_firestore_client(settings: Settings) -> Any:  # pragma: no cover - needs GCP
    """Build a Firestore client for the configured regional database."""
    firestore = require_module("google.cloud.firestore")
    return firestore.Client(
        project=settings.gcp_project_id, database=settings.firestore_database
    )


def _default_transactional() -> Callable[..., Any]:  # pragma: no cover - needs GCP
    firestore = require_module("google.cloud.firestore")
    transactional: Callable[..., Any] = firestore.transactional
    return transactional


class FirestoreMessageState:
    """Implements :class:`app.domain.ports.MessageStatePort` on Firestore."""

    def __init__(
        self,
        *,
        settings: Settings,
        clock: ClockPort,
        client: Any | None = None,
        transactional: Callable[..., Any] | None = None,
    ) -> None:
        self._settings = settings
        self._clock = clock
        self._client = client
        self._transactional = transactional

    @property
    def client(self) -> Any:
        if self._client is None:  # pragma: no cover - needs GCP credentials
            self._client = build_firestore_client(self._settings)
        return self._client

    @property
    def transactional(self) -> Callable[..., Any]:
        if self._transactional is None:  # pragma: no cover - needs the SDK
            self._transactional = _default_transactional()
        return self._transactional

    def document(self, message_key: str) -> Any:
        return self.client.document(
            document_path(self._settings.environment, message_key)
        )

    def get_record(self, message_key: str) -> ProcessingRecord | None:
        return self._snapshot_to_record(message_key, self.document(message_key).get())

    def create_record(self, record: ProcessingRecord) -> bool:
        payload = record_to_document(record)
        if record.expires_at is None:
            payload["expires_at"] = message_expires_at(
                record.discovered_at, record.status
            )
        try:
            self.document(record.message_key).create(payload)
        except Exception as exc:
            if is_already_exists(exc):
                return False
            raise
        return True

    def try_acquire_lease(
        self,
        message_key: str,
        *,
        worker_id: str,
        lease_duration_seconds: int,
    ) -> LeaseDecision:
        document = self.document(message_key)
        now = self._clock.now()

        def apply(transaction: Any) -> LeaseDecision:
            record = self._snapshot_to_record(
                message_key, document.get(transaction=transaction)
            )
            decision = evaluate_lease(
                record,
                now=now,
                worker_id=worker_id,
                lease_duration_seconds=lease_duration_seconds,
            )
            if decision.acquired and decision.record is not None:
                leased = decision.record
                transaction.update(
                    document,
                    {
                        "status": leased.status.value,
                        "lease_until": leased.lease_until,
                        "lease_owner": leased.lease_owner,
                        "attempt_count": leased.attempt_count,
                        "updated_at": leased.updated_at,
                    },
                )
            return decision

        # Applied without decorator syntax so the SDK's untyped decorator does
        # not erase this method's types under mypy strict.
        run_in_transaction = self.transactional(apply)
        result: LeaseDecision = run_in_transaction(self.client.transaction())
        return result

    def mark_status(
        self,
        message_key: str,
        status: ProcessingStatus,
        *,
        error_code: str | None = None,
    ) -> ProcessingRecord | None:
        document = self.document(message_key)
        existing = self._snapshot_to_record(message_key, document.get())
        if existing is None:
            return None
        now = self._clock.now()
        updates: dict[str, Any] = {
            "status": status.value,
            "updated_at": now,
            "lease_until": None,
            "lease_owner": None,
            "expires_at": message_expires_at(now, status),
        }
        if error_code:
            updates["last_error_code"] = error_code
        document.update(updates)
        return document_to_record(
            message_key, {**record_to_document(existing), **updates}
        )

    def update_metadata(
        self,
        message_key: str,
        *,
        sender_hmac: str | None = None,
        visible_recipient_count: int | None = None,
        llm_call_count: int | None = None,
    ) -> ProcessingRecord | None:
        document = self.document(message_key)
        existing = self._snapshot_to_record(message_key, document.get())
        if existing is None:
            return None
        now = self._clock.now()
        updates: dict[str, Any] = {"updated_at": now}
        if sender_hmac is not None:
            updates["sender_hmac"] = sender_hmac
        if visible_recipient_count is not None:
            updates["visible_recipient_count"] = visible_recipient_count
        if llm_call_count is not None:
            updates["llm_call_count"] = llm_call_count
        document.update(updates)
        return document_to_record(
            message_key, {**record_to_document(existing), **updates}
        )

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
        document = self.document(message_key)
        existing = self._snapshot_to_record(message_key, document.get())
        if existing is None:
            return None
        now = self._clock.now()
        updates: dict[str, Any] = {
            "status": ProcessingStatus.SENT.value,
            "action": action.value,
            "language": language,
            "openai_response_id": openai_response_id,
            "outbound_message_id": outbound_message_id,
            "sent_gmail_message_id": sent_gmail_message_id,
            "model": model,
            "prompt_version": prompt_version,
            "schema_version": schema_version,
            "pipeline_version": pipeline_version,
            "writer_fallback_used": writer_fallback_used,
            "updated_at": now,
            "lease_until": None,
            "lease_owner": None,
            "expires_at": message_expires_at(now, ProcessingStatus.SENT),
        }
        document.update(updates)
        return document_to_record(
            message_key, {**record_to_document(existing), **updates}
        )

    @staticmethod
    def _snapshot_to_record(message_key: str, snapshot: Any) -> ProcessingRecord | None:
        if snapshot is None or not getattr(snapshot, "exists", False):
            return None
        data = snapshot.to_dict() or {}
        return document_to_record(message_key, data)

    def sweep_expired(self, *, now: datetime) -> int:
        collection = self.client.collection(
            f"{ENVIRONMENTS_COLLECTION}/{self._settings.environment}"
            f"/{MESSAGES_COLLECTION}"
        )
        query = collection.where("expires_at", "<=", now)
        deleted = 0
        for snapshot in query.stream():
            snapshot.reference.delete()
            deleted += 1
        return deleted

    def list_expired_processing_leases(
        self, *, now: datetime, limit: int = 50
    ) -> list[ProcessingRecord]:
        collection = self.client.collection(
            f"{ENVIRONMENTS_COLLECTION}/{self._settings.environment}"
            f"/{MESSAGES_COLLECTION}"
        )
        # Filter in Python to avoid requiring a composite index for
        # status + lease_until. Volume of in-flight processing is small.
        recovered: list[ProcessingRecord] = []
        query = collection.where("status", "==", ProcessingStatus.PROCESSING.value)
        for snapshot in query.stream():
            record = document_to_record(snapshot.id, snapshot.to_dict() or {})
            if record.lease_until is None or record.lease_until > now:
                continue
            recovered.append(record)
            if len(recovered) >= limit:
                break
        return recovered


__all__ = [
    "document_path",
    "record_to_document",
    "document_to_record",
    "build_firestore_client",
    "FirestoreMessageState",
]
