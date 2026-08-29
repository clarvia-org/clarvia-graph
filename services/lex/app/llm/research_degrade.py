"""Last-resort research degrade so Lex keeps the dialogue open."""

from __future__ import annotations

import logging
import re

from app.llm.research_schema import LexResearchBrief, MissingField
from app.llm.research_validation import (
    ResearchValidationError,
    _fact_grounded,
    validate_research_brief,
)

_LOG = logging.getLogger(__name__)

_DEFAULT_CLARIFY_FIELDS: tuple[MissingField, ...] = (
    "death_country",
    "subdivision",
    "other",
)


def _infer_missing_fields(
    brief: LexResearchBrief,
    conversation_text: str,
) -> list[MissingField]:
    """Pick concrete clarify asks from gaps — dialogue fuel for the next turn."""
    fields: list[MissingField] = []
    known_roles = {
        jurisdiction.role
        for jurisdiction in brief.jurisdictions
        if jurisdiction.country_code != "ZZ"
    }
    if "death_location" not in known_roles:
        fields.append("death_country")
    if "habitual_residence" not in known_roles:
        fields.append("residence_country")
    if "care_location" not in known_roles and re.search(
        r"(?i)\b(child|children|hospice|hospital|palliative)\b",
        conversation_text,
    ):
        fields.append("care_country")
    if re.search(r"(?i)\b(accident|germany|france|abroad|border)\b", conversation_text):
        if "subdivision" not in fields:
            fields.append("subdivision")
    if not fields:
        fields.append("other")
    # Cap to schema max_length 5; prefer the first useful asks.
    return fields[:3]


def _drop_all_ungrounded_facts(
    brief: LexResearchBrief, conversation_text: str
) -> list[str]:
    """Last-resort: drop every ungegrounded fact, including material ones."""
    if len(conversation_text.strip()) < 30:
        return []
    kept: list[str] = []
    dropped: list[str] = []
    for fact in brief.user_facts:
        if _fact_grounded(fact, conversation_text):
            kept.append(fact)
        else:
            dropped.append(fact)
    brief.user_facts = kept
    return dropped


def _to_clarify_brief(
    brief: LexResearchBrief, conversation_text: str
) -> LexResearchBrief:
    fields = list(brief.missing_fields) or _infer_missing_fields(
        brief, conversation_text
    )
    if not fields:
        fields = ["other"]
    return brief.model_copy(
        update={
            "action": "clarify",
            "research_status": "insufficient",
            "immediate_actions": [],
            "sources": [],
            "contacts": [],
            "missing_fields": fields[:5],
            "off_topic_label": None,
        }
    )


def _answer_can_stand(
    brief: LexResearchBrief,
    *,
    conversation_text: str,
    web_search_source_urls: frozenset[str] | None,
    web_search_calls: int | None,
) -> bool:
    if brief.action != "answer":
        return False
    try:
        validate_research_brief(
            brief,
            web_search_source_urls=web_search_source_urls,
            web_search_calls=web_search_calls,
            conversation_text=conversation_text,
        )
        return True
    except ResearchValidationError:
        return False


def degrade_failed_research_brief(
    brief: LexResearchBrief,
    *,
    conversation_text: str,
    last_error: str,
    web_search_source_urls: frozenset[str] | None = None,
    web_search_calls: int | None = None,
) -> LexResearchBrief | None:
    """Turn a failed research brief into a sendable answer or clarify turn.

    Returns None only when even clarify cannot be formed. Does not invent URLs
    or restore answer content that failed validation.
    """
    working = brief.model_copy(deep=True)
    dropped = _drop_all_ungrounded_facts(working, conversation_text)
    if dropped:
        _LOG.info(
            "Degrade dropped %s ungegrounded user_facts (last_error=%s): %s",
            len(dropped),
            last_error,
            dropped,
        )

    if working.action in {"clarify", "decline"}:
        try:
            validate_research_brief(
                working,
                web_search_source_urls=web_search_source_urls,
                web_search_calls=web_search_calls,
                conversation_text=conversation_text,
            )
            _LOG.info("Degrade kept action=%s after repair", working.action)
            return working
        except ResearchValidationError:
            if working.action == "decline":
                return None
            # Fall through to forced clarify reshape.

    if _answer_can_stand(
        working,
        conversation_text=conversation_text,
        web_search_source_urls=web_search_source_urls,
        web_search_calls=web_search_calls,
    ):
        _LOG.info("Degrade restored action=answer after fact repair")
        return working

    # Explicit clarify — writer must not invent this action.
    clarify = _to_clarify_brief(working, conversation_text)
    try:
        validate_research_brief(
            clarify,
            web_search_source_urls=None,
            web_search_calls=None,
            conversation_text=conversation_text,
        )
        _LOG.info(
            "Degrade set action=clarify missing_fields=%s (last_error=%s)",
            clarify.missing_fields,
            last_error,
        )
        return clarify
    except ResearchValidationError as exc:
        _LOG.info("Degrade could not form clarify: %s", exc.code)
        return None


__all__ = ["degrade_failed_research_brief"]
