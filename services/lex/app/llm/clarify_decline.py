"""Application-owned clarification and decline templates for two-pass mode."""

from __future__ import annotations

from app.llm.research_schema import LexResearchBrief

_CLARIFY_TEMPLATES: dict[str, str] = {
    "death_country+residence_country": (
        "I'm very sorry. Which country did the person die in, and in which country "
        "did they normally live?\n\n"
        "Those details determine the authorities, documents and deadlines."
    ),
    "death_country": (
        "I'm very sorry. Which country did the death occur in?\n\n"
        "That determines which authorities handle the declaration and certificates."
    ),
    "residence_country": (
        "I'm very sorry. In which country did the person normally live?\n\n"
        "That helps identify the right authorities and next steps."
    ),
    "death_or_planning_status": (
        "I'm very sorry. Has the person already died, or are you preparing for an "
        "expected death?\n\n"
        "The first steps differ in those situations."
    ),
    "default": (
        "I'm very sorry. I need one or two details before I can give accurate next "
        "steps: {fields}."
    ),
}

_FIELD_LABELS = {
    "death_or_planning_status": "whether this is planning ahead or after a death",
    "death_country": "the country where the death occurred",
    "residence_country": "the country of habitual residence",
    "care_country": "the country where care is being provided",
    "subdivision": "the city, commune or region",
    "asset_country": "any country where important assets are located",
    "other": "a missing detail that changes the next steps",
}

_DECLINE_TEMPLATE = (
    "I'm Lex, Clarvia's bereavement and end-of-life information service. "
    "I can help with practical steps after a death and with end-of-life preparation, "
    "but I can't help with {topic}."
)


def render_clarification_body(brief: LexResearchBrief) -> str:
    fields = list(brief.missing_fields)
    key = "+".join(fields[:2]) if fields else "default"
    if key in _CLARIFY_TEMPLATES:
        return _CLARIFY_TEMPLATES[key]
    if len(fields) == 1 and fields[0] in _CLARIFY_TEMPLATES:
        return _CLARIFY_TEMPLATES[fields[0]]
    labels = [_FIELD_LABELS.get(field, field) for field in fields] or [
        "a little more context"
    ]
    joined = " and ".join(labels) if len(labels) <= 2 else ", ".join(labels[:-1]) + f", and {labels[-1]}"
    return _CLARIFY_TEMPLATES["default"].format(fields=joined)


def render_decline_body(brief: LexResearchBrief) -> str:
    topic = (brief.off_topic_label or "that request").strip()
    return _DECLINE_TEMPLATE.format(topic=topic)


__all__ = ["render_clarification_body", "render_decline_body"]
