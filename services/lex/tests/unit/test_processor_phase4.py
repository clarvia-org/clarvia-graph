"""Phase 4 processor integration tests."""

from __future__ import annotations

import base64
import itertools

from app.domain.labels import LEX_FAILED, LEX_PROCESSED
from app.domain.models import ParsedMessage, ProcessingStatus
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.openai import FakeLlmAdapter, generation_result_from_response
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.services.processor import PROCESS_STATUS_FAILED, PROCESS_STATUS_SENT, Processor

from .conftest import (
    build_settings,
    fake_llm_for_responses,
    make_answer_response,
    make_clarify_response,
)

HMAC_SECRET = "phase4-test-secret"


class Harness:
    def __init__(
        self,
        *,
        llm: FakeLlmAdapter,
        prompt_path: str,
    ) -> None:
        self.clock = FakeClock()
        self.gmail = InMemoryGmail()
        self.state = InMemoryMessageState(clock=self.clock)
        self.rate_limit = InMemoryRateLimit()
        self.daily_usage = InMemoryDailyUsage()
        self.llm = llm
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
            llm=self.llm,
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


def test_eligible_mail_with_search_sources_is_sent(
    synthetic_prompt: str,
) -> None:
    llm = fake_llm_for_responses(make_answer_response())
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_SENT
    assert harness.gmail.send_reply_calls == 1
    assert LEX_PROCESSED in harness.gmail.labels_for("m1")
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.SENT
    assert record.openai_response_id is not None
    assert harness.gmail.last_sent_raw is not None
    decoded = base64.urlsafe_b64decode(harness.gmail.last_sent_raw).decode("utf-8")
    assert "Sources checked:" in decoded


def test_answer_without_search_retries_then_sends(synthetic_prompt: str) -> None:
    bad = generation_result_from_response(
        make_answer_response(),
        source_urls=frozenset(),
        web_search_calls=0,
    )
    good = generation_result_from_response(make_answer_response())
    llm = FakeLlmAdapter(responses=[bad, good])
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_SENT
    assert len(llm.calls) == 2
    assert llm.calls[1]["force_web_search"] is True


def test_double_validation_failure_still_sends(
    synthetic_prompt: str,
) -> None:
    bad = generation_result_from_response(
        make_answer_response(),
        source_urls=frozenset(),
        web_search_calls=0,
    )
    llm = FakeLlmAdapter(responses=[bad, bad])
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_SENT
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.SENT
    assert LEX_PROCESSED in harness.gmail.labels_for("m1")
    assert harness.gmail.last_sent_raw is not None
    decoded = base64.urlsafe_b64decode(harness.gmail.last_sent_raw).decode("utf-8")
    assert "full verified answer in one pass" not in decoded


def test_unparseable_model_output_sends_technical_failure(
    synthetic_prompt: str,
) -> None:
    llm = FakeLlmAdapter(default_error=ValueError("missing_structured_output"))
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_FAILED
    assert len(llm.calls) == 1
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.status is ProcessingStatus.FAILED
    assert record.llm_call_count == 1
    assert LEX_FAILED in harness.gmail.labels_for("m1")
    assert harness.gmail.last_sent_raw is not None
    decoded = base64.urlsafe_b64decode(harness.gmail.last_sent_raw).decode("utf-8")
    assert "full verified answer in one pass" in decoded


def test_provider_outage_sends_technical_failure(synthetic_prompt: str) -> None:
    class _Upstream(RuntimeError):
        status_code = 503

    llm = FakeLlmAdapter(default_error=_Upstream("unavailable"))
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_FAILED
    assert len(llm.calls) == 1
    record = harness.state.get_record("m1")
    assert record is not None
    assert record.llm_call_count == 1
    assert LEX_FAILED in harness.gmail.labels_for("m1")


def test_spent_llm_budget_does_not_call_the_model(synthetic_prompt: str) -> None:
    llm = fake_llm_for_responses(make_clarify_response())
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()
    record = harness.state.get_record("m1")
    assert record is not None
    harness.state.update_metadata("m1", llm_call_count=2)

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_FAILED
    assert llm.calls == []
    assert LEX_FAILED in harness.gmail.labels_for("m1")


def test_clarify_without_search_is_sent(synthetic_prompt: str) -> None:
    llm = fake_llm_for_responses(make_clarify_response())
    harness = Harness(llm=llm, prompt_path=synthetic_prompt)
    harness.seed_eligible()

    result = harness.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_SENT
    assert len(llm.calls) == 1
    assert llm.calls[0]["force_web_search"] is False
