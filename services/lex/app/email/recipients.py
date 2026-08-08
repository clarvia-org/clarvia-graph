"""Pure recipient functions for the visible reply audience.

There is deliberately no BCC handling anywhere in this module. BCC headers are
commonly stripped before delivery, so Lex cannot know who was BCC'd and never
tries to. The recipient limit is computed from the visible To + CC list only.
"""

from __future__ import annotations

import re
from collections.abc import Iterable

from app.domain.models import ReplyRecipients

DEFAULT_LEX_ADDRESSES: frozenset[str] = frozenset({"lex@clarvia.org"})
DEFAULT_MAX_VISIBLE_RECIPIENTS = 10

_ADDRESS_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalize_address(address: str) -> str:
    """Trim surrounding whitespace and lowercase for case-insensitive compare."""
    return address.strip().lower()


def is_valid_address(address: str) -> bool:
    """Very small structural check; full RFC parsing is out of scope for Phase 1."""
    return bool(_ADDRESS_RE.match(address.strip()))


def dedupe_addresses(addresses: Iterable[str]) -> list[str]:
    """Return normalised addresses with case-insensitive duplicates removed."""
    seen: set[str] = set()
    result: list[str] = []
    for address in addresses:
        normalised = normalize_address(address)
        if not normalised or normalised in seen:
            continue
        seen.add(normalised)
        result.append(normalised)
    return result


def remove_lex_addresses(
    addresses: Iterable[str],
    lex_addresses: Iterable[str] = DEFAULT_LEX_ADDRESSES,
) -> list[str]:
    """Remove the Lex mailbox and configured aliases (case-insensitive)."""
    blocked = {normalize_address(address) for address in lex_addresses}
    return [
        address for address in addresses if normalize_address(address) not in blocked
    ]


def build_visible_reply_list(
    *,
    to_addresses: Iterable[str],
    cc_addresses: Iterable[str],
    lex_addresses: Iterable[str] = DEFAULT_LEX_ADDRESSES,
) -> ReplyRecipients:
    """Build the deduplicated, validated visible reply list.

    Invalid entries and the Lex addresses are removed; addresses are deduped
    case-insensitively across both To and CC. There is no BCC parameter.
    """
    blocked = {normalize_address(address) for address in lex_addresses}
    seen: set[str] = set()

    def _clean(addresses: Iterable[str]) -> tuple[str, ...]:
        cleaned: list[str] = []
        for address in addresses:
            normalised = normalize_address(address)
            if not normalised or not is_valid_address(normalised):
                continue
            if normalised in blocked or normalised in seen:
                continue
            seen.add(normalised)
            cleaned.append(normalised)
        return tuple(cleaned)

    return ReplyRecipients(
        to_addresses=_clean(to_addresses),
        cc_addresses=_clean(cc_addresses),
    )


def build_reply_recipients(
    *,
    from_address: str,
    reply_to: str | None,
    to_addresses: Iterable[str],
    cc_addresses: Iterable[str],
    lex_addresses: Iterable[str] = DEFAULT_LEX_ADDRESSES,
) -> ReplyRecipients:
    """Build the reply-all audience with Reply-To as the primary To recipient."""
    blocked = {normalize_address(address) for address in lex_addresses}
    seen: set[str] = set()

    primary_source = (
        reply_to if reply_to and is_valid_address(reply_to) else from_address
    )
    primary = normalize_address(primary_source)
    if not primary or not is_valid_address(primary):
        primary = ""
    if primary:
        seen.add(primary)

    def _collect(addresses: Iterable[str], *, skip_primary: bool) -> tuple[str, ...]:
        cleaned: list[str] = []
        for address in addresses:
            normalised = normalize_address(address)
            if not normalised or not is_valid_address(normalised):
                continue
            if normalised in blocked or normalised in seen:
                continue
            if skip_primary and normalised == primary:
                continue
            seen.add(normalised)
            cleaned.append(normalised)
        return tuple(cleaned)

    to_list: list[str] = []
    if primary:
        to_list.append(primary)
    to_list.extend(_collect(to_addresses, skip_primary=True))
    cc_list = list(_collect(cc_addresses, skip_primary=False))
    return ReplyRecipients(to_addresses=tuple(to_list), cc_addresses=tuple(cc_list))


def sender_only_recipients(
    *,
    from_address: str,
    reply_to: str | None,
) -> ReplyRecipients:
    """Reply only to the original sender or Reply-To (recipient-limit path)."""
    primary_source = (
        reply_to if reply_to and is_valid_address(reply_to) else from_address
    )
    primary = normalize_address(primary_source)
    if not primary or not is_valid_address(primary):
        return ReplyRecipients(to_addresses=(), cc_addresses=())
    return ReplyRecipients(to_addresses=(primary,), cc_addresses=())


def exceeds_recipient_limit(
    recipients: ReplyRecipients,
    max_visible: int = DEFAULT_MAX_VISIBLE_RECIPIENTS,
) -> bool:
    """True when To + CC exceeds the visible-recipient limit."""
    return recipients.visible_count > max_visible


__all__ = [
    "DEFAULT_LEX_ADDRESSES",
    "DEFAULT_MAX_VISIBLE_RECIPIENTS",
    "normalize_address",
    "is_valid_address",
    "dedupe_addresses",
    "remove_lex_addresses",
    "build_visible_reply_list",
    "build_reply_recipients",
    "sender_only_recipients",
    "exceeds_recipient_limit",
]
