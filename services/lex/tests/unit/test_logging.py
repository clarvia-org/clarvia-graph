"""Tests for app.logging (privacy-preserving structured logging)."""

from __future__ import annotations

import logging

import pytest
from app.logging import (
    ForbiddenLogFieldError,
    configure_logging,
    get_logger,
    log_event,
)


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
