"""Channel-agnostic runtime envelope for the model (blueprint section 15)."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime

from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.llm.language import normalize_language_code
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
    expected_language: str | None = None,
) -> str:
    """Build the neutral request envelope supplied to the model."""
    subject = redact_sensitive_text(parsed.subject.strip())
    body = redact_sensitive_text(parsed.body_text.strip())
    normalized_expected = normalize_language_code(expected_language)
    expected_line = (
        f"expected_reply_language: {normalized_expected}\n"
        if normalized_expected is not None
        else ""
    )

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
        "reply_language: Write the entire body_markdown AND set language to match "
        "the latest user message, even when official sources or websites you read "
        "are in another language. If the user explicitly asked to be replied in a "
        "specific language, use that language instead.\n"
        f"{expected_line}"
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


def append_language_retry_instruction(
    runtime_envelope: str,
    *,
    expected_language: str,
    observed_language: str,
) -> str:
    """Return a retry envelope reminding the model of the required reply language."""
    expected = normalize_language_code(expected_language) or expected_language.strip()
    observed = normalize_language_code(observed_language) or observed_language.strip()
    instruction = (
        "language_correction_required: Previous attempt used "
        f"'{observed}' instead of '{expected}'. Write the entire body_markdown and "
        f"set language strictly to '{expected}', translating facts from any "
        f"foreign-language sources into '{expected}'.\n"
    )
    marker = "</SYSTEM_CONTROLLED_CONTEXT>"
    if marker in runtime_envelope:
        return runtime_envelope.replace(marker, f"{instruction}{marker}", 1)
    separator = "" if not runtime_envelope or runtime_envelope.endswith("\n") else "\n"
    return f"{runtime_envelope}{separator}{instruction}"


__all__ = ["append_language_retry_instruction", "build_runtime_envelope"]
