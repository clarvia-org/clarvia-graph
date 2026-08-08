"""Global daily LLM usage and circuit breaker (blueprint 11.4, 23.3)."""

from __future__ import annotations

import threading
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING, Any, Protocol, cast, runtime_checkable

from app.infrastructure.dependencies import require_module
from app.infrastructure.rate_limit import (
    ENVIRONMENTS_COLLECTION,
    luxembourg_calendar_day,
)
from app.ops.alerts import emit_alert
from app.ops.ttl import daily_usage_expires_at

if TYPE_CHECKING:
    from app.config import Settings
    from app.domain.ports import ClockPort

DAILY_USAGE_COLLECTION = "daily_usage"


@dataclass(frozen=True, slots=True)
class CircuitDecision:
    """Whether an LLM call may proceed under the global daily budget."""

    allowed: bool
    reason: str
    llm_calls: int = 0


@runtime_checkable
class DailyUsagePort(Protocol):
    """Tracks global daily LLM usage and the emergency circuit breaker."""

    def try_consume_llm_call(
        self,
        *,
        now: datetime,
        global_limit: int,
        force_open: bool = False,
    ) -> CircuitDecision: ...

    def record_email_sent(self, *, now: datetime) -> None: ...

    def increment_failures(self, *, now: datetime) -> None: ...

    def sweep_expired(self, *, now: datetime) -> int: ...


def daily_usage_document_path(environment: str, calendar_day: str) -> str:
    return (
        f"{ENVIRONMENTS_COLLECTION}/{environment}"
        f"/{DAILY_USAGE_COLLECTION}/{calendar_day}"
    )


@dataclass
class _DailyUsageRecord:
    llm_calls: int = 0
    emails_sent: int = 0
    failures: int = 0
    circuit_open: bool = False
    updated_at: datetime | None = None
    expires_at: datetime | None = None


class InMemoryDailyUsage:
    """In-memory daily usage store for local runs and unit tests."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._records: dict[str, _DailyUsageRecord] = {}

    def _key(self, now: datetime) -> str:
        return luxembourg_calendar_day(now)

    def _record(self, now: datetime) -> _DailyUsageRecord:
        key = self._key(now)
        with self._lock:
            record = self._records.setdefault(key, _DailyUsageRecord())
            if record.expires_at is None:
                record.expires_at = daily_usage_expires_at(now)
            return record

    def try_consume_llm_call(
        self,
        *,
        now: datetime,
        global_limit: int,
        force_open: bool = False,
    ) -> CircuitDecision:
        with self._lock:
            record = self._record(now)
            if force_open or record.circuit_open:
                return CircuitDecision(
                    allowed=False,
                    reason="circuit_open",
                    llm_calls=record.llm_calls,
                )
            if record.llm_calls >= global_limit:
                record.circuit_open = True
                record.updated_at = now
                emit_alert(
                    "circuit_open",
                    severity="critical",
                    error_code="global_llm_budget_reached",
                )
                return CircuitDecision(
                    allowed=False,
                    reason="budget_exceeded",
                    llm_calls=record.llm_calls,
                )
            record.llm_calls += 1
            record.updated_at = now
            return CircuitDecision(
                allowed=True,
                reason="ok",
                llm_calls=record.llm_calls,
            )

    def record_email_sent(self, *, now: datetime) -> None:
        with self._lock:
            record = self._record(now)
            record.emails_sent += 1
            record.updated_at = now

    def increment_failures(self, *, now: datetime) -> None:
        with self._lock:
            record = self._record(now)
            record.failures += 1
            record.updated_at = now

    def set_circuit_open(self, *, now: datetime, open: bool) -> None:
        """Ops kill switch stored in the daily usage record."""
        with self._lock:
            record = self._record(now)
            record.circuit_open = open
            record.updated_at = now
            if open:
                emit_alert("circuit_open", severity="critical", error_code="forced")

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

    def get_record(self, *, now: datetime) -> _DailyUsageRecord:
        with self._lock:
            return self._records.get(self._key(now), _DailyUsageRecord())


class FirestoreDailyUsage:
    """Firestore-backed daily usage store (blueprint 23.3)."""

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
            firestore = require_module("google.cloud.firestore")
            self._client = firestore.Client(
                project=self._settings.gcp_project_id,
                database=self._settings.firestore_database,
            )
        return self._client

    @property
    def transactional(self) -> Callable[..., Any]:
        if self._transactional is None:  # pragma: no cover - needs the SDK
            firestore = require_module("google.cloud.firestore")
            return cast(Callable[..., Any], firestore.transactional)
        return self._transactional

    def _document(self, now: datetime) -> Any:
        day = luxembourg_calendar_day(now)
        path = daily_usage_document_path(self._settings.environment, day)
        return self.client.document(path)

    def try_consume_llm_call(
        self,
        *,
        now: datetime,
        global_limit: int,
        force_open: bool = False,
    ) -> CircuitDecision:
        document = self._document(now)

        def apply(transaction: Any) -> CircuitDecision:
            snapshot = document.get(transaction=transaction)
            data = snapshot.to_dict() if snapshot.exists else {}
            llm_calls = int(data.get("llm_calls", 0))
            circuit_open = bool(data.get("circuit_open", False))
            if force_open or circuit_open:
                return CircuitDecision(
                    allowed=False,
                    reason="circuit_open",
                    llm_calls=llm_calls,
                )
            if llm_calls >= global_limit:
                transaction.set(
                    document,
                    {
                        "llm_calls": llm_calls,
                        "circuit_open": True,
                        "updated_at": now,
                        "expires_at": daily_usage_expires_at(now),
                    },
                    merge=True,
                )
                emit_alert(
                    "circuit_open",
                    severity="critical",
                    error_code="global_llm_budget_reached",
                )
                return CircuitDecision(
                    allowed=False,
                    reason="budget_exceeded",
                    llm_calls=llm_calls,
                )
            new_count = llm_calls + 1
            transaction.set(
                document,
                {
                    "llm_calls": new_count,
                    "updated_at": now,
                    "expires_at": daily_usage_expires_at(now),
                },
                merge=True,
            )
            return CircuitDecision(
                allowed=True,
                reason="ok",
                llm_calls=new_count,
            )

        run_in_transaction = self.transactional(apply)
        result: CircuitDecision = run_in_transaction(self.client.transaction())
        return result

    def record_email_sent(self, *, now: datetime) -> None:
        document = self._document(now)
        document.set(
            {
                "emails_sent": self._increment_field(document, "emails_sent"),
                "updated_at": now,
                "expires_at": daily_usage_expires_at(now),
            },
            merge=True,
        )

    def increment_failures(self, *, now: datetime) -> None:
        document = self._document(now)
        document.set(
            {
                "failures": self._increment_field(document, "failures"),
                "updated_at": now,
                "expires_at": daily_usage_expires_at(now),
            },
            merge=True,
        )

    def sweep_expired(self, *, now: datetime) -> int:
        collection = self.client.collection(
            f"{ENVIRONMENTS_COLLECTION}/{self._settings.environment}"
            f"/{DAILY_USAGE_COLLECTION}"
        )
        query = collection.where("expires_at", "<=", now)
        deleted = 0
        for snapshot in query.stream():
            snapshot.reference.delete()
            deleted += 1
        return deleted

    @staticmethod
    def _increment_field(document: Any, field: str) -> int:
        snapshot = document.get()
        current = 0
        if snapshot.exists:
            data = snapshot.to_dict() or {}
            current = int(data.get(field, 0))
        return current + 1


__all__ = [
    "CircuitDecision",
    "DailyUsagePort",
    "daily_usage_document_path",
    "InMemoryDailyUsage",
    "FirestoreDailyUsage",
]
