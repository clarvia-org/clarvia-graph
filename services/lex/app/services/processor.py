"""Processing worker — Phase 4: lease, gates, model pipeline, and send.

After a lease is acquired the worker parses the inbound message, applies
deterministic gates, and when all gates pass runs the model pipeline, renders
sources, composes the outbound email, and sends via Gmail.
"""

from __future__ import annotations

import uuid
from collections.abc import Callable
from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.domain.hmac_sender import HmacSecretMissingError, compute_sender_hmac
from app.domain.ids import message_key
from app.domain.labels import LEX_FAILED, LEX_IGNORED, LEX_PROCESSED
from app.domain.lease import LeaseOutcome
from app.domain.models import (
    GmailMessageRef,
    LexAction,
    ParsedMessage,
    ProcessingStatus,
    ReplyRecipients,
    new_queued_record,
)
from app.domain.ports import ClockPort, GmailPort, LlmPort, MessageStatePort
from app.email.recipients import build_reply_recipients
from app.email.templates import TECHNICAL_FAILURE_BODY, THREAD_LAST_REPLY_NOTE
from app.email.thread_quote import build_thread_quote, count_lex_replies
from app.infrastructure.daily_usage import DailyUsagePort
from app.infrastructure.rate_limit import RateLimitPort
from app.llm.envelope import build_runtime_envelope
from app.llm.prompt_loader import load_prompt
from app.llm.schema import SCHEMA_VERSION
from app.llm.source_render import insert_sources_before_signoff
from app.logging import get_logger, log_event
from app.services.allowlist import resolve_allowlist_sender_hmacs
from app.services.gates import (
    PROCESS_STATUS_IGNORED,
    GateOutcome,
    check_auto_ignore,
    evaluate_allowlist_gate,
    evaluate_attachment_gate,
    evaluate_circuit_gate,
    evaluate_rate_limit_gate,
    evaluate_recipient_gate,
    evaluate_thread_closed_gate,
    send_template_reply,
)
from app.services.model_pipeline import ModelPipelineFailure, run_model_pipeline
from app.pipeline.two_pass import (
    TwoPassPipelineFailure,
    prepared_to_lex_response,
    run_two_pass_pipeline,
)
from app.services.outbound import send_lex_reply
from app.services.thread_context import prior_thread_history

if TYPE_CHECKING:
    from app.config import Settings

_logger = get_logger("lex.processor")

PROCESS_STATUS_DISABLED = "disabled"
PROCESS_STATUS_PROCESSING = "processing"
PROCESS_STATUS_LEASE_HELD = "lease_held"
PROCESS_STATUS_ALREADY_DONE = "already_done"
PROCESS_STATUS_SENT = "sent"
PROCESS_STATUS_FAILED = "failed"
PROCESS_STATUS_QUEUED = "queued"


@dataclass(frozen=True, slots=True)
class ProcessResult:
    """Operational outcome only; carries no message content."""

    status: str
    gmail_message_id: str
    attempt_count: int = 0

    def as_dict(self) -> dict[str, int | str]:
        return {
            "status": self.status,
            "gmail_message_id": self.gmail_message_id,
            "attempt_count": self.attempt_count,
        }


class Processor:
    """Claims a message, parses it, runs gates, and completes the model step."""

    def __init__(
        self,
        *,
        settings: Settings,
        state: MessageStatePort,
        gmail: GmailPort,
        rate_limit: RateLimitPort,
        daily_usage: DailyUsagePort,
        llm: LlmPort,
        clock: ClockPort,
        worker_id_factory: Callable[[], str] | None = None,
    ) -> None:
        self._settings = settings
        self._state = state
        self._gmail = gmail
        self._rate_limit = rate_limit
        self._daily_usage = daily_usage
        self._llm = llm
        self._clock = clock
        self._worker_id_factory = worker_id_factory or (lambda: uuid.uuid4().hex)

    @property
    def enabled(self) -> bool:
        return (
            self._settings.processing_enabled
            and self._settings.processing_mode != "disabled"
        )

    def run(  # noqa: PLR0911
        self, *, gmail_message_id: str, thread_id: str | None = None
    ) -> ProcessResult:
        key = message_key(gmail_message_id)
        if not self.enabled:
            log_event(
                _logger,
                "process_skipped",
                gmail_message_id=key,
                status=PROCESS_STATUS_DISABLED,
            )
            return ProcessResult(status=PROCESS_STATUS_DISABLED, gmail_message_id=key)

        if self._state.get_record(key) is None:
            self._state.create_record(
                new_queued_record(
                    message_key=key,
                    thread_id=thread_id or "",
                    now=self._clock.now(),
                )
            )

        decision = self._state.try_acquire_lease(
            key,
            worker_id=self._worker_id_factory(),
            lease_duration_seconds=self._settings.lease_duration_seconds,
        )
        if decision.outcome is not LeaseOutcome.ACQUIRED:
            status = _STATUS_BY_OUTCOME[decision.outcome]
            attempt_count = decision.record.attempt_count if decision.record else 0
            log_event(
                _logger,
                "process_lease",
                gmail_message_id=key,
                status=status,
            )
            return ProcessResult(
                status=status, gmail_message_id=key, attempt_count=attempt_count
            )

        attempt_count = decision.record.attempt_count if decision.record else 0
        try:
            return self._run_after_lease(
                key,
                thread_id=thread_id,
                attempt_count=attempt_count,
            )
        except Exception as exc:
            # Clear the lease so Cloud Tasks retries can acquire immediately
            # instead of waiting out lease_duration_seconds.
            code = getattr(exc, "code", None) or type(exc).__name__
            self._state.mark_status(
                key,
                ProcessingStatus.QUEUED,
                error_code=f"crash:{code}"[:120],
            )
            log_event(
                _logger,
                "process_crash_requeued",
                gmail_message_id=key,
                status=PROCESS_STATUS_QUEUED,
                error_code=str(code)[:80],
            )
            raise

    def _run_after_lease(
        self,
        key: str,
        *,
        thread_id: str | None,
        attempt_count: int,
    ) -> ProcessResult:
        record = self._state.get_record(key)
        resolved_thread = thread_id or (record.thread_id if record else "")
        ref = GmailMessageRef(message_id=key, thread_id=resolved_thread)
        parsed = self._gmail.fetch_parsed_message(ref)

        if attempt_count > self._settings.max_process_attempts:
            lex_addresses = frozenset(
                {
                    self._settings.lex_mailbox.lower(),
                    *self._settings.resolved_lex_aliases,
                }
            )
            recipients = build_reply_recipients(
                from_address=parsed.from_address,
                reply_to=parsed.reply_to,
                to_addresses=parsed.to_addresses,
                cc_addresses=parsed.cc_addresses,
                lex_addresses=lex_addresses,
            )
            return self._send_technical_failure(
                key,
                parsed=parsed,
                recipients=recipients,
                attempt_count=attempt_count,
                error_code="max_process_attempts",
            )

        auto = check_auto_ignore(parsed, self._settings)
        if auto.should_ignore:
            self._gmail.add_label(message_id=key, label=LEX_IGNORED)
            self._state.mark_status(key, ProcessingStatus.IGNORED)
            log_event(
                _logger,
                "process_ignored",
                gmail_message_id=key,
                status=PROCESS_STATUS_IGNORED,
            )
            return ProcessResult(
                status=PROCESS_STATUS_IGNORED,
                gmail_message_id=key,
                attempt_count=attempt_count,
            )

        attachment_gate = evaluate_attachment_gate(parsed, self._settings)
        if attachment_gate is not None:
            return self._finish_gate(
                key,
                parsed=parsed,
                gate=attachment_gate,
                attempt_count=attempt_count,
            )

        recipient_gate = evaluate_recipient_gate(parsed, self._settings)
        if recipient_gate is not None:
            return self._finish_gate(
                key,
                parsed=parsed,
                gate=recipient_gate,
                attempt_count=attempt_count,
            )

        sender_hmac = self._sender_hmac(parsed.from_address)

        if self._settings.processing_mode == "allowlist":
            allowlist_gate = evaluate_allowlist_gate(
                sender_hmac=sender_hmac,
                allowed_hmacs=resolve_allowlist_sender_hmacs(self._settings),
            )
            if allowlist_gate is not None:
                return self._finish_gate(
                    key,
                    parsed=parsed,
                    gate=allowlist_gate,
                    attempt_count=attempt_count,
                )

        lex_addresses = frozenset(
            {
                self._settings.lex_mailbox.lower(),
                *self._settings.resolved_lex_aliases,
            }
        )
        thread_messages = list(
            self._gmail.fetch_thread_parsed_messages(thread_id=parsed.thread_id)
        )
        prior_lex_replies = count_lex_replies(
            thread_messages, lex_addresses=lex_addresses
        )
        thread_gate = evaluate_thread_closed_gate(
            parsed=parsed,
            settings=self._settings,
            prior_lex_replies=prior_lex_replies,
        )
        if thread_gate is not None:
            return self._finish_gate(
                key,
                parsed=parsed,
                gate=thread_gate,
                attempt_count=attempt_count,
            )

        rate_decision = self._rate_limit.try_accept_model_eligible(
            sender_hmac=sender_hmac,
            now=self._clock.now(),
            daily_limit=self._settings.max_sender_requests_per_day,
        )
        rate_gate = evaluate_rate_limit_gate(
            parsed=parsed,
            allowed=rate_decision.allowed,
            should_send_notice=rate_decision.should_send_notice,
        )
        if rate_gate is not None:
            outcome = self._finish_gate(
                key,
                parsed=parsed,
                gate=rate_gate,
                attempt_count=attempt_count,
            )
            if rate_gate.send_template:
                self._mark_rate_limit_notice(sender_hmac)
            return outcome

        recipients = build_reply_recipients(
            from_address=parsed.from_address,
            reply_to=parsed.reply_to,
            to_addresses=parsed.to_addresses,
            cc_addresses=parsed.cc_addresses,
            lex_addresses=lex_addresses,
        )
        self._state.update_metadata(
            key,
            sender_hmac=sender_hmac,
            visible_recipient_count=recipients.visible_count,
        )

        circuit_decision = self._daily_usage.try_consume_llm_call(
            now=self._clock.now(),
            global_limit=self._settings.global_daily_llm_limit,
            force_open=self._settings.force_circuit_open,
        )
        circuit_gate = evaluate_circuit_gate(
            parsed=parsed,
            settings=self._settings,
            allowed=circuit_decision.allowed,
        )
        if circuit_gate is not None:
            outcome = self._finish_gate(
                key,
                parsed=parsed,
                gate=circuit_gate,
                attempt_count=attempt_count,
            )
            self._daily_usage.increment_failures(now=self._clock.now())
            if circuit_gate.send_template:
                self._daily_usage.record_email_sent(now=self._clock.now())
            return outcome

        return self._run_model_and_send(
            key,
            parsed=parsed,
            recipients=recipients,
            attempt_count=attempt_count,
            thread_messages=thread_messages,
            prior_lex_replies=prior_lex_replies,
            lex_addresses=lex_addresses,
        )

    def _run_model_and_send(
        self,
        key: str,
        *,
        parsed: ParsedMessage,
        recipients: ReplyRecipients,
        attempt_count: int,
        thread_messages: list[ParsedMessage],
        prior_lex_replies: int,
        lex_addresses: frozenset[str],
    ) -> ProcessResult:
        try:
            if getattr(self._settings, "generation_pipeline", "single_pass") == "two_pass":
                prepared = run_two_pass_pipeline(
                    self._llm,
                    settings=self._settings,
                    parsed=parsed,
                    thread_messages=list(thread_messages),
                    current_date_utc=self._clock.now(),
                )
                lex_response = prepared_to_lex_response(prepared)
                openai_response_id = prepared.openai_response_id
                prompt_version = prepared.prompt_version
                schema_version = prepared.schema_version
                pipeline_version = prepared.pipeline_version
                writer_fallback_used = prepared.used_fallback_renderer
            else:
                system_prompt = load_prompt(self._settings.prompt_path)
                history = prior_thread_history(
                    thread_messages,
                    latest_message_id=parsed.message_id,
                    settings=self._settings,
                )
                envelope = build_runtime_envelope(
                    parsed=parsed,
                    conversation_history=history,
                    current_date_utc=self._clock.now(),
                    prompt_version=self._settings.prompt_version,
                    delivery_channel=parsed.delivery_channel,
                )
                generation = run_model_pipeline(
                    self._llm,
                    system_prompt=system_prompt,
                    runtime_envelope=envelope,
                )
                lex_response = generation.response
                openai_response_id = generation.openai_response_id
                prompt_version = self._settings.prompt_version
                schema_version = SCHEMA_VERSION
                pipeline_version = None
                writer_fallback_used = None
        except (ModelPipelineFailure, TwoPassPipelineFailure) as exc:
            return self._send_technical_failure(
                key,
                parsed=parsed,
                recipients=recipients,
                attempt_count=attempt_count,
                error_code=exc.code,
            )
        except Exception as exc:
            code = getattr(exc, "code", "model_pipeline_error")
            return self._send_technical_failure(
                key,
                parsed=parsed,
                recipients=recipients,
                attempt_count=attempt_count,
                error_code=str(code),
            )

        body_with_sources = insert_sources_before_signoff(
            lex_response.body_markdown,
            lex_response,
        )
        after_body_note = None
        if prior_lex_replies + 1 >= self._settings.max_thread_lex_replies:
            after_body_note = THREAD_LAST_REPLY_NOTE

        quote_plain = None
        quote_html = None
        if self._settings.include_thread_quote:
            quote_plain, quote_html = build_thread_quote(
                thread_messages,
                latest_message_id=parsed.message_id,
                lex_addresses=lex_addresses,
                max_chars_per_message=self._settings.thread_quote_max_chars_per_message,
                max_total_chars=self._settings.thread_quote_max_total_chars,
                include_latest=parsed.delivery_channel == "web",
            )
            if not quote_plain:
                quote_plain = None
                quote_html = None

        send_result = send_lex_reply(
            gmail=self._gmail,
            settings=self._settings,
            parsed=parsed,
            recipients=recipients,
            response_body_markdown=body_with_sources,
            sources=lex_response.sources,
            prompt_version=prompt_version,
            pipeline_version=pipeline_version,
            after_body_note=after_body_note,
            thread_quote_plain=quote_plain,
            thread_quote_html=quote_html,
        )
        self._gmail.add_label(message_id=key, label=LEX_PROCESSED)
        self._state.record_successful_send(
            key,
            action=LexAction(lex_response.action),
            language=lex_response.language,
            openai_response_id=openai_response_id,
            outbound_message_id=send_result.outbound_message_id,
            sent_gmail_message_id=send_result.sent_gmail_message_id,
            model=self._settings.openai_model,
            prompt_version=prompt_version,
            schema_version=schema_version,
            pipeline_version=pipeline_version,
            writer_fallback_used=writer_fallback_used,
        )
        self._daily_usage.record_email_sent(now=self._clock.now())
        log_event(
            _logger,
            "process_sent",
            gmail_message_id=key,
            status=PROCESS_STATUS_SENT,
            action=lex_response.action,
        )
        return ProcessResult(
            status=PROCESS_STATUS_SENT,
            gmail_message_id=key,
            attempt_count=attempt_count,
        )

    def _send_technical_failure(
        self,
        key: str,
        *,
        parsed: ParsedMessage,
        recipients: ReplyRecipients,
        attempt_count: int,
        error_code: str,
    ) -> ProcessResult:
        send_template_reply(
            gmail=self._gmail,
            settings=self._settings,
            parsed=parsed,
            recipients=recipients,
            template_body=TECHNICAL_FAILURE_BODY,
        )
        self._gmail.add_label(message_id=key, label=LEX_FAILED)
        self._state.mark_status(key, ProcessingStatus.FAILED, error_code=error_code)
        log_event(
            _logger,
            "process_failed",
            gmail_message_id=key,
            status=PROCESS_STATUS_FAILED,
            error_code=error_code,
        )
        return ProcessResult(
            status=PROCESS_STATUS_FAILED,
            gmail_message_id=key,
            attempt_count=attempt_count,
        )

    def _sender_hmac(self, from_address: str) -> str:
        secret = self._settings.hmac_secret
        if not secret:
            raise HmacSecretMissingError("hmac_secret is required when processing.")
        return compute_sender_hmac(from_address, secret)

    def _mark_rate_limit_notice(self, sender_hmac: str) -> None:
        mark = getattr(self._rate_limit, "mark_notice_sent", None)
        if callable(mark):
            mark(sender_hmac=sender_hmac, now=self._clock.now())

    def _finish_gate(
        self,
        key: str,
        *,
        parsed: ParsedMessage,
        gate: GateOutcome,
        attempt_count: int,
    ) -> ProcessResult:
        if gate.send_template and gate.recipients and gate.template_body:
            send_template_reply(
                gmail=self._gmail,
                settings=self._settings,
                parsed=parsed,
                recipients=gate.recipients,
                template_body=gate.template_body,
                stand_alone=gate.stand_alone,
                subject_override=gate.subject_override,
            )
        if gate.label:
            self._gmail.add_label(message_id=key, label=gate.label)
        elif gate.send_template:
            self._gmail.add_label(message_id=key, label=LEX_PROCESSED)
        if gate.processing_status is not None:
            self._state.mark_status(key, gate.processing_status)
        log_event(
            _logger,
            "process_gate",
            gmail_message_id=key,
            status=gate.status,
        )
        return ProcessResult(
            status=gate.status,
            gmail_message_id=key,
            attempt_count=attempt_count,
        )


_STATUS_BY_OUTCOME: dict[LeaseOutcome, str] = {
    LeaseOutcome.ACQUIRED: PROCESS_STATUS_PROCESSING,
    LeaseOutcome.LEASE_HELD: PROCESS_STATUS_LEASE_HELD,
    LeaseOutcome.TERMINAL: PROCESS_STATUS_ALREADY_DONE,
    LeaseOutcome.NOT_FOUND: ProcessingStatus.FAILED.value,
}


__all__ = [
    "ProcessResult",
    "Processor",
    "PROCESS_STATUS_DISABLED",
    "PROCESS_STATUS_PROCESSING",
    "PROCESS_STATUS_LEASE_HELD",
    "PROCESS_STATUS_ALREADY_DONE",
    "PROCESS_STATUS_SENT",
    "PROCESS_STATUS_FAILED",
]
