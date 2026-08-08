"""Gmail label constants and the discovery query (blueprint 6.1).

A message is eligible for processing when it is in the inbox and carries none
of the Lex lifecycle labels. Labelling is what makes a repeated poll cheap: an
already-discovered message disappears from the result set.
"""

from __future__ import annotations

LEX_PENDING = "LEX_PENDING"
LEX_PROCESSED = "LEX_PROCESSED"
LEX_IGNORED = "LEX_IGNORED"
LEX_FAILED = "LEX_FAILED"
LEX_RATE_LIMITED = "LEX_RATE_LIMITED"

#: Every lifecycle label, in the blueprint's order.
LEX_LABELS: tuple[str, ...] = (
    LEX_PENDING,
    LEX_PROCESSED,
    LEX_IGNORED,
    LEX_FAILED,
    LEX_RATE_LIMITED,
)

INBOX_LABEL = "INBOX"


def eligible_message_query() -> str:
    """Gmail search query for messages that have not been discovered yet."""
    exclusions = " ".join(f"-label:{label}" for label in LEX_LABELS)
    return f"in:inbox {exclusions}"


__all__ = [
    "LEX_PENDING",
    "LEX_PROCESSED",
    "LEX_IGNORED",
    "LEX_FAILED",
    "LEX_RATE_LIMITED",
    "LEX_LABELS",
    "INBOX_LABEL",
    "eligible_message_query",
]
