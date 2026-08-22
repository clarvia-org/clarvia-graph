"""HMAC authentication for the public-facing Ask us ingest route.

The website backend signs ``timestamp + '.' + raw_json_body``. This is separate
from ``INTERNAL_AUTH_TOKEN`` so a leaked website secret cannot poll or process
the mailbox.
"""

from __future__ import annotations

import hashlib
import hmac
from datetime import UTC, datetime, timedelta

from app.domain.hmac_sender import HmacSecretMissingError

MAX_AGE = timedelta(minutes=5)
TIMESTAMP_HEADER = "X-Lex-Timestamp"
SIGNATURE_HEADER = "X-Lex-Signature"


class AskAuthError(ValueError):
    """Raised when Ask us ingest authentication fails."""

    def __init__(self, code: str) -> None:
        self.code = code
        super().__init__(code)


def sign_ask_payload(secret: str, timestamp: str, body: str) -> str:
    if not secret:
        raise HmacSecretMissingError("website_hmac_secret is required.")
    digest = hmac.new(
        secret.encode("utf-8"),
        f"{timestamp}.{body}".encode(),
        hashlib.sha256,
    )
    return digest.hexdigest()


def verify_ask_signature(
    *,
    secret: str,
    timestamp: str,
    body: str,
    signature: str,
    now: datetime | None = None,
) -> None:
    if not secret:
        raise AskAuthError("unauthorized")
    if not timestamp or not signature:
        raise AskAuthError("unauthorized")
    try:
        request_time = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError as exc:
        raise AskAuthError("unauthorized") from exc
    if request_time.tzinfo is None:
        request_time = request_time.replace(tzinfo=UTC)
    current = now or datetime.now(UTC)
    age = abs(current - request_time)
    if age > MAX_AGE:
        raise AskAuthError("unauthorized")

    expected = sign_ask_payload(secret, timestamp, body)
    signature_bytes = bytes.fromhex(signature) if _is_hex(signature) else b""
    expected_bytes = bytes.fromhex(expected)
    if len(signature_bytes) != len(expected_bytes) or not hmac.compare_digest(
        signature_bytes, expected_bytes
    ):
        raise AskAuthError("unauthorized")


def _is_hex(value: str) -> bool:
    try:
        bytes.fromhex(value)
    except ValueError:
        return False
    return len(value) % 2 == 0


__all__ = [
    "MAX_AGE",
    "TIMESTAMP_HEADER",
    "SIGNATURE_HEADER",
    "AskAuthError",
    "sign_ask_payload",
    "verify_ask_signature",
]
