"""Unit tests for research-validation follow-ups (trusted hosts, grounding, IDs)."""

from __future__ import annotations

import pytest
from app.llm.research_schema import ResearchContact, ResearchSource
from app.llm.research_validation import ResearchValidationError, validate_research_brief
from tests.unit.test_two_pass import _brief


def test_trusted_host_allows_language_path_variant() -> None:
    brief = _brief(
        sources=[
            ResearchSource(
                id=1,
                title="Declaring a death (FR)",
                publisher="Guichet.lu",
                url="https://guichet.public.lu/fr/citoyens/famille/deces.html",
            ),
            ResearchSource(
                id=2,
                title="Funeral federation members",
                publisher="FPF",
                url="https://fpf.lu",
            ),
        ],
        contacts=[
            ResearchContact(
                id=1,
                name="Guichet",
                kind="civil_registry",
                country_code="LU",
                website="https://guichet.public.lu",
                phone=None,
                email=None,
                commercial=False,
                note="Official portal",
                source_id=1,
            ),
            ResearchContact(
                id=2,
                name="Funeral directory example A",
                kind="funeral_provider",
                country_code="LU",
                website="https://fpf.lu/members/a",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=2,
            ),
            ResearchContact(
                id=3,
                name="Funeral directory example B",
                kind="funeral_provider",
                country_code="LU",
                website="https://fpf.lu/members/b",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=2,
            ),
        ],
    )
    validate_research_brief(
        brief,
        web_search_source_urls=frozenset(
            {
                "https://guichet.public.lu/en/citoyens/famille/deces.html",
                "https://fpf.lu",
            }
        ),
        web_search_calls=1,
        conversation_text=(
            "My mother is in Haus Omega hospice in Luxembourg with only a few days "
            "remaining. What should we prepare after she dies?"
        ),
    )


def test_untrusted_host_match_rejected() -> None:
    brief = _brief(
        sources=[
            ResearchSource(
                id=1,
                title="Blog post",
                publisher="Medium",
                url="https://medium.com/some-bereavement-post",
            ),
            ResearchSource(
                id=2,
                title="Funeral federation members",
                publisher="FPF",
                url="https://fpf.lu",
            ),
        ]
    )
    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            brief,
            web_search_source_urls=frozenset(
                {"https://medium.com/other-post", "https://fpf.lu"}
            ),
            web_search_calls=1,
            conversation_text=(
                "My mother is in Haus Omega hospice in Luxembourg with only a few days "
                "remaining. What should we prepare after she dies?"
            ),
        )
    assert exc.value.code == "unsupported_source_url"


def test_invented_contact_website_rejected() -> None:
    brief = _brief(
        contacts=[
            ResearchContact(
                id=1,
                name="Random Org",
                kind="support_service",
                country_code="LU",
                website="https://totally-invented-example.xyz",
                phone=None,
                email=None,
                commercial=False,
                note="Invented",
                source_id=1,
            ),
            ResearchContact(
                id=2,
                name="Funeral directory example A",
                kind="funeral_provider",
                country_code="LU",
                website="https://fpf.lu/members/a",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=2,
            ),
            ResearchContact(
                id=3,
                name="Funeral directory example B",
                kind="funeral_provider",
                country_code="LU",
                website="https://fpf.lu/members/b",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=2,
            ),
        ]
    )
    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            brief,
            web_search_source_urls=frozenset(
                {"https://guichet.public.lu", "https://fpf.lu"}
            ),
            web_search_calls=1,
            conversation_text=(
                "My mother is in Haus Omega hospice in Luxembourg with only a few days "
                "remaining. What should we prepare after she dies?"
            ),
        )
    assert exc.value.code == "unsupported_contact_website"


def test_non_english_rejects_material_english_hallucination() -> None:
    conversation = "توفي والدي أمس في مدينة لوكسمبورغ. ما هي الخطوات الإدارية الأولى؟"
    with pytest.raises(ResearchValidationError) as exc:
        validate_research_brief(
            _brief(user_facts=["The family owns a vineyard in Chile"]),
            web_search_source_urls=frozenset(
                {"https://guichet.public.lu", "https://fpf.lu"}
            ),
            web_search_calls=1,
            conversation_text=conversation,
        )
    assert exc.value.code == "user_fact_not_grounded"


def test_non_english_allows_ordinary_english_paraphrase() -> None:
    conversation = "توفي والدي أمس في مدينة لوكسمبورغ. ما هي الخطوات الإدارية الأولى؟"
    validate_research_brief(
        _brief(
            user_facts=[
                "Father died yesterday",
                "Administrative registration question",
            ]
        ),
        web_search_source_urls=frozenset(
            {"https://guichet.public.lu", "https://fpf.lu"}
        ),
        web_search_calls=1,
        conversation_text=conversation,
    )


def test_non_contiguous_ids_are_renumbered() -> None:
    brief = _brief(
        sources=[
            ResearchSource(
                id=4,
                title="Declaring a death",
                publisher="Guichet.lu",
                url="https://guichet.public.lu",
            ),
            ResearchSource(
                id=7,
                title="Funeral federation members",
                publisher="FPF",
                url="https://fpf.lu",
            ),
        ],
        contacts=[
            ResearchContact(
                id=9,
                name="Guichet",
                kind="civil_registry",
                country_code="LU",
                website="https://guichet.public.lu",
                phone=None,
                email=None,
                commercial=False,
                note="Official",
                source_id=4,
            ),
            ResearchContact(
                id=2,
                name="Funeral directory example A",
                kind="funeral_provider",
                country_code="LU",
                website="https://fpf.lu/members/a",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=7,
            ),
            ResearchContact(
                id=3,
                name="Funeral directory example B",
                kind="funeral_provider",
                country_code="LU",
                website="https://fpf.lu/members/b",
                phone=None,
                email=None,
                commercial=True,
                note="Orientation only",
                source_id=7,
            ),
        ],
    )
    validate_research_brief(
        brief,
        web_search_source_urls=frozenset(
            {"https://guichet.public.lu", "https://fpf.lu"}
        ),
        web_search_calls=1,
        conversation_text=(
            "My mother is in Haus Omega hospice in Luxembourg with only a few days "
            "remaining. What should we prepare after she dies?"
        ),
    )
    assert [source.id for source in brief.sources] == [1, 2]
    assert [contact.id for contact in brief.contacts] == [1, 2, 3]
    assert brief.contacts[0].source_id == 1
    assert brief.contacts[1].source_id == 2
    assert [action.id for action in brief.immediate_actions] == ["A1", "A2", "A3"]
