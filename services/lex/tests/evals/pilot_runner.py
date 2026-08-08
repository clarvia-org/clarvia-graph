"""Test-layer wiring for the Phase 7 pilot harness."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import cast

from app.config import ProcessingMode, Settings
from app.domain.hmac_sender import compute_sender_hmac
from app.domain.models import new_queued_record
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.openai import FakeLlmAdapter
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.llm.validation import LexValidationError, validate_lex_response
from app.ops.pilot_harness import (
    ALLOWED_PILOT_EMAIL,
    PilotCase,
    PilotInboundSpec,
    PilotSuiteResult,
    load_pilot_cases,
    run_pilot_case,
    seed_inbound,
)
from app.services.processor import Processor

from tests.evals.fixture_builder import fixture_generation
from tests.unit.conftest import build_settings

HMAC_SECRET = "pilot-harness-secret"


def _prior_worker_id(index: int) -> Callable[[], str]:
    return lambda: f"prior-{index}"


def build_pilot_settings(case: PilotCase, *, prompt_path: str) -> Settings:
    allowlist_senders = ""
    allowlist_hmacs = ""
    if case.processing_mode == "allowlist":
        if case.allowlisted_sender:
            allowlist_senders = case.inbound.from_address
        else:
            allowlist_hmacs = compute_sender_hmac(ALLOWED_PILOT_EMAIL, HMAC_SECRET)
    return build_settings(
        processing_enabled=case.processing_enabled,
        processing_mode=cast(ProcessingMode, case.processing_mode),
        hmac_secret=HMAC_SECRET,
        prompt_path=prompt_path,
        allowlist_senders=allowlist_senders,
        allowlist_sender_hmacs=allowlist_hmacs,
        force_circuit_open=case.force_circuit_open,
    )


def build_pilot_llm(case: PilotCase) -> FakeLlmAdapter:
    if case.openai_failure:
        return FakeLlmAdapter(default_error=RuntimeError("openai_unavailable"))
    if case.llm_fixture is None:
        return FakeLlmAdapter(responses=[])
    return FakeLlmAdapter(responses=[fixture_generation(case.llm_fixture)])


def validate_anchor_fixture(case: PilotCase) -> bool:
    if not case.anchor:
        return True
    if case.openai_failure or case.gmail_failure:
        return case.expected_status == "failed"
    if case.llm_fixture is None:
        return True
    generation = fixture_generation(case.llm_fixture)
    try:
        validate_lex_response(
            generation.response,
            web_search_source_urls=generation.web_search_source_urls,
            web_search_calls=generation.web_search_calls,
        )
    except LexValidationError:
        return False
    return True


def seed_rate_limit_history(
    case: PilotCase,
    *,
    settings: Settings,
    rate_limit: InMemoryRateLimit,
    daily_usage: InMemoryDailyUsage,
) -> None:
    if case.rate_limit_prior_count <= 0:
        return
    clock = FakeClock()
    state = InMemoryMessageState(clock=clock)
    for index in range(case.rate_limit_prior_count):
        message_id = f"{case.id}-prior-{index}"
        gmail = InMemoryGmail()
        prior_case = PilotCase(
            id=f"{case.id}-prior",
            category=case.category,
            language=case.language,
            expected_status="sent",
            inbound=PilotInboundSpec(
                message_id=message_id,
                thread_id=case.inbound.thread_id,
                from_address=case.inbound.from_address,
                body_text=case.inbound.body_text,
                to_addresses=(case.inbound.from_address,),
            ),
            llm_fixture="answer_lu_death",
        )
        processor = Processor(
            settings=settings,
            state=state,
            gmail=gmail,
            rate_limit=rate_limit,
            daily_usage=daily_usage,
            llm=build_pilot_llm(prior_case),
            clock=clock,
            worker_id_factory=_prior_worker_id(index),
        )
        parsed = seed_inbound(prior_case, gmail)
        state.create_record(
            new_queued_record(
                message_key=parsed.message_id,
                thread_id=parsed.thread_id,
                now=clock.now(),
            )
        )
        processor.run(gmail_message_id=parsed.message_id)


def run_full_pilot_suite(
    *,
    prompt_path: str,
    fixtures_path: Path | None = None,
) -> PilotSuiteResult:
    cases = load_pilot_cases(fixtures_path)
    suite = PilotSuiteResult()
    for case in cases:
        settings = build_pilot_settings(case, prompt_path=prompt_path)
        rate_limit = InMemoryRateLimit()
        daily_usage = InMemoryDailyUsage()
        if case.rate_limit_prior_count > 0:
            seed_rate_limit_history(
                case,
                settings=settings,
                rate_limit=rate_limit,
                daily_usage=daily_usage,
            )
        suite.results.append(
            run_pilot_case(
                case,
                settings=settings,
                llm=build_pilot_llm(case),
                prompt_path=prompt_path,
                anchor_validation_ok=validate_anchor_fixture(case),
                rate_limit=rate_limit,
                daily_usage=daily_usage,
            )
        )
    return suite


__all__ = [
    "build_pilot_llm",
    "build_pilot_settings",
    "run_full_pilot_suite",
    "seed_rate_limit_history",
    "validate_anchor_fixture",
]
