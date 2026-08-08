"""Unified outbound Lex reply send path (Phase 5).

Every production reply — model answers and template gate replies — flows through
:func:`send_lex_reply` so threading, MIME composition, and send idempotency are
applied consistently.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.domain.errors import GmailSendUncertainError
from app.domain.ids import outbound_message_id, request_id_for_message
from app.domain.models import ParsedMessage, ReplyRecipients
from app.domain.ports import GmailPort
from app.email.composition import compose_lex_email, encode_for_gmail_api
from app.email.threading import build_references, in_reply_to_header, reply_subject
from app.llm.schema import LexSource

if TYPE_CHECKING:
    from app.config import Settings


@dataclass(frozen=True, slots=True)
class SendResult:
    """Outcome of an outbound send attempt."""

    sent_gmail_message_id: str
    outbound_message_id: str
    request_id: str
    already_sent: bool = False


def _find_existing_outbound(
    gmail: GmailPort,
    *,
    thread_id: str,
    outbound_id: str,
    request_id: str,
) -> str | None:
    return gmail.find_outbound_in_thread(
        thread_id=thread_id,
        outbound_message_id=outbound_id,
        request_id=request_id,
    )


def send_lex_reply(
    *,
    gmail: GmailPort,
    settings: Settings,
    parsed: ParsedMessage,
    recipients: ReplyRecipients,
    response_body_markdown: str,
    sources: Sequence[LexSource] | None = None,
    prompt_version: str | None = None,
    pipeline_version: str | None = None,
) -> SendResult:
    """Compose, thread, and send a Lex reply with send idempotency."""
    message_key = parsed.message_id
    outbound_id = outbound_message_id(message_key)
    request_id = request_id_for_message(message_key)

    existing = _find_existing_outbound(
        gmail,
        thread_id=parsed.thread_id,
        outbound_id=outbound_id,
        request_id=request_id,
    )
    if existing is not None:
        return SendResult(
            sent_gmail_message_id=existing,
            outbound_message_id=outbound_id,
            request_id=request_id,
            already_sent=True,
        )

    composed = compose_lex_email(
        response_body_markdown=response_body_markdown,
        to_addresses=recipients.to_addresses,
        cc_addresses=recipients.cc_addresses,
        subject=reply_subject(parsed.subject),
        outbound_message_id=outbound_id,
        in_reply_to=in_reply_to_header(parsed),
        references=build_references(parsed),
        request_id=request_id,
        prompt_version=prompt_version or settings.prompt_version,
        pipeline_version=pipeline_version,
        sources=sources,
    )
    raw = encode_for_gmail_api(composed)

    existing = _find_existing_outbound(
        gmail,
        thread_id=parsed.thread_id,
        outbound_id=outbound_id,
        request_id=request_id,
    )
    if existing is not None:
        return SendResult(
            sent_gmail_message_id=existing,
            outbound_message_id=outbound_id,
            request_id=request_id,
            already_sent=True,
        )

    try:
        sent_id = gmail.send_reply(raw_message=raw, thread_id=parsed.thread_id)
    except GmailSendUncertainError:
        recovered = _find_existing_outbound(
            gmail,
            thread_id=parsed.thread_id,
            outbound_id=outbound_id,
            request_id=request_id,
        )
        if recovered is not None:
            return SendResult(
                sent_gmail_message_id=recovered,
                outbound_message_id=outbound_id,
                request_id=request_id,
                already_sent=True,
            )
        raise

    return SendResult(
        sent_gmail_message_id=sent_id,
        outbound_message_id=outbound_id,
        request_id=request_id,
        already_sent=False,
    )


__all__ = ["SendResult", "send_lex_reply"]
