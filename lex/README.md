# lex

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.12+-blue.svg)](https://python.org)
[![CI](https://github.com/clarvia-org/lex/actions/workflows/ci.yml/badge.svg)](https://github.com/clarvia-org/lex/actions)

**Current national legislation in one predictable format for AI agents.**

```bash
uv run lex get lu/code-civil --provision art-13
```

---

Every country publishes law differently — Angular SPAs, PDFs, SPARQL endpoints, XML dumps, proprietary APIs. An AI agent that needs to look up a single provision must first reverse-engineer how that specific country works.

**lex fixes this.** One repository. One format. Every country.

Each law is a directory containing:

- **`current.md`** — normalized Markdown with YAML frontmatter: official title, identifiers, provenance, status, and a SHA-256 checksum
- **`source.xml`** (or `.html`, `.pdf`) — the exact official source file, byte-for-byte as published

No database. No API keys. No scraping. Just Git.

## Use it

**Browse** any law directly on GitHub — the Markdown renders natively.

**Clone** and install the CLI from source:

```bash
git clone https://github.com/clarvia-org/lex.git
cd lex
uv sync --frozen
```

```bash
uv run lex list
uv run lex search "Code civil" --country lu
uv run lex get lu/code-civil --provision art-13
uv run lex source lu/code-civil --verify
uv run lex check
```

`lex check` validates frontmatter, retained-source SHA-256, unique anchors, **and Markdown↔source fidelity** (empty/truncated articles and dropped lists).

```bash
# Whole repo
uv run lex check

# One law directory (fidelity only — fast offline review)
uv run lex check countries/lu/laws/loi-2000-06-29-n2

# One law ID within a dataset root
uv run lex check --id lu/loi-2000-06-29-n2
```

## Published coverage

| Country | Laws | Notes |
|---|---|---|
| Luxembourg (`lu`) | Stage 1B + Stage 2 batches 04–15 (1,207 IDs) | Partial — Casemates only; see `countries/lu/README.md` |

## The contract

Every published law guarantees:

| What | How |
|---|---|
| **Official source only** | No scraped mirrors. No reconstructed text. Every law traces to an identified official publisher. |
| **Source retained** | The exact official file sits beside the Markdown — XML, HTML, or PDF. |
| **Checksum verified** | SHA-256 links the normalized text to the retained source bytes. |
| **Projection fidelity** | `lex check` enforces statutory **word-token parity** with classified residuals: unexplained source-only tokens must stay within 0.5%. Known Casemates glue (`ladirective`↔`la`+`directive`, `N°`↔`n`+`o`, `1erbis`↔`1er`+`bis`) counts as **recognized boundary differences** (exact concatenation under a narrow proclitic/ordinal allowlist — not a rewrite dictionary). Failures include a per-article first-difference report; single-law checks print a public `fidelity:` block. |
| **Rights documented** | Source licence, attribution, and terms URL in every file's frontmatter. |
| **Deterministic** | Same source bytes + same adapter code = byte-identical Markdown. Always. |
| **Human reviewed** | Every law is compared with the official source before it reaches `main`. |

`lex` is **not** the official publisher. Always cite the official source URL in the frontmatter.

## Bring your country

The adapter pattern makes it straightforward to add a new country:

```python
class CountryAdapter(Protocol):
    country_code: str
    def discover(self, client: HttpClient) -> Sequence[LawRef]: ...
    def fetch(self, ref: LawRef, client: HttpClient) -> SourceDocument: ...
    def normalize(self, ref: LawRef, source: SourceDocument) -> NormalizedLaw: ...
```

Three functions. That's the entire interface. The shared runner handles file writing, checksums, frontmatter serialization, and validation.

**You don't need to add an entire legal system.** One verified law is a valid first contribution. A country with three laws is useful. The filesystem shows exactly what's covered.

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started, or [COUNTRY_ADAPTER.md](COUNTRY_ADAPTER.md) for the full adapter specification.

## Scope

Version 1 is deliberately focused:

- ✅ Current national legislation from official sources
- ✅ Normalized Markdown + retained official source files
- ✅ Official identifiers and citation URLs
- ✅ Local CLI for search and retrieval
- ✅ Partial country coverage welcomed
- ❌ No historical versions, no amendment graphs, no AI summaries
- ❌ No hosted API, no database, no paid infrastructure

See [ROADMAP.md](ROADMAP.md) for the expansion path.

## Documentation

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Git-as-dataset design, adapter/runner split, scale limits |
| [DATA_MODEL.md](DATA_MODEL.md) | Stable IDs, frontmatter fields, Markdown conventions |
| [COUNTRY_ADAPTER.md](COUNTRY_ADAPTER.md) | The three-function adapter contract |
| [SOURCES.md](SOURCES.md) | Official-source-only policy, rights and attribution |
| [countries/lu/CASEMATES.md](countries/lu/CASEMATES.md) | Luxembourg Casemates SPARQL + filestore access notes |
| [AGENTS.md](AGENTS.md) | Machine-readable instructions for AI agents |
| [BLUEPRINT.md](BLUEPRINT.md) | Full architectural specification |

## License

Project code and documentation are licensed under [Apache-2.0](LICENSE).

Official legislation and retained source files are **not** relicensed — they remain under their source-specific terms as documented in each file's frontmatter. See [NOTICE](NOTICE).
