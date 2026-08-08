"""Automatic-message and loop detection tests."""

from __future__ import annotations

from app.domain.models import ParsedMessage
from app.email.auto_detect import IgnoreReason, detect_automatic_message


def _parsed(**overrides: object) -> ParsedMessage:
    data: dict[str, object] = {
        "message_id": "m1",
        "thread_id": "t1",
        "from_address": "user@example.com",
        "reply_to": None,
        "to_addresses": ("lex@clarvia.org",),
        "cc_addresses": (),
        "subject": "Question",
        "body_text": "What should I do after a death in Luxembourg?",
        "return_path": "user@example.com",
    }
    data.update(overrides)
    return ParsedMessage(**data)  # type: ignore[arg-type]


def test_lex_sender_is_ignored() -> None:
    result = detect_automatic_message(
        _parsed(from_address="lex@clarvia.org"),
        lex_mailbox="lex@clarvia.org",
    )
    assert result.should_ignore is True
    assert result.reason is IgnoreReason.LEX_SENDER


def test_auto_submitted_is_ignored() -> None:
    result = detect_automatic_message(
        _parsed(auto_submitted="auto-generated"),
        lex_mailbox="lex@clarvia.org",
    )
    assert result.should_ignore is True
    assert result.reason is IgnoreReason.AUTO_SUBMITTED


def test_list_mail_is_ignored() -> None:
    result = detect_automatic_message(
        _parsed(list_id="<list.example.com>"),
        lex_mailbox="lex@clarvia.org",
    )
    assert result.should_ignore is True
    assert result.reason is IgnoreReason.LIST_MAIL


def test_empty_return_path_is_ignored() -> None:
    result = detect_automatic_message(
        _parsed(return_path="<>"),
        lex_mailbox="lex@clarvia.org",
    )
    assert result.should_ignore is True
    assert result.reason is IgnoreReason.EMPTY_RETURN_PATH


def test_missing_return_path_is_not_ignored() -> None:
    result = detect_automatic_message(
        _parsed(return_path=None),
        lex_mailbox="lex@clarvia.org",
    )
    assert result.should_ignore is False


def test_empty_body_is_ignored() -> None:
    result = detect_automatic_message(
        _parsed(body_text=""),
        lex_mailbox="lex@clarvia.org",
    )
    assert result.should_ignore is True
    assert result.reason is IgnoreReason.EMPTY_BODY


def test_substantive_message_is_not_ignored() -> None:
    result = detect_automatic_message(_parsed(), lex_mailbox="lex@clarvia.org")
    assert result.should_ignore is False
