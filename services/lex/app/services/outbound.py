"""Unified outbound Lex reply send path (Phase 5).

Every production reply — model answers and template gate replies — flows through
:func:`send_lex_reply` so MIME composition and send idempotency are applied
consistently. Stand-alone sends (daily limit) omit Gmail thread joining.
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
    if not thread_id:
        return None
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
    after_body_note: str | None = None,
    thread_quote_plain: str | None = None,
    thread_quote_html: str | None = None,
    stand_alone: bool = False,
    subject_override: str | None = None,
) -> SendResult:
    """Compose and send a Lex reply (threaded) or stand-alone notice."""
    message_key = parsed.message_id
    outbound_id = outbound_message_id(message_key)
    request_id = request_id_for_message(message_key)
    thread_id = "" if stand_alone else parsed.thread_id

    if not stand_alone:
        existing = _find_existing_outbound(
            gmail,
            thread_id=thread_id,
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

    subject = subject_override if subject_override else reply_subject(parsed.subject)
    composed = compose_lex_email(
        response_body_markdown=response_body_markdown,
        to_addresses=recipients.to_addresses,
        cc_addresses=() if stand_alone else recipients.cc_addresses,
        subject=subject,
        outbound_message_id=outbound_id,
        in_reply_to="" if stand_alone else in_reply_to_header(parsed),
        references=() if stand_alone else build_references(parsed),
        request_id=request_id,
        prompt_version=prompt_version or settings.prompt_version,
        pipeline_version=pipeline_version,
        sources=sources,
        after_body_note=after_body_note,
        thread_quote_plain=thread_quote_plain,
        thread_quote_html=thread_quote_html,
        stand_alone=stand_alone,
    )
    raw = encode_for_gmail_api(composed)

    if not stand_alone:
        existing = _find_existing_outbound(
            gmail,
            thread_id=thread_id,
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
        sent_id = gmail.send_reply(
            raw_message=raw,
            thread_id=None if stand_alone else thread_id,
        )
    except GmailSendUncertainError:
        if stand_alone:
            raise
        recovered = _find_existing_outbound(
            gmail,
            thread_id=thread_id,
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
