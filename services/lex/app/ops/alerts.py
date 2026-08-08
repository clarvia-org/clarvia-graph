"""Structured operational alerts (blueprint Phase 6).

Alerts are emitted as JSON log events with ``event=alert``. They never contain
personal data — only allow-listed operational fields.
"""

from __future__ import annotations

import logging
from typing import Literal

from app.logging import get_logger, log_event

_logger = get_logger("lex.alerts")

AlertSeverity = Literal["info", "warning", "critical"]


def emit_alert(
    code: str,
    *,
    severity: AlertSeverity = "warning",
    **fields: str | int | float | None,
) -> None:
    """Emit a structured ``alert`` log event with no PII."""
    log_event(
        _logger,
        "alert",
        level=_level_for_severity(severity),
        alert_code=code,
        severity=severity,
        **fields,
    )


def _level_for_severity(severity: AlertSeverity) -> int:
    if severity == "critical":
        return logging.ERROR
    if severity == "warning":
        return logging.WARNING
    return logging.INFO


__all__ = ["AlertSeverity", "emit_alert"]
