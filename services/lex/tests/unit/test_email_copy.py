"""Tests for locale-aware Lex email chrome."""

from __future__ import annotations

from app.email.composition import compose_lex_email, validate_response_body
from app.email.copy import (
    EMAIL_COPY_KEYS,
    EMAIL_LOCALES,
    chrome_locale,
    email_copy,
    footer_html,
    footer_text,
    footer_verify_token,
    inbound_locale,
    is_rtl_email_locale,
    operational_bodies_end_with_lex,
    parse_email_locale,
    site_path_prefix,
    site_url,
)
from app.llm.source_render import insert_sources_before_signoff, render_sources_block

from .conftest import make_answer_response

_SIGN_OFF_KEYS = (
    "thread_closed",
    "rate_limit_body",
    "recipient_limit_body",
    "attachment_only_body",
    "technical_failure_body",
    "temporary_unavailability_body",
)

_KEEP_EXACT = (
    "Clarvia",
    "Lex",
    "lex@clarvia.org",
    "clarvia.org",
    "GitHub",
)


def _alternatives(message):  # type: ignore[no-untyped-def]
    plain = html = ""
    for part in message.iter_parts():
        if part.get_content_type() == "text/plain":
            plain = part.get_content()
        elif part.get_content_type() == "text/html":
            html = part.get_content()
    return plain, html


def test_catalog_is_complete_for_every_locale() -> None:
    english_keys = list(EMAIL_COPY_KEYS)
    for locale in EMAIL_LOCALES:
        bundle = email_copy(locale)
        assert sorted(bundle) == sorted(english_keys)
        for key in english_keys:
            assert bundle[key].strip(), f"{locale}.{key}"  # type: ignore[literal-required]


def test_operational_bodies_keep_lex_signoff() -> None:
    assert operational_bodies_end_with_lex()
    for locale in EMAIL_LOCALES:
        copy = email_copy(locale)
        for key in _SIGN_OFF_KEYS:
            body = copy[key]  # type: ignore[literal-required]
            assert validate_response_body(body).endswith("Lex.")


def test_placeholders_and_do_not_translate() -> None:
    for locale in EMAIL_LOCALES:
        copy = email_copy(locale)
        assert "{date}" in copy["wrote_dated"]
        assert "{label}" in copy["wrote_dated"]
        assert "{label}" in copy["wrote"]
        for token in _KEEP_EXACT:
            if token in email_copy("en")["footer_tip"]:
                assert token in copy["footer_tip"]
        assert "lex@clarvia.org" in copy["footer_tip"]
        assert "lex@clarvia.org" in copy["last_reply_note"]
        assert "Lex." in copy["thread_closed"]
        assert "GitHub" in copy["footer_volunteer"]
        assert "clarvia.org" in copy["ask_subject"]
        assert "Lex" in copy["from_name"]
        assert "Clarvia" in copy["from_name"]
        assert "<" not in copy["footer_donate"]
        assert "<a " not in copy["footer_tip"]


def test_ukrainian_is_not_russian() -> None:
    assert email_copy("uk")["footer_donate"] != email_copy("ru")["footer_donate"]
    assert email_copy("uk")["ask_subject"] != email_copy("ru")["ask_subject"]


def test_parse_email_locale_aliases() -> None:
    assert parse_email_locale("fr-FR") == "fr"
    assert parse_email_locale("lu") == "lb"
    assert parse_email_locale("pt-PT") == "pt"
    assert parse_email_locale("zh") is None
    assert inbound_locale(None) == "en"
    assert chrome_locale("nl-NL", "fr") == "nl"
    assert chrome_locale("zh", "ar") == "ar"
    assert chrome_locale(None, None) == "en"
    assert is_rtl_email_locale("ar")
    assert not is_rtl_email_locale("fr")


def test_site_paths_follow_translated_site_prefixes() -> None:
    assert site_path_prefix("fr") == "fr"
    assert site_path_prefix("de") == "de"
    assert site_path_prefix("lb") == "lu"
    assert site_path_prefix("nl") == "en"
    assert site_url("fr", "support") == "https://clarvia.org/fr/support"
    assert site_url("lb", "privacy") == "https://clarvia.org/lu/privacy"
    assert site_url("ar") == "https://clarvia.org/en"


def test_french_footer_uses_fr_links_and_token() -> None:
    token = footer_verify_token("fr")
    text = footer_text("fr")
    html = footer_html("fr")
    assert token in text
    assert token in html
    assert "https://clarvia.org/fr/support" in text
    assert "https://clarvia.org/fr/support" in html
    assert "Clarvia est une organisation à but non lucratif." in text
    assert html.count(token) == 1


def test_compose_french_chrome() -> None:
    message = compose_lex_email(
        response_body_markdown="Contactez la commune.\n\nLex.",
        to_addresses=["user@example.com"],
        cc_addresses=[],
        subject="Re: question",
        outbound_message_id="<out@clarvia.org>",
        in_reply_to="<in@example.com>",
        references=[],
        request_id="req",
        prompt_version="lex-v1",
        locale="fr",
    )
    assert message["X-Lex-Locale"] == "fr"
    assert "Lex de Clarvia" in message["From"]
    plain, html = _alternatives(message)
    token = footer_verify_token("fr")
    assert plain.count(token) == 1
    assert html.count(token) == 1
    assert 'lang="fr"' in html
    assert 'dir="ltr"' in html
    assert "https://clarvia.org/fr/support" in html
    assert "Clarvia is a nonprofit." not in plain


def test_compose_arabic_sets_rtl() -> None:
    message = compose_lex_email(
        response_body_markdown="تواصل مع البلدية.\n\nLex.",
        to_addresses=["user@example.com"],
        cc_addresses=[],
        subject="Re: question",
        outbound_message_id="<out@clarvia.org>",
        in_reply_to="<in@example.com>",
        references=[],
        request_id="req",
        prompt_version="lex-v1",
        locale="ar",
    )
    _plain, html = _alternatives(message)
    assert message["X-Lex-Locale"] == "ar"
    assert 'lang="ar"' in html
    assert 'dir="rtl"' in html
    assert footer_verify_token("ar") in html


def test_sources_heading_follows_response_language() -> None:
    response = make_answer_response(language="fr")
    block = render_sources_block(response)
    assert block.startswith(email_copy("fr")["sources_checked"])
    rendered = insert_sources_before_signoff(
        "Contactez la commune [1].\n\nLex.",
        response,
    )
    assert email_copy("fr")["sources_checked"] in rendered
    assert "Sources checked:" not in rendered
