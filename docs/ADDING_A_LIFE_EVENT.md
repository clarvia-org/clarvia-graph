# Adding a Life Event

> Part of the [Clarvia Graph Foundation Specification](FOUNDATION.md).

This guide walks through adding a new life event to the Clarvia consequence graph. We use **marriage** as the running example, but the steps apply to any life event.

> **Extension principle (spec §21.1):** Life events extend vertically — a new life event creates its own namespace using the same infrastructure. Adding one must not change existing records, weaken publication gates, or break scenario tests for other life events.

---

## What a Life Event Is

A life event is a significant event in a person's life (bereavement, marriage, job loss, birth) that triggers legal, administrative, and financial consequences across one or more jurisdictions. Each life event has its own:

- **Intake fact types** — the questions we ask users
- **Conditions** — rules evaluated against user facts
- **Consequences** — obligations, rights, or steps triggered by conditions
- **Task templates** — actionable checklist items for users
- **Deadlines** — time-bound requirements
- **Scenario tests** — regression fixtures

These objects are **shared** across life events and reused:

- Sources, snapshots, assertions (a government page may cover multiple events)
- Authorities (the same registry office handles births, deaths, marriages)
- Evidence types and forms
- The condition engine, publication gate, export pipeline

---

## Minimum Viable Life Event

To generate a working checklist for a new life event, you need at minimum:

1. A `vocab/life_events.yml` entry
2. Domain entries in `vocab/domains.yml`
3. Checklist group entries in `vocab/checklist_groups.yml`
4. At least one intake fact type
5. At least one source → snapshot → approved assertion
6. At least one condition → consequence → task template chain
7. At least one scenario test

---

## Step 1: Register the Life Event

### vocab/life_events.yml

```yaml
- id: marriage
  label: Marriage
  label_fr: Mariage
  label_de: Heirat
```

### vocab/domains.yml

Add domains relevant to this life event:

```yaml
# Marriage domains
- id: civil_ceremony
  label: Civil ceremony
  label_fr: Cérémonie civile
  label_de: Standesamtliche Trauung
  life_events: [marriage]

- id: documents_and_certificates
  label: Documents and certificates
  label_fr: Documents et certificats
  label_de: Dokumente und Bescheinigungen
  life_events: [marriage]

- id: name_change
  label: Name change
  label_fr: Changement de nom
  label_de: Namensänderung
  life_events: [marriage]
```

### vocab/checklist_groups.yml

Add rendering groups for the new event's checklist UI:

```yaml
- id: pre_ceremony
  label: Before the ceremony
  label_fr: Avant la cérémonie
  label_de: Vor der Zeremonie
  sort_order: 1

- id: ceremony_and_registration
  label: Ceremony and registration
  label_fr: Cérémonie et enregistrement
  label_de: Zeremonie und Registrierung
  sort_order: 2

- id: post_ceremony
  label: After the ceremony
  label_fr: Nach der Zeremonie
  label_de: Nach der Zeremonie
  sort_order: 3
```

---

## Step 2: Create the Directory Structure

```
graph/
  conditions/marriage/lu/
  consequences/marriage/lu/
  task_templates/marriage/lu/
  deadlines/marriage/lu/
  intake_fact_types/marriage/
tests/
  scenarios/lu/
```

Note that these directories are **not** jurisdiction-scoped:
- `graph/authorities/<jurisdiction>/` — already exists, shared across life events
- `graph/evidence_types/<jurisdiction>/` — shared
- `graph/forms/<jurisdiction>/` — shared

---

## Step 3: Define Intake Fact Types

Intake facts are the questions asked to users. They are global (not jurisdiction-specific) and scoped by life event:

```yaml
# graph/intake_fact_types/marriage/ceremony_country.yml
id: intake_fact.global.marriage.ceremony_country
schema_version: "0.1.0"
path: marriage.ceremony.country
label: "Country where the marriage will take place"
description: "The jurisdiction where the civil ceremony will be held."
value_type: jurisdiction_code
allowed_values_ref: vocab/jurisdictions.yml
cardinality: one
required_for:
  - consequence.lu.marriage.civil_ceremony.book_ceremony
used_by_condition_refs:
  - condition.lu.marriage.civil_ceremony.ceremony_in_lu
```

```yaml
# graph/intake_fact_types/marriage/nationality_partner_a.yml
id: intake_fact.global.marriage.nationality_partner_a
schema_version: "0.1.0"
path: partner_a.nationality
label: "Nationality of partner A"
description: "ISO country code for the nationality of the first partner."
value_type: jurisdiction_code
allowed_values_ref: vocab/jurisdictions.yml
cardinality: one
required_for: []
used_by_condition_refs: []
```

> **Progressive intake pattern (spec §20.2):** Start with 5–6 essential questions, generate a first checklist, then ask follow-ups when they unlock additional items.

---

## Step 4: Register Sources and Capture

Follow the same source workflow as for jurisdictions:

1. Add the source to `sources/register.yml`
2. Capture with `pnpm capture <source_id>`
3. Extract assertions with `pnpm extract <snapshot_id>`

```yaml
# In sources/register.yml
- id: source.guichet_lu.marriage
  title: "Se marier au Luxembourg"
  title_en: "Getting married in Luxembourg"
  url: "https://guichet.public.lu/fr/citoyens/..."
  source_type: government_portal
  jurisdiction: LU
  publisher: "Guichet.lu (Luxembourg Government)"
  languages: [fr]
  domain: civil_ceremony
  life_event: marriage
  source_role: primary_guidance
  monitoring:
    active: false
  verified_at: null
```

---

## Step 5: Build the Graph Records

### Condition

```yaml
# graph/conditions/marriage/lu/ceremony_in_lu.yml
id: condition.lu.marriage.civil_ceremony.ceremony_in_lu
schema_version: "0.1.0"
title: "Marriage ceremony takes place in Luxembourg"
condition_type: criterion
jurisdiction: LU
life_event: marriage
domain: civil_ceremony
expression_language: jsonlogic
expression:
  "==":
    - { "var": "marriage.ceremony.country" }
    - "LU"
missing_fact_behavior: unknown
information_concept_refs:
  - intake_fact.global.marriage.ceremony_country
source_assertion_refs: []
record_valid_from: "2026-06-10"
authoring_status: draft
distribution_status: public_open
```

### Consequence

```yaml
# graph/consequences/marriage/lu/book_ceremony.yml
id: consequence.lu.marriage.civil_ceremony.book_ceremony
schema_version: "0.1.0"
title: "Book civil ceremony at the commune"
description: >
  Partners must book a civil ceremony at the commune where the
  marriage will take place, at least one month in advance.
consequence_type: administrative_step
jurisdiction: LU
life_event: marriage
domain: civil_ceremony
trigger:
  condition_refs:
    - condition.lu.marriage.civil_ceremony.ceremony_in_lu
task_template_refs:
  - task_template.lu.marriage.civil_ceremony.book_commune
source_assertion_refs: []
authoring_status: draft
distribution_status: restricted_source
confidence: unassessed
record_valid_from: "2026-06-10"
```

### Task template

```yaml
# graph/task_templates/marriage/lu/book_commune.yml
id: task_template.lu.marriage.civil_ceremony.book_commune
schema_version: "0.1.0"
title: "Book civil ceremony at the commune"
description: >
  Contact the commune where the marriage will take place to reserve
  a date for the civil ceremony.
action_type: book_appointment
jurisdiction: LU
life_event: marriage
domain: civil_ceremony
authority_refs:
  - authority.lu.bureau_etat_civil
deadline_refs: []
rendering:
  checklist_group: pre_ceremony
  urgency_score: 80
  dependency_rank: 1
  user_visible_caveat: null
authoring_status: draft
distribution_status: restricted_source
record_valid_from: "2026-06-10"
```

---

## Step 6: Add a Scenario Test

```yaml
# tests/scenarios/lu/core_marriage.yml
id: scenario_test.lu.core_marriage
schema_version: "0.1.0"
title: "Luxembourg core — marriage ceremony in Luxembourg"
scenario_type: single_jurisdiction
life_event: marriage
countries: [LU]

facts:
  - fact_type: marriage.ceremony.country
    value: LU

expected_consequence_statuses:
  consequence.lu.marriage.civil_ceremony.book_ceremony: applies
```

---

## Step 7: Validate and Open a PR

```bash
pnpm validate
pnpm lint-ids
pnpm check-references
pnpm check-anchors
pnpm check-publication-gate
pnpm test-scenarios
pnpm test
pnpm typecheck
```

> **Life event isolation rule:** CI verifies that marriage records cannot affect bereavement exports. Each life event is filtered by `life_event` field during generation.

---

## Key Differences from Adding a Jurisdiction

| Aspect | New jurisdiction | New life event |
|---|---|---|
| Vocab changes | `jurisdictions.yml` | `life_events.yml` + `domains.yml` + `checklist_groups.yml` |
| New directories | Under existing life event dirs | New dirs under `conditions/`, `consequences/`, `task_templates/`, `intake_fact_types/` |
| Authorities | New per-jurisdiction | Reuses existing (same office handles multiple events) |
| Intake facts | Reuses existing (e.g. `death.place.country`) | New fact types (e.g. `marriage.ceremony.country`) |
| Generator | Filters by jurisdiction in conditions | Filters by `life_event` field |
| Scenario tests | New per-jurisdiction dir | New tests under existing jurisdiction dirs |
