"""Tests for app.email.recipients."""

from __future__ import annotations

import inspect

from app.email.recipients import (
    build_visible_reply_list,
    dedupe_addresses,
    exceeds_recipient_limit,
    normalize_address,
    remove_lex_addresses,
)


def test_normalize_lowercases_and_trims() -> None:
    assert normalize_address("  User@Example.COM ") == "user@example.com"


def test_dedupe_is_case_insensitive() -> None:
    result = dedupe_addresses(["A@x.com", "a@x.com", "b@x.com"])
    assert result == ["a@x.com", "b@x.com"]


def test_remove_lex_addresses_and_aliases() -> None:
    result = remove_lex_addresses(
        ["LEX@clarvia.org", "user@x.com", "alias@clarvia.org"],
        lex_addresses=["lex@clarvia.org", "alias@clarvia.org"],
    )
    assert result == ["user@x.com"]


def test_build_visible_reply_list_dedupes_across_to_and_cc() -> None:
    reply = build_visible_reply_list(
        to_addresses=["a@x.com", "A@x.com", "lex@clarvia.org"],
        cc_addresses=["a@x.com", "b@x.com"],
    )
    assert reply.to_addresses == ("a@x.com",)
    assert reply.cc_addresses == ("b@x.com",)
    assert reply.visible_count == 2


def test_build_visible_reply_list_drops_invalid_and_empty() -> None:
    reply = build_visible_reply_list(
        to_addresses=["not-an-email", "", "   ", "good@x.com"],
        cc_addresses=[],
    )
    assert reply.to_addresses == ("good@x.com",)


def test_exactly_ten_recipients_is_allowed() -> None:
    addresses = [f"user{i}@x.com" for i in range(10)]
    reply = build_visible_reply_list(to_addresses=addresses, cc_addresses=[])
    assert reply.visible_count == 10
    assert exceeds_recipient_limit(reply) is False


def test_eleven_recipients_exceeds_limit() -> None:
    to = [f"user{i}@x.com" for i in range(6)]
    cc = [f"cc{i}@x.com" for i in range(5)]
    reply = build_visible_reply_list(to_addresses=to, cc_addresses=cc)
    assert reply.visible_count == 11
    assert exceeds_recipient_limit(reply) is True


def test_public_recipient_api_has_no_bcc_parameter() -> None:
    for func in (build_visible_reply_list, exceeds_recipient_limit):
        params = inspect.signature(func).parameters
        assert not any("bcc" in name.lower() for name in params)
