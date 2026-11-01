# Digital Public Good Compliance — Clarvia Graph

This document maps the Clarvia Graph project to the 9 indicators of the [DPG Standard](https://digitalpublicgoods.net/standard/) maintained by the Digital Public Goods Alliance (DPGA).

## 1. Relevance to Sustainable Development Goals

Clarvia Graph is an open-source knowledge graph, validation engine, and global multilingual guidance platform for life-event administrative workflows — covering **terminal illness and bereavement administration** across **196 countries and 200 cross-border corridors in 14 languages** (`1,000` localized pages), alongside **Ask Clarvia** and an interactive bereavement checklist launched first in Luxembourg.

**SDG 16 — Peace, Justice and Strong Institutions:**
- **Target 16.6** (Develop effective, accountable and transparent institutions): Clarvia structures fragmented, multi-agency administrative procedures into a verifiable, machine-readable graph where every claim is backed by an official government source with full provenance tracking.
- **Target 16.10** (Ensure public access to information): Families facing a terminal illness diagnosis or bereavement often struggle to navigate scattered obligations across tax, social security, civil registry, health, and pension authorities — especially in cross-border and multilingual situations. Clarvia makes this public information structured, multilingual (14 languages), and freely accessible.

**SDG 10 — Reduced Inequalities:**
- **Target 10.2** (Promote universal social, economic and political inclusion): Cross-border workers, immigrants, and families without legal resources are disproportionately harmed by opaque administrative requirements and missed deadlines. Clarvia provides equal access to verified procedural knowledge regardless of language, country, or socioeconomic status.

**SDG 3 — Good Health and Well-Being:**
- Reducing acute administrative stress during terminal illness and bereavement supports mental health and well-being at one of the most vulnerable moments in a family's life.

## 2. Use of Approved Open Licenses

All components of Clarvia Graph use OSI-approved or Creative Commons open licenses, enforced via [`REUSE.toml`](REUSE.toml) and verified in CI on every commit:

| Component | License | File |
|---|---|---|
| Source code, validators, exporters (`packages/`) | **EUPL-1.2** (OSI-approved) | [`LICENSE`](LICENSE) |
| Website (`apps/web/`), legislation (`lex/`), Lex email (`services/lex/`) | **Apache-2.0** (OSI-approved) | [`apps/web/LICENSE`](apps/web/LICENSE), [`lex/LICENSE`](lex/LICENSE) |
| Graph data (`graph/`), 1,000-page guidance corpus (`corridor-guides.json`), vocabularies (`vocab/`), schemas (`schemas/`), documentation (`docs/`), exports (`exports/`) | **CC-BY-4.0** | [`LICENSE-DATA`](LICENSE-DATA) |
| Archived government HTML snapshots (`sources/snapshots/html/`) | Public domain (national law) | [`LICENSES/LicenseRef-Gov-PublicDomain.txt`](LICENSES/LicenseRef-Gov-PublicDomain.txt) |

## 3. Clear Ownership

- **Legal entity:** CLARVIA ASBL, a non-profit association (*association sans but lucratif*) registered in Luxembourg.
- **Copyright and trademark:** All original work is copyright `2025-2026 CLARVIA ASBL, Luxembourg`, explicitly declared in [`REUSE.toml`](REUSE.toml), [`LICENSE`](LICENSE), [`LICENSE-DATA`](LICENSE-DATA), and [`CITATION.cff`](CITATION.cff).

## 4. Platform Independence

Clarvia Graph has zero proprietary dependencies. It runs entirely on open-source software:
- **Runtime:** Node.js (v22+) and Python (3.12+ for `lex/`)
- **Package manager:** pnpm
- **Language:** TypeScript (strict mode) and Python
- **Validation & Testing:** Ajv (JSON Schema draft 2020-12), YAML, Vitest, Pytest
- **Data format:** Human-readable YAML files (`graph/`, `sources/`, `vocab/`) and standard JSON / JSON-LD (`schemas/`, `exports/`, `apps/web/src/content/corridor-guides.json`)

All build, validation, test, and export steps run locally or in any standard Linux/macOS/Windows environment via `pnpm validate`, `pnpm test`, and `pnpm export:web`.

## 5. Documentation

Comprehensive documentation is maintained in the repository under [`docs/`](docs/):
- [`README.md`](README.md) — Quick start, architecture overview, repository structure, and CLI usage
- [`docs/ONTOLOGY.md`](docs/ONTOLOGY.md) — Core domain model and entity relationships
- [`docs/AUTHORING_PLAYBOOK.md`](docs/AUTHORING_PLAYBOOK.md) — Step-by-step guide for adding sources, assertions, and consequences
- [`docs/VALIDATION_RULES.md`](docs/VALIDATION_RULES.md) — Specification of the 9-layer validation pipeline
- [`docs/STANDARDS_MAPPING.md`](docs/STANDARDS_MAPPING.md) — Alignment with EU standards (CPSV-AP, CCCEV, ELI, PROV-O)
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — Contribution workflow, status rules, and DCO sign-off

## 6. Mechanism for Extracting Data

Data is stored natively in open, non-proprietary formats (YAML and JSON) in the repository and can be extracted at any time:
- **Raw graph data:** Directly readable YAML files in [`graph/`](graph/) and [`sources/`](sources/)
- **Global guidance corpus:** Directly readable JSON in [`apps/web/src/content/corridor-guides.json`](apps/web/src/content/corridor-guides.json) (`592` canonical guides / `1,000` localized pages across `196` countries and `14` languages)
- **Web runtime export:** `pnpm export:web` generates a deterministic, self-contained JSON bundle in [`exports/web/`](exports/web/)
- **EU interoperability export:** `pnpm export:interoperability` generates a JSON-LD bundle mapped to CPSV-AP, CCCEV, ELI, and PROV-O vocabularies

## 7. Adherence to Privacy and Applicable Laws

- **No personal data in the graph or guidance corpus:** This repository contains only public administrative rules, institutional metadata, and government source references. It collects, stores, or processes zero personal data or PII.
- **Client-side evaluation for checklists:** The interactive checklist evaluates user conditions client-side in the browser without tracking cookies.
- **GDPR compliance:** Operated by CLARVIA ASBL under Luxembourg and EU law (GDPR), with a clear privacy policy published at [`https://clarvia.org/en/privacy`](https://clarvia.org/en/privacy).

## 8. Adherence to Standards & Best Practices

- **EU Semantic Interoperability Standards:** Explicitly aligned with the European Commission's Core Public Service Vocabulary Application Profile (**CPSV-AP**), Core Criterion and Core Evidence Vocabulary (**CCCEV**), European Legislation Identifier (**ELI**), and W3C Provenance Ontology (**PROV-O**). See [`docs/STANDARDS_MAPPING.md`](docs/STANDARDS_MAPPING.md).
- **Data Schemas:** Formal JSON Schema (Draft 2020-12) definitions in [`schemas/`](schemas/).
- **Software Quality & Security:**
  - 9-layer automated graph validation pipeline (`pnpm validate`) and 4-layer guidance corpus verification suite (`corridor-guides.test.ts`)
  - Unit and scenario test suites (`pnpm test`, `pnpm web:test`) with Codecov coverage tracking
  - CodeQL static analysis, SonarCloud quality gates, and OpenSSF Scorecard in CI
  - REUSE 3.0 license compliance verified in CI
  - [`publiccode.yml`](publiccode.yml) metadata for EU public sector software catalogues

## 9. Do No Harm by Design

Bereavement and terminal illness are high-vulnerability life events where inaccurate legal or procedural information can cause financial loss, missed statutory deadlines, or severe distress. Clarvia is engineered around strict "Do No Harm" safeguards:

1. **No Unverified Claims in Production:** The exporter (`pnpm export:web`) strictly filters out any record where `authoring_status !== "approved"` or where backing source assertions do not have `review_status === "approved"`.
2. **4-Layer Guidance Corpus Verification:** The 1,000-page guidance corpus (`corridor-guides.json`) is validated across 4 layers: (1) HTTP/URL reachability and soft-404 removal, (2) institutional domain authority verification, (3) statutory/numeric claim verification against live official sources, and (4) contact phone/email verification against source pages.
3. **Maintainer Gatekeeping:** External contributors can submit records only in `draft` status. CI automatically rejects pull requests that attempt to self-approve assertions or graph records without maintainer review.
4. **Contradiction Detection:** Layer 6 of the validator (`checkContradictions`) automatically detects conflicting deadlines or requirements across assertions before they can be merged.
5. **Provenance & Staleness Tracking:** Every source assertion records the exact government URL, access date, `review_by` expiration date, and verbatim quote or section reference, ensuring full auditability and timely re-verification.
6. **Non-Legal-Advice Boundary:** All outputs clearly distinguish between structured public administrative information and individualized legal or notarial advice.
