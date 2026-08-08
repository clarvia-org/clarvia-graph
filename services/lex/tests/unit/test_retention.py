"""Retention worker sweeps expired metadata."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.domain.models import ProcessingStatus, new_queued_record
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.ops.ttl import message_expires_at, rate_limit_expires_at
from app.services.retention import RetentionWorker

from .conftest import build_settings


def test_retention_sweeps_expired_message_and_rate_limit_records() -> None:
    clock = FakeClock(start=datetime(2026, 7, 25, 12, 0, tzinfo=UTC))
    state = InMemoryMessageState(clock=clock)
    rate_limit = InMemoryRateLimit()
    daily_usage = InMemoryDailyUsage()
    gmail = InMemoryGmail()
    settings = build_settings(retention_trash_gmail=False)

    past = clock.now() - timedelta(days=100)
    state.create_record(
        new_queued_record(
            message_key="old",
            thread_id="t-old",
            now=past,
            expires_at=message_expires_at(past, ProcessingStatus.SENT),
        )
    )
    rate_limit.try_accept_model_eligible(
        sender_hmac="abc",
        now=past,
        daily_limit=10,
    )
    key = next(iter(rate_limit._records))
    rate_limit._records[key].expires_at = rate_limit_expires_at(past)

    worker = RetentionWorker(
        settings=settings,
        state=state,
        rate_limit=rate_limit,
        daily_usage=daily_usage,
        gmail=gmail,
        clock=clock,
    )
    result = worker.run()

    assert result.messages_deleted == 1
    assert result.rate_limits_deleted == 1
    assert state.get_record("old") is None
