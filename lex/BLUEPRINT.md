# `lex`: authoritative repository build specification

**Repository:** `clarvia-org/lex`  
**Project name:** `lex`  
**Python distribution:** `clarvia-lex`  
**Python import package:** `lex`  
**CLI command:** `lex`  
**Status:** Normative build specification  
**Revision:** 2026-07-21  
**Operating boundary:** one maintainer, one review team, 1–5 countries, GitHub-only infrastructure, €0/month

> **Mission:** Make current national legislation available to AI agents in one predictable format, regardless of how each country publishes its law.
>
> **Version 1 success test:** An agent can retrieve the current text of a provision in any supported country without knowing that country’s publishing system.

## How to use this document

This document is the sole architectural and implementation authority for version 1 of `lex`.

- Implementation agents **MUST** follow it.
- Other repository documents **MUST** agree with it.
- An implementation agent **MUST NOT** introduce an architecture, dependency, field, command, directory, workflow, or data behavior that this document does not authorize.
- When this document does not determine a material choice, the agent **MUST stop and ask the maintainer**. It must not guess.
- Only a maintainer-approved edit to `BLUEPRINT.md` changes the specification.
- Pull requests that conflict with this document **MUST NOT merge**.

The terms **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are normative.

---

## 1. Executive recommendation

### 1.1 Product definition

`lex` is a public, Git-native legal-data infrastructure project.

The product is **cross-country normalization**:

- one repository;
- one law-directory pattern;
- one normalized Markdown contract;
- one metadata contract;
- one adapter contract;
- one CLI contract;
- one review and publication process.

For version 1, the files in Git are the dataset. Users retrieve data by:

1. browsing Markdown on GitHub;
2. downloading one file from a raw GitHub URL;
3. cloning the repository;
4. using the local `lex` CLI.

Every published law-language record contains:

```text
one normalized current Markdown file
+ one selected official source file
+ provenance and rights metadata in frontmatter
```

`lex` is not the official publisher. The official source URL or official identifier is always the legal citation target.

### 1.2 Version 1 scope

Version 1 contains:

- current national legislation from official sources only;
- the latest official current text or latest official consolidation for each published language;
- normalized Markdown;
- one selected official source file per language;
- official identifiers and citation URL;
- SHA-256 of the retained source file;
- source-specific licence, attribution, and terms metadata;
- a `status` field and optional `warning` field;
- direct GitHub browsing;
- a local CLI;
- manual, pull-request-based updates.

A country may be partially covered. The files under `countries/<cc>/laws/` are the complete list of what `lex` publishes for that country.

### 1.3 Version 1 exclusions

Version 1 **MUST NOT** include:

- point-in-time legal retrieval;
- historical-version directories;
- a promise of all versions from 2000 onward;
- amendment, repeal, commencement, consolidation, or transposition graphs;
- reconstructed consolidations;
- cross-version provision identity;
- every manifestation offered by the official source;
- OCR of scanned documents;
- AI summaries, classifications, explanations, translations, or legal advice;
- SQLite, Parquet, RDF, JSON-LD, a knowledge graph, embeddings, or vector search;
- a hosted API, MCP server, public website, database service, object store, CDN, or paid infrastructure;
- Git LFS;
- scheduled update jobs;
- duplicate corpus archives in GitHub Releases.

Git history is repository audit history. It is not an authoritative legal-version API.

### 1.4 Foundation decision

`lex` **MUST be built as a new monorepo**. It **MUST NOT** fork or adopt an existing legal-data platform wholesale.

Existing projects may be used as follows:

| Project or standard | Required treatment |
|---|---|
| Legalize | Inspect and reuse licence-compatible source-specific parser code or fixtures only after verifying the upstream licence, commit, live source behavior, and required notices. Do not depend on Legalize at runtime. |
| `tggo/lex` and Luxembourg ELI connectors | Use as source-behavior references only. Do not adopt their database, graph, MCP, or service architecture. |
| Laws.Africa Indigo/Bluebell and Open Legal Data Platform | Use parser and validation ideas only. Do not use them as foundations or dependencies. |
| ELI and official Akoma Ntoso/LegalDocML | Preserve official identifiers and official source files when supplied. Do not convert every country into those standards. |
| Unofficial mirrors and training corpora | Do not ingest them as authoritative legislation. |

No third-party ingestion dependency is required in version 1.

### 1.5 Scale boundary

The monorepo design is authorized for:

- no more than five countries;
- packed Git repository size below 900 MiB;
- no individual retained source file above 50 MiB without maintainer approval;
- clone and CI behavior that remains practical on GitHub-hosted runners.

The following are hard stop conditions:

- a sixth country is ready to merge;
- packed Git size reaches 900 MiB;
- a required source file exceeds 50 MiB;
- a normal CI run exceeds 15 minutes because of corpus size;
- a clean clone on a GitHub-hosted runner exceeds 120 seconds in repeated measurements;
- more than one active country-review team is required.

When a stop condition occurs, implementation and corpus expansion **MUST stop** until the maintainer amends this blueprint. Agents must not select a storage or repository-splitting solution themselves.

---

## 2. Landscape decisions

The landscape review has produced these binding decisions:

1. `lex` is a Git repository and dataset, not a legal publishing platform.
2. Official sources are the only data authorities.
3. Normalized Markdown is the shared agent format.
4. Official XML, HTML, JSON, PDF, or DOCX is retained beside the Markdown as audit evidence.
5. Official ELI, LegalDocML, Akoma Ntoso, or national identifiers are preserved when present.
6. No universal legal ontology is introduced.
7. No live third-party mirror is a required runtime dependency.
8. No hosted service is built in version 1.
9. Source-specific open-source code may be copied only with licence and attribution review recorded in the pull request.
10. Cross-country consistency has priority over preserving every source-specific metadata field in the global model.

These decisions are complete for version 1. Implementation agents do not need to repeat the landscape research.

---

## 3. User model

### 3.1 Primary agent operations

The repository **MUST** optimize for these operations in this order:

1. stable law ID → current normalized law;
2. stable law ID + provision anchor → only that provision;
3. search text/title → matching stable law IDs;
4. law → official source URL and official identifier;
5. law → retained official source file and checksum;
6. clone → offline retrieval;
7. Git commit or tag → reproducible repository state.

### 3.2 Secondary users

Secondary users are:

- contributors adding laws or country adapters;
- reviewers comparing normalized output with official source files;
- maintainers updating a country;
- researchers and downstream developers using the current-law corpus.

GitHub is the human browsing and contribution interface.

### 3.3 Retrieval priorities

| Priority | Operation | Required result |
|---|---|---|
| P0 | Get current law | One predictable Markdown file. |
| P0 | Get provision | Only the selected provision and descendants. |
| P0 | Cite authority | Official URL or official URI. |
| P0 | Audit source | Adjacent retained source file with verified SHA-256. |
| P1 | Search | Stable IDs and compact result metadata. |
| P1 | Browse | Readable GitHub-rendered Markdown. |
| P1 | Reproduce | Pin a Git tag or commit. |

### 3.4 Token rules

- Provision retrieval **MUST NOT** return unrelated provisions.
- Search results **MUST** be compact.
- Frontmatter **MUST** contain only fields defined in this blueprint.
- Markdown prose **MUST NOT** be hard-wrapped.
- The CLI **MUST NOT** return raw source bytes unless explicitly requested through the `source` command.

---

## 4. Scope and publication rules

### 4.1 Publishable unit

The canonical publishable unit is a **law-language record**.

A record may merge only when all of the following exist:

- stable `lex` ID;
- normalized current Markdown;
- one retained official source file;
- official identifier;
- official source URL;
- valid source checksum;
- verified source rights metadata;
- status and optional warning;
- human source review.

### 4.2 Included material

Version 1 may publish national:

- constitutions;
- codes;
- laws and acts;
- national regulations and decrees with legislative effect;
- official annexes that form part of a published law.

A country adapter publishes only document families explicitly named in that country’s `README.md`.

### 4.3 Excluded material

Version 1 does not publish:

- case law;
- municipal law;
- collective agreements;
- administrative circulars;
- informal guidance;
- legislative-process documents;
- commentary or doctrine;
- EU legislation as a substitute for national legislation;
- unofficial translations;
- repealed laws in the current working tree;
- future texts that are not yet current;
- documents requiring OCR.

### 4.4 Current-text selection algorithm

For each law and language, the adapter **MUST** apply this exact selection order:

1. Select an official text explicitly identified by the publisher as current.
2. Otherwise select the latest official consolidation.
3. If the latest official consolidation may omit a later known amendment, publish it only with one concise `warning`.
4. If the adapter cannot determine a defensible current or latest official text, omit the law.
5. Never combine several instruments to create a reconstructed text.

Allowed `status` values are:

```text
official_current
official_consolidation
```

### 4.5 Repeal and removal

A law directory is removed from `main` only when a maintainer verifies from an official source that the law is no longer current.

- A 404 is not proof of repeal.
- Disappearance from discovery results is not proof of repeal.
- Automated updates **MUST NOT** delete a published law.
- Removal requires a reviewed pull request that links the official evidence.

The removed files remain in Git history, but `lex` does not expose them as a legal point-in-time service.

### 4.6 Pre-2000 material

A pre-2000 law is included when it is current and the official source provides a usable current text. Its historical versions are not included.

### 4.7 Languages

- Each official language text is a separate law-language record.
- The country `default_language` uses `current.md` and `source.<ext>`.
- Other languages use `current.<lang>.md` and `source.<lang>.<ext>`.
- `<lang>` is a lowercase ISO 639-1 code when one exists.
- The adapter **MUST NOT** translate text.
- The adapter **MUST NOT** infer that language versions are legally equivalent.

### 4.8 Country coverage

- `countries/<cc>/laws/` is the coverage list.
- No law-by-law coverage manifest is permitted.
- `countries/<cc>/source.yml` contains `coverage: partial` or `coverage: complete`.
- New countries start as `partial`.
- Only the maintainer may change a country to `complete`.

---

## 5. Canonical data model

### 5.1 Stable law IDs

The stable ID format is:

```text
<country>/<slug>
```

Rules:

- `<country>` is lowercase ISO 3166-1 alpha-2.
- `<slug>` is lowercase ASCII, digits, and hyphens only.
- Established IDs never change because a title changes.
- IDs are unique across all language files for the same law.
- Language is selected separately and is not part of the stored `id`.

Slug generation order:

1. For a constitution or code with a durable official short name, use that name, for example `constitution` or `code-civil`.
2. For an ordinary instrument, derive the slug only from durable official identifier components, never from a descriptive title.
3. For Luxembourg ordinary instruments, use:

```text
<eli-type>-YYYY-MM-DD-<eli-number>
```

Example:

```text
lu/loi-2006-09-21-n1
```

4. When an official identifier cannot be converted without ambiguity, the agent must ask the maintainer before publishing the first record of that source family.

The CLI addresses another language as:

```text
lu/code-civil@de
```

The `@de` suffix is a CLI convenience and is not stored in `id`.

### 5.2 Law directory contract

Default language:

```text
countries/lu/laws/code-civil/
├── current.md
└── source.xml
```

Additional language:

```text
countries/lu/laws/example-law/
├── current.md
├── source.xml
├── current.de.md
└── source.de.xml
```

Rules:

- Every normalized file has exactly one adjacent retained source file.
- Source filenames are `source.<ext>` or `source.<lang>.<ext>`.
- The retained extension is the real source format.
- Equivalent manifestations are not duplicated.
- Generated indexes and caches are forbidden inside law directories.

### 5.3 Country source metadata

Every country has `countries/<cc>/source.yml` with exactly these fields:

```yaml
country: lu
publisher: "Service central de législation"
homepage: "https://legilux.public.lu/"
default_language: fr
coverage: partial
source_license: CC-BY-4.0
source_attribution: "Service central de législation, Luxembourg"
source_terms_url: "https://data.legilux.public.lu/home/intro"
rights_reviewed_at: 2026-07-21
```

Rules:

- `country`, `publisher`, `homepage`, `default_language`, `coverage`, `source_license`, `source_attribution`, `source_terms_url`, and `rights_reviewed_at` are required.
- `source_license` uses an SPDX identifier when one accurately applies.
- When no standard licence applies, use `official-work` or `custom` and explain the legal basis in the country README.
- A law may not merge when `rights_reviewed_at` is missing or the rights review is unresolved.
- Country endpoints and parser settings belong in `adapter.py`, not in `source.yml`.

### 5.4 Normalized-law frontmatter

Every normalized file begins with YAML frontmatter in this exact field order:

```yaml
---
id: lu/code-civil
country: lu
title: "Code civil"
language: fr
document_type: code
status: official_consolidation
official_id: "<official identifier>"
eli_uri: "<official ELI URI>"
source_url: "<official URL of selected text>"
source_file: source.xml
source_sha256: "<64 lowercase hexadecimal characters>"
source_license: CC-BY-4.0
source_attribution: "Service central de législation, Luxembourg"
source_terms_url: "https://data.legilux.public.lu/home/intro"
rights_reviewed_at: 2026-07-21
published_at: "<YYYY-MM-DD>"
consolidated_at: "<YYYY-MM-DD>"
source_modified_at: "<ISO-8601 value>"
retrieved_at: "<UTC ISO-8601 timestamp ending in Z>"
warning: "<one concise material warning>"
---
```

Required fields:

- `id`;
- `country`;
- `title`;
- `language`;
- `document_type`;
- `status`;
- at least one of `official_id` or `eli_uri`;
- `source_url`;
- `source_file`;
- `source_sha256`;
- `source_license`;
- `source_attribution`;
- `source_terms_url`;
- `rights_reviewed_at`;
- `retrieved_at`.

Optional fields are omitted when unknown:

- `official_id` when `eli_uri` exists and no separate identifier exists;
- `eli_uri`;
- `published_at`;
- `consolidated_at`;
- `source_modified_at`;
- `warning`.

No other frontmatter field is permitted without a maintainer-approved blueprint amendment.

Field rules:

- Dates are quoted ISO-8601 strings in YAML to prevent parser-specific date coercion.
- `source_sha256` is lowercase hexadecimal.
- `retrieved_at` is the first successful retrieval time of the exact retained bytes.
- When source bytes are unchanged, `retrieved_at` is preserved.
- Rights values are copied from the country `source.yml` into each normalized file.
- `warning` contains one material caveat and no legal interpretation.

Allowed `document_type` values are:

```text
constitution
code
law
regulation
other
```

### 5.5 Frontmatter serialization

The shared serializer **MUST**:

- use UTF-8;
- write LF line endings;
- write `---` delimiters;
- preserve the field order in section 5.4;
- omit absent optional fields;
- use block-style YAML;
- disable YAML aliases;
- end the frontmatter with one blank line before the Markdown title;
- produce byte-identical output for the same input.

Adapters **MUST NOT** serialize frontmatter themselves.

### 5.6 Normalized Markdown

The body after frontmatter **MUST** follow these rules:

1. The first body line is `# <official title>`.
2. Official hierarchy and provision labels are retained.
3. Every addressable provision has an HTML anchor immediately before its heading.
4. One logical source paragraph is written per line.
5. Prose is not hard-wrapped.
6. Unicode, punctuation, numbering, and diacritics are preserved.
7. Lists and tables are represented in ordinary Markdown when this does not lose legal content.
8. Content that cannot be represented faithfully in Markdown causes omission of the law until the parser is fixed.
9. No summary, explanation, inferred heading, translation, or interpretation is added.
10. Navigation, cookie banners, page furniture, and source-site controls are removed.

Example:

```markdown
<a id="art-13"></a>
## Article 13

Premier alinéa du texte officiel.

Deuxième alinéa du texte officiel.
```

### 5.7 Provision anchors

Anchor generation order:

1. Use the official source anchor or XML identifier when present.
2. Normalize it to lowercase ASCII by replacing underscores and non-alphanumeric runs with one hyphen.
3. Strip leading and trailing hyphens.
4. When no official identifier exists, derive the anchor from the official provision label using the same normalization.
5. Duplicate anchors are validation errors. Do not append arbitrary counters.

Anchors are stable only within the current checked-in file. Cross-version stability is not promised.

### 5.8 Retained source selection

Select one official source representation per language in this order:

1. complete official structured XML or JSON;
2. complete official stable HTML;
3. complete text-bearing official PDF or DOCX;
4. another official format approved by the maintainer.

The higher-ranked format is used unless it omits legally meaningful content or cannot be parsed deterministically.

- Scanned-image PDFs are not supported.
- Remote images, stylesheets, scripts, or attachments required for legal meaning must be incorporated into one official archive file or the law must be omitted.
- The adapter records the final official URL after redirects.

---

## 6. Repository structure and project tooling

### 6.1 Repository settings

Create `clarvia-org/lex` with these settings:

- visibility: public;
- description: `Current national legislation in one predictable format for AI agents.`;
- issues: enabled;
- wiki: disabled;
- discussions: disabled;
- projects: disabled;
- private vulnerability reporting: enabled;
- default branch: `main`;
- merge methods: squash merge enabled; merge commits and rebase merge disabled;
- automatically delete head branches after merge: enabled.

### 6.2 Final version 1 tree

```text
clarvia-org/lex/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.yml
│   │   └── new-country.yml
│   ├── workflows/
│   │   └── ci.yml
│   └── pull_request_template.md
├── countries/
│   └── lu/
│       ├── README.md
│       ├── source.yml
│       ├── adapter.py
│       ├── fixtures/
│       ├── tests/
│       └── laws/
│           └── code-civil/
│               ├── current.md
│               └── source.<ext>
├── docs/
│   └── adr/
│       └── README.md
├── schemas/
│   └── law-frontmatter.schema.json
├── scripts/
│   ├── check_internal_links.py
│   └── repo_size_report.py
├── src/
│   └── lex/
│       ├── __init__.py
│       ├── adapters.py
│       ├── cli.py
│       ├── dataset.py
│       ├── errors.py
│       ├── frontmatter.py
│       ├── http.py
│       ├── markdown.py
│       ├── runner.py
│       └── validate.py
├── tests/
│   ├── fixtures/
│   │   └── sample_dataset/
│   ├── test_cli.py
│   ├── test_dataset.py
│   ├── test_frontmatter.py
│   └── test_validate.py
├── .gitattributes
├── .gitignore
├── AGENTS.md
├── agent.json
├── ARCHITECTURE.md
├── BLUEPRINT.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── COUNTRY_ADAPTER.md
├── DATA_MODEL.md
├── LICENSE
├── NOTICE
├── README.md
├── ROADMAP.md
├── SOURCES.md
├── pyproject.toml
└── uv.lock
```

Do not add empty directories with `.gitkeep`. A directory is added when it contains a real file.

### 6.3 Python project

Use:

- Python 3.12;
- `uv` for environment, lockfile, commands, and builds;
- `src` package layout;
- distribution name `clarvia-lex`;
- import package `lex`;
- console script `lex = "lex.cli:main"`.

Stage 0 runtime dependencies:

```toml
click = ">=8.1,<9"
jsonschema = ">=4.23,<5"
PyYAML = ">=6.0,<7"
```

Stage 1A adds these runtime dependencies when the Luxembourg adapter is introduced:

```toml
httpx = ">=0.28,<1"
lxml = ">=5.3,<6"
```

Development dependencies:

```toml
mypy = ">=1.14,<2"
pytest = ">=8.3,<9"
pytest-cov = ">=6,<7"
ruff = ">=0.9,<1"
types-PyYAML = ">=6.0,<7"
```

`uv.lock` is committed. CI uses `uv sync --frozen`.

### 6.4 Code-quality configuration

`pyproject.toml` **MUST** configure:

- Ruff formatting with line length 100;
- Ruff linting for `E`, `F`, `I`, `B`, and `UP`;
- mypy strict mode for `src/lex` and country adapters;
- pytest test discovery under `tests` and `countries/*/tests`;
- minimum Python 3.12.

### 6.5 Git attributes

`.gitattributes` **MUST** contain:

```gitattributes
* text=auto
*.md text eol=lf
*.py text eol=lf
*.json text eol=lf
*.toml text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
countries/*/laws/**/source.* -text
```

The final rule is limited to retained official source files. It must not match `countries/<cc>/source.yml`.

### 6.6 Git ignore rules

`.gitignore` **MUST** ignore:

```text
.venv/
.uv-cache/
.lex-cache/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
.DS_Store
Thumbs.db
.idea/
.vscode/
```

### 6.7 What belongs in Git

Git contains:

- project code and tests;
- adapter code and fixtures;
- current normalized legislation;
- one retained official source file per language;
- source rights and attribution metadata;
- documentation and schemas;
- meaningful data tags.

### 6.8 What does not belong in Git

Do not commit:

- caches;
- generated databases or indexes;
- corpus archives;
- duplicate manifestations;
- historical-version directories;
- embeddings;
- AI-generated content;
- credentials or authenticated responses;
- build output;
- retry state or monitoring databases.

### 6.9 Repository size enforcement

`repo_size_report.py` reports:

- working-tree bytes;
- packed `.git` bytes after `git gc` in CI’s disposable checkout;
- tracked file count;
- largest tracked file;
- source bytes by country and extension.

CI behavior:

- source file above 25 MiB: warning in job summary;
- source file above 50 MiB: fail;
- packed repository at or above 900 MiB: fail;
- unexplained generated archive or database: fail.

No storage alternative is implemented under this blueprint.

---

## 7. Agent-facing interface

### 7.1 Commands

The final version 1 CLI contains exactly these commands:

```bash
lex list [--country CC] [--language LANG] [--json]
lex search QUERY [--country CC] [--language LANG] [--json]
lex get ID [--language LANG] [--provision ANCHOR] [--body] [--json]
lex source ID [--language LANG] [--verify] [--path-only]
lex check [PATH] [--json]
lex update COUNTRY [--id ID] [--dry-run]
```

Do not add command aliases or additional commands without a blueprint amendment.

### 7.2 Dataset discovery

Commands scan:

```text
countries/*/laws/*/current.md
countries/*/laws/*/current.*.md
```

No committed search index is used.

### 7.3 `lex list`

Default text output is one tab-separated record per line:

```text
lu/code-civil	fr	Code civil	official_consolidation	countries/lu/laws/code-civil/current.md
```

JSON output is a JSON array with:

```json
{
  "id": "lu/code-civil",
  "country": "lu",
  "language": "fr",
  "title": "Code civil",
  "status": "official_consolidation",
  "path": "countries/lu/laws/code-civil/current.md"
}
```

### 7.4 `lex search`

Search performs Unicode text matching over:

- `id`;
- title;
- official identifier;
- ELI URI;
- document type;
- provision headings;
- normalized body.

Matching is **casefold + diacritic folding + typographic apostrophe normalization**
applied to **both** the query and each haystack field. Normalization affects
matching only; it does not alter stored Markdown or ranking precedence.

Results are sorted by:

1. exact ID match;
2. exact title match;
3. title substring match;
4. heading match;
5. body match;
6. stable ID alphabetical order.

No fuzzy-search dependency is used. No committed search index is used.

JSON output (`--json`) is a JSON array. **Every hit MUST include `matched_on`**:
a list of **every** field that matched the query, using these stable field names
in this fixed order for determinism:

```text
id, title, official_id, eli_uri, document_type, heading, body
```

Example:

```json
{
  "id": "lu/agd-1946-03-30-n9",
  "country": "lu",
  "language": "fr",
  "title": "…",
  "status": "official_consolidation",
  "path": "countries/lu/laws/agd-1946-03-30-n9/current.md",
  "matched_on": ["title", "body"]
}
```

Do not add search CLI flags in version 1.

### 7.5 `lex get`

- Without options, return the complete normalized Markdown file.
- `--body` removes YAML frontmatter and returns the Markdown body.
- `--language` selects the language file.
- `ID@lang` and `--language lang` are equivalent; using both with different values is an error.
- `--json` **without** `--provision` returns `{ "metadata": ..., "body": ... }`.
- `--json` **with** `--provision` returns the provision evidence object in §7.6
  (not the `{metadata, body}` shape).

### 7.6 Provision retrieval

`--provision` accepts an exact anchor.

The extractor:

1. finds `<a id="ANCHOR"></a>`;
2. requires the next nonblank line to be a Markdown heading;
3. includes the anchor, heading, body, and child headings;
4. stops before the next anchored heading at the same or higher heading level;
5. returns no unrelated text.

#### Markdown output (default)

Without `--json`, provision output retains the law frontmatter and inserts this
field after `warning` or after `retrieved_at` when no warning exists:

```yaml
provision: art-13
```

`provision` is retrieval-only and is not stored in whole-law files.

Non-JSON `lex get ID --provision ANCHOR` output MUST remain byte-for-byte
identical to the Markdown projection contract (frontmatter + provision slice).

#### JSON provision evidence (`--provision` + `--json`)

`lex get ID --provision ANCHOR --json` returns a provision evidence object.
`provision_id` is deterministic for the **current published snapshot** in this
repository: `{document_id}/{anchor}` (article-level anchors only). It is not a
cross-version legal identity.

Temporal frontmatter fields (`published_at`, `consolidated_at`, `retrieved_at`,
and optional peers) are **pass-through publication / consolidation / retrieval
facts only**. Implementations MUST NOT reinterpret them as legal applicability
and MUST NOT emit `valid_from`, `valid_to`, `is_current`, `applicable_from`, or
similar fields.

Canonical shape:

```json
{
  "provision_id": "lu/agd-1946-03-30-n9/art-3",
  "document_id": "lu/agd-1946-03-30-n9",
  "anchor": "art-3",
  "country": "lu",
  "language": "fr",
  "title": "…",
  "document_type": "regulation",
  "status": "official_consolidation",
  "official_id": "agd/1946/03/30/n9",
  "eli_uri": "…",
  "source_url": "…",
  "source_sha256": "…",
  "source_attribution": "Service central de législation, Luxembourg",
  "published_at": "1946-04-29",
  "consolidated_at": "2004-01-04",
  "retrieved_at": "2026-07-21T21:21:12Z",
  "warning": "Official consolidation. Cite the official ELI URI and publisher; lex is not the legal authority.",
  "heading_path": ["Art. 3."],
  "markdown": "<a id=\"art-3\"></a>\n## Art. 3.\n\n…",
  "plain_text": "…",
  "character_count": 0,
  "word_count": 0,
  "citation": {
    "label": "Art. 3.",
    "document_title": "…",
    "publisher": "Service central de législation, Luxembourg",
    "official_id": "agd/1946/03/30/n9",
    "eli_uri": "…",
    "source_url": "…",
    "formatted": "… Art. 3. … Service central de législation, Luxembourg …"
  }
}
```

Rules:

- Omit unknown optional fields rather than inventing values.
- Include `warning` when present in frontmatter; omit the key when absent.
- Include `source_attribution` when present; `citation.publisher` MUST use that
  value (official publisher per §7.10).
- `citation.formatted` MUST contain: official title + provision label +
  publisher + (`source_url` or `eli_uri`).
- `character_count` and `word_count` are computed over `plain_text`.
- `markdown` is the provision slice only (anchor + heading + body), not the
  whole-law file and not the retrieval-only `provision:` frontmatter field.

#### `heading_path` algorithm (normative)

Structural headings and article headings often share Markdown levels
(`##`, `###`, …). A naive “walk all headings above the provision” is unsafe.

Required algorithm:

1. Scan the **complete** Markdown body in document order.
2. Maintain a **structural heading stack** keyed by heading level.
3. When a line is an HTML anchor `<a id="…"></a>` and the **next non-blank line**
   is a Markdown heading, that heading is a **provision heading**:
   - it MUST NOT modify the structural heading stack;
   - if this is the selected provision, remember it as `provision_heading`.
4. When a Markdown heading is **not** a provision heading (no immediately
   preceding anchor):
   - level-1 (`#`) document-title headings MUST NOT update the structural stack;
   - any other non-provision heading MAY update the structural stack (replace
     same/deeper levels; push).
5. For the selected provision,
   `heading_path = structural_stack_labels + [provision_heading_label]`.

Example: `lu/agd-1946-03-30-n9` / `art-3` has no chapter/section structure, so:

```json
"heading_path": ["Art. 3."]
```

Do not invent chapters for that law.

### 7.7 `lex source`

- Returns the path of the retained source file.
- `--verify` recomputes SHA-256 and fails on mismatch.
- `--path-only` prints only the path.
- The command does not open a browser or fetch the network.

### 7.8 `lex check`

`lex check` validates the checked-out dataset and exits:

- `0` when valid;
- `1` when any validation error exists;
- `2` for invalid CLI usage.

Checks include frontmatter schema and field order, source file presence and SHA-256,
unique provision anchors, and **Markdown↔retained-source statutory word parity**
with classified residuals. The gate is **unexplained source-only tokens** (within
0.5% of source size). Exact concatenations under a narrow French
proclitic/ordinal/N° allowlist are counted as **recognized token-boundary
differences** (e.g. `ladirective` ↔ `la` + `directive`) — not dropped prose and
not a general rewrite dictionary. Failures include a **per-article
first-difference** report. Single-law `lex check` prints a public `fidelity:`
summary (`unexplained_*`, `recognized_boundary_differences`, `divergence_ratio`).

Pass a law directory path to run the fidelity check for that law only:

```bash
uv run lex check countries/lu/laws/loi-2000-06-29-n2
```

Text errors use:

```text
ERROR_CODE path: message
```

JSON output is an array of:

```json
{"code":"LEX_HASH_MISMATCH","path":"...","message":"..."}
```

### 7.9 Error codes

The only version 1 error codes are:

```text
LEX_NOT_FOUND
LEX_LANGUAGE_NOT_FOUND
LEX_PROVISION_NOT_FOUND
LEX_SOURCE_NOT_FOUND
LEX_HASH_MISMATCH
LEX_INVALID_DATA
LEX_AMBIGUOUS_MATCH
LEX_INVALID_ID
LEX_INVALID_RIGHTS
LEX_NETWORK_ERROR
LEX_SOURCE_CHANGED
LEX_UNEXPECTED_DELETION
```

### 7.10 Citation contract

Agents and documentation **MUST** cite the official source, not `lex`, as authority.

Required citation elements:

```text
official title + provision label + official publisher + source_url or eli_uri
```

The provision JSON `citation` object (§7.6) carries these elements. `publisher`
is the official publisher string from `source_attribution`. `formatted` MUST
include title, provision label, publisher, and `source_url` or `eli_uri`.

A Git commit and `source_sha256` may be added for reproducibility. They do not replace the official citation.

The optional `warning` **MUST** be surfaced with any answer derived from the law
(including provision JSON evidence when the frontmatter contains `warning`).

---

## 8. Update architecture

### 8.1 Update method

Version 1 updates run manually from a maintainer checkout:

```bash
uv run lex update <country>
uv run lex check
git diff
```

The maintainer commits the generated changes and opens a pull request.

No scheduled workflow and no bot-authored update pull request is permitted.

### 8.2 Update flow

The runner performs:

```text
load country source.yml
→ load country adapter.py
→ discover supported law references
→ fetch selected official source
→ write exact source bytes
→ compute SHA-256
→ normalize from saved bytes
→ serialize canonical frontmatter and Markdown
→ compare with working tree
→ validate
→ leave a reviewable Git diff
```

### 8.3 Idempotency

For unchanged official bytes and unchanged adapter code:

```text
second update → clean Git working tree
```

When source bytes are unchanged:

- do not rewrite the source file;
- preserve `retrieved_at`;
- do not rewrite normalized output unless deterministic regeneration detects an existing repository error.

### 8.4 HTTP behavior

The shared HTTP client **MUST** use:

- user agent `clarvia-lex/<version> (+https://github.com/clarvia-org/lex)`;
- connect timeout 10 seconds;
- read timeout 60 seconds;
- maximum five attempts;
- exponential delays of 1, 2, 4, and 8 seconds between retries;
- `Retry-After` when present;
- maximum two concurrent requests per host;
- redirect following;
- streaming downloads;
- default maximum response size 50 MiB;
- no authentication;
- no cookies persisted between runs.

Retry only network errors, HTTP 408, 429, and 5xx responses.

### 8.5 Failure behavior

On source outage, invalid media type, login page, browser shell, timeout, or unexpected discovery loss:

- fail the update;
- leave existing published law files unchanged;
- report the error;
- do not delete data;
- do not create a release tag.

### 8.6 Source changes

When official bytes at the same URL change:

- replace the retained source file;
- update SHA-256;
- set `retrieved_at` to the new retrieval time;
- regenerate Markdown;
- show the complete source and Markdown diff in the pull request;
- require human review.

Do not classify the change as an amendment or correction unless the official source explicitly provides that classification. Version 1 does not store those relationships.

### 8.7 Discovery and deletion safety

- `discover()` may add or update laws.
- `discover()` may not automatically delete a published law.
- If a published ID disappears, `lex update` fails with `LEX_UNEXPECTED_DELETION`.
- A maintainer removes a law only through a dedicated reviewed pull request with official evidence.

### 8.8 Releases

- `main` is the latest published dataset.
- Tag meaningful data changes as `data-YYYY-MM-DD.N`.
- `N` starts at `1` for each date.
- Do not tag code-only changes as data releases.
- GitHub Release notes list added, changed, and removed law IDs.
- Do not attach duplicate corpus archives.

---

## 9. Country adapter contract

### 9.1 Adapter location and loading

A country adapter is:

```text
countries/<cc>/adapter.py
```

`lex update <cc>` loads that file directly with `importlib.util.spec_from_file_location`.

- There is no central adapter registry file.
- `countries/` and country directories are not Python packages and do not require `__init__.py`.
- The adapter file exposes one module-level object named `adapter`.

### 9.2 Shared types

`src/lex/adapters.py` defines these frozen dataclasses and protocol:

```python
from dataclasses import dataclass
from datetime import date, datetime
from typing import Protocol, Sequence

@dataclass(frozen=True)
class LawRef:
    id: str
    language: str
    source_url: str
    official_id: str | None = None
    eli_uri: str | None = None

@dataclass(frozen=True)
class SourceDocument:
    content: bytes
    extension: str
    final_url: str
    media_type: str
    retrieved_at: datetime
    title: str
    document_type: str
    status: str
    official_id: str | None = None
    eli_uri: str | None = None
    published_at: date | None = None
    consolidated_at: date | None = None
    source_modified_at: str | None = None
    warning: str | None = None

@dataclass(frozen=True)
class NormalizedLaw:
    title: str
    document_type: str
    body: str

class CountryAdapter(Protocol):
    country_code: str

    def discover(self, client: "HttpClient") -> Sequence[LawRef]: ...
    def fetch(self, ref: LawRef, client: "HttpClient") -> SourceDocument: ...
    def normalize(self, ref: LawRef, source: SourceDocument) -> NormalizedLaw: ...
```

Adapters **MUST** return these shared objects. They must not create country-specific equivalents.

### 9.3 Responsibility split

The adapter owns:

- official-source discovery;
- source-specific current-text selection;
- source-specific fetch parameters;
- parsing source bytes;
- producing the Markdown body;
- setting source-derived metadata and warning.

The shared runner owns:

- country configuration;
- path validation;
- HTTP client implementation;
- exact source-byte writing;
- source filename selection;
- SHA-256;
- rights fields;
- frontmatter serialization;
- deterministic file writing;
- deletion protection;
- validation.

Adapters **MUST NOT** write repository files directly.

### 9.4 Adapter fixtures

Every adapter contains:

```text
countries/<cc>/fixtures/
├── discovery.json
├── ordinary-source.<ext>
├── complex-source.<ext>
├── invalid-response.<ext>
├── expected-ordinary.md
└── expected-complex.md
```

Fixtures are exact saved source responses with secrets removed. Expected Markdown includes frontmatter only when the fixture provides fixed observation values.

Each parser rule must be protected by a fixture test before it is used on published data.

### 9.5 Adapter tests

Every adapter tests:

- discovery parsing;
- source selection;
- ordinary normalization;
- one structurally complex source;
- invalid response rejection;
- deterministic output;
- stable IDs;
- warning propagation;
- no network access during tests.

### 9.6 New-country workflow

A new country contribution follows this exact order:

1. Open a `new-country` issue.
2. Identify the official publisher and official source entry point.
3. Record source rights in a draft country README and `source.yml`.
4. Open a draft pull request containing the adapter, fixtures, tests, and one law.
5. Run the common conformance tests.
6. Have a reviewer compare the law with the retained official source.
7. Mark the pull request ready.
8. Merge publishes the law.

A country never needs complete national coverage before its first verified law merges.

### 9.7 Source-specific metadata

Source-specific richness remains in:

- retained source files;
- adapter code;
- adapter fixtures;
- country README.

It is not added to global frontmatter unless this blueprint is amended.

---

## 10. Quality, trust, and licensing

### 10.1 Publication guarantee

A normalized law on `main` guarantees:

- official publisher identified;
- one official source file retained in Git;
- source checksum valid;
- source rights recorded;
- normalized output produced deterministically from the retained source;
- official citation metadata present;
- status and material warning visible;
- human review completed;
- no silent reconstruction, translation, OCR, or interpretation.

### 10.2 Validation gates

A data pull request fails when any of these occur:

- invalid or unknown frontmatter field;
- missing source file;
- checksum mismatch;
- duplicate law ID;
- duplicate provision anchor;
- invalid path or slug;
- source rights missing;
- source file above 50 MiB;
- empty normalized body;
- browser shell, login, navigation, or cookie text detected;
- replacement-character spike;
- non-deterministic regeneration;
- unexpected law disappearance;
- generated archive, database, cache, or secret committed.

### 10.3 Human review

A reviewer checks:

- official source identity;
- title and official ID;
- status and warning;
- article order and numbering;
- representative paragraphs;
- annexes, tables, and legally meaningful notes;
- source URL;
- rights and attribution;
- selected source format.

A draft pull request is unverified. A merged law on protected `main` is published.

### 10.4 Root project licence

`LICENSE` **MUST** contain the complete, unmodified Apache License 2.0 text.

Apache-2.0 applies to:

- `src/`;
- project scripts;
- schemas;
- tests authored for `lex`;
- project-authored general documentation;
- project configuration.

The Apache licence **MUST NOT** be edited to describe the corpus. Licence scope is explained in `NOTICE` and `SOURCES.md`.

### 10.5 Corpus rights

Official source files and normalized legislative Markdown are not relicensed under Apache-2.0. They remain governed by the applicable official-source terms or legal status recorded in:

- country `source.yml`;
- country README;
- every normalized law’s frontmatter.

If redistribution rights are unresolved, no source bytes or normalized law may merge.

### 10.6 Required `NOTICE`

`NOTICE` **MUST** contain:

```text
Copyright 2026 Clarvia

The software, schemas, tests, project configuration, and project-authored
technical documentation in this repository are licensed under the Apache
License, Version 2.0.

Official legislation, retained official source files, and normalized
representations of that legislation are not relicensed under Apache-2.0.
They remain subject to the source-specific rights, licences, attribution
requirements, and legal status identified in each normalized file,
countries/<country>/source.yml, and countries/<country>/README.md.

lex is not an official publisher. Cite the official source identified in each
record as the legal authority.
```

Third-party code notices are appended to `NOTICE` when required by the copied code’s licence.

### 10.7 Contributions

- No contributor licence agreement is used.
- No DCO `Signed-off-by` requirement is used.
- Contributions are accepted under Apache-2.0 for project-authored material through the licence’s inbound-contribution terms.
- Source-specific legislative material remains under its recorded source terms.

The pull-request template **MUST** include:

```text
- [ ] I am entitled to submit the code and project-authored content in this PR.
- [ ] Every legislative source in this PR is official.
- [ ] I verified and documented redistribution and attribution terms.
- [ ] I compared normalized output with the retained official source.
- [ ] This PR follows BLUEPRINT.md and introduces no unauthorized field or architecture.
```

### 10.8 Uncertainty

Version 1 represents uncertainty only through:

```yaml
status: official_consolidation
warning: "Amendment of 2024-03-15 may not be incorporated."
```

No confidence scores or additional authority taxonomies are permitted.

### 10.9 Omission rule

When the source, currentness, rights, or normalization cannot be verified, omit the law. Do not publish a plausible approximation.

---

## 11. Contributor and governance model

### 11.1 Repository posture

The repository is public from creation.

Before the first law merges, the README must state that the repository contains scaffolding and no published legislation. After the first verified law merges, that notice is removed and replaced by a working retrieval example.

### 11.2 Contribution quality levels

There are exactly two states:

- **Draft pull request:** work in progress; output is not verified or published.
- **Merged to `main`:** automated checks and human source review completed; output is published.

There is no separate draft-data branch or quality score.

### 11.3 Branch protection

Before the first law merges, configure a ruleset for `main`:

- require the `ci` status check;
- block force pushes;
- block branch deletion;
- require pull requests for non-admin contributors;
- permit repository administrators to bypass while there is only one maintainer.

When a second maintainer is granted write access, amend the ruleset to require one approving review. This rule change does not require a blueprint amendment.

### 11.4 Good first contributions

Good first issues are limited to bounded work such as:

- add one verified law using an existing adapter;
- add one source fixture;
- fix one parser rule;
- preserve one table or annex;
- correct one source URL or warning;
- improve one country README;
- add one validation test.

“Add all laws for a country” is not a good first issue.

### 11.5 Consistency controls

Country implementations remain consistent through:

- one frontmatter JSON Schema;
- one shared serializer;
- one adapter protocol;
- one validator;
- one CLI;
- common conformance tests;
- blueprint review for any global change.

---

## 12. Authorized implementation sequence

Agents **MUST** implement work in this order. Later stages are blocked until the prior stage is merged and accepted.

### Stage 0 — Repository scaffold

**Authorized work:** create the public repository and a functioning scaffold. Do not add legislation data.

#### Required files

Create:

- repository settings from section 6.1;
- all root documentation files in section 15;
- `LICENSE` and `NOTICE` exactly as specified;
- `.gitattributes` and `.gitignore` exactly as specified;
- `pyproject.toml` and `uv.lock`;
- `schemas/law-frontmatter.schema.json`;
- `.github/workflows/ci.yml`;
- issue and pull-request templates;
- `scripts/check_internal_links.py`;
- `scripts/repo_size_report.py`;
- `src/lex/__init__.py`;
- `src/lex/cli.py`;
- `src/lex/dataset.py`;
- `src/lex/errors.py`;
- `src/lex/frontmatter.py`;
- `src/lex/validate.py`;
- real unit tests and a synthetic sample dataset;
- `countries/lu/README.md`;
- `countries/lu/source.yml`.

Do not create:

- `countries/lu/adapter.py`;
- `countries/lu/fixtures/`;
- `countries/lu/tests/`;
- `countries/lu/laws/`;
- empty `.gitkeep` files;
- `markdown.py`, `http.py`, `adapters.py`, or `runner.py` placeholders;
- nonfunctional CLI commands.

#### Stage 0 CLI

Only these commands exist in Stage 0:

```bash
lex list [--country CC] [--language LANG] [--json]
lex check [PATH] [--json]
```

They must work against the synthetic test dataset. The CLI help must state that no legislation has yet been published.

#### Stage 0 tests

Tests must cover:

- valid frontmatter;
- every missing required field;
- unknown field rejection;
- deterministic serialization;
- invalid stable IDs and paths;
- source file missing;
- checksum mismatch;
- duplicate IDs;
- default and additional-language filename pairing;
- rights fields missing;
- `lex list` text and JSON output;
- `lex check` success and failure exit codes.

#### Stage 0 acceptance

Stage 0 is complete when:

```bash
uv sync --frozen
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
uv run lex check tests/fixtures/sample_dataset
uv build
```

all pass in CI, all documentation links pass, and the repository contains no real legislation.

### Stage 1A — Luxembourg one-law vertical slice

**Authorized law:** `lu/code-civil` only.

No second law may be added in Stage 1A.

#### Required additions

Add:

- `src/lex/adapters.py`;
- `src/lex/http.py`;
- `src/lex/markdown.py`;
- `src/lex/runner.py`;
- final CLI commands from section 7;
- `countries/lu/adapter.py`;
- Luxembourg fixtures and tests;
- `countries/lu/laws/code-civil/current.md`;
- one adjacent selected official source file;
- working README retrieval example.

#### Luxembourg source contract

The adapter must:

- use the Casemates open-data layer;
- not scrape the Angular application;
- query `http://data.legilux.public.lu/sparqlendpoint` with HTTP `GET`;
- send URL-encoded `query` and `format=json` parameters;
- not use `/sparql`;
- not use SPARQL `POST`;
- resolve official work, expression, and manifestation resources through official JOLux/ELI relationships;
- use `jolux:isRealizedBy`, `jolux:isEmbodiedBy`, `jolux:isExemplifiedBy`, `eli:title`, `dcterms:modified`, and `jolux:license` where supplied;
- download filestore content with `GET`, never `HEAD`;
- prefer complete LegalDocML/XML;
- retain the exact selected official bytes;
- normalize only from the retained bytes;
- preserve Luxembourg Unicode and official identifiers;
- use `CC-BY-4.0` rights metadata and the attribution defined in `countries/lu/source.yml`.

A live smoke test may access Casemates. Ordinary CI tests use checked-in fixtures and no network.

#### Stage 1A acceptance

All of these must pass:

```bash
uv run lex list --country lu
uv run lex search "Code civil" --country lu
uv run lex get lu/code-civil
uv run lex get lu/code-civil --provision <verified-anchor>
uv run lex source lu/code-civil --verify
uv run lex check
uv run lex update lu --id lu/code-civil
```

The second unchanged `lex update lu --id lu/code-civil` must produce a clean Git working tree.

A reviewer must verify the complete pipeline against the official source.

### Stage 1B — Luxembourg representative ten-law slice

Add nine additional Luxembourg laws, for ten total.

The nine laws must be selected to exercise materially different source and normalization cases. The selection must include, where available:

1. an ordinary law;
2. a grand-ducal regulation;
3. a code other than the Code civil;
4. the Constitution;
5. a document with multiple official languages;
6. a document whose preferred retained source is HTML;
7. a document with nested or irregular provision structure;
8. a document carrying an official consolidation warning or known freshness limitation;
9. a large or structurally complex document.

Before implementation, the Stage 1B pull request or linked issue must list:

- each proposed stable ID;
- its official source URL;
- its document family;
- its selected source format;
- the edge case it is intended to test;
- at least one provision anchor to verify.

The maintainer must approve that list before code or data for the nine laws is merged. A blueprint amendment is not required unless the implementation would change a global contract, schema, CLI behavior, storage rule, licence rule, or adapter interface.

Stage 1B is complete when all ten laws pass the same validation and deterministic-update guarantees established in Stage 1A.

### Stage 2 — Luxembourg coverage expansion

Expand Luxembourg coverage using the accepted Luxembourg adapter and data contract.

Agents may add laws through ordinary pull requests when all of the following are true:

- the law is retrieved from an approved official source;
- the retained source format is supported by the accepted adapter;
- normalization requires no change to the global schema or Markdown contract;
- source rights and attribution are already covered by the approved Luxembourg source policy;
- the output passes all validation and conformance tests;
- a reviewer compares the normalized output against the official source.

A blueprint amendment is required before adding:

- a new Luxembourg document family with materially different semantics;
- a new source system;
- a new retained-source format requiring new shared parser behavior;
- a new status value or frontmatter field;
- historical or point-in-time versions;
- reconstructed consolidations;
- amendment or repeal graphs;
- any change to stable IDs, directory structure, CLI behavior, licensing, or authority rules.

Stage 2 does not require complete Luxembourg coverage before useful additions are merged. Coverage remains explicitly partial until the maintainer declares it complete in `countries/lu/README.md`.

The governing distinction: ordinary data expansion follows the existing contract. Contract changes require a blueprint amendment.

### Stage 3 — France

France is the second country. Implementation is blocked until a blueprint amendment defines:

- official source and access contract;
- rights metadata;
- first authorized law;
- stable-ID mapping;
- source fixtures and acceptance criteria.

### Stage 4 — Germany

Germany is the third country. Implementation is blocked until a blueprint amendment defines the same country-specific contract.

### Stage 5 — Volunteer jurisdictions

Additional jurisdictions may be proposed after Luxembourg, France, and Germany have each published at least one verified law.

- New countries remain limited by the five-country and repository-size boundaries.
- A volunteer may open a new-country issue at any time.
- No country data may merge before its country-specific blueprint section is approved.

### Hosted layers

A hosted API, MCP server, website, object store, or external data service is not authorized by this blueprint. Building one requires a future blueprint amendment.

---

## 13. Risk controls

| Risk | Mandatory control |
|---|---|
| Wrong current text | Apply the current-text selection algorithm; omit when uncertain. |
| Source outage | Fail without modifying published files. |
| Source mutation | Retain new bytes, hash them, regenerate, and review the diff. |
| Accidental deletion | `discover()` cannot delete; disappearance fails the update. |
| Repository growth | CI size limits and hard stop at 900 MiB. |
| Binary history growth | Retain one source representation only; 50 MiB file limit. |
| Licence mismatch | Per-country rights review and per-file rights fields. |
| False authority | Official citations and mandatory conduit disclaimer. |
| Contributor inconsistency | Shared schema, serializer, protocol, validator, and CI. |
| Premature infrastructure | Prohibited hosted services and scheduled jobs. |
| Fake completeness | Partial coverage by default; files are the coverage list. |
| Placeholder architecture | No nonfunctional modules or CLI commands. |
| Weak-agent divergence | This document is normative; unauthorized choices stop work. |

---

## 14. Binding architectural decisions

| ID | Decision |
|---|---|
| ADR-001 | One public GitHub monorepo stores code, current normalized text, and one official source file per law-language record. |
| ADR-002 | Git is the canonical dataset store, review surface, and distribution mechanism. |
| ADR-003 | Version 1 stores current/latest official text only. |
| ADR-004 | Markdown with YAML frontmatter is the canonical normalized format. |
| ADR-005 | One selected official source representation is retained beside each normalized file. |
| ADR-006 | Official URLs and identifiers are citation targets; `lex` is not the authority. |
| ADR-007 | The global model is one law-language record; no legal ontology is introduced. |
| ADR-008 | Provision anchors are current-file local identifiers only. |
| ADR-009 | Adapters implement `discover`, `fetch`, and `normalize`; the runner owns files and global metadata. |
| ADR-010 | Updates are manual and merge through reviewed pull requests. |
| ADR-011 | Partial countries are valid; the filesystem is the coverage list. |
| ADR-012 | Apache-2.0 applies to project-authored code and documentation; corpus rights are source-specific. |
| ADR-013 | No CLA and no DCO requirement. |
| ADR-014 | No database, API, MCP, website, object store, Git LFS, or scheduled crawler in version 1. |
| ADR-015 | Omission is preferred to unverified or reconstructed text. |
| ADR-016 | Python distribution is `clarvia-lex`; executable and import package remain `lex`. |
| ADR-017 | Only working interfaces are committed; placeholder modules and fake README examples are forbidden. |

These decisions are final for this revision.

---

## 15. Required repository documents

### 15.1 `README.md`

Purpose: explain the product and show a working retrieval path.

Before the first law merges, it must begin:

```markdown
# lex

Current national legislation in one predictable format for AI agents.

> Status: repository scaffold. No legislation is published yet.
```

After `lu/code-civil` merges, it must begin with a command that works in a clean checkout:

````markdown
# lex

Current national legislation in one predictable format for AI agents.

```bash
lex get lu/code-civil --provision <real-anchor>
```
````

It then states:

- official-source-only policy;
- normalized Markdown plus retained source file;
- official citation rule;
- current-only scope;
- clone/install instructions;
- country list derived from existing directories;
- contribution link.

It must not claim completeness or advertise unavailable commands.

### 15.2 `CONTRIBUTING.md`

Contains:

- environment setup with `uv`;
- issue → draft PR → review → merge workflow;
- exact quality commands;
- data review checklist;
- source-rights checklist;
- pull-request attestations;
- no CLA and no DCO statement;
- rule that `BLUEPRINT.md` governs material decisions.

### 15.3 `ARCHITECTURE.md`

A one-page summary of:

- Git-as-dataset;
- law-directory contract;
- adapter/runner split;
- manual update flow;
- source retention;
- hard scale limits.

It must not add decisions absent from this blueprint.

### 15.4 `DATA_MODEL.md`

Contains:

- stable-ID rules;
- exact frontmatter fields and ordering;
- status values;
- language filenames;
- Markdown rules;
- anchor algorithm;
- examples.

### 15.5 `COUNTRY_ADAPTER.md`

Contains:

- exact shared dataclasses and protocol;
- adapter file location and loading;
- responsibility split;
- fixture layout;
- conformance tests;
- one-country contribution workflow.

### 15.6 `SOURCES.md`

Contains:

- official-source-only policy;
- root licence boundary;
- rights review procedure;
- country source table with publisher, terms URL, rights identifier, and review date;
- attribution rule;
- prohibition on unresolved rights.

### 15.7 `ROADMAP.md`

Mirrors section 12. Each stage describes its scope, entry criteria, and what requires a blueprint amendment versus an ordinary pull request.

### 15.8 `AGENTS.md`

Concise instructions for agents:

- authoritative document is `BLUEPRINT.md`;
- dataset globs;
- current-only semantics;
- CLI commands currently implemented;
- official citation rule;
- warning propagation;
- no architecture changes without blueprint amendment.

### 15.9 `agent.json`

Contains machine-readable:

- blueprint path;
- dataset globs;
- source-file pairing rules;
- required and optional frontmatter fields;
- allowed status and document-type values;
- implemented CLI commands;
- error codes;
- official citation rule;
- current-only and no-point-in-time statements.

### 15.10 `BLUEPRINT.md`

This document, copied without abridgement. It is the normative source.

### 15.11 `LICENSE`

Unmodified Apache License 2.0 text.

### 15.12 `NOTICE`

Exact content from section 10.6, plus required third-party notices.

### 15.13 `CODE_OF_CONDUCT.md`

Contributor Covenant version 2.1, unmodified except for the project contact method.

### 15.14 Country README

Every `countries/<cc>/README.md` contains:

1. publisher;
2. official entry point;
3. rights and attribution;
4. coverage status;
5. supported document families;
6. languages;
7. retained source-selection rule;
8. known source caveats;
9. update command;
10. reviewer credits.

---

## 16. First implementation brief: Luxembourg Code civil

### 16.1 Objective

Publish one verified Luxembourg law, `lu/code-civil`, proving the complete version 1 path.

### 16.2 Required outputs

```text
countries/lu/adapter.py
countries/lu/fixtures/*
countries/lu/tests/*
countries/lu/laws/code-civil/current.md
countries/lu/laws/code-civil/source.<ext>
```

The retained source format is the highest-ranked complete official format under section 5.8.

### 16.3 Required behavior

The implementation must demonstrate:

- Casemates SPARQL discovery;
- official work/expression/manifestation resolution;
- current/latest official consolidation selection;
- exact official source retention;
- deterministic normalization;
- official identifiers and source URL;
- source rights copied into frontmatter;
- local provision anchors;
- provision-only CLI retrieval;
- source checksum verification;
- clean second update;
- readable GitHub Markdown and pull-request diff.

### 16.4 Required fixtures

At minimum:

- one saved SPARQL discovery response identifying Code civil;
- one saved metadata response resolving the selected official text;
- one reduced selected-source fixture that preserves every parser structure used by tests;
- one invalid browser-shell or HTML response;
- expected normalized Markdown for the reduced source fixture.

Published `source.<ext>` is the complete official file. Adapter tests use the reduced fixture and do not duplicate the complete Code civil source.

### 16.5 Required tests

Tests must verify:

- stable ID is exactly `lu/code-civil`;
- source selection follows section 5.8;
- status and dates come from official metadata;
- warning is present when required;
- official source URL and ELI URI are correct;
- rights fields match `source.yml`;
- source SHA-256 verifies;
- at least three representative provision anchors are extracted;
- one nested provision is returned without adjacent provisions;
- normalization is deterministic;
- no network is used in ordinary tests;
- invalid Casemates responses fail safely;
- unchanged update produces no diff.

### 16.6 Human review checklist

Before merge, a reviewer compares:

- official title;
- official identifier and ELI URI;
- current/consolidation status;
- consolidation date when supplied;
- beginning, middle, and end of the code;
- at least ten provision labels;
- one nested structure;
- one table, list, or special structure if present;
- retained source checksum;
- rights and attribution;
- README retrieval example.

### 16.7 Acceptance commands

All commands must work from a clean clone:

```bash
uv sync --frozen
uv run lex list --country lu
uv run lex search "Code civil" --country lu
uv run lex get lu/code-civil
uv run lex get lu/code-civil --provision <verified-anchor>
uv run lex source lu/code-civil --verify
uv run lex check
uv run pytest
uv run ruff format --check .
uv run ruff check .
uv run mypy src countries/lu/adapter.py
uv build
```

Then:

```bash
uv run lex update lu --id lu/code-civil
git diff --exit-code
```

must pass against unchanged upstream content.

### 16.8 Explicit non-goals

This implementation must not add:

- a second law;
- historical Code civil versions;
- amendment relationships;
- OCR;
- a database or search index;
- scheduled updates;
- hosted services;
- AI-generated content;
- an additional frontmatter field;
- a new CLI command.

---

## Appendix A — JSON Schema requirements

`schemas/law-frontmatter.schema.json` must:

- use JSON Schema Draft 2020-12;
- set `additionalProperties: false`;
- require the fields in section 5.4;
- require at least one of `official_id` or `eli_uri`;
- validate `id` with `^[a-z]{2}/[a-z0-9]+(?:-[a-z0-9]+)*$`;
- validate `country` with `^[a-z]{2}$`;
- validate `language` with `^[a-z]{2}$`;
- validate SHA-256 with `^[a-f0-9]{64}$`;
- validate allowed status and document-type values;
- treat dates and timestamps as strings;
- reject unknown fields.

## Appendix B — CI contract

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`.

It uses Ubuntu and Python 3.12 and runs, in this order:

```bash
python -m pip install uv
uv sync --frozen
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
for file in countries/*/adapter.py; do if [ -f "$file" ]; then uv run mypy "$file"; fi; done
uv run pytest --cov=lex --cov-report=term-missing
uv run lex check
uv run python scripts/check_internal_links.py
uv run python scripts/repo_size_report.py
uv build
```

CI has no live-source network tests. Network access is used only to install dependencies.

The job name required by branch protection is exactly `ci`.

## Appendix C — Source and authority rules

Never silently infer:

- that a text is current;
- that every amendment is incorporated;
- entry into force, repeal, or expiry;
- equivalence of language versions;
- cross-version provision identity;
- that disappearance means repeal;
- that OCR text is official;
- that a mirror is official;
- that Apache-2.0 applies to legislation.

When any of these would be required, omit the law and ask the maintainer.

---

## Final build instruction

Build only the currently authorized stage.

At this revision:

1. Stage 0 repository scaffold is authorized.
2. After Stage 0 is accepted, Stage 1A for `lu/code-civil` is authorized.
3. After Stage 1A is accepted, Stage 1B is authorized subject to maintainer approval of the ten-law selection.
4. After Stage 1B is accepted, Stage 2 permits ordinary data expansion within the existing contract.
5. Stages 3–5 and hosted layers are blocked until this blueprint is amended with country-specific contracts.

Ordinary data expansion follows the existing contract. Contract changes require a blueprint amendment.
