"""Failure-injection scenarios (blueprint section 25)."""

from __future__ import annotations

import itertools
from dataclasses import replace
from email.message import EmailMessage
from email.policy import SMTP

import pytest
from app.domain.models import (
    ParsedMessage,
    ProcessingRecord,
    ProcessingStatus,
    new_queued_record,
)
from app.email.composition import EmailCompositionError, verify_composed_email
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.logging import ForbiddenLogFieldError, get_logger, log_event
from app.services.gates import PROCESS_STATUS_CIRCUIT_OPEN
from app.services.processor import Processor

from .conftest import build_settings, fake_llm_for_responses, make_answer_response

HMAC_SECRET = "failure-injection-secret"


class BrokenState(InMemoryMessageState):
    """Simulates Firestore unavailable after lease acquisition."""

    def get_record(self, message_key: str) -> ProcessingRecord | None:
        raise OSError("firestore unavailable")


def test_firestore_unavailable_before_model_does_not_call_llm(
    synthetic_prompt: str,
) -> None:
    clock = FakeClock()
    gmail = InMemoryGmail()
    llm = fake_llm_for_responses(make_answer_response())
    state = BrokenState(clock=clock)
    processor = Processor(
        settings=build_settings(
            processing_enabled=True,
            processing_mode="public",
            hmac_secret=HMAC_SECRET,
            prompt_path=synthetic_prompt,
        ),
        state=state,
        gmail=gmail,
        rate_limit=InMemoryRateLimit(),
        daily_usage=InMemoryDailyUsage(),
        llm=llm,
        clock=clock,
        worker_id_factory=lambda: f"w-{next(itertools.count(1))}",
    )

    parsed = ParsedMessage(
        message_id="m1",
        thread_id="t1",
        from_address="user@example.com",
        reply_to=None,
        to_addresses=("user@example.com",),
        cc_addresses=(),
        subject="Question",
        body_text="What should I do?",
        return_path="user@example.com",
    )
    gmail.seed_parsed_message(parsed)

    with pytest.raises(OSError):
        processor.run(gmail_message_id="m1")

    assert len(llm.calls) == 0
    assert gmail.send_reply_calls == 0


def test_composer_missing_footer_raises_and_alerts() -> None:
    from app.logging import configure_logging

    configure_logging("INFO")
    message = EmailMessage(policy=SMTP)
    message.set_content("Body only without footer", subtype="plain")
    message.add_alternative("<p>Body only</p>", subtype="html")

    with pytest.raises(EmailCompositionError):
        verify_composed_email(message)


def test_circuit_open_injection(synthetic_prompt: str) -> None:
    clock = FakeClock()
    gmail = InMemoryGmail()
    state = InMemoryMessageState(clock=clock)
    llm = fake_llm_for_responses(make_answer_response())
    daily_usage = InMemoryDailyUsage()
    daily_usage.set_circuit_open(now=clock.now(), open=True)
    processor = Processor(
        settings=build_settings(
            processing_enabled=True,
            processing_mode="public",
            hmac_secret=HMAC_SECRET,
            prompt_path=synthetic_prompt,
        ),
        state=state,
        gmail=gmail,
        rate_limit=InMemoryRateLimit(),
        daily_usage=daily_usage,
        llm=llm,
        clock=clock,
        worker_id_factory=lambda: f"w-{next(itertools.count(1))}",
    )
    parsed = ParsedMessage(
        message_id="m1",
        thread_id="t1",
        from_address="user@example.com",
        reply_to=None,
        to_addresses=("user@example.com",),
        cc_addresses=(),
        subject="Question",
        body_text="What should I do?",
        return_path="user@example.com",
    )
    gmail.seed_parsed_message(parsed)
    state.create_record(
        new_queued_record(message_key="m1", thread_id="t1", now=clock.now())
    )

    result = processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_CIRCUIT_OPEN
    assert len(llm.calls) == 0


def test_logging_forbidden_fields_injection_fails() -> None:
    logger = get_logger("lex.injection")
    with pytest.raises(ForbiddenLogFieldError):
        log_event(
            logger,
            "injection_attempt",
            body="this must never be logged",
        )


def test_terminal_record_prevents_duplicate_model_call(synthetic_prompt: str) -> None:
    """Uncertain-send recovery: already-sent records must not call the model again."""
    clock = FakeClock()
    gmail = InMemoryGmail()
    state = InMemoryMessageState(clock=clock)
    llm = fake_llm_for_responses(make_answer_response())
    processor = Processor(
        settings=build_settings(
            processing_enabled=True,
            processing_mode="public",
            hmac_secret=HMAC_SECRET,
            prompt_path=synthetic_prompt,
        ),
        state=state,
        gmail=gmail,
        rate_limit=InMemoryRateLimit(),
        daily_usage=InMemoryDailyUsage(),
        llm=llm,
        clock=clock,
        worker_id_factory=lambda: f"w-{next(itertools.count(1))}",
    )
    base = new_queued_record(message_key="m1", thread_id="t1", now=clock.now())
    sent = replace(
        base,
        status=ProcessingStatus.SENT,
        outbound_message_id="<lex-out@m1>",
        sent_gmail_message_id="gmail-sent-1",
    )
    state.create_record(sent)

    result = processor.run(gmail_message_id="m1")

    assert result.status == "already_done"
    assert len(llm.calls) == 0
