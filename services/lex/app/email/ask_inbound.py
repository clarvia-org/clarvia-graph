"""Build an inbound-shaped MIME message for a clarvia.org Ask us submission.

The visitor cannot send from their own mailbox. Lex inserts this MIME into the
Lex inbox so the existing Gmail processor can run unchanged.
"""

from __future__ import annotations

from email.message import EmailMessage
from email.utils import formatdate, make_msgid

from app.email.composition import encode_for_gmail_api
from app.email.copy import email_copy, inbound_locale
from app.email.recipients import is_valid_address, normalize_address

DELIVERY_CHANNEL_HEADER = "X-Lex-Delivery-Channel"
DELIVERY_CHANNEL_WEB = "web"
ASK_LOCALE_HEADER = "X-Lex-Ask-Locale"
ASK_SUBJECT = email_copy("en")["ask_subject"]
MIN_QUESTION_CHARS = 20


class AskInboundError(ValueError):
    """Raised when a website ask cannot be turned into inbound mail."""

    def __init__(self, code: str) -> None:
        self.code = code
        super().__init__(code)


def build_ask_inbound_message(
    *,
    from_address: str,
    question: str,
    mailbox: str,
    locale: str | None = None,
) -> EmailMessage:
    """Return a plain-text inbound message From the visitor To the Lex mailbox."""
    sender = normalize_address(from_address)
    if not is_valid_address(sender):
        raise AskInboundError("invalid_email")
    body = question.strip()
    if len(body) < MIN_QUESTION_CHARS:
        raise AskInboundError("question_too_short")

    resolved = inbound_locale(locale)
    copy = email_copy(resolved)

    message = EmailMessage()
    message["From"] = sender
    message["To"] = mailbox
    message["Reply-To"] = sender
    message["Subject"] = copy["ask_subject"]
    message["Date"] = formatdate(usegmt=True)
    message["Message-ID"] = make_msgid(domain="clarvia.org")
    message[DELIVERY_CHANNEL_HEADER] = DELIVERY_CHANNEL_WEB
    message[ASK_LOCALE_HEADER] = resolved
    message.set_content(body)
    return message


def encode_ask_inbound(
    *,
    from_address: str,
    question: str,
    mailbox: str,
    locale: str | None = None,
) -> str:
    """Base64url raw MIME for Gmail ``users.messages.insert``."""
    return encode_for_gmail_api(
        build_ask_inbound_message(
            from_address=from_address,
            question=question,
            mailbox=mailbox,
            locale=locale,
        )
    )


__all__ = [
    "DELIVERY_CHANNEL_HEADER",
    "DELIVERY_CHANNEL_WEB",
    "ASK_LOCALE_HEADER",
    "ASK_SUBJECT",
    "MIN_QUESTION_CHARS",
    "AskInboundError",
    "build_ask_inbound_message",
    "encode_ask_inbound",
]
