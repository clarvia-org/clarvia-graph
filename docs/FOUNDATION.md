# Foundation Specification

This document defines the overall architecture, governance model, and design standards for the Clarvia consequence graph.

The foundation specification is the authoritative reference for how the graph is structured, how content is reviewed and published, and how the system extends to new jurisdictions and life events. Individual spec documents live alongside this overview in the [`docs/`](.) directory.

---

## Core Architecture

The graph follows a single provenance chain:

```
source → snapshot → assertion → consequence → task_template → checklist_item
```

Every user-facing checklist item traces back to a captured official source. Nothing publishes without an approved source assertion.

For the full data model, see the [JSON Schema definitions](../schemas/v0.1).

---

## Specification Documents

| Document | Scope |
|---|---|
| [Editorial conventions](CONVENTIONS.md) | Content hashing, file format norms, and editorial rules |
| [Review and governance policy](REVIEW_POLICY.md) | Review lifecycle, publication gates, AI boundaries, and contributor model |
| [Translations](TRANSLATIONS.md) | Multilingual content model, overlay format, and fallback rules |
| [Adding a jurisdiction](ADDING_A_JURISDICTION.md) | Step-by-step guide for extending the graph to a new country |
| [Adding a life event](ADDING_A_LIFE_EVENT.md) | Step-by-step guide for extending the graph to a new life event |

---

## Key Design Decisions

- **Source-backed** — every published claim traces to a captured official source
- **Three-valued logic** — conditions evaluate to `true`, `false`, or `unknown`; uncertainty is never hidden
- **Cross-border composition** — jurisdiction roles (death place, habitual residence, work state, asset situs) compose layered checklists
- **Static exports** — consumer apps load generated JSON at build time with no runtime API dependency
- **Privacy-first** — condition evaluation happens client-side; no user data is sent to servers

---

## Standards Alignment

The graph maintains Clarvia-native schemas and generates compatibility views for:

- **CPSV-AP** — Core Public Service Vocabulary Application Profile
- **CCCEV** — Core Criterion and Core Evidence Vocabulary
- **ELI** — European Legislation Identifier
- **PROV-O** — W3C Provenance Ontology

---

## Extensibility Model

The graph extends along two axes without schema changes:

| Axis | Mechanism | Isolation guarantee |
|---|---|---|
| **New jurisdiction** | Add vocab entry, sources, and graph records under `<jurisdiction>/` directories | CI verifies no existing jurisdiction outputs change |
| **New life event** | Add vocab entries, intake facts, and graph records under `<life_event>/` namespaces | Generator filters by `life_event`; events cannot affect each other |

See [Adding a jurisdiction](ADDING_A_JURISDICTION.md) and [Adding a life event](ADDING_A_LIFE_EVENT.md) for complete walkthroughs.

---

## Versioning

The foundation specification is versioned alongside the schema (`v0.1`). Breaking changes to the data model, review policy, or extensibility guarantees require a version bump and migration path.
