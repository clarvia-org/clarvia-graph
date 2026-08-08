"""Application-level validation of a structured Lex response (blueprint 18).

These checks run before composition. Rules that require the raw OpenAI
web-search source set are enforced when that evidence is supplied; the
deterministic, content-only rules always run.
"""

from __future__ import annotations

import re
from collections.abc import Collection

from app.llm.schema import LexResponse
from app.llm.url_normalize import normalize_source_url, normalize_source_url_set

_SIGN_OFF_RE = re.compile(r"(?:^|\n)Lex\.\s*$")
_CITATION_RE = re.compile(r"\[(\d+)\]")
_CODE_FENCE_RE = re.compile(r"```|~~~")
_HTML_TAG_RE = re.compile(
    r"</?\s*(?:script|style|div|span|table|thead|tbody|tr|td|th|img|iframe|"
    r"object|embed|link|meta|form|input|button|svg|p|br|hr|a|h[1-6]|ul|ol|li|"
    r"strong|em|b|i|u|blockquote|pre|code)\b",
    re.IGNORECASE,
)

_CONTINUATION_MARKERS = (
    "reply to this email for",
    "send a fresh email to",
    "we're happy to help with anything else",
)
_FOOTER_MARKERS = (
    "clarvia is a nonprofit",
    "lex is clarvia's ai-powered information service",
    "we're also looking for volunteers",
    "long conversation threads can become difficult",
)
_DONATION_MARKERS = (
    "making a donation",
    "consider a donation",
    "keep this service free",
    "please donate",
)
_DISCLAIMER_MARKERS = (
    "clarvia does not provide",
    "this is not legal advice",
    "not a substitute for professional",
    "lex may produce incomplete or incorrect",
    "for informational purposes only",
)

_PROVIDER_NEUTRALITY_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\brecommended\b",
        r"\brecommend(?:ing|s|ed)?\b",
        r"\bwe recommend\b",
        r"\bendorsed\b",
        r"\bendorse(?:ment|s|ing)?\b",
        r"\bbest (?:option|choice|provider|funeral|service)\b",
        r"\bhighly rated\b",
        r"\btop[- ]rated\b",
        r"\bour preferred\b",
        r"\bpreferred provider\b",
    )
)

_PROVIDER_NEGATION_SCRUB_RE = re.compile(
    r"\b(?:does|do|did)\s+not\s+"
    r"(?:endorse|recommend|rank)(?:s|ed|ing|ment)?"
    r"(?:\s*,\s*(?:endorse|recommend|rank)(?:s|ed|ing|ment)?)*"
    r"(?:\s*,?\s*or\s+(?:endorse|recommend|rank)(?:s|ed|ing|ment)?)?"
    r"|\bnot\s+(?:endorse|recommend|rank)(?:s|ed|ing|ment)?"
    r"|\bno\s+(?:endorsement|recommendation)\b"
    # Orientation language: recommend contacting/consulting a professional is allowed.
    r"|\brecommend(?:ing|s|ed)?\s+"
    r"(?:contacting|consulting|speaking(?:\s+with)?|seeing|seeking|asking|discussing)"
    r"|\bit is recommended (?:that you |to )?"
    r"(?:contact|consult|speak|see|seek|ask|discuss)",
    re.IGNORECASE,
)


class LexValidationError(ValueError):
    """Raised when a structured response fails an application validation rule."""

    def __init__(self, code: str, message: str | None = None) -> None:
        self.code = code
        super().__init__(message or code)


def _require(condition: bool, code: str, message: str) -> None:
    if not condition:
        raise LexValidationError(code, message)


def _contains_any(haystack: str, needles: Collection[str]) -> bool:
    folded = haystack.casefold()
    return any(needle in folded for needle in needles)


def _validate_body_text(body: str) -> None:
    stripped = body.strip()
    _require(bool(stripped), "empty_body", "body_markdown is empty.")
    _require(
        _SIGN_OFF_RE.search(stripped) is not None,
        "missing_sign_off",
        "body_markdown must end with 'Lex.' on its own line.",
    )
    _require("\u2014" not in body, "em_dash", "body_markdown contains an em dash.")
    _require(
        _CODE_FENCE_RE.search(body) is None,
        "code_fence",
        "body_markdown contains a code fence.",
    )
    _require(
        _HTML_TAG_RE.search(body) is None,
        "raw_html",
        "body_markdown contains raw HTML.",
    )
    _require(
        not _contains_any(body, _CONTINUATION_MARKERS),
        "continuation_in_body",
        "body_markdown contains continuation text.",
    )
    _require(
        not _contains_any(body, _FOOTER_MARKERS),
        "footer_in_body",
        "body_markdown contains footer content.",
    )
    _require(
        not _contains_any(body, _DONATION_MARKERS),
        "donation_in_body",
        "body_markdown contains a donation appeal.",
    )
    _require(
        not _contains_any(body, _DISCLAIMER_MARKERS),
        "disclaimer_in_body",
        "body_markdown contains a disclaimer.",
    )


def _validate_ids_contiguous(ids: list[int], code: str, label: str) -> None:
    expected = list(range(1, len(ids) + 1))
    _require(
        sorted(ids) == expected,
        code,
        f"{label} IDs must be contiguous starting at 1.",
    )


def _validate_citations(response: LexResponse) -> None:
    body = response.body_markdown
    source_ids = {source.id for source in response.sources}
    marker_ids = {int(match) for match in _CITATION_RE.findall(body)}

    for marker in marker_ids:
        _require(
            marker in source_ids,
            "citation_without_source",
            "A citation marker has no matching source.",
        )

    cited_by_contact = {contact.source_id for contact in response.contacts}
    for source in response.sources:
        _require(
            source.id in marker_ids or source.id in cited_by_contact,
            "uncited_source",
            "A source is neither cited in the body nor used by a contact.",
        )


def _validate_contacts(response: LexResponse) -> None:
    source_ids = {source.id for source in response.sources}
    body_folded = response.body_markdown.casefold()
    for contact in response.contacts:
        _require(
            contact.source_id in source_ids,
            "contact_without_source",
            "A contact references a non-existent source ID.",
        )
        _require(
            contact.name.casefold() in body_folded,
            "contact_not_in_body",
            "A named contact does not appear in body_markdown.",
        )


def _validate_provider_neutrality(body: str) -> None:
    # Prompt-approved wording uses "does not endorse/recommend"; scrub negations first.
    scrubbed = _PROVIDER_NEGATION_SCRUB_RE.sub(" ", body)
    for pattern in _PROVIDER_NEUTRALITY_PATTERNS:
        if pattern.search(scrubbed):
            raise LexValidationError(
                "provider_not_neutral",
                "body_markdown contains non-neutral provider language.",
            )


def _validate_search_evidence(
    response: LexResponse,
    *,
    web_search_source_urls: Collection[str],
    web_search_calls: int,
) -> None:
    if response.action != "answer":
        return

    _require(
        web_search_calls >= 1,
        "answer_without_search",
        "An answer requires a completed web_search_call.",
    )

    normalised = normalize_source_url_set(frozenset(web_search_source_urls))
    for source in response.sources:
        _require(
            normalize_source_url(source.url) in normalised,
            "unsupported_source_url",
            "A source URL was not returned by web search.",
        )
    for contact in response.contacts:
        _require(
            normalize_source_url(contact.website) in normalised,
            "unsupported_contact_website",
            "A contact website was not returned by web search.",
        )


def _validate_action_rules(response: LexResponse) -> None:
    if response.action == "answer":
        _require(
            response.research_status == "adequate",
            "answer_research_not_adequate",
            "An answer requires research_status 'adequate'.",
        )
        _require(
            len(response.sources) >= 1,
            "answer_without_source",
            "An answer requires at least one source.",
        )
    elif response.action == "decline":
        _require(
            response.research_status == "not_needed",
            "decline_research_not_needed",
            "A decline requires research_status 'not_needed'.",
        )
        _require(
            not response.sources,
            "decline_with_sources",
            "A decline must have no sources.",
        )
        _require(
            not response.contacts,
            "decline_with_contacts",
            "A decline must have no contacts.",
        )
    elif response.action == "clarify":
        _require(
            response.research_status == "not_needed",
            "clarify_research_not_needed",
            "A clarification requires research_status 'not_needed'.",
        )


def validate_lex_response(
    response: LexResponse,
    *,
    web_search_source_urls: Collection[str] | None = None,
    web_search_calls: int | None = None,
) -> None:
    """Validate a parsed response, raising :class:`LexValidationError`.

    When ``web_search_source_urls`` and ``web_search_calls`` are supplied,
    answer responses must show evidence of a completed web search and every
    source or contact website must appear in that set.
    """
    _validate_body_text(response.body_markdown)
    _validate_ids_contiguous(
        [source.id for source in response.sources],
        "non_contiguous_source_ids",
        "source",
    )
    _validate_ids_contiguous(
        [contact.id for contact in response.contacts],
        "non_contiguous_contact_ids",
        "contact",
    )
    _validate_action_rules(response)
    _validate_citations(response)
    _validate_contacts(response)
    _validate_provider_neutrality(response.body_markdown)

    if web_search_source_urls is not None and web_search_calls is not None:
        _validate_search_evidence(
            response,
            web_search_source_urls=web_search_source_urls,
            web_search_calls=web_search_calls,
        )


__all__ = ["LexValidationError", "validate_lex_response"]
