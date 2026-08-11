"""Deterministic processing gates before any model call (Phase 3)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.domain.labels import LEX_IGNORED, LEX_RATE_LIMITED
from app.domain.models import ParsedMessage, ProcessingStatus, ReplyRecipients
from app.email.auto_detect import AutoDetectResult, detect_automatic_message
from app.email.parsing import is_substantive_body
from app.email.recipients import (
    build_reply_recipients,
    exceeds_recipient_limit,
    sender_only_recipients,
)
from app.email.templates import (
    ATTACHMENT_ONLY_BODY,
    RATE_LIMIT_BODY,
    RATE_LIMIT_SUBJECT,
    RECIPIENT_LIMIT_BODY,
    TEMPORARY_UNAVAILABILITY_BODY,
    THREAD_CLOSED_BODY,
)
from app.email.threading import reply_subject
from app.services.outbound import send_lex_reply

if TYPE_CHECKING:
    from app.config import Settings
    from app.domain.ports import GmailPort


@dataclass(frozen=True, slots=True)
class GateOutcome:
    """Result of a deterministic gate check."""

    status: str
    processing_status: ProcessingStatus | None = None
    label: str | None = None
    send_template: bool = False
    template_body: str = ""
    recipients: ReplyRecipients | None = None
    stand_alone: bool = False
    subject_override: str | None = None


PROCESS_STATUS_IGNORED = "ignored"
PROCESS_STATUS_ATTACHMENT_ONLY = "attachment_only"
PROCESS_STATUS_RECIPIENT_LIMITED = "recipient_limited"
PROCESS_STATUS_RATE_LIMITED = "rate_limited"
PROCESS_STATUS_CIRCUIT_OPEN = "circuit_open"
PROCESS_STATUS_ALLOWLIST_REJECTED = "allowlist_rejected"
PROCESS_STATUS_THREAD_CLOSED = "thread_closed"
PROCESS_STATUS_READY_FOR_MODEL = "ready_for_model"


def _lex_address_set(settings: Settings) -> frozenset[str]:
    return frozenset({settings.lex_mailbox.lower(), *settings.resolved_lex_aliases})


def check_auto_ignore(parsed: ParsedMessage, settings: Settings) -> AutoDetectResult:
    return detect_automatic_message(
        parsed,
        lex_mailbox=settings.lex_mailbox,
        lex_aliases=_lex_address_set(settings),
    )


def is_attachment_only(parsed: ParsedMessage) -> bool:
    return parsed.has_attachments and not is_substantive_body(parsed.body_text)


def send_template_reply(
    *,
    gmail: GmailPort,
    settings: Settings,
    parsed: ParsedMessage,
    recipients: ReplyRecipients,
    template_body: str,
    stand_alone: bool = False,
    subject_override: str | None = None,
) -> None:
    send_lex_reply(
        gmail=gmail,
        settings=settings,
        parsed=parsed,
        recipients=recipients,
        response_body_markdown=template_body,
        stand_alone=stand_alone,
        subject_override=subject_override,
    )


def evaluate_recipient_gate(
    parsed: ParsedMessage,
    settings: Settings,
) -> GateOutcome | None:
    recipients = build_reply_recipients(
        from_address=parsed.from_address,
        reply_to=parsed.reply_to,
        to_addresses=parsed.to_addresses,
        cc_addresses=parsed.cc_addresses,
        lex_addresses=_lex_address_set(settings),
    )
    if exceeds_recipient_limit(recipients, settings.max_visible_recipients):
        sender_only = sender_only_recipients(
            from_address=parsed.from_address,
            reply_to=parsed.reply_to,
        )
        return GateOutcome(
            status=PROCESS_STATUS_RECIPIENT_LIMITED,
            processing_status=ProcessingStatus.IGNORED,
            label=LEX_IGNORED,
            send_template=True,
            template_body=RECIPIENT_LIMIT_BODY,
            recipients=sender_only,
        )
    return None


def evaluate_attachment_gate(
    parsed: ParsedMessage,
    settings: Settings,
) -> GateOutcome | None:
    if not is_attachment_only(parsed):
        return None
    recipients = build_reply_recipients(
        from_address=parsed.from_address,
        reply_to=parsed.reply_to,
        to_addresses=parsed.to_addresses,
        cc_addresses=parsed.cc_addresses,
        lex_addresses=_lex_address_set(settings),
    )
    return GateOutcome(
        status=PROCESS_STATUS_ATTACHMENT_ONLY,
        processing_status=ProcessingStatus.SENT,
        send_template=True,
        template_body=ATTACHMENT_ONLY_BODY,
        recipients=recipients,
    )


def evaluate_rate_limit_gate(
    *,
    parsed: ParsedMessage,
    allowed: bool,
    should_send_notice: bool,
) -> GateOutcome | None:
    if allowed:
        return None
    recipients = None
    if should_send_notice:
        recipients = sender_only_recipients(
            from_address=parsed.from_address,
            reply_to=parsed.reply_to,
        )
    return GateOutcome(
        status=PROCESS_STATUS_RATE_LIMITED,
        processing_status=ProcessingStatus.RATE_LIMITED,
        label=LEX_RATE_LIMITED,
        send_template=should_send_notice,
        template_body=RATE_LIMIT_BODY,
        recipients=recipients,
        stand_alone=True,
        subject_override=RATE_LIMIT_SUBJECT,
    )


def evaluate_thread_closed_gate(
    *,
    parsed: ParsedMessage,
    settings: Settings,
    prior_lex_replies: int,
) -> GateOutcome | None:
    if prior_lex_replies < settings.max_thread_lex_replies:
        return None
    recipients = build_reply_recipients(
        from_address=parsed.from_address,
        reply_to=parsed.reply_to,
        to_addresses=parsed.to_addresses,
        cc_addresses=parsed.cc_addresses,
        lex_addresses=_lex_address_set(settings),
    )
    return GateOutcome(
        status=PROCESS_STATUS_THREAD_CLOSED,
        processing_status=ProcessingStatus.SENT,
        label=LEX_IGNORED,
        send_template=True,
        template_body=THREAD_CLOSED_BODY,
        recipients=recipients,
    )


def evaluate_allowlist_gate(
    *,
    sender_hmac: str,
    allowed_hmacs: frozenset[str],
) -> GateOutcome | None:
    if not allowed_hmacs or sender_hmac in allowed_hmacs:
        return None
    return GateOutcome(
        status=PROCESS_STATUS_ALLOWLIST_REJECTED,
        processing_status=ProcessingStatus.IGNORED,
        label=LEX_IGNORED,
        send_template=False,
    )


def evaluate_circuit_gate(
    *,
    parsed: ParsedMessage,
    settings: Settings,
    allowed: bool,
) -> GateOutcome | None:
    if allowed:
        return None
    recipients = build_reply_recipients(
        from_address=parsed.from_address,
        reply_to=parsed.reply_to,
        to_addresses=parsed.to_addresses,
        cc_addresses=parsed.cc_addresses,
        lex_addresses=_lex_address_set(settings),
    )
    return GateOutcome(
        status=PROCESS_STATUS_CIRCUIT_OPEN,
        processing_status=ProcessingStatus.SENT,
        send_template=True,
        template_body=TEMPORARY_UNAVAILABILITY_BODY,
        recipients=recipients,
    )


__all__ = [
    "GateOutcome",
    "PROCESS_STATUS_IGNORED",
    "PROCESS_STATUS_ATTACHMENT_ONLY",
    "PROCESS_STATUS_RECIPIENT_LIMITED",
    "PROCESS_STATUS_RATE_LIMITED",
    "PROCESS_STATUS_CIRCUIT_OPEN",
    "PROCESS_STATUS_ALLOWLIST_REJECTED",
    "PROCESS_STATUS_THREAD_CLOSED",
    "PROCESS_STATUS_READY_FOR_MODEL",
    "reply_subject",
    "check_auto_ignore",
    "is_attachment_only",
    "send_template_reply",
    "evaluate_recipient_gate",
    "evaluate_attachment_gate",
    "evaluate_rate_limit_gate",
    "evaluate_thread_closed_gate",
    "evaluate_allowlist_gate",
    "evaluate_circuit_gate",
]
