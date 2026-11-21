"""Unit tests for Gmail thread context, outbound quotes, and Lex reply counting."""

from __future__ import annotations

from app.domain.models import ConversationRole, ParsedMessage
from app.email.thread_quote import build_thread_quote, count_lex_replies
from app.services.thread_context import prior_thread_history, role_for_parsed_message

from tests.unit.conftest import build_settings


def _msg(
    message_id: str,
    *,
    from_address: str,
    body: str,
    subject: str = "Re: question",
    thread_id: str = "t1",
    return_path: str | None = None,
    date_header: str | None = None,
) -> ParsedMessage:
    return ParsedMessage(
        message_id=message_id,
        thread_id=thread_id,
        from_address=from_address,
        reply_to=None,
        to_addresses=("lex@clarvia.org",),
        cc_addresses=(),
        subject=subject,
        body_text=body,
        return_path=return_path,
        date_header=date_header,
    )


def _quoted_msg(
    message_id: str,
    *,
    from_address: str,
    body: str,
    thread_id: str = "t1",
) -> ParsedMessage:
    return _msg(
        message_id,
        from_address=from_address,
        body=body,
        subject="Re: test",
        thread_id=thread_id,
        return_path=from_address,
        date_header="Mon, 1 Jan 2026 12:00:00 +0000",
    )


def test_role_for_lex_mailbox() -> None:
    settings = build_settings(processing_mode="allowlist", processing_enabled=True)
    lex = _msg("1", from_address="lex@clarvia.org", body="Answer")
    user = _msg("2", from_address="tommi@clarvia.org", body="Question")
    assert (
        role_for_parsed_message(
            lex, lex_addresses=frozenset({settings.lex_mailbox.lower()})
        )
        is ConversationRole.ASSISTANT
    )
    assert (
        role_for_parsed_message(
            user, lex_addresses=frozenset({settings.lex_mailbox.lower()})
        )
        is ConversationRole.USER
    )


def test_prior_history_excludes_latest_and_keeps_chronology() -> None:
    settings = build_settings(processing_mode="allowlist", processing_enabled=True)
    thread = [
        _msg(
            "m1",
            from_address="tommi@clarvia.org",
            body="Mother passed in Kirchberg hospital Luxembourg.",
        ),
        _msg(
            "m2",
            from_address="lex@clarvia.org",
            body="Could not prepare a reliable response.\n\nLex.",
        ),
        _msg("m3", from_address="tommi@clarvia.org", body="She died in Luxembourg."),
    ]
    history = prior_thread_history(thread, latest_message_id="m3", settings=settings)
    assert [item.role for item in history] == [
        ConversationRole.USER,
        ConversationRole.ASSISTANT,
    ]
    assert "Kirchberg" in history[0].text
    assert "reliable response" in history[1].text
    assert all(item.text != "She died in Luxembourg." for item in history)


def test_count_lex_replies() -> None:
    msgs = [
        _quoted_msg("1", from_address="user@example.com", body="Hello"),
        _quoted_msg("2", from_address="lex@clarvia.org", body="Answer one\n\nLex."),
        _quoted_msg("3", from_address="user@example.com", body="Thanks"),
        _quoted_msg("4", from_address="lex@clarvia.org", body="Answer two\n\nLex."),
    ]
    assert count_lex_replies(msgs, lex_addresses=frozenset({"lex@clarvia.org"})) == 2


def test_build_thread_quote_after_truncation() -> None:
    long_body = "A" * 5000
    msgs = [
        _quoted_msg("1", from_address="user@example.com", body=long_body),
        _quoted_msg("2", from_address="lex@clarvia.org", body="Lex reply\n\nLex."),
        _quoted_msg("3", from_address="user@example.com", body="Follow up"),
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


def test_thread_quote_uses_locale_labels() -> None:
    msgs = [
        _quoted_msg("1", from_address="user@example.com", body="Bonjour"),
        _quoted_msg("2", from_address="lex@clarvia.org", body="Réponse\n\nLex."),
        _quoted_msg("3", from_address="user@example.com", body="Merci"),
    ]
    plain, html = build_thread_quote(
        msgs,
        latest_message_id="3",
        lex_addresses=frozenset({"lex@clarvia.org"}),
        locale="fr",
    )
    assert "Messages précédents de cette conversation" in plain
    assert "Messages précédents de cette conversation" in html
    assert "a écrit" in plain
    assert "Previous messages in this conversation" not in plain


def test_include_latest_quotes_the_current_question() -> None:
    msgs = [
        _quoted_msg(
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
