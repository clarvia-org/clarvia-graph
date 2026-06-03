# ID Migration Mapping — Foundation Alpha v0.1.0

This document records all ID changes made during the Foundation Alpha audit fix.
These IDs become permanent once published; this log ensures traceability.

## Intake Fact Types (PR #25)

| Old ID | New ID |
|--------|--------|
| `intake_fact.lu.bereavement.jurisdiction_of_death` | `intake_fact.global.bereavement.jurisdiction_of_death` |
| `intake_fact.lu.bereavement.date_of_death` | `intake_fact.global.bereavement.date_of_death` |
| `intake_fact.lu.bereavement.deceased_pension_jurisdiction` | `intake_fact.global.bereavement.deceased_pension_jurisdiction` |

### Condition Expression Paths

| Old JsonLogic var path | New JsonLogic var path |
|------------------------|-----------------------|
| `intake_fact.lu.bereavement.jurisdiction_of_death` | `death.place.country` |
| `intake_fact.lu.bereavement.deceased_pension_jurisdiction` | `deceased.pension.jurisdiction` |
| `intake_fact.lu.bereavement.date_of_death` | `death.date` |

## Source / Assertion / Snapshot IDs (PR #27)

| Old ID | New ID |
|--------|--------|
| `source.lu.guichet_bereavement` | `source.guichet_lu.bereavement` |
| `assertion.lu.guichet_bereavement.death_must_be_declared` | `assertion.guichet_lu.bereavement.death_must_be_declared` |
| `assertion.lu.guichet_bereavement.declaration_within_24h` | `assertion.guichet_lu.bereavement.declaration_within_24h` |
| `assertion.lu.guichet_bereavement.survivor_pension_available` | `assertion.guichet_lu.bereavement.survivor_pension_available` |
| *(none)* | `snapshot.guichet_lu.bereavement.2026_06_03` *(new)* |

## Checklist Output IDs (PR #26)

| Old format | New format |
|------------|-----------|
| `checklist.<random_hash>` | `checklist_run.<YYYYMMDD>.<scenario_hash>` |

The new checklist ID format is fully deterministic: same facts always produce the same ID.
