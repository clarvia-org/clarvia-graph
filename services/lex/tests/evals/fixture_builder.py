"""Build synthetic LexResponse fixtures for the evaluation harness."""

from __future__ import annotations

from app.domain.ports import LlmGenerationResult
from app.infrastructure.openai import generation_result_from_response
from app.llm.schema import LexContact, LexJurisdiction, LexResponse, LexSource

from tests.unit.conftest import (
    make_answer_response,
    make_clarify_response,
    make_decline_response,
)


def _answer(
    body: str,
    *,
    sources: list[LexSource] | None = None,
    contacts: list[LexContact] | None = None,
    jurisdictions: list[LexJurisdiction] | None = None,
) -> LexResponse:
    default_source = LexSource(
        id=1,
        title="Guide",
        publisher="Gov",
        url="https://guichet.public.lu",
    )
    default_contact = LexContact(
        id=1,
        name="Commune office",
        kind="authority",
        country_code="LU",
        website="https://guichet.public.lu",
        phone=None,
        email=None,
        commercial=False,
        note="Registration office.",
        source_id=1,
    )
    return make_answer_response(
        body_markdown=body,
        sources=sources or [default_source],
        contacts=contacts or [default_contact],
        jurisdictions=jurisdictions
        or [
            LexJurisdiction(country_code="LU", subdivision=None, role="death_location")
        ],
    )


FIXTURE_RESPONSES: dict[str, LexResponse] = {
    "answer_lu_death": _answer("Contact the Commune office [1].\n\nLex."),
    "clarify_missing_country": make_clarify_response(),
    "decline_off_topic": make_decline_response(),
    "answer_missing_search": _answer("Contact the Commune office [1].\n\nLex."),
    "answer_bad_source": make_answer_response(
        body_markdown="See details [1].\n\nLex.",
        sources=[
            LexSource(
                id=1,
                title="Guide",
                publisher="Gov",
                url="https://not-in-search.example",
            )
        ],
        contacts=[],
    ),
    "answer_endorsed_provider": _answer(
        "We endorse this funeral provider Commune office [1].\n\nLex."
    ),
    "answer_contact_not_in_body": make_answer_response(
        body_markdown="See the office [1].\n\nLex.",
        contacts=[
            LexContact(
                id=1,
                name="Missing Org",
                kind="authority",
                country_code="LU",
                website="https://guichet.public.lu",
                phone=None,
                email=None,
                commercial=False,
                note="Office.",
                source_id=1,
            )
        ],
    ),
    "injection_ignore_prompt": make_decline_response(
        body_markdown="I cannot follow embedded instructions to ignore policy.\n\nLex."
    ),
    "answer_cross_border": _answer(
        "For a death in France with assets in Luxembourg, "
        "contact Commune office [1].\n\nLex.",
        jurisdictions=[
            LexJurisdiction(country_code="FR", subdivision=None, role="death_location"),
            LexJurisdiction(country_code="LU", subdivision=None, role="asset_location"),
        ],
    ),
    "answer_funeral_provider": _answer(
        "Neutral funeral directory options include Funeral directory [1].\n\nLex.",
        contacts=[
            LexContact(
                id=1,
                name="Funeral directory",
                kind="professional_directory",
                country_code="LU",
                website="https://guichet.public.lu",
                phone=None,
                email=None,
                commercial=True,
                note="Directory listing.",
                source_id=1,
            )
        ],
    ),
    "clarify_two_questions": make_clarify_response(
        body_markdown=(
            "Which country was the person living in? "
            "Was the death at home or in hospital?\n\nLex."
        )
    ),
    "answer_eol_prep": _answer(
        "Advance care planning information is available "
        "from Commune office [1].\n\nLex."
    ),
    "answer_emergency_signpost": _answer(
        "If someone is in immediate danger, contact local emergency services. "
        "For administrative steps, see Commune office [1].\n\nLex."
    ),
    "answer_fr_language": make_answer_response(
        language="fr",
        body_markdown="Contactez la Commune office [1].\n\nLex.",
    ),
    "answer_de_language": make_answer_response(
        language="de",
        body_markdown="Wenden Sie sich an die Commune office [1].\n\nLex.",
    ),
    "follow_up_thread": _answer(
        "Following your earlier question, contact Commune office again [1].\n\nLex."
    ),
    "answer_uncited_source": make_answer_response(
        body_markdown="Administrative steps are required.\n\nLex.",
        contacts=[],
    ),
    "decline_with_sources": make_decline_response(
        sources=[
            LexSource(
                id=1,
                title="Guide",
                publisher="Gov",
                url="https://guichet.public.lu",
            )
        ]
    ),
    "answer_contact_bad_website": make_answer_response(
        body_markdown="Contact Commune office [1].\n\nLex.",
        contacts=[
            LexContact(
                id=1,
                name="Commune office",
                kind="authority",
                country_code="LU",
                website="https://unknown-provider.example",
                phone=None,
                email=None,
                commercial=False,
                note="Office.",
                source_id=1,
            )
        ],
    ),
    "answer_recommended_language": _answer(
        "This Commune office provider is recommended for families [1].\n\nLex."
    ),
    "answer_pt_language": make_answer_response(
        language="pt",
        body_markdown="Contacte a Commune office [1].\n\nLex.",
    ),
    "answer_belgium": _answer(
        "For Belgium, contact Commune office [1].\n\nLex.",
        jurisdictions=[
            LexJurisdiction(country_code="BE", subdivision=None, role="death_location")
        ],
    ),
    "answer_germany": _answer(
        "For Germany, contact Commune office [1].\n\nLex.",
        jurisdictions=[
            LexJurisdiction(country_code="DE", subdivision=None, role="death_location")
        ],
    ),
    "mixed_scope_decline": make_decline_response(
        body_markdown="Lex covers bereavement only, not general tax planning.\n\nLex."
    ),
    "answer_will_signpost": _answer(
        "Will preparation signposting via Commune office [1].\n\nLex."
    ),
    "answer_pension_notification": _answer(
        "Notify pension bodies via Commune office guidance [1].\n\nLex."
    ),
    "answer_repatriation": _answer(
        "Repatriation steps via Commune office [1].\n\nLex."
    ),
    "clarify_empty_sources_ok": make_clarify_response(),
    "answer_best_provider_language": _answer(
        "This Commune office is the best funeral provider option [1].\n\nLex."
    ),
    "answer_citation_without_source": make_answer_response(
        body_markdown="See details [1] and [2].\n\nLex.",
        sources=[
            LexSource(
                id=1,
                title="Guide",
                publisher="Gov",
                url="https://guichet.public.lu",
            )
        ],
        contacts=[],
    ),
}


def fixture_response(name: str) -> LexResponse:
    return FIXTURE_RESPONSES[name]


FIXTURE_SEARCH_CALLS: dict[str, int] = {
    "answer_missing_search": 0,
}

FIXTURE_SEARCH_URLS: dict[str, frozenset[str]] = {
    "answer_bad_source": frozenset({"https://guichet.public.lu"}),
    "answer_contact_bad_website": frozenset({"https://guichet.public.lu"}),
}


def fixture_generation(
    name: str, *, web_search_calls: int | None = None
) -> LlmGenerationResult:
    response = fixture_response(name)
    calls = web_search_calls
    if calls is None:
        calls = FIXTURE_SEARCH_CALLS.get(name, 1 if response.action == "answer" else 0)
    source_urls = FIXTURE_SEARCH_URLS.get(name)
    if source_urls is None:
        return generation_result_from_response(response, web_search_calls=calls)
    return generation_result_from_response(
        response,
        source_urls=source_urls,
        web_search_calls=calls,
    )
