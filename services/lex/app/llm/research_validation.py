"""Validate ``lex_research_brief_v1`` before the writer call."""

from __future__ import annotations

import logging
import re
from collections.abc import Collection
from urllib.parse import urlparse

from app.llm.research_schema import LexResearchBrief
from app.llm.scenario_validation import validate_no_unsupported_scenarios
from app.llm.url_normalize import normalize_source_url, normalize_source_url_set

_LOG = logging.getLogger(__name__)

_DEFERRED_TOPIC_RE = re.compile(
    r"(?i)\b("
    r"pension|bank|utility|utilities|subscription|subscriptions|"
    r"estate administration|inheritance declaration|inheritance tax|"
    r"long[- ]term tax|probate estate"
    r")\b"
)

# Host match (same search host, different language/path) is allowed only here.
# Do not accept an unrelated page merely because it shares an arbitrary domain.
_TRUSTED_HOST_SUFFIXES: tuple[str, ...] = (
    ".public.lu",
    ".etat.lu",
    ".europa.eu",
    ".gouv.fr",
    ".service-public.fr",
    ".belgium.be",
    ".fgov.be",
    ".bund.de",
    ".gov.uk",
    ".gov",
)
_TRUSTED_HOSTS_EXACT: frozenset[str] = frozenset(
    {
        "guichet.public.lu",
        "legilux.public.lu",
        "ccss.lu",
        "cnap.lu",
        "cns.lu",
        "adell.lu",
        "guichet.etat.lu",
    }
)

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
        "luxembourg",
        "luxembourgish",
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
            "to its cited source. Use the organisation homepage matching the source "
            "host, or a trusted institutional host."
        ),
        "unsupported_phone_or_email": (
            "The previous research brief included a phone number or email that is not "
            "supported by its cited source. Remove unsupported contact details."
        ),
        "user_fact_not_grounded": (
            "The previous research brief included user_facts that are not present in "
            "the cleaned conversation. Keep only facts stated by the user."
        ),
        "deferred_topic_in_immediate_actions": (
            "The previous research brief put later administrative topics into "
            "immediate_actions. Move pensions, banks, utilities, and estate topics "
            "to later_topics unless the user asked about them or an urgent deadline "
            "applies."
        ),
        "unsupported_exceptional_scenario": (
            "The previous research brief introduced police, emergency services, or "
            "another exceptional scenario unsupported by user_facts. Remove it."
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


def _is_trusted_institutional_host(hostname: str | None) -> bool:
    if not hostname:
        return False
    host = hostname.lower().rstrip(".")
    if host in _TRUSTED_HOSTS_EXACT:
        return True
    return any(
        host == suffix[1:] or host.endswith(suffix) for suffix in _TRUSTED_HOST_SUFFIXES
    )


def _same_site_host(left: str, right: str) -> bool:
    a = left.lower().rstrip(".")
    b = right.lower().rstrip(".")
    if not a or not b:
        return False
    return a == b or a.endswith("." + b) or b.endswith("." + a)


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


def _contact_website_allowed(website: str, *, source_url: str | None) -> bool:
    """Soft guard: HTTPS host must be trusted or same-site as the cited source."""
    if not website.lower().startswith("https://"):
        return False
    web_host = _hostname(website)
    if not web_host:
        return False
    if _is_trusted_institutional_host(web_host):
        return True
    if source_url:
        source_host = _hostname(source_url)
        if source_host and _same_site_host(web_host, source_host):
            return True
    return False


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
    sources_by_id = {source.id: source for source in brief.sources}
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

    action_blob = "\n".join(
        f"{item.action}\n{item.explanation}" for item in brief.immediate_actions
    )
    scenario_code = validate_no_unsupported_scenarios(
        text=action_blob,
        safety_status=brief.safety_status,
        user_facts=brief.user_facts,
    )
    if scenario_code:
        raise ResearchValidationError(scenario_code)

    # Completed actions should not reappear as unfinished work.
    completed_folded = {item.casefold() for item in brief.completed_actions}
    for action in brief.immediate_actions:
        if action.action.casefold() in completed_folded:
            raise ResearchValidationError("completed_action_repeated")

    conversation_folded = conversation_text.casefold()
    facts_folded = "\n".join(brief.user_facts).casefold()
    # Grounding needs enough conversation context to be meaningful.
    if len(conversation_text.strip()) >= 30:
        for fact in brief.user_facts:
            if not _fact_grounded(fact, conversation_text):
                raise ResearchValidationError("user_fact_not_grounded")

    for field in brief.missing_fields:
        if field == "death_country" and (
            "luxembourg" in facts_folded
            or "belgium" in facts_folded
            or "luxembourg" in conversation_folded
            or "belgium" in conversation_folded
        ):
            raise ResearchValidationError("missing_field_already_known")
        # residence_country is intentionally NOT checked here — the model
        # correctly distinguishes death location from residence. A user who
        # says "died in Luxembourg" may live in France or Germany.

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

        if web_search_source_urls is not None:
            allowed = normalize_source_url_set(frozenset(web_search_source_urls))
            allowed_hosts = frozenset(
                host for url in web_search_source_urls if (host := _hostname(url))
            )
            for source in brief.sources:
                exact_match = normalize_source_url(source.url) in allowed
                source_host = _hostname(source.url)
                host_match = source_host in allowed_hosts and _is_trusted_institutional_host(
                    source_host
                )
                _require(
                    exact_match or host_match,
                    "unsupported_source_url",
                    "Source URL was not returned by web search.",
                )
            for contact in brief.contacts:
                # Contact websites are often org homepages, not search hits.
                # Soft guard: trusted institutional host or same-site as cited source.
                source = sources_by_id.get(contact.source_id)
                source_url = source.url if source is not None else None
                _require(
                    _contact_website_allowed(contact.website, source_url=source_url),
                    "unsupported_contact_website",
                    "Contact website is not related to its cited source.",
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


__all__ = ["ResearchValidationError", "validate_research_brief"]
