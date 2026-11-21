"""Tests for app.logging, privacy allow-listing, and deterministic redaction."""

from __future__ import annotations

import logging

import pytest
from app.llm.redact import redact_sensitive_text
from app.logging import (
    ForbiddenLogFieldError,
    configure_logging,
    get_logger,
    log_event,
)
from app.ops.alerts import emit_alert


def test_configure_logging_installs_single_handler() -> None:
    configure_logging("DEBUG")
    root = logging.getLogger()
    assert len(root.handlers) == 1
    assert root.level == logging.DEBUG


def test_log_event_allows_allowlisted_fields(
    caplog: pytest.LogCaptureFixture,
) -> None:
    logger = get_logger("lex.test")
    with caplog.at_level(logging.INFO):
        log_event(
            logger,
            "message_processed",
            request_id="req-1",
            status="sent",
            action="answer",
        )
    assert any(r.message == "message_processed" for r in caplog.records)


def test_log_event_rejects_forbidden_field() -> None:
    logger = get_logger("lex.test")
    with pytest.raises(ForbiddenLogFieldError):
        log_event(logger, "leak", body="secret message text")


def test_log_event_rejects_unknown_field() -> None:
    logger = get_logger("lex.test")
    with pytest.raises(ForbiddenLogFieldError):
        log_event(logger, "leak", something_unexpected="x")


def test_forbidden_error_names_field_not_value() -> None:
    logger = get_logger("lex.test")
    with pytest.raises(ForbiddenLogFieldError) as exc:
        log_event(logger, "leak", sender_address="alice@example.com")
    assert "sender_address" in str(exc.value)
    assert "alice@example.com" not in str(exc.value)


@pytest.mark.parametrize(
    "field_name",
    [
        "body",
        "subject",
        "sender",
        "sender_address",
        "recipients",
        "model_output",
        "prompt",
        "email",
    ],
)
def test_forbidden_fields_raise(field_name: str) -> None:
    logger = get_logger("lex.privacy")
    with pytest.raises(ForbiddenLogFieldError):
        log_event(logger, "leak_attempt", **{field_name: "must-not-appear"})  # type: ignore[arg-type]


def test_emit_alert_uses_allowlisted_fields_only() -> None:
    with pytest.raises(ForbiddenLogFieldError):
        emit_alert("test", sender_address="hidden@example.com")


def test_emit_alert_emits_structured_event(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.WARNING):
        emit_alert("circuit_open", severity="critical", error_code="forced")
    assert any(r.message == "alert" for r in caplog.records)


def test_redacts_email_and_phone() -> None:
    text = "Contact me at user@example.com or +352 621 123 456."
    redacted = redact_sensitive_text(text)
    assert "user@example.com" not in redacted
    assert "+352" not in redacted
    assert "[redacted]" in redacted


def test_preserves_situational_facts() -> None:
    text = "Death in Luxembourg on 2026-01-15. The person lived in Esch-sur-Alzette."
    assert redact_sensitive_text(text) == text
