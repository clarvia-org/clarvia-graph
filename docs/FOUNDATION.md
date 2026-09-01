# Clarvia Foundation Specification v0.1

**Status:** Locked for v0.1 schema and implementation
**Last updated:** 2026-06-01
**Scope:** Bereavement workflows, Luxembourg proof dataset, and minimal cross-border fixtures for France/Germany/EU concepts where needed to test jurisdiction composition
**Consolidates:** D1 (Data Architecture) + D2 (Standards) + D3 (Editorial & Governance) + D4 (Technical Implementation) + D5 (Product Architecture) + D6 (Extensibility & Future-proofing)

---

## 1. Design Philosophy

### 1.1 Core principles

1. **Normalize for authors and reviewers. Denormalize for users and API consumers.** Canonical data lives as small, reviewable records in Git. Generated checklists inline everything for the consumer.

2. **Clarvia-native authoring, standards-compatible export.** The internal model is optimized for editorial workflow and checklist generation. CPSV-AP, CCCEV, ELI, and PROV-O compatibility is achieved through export pipelines, not by making every EU abstraction a first-class authoring object.

3. **Source-backed.** No checklist item exists without a source assertion. No source assertion exists without a captured snapshot or official URL.

4. **Three-valued logic.** Conditions evaluate to `true`, `false`, or `unknown`. Unknown is never collapsed to false.

5. **Open-core.** The public baseline is genuinely valuable — reviewed, approved, source-backed records. The proprietary layer adds monitoring, freshness SLAs, hosted API, and operational guarantees.

6. **Public-source-first.** No dependency on government registries, identity systems, OOTS, or privileged APIs in the MVP.

### 1.2 Two-layer architecture

```
┌─────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER (open, fundable)              │
│                                                     │
│  Consequence graph: source-backed, standards-ready  │
│  consequence → task_template → checklist_item       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  APPLICATION LAYER (mission, free)                  │
│                                                     │
│  Consumer checklist: "My parent died — what now?"   │
│  Intake facts → resolution → rendered checklist     │
└─────────────────────────────────────────────────────┘
```

### 1.3 Three-layer object model

```
consequence    = what may be legally or administratively triggered
task_template  = what a human may need to do
checklist_item = generated instance of a task for a specific scenario
```

Consequences are authored. Task templates are authored. Checklist items are generated.

---

## 2. Canonical Object Types

14 canonical authoring objects, organized by function.

### Source provenance chain

```
source → source_snapshot → source_assertion
```

### Graph objects

```
authority, form, evidence_type, deadline, condition
```

### Consequence and action layer

```
consequence → task_template
```

### Routing and composition

```
intake_fact_type, composition_rule, dedupe_rule
```

### Testing

```
scenario_test
```

---

## 3. Object Specifications

### 3.1 source

**Purpose:** An official page, document, law, or form that Clarvia monitors and extracts claims from.

**ID grammar:** `source.<origin>.<slug>`

**Fields:**

```yaml
id: source.guichet_lu.death_declaration
schema_version: 0.1.0
title: "Décès - Guichet.lu"
title_en: "Death - Guichet.lu"
description: "Official Luxembourg government portal page covering death declaration procedures."
source_type: government_portal
  # Allowed: statute, regulation, consolidated_legislation, court_decision,
  #          government_portal, official_guidance, official_form, faq, other
url: "https://guichet.public.lu/..."
jurisdiction: LU
jurisdiction_uri: "http://publications.europa.eu/resource/authority/country/LUX"
languages: [fr, de, en]
publisher: "Service information et presse du gouvernement"

# ELI / legal identifier block (for legal sources only)
legal_identifier:
  scheme: url_only
    # Allowed: ELI, CELEX, national_law_id, url_only, unknown
  eli_uri: null
  eli_work_uri: null
  eli_expression_uri: null
  celex: null
  local_id: null
  type_document: null
  type_document_uri: null
  date_document: null
  first_date_entry_in_force: null
  date_no_longer_in_force: null
  version_date: null
  language: null

# Status
authoring_status: approved
distribution_status: public_open

# Temporal
record_valid_from: 2026-05-31
record_valid_to: null
```

**References:** Referenced by `source_snapshot.source_id`, `source_assertion.source_id`

---

### 3.2 source_snapshot

**Purpose:** Clarvia's captured copy of a source at a specific point in time. Separates the official thing from what Clarvia captured.

**ID grammar:** `snapshot.<origin>.<source_slug>.<date_stamp>`

**Fields:**

```yaml
id: snapshot.guichet_lu.death_declaration.2026_05_31
schema_version: 0.1.0
source_id: source.guichet_lu.death_declaration
captured_at: 2026-05-31T10:24:00Z
capture_method: http_get
  # Allowed: http_get, browser_render, manual_download, api_call, other
http_status: 200
content_type: text/html
content_hash: "sha256:abc123..."
archive_uri: "snapshots/html/lu/guichet/death_declaration/2026-05-31.html"
source_last_modified_at: null

# Capture agent (who/what performed the capture)
captured_by: software.scraper.v0.1

# Status
authoring_status: approved
distribution_status: public_open
```

`captured_at` and `capture_method` are top-level authoritative fields. `captured_by` identifies the agent. There is no nested `capture` block — all capture metadata lives at the top level to avoid dual sources of truth.

**References:** Referenced by `source_assertion.source_snapshot_id`

---

### 3.3 source_assertion

**Purpose:** A specific claim extracted from a source snapshot. The atomic unit of provenance — every checklist item traces back to one or more assertions.

**ID grammar:** `assertion.<origin>.<source_slug>.<claim_slug>`

**Authoring pattern:** Authored in per-source batch files, not one file per assertion.

**File location:** `sources/assertions/<jurisdiction>/<origin>/<source_slug>.yml`

**Batch file structure:**

```yaml
source_id: source.guichet_lu.death_declaration
source_snapshot_id: snapshot.guichet_lu.death_declaration.2026_05_31

assertions:
  - id: assertion.guichet_lu.death_declaration.deadline_24h
    schema_version: 0.1.0
    claim_type: deadline
      # Controlled vocabulary: deadline, authority, document_required,
      #   document_optional, form, eligibility_condition, exception,
      #   fee, channel, filing_location, legal_scope, warning, practical_step
    claim_text: "Death declaration must be made within 24 hours."
    description: "The official guidance states a 24-hour deadline for death declaration."
    claim_scope:
      jurisdiction: LU
      life_event: bereavement
      domain: death_registration
    anchor:
      selector_type: text_quote
      text_quote: "within 24 hours"
    extracted_value:
      deadline:
        kind: relative
        duration: P1D
        starts_from: death.datetime
    source_tier: official_guidance
      # Hierarchy: statute > regulation > consolidated_legislation >
      #   official_guidance > official_form > faq > inferred
    legal_basis_refs: []

    # Temporal
    legal_effective_from: 2024-09-26
    legal_effective_to: null
    record_valid_from: 2026-05-31
    record_valid_to: null

    # Review
    review_status: approved
    confidence: high

    # Provenance
    provenance:
      extraction_method: ai_assisted
        # Allowed: manual, ai_assisted, automated
      extracted_by: software.extractor.v0.1
      extracted_at: 2026-05-31T10:30:00Z
      reviewed_by: reviewer.lu.001
      reviewed_at: 2026-05-31T11:00:00Z
      derived_from_snapshot_ref: snapshot.guichet_lu.death_declaration.2026_05_31

  - id: assertion.guichet_lu.death_declaration.authority_commune
    # ... next assertion in same batch
```

#### 3.3.1 legal_basis_refs structure

`legal_basis_refs` may be used on `source_assertion`, `condition`, `deadline`, `consequence`, and `task_template`. It points to exact legislative or official-source provisions that support the record or claim. It is optional on all objects.

```yaml
legal_basis_refs:
  - source_id: source.eur_lex.eli_reg_650_2012
    source_snapshot_id: snapshot.eur_lex.eli_reg_650_2012.2026_05_31
    eli_uri: "http://data.europa.eu/eli/reg/2012/650/oj"
    provision_ref:
      article: "21"
      paragraph: "1"
      point: null
    fragment_uri: "http://data.europa.eu/eli/reg/2012/650/oj/art_21"
    quote_anchor:
      selector_type: text_quote
      text_quote: "the law of the State in which the deceased had his habitual residence"
```

**Publication gate:** No assertion can be used in a public checklist unless:
- effective `source_id` present (at assertion level or inherited from assertion batch)
- effective `source_snapshot_id` present (at assertion level or inherited from assertion batch)
- `anchor` present
- `review_status: approved`
- `claim_type` is a controlled value
- `confidence` is not null

---

### 3.4 authority

**Purpose:** A government body or institution.

**ID grammar:** `authority.<jurisdiction>.<slug>` (reusable — not life-event-scoped)

```yaml
id: authority.lu.commune_civil_registrar
schema_version: 0.1.0
name: "Bureau de l'état civil"
name_en: "Civil registrar's office"
name_de: "Standesamt"
description: "Civil registration office of the commune where the event occurred."
jurisdiction: LU
jurisdiction_uri: "http://publications.europa.eu/resource/authority/country/LUX"
function: civil_registration
official_site: "https://guichet.public.lu/..."
contact_channels: []
languages: [fr, de]

# Status
authoring_status: approved
distribution_status: public_open
record_valid_from: 2026-05-31
record_valid_to: null
```

---

### 3.5 form

**Purpose:** An official form.

**ID grammar:** `form.<jurisdiction>.<authority_or_portal>.<slug>` (reusable)

```yaml
id: form.de.drv.survivor_pension_application
schema_version: 0.1.0
title: "Antrag auf Hinterbliebenenrente"
title_en: "Survivor pension application"
description: "Official DRV application form for widow's/widower's pension."
jurisdiction: DE
jurisdiction_uri: "http://publications.europa.eu/resource/authority/country/DEU"
authority_refs:
  - authority.de.deutsche_rentenversicherung
url: "https://www.deutsche-rentenversicherung.de/..."
languages: [de]
form_role: blank_template
  # Allowed: blank_template, online_application, completed_submission_evidence

authoring_status: approved
distribution_status: public_open
record_valid_from: 2026-05-31
record_valid_to: null
```

---

### 3.6 evidence_type

**Purpose:** A document type that may be required as evidence.

**ID grammar:** `evidence_type.<jurisdiction_or_global>.<slug>` (reusable)

```yaml
id: evidence_type.global.death_certificate
schema_version: 0.1.0
canonical_name: "Death certificate"
synonyms:
  - "acte de décès"
  - "Sterbeurkunde"
description: "Official document certifying the death of a person."
jurisdiction: global
broader: null
jurisdictional_variants:
  - evidence_type.fr.acte_de_deces
  - evidence_type.de.sterbeurkunde
  - evidence_type.lu.acte_de_deces

authoring_status: approved
distribution_status: public_open
record_valid_from: 2026-05-31
record_valid_to: null
```

---

### 3.7 deadline

**Purpose:** A time-bound requirement.

**ID grammar:** `deadline.<jurisdiction>.<life_event>.<domain>.<slug>` (life-event-scoped)

```yaml
id: deadline.lu.bereavement.death_registration.declare_death_24h
schema_version: 0.1.0
title: "Declare death within 24 hours"
description: "A death occurring in Luxembourg must be declared to the civil registrar within 24 hours."
deadline_type: filing_deadline
  # Allowed: filing_deadline, appeal_deadline, payment_deadline,
  #          validity_period, processing_time
jurisdiction: LU
life_event: bereavement
domain: death_registration

calculation:
  kind: relative
  duration: P1D
  starts_from_fact: death.datetime
  calendar: civil
  if_weekend_or_holiday: unknown

exceptions: []
source_assertion_refs:
  - assertion.guichet_lu.death_declaration.deadline_24h
legal_basis_refs: []

legal_effective_from: 2024-09-26
legal_effective_to: null
record_valid_from: 2026-05-31
record_valid_to: null
authoring_status: approved
distribution_status: public_open
```

---

### 3.8 condition

**Purpose:** A structured boolean expression used for routing consequences. Evaluates to `true`, `false`, or `unknown`.

**ID grammar:** `condition.<jurisdiction>.<life_event>.<domain>.<slug>` (life-event-scoped)

```yaml
id: condition.lu.bereavement.death_registration.death_place_is_lu
schema_version: 0.1.0
title: "Death occurred in Luxembourg"
description: "Applies when the country where the death occurred is Luxembourg."
condition_type: criterion
  # Allowed: criterion, constraint, eligibility, exclusion
jurisdiction: LU
life_event: bereavement
domain: death_registration

information_concept_refs:
  - intake_fact.global.bereavement.death.place_country

expression_language: jsonlogic
expression:
  "==":
    - var: death.place.country
    - LU
missing_fact_behavior: unknown
  # What to return when a required fact is missing. Always: unknown.

source_assertion_refs:
  - assertion.guichet_lu.death_declaration.scope_lu
legal_basis_refs: []

record_valid_from: 2026-05-31
record_valid_to: null
authoring_status: approved
distribution_status: public_open
```

---

### 3.9 consequence

**Purpose:** A legal, administrative, financial, or practical effect that may be triggered by a life event. The core unit of the consequence graph.

**ID grammar:** `consequence.<jurisdiction>.<life_event>.<domain>.<slug>` (life-event-scoped)

```yaml
id: consequence.lu.bereavement.death_registration.declare_death
schema_version: 0.1.0
title: "Declare the death to the local civil registrar"
description: "A death occurring in Luxembourg may need to be declared to the civil registrar of the commune where it occurred."
consequence_type: administrative_step
  # Allowed: administrative_step, right_or_benefit, obligation,
  #          routing_decision, escalation
jurisdiction: LU
jurisdiction_uri: "http://publications.europa.eu/resource/authority/country/LUX"
life_event: bereavement
domain: death_registration

# Trigger — what conditions activate this consequence
trigger:
  condition_refs:
    - condition.lu.bereavement.death_registration.death_place_is_lu

# Tasks — what human actions this consequence generates
task_template_refs:
  - task_template.lu.bereavement.death_registration.file_declaration

# Provenance
source_assertion_refs:
  - assertion.guichet_lu.death_declaration.deadline_24h
legal_basis_refs: []

# Standards export hints
standards_export:
  cccev_requirement:
    enabled: true
    requirement_type: administrative_obligation
  cpsv_public_service:
    enabled: true

# Status
authoring_status: approved
distribution_status: public_open
monitoring_status: unmonitored
confidence: high

# Temporal
legal_effective_from: 2024-01-01
legal_effective_to: null
record_valid_from: 2026-05-31
record_valid_to: null

# Provenance
provenance:
  derived_from_snapshot_ref: snapshot.guichet_lu.death_declaration.2026_05_31
  extraction_method: ai_assisted
  extracted_by: software.extractor.v0.1
  extracted_at: 2026-05-31T10:30:00Z
  reviewed_by: reviewer.lu.001
  reviewed_at: 2026-05-31T11:00:00Z
```

---

### 3.10 task_template

**Purpose:** A reusable authored human-action template linked from one or more consequences and instantiated as checklist items for a scenario.

**ID grammar:** `task_template.<jurisdiction>.<life_event>.<domain>.<slug>` (life-event-scoped)

```yaml
id: task_template.de.bereavement.survivor_pension.submit_application
schema_version: 0.1.0
title: "Apply for the German survivor pension"
description: "Submit a formal application for widow's/widower's pension to the Deutsche Rentenversicherung."
action_type: submit_application
  # Controlled vocabulary: submit_application, obtain_document, notify_authority,
  #   gather_information, contact_professional, file_declaration, verify_eligibility
jurisdiction: DE
jurisdiction_uri: "http://publications.europa.eu/resource/authority/country/DEU"
life_event: bereavement
domain: survivor_pension

# Task target — defines what this task acts on (used by dedupe key resolution)
target:
  object_type: survivor_pension_application
  object_ref: form.de.drv.survivor_pension_application
  subject_role: survivor
  primary_authority_ref: authority.de.deutsche_rentenversicherung

# What's needed
authority_refs:
  - authority.de.deutsche_rentenversicherung
form_refs:
  - form.de.drv.survivor_pension_application
deadline_refs: []

# Evidence requirements with AND/OR semantics
evidence_requirements:
  satisfy_if: any_set_satisfied
  sets:
    - id: evidence_set.de.bereavement.survivor_pension.standard_spouse
      operator: all
      evidence_type_refs:
        - evidence_type.global.death_certificate
        - evidence_type.global.marriage_certificate

# Provenance
source_assertion_refs:
  - assertion.drv.survivor_pension.application_required
legal_basis_refs: []

# Rendering
rendering:
  checklist_group: money_and_benefits
    # Allowed: immediate_formalities, money_and_benefits, estate_and_inheritance,
    #          employment_and_tax, cross_border_issues, uncertain_needs_confirmation,
    #          professional_review_recommended
  urgency_score: 70
  dependency_rank: null
  user_visible_caveat: null

# Deduplication
dedupe:
  default_strategy: do_not_merge_across_jurisdictions
  dedupe_key_template: "{action_type}.{target.object_type}.{jurisdiction}.{target.primary_authority_ref}"

# Status
authoring_status: approved
distribution_status: public_open
record_valid_from: 2026-05-31
record_valid_to: null
```

---

### 3.11 dedupe_rule

**Purpose:** Explicit, reviewable deduplication logic for merging similar tasks across consequences.

**ID grammar:** `dedupe_rule.<jurisdiction_or_global>.<life_event>.<domain>.<slug>` (life-event-scoped)

```yaml
id: dedupe_rule.global.bereavement.documents.obtain_death_certificate_copies
schema_version: 0.1.0
rule_type: dedupe
applies_to_action_type: obtain_document
applies_to_object_type: evidence_type.global.death_certificate
strategy: merge
dedupe_key_template: "{action_type}.{object_type}.{subject}"
merge:
  output_title: "Get certified copies of the death certificate"
  combine:
    - source_assertion_refs
    - satisfied_consequence_refs
    - needed_for
    - jurisdiction_contexts
  preserve:
    - document_variant_notes
    - translation_or_apostille_notes
human_review_required: true
```

**Dedup output preserves reasons:**

```yaml
# Generated merged checklist item
title: "Get certified copies of the death certificate"
needed_for:
  - Luxembourg death registration follow-up
  - German survivor pension application
  - French succession handling
satisfied_consequence_refs:
  - consequence.lu.bereavement.death_registration.declare_death
  - consequence.de.bereavement.survivor_pension.possible_widow_widower_pension
  - consequence.fr.bereavement.succession.french_assets
```

---

### 3.12 composition_rule

**Purpose:** Cross-border composition logic. Determines how consequences from different jurisdictions compose for a scenario.

**ID grammar:** `composition_rule.<jurisdiction_or_xborder>.<life_event>.<domain>.<slug>` (life-event-scoped)

```yaml
id: composition_rule.xborder.bereavement.succession.asset_situs_adds_local_steps
schema_version: 0.1.0
rule_type: additive
  # Allowed: additive, gateway, dedupe, override, conflict, dependency, escalation
description: "When assets exist in a country other than the deceased's habitual residence, add that country's asset/succession steps."
when:
  all:
    - estate.asset_location.country exists
    - estate.asset_location.country != deceased.habitual_residence.country
then:
  add_jurisdiction_scope:
    - estate.asset_location.country
  add_domain:
    - estate_assets
    - inheritance_tax
human_review_required: true
```

**Composition rule types:**

| Type | Description | Example |
|---|---|---|
| additive | Adds consequences/tasks from another jurisdiction | French real estate adds French notary/succession steps |
| gateway | Determines which jurisdiction's rules route the next layer | EU succession connector points to habitual residence |
| dedupe | Combines similar checklist tasks | Multiple records require obtaining a death certificate |
| override | One rule suppresses or modifies another | A local exception blocks a benefit |
| conflict | Unresolved tension between sources or jurisdictions | Guidance suggests one route, statute suggests another |
| dependency | One task must be completed before another | Obtain death certificate before filing pension |
| escalation | Human professional review recommended | Choice of law, forced heirship, dispute |

---

### 3.13 intake_fact_type

**Purpose:** A typed fact collected from the user for routing consequences.

**ID grammar:** `intake_fact.global.<life_event>.<path_slug>` (typically global)

```yaml
id: intake_fact.global.bereavement.death.place_country
schema_version: 0.1.0
path: death.place.country
label: "Country where the death occurred"
description: "The country in which the death physically occurred. Determines immediate registration and funeral procedures."
value_type: jurisdiction_code
allowed_values_ref: controlled_vocab.jurisdictions
cardinality: one
required_for:
  - death_registration_routing
  - funeral_routing
used_by_condition_refs:
  - condition.lu.bereavement.death_registration.death_place_is_lu
```

**Minimum routing facts for bereavement MVP:**

```yaml
- death.date
- death.place.country
- deceased.habitual_residence.country
- deceased.nationality.country
- deceased.work_history.country
- deceased.last_social_security_affiliation.country
- survivor.residence.country
- relationship.to_deceased
- marriage_or_partnership.status
- children_or_dependants.exists
- estate.asset_location.country
- estate.real_estate.exists
- will.exists
- choice_of_law.exists
- death_abroad.relative_to_survivor_residence
```

---

### 3.14 scenario_test

**Purpose:** An authored test fixture combining scenario input facts with expected outputs for regression testing.

Note: `scenario` (runtime input facts) and `scenario_test` (regression fixture with expected outputs) are distinct concepts. For v0.1, a single `scenario_test.schema.json` covers both by including scenario facts plus expected outputs.

**ID grammar:** `scenario_test.<scope>.<slug>`

```yaml
id: scenario_test.xborder.lu_resident_de_worker_fr_assets
schema_version: 0.1.0
title: "Luxembourg resident, German pension, French assets — spouse dies"
scenario_type: cross_border
life_event: bereavement
countries: [LU, DE, FR]

facts:
  - fact_type: death.date
    value: "2026-05-20"
    confidence: user_asserted
  - fact_type: death.place.country
    value: LU
    confidence: user_asserted
  - fact_type: deceased.habitual_residence.country
    value: LU
    confidence: user_asserted
  - fact_type: deceased.work_history.country
    value: DE
    confidence: user_asserted
  - fact_type: estate.asset_location.country
    value: FR
    confidence: user_asserted
  - fact_type: relationship.to_deceased
    value: surviving_spouse
    confidence: user_asserted

expected_jurisdiction_roles:
  death_place: [LU]
  deceased_habitual_residence: [LU]
  work_or_insurance_state: [DE]
  asset_situs: [FR]

expected_consequence_statuses:
  consequence.lu.bereavement.death_registration.declare_death: applies
  consequence.de.bereavement.survivor_pension.possible_widow_widower_pension: applies
  consequence.fr.bereavement.succession.french_assets: applies

expected_checklist_groups:
  immediate_formalities: [">= 2 items"]
  money_and_benefits: [">= 1 items"]
  estate_and_inheritance: [">= 1 items"]
```

---

## 4. ID Conventions

### 4.1 Two grammars

**Life-event-scoped** (meaning depends on a life event):

```
<object_type>.<jurisdiction>.<life_event>.<domain>.<slug>
```

Used by: `consequence`, `task_template`, `condition`, `deadline`, `composition_rule`, `dedupe_rule`

**Reusable** (usable across life events):

```
authority.<jurisdiction>.<slug>
evidence_type.<jurisdiction_or_global>.<slug>
form.<jurisdiction>.<authority_or_portal>.<slug>
source.<origin>.<slug>
assertion.<origin>.<source_slug>.<claim_slug>
snapshot.<origin>.<source_slug>.<date_stamp>
```

Used by: `authority`, `evidence_type`, `form`, `source`, `source_assertion`, `source_snapshot`

**Generated:**

```
checklist_run.<timestamp>.<scenario_hash>
checklist_item.<scenario_hash>.<task_or_group_hash>
resolved_consequence.<scenario_hash>.<consequence_hash>
```

### 4.2 ID rules

1. IDs are permanent.
2. Do not include dates or version numbers in conceptual record IDs. **Exception:** `source_snapshot` and generated runtime IDs (checklist_run, etc.) may include dates/timestamps because they identify time-specific captures or generation runs, not conceptual records.
3. Do not rename IDs casually.
4. Deprecate instead of deleting. Use `replaces`, `replaced_by`, and `same_as` when necessary.
5. Human-readable slugs are allowed. Semantic stability matters more than perfect naming.
6. Target max length: 80 characters. Hard max: 120 characters.

### 4.3 Folder paths carry context

```
graph/consequences/bereavement/lu/death_registration/declare_death.yml
→ id: consequence.lu.bereavement.death_registration.declare_death

graph/authorities/lu/commune_civil_registrar.yml
→ id: authority.lu.commune_civil_registrar
```

### 4.4 Jurisdiction codes

**Casing convention:**
- **ID path segments** use lowercase namespace codes: `lu`, `de`, `fr`, `eu`, `xborder`, `global`
- **Record field values** use uppercase ISO 3166-1 codes where applicable: `LU`, `DE`, `FR`, `EU`
- **Special non-country scopes** use uppercase pseudo-codes in field values: `XBORDER`, `GLOBAL`

```yaml
# ID namespace → field value
eu → EU:     European Union layer
lu → LU:     Luxembourg
de → DE:     Germany
fr → FR:     France
be → BE:     Belgium
xborder → XBORDER:  cross-border composition logic
global → GLOBAL:    jurisdiction-neutral reusable concept
```

### 4.5 Life event codes (MVP)

```yaml
bereavement  # Only this for MVP
```

### 4.6 Domain codes

```yaml
death_registration
funeral
survivor_pension
succession
inheritance_tax
estate_assets
employment
health_insurance
social_security
documents
cross_border_succession
cross_border_social_security
```

---

## 5. Temporal Model

### 5.1 Four distinct date concepts

| Concept | Field | Meaning |
|---|---|---|
| **Legal effective date** | `legal_effective_from/to` | For which event dates does this rule apply? |
| **Record validity** | `record_valid_from/to` | When was this record version current in the graph? |
| **Source capture date** | `captured_at` on snapshot | When did Clarvia capture the source? |
| **Event date** | `event_date` on generated checklist | When did the life event occur? |

### 5.2 Query rule

Checklist generation asks:

> Which graph records were current as of `as_of_date`, and legally applicable to `event_date`?

```
record_valid_from <= as_of_date
AND (record_valid_to IS NULL OR record_valid_to > as_of_date)
AND legal_effective_from <= event_date
AND (legal_effective_to IS NULL OR legal_effective_to > event_date)
```

### 5.3 Transition periods

```yaml
applicability:
  event_date:
    gte: 2025-01-01
    lt: 2027-01-01
  transition_note: "Applies only to deaths occurring during the transition period."
```

### 5.4 Staleness and freshness

Every monitored record exposes:

```yaml
freshness:
  last_checked_at: 2026-05-31
  next_review_due: 2026-06-30
  monitoring_status: monitored
  stale_after_days: 90
```

Freshness display states: `fresh` (derived — no canonical vocab entry), `review_due`, `source_changed`, `stale`, `quarantined`. `fresh` is computed at display time when `monitoring_status: monitored` and no review is overdue.

### 5.5 Versioning on records

```yaml
schema_version: 0.1.0
record_version: 4
content_hash: "sha256:..."
```

**Rule:** Never overwrite history. Add a new version and close the old one.

---

## 6. Intake & Routing

### 6.1 Scenario as typed facts

A scenario is a collection of typed facts about a life event:

```yaml
id: scenario.example.lu_resident_de_worker
life_event: bereavement
event_date: 2026-05-20
as_of_date: 2026-05-31

facts:
  - fact_type: death.place.country
    subject: person.deceased
    value: LU
    confidence: user_asserted
  - fact_type: deceased.work_history.country
    subject: person.deceased
    value: DE
    confidence: user_asserted
```

### 6.2 Three-valued condition evaluation

```yaml
true:     all required conditions are met
false:    at least one required condition is not met
unknown:  at least one condition depends on a missing fact
```

### 6.3 Consequence resolution statuses

```yaml
applies:          all required conditions are true
maybe_applies:    at least one condition is unknown, none are false
does_not_apply:   at least one required condition is false
blocked:          a blocking exception is true
needs_fact:       routing depends on a missing fact
```

---

## 7. Cross-border Composition

### 7.1 Jurisdiction roles

```yaml
jurisdiction_roles:
  death_place: [LU]
  deceased_habitual_residence: [LU]
  survivor_residence: [LU]
  work_or_insurance_state: [DE]
  asset_situs: [FR]
  possible_succession_law: [LU]
  possible_pension_authority: [DE]
```

### 7.2 Composition flow (6-step MVP algorithm)

```
1. Normalize scenario facts.
2. Resolve jurisdiction roles.
3. Retrieve candidate consequences from relevant jurisdiction scopes.
4. Evaluate conditions using true / false / unknown.
5. Generate and deduplicate task candidates.
6. Render checklist with explanation traces.
```

### 7.3 Layered additive model

Given `death_place: LU, work_history: DE, assets: FR`, retrieve from:

```yaml
- graph/consequences/bereavement/eu/
- graph/consequences/bereavement/xborder/
- graph/consequences/bereavement/lu/
- graph/consequences/bereavement/de/
- graph/consequences/bereavement/fr/
```

### 7.4 Cross-border design principle

Do not produce one grand merged legal answer. Produce a layered checklist:

```
EU / cross-border routing
Luxembourg immediate steps
Germany survivor-pension steps
France asset/succession steps
Uncertain / needs confirmation
Professional review recommended
```

### 7.5 EU layer rule

EU-layer records should generally not replace national consequences. They explain or route:

```yaml
- which national law may govern succession
- which authority may be competent
- whether insurance periods may need coordination
- whether evidence from one country may be needed in another
```

---

## 8. Deduplication

### 8.1 Principle

Dedupe is deterministic, explicit, source-preserving, and test-covered.

### 8.2 Mechanism

Each task template carries a `dedupe` block. Explicit `dedupe_rule` records govern merge behavior. The generator matches tasks by `dedupe_key_template` and applies the merge strategy.

### 8.3 Merge vs. no-merge

```yaml
# These MERGE (same action, same document, same subject):
"Get death certificate copies" (for pension)
"Get death certificate copies" (for succession)
"Get death certificate copies" (for bank)

# These DO NOT MERGE (different jurisdictions/authorities):
"File succession declaration in Luxembourg"
"File succession declaration in France"
```

---

## 9. Source Provenance Chain

### 9.1 Chain

```
source (official entity)
  → source_snapshot (Clarvia's captured copy)
    → source_assertion (specific extracted claim)
      → consequence (triggered effect)
        → task_template (human action)
          → checklist_item (generated output)
```

### 9.2 Source hierarchy

| Tier | Source class | Default weight |
|---|---|---|
| A | Statute, regulation | Highest |
| B | Consolidated legislation | High |
| C | Official administrative guidance | High |
| D | Official forms and instructions | Medium-high |
| E | Official FAQs / life-event pages | Medium |
| F | Practical inferred steps | Lowest (must be labeled "inferred") |

### 9.3 Flat provenance block

Used on source_assertion, consequence, and task_template:

```yaml
provenance:
  derived_from_snapshot_ref: snapshot.guichet_lu.death_declaration.2026_05_31
  extraction_method: ai_assisted   # manual, ai_assisted, automated
  extracted_by: software.extractor.v0.1
  extracted_at: 2026-05-31T10:30:00Z
  reviewed_by: reviewer.lu.001
  reviewed_at: 2026-05-31T11:00:00Z
```

For `source_snapshot`, capture metadata lives at the top level (`captured_at`, `capture_method`, `captured_by`) rather than in a provenance/capture block — see section 3.2.

PROV-O Activity and Agent entities are generated from these flat fields at export time.

### 9.4 Relationship direction

Canonical data is one-directional:

```
consequence.task_template_refs → [task_template IDs]
```

Runtime indexes are bidirectional (generated at build time):

```
build/indexes/task_to_consequence_refs.json
```

Editors never maintain reverse references manually.

---

## 10. Open/Proprietary Boundary

### 10.1 Three status dimensions

```yaml
authoring_status:
  - draft
  - in_review
  - changes_requested
  - approved
  - deprecated
  - withdrawn

distribution_status:
  - public_open
  - public_metadata_only    # exceptional: source/snapshot restrictions only
  - private_overlay
  - restricted_source

monitoring_status:
  - unmonitored
  - monitored
  - review_due
  - source_changed
  - stale
  - quarantined
```

### 10.2 What's open

```yaml
open_repo:
  - schemas
  - controlled vocabularies
  - source metadata
  - redistributable source snapshots
  - source assertions
  - public approved consequence records
  - public approved task templates
  - public dedupe rules
  - public scenario tests
  - generator core logic
  - generated public baseline exports
```

### 10.3 What's proprietary (gold layer)

```yaml
gold_layer:
  - monitoring frequency and freshness SLA status
  - hosted API indexes
  - customer-specific overlays
  - private review notes
  - source change intelligence
  - reviewer workflow operations
  - private risk scoring
```

### 10.4 Core principle

The proprietary layer does not contain secret canonical public-law facts. The proprietary value is freshness, monitoring, reliability, hosting, review operations, and customer-specific overlays.

### 10.5 Sync mechanism

```
open Git commit
  → CI validates schemas
  → public export generated
  → gold importer reads commit SHA
  → gold graph materializes records
  → gold overlay attaches monitoring and SLA metadata
  → hosted API serves merged open + gold view
```

Gold-to-open changes go through deliberate public PRs. Never sync silently backward.

### 10.6 Publication gate

**Public checklist generator** (graph-level rule — traverses references, no duplicated status fields):

```yaml
public_checklist_publication_gate:
  record.authoring_status: approved
  record.distribution_status: public_open
  record.source_assertion_refs: non_empty
  all_referenced_source_assertions.review_status: approved
  contradiction_status:
    allowed:
      - none
      - resolved
    accepted_uncertainty:
      allowed_only_if:
        - item is non-high-risk
        - user_visible_caveat is present
```

Note: `review_status` is checked on the linked `source_assertion` records, not duplicated on consequence or task_template. This avoids status drift.

**Proprietary hosted API:**

```yaml
authoring_status: approved
distribution_status: [public_open, private_overlay]
monitoring_status: [monitored, review_due]
```

---

## 11. Schema Versioning

### 11.1 Format

```
MAJOR.MINOR.PATCH (semantic versioning)
```

### 11.2 Pre-1.0 contract

Breaking changes are allowed but must include:

```yaml
- changelog entry
- migration script
- updated fixtures
- updated canonical scenario tests
```

### 11.3 Post-1.0 contract

1. No required field removed without deprecation.
2. No field renamed without alias support.
3. New optional fields allowed in minor versions.
4. New required fields require a major version.
5. Consumers must ignore unknown fields.
6. Export schemas may lag internal schemas but must declare their version.

### 11.4 Per-record versioning

```yaml
schema_version: 0.1.0
record_version: 4
content_hash: "sha256:..."
```

### 11.5 Separate version tracks

```yaml
internal_schema_version: 0.4.0
public_api_version: 0.2.0
jsonld_export_version: 0.1.0
```

### 11.6 Migration directory

```
migrations/
  0001_0_1_0_initial.py
  0002_0_2_0_add_source_snapshot.py
  0003_0_3_0_add_evidence_requirement_sets.py
```

---

## 12. Standards Compatibility

### 12.1 Strategy

```
Author Clarvia-native. Export standards-compatible.
Only promote standards abstractions to canonical objects when operationally necessary.
```

### 12.2 CPSV-AP export

Export official-procedure consequences as `cpsv:PublicService` when:
- `consequence_type` is `administrative_step` or `right_or_benefit`; **and**
- at least one linked `task_template` (via `task_template_refs`) has `authority_refs`.

The export pipeline traverses `consequence.task_template_refs[*].authority_refs` to populate `cv:hasCompetentAuthority`. Authority refs live on task_template, not on consequence, preserving the consequence/task separation.

Routing decisions and escalations are not exported as CPSV services.

Controlled by `standards_export.cpsv_public_service.enabled` on consequence records.

### 12.3 CCCEV export

Synthesize `cv:Requirement` from existing consequence + condition + evidence_requirement_set + deadline + source_assertion chains. No first-class `requirement` authoring object needed for v0.1.

Controlled by `standards_export.cccev_requirement.enabled` on consequence records.

**Promotion triggers for first-class requirement object:**
- Multiple consequences share the same requirement
- One consequence has several alternative requirement paths
- A requirement needs its own lifecycle
- Evidence alternatives exceed task_template fields
- Native CCCEV publication needed (not just export)
- OOTS/evidence-broker integration begins
- Reviewers ask to review requirements separately

### 12.4 ELI

`legal_identifier` block on `source` records for legislation. Supports ELI URI, CELEX, national law IDs, and URL-only fallback. Germany has partial ELI coverage (pillar 1 only); do not require ELI for all legal sources.

### 12.5 PROV-O

Generate PROV-O entities (prov:Entity, prov:Activity, prov:Agent) from flat provenance fields at export time. No first-class activity or agent authoring objects.

### 12.6 Classification mappings

Centralized export-time mapping files, not per-record fields:

```yaml
# exports/cpsv-ap/classification-mappings.yml
life_events:
  bereavement:
    label: Bereavement
    clarvia_uri: https://clarvia.eu/vocab/life-event/bereavement
domains:
  death_registration:
    thematic_area_uri: http://publications.europa.eu/resource/authority/data-theme/JUST
consequence_types:
  administrative_step:
    cpsv_public_service_candidate: true
  routing_decision:
    cpsv_public_service_candidate: false
```

Per-record `standards_export.classification_override` allowed but exceptional.

---

## 13. Controlled Vocabularies

```
vocab/
  agents.yml                    — reviewers, AI extractors, scrapers, publishers
  jurisdictions.yml             — codes, URIs, spatial URIs
  source_tiers.yml              — statute > regulation > guidance > form > faq > inferred
  claim_types.yml               — deadline, authority, document_required, etc.
  consequence_types.yml         — administrative_step, right_or_benefit, obligation, etc.
  action_types.yml              — submit_application, obtain_document, notify_authority, etc.
  checklist_groups.yml          — immediate_formalities, money_and_benefits, etc.
  life_events.yml               — bereavement (MVP only)
  domains.yml                   — death_registration, survivor_pension, succession, etc.
  confidence_levels.yml         — high, medium, low, unassessed
  form_roles.yml                — blank_template, online_application, completed_submission_evidence
  extraction_methods.yml        — manual, ai_assisted, automated
  review_statuses.yml           — draft, in_review, changes_requested, approved, rejected, superseded
  review_risk_levels.yml        — low, medium, high, critical
  source_roles.yml              — primary_guidance, supplementary_guidance, legal_basis, form_page, etc.
  change_severity.yml           — cosmetic, non_substantive, substantive, contradiction, unavailable
  contradiction_statuses.yml    — none, suspected, in_review, resolved, accepted_uncertainty, quarantined, superseded
  contradiction_types.yml       — direct_value_conflict, source_tier_conflict, temporal_conflict, scope_conflict, etc.
  coverage_statuses.yml         — experimental, draft, reviewed, published, monitored
  translation_statuses.yml      — draft, ai_draft, reviewed, approved
  locales.yml                   — en, fr, de, nl, etc.
```

---

## 14. Generated Artifacts

```yaml
generated_build_artifacts:
  - resolved_consequence           # consequence evaluated against a scenario
  - task_candidate                 # task generated from a resolved consequence
  - checklist_item                 # deduplicated, rendered task for user
  - checklist                      # full ordered checklist for a scenario
  - checklist_run                  # generation event / run metadata
  - explanation_trace              # source-backed reasoning chain per item
  - contradiction_report           # CI-generated contradiction detection
  - task_to_consequence_index      # reverse index
  - source_to_assertion_index      # reverse index
  - jurisdiction_coverage_index    # coverage map

generated_export_artifacts:
  - synthetic_requirement_export   # CCCEV Requirement synthesized from graph
  - cpsv_ap_export                 # CPSV-AP PublicService/Rule exports
  - prov_o_export                  # PROV-O provenance bundles (later)
  - json_export                    # flat JSON
  - jsonld_export                  # JSON-LD for linked data
```

### 14.1 Deterministic checklist item IDs

Generated from:

```yaml
scenario_hash
task_template_id
resolved_subject_id
jurisdiction
authority_id (if relevant)
dedupe_group_key
generator_version (major.minor only)
```

Format: `checklist_item.<scenario_hash>.<task_or_group_hash>`

Hashing uses canonical JSON serialization. Does NOT include: `generated_at`, `source_capture_date`, `display_order`, `localized_title`, `reviewer_notes`.

Same scenario + same graph = same checklist item IDs. Generation runs are timestamped separately as `checklist_run.<timestamp>.<scenario_hash>`.

---

## 15. Repository Structure

```
repo/
  schemas/v0.1/
    source.schema.json
    source_snapshot.schema.json
    source_assertion.schema.json
    authority.schema.json
    evidence_type.schema.json
    form.schema.json
    condition.schema.json
    deadline.schema.json
    consequence.schema.json
    task_template.schema.json
    dedupe_rule.schema.json
    composition_rule.schema.json
    intake_fact_type.schema.json
    scenario.schema.json
    scenario_test.schema.json
    checklist_output.schema.json

  vocab/
    agents.yml
    jurisdictions.yml
    source_tiers.yml
    claim_types.yml
    consequence_types.yml
    action_types.yml
    checklist_groups.yml
    life_events.yml
    domains.yml
    confidence_levels.yml
    form_roles.yml
    extraction_methods.yml
    review_statuses.yml
    review_risk_levels.yml
    source_roles.yml
    change_severity.yml
    contradiction_statuses.yml
    contradiction_types.yml
    coverage_statuses.yml
    translation_statuses.yml
    locales.yml

  sources/
    register.yml
    snapshots/
      html/
      pdf/
      warc/                    # deferred
    assertions/
      lu/
      de/
      fr/
      eu/

  graph/
    authorities/
      lu/
      de/
      fr/
    forms/
      lu/
      de/
      fr/
    evidence_types/
      global/
      lu/
      de/
      fr/
    conditions/
      bereavement/
        lu/
        de/
        fr/
        eu/
        xborder/
    deadlines/
      bereavement/
        lu/
        de/
        fr/
    consequences/
      bereavement/
        lu/
        de/
        fr/
        eu/
        xborder/
    task_templates/
      bereavement/
        lu/
        de/
        fr/
        eu/
    composition_rules/
      bereavement/
        xborder/
    dedupe_rules/
      bereavement/
        global/
    intake_fact_types/
      bereavement/

  generator/
    rules/
    rendering/

  build/
    indexes/
    exports/
      json/
      jsonld/
      cpsv-ap/

  exports/
    cpsv-ap/
      classification-mappings.yml
    cccev/
    prov-o/

  tests/
    scenarios/
    regression/
    citation_integrity/

  monitoring/
    policies.yml
    recheck_schedule.yml

  reviews/
    contradictions/

  coverage/
    jurisdictions.yml

  logs/
    extractions/
    ai_suggestions/

  migrations/

  docs/
    CONTRIBUTING.md
    GOVERNANCE.md
    LICENSES.md
    ADDING_A_JURISDICTION.md
    ADDING_A_LIFE_EVENT.md
    TRANSLATIONS.md
    REVIEW_POLICY.md
    RULES_AS_CODE.md
    INTEGRATION.md
    SECURITY_AND_ABUSE.md

  CODEOWNERS
  .github/pull_request_template.md

  translations/
    en/
    fr/
    de/
```

---

## 16. Schema Build Order

```
 1. source.schema.json
 2. source_snapshot.schema.json
 3. source_assertion.schema.json
 4. authority.schema.json
 5. evidence_type.schema.json
 6. form.schema.json
 7. intake_fact_type.schema.json
 8. condition.schema.json
 9. deadline.schema.json
10. consequence.schema.json
11. task_template.schema.json
12. dedupe_rule.schema.json
13. composition_rule.schema.json
14. scenario.schema.json           # runtime/API input schema
15. scenario_test.schema.json      # authored regression fixture
16. checklist_output.schema.json
```

`scenario.schema.json` is a runtime/API input schema (scenario facts submitted by a user or client). `scenario_test.schema.json` is an authored regression fixture (scenario facts + expected outputs). Both are validated, but only `scenario_test` is a canonical authoring object.

Provenance before consequences. Consequences before checklists.

---

## 17. Non-negotiable Constraints

### Architecture constraints (D1/D2)

1. No checklist item without a source assertion.
2. No AI-written legal consequence can publish without human approval.
3. No source assertion without a captured source snapshot or official URL.
4. No condition evaluation may treat unknown as false.
5. No destructive overwrite of old legal versions.
6. No permanent ID renames without deprecation metadata.
7. No proprietary-only canonical facts for the public-interest baseline.
8. No government integration dependency in the MVP.

### Governance constraints (D3)

9. No source assertion approval without checking the anchor in the captured snapshot.
10. No high-risk unresolved contradiction in public checklist output.
11. No stale high-risk source beyond 6 months without warning or recheck.
12. No external contributor approval rights by default.

---

## 18. Editorial & Governance

### 18.1 Core governance principle

> AI may suggest, extract, draft, compare, translate, and test. Humans decide what is published.

The editorial unit of trust is the `source_assertion`. The publication unit is the graph record that depends on approved assertions. The user-facing unit is the generated checklist item.

### 18.2 Source workflow (6 stages)

```
1. Discover candidate URL
2. Add source record to sources/register.yml
3. Capture source_snapshot with CLI
4. Extract source_assertion batch (AI-assisted)
5. Draft linked graph records (consequences, tasks, conditions, deadlines)
6. Validate with CI and open PR
```

**One source record per official page/document.** Group related pages with `source_family` and `known_related_sources` in the registry, not by combining pages into one source.

**Sources registry** (`sources/register.yml`) includes per-source metadata:

```yaml
source_family: guichet_lu_death
source_role: primary_guidance
capture_policy:
  preferred_method: http_get
  fallback_method: browser_render
  manual_recheck_interval_days: 180
known_related_sources:
  - source.guichet_lu.death_certificate_extract
```

**HTML sources:** captured with `http_get` (fallback `browser_render`), stored as HTML + extracted text.

**PDF sources:** captured with `http_get` or `manual_download`, stored as PDF + extracted text. OCR assertions capped at `confidence: medium` until human-reviewed.

### 18.3 Review model

**Three phases:**

| Phase | Who | Assertion review | Graph record review |
|---|---|---|---|
| Solo founder | 1 person | Self-review with **24h mandatory delay** between extraction and approval | Self-review |
| First reviewer | 2–3 people | Legal reviewer approves assertions. High-risk assertions require founder + legal reviewer | Founder approves modeling |
| Mature | 5+ people | Jurisdiction reviewer approves. Cross-border items require jurisdiction + cross-border reviewer | Role-based with CODEOWNERS |

**Review operates at the assertion level.** A source batch file can contain mixed statuses. Unapproved assertions may exist in main only if no public graph record references them.

**High-risk assertion types** (require stricter review):

```yaml
- deadline, eligibility_condition, exception, legal_scope, fee, obligation, liability
```

**Lower-risk assertion types** (single reviewer sufficient):

```yaml
- authority, form, channel, filing_location, document_required
```

### 18.4 Monitoring state machine

```
unmonitored → review_due          (manual recheck due)
unmonitored → monitored           (enrolled in gold monitoring)

monitored   → review_due          (recheck due, no change detected)
monitored   → source_changed      (automated change detected, relevant)
monitored   → stale               (no successful check after stale_after_days)

review_due  → monitored           (reviewer confirms source still current)
review_due  → source_changed      (reviewer finds relevant change)
review_due  → stale               (review due exceeded by policy)

source_changed → monitored        (new snapshot captured, assertions reviewed, records updated)
source_changed → quarantined      (high-risk change, cannot resolve quickly)

stale       → review_due          (reviewer starts recheck)
stale       → monitored           (source checked, no relevant change)
stale       → quarantined         (stale high-risk source exceeds maximum window)

quarantined → monitored           (contradiction/change resolved and reviewed)
quarantined → source_changed      (still changed but unblocked for internal review)
```

**Forbidden transitions:** quarantined → public without review. source_changed → monitored without snapshot. stale → monitored without check.

**Recheck cadence (open baseline):**

| Source tier | Manual recheck interval |
|---|---|
| Statute, regulation | 180 days |
| Consolidated legislation | 90 days |
| Official guidance, forms | 90 days |
| FAQ, inferred | 180 days |

**Credibility rule:** No public checklist item may depend solely on a source unchecked for >12 months. High-risk items: >6 months.

**Source change severity:**

| Severity | Action |
|---|---|
| Cosmetic (layout, nav) | Log, no action |
| Non-substantive (rewording) | `review_due`, assertions stay approved |
| Substantive (deadline/authority/eligibility changed) | `source_changed`, assertions → `in_review` |
| Contradiction | `quarantined`, publication blocked |

### 18.5 AI boundary

| Stage | AI allowed | Human checkpoint |
|---|---|---|
| Source discovery | Yes — find URLs, suggest families | Human confirms officialness before registering |
| Snapshot capture | Limited — suggest method | Deterministic CLI captures |
| Assertion extraction | Yes — draft claims, anchors, values | Human checks anchor and value before `approved` |
| Consequence drafting | Yes — draft YAML from assertions | Human reviews modeling before `approved` |
| Review assistance | Yes — flag issues, contradictions | Human decides |
| Translation | Yes — draft translations | Human verifies legal/admin wording |
| Monitoring diff | Yes — summarize changes | Human classifies severity |

**Provenance honesty:** `extraction_method` stays `ai_assisted` even after human approval. Human approval is captured in `review_status` and `reviewed_by/at`.

**Confidence assignment:** AI may suggest confidence scores (kept in extraction logs, not canonical graph). Human assigns canonical `confidence: high | medium | low | unassessed`.

```yaml
confidence_high:    official source, exact anchor, unambiguous claim, human approved
confidence_medium:  official source, anchor present, scope/interpretation needs caution
confidence_low:     weak source, OCR used, translation uncertain, or claim inferred
confidence_unassessed: AI/contributor draft not yet reviewed
```

### 18.6 Contributor model

**Fork-and-PR model.** External contributors may propose content but not approve it.

**Contributors can:** suggest sources, draft assertions, draft graph records, add scenario tests, report staleness/contradictions, propose translations.

**Contributors cannot:** approve assertions, set `authoring_status: approved`, merge PRs, resolve contradictions, publish gold overlays.

**Contributed records start as:**

```yaml
contributed_source_assertions:
  review_status: draft
  confidence: unassessed

contributed_graph_records:
  authoring_status: draft
```

**New jurisdiction rule:** No jurisdiction can publish public checklist records without an approved jurisdiction reviewer or documented temporary founder review policy.

**Licensing:**

```yaml
code_license: EUPL-1.2
data_license: CC-BY-4.0
schemas_and_vocab: CC0 or Apache-2.0
source_snapshots: not relicensed (follow source terms)
contributor_agreement: Developer Certificate of Origin (not CLA)
```

**Gold layer flow:** Community contributions enter via open PR → merged to open baseline → gold importer ingests commit → gold overlay attaches monitoring. Gold-to-open changes must be deliberate PRs.

### 18.7 Contradiction handling

**Detection:** CI generates `build/reports/contradictions.yml` by comparing approved assertions with overlapping `claim_scope` and time periods.

**Contradiction types:** direct_value_conflict, source_tier_conflict, temporal_conflict, scope_conflict, translation_conflict, jurisdiction_conflict.

**Source tier as presumption, not automatic override.** Higher tier wins unless: it's older and no longer effective, has narrower scope, or the lower-tier source is the competent authority's specific procedure page.

**Contradiction state machine:**

```
none → suspected               (CI or reviewer flags conflict)
suspected → in_review           (maintainer accepts for review)
in_review → resolved            (reviewer determines correct interpretation)
in_review → accepted_uncertainty (conflict is real, cannot be resolved)
in_review → quarantined         (high-risk unresolved conflict)
resolved → none                 (records updated)
accepted_uncertainty → resolved (new information resolves conflict)
quarantined → in_review         (unblocked for review)
superseded                      (later source version replaces conflict)
```

**Publication gate allows:** `none`, `resolved`. Allows `accepted_uncertainty` only for non-high-risk items with user-visible caveat.

**High-risk contradictions block publication:**

```yaml
- deadline, eligibility_condition, exception, legal_scope, obligation, liability, material fee
```

**Authored contradiction notes** (for unresolved editorial conflicts) live in `reviews/contradictions/` as governance data, not canonical graph objects.

### 18.8 CI validation pipeline

```
clarvia validate              # JSON Schema validation
clarvia lint-ids              # ID grammar and length checks
clarvia check-references      # all _refs point to existing records
clarvia check-anchors         # assertion anchors exist in snapshots
clarvia check-publication-gate # no unapproved assertions in public records
clarvia check-contradictions   # flag overlapping conflicting claims
clarvia test-scenarios         # regression tests pass
clarvia build-checklist        # generate checklist for test scenarios
```

---

## 19. Technical Implementation

### 19.1 Repository architecture

**Three repos:**

```yaml
clarvia-graph:        public open baseline (new repo)
clarvia-gold-private: private monitoring, freshness, hosted API, customer overlays (later)
workflow-web:         consumer app (existing)
workflow-data:        legacy migration source (existing, see 19.8)
```

**clarvia-graph is a single monorepo** containing both graph data and generator code. Do not split the generator into a separate package before v0.2.

**Gold layer relationship:** Separate private repo. Imports open repo by commit SHA. No submodules, no private branches, no private folders in an open repo.

```yaml
gold_sync:
  open_repo_commit: abc123
  open_record_content_hash: "sha256:..."
  gold_overlay_version: 7
```

Gold-to-open corrections happen through public PRs.

### 19.2 Technology stack

```yaml
language: TypeScript
runtime: Node.js 22
package_manager: pnpm
yaml_parser: yaml (npm)
schema_validator: Ajv (JSON Schema draft 2020-12, simple subset)
test_runner: Vitest
ci: GitHub Actions
frontend_consumption: static JSON at build time
```

**JSON Schema subset** (allowed in v0.1):

```yaml
- type, properties, required, additionalProperties
- pattern, enum, const
- oneOf, anyOf, allOf
- format, $defs, $ref
```

Avoid: `$dynamicRef`, `$dynamicAnchor`, complex `unevaluatedProperties`, recursive schemas.

### 19.3 Schema validation pipeline

**Controlled vocabularies are validated separately from JSON Schema.** Schema enforces `claim_type: string`. Custom validator enforces `claim_type` exists in `vocab/claim_types.yml`. Changing a vocabulary never requires editing schema files.

**Cross-schema `$ref`** used for structural reuse only (shared temporal fields, status enums, ID patterns, provenance blocks). Reference integrity ("does this assertion ID actually exist?") is a graph validator, not a schema check.

**Validation layers:**

```
1. YAML parse check
2. JSON Schema validation (Ajv)
3. Vocabulary validation
4. ID grammar and uniqueness
5. Reference integrity
6. Anchor validation (assertion anchors exist in snapshots)
7. Dedupe key template validation
8. Publication gate check
9. Contradiction detection
```

**Dedupe key validation** parses `{placeholder}` tokens and asserts each resolves to a field on the record:

```yaml
valid_task_template_placeholders:
  - action_type, jurisdiction, life_event, domain
  - target.object_type, target.object_ref
  - target.subject_role, target.primary_authority_ref
```

### 19.4 Build and generation pipeline

**Full rebuild for v0.1.** Incremental builds deferred until graph exceeds 10,000 records or build time exceeds 60 seconds.

**Build steps:**

```
loadGraph()         — read all YAML, deterministic sort
validateGraph()     — all validation layers
buildIndexes()      — reverse refs, manifests
for each scenario_test:
  normalize facts
  resolve jurisdiction roles
  retrieve candidate consequences
  evaluate conditions (three-valued)
  generate task candidates
  apply dedupe
  render checklist
  compare expected outputs
export artifacts
```

**Generated artifacts go to `build/`**, not committed to main. Published as GitHub Actions artifacts and release assets.

### 19.5 Three-valued condition evaluator

Do NOT use `json-logic-js` directly — it returns JavaScript truthy/falsy and does not preserve `unknown` semantics.

**Custom evaluator** for the JsonLogic subset Clarvia uses:

```yaml
allowed_operators: [var, ==, "!=", and, or, "!", exists, in, ">", ">=", "<", "<="]
return_type: true | false | "unknown"
```

**Three-valued truth table:**

```
var missing        → unknown
unknown == value    → unknown
and(false, anything)→ false
and(true, unknown)  → unknown
or(true, anything)  → true
or(false, unknown)  → unknown
not(unknown)        → unknown
exists(missing)     → false
```

`missing_fact_behavior: unknown` stays enforced. This is a non-negotiable constraint.

### 19.6 Export pipelines

Exports are separate commands, built from internal generated artifacts:

```
pnpm export:json    → build/exports/json/
pnpm export:web     → build/exports/web/
pnpm export:jsonld  → build/exports/jsonld/
pnpm export:cpsv    → build/exports/cpsv-ap/
```

**MVP export set:**

```yaml
- JSON export (primary product output)
- Web runtime bundle (for workflow-web)
- JSON-LD context + record export
- CPSV-AP Turtle smoke export (3–5 records, for grant deliverable)
```

**Deferred:** full CCCEV export, full PROV-O export, SHACL, RDF endpoint, SPARQL.

**JSON-LD context:** Clarvia-owned context mapping internal fields to stable Clarvia URIs, bridging to `dct:`, `prov:`, `cpsv:`, `cv:`, `eli:` namespaces.

**Export versioning:** Separate version tracks per the spec (section 11.5). Export manifest records `graph_version`, `graph_commit`, `export_version`, `generated_at`.

### 19.7 Source snapshot infrastructure

**HTML sources:** Store raw HTML (canonical evidence) + extracted text (working representation).

**PDF sources:** Store original PDF + extracted text. OCR assertions capped at `confidence: medium` until human-reviewed.

**Storage policy:**

```yaml
snapshot_storage:
  html: regular Git by default
  pdf: Git LFS
  large_rendered_html: Git LFS (case-by-case)
```

HTML snapshots stay in regular Git — small diffs are valuable for review, especially when checking whether assertion anchors still exist. Move to LFS only when repo size or diff noise becomes a problem.

**`.gitattributes`:**

```
*.pdf filter=lfs diff=lfs merge=lfs -text
sources/snapshots/pdf/** filter=lfs diff=lfs merge=lfs -text
```

**Hashing:**

```yaml
content_hash: SHA-256 of exact bytes saved as snapshot (required)
normalized_text_hash: SHA-256 of extracted text after whitespace normalization (optional)
```

**Capture tooling:**

```yaml
capture_methods:
  http_get:
    default: true
    dependency: built-in fetch / undici
  manual_download:
    default: true
  browser_render:
    default: false
    optional_dependency: playwright
    install_when: source requires client-side rendering
```

Playwright is NOT in the base `package.json`. Install only when a specific source requires browser rendering.

**Deferred:** WARC, browser replay, rendered screenshots, large-scale crawler, object storage.

### 19.8 Consumer API for workflow-web

**MVP: static JSON at build time.** No runtime API, no database, no server dependency.

```
clarvia-graph CI
  → validates graph
  → generates web export
  → publishes versioned artifact/release

workflow-web CI
  → downloads pinned graph export
  → copies JSON into public/data/clarvia/
  → Next.js builds static app
```

**Web export structure:**

```
build/exports/web/
  manifest.json
  intake/bereavement.json
  runtime/bereavement-lu-de-fr.json
  indexes/jurisdiction_coverage.json
```

**Intake questionnaire** generated from `intake_fact_type` records, not hardcoded in React:

```json
{
  "life_event": "bereavement",
  "questions": [
    {
      "id": "q_death_place_country",
      "fact_type": "death.place.country",
      "label": "Where did the death occur?",
      "input_type": "country_select"
    }
  ]
}
```

**Client-side evaluation:** Browser loads runtime bundle and evaluates conditions locally against user facts. Privacy-preserving — no data sent to server.

**Runtime evaluator:** Do NOT publish `@clarvia/runtime` in v0.1. Copy or share a small evaluator module between `clarvia-graph` and `workflow-web`. Extract as a package only after the API stabilizes (v0.3+).

**Version pinning:** workflow-web records `clarvia_graph_version`, `clarvia_graph_commit`, `export_generated_at` and displays in an "About sources" page.

### 19.9 Legacy workflow-data migration

workflow-data is not discarded. It becomes the legacy checklist corpus and migration source.

**Transition plan:**

```yaml
workflow_data_transition:
  status: legacy_migration_source
  short_term:
    - keep repo open for existing checklist fixes
    - freeze new structural work
    - tag content suitable for migration
    - document how old checklist items map to consequence/task_template/source_assertion
  contributor_transition:
    - publish migration note explaining the architectural change
    - create good-first-issues for source discovery and checklist-to-task mapping
    - offer side-by-side examples (old checklist item → new graph records)
    - do not ask volunteers to learn the full graph model immediately
  migration_output:
    - migrated_sources
    - candidate_task_templates
    - candidate_consequences
    - scenario_tests
```

**Migration path per checklist item:**

```
workflow-data checklist item
  → candidate task_template
  → identify source URL
  → capture source_snapshot
  → extract source_assertion
  → create consequence linking task_template
  → add scenario_test
```

**Governance rule:** Legacy checklist content may suggest tasks, but it cannot become source-backed graph content until it is backed by approved `source_assertion` records. This preserves the D1/D2 source-backed rule.

### 19.10 Four-week build order

| Week | Focus | Output |
|---|---|---|
| 1 | Repo + validation | `clarvia-graph` repo, schemas, vocab, TypeScript CLI skeleton, Ajv validation, ID/ref checks, GitHub Actions |
| 2 | Graph build | Source/snapshot/assertion loading, graph indexes, publication gate, dedupe validation, first LU records |
| 3 | Generator | Tri-valued condition evaluator, 6-step generation algorithm, deterministic IDs, first scenario_test, first checklist JSON |
| 4 | Exports + integration | Web runtime bundle, workflow-web reads static JSON, applies/maybe_applies/needs_fact rendering, source-backed explanation display |

---

## 20. Product Architecture

### 20.1 Core UX principle

> A grieving user should never need to understand the graph. They should see: what to do, why it may apply, by when, who to contact, what documents may be needed, and where the source comes from.

The product should feel like a calm guided triage → a useful partial checklist quickly → optional follow-up questions → source-backed, jurisdiction-layered next steps.

### 20.2 Progressive intake

**Do not ask all 15 routing facts upfront.** Start with 5–6 questions, generate a first checklist, then ask follow-ups only when they unlock meaningful items.

**Starter facts (first screen):**

```yaml
- death.date
- death.place.country
- deceased.habitual_residence.country
- survivor.residence.country
- relationship.to_deceased
- deceased.work_history.country  # optional multi-select
```

**Follow-up modules** (triggered by first-pass results or user actions):

```yaml
pension_and_benefits:
  trigger: relationship is spouse/partner/child/dependant
  asks: work_history, social_security_affiliation

estate_and_assets:
  trigger: user opens estate section or estate status unknown
  asks: asset_location, real_estate, will, choice_of_law

children_and_dependants:
  trigger: benefits section
  asks: children_or_dependants.exists
```

**"I don't know" handling:**

```yaml
explicit_i_dont_know: user told us → value: unknown, confidence: user_unknown
omitted_fact: not asked yet → fact_absent, evaluation: unknown
```

Both evaluate as `unknown`, but the UI uses the distinction to decide whether to re-ask. Message: *"That's okay. We'll mark the related steps as 'may apply' until you know."*

**Intake UI:** Hand-designed UX driven by generated `intake_fact_type` metadata. Do not render raw records as a generic form. Graph provides fact_type/label/value_type. Product provides wording, grouping, order, help text, emotional tone, mobile layout.

**Mobile-first:** One question per screen, large tap targets, plain language, progress indicator, "Skip for now" option.

### 20.3 Resolution algorithm — practical details

**Step 1 — Normalize:** Country codes to ISO, dates to ISO 8601, booleans to true/false/unknown, relationships to canonical values (spouse → surviving_spouse_or_partner), arrays sorted.

**Step 2 — Jurisdiction roles:** Derived from facts:

```yaml
death_place:                from death.place.country
deceased_habitual_residence: from deceased.habitual_residence.country
work_or_insurance_state:     from work_history or social_security_affiliation
asset_situs:                 from estate.asset_location.country
possible_succession_law:     default from habitual_residence (caveat: choice_of_law)
```

**Step 3 — Retrieve:** Always load EU + xborder. Then load consequences from jurisdictions matching each role's relevant domains (death_place → death_registration/funeral, work_state → survivor_pension, asset_situs → estate_assets/inheritance_tax).

**Step 4 — Three-valued truth tables:**

| A | B | AND | OR |
|---|---|---|---|
| true | true | true | true |
| true | false | false | true |
| true | unknown | unknown | true |
| false | false | false | false |
| false | unknown | false | unknown |
| unknown | unknown | unknown | unknown |

`NOT(unknown) = unknown`. `exists(missing) = false`.

**Result mapping:**

```yaml
all conditions true:           applies
some unknown, none false:      maybe_applies
missing fact needed for routing: needs_fact
required condition false:      does_not_apply
blocking exception true:       blocked
```

**Step 5 — Deduplicate:** Match task candidates by `dedupe_key_template`. Merge `needed_for`, `source_assertion_refs`, `jurisdiction_contexts`. Do NOT merge tasks with different jurisdictions/authorities.

**Step 6 — Render:** Generate denormalized checklist object consumed by frontend.

### 20.4 Checklist output shapes

**Checklist object:**

```yaml
checklist:
  id: checklist.scn_7h4k2q
  checklist_run_id: checklist_run.2026_05_31T120000Z.scn_7h4k2q
  life_event: bereavement
  generated_at: 2026-05-31T12:00:00Z
  graph_version: 0.1.0
  summary:
    item_counts: { applies: 8, maybe_applies: 4, needs_fact: 3, professional_review: 2 }
    source_count: 14
  sections: [...]  # ordered by urgency, then checklist_group
  items: [...]     # full denormalized items
```

**Checklist item object:**

```yaml
checklist_item:
  id: checklist_item.scn_7h4k2q.tsk_abc123
  status: applies | maybe_applies | needs_fact | blocked | does_not_apply
  title: "Declare the death to the local civil registrar"
  description: "..."
  jurisdiction_contexts: [LU]
  checklist_group: immediate_formalities
  urgency: { score: 100, label: urgent, deadline_label: "Within 24 hours", overdue: true }
  action: { action_type, authority, forms, documents }
  needed_for: ["Luxembourg death registration"]
  missing_fact_refs: []    # populated when status is maybe_applies/needs_fact
  why_maybe: null          # human-readable reason for uncertainty
  source_summary: { verified_at, source_count, primary_source_title }
  explanation_trace_id: explanation_trace.item_abc123
  rendering: { component_type: checklist_item | info_card | professional_review_card }
```

### 20.5 Uncertainty and partial-information UX

**`maybe_applies` items** go in a separate calm section below confirmed steps: *"May also apply — answer a question to confirm."*

**Transitions:** When maybe becomes applies, use a quiet confirmation toast. Item moves into the relevant section. No confetti, no celebratory language.

**`needs_fact` items** displayed as question cards, not tasks. Show what answering unlocks: *"This helps us check survivor pension and social security steps."*

**Mutually exclusive paths** (will vs. no will) shown as a single decision card, not both paths as checklist items.

**Maybe-item thresholds:**

```yaml
0–3 maybe items:  show full cards
4–8 maybe items:  group by topic, show top missing questions
9+ maybe items:  show "We need a few more answers" and ask highest-impact questions first
```

**Priority for reducing uncertainty:** urgent deadlines > rights/benefits > cross-border routing > documents > practical steps.

### 20.6 Source transparency

**Two-layer experience:**

- **Layer 1 (card):** Source title, verified date, official link, short supporting quote
- **Layer 2 (drawer):** Why this appears, conditions evaluated, full source/assertion details, legal basis

**Legal provisions** shown in source drawer only. Exception: cross-border routing items show short legal basis inline.

**Source freshness:** Global statement (*"Sources reviewed: 31 May 2026"*). Per-item freshness only in drawer. Stale/review_due sources show: *"This source may need rechecking. Confirm with the authority."*

**Monitored vs. unmonitored:** Do NOT visually distinguish in the free consumer checklist. It creates confusion. Gold/professional product can show monitoring status.

**Explanation trace object:**

```yaml
explanation_trace:
  why_visible: ["The death occurred in Luxembourg.", "The source says..."]
  conditions: [{ condition_ref, result, facts_used }]
  sources: [{ source_title, publisher, official_url, supporting_quote, captured_at, reviewed_at }]
  legal_basis: [{ label, url }]
```

### 20.7 Checklist lifecycle

**MVP: no accounts, no server persistence.**

- **Save:** Browser local storage (scenario facts, completed items, dismissed maybes, graph commit)
- **Mark done:** Local storage checkbox + done section + undo. No gamification.
- **Share:** Print, save as PDF, copy summary, export JSON locally. No server-based sharing.
- **Updates:** Snapshot-based. When user returns with stale graph commit: *"A newer version may be available. [Update] [Keep this version]"*. Show diff summary. Never silently change the checklist.

**Time-sensitive items:** Urgency labels, not countdown timers.

```yaml
urgent:            "Within 24 hours / immediate"
soon:              "In the next few days"
this_month:        "Within weeks"
no_known_deadline: "No specific deadline found"
```

If overdue: *"This may be overdue. Contact the authority as soon as possible."* No aggressive `23:17:02` timers — inappropriate for grief UX and implies precision the source doesn't support.

### 20.8 Cross-border presentation

**Timeline-first, not tabs-per-jurisdiction.** Tabs hide urgent items in other jurisdictions.

**Section order:**

```
1. Urgent / immediate
2. Money and benefits
3. Estate and inheritance
4. Cross-border notes
5. May apply
6. May need professional help
```

**Within sections:** Order by urgency_score → dependency_rank → checklist_group → jurisdiction. Jurisdiction badges `[LU] [DE] [FR] [EU]` on each item.

**View controls:** `Timeline | By country` toggle + jurisdiction filter. Default: Timeline.

**Routing decisions** (EU/cross-border) displayed as info cards, not checkboxes. Escalations as professional review cards (optional checkbox).

**Deduplicated documents:** Show compact *"Needed for 3 procedures across LU, DE, FR"* with expandable detail.

**Professional review section:** Calm, non-alarming. *"May need professional help"* — not *"Legal danger"* or *"You need a lawyer immediately."*

### 20.9 Product rules

```yaml
- Do not require all facts upfront.
- Never hide uncertainty by treating unknown as false.
- Do not show maybe_applies items as normal confirmed tasks.
- Do not use alarming language for professional review.
- Do not use countdown timers for grief-critical deadlines.
- Do not require accounts for MVP.
- Do not send user scenario facts to a server in the open MVP.
- Always expose source summary and official source link.
- Show legal/provenance detail only on demand.
- Default ordering is urgency and dependency, not country.
```

### 20.10 Frontend modules

```yaml
- IntakeWizard              # progressive 5-6 question flow
- ScenarioFactStore         # local fact state management
- LocalResolver             # client-side condition evaluator
- ChecklistRenderer         # section/item layout
- ChecklistItemCard         # applies items
- MaybeAppliesPanel         # uncertain items with follow-up questions
- NeedsFactQuestionCard     # inline fact-collection cards
- SourceDrawer              # two-layer source transparency
- ProfessionalReviewSection # escalation items
- LocalChecklistStorage     # browser persistence
- PrintExportView           # PDF/print output
```

---

## 21. Extensibility & Future-proofing

### 21.1 Extension principle

> Adding a jurisdiction or life event must not require changing existing records, weakening publication gates, or introducing privileged integrations.

Extension strategy:

```
Jurisdictions extend horizontally (new folders, new records).
Life events extend vertically (new namespace, same infrastructure).
Languages extend through translation overlays.
Rules-as-code extends through adapters.
Community scales through review gates.
Integrations scale through exports.
```

### 21.2 Adding a jurisdiction

**Five coverage stages:**

```yaml
metadata_only:    registered, no usable content
source_backed:    official sources/snapshots/assertions exist
checklist_draft:  consequences/tasks exist but not fully reviewed
published:        approved assertions + consequences generate public checklist items
monitored:        published + gold-layer monitoring/freshness
```

**10-step process** (Belgium example):

```
1. Add BE to vocab/jurisdictions.yml
2. Add coverage entry to coverage/jurisdictions.yml
3. Create folder skeleton (graph/*/be/, sources/assertions/be/, tests/scenarios/be/)
4. Add source records to sources/register.yml
5. Capture source_snapshots with CLI
6. Extract source_assertion batches
7. Add reusable objects (authorities, evidence types, forms)
8. Add consequence/task/condition/deadline records (authoring_status: draft)
9. Add scenario tests
10. Run full validation pipeline
```

**Scaffold CLI:** `clarvia scaffold jurisdiction BE --name Belgium --languages fr,nl,de` generates folder skeleton and vocab/coverage entries. Does not generate fake legal content.

**Minimum viable jurisdiction:** jurisdiction vocab entry + coverage entry + at least one source + snapshot + assertion. Consequence/task records needed only for checklist generation.

**Partial jurisdictions:** Visible only as coverage metadata. No user-facing checklist item unless the publication gate passes.

**Sub-national jurisdictions (v0.1):** Use slug-level specificity, not ID grammar changes:

```yaml
id: consequence.de.bereavement.death_registration.nrw_register_death
jurisdiction: DE
# Subjurisdiction tracked in coverage/jurisdictions.yml or source registry metadata for v0.1.
# Not a canonical schema field unless schemas permit extension fields.
```

Formal ISO 3166-2 namespace support deferred to v1.0.

### 21.3 Adding a life event

Each life event gets its own intake flow, consequences, conditions, deadlines, task templates, scenario tests. Shared objects (authorities, evidence types, forms, sources) carry across life events.

**Generic infrastructure** (reused across all life events): source, snapshot, assertion, authority, form, evidence_type, provenance, publication gate, condition engine, dedupe, scenario tests, export pipeline.

**Life-event-scoped objects:** consequence, task_template, condition, deadline, composition_rule, dedupe_rule, intake_fact_type, checklist rendering groups.

**Minimum viable life event:**

```yaml
- vocab/life_events.yml entry + domain vocab entries
- intake_fact_type records
- at least one source → snapshot → approved assertion
- at least one condition → consequence → task_template
- at least one scenario_test
- web export bundle for the life event
```

**Scaffold CLI:** `clarvia scaffold life-event birth --jurisdictions LU`

**Dedupe rules** are life-event-scoped in v0.1. Cross-event deduplication deferred.

**Intake flows:** Separate per life event (`intake/bereavement.json`, `intake/birth.json`). Shared UI components (country select, date input) are fine.

### 21.4 Internationalization

**Translation overlays** in separate files, not inline `title_fr`/`title_de` proliferation:

```
translations/
  en/graph/consequences/bereavement/lu/.../declare_death.yml
  fr/graph/consequences/bereavement/lu/.../declare_death.yml
```

Overlay format:

```yaml
record_id: consequence.lu.bereavement.death_registration.declare_death
locale: fr
fields:
  title: "Déclarer le décès à l'officier de l'état civil"
  description: "..."
translation_status: reviewed
translated_by: translator.fr.001
```

**Source assertions:** `claim_text` stays in source's original language. Translations are non-canonical overlays, not separate assertions.

**Locale-specific web exports:**

```
build/exports/web/runtime/en/bereavement-lu-de-fr.json
build/exports/web/runtime/fr/bereavement-lu-de-fr.json
```

**Fallback order:** `fr: [fr, en, source_language]`. Missing important translations show: *"Some source excerpts are shown in their original language."*

**Review language rule:** No high-risk assertion may be approved by a reviewer who cannot read the source language, unless a qualified translation review is attached.

**Controlled vocabularies** carry multilingual labels (en, fr, de at minimum).

### 21.5 Rules-as-code positioning

**JsonLogic is sufficient for v0.1.** Clarvia answers "what may apply?" not "how much money is owed?"

**Clarvia vs OpenFisca:**

| Clarvia | OpenFisca |
|---|---|
| Source-backed consequence discovery | Benefit eligibility calculations |
| Cross-border administrative routing | Tax/benefit amount formulas |
| Checklist generation | Income thresholds |
| Uncertainty and partial information | Household simulation |

**Temporal evaluator extensions** (evaluator functions, not schema changes):

```yaml
clarvia_jsonlogic_extensions:
  - date_before, date_after, date_add
  - date_diff_days, within_duration
  - is_known, is_unknown
```

**OpenFisca adapter:** Future mapping layer (`clarvia_fact → openfisca_variable`). Not every Clarvia condition should become OpenFisca.

**Computable claim:** *"Given scenario facts, Clarvia can compute which source-backed consequences apply, may apply, do not apply, or need more facts."* Do NOT claim: *"Clarvia computes legal entitlement."*

### 21.6 Community governance

**Three phases:**

| Phase | Timeline | Model |
|---|---|---|
| 1 | 0–6 months | Founder-maintainer with public rules |
| 2 | 6–18 months | Founder + jurisdiction reviewers + translation reviewers |
| 3 | 18+ months | Lightweight advisory board (founder, reviewers, civic-tech, legal-aid, public-sector observer) |

**License decisions (final):**

```yaml
code: EUPL-1.2
data: CC-BY-4.0
schemas_and_vocab: CC0 or Apache-2.0
source_snapshots: not relicensed (follow source terms)
contributor_agreement: Developer Certificate of Origin (not CLA)
```

**Non-expert contributors can:** discover sources, check links, draft translations, fix typos, add authority/form metadata, suggest scenario tests, report stale sources.

**Non-experts cannot approve:** legal assertions, deadlines, eligibility conditions, exceptions, legal scope, cross-border composition.

**Hostile contributions:** CI catches structural violations. Reviewers block incorrect legal content. Branch protection, CODEOWNERS, no external approval rights.

### 21.7 Integration surfaces

```yaml
open_source_projects: static JSON export → npm runtime package (later)
government_agencies:  CPSV-AP export, JSON-LD, static JSON → REST API (later)
researchers:          JSON-LD, CSV/JSON extracts, scenario test corpus
gold_customers:       hosted API, freshness metadata, monitoring alerts
```

Do not start with SPARQL. Provide it only when linked data demand and stable RDF exports exist.

**EU positioning:** Open public-interest consequence graph derived from official sources. NOT a replacement for official portals.

**5-stage path to standards recognition:**

```
1. Open baseline (public repo, schemas, source-backed records, scenario tests)
2. Reviewed coverage (jurisdiction reviewers, coverage badges, public changelog)
3. Standards exports (CPSV-AP, CCCEV, ELI-linked legal basis, PROV-O)
4. Partner validation (pilot with legal-aid/notary/civic-tech partner)
5. Public-sector recognition (government agency consumes export)
```

### 21.8 Extension CI gates

```yaml
coverage_gate:           partial jurisdictions cannot publish checklist items
translation_gate:        missing high-priority UI translations fail web export for supported locales
review_language_gate:    high-risk assertions require reviewer competence or reviewed translation
extension_regression:    adding BE cannot change LU/DE/FR scenario outputs
life_event_isolation:    birth records cannot affect bereavement exports
```
