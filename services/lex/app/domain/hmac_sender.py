"""HMAC-based sender identity for rate limiting (blueprint 11.1).

The normalised sender address is never stored; only the HMAC digest is
persisted in Firestore or in-memory adapters.
"""

from __future__ import annotations

import hashlib
import hmac

from app.email.recipients import normalize_address


class HmacSecretMissingError(ValueError):
    """Raised when rate limiting is required but no secret is configured."""


def normalise_sender_address(address: str) -> str:
    """Normalise a sender address for stable HMAC input."""
    return normalize_address(address)


def compute_sender_hmac(address: str, secret: str) -> str:
    """Return HMAC-SHA256 hex digest for a normalised sender address."""
    if not secret:
        raise HmacSecretMissingError("hmac_secret is required for sender HMAC.")
    normalised = normalise_sender_address(address)
    return hmac.new(
        secret.encode("utf-8"),
        normalised.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


__all__ = [
    "HmacSecretMissingError",
    "normalise_sender_address",
    "compute_sender_hmac",
]
