"""Drop gone source URLs (404/410/DNS/refused) before a letter is mailed.

Search grounding only proves a URL appeared in this-turn results. It does not
prove the page still exists. This check is conservative: 403, 429, 5xx, and
timeouts are kept so official sites that block bots still reach the user.
Checker errors fail open (keep the URL). Never log URLs.
"""

from __future__ import annotations

import errno
import logging
import re
import socket
import urllib.error
import urllib.request
from collections.abc import Callable, Sequence
from concurrent.futures import ThreadPoolExecutor, wait
from typing import Final

from app.llm.schema import LexContact, LexSource
from app.llm.url_normalize import is_http_or_https_url

_LOG = logging.getLogger(__name__)
_CITATION_RE = re.compile(r"\[(\d+)\]")
_USER_AGENT = "Clarvia-Lex/1.0"
_DEAD_STATUS: Final[frozenset[int]] = frozenset({404, 410})
_RETRY_GET_STATUS: Final[frozenset[int]] = frozenset({405, 501})
PER_URL_TIMEOUT: Final[float] = 2.5
OVERALL_TIMEOUT: Final[float] = 4.0
MAX_WORKERS: Final[int] = 6


class _LimitedRedirect(urllib.request.HTTPRedirectHandler):
    max_redirections = 1


def keep_after_status(status: int) -> bool:
    """True when the URL should stay in the letter."""
    return status not in _DEAD_STATUS


def keep_after_error(exc: BaseException) -> bool:
    """True when a transport error is not proof that the page is gone."""
    if isinstance(exc, TimeoutError):
        return True
    if isinstance(exc, socket.gaierror):
        return False
    if isinstance(exc, ConnectionRefusedError):
        return False
    if isinstance(exc, urllib.error.URLError):
        if isinstance(exc.reason, BaseException):
            return keep_after_error(exc.reason)
        return True
    return not (isinstance(exc, OSError) and exc.errno == errno.ECONNREFUSED)


def _http_status(url: str, *, method: str, timeout: float) -> int:
    opener = urllib.request.build_opener(_LimitedRedirect)
    request = urllib.request.Request(
        url,
        method=method,
        headers={"User-Agent": _USER_AGENT, "Accept": "*/*"},
    )
    try:
        with opener.open(request, timeout=timeout) as response:
            return int(response.status)
    except urllib.error.HTTPError as exc:
        return int(exc.code)


def probe_url(url: str, *, timeout: float = PER_URL_TIMEOUT) -> bool:
    """True = keep (live or uncertain). False = drop (gone)."""
    if not is_http_or_https_url(url):
        return False
    try:
        status = _http_status(url, method="HEAD", timeout=timeout)
        if status in _RETRY_GET_STATUS:
            status = _http_status(url, method="GET", timeout=timeout)
    except Exception as exc:  # noqa: BLE001 — fail open unless proven gone
        return keep_after_error(exc)
    return keep_after_status(status)


def find_dead_urls(
    urls: Sequence[str],
    *,
    probe: Callable[[str], bool] | None = None,
) -> frozenset[str]:
    """Return URLs the probe classified as gone. Unfinished probes are kept."""
    check = probe or probe_url
    unique = list(dict.fromkeys(url.strip() for url in urls if url.strip()))
    if not unique:
        return frozenset()

    dead: set[str] = set()
    workers = min(MAX_WORKERS, len(unique))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        future_map = {pool.submit(check, url): url for url in unique}
        done, pending = wait(future_map, timeout=OVERALL_TIMEOUT)
        for future in pending:
            future.cancel()
        for future in done:
            url = future_map[future]
            try:
                if not future.result():
                    dead.add(url)
            except Exception:  # noqa: BLE001 — fail open
                continue
    return frozenset(dead)


def strip_dead_urls(
    body: str,
    sources: list[LexSource],
    contacts: list[LexContact],
    *,
    probe: Callable[[str], bool] | None = None,
) -> tuple[str, list[LexSource], list[LexContact]]:
    """Drop gone sources/contacts and rewrite citation markers."""
    candidates = [source.url for source in sources] + [
        contact.website for contact in contacts
    ]
    dead = find_dead_urls(candidates, probe=probe)
    if not dead:
        return body, sources, contacts

    kept_sources: list[LexSource] = []
    old_to_new: dict[int, int] = {}
    for source in sources:
        if source.url in dead:
            continue
        new_id = len(kept_sources) + 1
        old_to_new[source.id] = new_id
        kept_sources.append(source.model_copy(update={"id": new_id}))

    def _rewrite_marker(match: re.Match[str]) -> str:
        new_id = old_to_new.get(int(match.group(1)))
        return f"[{new_id}]" if new_id is not None else ""

    body = _CITATION_RE.sub(_rewrite_marker, body)
    body = re.sub(r"[ \t]+\n", "\n", body)
    body = re.sub(r" {2,}", " ", body)

    source_by_new = {source.id: source for source in kept_sources}
    kept_contacts: list[LexContact] = []
    for contact in contacts:
        new_source_id = old_to_new.get(contact.source_id)
        if new_source_id is None:
            continue
        website = contact.website
        if website in dead:
            continue
        kept_contacts.append(
            contact.model_copy(
                update={
                    "id": len(kept_contacts) + 1,
                    "source_id": new_source_id,
                    "website": website or source_by_new[new_source_id].url,
                }
            )
        )

    cited_markers = {int(match) for match in _CITATION_RE.findall(body)}
    used_by_contact = {contact.source_id for contact in kept_contacts}
    for source in kept_sources:
        if source.id in cited_markers or source.id in used_by_contact:
            continue
        insert = f" [{source.id}]"
        stripped = body.rstrip()
        if stripped.endswith("Lex."):
            body = stripped[:-4].rstrip() + insert + "\n\nLex."
        else:
            body = stripped + insert + "\n\nLex."
        cited_markers.add(source.id)

    dropped_sources = len(sources) - len(kept_sources)
    dropped_contacts = len(contacts) - len(kept_contacts)
    if dropped_sources or dropped_contacts:
        _LOG.info(
            "lex_dead_urls_stripped sources=%s contacts=%s",
            dropped_sources,
            dropped_contacts,
        )
    return body, kept_sources, kept_contacts


__all__ = [
    "keep_after_status",
    "keep_after_error",
    "probe_url",
    "find_dead_urls",
    "strip_dead_urls",
]
