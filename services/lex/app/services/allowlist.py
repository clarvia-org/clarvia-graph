"""Allowlist resolution for pilot mode (blueprint 26.6)."""

from __future__ import annotations

from functools import lru_cache

from app.config import Settings
from app.domain.hmac_sender import HmacSecretMissingError, compute_sender_hmac


def resolve_allowlist_sender_hmacs(settings: Settings) -> frozenset[str]:
    """Return the configured allow-listed sender HMAC digests.

    Emails from ``ALLOWLIST_SENDERS`` are hashed at resolution time using
    ``HMAC_SECRET``. Pre-computed digests may be supplied via
    ``allowlist_sender_hmacs``. Email addresses are never logged.
    """
    explicit = _parse_csv(settings.allowlist_sender_hmacs)
    if not settings.allowlist_senders.strip():
        return explicit
    secret = settings.hmac_secret
    if not secret:
        raise HmacSecretMissingError(
            "hmac_secret is required when ALLOWLIST_SENDERS is configured."
        )
    from_emails = _parse_csv(settings.allowlist_senders)
    derived = frozenset(compute_sender_hmac(email, secret) for email in from_emails)
    return explicit | derived


@lru_cache(maxsize=8)
def cached_allowlist_hmacs(
    allowlist_sender_hmacs: str,
    allowlist_senders: str,
    hmac_secret: str,
) -> frozenset[str]:
    """Cache allow-list HMACs keyed by the raw settings strings."""
    explicit = _parse_csv(allowlist_sender_hmacs)
    if not allowlist_senders.strip():
        return explicit
    if not hmac_secret:
        raise HmacSecretMissingError(
            "hmac_secret is required when ALLOWLIST_SENDERS is configured."
        )
    from_emails = _parse_csv(allowlist_senders)
    derived = frozenset(
        compute_sender_hmac(email, hmac_secret) for email in from_emails
    )
    return explicit | derived


def _parse_csv(value: str) -> frozenset[str]:
    if not value.strip():
        return frozenset()
    return frozenset(part.strip() for part in value.split(",") if part.strip())


__all__ = ["resolve_allowlist_sender_hmacs", "cached_allowlist_hmacs"]
