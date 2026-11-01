# Clarvia Graph

**Open consequence graph, global 1,000-page guidance library (196 countries, 14 languages), Ask Clarvia, and legislation corpus**

[![Ask Clarvia](https://img.shields.io/badge/✉️_Ask_Clarvia-clarvia.org%2Fask-0f766e?style=for-the-badge)](https://clarvia.org/ask)
[![1,000-Page Global Guidance](https://img.shields.io/badge/🌍_1,000--Page_Global_Guidance-196_Countries_·_14_Languages-1d4ed8?style=for-the-badge)](https://clarvia.org/en/guidance)
[![Interactive Checklist](https://img.shields.io/badge/🧪_Interactive_Checklist-clarvia.org%2Fchecklist-blue?style=for-the-badge)](https://clarvia.org/en/checklist)

[![CI (graph)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/ci.yml/badge.svg)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/ci.yml)
[![CI (web)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-web.yml/badge.svg)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-web.yml)
[![CI (lex)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-lex.yml/badge.svg)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-lex.yml)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/13112/badge)](https://www.bestpractices.dev/projects/13112)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/clarvia-org/clarvia-graph/badge)](https://scorecard.dev/#/projects/github.com/clarvia-org/clarvia-graph)
[![REUSE](https://api.reuse.software/badge/github.com/clarvia-org/clarvia-graph)](https://api.reuse.software/info/github.com/clarvia-org/clarvia-graph)
[![codecov](https://codecov.io/gh/clarvia-org/clarvia-graph/graph/badge.svg)](https://codecov.io/gh/clarvia-org/clarvia-graph)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=clarvia-org_clarvia-graph&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=clarvia-org_clarvia-graph)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.20572455-blue)](https://doi.org/10.5281/zenodo.20572455)
[![fair-software.eu](https://img.shields.io/badge/fair--software.eu-%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8B%20%20%E2%97%8F%20%20%E2%97%8F-green)](https://fair-software.eu)
[![License: EUPL-1.2](https://img.shields.io/badge/Code_(graph)-EUPL--1.2-blue.svg)](LICENSE)
[![License: Apache-2.0](https://img.shields.io/badge/Code_(web)-Apache--2.0-blue.svg)](apps/web/LICENSE)
[![License: Apache-2.0](https://img.shields.io/badge/Code_(lex)-Apache--2.0-blue.svg)](lex/LICENSE)
[![License: CC-BY-4.0](https://img.shields.io/badge/Data-CC--BY--4.0-green.svg)](LICENSE-DATA)

> **Status:** [CI (graph): passing](https://github.com/clarvia-org/clarvia-graph/actions/workflows/ci.yml) · [CI (web): passing](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-web.yml) · [CI (lex): passing](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-lex.yml) · [OpenSSF Best Practices: passing](https://www.bestpractices.dev/projects/13112) · [OpenSSF Scorecard](https://scorecard.dev/#/projects/github.com/clarvia-org/clarvia-graph) · [REUSE compliant](https://api.reuse.software/info/github.com/clarvia-org/clarvia-graph) · [Codecov](https://codecov.io/gh/clarvia-org/clarvia-graph) · [SonarCloud](https://sonarcloud.io/summary/new_code?id=clarvia-org_clarvia-graph) · [Ask Clarvia live](https://clarvia.org/ask) · [1,000-page global guidance](https://clarvia.org/en/guidance) · [Interactive checklist live](https://clarvia.org/en/checklist) · [DOI: 10.5281/zenodo.20572455](https://doi.org/10.5281/zenodo.20572455) · [FAIR: 4/5](https://fair-software.eu) · Graph code: EUPL-1.2 · Web / Lex code: Apache-2.0 · Data: CC-BY-4.0

## Monorepo layout

This repository is the single public codebase for **Clarvia**:

| Path | What it is |
|---|---|
| `packages/`, `graph/`, `sources/`, `schemas/`, `vocab/`, `exports/` | Consequence graph engine, YAML data, validators, exports |
| [`apps/web/`](apps/web/README.md) | Multilingual website ([clarvia.org](https://clarvia.org)): Ask Clarvia (`/ask`), 1,000-page global guidance library across 196 countries & 14 languages (`/guidance`), and interactive bereavement checklist (`/checklist`) |
| [`lex/`](lex/README.md) | Normalised national legislation corpus and Python CLI (`lex`) |
| [`services/lex/`](services/lex/README.md) | Lex automated email service — **public-safe code and tests only** (no secrets or live prompts) |

See **[`docs/MONOREPO.md`](docs/MONOREPO.md)** for commands, sparse checkout, and licensing per subtree.

## Quick start (within 5 minutes)

```bash
# Prerequisites: Node.js >= 22, pnpm >= 9
git clone https://github.com/clarvia-org/clarvia-graph.git
cd clarvia-graph
pnpm install

# 1. Validate the entire knowledge graph (9-layer pipeline)
pnpm validate

# 2. Run the automated test suite (unit + scenario + contradiction tests)
pnpm test

# 3. Evaluate a real-world scenario (e.g., cross-border death in Luxembourg)
npx tsx packages/cli/src/index.ts scenario tests/scenarios/lu-fr-bank-account.yml

# 4. Generate web runtime and EU interoperability (JSON-LD) exports
pnpm export-web
pnpm export-json
```

**Expected output:**
- `pnpm validate` prints `Validation passed (0 errors)` across all 9 validation layers.
- `pnpm test` passes all unit, scenario, exporter, and contradiction tests.
- `scenario` outputs the matched consequences, computed deadlines, and required task templates for a Luxembourg resident with a French bank account.
- `export-web` and `export-json` write deterministic JSON bundles to `build/exports/`.

**Optional — other monorepo surfaces:**

```bash
# Website (Next.js)
pnpm web:dev          # local dev server
pnpm web:test         # Vitest suite (including 1,000-page guidance corpus validation)

# Legislation corpus (Python >= 3.12, uv)
cd lex && uv run lex check && uv run pytest && cd ..

# Lex email service unit tests (Python >= 3.12, uv)
cd services/lex && uv run pytest && cd ..
```

## What this is

When a person faces a terminal illness diagnosis or dies, their family must navigate dozens of administrative obligations across tax, social security, civil status, health, banking, insurance, and property — often spanning multiple countries and languages. Each obligation has its own authority, deadline, required documents, and legal basis.

**Clarvia Graph** models this complexity as a structured, source-backed **consequence graph** alongside a **1,000-page global guidance corpus** (`apps/web/src/content/corridor-guides.json`):

```
Source Assertion ──supports──▶ Consequence ──generates──▶ Task Template
      │                            │                          │
      ▼                            ▼                          ▼
Source Material               Condition Expr            Evidence Requirement
      │                            │                          │
      ▼                            ▼                          ▼
  Authority                  Life Situation              Case Profile
```

Every claim in the graph traces back to an official government source with a verbatim quote, access date, and review deadline. Nothing reaches production without approved source backing.

## Why this exists

Clarvia Graph is the technical foundation for source-backed terminal illness and bereavement guidance, checklists, and administrative workflows across jurisdictions.

Today, [clarvia.org](https://clarvia.org) serves families globally through:
- **[Ask Clarvia](https://clarvia.org/ask)** — free, source-cited email answers to specific terminal illness, bereavement, and cross-border administrative questions in 100+ languages.
- **[1,000-page global guidance library](https://clarvia.org/en/guidance)** — `592` canonical guides (`392` single-country terminal illness and bereavement guides across all **196 countries** plus **200 cross-border corridors**) published across **14 languages** (`1,000` localized pages).
- **[Interactive bereavement checklist](https://clarvia.org/en/checklist)** — step-by-step interactive checklist launched first in Luxembourg, where Clarvia ASBL is founded.

Our engineering priorities are:

- **Traceability** — Every obligation links to the law or official guide that requires it
- **Cross-border awareness** — A death in Luxembourg with a French pension and a German bank account produces a single coherent task list
- **Freshness guarantees** — Automated staleness detection flags sources before they expire
- **Standards alignment** — Compatible with EU semantic standards (CPSV-AP, CCCEV, ELI, PROV-O)
- **Zero lock-in** — Plain YAML and JSON files in Git, validated by open-source TypeScript and Python tooling

## Repository structure

```
clarvia-graph/
├── schemas/          JSON Schema (draft 2020-12) for all 11 entity types
├── vocab/            Controlled vocabularies (jurisdictions, domains, roles, ...)
├── sources/          Source registry, assertions, and captured snapshots
├── graph/            Core graph records (events, consequences, tasks, ...)
├── overlays/         Optional gold-layer enrichments (contacts, forms, tips)
├── exports/          Generated consumption views (web runtime, interoperability)
├── tests/            Scenario fixtures and validation test cases
├── packages/         TypeScript packages (schema, validator, engine, exporter, cli)
├── apps/web/         Next.js website + 1,000-page global guidance corpus (clarvia.org)
├── lex/              Normalised national legislation corpus + Python CLI
├── services/lex/     Lex email service (public-safe code & tests)
└── docs/             Architecture, ontology, authoring playbook, standards mapping
```

## Scope

- **Global guidance library (`apps/web/src/content/corridor-guides.json`)**: `592` canonical guides (`1,000` localized pages) covering **terminal illness** and **bereavement administration** across all **196 countries** (`392` single-country guides) and **200 cross-border corridors** in **14 languages**, verified across 4 automated factual and URL validation layers.
- **Ask Clarvia (`services/lex/` & `apps/web/src/app/[lang]/ask/`)**: Source-cited automated email guidance service in 100+ languages.
- **Consequence graph (`graph/`, `sources/`, `lex/`)**: Formal CPSV-AP / CCCEV / ELI / PROV-O consequence graph and normalized legislation corpus, with Luxembourg (`LU`) as the first deep reference jurisdiction and cross-border fixtures for `FR`, `DE`, `BE`, `PT`, and `EU`.
- **Architecture**: Jurisdiction-agnostic and life-event-agnostic by design.

## Development commands

```bash
pnpm build                    # Build all packages
pnpm test                     # Run all unit and scenario tests
pnpm validate                 # Run 9-layer validation pipeline
pnpm export-web               # Generate web runtime export
pnpm export-json  # Generate CPSV-AP/CCCEV/ELI/PROV-O export
pnpm typecheck                # TypeScript type checking
```

## Documentation

- [Monorepo Guide](docs/MONOREPO.md) — Subtrees, commands, sparse checkout, licensing
- [DPG Compliance](DPG.md) — How Clarvia Graph meets the 9 Digital Public Goods Standard indicators
- [First Contribution Guide](docs/FIRST_CONTRIBUTION.md) — Your first contribution in under an hour (3 paths)
- [Foundation Specification](docs/FOUNDATION.md) — Core domain model, ontology, ID grammar, and EU standards mapping (CPSV-AP, CCCEV, ELI, PROV-O)
- [Conventions](docs/CONVENTIONS.md) — Naming, YAML formatting, and deterministic identifier conventions
- [Adding a Jurisdiction](docs/ADDING_A_JURISDICTION.md) & [Adding a Life Event](docs/ADDING_A_LIFE_EVENT.md) — How to add sources, assertions, and consequences
- [Review Policy](docs/REVIEW_POLICY.md) — Roles, review gates, AI boundaries, and validation rules
- [Build & Export Pipeline](docs/BUILD.md) — CLI commands, validation pipeline, and export verification
- [Translations](docs/TRANSLATIONS.md) — Multilingual overlays and locale support

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute sources, assertions, guidance corrections, translations, or code. Need a walkthrough? Start with the [First Contribution Guide](docs/FIRST_CONTRIBUTION.md).

## Contributors

Clarvia is built by volunteers who care about making administrative guidance clearer for families during terminal illness and bereavement.

### Data & Research

- **[HirenGajjar](https://github.com/HirenGajjar)** — Cross-border bereavement dataset: source records, institution registries, document requirements, deadlines, conditions, tasks, workflows, and scenario fixtures across Luxembourg, France, Belgium, Germany, and Portugal (`#48`–`#52` in `workflow-data`).
- **[Talizdo](https://github.com/Talizdo)** — Luxembourg bereavement source discovery and registration (`#18`–`#21`, `#45` in `workflow-data`, [#5](https://github.com/clarvia-org/clarvia-graph/pull/5)).

### Project Maintainer

- **[Tommi Lindfors](https://github.com/TommiLindfors)** — Architecture, schema design, validation engine, global guidance corpus, and project stewardship (CLARVIA ASBL).

Want to see your name here? Check out [good first issues](https://github.com/clarvia-org/clarvia-graph/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or read the [First Contribution Guide](docs/FIRST_CONTRIBUTION.md).

## License

Path-scoped open licenses — enforced via [`REUSE.toml`](REUSE.toml):

- **Graph code and tooling (`packages/`):** [EUPL-1.2](LICENSE)
- **Graph data, guidance corpus (`corridor-guides.json`), schemas, vocabularies, documentation:** [CC-BY-4.0](LICENSE-DATA)
- **Website (`apps/web/`), legislation tooling (`lex/`), Lex email (`services/lex/`):** [Apache-2.0](apps/web/LICENSE)
- **Legislation corpus (`lex/countries/`):** per-country official source licence (e.g. Luxembourg Legilux CC-BY-4.0)

Built by [CLARVIA ASBL](https://clarvia.org), a non-profit association registered in Luxembourg.
