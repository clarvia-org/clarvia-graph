"""Tests for clarvia.org Ask us HMAC authentication."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from app.services.ask_auth import AskAuthError, sign_ask_payload, verify_ask_signature


def test_valid_signature_is_accepted() -> None:
    secret = "ask-secret"
    timestamp = datetime.now(UTC).isoformat()
    body = '{"email":"a@b.co","question":"x","consent":true}'
    signature = sign_ask_payload(secret, timestamp, body)
    verify_ask_signature(
        secret=secret, timestamp=timestamp, body=body, signature=signature
    )


def test_missing_secret_fails_closed() -> None:
    with pytest.raises(AskAuthError) as exc:
        verify_ask_signature(
            secret="", timestamp="2026-01-01T00:00:00Z", body="{}", signature="ab"
        )
    assert exc.value.code == "unauthorized"


def test_wrong_signature_is_rejected() -> None:
    secret = "ask-secret"
    timestamp = datetime.now(UTC).isoformat()
    expected = sign_ask_payload(secret, timestamp, "{}")
    with pytest.raises(AskAuthError):
        verify_ask_signature(
            secret=secret,
            timestamp=timestamp,
            body="{}",
            signature="00" * (len(expected) // 2),
        )


def test_stale_timestamp_is_rejected() -> None:
    secret = "ask-secret"
    timestamp = (datetime.now(UTC) - timedelta(minutes=10)).isoformat()
    body = "{}"
    signature = sign_ask_payload(secret, timestamp, body)
    with pytest.raises(AskAuthError):
        verify_ask_signature(
            secret=secret, timestamp=timestamp, body=body, signature=signature
        )
