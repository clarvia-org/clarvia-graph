"""Deterministic identifier helpers (blueprint 6.2 and 7.3)."""

from __future__ import annotations

import re

import pytest
from app.domain.ids import (
    MAX_TASK_NAME_LENGTH,
    TASK_NAME_PREFIX,
    InvalidMessageIdError,
    message_key,
    outbound_message_id,
    request_id_for_message,
    task_name_for_message,
)

CLOUD_TASKS_SAFE = re.compile(r"^[A-Za-z0-9_-]+$")


def test_task_name_is_deterministic() -> None:
    assert task_name_for_message("18f2a1b9c") == task_name_for_message("18f2a1b9c")


def test_task_name_uses_prefix_and_safe_charset() -> None:
    name = task_name_for_message("18f2a1b9c")
    assert name == f"{TASK_NAME_PREFIX}18f2a1b9c"
    assert CLOUD_TASKS_SAFE.match(name)


@pytest.mark.parametrize(
    "raw",
    ["with space", "slash/id", "plus+id", "dot.id", "unicode-é", "tab\tid"],
)
def test_unsafe_characters_are_sanitised(raw: str) -> None:
    name = task_name_for_message(raw)
    assert CLOUD_TASKS_SAFE.match(name), name


def test_sanitisation_does_not_collapse_distinct_ids() -> None:
    # Both sanitise to the same prefix; the digest keeps them distinct.
    assert task_name_for_message("a/b") != task_name_for_message("a+b")


def test_task_name_respects_cloud_tasks_length_limit() -> None:
    name = task_name_for_message("x" * 900)
    assert len(name) <= MAX_TASK_NAME_LENGTH
    assert CLOUD_TASKS_SAFE.match(name)


def test_long_ids_remain_distinct_after_truncation() -> None:
    first = task_name_for_message("y" * 900 + "1")
    second = task_name_for_message("y" * 900 + "2")
    assert first != second


def test_blank_message_id_is_rejected() -> None:
    for raw in ("", "   "):
        with pytest.raises(InvalidMessageIdError):
            task_name_for_message(raw)
    with pytest.raises(InvalidMessageIdError):
        message_key(" ")
    with pytest.raises(InvalidMessageIdError):
        outbound_message_id("")
    with pytest.raises(InvalidMessageIdError):
        request_id_for_message("")


def test_message_key_is_the_gmail_message_id() -> None:
    assert message_key(" 18f2a1b9c ") == "18f2a1b9c"


def test_outbound_message_id_matches_blueprint_shape() -> None:
    assert outbound_message_id("18f2a1b9c") == "<lex.18f2a1b9c@clarvia.org>"
    assert outbound_message_id("18f2a1b9c", domain="example.test").endswith(
        "@example.test>"
    )


def test_outbound_message_id_sanitises_and_stays_distinct() -> None:
    generated = outbound_message_id("a b")
    assert " " not in generated
    assert generated != outbound_message_id("a/b")


def test_request_id_is_deterministic_and_opaque() -> None:
    first = request_id_for_message("18f2a1b9c")
    assert first == request_id_for_message("18f2a1b9c")
    assert first.startswith("lex-")
    # The Gmail ID must not be recoverable from the request ID.
    assert "18f2a1b9c" not in first
