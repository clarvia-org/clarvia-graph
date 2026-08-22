"""Unit tests for outbound thread quotes and Lex reply counting."""

from __future__ import annotations

from app.domain.models import ParsedMessage
from app.email.thread_quote import build_thread_quote, count_lex_replies


def _msg(
    message_id: str,
    *,
    from_address: str,
    body: str,
    thread_id: str = "t1",
) -> ParsedMessage:
    return ParsedMessage(
        message_id=message_id,
        thread_id=thread_id,
        from_address=from_address,
        reply_to=None,
        to_addresses=("lex@clarvia.org",),
        cc_addresses=(),
        subject="Re: test",
        body_text=body,
        return_path=from_address,
        date_header="Mon, 1 Jan 2026 12:00:00 +0000",
    )


def test_count_lex_replies() -> None:
    msgs = [
        _msg("1", from_address="user@example.com", body="Hello"),
        _msg("2", from_address="lex@clarvia.org", body="Answer one\n\nLex."),
        _msg("3", from_address="user@example.com", body="Thanks"),
        _msg("4", from_address="lex@clarvia.org", body="Answer two\n\nLex."),
    ]
    assert count_lex_replies(msgs, lex_addresses=frozenset({"lex@clarvia.org"})) == 2


def test_build_thread_quote_after_truncation() -> None:
    long_body = "A" * 5000
    msgs = [
        _msg("1", from_address="user@example.com", body=long_body),
        _msg("2", from_address="lex@clarvia.org", body="Lex reply\n\nLex."),
        _msg("3", from_address="user@example.com", body="Follow up"),
    ]
    plain, html = build_thread_quote(
        msgs,
        latest_message_id="3",
        lex_addresses=frozenset({"lex@clarvia.org"}),
        max_chars_per_message=100,
        max_total_chars=10_000,
    )
    assert "Previous messages in this conversation" in plain
    assert "…message truncated" in plain
    assert "Follow up" not in plain  # latest excluded
    assert "Previous messages in this conversation" in html
    assert "Clarvia is a nonprofit" not in plain


def test_include_latest_quotes_the_current_question() -> None:
    msgs = [
        _msg(
            "1",
            from_address="user@example.com",
            body="My father died last week in Paris. What should I do first?",
        )
    ]
    plain, _html = build_thread_quote(
        msgs,
        latest_message_id="1",
        lex_addresses=frozenset({"lex@clarvia.org"}),
        include_latest=True,
    )
    assert "Paris" in plain
    assert "Previous messages in this conversation" in plain
