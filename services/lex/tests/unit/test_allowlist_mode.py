"""Allowlist resolution and processing mode tests."""

from __future__ import annotations

import itertools

from app.domain.hmac_sender import compute_sender_hmac
from app.domain.labels import LEX_IGNORED
from app.domain.models import ParsedMessage, new_queued_record
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.services.allowlist import (
    cached_allowlist_hmacs,
    resolve_allowlist_sender_hmacs,
)
from app.services.gates import PROCESS_STATUS_ALLOWLIST_REJECTED
from app.services.processor import Processor

from .conftest import build_settings, fake_llm_for_responses, make_answer_response

HMAC_SECRET = "allowlist-test-secret"
ALLOWED_EMAIL = "pilot@example.com"
UNIT_SECRET = "allowlist-unit-secret"


def test_non_allowlisted_sender_is_ignored_without_model(
    synthetic_prompt: str,
) -> None:
    clock = FakeClock()
    gmail = InMemoryGmail()
    state = InMemoryMessageState(clock=clock)
    llm = fake_llm_for_responses(make_answer_response())
    allowed_hmac = compute_sender_hmac(ALLOWED_EMAIL, HMAC_SECRET)
    processor = Processor(
        settings=build_settings(
            processing_enabled=True,
            processing_mode="allowlist",
            hmac_secret=HMAC_SECRET,
            allowlist_sender_hmacs=allowed_hmac,
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
        from_address="stranger@example.com",
        reply_to=None,
        to_addresses=("stranger@example.com",),
        cc_addresses=(),
        subject="Question",
        body_text="What should I do?",
        return_path="stranger@example.com",
    )
    gmail.seed_parsed_message(parsed)
    state.create_record(
        new_queued_record(message_key="m1", thread_id="t1", now=clock.now())
    )

    result = processor.run(gmail_message_id="m1")

    assert result.status == PROCESS_STATUS_ALLOWLIST_REJECTED
    assert len(llm.calls) == 0
    assert gmail.send_reply_calls == 0
    assert LEX_IGNORED in gmail.labels_for("m1")


def test_allowlisted_sender_via_env_emails(
    synthetic_prompt: str,
) -> None:
    clock = FakeClock()
    gmail = InMemoryGmail()
    state = InMemoryMessageState(clock=clock)
    llm = fake_llm_for_responses(make_answer_response())
    processor = Processor(
        settings=build_settings(
            processing_enabled=True,
            processing_mode="allowlist",
            hmac_secret=HMAC_SECRET,
            allowlist_senders=ALLOWED_EMAIL,
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
        from_address=ALLOWED_EMAIL,
        reply_to=None,
        to_addresses=(ALLOWED_EMAIL,),
        cc_addresses=(),
        subject="Question",
        body_text="What should I do after a death in Luxembourg?",
        return_path=ALLOWED_EMAIL,
    )
    gmail.seed_parsed_message(parsed)
    state.create_record(
        new_queued_record(message_key="m1", thread_id="t1", now=clock.now())
    )

    result = processor.run(gmail_message_id="m1")

    assert result.status == "sent"
    assert len(llm.calls) == 1


def test_resolve_explicit_hmacs_only() -> None:
    settings = build_settings(
        allowlist_sender_hmacs="abc,def",
        allowlist_senders="",
        hmac_secret=UNIT_SECRET,
    )
    assert resolve_allowlist_sender_hmacs(settings) == frozenset({"abc", "def"})


def test_resolve_hashes_allowlist_senders() -> None:
    settings = build_settings(
        allowlist_sender_hmacs="",
        allowlist_senders="Pilot@Example.com, other@example.com",
        hmac_secret=UNIT_SECRET,
    )
    expected = frozenset(
        {
            compute_sender_hmac("Pilot@Example.com", UNIT_SECRET),
            compute_sender_hmac("other@example.com", UNIT_SECRET),
        }
    )
    assert resolve_allowlist_sender_hmacs(settings) == expected


def test_cached_allowlist_hmacs_matches_resolve() -> None:
    settings = build_settings(
        allowlist_sender_hmacs="deadbeef",
        allowlist_senders="pilot@example.com",
        hmac_secret=UNIT_SECRET,
    )
    cached = cached_allowlist_hmacs(
        settings.allowlist_sender_hmacs,
        settings.allowlist_senders,
        settings.hmac_secret,
    )
    assert cached == resolve_allowlist_sender_hmacs(settings)
