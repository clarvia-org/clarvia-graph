"""Unit tests for the deterministic inbound-vs-response language guard."""

from __future__ import annotations

import unicodedata

import pytest
from app.domain.models import ConversationMessage, ConversationRole
from app.llm.language import (
    detect_language,
    detect_prose_language,
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
        "پدرم دیروز در تهران فوت کرد. چه مدارکی برای گواهی فوت لازم است؟",
        "میرے والد کا کل انتقال ہو گیا۔ ڈیتھ سرٹیفکیٹ کے لیے کیا دستاویزات چاہئیں؟",
        "Баща ми почина вчера в София. Какви документи са необходими за наследството?",
        "Баща ми почина вчера в България. Какви документи трябват за смъртния акт?",
        "Менің әкем кеше қайтыс болды. Қандай құжаттар қажет?",
        "Min mor døde igår. Hvad skal vi gøre nu?",
        "Min mor døde i går. Hva må vi gjøre nå?",
        (
            "Съпругът ми почина вчера в Пловдив и искам да знам как да "
            "получа документ от общината за пенсия."
        ),
        (
            "Майка ми е в тежко състояние в болница в София и не знам как "
            "и от къде да взема документи."
        ),
        (
            "Баща ми е с тежко заболяване и живее в София. Как да уредим "
            "пълномощно и документи?"
        ),
        (
            "Min mor har alvorlig sykdom i Bergen og vi trenger hjelp med "
            "testamente og arv."
        ),
        (
            "Min far og min mor har brug for oplysninger om arv og testamente "
            "i Odense."
        ),
    ],
)
def test_detect_language_abstains_on_short_ambiguous_or_unsupported(
    sample: str,
) -> None:
    assert detect_language(sample) is None
    assert (
        detect_language(
            "Min mor har avlidit i Sverige och vi behöver veta vilka handlingar "
            "som krävs."
        )
        == "sv"
    )


@pytest.mark.parametrize(
    ("expected", "sample"),
    [
        (
            "fr",
            "En cas de décès en France, quelle autorité contacter auprès de la "
            "mairie de Bordeaux?",
        ),
        (
            "fr",
            "Suite à la perte de mon parent en France, quels actes de décès "
            "obtenir de la mairie de Nice?",
        ),
        (
            "fr",
            "Quels documents demander à la mairie de Marseille en cas de décès "
            "d'un parent ?",
        ),
        (
            "it",
            "Mia sorella vive a Milano e lavora a Torino e ha bisogno a casa "
            "a Roma.",
        ),
        (
            "it",
            "Occorre andare a parlare a Roma e portare documenti a ufficio "
            "anagrafe e banca.",
        ),
    ],
)
def test_detect_language_handles_romance_shared_prepositions(
    expected: str, sample: str
) -> None:
    assert detect_language(sample) == expected


def test_detect_language_handles_nfd_and_turkish_dotted_i() -> None:
    french = "Ma mère est décédée hier à Paris et je dois déclarer son décès."
    french_steps = (
        "Ma mère est décédée récemment. Quelles démarches pour le certificat de décès?"
    )
    romanian = "Tatăl meu a decedat ieri și nu știu ce documente sunt necesare."
    assert detect_language(unicodedata.normalize("NFD", french)) == "fr"
    assert detect_language(unicodedata.normalize("NFD", french_steps)) == "fr"
    assert detect_language(unicodedata.normalize("NFD", romanian)) == "ro"
    assert (
        detect_language(
            "İyi günler. Ölüm belgesi İçin ve İle ilgili bilgi almak istiyorum."
        )
        == "tr"
    )


def test_detect_prose_language_strips_foreign_authority_names() -> None:
    concise_english_samples = [
        (
            "Contact Administration communale de la Ville de Luxembourg "
            "(Service de la population) and Ministère de la Justice for the "
            "Acte de décès [1].\n\nLex."
        ),
        (
            "Notify Conservatória do Registo Civil de Lisboa, Segurança Social, "
            "Instituto dos Registos e do Notariado, and Autoridade Tributária "
            "[1].\n\nLex."
        ),
        (
            "Contact Comune di Roma, Agenzia delle Entrate, Istituto Nazionale "
            "della Previdenza Sociale (INPS), and Ministero della Giustizia "
            "[1].\n\nLex."
        ),
        (
            "Steps in Germany:\n"
            "- Standesamt der Stadt Berlin\n"
            "- Amtsgericht der Stadt\n"
            "- Bundesministerium der Justiz und des Innern [1]\n\nLex."
        ),
        (
            "In Luxembourg, contact:\n"
            "- Service de l'état civil de la commune\n"
            "- Caisse nationale de santé (CNS)\n"
            "- Caisse nationale d'assurance pension (CNAP)\n"
            "- Administration de l'enregistrement, des domaines et de la TVA "
            "[1]\n\nLex."
        ),
        (
            "In France, contact:\n"
            "- Service de l'état civil de la mairie\n"
            "- Caisse nationale d'assurance vieillesse (CNAV)\n"
            "- Caisse primaire d'assurance maladie (CPAM)\n"
            "- Direction générale des finances publiques (DGFiP) [1]\n\nLex."
        ),
        (
            "In Spain, contact:\n"
            "- Registro Civil (certificado literal de defunción)\n"
            "- Ministerio de Justicia (Certificado de Actos de Última "
            "Voluntad)\n"
            "- Agencia Estatal de Administración Tributaria (AEAT)\n"
            "- Instituto Nacional de la Seguridad Social (INSS) [1]\n\nLex."
        ),
        (
            "In Portugal, contact:\n"
            "- Conservatória do Registo Civil (certidão de óbito)\n"
            "- Instituto dos Registos e do Notariado (IRN)\n"
            "- Segurança Social\n"
            "- Autoridade Tributária e Aduaneira [1]\n\nLex."
        ),
        (
            "In Italy, contact:\n"
            "- Ufficio di stato civile del comune (certificato di morte)\n"
            "- Agenzia delle Entrate\n"
            "- Istituto Nazionale della Previdenza Sociale (INPS)\n"
            "- Ministero degli Affari Esteri [1]\n\nLex."
        ),
    ]
    for sample in concise_english_samples:
        assert detect_prose_language(sample) in {None, "en"}

    assert (
        detect_prose_language(
            "Schritte in Deutschland:\n"
            "- Standesamt der Stadt München kontaktieren\n"
            "- Sterbeurkunde und Geburtsurkunde beim Amt anfordern\n"
            "- Nachlassgericht und Krankenkasse informieren [1]\n\nLex."
        )
        == "de"
    )
    assert (
        detect_prose_language(
            "Kontaktéiert d'Gemeng zu Lëtzebuerg fir den Doudesakt unzefroen "
            "a mellt den Doudesfall bannent 24 Stonnen [1].\n\nLex."
        )
        == "lb"
    )

    assert (
        detect_prose_language(
            "Debe acudir al Registro Civil de Madrid para solicitar el "
            "certificado literal de defunción [1].\n\nLex."
        )
        == "es"
    )
    assert (
        detect_prose_language(
            "Vous devez contacter la mairie de votre commune en France pour "
            "obtenir l'acte de décès [1].\n\nLex."
        )
        == "fr"
    )
    assert (
        detect_prose_language(
            "Sie müssen beim Standesamt der Stadt Berlin einen Antrag stellen "
            "und die Sterbeurkunde abholen [1].\n\nLex."
        )
        == "de"
    )


@pytest.mark.parametrize(
    "sample",
    [
        "My father died in Mexico. Please reply in Spanish.",
        "My father died in Tokyo. Please reply in Japanese.",
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
        (
            "L'acte de décès est écrit en espagnol et nécessite une "
            "apostille. Que dois-je faire ?"
        ),
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
