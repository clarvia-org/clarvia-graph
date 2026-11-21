"""Deterministic inbound-vs-response language guard helpers.

Provides zero-dependency language normalization, explicit reply-language
request detection, script/stopword-based language detection across Lex's
supported languages, and thread-aware expected reply language resolution.
"""

from __future__ import annotations

import re
import unicodedata
from collections import Counter
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
    r"العربية|الإنجليزية|الفرنسية|الإسبانية|الألمانية|البرتغالية|"
    r"japanese|korean|chinese|mandarin|cantonese|greek|czech|hungarian|"
    r"slovak|slovenian|bulgarian|serbian|croatian|danish|norwegian|icelandic|"
    r"estonian|latvian|lithuanian|hebrew|persian|farsi|urdu|hindi|bengali|"
    r"vietnamese|thai|indonesian|malay|tagalog|albanian|macedonian|georgian|"
    r"armenian|catalan|basque|galician|irish|welsh|swahili|nepali|tamil)"
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
            "de",
            "d",
            "l",
            "qu",
            "n",
            "s",
            "c",
            "j",
            "m",
            "t",
            "au",
            "aux",
            "en",
            "à",
            "a",
            "on",
            "il",
            "elle",
            "ils",
            "elles",
            "y",
            "si",
            "se",
            "ne",
            "ce",
            "cet",
            "cette",
            "ces",
            "et",
            "ou",
            "mais",
            "donc",
            "car",
            "que",
            "qui",
            "quoi",
            "quel",
            "quels",
            "quelle",
            "quelles",
            "comment",
            "où",
            "quand",
            "pourquoi",
            "dont",
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
            "être",
            "avoir",
            "peut",
            "dois",
            "faut",
            "faire",
            "hier",
            "mère",
            "père",
            "parent",
            "parents",
            "décédé",
            "décédée",
            "décès",
            "acte",
            "actes",
            "certificat",
            "documents",
            "dans",
            "pour",
            "par",
            "avec",
            "sur",
            "sans",
            "chez",
            "sous",
            "entre",
            "après",
            "avant",
            "lors",
            "auprès",
            "pas",
            "plus",
            "aussi",
            "tout",
            "tous",
            "cas",
            "suite",
            "perte",
            "mairie",
            "commune",
            "obtenir",
            "contacter",
            "demander",
            "démarches",
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
            "es",
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
            "in",
            "im",
            "an",
            "am",
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
            "sterbefall",
            "sterbeurkunde",
            "dokumente",
            "standesamt",
            "behörde",
            "gemeinde",
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
            "lo",
            "de",
            "del",
            "al",
            "a",
            "o",
            "en",
            "y",
            "no",
            "si",
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
            "documentos",
            "registro",
            "civil",
            "consulado",
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
            "la",
            "i",
            "gli",
            "le",
            "un",
            "una",
            "uno",
            "del",
            "della",
            "dei",
            "degli",
            "delle",
            "al",
            "alla",
            "a",
            "e",
            "ed",
            "o",
            "in",
            "si",
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
            "quale",
            "quali",
            "mio",
            "mia",
            "suo",
            "sua",
            "nostro",
            "è",
            "sono",
            "essere",
            "avere",
            "ha",
            "hanno",
            "può",
            "posso",
            "devo",
            "occorre",
            "bisogno",
            "fare",
            "andare",
            "parlare",
            "portare",
            "richiedere",
            "ieri",
            "dopo",
            "prima",
            "presso",
            "madre",
            "padre",
            "sorella",
            "fratello",
            "morto",
            "morta",
            "deceduto",
            "deceduta",
            "decesso",
            "certificato",
            "documenti",
            "ufficio",
            "comune",
            "anagrafe",
            "vive",
            "lavora",
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
            "op",
            "te",
            "er",
            "over",
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
            "hebben",
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
            "documenten",
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
            "si",
            "în",
            "in",
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
            "un",
            "o",
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

_STOPWORD_LANG_COUNTS: Counter[str] = Counter(
    word for words in _LATIN_STOPWORDS.values() for word in words
)

_DA_NO_CHARS = frozenset({"ø", "æ"})
_DA_NO_WORDS = frozenset(
    {
        "hvad",
        "hva",
        "ikke",
        "jeg",
        "skal",
        "gøre",
        "gjør",
        "gjøre",
        "døde",
        "død",
        "hvordan",
        "hvorfor",
        "nå",
        "må",
    }
)

_NON_ARABIC_PERSO_URDU_CHARS = frozenset(
    {"پ", "چ", "ژ", "گ", "ک", "ی", "ہ", "ے", "ٹ", "ڈ", "ڑ", "ں", "ھ"}
)

_AR_STOPWORDS: frozenset[str] = frozenset(
    {
        "في",
        "من",
        "على",
        "إلى",
        "الى",
        "عن",
        "مع",
        "هذا",
        "هذه",
        "التي",
        "الذي",
        "ما",
        "ماذا",
        "كيف",
        "أين",
        "متى",
        "هل",
        "أو",
        "ثم",
        "بعد",
        "قبل",
        "توفي",
        "توفيت",
        "الوفاة",
        "وفاة",
        "شهادة",
        "والدي",
        "والدتي",
        "المستندات",
        "الأوراق",
        "الإجراءات",
        "القانونية",
        "القنصلية",
        "السفارة",
        "لدي",
        "أحتاج",
        "يجب",
        "يرجى",
        "شكرا",
        "السلام",
    }
)

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
        "мне",
        "вчера",
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

_BG_STOPWORDS: frozenset[str] = frozenset(
    {
        "са",
        "какво",
        "какви",
        "трябва",
        "трябват",
        "смърт",
        "смъртния",
        "смъртен",
        "съм",
        "българия",
        "почина",
        "необходими",
        "наследството",
        "наследство",
        "моля",
    }
)

_UK_CHARS = frozenset({"і", "ї", "є", "ґ"})
_RU_CHARS = frozenset({"ы", "э", "ё", "ъ"})
_OTHER_CYRILLIC_CHARS = frozenset(
    {
        "ћ",
        "ђ",
        "љ",
        "њ",
        "џ",
        "ј",
        "ў",
        "ә",
        "қ",
        "ң",
        "ғ",
        "ү",
        "ұ",
        "ө",
        "һ",
        "ҷ",
        "ҳ",
        "ӯ",
        "ӣ",
        "ҙ",
        "ҡ",
        "ҫ",
        "җ",
    }
)

_ENTITY_CONN_WORD = (
    r"(?:de|del|la|le|les|du|des|do|da|dos|das|e|y|i|di|delle|della|degli|"
    r"der|die|und|von|zu|communale?|civile?|nationale?|fédérale?|régionale?)"
)
_FOREIGN_ENTITY_SPAN_RE = re.compile(
    rf"\b[A-ZÀ-ÖØ-Þ][^\W\d_]+"
    rf"(?:(?:\s+[A-ZÀ-ÖØ-Þ][^\W\d_]+)*"
    rf"(?:\s+{_ENTITY_CONN_WORD}){{1,3}}\s+[A-ZÀ-ÖØ-Þ][^\W\d_]+)+"
    rf"(?:\s+[A-ZÀ-ÖØ-Þ][^\W\d_]+)*",
    re.UNICODE,
)
_PAREN_ENTITY_RE = re.compile(
    rf"\(\s*[A-ZÀ-ÖØ-Þ][^\W\d_]*(?:\s+{_ENTITY_CONN_WORD})+[^()\n]{{0,80}}\)",
    re.UNICODE,
)


def _normalize_text(text: str) -> str:
    return unicodedata.normalize("NFC", text)


def _lower_text(text: str) -> str:
    return _normalize_text(text).replace("\u0130", "i").lower()


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
    normalized = _normalize_text(text)
    if not normalized.strip():
        return False
    return any(
        pattern.search(normalized) is not None for pattern in _EXPLICIT_REQUEST_PATTERNS
    )


def _strip_noise(text: str) -> str:
    normalized = _normalize_text(text)
    without_urls = _URL_RE.sub(" ", normalized)
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


def _is_arabic_stopword(token: str) -> bool:
    if token in _AR_STOPWORDS:
        return True
    if len(token) >= 4 and token[0] in {"و", "ب", "ل", "ف"}:
        return token[1:] in _AR_STOPWORDS
    return False


def _detect_arabic_language(cleaned: str, tokens: list[str]) -> str | None:
    if any(char in _NON_ARABIC_PERSO_URDU_CHARS for char in cleaned):
        return None
    ar_hits = sum(1 for token in tokens if _is_arabic_stopword(token))
    return "ar" if ar_hits >= 2 else None


def _detect_cyrillic_language(cleaned: str, tokens: list[str]) -> str | None:
    lowered = _lower_text(cleaned)
    if any(char in lowered for char in _OTHER_CYRILLIC_CHARS):
        return None
    bg_hits = sum(1 for token in tokens if token in _BG_STOPWORDS)
    uk_hits = sum(1 for token in tokens if token in _UK_STOPWORDS)
    ru_hits = sum(1 for token in tokens if token in _RU_STOPWORDS)
    if bg_hits >= 2 or (bg_hits >= 1 and bg_hits >= max(uk_hits, ru_hits)):
        return None
    uk_score = uk_hits * 2 + min(sum(1 for c in lowered if c in _UK_CHARS) * 2, 6)
    ru_score = ru_hits * 2 + min(sum(1 for c in lowered if c in _RU_CHARS) * 2, 6)
    if uk_hits >= 2 and uk_score >= 6 and uk_score >= ru_score + 4:
        return "uk"
    if ru_hits >= 2 and ru_score >= 6 and ru_score >= uk_score + 4:
        return "ru"
    return None


def _latin_token_weight(token: str) -> int:
    if len(token) == 1:
        return 1
    lang_count = _STOPWORD_LANG_COUNTS[token]
    if lang_count >= 3:
        return 1
    if lang_count == 2:
        return 2
    return 3


def _score_latin_languages(
    cleaned: str, tokens: list[str]
) -> tuple[dict[str, int], dict[str, int], dict[str, int]]:
    lowered = _lower_text(cleaned)
    scores: dict[str, int] = {}
    hits: dict[str, int] = {}
    strong_hits: dict[str, int] = {}
    for lang, stopwords in _LATIN_STOPWORDS.items():
        matched = [token for token in tokens if token in stopwords]
        hit_count = len(matched)
        weights = [_latin_token_weight(token) for token in matched]
        score = sum(weights)
        strong_count = sum(1 for weight in weights if weight >= 2)
        distinct_chars = _DISTINCTIVE_LATIN_CHARS.get(lang)
        if hit_count > 0 and distinct_chars:
            char_bonus = sum(1 for char in distinct_chars if char in lowered)
            score += min(char_bonus, 3)
        scores[lang] = score
        hits[lang] = hit_count
        strong_hits[lang] = strong_count
    return scores, hits, strong_hits


def _detect_latin_language(cleaned: str, tokens: list[str]) -> str | None:
    lowered = _lower_text(cleaned)
    scores, hits, strong_hits = _score_latin_languages(cleaned, tokens)
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_lang, top_score = ranked[0]
    second_score = ranked[1][1]
    top_hits = hits[top_lang]
    if (
        top_hits < _MIN_LATIN_HITS
        or strong_hits[top_lang] < 1
        or top_score < _MIN_LATIN_SCORE
    ):
        return None
    if (top_hits / len(tokens)) < _MIN_LATIN_DENSITY and top_hits < 5:
        return None
    gap = top_score - second_score
    if gap < _MIN_SCORE_GAP or (gap / top_score) < _MIN_SCORE_MARGIN_RATIO:
        return None
    if top_lang == "sv" and (
        any(char in lowered for char in _DA_NO_CHARS)
        or any(token in _DA_NO_WORDS for token in tokens)
    ):
        return None
    return top_lang


def detect_language(text: str) -> str | None:
    """Detect the dominant prose language, or None when short or ambiguous."""
    cleaned = _strip_noise(text)
    tokens = _WORD_RE.findall(_lower_text(cleaned))
    if len(tokens) < _MIN_TOKENS:
        return None

    arabic, cyrillic, latin, other = _count_scripts(cleaned)
    total_alpha = arabic + cyrillic + latin + other
    if total_alpha < _MIN_ALPHA_CHARS:
        return None

    if (arabic / total_alpha) >= _MIN_SCRIPT_RATIO:
        return _detect_arabic_language(cleaned, tokens)
    if (cyrillic / total_alpha) >= _MIN_SCRIPT_RATIO:
        return _detect_cyrillic_language(cleaned, tokens)
    if (latin / total_alpha) >= _MIN_SCRIPT_RATIO:
        return _detect_latin_language(cleaned, tokens)
    return None


def detect_prose_language(
    text: str,
    *,
    ignored_phrases: Sequence[str] = (),
) -> str | None:
    """Detect prose language after stripping cited foreign authority names."""
    scrubbed = _normalize_text(text)
    phrases = sorted(
        {
            _normalize_text(phrase.strip())
            for phrase in ignored_phrases
            if len(phrase.strip()) >= 4
        },
        key=len,
        reverse=True,
    )
    for phrase in phrases:
        scrubbed = re.sub(re.escape(phrase), " ", scrubbed, flags=re.IGNORECASE)
    scrubbed = _PAREN_ENTITY_RE.sub(" ", scrubbed)
    scrubbed = _FOREIGN_ENTITY_SPAN_RE.sub(" ", scrubbed)
    return detect_language(scrubbed)


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
    "detect_prose_language",
    "has_explicit_language_request",
    "normalize_language_code",
    "resolve_expected_reply_language",
]
