"""Accept a clarvia.org Ask us submission into the existing Gmail pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.email.ask_inbound import AskInboundError, encode_ask_inbound
from app.email.recipients import is_valid_address, normalize_address
from app.logging import get_logger, log_event

if TYPE_CHECKING:
    from app.config import Settings
    from app.domain.ports import GmailPort
    from app.services.poller import Poller

_logger = get_logger("lex.ask_intake")

STATUS_ACCEPTED = "accepted"
STATUS_DISABLED = "disabled"
STATUS_INVALID = "invalid"


@dataclass(frozen=True, slots=True)
class AskIntakeResult:
    status: str
    code: str | None = None

    def as_dict(self) -> dict[str, str]:
        payload = {"status": self.status}
        if self.code:
            payload["code"] = self.code
        return payload


class AskIntake:
    """Insert inbound-shaped mail, then enqueue the same process task as poll."""

    def __init__(
        self,
        *,
        settings: Settings,
        gmail: GmailPort,
        poller: Poller,
    ) -> None:
        self._settings = settings
        self._gmail = gmail
        self._poller = poller

    @property
    def enabled(self) -> bool:
        return (
            self._settings.processing_enabled
            and self._settings.processing_mode != "disabled"
        )

    def submit(self, *, email: str, question: str, consent: bool) -> AskIntakeResult:
        if not self.enabled:
            log_event(_logger, "ask_intake_skipped", status=STATUS_DISABLED)
            return AskIntakeResult(status=STATUS_DISABLED, code="processing_disabled")
        if consent is not True:
            return AskIntakeResult(status=STATUS_INVALID, code="consent_required")
        sender = normalize_address(email)
        if not is_valid_address(sender):
            return AskIntakeResult(status=STATUS_INVALID, code="invalid_email")
        body = question.strip()
        if len(body) > self._settings.max_body_chars:
            return AskIntakeResult(status=STATUS_INVALID, code="question_too_long")

        try:
            raw = encode_ask_inbound(
                from_address=sender,
                question=body,
                mailbox=self._settings.lex_mailbox,
            )
        except AskInboundError as exc:
            return AskIntakeResult(status=STATUS_INVALID, code=exc.code)

        self._gmail.ensure_labels()
        ref = self._gmail.insert_inbound(raw_message=raw)
        self._poller.enqueue_message(ref)
        log_event(
            _logger,
            "ask_intake_accepted",
            gmail_message_id=ref.message_id,
            gmail_thread_id=ref.thread_id,
            status=STATUS_ACCEPTED,
        )
        return AskIntakeResult(status=STATUS_ACCEPTED)


__all__ = [
    "STATUS_ACCEPTED",
    "STATUS_DISABLED",
    "STATUS_INVALID",
    "AskIntakeResult",
    "AskIntake",
]
