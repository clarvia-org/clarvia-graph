# Digital Public Good readiness

This document maps **Clarvia Graph** to the Digital Public Goods Standard, outlining open licensing, stewardship, standards compliance, privacy protections, and Sustainable Development Goal (SDG) alignment.

## Summary

Clarvia Graph is free, open-source public-interest infrastructure for administrative life-event navigation, starting with bereavement administration in Luxembourg. It provides structured, source-backed workflow data, schemas, validation tooling, exports, and reusable public-interest infrastructure that can be used by individuals, nonprofits, civic-tech builders, researchers, and public-interest organizations.

Clarvia.org is the first public-facing implementation of this infrastructure. The nominated DPG is the reusable graph/data/workflow infrastructure, not only the website.

## DPG asset type

Clarvia Graph combines:
- **Open-source software**: CLI validation, build, and export tooling under [`packages/cli/`](packages/cli/) and the checklist generator engine under [`packages/generator/`](packages/generator/).
- **Open data**: Consequence records under [`graph/`](graph/) and controlled vocabularies under [`vocab/`](vocab/).
- **Open standards-based workflow/schema infrastructure**: JSON Schemas under [`schemas/`](schemas/).
- **Open public-interest content**: Derived metadata and assertions from official government sources under [`sources/`](sources/).

## Ownership and stewardship

Clarvia Graph is maintained by **Clarvia ASBL**, a registered Luxembourg non-profit association (*association sans but lucratif*), under registration number **F15680**. 

The repository's operational boundaries and review lifecycles are governed by:
- [Review and governance policy](docs/REVIEW_POLICY.md)
- [Editorial conventions](docs/CONVENTIONS.md)

The project is designed and maintained as public-interest digital commons, not as a commercial SaaS dependency or proprietary platform lock-in.

## Open licenses

The repository uses a split licensing model depending on the type of asset, fully documented in [REUSE.toml](REUSE.toml):

- **Software / code & tooling**: [EUPL-1.2](LICENSE) (European Union Public Licence v1.2), covering validators, exporters, package setups, and test suites.
- **Graph data & controlled vocabularies**: [CC-BY-4.0](LICENSE-DATA) (Creative Commons Attribution 4.0 International).
- **Schemas**: [CC-BY-4.0](LICENSE-DATA).
- **Documentation & exports**: [CC-BY-4.0](LICENSE-DATA).
- **Source assertions & snapshot metadata**: [EUPL-1.2](LICENSE) (for original analytical classifications).
- **Captured HTML snapshots**: Publicly available government pages, archived copies governed under `LicenseRef-Gov-PublicDomain`.

## Open data and reuse evidence

Clarvia's first open dataset is published on Luxembourg's national open data portal:
- **Dataset name**: [Bereavement Source Register — Luxembourg](https://data.public.lu/en/datasets/bereavement-source-register-luxembourg/)
- **Portal**: data.public.lu
- **License**: CC-BY-4.0
- **Publisher**: Clarvia ASBL

This dataset provides a structured, machine-readable registry of official government sources related to bereavement administration in Luxembourg, compiling verified URLs, issuing authorities, and legislation references from Guichet.lu, Centre des pensions (CNAP), Caisse nationale de santé (CNS), and cross-border corridors.

## Documentation and reuse

Developers, public-interest builders, and researchers can find reuse guides and exports as follows:
- **Data model / schema documentation**: JSON Schema definitions in the [`schemas/`](schemas/) directory and architecture overviews in [`docs/FOUNDATION.md`](docs/FOUNDATION.md).
- **Source register structure**: Registry and snapshots in [`sources/`](sources/) and guidelines in [`docs/FOUNDATION.md`](docs/FOUNDATION.md#core-architecture).
- **Validation process**: Build instructions in [`docs/BUILD.md`](docs/BUILD.md) and tool CLI scripts in [`packages/cli/`](packages/cli/).
- **Generated exports**: Standalone JSON exports in [`exports/`](exports/) (e.g. [`exports/example-bereavement-lu.json`](exports/example-bereavement-lu.json)).
- **JSON / JSON-LD / CPSV-AP outputs**: Generated views in the [`exports/`](exports/) directory.
- **Tests or quality checks**: Scenario-based assertion verifications in [`tests/`](tests/).
- **Contribution process**: Guide for external builders in [CONTRIBUTING.md](CONTRIBUTING.md).
- **Security / contact process**: Reporting vulnerabilities path in [SECURITY.md](SECURITY.md).

## Standards and best practices

The repository integrates and targets alignment with the following standards:
- **JSON Schema**: Used to validate all canonical consequence, authority, and task template definitions.
- **JSON-LD**: Used to map structured relationships into semantic graph exports.
- **CPSV-AP** (Core Public Service Vocabulary Application Profile): Compatibility views are mapped to support European interoperability standards.
- **CCCEV** (Core Criterion and Core Evidence Vocabulary): Used to define required evidence and certificates.
- **ELI** (European Legislation Identifier): Links source assertions to formal EU/national legislative acts.
- **PROV-O** (W3C Provenance Ontology): Traces validation history and source extraction steps. (Planned integration: see TODO in [`docs/FOUNDATION.md`](docs/FOUNDATION.md#standards-alignment)).
- **FAIR data principles**: Follows the fair-software.eu recommendations (self-assessed 4/5 as of June 2026; status should be revalidated periodically).
- **REUSE licensing practice**: Full REUSE compliance with strict machine-readable file headers.
- **OpenSSF Best Practices**: Registered with the OpenSSF Best Practices badge program (passing).

## Privacy and data protection

Clarvia Graph’s core data and static checklist do not require personal case information to be submitted to Clarvia. They operate using official sources, structured metadata, workflow definitions, and client-side condition evaluation.

* **Client-side checklist evaluation**: Circumstance and conditional rules are evaluated in the user’s browser or local application through `@clarvia/generator`.
* **Lex service boundary**: Lex is a separate automated email service. It processes email addresses, message content, thread history, and recipient information as needed to provide and continue responses.
* **Data minimisation**: Lex users are asked not to include names or other identifying information about living people in their questions and to share only what is necessary.
* **Privacy information**: Personal-data handling by Lex and other Clarvia services is described in Clarvia’s existing [Privacy & Cookie Policy](https://clarvia.org/en/privacy).
* **Privacy review**: Features involving personal data or server-side processing must undergo privacy and security review before deployment.

## Do no harm and safety boundaries

> [!IMPORTANT]
> Clarvia provides practical guidance and signposting. It does not provide emergency, legal, tax, medical, psychological, notarial, banking, financial, or succession advice. Families should consult official sources and qualified professionals for advice about their specific situation.
>
> Clarvia is not an emergency service. If there is an immediate risk to life or safety, call 112 in Luxembourg.

This boundary exists because bereavement administration is highly sensitive and administrative or procedural mistakes can have binding legal, financial, or emotional consequences for families during a time of acute grief. Therefore, Clarvia Graph models official routing and signposting as reference information, rather than replacement for qualified professional counsel.

## SDG alignment

### Primary SDG: SDG 16 — Peace, justice and strong institutions
Clarvia supports access to public information, administrative transparency, and more inclusive interaction with public institutions by transforming official guidance into structured, source-backed workflows and reusable open data.

### Secondary SDG: SDG 10 — Reduced inequalities
Clarvia reduces inequality in access to administrative support by making complex procedures easier to understand, multilingual, reusable, and available as free public-interest infrastructure.

### Tertiary SDG: SDG 9 — Industry, innovation and infrastructure
Clarvia contributes open digital infrastructure that can be reused by nonprofits, civic-tech builders, researchers, and public-interest organizations.

## Platform independence

The core data, schemas, and exports are designed to be reusable outside Clarvia.org. The outputs in the [`exports/`](exports/) directory are distributed as flat, static JSON/JSON-LD files. The data and schemas are openly reusable and not locked to one hosted service, allowing any third-party portal, mobile app, or case-management system to consume them independently.

## Known limitations

- **Initial jurisdiction focus is Luxembourg**: The first validated dataset targets Luxembourg.
- **Bereavement focus**: Bereavement is the first life-event domain; other domains are not yet defined.
- **Official source dependency**: Workflows depend on official-source availability and update cadence.
- **Not professional advice**: Clarvia does not replace official sources or qualified professional advice.
- **Local validation required**: Further jurisdictional expansion requires local validation.

## Review checklist

- [x] README links to DPG.md
- [x] License files are present and referenced correctly
- [x] Dataset link to data.public.lu is included
- [x] Privacy and do-no-harm boundaries are documented
- [x] SDG alignment is documented
- [x] Reuse/export documentation is linked
- [x] Contribution and security paths are linked
