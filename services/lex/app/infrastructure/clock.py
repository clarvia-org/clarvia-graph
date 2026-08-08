"""Clock implementations for :class:`app.domain.ports.ClockPort`."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta


class SystemClock:
    """Wall-clock time, always timezone-aware UTC."""

    def now(self) -> datetime:
        return datetime.now(UTC)


class FakeClock:
    """Manually advanced clock, so lease expiry is testable without sleeping.

    Also useful locally with the in-memory backend when reproducing a timing
    scenario by hand.
    """

    def __init__(self, start: datetime | None = None) -> None:
        self._now = start or datetime(2026, 1, 1, 12, 0, tzinfo=UTC)

    def now(self) -> datetime:
        return self._now

    def advance(self, seconds: float) -> datetime:
        self._now = self._now + timedelta(seconds=seconds)
        return self._now

    def set(self, moment: datetime) -> None:
        self._now = moment


__all__ = ["SystemClock", "FakeClock"]
