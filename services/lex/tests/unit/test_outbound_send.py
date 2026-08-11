"""Phase 5 outbound send: threading, MIME, and idempotency."""

from __future__ import annotations

import base64
from email import message_from_bytes
from email.message import EmailMessage
from email.policy import SMTP
from typing import cast

import pytest
from app.domain.errors import GmailSendUncertainError
from app.domain.ids import outbound_message_id, request_id_for_message
from app.domain.models import ParsedMessage, ReplyRecipients
from app.email.templates import THREAD_LAST_REPLY_NOTE
from app.email.threading import reply_subject
from app.infrastructure.memory import InMemoryGmail
from app.llm.source_render import insert_sources_before_signoff
from app.services.outbound import send_lex_reply

from .conftest import build_settings, make_answer_response

_BODY = "Contact the Commune office [1].\n\nLex."


def _decode_last(gmail: InMemoryGmail) -> bytes:
    assert gmail.last_sent_raw is not None
    return base64.urlsafe_b64decode(gmail.last_sent_raw.encode("ascii"))


def _parsed(**overrides: object) -> ParsedMessage:
    data: dict[str, object] = {
        "message_id": "m1",
        "thread_id": "t1",
        "from_address": "user@example.com",
        "reply_to": None,
        "to_addresses": ("user@example.com",),
        "cc_addresses": ("cc@example.com",),
        "subject": "Death registration",
        "body_text": "Question",
        "message_id_header": "<inbound@example.com>",
        "references": ("<parent@example.com>",),
    }
    data.update(overrides)
    return ParsedMessage(**data)  # type: ignore[arg-type]


def _recipients(**overrides: object) -> ReplyRecipients:
    data: dict[str, object] = {
        "to_addresses": ("user@example.com",),
        "cc_addresses": ("cc@example.com",),
    }
    data.update(overrides)
    return ReplyRecipients(**data)  # type: ignore[arg-type]


def _load_message(gmail: InMemoryGmail) -> EmailMessage:
    return cast(
        EmailMessage,
        message_from_bytes(
            _decode_last(gmail),
            policy=SMTP,  # type: ignore[arg-type]
        ),
    )


def _alternatives(message: EmailMessage) -> tuple[str, str]:
    plain = html = ""
    for part in message.iter_parts():
        if part.get_content_type() == "text/plain":
            plain = part.get_content()
        elif part.get_content_type() == "text/html":
            html = part.get_content()
    return plain, html


def test_threading_headers_and_subject() -> None:
    gmail = InMemoryGmail()
    parsed = _parsed()
    settings = build_settings()

    send_lex_reply(
        gmail=gmail,
        settings=settings,
        parsed=parsed,
        recipients=_recipients(),
        response_body_markdown=_BODY,
    )

    message = _load_message(gmail)
    assert message["Subject"] == reply_subject(parsed.subject)
    assert message["In-Reply-To"] == "<inbound@example.com>"
    assert message["References"] == "<parent@example.com> <inbound@example.com>"
    assert message["Message-ID"] == outbound_message_id("m1")
    assert message["X-Lex-Request-ID"] == request_id_for_message("m1")
    assert gmail.sent_messages[0][1] == "t1"


def test_cc_recipients_preserved() -> None:
    gmail = InMemoryGmail()
    send_lex_reply(
        gmail=gmail,
        settings=build_settings(),
        parsed=_parsed(),
        recipients=_recipients(),
        response_body_markdown=_BODY,
    )
    message = _load_message(gmail)
    assert "user@example.com" in message["To"]
    assert message["Cc"] == "cc@example.com"


def test_no_bcc_header() -> None:
    gmail = InMemoryGmail()
    send_lex_reply(
        gmail=gmail,
        settings=build_settings(),
        parsed=_parsed(),
        recipients=_recipients(),
        response_body_markdown=_BODY,
    )
    message = _load_message(gmail)
    assert "Bcc" not in message
    assert all(name.lower() != "bcc" for name in message.keys())  # noqa: SIM118


def test_multipart_alternative_with_footer_once() -> None:
    gmail = InMemoryGmail()
    send_lex_reply(
        gmail=gmail,
        settings=build_settings(),
        parsed=_parsed(),
        recipients=_recipients(),
        response_body_markdown=_BODY,
    )
    message = _load_message(gmail)
    assert message.get_content_type() == "multipart/alternative"
    plain, html = _alternatives(message)
    assert "We're happy to help with anything else." not in plain
    assert plain.count("Clarvia is a nonprofit.") == 1
    assert html.count("Clarvia is a nonprofit.") == 1
    assert "five replies in the same email thread" in plain


def test_stand_alone_rate_limit_send_has_no_thread() -> None:
    gmail = InMemoryGmail()
    from app.email.templates import RATE_LIMIT_BODY, RATE_LIMIT_SUBJECT

    send_lex_reply(
        gmail=gmail,
        settings=build_settings(),
        parsed=_parsed(),
        recipients=_recipients(),
        response_body_markdown=RATE_LIMIT_BODY,
        stand_alone=True,
        subject_override=RATE_LIMIT_SUBJECT,
    )
    raw, thread_id = gmail.sent_messages[-1]
    assert thread_id == ""
    message = _load_message(gmail)
    assert message["Subject"] == RATE_LIMIT_SUBJECT
    assert message.get("In-Reply-To") is None
    assert message.get("X-Lex-Stand-Alone") == "1"
    _ = THREAD_LAST_REPLY_NOTE


def test_timeout_recovery_does_not_duplicate() -> None:
    gmail = InMemoryGmail()
    gmail.simulate_timeout_after_accept = True
    settings = build_settings()
    parsed = _parsed()
    recipients = _recipients()

    first = send_lex_reply(
        gmail=gmail,
        settings=settings,
        parsed=parsed,
        recipients=recipients,
        response_body_markdown=_BODY,
    )
    assert first.already_sent is True
    assert gmail.send_reply_calls == 1

    gmail.simulate_timeout_after_accept = False
    second = send_lex_reply(
        gmail=gmail,
        settings=settings,
        parsed=parsed,
        recipients=recipients,
        response_body_markdown=_BODY,
    )

    assert second.already_sent is True
    assert gmail.send_reply_calls == 1


def test_find_existing_before_send_skips_duplicate() -> None:
    gmail = InMemoryGmail()
    settings = build_settings()
    parsed = _parsed()
    recipients = _recipients()

    first = send_lex_reply(
        gmail=gmail,
        settings=settings,
        parsed=parsed,
        recipients=recipients,
        response_body_markdown=_BODY,
    )
    second = send_lex_reply(
        gmail=gmail,
        settings=settings,
        parsed=parsed,
        recipients=recipients,
        response_body_markdown=_BODY,
    )

    assert first.already_sent is False
    assert second.already_sent is True
    assert gmail.send_reply_calls == 1


def test_uncertain_send_without_thread_match_raises() -> None:
    class FailingGmail(InMemoryGmail):
        def send_reply(self, *, raw_message: str, thread_id: str) -> str:
            raise GmailSendUncertainError()

    failing = FailingGmail()
    with pytest.raises(GmailSendUncertainError):
        send_lex_reply(
            gmail=failing,
            settings=build_settings(),
            parsed=_parsed(),
            recipients=_recipients(),
            response_body_markdown=_BODY,
        )
    assert failing.send_reply_calls == 0


def test_sources_passed_for_html_linkification() -> None:
    gmail = InMemoryGmail()
    response = make_answer_response()
    body = insert_sources_before_signoff(response.body_markdown, response)
    send_lex_reply(
        gmail=gmail,
        settings=build_settings(),
        parsed=_parsed(),
        recipients=_recipients(),
        response_body_markdown=body,
        sources=response.sources,
    )
    message = _load_message(gmail)
    plain, html = _alternatives(message)
    assert 'href="https://guichet.public.lu/"' in html or "guichet.public.lu" in html
    assert "[1]" in plain
    assert "href=" not in plain
