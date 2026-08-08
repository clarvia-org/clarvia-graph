"""Adapter selection for the configured backend.

``adapter_backend=memory`` is the local and test default; ``gcp`` is required
in production (enforced in :mod:`app.config`). Google SDKs are imported only
when the GCP adapters actually build a client.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.domain.ports import (
    ClockPort,
    GmailPort,
    LlmPort,
    MessageStatePort,
    TaskQueuePort,
)
from app.infrastructure.clock import SystemClock
from app.infrastructure.daily_usage import (
    DailyUsagePort,
    FirestoreDailyUsage,
    InMemoryDailyUsage,
)
from app.infrastructure.firestore import FirestoreMessageState
from app.infrastructure.gmail import GoogleGmailAdapter
from app.infrastructure.memory import (
    InMemoryGmail,
    InMemoryMessageState,
    InMemoryTaskQueue,
)
from app.infrastructure.openai import FakeLlmAdapter, OpenAIResponsesAdapter
from app.infrastructure.rate_limit import (
    FirestoreRateLimit,
    InMemoryRateLimit,
    RateLimitPort,
)
from app.infrastructure.tasks import CloudTasksAdapter

if TYPE_CHECKING:
    from app.config import Settings


@dataclass(frozen=True, slots=True)
class Adapters:
    """The set of ports a request handler needs."""

    gmail: GmailPort
    tasks: TaskQueuePort
    state: MessageStatePort
    rate_limit: RateLimitPort
    daily_usage: DailyUsagePort
    llm: LlmPort
    clock: ClockPort


def build_llm_adapter(settings: Settings, *, llm: LlmPort | None = None) -> LlmPort:
    """Select the LLM adapter for ``settings`` unless an override is supplied."""
    if llm is not None:
        return llm
    if settings.adapter_backend == "memory":
        return FakeLlmAdapter()
    return OpenAIResponsesAdapter(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        max_output_tokens=settings.max_output_tokens,
    )


def build_adapters(
    settings: Settings,
    *,
    clock: ClockPort | None = None,
    llm: LlmPort | None = None,
) -> Adapters:
    """Construct adapters for ``settings.adapter_backend``."""
    resolved_clock: ClockPort = clock or SystemClock()
    resolved_llm = build_llm_adapter(settings, llm=llm)
    if settings.adapter_backend == "memory":
        return Adapters(
            gmail=InMemoryGmail(),
            tasks=InMemoryTaskQueue(),
            state=InMemoryMessageState(clock=resolved_clock),
            rate_limit=InMemoryRateLimit(),
            daily_usage=InMemoryDailyUsage(),
            llm=resolved_llm,
            clock=resolved_clock,
        )
    return Adapters(
        gmail=GoogleGmailAdapter(settings=settings),
        tasks=CloudTasksAdapter(settings=settings),
        state=FirestoreMessageState(settings=settings, clock=resolved_clock),
        rate_limit=FirestoreRateLimit(settings=settings, clock=resolved_clock),
        daily_usage=FirestoreDailyUsage(settings=settings, clock=resolved_clock),
        llm=resolved_llm,
        clock=resolved_clock,
    )


__all__ = ["Adapters", "build_adapters", "build_llm_adapter"]
