"""Tests for inbound MIME used by clarvia.org Ask us ingest."""

from __future__ import annotations

from email.policy import default as default_policy

import pytest
from app.email.ask_inbound import (
    ASK_SUBJECT,
    DELIVERY_CHANNEL_HEADER,
    DELIVERY_CHANNEL_WEB,
    AskInboundError,
    build_ask_inbound_message,
    encode_ask_inbound,
)
from app.email.parsing import ParseLimits, parse_raw_message


def test_inbound_message_looks_like_ordinary_mail() -> None:
    message = build_ask_inbound_message(
        from_address="Family@Example.com",
        question="My father died last week in Paris. What should I do first?",
        mailbox="lex@clarvia.org",
    )
    assert message["From"] == "family@example.com"
    assert message["To"] == "lex@clarvia.org"
    assert message["Reply-To"] == "family@example.com"
    assert message["Subject"] == ASK_SUBJECT
    assert message[DELIVERY_CHANNEL_HEADER] == DELIVERY_CHANNEL_WEB
    assert "Paris" in message.get_content()


def test_short_question_is_rejected() -> None:
    with pytest.raises(AskInboundError) as exc:
        build_ask_inbound_message(
            from_address="user@example.com",
            question="too short",
            mailbox="lex@clarvia.org",
        )
    assert exc.value.code == "question_too_short"


def test_parsed_delivery_channel_is_web() -> None:
    message = build_ask_inbound_message(
        from_address="user@example.com",
        question="My father died last week in Paris. What should I do first?",
        mailbox="lex@clarvia.org",
    )
    raw = message.as_bytes(policy=default_policy)
    parsed = parse_raw_message(
        raw,
        message_id="m1",
        thread_id="t1",
        limits=ParseLimits(max_body_chars=10_000, max_thread_chars=12_000),
    )
    assert parsed.delivery_channel == "web"
    assert parsed.from_address == "user@example.com"
    assert "Paris" in parsed.body_text


def test_encode_produces_gmail_raw() -> None:
    encoded = encode_ask_inbound(
        from_address="user@example.com",
        question="My father died last week in Paris. What should I do first?",
        mailbox="lex@clarvia.org",
    )
    assert isinstance(encoded, str)
    assert len(encoded) > 20
