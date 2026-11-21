"""Tests for the channel-agnostic runtime envelope."""

from __future__ import annotations

from datetime import UTC, datetime

from app.domain.models import ConversationMessage, ConversationRole, ParsedMessage
from app.llm.envelope import append_language_retry_instruction, build_runtime_envelope


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
    assert "reply_language:" in envelope
    assert "official sources" in envelope
    assert "expected_reply_language:" not in envelope
    assert "user@example.com" not in envelope

    explicit_expected = build_runtime_envelope(
        parsed=parsed,
        conversation_history=[],
        current_date_utc=datetime(2026, 7, 25, 12, 0, tzinfo=UTC),
        prompt_version="lex-v2.4",
        expected_language="en-US",
    )
    assert "expected_reply_language: en\n" in explicit_expected

    retried = append_language_retry_instruction(
        explicit_expected,
        expected_language="en",
        observed_language="es",
    )
    assert "language_correction_required:" in retried
    assert "'es' instead of 'en'" in retried
    assert retried.index("language_correction_required:") < retried.index(
        "</SYSTEM_CONTROLLED_CONTEXT>"
    )

    fallback_retry = append_language_retry_instruction(
        "plain test envelope",
        expected_language="lu",
        observed_language="fr",
    )
    assert fallback_retry.startswith("plain test envelope\n")
    assert "'fr' instead of 'lb'" in fallback_retry
