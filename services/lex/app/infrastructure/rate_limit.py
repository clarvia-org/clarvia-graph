"""Per-sender daily rate limiting (blueprint sections 11 and 23.2)."""

from __future__ import annotations

import threading
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING, Any, Protocol, cast, runtime_checkable
from zoneinfo import ZoneInfo

from app.infrastructure.dependencies import require_module
from app.ops.ttl import rate_limit_expires_at

if TYPE_CHECKING:
    from app.config import Settings
    from app.domain.ports import ClockPort

LUXEMBOURG_TZ = ZoneInfo("Europe/Luxembourg")
ENVIRONMENTS_COLLECTION = "environments"
RATE_LIMITS_COLLECTION = "rate_limits"


@dataclass(frozen=True, slots=True)
class RateLimitDecision:
    """Outcome of a model-eligible rate-limit check."""

    allowed: bool
    count: int
    should_send_notice: bool


@runtime_checkable
class RateLimitPort(Protocol):
    """Counts model-eligible accepts per sender HMAC per calendar day."""

    def try_accept_model_eligible(
        self,
        *,
        sender_hmac: str,
        now: datetime,
        daily_limit: int,
    ) -> RateLimitDecision: ...

    def sweep_expired(self, *, now: datetime) -> int:
        """Delete rate-limit records whose ``expires_at`` is in the past."""
        ...


def luxembourg_calendar_day(now: datetime) -> str:
    """Return yyyy-mm-dd for the Europe/Luxembourg calendar day."""
    aware = now.astimezone(LUXEMBOURG_TZ)
    return aware.date().isoformat()


def rate_limit_document_id(calendar_day: str, sender_hmac: str) -> str:
    return f"{calendar_day}_{sender_hmac}"


def rate_limit_document_path(environment: str, document_id: str) -> str:
    return (
        f"{ENVIRONMENTS_COLLECTION}/{environment}"
        f"/{RATE_LIMITS_COLLECTION}/{document_id}"
    )


@dataclass
class _RateLimitRecord:
    count: int = 0
    notice_sent: bool = False
    expires_at: datetime | None = None


class InMemoryRateLimit:
    """In-memory rate-limit store for local runs and unit tests."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._records: dict[str, _RateLimitRecord] = {}

    def try_accept_model_eligible(
        self,
        *,
        sender_hmac: str,
        now: datetime,
        daily_limit: int,
    ) -> RateLimitDecision:
        key = rate_limit_document_id(luxembourg_calendar_day(now), sender_hmac)
        with self._lock:
            record = self._records.setdefault(key, _RateLimitRecord())
            if record.expires_at is None:
                record.expires_at = rate_limit_expires_at(now)
            if record.count >= daily_limit:
                return RateLimitDecision(
                    allowed=False,
                    count=record.count,
                    should_send_notice=not record.notice_sent,
                )
            record.count += 1
            return RateLimitDecision(
                allowed=True,
                count=record.count,
                should_send_notice=False,
            )

    def mark_notice_sent(self, *, sender_hmac: str, now: datetime) -> None:
        key = rate_limit_document_id(luxembourg_calendar_day(now), sender_hmac)
        with self._lock:
            record = self._records.setdefault(key, _RateLimitRecord())
            record.notice_sent = True

    def get_count(self, *, sender_hmac: str, now: datetime) -> int:
        key = rate_limit_document_id(luxembourg_calendar_day(now), sender_hmac)
        with self._lock:
            return self._records.get(key, _RateLimitRecord()).count

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


class FirestoreRateLimit:
    """Firestore-backed rate-limit store (blueprint 23.2)."""

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

    def _document(self, sender_hmac: str, now: datetime) -> Any:
        document_id = rate_limit_document_id(luxembourg_calendar_day(now), sender_hmac)
        path = rate_limit_document_path(self._settings.environment, document_id)
        return self.client.document(path)

    def try_accept_model_eligible(
        self,
        *,
        sender_hmac: str,
        now: datetime,
        daily_limit: int,
    ) -> RateLimitDecision:
        document = self._document(sender_hmac, now)

        def apply(transaction: Any) -> RateLimitDecision:
            snapshot = document.get(transaction=transaction)
            data = snapshot.to_dict() if snapshot.exists else {}
            count = int(data.get("count", 0))
            notice_sent = bool(data.get("notice_sent", False))
            if count >= daily_limit:
                return RateLimitDecision(
                    allowed=False,
                    count=count,
                    should_send_notice=not notice_sent,
                )
            new_count = count + 1
            transaction.set(
                document,
                {
                    "count": new_count,
                    "notice_sent": notice_sent,
                    "updated_at": now,
                    "expires_at": rate_limit_expires_at(now),
                },
                merge=True,
            )
            return RateLimitDecision(
                allowed=True,
                count=new_count,
                should_send_notice=False,
            )

        run_in_transaction = self.transactional(apply)
        result: RateLimitDecision = run_in_transaction(self.client.transaction())
        return result

    def mark_notice_sent(self, *, sender_hmac: str, now: datetime) -> None:
        document = self._document(sender_hmac, now)
        document.set(
            {
                "notice_sent": True,
                "updated_at": now,
                "expires_at": rate_limit_expires_at(now),
            },
            merge=True,
        )

    def sweep_expired(self, *, now: datetime) -> int:
        collection = self.client.collection(
            f"{ENVIRONMENTS_COLLECTION}/{self._settings.environment}"
            f"/{RATE_LIMITS_COLLECTION}"
        )
        query = collection.where("expires_at", "<=", now)
        deleted = 0
        for snapshot in query.stream():
            snapshot.reference.delete()
            deleted += 1
        return deleted


__all__ = [
    "LUXEMBOURG_TZ",
    "RateLimitDecision",
    "RateLimitPort",
    "luxembourg_calendar_day",
    "rate_limit_document_id",
    "rate_limit_document_path",
    "InMemoryRateLimit",
    "FirestoreRateLimit",
]
