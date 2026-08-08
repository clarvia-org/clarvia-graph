"""TTL helper coverage."""

from __future__ import annotations

from datetime import UTC, datetime

from app.domain.models import ProcessingStatus
from app.ops.ttl import (
    daily_usage_expires_at,
    message_expires_at,
    rate_limit_expires_at,
)


def test_message_expires_at_differs_for_failures() -> None:
    now = datetime(2026, 7, 25, 12, 0, tzinfo=UTC)
    success = message_expires_at(now, ProcessingStatus.SENT)
    failure = message_expires_at(now, ProcessingStatus.FAILED)
    assert failure < success


def test_rate_and_daily_usage_expires_at() -> None:
    now = datetime(2026, 7, 25, 12, 0, tzinfo=UTC)
    assert rate_limit_expires_at(now) > now
    assert daily_usage_expires_at(now) > now
