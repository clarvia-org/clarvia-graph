"""Tests for the bounded model pipeline."""

from __future__ import annotations

import logging

import pytest
from app.infrastructure.openai import FakeLlmAdapter, generation_result_from_response
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
    assert "\u2014" in result.response.body_markdown
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


def test_pipeline_preserves_em_dash_in_contact_names() -> None:
    response = make_answer_response()
    contact = response.contacts[0].model_copy(update={"name": "Commune\u2014office"})
    body = response.body_markdown.replace("Commune office", "Commune\u2014office")
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
    assert "\u2014" in result.response.body_markdown
    assert "\u2014" in result.response.contacts[0].name
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
