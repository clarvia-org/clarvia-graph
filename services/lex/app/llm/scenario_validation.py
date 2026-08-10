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
        r"\bself[- ]harm\b",
        r"\bsuicide\b",
        r"\bcoroner\b",
        r"\bforensic\b",
    )
)

# "accident" is checked separately with extra context to avoid false
# positives on standard admin terms like "accident insurance".
_ACCIDENT_RE = re.compile(r"\baccident\b", re.IGNORECASE)
_ACCIDENT_BENIGN_RE = re.compile(
    r"\baccident(?:al|s)?\s+(?:insurance|assurance|cover|benefit|fund|scheme|report)\b"
    r"|\baccidental(?:ly)?\b",
    re.IGNORECASE,
)

_NEGATION_PREFIX_RE = re.compile(
    r"(?:"
    r"no sign of|absence of|confirming no|without|non[- ]|(?:no|not) |anti[- ]"
    # Conditional / hypothetical prefixes — describe procedure, not the user's case
    r"|in case of|en cas de|(?:only )?if |(?:only )?when |whether "
    r"|in the event of|in geval van|im Falle "
    r")\s*$",
    re.IGNORECASE,
)

# Benign contexts where trigger words are used in standard admin/support language
_BENIGN_CONTEXT_RE = re.compile(
    r"suicide[- ]prevention|suicide[- ]helpline|suicide[- ]hotline"
    r"|prevent(?:ing)?\s+suicide"
    r"|anti[- ]abuse"
    # French/multilingual admin references
    r"|services de police"
    r"|mort suspecte"
    # Conditional guidance patterns
    r"|contact(?:er)?\s+(?:the |la )?police\s+if"
    r"|notify(?:ing)?\s+(?:the )?police\s+if",
    re.IGNORECASE,
)


def exceptional_scenario_hits(text: str) -> list[str]:
    """Return matched exceptional-scenario terms found in ``text``.

    Matches preceded by negation phrases (e.g. "no sign of violent death",
    "confirming no suspicious circumstances") are excluded — these describe
    standard administrative requirements, not invented exceptional scenarios.

    The word "accident" is checked separately to exclude benign administrative
    compound terms like "accident insurance" or "accidental overpayment".
    """
    hits: list[str] = []
    for pattern in _EXCEPTIONAL_PATTERNS:
        for match in pattern.finditer(text):
            prefix = text[max(0, match.start() - 25) : match.start()]
            if _NEGATION_PREFIX_RE.search(prefix):
                continue
            # Check if the match is in a benign context (wider window)
            context = text[max(0, match.start() - 30) : min(len(text), match.end() + 30)]
            if _BENIGN_CONTEXT_RE.search(context):
                continue
            hits.append(match.group(0))

    # Context-aware accident check
    for match in _ACCIDENT_RE.finditer(text):
        prefix = text[max(0, match.start() - 25) : match.start()]
        if _NEGATION_PREFIX_RE.search(prefix):
            continue
        # Check if this "accident" is part of a benign compound term
        context = text[max(0, match.start() - 5) : min(len(text), match.end() + 30)]
        if _ACCIDENT_BENIGN_RE.search(context):
            continue
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
