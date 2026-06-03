# Migration Mapping: workflow-data → clarvia-graph

This document maps the old `clarvia-org/workflow-data` schema to the new
`clarvia-org/clarvia-graph` Foundation Alpha schema. It serves as a reference
for migrating existing records and for onboarding new contributors.

> [!NOTE]
> The old format used colon-delimited IDs (e.g. `source:lu:guichet:death-life-event`).
> The new format uses dot-delimited IDs with stricter grammar (e.g. `source.lu.guichet_bereavement`).

## Object Type Mapping

| Old type | New type(s) | Notes |
|----------|-------------|-------|
| `Source` | `source` + `source_assertion` batch | Sources are now split: the source record describes the URL/publisher, assertion batches hold extracted claims |
| `Institution` | `authority` | Renamed to be jurisdiction-neutral. `institution_ids` → `authority_refs` |
| `Task` | `consequence` + `task_template` | Split: consequence = "why", task_template = "what to do" |
| `Deadline` | `deadline` | Similar but uses ISO 8601 duration (e.g. `PT24H`) instead of `{value, unit}` |
| `Condition` | `condition` | Now uses JsonLogic expressions instead of `{field, operator, value}` |
| `DocumentRequirement` | `evidence_type` | Renamed. Broader: includes non-document evidence |
| `Workflow` | *(removed)* | Replaced by the consequence graph itself — routing is implicit via conditions |
| `Scenario` | `scenario_test` | Now includes expected outputs for regression testing |
| *(new)* | `source_snapshot` | Captures a point-in-time copy of a source page |
| *(new)* | `intake_fact_type` | Typed facts collected from users for routing |
| *(new)* | `composition_rule` | Cross-border composition logic |
| *(new)* | `dedupe_rule` | Deduplication rules for similar tasks |
| *(new)* | `form` | Official forms referenced by task templates |

## ID Grammar Mapping

| Old format | New format |
|-----------|-----------|
| `source:lu:guichet:death-life-event` | `source.lu.guichet_bereavement` |
| `institution:lu:bureau-etat-civil` | `authority.lu.bureau_etat_civil` |
| `institution:lu:guichet` | *(not migrated — Guichet is a portal, not an authority)* |
| `task:lu:death-declaration` | `consequence.lu.bereavement.death_registration.declare_death` + `task_template.lu.bereavement.death_registration.file_death_declaration` |
| `deadline:lu:death-declaration` | `deadline.lu.bereavement.death_registration.declaration_deadline` |
| `condition:death-in-jurisdiction` | `condition.lu.bereavement.death_registration.death_occurred_in_lu` |
| `document:lu:death-certificate` | `evidence_type.lu.death_certificate` |
| `workflow:lu:luxembourg-alpha` | *(not migrated — replaced by consequence graph)* |

## Field Mapping Examples

### Source → source + source_assertion

**Old (`workflow-data`):**
```yaml
id: source:lu:guichet:death-life-event
object_type: Source
title: "Dealing with the death of a loved one"
source_type: government_portal
url: "https://guichet.public.lu/..."
jurisdiction:
  country: LU
verification_status: source-checked
provenance:
  created_at: "2026-05-14"
  created_by: "clarvia-maintainers"
```

**New (`clarvia-graph`):**
```yaml
# sources/lu/guichet_bereavement.yml
id: source.lu.guichet_bereavement
schema_version: "0.1.0"
title: "Dealing with the death of a loved one"
source_type: government_portal
url: "https://guichet.public.lu/..."
jurisdiction: LU                           # flat string, not object
authoring_status: draft                    # replaces verification_status
distribution_status: public_open
record_valid_from: "2026-06-03"            # temporal validity
```

### Institution → authority

**Old:**
```yaml
id: institution:lu:bureau-etat-civil
object_type: Institution
name: "Bureau de l'état civil"
function: "Registers civil status events..."
official_site: "https://..."
```

**New:**
```yaml
id: authority.lu.bureau_etat_civil
schema_version: "0.1.0"
name: "Bureau de l'état civil"
name_en: "Civil Registry Office"
description: "..."
jurisdiction: LU
function: "Civil status registration..."
authoring_status: draft
distribution_status: public_open
record_valid_from: "2026-06-03"
```

### Task → consequence + task_template

**Old (single object):**
```yaml
id: task:lu:death-declaration
object_type: Task
title: "Declare the death"
phase: registration
target_institution_ids:
  - institution:lu:guichet
deadline_ids:
  - deadline:lu:death-declaration
condition_ids:
  - condition:death-in-jurisdiction
```

**New (two objects):**
```yaml
# graph/consequences/bereavement/lu/declare_death.yml
id: consequence.lu.bereavement.death_registration.declare_death
consequence_type: obligation
trigger:
  condition_refs:
    - condition.lu.bereavement.death_registration.death_occurred_in_lu
task_template_refs:
  - task_template.lu.bereavement.death_registration.file_death_declaration

# graph/task_templates/bereavement/lu/file_death_declaration.yml
id: task_template.lu.bereavement.death_registration.file_death_declaration
action_type: file_declaration
authority_refs:
  - authority.lu.bureau_etat_civil
deadline_refs:
  - deadline.lu.bereavement.death_registration.declaration_deadline
rendering:
  checklist_group: immediate_formalities
  urgency_score: 95
```

### Deadline

**Old:**
```yaml
duration:
  value: 24
  unit: hours
trigger: date_of_death
```

**New:**
```yaml
calculation:
  kind: relative
  duration: "PT24H"                        # ISO 8601
  starts_from_fact: intake_fact.lu.bereavement.date_of_death
  calendar: civil
  if_weekend_or_holiday: unknown
```

## Status Mapping

| Old `verification_status` | New `authoring_status` | New `distribution_status` |
|---------------------------|----------------------|--------------------------|
| `discovered` | `draft` | `internal` |
| `structured-from-source` | `draft` | `public_open` |
| `source-checked` | `draft` | `public_open` |
| `expert-reviewed` | `reviewed` | `public_open` |
| `published` | `approved` | `public_open` |
| `stale-review` | `needs_review` | `quarantined` |
| `superseded` | `superseded` | `withdrawn` |

## What's Not Migrated

- **Workflows** — Replaced by the consequence graph's condition→consequence→task chain
- **Guichet as institution** — It's a portal, not an authority. Sources reference it as publisher
- **Scenarios** — Will be re-authored as `scenario_test` records with expected outputs
- **Review events** — Replaced by provenance blocks and `review_status` on assertions
