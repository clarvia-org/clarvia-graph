"""Validate ``lex_research_brief_v1`` before the writer call."""

from __future__ import annotations

import logging
import re
from collections.abc import Collection
from urllib.parse import urlparse

from app.llm.research_schema import LexResearchBrief
from app.llm.scenario_validation import (
    exceptional_scenario_hits,
    validate_no_unsupported_scenarios,
)
from app.llm.url_normalize import (
    is_http_or_https_url,
    match_search_url,
    same_site_host,
)

_LOG = logging.getLogger(__name__)

_DEFERRED_TOPIC_RE = re.compile(
    r"(?i)\b("
    r"pension|bank|utility|utilities|subscription|subscriptions|"
    r"estate administration|inheritance declaration|inheritance tax|"
    r"long[- ]term tax|probate estate"
    r")\b"
)

_MISSING_FIELD_JURISDICTION_ROLE: dict[str, str] = {
    "death_country": "death_location",
    "residence_country": "habitual_residence",
    "care_country": "care_location",
    "asset_country": "asset_location",
}

_FACT_STOPWORDS: frozenset[str] = frozenset(
    {
        "lives",
        "lived",
        "about",
        "after",
        "before",
        "should",
        "their",
        "there",
        "family",
        "expected",
        "remaining",
        "only",
        "based",
        "death",
        "dying",
        "deceased",
        "person",
        "country",
        "inferred",
        "yesterday",
        "current",
        "father",
        "mother",
        "parent",
        "spouse",
        "partner",
        "brother",
        "sister",
        "child",
        "wrote",
        "stated",
        "mentioned",
        "requesting",
        "question",
        "asking",
        "information",
        "administrative",
        "registration",
        "bereavement",
        "funeral",
        "burial",
        "cremation",
        "january",
        "february",
        "march",
        "april",
        "august",
        "september",
        "october",
        "november",
        "december",
        "relative",
        "described",
        "approximately",
        "occurred",
        "indicates",
        "implies",
        "suggests",
        "setting",
        "circumstances",
        "identity",
        "domicile",
        "established",
        "provided",
        "specified",
        "disclosed",
        "emotional",
        "support",
        "struggling",
        "wants",
        "received",
        "receiving",
        "terminal",
        "users",
        "user",
    }
)

# For non-English threads, English paraphrases are common. Unmatched tokens are
# allowed only when they are ordinary bereavement English; material place claims
# or other leftovers still fail.
_MATERIAL_CLAIM_TOKENS: frozenset[str] = frozenset(
    {
        "paris",
        "france",
        "french",
        "berlin",
        "germany",
        "german",
        "london",
        "england",
        "britain",
        "madrid",
        "spain",
        "spanish",
        "lisbon",
        "portugal",
        "portuguese",
        "rome",
        "italy",
        "italian",
        "amsterdam",
        "netherlands",
        "dutch",
        "zurich",
        "switzerland",
        "vienna",
        "austria",
        "warsaw",
        "poland",
        "stockholm",
        "sweden",
        "brussels",
        "belgium",
        "belgian",
        "chile",
        "chilean",
        "vineyard",
    }
)
_SAFE_NON_ENGLISH_PARAPHRASE: frozenset[str] = _FACT_STOPWORDS | frozenset(
    {
        "commune",
        "certificate",
        "medical",
        "hospice",
        "omega",
        "doctor",
        "identity",
        "documents",
        "declare",
        "declaration",
        "registrar",
        "notary",
        "pension",
        "provider",
    }
)


class ResearchValidationError(ValueError):
    def __init__(self, code: str, message: str | None = None) -> None:
        self.code = code
        self.safe_retry_instruction = _research_retry_instruction(code)
        super().__init__(message or code)


def _research_retry_instruction(code: str) -> str:
    mapping = {
        "answer_without_search": (
            "The previous research brief answered without evidence of web search. "
            "Retry with web search and cite only returned sources."
        ),
        "unsupported_source_url": (
            "The previous research brief cited a source URL that was not returned by "
            "web search. Use only URLs from the search results."
        ),
        "unsupported_contact_website": (
            "The previous research brief used a contact website that is not related "
            "to its cited source or web-search results. Use a same-site organisation "
            "URL from the search evidence."
        ),
        "unsupported_phone_or_email": (
            "The previous research brief included a phone number or email that is not "
            "supported by its cited source. Remove unsupported contact details."
        ),
        "user_fact_not_grounded": (
            "The previous research brief included material user_facts that are not "
            "present in the cleaned conversation. Keep only facts stated by the user; "
            "do not invent places, accidents, or other material claims."
        ),
        "deferred_topic_in_immediate_actions": (
            "The previous research brief put later administrative topics into "
            "immediate_actions. Move pensions, banks, utilities, and estate topics "
            "to later_topics unless the user asked about them or an urgent deadline "
            "applies."
        ),
        "unsupported_exceptional_scenario": (
            "The previous research brief introduced police, emergency services, or "
            "another exceptional scenario unsupported by the conversation or "
            "user_facts. Remove it unless the user already described that situation."
        ),
        "missing_field_already_known": (
            "The previous research brief listed a missing_field that is already known "
            "from the conversation. Remove known facts from missing_fields."
        ),
        "immediate_action_count": (
            "Imminent or recent-death answers need between three and five immediate "
            "actions."
        ),
    }
    return mapping.get(
        code,
        "The previous research brief failed validation. Correct the brief using only "
        "facts from the cleaned conversation and verified web-search sources.",
    )


def _require(condition: bool, code: str, message: str) -> None:
    if not condition:
        raise ResearchValidationError(code, message)


def _hostname(url: str) -> str:
    host = urlparse(url).hostname
    return (host or "").lower().rstrip(".")


def _resolve_contact_website(
    website: str,
    *,
    source_url: str | None,
    search_urls: Collection[str] | None,
) -> str | None:
    """Return a search-grounded http(s) website to emit, or None."""
    if not is_http_or_https_url(website):
        return None
    web_host = _hostname(website)
    if not web_host:
        return None

    candidates: list[str] = []
    if search_urls:
        matched = match_search_url(website, search_urls)
        if matched:
            return matched
        candidates.extend(
            url for url in search_urls if same_site_host(_hostname(url), web_host)
        )
    if source_url and same_site_host(_hostname(source_url), web_host):
        if search_urls:
            source_match = match_search_url(source_url, search_urls)
            if source_match:
                candidates.append(source_match)
        candidates.append(source_url)
    if not candidates:
        return None
    # Prefer https search URLs when available.
    https = [url for url in candidates if url.lower().startswith("https://")]
    return https[0] if https else candidates[0]


def _canonicalise_brief_urls(
    brief: LexResearchBrief,
    *,
    web_search_source_urls: Collection[str] | None,
) -> None:
    """Rewrite source/contact URLs to matched search URLs when evidence exists."""
    if web_search_source_urls is None:
        return
    search_list = list(web_search_source_urls)
    new_sources = []
    for source in brief.sources:
        matched = match_search_url(source.url, search_list)
        if matched is None:
            raise ResearchValidationError(
                "unsupported_source_url",
                "Source URL was not returned by web search.",
            )
        new_sources.append(source.model_copy(update={"url": matched}))
    brief.sources = new_sources

    sources_by_id = {source.id: source for source in brief.sources}
    new_contacts = []
    for contact in brief.contacts:
        source = sources_by_id.get(contact.source_id)
        source_url = source.url if source is not None else None
        resolved = _resolve_contact_website(
            contact.website,
            source_url=source_url,
            search_urls=search_list,
        )
        if resolved is None:
            raise ResearchValidationError(
                "unsupported_contact_website",
                "Contact website is not related to its cited source.",
            )
        new_contacts.append(contact.model_copy(update={"website": resolved}))
    brief.contacts = new_contacts


def _renumber_brief_ids(brief: LexResearchBrief) -> None:
    """Deterministically renumber source/contact/action IDs to 1..n / A1..An."""
    source_map: dict[int, int] = {}
    new_sources = []
    for index, source in enumerate(brief.sources, start=1):
        source_map[source.id] = index
        new_sources.append(source.model_copy(update={"id": index}))
    if source_map and list(source_map.values()) != list(source_map.keys()):
        _LOG.info("Renumbered research source IDs: %s", source_map)
    brief.sources = new_sources

    contact_map: dict[int, int] = {}
    new_contacts = []
    for index, contact in enumerate(brief.contacts, start=1):
        new_source_id = source_map.get(contact.source_id)
        if new_source_id is None and brief.sources:
            raise ResearchValidationError(
                "contact_without_source",
                "Contact references a missing source.",
            )
        contact_map[contact.id] = index
        update: dict[str, object] = {"id": index}
        if new_source_id is not None:
            update["source_id"] = new_source_id
        new_contacts.append(contact.model_copy(update=update))
    if contact_map and list(contact_map.values()) != list(contact_map.keys()):
        _LOG.info("Renumbered research contact IDs: %s", contact_map)
    brief.contacts = new_contacts

    new_actions = []
    for index, action in enumerate(brief.immediate_actions, start=1):
        new_source_ids = [
            source_map[source_id]
            for source_id in action.source_ids
            if source_id in source_map
        ]
        new_contact_ids = [
            contact_map[contact_id]
            for contact_id in action.contact_ids
            if contact_id in contact_map
        ]
        new_actions.append(
            action.model_copy(
                update={
                    "id": f"A{index}",
                    "source_ids": new_source_ids,
                    "contact_ids": new_contact_ids,
                }
            )
        )
    brief.immediate_actions = new_actions


def _fact_tokens(fact: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-z0-9]{5,}", fact.casefold())
        if token not in _FACT_STOPWORDS
    ]


def fact_is_material(fact: str) -> bool:
    """True when an ungegrounded fact must not be silently dropped.

    Material means place/jurisdiction claims (``_MATERIAL_CLAIM_TOKENS``) or
    exceptional-scenario invention claims (accident/police/…). This is not a
    content-safety refusal layer.
    """
    tokens = set(_fact_tokens(fact))
    if tokens & _MATERIAL_CLAIM_TOKENS:
        return True
    return bool(exceptional_scenario_hits(fact))


def _fact_grounded(fact: str, conversation_text: str) -> bool:
    folded = conversation_text.casefold()
    fact_lower = fact.casefold()

    # Facts describing absence of information are meta-observations, always valid.
    if re.search(
        r"(?:not |no |have not been |has not been )"
        r"(?:stated|mentioned|established|provided|specified|given|known|disclosed)",
        fact_lower,
    ):
        return True

    tokens = _fact_tokens(fact)
    if not tokens:
        return True
    if any(token in folded for token in tokens):
        return True

    non_english = bool(re.search(r"[^\x00-\x7F]", conversation_text))
    if non_english:
        unmatched = [token for token in tokens if token not in folded]
        if not unmatched:
            return True
        if any(token in _MATERIAL_CLAIM_TOKENS for token in unmatched):
            return False
        return all(token in _SAFE_NON_ENGLISH_PARAPHRASE for token in unmatched)

    return False


def _repair_user_facts(brief: LexResearchBrief, conversation_text: str) -> None:
    """Drop ungegrounded non-material facts; raise on ungegrounded material facts."""
    if len(conversation_text.strip()) < 30:
        return
    kept: list[str] = []
    dropped_non_material: list[str] = []
    for fact in brief.user_facts:
        if _fact_grounded(fact, conversation_text):
            kept.append(fact)
            continue
        if fact_is_material(fact):
            raise ResearchValidationError("user_fact_not_grounded")
        dropped_non_material.append(fact)
    if dropped_non_material:
        _LOG.info(
            "Dropped %s ungegrounded non-material user_facts: %s",
            len(dropped_non_material),
            dropped_non_material,
        )
    brief.user_facts = kept


def validate_research_brief(
    brief: LexResearchBrief,
    *,
    web_search_source_urls: Collection[str] | None = None,
    web_search_calls: int | None = None,
    conversation_text: str = "",
) -> None:
    """Raise :class:`ResearchValidationError` when the brief is unsafe or incomplete."""
    _renumber_brief_ids(brief)

    source_ids = [source.id for source in brief.sources]
    contact_ids = [contact.id for contact in brief.contacts]
    action_ids = [action.id for action in brief.immediate_actions]

    if action_ids:
        expected_actions = [f"A{index}" for index in range(1, len(action_ids) + 1)]
        _require(
            action_ids == expected_actions,
            "non_contiguous_action_ids",
            "Action IDs must be A1..An in order.",
        )

    source_id_set = set(source_ids)
    contact_id_set = set(contact_ids)
    for contact in brief.contacts:
        _require(
            contact.source_id in source_id_set,
            "contact_without_source",
            "Contact references a missing source.",
        )
    for action in brief.immediate_actions:
        for source_id in action.source_ids:
            _require(
                source_id in source_id_set,
                "action_without_source",
                "Action references a missing source.",
            )
        for contact_id in action.contact_ids:
            _require(
                contact_id in contact_id_set,
                "action_without_contact",
                "Action references a missing contact.",
            )

    # Repair facts before exceptional gating so drops cannot erase conversation truth.
    _repair_user_facts(brief, conversation_text)

    action_blob = "\n".join(
        f"{item.action}\n{item.explanation}" for item in brief.immediate_actions
    )
    scenario_code = validate_no_unsupported_scenarios(
        text=action_blob,
        safety_status=brief.safety_status,
        user_facts=brief.user_facts,
        conversation_text=conversation_text,
    )
    if scenario_code:
        raise ResearchValidationError(scenario_code)

    # Completed actions should not reappear as unfinished work.
    completed_folded = {item.casefold() for item in brief.completed_actions}
    for action in brief.immediate_actions:
        if action.action.casefold() in completed_folded:
            raise ResearchValidationError("completed_action_repeated")

    for field in brief.missing_fields:
        role = _MISSING_FIELD_JURISDICTION_ROLE.get(field)
        if role and any(
            jurisdiction.role == role and jurisdiction.country_code != "ZZ"
            for jurisdiction in brief.jurisdictions
        ):
            raise ResearchValidationError("missing_field_already_known")

    if brief.action == "answer":
        _require(
            brief.research_status == "adequate",
            "answer_research_not_adequate",
            "Answer requires adequate research.",
        )
        _require(bool(brief.sources), "answer_without_source", "Answer needs sources.")
        _require(
            bool(brief.immediate_actions),
            "answer_without_action",
            "Answer needs immediate actions.",
        )
        if web_search_calls is not None:
            _require(
                web_search_calls >= 1,
                "answer_without_search",
                "Answer requires web search.",
            )
        if brief.situation_stage in {"imminent_death", "recent_death"}:
            count = len(brief.immediate_actions)
            _require(
                3 <= count <= 5,
                "immediate_action_count",
                "Imminent/recent death answers need 3-5 immediate actions.",
            )
            question = (brief.current_question or "").casefold()
            for action in brief.immediate_actions:
                if _DEFERRED_TOPIC_RE.search(question):
                    break
                # Only fail if the deferred topic is the *primary subject*
                # of the action, not a passing mention.
                if _DEFERRED_TOPIC_RE.search(action.action):
                    raise ResearchValidationError("deferred_topic_in_immediate_actions")

        if brief.situation_stage == "focused_follow_up":
            question = (brief.current_question or "").casefold()
            if question:
                grounded = any(
                    any(
                        token in f"{action.action} {action.explanation}".casefold()
                        for token in re.findall(r"[a-z0-9]{5,}", question)[:8]
                    )
                    for action in brief.immediate_actions
                )
                _require(
                    grounded or not brief.immediate_actions,
                    "focused_follow_up_irrelevant",
                    "Focused follow-up actions must address current_question.",
                )

        _canonicalise_brief_urls(
            brief, web_search_source_urls=web_search_source_urls
        )

    elif brief.action == "clarify":
        _require(
            brief.research_status in {"not_needed", "adequate", "insufficient"},
            "clarify_research_not_needed",
            "Clarify requires research_status not_needed, adequate, or insufficient.",
        )
        _require(
            bool(brief.missing_fields),
            "clarify_without_missing_fields",
            "Clarify requires missing_fields.",
        )
    elif brief.action == "decline":
        # Auto-sanitize decline briefs: the model sometimes adds sources or
        # actions alongside a decline decision.  Strip them rather than
        # rejecting the entire brief.
        brief.immediate_actions = []
        brief.sources = []
        brief.contacts = []


__all__ = [
    "ResearchValidationError",
    "fact_is_material",
    "validate_research_brief",
]
