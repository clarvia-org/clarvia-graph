"""Deterministic fallback renderer for a validated research brief."""

from __future__ import annotations

from app.llm.research_schema import LexResearchBrief

_ACK = {
    "imminent_death": (
        "I'm sorry you're going through this. Here is what usually matters most "
        "to prepare now."
    ),
    "recent_death": (
        "I'm sorry for your loss. These are the first practical steps that usually "
        "matter now."
    ),
    "focused_follow_up": "Here is what matters for your latest question.",
    "default": "Here are the next practical steps.",
}


def render_research_brief_fallback(brief: LexResearchBrief) -> str:
    """Turn a validated brief into plain prose without another LLM call."""
    stage = brief.situation_stage
    lines: list[str] = [_ACK.get(stage, _ACK["default"]), ""]

    if brief.current_question and stage == "focused_follow_up":
        lines.append(f"Regarding: {brief.current_question}")
        lines.append("")

    if brief.completed_actions:
        lines.append(
            "You already mentioned: "
            + "; ".join(brief.completed_actions[:5])
            + "."
        )
        lines.append("")

    for action in brief.immediate_actions:
        citation = ""
        if action.source_ids:
            citation = "".join(f"[{source_id}]" for source_id in action.source_ids[:3])
        handlers = (
            f" Usually handled by: {', '.join(action.handled_by)}."
            if action.handled_by
            else ""
        )
        docs = (
            f" Documents often needed: {', '.join(action.documents)}."
            if action.documents
            else ""
        )
        lines.append(f"- {action.action}. {action.explanation}{handlers}{docs}{citation}")

    if brief.later_topics and stage in {"imminent_death", "recent_death"}:
        lines.append("")
        lines.append(
            "Later on, families usually also deal with "
            + ", ".join(brief.later_topics[:4])
            + ". We can go through those when you are ready."
        )

    return "\n".join(lines).strip()


__all__ = ["render_research_brief_fallback"]
