"""Gmail adapter for the delegated Lex mailbox.

The Google client is built lazily and can be injected, so request construction
and response mapping are unit-tested without credentials or network access.

Phase 5 implements thread-aware send idempotency and passes base64url raw MIME
through to the Gmail API without re-encoding.
"""

from __future__ import annotations

import base64
from datetime import datetime
from typing import TYPE_CHECKING, Any

from app.domain.errors import GmailSendUncertainError, NotImplementedForPhase
from app.domain.labels import LEX_LABELS, eligible_message_query
from app.domain.models import GmailMessageRef, ParsedMessage
from app.email.parsing import ParseLimits, parse_raw_message
from app.infrastructure.dependencies import require_module
from app.infrastructure.google_errors import is_uncertain_gmail_send_error

if TYPE_CHECKING:
    from app.config import Settings

#: Domain-wide delegation scopes (Workspace-authorized). ``gmail.modify``
#: covers read; do not request ``gmail.readonly`` or token refresh fails.
GMAIL_SCOPES: tuple[str, ...] = (
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
)

#: Cloud-platform scope so ADC can call IAM Credentials ``signJwt``.
_IAM_SIGN_SCOPES: tuple[str, ...] = (
    "https://www.googleapis.com/auth/cloud-platform",
)

#: Gmail addresses the delegated mailbox as "me" once impersonation is set up.
USER_ID = "me"


def build_gmail_service(settings: Settings) -> Any:  # pragma: no cover - needs GCP
    """Build a domain-delegated Gmail client for the configured mailbox.

    On Cloud Run the metadata credentials object has no ``with_subject``. Use
    IAM Credentials ``signJwt`` (via ``google.auth.iam.Signer``) so domain-wide
    delegation works without a mounted service-account JSON key.
    """
    google_auth = require_module("google.auth")
    google_auth_iam = require_module("google.auth.iam")
    google_requests = require_module("google.auth.transport.requests")
    service_account = require_module("google.oauth2.service_account")
    discovery = require_module("googleapiclient.discovery")

    source_credentials, _project = google_auth.default(scopes=list(_IAM_SIGN_SCOPES))
    sa_email = (settings.cloud_tasks_invoker_service_account or "").strip()
    if not sa_email:
        raise RuntimeError(
            "cloud_tasks_invoker_service_account is required for Gmail "
            "domain-wide delegation on Cloud Run."
        )

    # Local ADC from a SA key already supports with_subject.
    if hasattr(source_credentials, "with_subject"):
        try:
            delegated = source_credentials.with_scopes(
                list(GMAIL_SCOPES)
            ).with_subject(settings.lex_mailbox)
            return discovery.build(
                "gmail", "v1", credentials=delegated, cache_discovery=False
            )
        except AttributeError:
            pass

    request = google_requests.Request()
    signer = google_auth_iam.Signer(request, source_credentials, sa_email)
    delegated = service_account.Credentials(
        signer=signer,
        service_account_email=sa_email,
        token_uri="https://oauth2.googleapis.com/token",
        scopes=list(GMAIL_SCOPES),
        subject=settings.lex_mailbox,
    )
    return discovery.build(
        "gmail", "v1", credentials=delegated, cache_discovery=False
    )


class GoogleGmailAdapter:
    """Implements :class:`app.domain.ports.GmailPort` against the Gmail API."""

    def __init__(self, *, settings: Settings, service: Any | None = None) -> None:
        self._settings = settings
        self._service = service
        self._label_ids: dict[str, str] = {}

    @property
    def service(self) -> Any:
        if self._service is None:  # pragma: no cover - needs GCP credentials
            self._service = build_gmail_service(self._settings)
        return self._service

    def _messages(self) -> Any:
        return self.service.users().messages()

    def ensure_labels(self) -> None:
        labels_api = self.service.users().labels()
        listed = labels_api.list(userId=USER_ID).execute().get("labels", [])
        known = {
            label["name"]: label["id"]
            for label in listed
            if label.get("name") and label.get("id")
        }
        for name in LEX_LABELS:
            if name in known:
                continue
            created = labels_api.create(
                userId=USER_ID,
                body={
                    "name": name,
                    "labelListVisibility": "labelShow",
                    "messageListVisibility": "show",
                },
            ).execute()
            known[name] = created["id"]
        self._label_ids = known

    def _label_id(self, label: str) -> str:
        """Resolve a label name to the Gmail label ID that ``modify`` requires."""
        if label not in self._label_ids:
            self.ensure_labels()
        return self._label_ids[label]

    def list_eligible_message_refs(self, *, max_results: int) -> list[GmailMessageRef]:
        response = (
            self._messages()
            .list(userId=USER_ID, q=eligible_message_query(), maxResults=max_results)
            .execute()
        )
        refs: list[GmailMessageRef] = []
        for item in response.get("messages", []):
            message_id = item.get("id")
            thread_id = item.get("threadId")
            if not message_id or not thread_id:
                continue
            refs.append(GmailMessageRef(message_id=message_id, thread_id=thread_id))
        return refs

    def add_label(self, *, message_id: str, label: str) -> None:
        self._messages().modify(
            userId=USER_ID,
            id=message_id,
            body={"addLabelIds": [self._label_id(label)]},
        ).execute()

    def fetch_parsed_message(self, ref: GmailMessageRef) -> ParsedMessage:
        response = (
            self._messages()
            .get(userId=USER_ID, id=ref.message_id, format="raw")
            .execute()
        )
        raw_data = response.get("raw", "")
        raw_bytes = base64.urlsafe_b64decode(raw_data.encode("ascii"))
        limits = ParseLimits(
            max_body_chars=self._settings.max_body_chars,
            max_thread_chars=self._settings.max_thread_chars,
        )
        return parse_raw_message(
            raw_bytes,
            message_id=ref.message_id,
            thread_id=ref.thread_id,
            limits=limits,
        )

    def fetch_thread_parsed_messages(
        self, *, thread_id: str
    ) -> list[ParsedMessage]:
        """Load the full Gmail thread chronologically for model context."""
        if not thread_id.strip():
            return []
        thread = (
            self.service.users()
            .threads()
            .get(userId=USER_ID, id=thread_id, format="minimal")
            .execute()
        )
        parsed: list[ParsedMessage] = []
        for item in thread.get("messages", []):
            message_id = item.get("id")
            if not message_id:
                continue
            parsed.append(
                self.fetch_parsed_message(
                    GmailMessageRef(message_id=str(message_id), thread_id=thread_id)
                )
            )
        return parsed

    def send_reply(self, *, raw_message: str, thread_id: str) -> str:
        """Send base64url MIME from encode_for_gmail_api without re-encoding."""
        try:
            response = (
                self._messages()
                .send(
                    userId=USER_ID,
                    body={"raw": raw_message, "threadId": thread_id},
                )
                .execute()
            )
        except Exception as exc:
            if is_uncertain_gmail_send_error(exc):
                raise GmailSendUncertainError() from exc
            raise
        message_id = response.get("id")
        if not message_id:
            raise NotImplementedForPhase("gmail.send_reply")
        return str(message_id)

    def find_outbound_in_thread(
        self,
        *,
        thread_id: str,
        outbound_message_id: str,
        request_id: str,
    ) -> str | None:
        thread = (
            self.service.users()
            .threads()
            .get(
                userId=USER_ID,
                id=thread_id,
                format="metadata",
                metadataHeaders=["Message-ID", "X-Lex-Request-ID"],
            )
            .execute()
        )
        for item in thread.get("messages", []):
            gmail_id = item.get("id")
            if not gmail_id:
                continue
            headers = _metadata_headers(item)
            if (
                headers.get("Message-ID") == outbound_message_id
                or headers.get("X-Lex-Request-ID") == request_id
            ):
                return str(gmail_id)
        return None

    def sweep_expired_threads(self, *, now: datetime) -> int:
        """Trash expired threads when retention is enabled (operator opt-in).

        Full Gmail retention requires querying threads by age; this stub returns
        zero until a reviewed retention query is implemented.
        """
        _ = now
        return 0


def trash_thread(service: Any, *, thread_id: str) -> None:
    """Move a Gmail thread to Trash (used when retention is explicitly enabled)."""
    service.users().threads().trash(userId=USER_ID, id=thread_id).execute()


def _metadata_headers(message: dict[str, Any]) -> dict[str, str]:
    payload = message.get("payload", {})
    headers = payload.get("headers", [])
    return {
        str(header["name"]): str(header["value"])
        for header in headers
        if header.get("name") and header.get("value") is not None
    }


__all__ = [
    "GMAIL_SCOPES",
    "USER_ID",
    "build_gmail_service",
    "GoogleGmailAdapter",
    "trash_thread",
]
