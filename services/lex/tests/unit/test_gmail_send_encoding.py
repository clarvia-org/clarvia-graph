"""Gmail API raw payload must not be double-encoded."""

from __future__ import annotations

from types import SimpleNamespace

import pytest
from app.domain.errors import GmailSendUncertainError
from app.email.composition import compose_lex_email, encode_for_gmail_api
from app.infrastructure.gmail import GoogleGmailAdapter
from app.infrastructure.google_errors import is_uncertain_gmail_send_error

from .conftest import build_settings

_BODY = "Practical guidance.\n\nLex."


def test_send_reply_passes_base64url_raw_unchanged() -> None:
    message = compose_lex_email(
        response_body_markdown=_BODY,
        to_addresses=["user@example.com"],
        cc_addresses=[],
        subject="Re: test",
        outbound_message_id="<out@test.clarvia.org>",
        in_reply_to="<in@test.example>",
        references=["<in@test.example>"],
        request_id="req-test",
        prompt_version="lex-v1",
    )
    encoded = encode_for_gmail_api(message)
    captured: list[dict[str, str]] = []

    class MessagesApi:
        def send(self, *, userId: str, body: dict[str, str]) -> object:
            captured.append(body)
            return SimpleNamespace(execute=lambda: {"id": "sent-1"})

    class UsersApi:
        def messages(self) -> MessagesApi:
            return MessagesApi()

        def threads(self) -> object:
            raise AssertionError("threads not used in this test")

    class Service:
        def users(self) -> UsersApi:
            return UsersApi()

    adapter = GoogleGmailAdapter(settings=build_settings(), service=Service())
    sent_id = adapter.send_reply(raw_message=encoded, thread_id="thread-1")

    assert sent_id == "sent-1"
    assert captured == [{"raw": encoded, "threadId": "thread-1"}]
    assert captured[0]["raw"] == encoded


def test_insert_inbound_uses_inbox_unread_and_raw() -> None:
    captured: list[dict[str, object]] = []

    class MessagesApi:
        def insert(
            self,
            *,
            userId: str,
            body: dict[str, object],
            internalDateSource: str,
        ) -> object:
            captured.append(
                {"userId": userId, "body": body, "source": internalDateSource}
            )
            return SimpleNamespace(
                execute=lambda: {"id": "inserted-1", "threadId": "thread-ask"}
            )

    class UsersApi:
        def messages(self) -> MessagesApi:
            return MessagesApi()

        def threads(self) -> object:
            raise AssertionError("threads not used in this test")

    class Service:
        def users(self) -> UsersApi:
            return UsersApi()

    adapter = GoogleGmailAdapter(settings=build_settings(), service=Service())
    ref = adapter.insert_inbound(raw_message="YWJj")
    assert ref.message_id == "inserted-1"
    assert ref.thread_id == "thread-ask"
    assert captured[0]["userId"] == "me"
    assert captured[0]["source"] == "dateHeader"
    body = captured[0]["body"]
    assert isinstance(body, dict)
    assert body["raw"] == "YWJj"
    assert body["labelIds"] == ["INBOX", "UNREAD"]


def test_find_outbound_in_thread_matches_headers() -> None:
    class ThreadsApi:
        def get(
            self,
            *,
            userId: str,
            id: str,
            format: str,
            metadataHeaders: list[str],
        ) -> object:
            return SimpleNamespace(
                execute=lambda: {
                    "messages": [
                        {
                            "id": "other",
                            "payload": {
                                "headers": [
                                    {"name": "Message-ID", "value": "<other@x>"},
                                ]
                            },
                        },
                        {
                            "id": "lex-sent",
                            "payload": {
                                "headers": [
                                    {
                                        "name": "Message-ID",
                                        "value": "<lex.m1@clarvia.org>",
                                    },
                                    {"name": "X-Lex-Request-ID", "value": "req-1"},
                                ]
                            },
                        },
                    ]
                }
            )

    class UsersApi:
        def threads(self) -> ThreadsApi:
            return ThreadsApi()

    class Service:
        def users(self) -> UsersApi:
            return UsersApi()

    adapter = GoogleGmailAdapter(settings=build_settings(), service=Service())
    found = adapter.find_outbound_in_thread(
        thread_id="thread-1",
        outbound_message_id="<lex.m1@clarvia.org>",
        request_id="req-1",
    )
    assert found == "lex-sent"


def test_send_reply_maps_timeout_to_uncertain_error() -> None:
    class MessagesApi:
        def send(self, *, userId: str, body: dict[str, str]) -> object:
            def _execute() -> dict[str, str]:
                raise TimeoutError("timed out")

            return SimpleNamespace(execute=_execute)

    class UsersApi:
        def messages(self) -> MessagesApi:
            return MessagesApi()

    class Service:
        def users(self) -> UsersApi:
            return UsersApi()

    adapter = GoogleGmailAdapter(settings=build_settings(), service=Service())
    with pytest.raises(GmailSendUncertainError):
        adapter.send_reply(raw_message="YWJj", thread_id="t1")


def test_is_uncertain_gmail_send_error_detects_status_codes() -> None:
    class FakeResponse:
        status = 503

    class FakeError(Exception):
        resp = FakeResponse()

    assert is_uncertain_gmail_send_error(TimeoutError())
    assert is_uncertain_gmail_send_error(FakeError())
    assert not is_uncertain_gmail_send_error(ValueError("bad request"))
