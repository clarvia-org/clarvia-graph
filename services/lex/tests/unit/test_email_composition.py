"""Tests for app.email.composition."""

from __future__ import annotations

import base64
from email import message_from_bytes
from email.message import EmailMessage
from email.policy import SMTP
from email.policy import default as default_policy

import pytest
from app.email.composition import (
    EmailCompositionError,
    compose_lex_email,
    encode_for_gmail_api,
    render_response_html,
    validate_response_body,
    verify_composed_email,
)
from app.email.templates import CONTINUATION_TEXT, FOOTER_HTML, FOOTER_TEXT

_BODY = (
    "Here is practical guidance for registering the death.\n\n"
    "Contact the **commune office** first. Voil\u00e0 the r\u00e9sum\u00e9.\n\n"
    "Lex."
)


def _compose(**overrides: object) -> EmailMessage:
    kwargs: dict[str, object] = {
        "response_body_markdown": _BODY,
        "to_addresses": ["user@example.com"],
        "cc_addresses": [],
        "subject": "Re: your question",
        "outbound_message_id": "<out-1@clarvia.org>",
        "in_reply_to": "<in-1@example.com>",
        "references": ["<in-1@example.com>"],
        "request_id": "req-123",
        "prompt_version": "lex-v1",
    }
    kwargs.update(overrides)
    return compose_lex_email(**kwargs)  # type: ignore[arg-type]


def _alternatives(message: EmailMessage) -> tuple[str, str]:
    plain = ""
    html = ""
    for part in message.iter_parts():
        if part.get_content_type() == "text/plain":
            plain = part.get_content()
        elif part.get_content_type() == "text/html":
            html = part.get_content()
    return plain, html


def test_multipart_alternative_used() -> None:
    message = _compose()
    assert message.get_content_type() == "multipart/alternative"


def test_both_content_types_present() -> None:
    message = _compose()
    plain, html = _alternatives(message)
    assert plain
    assert html


def test_three_part_order_plain_and_html() -> None:
    message = _compose()
    plain, html = _alternatives(message)

    body_marker = "practical guidance"
    continuation_marker = "We're happy to help with anything else."
    footer_marker = "Clarvia is a nonprofit."

    for text in (plain, html):
        assert text.index(body_marker) < text.index(continuation_marker)
        assert text.index(continuation_marker) < text.index(footer_marker)


def test_continuation_appears_once_in_each_alternative() -> None:
    plain, html = _alternatives(_compose())
    marker = "We're happy to help with anything else."
    assert plain.count(marker) == 1
    assert html.count(marker) == 1


def test_footer_appears_once_in_each_alternative() -> None:
    plain, html = _alternatives(_compose())
    assert plain.count("Clarvia is a nonprofit.") == 1
    assert html.count("Clarvia is a nonprofit.") == 1


def test_all_approved_links_exist() -> None:
    _plain, html = _alternatives(_compose())
    for link in (
        "https://clarvia.org/en/support",
        "https://github.com/clarvia-org",
        "https://clarvia.org/en#contact",
        "https://clarvia.org/en/privacy",
        "https://clarvia.org/en",
        "mailto:lex@clarvia.org",
    ):
        assert link in html


def test_eight_exchange_tip_present() -> None:
    plain, html = _alternatives(_compose())
    assert "8 or more exchanges" in plain
    assert "8 or more exchanges" in html


def test_no_bcc_header() -> None:
    message = _compose()
    assert "Bcc" not in message
    assert message.get("Bcc") is None
    assert all(name.lower() != "bcc" for name in message.keys())  # noqa: SIM118


def test_two_pass_prompt_and_pipeline_headers() -> None:
    message = _compose(
        prompt_version="lex-research-v1/lex-writer-v1",
        pipeline_version="two-pass-v1",
    )
    assert message["X-Lex-Prompt-Version"] == "lex-research-v1/lex-writer-v1"
    assert message["X-Lex-Pipeline-Version"] == "two-pass-v1"


def test_utf8_survives() -> None:
    plain, html = _alternatives(_compose())
    assert "Voil\u00e0" in plain
    assert "r\u00e9sum\u00e9" in plain
    assert "Voil\u00e0" in html


def test_malicious_raw_html_does_not_survive() -> None:
    body = (
        "Safe text with an injection attempt "
        "<script>alert('x')</script> and <img src=x onerror=alert(1)>.\n\nLex."
    )
    html = render_response_html(body)
    # Dangerous tags are stripped/escaped, never emitted as live markup.
    assert "<script" not in html
    assert "<img" not in html


def test_gmail_encoding_round_trips() -> None:
    message = _compose()
    encoded = encode_for_gmail_api(message)
    decoded = base64.urlsafe_b64decode(encoded.encode("ascii"))
    reparsed = message_from_bytes(decoded, policy=default_policy)  # type: ignore[arg-type]
    assert reparsed.get_content_type() == "multipart/alternative"
    combined = decoded.decode("utf-8")
    assert "We're happy to help with anything else." in combined
    assert "Clarvia is a nonprofit." in combined


def test_missing_sign_off_rejected() -> None:
    with pytest.raises(EmailCompositionError):
        validate_response_body("No sign off here.")


def test_em_dash_rejected() -> None:
    with pytest.raises(EmailCompositionError):
        validate_response_body("Body with em dash \u2014 here.\n\nLex.")


def test_forbidden_footer_fragment_in_body_rejected() -> None:
    with pytest.raises(EmailCompositionError):
        validate_response_body(
            "Clarvia is a nonprofit. If you found this helpful.\n\nLex."
        )


def test_empty_to_rejected() -> None:
    with pytest.raises(EmailCompositionError):
        _compose(to_addresses=[])


def test_more_than_ten_recipients_rejected() -> None:
    with pytest.raises(EmailCompositionError):
        _compose(
            to_addresses=[f"u{i}@x.com" for i in range(6)],
            cc_addresses=[f"c{i}@x.com" for i in range(5)],
        )


_CONT_HTML = "<p>We're happy to help with anything else.</p>"
_VALID_PLAIN = "Body.\n\nLex.\n\n" + CONTINUATION_TEXT + "\n\n" + FOOTER_TEXT
_VALID_HTML = _CONT_HTML + "\n" + FOOTER_HTML


def _mk(plain: str, html: str) -> EmailMessage:
    message = EmailMessage(policy=SMTP)
    message.set_content(plain, subtype="plain", charset="utf-8")
    message.add_alternative(html, subtype="html", charset="utf-8")
    return message


def test_verify_accepts_valid_message() -> None:
    verify_composed_email(_mk(_VALID_PLAIN, _VALID_HTML))


def test_verify_rejects_non_multipart() -> None:
    message = EmailMessage(policy=SMTP)
    message.set_content("just text", subtype="plain")
    with pytest.raises(EmailCompositionError):
        verify_composed_email(message)


def test_verify_rejects_wrong_part_count() -> None:
    message = _mk(_VALID_PLAIN, _VALID_HTML)
    message.add_alternative("<p>extra</p>", subtype="html")
    with pytest.raises(EmailCompositionError):
        verify_composed_email(message)


def test_verify_rejects_missing_html_alternative() -> None:
    message = EmailMessage(policy=SMTP)
    message.set_content(_VALID_PLAIN, subtype="plain")
    message.add_alternative("also plain", subtype="plain")
    with pytest.raises(EmailCompositionError):
        verify_composed_email(message)


def test_verify_rejects_duplicate_plain_continuation() -> None:
    plain = _VALID_PLAIN + "\n\n" + CONTINUATION_TEXT
    with pytest.raises(EmailCompositionError):
        verify_composed_email(_mk(plain, _VALID_HTML))


def test_verify_rejects_missing_plain_footer() -> None:
    plain = "Body.\n\nLex.\n\n" + CONTINUATION_TEXT
    with pytest.raises(EmailCompositionError):
        verify_composed_email(_mk(plain, _VALID_HTML))


def test_verify_rejects_duplicate_html_continuation() -> None:
    html = _CONT_HTML + _CONT_HTML + FOOTER_HTML
    with pytest.raises(EmailCompositionError):
        verify_composed_email(_mk(_VALID_PLAIN, html))


def test_verify_rejects_missing_html_continuation() -> None:
    with pytest.raises(EmailCompositionError):
        verify_composed_email(_mk(_VALID_PLAIN, FOOTER_HTML))


def test_verify_rejects_duplicate_html_footer() -> None:
    html = _CONT_HTML + FOOTER_HTML + FOOTER_HTML
    with pytest.raises(EmailCompositionError):
        verify_composed_email(_mk(_VALID_PLAIN, html))


def test_verify_rejects_html_out_of_order() -> None:
    html = FOOTER_HTML + _CONT_HTML
    with pytest.raises(EmailCompositionError):
        verify_composed_email(_mk(_VALID_PLAIN, html))


def test_verify_rejects_bcc_header() -> None:
    message = _mk(_VALID_PLAIN, _VALID_HTML)
    message["Bcc"] = "hidden@example.com"
    with pytest.raises(EmailCompositionError):
        verify_composed_email(message)
