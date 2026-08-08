"""Firestore TTL field helpers (blueprint section 24).

The application sets ``expires_at`` on metadata records. A human operator must
enable the Firestore TTL policy on that field — see ``docs/runbooks/deploy.md``.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.domain.models import ProcessingStatus

MESSAGE_SUCCESS_RETENTION_DAYS = 90
MESSAGE_FAILURE_RETENTION_DAYS = 30
RATE_LIMIT_RETENTION_DAYS = 8
DAILY_USAGE_RETENTION_DAYS = 30


def _utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def message_expires_at(now: datetime, status: ProcessingStatus) -> datetime:
    """Retention for per-message operational metadata."""
    base = _utc(now)
    if status is ProcessingStatus.FAILED:
        return base + timedelta(days=MESSAGE_FAILURE_RETENTION_DAYS)
    return base + timedelta(days=MESSAGE_SUCCESS_RETENTION_DAYS)


def rate_limit_expires_at(now: datetime) -> datetime:
    """Retention for per-sender rate-limit counters."""
    return _utc(now) + timedelta(days=RATE_LIMIT_RETENTION_DAYS)


def daily_usage_expires_at(now: datetime) -> datetime:
    """Retention for global daily usage / circuit-breaker records."""
    return _utc(now) + timedelta(days=DAILY_USAGE_RETENTION_DAYS)


__all__ = [
    "MESSAGE_SUCCESS_RETENTION_DAYS",
    "MESSAGE_FAILURE_RETENTION_DAYS",
    "RATE_LIMIT_RETENTION_DAYS",
    "DAILY_USAGE_RETENTION_DAYS",
    "message_expires_at",
    "rate_limit_expires_at",
    "daily_usage_expires_at",
]
