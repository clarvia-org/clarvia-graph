"""Validate writer output against a verified research brief."""

from __future__ import annotations

import re
from collections.abc import Sequence

from app.llm.research_schema import LexResearchBrief
from app.llm.scenario_validation import validate_no_unsupported_scenarios
from app.llm.writer_schema import LexWrittenResponse

_CITATION_RE = re.compile(r"\[(\d+)\]")
_URL_RE = re.compile(r"https?://", re.IGNORECASE)
_PHONE_RE = re.compile(r"\+?\d[\d\s().-]{6,}\d")
_EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)
_DEADLINE_RE = re.compile(
    r"\b(\d{1,3})\s*(hour|hours|day|days|week|weeks|month|months)\b",
    re.IGNORECASE,
)

_DUPLICATE_SECTION_RE = re.compile(
    r"(?im)^(sources(?:\s+checked)?|references|organisations?\s+and\s+contacts|"
    r"contact details|useful contacts)\s*:?\s*$"
)

_FORMULAIC_OPENINGS: tuple[str, ...] = (
    "here's what you need to know",
    "let me break this down",
    "below is a short, practical checklist",
    "below is what usually happens",
    "i'm sorry you're facing this. below is",
    "i’m sorry you’re facing this. below is",
    "this can feel overwhelming",
    "let's navigate this together",
)

_ROBOTIC_HEADINGS: tuple[str, ...] = (
    "immediate (now - first hours)",
    "time-sensitive rules to note",
    "documents and information to gather",
    "who to notify",
    "action plan",
    "key considerations",
    "important information",
)

_CONTINUATION_FOOTER_MARKERS: tuple[str, ...] = (
    "we're happy to help with anything else",
    "clarvia is a nonprofit",
    "lex is clarvia's ai-powered information",
    "making a donation",
)

_SIGN_OFF_RE = re.compile(r"(?:\n|^)Lex\.\s*$")


class WriterValidationError(ValueError):
    def __init__(self, code: str, message: str | None = None) -> None:
        self.code = code
        self.safe_retry_instruction = _retry_instruction(code)
        super().__init__(message or code)


def _retry_instruction(code: str) -> str:
    mapping = {
        "unsupported_exceptional_scenario": (
            "The previous draft introduced police, emergency services, or another "
            "exceptional scenario that is not in the verified research brief. "
            "Rewrite using only the supplied user_facts and immediate_actions."
        ),
        "duplicate_source_or_contact_section": (
            "The previous draft created a separate Sources checked or Organisations "
            "and contacts section. Remove it. Sources are rendered by the application."
        ),
        "formulaic_opening": (
            "The previous draft used a formulaic AI opening. Rewrite with a natural "
            "acknowledgement and move quickly to the immediate actions."
        ),
        "robotic_heading": (
            "The previous draft used robotic section headings. Use at most two short "
            "natural headings, or none."
        ),
        "url_in_body": (
            "The previous draft included a raw URL. Remove URLs; the application "
            "renders citation links."
        ),
        "unknown_action_id": (
            "The previous draft referenced an action id that is not in the brief. "
            "Use only the supplied immediate_actions."
        ),
        "missing_required_action": (
            "The previous draft omitted a required immediate action. Include every "
            "required action from the brief."
        ),
        "unknown_citation": (
            "The previous draft used a citation marker that is not in the brief. "
            "Use only verified source ids."
        ),
        "unsupported_phone_or_email": (
            "The previous draft introduced a phone number or email that is not in "
            "the verified research brief. Remove it."
        ),
        "unsupported_deadline": (
            "The previous draft introduced a deadline that is not present in the "
            "verified research brief. Use only brief timing facts."
        ),
        "focused_follow_up_dump": (
            "The previous draft repeated the earlier general checklist. Answer only "
            "current_question using the focused_follow_up actions."
        ),
        "later_topics_too_detailed": (
            "The previous draft explained later topics in too much detail. Mention "
            "them briefly and ask only for the facts needed to help next."
        ),
        "unsupported_organisation_name": (
            "The previous draft named an organisation that is not in the verified "
            "contacts or source publishers. Remove or replace it."
        ),
        "continuation_or_footer_in_body": (
            "The previous draft included continuation or footer text. Remove it; the "
            "application adds those."
        ),
        "writer_includes_signoff": (
            "The previous draft ended with Lex. Remove the sign-off; the application "
            "adds it."
        ),
        "body_too_short": (
            "The previous draft was too short for an imminent or recent-death answer. "
            "Expand to roughly 250-600 words using the verified actions."
        ),
        "body_too_long": (
            "The previous draft was too long. Tighten to roughly 250-600 words."
        ),
        "too_many_headings": (
            "The previous draft used too many headings. Use at most two short natural "
            "headings, or none."
        ),
        "asks_known_user_fact": (
            "The previous draft asked for information already present in user_facts. "
            "Do not re-ask known facts."
        ),
    }
    return mapping.get(
        code,
        "The previous draft failed validation. Rewrite using only the verified "
        "research brief and answer the latest user question.",
    )


def _require(condition: bool, code: str, message: str) -> None:
    if not condition:
        raise WriterValidationError(code, message)


def _word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def _allowed_organisation_names(brief: LexResearchBrief) -> set[str]:
    names = {contact.name.casefold() for contact in brief.contacts}
    names.update(source.publisher.casefold() for source in brief.sources)
    # Allow short fragments of multi-word contact names.
    for contact in brief.contacts:
        for part in re.findall(r"[A-Za-z][A-Za-z0-9&./'-]{2,}", contact.name):
            if len(part) >= 4:
                names.add(part.casefold())
    return names


def validate_written_response(
    written: LexWrittenResponse,
    brief: LexResearchBrief,
    *,
    latest_user_message: str = "",
) -> None:
    body = written.body_markdown
    action_ids = {action.id for action in brief.immediate_actions}
    source_ids = {source.id for source in brief.sources}
    contact_ids = {contact.id for contact in brief.contacts}
    required_ids = {
        action.id for action in brief.immediate_actions if action.required
    }

    for action_id in written.used_action_ids:
        _require(action_id in action_ids, "unknown_action_id", "Unknown action id.")
    for required_id in required_ids:
        _require(
            required_id in set(written.used_action_ids),
            "missing_required_action",
            "Required action missing from used_action_ids.",
        )
    for source_id in written.used_source_ids:
        _require(source_id in source_ids, "unknown_source_id", "Unknown source id.")
    for contact_id in written.used_contact_ids:
        _require(contact_id in contact_ids, "unknown_contact_id", "Unknown contact id.")

    for marker in {int(match) for match in _CITATION_RE.findall(body)}:
        _require(marker in source_ids, "unknown_citation", "Citation without source.")

    _require(not _URL_RE.search(body), "url_in_body", "Body must not contain URLs.")
    _require(
        _DUPLICATE_SECTION_RE.search(body) is None,
        "duplicate_source_or_contact_section",
        "Body must not include source/contact sections.",
    )

    body_folded = body.casefold()
    for marker in _CONTINUATION_FOOTER_MARKERS:
        if marker in body_folded:
            raise WriterValidationError("continuation_or_footer_in_body")
    if _SIGN_OFF_RE.search(body):
        raise WriterValidationError("writer_includes_signoff")

    opening = body.lstrip()[:180].casefold()
    for phrase in _FORMULAIC_OPENINGS:
        if opening.startswith(phrase):
            raise WriterValidationError("formulaic_opening")

    for heading in _ROBOTIC_HEADINGS:
        if heading in body_folded:
            raise WriterValidationError("robotic_heading")

    scenario_code = validate_no_unsupported_scenarios(
        text=body,
        safety_status=brief.safety_status,
        user_facts=brief.user_facts,
    )
    if scenario_code:
        raise WriterValidationError(scenario_code)

    brief_text = brief.model_dump_json()
    for match in _PHONE_RE.findall(body):
        compact = re.sub(r"\D", "", match)
        if compact and compact not in re.sub(r"\D", "", brief_text):
            raise WriterValidationError("unsupported_phone_or_email")
    for match in _EMAIL_RE.findall(body):
        if match.casefold() not in brief_text.casefold():
            raise WriterValidationError("unsupported_phone_or_email")

    for amount, unit in _DEADLINE_RE.findall(body):
        needle = f"{amount} {unit}".casefold()
        if needle not in brief_text.casefold() and f"{amount}{unit}".casefold() not in brief_text.casefold():
            if unit.casefold() in {"hour", "hours", "day", "days"} and amount in brief_text:
                continue
            raise WriterValidationError("unsupported_deadline")

    allowed_names = _allowed_organisation_names(brief)
    # Soft organisation check: reject clear invented provider brands that look like
    # proper names and are absent from brief contacts/publishers.
    for contact_name in re.findall(
        r"\b([A-Z][A-Za-z0-9&./'-]*(?:\s+[A-Z][A-Za-z0-9&./'-]*){1,3})\b",
        body,
    ):
        lowered = contact_name.casefold()
        if lowered.startswith(
            (
                "ask ",
                "prepare ",
                "compare ",
                "contact ",
                "also ",
                "after ",
                "before ",
                "please ",
            )
        ):
            continue
        if any(
            token in lowered
            for token in (
                "luxembourg",
                "belgium",
                "france",
                "germany",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "identity",
                "documents",
                "death",
                "certificate",
            )
        ):
            continue
        if "funeral" in lowered or "pompes" in lowered or "notary" in lowered:
            if lowered not in allowed_names and not any(
                lowered in allowed or allowed in lowered for allowed in allowed_names
            ):
                raise WriterValidationError("unsupported_organisation_name")
    _ = allowed_names

    if brief.situation_stage == "focused_follow_up":
        if len(brief.immediate_actions) <= 2 and "funeral" in body_folded and "pension" in (
            brief.current_question or ""
        ).casefold():
            if "certificate" in body_folded and "commune" in body_folded and "burial" in body_folded:
                raise WriterValidationError("focused_follow_up_dump")
        facts_blob = "\n".join(brief.user_facts).casefold()
        if re.search(r"(?i)\b(which country|what country|where (?:did|does)|do you live)\b", body):
            if "luxembourg" in facts_blob or "belgium" in facts_blob:
                raise WriterValidationError("asks_known_user_fact")
        _ = latest_user_message

    if brief.situation_stage in {"imminent_death", "recent_death"}:
        words = _word_count(body)
        if words < 180:
            raise WriterValidationError("body_too_short")
        if words > 750:
            raise WriterValidationError("body_too_long")

    heading_count = len(re.findall(r"(?m)^#{1,3}\s+\S+", body))
    heading_count += len(re.findall(r"(?m)^[A-Z][^.\n]{2,60}$", body))
    _require(heading_count <= 2, "too_many_headings", "Too many headings.")


__all__ = ["WriterValidationError", "validate_written_response"]
