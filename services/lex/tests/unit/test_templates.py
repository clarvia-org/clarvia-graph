"""Tests for approved templates and deterministic operational bodies."""

from __future__ import annotations

import pytest
from app.email.composition import compose_lex_email, validate_response_body
from app.email.templates import (
    ATTACHMENT_ONLY_BODY,
    FOOTER_HTML,
    FOOTER_TEXT,
    RATE_LIMIT_BODY,
    RECIPIENT_LIMIT_BODY,
    TECHNICAL_FAILURE_BODY,
    THREAD_CLOSED_BODY,
)

_DETERMINISTIC_BODIES = (
    RATE_LIMIT_BODY,
    RECIPIENT_LIMIT_BODY,
    ATTACHMENT_ONLY_BODY,
    TECHNICAL_FAILURE_BODY,
    THREAD_CLOSED_BODY,
)


def test_rate_limit_exact_wording() -> None:
    assert "up to five emails per day" in RATE_LIMIT_BODY
    assert "full daily quota of five" in RATE_LIMIT_BODY
    assert "immediate danger" not in RATE_LIMIT_BODY.casefold()


def test_rate_limit_avoids_punitive_language() -> None:
    lowered = RATE_LIMIT_BODY.lower()
    for word in ("abuse", "misuse", "violation"):
        assert word not in lowered


def test_footer_constants_present() -> None:
    assert "Clarvia is a nonprofit." in FOOTER_TEXT
    assert "Clarvia is a nonprofit." in FOOTER_HTML
    assert "five replies in the same email thread" in FOOTER_TEXT
    assert "We're happy to help with anything else" not in FOOTER_TEXT


@pytest.mark.parametrize("body", _DETERMINISTIC_BODIES)
def test_deterministic_bodies_pass_validation(body: str) -> None:
    assert validate_response_body(body).endswith("Lex.")


@pytest.mark.parametrize("body", _DETERMINISTIC_BODIES)
def test_deterministic_bodies_compose(body: str) -> None:
    message = compose_lex_email(
        response_body_markdown=body,
        to_addresses=["user@example.com"],
        cc_addresses=[],
        subject="Re: test",
        outbound_message_id="<out@clarvia.org>",
        in_reply_to="<in@example.com>",
        references=[],
        request_id="req",
        prompt_version="lex-v1",
    )
    assert message.get_content_type() == "multipart/alternative"
