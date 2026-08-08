"""Phase 3 processor integration tests."""

from __future__ import annotations

import itertools
from email.message import EmailMessage
from email.policy import SMTP

import pytest
from app.domain.labels import LEX_IGNORED, LEX_PROCESSED, LEX_RATE_LIMITED
from app.domain.models import ParsedMessage, ProcessingStatus
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.services.processor import PROCESS_STATUS_SENT, Processor

from .conftest import build_settings, fake_llm_for_responses, make_answer_response

HMAC_SECRET = "phase3-test-secret"


class Harness:
    def __init__(self, *, prompt_path: str) -> None:
        self.clock = FakeClock()
        self.gmail = InMemoryGmail()
        self.state = InMemoryMessageState(clock=self.clock)
        self.rate_limit = InMemoryRateLimit()
        self.daily_usage = InMemoryDailyUsage()
        self._worker_ids = itertools.count(1)
        self.processor = Processor(
            settings=build_settings(
                processing_enabled=True,
                processing_mode="public",
                hmac_secret=HMAC_SECRET,
                prompt_path=prompt_path,
            ),
            state=self.state,
            gmail=self.gmail,
            rate_limit=self.rate_limit,
            daily_usage=self.daily_usage,
            llm=fake_llm_for_responses(make_answer_response()),
            clock=self.clock,
            worker_id_factory=lambda: f"worker-{next(self._worker_ids)}",
        )

    def seed_queued(self, message_id: str = "m1", thread_id: str = "t1") -> None:
        from app.domain.models import new_queued_record

        self.state.create_record(
            new_queued_record(
                message_key=message_id, thread_id=thread_id, now=self.clock.now()
            )
        )

    def seed_eligible(
        self,
        *,
        message_id: str = "m1",
        thread_id: str = "t1",
        **parsed_overrides: object,
    ) -> ParsedMessage:
        data: dict[str, object] = {
            "message_id": message_id,
            "thread_id": thread_id,
            "from_address": "user@example.com",
            "reply_to": None,
            "to_addresses": ("user@example.com",),
            "cc_addresses": (),
            "subject": "Death registration",
            "body_text": "What should I do after a death in Luxembourg?",
            "return_path": "user@example.com",
        }
        data.update(parsed_overrides)
        parsed = ParsedMessage(**data)  # type: ignore[arg-type]
        self.gmail.seed_parsed_message(parsed)
        self.seed_queued(message_id=message_id, thread_id=thread_id)
        return parsed


@pytest.fixture
def harness(synthetic_prompt: str) -> Harness:
    return Harness(prompt_path=synthetic_prompt)


def test_eligible_message_is_sent_when_gates_pass(harness: Harness) -> None:
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_SENT
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.sender_hmac
    assert record.visible_recipient_count == 1
    assert LEX_PROCESSED in harness.gmail.labels_for("m1")


def test_automatic_message_is_silently_ignored(harness: Harness) -> None:
    harness.seed_eligible(auto_submitted="auto-generated")

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == "ignored"
    assert harness.gmail.send_reply_calls == 0
    assert LEX_IGNORED in harness.gmail.labels_for("m1")
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.IGNORED


def test_recipient_limit_sends_template_without_model(harness: Harness) -> None:
    to = tuple(f"user{i}@example.com" for i in range(11))
    harness.seed_eligible(to_addresses=to)

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == "recipient_limited"
    assert harness.gmail.send_reply_calls == 1
    assert LEX_IGNORED in harness.gmail.labels_for("m1")


def test_rate_limit_blocks_eleventh_request(harness: Harness) -> None:
    for index in range(11):
        message_id = f"m{index}"
        harness.seed_eligible(message_id=message_id, thread_id="t1")
        result = harness.processor.run(gmail_message_id=message_id)
        if index < 10:
            assert result.status == PROCESS_STATUS_SENT
        else:
            assert result.status == "rate_limited"
    assert LEX_RATE_LIMITED in harness.gmail.labels_for("m10")


def test_attachment_only_sends_template_without_reading_bytes(
    harness: Harness,
) -> None:
    message = EmailMessage(policy=SMTP)
    message["From"] = "user@example.com"
    message["To"] = "lex@clarvia.org"
    message["Return-Path"] = "user@example.com"
    message.set_content("See attached.", subtype="plain", charset="utf-8")
    message.add_attachment(
        b"TOP-SECRET-ATTACHMENT-BYTES",
        maintype="application",
        subtype="pdf",
        filename="secret.pdf",
    )
    harness.gmail.seed_raw_message(
        message_id="m1", thread_id="t1", raw=message.as_bytes()
    )
    harness.seed_queued()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == "attachment_only"
    assert harness.gmail.send_reply_calls == 1
    assert harness.gmail.last_sent_raw is not None
    assert "TOP-SECRET-ATTACHMENT-BYTES" not in harness.gmail.last_sent_raw
