"""Structural recognition of Google API errors without importing the SDK.

Importing ``google.api_core.exceptions`` eagerly would defeat lazy SDK loading
(the unit suite runs with no cloud packages installed), so error classification
is done by class name and status code instead of by exception type.
"""

from __future__ import annotations

_CONFLICT_HTTP_STATUS = 409
_GRPC_ALREADY_EXISTS = 6


def is_already_exists(exc: BaseException) -> bool:
    """True when ``exc`` means "the resource already exists"."""
    if type(exc).__name__ in {"AlreadyExists", "Conflict"}:
        return True
    code = getattr(exc, "code", None)
    if callable(code):
        code = code()
    value = getattr(code, "value", code)
    if isinstance(value, tuple) and value:
        value = value[0]
    return value in {_CONFLICT_HTTP_STATUS, _GRPC_ALREADY_EXISTS}


_UNCERTAIN_SEND_NAMES = frozenset(
    {
        "DeadlineExceeded",
        "ServiceUnavailable",
        "InternalServerError",
        "GatewayTimeout",
        "BadGateway",
        "TooManyRequests",
    }
)

_UNCERTAIN_HTTP_STATUSES = frozenset({408, 429, 500, 502, 503, 504})


def is_uncertain_gmail_send_error(exc: BaseException) -> bool:
    """True when a Gmail send may have succeeded despite the error."""
    if isinstance(exc, TimeoutError | ConnectionError | OSError):
        return True
    if type(exc).__name__ in _UNCERTAIN_SEND_NAMES:
        return True
    status = getattr(exc, "status_code", None)
    if isinstance(status, int) and status in _UNCERTAIN_HTTP_STATUSES:
        return True
    resp = getattr(exc, "resp", None)
    resp_status = getattr(resp, "status", None)
    return isinstance(resp_status, int) and resp_status in _UNCERTAIN_HTTP_STATUSES


__all__ = ["is_already_exists", "is_uncertain_gmail_send_error"]
