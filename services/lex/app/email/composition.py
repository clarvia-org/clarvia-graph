"""Multipart email composition (blueprint section 20).

This is the only production path for outgoing Lex email. The model body is
rendered from Markdown with raw HTML disabled and sanitised with bleach. The
approved continuation note and footer are appended afterwards and are never
passed through the model-body sanitiser. The composer deliberately has no BCC
parameter.
"""

from __future__ import annotations

import base64
import re
from collections.abc import Sequence
from email.message import EmailMessage
from email.policy import SMTP
from email.utils import formataddr

import bleach
from markdown_it import MarkdownIt

from app.email.templates import (
    CONTINUATION_HTML,
    CONTINUATION_TEXT,
    FOOTER_HTML,
    FOOTER_TEXT,
    LEX_FROM_ADDRESS,
    LEX_FROM_NAME,
)
from app.llm.schema import LexSource
from app.llm.source_render import linkify_citation_markers_html
from app.ops.alerts import emit_alert

_FORBIDDEN_BODY_FRAGMENTS = (
    CONTINUATION_TEXT,
    "Clarvia is a nonprofit. If you found this helpful",
    "Clarvia does not provide emergency, legal",
    "Lex may produce incomplete or incorrect information",
    "Tip: long conversation threads can become difficult for Lex",
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
) -> EmailMessage:
    """Build the complete outgoing Lex email.

    This function deliberately has no BCC parameter. Lex never reconstructs
    or sends to hidden BCC recipients.
    """
    body = validate_response_body(response_body_markdown)

    if not to_addresses:
        raise EmailCompositionError("At least one To recipient is required.")

    if len(to_addresses) + len(cc_addresses) > 10:
        raise EmailCompositionError("Visible To and CC recipient limit exceeded.")

    plain_text = (
        "\n\n".join(
            (
                body,
                CONTINUATION_TEXT,
                FOOTER_TEXT,
            )
        )
        + "\n"
    )

    html_body = "\n".join(
        (
            "<!doctype html>",
            '<html lang="en">',
            "<head>",
            '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width,initial-scale=1">',
            "</head>",
            "<body>",
            render_response_html(body, sources=sources),
            CONTINUATION_HTML,
            FOOTER_HTML,
            "</body>",
            "</html>",
        )
    )

    message = EmailMessage(policy=SMTP)
    message["From"] = formataddr((LEX_FROM_NAME, LEX_FROM_ADDRESS))
    message["To"] = ", ".join(to_addresses)

    if cc_addresses:
        message["Cc"] = ", ".join(cc_addresses)

    message["Subject"] = subject
    message["Message-ID"] = outbound_message_id
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
    html = html_part.get_content()

    if plain.count(CONTINUATION_TEXT) != 1:
        raise EmailCompositionError(
            "Plain-text continuation note is missing or duplicated."
        )

    if plain.count("Clarvia is a nonprofit.") != 1:
        raise EmailCompositionError("Plain-text footer is missing or duplicated.")

    if html.count("We're happy to help with anything else.") != 1:
        raise EmailCompositionError("HTML continuation note is missing or duplicated.")

    if html.count("Clarvia is a nonprofit.") != 1:
        raise EmailCompositionError("HTML footer is missing or duplicated.")

    if html.index("We're happy to help with anything else.") > html.index(
        "Clarvia is a nonprofit."
    ):
        raise EmailCompositionError(
            "HTML continuation note and footer are out of order."
        )

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
