"""Automatic-message and loop detection (blueprint section 9).

Messages that match these rules are silently ignored: no model call and no reply.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum

from app.domain.models import ParsedMessage
from app.email.parsing import is_substantive_body
from app.email.recipients import normalize_address

_BULK_PRECEDENCE = frozenset({"bulk", "list", "junk"})
_AUTO_SUBMITTED_IGNORE = frozenset(
    {"auto-generated", "auto-replied", "auto-notified", "yes"}
)
_DSN_CONTENT_TYPES = (
    "multipart/report",
    "message/delivery-status",
    "message/disposition-notification",
)


class IgnoreReason(str, Enum):
    LEX_SENDER = "lex_sender"
    AUTO_SUBMITTED = "auto_submitted"
    DSN = "dsn"
    VACATION = "vacation"
    READ_RECEIPT = "read_receipt"
    LIST_MAIL = "list_mail"
    EMPTY_RETURN_PATH = "empty_return_path"
    BULK_MAIL = "bulk_mail"
    EMPTY_BODY = "empty_body"


@dataclass(frozen=True, slots=True)
class AutoDetectResult:
    should_ignore: bool
    reason: IgnoreReason | None = None


def _is_lex_sender(
    from_address: str,
    *,
    lex_mailbox: str,
    lex_aliases: frozenset[str],
) -> bool:
    normalised = normalize_address(from_address)
    blocked = {normalize_address(lex_mailbox)} | {
        normalize_address(alias) for alias in lex_aliases
    }
    return normalised in blocked


def _is_vacation(auto_submitted: str | None, subject: str) -> bool:
    if (
        auto_submitted
        and "auto-replied" in auto_submitted.lower()
        and re.search(r"\b(out of office|vacation|holiday|away)\b", subject, re.I)
    ):
        return True
    return bool(re.search(r"^out of office:", subject, re.I))


def _is_read_receipt(
    auto_submitted: str | None,
    subject: str,
    content_type: str | None = None,
) -> bool:
    if content_type and "disposition-notification" in content_type.lower():
        return True
    return bool(
        auto_submitted
        and "auto-generated" in auto_submitted.lower()
        and re.search(r"read receipt|read:\s", subject, re.I)
    )


def detect_automatic_message(  # noqa: PLR0911
    parsed: ParsedMessage,
    *,
    lex_mailbox: str,
    lex_aliases: frozenset[str] | None = None,
) -> AutoDetectResult:
    """Return whether an inbound message should be silently ignored."""
    aliases = lex_aliases or frozenset()

    if _is_lex_sender(
        parsed.from_address, lex_mailbox=lex_mailbox, lex_aliases=aliases
    ):
        return AutoDetectResult(True, IgnoreReason.LEX_SENDER)

    auto_submitted = (parsed.auto_submitted or "").strip().lower()
    if auto_submitted in _AUTO_SUBMITTED_IGNORE:
        return AutoDetectResult(True, IgnoreReason.AUTO_SUBMITTED)

    if parsed.list_id:
        return AutoDetectResult(True, IgnoreReason.LIST_MAIL)

    return_path = parsed.return_path
    if return_path is not None and return_path.strip() in {"", "<>"}:
        return AutoDetectResult(True, IgnoreReason.EMPTY_RETURN_PATH)

    precedence = (parsed.precedence or "").strip().lower()
    if precedence in _BULK_PRECEDENCE:
        return AutoDetectResult(True, IgnoreReason.BULK_MAIL)

    subject = parsed.subject or ""
    if _is_vacation(parsed.auto_submitted, subject):
        return AutoDetectResult(True, IgnoreReason.VACATION)

    if _is_read_receipt(parsed.auto_submitted, subject):
        return AutoDetectResult(True, IgnoreReason.READ_RECEIPT)

    if re.search(
        r"delivery status notification|undeliverable|mail delivery failed",
        subject,
        re.I,
    ):
        return AutoDetectResult(True, IgnoreReason.DSN)

    if not is_substantive_body(parsed.body_text) and not parsed.has_attachments:
        return AutoDetectResult(True, IgnoreReason.EMPTY_BODY)

    return AutoDetectResult(False)


__all__ = ["IgnoreReason", "AutoDetectResult", "detect_automatic_message"]
