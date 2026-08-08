"""Logging privacy allow-list enforcement."""

from __future__ import annotations

import logging

import pytest
from app.logging import ForbiddenLogFieldError, get_logger, log_event
from app.ops.alerts import emit_alert


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
