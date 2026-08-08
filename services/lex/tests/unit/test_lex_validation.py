"""Tests for app.llm.validation."""

from __future__ import annotations

import pytest
from app.llm.schema import LexContact, LexSource
from app.llm.validation import LexValidationError, validate_lex_response

from .conftest import make_answer_response, make_decline_response


def _source(source_id: int = 1) -> LexSource:
    return LexSource(
        id=source_id,
        title="Guide",
        publisher="Gov",
        url="https://example.lu",
    )


def _contact(
    contact_id: int = 1, *, source_id: int = 1, name: str = "Office"
) -> LexContact:
    return LexContact(
        id=contact_id,
        name=name,
        kind="authority",
        country_code="LU",
        website="https://example.lu",
        phone=None,
        email=None,
        commercial=False,
        note="A note.",
        source_id=source_id,
    )


def _assert_code(exc: pytest.ExceptionInfo[LexValidationError], code: str) -> None:
    assert exc.value.code == code


def test_valid_answer_passes() -> None:
    validate_lex_response(make_answer_response())


def test_valid_decline_passes() -> None:
    validate_lex_response(make_decline_response())


def test_missing_sign_off() -> None:
    resp = make_answer_response(body_markdown="No sign off here [1].")
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "missing_sign_off")


def test_em_dash_rejected() -> None:
    resp = make_answer_response(body_markdown="Text \u2014 more [1].\n\nLex.")
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "em_dash")


def test_code_fence_rejected() -> None:
    resp = make_answer_response(body_markdown="Text ```code``` [1].\n\nLex.")
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "code_fence")


def test_raw_html_rejected() -> None:
    resp = make_answer_response(body_markdown="Text <div>x</div> [1].\n\nLex.")
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "raw_html")


def test_continuation_in_body_rejected() -> None:
    resp = make_answer_response(
        body_markdown="Just reply to this email for more [1].\n\nLex."
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "continuation_in_body")


def test_footer_in_body_rejected() -> None:
    resp = make_answer_response(
        body_markdown="Clarvia is a nonprofit and more [1].\n\nLex."
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "footer_in_body")


def test_donation_in_body_rejected() -> None:
    resp = make_answer_response(
        body_markdown="Consider making a donation today [1].\n\nLex."
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "donation_in_body")


def test_disclaimer_in_body_rejected() -> None:
    resp = make_answer_response(
        body_markdown="This is not legal advice at all [1].\n\nLex."
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "disclaimer_in_body")


def test_non_contiguous_source_ids() -> None:
    resp = make_answer_response(
        body_markdown="Text [2].\n\nLex.",
        sources=[_source(2)],
        contacts=[_contact(source_id=2, name="Office")],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "non_contiguous_source_ids")


def test_non_contiguous_contact_ids() -> None:
    resp = make_answer_response(
        body_markdown="See Office [1].\n\nLex.",
        sources=[_source(1)],
        contacts=[_contact(contact_id=2, source_id=1, name="Office")],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "non_contiguous_contact_ids")


def test_citation_without_source() -> None:
    resp = make_answer_response(
        body_markdown="Office text [1] and [2].\n\nLex.",
        sources=[_source(1)],
        contacts=[_contact(source_id=1, name="Office")],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "citation_without_source")


def test_uncited_source() -> None:
    resp = make_answer_response(
        body_markdown="Body with no markers.\n\nLex.",
        sources=[_source(1)],
        contacts=[],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "uncited_source")


def test_contact_without_source() -> None:
    resp = make_answer_response(
        body_markdown="See Office [1].\n\nLex.",
        sources=[_source(1)],
        contacts=[_contact(source_id=2, name="Office")],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "contact_without_source")


def test_contact_not_in_body() -> None:
    resp = make_answer_response(
        body_markdown="Body text [1].\n\nLex.",
        sources=[_source(1)],
        contacts=[_contact(source_id=1, name="Missing Org")],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "contact_not_in_body")


def test_answer_research_not_adequate() -> None:
    resp = make_answer_response(research_status="insufficient")
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "answer_research_not_adequate")


def test_answer_without_source() -> None:
    resp = make_answer_response(
        body_markdown="No citations here.\n\nLex.",
        sources=[],
        contacts=[],
        research_status="adequate",
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "answer_without_source")


def test_decline_with_sources() -> None:
    resp = make_decline_response(sources=[_source(1)])
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "decline_with_sources")


def test_decline_with_contacts() -> None:
    resp = make_decline_response(
        body_markdown="See Office here.\n\nLex.",
        contacts=[_contact(source_id=1, name="Office")],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "decline_with_contacts")


def test_answer_without_search_when_evidence_supplied() -> None:
    resp = make_answer_response()
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(
            resp,
            web_search_source_urls=frozenset(),
            web_search_calls=0,
        )
    _assert_code(exc, "answer_without_search")


def test_unsupported_source_url_when_not_in_search_set() -> None:
    resp = make_answer_response(
        sources=[
            LexSource(
                id=1,
                title="Guide",
                publisher="Gov",
                url="https://not-in-search.example",
            )
        ],
        contacts=[],
        body_markdown="Details [1].\n\nLex.",
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(
            resp,
            web_search_source_urls=frozenset({"https://guichet.public.lu"}),
            web_search_calls=1,
        )
    _assert_code(exc, "unsupported_source_url")


def test_provider_neutrality_rejected() -> None:
    resp = make_answer_response(
        body_markdown="We recommend Commune office for families [1].\n\nLex."
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(
            resp,
            web_search_source_urls=frozenset({"https://guichet.public.lu"}),
            web_search_calls=1,
        )
    _assert_code(exc, "provider_not_neutral")


def test_clarify_requires_not_needed_research() -> None:
    resp = make_answer_response(
        action="clarify",
        research_status="adequate",
        body_markdown="Which country was the person living in?\n\nLex.",
        sources=[],
        contacts=[],
    )
    with pytest.raises(LexValidationError) as exc:
        validate_lex_response(resp)
    _assert_code(exc, "clarify_research_not_needed")
