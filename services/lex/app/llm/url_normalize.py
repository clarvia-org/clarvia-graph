"""Normalise HTTPS URLs for web-search source-set comparison."""

from __future__ import annotations

from urllib.parse import urlparse, urlunparse


def normalize_source_url(url: str) -> str:
    """Return a canonical form for membership checks against search sources."""
    parsed = urlparse(url.strip())
    scheme = parsed.scheme.lower()
    if scheme == "http":
        scheme = "https"
    host = (parsed.hostname or "").lower()
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


__all__ = ["normalize_source_url", "normalize_source_url_set"]
