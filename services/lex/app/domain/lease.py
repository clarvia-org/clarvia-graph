"""Worker-lease decision logic (blueprint 7.2).

The rule is expressed once, as a pure function over the stored record, so that
every state adapter — in-memory or Firestore — enforces identical semantics.
Adapters differ only in how they apply the decision atomically.

A worker may process a message only when it is not terminal, has not already
produced an outbound message, and carries no unexpired lease.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from enum import Enum

from app.domain.models import ProcessingRecord, ProcessingStatus


class LeaseOutcome(str, Enum):
    ACQUIRED = "acquired"
    LEASE_HELD = "lease_held"
    TERMINAL = "terminal"
    NOT_FOUND = "not_found"


@dataclass(frozen=True, slots=True)
class LeaseDecision:
    """The outcome plus the record as it should now be stored (or as found)."""

    outcome: LeaseOutcome
    record: ProcessingRecord | None

    @property
    def acquired(self) -> bool:
        return self.outcome is LeaseOutcome.ACQUIRED


def evaluate_lease(
    record: ProcessingRecord | None,
    *,
    now: datetime,
    worker_id: str,
    lease_duration_seconds: int,
) -> LeaseDecision:
    """Decide whether ``worker_id`` may take the lease at ``now``."""
    if record is None:
        return LeaseDecision(LeaseOutcome.NOT_FOUND, None)
    if record.is_terminal or record.has_outbound_message:
        return LeaseDecision(LeaseOutcome.TERMINAL, record)
    if (
        record.status is ProcessingStatus.PROCESSING
        and record.lease_until is not None
        and record.lease_until > now
    ):
        return LeaseDecision(LeaseOutcome.LEASE_HELD, record)
    leased = replace(
        record,
        status=ProcessingStatus.PROCESSING,
        lease_until=now + timedelta(seconds=lease_duration_seconds),
        lease_owner=worker_id,
        attempt_count=record.attempt_count + 1,
        updated_at=now,
    )
    return LeaseDecision(LeaseOutcome.ACQUIRED, leased)


__all__ = ["LeaseOutcome", "LeaseDecision", "evaluate_lease"]
