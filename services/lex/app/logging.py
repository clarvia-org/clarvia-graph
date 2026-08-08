"""Structured logging that fails closed on privacy-sensitive fields.

The Lex service must never log message content or personal data. This module
enforces an explicit allow-list and rejects any attempt to log a forbidden
field, so a mistake surfaces immediately instead of silently leaking data.
"""

from __future__ import annotations

import json
import logging
from typing import Any

# Fields that may appear in a structured log record (blueprint 26.4).
ALLOWED_LOG_FIELDS: frozenset[str] = frozenset(
    {
        "request_id",
        "gmail_message_id",
        "gmail_thread_id",
        "sender_hmac",
        "status",
        "action",
        "response_language",
        "visible_recipient_count",
        "latency_ms",
        "token_usage",
        "tool_usage",
        "source_domain_count",
        "error_code",
        "model",
        "prompt_version",
        "schema_version",
        "alert_code",
        "severity",
        "deleted_count",
    }
)

# Fields that must NEVER be logged (blueprint 26.4). Kept explicit for reviewers.
FORBIDDEN_LOG_FIELDS: frozenset[str] = frozenset(
    {
        "body",
        "subject",
        "sender",
        "sender_address",
        "recipients",
        "to",
        "cc",
        "bcc",
        "names",
        "name",
        "private_identifiers",
        "model_response",
        "model_output",
        "response_text",
        "prompt",
        "prompt_content",
        "raw_search_queries",
        "search_queries",
        "url",
        "urls",
        "attachments",
    }
)


class ForbiddenLogFieldError(ValueError):
    """Raised when a log call includes a privacy-sensitive field."""


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname,
            "event": record.getMessage(),
        }
        extra = getattr(record, "lex_fields", None)
        if isinstance(extra, dict):
            payload.update(extra)
        return json.dumps(payload, ensure_ascii=False, sort_keys=True)


def configure_logging(level: str = "INFO") -> None:
    """Configure a single JSON stream handler on the root logger."""
    root = logging.getLogger()
    root.setLevel(level.upper())
    for handler in list(root.handlers):
        root.removeHandler(handler)
    handler = logging.StreamHandler()
    handler.setFormatter(_JsonFormatter())
    root.addHandler(handler)


def get_logger(name: str = "lex") -> logging.Logger:
    return logging.getLogger(name)


def _reject_forbidden(fields: dict[str, Any]) -> None:
    offending = {
        key
        for key in fields
        if key in FORBIDDEN_LOG_FIELDS or key not in ALLOWED_LOG_FIELDS
    }
    if offending:
        # Never echo the values; only the offending field names.
        raise ForbiddenLogFieldError(
            "Refusing to log fields outside the allow-list: "
            + ", ".join(sorted(offending))
        )


def log_event(
    logger: logging.Logger,
    event: str,
    *,
    level: int = logging.INFO,
    **fields: Any,
) -> None:
    """Emit a structured event containing only allow-listed fields.

    Any field that is forbidden, or simply not on the allow-list, raises
    :class:`ForbiddenLogFieldError` (fail closed).
    """
    _reject_forbidden(fields)
    logger.log(level, event, extra={"lex_fields": fields})
