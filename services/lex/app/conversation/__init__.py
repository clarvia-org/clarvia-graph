"""Research and writer input envelopes for the two-pass pipeline."""

from __future__ import annotations

import json
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime

from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.llm.redact import redact_sensitive_text
from app.llm.research_schema import LexResearchBrief
from app.services.thread_context import prior_thread_history


@dataclass(frozen=True, slots=True)
class CleanedConversation:
    latest_user_message: str
    prior_messages: list[ConversationMessage]
    conversation_message_count: int
    conversation_truncated: bool
    conversation_text: str


def prepare_cleaned_conversation(
    *,
    parsed: ParsedMessage,
    thread_messages: Sequence[ParsedMessage],
    settings: object,
) -> CleanedConversation:
    """Build cleaned latest message + prior history for the research call."""
    history = prior_thread_history(
        thread_messages,
        latest_message_id=parsed.message_id,
        settings=settings,  # type: ignore[arg-type]
    )
    latest = redact_sensitive_text(parsed.body_text.strip())
    truncated = any(
        "[Earlier thread messages omitted due to length.]" in message.text
        for message in history
    )
    conversation_text = "\n".join(
        [latest, *(message.text for message in history)]
    )
    return CleanedConversation(
        latest_user_message=latest,
        prior_messages=history,
        conversation_message_count=len(history) + 1,
        conversation_truncated=truncated,
        conversation_text=conversation_text,
    )


def _format_history_message(message: ConversationMessage) -> str:
    role = "USER" if message.role is ConversationRole.USER else "LEX"
    attrs = [f'role="{role}"']
    if message.date:
        attrs.append(f'date="{message.date}"')
    if message.message_id:
        attrs.append(f'message_id="{message.message_id}"')
    attr_text = " ".join(attrs)
    return (
        f"<message {attr_text}>\n"
        f"{redact_sensitive_text(message.text)}\n"
        "</message>"
    )


def build_research_envelope(
    *,
    cleaned: CleanedConversation,
    parsed: ParsedMessage,
    current_date_utc: datetime,
    research_prompt_version: str = "lex-research-v1",
    correction: str | None = None,
) -> str:
    history = "\n\n".join(
        _format_history_message(message) for message in cleaned.prior_messages
    )
    subject = redact_sensitive_text(parsed.subject.strip())
    correction_block = ""
    if correction:
        correction_block = (
            "\n\n<CORRECTION>\n"
            f"{correction}\n"
            "</CORRECTION>"
        )
    return (
        "<SYSTEM_CONTROLLED_CONTEXT>\n"
        f"current_date_utc: {current_date_utc.strftime('%Y-%m-%d')}\n"
        "service_timezone: Europe/Luxembourg\n"
        f"delivery_channel: {parsed.delivery_channel}\n"
        f"research_prompt_version: {research_prompt_version}\n"
        f"conversation_id: {parsed.thread_id}\n"
        f"latest_message_id: {parsed.message_id}\n"
        f"conversation_message_count: {cleaned.conversation_message_count}\n"
        f"conversation_truncated: {str(cleaned.conversation_truncated).lower()}\n"
        "</SYSTEM_CONTROLLED_CONTEXT>\n\n"
        "<LATEST_USER_MESSAGE>\n"
        "<subject>\n"
        f"{subject}\n"
        "</subject>\n\n"
        "<body>\n"
        f"{cleaned.latest_user_message}\n"
        "</body>\n"
        "</LATEST_USER_MESSAGE>\n\n"
        "<CONVERSATION_HISTORY>\n"
        f"{history}\n"
        "</CONVERSATION_HISTORY>"
        f"{correction_block}"
    )


def select_relevant_writer_history(
    cleaned: CleanedConversation,
    *,
    max_messages: int = 4,
    max_chars: int = 20_000,
) -> list[ConversationMessage]:
    """Return a short prior-history slice for natural writer references."""
    if not cleaned.prior_messages:
        return []
    selected: list[ConversationMessage] = []
    used = 0
    for message in reversed(cleaned.prior_messages):
        if (
            "[Earlier thread messages omitted due to length.]" in message.text
        ):
            continue
        size = len(message.text)
        if used + size > max_chars:
            break
        selected.insert(0, message)
        used += size
        if len(selected) >= max_messages:
            break
    return selected


def build_writer_envelope(
    *,
    latest_user_message: str,
    relevant_history: Sequence[ConversationMessage],
    brief: LexResearchBrief,
    correction: str | None = None,
) -> str:
    history = "\n\n".join(
        _format_history_message(message) for message in relevant_history
    )
    correction_block = ""
    if correction:
        correction_block = (
            "\n\n<CORRECTION>\n"
            f"{correction}\n"
            "</CORRECTION>"
        )
    return (
        "<LATEST_USER_MESSAGE>\n"
        f"{redact_sensitive_text(latest_user_message)}\n"
        "</LATEST_USER_MESSAGE>\n\n"
        "<RELEVANT_CONVERSATION>\n"
        f"{history}\n"
        "</RELEVANT_CONVERSATION>\n\n"
        "<VERIFIED_RESEARCH_BRIEF>\n"
        f"{json.dumps(brief.model_dump(mode='json'), ensure_ascii=False)}\n"
        "</VERIFIED_RESEARCH_BRIEF>"
        f"{correction_block}"
    )


__all__ = [
    "CleanedConversation",
    "prepare_cleaned_conversation",
    "build_research_envelope",
    "build_writer_envelope",
    "select_relevant_writer_history",
]
