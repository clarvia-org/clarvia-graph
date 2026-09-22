"""Locale catalog for Lex email chrome (footer, gates, quote labels).

English is the source. Other locales are translator-supplied. HTML is composed
from prose keys plus link labels — the catalog itself contains no markup.
"""

from __future__ import annotations

import html
import json
from functools import lru_cache
from pathlib import Path
from typing import Literal, TypedDict, cast

EmailLocale = Literal[
    "en",
    "fr",
    "de",
    "lb",
    "nl",
    "it",
    "es",
    "pt",
    "pl",
    "ro",
    "ar",
    "uk",
    "tr",
    "ru",
]

EMAIL_LOCALES: tuple[EmailLocale, ...] = (
    "en",
    "fr",
    "de",
    "lb",
    "nl",
    "it",
    "es",
    "pt",
    "pl",
    "ro",
    "ar",
    "uk",
    "tr",
    "ru",
)

EMAIL_COPY_KEYS: tuple[str, ...] = (
    "from_name",
    "ask_subject",
    "re_your_message",
    "rate_limit_subject",
    "footer_donate",
    "footer_donate_link",
    "footer_volunteer",
    "footer_lex_identity",
    "footer_disclaimer",
    "footer_accuracy",
    "footer_contact_form_link",
    "footer_tip",
    "footer_privacy",
    "footer_contact",
    "last_reply_note",
    "thread_closed",
    "rate_limit_body",
    "recipient_limit_body",
    "attachment_only_body",
    "technical_failure_body",
    "temporary_unavailability_body",
    "sources_checked",
    "organisations_and_contacts",
    "previous_messages",
    "wrote_dated",
    "wrote",
    "message_truncated",
    "sender_label",
)

_SITE_PREFIX: dict[EmailLocale, str] = {
    "fr": "fr",
    "de": "de",
    "lb": "lu",
}

_ALIASES: dict[str, EmailLocale] = {
    "lu": "lb",
}

_LOCALE_SET: frozenset[str] = frozenset(EMAIL_LOCALES)
_CATALOG_PATH = Path(__file__).with_name("email-copy.json")

_LINK_STYLE = "color:#1a73e8"
_MUTED_LINK_STYLE = "color:#888"
_GITHUB_URL = "https://github.com/clarvia-org"
_LEX_ADDRESS = "lex@clarvia.org"
_SITE_ORIGIN = "https://clarvia.org"

_SIGN_OFF_KEYS: tuple[str, ...] = (
    "thread_closed",
    "rate_limit_body",
    "recipient_limit_body",
    "attachment_only_body",
    "technical_failure_body",
    "temporary_unavailability_body",
)


class EmailCopy(TypedDict):
    from_name: str
    ask_subject: str
    re_your_message: str
    rate_limit_subject: str
    footer_donate: str
    footer_donate_link: str
    footer_volunteer: str
    footer_lex_identity: str
    footer_disclaimer: str
    footer_accuracy: str
    footer_contact_form_link: str
    footer_tip: str
    footer_privacy: str
    footer_contact: str
    last_reply_note: str
    thread_closed: str
    rate_limit_body: str
    recipient_limit_body: str
    attachment_only_body: str
    technical_failure_body: str
    temporary_unavailability_body: str
    sources_checked: str
    organisations_and_contacts: str
    previous_messages: str
    wrote_dated: str
    wrote: str
    message_truncated: str
    sender_label: str


def is_email_locale(value: str) -> bool:
    return value in _LOCALE_SET


def parse_email_locale(raw: str | None) -> EmailLocale | None:
    """Map a BCP-47-ish tag onto a supported email locale, or None."""
    if not raw:
        return None
    lower = raw.strip().replace("_", "-").lower()
    if not lower:
        return None
    for token in (lower, lower.split("-", 1)[0]):
        if token in _ALIASES:
            return _ALIASES[token]
        if is_email_locale(token):
            return cast(EmailLocale, token)
    return None


def inbound_locale(ask_locale: str | None) -> EmailLocale:
    return parse_email_locale(ask_locale) or "en"


def chrome_locale(
    response_language: str | None,
    ask_locale: str | None = None,
) -> EmailLocale:
    return (
        parse_email_locale(response_language) or parse_email_locale(ask_locale) or "en"
    )


def is_rtl_email_locale(locale: EmailLocale) -> bool:
    return locale == "ar"


def site_path_prefix(locale: EmailLocale) -> str:
    return _SITE_PREFIX.get(locale, "en")


def site_url(locale: EmailLocale, path: str = "") -> str:
    prefix = site_path_prefix(locale)
    suffix = path.lstrip("/")
    if suffix:
        return f"{_SITE_ORIGIN}/{prefix}/{suffix}"
    return f"{_SITE_ORIGIN}/{prefix}"


@lru_cache(maxsize=1)
def _catalog() -> dict[str, EmailCopy]:
    raw = json.loads(_CATALOG_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise RuntimeError("email-copy.json must be an object of locale bundles.")
    return cast(dict[str, EmailCopy], raw)


def email_copy(locale: EmailLocale | str | None) -> EmailCopy:
    resolved = parse_email_locale(locale) if locale else None
    catalog = _catalog()
    bundle = catalog.get(resolved or "en") or catalog["en"]
    return bundle


def footer_verify_token(locale: EmailLocale | str | None = "en") -> str:
    """Distinctive donate prefix present in both plain and HTML footers."""
    copy = email_copy(locale)
    donate = copy["footer_donate"]
    link = copy["footer_donate_link"]
    prefix = donate
    idx = donate.find(link) if link else -1
    if idx > 8:
        prefix = donate[:idx].rstrip()
    for sep in (".", "!", "?", "。"):
        pos = prefix.find(sep)
        if pos >= 8:
            return prefix[: pos + 1].strip()
    return prefix[:48].strip()


def footer_text(locale: EmailLocale | str | None = "en") -> str:
    copy = email_copy(locale)
    resolved = parse_email_locale(locale) or "en"
    support = site_url(resolved, "support")
    contact = site_url(resolved, "contact")
    privacy = site_url(resolved, "privacy")
    home = site_url(resolved)
    return "\n".join(
        [
            copy["footer_donate"],
            support,
            "",
            copy["footer_volunteer"],
            _GITHUB_URL,
            "",
            copy["footer_lex_identity"],
            "",
            copy["footer_disclaimer"],
            "",
            copy["footer_accuracy"],
            contact,
            "",
            copy["footer_tip"],
            "",
            f"{copy['footer_privacy']}: {privacy}",
            f"{copy['footer_contact']}: {contact}",
            f"Website: {home}",
        ]
    ).strip()


def footer_html(locale: EmailLocale | str | None = "en") -> str:
    copy = email_copy(locale)
    resolved = parse_email_locale(locale) or "en"
    support = site_url(resolved, "support")
    contact = site_url(resolved, "contact")
    privacy = site_url(resolved, "privacy")
    home = site_url(resolved)
    donate = _linkify_label(
        copy["footer_donate"],
        copy["footer_donate_link"],
        support,
        _LINK_STYLE,
    )
    volunteer = _linkify_label(
        copy["footer_volunteer"],
        "GitHub",
        _GITHUB_URL,
        _LINK_STYLE,
    )
    accuracy = _linkify_label(
        copy["footer_accuracy"],
        copy["footer_contact_form_link"],
        contact,
        _MUTED_LINK_STYLE,
    )
    tip = _linkify_address(copy["footer_tip"], style=_MUTED_LINK_STYLE)
    return (
        '<div style="font-size:13px;color:#555;font-family:sans-serif;'
        'border-top:1px solid #ddd;padding-top:12px;margin-top:24px">'
        f'<p style="margin:0 0 10px">{_rstrip_colon(donate)}</p>'
        f'<p style="margin:0 0 14px">{_rstrip_colon(volunteer)}</p>'
        f'<p style="margin:0 0 6px;font-size:12px;color:#888">'
        f"{html.escape(copy['footer_lex_identity'])}</p>"
        f'<p style="margin:0 0 6px;font-size:12px;color:#888">'
        f"{html.escape(copy['footer_disclaimer'])}</p>"
        f'<p style="margin:0 0 6px;font-size:12px;color:#888">'
        f"{_rstrip_colon(accuracy)}</p>"
        f'<p style="margin:0 0 6px;font-size:12px;color:#888">'
        f"{tip}</p>"
        f'<p style="margin:0;font-size:12px;color:#888">'
        f'<a href="{html.escape(privacy, quote=True)}" style="{_MUTED_LINK_STYLE}">'
        f"{html.escape(copy['footer_privacy'])}</a> &middot; "
        f'<a href="{html.escape(contact, quote=True)}" style="{_MUTED_LINK_STYLE}">'
        f"{html.escape(copy['footer_contact'])}</a> &middot; "
        f'<a href="{html.escape(home, quote=True)}" style="{_MUTED_LINK_STYLE}">'
        "clarvia.org</a></p>"
        "</div>"
    )


def last_reply_note_html(locale: EmailLocale | str | None = "en") -> str:
    copy = email_copy(locale)
    inner = _linkify_address(copy["last_reply_note"])
    return (
        '<p style="margin:24px 0 0;font-family:sans-serif;font-size:14px;color:#222">'
        f"{inner}</p>"
    )


def last_reply_note(locale: EmailLocale | str | None = "en") -> str:
    return email_copy(locale)["last_reply_note"]


def forbidden_body_fragments() -> tuple[str, ...]:
    fragments = [
        "We're happy to help with anything else",
        "Tip: long conversation threads can become difficult for Lex",
    ]
    keys = (
        "footer_donate",
        "footer_lex_identity",
        "footer_disclaimer",
        "footer_accuracy",
        "footer_tip",
        "last_reply_note",
    )
    seen: set[str] = set()
    for locale in EMAIL_LOCALES:
        copy = email_copy(locale)
        for key in keys:
            value = _field(copy, key).strip()
            snippet = value[:48].strip() if len(value) > 48 else value
            if snippet and snippet not in seen:
                seen.add(snippet)
                fragments.append(snippet)
    return tuple(fragments)


def boilerplate_markers() -> tuple[str, ...]:
    markers = [
        "We're happy to help with anything else.",
        "Clarvia is a nonprofit.",
    ]
    seen = set(markers)
    for locale in EMAIL_LOCALES:
        token = footer_verify_token(locale)
        if token and token not in seen:
            seen.add(token)
            markers.append(token)
        note = email_copy(locale)["last_reply_note"]
        snippet = note[:40].strip()
        if snippet and snippet not in seen:
            seen.add(snippet)
            markers.append(snippet)
    return tuple(markers)


def operational_bodies_end_with_lex() -> bool:
    for locale in EMAIL_LOCALES:
        copy = email_copy(locale)
        for key in _SIGN_OFF_KEYS:
            if not _field(copy, key).rstrip().endswith("Lex."):
                return False
    return True


def _field(copy: EmailCopy, key: str) -> str:
    return str(copy[key])  # type: ignore[literal-required]


def _linkify_label(text: str, label: str, href: str, style: str) -> str:
    escaped = html.escape(text)
    escaped_label = html.escape(label)
    href_attr = html.escape(href, quote=True)
    anchor = f'<a href="{href_attr}" style="{style}">{escaped_label}</a>'
    if escaped_label and escaped_label in escaped:
        return escaped.replace(escaped_label, anchor, 1)
    stripped = _rstrip_colon(escaped)
    return f"{stripped} {anchor}"


def _linkify_address(text: str, *, style: str | None = None) -> str:
    escaped = html.escape(text)
    href = f"mailto:{_LEX_ADDRESS}"
    style_attr = f' style="{style}"' if style else ""
    anchor = f'<a href="{href}"{style_attr}>{_LEX_ADDRESS}</a>'
    if _LEX_ADDRESS in escaped:
        return escaped.replace(_LEX_ADDRESS, anchor, 1)
    return escaped


def _rstrip_colon(value: str) -> str:
    return value[:-1] if value.endswith(":") else value


__all__ = [
    "EMAIL_COPY_KEYS",
    "EMAIL_LOCALES",
    "EmailCopy",
    "EmailLocale",
    "boilerplate_markers",
    "chrome_locale",
    "email_copy",
    "footer_html",
    "footer_text",
    "footer_verify_token",
    "forbidden_body_fragments",
    "inbound_locale",
    "is_email_locale",
    "is_rtl_email_locale",
    "last_reply_note",
    "last_reply_note_html",
    "operational_bodies_end_with_lex",
    "parse_email_locale",
    "site_path_prefix",
    "site_url",
]
