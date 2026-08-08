"""Build model conversation history from a Gmail thread (blueprint §12)."""

from __future__ import annotations

from collections.abc import Sequence

from app.config import Settings
from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.email.parsing import build_conversation_thread


def _lex_address_set(settings: Settings) -> frozenset[str]:
    return frozenset(
        {
            settings.lex_mailbox.lower(),
            *settings.resolved_lex_aliases,
        }
    )


def role_for_parsed_message(
    parsed: ParsedMessage, *, lex_addresses: frozenset[str]
) -> ConversationRole:
    """Classify a thread message as USER or LEX from the From address."""
    sender = parsed.from_address.strip().lower()
    if sender and sender in lex_addresses:
        return ConversationRole.ASSISTANT
    return ConversationRole.USER


def prior_thread_history(
    thread_messages: Sequence[ParsedMessage],
    *,
    latest_message_id: str,
    settings: Settings,
) -> list[ConversationMessage]:
    """Return chronological prior turns for ``<CONVERSATION_HISTORY>``.

    The latest inbound message is supplied separately as
    ``<LATEST_USER_MESSAGE>`` and is excluded here. Quoted Gmail history is
    already stripped per-message by :func:`parse_raw_message`.
    """
    lex_addresses = _lex_address_set(settings)
    turns: list[ConversationMessage] = []
    for parsed in thread_messages:
        if parsed.message_id == latest_message_id:
            continue
        text = parsed.body_text.strip()
        if not text:
            continue
        turns.append(
            ConversationMessage(
                role=role_for_parsed_message(parsed, lex_addresses=lex_addresses),
                text=text,
                message_id=parsed.message_id,
                date=parsed.date_header,
            )
        )
    return build_conversation_thread(
        turns, max_thread_chars=settings.max_thread_chars
    )


__all__ = [
    "prior_thread_history",
    "role_for_parsed_message",
]
