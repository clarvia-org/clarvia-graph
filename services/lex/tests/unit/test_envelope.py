"""Tests for the channel-agnostic runtime envelope."""

from __future__ import annotations

from datetime import UTC, datetime

from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.llm.envelope import build_runtime_envelope


def _parsed() -> ParsedMessage:
    return ParsedMessage(
        message_id="m1",
        thread_id="t1",
        from_address="user@example.com",
        reply_to=None,
        to_addresses=("user@example.com",),
        cc_addresses=(),
        subject="Death registration",
        body_text="What should I do after a death in Luxembourg?",
        return_path="user@example.com",
    )


def test_envelope_contains_controlled_context_and_redacted_body() -> None:
    parsed = _parsed()
    envelope = build_runtime_envelope(
        parsed=parsed,
        conversation_history=[
            ConversationMessage(
                role=ConversationRole.USER,
                text="Earlier question about Luxembourg.",
            )
        ],
        current_date_utc=datetime(2026, 7, 25, 12, 0, tzinfo=UTC),
        prompt_version="lex-v1",
    )
    assert "delivery_channel: email" in envelope
    assert "conversation_id: t1" in envelope
    web = build_runtime_envelope(
        parsed=ParsedMessage(
            message_id="m2",
            thread_id="t2",
            from_address="user@example.com",
            reply_to=None,
            to_addresses=("lex@clarvia.org",),
            cc_addresses=(),
            subject="Question from clarvia.org",
            body_text="My father died last week in Paris. What should I do first?",
            delivery_channel="web",
        ),
        conversation_history=[],
        current_date_utc=datetime(2026, 7, 25, 12, 0, tzinfo=UTC),
        prompt_version="lex-v1",
        delivery_channel="web",
    )
    assert "delivery_channel: web" in web
    assert "latest_message_id: m1" in envelope
    assert "Death registration" in envelope
    assert "Luxembourg" in envelope
    assert "user@example.com" not in envelope
