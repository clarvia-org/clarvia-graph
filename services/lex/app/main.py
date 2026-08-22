"""FastAPI application for the Lex email service.

Phase 2 implements discovery and the worker lease. Phase 3 adds MIME parsing,
deterministic gates, template replies, and rate limiting. Phase 4 completes the
model pipeline and sends Lex replies when all gates pass.

Responses never expose configuration, secrets, message content, or stack
traces.
"""

from __future__ import annotations

import json
from typing import TYPE_CHECKING

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app import __version__
from app.config import Settings, get_settings
from app.domain.errors import MissingDependencyError, NotImplementedForPhase
from app.infrastructure.factory import build_adapters
from app.logging import configure_logging
from app.services.ask_auth import (
    SIGNATURE_HEADER,
    TIMESTAMP_HEADER,
    AskAuthError,
    verify_ask_signature,
)
from app.services.ask_intake import (
    STATUS_ACCEPTED,
    STATUS_DISABLED,
    STATUS_INVALID,
    AskIntake,
)
from app.services.poller import Poller
from app.services.processor import Processor
from app.services.retention import RetentionWorker

if TYPE_CHECKING:
    from app.infrastructure.factory import Adapters

INTERNAL_TOKEN_HEADER = "X-Lex-Internal-Token"


class ProcessRequest(BaseModel):
    """Body of a Cloud Tasks processing request: identifiers only."""

    gmail_message_id: str = Field(min_length=1)
    thread_id: str | None = None


def create_app(
    settings: Settings | None = None, *, adapters: Adapters | None = None
) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)
    resolved = adapters or build_adapters(settings)

    app = FastAPI(
        title="Clarvia Lex email service",
        version=__version__,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    poller = Poller(
        settings=settings,
        gmail=resolved.gmail,
        tasks=resolved.tasks,
        state=resolved.state,
        clock=resolved.clock,
    )
    processor = Processor(
        settings=settings,
        state=resolved.state,
        gmail=resolved.gmail,
        rate_limit=resolved.rate_limit,
        daily_usage=resolved.daily_usage,
        llm=resolved.llm,
        clock=resolved.clock,
    )
    retention = RetentionWorker(
        settings=settings,
        state=resolved.state,
        rate_limit=resolved.rate_limit,
        daily_usage=resolved.daily_usage,
        gmail=resolved.gmail,
        clock=resolved.clock,
    )

    ask_intake = AskIntake(
        settings=settings,
        gmail=resolved.gmail,
        poller=poller,
    )

    def require_internal_token(
        token: str | None = Header(default=None, alias=INTERNAL_TOKEN_HEADER),
    ) -> None:
        """Optional shared-secret gate for the internal endpoints.

        Cloud Run IAM (OIDC from Cloud Scheduler and Cloud Tasks) is the primary
        control. When ``INTERNAL_AUTH_TOKEN`` is configured this adds a second
        check; when it is unset the endpoints rely on IAM alone, which keeps
        local runs and tests usable.
        """
        expected = settings.internal_auth_token
        if expected and token != expected:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized"
            )

    @app.exception_handler(NotImplementedForPhase)
    async def _not_implemented_handler(
        _request: Request, exc: NotImplementedForPhase
    ) -> JSONResponse:
        # Stable, non-sensitive body. No config, secrets, or stack trace.
        return JSONResponse(
            status_code=501,
            content={"detail": "not_implemented_in_current_phase", "code": exc.code},
        )

    @app.exception_handler(MissingDependencyError)
    async def _missing_dependency_handler(
        _request: Request, exc: MissingDependencyError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"detail": "backend_dependency_missing", "code": exc.module_name},
        )

    # Cloud Run reserves paths ending in "z" (e.g. /healthz); use /health.
    @app.get("/health")
    async def health() -> dict[str, str]:
        return {
            "status": "ok",
            "version": __version__,
            "prompt_version": settings.prompt_version,
            "schema_version": settings.schema_version,
        }

    @app.post("/internal/poll", dependencies=[Depends(require_internal_token)])
    async def internal_poll() -> dict[str, int | str]:
        return poller.run().as_dict()

    @app.post("/internal/process", dependencies=[Depends(require_internal_token)])
    async def internal_process(payload: ProcessRequest) -> JSONResponse:
        """Process one message.

        ``lease_held`` must not return HTTP 200: Cloud Tasks treats 2xx as
        success and stops retrying, which permanently strands a message when the
        first worker crashes after acquiring the lease.
        """
        from app.services.processor import PROCESS_STATUS_LEASE_HELD

        result = processor.run(
            gmail_message_id=payload.gmail_message_id, thread_id=payload.thread_id
        )
        body = result.as_dict()
        if result.status == PROCESS_STATUS_LEASE_HELD:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content=body,
            )
        return JSONResponse(status_code=status.HTTP_200_OK, content=body)

    @app.post("/internal/retention", dependencies=[Depends(require_internal_token)])
    async def internal_retention() -> dict[str, int]:
        return retention.run().as_dict()

    @app.post("/v1/ask")
    async def ask_ingest(request: Request) -> JSONResponse:
        """Accept a clarvia.org Ask us submission.

        Authenticated with ``LEX_WEBSITE_HMAC_SECRET``. This secret cannot call
        ``/internal/*``. Fail closed when the secret is unset.
        """
        raw = (await request.body()).decode("utf-8")
        try:
            verify_ask_signature(
                secret=settings.website_hmac_secret,
                timestamp=request.headers.get(TIMESTAMP_HEADER, ""),
                body=raw,
                signature=request.headers.get(SIGNATURE_HEADER, ""),
            )
        except AskAuthError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized"
            ) from None
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": STATUS_INVALID, "code": "invalid_json"},
            )
        if not isinstance(payload, dict):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": STATUS_INVALID, "code": "invalid_json"},
            )
        result = ask_intake.submit(
            email=str(payload.get("email") or ""),
            question=str(payload.get("question") or ""),
            consent=payload.get("consent") is True,
        )
        if result.status == STATUS_ACCEPTED:
            return JSONResponse(
                status_code=status.HTTP_202_ACCEPTED, content=result.as_dict()
            )
        if result.status == STATUS_DISABLED:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content=result.as_dict(),
            )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST, content=result.as_dict()
        )

    return app


app = create_app()
