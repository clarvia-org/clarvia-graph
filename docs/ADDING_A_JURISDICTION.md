# Adding a Jurisdiction

This guide walks through adding a new country to the Clarvia consequence graph. We use **Belgium (BE)** as the running example, but the steps apply to any jurisdiction.

> **Non-negotiable:** Adding a jurisdiction must not change existing records, weaken publication gates, or break scenario tests for other jurisdictions (spec §21.1).

---

## Coverage Stages

A jurisdiction progresses through five stages:

| Stage | What exists | User-visible? |
|---|---|---|
| `metadata_only` | Vocab entry + coverage entry, no content | No |
| `source_backed` | Official sources, snapshots, and assertions | No |
| `checklist_draft` | Consequences and task templates exist, not fully reviewed | No |
| `published` | Approved assertions + `public_open` consequences generate checklist items | **Yes** |
| `monitored` | Published + gold-layer monitoring/freshness tracking | **Yes** |

A jurisdiction may be partially published — e.g. death registration is `published` while succession is still `checklist_draft`.

---

## Prerequisites

- Node.js ≥ 20, pnpm
- The CLI: `pnpm install` from the repo root
- A government source URL for the jurisdiction (e.g. `https://www.belgium.be/...`)

---

## Step 1: Verify the Jurisdiction Exists in Vocabularies

Check `vocab/jurisdictions.yml`. Belgium is already registered:

```yaml
- id: BE
  label: Belgium
  label_fr: Belgique
  label_de: Belgien
  uri: "http://publications.europa.eu/resource/authority/country/BEL"
  languages: [fr, nl, de]
```

If your jurisdiction is missing, add it here with at minimum `id`, `label`, `label_fr`, `label_de`, and `uri` (EU Publications Office URI).

---

## Step 2: Add a Coverage Entry

Add an entry to `coverage/jurisdictions.yml`:

```yaml
- jurisdiction: BE
  life_events:
    bereavement:
      stage: metadata_only
      notes: "Skeleton created, no sources yet."
```

Update the `stage` as you progress through the steps below.

---

## Step 3: Create the Directory Skeleton

Create these directories (with `.gitkeep` files where empty):

```
graph/
  authorities/be/
  conditions/bereavement/be/
  consequences/bereavement/be/
  task_templates/bereavement/be/
  deadlines/bereavement/be/
sources/
  assertions/be/
tests/
  scenarios/be/
```

> **Note:** `evidence_types/`, `forms/`, and `intake_fact_types/` are not jurisdiction-scoped — they live under `graph/<type>/<jurisdiction>/` or `graph/intake_fact_types/<life_event>/` respectively.

---

## Step 4: Register an Official Source

Add a source record to `sources/register.yml`. Follow the existing pattern:

```yaml
- id: source.belgium_gov.bereavement
  title: "Décès - démarches administratives"
  title_en: "Death - administrative procedures"
  url: "https://www.belgium.be/fr/famille/deces"
  source_type: government_portal
  jurisdiction: BE
  publisher: "Service public fédéral Intérieur"
  languages: [fr]
  domain: death_registration
  life_event: bereavement
  source_role: primary_guidance
  monitoring:
    active: false
  verified_at: null
```

**ID convention:** `source.<origin_slug>.<topic_slug>`

---

## Step 5: Capture the Source

```bash
pnpm capture source.belgium_gov.bereavement
```

This creates:
- `sources/snapshots/belgium_gov_bereavement_YYYY_MM_DD.yml` — metadata + SHA-256 hash
- `sources/snapshots/html/belgium_gov_bereavement_YYYY_MM_DD.html` — archived HTML

---

## Step 6: Extract Assertions

```bash
pnpm extract snapshot.belgium_gov.bereavement.YYYY_MM_DD
```

This scaffolds an assertion batch file at `sources/assertions/be/belgium_gov/bereavement.yml`. Edit the scaffolded file to add real assertions extracted from the captured HTML:

```yaml
source_id: source.belgium_gov.bereavement
source_snapshot_id: snapshot.belgium_gov.bereavement.2026_06_10
assertions:
  - id: assertion.belgium_gov.bereavement.death_declaration_required
    schema_version: "0.1.0"
    claim_type: legal_scope
    claim_text: >
      En Belgique, le décès doit être déclaré à l'officier de l'état
      civil de la commune où le décès a eu lieu.
    claim_scope:
      jurisdiction: BE
      life_event: bereavement
      domain: death_registration
    anchor:
      selector_type: text_quote
      text_quote: "déclaré à l'officier de l'état civil"
    source_tier: official_guidance
    record_valid_from: "2026-06-10"
    review_status: draft        # Always starts as draft
    confidence: unassessed      # Until reviewed
    provenance:
      extraction_method: ai_assisted
      extracted_at: "2026-06-10T10:00:00Z"
```

**Key rules:**
- `anchor.text_quote` must exist verbatim in the captured HTML (verified by `check-anchors`)
- `claim_text` stays in the source's original language
- `review_status` starts as `draft` — only a founder/reviewer can set `approved`
- `extraction_method: ai_assisted` stays even after human approval (provenance honesty)

---

## Step 7: Add Reusable Objects

### Authority

```yaml
# graph/authorities/be/etat_civil.yml
id: authority.be.etat_civil
schema_version: "0.1.0"
name: "Officier de l'état civil"
name_en: "Civil Registrar"
name_de: "Standesbeamter"
jurisdiction: BE
function: "Civil status registration — births, marriages, deaths"
official_site: null
contact_channels: []
languages: [fr, nl, de]
authoring_status: draft
distribution_status: public_open
record_valid_from: "2026-06-10"
```

### Evidence types, forms

Add to `graph/evidence_types/be/` and `graph/forms/be/` as needed. These are jurisdiction-scoped but not life-event-scoped.

---

## Step 8: Add Graph Records

### Condition

```yaml
# graph/conditions/bereavement/be/death_occurred_in_be.yml
id: condition.be.bereavement.death_registration.death_occurred_in_be
schema_version: "0.1.0"
title: "Death occurred in Belgium"
description: >
  Evaluates whether the death occurred on Belgian territory.
condition_type: criterion
jurisdiction: BE
life_event: bereavement
domain: death_registration
expression_language: jsonlogic
expression:
  "==":
    - { "var": "death.place.country" }
    - "BE"
missing_fact_behavior: unknown
information_concept_refs:
  - intake_fact.global.bereavement.jurisdiction_of_death
source_assertion_refs:
  - assertion.belgium_gov.bereavement.death_declaration_required
record_valid_from: "2026-06-10"
authoring_status: draft
distribution_status: public_open
```

### Consequence

```yaml
# graph/consequences/bereavement/be/declare_death.yml
id: consequence.be.bereavement.death_registration.declare_death
schema_version: "0.1.0"
title: "Declare death to the civil registrar"
description: >
  When a death occurs in Belgium, it must be declared to the civil
  registrar of the municipality where the death took place.
consequence_type: obligation
jurisdiction: BE
life_event: bereavement
domain: death_registration
trigger:
  condition_refs:
    - condition.be.bereavement.death_registration.death_occurred_in_be
task_template_refs:
  - task_template.be.bereavement.death_registration.file_death_declaration
source_assertion_refs:
  - assertion.belgium_gov.bereavement.death_declaration_required
authoring_status: draft              # Start as draft
distribution_status: restricted_source  # Until assertions are approved
confidence: unassessed
record_valid_from: "2026-06-10"
```

### Task template

```yaml
# graph/task_templates/bereavement/be/file_death_declaration.yml
id: task_template.be.bereavement.death_registration.file_death_declaration
schema_version: "0.1.0"
title: "File death declaration at the municipality"
description: >
  Declare the death to the civil registrar of the municipality
  where the death occurred.
action_type: file_declaration
jurisdiction: BE
life_event: bereavement
domain: death_registration
authority_refs:
  - authority.be.etat_civil
deadline_refs: []
rendering:
  checklist_group: immediate_formalities
  urgency_score: 95
  dependency_rank: 1
  user_visible_caveat: null
authoring_status: draft
distribution_status: restricted_source
record_valid_from: "2026-06-10"
```

> **Publication gate:** Consequences and task templates should start as `distribution_status: restricted_source` and `authoring_status: draft`. They can only move to `public_open` + `approved` once their linked source assertions are `review_status: approved`.

---

## Step 9: Add a Scenario Test

```yaml
# tests/scenarios/be/core_bereavement.yml
id: scenario_test.be.core_bereavement
schema_version: "0.1.0"
title: "Belgium core — death occurred in Belgium"
scenario_type: single_jurisdiction
life_event: bereavement
countries: [BE]

facts:
  - fact_type: death.place.country
    value: BE

expected_consequence_statuses:
  consequence.be.bereavement.death_registration.declare_death: applies
```

---

## Step 10: Validate

Run the full CI pipeline locally:

```bash
pnpm validate              # Schema validation (all files)
pnpm lint-ids              # ID grammar checks
pnpm check-references      # All refs point to existing records
pnpm check-anchors         # Anchor text found in snapshots
pnpm check-publication-gate  # No unapproved assertions in public records
pnpm test-scenarios        # Scenario regression tests
pnpm test                  # Unit tests
pnpm typecheck             # TypeScript type checking
```

All must pass before opening a PR.

---

## Step 11: Open a PR

Push your branch and open a PR. The PR should:

- Target `main`
- Reference the jurisdiction being added
- Note the coverage stage being achieved
- Include the CI results

> **Extension regression rule:** CI verifies that adding BE does not change existing LU/DE/FR scenario outputs.

---

## Promoting to Published

Once assertions are reviewed and approved:

1. Set `review_status: approved` and `confidence: medium` (or `high`) on assertions
2. Set `authoring_status: approved` on graph records
3. Set `distribution_status: public_open` on consequences and task templates
4. Update `coverage/jurisdictions.yml` stage to `published`
5. The generator will now include these items in public checklist output

---

## ID Conventions Reference

| Record type | ID format |
|---|---|
| Source | `source.<origin>.<topic>` |
| Snapshot | `snapshot.<origin>.<topic>.<date>` |
| Assertion | `assertion.<origin>.<topic>.<claim_slug>` |
| Authority | `authority.<jurisdiction>.<slug>` |
| Condition | `condition.<jurisdiction>.<life_event>.<domain>.<slug>` |
| Consequence | `consequence.<jurisdiction>.<life_event>.<domain>.<slug>` |
| Task template | `task_template.<jurisdiction>.<life_event>.<domain>.<slug>` |
| Intake fact | `intake_fact.global.<life_event>.<slug>` |
| Scenario test | `scenario_test.<scope>.<slug>` |

All ID segments are lowercase with underscores. Jurisdiction fields use uppercase (`BE`), ID paths use lowercase (`be`).
