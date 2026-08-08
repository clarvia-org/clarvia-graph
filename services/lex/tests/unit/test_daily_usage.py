"""Daily usage record behaviour."""

from __future__ import annotations

from datetime import UTC, datetime

from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.ops.ttl import daily_usage_expires_at


def test_try_consume_increments_llm_calls() -> None:
    clock = FakeClock()
    usage = InMemoryDailyUsage()
    now = clock.now()

    decision = usage.try_consume_llm_call(now=now, global_limit=10, force_open=False)

    assert decision.allowed is True
    assert decision.llm_calls == 1
    record = usage.get_record(now=now)
    assert record.llm_calls == 1
    assert record.expires_at == daily_usage_expires_at(now)


def test_record_email_sent_and_failures() -> None:
    clock = FakeClock(start=datetime(2026, 7, 25, 12, 0, tzinfo=UTC))
    usage = InMemoryDailyUsage()
    now = clock.now()

    usage.record_email_sent(now=now)
    usage.increment_failures(now=now)

    record = usage.get_record(now=now)
    assert record.emails_sent == 1
    assert record.failures == 1


def test_sweep_expired_removes_old_records() -> None:
    clock = FakeClock(start=datetime(2026, 7, 25, 12, 0, tzinfo=UTC))
    usage = InMemoryDailyUsage()
    now = clock.now()
    usage.try_consume_llm_call(now=now, global_limit=100, force_open=False)

    future = now.replace(year=2027)
    deleted = usage.sweep_expired(now=future)

    assert deleted == 1
    assert usage.get_record(now=now).llm_calls == 0
