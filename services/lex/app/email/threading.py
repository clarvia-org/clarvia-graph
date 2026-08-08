"""Gmail threading header helpers (blueprint section 20.1)."""

from __future__ import annotations

import re

from app.domain.models import ParsedMessage


def reply_subject(subject: str) -> str:
    cleaned = subject.strip()
    if not cleaned:
        return "Re: Your message to Lex"
    if re.match(r"^re:\s", cleaned, re.IGNORECASE):
        return cleaned
    return f"Re: {cleaned}"


def in_reply_to_header(parsed: ParsedMessage) -> str:
    """RFC Message-ID of the inbound message, or empty when Gmail omitted it.

    When the header is missing the reply still sends with ``threadId``; clients
    may not thread as reliably without ``In-Reply-To``.
    """
    return parsed.message_id_header or ""


def build_references(parsed: ParsedMessage) -> tuple[str, ...]:
    """Prior ``References`` chain plus the inbound Message-ID when present."""
    refs = list(parsed.references)
    message_id = parsed.message_id_header
    if message_id and message_id not in refs:
        refs.append(message_id)
    return tuple(refs)


__all__ = ["reply_subject", "in_reply_to_header", "build_references"]
