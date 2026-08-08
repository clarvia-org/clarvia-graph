"""Metadata retention sweeper (blueprint section 24)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.domain.ports import GmailPort
from app.infrastructure.daily_usage import DailyUsagePort
from app.infrastructure.rate_limit import RateLimitPort
from app.logging import get_logger, log_event

if TYPE_CHECKING:
    from app.config import Settings
    from app.domain.ports import ClockPort, MessageStatePort

_logger = get_logger("lex.retention")


@dataclass(frozen=True, slots=True)
class RetentionResult:
    """Anonymised deletion counts only."""

    messages_deleted: int
    rate_limits_deleted: int
    daily_usage_deleted: int
    gmail_threads_trashed: int

    def as_dict(self) -> dict[str, int]:
        return {
            "messages_deleted": self.messages_deleted,
            "rate_limits_deleted": self.rate_limits_deleted,
            "daily_usage_deleted": self.daily_usage_deleted,
            "gmail_threads_trashed": self.gmail_threads_trashed,
        }


class RetentionWorker:
    """Deletes expired Firestore metadata; optionally trashes Gmail threads."""

    def __init__(
        self,
        *,
        settings: Settings,
        state: MessageStatePort,
        rate_limit: RateLimitPort,
        daily_usage: DailyUsagePort,
        gmail: GmailPort,
        clock: ClockPort,
    ) -> None:
        self._settings = settings
        self._state = state
        self._rate_limit = rate_limit
        self._daily_usage = daily_usage
        self._gmail = gmail
        self._clock = clock

    def run(self) -> RetentionResult:
        now = self._clock.now()
        messages_deleted = self._state.sweep_expired(now=now)
        rate_limits_deleted = self._rate_limit.sweep_expired(now=now)
        daily_usage_deleted = self._daily_usage.sweep_expired(now=now)
        gmail_threads_trashed = 0
        if self._settings.retention_trash_gmail:
            gmail_threads_trashed = self._gmail.sweep_expired_threads(now=now)
        log_event(
            _logger,
            "retention_sweep",
            status="completed",
            deleted_count=messages_deleted + rate_limits_deleted + daily_usage_deleted,
        )
        return RetentionResult(
            messages_deleted=messages_deleted,
            rate_limits_deleted=rate_limits_deleted,
            daily_usage_deleted=daily_usage_deleted,
            gmail_threads_trashed=gmail_threads_trashed,
        )


__all__ = ["RetentionResult", "RetentionWorker"]
