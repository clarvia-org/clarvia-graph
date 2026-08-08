"""Deterministic identifiers derived from a Gmail message ID.

Determinism is the whole idempotency strategy (blueprint 6.2 and 7.3): the same
inbound message always yields the same Cloud Task name, the same Firestore
document key, the same outbound RFC Message-ID, and the same request ID, so a
repeated poll or a retried worker collides with itself instead of duplicating
work.

Where sanitisation changes the identifier, a short digest of the original is
appended so two different Gmail IDs can never collapse into one name.
"""

from __future__ import annotations

import hashlib
import re

TASK_NAME_PREFIX = "lex-process-"
#: Cloud Tasks allows at most 500 characters in a task ID.
MAX_TASK_NAME_LENGTH = 500
DEFAULT_MESSAGE_ID_DOMAIN = "clarvia.org"

_TASK_UNSAFE = re.compile(r"[^A-Za-z0-9_-]")
_LOCAL_PART_UNSAFE = re.compile(r"[^A-Za-z0-9._-]")
_DIGEST_LENGTH = 16


class InvalidMessageIdError(ValueError):
    """Raised when a Gmail message ID is empty or whitespace only."""


def _require_message_id(gmail_message_id: str) -> str:
    identifier = gmail_message_id.strip()
    if not identifier:
        raise InvalidMessageIdError("gmail_message_id must not be blank.")
    return identifier


def _digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:_DIGEST_LENGTH]


def message_key(gmail_message_id: str) -> str:
    """Firestore document key for a message (the Gmail message ID itself)."""
    return _require_message_id(gmail_message_id)


def task_name_for_message(gmail_message_id: str) -> str:
    """Cloud Tasks task ID, restricted to ``[A-Za-z0-9_-]``."""
    identifier = _require_message_id(gmail_message_id)
    sanitised = _TASK_UNSAFE.sub("-", identifier)
    if sanitised != identifier:
        sanitised = f"{sanitised}-{_digest(identifier)}"
    if len(TASK_NAME_PREFIX) + len(sanitised) > MAX_TASK_NAME_LENGTH:
        budget = MAX_TASK_NAME_LENGTH - len(TASK_NAME_PREFIX) - _DIGEST_LENGTH - 1
        sanitised = f"{sanitised[:budget]}-{_digest(identifier)}"
    return f"{TASK_NAME_PREFIX}{sanitised}"


def outbound_message_id(
    gmail_message_id: str, *, domain: str = DEFAULT_MESSAGE_ID_DOMAIN
) -> str:
    """Deterministic RFC Message-ID for the eventual reply (blueprint 7.3).

    Unused until sending exists, but generated here so the send path and any
    duplicate-detection lookup share one definition.
    """
    identifier = _require_message_id(gmail_message_id)
    local = _LOCAL_PART_UNSAFE.sub("-", identifier)
    if local != identifier:
        local = f"{local}-{_digest(identifier)}"
    return f"<lex.{local}@{domain}>"


def request_id_for_message(gmail_message_id: str) -> str:
    """Deterministic value for the ``X-Lex-Request-ID`` header and logs."""
    identifier = _require_message_id(gmail_message_id)
    return f"lex-{hashlib.sha256(identifier.encode('utf-8')).hexdigest()[:32]}"


__all__ = [
    "TASK_NAME_PREFIX",
    "MAX_TASK_NAME_LENGTH",
    "DEFAULT_MESSAGE_ID_DOMAIN",
    "InvalidMessageIdError",
    "message_key",
    "task_name_for_message",
    "outbound_message_id",
    "request_id_for_message",
]
