# Legilux Casemates — Legislation Retrieval

Operational guide for the Luxembourg adapter. `BLUEPRINT.md` remains authoritative for product rules; this file records the Casemates access patterns that work in practice.

## Overview

Luxembourg legislation on `legilux.public.lu` is rendered by a client-side Angular SPA — standard HTTP fetches of the website return an empty shell. The Casemates open-data layer provides machine-readable access via a SPARQL endpoint and a filestore for document manifestations (HTML, XML/LegalDocML, PDF, DOCX).

```text
ELI URI  →  SPARQL metadata  →  jolux:isExemplifiedBy  →  filestore URL  →  GET bytes
```

## Endpoint rules

| Rule | Detail |
|---|---|
| SPARQL URL | `http://data.legilux.public.lu/sparqlendpoint` |
| Method | HTTP `GET` with URL-encoded `query` and `format=json` |
| Do not use | `/sparql` (SPA editor UI only) |
| Do not use | SPARQL `POST` (often returns the HTML form) |
| Filestore | Always `GET` — `HEAD` returns 403 |

## JOLux predicates

| Predicate | Use |
|---|---|
| `jolux:isRealizedBy` | Work → Expression |
| `jolux:isEmbodiedBy` | Expression → Manifestation |
| `jolux:isExemplifiedBy` | Manifestation → filestore URL |
| `jolux:format` | Manifestation file type |
| `eli:title` | Title literal (`http://data.europa.eu/eli/ontology#title` and `http://www.europa.eu/eli/ontology#title` both appear in published data; prefer the data.europa.eu form in new queries, accept either when parsing) |
| `dcterms:modified` | Modification date when supplied |
| `jolux:license` | Licence URI (CC-BY 4.0 for Casemates) |

## Source selection for `lex`

Prefer complete LegalDocML/XML over HTML when both exist (blueprint §5.8). Retain the exact selected official bytes.

### Latest consolidation — Code civil (codes)

Codes use dated ELI paths without a `/consolide/` segment:

```sparql
SELECT ?work ?fileUrl WHERE {
  ?work a <http://data.legilux.public.lu/resource/ontology/jolux#Consolidation> .
  FILTER(CONTAINS(STR(?work), "eli/etat/leg/code/civil/"))
  ?work <http://data.legilux.public.lu/resource/ontology/jolux#isRealizedBy> ?expr .
  ?expr <http://data.legilux.public.lu/resource/ontology/jolux#isEmbodiedBy> ?manifest .
  ?manifest <http://data.legilux.public.lu/resource/ontology/jolux#isExemplifiedBy> ?fileUrl .
  FILTER(CONTAINS(STR(?manifest), "/xml"))
  FILTER(CONTAINS(STR(?fileUrl), "/fr/"))
}
ORDER BY DESC(STR(?work))
LIMIT 1
```

Verified current example (as of adapter authoring):

- Work: `http://data.legilux.public.lu/eli/etat/leg/code/civil/20251226`
- XML: `http://data.legilux.public.lu/filestore/eli/etat/leg/code/civil/20251226/fr/xml/eli-etat-leg-code-civil-20251226-fr-xml.xml`

### Latest consolidation — ordinary laws

Ordinary laws use `/consolide/YYYYMMDD`:

```sparql
SELECT ?consolidationDate ?fileUrl WHERE {
  ?work a <http://data.legilux.public.lu/resource/ontology/jolux#Consolidation> .
  FILTER(CONTAINS(STR(?work), "loi/2006/09/21/n1/consolide"))
  ?work <http://data.legilux.public.lu/resource/ontology/jolux#isRealizedBy> ?expr .
  ?expr <http://data.legilux.public.lu/resource/ontology/jolux#isEmbodiedBy> ?manifest .
  ?manifest <http://data.legilux.public.lu/resource/ontology/jolux#isExemplifiedBy> ?fileUrl .
  FILTER(CONTAINS(STR(?manifest), "/xml") || CONTAINS(STR(?manifest), "/html"))
  BIND(REPLACE(STR(?work), ".*consolide/", "") AS ?consolidationDate)
}
ORDER BY DESC(?consolidationDate)
LIMIT 1
```

### HTML manifestation for a known path fragment

```sparql
SELECT ?fileUrl WHERE {
  ?manifest <http://data.legilux.public.lu/resource/ontology/jolux#isExemplifiedBy> ?fileUrl .
  FILTER(
    CONTAINS(STR(?manifest), "loi/2006/09/21/n1") &&
    CONTAINS(STR(?manifest), "/html")
  )
}
LIMIT 5
```

## HTML structure notes (when XML is unavailable)

| Element | Pattern | Example |
|---|---|---|
| Article | `div#art_N` | `<div id="art_12" class="richtext_article">` |
| Paragraph | `div#paragraph_N` | `<div id="paragraph_42">` |
| Alinea text | `div.richtext_alinea > p` | Body paragraphs |
| Article number | `p.richtext_num_article` | `Art. 12.` |
| Paragraph number | `span.richtext_num_paragraph` | `(1)`, `(2)` |
| List items | `table.richtext_ul > tr > td.richtext_contentLI` | Bullets |
| Cross-refs | `a[href*="data.legilux.public.lu/eli"]` | Links to other laws |

Legilux HTML commonly uses U+2019 (`’`) rather than U+0027 (`'`).

## Available formats

| Format | Manifest suffix | Notes |
|---|---|---|
| XML | `/xml` | LegalDocML — preferred for `lex` |
| HTML | `/html` | Structured richtext — fallback |
| DOCX | `/docx` | Office |
| PDF | `/pdf` | Print layout |

## Gotchas

1. Website ELI pages are an Angular shell — do not scrape them for law text.
2. Filestore `HEAD` → 403; always `GET`.
3. SPARQL `POST` and `/sparql` are unreliable for machine clients.
4. Code consolidations and loi consolidations use different ELI path shapes.
5. Stage 1A publishes only `lu/code-civil`; discovery must not invent additional laws.
