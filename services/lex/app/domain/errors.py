"""Domain error types."""

from __future__ import annotations


class LexError(Exception):
    """Base class for Lex domain errors."""


class NotImplementedForPhase(LexError):
    """Raised by Phase 1 stubs for behaviour deferred to a later phase.

    Carries a stable, non-sensitive ``code`` suitable for returning to internal
    callers without leaking configuration, secrets, or stack traces.
    """

    def __init__(self, code: str, message: str | None = None) -> None:
        self.code = code
        super().__init__(message or f"Not implemented in this phase: {code}")


class GmailSendUncertainError(LexError):
    """Gmail send outcome is unknown (timeout, 5xx, or transport failure).

    The caller must inspect the thread for the deterministic outbound
    ``Message-ID`` or ``X-Lex-Request-ID`` before retrying.
    """

    def __init__(self, code: str = "gmail_send_uncertain") -> None:
        self.code = code
        super().__init__("Gmail send outcome is uncertain.")


class MissingDependencyError(LexError):
    """Raised when a backend is selected whose SDK is not installed.

    Google SDKs are imported lazily so unit tests run without cloud
    credentials; selecting ``adapter_backend=gcp`` without them must fail with
    an actionable message rather than an opaque ``ImportError``.
    """

    def __init__(self, module_name: str, install_hint: str) -> None:
        self.module_name = module_name
        self.install_hint = install_hint
        super().__init__(
            f"Required module {module_name!r} is not installed. "
            f"Install it with: {install_hint}"
        )
