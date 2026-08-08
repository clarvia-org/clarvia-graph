"""Synthetic end-to-end pilot harness for Phase 7 controlled launch.

Runs scripted inbound scenarios through the in-memory Processor stack.
Callers supply a :class:`~app.infrastructure.openai.FakeLlmAdapter`; no live
Gmail or OpenAI.
"""

from __future__ import annotations

import base64
import json
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from email import message_from_bytes
from email.message import EmailMessage
from email.policy import SMTP
from pathlib import Path
from typing import Any, cast

from app.config import SERVICE_ROOT, Settings
from app.domain.models import GmailMessageRef, ParsedMessage, new_queued_record
from app.email.composition import verify_composed_email
from app.email.templates import CONTINUATION_TEXT
from app.infrastructure.clock import FakeClock
from app.infrastructure.daily_usage import InMemoryDailyUsage
from app.infrastructure.memory import InMemoryGmail, InMemoryMessageState
from app.infrastructure.openai import FakeLlmAdapter
from app.infrastructure.rate_limit import InMemoryRateLimit
from app.logging import ALLOWED_LOG_FIELDS
from app.services.processor import PROCESS_STATUS_FAILED, Processor

ALLOWED_PILOT_EMAIL = "pilot@example.com"


@dataclass(frozen=True, slots=True)
class PilotInboundSpec:
    """Inbound message fields for a synthetic pilot case."""

    message_id: str
    thread_id: str
    from_address: str
    body_text: str
    to_addresses: tuple[str, ...] = ()
    cc_addresses: tuple[str, ...] = ()
    subject: str = "Bereavement question"
    reply_to: str | None = None
    has_attachments: bool = False
    auto_submitted: str | None = None
    raw_mime_kind: str | None = None


@dataclass(frozen=True, slots=True)
class PilotCase:
    """One synthetic E2E conversation scenario."""

    id: str
    category: str
    language: str
    expected_status: str
    inbound: PilotInboundSpec
    processing_mode: str = "public"
    processing_enabled: bool = True
    llm_fixture: str | None = None
    anchor: bool = False
    openai_failure: bool = False
    gmail_failure: bool = False
    duplicate_retry: bool = False
    rate_limit_prior_count: int = 0
    allowlisted_sender: bool = False
    force_circuit_open: bool = False


@dataclass
class PilotRunResult:
    """Outcome of running one pilot case."""

    case_id: str
    category: str
    expected_status: str
    actual_status: str
    send_count: int
    llm_call_count: int
    footer_ok: bool
    continuation_ok: bool
    duplicate_send: bool
    is_anchor: bool = False
    anchor_validation_ok: bool | None = None
    error: str | None = None

    @property
    def passed(self) -> bool:
        if self.error is not None:
            return False
        if self.actual_status != self.expected_status:
            return False
        if self.duplicate_send:
            return False
        if self.is_anchor and self.anchor_validation_ok is False:
            return False
        return not (
            self.send_count > 0 and not (self.footer_ok and self.continuation_ok)
        )


@dataclass
class PilotSuiteResult:
    """Aggregate results for a pilot run."""

    results: list[PilotRunResult] = field(default_factory=list)

    @property
    def passed_count(self) -> int:
        return sum(1 for item in self.results if item.passed)

    @property
    def failed_count(self) -> int:
        return len(self.results) - self.passed_count

    @property
    def duplicate_send_count(self) -> int:
        return sum(1 for item in self.results if item.duplicate_send)

    @property
    def anchor_results(self) -> list[PilotRunResult]:
        return [item for item in self.results if item.is_anchor]


class FailingGmail(InMemoryGmail):
    """Gmail double that simulates send API failure."""

    def send_reply(self, *, raw_message: str, thread_id: str) -> str:
        raise RuntimeError("gmail_send_failed")


def default_fixtures_path() -> Path:
    return SERVICE_ROOT / "tests" / "fixtures" / "pilot" / "conversations.jsonl"


def load_pilot_cases(path: Path | None = None) -> list[PilotCase]:
    """Load synthetic pilot cases from JSONL."""
    fixture_path = path or default_fixtures_path()
    cases: list[PilotCase] = []
    with fixture_path.open(encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if not stripped:
                continue
            cases.append(parse_pilot_case(json.loads(stripped)))
    return cases


def parse_pilot_case(data: dict[str, Any]) -> PilotCase:
    inbound_data = data["inbound"]
    inbound = PilotInboundSpec(
        message_id=str(inbound_data["message_id"]),
        thread_id=str(inbound_data["thread_id"]),
        from_address=str(inbound_data["from_address"]),
        body_text=str(inbound_data["body_text"]),
        to_addresses=tuple(inbound_data.get("to_addresses", ())),
        cc_addresses=tuple(inbound_data.get("cc_addresses", ())),
        subject=str(inbound_data.get("subject", "Bereavement question")),
        reply_to=inbound_data.get("reply_to"),
        has_attachments=bool(inbound_data.get("has_attachments", False)),
        auto_submitted=inbound_data.get("auto_submitted"),
        raw_mime_kind=inbound_data.get("raw_mime_kind"),
    )
    return PilotCase(
        id=str(data["id"]),
        category=str(data["category"]),
        language=str(data.get("language", "en")),
        expected_status=str(data["expected_status"]),
        inbound=inbound,
        processing_mode=str(data.get("processing_mode", "public")),
        processing_enabled=bool(data.get("processing_enabled", True)),
        llm_fixture=(
            str(data["llm_fixture"]) if data.get("llm_fixture") is not None else None
        ),
        anchor=bool(data.get("anchor", False)),
        openai_failure=bool(data.get("openai_failure", False)),
        gmail_failure=bool(data.get("gmail_failure", False)),
        duplicate_retry=bool(data.get("duplicate_retry", False)),
        rate_limit_prior_count=int(data.get("rate_limit_prior_count", 0)),
        allowlisted_sender=bool(data.get("allowlisted_sender", False)),
        force_circuit_open=bool(data.get("force_circuit_open", False)),
    )


def run_pilot_case(
    case: PilotCase,
    *,
    settings: Settings,
    llm: FakeLlmAdapter,
    prompt_path: str,
    anchor_validation_ok: bool | None = None,
    rate_limit: InMemoryRateLimit | None = None,
    daily_usage: InMemoryDailyUsage | None = None,
    gmail: InMemoryGmail | None = None,
) -> PilotRunResult:
    """Execute one pilot case through Processor.run."""
    clock = FakeClock()
    gmail_instance: InMemoryGmail
    if gmail is not None:
        gmail_instance = gmail
    elif case.gmail_failure:
        gmail_instance = FailingGmail()
    else:
        gmail_instance = InMemoryGmail()
    state = InMemoryMessageState(clock=clock)
    limiter = rate_limit or InMemoryRateLimit()
    usage = daily_usage or InMemoryDailyUsage()

    processor = Processor(
        settings=settings,
        state=state,
        gmail=gmail_instance,
        rate_limit=limiter,
        daily_usage=usage,
        llm=llm,
        clock=clock,
        worker_id_factory=lambda: f"pilot-{case.id}",
    )

    parsed = seed_inbound(case, gmail_instance)
    state.create_record(
        new_queued_record(
            message_key=parsed.message_id,
            thread_id=parsed.thread_id,
            now=clock.now(),
        )
    )

    actual_status = "error"
    error: str | None = None
    try:
        if case.duplicate_retry:
            gmail_instance.simulate_timeout_after_accept = True
            processor.run(gmail_message_id=parsed.message_id)
            gmail_instance.simulate_timeout_after_accept = False
            second = processor.run(gmail_message_id=parsed.message_id)
            actual_status = second.status
        else:
            result = processor.run(gmail_message_id=parsed.message_id)
            actual_status = result.status
    except Exception as exc:  # noqa: BLE001 — pilot harness maps infra failures
        if case.gmail_failure or case.openai_failure:
            actual_status = PROCESS_STATUS_FAILED
        else:
            error = type(exc).__name__

    footer_ok, continuation_ok = check_outbound_formatting(gmail_instance)
    duplicate_send = detect_duplicate_send(gmail_instance, case)

    return PilotRunResult(
        case_id=case.id,
        category=case.category,
        expected_status=case.expected_status,
        actual_status=actual_status,
        send_count=gmail_instance.send_reply_calls,
        llm_call_count=len(llm.calls),
        footer_ok=footer_ok,
        continuation_ok=continuation_ok,
        duplicate_send=duplicate_send,
        is_anchor=case.anchor,
        anchor_validation_ok=anchor_validation_ok,
        error=error,
    )


def run_pilot_suite(
    cases: Sequence[PilotCase],
    *,
    settings_for_case: Any,
    llm_for_case: Any,
    anchor_validation_for_case: Any | None = None,
) -> PilotSuiteResult:
    """Run all pilot cases and return aggregate results."""
    suite = PilotSuiteResult()
    for case in cases:
        settings = settings_for_case(case)
        llm = llm_for_case(case)
        anchor_ok = (
            anchor_validation_for_case(case) if anchor_validation_for_case else None
        )
        suite.results.append(
            run_pilot_case(
                case,
                settings=settings,
                llm=llm,
                prompt_path=str(settings.prompt_path),
                anchor_validation_ok=anchor_ok,
            )
        )
    return suite


def check_launch_thresholds(suite: PilotSuiteResult) -> dict[str, bool]:
    """Apply blueprint §27.5 launch thresholds to synthetic pilot results."""
    anchors = suite.anchor_results
    action_ok = (
        all(item.actual_status == item.expected_status for item in anchors)
        if anchors
        else True
    )
    invented_ok = (
        all(item.anchor_validation_ok is not False for item in anchors)
        if anchors
        else True
    )
    formatting_ok = all(
        item.footer_ok and item.continuation_ok
        for item in suite.results
        if item.send_count > 0
    )
    duplicate_ok = suite.duplicate_send_count == 0
    return {
        "anchor_action_correct": action_ok,
        "zero_invented_contacts": invented_ok,
        "formatting_compliance": formatting_ok,
        "zero_duplicate_sends": duplicate_ok,
        "footer_on_all_outbound": formatting_ok,
    }


def assert_no_pii_log_fields(field_names: Iterable[str]) -> bool:
    """Return True when every field is on the logging allow-list."""
    return all(name in ALLOWED_LOG_FIELDS for name in field_names)


def iter_case_categories(cases: Sequence[PilotCase]) -> set[str]:
    return {case.category for case in cases}


def seed_inbound(case: PilotCase, gmail: InMemoryGmail) -> ParsedMessage:
    spec = case.inbound
    ref = GmailMessageRef(message_id=spec.message_id, thread_id=spec.thread_id)
    if spec.raw_mime_kind == "html_only":
        message = EmailMessage(policy=SMTP)
        message["From"] = spec.from_address
        message["To"] = spec.to_addresses[0] if spec.to_addresses else spec.from_address
        message["Subject"] = spec.subject
        message["Return-Path"] = spec.from_address
        message.add_alternative(
            f"<html><body><p>{spec.body_text}</p></body></html>",
            subtype="html",
        )
        gmail.seed_raw_message(
            message_id=spec.message_id,
            thread_id=spec.thread_id,
            raw=message.as_bytes(),
        )
        return gmail.fetch_parsed_message(ref)
    if spec.has_attachments:
        message = EmailMessage(policy=SMTP)
        message["From"] = spec.from_address
        message["To"] = spec.to_addresses[0] if spec.to_addresses else spec.from_address
        message["Return-Path"] = spec.from_address
        message.set_content(spec.body_text or "See attached.", subtype="plain")
        message.add_attachment(
            b"synthetic-pdf-bytes",
            maintype="application",
            subtype="pdf",
            filename="document.pdf",
        )
        gmail.seed_raw_message(
            message_id=spec.message_id,
            thread_id=spec.thread_id,
            raw=message.as_bytes(),
        )
        return gmail.fetch_parsed_message(ref)
    to_addresses = spec.to_addresses or (spec.from_address,)
    parsed = ParsedMessage(
        message_id=spec.message_id,
        thread_id=spec.thread_id,
        from_address=spec.from_address,
        reply_to=spec.reply_to,
        to_addresses=to_addresses,
        cc_addresses=spec.cc_addresses,
        subject=spec.subject,
        body_text=spec.body_text,
        return_path=spec.from_address,
        has_attachments=spec.has_attachments,
        auto_submitted=spec.auto_submitted,
    )
    gmail.seed_parsed_message(parsed)
    return parsed


def check_outbound_formatting(gmail: InMemoryGmail) -> tuple[bool, bool]:
    if gmail.last_sent_raw is None:
        return True, True
    try:
        decoded = base64.urlsafe_b64decode(gmail.last_sent_raw.encode("ascii"))
        loaded = cast(
            EmailMessage,
            message_from_bytes(decoded, policy=SMTP),  # type: ignore[arg-type]
        )
        verify_composed_email(loaded)
    except Exception:  # noqa: BLE001
        return False, False
    plain = ""
    for part in loaded.walk():
        if part.get_content_type() == "text/plain":
            plain = part.get_content()
    footer_ok = "Clarvia is a nonprofit." in plain
    continuation_ok = CONTINUATION_TEXT in plain
    return footer_ok, continuation_ok


def detect_duplicate_send(gmail: InMemoryGmail, case: PilotCase) -> bool:
    if not case.duplicate_retry:
        return False
    return gmail.send_reply_calls > 1


__all__ = [
    "ALLOWED_PILOT_EMAIL",
    "FailingGmail",
    "PilotCase",
    "PilotInboundSpec",
    "PilotRunResult",
    "PilotSuiteResult",
    "assert_no_pii_log_fields",
    "check_launch_thresholds",
    "check_outbound_formatting",
    "default_fixtures_path",
    "detect_duplicate_send",
    "iter_case_categories",
    "load_pilot_cases",
    "parse_pilot_case",
    "run_pilot_case",
    "run_pilot_suite",
    "seed_inbound",
]
