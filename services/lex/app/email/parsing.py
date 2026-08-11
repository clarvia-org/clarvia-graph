"""MIME parsing, body cleaning, and conversation-thread assembly."""

from __future__ import annotations

import re
from dataclasses import dataclass
from email import policy
from email.message import EmailMessage, Message
from email.parser import BytesParser
from email.utils import getaddresses, parsedate_to_datetime
from typing import Any, cast

from app.domain.models import (
    AttachmentMeta,
    ConversationMessage,
    ConversationRole,
    ParsedMessage,
)

MAX_MIME_PARTS = 100
MAX_ATTACHMENTS_RECORDED = 25
_TRUNCATION_MARKER = "[Earlier thread messages omitted due to length.]"

_RELEVANCE_RE = re.compile(
    r"(?i)\b("
    r"mother|father|spouse|husband|wife|partner|son|daughter|parent|brother|"
    r"sister|family|relative|"
    r"died|death|dying|deceased|hospice|palliative|funeral|burial|cremation|"
    r"repatriation|certificate|declaration|commune|notary|"
    r"nationality|citizen|passport|residence|resident|"
    r"bank|pension|estate|inheritance|will|asset|property|"
    r"already|completed|done|obtained|contacted|arranged"
    r")\b"
)


@dataclass(frozen=True, slots=True)
class ParseLimits:
    max_body_chars: int = 100_000
    max_thread_chars: int = 120_000
    max_mime_parts: int = MAX_MIME_PARTS
    max_attachments_recorded: int = MAX_ATTACHMENTS_RECORDED


def decode_mime_header(value: str | None) -> str:
    if not value:
        return ""
    from email.header import decode_header, make_header

    try:
        return str(make_header(decode_header(value)))
    except Exception:
        return value


def html_to_visible_text(html: str) -> str:
    text = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", html)
    text = re.sub(
        r"(?is)<[^>]+(?:style\s*=\s*[\"'][^\"']*display\s*:\s*none[^\"']*[\"']|"
        r"hidden)[^>]*>.*?</[^>]+>",
        " ",
        text,
    )
    text = re.sub(r"(?is)<img\b[^>]*>", " ", text)
    text = re.sub(r"(?i)<br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</p>", "\n\n", text)
    text = re.sub(r"(?i)</div>", "\n", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def strip_quoted_history(text: str) -> str:
    lines = text.splitlines()
    kept: list[str] = []
    for line in lines:
        if re.match(r"^>+", line):
            break
        if re.match(r"(?i)^On .+ wrote:$", line.strip()):
            break
        if re.match(r"(?i)^Le .+ a écrit\s*:$", line.strip()):
            break
        if re.match(r"(?i)^From:\s+", line):
            break
        kept.append(line)
    return "\n".join(kept).rstrip()


def strip_lex_boilerplate(text: str) -> str:
    """Remove prior Lex continuation/footer blocks when quoted back."""
    patterns = (
        r"(?is)\nWe're happy to help with anything else\..*$",
        r"(?is)\nClarvia is a nonprofit\..*$",
        r"(?is)\n-{3,}\s*\nClarvia is a nonprofit\..*$",
    )
    cleaned = text
    for pattern in patterns:
        cleaned = re.sub(pattern, "", cleaned)
    return cleaned.rstrip()


def strip_signature(text: str) -> str:
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if line.strip() == "--":
            return "\n".join(lines[:index]).rstrip()
        if re.match(r"(?i)^sent from my (iphone|ipad|android)", line.strip()):
            return "\n".join(lines[:index]).rstrip()
    return text.rstrip()


def clean_body_text(text: str) -> str:
    cleaned = strip_quoted_history(text)
    cleaned = strip_lex_boilerplate(cleaned)
    cleaned = strip_signature(cleaned)
    return cleaned.strip()


def truncate_text(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + "\n[Message truncated.]"


def is_substantive_body(text: str) -> bool:
    """True when the cleaned body contains more than signature/attachment refs."""
    stripped = re.sub(r"\s+", "", text)
    if not stripped:
        return False
    attachment_only = re.fullmatch(
        r"(?i)(attached|attachment|see attached|please find attached|"
        r"files? attached|enclosed)\.?",
        text.strip(),
    )
    return attachment_only is None


def _decode_payload(part: Message) -> str:
    payload = part.get_payload(decode=True)
    if payload is None:
        raw = part.get_payload()
        return raw if isinstance(raw, str) else ""
    if not isinstance(payload, bytes | bytearray):
        return str(payload)
    data = bytes(payload)
    charset = part.get_content_charset() or "utf-8"
    for encoding in (charset, "utf-8", "latin-1"):
        try:
            return data.decode(encoding, errors="replace")
        except (LookupError, UnicodeError):
            continue
    return data.decode("utf-8", errors="replace")


def _walk_parts(
    message: Message,
    *,
    limits: ParseLimits,
) -> tuple[str, str, list[AttachmentMeta], int]:
    """Return plain text, html text, attachment metadata, and part count."""
    plain_parts: list[str] = []
    html_parts: list[str] = []
    attachments: list[AttachmentMeta] = []
    part_count = 0

    def visit(part: Message) -> None:
        nonlocal part_count
        part_count += 1
        if part_count > limits.max_mime_parts:
            return
        if part.is_multipart():
            payload = part.get_payload()
            if not isinstance(payload, list):
                return
            for child in payload:
                if isinstance(child, Message):
                    visit(child)
            return

        content_type = part.get_content_type()
        disposition = str(part.get("Content-Disposition", "")).lower()
        filename = part.get_filename() or ""
        if filename:
            filename = decode_mime_header(filename)

        if "attachment" in disposition or (
            filename and content_type not in {"text/plain", "text/html"}
        ):
            if len(attachments) < limits.max_attachments_recorded:
                size_header = part.get("Content-Length")
                size = (
                    int(size_header) if size_header and size_header.isdigit() else None
                )
                attachments.append(
                    AttachmentMeta(
                        filename=filename or "attachment",
                        mime_type=content_type,
                        size=size,
                    )
                )
            return

        if content_type == "text/plain":
            plain_parts.append(_decode_payload(part))
        elif content_type == "text/html":
            html_parts.append(_decode_payload(part))

    visit(message)
    return (
        "\n\n".join(plain_parts).strip(),
        "\n\n".join(html_parts).strip(),
        attachments,
        part_count,
    )


def _first_address(header_value: str | None) -> str:
    if not header_value:
        return ""
    addresses = getaddresses([header_value])
    return addresses[0][1].strip() if addresses else ""


def _extract_addresses(header_value: str | None) -> tuple[str, ...]:
    if not header_value:
        return ()
    return tuple(
        address.strip()
        for _name, address in getaddresses([header_value])
        if address.strip()
    )


def _normalise_date_header(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        return parsed.date().isoformat()
    except (TypeError, ValueError, IndexError, OverflowError):
        return value.strip()[:32] or None


def parse_raw_message(
    raw: bytes,
    *,
    message_id: str,
    thread_id: str,
    limits: ParseLimits,
) -> ParsedMessage:
    """Parse raw RFC 822 bytes into structured fields."""

    parser = BytesParser(policy=cast(Any, policy.default))
    try:
        message = parser.parsebytes(raw)
    except Exception:
        message = EmailMessage()

    if not message.get("From"):
        return ParsedMessage(
            message_id=message_id,
            thread_id=thread_id,
            from_address="",
            reply_to=None,
            to_addresses=(),
            cc_addresses=(),
            subject="",
            raw_subject="",
            body_text="",
        )

    plain, html, attachments, _part_count = _walk_parts(message, limits=limits)
    if plain:
        body_source = plain
    elif html:
        body_source = html_to_visible_text(html)
    else:
        body_source = ""

    body_cleaned = truncate_text(clean_body_text(body_source), limits.max_body_chars)
    raw_subject = decode_mime_header(message.get("Subject"))
    references_header = message.get("References", "")
    references = tuple(references_header.split()) if references_header else ()

    return ParsedMessage(
        message_id=message_id,
        thread_id=thread_id,
        from_address=_first_address(message.get("From")),
        reply_to=_first_address(message.get("Reply-To")) or None,
        to_addresses=_extract_addresses(message.get("To")),
        cc_addresses=_extract_addresses(message.get("Cc")),
        subject=raw_subject,
        raw_subject=raw_subject,
        body_text=body_cleaned,
        has_attachments=bool(attachments),
        attachment_meta=tuple(attachments),
        message_id_header=message.get("Message-ID"),
        date_header=_normalise_date_header(message.get("Date")),
        in_reply_to=message.get("In-Reply-To"),
        references=references,
        auto_submitted=message.get("Auto-Submitted"),
        list_id=message.get("List-Id"),
        return_path=message.get("Return-Path"),
        precedence=message.get("Precedence"),
    )


def message_is_relevant(text: str) -> bool:
    """True when a prior turn likely carries material situation facts."""
    return bool(_RELEVANCE_RE.search(text))


def build_conversation_thread(
    messages: list[tuple[ConversationRole, str]]
    | list[ConversationMessage],
    *,
    max_thread_chars: int,
) -> list[ConversationMessage]:
    """Build a chronological conversation list with relevance-aware truncation."""
    items: list[ConversationMessage] = []
    for entry in messages:
        if isinstance(entry, ConversationMessage):
            if entry.text.strip():
                items.append(
                    ConversationMessage(
                        role=entry.role,
                        text=entry.text.strip(),
                        message_id=entry.message_id,
                        date=entry.date,
                    )
                )
            continue
        role, text = entry
        if text.strip():
            items.append(ConversationMessage(role=role, text=text.strip()))

    total = sum(len(item.text) for item in items)
    if total <= max_thread_chars:
        return items
    if not items:
        return []
    if len(items) == 1:
        text = truncate_text(items[0].text, max_thread_chars)
        return [
            ConversationMessage(
                role=items[0].role,
                text=text,
                message_id=items[0].message_id,
                date=items[0].date,
            )
        ]

    first = items[0]
    middle = items[1:]
    marker_cost = len(_TRUNCATION_MARKER) + 2
    budget = max_thread_chars - marker_cost
    first_budget = min(len(first.text), max(budget // 4, 200))
    remaining = budget - first_budget

    selected_indexes: list[int] = []
    used = 0
    for index in range(len(middle) - 1, -1, -1):
        size = len(middle[index].text)
        if used + size > remaining:
            continue
        selected_indexes.append(index)
        used += size

    selected_set = set(selected_indexes)
    for index, item in enumerate(middle):
        if index in selected_set:
            continue
        if not message_is_relevant(item.text):
            continue
        size = len(item.text)
        if used + size > remaining:
            continue
        selected_indexes.append(index)
        selected_set.add(index)
        used += size

    kept = [middle[index] for index in sorted(selected_indexes)]
    result: list[ConversationMessage] = [
        ConversationMessage(
            role=first.role,
            text=truncate_text(first.text, first_budget),
            message_id=first.message_id,
            date=first.date,
        ),
        ConversationMessage(role=ConversationRole.USER, text=_TRUNCATION_MARKER),
    ]
    result.extend(kept)
    return result


__all__ = [
    "MAX_MIME_PARTS",
    "MAX_ATTACHMENTS_RECORDED",
    "ParseLimits",
    "decode_mime_header",
    "html_to_visible_text",
    "strip_quoted_history",
    "strip_lex_boilerplate",
    "strip_signature",
    "clean_body_text",
    "truncate_text",
    "is_substantive_body",
    "parse_raw_message",
    "message_is_relevant",
    "build_conversation_thread",
]
