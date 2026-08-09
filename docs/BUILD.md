# Build and Export Pipeline

> Part of the [Clarvia Graph Foundation Specification](FOUNDATION.md).

This document explains how to run the Clarvia build and export pipeline,
what each command produces, how the outputs are consumed by apps/web,
and how to verify everything works from a clean checkout.

---

## Prerequisites

- Node.js ≥ 22 (`node --version`)
- pnpm (`npm install -g pnpm` or via Corepack)
- Clone the repo and run `pnpm install` from the repo root

```bash
git clone https://github.com/clarvia-org/clarvia-graph.git
cd clarvia-graph
pnpm install
```

---

## The tsx decision (alpha rationale)

All CLI commands run TypeScript directly via `tsx` — no build step is required
to run `pnpm validate`, `pnpm export-json`, or any other command. This is a
deliberate alpha trade-off: tsx unblocks Node 22 + pnpm + ESM execution without
a compilation step, which keeps the contributor workflow simple.

The `bin` field in `packages/cli/package.json` points to `./dist/index.js`,
which is only needed if you install the CLI as a standalone binary via
`pnpm build`. For graph data work and CI, the `tsx`-based scripts are the
primary interface.

This decision is revisited as part of issue #22 before the graph reaches beta.

---

## CLI commands

All commands run from the repo root via pnpm:

| Command | What it does |
|---------|-------------|
| `pnpm validate` | JSON Schema validation of all YAML graph files |
| `pnpm lint-ids` | ID grammar and length checks |
| `pnpm check-references` | Verify all `_refs` point to existing records |
| `pnpm check-anchors` | Verify assertion anchors exist in captured snapshots |
| `pnpm check-publication-gate` | Validate publication gate requirements |
| `pnpm check-contradictions` | Flag overlapping conflicting claims |
| `pnpm test-scenarios` | Run scenario regression tests |
| `pnpm build-checklist` | Generate checklist output for test scenarios |
| `pnpm export-json` | Export full graph as a single JSON file |
| `pnpm export-web` | Export web runtime bundle for apps/web |
| `pnpm capture <url>` | Fetch a source URL and save a snapshot |
| `pnpm extract` | Scaffold an assertion batch from a snapshot |
| `pnpm test` | Run all unit and integration tests |

Run `pnpm validate && pnpm lint-ids && pnpm check-references && pnpm test`
before every commit to verify the graph is consistent.

---

## Export pipeline

The export pipeline converts the YAML graph into JSON artifacts consumed
by downstream applications. Two export formats are supported.

### `pnpm export-json` — Full graph export

Produces a single JSON file containing the complete graph:

```
build/exports/json/
  graph-export.json
```

`graph-export.json` contains:

- `$schema` — export schema identifier
- `version` — graph package version
- `exported_at` — ISO 8601 timestamp
- `stats` — record count breakdown by type
- Arrays for each record type: `consequences`, `task_templates`, `conditions`,
  `deadlines`, `authorities`, `evidence_types`, `intake_fact_types`

Example output (alpha, v0.1.0-alpha.3):

```
Exported 131 records:
  19 consequences
  19 task templates
  18 conditions
  10 deadlines
  22 authorities
  28 evidence types
  15 intake fact types
```

Use this export for:

- Bulk analysis of the full graph
- Seeding other tools that consume the raw graph structure
- Debugging — inspect every record in one file

### `pnpm export-web` — Web runtime bundle

Produces a structured bundle consumed by apps/web:

```
build/exports/web/
  manifest.json
  intake/
    bereavement.json
  runtime/
    bereavement.json
```

**Publication gate:** only consequences with `distribution_status: public_open`
or `public_metadata_only` appear in the web export (spec §10.6). Draft or
restricted records are excluded regardless of their `authoring_status`.

#### `manifest.json`

Index of available life events and jurisdictions. apps/web loads this
first to know what data is available.

```json
{
  "$schema": "clarvia-web-export/v0.1",
  "graph_version": "0.1.0-alpha.3",
  "graph_commit": "a0ee6ef",
  "export_version": "0.1.0",
  "generated_at": "...",
  "life_events": [
    {
      "id": "bereavement",
      "intake_url": "intake/bereavement.json",
      "runtime_url": "runtime/bereavement.json",
      "jurisdictions": ["LU"]
    }
  ]
}
```

#### `intake/<life_event>.json`

Questions the UI must ask the user before generating a checklist. Includes
multilingual labels (`label_en`, `label_fr`, `label_de`) and options for
controlled-value fields such as jurisdiction dropdowns.

apps/web loads this file lazily when a user selects a life event.

#### `runtime/<life_event>.json`

Pre-compiled runtime data for client-side evaluation. Contains conditions
(with JsonLogic expressions), consequences, task templates, authorities,
deadlines, and evidence types — all resolved and filtered to public records.

apps/web loads this lazily alongside the intake file. The client-side
`LocalResolver` evaluates conditions against user-provided facts and generates
the checklist without sending any data to a server.

---

## How apps/web consumes the exports

apps/web (see [apps/web package](../apps/web/))
loads the web export at build time via a static fetch:

```
manifest.json              → loaded first, determines available life events
intake/bereavement.json    → loaded when user selects bereavement
runtime/bereavement.json   → loaded alongside intake to enable evaluation
```

The client evaluates conditions locally using the JsonLogic expressions in
`runtime/<life_event>.json`. No user data leaves the browser.

To update apps/web with new graph data from the monorepo root:

```bash
pnpm export-and-sync-web
```

That exports the web bundle and syncs it into `apps/web/public/data/clarvia/`.
You can still run `pnpm export-web` alone if you only need `build/exports/web/`.

---

## Running tests

```bash
pnpm test
```

Tests cover:

- Unit tests for the generator, evaluator, and loader
- Integration tests for all CLI commands
- Characterization tests that pin the export pipeline output against the
  real graph (`export-web.test.ts`, `validate.characterization.test.ts`)
- Golden tests for checklist generation (`golden.test.ts`)

**Characterization tests pin the current output.** When you add new graph
records, characterization tests will fail with a diff showing the new records.
Update snapshots with:

```bash
pnpm vitest run -u
```

Always verify that the updated snapshot reflects your intended change before
committing.

---

## Clean checkout verification

To verify everything works from a clean checkout:

```bash
git clone https://github.com/clarvia-org/clarvia-graph.git
cd clarvia-graph
pnpm install
pnpm validate
pnpm lint-ids
pnpm check-references
pnpm test
pnpm export-json
pnpm export-web
```

All commands should complete without errors. `pnpm check-references` may report
warnings for broken `evidence_type_refs` in cross-border task templates — these
are known alpha gaps tracked separately, not blocking errors.

---

## CI behaviour

The CI pipeline (`.github/workflows/ci.yml`) runs on every pull request:

| Step | Command | Required |
|------|---------|---------|
| Lint + typecheck | `pnpm lint && pnpm typecheck` | ✅ |
| Test | `pnpm test` | ✅ |
| Validate graph data | `pnpm validate && pnpm lint-ids && pnpm check-references && pnpm check-anchors` | ✅ |

CI **does not** run `export-json` or `export-web` on every PR. Exports are
triggered on merge to main via the release workflow
(`.github/workflows/release-web-export.yml`).

If you add new graph records, make sure `pnpm validate` and `pnpm test` both
pass — these are the required checks for PR merge.
