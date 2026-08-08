"""Allowlist resolution tests."""

from __future__ import annotations

from app.domain.hmac_sender import compute_sender_hmac
from app.services.allowlist import (
    cached_allowlist_hmacs,
    resolve_allowlist_sender_hmacs,
)

from .conftest import build_settings

SECRET = "allowlist-unit-secret"


def test_resolve_explicit_hmacs_only() -> None:
    settings = build_settings(
        allowlist_sender_hmacs="abc,def",
        allowlist_senders="",
        hmac_secret=SECRET,
    )
    assert resolve_allowlist_sender_hmacs(settings) == frozenset({"abc", "def"})


def test_resolve_hashes_allowlist_senders() -> None:
    settings = build_settings(
        allowlist_sender_hmacs="",
        allowlist_senders="Pilot@Example.com, other@example.com",
        hmac_secret=SECRET,
    )
    expected = frozenset(
        {
            compute_sender_hmac("Pilot@Example.com", SECRET),
            compute_sender_hmac("other@example.com", SECRET),
        }
    )
    assert resolve_allowlist_sender_hmacs(settings) == expected


def test_cached_allowlist_hmacs_matches_resolve() -> None:
    settings = build_settings(
        allowlist_sender_hmacs="deadbeef",
        allowlist_senders="pilot@example.com",
        hmac_secret=SECRET,
    )
    cached = cached_allowlist_hmacs(
        settings.allowlist_sender_hmacs,
        settings.allowlist_senders,
        settings.hmac_secret,
    )
    assert cached == resolve_allowlist_sender_hmacs(settings)
