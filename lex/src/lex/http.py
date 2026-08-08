from __future__ import annotations

import json
import time
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

import httpx

from lex import __version__
from lex.errors import ErrorCode, LexError

USER_AGENT = f"clarvia-lex/{__version__} (+https://github.com/clarvia-org/lex)"
CONNECT_TIMEOUT = 10.0
READ_TIMEOUT = 60.0
MAX_ATTEMPTS = 5
RETRY_DELAYS = (1.0, 2.0, 4.0, 8.0)
MAX_RESPONSE_BYTES = 50 * 1024 * 1024
RETRYABLE_STATUS = {408, 429, 500, 502, 503, 504}


@dataclass(frozen=True)
class HttpResponse:
    content: bytes
    status_code: int
    url: str
    media_type: str
    headers: Mapping[str, str]


class HttpClient:
    """Shared HTTP client for adapters and the update runner."""

    def __init__(self, *, max_response_bytes: int = MAX_RESPONSE_BYTES) -> None:
        self._max_response_bytes = max_response_bytes
        self._client = httpx.Client(
            headers={"User-Agent": USER_AGENT},
            follow_redirects=True,
            timeout=httpx.Timeout(READ_TIMEOUT, connect=CONNECT_TIMEOUT),
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> HttpClient:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def get(
        self,
        url: str,
        *,
        params: Mapping[str, str] | None = None,
        headers: Mapping[str, str] | None = None,
    ) -> HttpResponse:
        last_error: Exception | None = None
        for attempt in range(MAX_ATTEMPTS):
            try:
                with self._client.stream("GET", url, params=params, headers=headers) as response:
                    if response.status_code in RETRYABLE_STATUS:
                        retry_after = response.headers.get("Retry-After")
                        response.read()
                        if attempt < MAX_ATTEMPTS - 1:
                            self._sleep(attempt, retry_after)
                            continue
                        raise LexError(
                            ErrorCode.LEX_NETWORK_ERROR,
                            url,
                            f"HTTP {response.status_code}",
                        )

                    if response.status_code >= 400:
                        response.read()
                        raise LexError(
                            ErrorCode.LEX_NETWORK_ERROR,
                            url,
                            f"HTTP {response.status_code}",
                        )

                    chunks: list[bytes] = []
                    total = 0
                    for chunk in response.iter_bytes():
                        total += len(chunk)
                        if total > self._max_response_bytes:
                            raise LexError(
                                ErrorCode.LEX_NETWORK_ERROR,
                                url,
                                f"Response exceeds {self._max_response_bytes} bytes",
                            )
                        chunks.append(chunk)

                    content = b"".join(chunks)
                    media_type = response.headers.get("content-type", "").split(";")[0].strip()
                    return HttpResponse(
                        content=content,
                        status_code=response.status_code,
                        url=str(response.url),
                        media_type=media_type,
                        headers={k: v for k, v in response.headers.items()},
                    )
            except LexError:
                raise
            except (httpx.TimeoutException, httpx.TransportError, httpx.HTTPError) as exc:
                last_error = exc
                if attempt < MAX_ATTEMPTS - 1:
                    self._sleep(attempt, None)
                    continue
                raise LexError(
                    ErrorCode.LEX_NETWORK_ERROR,
                    url,
                    str(exc),
                ) from exc

        raise LexError(
            ErrorCode.LEX_NETWORK_ERROR,
            url,
            str(last_error) if last_error else "request failed",
        )

    def get_json(
        self,
        url: str,
        *,
        params: Mapping[str, str] | None = None,
    ) -> Any:
        response = self.get(url, params=params)
        try:
            return json.loads(response.content.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise LexError(
                ErrorCode.LEX_NETWORK_ERROR,
                url,
                f"Invalid JSON response: {exc}",
            ) from exc

    @staticmethod
    def _sleep(attempt: int, retry_after: str | None) -> None:
        if retry_after:
            try:
                delay = float(retry_after)
            except ValueError:
                delay = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
        else:
            delay = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
        time.sleep(delay)
