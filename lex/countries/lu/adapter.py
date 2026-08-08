"""Luxembourg Casemates adapter — Stage 1B + Stage 2 catalog-backed registry."""

from __future__ import annotations

import json
import re
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlencode

from lxml import etree, html

from lex.adapters import LawRef, NormalizedLaw, SourceDocument
from lex.errors import ErrorCode, LexError
from lex.http import HttpClient
from lex.markdown import normalize_anchor

SPARQL_ENDPOINT = "http://data.legilux.public.lu/sparqlendpoint"
JOLUX = "http://data.legilux.public.lu/resource/ontology/jolux#"
AKN_NS = "http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD13"
SCL_NS = "http://www.scl.lu"
NSMAP = {"akn": AKN_NS, "scl": SCL_NS}

BROWSER_SHELL_MARKERS = (
    "<app-root",
    "ng-version=",
    "window.location",
    "Enable JavaScript",
)

HIERARCHY_LEVELS = {
    "book": 1,
    "part": 1,
    "title": 2,
    "chapter": 3,
    "subchapter": 3,
    # Casemates salary-scale annexes use <subtitle> for roman-lettered blocks
    # (e.g. "III. Magistrature", "II.a. Nouveau régime…"). Not in hierarchy →
    # <heading> children were skipped by the num/heading continue branch.
    "subtitle": 3,
    "section": 4,
    "subsection": 5,
}

DEFAULT_WARNING = (
    "Official consolidation. Cite the official ELI URI and publisher; "
    "lex is not the legal authority."
)
RECTIFICATION_WARNING = (
    "Official consolidation labelled « Version rectifiée applicable au 01/01/2025 ». "
    "Cite the official ELI URI and publisher; lex is not the legal authority."
)
CURRENT_WARNING = (
    "Official Journal text. Cite the official ELI URI and publisher; "
    "lex is not the legal authority."
)

FormatName = Literal["xml", "html"]


@dataclass(frozen=True)
class LawSpec:
    id: str
    document_type: str
    status: str
    format: FormatName
    languages: tuple[str, ...]
    title_fallback: str
    official_id: str
    work_eli: str
    sources: dict[str, str]
    resolve_latest: bool = False
    eli_fragment: str = ""
    warning_mode: Literal["default", "rectification", "current"] = "default"


# Batches included in discover(). Grow this as Stage 2 PRs merge.
ACTIVE_BATCHES: frozenset[str] = frozenset(
    {
        "stage-1b",
        "04-codes",
        "05-state-admin",
        "06-civil-family",
        "07-labor-social",
        "08-commercial-finance",
        "09-tax-finance",
        "10-health-welfare",
        "11-environment-energy",
        "12-education-culture",
        "13-transport",
        "14-security-data",
        "15-tail",
    }
)

_ELI_PREFIX = "http://data.legilux.public.lu/eli/"
_LEG_PREFIX = "http://data.legilux.public.lu/eli/etat/leg/"
_CATALOG_PATH = Path(__file__).resolve().parent / "batches" / "catalog.jsonl"

_FAMILY_DOCUMENT_TYPE: dict[str, str] = {
    "code": "code",
    "constitution": "constitution",
    "loi": "law",
}


def _filestore_url(work_eli: str, language: str, fmt: FormatName) -> str:
    if not work_eli.startswith(_ELI_PREFIX):
        raise ValueError(f"Unexpected work ELI: {work_eli}")
    path = work_eli[len(_ELI_PREFIX) :]
    slug = f"eli-{path.replace('/', '-')}-{language}-{fmt}.{fmt}"
    return f"http://data.legilux.public.lu/filestore/eli/{path}/{language}/{fmt}/{slug}"


def _official_id_from_work(work_eli: str) -> str:
    clean = re.sub(r"/consolide/\d{8}$", "", work_eli.rstrip("/"))
    clean = re.sub(r"/\d{8}$", "", clean)
    if clean.startswith(_LEG_PREFIX):
        return clean[len(_LEG_PREFIX) :]
    return clean


def _document_type_for(family: str) -> str:
    return _FAMILY_DOCUMENT_TYPE.get(family, "regulation")


def _title_fallback(title: str, stable_id: str) -> str:
    cleaned = title.strip()
    if cleaned:
        return cleaned
    return stable_id.removeprefix("lu/")


def _spec_from_catalog_row(row: dict[str, Any]) -> LawSpec:
    stable_id = str(row["stable_id"])
    work_eli = str(row["work_eli"])
    title = str(row.get("title") or "")
    family = str(row.get("document_family") or "loi")
    preferred = str(row.get("preferred_format") or "xml")
    if preferred not in {"xml", "html"}:
        raise ValueError(f"{stable_id}: unsupported preferred_format {preferred}")
    fmt: FormatName = "html" if preferred == "html" else "xml"
    warning_mode: Literal["default", "rectification", "current"] = (
        "rectification" if "rectifi" in title.casefold() else "default"
    )
    languages: tuple[str, ...] = ("fr", "de") if stable_id == "lu/constitution" else ("fr",)
    sources = {lang: _filestore_url(work_eli, lang, fmt) for lang in languages}
    official_id = _official_id_from_work(work_eli)
    if family == "code":
        # Prefer a short human label when the catalog title is a long consolidation banner.
        short = title.split(":", 1)[-1].strip() if ":" in title else title
        if short.lower().startswith("code"):
            official_id = short
        elif stable_id.startswith("lu/code-"):
            official_id = "Code " + stable_id.removeprefix("lu/code-").replace("-", " ")
    elif stable_id == "lu/constitution":
        official_id = "Constitution"
    return LawSpec(
        id=stable_id,
        document_type=_document_type_for(family),
        status="official_consolidation",
        format=fmt,
        languages=languages,
        title_fallback=_title_fallback(title, stable_id),
        official_id=official_id,
        work_eli=work_eli,
        sources=sources,
        warning_mode=warning_mode,
    )


# Journal memorial HTML — not present in the Consolidation catalog.
_EXTRA_SPECS: tuple[LawSpec, ...] = (
    LawSpec(
        id="lu/loi-2024-07-31-a339",
        document_type="law",
        status="official_current",
        format="html",
        languages=("fr",),
        title_fallback="Loi du 31 juillet 2024",
        official_id="loi/2024/07/31/a339",
        work_eli="http://data.legilux.public.lu/eli/etat/leg/loi/2024/07/31/a339/jo",
        sources={
            "fr": (
                "http://data.legilux.public.lu/filestore/eli/etat/leg/loi/2024/07/31/a339/"
                "jo/fr/html/eli-etat-leg-loi-2024-07-31-a339-jo-fr-html.html"
            ),
        },
        warning_mode="current",
    ),
)

# Per-ID overrides applied after catalog load (wins over catalog defaults).
_SPEC_OVERRIDES: dict[str, dict[str, Any]] = {
    "lu/code-civil": {
        "official_id": "Code civil",
        "title_fallback": "Code civil",
        "work_eli": "http://data.legilux.public.lu/eli/etat/leg/code/civil",
        "sources": {},
        "resolve_latest": True,
        "eli_fragment": "eli/etat/leg/code/civil/",
    },
    "lu/constitution": {
        "official_id": "Constitution",
        "title_fallback": "Constitution",
    },
    "lu/rgd-2024-12-20-a595": {
        "warning_mode": "rectification",
    },
}


def _load_laws() -> tuple[LawSpec, ...]:
    by_id: dict[str, LawSpec] = {spec.id: spec for spec in _EXTRA_SPECS}
    with _CATALOG_PATH.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            if row.get("skip_reason"):
                continue
            if row.get("batch") not in ACTIVE_BATCHES:
                continue
            spec = _spec_from_catalog_row(row)
            by_id[spec.id] = spec
    for law_id, overrides in _SPEC_OVERRIDES.items():
        base = by_id.get(law_id)
        if base is None:
            continue
        by_id[law_id] = LawSpec(
            id=base.id,
            document_type=overrides.get("document_type", base.document_type),
            status=overrides.get("status", base.status),
            format=overrides.get("format", base.format),
            languages=overrides.get("languages", base.languages),
            title_fallback=overrides.get("title_fallback", base.title_fallback),
            official_id=overrides.get("official_id", base.official_id),
            work_eli=overrides.get("work_eli", base.work_eli),
            sources=overrides.get("sources", base.sources),
            resolve_latest=overrides.get("resolve_latest", base.resolve_latest),
            eli_fragment=overrides.get("eli_fragment", base.eli_fragment),
            warning_mode=overrides.get("warning_mode", base.warning_mode),
        )
    return tuple(sorted(by_id.values(), key=lambda spec: spec.id))


LAWS: tuple[LawSpec, ...] = _load_laws()
LAWS_BY_ID: dict[str, LawSpec] = {spec.id: spec for spec in LAWS}


class LuxembourgAdapter:
    country_code = "lu"
    _seen_anchors: set[str]

    def discover(self, client: HttpClient) -> Sequence[LawRef]:
        refs: list[LawRef] = []
        for spec in LAWS:
            for language in spec.languages:
                if spec.resolve_latest:
                    latest = self._select_latest_xml(
                        self._sparql(client, self._discovery_query(spec.eli_fragment, language)),
                        prefer_format=spec.format,
                    )
                    if latest is None:
                        raise LexError(
                            ErrorCode.LEX_NOT_FOUND,
                            spec.id,
                            f"No {spec.format} consolidation found for {spec.id}",
                        )
                    work_uri, file_url = latest
                else:
                    work_uri = spec.work_eli
                    file_url = spec.sources[language]
                refs.append(
                    LawRef(
                        id=spec.id,
                        language=language,
                        source_url=file_url,
                        official_id=spec.official_id,
                        eli_uri=work_uri,
                    )
                )
        return refs

    def fetch(self, ref: LawRef, client: HttpClient) -> SourceDocument:
        spec = LAWS_BY_ID.get(ref.id)
        if spec is None:
            raise LexError(
                ErrorCode.LEX_INVALID_ID,
                ref.id,
                "Unknown Luxembourg law ID for LU adapter registry",
            )

        file_url = ref.source_url
        work_uri = ref.eli_uri or spec.work_eli
        if not file_url:
            if spec.resolve_latest:
                latest = self._select_latest_xml(
                    self._sparql(client, self._discovery_query(spec.eli_fragment, ref.language)),
                    prefer_format=spec.format,
                )
                if latest is None:
                    raise LexError(
                        ErrorCode.LEX_NOT_FOUND,
                        ref.id,
                        f"No {spec.format} consolidation found for {spec.id}",
                    )
                work_uri, file_url = latest
            else:
                file_url = spec.sources[ref.language]

        response = client.get(file_url)
        content = response.content
        self._reject_invalid_payload(content, response.url, expect_format=spec.format)

        consolidated_at = _date_from_work_uri(work_uri)
        published_at: date | None = None
        title = spec.title_fallback
        warning = _warning_for(spec)

        if spec.format == "xml":
            try:
                root = etree.fromstring(content)
            except etree.XMLSyntaxError as exc:
                raise LexError(
                    ErrorCode.LEX_INVALID_DATA,
                    response.url,
                    f"Invalid LegalDocML XML: {exc}",
                ) from exc
            meta_title = _jolux_value(root, "title")
            if meta_title:
                title = meta_title
            pub = _jolux_value(root, "publicationDate")
            if pub:
                published_at = _parse_jolux_date(pub) or published_at
            applicability = _jolux_value(root, "dateApplicability")
            if applicability:
                parsed = _parse_jolux_date(applicability)
                if parsed is not None:
                    consolidated_at = parsed
            if spec.warning_mode == "rectification":
                warning = _rectification_warning(root, title)
        else:
            title, published_at = _html_meta(content, title)

        return SourceDocument(
            content=content,
            extension=spec.format,
            final_url=response.url,
            media_type=response.media_type
            or ("application/xml" if spec.format == "xml" else "text/html"),
            retrieved_at=datetime.now(UTC),
            title=title,
            document_type=spec.document_type,
            status=spec.status,
            official_id=ref.official_id or spec.official_id,
            eli_uri=work_uri or ref.eli_uri,
            published_at=published_at,
            consolidated_at=consolidated_at if spec.status == "official_consolidation" else None,
            source_modified_at=None,
            warning=warning,
        )

    def normalize(self, ref: LawRef, source: SourceDocument) -> NormalizedLaw:
        if _looks_like_browser_shell(source.content):
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                ref.id,
                "Refusing to normalize browser-shell HTML",
            )
        spec = LAWS_BY_ID.get(ref.id)
        document_type = spec.document_type if spec else source.document_type
        if source.extension == "html" or (spec and spec.format == "html"):
            title, body = _normalize_html(source.content, source.title or "Untitled")
            return NormalizedLaw(title=title, document_type=document_type, body=body)

        try:
            root = etree.fromstring(source.content)
        except etree.XMLSyntaxError as exc:
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                ref.id,
                f"Invalid LegalDocML XML: {exc}",
            ) from exc

        title = source.title or _jolux_value(root, "title") or (spec.title_fallback if spec else "")
        body_el = root.find(f"{{{AKN_NS}}}body")
        if body_el is None:
            bodies = root.xpath("//akn:body", namespaces=NSMAP)
            body_el = bodies[0] if bodies else None
        if body_el is None:
            raise LexError(ErrorCode.LEX_INVALID_DATA, ref.id, "No akn:body in source")

        lines: list[str] = [f"# {title}", ""]
        self._seen_anchors = set()
        self._walk(body_el, lines)
        body = "\n".join(lines)
        body = re.sub(r"\n{3,}", "\n\n", body).strip() + "\n"
        return NormalizedLaw(title=title, document_type=document_type, body=body)

    def normalize_bytes(self, content: bytes, title: str = "Code civil") -> NormalizedLaw:
        """Test helper: normalize without a full SourceDocument."""
        return self.normalize(
            LawRef(id="lu/code-civil", language="fr", source_url="fixture://local"),
            SourceDocument(
                content=content,
                extension="xml",
                final_url="fixture://local",
                media_type="application/xml",
                retrieved_at=datetime(2026, 1, 1, tzinfo=UTC),
                title=title,
                document_type="code",
                status="official_consolidation",
            ),
        )

    def parse_discovery(self, payload: dict[str, Any]) -> LawRef:
        """Select latest XML Code civil from a SPARQL discovery payload (tests)."""
        latest = self._select_latest_xml(payload, prefer_format="xml")
        if latest is None:
            raise LexError(
                ErrorCode.LEX_NOT_FOUND,
                "lu/code-civil",
                "No XML consolidation in discovery payload",
            )
        work_uri, file_url = latest
        return LawRef(
            id="lu/code-civil",
            language="fr",
            source_url=file_url,
            official_id="Code civil",
            eli_uri=work_uri,
        )

    def _walk(self, element: etree._Element, lines: list[str]) -> None:
        for child in element:
            tag = etree.QName(child).localname
            ns = etree.QName(child).namespace
            if ns == SCL_NS or tag in {"meta", "preface", "toc", "tocItem"}:
                continue
            if tag in HIERARCHY_LEVELS:
                level = HIERARCHY_LEVELS[tag]
                num = _child_text(child, "num")
                heading = _child_text(child, "heading")
                label = " ".join(part for part in (num, heading) if part).strip()
                if label:
                    lines.append(f"{'#' * (level + 1)} {label}")
                    lines.append("")
                self._walk(child, lines)
            elif tag == "article":
                self._emit_article(child, lines)
            elif tag == "paragraph":
                self._emit_paragraph(child, lines)
            elif tag == "alinea":
                self._emit_container(child, lines)
            elif tag in _BLOCK_TAGS or tag == "content":
                self._emit_nodes(child, lines)
            elif tag == "authorialNote":
                text = _collapse_text(child)
                if text:
                    lines.append(text)
                    lines.append("")
            elif tag in {"num", "heading"}:
                continue
            elif tag in _EMBEDDED_DOC_TAGS:
                self._walk(child, lines)
            else:
                # Containers (quotedStructure, wrapUp, subdivision, intro, …)
                # and any other wrapper: emit nested structure, never drop prose.
                self._walk(child, lines)
                # Leaf-ish wrappers with only text/inline children.
                if not list(child) and (child.text or "").strip():
                    text = _collapse_text(child)
                    if text:
                        lines.append(text)
                        lines.append("")

    def _emit_article(self, article: etree._Element, lines: list[str]) -> None:
        xml_id = article.get("id")
        raw_id = xml_id or _child_text(article, "num") or "article"
        # Casemates sometimes distinguishes ids only by a trailing separator
        # (e.g. art_5- vs art_5). Preserve that marker after normalization.
        anchor = _normalize_xml_article_id(xml_id) if xml_id else normalize_anchor(raw_id)
        num = _child_text(article, "num") or raw_id
        seen = getattr(self, "_seen_anchors", None)
        if seen is not None and anchor in seen:
            # Embedded schedules often repeat official @id values. Emit the
            # provision label + body without a second HTML anchor.
            if num:
                lines.append(num)
                lines.append("")
            self._emit_article_body(article, lines)
            return
        if seen is not None:
            seen.add(anchor)
        lines.append(f'<a id="{anchor}"></a>')
        lines.append(f"## {num}")
        lines.append("")
        self._emit_article_body(article, lines)

    def _emit_article_body(self, article: etree._Element, lines: list[str]) -> None:
        """Emit all meaningful body children (alinea, paragraph, lists, nested articles)."""
        for child in article:
            self._emit_article_body_child(child, lines)

    def _emit_article_body_child(self, child: etree._Element, lines: list[str]) -> None:
        """Emit one article/hierarchy body child."""
        tag = etree.QName(child).localname
        ns = etree.QName(child).namespace
        if ns == SCL_NS or tag in _ARTICLE_SKIP_TAGS:
            return
        if tag == "heading":
            text = _collapse_text(child)
            if text:
                lines.append(text)
                lines.append("")
        elif tag == "alinea":
            self._emit_container(child, lines)
        elif tag == "paragraph":
            self._emit_paragraph(child, lines)
        elif tag == "subparagraph":
            self._emit_paragraph(child, lines)
        elif tag == "article":
            self._emit_article(child, lines)
        elif tag == "authorialNote":
            text = _collapse_text(child)
            if text:
                lines.append(text)
                lines.append("")
        elif tag in HIERARCHY_LEVELS:
            level = min(HIERARCHY_LEVELS[tag] + 2, 6)
            num = _child_text(child, "num")
            heading = _child_text(child, "heading")
            label = " ".join(part for part in (num, heading) if part).strip()
            if label:
                lines.append(f"{'#' * level} {label}")
                lines.append("")
            # Recurse without re-emitting <heading>: the label above already
            # includes it (otherwise ``A. Catégorie…`` appears twice).
            for grandchild in child:
                gtag = etree.QName(grandchild).localname
                gns = etree.QName(grandchild).namespace
                if (
                    gns == SCL_NS
                    or gtag in _ARTICLE_SKIP_TAGS
                    or gtag
                    in {
                        "num",
                        "heading",
                    }
                ):
                    continue
                self._emit_article_body_child(grandchild, lines)
        elif tag in _BLOCK_TAGS or tag == "content":
            self._emit_nodes(child, lines)
        elif tag in _EMBEDDED_DOC_TAGS:
            self._walk(child, lines)
        else:
            # subdivision / wrapUp / quotedStructure / unknown wrappers
            self._emit_article_body(child, lines)

    def _emit_paragraph(self, paragraph: etree._Element, lines: list[str]) -> None:
        num = _child_text(paragraph, "num")
        if num:
            lines.append(num)
            lines.append("")
        for child in paragraph:
            tag = etree.QName(child).localname
            ns = etree.QName(child).namespace
            if ns == SCL_NS or tag in _ARTICLE_SKIP_TAGS or tag == "num":
                continue
            if tag == "alinea":
                self._emit_container(child, lines)
            elif tag in {"paragraph", "subparagraph"}:
                self._emit_paragraph(child, lines)
            elif tag == "article":
                self._emit_article(child, lines)
            elif tag in HIERARCHY_LEVELS:
                self._emit_article_body(child, lines)
            elif tag in _BLOCK_TAGS or tag == "content":
                self._emit_nodes(child, lines)
            elif tag in _EMBEDDED_DOC_TAGS:
                self._walk(child, lines)
            else:
                self._emit_article_body(child, lines)

    def _emit_container(self, container: etree._Element, lines: list[str]) -> None:
        """Emit an alinea (or similar), preferring explicit <content> children."""
        contents = [child for child in container if etree.QName(child).localname == "content"]
        if contents:
            for content in contents:
                self._emit_nodes(content, lines)
            return
        self._emit_nodes(container, lines)

    def _emit_nodes(self, element: etree._Element, lines: list[str]) -> None:
        """Emit ``element`` as Markdown blocks (dispatch on element, then children)."""
        tag0 = etree.QName(element).localname
        # When called on a block node itself (e.g. ``_walk`` → ``_emit_nodes(ol)``),
        # handle it here. Walking only children would drop the node's own .text
        # once a child (``ref``, …) emits anything.
        if tag0 == "p":
            self._emit_p(element, lines)
            return
        if tag0 in {"ol", "ul"}:
            self._emit_html_list(element, lines, ordered=(tag0 == "ol"))
            return
        if tag0 == "list":
            self._emit_akn_list(element, lines)
            return
        if tag0 == "table":
            for block in _table_blocks(element):
                lines.append(block)
                lines.append("")
            return

        emitted = False
        for child in element:
            tag = etree.QName(child).localname
            ns = etree.QName(child).namespace
            if ns == SCL_NS or tag in {
                "authorialNote",
                "noteRef",
                "num",
                "heading",
                "toc",
                "tocItem",
            }:
                continue
            if tag == "article":
                self._emit_article(child, lines)
                emitted = True
            elif tag in _EMBEDDED_DOC_TAGS:
                self._walk(child, lines)
                emitted = True
            elif tag == "p":
                self._emit_p(child, lines)
                emitted = True
            elif tag in {"ol", "ul"}:
                self._emit_html_list(child, lines, ordered=(tag == "ol"))
                emitted = True
            elif tag == "list":
                self._emit_akn_list(child, lines)
                emitted = True
            elif tag == "table":
                for block in _table_blocks(child):
                    lines.append(block)
                    lines.append("")
                emitted = True
            elif tag == "content":
                self._emit_nodes(child, lines)
                emitted = True
            elif tag in {"mod", "ins", "del"}:
                before = len(lines)
                self._emit_nodes(child, lines)
                if len(lines) == before:
                    text = _collapse_text(child)
                    if text:
                        lines.append(text)
                        lines.append("")
                emitted = True
            elif tag in {"tbody", "thead", "tr"}:
                continue
            elif tag in {"paragraph", "subparagraph"}:
                self._emit_paragraph(child, lines)
                emitted = True
            elif tag == "alinea":
                self._emit_container(child, lines)
                emitted = True
            elif tag in HIERARCHY_LEVELS:
                self._emit_article_body(child, lines)
                emitted = True
            else:
                before = len(lines)
                self._emit_nodes(child, lines)
                if len(lines) == before:
                    text = _collapse_text(child)
                    if text:
                        lines.append(text)
                        lines.append("")
                emitted = True
        if not emitted:
            text = _collapse_text(element)
            if text:
                lines.append(text)
                lines.append("")

    def _emit_html_list(
        self,
        list_el: etree._Element,
        lines: list[str],
        *,
        ordered: bool = False,
        indent: int = 0,
    ) -> None:
        """Emit HTML lists; walk structural embeds instead of collapsing them."""
        del ordered
        pad = " " * indent
        for child in list_el:
            if etree.QName(child).localname != "li":
                continue
            # Keep raw text/tail pieces and join like ``_collapse_text`` / ``_emit_p``
            # ("" then whitespace-normalize). Joining with spaces breaks ``I``+``<sup>er``
            # into ``I er`` instead of ``Ier``.
            segments: list[str] = []
            inline_buf: list[str] = []
            embeds: list[tuple[etree._Element, str | None]] = []
            nested_lists: list[etree._Element] = []

            def flush_inline(buf: list[str], segs: list[str]) -> None:
                text = " ".join("".join(buf).split())
                buf.clear()
                if text:
                    segs.append(text)

            def take_inline(
                node: etree._Element,
                buf: list[str],
                segs: list[str],
                emb: list[tuple[etree._Element, str | None]],
                nest: list[etree._Element],
            ) -> None:
                if node.text:
                    buf.append(node.text)
                for sub in node:
                    stag = etree.QName(sub).localname
                    if stag in _EMBEDDED_DOC_TAGS:
                        flush_inline(buf, segs)
                        emb.append((sub, sub.tail))
                    elif stag in {"ol", "ul", "list"}:
                        flush_inline(buf, segs)
                        nest.append(sub)
                    elif stag == "p":
                        take_inline(sub, buf, segs, emb, nest)
                        if sub.tail:
                            buf.append(sub.tail)
                    else:
                        buf.append(_collapse_text_fragments(sub))
                        if sub.tail:
                            buf.append(sub.tail)

            if child.text:
                inline_buf.append(child.text)
            for sub in child:
                stag = etree.QName(sub).localname
                if stag in _EMBEDDED_DOC_TAGS:
                    flush_inline(inline_buf, segments)
                    embeds.append((sub, sub.tail))
                elif stag in {"ol", "ul", "list"}:
                    flush_inline(inline_buf, segments)
                    nested_lists.append(sub)
                elif stag == "p":
                    # Separate sibling <p> blocks with a space after normalize.
                    flush_inline(inline_buf, segments)
                    take_inline(sub, inline_buf, segments, embeds, nested_lists)
                    flush_inline(inline_buf, segments)
                    if sub.tail:
                        inline_buf.append(sub.tail)
                else:
                    inline_buf.append(_collapse_text_fragments(sub))
                    if sub.tail:
                        inline_buf.append(sub.tail)
            flush_inline(inline_buf, segments)

            main = " ".join(segments)
            if main:
                lines.append(f"{pad}- {main}")
                lines.append("")
            elif embeds or nested_lists:
                lines.append(f"{pad}-")
                lines.append("")

            for embed, tail in embeds:
                self._walk(embed, lines)
                if tail and tail.strip():
                    lines.append(" ".join(tail.split()))
                    lines.append("")
            for nested in nested_lists:
                ntag = etree.QName(nested).localname
                if ntag == "list":
                    self._emit_akn_list(nested, lines, indent=indent + 2)
                else:
                    self._emit_html_list(nested, lines, ordered=(ntag == "ol"), indent=indent + 2)

    def _emit_akn_list(self, list_el: etree._Element, lines: list[str], *, indent: int = 0) -> None:
        """Emit AKN ``<list>`` items; walk structural embeds when present."""
        pad = " " * indent
        for item in list_el:
            if etree.QName(item).localname not in {"point", "item", "li"}:
                # Some Casemates lists nest intro/points differently.
                if etree.QName(item).localname in _EMBEDDED_DOC_TAGS:
                    self._walk(item, lines)
                continue
            segments: list[str] = []
            inline_buf: list[str] = []
            embeds: list[tuple[etree._Element, str | None]] = []
            nested: list[etree._Element] = []

            def flush_inline_akn(buf: list[str], segs: list[str]) -> None:
                text = " ".join("".join(buf).split())
                buf.clear()
                if text:
                    segs.append(text)

            if item.text:
                inline_buf.append(item.text)
            for sub in item:
                stag = etree.QName(sub).localname
                if stag in _EMBEDDED_DOC_TAGS:
                    flush_inline_akn(inline_buf, segments)
                    embeds.append((sub, sub.tail))
                elif stag in {"list", "ol", "ul"}:
                    flush_inline_akn(inline_buf, segments)
                    nested.append(sub)
                elif stag in {"p", "content", "alinea"}:
                    if any(etree.QName(c).localname in _EMBEDDED_DOC_TAGS for c in sub):
                        flush_inline_akn(inline_buf, segments)
                        if sub.text:
                            inline_buf.append(sub.text)
                        for c in sub:
                            if etree.QName(c).localname in _EMBEDDED_DOC_TAGS:
                                flush_inline_akn(inline_buf, segments)
                                embeds.append((c, c.tail))
                            else:
                                inline_buf.append(_collapse_text_fragments(c))
                                if c.tail:
                                    inline_buf.append(c.tail)
                        flush_inline_akn(inline_buf, segments)
                    else:
                        flush_inline_akn(inline_buf, segments)
                        t = _collapse_text(sub)
                        if t:
                            segments.append(t)
                else:
                    inline_buf.append(_collapse_text_fragments(sub))
                if sub.tail and stag not in _EMBEDDED_DOC_TAGS:
                    inline_buf.append(sub.tail)
            flush_inline_akn(inline_buf, segments)
            main = " ".join(segments)
            if main:
                lines.append(f"{pad}- {main}")
                lines.append("")
            elif embeds or nested:
                lines.append(f"{pad}-")
                lines.append("")
            for embed, tail in embeds:
                self._walk(embed, lines)
                if tail and tail.strip():
                    lines.append(" ".join(tail.split()))
                    lines.append("")
            for nest in nested:
                ntag = etree.QName(nest).localname
                if ntag == "list":
                    self._emit_akn_list(nest, lines, indent=indent + 2)
                else:
                    self._emit_html_list(nest, lines, ordered=(ntag == "ol"), indent=indent + 2)

    def _emit_p(self, paragraph: etree._Element, lines: list[str]) -> None:
        """Emit an HTML/AKN ``<p>``, expanding nested structural embeds."""
        has_embed = any(etree.QName(c).localname in _EMBEDDED_DOC_TAGS for c in paragraph)
        if not has_embed:
            text = _collapse_text(paragraph)
            if text:
                lines.append(text)
                lines.append("")
            return

        # Split surrounding inline prose from structural embeds so amending
        # quotes keep their full wording and schedules keep their structure.
        buf: list[str] = []
        if paragraph.text:
            buf.append(paragraph.text)

        def flush() -> None:
            nonlocal buf
            text = " ".join("".join(buf).split())
            buf = []
            if text:
                lines.append(text)
                lines.append("")

        for sub in paragraph:
            stag = etree.QName(sub).localname
            if stag in _EMBEDDED_DOC_TAGS:
                flush()
                self._walk(sub, lines)
            else:
                buf.append(_collapse_text_fragments(sub))
            if sub.tail:
                buf.append(sub.tail)
        flush()

    def _sparql(self, client: HttpClient, query: str) -> dict[str, Any]:
        url = f"{SPARQL_ENDPOINT}?{urlencode({'query': query, 'format': 'json'})}"
        payload = client.get_json(url)
        if not isinstance(payload, dict):
            raise LexError(
                ErrorCode.LEX_NETWORK_ERROR, SPARQL_ENDPOINT, "Unexpected SPARQL payload"
            )
        return payload

    @staticmethod
    def _discovery_query(fragment: str, language: str = "fr") -> str:
        return f"""
SELECT ?work ?fileUrl WHERE {{
  ?work a <{JOLUX}Consolidation> .
  FILTER(CONTAINS(STR(?work), "{fragment}"))
  ?work <{JOLUX}isRealizedBy> ?expr .
  ?expr <{JOLUX}isEmbodiedBy> ?manifest .
  ?manifest <{JOLUX}isExemplifiedBy> ?fileUrl .
  FILTER(CONTAINS(STR(?manifest), "/xml") || CONTAINS(STR(?manifest), "/html"))
  FILTER(CONTAINS(STR(?fileUrl), "/{language}/"))
}}
ORDER BY DESC(STR(?work))
LIMIT 20
""".strip()

    @staticmethod
    def _select_latest_xml(
        payload: dict[str, Any],
        *,
        prefer_format: FormatName = "xml",
    ) -> tuple[str, str] | None:
        bindings = payload.get("results", {}).get("bindings", [])
        preferred: list[tuple[str, str]] = []
        fallback: list[tuple[str, str]] = []
        for row in bindings:
            work = row.get("work", {}).get("value")
            file_url = row.get("fileUrl", {}).get("value")
            if not work or not file_url:
                continue
            if f"/{prefer_format}" in file_url or file_url.endswith(f".{prefer_format}"):
                preferred.append((work, file_url))
            elif prefer_format == "xml" and "/xml" in file_url:
                preferred.append((work, file_url))
            elif prefer_format == "html" and "/html" in file_url:
                preferred.append((work, file_url))
            else:
                fallback.append((work, file_url))
        candidates = preferred or ([] if prefer_format == "xml" else fallback)
        # Stage 1A behaviour: when preferring XML, never fall back to HTML.
        if prefer_format == "xml":
            candidates = preferred
        if not candidates:
            return None
        candidates.sort(key=lambda item: item[0], reverse=True)
        return candidates[0]

    @staticmethod
    def _reject_invalid_payload(content: bytes, url: str, *, expect_format: FormatName) -> None:
        if _looks_like_browser_shell(content):
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                url,
                "Received browser-shell HTML instead of LegalDocML",
            )
        sample = content.lstrip()[:4000].lower()
        has_html_root = b"<html" in sample
        has_akn = b"akomantoso" in sample or b"<akn:" in sample
        if expect_format == "xml":
            if has_html_root and not has_akn:
                raise LexError(
                    ErrorCode.LEX_INVALID_DATA,
                    url,
                    "Expected XML/LegalDocML, received HTML",
                )
            return
        if not has_html_root:
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                url,
                "Expected HTML manifestation, received non-HTML",
            )


def _warning_for(spec: LawSpec) -> str:
    if spec.warning_mode == "rectification":
        return RECTIFICATION_WARNING
    if spec.warning_mode == "current":
        return CURRENT_WARNING
    return DEFAULT_WARNING


def _rectification_warning(root: etree._Element, title: str) -> str:
    if "rectifi" in title.lower():
        return (
            f"Official consolidation: {title}. "
            "Cite the official ELI URI and publisher; lex is not the legal authority."
        )
    # Prefer expression title if present.
    for node in root.xpath(".//scl:jolux[@scl:name='title']", namespaces=NSMAP):
        text = "".join(node.itertext()).strip()
        if text and "rectifi" in text.lower():
            return (
                f"Official consolidation: {text}. "
                "Cite the official ELI URI and publisher; lex is not the legal authority."
            )
    return RECTIFICATION_WARNING


def _looks_like_browser_shell(content: bytes) -> bool:
    sample = content[:8000].decode("utf-8", errors="ignore")
    return any(marker in sample for marker in BROWSER_SHELL_MARKERS)


def _date_from_work_uri(work_uri: str) -> date | None:
    match = re.search(r"/consolide/(\d{8})", work_uri)
    if not match:
        match = re.search(r"/(\d{8})(?:/|$)", work_uri)
    if not match:
        return None
    raw = match.group(1)
    return date(int(raw[0:4]), int(raw[4:6]), int(raw[6:8]))


_FR_MONTHS = {
    "janvier": 1,
    "fevrier": 2,
    "février": 2,
    "mars": 3,
    "avril": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7,
    "aout": 8,
    "août": 8,
    "septembre": 9,
    "octobre": 10,
    "novembre": 11,
    "decembre": 12,
    "décembre": 12,
}


def _parse_jolux_date(raw: str) -> date | None:
    """Parse Jolux date values (ISO or French long form)."""
    text = raw.strip()
    if not text:
        return None
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return date.fromisoformat(text)
    if re.fullmatch(r"\d{8}", text):
        return date(int(text[0:4]), int(text[4:6]), int(text[6:8]))
    match = re.fullmatch(
        r"(\d{1,2}|1er)\s+([A-Za-zéûôà]+)\s+(\d{4})",
        text,
        flags=re.IGNORECASE,
    )
    if match:
        day_raw = match.group(1).casefold()
        day = 1 if day_raw == "1er" else int(day_raw)
        month = _FR_MONTHS.get(match.group(2).casefold())
        year = int(match.group(3))
        if month is not None:
            return date(year, month, day)
    return None


def _normalize_xml_article_id(xml_id: str) -> str:
    """Normalize an AKN/Casemates article @id, preserving trailing separators."""
    lowered = xml_id.strip().lower()
    trailing_marker = bool(re.search(r"[^a-z0-9]+$", lowered))
    collapsed = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    if trailing_marker and collapsed:
        return f"{collapsed}-"
    return collapsed


def _jolux_value(root: etree._Element, name: str) -> str | None:
    nodes = root.xpath(
        f".//scl:jolux[@scl:name='{name}']",
        namespaces=NSMAP,
    )
    for node in nodes:
        text = "".join(node.itertext()).strip()
        if text:
            return text
    return None


def _child_text(element: etree._Element, localname: str) -> str:
    child = element.find(f"{{{AKN_NS}}}{localname}")
    if child is None:
        return ""
    return " ".join("".join(child.itertext()).split())


_ARTICLE_SKIP_TAGS = frozenset(
    {
        "JOLUXWork",
        "indexterms",
        "num",
        "meta",
        "preface",
        "toc",
        "tocItem",
    }
)
_BLOCK_TAGS = frozenset({"p", "ol", "ul", "list", "table", "tbody", "thead"})
# Structural embeds that contain nested AKN provisions. Inline quote wrappers
# (embeddedText, inline) are NOT included — they must stay in paragraph
# collapse via itertext(); walking them as documents drops their .text.
_EMBEDDED_DOC_TAGS = frozenset(
    {
        "embeddedStructure",
        "attachments",
        "attachment",
        "components",
        "component",
        "doc",
        "mainBody",
        "quotedStructure",
        "subFlow",
    }
)


def _append_blocks(lines: list[str], blocks: list[str]) -> None:
    for block in blocks:
        text = block.strip()
        if text:
            lines.append(text)
            lines.append("")


def _collapse_text(element: etree._Element) -> str:
    """Visible text with spaces at block edges; inline tags stay glued (``1er``)."""
    return (
        " ".join(_collapse_text_fragments(element).split())
        .replace("\u200b", "")
        .replace("\ufeff", "")
        .strip()
    )


def _collapse_text_fragments(element: etree._Element) -> str:
    """Like ``_collapse_text`` but keep edge spaces for parent-buffer assembly.

    Normalizing each inline child alone would turn ``<i>bis </i>est`` into
    ``bis`` + ``est`` → ``bisest``. Parents must normalize only after joining.
    """
    parts: list[str] = []

    def walk(node: etree._Element) -> None:
        if etree.QName(node).namespace == SCL_NS:
            return
        if node.text:
            parts.append(node.text)
        for child in node:
            if not isinstance(child.tag, str):
                continue
            tag = etree.QName(child).localname
            if tag not in _INLINE_TEXT_TAGS:
                parts.append(" ")
            walk(child)
            if child.tail:
                if tag not in _INLINE_TEXT_TAGS:
                    parts.append(" ")
                parts.append(child.tail)

    walk(element)
    return "".join(parts).replace("\u200b", "").replace("\ufeff", "")


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


def _container_blocks(container: etree._Element) -> list[str]:
    """Blocks from an alinea (or similar) preferring explicit <content> children."""
    contents = [child for child in container if etree.QName(child).localname == "content"]
    if contents:
        blocks: list[str] = []
        for content in contents:
            blocks.extend(_node_blocks(content))
        return blocks
    return _node_blocks(container)


def _node_blocks(element: etree._Element) -> list[str]:
    """Walk direct children in document order into Markdown blocks."""
    blocks: list[str] = []
    for child in element:
        tag = etree.QName(child).localname
        ns = etree.QName(child).namespace
        if ns == SCL_NS or tag in {"authorialNote", "noteRef", "num", "heading", "toc", "tocItem"}:
            continue
        if tag == "p":
            text = _collapse_text(child)
            if text:
                blocks.append(text)
        elif tag in {"ol", "ul"}:
            blocks.extend(_html_list_blocks(child, ordered=(tag == "ol")))
        elif tag == "list":
            blocks.extend(_akn_list_blocks(child))
        elif tag == "table":
            blocks.extend(_table_blocks(child))
        elif tag == "content":
            blocks.extend(_node_blocks(child))
        elif tag in {"mod", "ins", "del"}:
            # Preserve amending/inserted text; skip empty wrappers.
            nested = _node_blocks(child)
            if nested:
                blocks.extend(nested)
            else:
                text = _collapse_text(child)
                if text:
                    blocks.append(text)
        elif tag in {"tbody", "thead", "tr"}:
            # Tables are handled at table level; ignore stray rows here.
            continue
        else:
            # Unknown container: try structured children, else visible text.
            nested = _node_blocks(child)
            if nested:
                blocks.extend(nested)
            else:
                text = _collapse_text(child)
                if text:
                    blocks.append(text)
    if not blocks:
        text = _collapse_text(element)
        if text:
            blocks.append(text)
    return blocks


def _html_list_blocks(list_el: etree._Element, *, ordered: bool, indent: int = 0) -> list[str]:
    """Emit ``<ol>/<ul>`` items as Markdown bullets without inventing counters."""
    del ordered  # retained for callers; never synthesize 1./2. numerals
    lines: list[str] = []
    pad = " " * indent
    for child in list_el:
        if etree.QName(child).localname != "li":
            continue
        marker = "-"
        text_parts: list[str] = []
        nested_lists: list[etree._Element] = []
        if child.text and child.text.strip():
            text_parts.append(child.text.strip())
        for sub in child:
            stag = etree.QName(sub).localname
            if stag in {"ol", "ul"}:
                nested_lists.append(sub)
            elif stag == "p":
                t = _collapse_text(sub)
                if t:
                    text_parts.append(t)
            elif stag == "list":
                nested_lists.append(sub)
            else:
                t = _collapse_text(sub)
                if t:
                    text_parts.append(t)
            if sub.tail and sub.tail.strip():
                text_parts.append(sub.tail.strip())
        main = " ".join(" ".join(text_parts).split())
        if main:
            lines.append(f"{pad}{marker} {main}")
        elif nested_lists:
            lines.append(f"{pad}{marker}")
        else:
            continue
        for nested in nested_lists:
            ntag = etree.QName(nested).localname
            if ntag == "list":
                lines.extend(_akn_list_blocks(nested, indent=indent + 2))
            else:
                lines.extend(_html_list_blocks(nested, ordered=(ntag == "ol"), indent=indent + 2))
    return lines


def _akn_list_blocks(list_el: etree._Element, indent: int = 0) -> list[str]:
    """AKN <list>/<point> structure → Markdown list lines."""
    lines: list[str] = []
    pad = " " * indent
    index = 0
    for child in list_el:
        if etree.QName(child).localname != "point":
            continue
        index += 1
        num = _child_text(child, "num")
        marker = num if num else f"{index}."
        text_parts: list[str] = []
        nested: list[etree._Element] = []
        for sub in child:
            stag = etree.QName(sub).localname
            if stag in {"num", "heading"}:
                continue
            if stag in {"list", "ol", "ul"}:
                nested.append(sub)
            elif stag == "p":
                t = _collapse_text(sub)
                if t:
                    text_parts.append(t)
            elif stag in {"content", "alinea"}:
                text_parts.extend(_container_blocks(sub))
            else:
                t = _collapse_text(sub)
                if t:
                    text_parts.append(t)
        main = " ".join(" ".join(part for part in text_parts if part).split())
        if main:
            lines.append(f"{pad}{marker} {main}")
        elif nested:
            lines.append(f"{pad}{marker}")
        for item in nested:
            ntag = etree.QName(item).localname
            if ntag == "list":
                lines.extend(_akn_list_blocks(item, indent=indent + 2))
            else:
                lines.extend(_html_list_blocks(item, ordered=(ntag == "ol"), indent=indent + 2))
    return lines


def _table_blocks(table: etree._Element) -> list[str]:
    rows: list[list[str]] = []
    for tr in table.xpath(".//*[local-name()='tr']"):
        cells: list[str] = []
        for cell in tr:
            if etree.QName(cell).localname in {"td", "th"}:
                cells.append(_collapse_text(cell))
        if any(cells):
            rows.append(cells)
    if not rows:
        text = _collapse_text(table)
        return [text] if text else []
    width = max(len(row) for row in rows)
    normalized = [row + [""] * (width - len(row)) for row in rows]
    lines = ["| " + " | ".join(normalized[0]) + " |"]
    lines.append("| " + " | ".join("---" for _ in range(width)) + " |")
    for row in normalized[1:]:
        lines.append("| " + " | ".join(row) + " |")
    return ["\n".join(lines)]


def _alinea_text(alinea: etree._Element) -> str:
    """Backward-compatible flat text join (tests / callers). Prefer _container_blocks."""
    return " ".join(_container_blocks(alinea))


def _html_meta(content: bytes, fallback_title: str) -> tuple[str, date | None]:
    title = fallback_title
    published_at: date | None = None
    text = content.decode("utf-8", errors="replace")
    # JSON-LD block when present.
    match = re.search(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        text,
        re.DOTALL | re.IGNORECASE,
    )
    if match:
        try:
            data = json.loads(match.group(1))
            if isinstance(data, dict):
                name = data.get("name")
                if isinstance(name, str) and name.strip():
                    title = name.strip()
                pub = data.get("datePublished")
                if isinstance(pub, str) and pub:
                    published_at = date.fromisoformat(pub[:10])
        except json.JSONDecodeError:
            pass
    return title, published_at


def _normalize_html(content: bytes, fallback_title: str) -> tuple[str, str]:
    if _looks_like_browser_shell(content):
        raise LexError(
            ErrorCode.LEX_INVALID_DATA,
            "html",
            "Refusing to normalize browser-shell HTML",
        )
    # Legilux HTML is XHTML; the HTML parser relocates <p> inside <h1>, so parse as XML.
    try:
        doc = etree.fromstring(content)
    except etree.XMLSyntaxError:
        doc = html.fromstring(content)

    title = fallback_title
    h1_nodes = doc.xpath(
        "//*[local-name()='h1' and (@id='intituleAct' or contains(@class,'richtext_longTitle'))]"
    )
    if h1_nodes:
        heading = _element_text(h1_nodes[0])
        if heading:
            title = heading
    if title == fallback_title:
        meta_title, _ = _html_meta(content, fallback_title)
        title = meta_title

    lines: list[str] = [f"# {title}", ""]
    articles = doc.xpath("//*[local-name()='div' and contains(@class,'richtext_article')]")
    if not articles:
        raise LexError(ErrorCode.LEX_INVALID_DATA, "html", "No richtext_article elements found")

    for article in articles:
        raw_id = article.get("id") or "article"
        anchor = normalize_anchor(raw_id)
        num_nodes = article.xpath(
            ".//*[local-name()='p' and contains(@class,'richtext_num_article')]"
        )
        num = _element_text(num_nodes[0]) if num_nodes else raw_id
        lines.append(f'<a id="{anchor}"></a>')
        lines.append(f"## {num}")
        lines.append("")
        for alinea in article.xpath(
            ".//*[local-name()='div' and contains(@class,'richtext_alinea')]"
        ):
            for block in _html_alinea_blocks(alinea):
                lines.append(block)
                lines.append("")

    body = "\n".join(lines)
    body = re.sub(r"\n{3,}", "\n\n", body).strip() + "\n"
    return title, body


def _html_alinea_blocks(alinea: etree._Element) -> list[str]:
    blocks: list[str] = []
    # Prefer document-order walk of direct richtext children when present.
    for child in alinea:
        tag = etree.QName(child).localname.casefold()
        classes = child.get("class") or ""
        if tag == "p" and "richtext_num_article" in classes:
            continue
        if tag == "p" and "richtext_p" in classes:
            text = _element_text(child)
            if text:
                blocks.append(text)
            continue
        if tag in {"ol", "ul"}:
            blocks.extend(_html_list_blocks(child, ordered=(tag == "ol")))
            continue
        if tag == "table":
            # Legilux HTML lists often encoded as tables with richtext_elementLI rows.
            li_rows = child.xpath(
                ".//*[local-name()='tr' and contains(@class,'richtext_elementLI')]"
            )
            if li_rows:
                for row in li_rows:
                    num_cells = row.xpath(
                        ".//*[local-name()='td' and contains(@class,'richtext_numLI')]"
                    )
                    content_cells = row.xpath(
                        ".//*[local-name()='td' and contains(@class,'richtext_contentLI')]"
                    )
                    num = _element_text(num_cells[0]) if num_cells else ""
                    content = _element_text(content_cells[0]) if content_cells else ""
                    if num and content:
                        blocks.append(f"{num} {content}")
                    elif content:
                        blocks.append(content)
            else:
                blocks.extend(_table_blocks(child))
            continue
    if blocks:
        return blocks
    for p in alinea.xpath(".//*[local-name()='p' and contains(@class,'richtext_p')]"):
        classes = p.get("class") or ""
        if "richtext_num_article" in classes:
            continue
        text = _element_text(p)
        if text:
            blocks.append(text)
    for row in alinea.xpath(".//*[local-name()='tr' and contains(@class,'richtext_elementLI')]"):
        num_cells = row.xpath(".//*[local-name()='td' and contains(@class,'richtext_numLI')]")
        content_cells = row.xpath(
            ".//*[local-name()='td' and contains(@class,'richtext_contentLI')]"
        )
        num = _element_text(num_cells[0]) if num_cells else ""
        content = _element_text(content_cells[0]) if content_cells else ""
        if num and content:
            blocks.append(f"{num} {content}")
        elif content:
            blocks.append(content)
    if not blocks:
        for list_el in alinea.xpath(".//*[local-name()='ol' or local-name()='ul']"):
            tag = etree.QName(list_el).localname.casefold()
            blocks.extend(_html_list_blocks(list_el, ordered=(tag == "ol")))
    if not blocks:
        text = _element_text(alinea)
        if text:
            blocks.append(text)
    return blocks


def _element_text(element: etree._Element) -> str:
    text = " ".join("".join(element.itertext()).split())
    return text.replace("\u200b", "").replace("\ufeff", "").strip()


adapter = LuxembourgAdapter()
