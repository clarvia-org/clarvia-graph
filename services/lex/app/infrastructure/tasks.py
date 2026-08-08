"""Cloud Tasks adapter creating one durable task per inbound message.

The task name is derived from the Gmail message ID, so Cloud Tasks itself
enforces exactly-once scheduling: a duplicate create is rejected with
``AlreadyExists``, which this adapter reports as success (blueprint 6.2).

The client is injectable and the SDK is imported lazily, so payload and name
construction are unit-tested without credentials or network access.
"""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, Any

from app.domain.ids import request_id_for_message, task_name_for_message
from app.domain.models import GmailMessageRef
from app.domain.ports import EnqueueOutcome
from app.infrastructure.dependencies import require_module
from app.infrastructure.google_errors import is_already_exists

if TYPE_CHECKING:
    from app.config import Settings


def build_tasks_client() -> Any:  # pragma: no cover - needs GCP credentials
    tasks_v2 = require_module("google.cloud.tasks_v2")
    return tasks_v2.CloudTasksClient()


def build_task_payload(ref: GmailMessageRef) -> dict[str, str]:
    """Task body: identifiers only, never message content."""
    return {
        "gmail_message_id": ref.message_id,
        "thread_id": ref.thread_id,
        "request_id": request_id_for_message(ref.message_id),
    }


class CloudTasksAdapter:
    """Implements :class:`app.domain.ports.TaskQueuePort` against Cloud Tasks."""

    def __init__(self, *, settings: Settings, client: Any | None = None) -> None:
        self._settings = settings
        self._client = client

    @property
    def client(self) -> Any:
        if self._client is None:  # pragma: no cover - needs GCP credentials
            self._client = build_tasks_client()
        return self._client

    @property
    def queue_path(self) -> str:
        settings = self._settings
        return (
            f"projects/{settings.gcp_project_id}"
            f"/locations/{settings.cloud_tasks_location}"
            f"/queues/{settings.cloud_tasks_queue}"
        )

    def task_path(self, gmail_message_id: str) -> str:
        return f"{self.queue_path}/tasks/{task_name_for_message(gmail_message_id)}"

    def build_task(self, ref: GmailMessageRef) -> dict[str, Any]:
        settings = self._settings
        body = json.dumps(build_task_payload(ref)).encode("utf-8")
        return {
            "name": self.task_path(ref.message_id),
            "http_request": {
                "http_method": "POST",
                "url": settings.cloud_tasks_target_url,
                "headers": {"Content-Type": "application/json"},
                "body": body,
                "oidc_token": {
                    "service_account_email": (
                        settings.cloud_tasks_invoker_service_account
                    ),
                    "audience": settings.cloud_tasks_target_url,
                },
            },
        }

    def enqueue_process(self, ref: GmailMessageRef) -> EnqueueOutcome:
        try:
            self.client.create_task(
                request={"parent": self.queue_path, "task": self.build_task(ref)}
            )
        except Exception as exc:
            if is_already_exists(exc):
                return EnqueueOutcome.ALREADY_EXISTS
            raise
        return EnqueueOutcome.CREATED


__all__ = ["build_tasks_client", "build_task_payload", "CloudTasksAdapter"]
