"""Unit tests for Gmail thread → model conversation history."""

from __future__ import annotations

from app.domain.models import ConversationRole, ParsedMessage
from app.services.thread_context import prior_thread_history, role_for_parsed_message
from tests.unit.conftest import build_settings


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
        subject="Re: question",
        body_text=body,
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
    history = prior_thread_history(
        thread, latest_message_id="m3", settings=settings
    )
    assert [item.role for item in history] == [
        ConversationRole.USER,
        ConversationRole.ASSISTANT,
    ]
    assert "Kirchberg" in history[0].text
    assert "reliable response" in history[1].text
    assert all(item.text != "She died in Luxembourg." for item in history)
