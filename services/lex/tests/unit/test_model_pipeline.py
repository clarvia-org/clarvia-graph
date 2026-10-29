"""Tests for the bounded model pipeline."""

from __future__ import annotations

import logging

import pytest
from app.infrastructure.openai import FakeLlmAdapter, generation_result_from_response
from app.llm.url_normalize import (
    match_search_url,
    normalize_source_url,
    normalize_source_url_set,
    repair_email_domain_typos,
    same_site_host,
    source_dedup_key,
    url_compare_key,
)
from app.llm.validation import LexValidationError, validate_lex_response
from app.services.model_pipeline import ModelPipelineFailure, run_model_pipeline

from .conftest import (
    fake_llm_for_responses,
    make_answer_response,
    make_clarify_response,
)


def test_provider_neutrality_allows_does_not_recommend_disclaimer() -> None:
    response = make_answer_response()
    body = (
        "Lex provides names for orientation. Clarvia does not endorse, "
        "recommend, rank, or have a relationship with the organisations "
        "mentioned. Contact Commune office [1].\n\nLex."
    )
    ok = response.model_copy(update={"body_markdown": body})
    validate_lex_response(
        ok,
        web_search_source_urls=frozenset({"https://guichet.public.lu"}),
        web_search_calls=1,
    )

    with_dash = make_answer_response()
    dashed = with_dash.model_copy(
        update={
            "body_markdown": with_dash.body_markdown.replace(
                "Contact the Commune office",
                "Contact the Commune office\u2014then register",
            )
        }
    )
    llm = FakeLlmAdapter(responses=[generation_result_from_response(dashed)])
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert "\u2014" not in result.response.body_markdown
    assert "Contact the Commune office - then register" in result.response.body_markdown
    validate_lex_response(
        result.response,
        web_search_source_urls=frozenset({"https://guichet.public.lu"}),
        web_search_calls=1,
    )


def test_pipeline_injects_contact_names_missing_from_body() -> None:
    response = make_answer_response()
    # Keep structured contact but remove its name from the body.
    body = response.body_markdown.replace("Commune office", "the local office")
    broken = response.model_copy(update={"body_markdown": body})
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(
            broken,
            web_search_source_urls=frozenset({"https://guichet.public.lu"}),
            web_search_calls=1,
        )
    assert exc.value.code == "contact_not_in_body"

    llm = FakeLlmAdapter(responses=[generation_result_from_response(broken)])
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert "Commune office" in result.response.body_markdown
    validate_lex_response(
        result.response,
        web_search_source_urls=frozenset({"https://guichet.public.lu"}),
        web_search_calls=1,
    )


def test_pipeline_repairs_unsupported_contact_website() -> None:
    response = make_answer_response()
    contact = response.contacts[0].model_copy(
        update={"website": "https://invented-office.example"}
    )
    broken = response.model_copy(update={"contacts": [contact]})
    allowed = frozenset({"https://guichet.public.lu"})
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(
            broken,
            web_search_source_urls=allowed,
            web_search_calls=1,
        )
    assert exc.value.code == "unsupported_contact_website"

    llm = FakeLlmAdapter(
        responses=[generation_result_from_response(broken, source_urls=allowed)]
    )
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert result.response.contacts[0].website == "https://guichet.public.lu"
    validate_lex_response(
        result.response,
        web_search_source_urls=allowed,
        web_search_calls=1,
    )


def test_pipeline_normalizes_em_dash_in_contact_names() -> None:
    response = make_answer_response()
    contact = response.contacts[0].model_copy(update={"name": "Commune\u2014office"})
    body = response.body_markdown.replace("Commune office", "Commune \u2014 office")
    dashed = response.model_copy(update={"body_markdown": body, "contacts": [contact]})
    llm = FakeLlmAdapter(
        responses=[
            generation_result_from_response(
                dashed,
                source_urls=frozenset({"https://guichet.public.lu"}),
            )
        ]
    )
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert "\u2014" not in result.response.body_markdown
    assert "\u2014" not in result.response.contacts[0].name
    assert result.response.contacts[0].name == "Commune - office"
    validate_lex_response(
        result.response,
        web_search_source_urls=frozenset({"https://guichet.public.lu"}),
        web_search_calls=1,
    )

    response = make_answer_response()
    dashed = response.model_copy(
        update={
            "body_markdown": response.body_markdown.replace(
                "Contact the Commune office",
                "Contact the Commune office\u2015then register",
            )
        }
    )
    llm = FakeLlmAdapter(responses=[generation_result_from_response(dashed)])
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert "\u2015" not in result.response.body_markdown
    validate_lex_response(
        result.response,
        web_search_source_urls=frozenset({"https://guichet.public.lu"}),
        web_search_calls=1,
    )


def test_pipeline_retries_once_when_answer_lacks_search() -> None:
    bad = generation_result_from_response(
        make_answer_response(),
        source_urls=frozenset(),
        web_search_calls=0,
    )
    good = generation_result_from_response(make_answer_response())
    llm = FakeLlmAdapter(responses=[bad, good])

    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )

    assert result.web_search_calls == 1
    assert llm.calls[1]["force_web_search"] is True


def test_pipeline_coerces_after_second_failure() -> None:
    bad = generation_result_from_response(
        make_answer_response(),
        source_urls=frozenset(),
        web_search_calls=0,
    )
    llm = FakeLlmAdapter(responses=[bad, bad])

    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )

    assert result.response.action == "clarify"
    assert result.response.body_markdown.strip().endswith("Lex.")
    assert "Commune" in result.response.body_markdown or "commune" in (
        result.response.body_markdown.casefold()
    )


def test_pipeline_demotes_content_quality_failure_to_clarify() -> None:
    response = make_answer_response(
        body_markdown="We recommend Commune office for families [1].\n\nLex."
    )
    bad = generation_result_from_response(response)
    llm = FakeLlmAdapter(responses=[bad, bad])

    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )

    assert result.response.action == "clarify"
    assert result.response.research_status == "not_needed"
    assert result.response.sources == []
    assert result.response.contacts == []
    assert "[1]" not in result.response.body_markdown
    assert "Commune office" in result.response.body_markdown


def test_pipeline_keeps_answer_when_only_research_status_is_wrong() -> None:
    response = make_answer_response(research_status="insufficient")
    result = run_model_pipeline(
        FakeLlmAdapter(responses=[generation_result_from_response(response)] * 2),
        system_prompt="prompt",
        runtime_envelope="envelope",
    )

    assert result.response.action == "answer"
    assert result.response.research_status == "adequate"
    assert result.response.sources


def test_pipeline_does_not_duplicate_crlf_signoff() -> None:
    response = make_answer_response(
        body_markdown=(
            "Contact the Commune office for registration [1].\r\n\r\nLex.\r\n"
        )
    )
    result = run_model_pipeline(
        FakeLlmAdapter(responses=[generation_result_from_response(response)]),
        system_prompt="prompt",
        runtime_envelope="envelope",
    )

    assert result.response.body_markdown.count("Lex.") == 1
    assert "\r" not in result.response.body_markdown


def test_pipeline_fails_after_unusable_generate(
    caplog: pytest.LogCaptureFixture,
) -> None:
    llm = FakeLlmAdapter(default_error=ValueError("missing_structured_output"))

    with (
        caplog.at_level(logging.WARNING),
        pytest.raises(ModelPipelineFailure) as exc,
    ):
        run_model_pipeline(
            llm,
            system_prompt="prompt",
            runtime_envelope="envelope",
        )

    assert exc.value.code == "missing_structured_output"
    assert exc.value.attempt_count == 1
    assert len(llm.calls) == 1
    assert "lex_generate_unusable" in caplog.text
    assert "ValueError" in caplog.text


def test_pipeline_does_not_swallow_provider_outage() -> None:
    class _Upstream(RuntimeError):
        status_code = 503

    llm = FakeLlmAdapter(default_error=_Upstream("unavailable"))

    with pytest.raises(_Upstream):
        run_model_pipeline(
            llm,
            system_prompt="prompt",
            runtime_envelope="envelope",
        )


def test_clarify_without_search_passes_pipeline() -> None:
    llm = fake_llm_for_responses(make_clarify_response())
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert result.response.action == "clarify"
    assert result.web_search_calls == 0


def test_provider_neutrality_rejected() -> None:
    response = make_answer_response(
        body_markdown="We recommend Commune office for families [1].\n\nLex."
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(
            response,
            web_search_source_urls=generation_result_from_response(
                response
            ).web_search_source_urls,
            web_search_calls=1,
        )
    assert exc.value.code == "provider_not_neutral"


def test_pipeline_strips_inline_backticks_and_upgrades_root_citations() -> None:
    assert (
        match_search_url(
            "https://guichet.public.lu/?lang=de",
            [
                "https://guichet.public.lu/?lang=de",
                "https://guichet.public.lu/fr/citoyens/famille/deces.html",
            ],
        )
        == "https://guichet.public.lu/?lang=de"
    )
    assert (
        match_search_url(
            "https://sub.guichet.public.lu/",
            [
                "https://sub.guichet.public.lu/",
                "https://guichet.public.lu/fr/citoyens/famille/deces.html",
            ],
        )
        == "https://sub.guichet.public.lu/"
    )
    assert (
        match_search_url(
            "https://guichet.public.lu/",
            [
                "http://guichet.public.lu/fr/citoyens/famille/deces.html",
                "https://guichet.public.lu/fr/citoyens/famille/deces.html",
            ],
        )
        == "https://guichet.public.lu/fr/citoyens/famille/deces.html"
    )
    assert not same_site_host("", "guichet.public.lu")
    assert normalize_source_url("mailto:lex@clarvia.org") == "mailto:lex@clarvia.org"
    assert (
        normalize_source_url("https://guichet.public.lu:8443/fr/")
        == "https://guichet.public.lu:8443/fr"
    )
    assert normalize_source_url_set({"https://guichet.public.lu/fr/"}) == frozenset(
        {"https://guichet.public.lu/fr"}
    )
    assert url_compare_key("https://guichet.public.lu/fr/") == "guichet.public.lu|/fr|"
    assert match_search_url("", ["https://guichet.public.lu/"]) is None
    assert (
        match_search_url("ftp://guichet.public.lu/", ["https://guichet.public.lu/"])
        is None
    )
    assert match_search_url("https:///path", ["https://guichet.public.lu/"]) is None
    assert (
        match_search_url(
            "https://other.example/page",
            ["https://guichet.public.lu/fr/citoyens/famille/deces.html"],
        )
        is None
    )
    assert (
        match_search_url(
            "https://guichet.public.lu/fr/citoyens/old.html",
            [
                "https://guichet.public.lu/de/buerger/deces.html",
                "https://guichet.public.lu/fr/citoyens/deces.html",
            ],
        )
        == "https://guichet.public.lu/fr/citoyens/deces.html"
    )

    assert (
        match_search_url(
            "https://guichet.public.lu/",
            ["https://guichet.public.lu/fr/citoyens/famille/deces.html"],
        )
        == "https://guichet.public.lu/fr/citoyens/famille/deces.html"
    )
    assert (
        match_search_url(
            "https://guichet.public.lu/",
            [
                "https://guichet.public.lu/",
                "https://guichet.public.lu/fr/a.html",
                "https://guichet.public.lu/fr/b.html",
            ],
        )
        == "https://guichet.public.lu/"
    )
    assert (
        match_search_url(
            "https://guichet.public.lu/fr/a.html",
            ["https://guichet.public.lu/fr/a.html"],
        )
        == "https://guichet.public.lu/fr/a.html"
    )

    response = make_answer_response(
        body_markdown="Contact the `Commune office` using form `E104` [1].\n\nLex."
    )
    llm = FakeLlmAdapter(
        responses=[
            generation_result_from_response(
                response,
                source_urls=frozenset(
                    {"https://guichet.public.lu/fr/citoyens/famille/deces.html"}
                ),
            )
        ]
    )
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert "`" not in result.response.body_markdown
    assert "form E104" in result.response.body_markdown
    assert (
        result.response.sources[0].url
        == "https://guichet.public.lu/fr/citoyens/famille/deces.html"
    )


def test_pipeline_deduplicates_alias_sources_and_repairs_email_typos() -> None:
    assert source_dedup_key("https://justice.gov.uk/a/b") != source_dedup_key(
        "https://justice.uk/a/b"
    )
    assert source_dedup_key("https://guichet.public.lu") == source_dedup_key(
        "https://guichet.public.lu/"
    )
    assert (
        repair_email_domain_typos(
            "info@counseling.co.uk", ["https://counseling.gov.uk/"]
        )
        == "info@counseling.co.uk"
    )
    assert (
        match_search_url(
            "https://doh.gov.ph/permits",
            ["https://djrmh.doh.gov.ph/images/COVID-19/DM2020-0067.pdf"],
        )
        is None
    )
    assert (
        match_search_url(
            "https://doh.gov.ph/",
            ["https://djrmh.doh.gov.ph/images/COVID-19/DM2020-0067.pdf"],
        )
        is None
    )
    assert (
        match_search_url(
            "https://guichet.public.lu/",
            ["https://www.guichet.public.lu/"],
        )
        == "https://www.guichet.public.lu/"
    )

    base = make_answer_response()
    src1 = base.sources[0].model_copy(
        update={
            "id": 1,
            "url": "https://service-public.fr/particuliers/vosdroits/F16507",
        }
    )
    src2 = base.sources[0].model_copy(
        update={
            "id": 2,
            "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F16507",
        }
    )
    contact = base.contacts[0].model_copy(
        update={
            "source_id": 2,
            "website": "https://federation-fnf.fr/mentions-legales",
            "email": "contact@federation-nf.fr",
            "note": "Email contact@federation-nf.fr for directory support.",
        }
    )
    dup_and_typo = base.model_copy(
        update={
            "body_markdown": (
                "Contact the Commune office at contact@federation-nf.fr [1][2].\n\nLex."
            ),
            "sources": [src1, src2],
            "contacts": [contact],
        }
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(dup_and_typo)
    assert exc.value.code == "duplicate_source_url"

    typo_only = dup_and_typo.model_copy(
        update={
            "body_markdown": (
                "Contact the Commune office at contact@federation-nf.fr [1].\n\nLex."
            ),
            "sources": [src1],
            "contacts": [contact.model_copy(update={"source_id": 1})],
        }
    )
    with pytest.raises(LexValidationError) as exc2:
        validate_lex_response(typo_only)
    assert exc2.value.code == "contact_email_domain_typo"

    allowed = frozenset(
        {
            "https://service-public.fr/particuliers/vosdroits/F16507",
            "https://www.service-public.gouv.fr/particuliers/vosdroits/F16507",
            "https://federation-fnf.fr/mentions-legales",
        }
    )
    llm = FakeLlmAdapter(
        responses=[generation_result_from_response(dup_and_typo, source_urls=allowed)]
    )
    result = run_model_pipeline(
        llm,
        system_prompt="prompt",
        runtime_envelope="envelope",
    )
    assert len(result.response.sources) == 1
    assert "[2]" not in result.response.body_markdown
    assert "[1][1]" not in result.response.body_markdown
    assert "contact@federation-fnf.fr" in result.response.body_markdown
    assert "contact@federation-fnf.fr" in result.response.contacts[0].note
    assert result.response.contacts[0].email == "contact@federation-fnf.fr"
    validate_lex_response(
        result.response,
        web_search_source_urls=allowed,
        web_search_calls=1,
    )
    assert (
        result.response.sources[0].url
        == "https://service-public.fr/particuliers/vosdroits/F16507"
    )
