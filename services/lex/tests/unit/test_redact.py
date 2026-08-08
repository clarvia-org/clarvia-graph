"""Tests for deterministic redaction."""

from __future__ import annotations

from app.llm.redact import redact_sensitive_text


def test_redacts_email_and_phone() -> None:
    text = "Contact me at user@example.com or +352 621 123 456."
    redacted = redact_sensitive_text(text)
    assert "user@example.com" not in redacted
    assert "+352" not in redacted
    assert "[redacted]" in redacted


def test_preserves_situational_facts() -> None:
    text = "Death in Luxembourg on 2026-01-15. The person lived in Esch-sur-Alzette."
    assert redact_sensitive_text(text) == text
