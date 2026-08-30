"""Channel-agnostic runtime envelope for the model (blueprint section 15)."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime

from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.llm.redact import redact_sensitive_text


def _format_history_message(
    message: ConversationMessage,
    *,
    message_date: datetime | None = None,
) -> str:
    role_label = "USER" if message.role is ConversationRole.USER else "LEX"
    date_attr = ""
    if message_date is not None:
        date_attr = f' date="{message_date.date().isoformat()}"'
    sanitised = redact_sensitive_text(message.text)
    return f'<message role="{role_label}"{date_attr}>\n' f"{sanitised}\n" "</message>"


def build_runtime_envelope(
    *,
    parsed: ParsedMessage,
    conversation_history: Sequence[ConversationMessage],
    current_date_utc: datetime,
    prompt_version: str,
    delivery_channel: str = "email",
    service_timezone: str = "Europe/Luxembourg",
) -> str:
    """Build the neutral request envelope supplied to the model."""
    subject = redact_sensitive_text(parsed.subject.strip())
    body = redact_sensitive_text(parsed.body_text.strip())

    history_lines = [
        _format_history_message(msg, message_date=current_date_utc)
        for msg in conversation_history
    ]
    history_block = "\n\n".join(history_lines)

    return (
        "<SYSTEM_CONTROLLED_CONTEXT>\n"
        f"current_date_utc: {current_date_utc.strftime('%Y-%m-%d')}\n"
        f"service_timezone: {service_timezone}\n"
        f"delivery_channel: {delivery_channel}\n"
        f"prompt_version: {prompt_version}\n"
        f"conversation_id: {parsed.thread_id}\n"
        f"latest_message_id: {parsed.message_id}\n"
        "reply_language: Write the entire body_markdown in the same language "
        "as the latest user message. If the user asked to be replied in a "
        "specific language, use that language instead.\n"
        "</SYSTEM_CONTROLLED_CONTEXT>\n\n"
        "<LATEST_USER_MESSAGE>\n"
        "<subject>\n"
        f"{subject}\n"
        "</subject>\n\n"
        "<body>\n"
        f"{body}\n"
        "</body>\n"
        "</LATEST_USER_MESSAGE>\n\n"
        "<CONVERSATION_HISTORY>\n"
        f"{history_block}\n"
        "</CONVERSATION_HISTORY>"
    )


__all__ = ["build_runtime_envelope"]
