"""Build truncated prior-thread quotes for human-visible outbound mail."""

from __future__ import annotations

from collections.abc import Sequence
from html import escape

from app.domain.models import ParsedMessage
from app.email.parsing import strip_lex_boilerplate
from app.email.templates import LEX_FROM_ADDRESS, LEX_FROM_NAME


def _truncate(text: str, max_chars: int) -> str:
    cleaned = text.strip()
    if len(cleaned) <= max_chars:
        return cleaned
    return cleaned[: max(0, max_chars - 20)].rstrip() + "\n…message truncated"


def count_lex_replies(
    thread_messages: Sequence[ParsedMessage],
    *,
    lex_addresses: frozenset[str],
) -> int:
    """Count prior Lex outbound messages in a thread (model or template)."""
    count = 0
    for parsed in thread_messages:
        sender = parsed.from_address.strip().lower()
        if sender and sender in lex_addresses:
            count += 1
    return count


def build_thread_quote(
    thread_messages: Sequence[ParsedMessage],
    *,
    latest_message_id: str,
    lex_addresses: frozenset[str],
    max_chars_per_message: int = 2000,
    max_total_chars: int = 40_000,
    include_latest: bool = False,
) -> tuple[str, str]:
    """Return ``(plain, html)`` quote block, or empty strings when nothing to quote.

    Quotes prior cleaned turns only (excludes the inbound message being answered)
    unless ``include_latest`` is true — required for clarvia.org asks, because the
    visitor never received the inserted inbound copy.
    Lex continuation/footer boilerplate is stripped from quoted Lex turns.
    """
    entries: list[tuple[str, str]] = []
    for parsed in thread_messages:
        if parsed.message_id == latest_message_id and not include_latest:
            continue
        body = strip_lex_boilerplate(parsed.body_text).strip()
        if not body:
            continue
        sender = parsed.from_address.strip().lower()
        if sender and sender in lex_addresses:
            label = f"{LEX_FROM_NAME} <{LEX_FROM_ADDRESS}>"
        else:
            label = parsed.from_address or "Sender"
        date = (parsed.date_header or "").strip()
        header = f"On {date}, {label} wrote:" if date else f"{label} wrote:"
        entries.append((header, _truncate(body, max_chars_per_message)))

    if not entries:
        return "", ""

    def _pack(items: Sequence[tuple[str, str]]) -> str:
        return "\n\n".join(f"{header}\n{body}" for header, body in items)

    selected = list(entries)
    packed = _pack(selected)
    if len(packed) > max_total_chars and len(selected) > 2:
        newest: list[tuple[str, str]] = []
        for item in reversed(selected[1:]):
            trial = [selected[0], *reversed(newest + [item])]
            if len(_pack(trial)) <= max_total_chars:
                newest.append(item)
            else:
                break
        selected = [selected[0], *reversed(newest)]
        packed = _pack(selected)
    if len(packed) > max_total_chars:
        header, body = selected[0]
        budget = max(40, max_total_chars - len(header) - 1)
        selected = [(header, _truncate(body, budget))]
        packed = _pack(selected)

    plain = (
        "────────────────────────────────\n"
        "Previous messages in this conversation\n\n"
        f"{packed}"
    )

    html_blocks = [
        '<div style="margin-top:28px;padding-top:16px;border-top:1px solid #ddd;'
        'font-family:sans-serif;font-size:13px;color:#555">',
        '<p style="margin:0 0 12px;font-weight:600;color:#333">'
        "Previous messages in this conversation</p>",
    ]
    for header, body in selected:
        html_blocks.append(
            '<div style="margin:0 0 16px">'
            f'<p style="margin:0 0 6px;color:#666">{escape(header)}</p>'
            '<blockquote style="margin:0;padding-left:12px;'
            'border-left:3px solid #ddd;white-space:pre-wrap">'
            f"{escape(body)}</blockquote></div>"
        )
    html_blocks.append("</div>")
    return plain, "\n".join(html_blocks)


__all__ = ["build_thread_quote", "count_lex_replies"]
