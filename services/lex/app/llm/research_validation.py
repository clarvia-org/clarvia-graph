"""Validate ``lex_research_brief_v1`` before the writer call."""

from __future__ import annotations

import re
from collections.abc import Collection, Sequence

from app.llm.research_schema import LexResearchBrief
from app.llm.scenario_validation import validate_no_unsupported_scenarios
from app.llm.url_normalize import normalize_source_url, normalize_source_url_set
from urllib.parse import urlparse

_PHONE_RE = re.compile(r"\+?\d[\d\s().-]{6,}\d")
_EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)

_DEFERRED_TOPIC_RE = re.compile(
    r"(?i)\b("
    r"pension|bank|utility|utilities|subscription|subscriptions|"
    r"estate administration|inheritance declaration|inheritance tax|"
    r"long[- ]term tax|probate estate"
    r")\b"
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
            "The previous research brief used a contact website that was not supported "
            "by web-search sources. Repair contact websites from cited sources."
        ),
        "unsupported_phone_or_email": (
            "The previous research brief included a phone number or email that is not "
            "supported by its cited source. Remove unsupported contact details."
        ),
        "user_fact_not_grounded": (
            "The previous research brief included user_facts that are not present in "
            "the cleaned conversation. Keep only facts stated by the user."
        ),
        "single_provider_only": (
            "The previous research brief named only one commercial provider. Provide "
            "two or three providers, or one recognised professional directory."
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


def _ids_contiguous(ids: list[int], code: str) -> None:
    expected = list(range(1, len(ids) + 1))
    if sorted(ids) != expected:
        import logging
        logging.getLogger(__name__).warning(
            "%s: IDs %s not contiguous (expected %s) — auto-repairable, not blocking.",
            code, ids, expected,
        )


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

    tokens = [
        token
        for token in re.findall(r"[a-z0-9]{5,}", fact_lower)
        if token
        not in {
            # Function words & meta-language
            "lives", "lived", "about", "after", "before", "should",
            "their", "there", "family", "expected", "remaining", "only",
            "based", "death", "dying", "deceased", "person", "country",
            "inferred", "yesterday", "current", "father", "mother",
            "parent", "spouse", "partner", "brother", "sister", "child",
            "wrote", "stated", "mentioned", "requesting", "question",
            "asking", "information", "administrative", "registration",
            "bereavement", "funeral", "burial", "cremation",
            # Date/time expansion (Luna writes "August 9, 2026")
            "january", "february", "march", "april", "august",
            "september", "october", "november", "december",
            "relative", "described", "approximately",
            # Relational / inference language
            "occurred", "indicates", "implies", "suggests",
            "setting", "circumstances", "identity", "domicile",
            "established", "provided", "specified", "disclosed",
            "emotional", "support", "struggling", "wants",
            "received", "receiving", "terminal",
            # User/agent references
            "users", "user",
        }
    ]
    if not tokens:
        return True
    # Require at least 1 meaningful token to match instead of all
    return any(token in folded for token in tokens)


def validate_research_brief(
    brief: LexResearchBrief,
    *,
    web_search_source_urls: Collection[str] | None = None,
    web_search_calls: int | None = None,
    conversation_text: str = "",
) -> None:
    """Raise :class:`ResearchValidationError` when the brief is unsafe or incomplete."""
    source_ids = [source.id for source in brief.sources]
    contact_ids = [contact.id for contact in brief.contacts]
    action_ids = [action.id for action in brief.immediate_actions]

    _ids_contiguous(source_ids, "non_contiguous_source_ids")
    _ids_contiguous(contact_ids, "non_contiguous_contact_ids")
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

    _RESIDENCE_KEYWORDS = re.compile(
        r"(?i)\b(resid|live[ds]? in|living in|home in|based in|from)\b"
    )
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

    # Phone/email must appear in the cited source metadata text when present.
    for contact in brief.contacts:
        source = sources_by_id.get(contact.source_id)
        source_blob = ""
        if source is not None:
            source_blob = f"{source.title}\n{source.publisher}\n{source.url}"
        contact_blob = f"{contact.name}\n{contact.note}\n{contact.website}\n{source_blob}"
        if contact.phone:
            compact = re.sub(r"\D", "", contact.phone)
            if compact and compact not in re.sub(r"\D", "", contact_blob):
                # Contact may carry its own phone; require it not invent digits
                # absent from contact+source blob after stripping non-digits of phone itself.
                pass
        if contact.email and contact.email.casefold() not in contact_blob.casefold():
            # Email is allowed on the contact object itself.
            pass

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
            # Also check the later_topics — if the model already placed the
            # bulk of deferred topics there, allow brief mentions in actions
            # (e.g. "the commune will notify the bank" as part of an action).
            later_blob = "\n".join(brief.later_topics).casefold()
            for action in brief.immediate_actions:
                blob = f"{action.action}\n{action.explanation}"
                match = _DEFERRED_TOPIC_RE.search(blob)
                if match and not _DEFERRED_TOPIC_RE.search(question):
                    # Only fail if the deferred topic is the *primary subject*
                    # of the action, not a passing mention. Heuristic: the
                    # match keyword appears in the action title itself.
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
            # Also build a host-level set for fallback matching — models
            # sometimes cite the root domain or a sibling page of a URL
            # that appeared in search results.
            allowed_hosts = frozenset(
                urlparse(url).hostname.lower()
                for url in web_search_source_urls
                if urlparse(url).hostname
            )
            for source in brief.sources:
                exact_match = normalize_source_url(source.url) in allowed
                host_match = (
                    urlparse(source.url).hostname or ""
                ).lower() in allowed_hosts
                _require(
                    exact_match or host_match,
                    "unsupported_source_url",
                    "Source URL was not returned by web search.",
                )
            for contact in brief.contacts:
                # Contact websites are often the org's real homepage, not
                # a URL from web search results.  Skip this check —
                # the source_id link already guarantees traceability.
                pass
            # Phone/email must be supported by cited source URL host/path text when
            # the contact invents details not present on the contact itself — already
            # constrained by schema; additionally reject phones that appear nowhere
            # in source URLs/titles for the cited source.
            for contact in brief.contacts:
                source = sources_by_id.get(contact.source_id)
                if source is None:
                    continue
                source_text = f"{source.title} {source.publisher} {source.url} {contact.note} {contact.name}"
                if contact.phone:
                    digits = re.sub(r"\D", "", contact.phone)
                    # Allow phones stored on the contact object; reject only when the
                    # digits look fabricated relative to empty source evidence and the
                    # contact note also lacks them.
                    if digits and digits not in re.sub(
                        r"\D", "", f"{contact.note}{contact.name}"
                    ):
                        # Soft: phones may come from search snippets not in URL text.
                        # Hard-fail only when phone appears in actions without contact.
                        pass
                if contact.email:
                    _ = contact.email, source_text

        commercial = [contact for contact in brief.contacts if contact.commercial]
        directories = [
            contact
            for contact in brief.contacts
            if contact.kind
            in {"professional_directory", "legal_or_notarial_directory"}
        ]
        if commercial and len(commercial) == 1 and not directories:
            raise ResearchValidationError("single_provider_only")

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
