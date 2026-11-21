"""Unit tests for the deterministic inbound-vs-response language guard."""

from __future__ import annotations

import pytest
from app.domain.models import ConversationMessage, ConversationRole
from app.llm.language import (
    detect_language,
    has_explicit_language_request,
    normalize_language_code,
    resolve_expected_reply_language,
)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("en-US", "en"),
        ("pt_BR", "pt"),
        ("es-419", "es"),
        ("lu", "lb"),
        ("LU-LU", "lb"),
        ("ltz", "lb"),
        ("  FR  ", "fr"),
        ("eng", "en"),
        ("", None),
        ("   ", None),
        (None, None),
        ("??", None),
        ("1234", None),
    ],
)
def test_normalize_language_code(raw: str | None, expected: str | None) -> None:
    assert normalize_language_code(raw) == expected


@pytest.mark.parametrize(
    ("expected", "sample"),
    [
        (
            "en",
            "My father died yesterday in Luxembourg and I need the death certificate.",
        ),
        (
            "fr",
            "Ma mère est décédée hier à Paris et je dois déclarer son décès.",
        ),
        (
            "de",
            "Mein Vater ist gestern in Berlin gestorben und ich brauche Hilfe.",
        ),
        (
            "es",
            "Mi madre falleció ayer en Madrid y necesito el certificado de defunción.",
        ),
        (
            "pt",
            "O meu pai faleceu ontem em Lisboa e não sei o que devo fazer.",
        ),
        (
            "it",
            "Mia madre è deceduta ieri a Roma e devo richiedere il certificato.",
        ),
        (
            "nl",
            "Mijn vader is gisteren overleden en ik moet de akte aanvragen.",
        ),
        (
            "pl",
            "Mój ojciec zmarł wczoraj w Warszawie i nie wiem, co muszę zrobić.",
        ),
        (
            "ro",
            "Tatăl meu a decedat ieri și nu știu ce documente sunt necesare.",
        ),
        (
            "tr",
            "Babam dün İstanbul'da vefat etti ve ölüm belgesi için ne yapmalıyım?",
        ),
        (
            "lb",
            "Meng Mamm ass gëschter zu Lëtzebuerg gestuerwen. Wat muss ech maachen?",
        ),
        (
            "fi",
            "Isäni kuoli eilen ja minun täytyy hakea virallinen kuolintodistus.",
        ),
        (
            "sv",
            "Min mamma dog igår och jag behöver veta vilka dokument som krävs.",
        ),
        (
            "ar",
            "توفي والدي أمس وأحتاج إلى معرفة الإجراءات القانونية لشهادة الوفاة.",
        ),
        (
            "uk",
            "Мій батько помер учора, і мені потрібно отримати свідоцтво про смерть.",
        ),
        (
            "ru",
            "Мой отец умер вчера, и мне нужно получить свидетельство о смерти.",
        ),
    ],
)
def test_detect_language_supports_all_sixteen_languages(
    expected: str, sample: str
) -> None:
    assert detect_language(sample) == expected


def test_detect_language_cross_border_english_stays_english() -> None:
    cross_border = (
        "My mother died in Mexico City last week and her spouse lives in "
        "Guadalajara. What death certificate, apostille, and bank inheritance "
        "paperwork do we need? See https://www.gob.mx/sre/documentos"
    )
    polish_cities = (
        "My father passed away in Łódź, Poland yesterday. What documents "
        "do we need from Gdańsk and Kraków for the estate?"
    )
    assert detect_language(cross_border) == "en"
    assert detect_language(polish_cities) == "en"


@pytest.mark.parametrize(
    "sample",
    [
        "",
        "Hello",
        "Ciao come stai oggi amico",
        "a b c d e f",
        "Merci pour votre aide.",
        "Thanks see https://www.gob.mx/sre/tramites/certificado",
        (
            "My father died last week in Spain and I need help. "
            "Mi padre falleció la semana pasada en España y necesito ayuda."
        ),
        "Ο πατέρας μου πέθανε χθες στην Ελλάδα και χρειάζομαι βοήθεια.",
        "私の父は昨日東京で亡くなりました。手続きを教えてください。",
        "Мој отац је умро јуче и потребно ми је упутство за документацију.",
        "Potřebuji poradit s úmrtním listem v Praze pro dědice.",
        "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do.",
    ],
)
def test_detect_language_abstains_on_short_ambiguous_or_unsupported(
    sample: str,
) -> None:
    assert detect_language(sample) is None


@pytest.mark.parametrize(
    "sample",
    [
        "My father died in Mexico. Please reply in Spanish.",
        "Please write your answer in German.",
        "Could you answer me in French?",
        "Preferred language: Portuguese",
        "Répondez-moi en français s'il vous plaît.",
        "Bitte antworten Sie mir auf Englisch.",
        "Por favor responda en inglés.",
        "Por favor responda em inglês.",
    ],
)
def test_has_explicit_language_request_positive(sample: str) -> None:
    assert has_explicit_language_request(sample) is True


@pytest.mark.parametrize(
    "sample",
    [
        "",
        "Civil death registration in United States",
        "My mother died in Spain and owned property in Portugal.",
        (
            "The death certificate is written in Spanish and needs an apostille "
            "in Mexico."
        ),
        "We need to contact the consulate in France about the certificate.",
    ],
)
def test_has_explicit_language_request_negative(sample: str) -> None:
    assert has_explicit_language_request(sample) is False


def test_resolve_expected_reply_language_latest_and_history_precedence() -> None:
    history_fr = [
        ConversationMessage(
            role=ConversationRole.USER,
            text="Ma mère est décédée hier à Lyon. Que dois-je faire ?",
        ),
        ConversationMessage(
            role=ConversationRole.ASSISTANT,
            text="Voici les premières démarches auprès de la mairie.",
        ),
    ]
    assert resolve_expected_reply_language("Thank you, noted.", history_fr) == "fr"

    english_follow_up = (
        "Actually I will ask my follow-up question in English instead. What next?"
    )
    assert resolve_expected_reply_language(english_follow_up, history_fr) == "en"

    explicit_switch = "My father died in Spain. Please reply in Spanish."
    assert resolve_expected_reply_language(explicit_switch, history_fr) is None

    prior_explicit_history = [
        ConversationMessage(
            role=ConversationRole.USER,
            text="My father died in Spain. Please reply in Spanish.",
        ),
        ConversationMessage(
            role=ConversationRole.ASSISTANT,
            text="Debe solicitar el certificado literal de defunción.",
        ),
    ]
    assert resolve_expected_reply_language("Gracias.", prior_explicit_history) is None

    drifted_assistant_history = [
        ConversationMessage(
            role=ConversationRole.USER,
            text="My mother died in Mexico and I need to know the first steps.",
        ),
        ConversationMessage(
            role=ConversationRole.ASSISTANT,
            text="Debe solicitar el certificado de defunción ante el registro civil.",
        ),
    ]
    assert (
        resolve_expected_reply_language("Thanks, what next?", drifted_assistant_history)
        == "en"
    )

    assistant_only_history = [
        ConversationMessage(role=ConversationRole.USER, text="Help?"),
        ConversationMessage(
            role=ConversationRole.ASSISTANT,
            text="Bitte senden Sie uns noch mehr Details zum Todesfall.",
        ),
    ]
    assert resolve_expected_reply_language("Okay.", assistant_only_history) == "de"
    assert resolve_expected_reply_language("Okay.", []) is None
