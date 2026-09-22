"""Approved, application-owned email text.

Every constant here is reviewed English content that the model must never
generate. Localised chrome is loaded from ``email-copy.json`` via
``app.email.copy``. These English aliases keep existing tests and call sites
working; new code should prefer ``email_copy(locale)``.
"""

from __future__ import annotations

from app.email.copy import email_copy, footer_html, footer_text, last_reply_note_html

_EN = email_copy("en")

LEX_FROM_NAME = _EN["from_name"]
LEX_FROM_ADDRESS = "lex@clarvia.org"

FOOTER_HTML = footer_html("en")
FOOTER_TEXT = footer_text("en")

# Appended after the LLM body (which already ends with Lex.) on the 5th reply.
THREAD_LAST_REPLY_NOTE = _EN["last_reply_note"]
THREAD_LAST_REPLY_NOTE_HTML = last_reply_note_html("en")

THREAD_CLOSED_BODY = _EN["thread_closed"]
RATE_LIMIT_BODY = _EN["rate_limit_body"]
RATE_LIMIT_SUBJECT = _EN["rate_limit_subject"]
RECIPIENT_LIMIT_BODY = _EN["recipient_limit_body"]
ATTACHMENT_ONLY_BODY = _EN["attachment_only_body"]
TECHNICAL_FAILURE_BODY = _EN["technical_failure_body"]
TEMPORARY_UNAVAILABILITY_BODY = _EN["temporary_unavailability_body"]


__all__ = [
    "LEX_FROM_NAME",
    "LEX_FROM_ADDRESS",
    "FOOTER_HTML",
    "FOOTER_TEXT",
    "THREAD_LAST_REPLY_NOTE",
    "THREAD_LAST_REPLY_NOTE_HTML",
    "THREAD_CLOSED_BODY",
    "RATE_LIMIT_BODY",
    "RATE_LIMIT_SUBJECT",
    "RECIPIENT_LIMIT_BODY",
    "ATTACHMENT_ONLY_BODY",
    "TECHNICAL_FAILURE_BODY",
    "TEMPORARY_UNAVAILABILITY_BODY",
]
