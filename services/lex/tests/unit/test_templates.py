"""Tests for approved templates and deterministic operational bodies."""

from __future__ import annotations

import pytest
from app.email.composition import compose_lex_email, validate_response_body
from app.email.templates import (
    ATTACHMENT_ONLY_BODY,
    CONTINUATION_TEXT,
    FOOTER_HTML,
    FOOTER_TEXT,
    RATE_LIMIT_BODY,
    RECIPIENT_LIMIT_BODY,
    TECHNICAL_FAILURE_BODY,
)

_DETERMINISTIC_BODIES = (
    RATE_LIMIT_BODY,
    RECIPIENT_LIMIT_BODY,
    ATTACHMENT_ONLY_BODY,
    TECHNICAL_FAILURE_BODY,
)


def test_rate_limit_exact_wording() -> None:
    assert RATE_LIMIT_BODY.startswith(
        "Our service is currently limited to 10 requests per day from the same "
        "address. This limit helps us keep the service free and available for "
        "everyone. Please try again tomorrow."
    )


def test_rate_limit_avoids_punitive_language() -> None:
    lowered = RATE_LIMIT_BODY.lower()
    for word in ("abuse", "misuse", "violation"):
        assert word not in lowered


def test_continuation_and_footer_constants_present() -> None:
    assert "reply to this email" in CONTINUATION_TEXT
    assert "Clarvia is a nonprofit." in FOOTER_TEXT
    assert "Clarvia is a nonprofit." in FOOTER_HTML
    assert "8 or more exchanges" in FOOTER_TEXT


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
