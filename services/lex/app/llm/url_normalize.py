"""Normalise and match HTTPS/HTTP URLs against the web-search evidence set."""

from __future__ import annotations

import re
from collections.abc import Collection, Sequence
from urllib.parse import urlparse, urlunparse

_KNOWN_HOST_ALIASES: dict[str, str] = {
    "service-public.gouv.fr": "service-public.fr",
}
_PUBLIC_SECOND_LEVEL_SUFFIXES = frozenset(
    {
        "ac",
        "asso",
        "biz",
        "cie",
        "co",
        "com",
        "edu",
        "gc",
        "gen",
        "go",
        "gob",
        "gov",
        "govt",
        "gouv",
        "gv",
        "ind",
        "info",
        "jus",
        "leg",
        "ltd",
        "me",
        "mil",
        "ne",
        "net",
        "nic",
        "nom",
        "or",
        "org",
        "plc",
        "pro",
        "res",
    }
)
_EMAIL_RE = re.compile(r"\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")


def _hostname(url: str) -> str:
    host = urlparse(url.strip()).hostname
    return (host or "").lower().rstrip(".")


def _strip_www(host: str) -> str:
    h = host.lower().rstrip(".")
    return h[4:] if h.startswith("www.") and len(h) > 4 else h


def _canonical_article_host(host: str) -> str:
    """Normalise host across www and explicit known domain aliases."""
    stripped = _strip_www(host)
    return _KNOWN_HOST_ALIASES.get(stripped, stripped)


def _split_domain_suffix(domain: str) -> tuple[str, str]:
    """Split a lowercase domain into (registrable_head, public_suffix)."""
    labels = [label for label in domain.split(".") if label]
    if len(labels) < 2:
        return domain, ""
    if (
        len(labels) >= 3
        and len(labels[-1]) == 2
        and labels[-2] in _PUBLIC_SECOND_LEVEL_SUFFIXES
    ):
        return ".".join(labels[:-2]), f"{labels[-2]}.{labels[-1]}"
    return ".".join(labels[:-1]), labels[-1]


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


def source_dedup_key(url: str) -> str:
    """Key for deduplicating sources across scheme, www, root '/', and aliases."""
    parsed = urlparse(normalize_source_url(url))
    host = (parsed.hostname or "").lower().rstrip(".")
    path = (parsed.path or "").rstrip("/") or "/"
    canon_host = _canonical_article_host(host)
    return f"{canon_host}|{path}|{parsed.query}"


def prefer_https_url(candidates: Sequence[str]) -> str:
    """Prefer an https URL when search returned both schemes for the same resource."""
    https = [url for url in candidates if url.lower().startswith("https://")]
    return https[0] if https else candidates[0]


def _shared_path_segments(left_path: str, right_path: str) -> int:
    left_segs = [seg for seg in left_path.split("/") if seg]
    right_segs = [seg for seg in right_path.split("/") if seg]
    shared = 0
    for left, right in zip(left_segs, right_segs, strict=False):
        if left != right:
            break
        shared += 1
    return shared


def match_search_url(  # noqa: PLR0911, PLR0912
    cited: str, search_urls: Collection[str]
) -> str | None:
    """Return the search URL to emit for a cited URL, or None if ungrounded.

    Match order:
    1. Scheme-flexible exact (host + path + query)
    2. Same-site search URL with the closest path (language/path variants)
    On success, prefer https when search returned an https sibling.
    """
    if not cited.strip() or not search_urls:
        return None
    normalised_cited = normalize_source_url(cited)
    parsed_cited = urlparse(normalised_cited)
    scheme = (parsed_cited.scheme or "").lower()
    if scheme not in {"http", "https"}:
        return None

    normalised_search = [normalize_source_url(url) for url in search_urls]
    cited_path = parsed_cited.path.rstrip("/") or "/"
    is_bare_homepage = cited_path == "/" and not parsed_cited.query
    key = url_compare_key(normalised_cited)
    exact = [url for url in normalised_search if url_compare_key(url) == key]
    if exact and not is_bare_homepage:
        return prefer_https_url(exact)
    cited_host = _hostname(normalised_cited)
    if not cited_host:
        return None
    same_site = [
        url for url in normalised_search if same_site_host(_hostname(url), cited_host)
    ]
    if not same_site:
        return prefer_https_url(exact) if exact else None
    # When the model cites a bare homepage ("/") but search retrieved deep page(s)
    # on that exact host, upgrade to the retrieved deep page when unambiguous.
    if is_bare_homepage:
        deep_same_host = [
            url
            for url in same_site
            if _hostname(url) == cited_host
            and (
                (urlparse(url).path.rstrip("/") or "/") != "/"
                or bool(urlparse(url).query)
            )
        ]
        if len({url_compare_key(url) for url in deep_same_host}) == 1:
            return prefer_https_url(deep_same_host)
        if exact:
            return prefer_https_url(exact)
        root_same_site = [
            url
            for url in same_site
            if (urlparse(url).path.rstrip("/") or "/") == "/"
            and not urlparse(url).query
        ]
        if root_same_site:
            return prefer_https_url(root_same_site)
        same_site = [url for url in same_site if _hostname(url) == cited_host]
        if not same_site:
            return None

    cited_host_base = _strip_www(cited_host)
    if cited_path != "/":
        filtered = [
            url
            for url in same_site
            if _strip_www(_hostname(url)) == cited_host_base
            or _shared_path_segments(cited_path, urlparse(url).path.rstrip("/") or "/")
            >= 1
        ]
        if not filtered:
            return None
        same_site = filtered

    def path_score(url: str) -> tuple[int, int, int, int]:
        path = urlparse(url).path.rstrip("/") or "/"
        same_host = 1 if _strip_www(_hostname(url)) == cited_host_base else 0
        shared_segs = _shared_path_segments(cited_path, path)
        # Higher shared prefix length is better; shorter residual is better.
        common = 0
        for left, right in zip(cited_path, path, strict=False):
            if left != right:
                break
            common += 1
        return (same_host, shared_segs, common, -abs(len(path) - len(cited_path)))

    same_site_sorted = sorted(same_site, key=path_score, reverse=True)
    best_score = path_score(same_site_sorted[0])
    best = [url for url in same_site_sorted if path_score(url) == best_score]
    return prefer_https_url(best)


def _levenshtein(left: str, right: str) -> int:
    if left == right:
        return 0
    if len(left) < len(right):
        left, right = right, left
    previous = list(range(len(right) + 1))
    for i, char_left in enumerate(left, start=1):
        current = [i]
        for j, char_right in enumerate(right, start=1):
            cost = 0 if char_left == char_right else 1
            current.append(
                min(current[-1] + 1, previous[j] + 1, previous[j - 1] + cost)
            )
        previous = current
    return previous[-1]


def match_typo_email_domain(
    email_domain: str,
    contact_websites: Collection[str],
    *,
    known_urls: Collection[str] = (),
) -> str | None:
    """Return the corrected contact website domain if email_domain is a typo."""
    edom = _strip_www(email_domain.lower())
    if "." not in edom:
        return None
    contact_domains = [
        _strip_www(_hostname(url)) for url in contact_websites if _hostname(url)
    ]
    known_domains = {
        _strip_www(_hostname(url)) for url in known_urls if _hostname(url)
    } | set(contact_domains)
    if edom in known_domains:
        return None
    e_head, e_suffix = _split_domain_suffix(edom)
    if len(e_head) < 5 or not e_suffix:
        return None
    for cdom in contact_domains:
        if "." not in cdom:
            continue
        c_head, c_suffix = _split_domain_suffix(cdom)
        if e_suffix != c_suffix or len(c_head) < 5:
            continue
        max_dist = 2 if min(len(e_head), len(c_head)) >= 12 else 1
        if 1 <= _levenshtein(e_head, c_head) <= max_dist:
            return cdom
    return None


def repair_email_domain_typos(
    text: str,
    contact_websites: Collection[str],
    *,
    known_urls: Collection[str] = (),
) -> str:
    """Replace 1-2 character email domain typos against verified contact websites."""
    if "@" not in text or not contact_websites:
        return text

    def _replace(match: re.Match[str]) -> str:
        local, domain = match.group(1), match.group(2)
        corrected = match_typo_email_domain(
            domain, contact_websites, known_urls=known_urls
        )
        return f"{local}@{corrected}" if corrected is not None else match.group(0)

    return _EMAIL_RE.sub(_replace, text)


def find_email_domain_typo(
    text: str,
    contact_websites: Collection[str],
    *,
    known_urls: Collection[str] = (),
) -> str | None:
    """Return the first email address in text whose domain is a contact website typo."""
    if "@" not in text or not contact_websites:
        return None
    for match in _EMAIL_RE.finditer(text):
        domain = match.group(2)
        if (
            match_typo_email_domain(domain, contact_websites, known_urls=known_urls)
            is not None
        ):
            return match.group(0)
    return None


def is_http_or_https_url(url: str) -> bool:
    scheme = (urlparse(url.strip()).scheme or "").lower()
    return scheme in {"http", "https"} and bool(_hostname(url))


__all__ = [
    "same_site_host",
    "url_compare_key",
    "source_dedup_key",
    "normalize_source_url",
    "normalize_source_url_set",
    "prefer_https_url",
    "match_search_url",
    "match_typo_email_domain",
    "repair_email_domain_typos",
    "find_email_domain_typo",
    "is_http_or_https_url",
]
