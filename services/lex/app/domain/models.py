"""Typed domain models and enumerations.

The structured Lex response models (``LexResponse`` and friends) live in
``app.llm.schema`` and are re-exported here so the domain namespace is complete.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from app.llm.schema import (
    LexContact,
    LexJurisdiction,
    LexResponse,
    LexSource,
)


class ProcessingStatus(str, Enum):
    """Lifecycle of a single inbound message."""

    QUEUED = "queued"
    PROCESSING = "processing"
    SENT = "sent"
    IGNORED = "ignored"
    RATE_LIMITED = "rate_limited"
    FAILED = "failed"


#: A message in one of these states is finished; it can never be leased again.
TERMINAL_STATUSES: frozenset[ProcessingStatus] = frozenset(
    {
        ProcessingStatus.SENT,
        ProcessingStatus.IGNORED,
        ProcessingStatus.RATE_LIMITED,
        ProcessingStatus.FAILED,
    }
)


class LexAction(str, Enum):
    """The response action chosen for a request."""

    ANSWER = "answer"
    CLARIFY = "clarify"
    DECLINE = "decline"


class ConversationRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


@dataclass(frozen=True, slots=True)
class GmailMessageRef:
    """Minimal reference to a Gmail message."""

    message_id: str
    thread_id: str


@dataclass(frozen=True, slots=True)
class ConversationMessage:
    """A single turn in a thread supplied to the model."""

    role: ConversationRole
    text: str
    message_id: str | None = None
    date: str | None = None


@dataclass(frozen=True, slots=True)
class AttachmentMeta:
    """Attachment metadata only — content is never read."""

    filename: str
    mime_type: str
    size: int | None = None


@dataclass(frozen=True, slots=True)
class ParsedMessage:
    """A parsed inbound email, free of raw MIME concerns."""

    message_id: str
    thread_id: str
    from_address: str
    reply_to: str | None
    to_addresses: tuple[str, ...]
    cc_addresses: tuple[str, ...]
    subject: str
    body_text: str
    raw_subject: str = ""
    has_attachments: bool = False
    attachment_meta: tuple[AttachmentMeta, ...] = ()
    message_id_header: str | None = None
    date_header: str | None = None
    in_reply_to: str | None = None
    references: tuple[str, ...] = ()
    auto_submitted: str | None = None
    list_id: str | None = None
    return_path: str | None = None
    precedence: str | None = None
    delivery_channel: str = "email"


# Alias used by parsing helpers that build partial records before freezing.
ParsedMessageFields = ParsedMessage


@dataclass(frozen=True, slots=True)
class ReplyRecipients:
    """The visible reply audience. There is deliberately no BCC field."""

    to_addresses: tuple[str, ...]
    cc_addresses: tuple[str, ...]

    @property
    def visible_count(self) -> int:
        return len(self.to_addresses) + len(self.cc_addresses)


@dataclass(frozen=True, slots=True)
class ProcessingRecord:
    """Operational state for one message (blueprint 23.1).

    This record holds operational metadata only. Bodies, subjects, names, and
    email addresses are never stored; the sender is represented solely by an
    HMAC, and the audience solely by a count.
    """

    message_key: str
    thread_id: str
    status: ProcessingStatus
    discovered_at: datetime
    updated_at: datetime
    lease_until: datetime | None = None
    lease_owner: str | None = None
    attempt_count: int = 0
    llm_call_count: int = 0
    sender_hmac: str = ""
    visible_recipient_count: int = 0
    action: LexAction | None = None
    language: str | None = None
    model: str | None = None
    prompt_version: str | None = None
    schema_version: str | None = None
    pipeline_version: str | None = None
    writer_fallback_used: bool | None = None
    openai_response_id: str | None = None
    outbound_message_id: str | None = None
    sent_gmail_message_id: str | None = None
    last_error_code: str | None = None
    expires_at: datetime | None = None

    @property
    def is_terminal(self) -> bool:
        return self.status in TERMINAL_STATUSES

    @property
    def has_outbound_message(self) -> bool:
        """True once a reply exists, even if the status update was lost."""
        return bool(self.outbound_message_id or self.sent_gmail_message_id)


def new_queued_record(
    *,
    message_key: str,
    thread_id: str,
    now: datetime,
    expires_at: datetime | None = None,
) -> ProcessingRecord:
    """Build the initial record created at discovery time."""
    return ProcessingRecord(
        message_key=message_key,
        thread_id=thread_id,
        status=ProcessingStatus.QUEUED,
        discovered_at=now,
        updated_at=now,
        expires_at=expires_at,
    )


__all__ = [
    "ProcessingStatus",
    "TERMINAL_STATUSES",
    "LexAction",
    "ConversationRole",
    "GmailMessageRef",
    "ConversationMessage",
    "AttachmentMeta",
    "ParsedMessage",
    "ParsedMessageFields",
    "ReplyRecipients",
    "ProcessingRecord",
    "new_queued_record",
    "LexResponse",
    "LexSource",
    "LexContact",
    "LexJurisdiction",
]
