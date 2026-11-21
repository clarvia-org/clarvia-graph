"""Deterministic inbound-vs-response language guard helpers.

Provides zero-dependency language normalization, explicit reply-language
request detection, script/stopword-based language detection across Lex's
supported languages, and thread-aware expected reply language resolution.
"""

from __future__ import annotations

import re
from collections.abc import Sequence

from app.domain.models import ConversationMessage, ConversationRole

_LANGUAGE_ALIASES: dict[str, str] = {
    "lu": "lb",
    "ltz": "lb",
    "in": "id",
    "iw": "he",
    "eng": "en",
    "fra": "fr",
    "fre": "fr",
    "deu": "de",
    "ger": "de",
    "spa": "es",
    "por": "pt",
    "ita": "it",
    "nld": "nl",
    "dut": "nl",
    "pol": "pl",
    "ron": "ro",
    "rum": "ro",
    "tur": "tr",
    "fin": "fi",
    "swe": "sv",
    "ara": "ar",
    "ukr": "uk",
    "rus": "ru",
}

_PRIMARY_SUBTAG_RE = re.compile(r"^[a-z]{2,3}$")
_URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b", re.IGNORECASE)
_CITATION_RE = re.compile(r"\[\d+\]")
_WORD_RE = re.compile(r"[^\W\d_]+", re.UNICODE)

_MIN_TOKENS = 6
_MIN_ALPHA_CHARS = 20
_MIN_SCRIPT_RATIO = 0.6
_MIN_LATIN_DENSITY = 0.15
_MIN_LATIN_HITS = 2
_MIN_LATIN_SCORE = 6
_MIN_SCORE_GAP = 5
_MIN_SCORE_MARGIN_RATIO = 0.35

_LANG_NAMES_PATTERN = (
    r"(?:english|french|german|spanish|portuguese|italian|dutch|polish|"
    r"romanian|turkish|ukrainian|russian|arabic|luxembourgish|finnish|swedish|"
    r"anglais|français|francais|allemand|espagnol|portugais|italien|"
    r"néerlandais|neerlandais|polonais|roumain|turc|ukrainien|russe|arabe|"
    r"luxembourgeois|finnois|suédois|suedois|"
    r"englisch|französisch|franzosisch|deutsch|spanisch|portugiesisch|"
    r"italienisch|niederländisch|niederlandisch|holländisch|polnisch|"
    r"rumänisch|rumanisch|türkisch|turkisch|ukrainisch|russisch|arabisch|"
    r"luxemburgisch|finnisch|schwedisch|"
    r"inglés|ingles|francés|frances|alemán|aleman|español|espanol|"
    r"portugués|portugues|italiano|neerlandés|holandés|polaco|rumano|"
    r"turco|ucraniano|ruso|árabe|arabe|luxemburgués|finlandés|sueco|"
    r"inglês|francês|alemão|espanhol|português|holandês|polonês|romeno|"
    r"inglese|francese|tedesco|spagnolo|portoghese|olandese|polacco|"
    r"rumeno|rumena|russo|ucraino|arabo|lussemburghese|"
    r"engels|frans|duits|spaans|portugees|italiaans|nederlands|pools|"
    r"roemeens|turks|oekraïens|russisch|arabisch|luxemburgs|fins|zweeds|"
    r"angielski|angielsku|francuski|francusku|niemiecki|niemiecku|"
    r"hiszpański|hiszpańsku|portugalski|włoski|włosku|holenderski|"
    r"polski|polsku|rumuński|turecki|ukraiński|ukraińsku|rosyjski|rosyjsku|arabski|"
    r"engleză|engleza|franceză|franceza|germană|germana|spaniolă|spaniola|"
    r"portugheză|italiană|olandeză|poloneză|română|romana|turcă|ucraineană|rusă|"
    r"ingilizce|fransızca|almanca|ispanyolca|portekizce|italyanca|"
    r"felemenkçe|lehçe|rumence|türkçe|turkce|ukraynaca|rusça|arapça|"
    r"lëtzebuergesch|letzebuergesch|englesch|franséisch|däitsch|spuenesch|"
    r"suomi|suomeksi|englanti|englanniksi|ruotsi|ruotsiksi|"
    r"svenska|engelska|franska|tyska|spanska|portugisiska|italienska|"
    r"finska|nederländska|polska|rumänska|turkiska|ukrainska|ryska|arabiska|"
    r"українською|українська|російською|англійською|"
    r"по-русски|на русском|на английском|по-английски|"
    r"العربية|الإنجليزية|الفرنسية|الإسبانية|الألمانية|البرتغالية)"
)

_EXPLICIT_REQUEST_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(
        rf"\b(?:reply|respond|answer|write|communicate|explain|continue|switch)"
        rf"(?:\s+(?:(?:to\s+)?(?:your|the|my|this|a)\s+"
        rf"(?:reply|response|answer|email|message|question)|"
        rf"back|to\s+me|me|please|kindly|only))*"
        rf"\s+(?:in|into)\s+{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:preferred|reply|response)\s+language\b\s*(?::|is|=)\s*"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\bspeak\s+to\s+me\s+in\s+{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:répond\w*|écri\w*|repond\w*|ecri\w*|continuer|poursuivre)"
        rf"(?:[-\s]+(?:moi|me|s'il vous plaît|s'il te plaît|svp))*\s+en\s+"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:antwort\w*|schreib\w*)(?:\s+(?:sie|mir|bitte))*\s+auf\s+"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:respond\w*|escrib\w*|contest\w*)(?:[-\s]+(?:me|por favor))*\s+"
        rf"(?:en|em)\s+{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:rispond\w*|scriv\w*)(?:\s+(?:mi|per favore))*\s+in\s+"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:antwoord\w*|schrijf)(?:\s+(?:mij|me|alstublieft))*\s+"
        rf"in\s+(?:het\s+)?{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:odpowiedz\w*|napisz\w*)(?:\s+(?:mi|proszę))*\s+"
        rf"(?:po\s+|w\s+języku\s+)?{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:răspund\w*|raspund\w*|scrie\w*)\s+(?:în|in)\s+"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b{_LANG_NAMES_PATTERN}\s+(?:olarak\s+)?(?:cevap\w*|yanıt\w*|yaz\w*)\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:äntwert\w*|schreiwt?)(?:\s+(?:mir|wannechgelift))*\s+op\s+"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:vastaa\w*|kirjoita\w*)(?:\s+kiitos)?\s+{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:svara\w*|skriv\w*)(?:\s+(?:mig|tack))*\s+på\s+"
        rf"{_LANG_NAMES_PATTERN}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"(?:відпові\w*|напиш\w*|ответь\w*|напиш\w*)\s+"
        rf"(?:мені\s+|мне\s+)?(?:на\s+)?{_LANG_NAMES_PATTERN}",
        re.IGNORECASE,
    ),
    re.compile(
        rf"(?:أجب|رد|اكتب)\s+(?:لي\s+)?ب{_LANG_NAMES_PATTERN}",
        re.IGNORECASE,
    ),
)

_LATIN_STOPWORDS: dict[str, frozenset[str]] = {
    "en": frozenset(
        {
            "the",
            "and",
            "for",
            "with",
            "that",
            "this",
            "from",
            "have",
            "has",
            "had",
            "is",
            "was",
            "were",
            "are",
            "be",
            "been",
            "not",
            "but",
            "you",
            "your",
            "they",
            "their",
            "what",
            "when",
            "where",
            "which",
            "who",
            "how",
            "would",
            "should",
            "could",
            "can",
            "may",
            "will",
            "need",
            "please",
            "must",
            "there",
            "about",
            "after",
            "before",
            "my",
            "his",
            "her",
            "our",
            "to",
            "of",
            "in",
            "on",
            "at",
            "by",
            "or",
            "as",
            "an",
            "it",
            "its",
            "if",
            "me",
            "us",
            "we",
            "into",
            "only",
            "both",
            "any",
            "all",
            "died",
            "death",
            "passed",
            "away",
            "yesterday",
            "mother",
            "father",
            "spouse",
            "documents",
            "register",
            "certificate",
            "steps",
            "do",
            "does",
            "did",
            "hello",
            "thank",
            "thanks",
            "dear",
            "help",
        }
    ),
    "fr": frozenset(
        {
            "le",
            "la",
            "les",
            "un",
            "une",
            "des",
            "du",
            "au",
            "aux",
            "et",
            "ou",
            "mais",
            "donc",
            "car",
            "que",
            "qui",
            "quoi",
            "quel",
            "quelle",
            "comment",
            "où",
            "quand",
            "pourquoi",
            "mon",
            "ma",
            "mes",
            "son",
            "sa",
            "ses",
            "notre",
            "votre",
            "je",
            "nous",
            "vous",
            "est",
            "sont",
            "ont",
            "peut",
            "dois",
            "faut",
            "faire",
            "hier",
            "mère",
            "père",
            "décédé",
            "décédée",
            "décès",
            "acte",
            "dans",
            "pour",
            "par",
            "avec",
            "sur",
            "sans",
            "chez",
            "sous",
            "cette",
            "ces",
            "pas",
            "plus",
            "aussi",
            "merci",
            "bonjour",
            "veuillez",
        }
    ),
    "de": frozenset(
        {
            "der",
            "die",
            "das",
            "den",
            "dem",
            "des",
            "ein",
            "eine",
            "einer",
            "einem",
            "einen",
            "und",
            "oder",
            "aber",
            "dass",
            "weil",
            "wenn",
            "wie",
            "was",
            "wer",
            "wo",
            "wann",
            "warum",
            "welche",
            "welcher",
            "ich",
            "wir",
            "sie",
            "mein",
            "meine",
            "ihr",
            "ihre",
            "ist",
            "sind",
            "war",
            "hat",
            "haben",
            "kann",
            "muss",
            "soll",
            "nicht",
            "mit",
            "für",
            "von",
            "zu",
            "bei",
            "nach",
            "aus",
            "auf",
            "über",
            "unter",
            "durch",
            "gestern",
            "mutter",
            "vater",
            "gestorben",
            "verstorben",
            "sterbeurkunde",
            "bitte",
            "machen",
            "tun",
        }
    ),
    "es": frozenset(
        {
            "el",
            "la",
            "los",
            "las",
            "de",
            "del",
            "al",
            "en",
            "y",
            "unos",
            "unas",
            "un",
            "una",
            "con",
            "por",
            "para",
            "pero",
            "que",
            "qué",
            "cómo",
            "cuál",
            "cuándo",
            "dónde",
            "quién",
            "mi",
            "mis",
            "su",
            "sus",
            "nuestro",
            "es",
            "son",
            "está",
            "están",
            "fue",
            "puede",
            "puedo",
            "debo",
            "necesito",
            "tengo",
            "hay",
            "hacer",
            "ayer",
            "madre",
            "padre",
            "falleció",
            "murió",
            "defunción",
            "certificado",
            "sobre",
            "este",
            "esta",
            "estos",
            "sin",
            "también",
            "hola",
            "gracias",
            "favor",
            "debe",
            "deben",
            "trámite",
            "trámites",
        }
    ),
    "pt": frozenset(
        {
            "o",
            "a",
            "e",
            "de",
            "em",
            "um",
            "uma",
            "os",
            "as",
            "do",
            "da",
            "dos",
            "das",
            "no",
            "na",
            "nos",
            "nas",
            "ao",
            "aos",
            "com",
            "por",
            "para",
            "mas",
            "que",
            "como",
            "qual",
            "quando",
            "onde",
            "quem",
            "meu",
            "minha",
            "seu",
            "sua",
            "nosso",
            "são",
            "está",
            "estão",
            "foi",
            "pode",
            "posso",
            "devo",
            "preciso",
            "tenho",
            "fazer",
            "ontem",
            "mãe",
            "pai",
            "faleceu",
            "morreu",
            "óbito",
            "certidão",
            "sobre",
            "este",
            "esta",
            "sem",
            "também",
            "não",
            "você",
            "vocês",
            "olá",
            "obrigado",
            "favor",
            "deve",
        }
    ),
    "it": frozenset(
        {
            "il",
            "lo",
            "gli",
            "le",
            "del",
            "della",
            "dei",
            "degli",
            "delle",
            "al",
            "alla",
            "ed",
            "che",
            "di",
            "da",
            "con",
            "su",
            "per",
            "tra",
            "fra",
            "ma",
            "come",
            "cosa",
            "dove",
            "quando",
            "perché",
            "mio",
            "mia",
            "suo",
            "sua",
            "nostro",
            "è",
            "sono",
            "ha",
            "hanno",
            "può",
            "posso",
            "devo",
            "fare",
            "ieri",
            "madre",
            "padre",
            "morto",
            "morta",
            "deceduto",
            "decesso",
            "certificato",
            "anche",
            "non",
            "questo",
            "questa",
            "questi",
            "senza",
            "oppure",
            "più",
            "grazie",
            "salve",
        }
    ),
    "nl": frozenset(
        {
            "de",
            "het",
            "een",
            "van",
            "voor",
            "met",
            "is",
            "nu",
            "in",
            "ook",
            "niet",
            "als",
            "naar",
            "om",
            "aan",
            "bij",
            "door",
            "maar",
            "dit",
            "dat",
            "wat",
            "wie",
            "waar",
            "wanneer",
            "waarom",
            "welke",
            "mijn",
            "zijn",
            "haar",
            "ons",
            "ik",
            "wij",
            "heb",
            "heeft",
            "wordt",
            "moet",
            "kan",
            "doen",
            "gisteren",
            "moeder",
            "vader",
            "overleden",
            "overlijden",
            "akte",
            "alstublieft",
            "dank",
            "hoe",
            "moeten",
        }
    ),
    "pl": frozenset(
        {
            "w",
            "na",
            "z",
            "do",
            "od",
            "po",
            "za",
            "dla",
            "czy",
            "co",
            "jak",
            "kiedy",
            "gdzie",
            "który",
            "która",
            "które",
            "nie",
            "tak",
            "ale",
            "lub",
            "albo",
            "jest",
            "są",
            "był",
            "była",
            "może",
            "mogę",
            "muszę",
            "trzeba",
            "mój",
            "moja",
            "moje",
            "mama",
            "tata",
            "ojciec",
            "matka",
            "wczoraj",
            "zmarł",
            "zmarła",
            "akt",
            "zgonu",
            "śmierci",
            "proszę",
            "ten",
            "tego",
            "tej",
            "bez",
            "oraz",
            "dziękuję",
            "zrobić",
        }
    ),
    "ro": frozenset(
        {
            "și",
            "în",
            "cu",
            "de",
            "din",
            "pentru",
            "pe",
            "sau",
            "dar",
            "că",
            "ce",
            "cine",
            "cum",
            "când",
            "unde",
            "care",
            "niște",
            "ai",
            "ale",
            "cel",
            "cea",
            "cei",
            "cele",
            "meu",
            "mea",
            "tatăl",
            "mama",
            "este",
            "sunt",
            "au",
            "fost",
            "poate",
            "trebuie",
            "fac",
            "ieri",
            "decedat",
            "decedată",
            "deces",
            "certificat",
            "nu",
            "mai",
            "fără",
            "despre",
            "mulțumesc",
            "vă",
            "rog",
        }
    ),
    "tr": frozenset(
        {
            "ve",
            "veya",
            "ile",
            "için",
            "bu",
            "şu",
            "bir",
            "ne",
            "nasıl",
            "neden",
            "nerede",
            "kim",
            "mi",
            "mı",
            "mu",
            "mü",
            "de",
            "da",
            "değil",
            "yok",
            "var",
            "gibi",
            "kadar",
            "sonra",
            "önce",
            "hakkında",
            "benim",
            "annem",
            "babam",
            "dün",
            "vefat",
            "öldü",
            "ölüm",
            "belgesi",
            "gerekiyor",
            "lazım",
            "yapmalıyım",
            "lütfen",
            "ama",
            "fakat",
            "teşekkür",
            "ederim",
            "merhaba",
        }
    ),
    "lb": frozenset(
        {
            "ass",
            "ech",
            "meng",
            "mamm",
            "papp",
            "däin",
            "seng",
            "hir",
            "ons",
            "iech",
            "déi",
            "dës",
            "eng",
            "een",
            "vun",
            "fir",
            "mat",
            "op",
            "och",
            "net",
            "wann",
            "wéi",
            "wat",
            "wou",
            "hunn",
            "sinn",
            "gëtt",
            "war",
            "muss",
            "soll",
            "kann",
            "maachen",
            "kréien",
            "gëschter",
            "haut",
            "gestuerwen",
            "doud",
            "doudesakt",
            "lëtzebuerg",
            "gemeng",
            "merci",
            "moien",
            "ierfschaft",
            "zu",
        }
    ),
    "fi": frozenset(
        {
            "ja",
            "tai",
            "on",
            "ei",
            "en",
            "ole",
            "oli",
            "ovat",
            "olla",
            "että",
            "jos",
            "kun",
            "kuin",
            "mutta",
            "sekä",
            "myös",
            "mitä",
            "miten",
            "missä",
            "milloin",
            "kuka",
            "mikä",
            "minun",
            "äitini",
            "isäni",
            "eilen",
            "kuoli",
            "kuolema",
            "kuolintodistus",
            "pitää",
            "täytyy",
            "tehdä",
            "tarvitsee",
            "varten",
            "kanssa",
            "ilman",
            "tämä",
            "nämä",
            "se",
            "ne",
            "hei",
            "kiitos",
            "suomessa",
        }
    ),
    "sv": frozenset(
        {
            "och",
            "eller",
            "att",
            "det",
            "är",
            "var",
            "inte",
            "ej",
            "för",
            "med",
            "på",
            "av",
            "till",
            "från",
            "om",
            "som",
            "men",
            "också",
            "vad",
            "hur",
            "när",
            "varför",
            "vilken",
            "vilket",
            "min",
            "mitt",
            "mina",
            "mamma",
            "pappa",
            "mor",
            "far",
            "igår",
            "dog",
            "avled",
            "dödsfall",
            "dödsattest",
            "måste",
            "behöver",
            "göra",
            "kan",
            "ska",
            "skulle",
            "den",
            "detta",
            "dessa",
            "utan",
            "hej",
            "tack",
            "sverige",
        }
    ),
}

_DISTINCTIVE_LATIN_CHARS: dict[str, frozenset[str]] = {
    "es": frozenset({"ñ"}),
    "pt": frozenset({"ã", "õ"}),
    "de": frozenset({"ß"}),
    "fr": frozenset({"œ"}),
    "pl": frozenset({"ł", "ą", "ę", "ć", "ń", "ź", "ż"}),
    "ro": frozenset({"ă", "ș", "ț", "ş", "ţ"}),
    "tr": frozenset({"ğ", "ı"}),
    "lb": frozenset({"ë"}),
    "sv": frozenset({"å"}),
}

_UK_STOPWORDS: frozenset[str] = frozenset(
    {
        "що",
        "як",
        "для",
        "або",
        "але",
        "це",
        "який",
        "яка",
        "які",
        "помер",
        "померла",
        "потрібно",
        "документи",
        "свідоцтво",
        "смерть",
        "смерті",
        "країні",
        "якщо",
        "після",
        "також",
        "будь",
        "ласка",
        "мій",
        "моя",
        "мене",
        "треба",
        "та",
        "чи",
        "про",
        "у",
        "в",
        "і",
        "з",
        "на",
        "до",
        "від",
    }
)

_RU_STOPWORDS: frozenset[str] = frozenset(
    {
        "что",
        "как",
        "для",
        "или",
        "но",
        "это",
        "который",
        "которая",
        "умер",
        "умерла",
        "нужно",
        "документы",
        "свидетельство",
        "смерть",
        "смерти",
        "стране",
        "если",
        "после",
        "также",
        "пожалуйста",
        "мой",
        "моя",
        "меня",
        "надо",
        "при",
        "где",
        "и",
        "в",
        "с",
        "к",
        "на",
        "от",
        "по",
    }
)

_UK_CHARS = frozenset({"і", "ї", "є", "ґ"})
_RU_CHARS = frozenset({"ы", "э", "ё", "ъ"})
_OTHER_CYRILLIC_CHARS = frozenset({"ћ", "ђ", "љ", "њ", "џ", "ј", "ў"})


def normalize_language_code(value: str | None) -> str | None:
    """Normalize a BCP-47 / Clarvia locale tag into a lowercase primary code."""
    if value is None:
        return None
    cleaned = value.strip().lower().replace("_", "-")
    if not cleaned:
        return None
    primary = cleaned.split("-", maxsplit=1)[0]
    mapped = _LANGUAGE_ALIASES.get(primary, primary)
    if not _PRIMARY_SUBTAG_RE.fullmatch(mapped):
        return None
    return mapped


def has_explicit_language_request(text: str) -> bool:
    """Return True when the text explicitly asks Lex to reply in a language."""
    if not text.strip():
        return False
    return any(
        pattern.search(text) is not None for pattern in _EXPLICIT_REQUEST_PATTERNS
    )


def _strip_noise(text: str) -> str:
    without_urls = _URL_RE.sub(" ", text)
    without_emails = _EMAIL_RE.sub(" ", without_urls)
    return _CITATION_RE.sub(" ", without_emails)


def _count_scripts(cleaned: str) -> tuple[int, int, int, int]:
    arabic = 0
    cyrillic = 0
    latin = 0
    other = 0
    for char in cleaned:
        if not char.isalpha():
            continue
        code = ord(char)
        if 0x0600 <= code <= 0x06FF or 0x0750 <= code <= 0x077F:
            arabic += 1
        elif 0x0400 <= code <= 0x052F:
            cyrillic += 1
        elif ("a" <= char.lower() <= "z") or (0x00C0 <= code <= 0x024F):
            latin += 1
        else:
            other += 1
    return arabic, cyrillic, latin, other


def _detect_cyrillic_language(cleaned: str, tokens: list[str]) -> str | None:
    lowered = cleaned.lower()
    if any(char in lowered for char in _OTHER_CYRILLIC_CHARS):
        return None
    uk_score = sum(2 for token in tokens if token in _UK_STOPWORDS)
    ru_score = sum(2 for token in tokens if token in _RU_STOPWORDS)
    uk_chars = sum(1 for char in lowered if char in _UK_CHARS)
    ru_chars = sum(1 for char in lowered if char in _RU_CHARS)
    uk_score += min(uk_chars * 2, 6)
    ru_score += min(ru_chars * 2, 6)
    if uk_score < 4 and ru_score < 4:
        return None
    if uk_score >= ru_score + 2:
        return "uk"
    if ru_score >= uk_score + 2:
        return "ru"
    return None


def _score_latin_languages(
    cleaned: str, tokens: list[str]
) -> tuple[dict[str, int], dict[str, int]]:
    lowered = cleaned.lower()
    scores: dict[str, int] = {}
    hits: dict[str, int] = {}
    for lang, stopwords in _LATIN_STOPWORDS.items():
        matched = [token for token in tokens if token in stopwords]
        hit_count = len(matched)
        score = sum(2 if len(token) == 1 else 3 for token in matched)
        distinct_chars = _DISTINCTIVE_LATIN_CHARS.get(lang)
        if hit_count > 0 and distinct_chars:
            char_bonus = sum(1 for char in distinct_chars if char in lowered)
            score += min(char_bonus, 3)
        scores[lang] = score
        hits[lang] = hit_count
    return scores, hits


def _detect_latin_language(cleaned: str, tokens: list[str]) -> str | None:
    scores, hits = _score_latin_languages(cleaned, tokens)
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_lang, top_score = ranked[0]
    second_score = ranked[1][1]
    top_hits = hits[top_lang]
    if top_hits < _MIN_LATIN_HITS or top_score < _MIN_LATIN_SCORE:
        return None
    if (top_hits / len(tokens)) < _MIN_LATIN_DENSITY and top_hits < 5:
        return None
    gap = top_score - second_score
    if gap < _MIN_SCORE_GAP or (gap / top_score) < _MIN_SCORE_MARGIN_RATIO:
        return None
    return top_lang


def detect_language(text: str) -> str | None:
    """Detect the dominant prose language, or None when short or ambiguous."""
    cleaned = _strip_noise(text)
    tokens = [token.lower() for token in _WORD_RE.findall(cleaned)]
    if len(tokens) < _MIN_TOKENS:
        return None

    arabic, cyrillic, latin, other = _count_scripts(cleaned)
    total_alpha = arabic + cyrillic + latin + other
    if total_alpha < _MIN_ALPHA_CHARS:
        return None

    if (arabic / total_alpha) >= _MIN_SCRIPT_RATIO:
        return "ar"
    if (cyrillic / total_alpha) >= _MIN_SCRIPT_RATIO:
        return _detect_cyrillic_language(cleaned, tokens)
    if (latin / total_alpha) >= _MIN_SCRIPT_RATIO:
        return _detect_latin_language(cleaned, tokens)
    return None


def resolve_expected_reply_language(
    latest_body: str,
    conversation_history: Sequence[ConversationMessage],
) -> str | None:
    """Determine the expected reply language from the latest turn or prior history."""
    if has_explicit_language_request(latest_body):
        return None

    detected = detect_language(latest_body)
    if detected is not None:
        return detected

    for message in reversed(conversation_history):
        if message.role != ConversationRole.USER:
            continue
        if has_explicit_language_request(message.text):
            return None
        prior = detect_language(message.text)
        if prior is not None:
            return prior

    for message in reversed(conversation_history):
        if message.role != ConversationRole.ASSISTANT:
            continue
        prior = detect_language(message.text)
        if prior is not None:
            return prior

    return None


__all__ = [
    "detect_language",
    "has_explicit_language_request",
    "normalize_language_code",
    "resolve_expected_reply_language",
]
