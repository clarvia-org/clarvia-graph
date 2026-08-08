"""Detect unsupported violent/emergency scenarios in model output."""

from __future__ import annotations

import re
from collections.abc import Sequence

_EXCEPTIONAL_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\bviolent(?:ly)?\b",
        r"\bviolence\b",
        r"\bsuspicious(?:ly)?\b",
        r"\bunexpected death\b",
        r"\bpolice\b",
        r"\bemergency services\b",
        r"\bcall (?:112|113|911)\b",
        r"\bcrime\b",
        r"\bsafety concern\b",
        r"\babuse\b",
        r"\baccident\b",
        r"\bself[- ]harm\b",
        r"\bsuicide\b",
        r"\bcoroner\b",
        r"\bforensic\b",
    )
)


def exceptional_scenario_hits(text: str) -> list[str]:
    """Return matched exceptional-scenario terms found in ``text``."""
    hits: list[str] = []
    for pattern in _EXCEPTIONAL_PATTERNS:
        match = pattern.search(text)
        if match:
            hits.append(match.group(0))
    return hits


def facts_support_exceptional_scenario(user_facts: Sequence[str]) -> bool:
    """True when user facts themselves describe an exceptional scenario."""
    joined = "\n".join(user_facts)
    return bool(exceptional_scenario_hits(joined))


def validate_no_unsupported_scenarios(
    *,
    text: str,
    safety_status: str,
    user_facts: Sequence[str],
) -> str | None:
    """Return an error code when exceptional scenarios are invented."""
    if safety_status == "immediate_risk":
        return None
    if facts_support_exceptional_scenario(user_facts):
        return None
    hits = exceptional_scenario_hits(text)
    if hits:
        return "unsupported_exceptional_scenario"
    return None


__all__ = [
    "exceptional_scenario_hits",
    "facts_support_exceptional_scenario",
    "validate_no_unsupported_scenarios",
]
