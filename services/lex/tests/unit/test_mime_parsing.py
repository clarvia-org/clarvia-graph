"""MIME parsing tests (blueprint section 27.1)."""

from __future__ import annotations

from email.message import EmailMessage
from email.policy import SMTP

from app.domain.models import ConversationRole
from app.email.parsing import (
    ParseLimits,
    build_conversation_thread,
    clean_body_text,
    html_to_visible_text,
    is_substantive_body,
    parse_raw_message,
    strip_quoted_history,
)

LIMITS = ParseLimits(max_body_chars=100_000, max_thread_chars=120_000)


def _build_message(**kwargs: object) -> bytes:
    message = EmailMessage(policy=SMTP)
    has_body = "body" in kwargs
    for key, value in kwargs.items():
        if key == "body":
            message.set_content(str(value), subtype="plain", charset="utf-8")
        elif key == "html":
            if has_body:
                message.add_alternative(str(value), subtype="html", charset="utf-8")
            else:
                message.set_content(str(value), subtype="html", charset="utf-8")
        elif key == "attachment":
            attachment = value
            assert isinstance(attachment, tuple)
            filename, content, mime = attachment
            assert isinstance(filename, str)
            assert isinstance(content, str)
            assert isinstance(mime, str)
            message.add_attachment(
                content.encode("utf-8"),
                maintype=mime.split("/")[0],
                subtype=mime.split("/")[1],
                filename=filename,
            )
        else:
            message[str(key)] = str(value)
    return message.as_bytes()


def test_plain_text_email() -> None:
    raw = _build_message(
        From="user@example.com",
        To="lex@clarvia.org",
        Subject="Question",
        body="What should I do after a death?",
    )
    parsed = parse_raw_message(raw, message_id="m1", thread_id="t1", limits=LIMITS)
    assert "death" in parsed.body_text
    assert parsed.from_address == "user@example.com"


def test_html_only_email_strips_scripts_and_hidden_content() -> None:
    raw = _build_message(
        From="user@example.com",
        To="lex@clarvia.org",
        Subject="HTML",
        html=(
            "<html><body><script>alert(1)</script>"
            '<p style="display:none">secret</p>'
            "<p>Visible question about probate.</p>"
            '<img src="https://tracker.example/pixel.gif">'
            "</body></html>"
        ),
    )
    parsed = parse_raw_message(raw, message_id="m1", thread_id="t1", limits=LIMITS)
    assert "Visible question" in parsed.body_text
    assert "secret" not in parsed.body_text
    assert "alert" not in parsed.body_text


def test_multipart_alternative_prefers_plain_text() -> None:
    message = EmailMessage(policy=SMTP)
    message["From"] = "user@example.com"
    message["To"] = "lex@clarvia.org"
    message.set_content("Plain question.", subtype="plain", charset="utf-8")
    message.add_alternative("<p>HTML question.</p>", subtype="html", charset="utf-8")
    parsed = parse_raw_message(
        message.as_bytes(), message_id="m1", thread_id="t1", limits=LIMITS
    )
    assert parsed.body_text == "Plain question."


def test_attachment_only_records_metadata_without_reading_content() -> None:
    raw = _build_message(
        From="user@example.com",
        To="lex@clarvia.org",
        Subject="Files",
        body="",
        attachment=("report.pdf", "SECRET-BYTES", "application/pdf"),
    )
    parsed = parse_raw_message(raw, message_id="m1", thread_id="t1", limits=LIMITS)
    assert parsed.has_attachments is True
    assert parsed.attachment_meta[0].filename == "report.pdf"
    assert "SECRET-BYTES" not in parsed.body_text


def test_quoted_history_is_removed() -> None:
    body = "New question.\n\nOn Monday, Alex wrote:\n> old reply"
    assert "old reply" not in strip_quoted_history(body)


def test_existing_lex_footer_is_stripped() -> None:
    body = "Follow-up question.\n\nClarvia is a nonprofit. If you found this helpful"
    cleaned = clean_body_text(body)
    assert cleaned == "Follow-up question."


def test_malformed_mime_returns_empty_body() -> None:
    parsed = parse_raw_message(
        b"not really mime",
        message_id="m1",
        thread_id="t1",
        limits=LIMITS,
    )
    assert parsed.body_text == ""


def test_large_body_is_truncated() -> None:
    limits = ParseLimits(max_body_chars=50, max_thread_chars=120)
    raw = _build_message(
        From="user@example.com",
        To="lex@clarvia.org",
        body="x" * 200,
    )
    parsed = parse_raw_message(raw, message_id="m1", thread_id="t1", limits=limits)
    assert len(parsed.body_text) <= 71
    assert parsed.body_text.endswith("[Message truncated.]")


def test_thread_truncation_inserts_marker() -> None:
    messages = [
        (ConversationRole.USER, "first " * 100),
        (ConversationRole.ASSISTANT, "middle " * 100),
        (ConversationRole.USER, "latest question"),
    ]
    thread = build_conversation_thread(messages, max_thread_chars=200)
    assert any("omitted" in item.text for item in thread)


def test_html_to_visible_text_removes_remote_images() -> None:
    text = html_to_visible_text('<p>Hello</p><img src="https://example.com/x.png">')
    assert "Hello" in text
    assert "example.com" not in text


def test_is_substantive_body_rejects_attachment_reference_only() -> None:
    assert is_substantive_body("See attached.") is False
    assert is_substantive_body("What is the deadline in Luxembourg?") is True
