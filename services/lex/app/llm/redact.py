"""Deterministic redaction before the model envelope (blueprint section 13)."""

from __future__ import annotations

import re

_EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")
_PHONE_RE = re.compile(r"(?<!\d)(?:\+?\d[\d\s().\-]{6,}\d)(?!\d)")
_IBAN_RE = re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b")
_BANK_ACCOUNT_RE = re.compile(r"\b\d{8,17}\b")
_CARD_RE = re.compile(r"\b(?:\d[ -]*){13,19}\b")
_PASSPORT_RE = re.compile(r"\b[A-Z]{1,2}\d{6,9}\b")
_NATIONAL_ID_RE = re.compile(r"\b\d{11,13}\b")
_SOCIAL_SECURITY_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b|\b\d{9,12}\b")
_INSURANCE_POLICY_RE = re.compile(
    r"\b(?:policy|police|versicherung|assurance)[:\s#-]*[A-Z0-9\-]{6,}\b",
    re.IGNORECASE,
)
_PATIENT_RECORD_RE = re.compile(
    r"\b(?:patient|record| dossier)[:\s#-]*[A-Z0-9\-]{6,}\b",
    re.IGNORECASE,
)
_ADDRESS_RE = re.compile(
    r"\b\d{1,5}\s+[A-Za-z0-9][\w\s.'\-]{2,40}\s+"
    r"(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|"
    r"rue|avenue|boulevard|place|chemin|route)\b",
    re.IGNORECASE,
)

_REDACTION_LABEL = "[redacted]"


_ISO_DATE_RE = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
_DATE_TOKEN = "__LEX_ISO_DATE__"


def redact_sensitive_text(text: str) -> str:
    """Apply deterministic redaction patterns; order is fixed for stability."""
    protected: list[str] = []

    def _stash_date(match: re.Match[str]) -> str:
        protected.append(match.group(0))
        return f"{_DATE_TOKEN}{len(protected) - 1}"

    redacted = _ISO_DATE_RE.sub(_stash_date, text)
    redacted = _EMAIL_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _PHONE_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _IBAN_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _CARD_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _BANK_ACCOUNT_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _PASSPORT_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _NATIONAL_ID_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _SOCIAL_SECURITY_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _INSURANCE_POLICY_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _PATIENT_RECORD_RE.sub(_REDACTION_LABEL, redacted)
    redacted = _ADDRESS_RE.sub(_REDACTION_LABEL, redacted)
    for index, value in enumerate(protected):
        redacted = redacted.replace(f"{_DATE_TOKEN}{index}", value)
    return redacted


__all__ = ["redact_sensitive_text"]
