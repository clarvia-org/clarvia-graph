"""Circuit breaker stops LLM calls when the global budget is reached."""

from __future__ import annotations

import itertools
from dataclasses import dataclass

from app.domain.labels import LEX_PROCESSED
from app.domain.models import ParsedMessage, new_queued_record
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.openai import FakeLlmAdapter
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.services.gates import PROCESS_STATUS_CIRCUIT_OPEN
from app.services.processor import Processor

from .conftest import build_settings, fake_llm_for_responses, make_answer_response

HMAC_SECRET = "circuit-test-secret"


@dataclass
class Harness:
    processor: Processor
    gmail: InMemoryGmail
    state: InMemoryMessageState
    clock: FakeClock
    daily_usage: InMemoryDailyUsage
    llm: FakeLlmAdapter


def _harness(
    *,
    llm: FakeLlmAdapter,
    prompt_path: str,
    global_limit: int = 1,
    force_open: bool = False,
) -> Harness:
    clock = FakeClock()
    gmail = InMemoryGmail()
    state = InMemoryMessageState(clock=clock)
    daily_usage = InMemoryDailyUsage()
    processor = Processor(
        settings=build_settings(
            processing_enabled=True,
            processing_mode="public",
            hmac_secret=HMAC_SECRET,
            prompt_path=prompt_path,
            global_daily_llm_limit=global_limit,
            force_circuit_open=force_open,
        ),
        state=state,
        gmail=gmail,
        rate_limit=InMemoryRateLimit(),
        daily_usage=daily_usage,
        llm=llm,
        clock=clock,
        worker_id_factory=lambda: f"w-{next(itertools.count(1))}",
    )
    return Harness(
        processor=processor,
        gmail=gmail,
        state=state,
        clock=clock,
        daily_usage=daily_usage,
        llm=llm,
    )


def _seed(h: Harness, *, message_id: str = "m1", thread_id: str = "t1") -> None:
    parsed = ParsedMessage(
        message_id=message_id,
        thread_id=thread_id,
        from_address="user@example.com",
        reply_to=None,
        to_addresses=("user@example.com",),
        cc_addresses=(),
        subject="Question",
        body_text="What should I do after a death in Luxembourg?",
        return_path="user@example.com",
    )
    h.gmail.seed_parsed_message(parsed)
    h.state.create_record(
        new_queued_record(
            message_key=message_id, thread_id=thread_id, now=h.clock.now()
        )
    )


def test_budget_reached_stops_llm_and_sends_unavailability(
    synthetic_prompt: str,
) -> None:
    llm = fake_llm_for_responses(make_answer_response(), make_answer_response())
    h = _harness(llm=llm, prompt_path=synthetic_prompt, global_limit=1)
    _seed(h)

    first = h.processor.run(gmail_message_id="m1")
    assert first.status == "sent"
    assert len(h.llm.calls) == 1

    h.gmail.seed_parsed_message(
        ParsedMessage(
            message_id="m2",
            thread_id="t2",
            from_address="other@example.com",
            reply_to=None,
            to_addresses=("other@example.com",),
            cc_addresses=(),
            subject="Question",
            body_text="Another question about Luxembourg.",
            return_path="other@example.com",
        )
    )
    h.state.create_record(
        new_queued_record(message_key="m2", thread_id="t2", now=h.clock.now())
    )

    second = h.processor.run(gmail_message_id="m2")
    assert second.status == PROCESS_STATUS_CIRCUIT_OPEN
    assert len(h.llm.calls) == 1
    assert h.gmail.send_reply_calls == 2
    assert LEX_PROCESSED in h.gmail.labels_for("m2")
    record = h.daily_usage.get_record(now=h.clock.now())
    assert record.failures >= 1


def test_force_circuit_open_blocks_without_llm(synthetic_prompt: str) -> None:
    llm = fake_llm_for_responses(make_answer_response())
    h = _harness(llm=llm, prompt_path=synthetic_prompt, force_open=True)
    _seed(h)

    result = h.processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_CIRCUIT_OPEN
    assert len(h.llm.calls) == 0
    assert h.gmail.send_reply_calls == 1
