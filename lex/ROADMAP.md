# Roadmap

## Stage 0 — Repository scaffold

Create the public repository, authoritative documentation, functioning validation CLI, schema, CI, tests, Luxembourg source metadata, and contributor workflows.

No real legislation is added during this stage.

## Stage 1A — Luxembourg one-law vertical slice

Implement the complete end-to-end Luxembourg pipeline using:

- `lu/code-civil`

This stage includes:

- the Luxembourg adapter;
- official-source discovery and retrieval;
- exact source retention;
- normalization to Markdown;
- provision anchors;
- source verification;
- all final v1 CLI commands;
- deterministic update behavior;
- fixtures, unit tests, adapter conformance tests, and live smoke tests.

No second law is added until this stage passes all acceptance criteria.

## Stage 1B — Luxembourg representative ten-law slice

Add nine additional Luxembourg laws, for ten total.

**Selection (approval gate):** see [`countries/lu/STAGE_1B_SELECTION.md`](countries/lu/STAGE_1B_SELECTION.md) (approved with edits).

**Implementation:** extend the Luxembourg adapter past Code civil–only and publish the nine approved IDs (Casemates only; HTML retained for `lu/loi-2024-07-31-a339`; Constitution FR + DE).

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

## Stage 2 — Luxembourg coverage expansion

Expand Luxembourg coverage using the accepted adapter and data contract.

**Control plane:** [`countries/lu/STAGE_2.md`](countries/lu/STAGE_2.md) · [Project](https://github.com/orgs/clarvia-org/projects/4) · [Milestone](https://github.com/clarvia-org/lex/milestone/1)

**Gate:** inventory issue [#4](https://github.com/clarvia-org/lex/issues/4) (catalog + frozen batch ID manifests) before domain ingest batches [#5](https://github.com/clarvia-org/lex/issues/5)–[#16](https://github.com/clarvia-org/lex/issues/16).

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

## Stage 3 — France

France is the second country. Implementation is blocked until a blueprint amendment defines the country-specific source contract, rights, first authorized law, stable-ID mapping, and acceptance criteria.

## Stage 4 — Germany

Germany is the third country. Implementation is blocked until a blueprint amendment defines the same country-specific contract.

## Stage 5 — Volunteer jurisdictions

Additional jurisdictions may be proposed after Luxembourg, France, and Germany have each published at least one verified law. New countries remain limited by the five-country and repository-size boundaries.

## Hosted layers

A hosted API, MCP server, website, object store, or external data service is not authorized by this blueprint. Building one requires a future blueprint amendment.
