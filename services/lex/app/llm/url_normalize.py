"""Normalise and match HTTPS/HTTP URLs against the web-search evidence set."""

from __future__ import annotations

from collections.abc import Collection, Sequence
from urllib.parse import urlparse, urlunparse


def _hostname(url: str) -> str:
    host = urlparse(url.strip()).hostname
    return (host or "").lower().rstrip(".")


def same_site_host(left: str, right: str) -> bool:
    a = left.lower().rstrip(".")
    b = right.lower().rstrip(".")
    if not a or not b:
        return False
    return a == b or a.endswith("." + b) or b.endswith("." + a)


def normalize_source_url(url: str) -> str:
    """Return a canonical http(s) URL string (scheme preserved)."""
    parsed = urlparse(url.strip())
    scheme = (parsed.scheme or "").lower()
    if scheme not in {"http", "https"}:
        return url.strip()
    host = (parsed.hostname or "").lower().rstrip(".")
    port = parsed.port
    if port and not (
        (scheme == "https" and port == 443) or (scheme == "http" and port == 80)
    ):
        netloc = f"{host}:{port}"
    else:
        netloc = host
    path = parsed.path or ""
    if path.endswith("/") and path != "/":
        path = path.rstrip("/")
    return urlunparse((scheme, netloc, path, "", parsed.query, ""))


def normalize_source_url_set(urls: frozenset[str] | set[str]) -> frozenset[str]:
    return frozenset(normalize_source_url(url) for url in urls)


def url_compare_key(url: str) -> str:
    """Scheme-flexible key: host + path + query (http/https equivalent)."""
    parsed = urlparse(normalize_source_url(url))
    host = (parsed.hostname or "").lower().rstrip(".")
    path = parsed.path or ""
    if path.endswith("/") and path != "/":
        path = path.rstrip("/")
    return f"{host}|{path}|{parsed.query}"


def prefer_https_url(candidates: Sequence[str]) -> str:
    """Prefer an https URL when search returned both schemes for the same resource."""
    https = [url for url in candidates if url.lower().startswith("https://")]
    return https[0] if https else candidates[0]


def match_search_url(cited: str, search_urls: Collection[str]) -> str | None:
    """Return the search URL to emit for a cited URL, or None if ungrounded.

    Match order:
    1. Scheme-flexible exact (host + path + query)
    2. Same-site search URL with the closest path (language/path variants)
    On success, prefer https when search returned an https sibling.
    """
    if not cited.strip() or not search_urls:
        return None
    normalised_cited = normalize_source_url(cited)
    scheme = (urlparse(normalised_cited).scheme or "").lower()
    if scheme not in {"http", "https"}:
        return None

    normalised_search = [normalize_source_url(url) for url in search_urls]
    key = url_compare_key(normalised_cited)
    exact = [url for url in normalised_search if url_compare_key(url) == key]
    if exact:
        return prefer_https_url(exact)

    cited_host = _hostname(normalised_cited)
    if not cited_host:
        return None
    same_site = [
        url for url in normalised_search if same_site_host(_hostname(url), cited_host)
    ]
    if not same_site:
        return None

    cited_path = urlparse(normalised_cited).path.rstrip("/") or "/"

    def path_score(url: str) -> tuple[int, int]:
        path = urlparse(url).path.rstrip("/") or "/"
        # Higher shared prefix length is better; shorter residual is better.
        common = 0
        for left, right in zip(cited_path, path, strict=False):
            if left != right:
                break
            common += 1
        return (common, -abs(len(path) - len(cited_path)))

    same_site_sorted = sorted(same_site, key=path_score, reverse=True)
    best_score = path_score(same_site_sorted[0])
    best = [url for url in same_site_sorted if path_score(url) == best_score]
    return prefer_https_url(best)


def is_http_or_https_url(url: str) -> bool:
    scheme = (urlparse(url.strip()).scheme or "").lower()
    return scheme in {"http", "https"} and bool(_hostname(url))


__all__ = [
    "same_site_host",
    "url_compare_key",
    "normalize_source_url",
    "normalize_source_url_set",
    "prefer_https_url",
    "match_search_url",
    "is_http_or_https_url",
]
