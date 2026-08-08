"""Offline Markdown ↔ retained-source fidelity checks.

Primary gate: unexplained statutory token divergence between retained source
body and normalized Markdown. Known Casemates glue (``ladirective`` ↔
``la``+``directive``, ``N°`` ↔ ``n``+``o``, ``1erbis`` ↔ ``1er``+``bis``) is
classified as recognized token-boundary differences via exact concatenation
under a narrow proclitic/ordinal allowlist — never a general rewrite dictionary.

When the gate fails, errors include a per-article first-difference report.
"""

from __future__ import annotations

import re
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from pathlib import Path

from lxml import etree, html

from lex.errors import ErrorCode, LexError
from lex.frontmatter import parse_frontmatter

AKN_NS = "http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD13"
SCL_NS = "http://www.scl.lu"

# Unexplained source-only tokens must stay within this fraction of source size.
WORD_COUNT_MARGIN = 0.005
WORD_RE = re.compile(r"\b[a-zA-ZÀ-ÿ0-9]+\b", re.UNICODE)
_ARTICLE_ANCHOR_RE = re.compile(
    r'<a\s+id="([^"]*)"\s*></a>\s*\n##\s+([^\n]*)',
    re.MULTILINE,
)
_FIRST_DIFF_WINDOW = 8
_FIRST_DIFF_REPORT_LIMIT = 8

# Narrow left-side particles that Casemates often glues onto the next word.
# Not a synonym dictionary: splits are accepted only when parts concatenate
# exactly back to the glued token.
_BOUNDARY_PROCLITICS = frozenset(
    {
        "à",
        "au",
        "aux",
        "ce",
        "ces",
        "d",
        "de",
        "des",
        "du",
        "en",
        "et",
        "l",
        "la",
        "le",
        "les",
        "me",
        "ne",
        "ni",
        "ou",
        "se",
        "te",
        "un",
        "une",
        "y",
    }
)
_ORDINAL_FRAGMENTS = frozenset(
    {
        "er",
        "re",
        "e",
        "ème",
        "eme",
        "èmes",
        "emes",
        "bis",
        "ter",
        "quater",
        "quinquies",
        "sexies",
        "ère",
        "ere",
        "ères",
        "eres",
    }
)

_SKIP_TAGS = frozenset(
    {
        "meta",
        "preface",
        "toc",
        "JOLUXWork",
        "JOLUXComplexWork",
        "JOLUXLegalResource",
        "JOLUXExpression",
        "JOLUXManifestation",
        "indexterms",
        "indexterm",
        "jolux",
        "rdf",
        "label",
    }
)


@dataclass(frozen=True)
class ArticleFirstDiff:
    """First word-stream divergence for one provision."""

    article_id: str
    index: int
    xml_len: int
    md_len: int
    xml_window: tuple[str, ...]
    md_window: tuple[str, ...]
    kind: str  # "mismatch" | "missing_in_md" | "extra_in_md"

    def format_line(self) -> str:
        if self.kind == "missing_in_md":
            return f"{self.article_id}: present in XML ({self.xml_len} words), missing in Markdown"
        if self.kind == "extra_in_md":
            return f"{self.article_id}: present in Markdown ({self.md_len} words), missing in XML"
        xml_ctx = " ".join(self.xml_window) or "—"
        md_ctx = " ".join(self.md_window) or "—"
        return (
            f"{self.article_id}: first diff at token {self.index} "
            f"(xml_len={self.xml_len}, md_len={self.md_len}); "
            f"xml=[{xml_ctx}] md=[{md_ctx}]"
        )


@dataclass(frozen=True)
class FidelityReport:
    """Public fidelity classification for one law Markdown ↔ retained source."""

    source_articles: int
    markdown_articles: int
    missing_articles: int
    source_tokens: int
    markdown_tokens: int
    source_only_tokens: int
    markdown_only_tokens: int
    unexplained_source_only_tokens: int
    unexplained_markdown_only_tokens: int
    recognized_boundary_differences: int
    divergence_ratio: float
    exact_canonical_token_match: bool
    article_diffs: tuple[ArticleFirstDiff, ...] = ()

    @property
    def ok(self) -> bool:
        if self.source_tokens == 0:
            return True
        return self.unexplained_source_only_tokens / self.source_tokens <= WORD_COUNT_MARGIN

    def format_public(self) -> str:
        return "\n".join(
            [
                "fidelity:",
                f"  source_articles: {self.source_articles}",
                f"  markdown_articles: {self.markdown_articles}",
                f"  missing_articles: {self.missing_articles}",
                f"  source_only_tokens: {self.source_only_tokens}",
                f"  markdown_only_tokens: {self.markdown_only_tokens}",
                f"  unexplained_source_only_tokens: {self.unexplained_source_only_tokens}",
                f"  unexplained_markdown_only_tokens: {self.unexplained_markdown_only_tokens}",
                f"  recognized_boundary_differences: {self.recognized_boundary_differences}",
                f"  exact_canonical_token_match: {str(self.exact_canonical_token_match).lower()}",
                f"  divergence_ratio: {self.divergence_ratio:.3%}",
            ]
        )


def check_law_fidelity(md_path: Path, *, rel_path: str | Path | None = None) -> list[LexError]:
    """Fail when unexplained source-only statutory tokens exceed the margin."""
    rel = rel_path if rel_path is not None else md_path
    try:
        report = analyze_law_fidelity(md_path)
    except etree.XMLSyntaxError as exc:
        return [
            LexError(
                ErrorCode.LEX_INVALID_DATA,
                rel,
                f"Cannot parse source for fidelity check: {exc}",
            )
        ]
    if report is None:
        return []
    if report.ok:
        return []

    message = (
        "Fidelity: unexplained statutory token divergence "
        f"(source={report.source_tokens} tokens, markdown={report.markdown_tokens}, "
        f"unexplained_source_only={report.unexplained_source_only_tokens} "
        f"({report.unexplained_source_only_tokens / max(1, report.source_tokens):.2%}), "
        f"unexplained_markdown_only={report.unexplained_markdown_only_tokens}, "
        f"recognized_boundary_differences={report.recognized_boundary_differences})\n"
        f"{report.format_public()}"
    )
    article_report = format_article_diff_report(list(report.article_diffs))
    if article_report:
        message = f"{message}\n{article_report}"
    return [LexError(ErrorCode.LEX_INVALID_DATA, rel, message)]


def analyze_law_fidelity(md_path: Path) -> FidelityReport | None:
    """Build a classified fidelity report for ``current.md`` + retained source."""
    text = md_path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)
    source_file = meta.get("source_file")
    if not isinstance(source_file, str) or not source_file:
        return None
    source_path = md_path.parent / source_file
    if not source_path.is_file():
        return None

    suffix = source_path.suffix.lower()
    source_bytes = source_path.read_bytes()
    if suffix == ".xml":
        source_words = xml_body_words(source_bytes)
        xml_articles = xml_article_word_streams(source_bytes)
        md_articles = markdown_article_word_streams(body)
        article_diffs = tuple(
            first_article_differences(xml_articles, md_articles, limit=_FIRST_DIFF_REPORT_LIMIT)
        )
    elif suffix in {".html", ".htm"}:
        source_words = html_body_words(source_bytes)
        if len(source_words) < 50:
            return None
        xml_articles = []
        md_articles = markdown_article_word_streams(body)
        article_diffs = ()
    else:
        return None

    md_words = markdown_body_words(body)
    return build_fidelity_report(
        source_words,
        md_words,
        xml_articles=xml_articles,
        md_articles=md_articles,
        article_diffs=article_diffs,
    )


def build_fidelity_report(
    source_words: list[str],
    md_words: list[str],
    *,
    xml_articles: list[tuple[str, list[str]]] | None = None,
    md_articles: list[tuple[str, list[str]]] | None = None,
    article_diffs: tuple[ArticleFirstDiff, ...] = (),
) -> FidelityReport:
    """Classify source/Markdown token multisets into boundary vs unexplained."""
    src_n = len(source_words)
    md_n = len(md_words)
    src_counts = Counter(source_words)
    md_counts = Counter(md_words)
    source_only = src_counts - md_counts
    markdown_only = md_counts - src_counts
    source_only_n = sum(source_only.values())
    markdown_only_n = sum(markdown_only.values())

    recognized, unexplained_src, unexplained_md = _classify_boundary_differences(
        source_only,
        markdown_only,
        md_budget=md_counts,
    )

    xml_articles = xml_articles or []
    md_articles = md_articles or []
    md_ids = Counter(article_id for article_id, _ in md_articles)
    missing_articles = 0
    for article_id, _ in xml_articles:
        if md_ids[article_id] > 0:
            md_ids[article_id] -= 1
        else:
            missing_articles += 1

    exact = (
        unexplained_src == 0
        and unexplained_md == 0
        and recognized == 0
        and source_only_n == 0
        and markdown_only_n == 0
    )
    if src_n == 0:
        divergence_ratio = 0.0
    elif unexplained_src:
        divergence_ratio = unexplained_src / src_n
    else:
        divergence_ratio = recognized / src_n

    return FidelityReport(
        source_articles=len(xml_articles),
        markdown_articles=len(md_articles),
        missing_articles=missing_articles,
        source_tokens=src_n,
        markdown_tokens=md_n,
        source_only_tokens=source_only_n,
        markdown_only_tokens=markdown_only_n,
        unexplained_source_only_tokens=unexplained_src,
        unexplained_markdown_only_tokens=unexplained_md,
        recognized_boundary_differences=recognized,
        divergence_ratio=divergence_ratio,
        exact_canonical_token_match=exact,
        article_diffs=article_diffs,
    )


def _classify_boundary_differences(
    source_only: Counter[str],
    markdown_only: Counter[str],
    *,
    md_budget: Counter[str],
) -> tuple[int, int, int]:
    """Peel exact concatenations under the narrow allowlist.

    Split parts may be drawn from the full Markdown multiset (``md_budget``),
    not only from markdown-only residuals — otherwise ``erbis`` fails when
    ``er``/``bis`` already exact-matched other source tokens.

    Ordinal bridges (``1``+``erbis`` ↔ ``1er``+``bis``) run before peeling
    bare ``erbis`` → ``er``+``bis``, which would strand the leading digit.
    """
    src = Counter(source_only)
    md_only = Counter(markdown_only)
    budget = Counter(md_budget)
    recognized = 0
    progress = True
    while progress:
        progress = False

        # Ordinal bridge first: ``1``+``erbis`` ↔ ``1er``+``bis`` (same characters).
        for digit in [t for t in list(src) if t.isdigit()]:
            for glued in [t for t in list(src) if t.startswith("er") and len(t) > 2]:
                md_left = digit + "er"
                md_right = glued[2:]
                while (
                    src.get(digit, 0) > 0
                    and src.get(glued, 0) > 0
                    and budget.get(md_left, 0) > 0
                    and budget.get(md_right, 0) > 0
                    and md_right in _ORDINAL_FRAGMENTS
                ):
                    for part in (md_left, md_right):
                        budget[part] -= 1
                        if budget[part] <= 0:
                            del budget[part]
                        if md_only[part] > 0:
                            md_only[part] -= 1
                            if md_only[part] <= 0:
                                del md_only[part]
                    src[digit] -= 1
                    src[glued] -= 1
                    if src[digit] <= 0:
                        del src[digit]
                    if src[glued] <= 0:
                        del src[glued]
                    recognized += 1
                    progress = True

        for glued in sorted(list(src.keys()), key=len, reverse=True):
            while src[glued] > 0:
                split = _find_consumable_split(glued, budget)
                if split is None:
                    break
                for part in split:
                    budget[part] -= 1
                    if budget[part] <= 0:
                        del budget[part]
                    if md_only[part] > 0:
                        md_only[part] -= 1
                        if md_only[part] <= 0:
                            del md_only[part]
                src[glued] -= 1
                if src[glued] <= 0:
                    del src[glued]
                recognized += 1
                progress = True

    # Symmetric: Markdown-only glued tokens explained by source-only parts.
    src_budget = Counter(src)  # remaining unexplained source tokens as parts
    for glued in sorted(list(md_only.keys()), key=len, reverse=True):
        while md_only[glued] > 0:
            split = _find_consumable_split(glued, src_budget)
            if split is None:
                break
            for part in split:
                src_budget[part] -= 1
                if src_budget[part] <= 0:
                    del src_budget[part]
                if src[part] > 0:
                    src[part] -= 1
                    if src[part] <= 0:
                        del src[part]
            md_only[glued] -= 1
            if md_only[glued] <= 0:
                del md_only[glued]
            recognized += 1

    return recognized, sum(src.values()), sum(md_only.values())


def _find_consumable_split(glued: str, parts_available: Counter[str]) -> tuple[str, ...] | None:
    for split in _candidate_boundary_splits(glued):
        need: Counter[str] = Counter(split)
        if all(parts_available[p] >= n for p, n in need.items()):
            return split
    return None


def _candidate_boundary_splits(glued: str) -> list[tuple[str, ...]]:
    """Generate allowlisted exact concatenations only (no arbitrary rewrites)."""
    glued = glued.casefold()
    if len(glued) < 2:
        return []
    out: list[tuple[str, ...]] = []

    if glued == "no":
        out.append(("n", "o"))

    for proclitic in _BOUNDARY_PROCLITICS:
        if not glued.startswith(proclitic):
            continue
        rest = glued[len(proclitic) :]
        if len(rest) < 2 or not rest.isalpha():
            continue
        candidate = (proclitic, rest)
        if _is_recognized_split(candidate):
            out.append(candidate)
        for proclitic2 in _BOUNDARY_PROCLITICS:
            if not rest.startswith(proclitic2):
                continue
            rest2 = rest[len(proclitic2) :]
            if len(rest2) < 2 or not rest2.isalpha():
                continue
            candidate3 = (proclitic, proclitic2, rest2)
            if _is_recognized_split(candidate3):
                out.append(candidate3)

    for frag in _ORDINAL_FRAGMENTS:
        if not (glued.endswith(frag) and len(glued) > len(frag)):
            continue
        head = glued[: -len(frag)]
        if not (
            head.isdigit()
            or head.endswith("er")
            or head.endswith("re")
            or head in _ORDINAL_FRAGMENTS
        ):
            continue
        candidate = (head, frag)
        if _is_recognized_split(candidate):
            out.append(candidate)

    for prefix_len in (2, 3):
        if len(glued) <= prefix_len + 1:
            continue
        prefix = glued[:prefix_len]
        rest = glued[prefix_len:]
        if not prefix.isalpha() or not rest.isalpha():
            continue
        if rest in _BOUNDARY_PROCLITICS:
            pair = (prefix, rest)
            if _is_recognized_split(pair):
                out.append(pair)
        for proclitic in _BOUNDARY_PROCLITICS:
            if not rest.startswith(proclitic):
                continue
            rest2 = rest[len(proclitic) :]
            if rest2 and rest2.isalpha():
                triple = (prefix, proclitic, rest2)
                if _is_recognized_split(triple):
                    out.append(triple)
            elif not rest2:
                pair = (prefix, proclitic)
                if _is_recognized_split(pair):
                    out.append(pair)

    seen: set[tuple[str, ...]] = set()
    unique: list[tuple[str, ...]] = []
    for item in out:
        if item not in seen and "".join(item) == glued:
            seen.add(item)
            unique.append(item)
    return unique


def _is_recognized_split(parts: tuple[str, ...]) -> bool:
    """Accept only narrow proclitic / ordinal / N° boundaries."""
    if not (2 <= len(parts) <= 4):
        return False
    if any(not part for part in parts):
        return False
    if parts == ("n", "o"):
        return True
    for i in range(len(parts) - 1):
        left, right = parts[i], parts[i + 1]
        ok = (
            left in _BOUNDARY_PROCLITICS
            or right in _BOUNDARY_PROCLITICS
            or left in _ORDINAL_FRAGMENTS
            or right in _ORDINAL_FRAGMENTS
            or (left.isdigit() and right in _ORDINAL_FRAGMENTS)
            or (len(left) <= 3 and left.isalpha() and right in _BOUNDARY_PROCLITICS)
        )
        if not ok:
            return False
    return True


def article_first_differences_xml(
    content: bytes,
    md_body: str,
    *,
    limit: int = _FIRST_DIFF_REPORT_LIMIT,
) -> list[ArticleFirstDiff]:
    """Per-article first token divergence between AKN XML body and Markdown."""
    xml_articles = xml_article_word_streams(content)
    md_articles = markdown_article_word_streams(md_body)
    return first_article_differences(xml_articles, md_articles, limit=limit)


def xml_article_word_streams(content: bytes) -> list[tuple[str, list[str]]]:
    """Return ``(article_id, words)`` for each ``akn:article`` in document order."""
    parser = etree.XMLParser(huge_tree=True, recover=True)
    root = etree.fromstring(content, parser=parser)
    bodies = root.xpath(f"//*[local-name()='body' and namespace-uri()='{AKN_NS}']")
    if not bodies:
        bodies = root.xpath("//*[local-name()='body']")
    if not bodies:
        return []
    out: list[tuple[str, list[str]]] = []
    for article in bodies[0].xpath(".//*[local-name()='article']"):
        xml_id = article.get("id") or ""
        num_nodes = article.xpath("./*[local-name()='num']")
        num = " ".join("".join(num_nodes[0].itertext()).split()) if num_nodes else ""
        key = _article_key(xml_id or num or f"article-{len(out) + 1}")
        out.append((key, tokenize(_article_body_text(article))))
    return out


def _article_body_text(article: etree._Element) -> str:
    """Statutory text of an article excluding its own ``num`` label only."""
    parts: list[str] = []
    if article.text:
        parts.append(article.text)
    for child in article:
        if not isinstance(child.tag, str):
            continue
        qname = etree.QName(child)
        if qname.namespace == SCL_NS or qname.localname == "num":
            if child.tail:
                parts.append(child.tail)
            continue
        parts.append(" ")
        parts.append(_statutory_text(child))
        if child.tail:
            parts.append(" ")
            parts.append(child.tail)
    return " ".join("".join(parts).split()).replace("\u200b", "").replace("\ufeff", "").strip()


def markdown_article_word_streams(body: str) -> list[tuple[str, list[str]]]:
    """Return ``(article_id, words)`` for each anchored ``##`` provision in Markdown."""
    matches = list(_ARTICLE_ANCHOR_RE.finditer(body))
    if not matches:
        return []
    out: list[tuple[str, list[str]]] = []
    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        section = body[start:end]
        heading_cut = re.search(r"(?m)^#{2,6}\s+", section)
        if heading_cut:
            section = section[: heading_cut.start()]
        key = _article_key(match.group(1) or match.group(2) or f"article-{i + 1}")
        out.append((key, markdown_body_words(section)))
    return out


def first_article_differences(
    xml_articles: list[tuple[str, list[str]]],
    md_articles: list[tuple[str, list[str]]],
    *,
    limit: int = _FIRST_DIFF_REPORT_LIMIT,
) -> list[ArticleFirstDiff]:
    """Align articles by id (document order) and report the first token mismatch each."""
    md_queues: dict[str, deque[list[str]]] = defaultdict(deque)
    for article_id, words in md_articles:
        md_queues[article_id].append(words)

    diffs: list[ArticleFirstDiff] = []
    for article_id, xml_words in xml_articles:
        if len(diffs) >= limit:
            return diffs
        if not md_queues[article_id]:
            diffs.append(
                ArticleFirstDiff(
                    article_id=article_id,
                    index=0,
                    xml_len=len(xml_words),
                    md_len=0,
                    xml_window=tuple(xml_words[:_FIRST_DIFF_WINDOW]),
                    md_window=(),
                    kind="missing_in_md",
                )
            )
            continue
        md_words = md_queues[article_id].popleft()
        diff = _first_token_diff(xml_words, md_words)
        if diff is None:
            continue
        index, xml_window, md_window = diff
        diffs.append(
            ArticleFirstDiff(
                article_id=article_id,
                index=index,
                xml_len=len(xml_words),
                md_len=len(md_words),
                xml_window=tuple(xml_window),
                md_window=tuple(md_window),
                kind="mismatch",
            )
        )

    if len(diffs) < limit:
        for article_id, queue in md_queues.items():
            while queue and len(diffs) < limit:
                md_words = queue.popleft()
                diffs.append(
                    ArticleFirstDiff(
                        article_id=article_id,
                        index=0,
                        xml_len=0,
                        md_len=len(md_words),
                        xml_window=(),
                        md_window=tuple(md_words[:_FIRST_DIFF_WINDOW]),
                        kind="extra_in_md",
                    )
                )
    return diffs


def format_article_diff_report(diffs: list[ArticleFirstDiff]) -> str:
    if not diffs:
        return ""
    lines = ["per-article first differences:"]
    lines.extend(f"  - {diff.format_line()}" for diff in diffs)
    return "\n".join(lines)


def _article_key(raw: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", raw.casefold()).strip("-") or "article"


def _first_token_diff(
    xml_words: list[str],
    md_words: list[str],
    *,
    window: int = _FIRST_DIFF_WINDOW,
) -> tuple[int, list[str], list[str]] | None:
    n = min(len(xml_words), len(md_words))
    for i in range(n):
        if xml_words[i] != md_words[i]:
            return (
                i,
                xml_words[i : i + window],
                md_words[i : i + window],
            )
    if len(xml_words) != len(md_words):
        return (
            n,
            xml_words[n : n + window],
            md_words[n : n + window],
        )
    return None


def xml_body_words(content: bytes) -> list[str]:
    parser = etree.XMLParser(huge_tree=True, recover=True)
    root = etree.fromstring(content, parser=parser)
    bodies = root.xpath(f"//*[local-name()='body' and namespace-uri()='{AKN_NS}']")
    if not bodies:
        bodies = root.xpath("//*[local-name()='body']")
    if not bodies:
        return []
    return tokenize(_statutory_text(bodies[0]))


def html_body_words(content: bytes) -> list[str]:
    try:
        doc = etree.fromstring(content)
    except etree.XMLSyntaxError:
        doc = html.fromstring(content)
    articles = doc.xpath("//*[local-name()='div' and contains(@class,'richtext_article')]")
    if not articles:
        return tokenize(_statutory_text(doc))
    parts = [_statutory_text(article) for article in articles]
    return tokenize(" ".join(parts))


def markdown_body_words(body: str) -> list[str]:
    lines_out: list[str] = []
    skipped_title = False
    for line in body.splitlines():
        stripped = line.strip()
        if not skipped_title and stripped.startswith("# "):
            skipped_title = True
            continue
        if re.fullmatch(r'<a\s+id="[^"]*"></a>', stripped):
            continue
        stripped = re.sub(r"^#{1,6}\s+", "", stripped)
        stripped = re.sub(r"^[-*+]\s+", "", stripped)
        stripped = stripped.replace("|", " ")
        lines_out.append(stripped)
    return tokenize("\n".join(lines_out))


def tokenize(text: str) -> list[str]:
    words = WORD_RE.findall(text.casefold())
    words = _split_alpha_digit_runs(words)
    return _merge_ordinal_splits(words)


def _split_alpha_digit_runs(words: list[str]) -> list[str]:
    out: list[str] = []
    for word in words:
        parts = re.findall(r"[a-zà-ÿ]+|\d+", word, flags=re.IGNORECASE)
        if parts:
            out.extend(part.casefold() for part in parts)
        else:
            out.append(word)
    return out


def _merge_ordinal_splits(words: list[str]) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(words):
        if i + 1 < len(words) and words[i].isdigit() and words[i + 1] in _ORDINAL_FRAGMENTS:
            out.append(words[i] + words[i + 1])
            i += 2
            continue
        out.append(words[i])
        i += 1
    return out


_INLINE_TEXT_TAGS = frozenset(
    {
        "a",
        "abbr",
        "b",
        "del",
        "em",
        "embeddedText",
        "i",
        "inline",
        "ins",
        "ref",
        "s",
        "small",
        "span",
        "strong",
        "sub",
        "sup",
        "u",
    }
)


def _statutory_text(element: etree._Element) -> str:
    """Concatenate descendant text with spaces at block edges only."""
    parts: list[str] = []

    def walk(node: etree._Element) -> None:
        qname = etree.QName(node)
        if qname.namespace == SCL_NS or qname.localname in _SKIP_TAGS:
            return
        if node.text:
            parts.append(node.text)
        for child in node:
            if not isinstance(child.tag, str):
                continue
            child_tag = etree.QName(child).localname
            if child_tag not in _INLINE_TEXT_TAGS:
                parts.append(" ")
            walk(child)
            if child.tail:
                if child_tag not in _INLINE_TEXT_TAGS:
                    parts.append(" ")
                parts.append(child.tail)

    walk(element)
    return " ".join("".join(parts).split()).replace("\u200b", "").replace("\ufeff", "").strip()
