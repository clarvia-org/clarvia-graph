"""Multipart email composition (blueprint section 20).

This is the only production path for outgoing Lex email. The model body is
rendered from Markdown with raw HTML disabled and sanitised with bleach. The
approved footer is appended afterwards and is never passed through the
model-body sanitiser. Optional thread-limit notes and quoted history are
application-owned. The composer deliberately has no BCC parameter.
"""

from __future__ import annotations

import base64
import html
import re
from collections.abc import Sequence
from email.message import EmailMessage
from email.policy import SMTP
from email.utils import formataddr

import bleach
from markdown_it import MarkdownIt

from app.email.templates import (
    FOOTER_HTML,
    FOOTER_TEXT,
    LEX_FROM_ADDRESS,
    LEX_FROM_NAME,
    THREAD_LAST_REPLY_NOTE,
    THREAD_LAST_REPLY_NOTE_HTML,
)
from app.llm.schema import LexSource
from app.llm.source_render import linkify_citation_markers_html
from app.ops.alerts import emit_alert

_FORBIDDEN_BODY_FRAGMENTS = (
    "We're happy to help with anything else",
    "Clarvia is a nonprofit. If you found this helpful",
    "Clarvia does not provide emergency, legal",
    "Lex may produce incomplete or incorrect information",
    "Tip: Lex can continue a conversation for up to",
    "Tip: long conversation threads can become difficult for Lex",
    THREAD_LAST_REPLY_NOTE,
)

_ALLOWED_TAGS = {
    "p",
    "br",
    "strong",
    "em",
    "ul",
    "ol",
    "li",
    "a",
    "h2",
    "h3",
    "blockquote",
}

_ALLOWED_ATTRIBUTES = {
    "a": ["href", "title"],
}

_ALLOWED_PROTOCOLS = {
    "https",
    "mailto",
}

_MARKDOWN = MarkdownIt(
    "commonmark",
    {
        "html": False,
        "linkify": True,
        "breaks": True,
    },
)


class EmailCompositionError(ValueError):
    """Raised when a response cannot safely be composed."""


def validate_response_body(body_markdown: str) -> str:
    body = body_markdown.strip()

    if not body:
        raise EmailCompositionError("Response body is empty.")

    if not re.search(r"(?:^|\n)Lex\.\s*$", body):
        raise EmailCompositionError(
            "Response body must end with 'Lex.' on its own line."
        )

    if "\u2014" in body:
        raise EmailCompositionError("Response body contains an em dash.")

    for fragment in _FORBIDDEN_BODY_FRAGMENTS:
        if fragment.casefold() in body.casefold():
            raise EmailCompositionError(
                "Response body contains application-managed content."
            )

    return body


def render_response_html(
    body_markdown: str,
    *,
    sources: Sequence[LexSource] | None = None,
) -> str:
    validated = validate_response_body(body_markdown)
    rendered = _MARKDOWN.render(validated)

    sanitised = bleach.clean(
        rendered,
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRIBUTES,
        protocols=_ALLOWED_PROTOCOLS,
        strip=True,
    )

    if sources:
        sanitised = linkify_citation_markers_html(sanitised, sources)

    return (
        '<div style="font-family:sans-serif;font-size:14px;'
        'line-height:1.55;color:#222">'
        f"{sanitised}"
        "</div>"
    )


def compose_lex_email(
    *,
    response_body_markdown: str,
    to_addresses: Sequence[str],
    cc_addresses: Sequence[str],
    subject: str,
    outbound_message_id: str,
    in_reply_to: str,
    references: Sequence[str],
    request_id: str,
    prompt_version: str,
    pipeline_version: str | None = None,
    sources: Sequence[LexSource] | None = None,
    after_body_note: str | None = None,
    thread_quote_plain: str | None = None,
    thread_quote_html: str | None = None,
    stand_alone: bool = False,
) -> EmailMessage:
    """Build the complete outgoing Lex email.

    Assembly: body → optional thread-limit note → footer → optional quote.
    This function deliberately has no BCC parameter.
    """
    body = validate_response_body(response_body_markdown)

    if not to_addresses:
        raise EmailCompositionError("At least one To recipient is required.")

    if len(to_addresses) + len(cc_addresses) > 10:
        raise EmailCompositionError("Visible To and CC recipient limit exceeded.")

    note_plain = ""
    note_html = ""
    if after_body_note:
        note = after_body_note.strip()
        if note == THREAD_LAST_REPLY_NOTE:
            note_plain = note
            note_html = THREAD_LAST_REPLY_NOTE_HTML
        else:
            note_plain = note
            note_html = (
                '<p style="margin:24px 0 0;font-family:sans-serif;'
                'font-size:14px;color:#222">'
                f"{html.escape(note).replace(chr(10), '<br>')}"
                "</p>"
            )

    quote_plain = (thread_quote_plain or "").strip()
    quote_html = (thread_quote_html or "").strip()
    if bool(quote_plain) != bool(quote_html):
        raise EmailCompositionError(
            "thread_quote_plain and thread_quote_html must both be set or both empty."
        )

    plain_parts = [body]
    if note_plain:
        plain_parts.append(note_plain)
    plain_parts.append(FOOTER_TEXT)
    if quote_plain:
        plain_parts.append(quote_plain)
    plain_text = "\n\n".join(plain_parts) + "\n"

    html_parts = [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        "</head>",
        "<body>",
        render_response_html(body, sources=sources),
    ]
    if note_html:
        html_parts.append(note_html)
    html_parts.append(FOOTER_HTML)
    if quote_html:
        html_parts.append(quote_html)
    html_parts.extend(["</body>", "</html>"])
    html_body = "\n".join(html_parts)

    message = EmailMessage(policy=SMTP)
    message["From"] = formataddr((LEX_FROM_NAME, LEX_FROM_ADDRESS))
    message["To"] = ", ".join(to_addresses)

    if cc_addresses:
        message["Cc"] = ", ".join(cc_addresses)

    message["Subject"] = subject
    message["Message-ID"] = outbound_message_id

    if not stand_alone:
        if in_reply_to:
            message["In-Reply-To"] = in_reply_to
        if references:
            message["References"] = " ".join(references)

    message["Auto-Submitted"] = "auto-replied"
    message["X-Auto-Response-Suppress"] = "All"
    message["X-Lex-Version"] = "1"
    message["X-Lex-Request-ID"] = request_id
    message["X-Lex-Prompt-Version"] = prompt_version
    if pipeline_version:
        message["X-Lex-Pipeline-Version"] = pipeline_version
    if stand_alone:
        message["X-Lex-Stand-Alone"] = "1"

    message.set_content(
        plain_text,
        subtype="plain",
        charset="utf-8",
    )
    message.add_alternative(
        html_body,
        subtype="html",
        charset="utf-8",
    )

    verify_composed_email(message)
    return message


def verify_composed_email(message: EmailMessage) -> None:
    """Fail closed if approved content is missing, duplicated, or reordered."""
    try:
        _verify_composed_email(message)
    except EmailCompositionError:
        emit_alert(
            "composition_invalid",
            severity="critical",
            error_code="missing_footer_or_continuation",
        )
        raise


def _verify_composed_email(message: EmailMessage) -> None:
    if message.get_content_type() != "multipart/alternative":
        raise EmailCompositionError("Outgoing email is not multipart/alternative.")

    parts = list(message.iter_parts())

    if len(parts) != 2:
        raise EmailCompositionError(
            "Outgoing email must contain exactly two alternatives."
        )

    plain_part = next(
        (part for part in parts if part.get_content_type() == "text/plain"),
        None,
    )
    html_part = next(
        (part for part in parts if part.get_content_type() == "text/html"),
        None,
    )

    if plain_part is None or html_part is None:
        raise EmailCompositionError(
            "Both plain-text and HTML alternatives are required."
        )

    plain = plain_part.get_content()
    html_content = html_part.get_content()

    if plain.count("Clarvia is a nonprofit.") != 1:
        raise EmailCompositionError("Plain-text footer is missing or duplicated.")

    if html_content.count("Clarvia is a nonprofit.") != 1:
        raise EmailCompositionError("HTML footer is missing or duplicated.")

    if "We're happy to help with anything else." in plain:
        raise EmailCompositionError("Legacy continuation note must not appear.")
    if "We're happy to help with anything else." in html_content:
        raise EmailCompositionError("Legacy continuation note must not appear.")

    if "Bcc" in message:
        raise EmailCompositionError("The composer must not create a Bcc header.")


def encode_for_gmail_api(message: EmailMessage) -> str:
    """Convert an EmailMessage into Gmail API's base64url raw representation."""
    return base64.urlsafe_b64encode(message.as_bytes()).decode("ascii")


__all__ = [
    "EmailCompositionError",
    "validate_response_body",
    "render_response_html",
    "compose_lex_email",
    "verify_composed_email",
    "encode_for_gmail_api",
]
