"""Rate-limit tests (blueprint sections 11 and 23.2)."""

from __future__ import annotations

from datetime import UTC, datetime

from app.domain.hmac_sender import compute_sender_hmac
from app.email.templates import RATE_LIMIT_BODY
from app.infrastructure.clock import FakeClock
from app.infrastructure.rate_limit import InMemoryRateLimit, luxembourg_calendar_day


def test_five_model_eligible_requests_allowed_per_day() -> None:
    clock = FakeClock(datetime(2026, 7, 25, 10, 0, tzinfo=UTC))
    store = InMemoryRateLimit()
    sender_hmac = compute_sender_hmac("user@example.com", "test-secret")
    for index in range(5):
        decision = store.try_accept_model_eligible(
            sender_hmac=sender_hmac,
            now=clock.now(),
            daily_limit=5,
        )
        assert decision.allowed is True
        assert decision.count == index + 1


def test_sixth_request_is_blocked() -> None:
    clock = FakeClock(datetime(2026, 7, 25, 10, 0, tzinfo=UTC))
    store = InMemoryRateLimit()
    sender_hmac = compute_sender_hmac("user@example.com", "test-secret")
    for _ in range(5):
        store.try_accept_model_eligible(
            sender_hmac=sender_hmac,
            now=clock.now(),
            daily_limit=5,
        )
    blocked = store.try_accept_model_eligible(
        sender_hmac=sender_hmac,
        now=clock.now(),
        daily_limit=5,
    )
    assert blocked.allowed is False
    assert blocked.should_send_notice is True


def test_rate_limit_notice_is_sent_only_once() -> None:
    clock = FakeClock(datetime(2026, 7, 25, 10, 0, tzinfo=UTC))
    store = InMemoryRateLimit()
    sender_hmac = compute_sender_hmac("user@example.com", "test-secret")
    for _ in range(5):
        store.try_accept_model_eligible(
            sender_hmac=sender_hmac,
            now=clock.now(),
            daily_limit=5,
        )
    first = store.try_accept_model_eligible(
        sender_hmac=sender_hmac,
        now=clock.now(),
        daily_limit=5,
    )
    store.mark_notice_sent(sender_hmac=sender_hmac, now=clock.now())
    second = store.try_accept_model_eligible(
        sender_hmac=sender_hmac,
        now=clock.now(),
        daily_limit=5,
    )
    assert first.should_send_notice is True
    assert second.should_send_notice is False


def test_rate_limit_wording_is_compassionate() -> None:
    lowered = RATE_LIMIT_BODY.casefold()
    for forbidden in ("abuse", "misuse", "violation", "excessive use"):
        assert forbidden not in lowered
    assert "immediate danger" not in lowered


def test_luxembourg_calendar_day_boundary() -> None:
    late = datetime(2026, 7, 25, 23, 30, tzinfo=UTC)
    early = datetime(2026, 7, 26, 0, 30, tzinfo=UTC)
    assert luxembourg_calendar_day(late) == "2026-07-26"
    assert luxembourg_calendar_day(early) == "2026-07-26"
