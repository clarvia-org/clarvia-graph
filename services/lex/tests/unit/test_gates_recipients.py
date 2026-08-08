"""Recipient gate tests (blueprint section 27.1)."""

from __future__ import annotations

import inspect

from app.email.recipients import (
    build_reply_recipients,
    build_visible_reply_list,
    exceeds_recipient_limit,
    sender_only_recipients,
)


def test_reply_to_overrides_from_as_primary_to() -> None:
    recipients = build_reply_recipients(
        from_address="from@example.com",
        reply_to="reply@example.com",
        to_addresses=["from@example.com"],
        cc_addresses=[],
    )
    assert recipients.to_addresses[0] == "reply@example.com"


def test_exactly_ten_visible_recipients_allowed() -> None:
    to = [f"user{i}@example.com" for i in range(10)]
    recipients = build_reply_recipients(
        from_address="user0@example.com",
        reply_to=None,
        to_addresses=to,
        cc_addresses=[],
        lex_addresses=frozenset({"lex@clarvia.org"}),
    )
    assert recipients.visible_count == 10
    assert exceeds_recipient_limit(recipients) is False


def test_eleven_visible_recipients_blocked() -> None:
    to = [f"user{i}@example.com" for i in range(11)]
    recipients = build_reply_recipients(
        from_address="user0@example.com",
        reply_to=None,
        to_addresses=to,
        cc_addresses=[],
        lex_addresses=frozenset({"lex@clarvia.org"}),
    )
    assert recipients.visible_count == 11
    assert exceeds_recipient_limit(recipients) is True


def test_bcc_is_not_part_of_recipient_api() -> None:
    for func in (
        build_visible_reply_list,
        build_reply_recipients,
        exceeds_recipient_limit,
        sender_only_recipients,
    ):
        params = inspect.signature(func).parameters
        assert not any("bcc" in name.lower() for name in params)


def test_sender_only_recipients_for_recipient_limit_path() -> None:
    recipients = sender_only_recipients(
        from_address="from@example.com",
        reply_to="reply@example.com",
    )
    assert recipients.to_addresses == ("reply@example.com",)
    assert recipients.cc_addresses == ()
