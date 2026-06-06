# Review Policy

> Part of the [Clarvia Graph Foundation Specification](FOUNDATION.md).

This document defines how content is reviewed, approved, and published in the Clarvia consequence graph. It covers the review lifecycle, roles, AI boundaries, and publication gates.

---

## Core Principles

1. **No checklist item without a source assertion.** Every user-facing claim must trace back to a captured government source.
2. **No AI-written legal consequence can publish without human approval.** AI may draft, but humans approve.
3. **No source assertion without a captured source snapshot.** Assertions must be anchored to a specific, archived version of a page.
4. **No source assertion approval without checking the anchor.** The `text_quote` must exist in the captured HTML.
5. **No external contributor approval rights by default.** Only founders and designated reviewers can approve.

---

## Review Phases

The review model evolves with the size of the team:

### Phase 1: Solo Founder (current)

| What | Who reviews | Rule |
|---|---|---|
| Source assertions | Founder | Self-review with **mandatory 24-hour delay** between extraction and approval |
| Graph records | Founder | Self-review, no delay required |
| Scenario tests | Founder | Self-review |

The 24-hour delay for assertions ensures the reviewer comes back with fresh eyes. Extraction and approval should not happen in the same session.

### Phase 2: First Reviewer (2–3 people)

| What | Who reviews | Rule |
|---|---|---|
| Source assertions | Legal reviewer | Approves assertions. **High-risk assertions** require founder + legal reviewer |
| Graph records | Founder | Approves modeling decisions |
| Scenario tests | Any team member | Reviews test logic |

### Phase 3: Mature (5+ people)

| What | Who reviews | Rule |
|---|---|---|
| Source assertions | Jurisdiction reviewer | Approved per jurisdiction. Cross-border items require jurisdiction + cross-border reviewer |
| Graph records | Role-based via CODEOWNERS | Per-directory ownership |
| Scenario tests | Any contributor | With CI verification |

> **Jurisdiction reviewer rule (spec §18.6):** No jurisdiction can publish public checklist records without an approved jurisdiction reviewer or a documented temporary founder review policy.

---

## Status Lifecycles

### Assertion Review Status

```
draft → in_review → changes_requested → approved
                                      → rejected
                                      → superseded
```

| Status | Meaning |
|---|---|
| `draft` | AI-extracted or contributor-submitted, not yet reviewed |
| `in_review` | Under active review |
| `changes_requested` | Reviewer requested changes |
| `approved` | Verified against source, ready for publication |
| `rejected` | Claim is incorrect or not supported by source |
| `superseded` | Replaced by a newer assertion |

### Authoring Status (graph records)

```
draft → in_review → changes_requested → approved → deprecated
                                                  → withdrawn
```

### Confidence Levels

| Level | Meaning |
|---|---|
| `high` | Multiple sources agree, clear legal basis |
| `medium` | Single official source, clear statement |
| `low` | Inferred or ambiguous source |
| `unassessed` | AI/contributor draft, not yet reviewed |

---

## High-Risk vs. Lower-Risk Assertions

Not all assertions carry the same risk. **High-risk claim types** require stricter review:

### High-risk (require careful legal review)

- `deadline` — wrong deadlines cause missed obligations
- `eligibility_condition` — wrong conditions exclude entitled people
- `exception` — wrong exceptions mislead users
- `legal_scope` — wrong scope misrepresents the law
- `fee` — wrong amounts cause financial harm
- `obligation` — wrong obligations cause unnecessary actions
- `liability` — wrong liability info causes legal exposure

### Lower-risk (single reviewer sufficient)

- `authority` — which office handles this
- `form` — which form to file
- `channel` — online vs. in-person
- `filing_location` — where to go
- `document_required` — what to bring

---

## Publication Gate

A consequence can only appear in the public checklist output when all of these are true:

| Gate | Requirement |
|---|---|
| **Source present** | Consequence has at least one `source_assertion_ref` |
| **Assertion approved** | Referenced assertions have `review_status: approved` |
| **Anchor verified** | Assertion `text_quote` exists in the captured snapshot HTML |
| **Confidence set** | Assertion `confidence` is not `null` or `unassessed` |
| **Authoring approved** | Consequence has `authoring_status: approved` |
| **Distribution public** | Consequence has `distribution_status: public_open` |

Records that don't pass the gate are filtered out by the generator — they exist in the repo but are invisible to users.

### Distribution Status Values

| Status | Meaning |
|---|---|
| `public_open` | Visible in public checklist output |
| `public_metadata_only` | Metadata visible, details hidden |
| `private_overlay` | Only in private/paid overlays |
| `restricted_source` | Draft or under review — not in public output |

### Promotion Path

```
restricted_source → public_open
```

A record is promoted from `restricted_source` to `public_open` when:
1. All referenced source assertions are `approved`
2. The record's `authoring_status` is set to `approved`
3. The publication gate CI check passes

---

## AI Boundary

AI is used extensively in the workflow but has clear boundaries:

| Stage | AI allowed? | Human checkpoint |
|---|---|---|
| Source discovery | ✅ Find candidate URLs | Human confirms the source is official |
| Snapshot capture | ✅ Deterministic CLI | Automated — no human needed |
| Assertion extraction | ✅ Draft claims from HTML | Human checks anchor text and claim accuracy before setting `approved` |
| Consequence drafting | ✅ Draft YAML records | Human reviews modeling before setting `approved` |
| Review assistance | ✅ Flag potential issues | Human makes the decision |
| Translation | ✅ Draft translations | Human verifies legal/admin wording |
| Monitoring diffs | ✅ Summarize source changes | Human classifies severity |

**Provenance honesty:** The `extraction_method` field stays `ai_assisted` even after human approval. This is an honest record of how the content was created, not a quality judgment.

---

## Contributor Model

**Fork-and-PR model.** External contributors may propose content but cannot approve it.

### Contributors CAN

- Discover and suggest official sources
- Draft assertions (`review_status: draft`)
- Draft graph records (`authoring_status: draft`)
- Add scenario tests
- Report staleness or contradictions
- Propose translations
- Fix typos and metadata

### Contributors CANNOT

- Approve assertions (set `review_status: approved`)
- Approve graph records (set `authoring_status: approved`)
- Merge PRs
- Resolve contradictions
- Publish gold overlays

### Contributed records always start as

```yaml
# Assertions
review_status: draft
confidence: unassessed

# Graph records
authoring_status: draft
distribution_status: restricted_source
```

### Licensing

| Component | License |
|---|---|
| Code | EUPL-1.2 |
| Data (graph records, assertions) | CC-BY-4.0 |
| Schemas and vocabularies | CC0 or Apache-2.0 |
| Contributor agreement | Developer Certificate of Origin (DCO) — not a CLA |

---

## Contradiction Handling

When two assertions make conflicting claims, the CI `check-contradictions` command detects and reports them.

### Contradiction Types

- `direct_value_conflict` — two assertions state different values for the same fact
- `source_tier_conflict` — primary law vs. guidance portal disagree
- `temporal_conflict` — old vs. new source disagree
- `scope_conflict` — overlapping jurisdiction scopes
- `translation_conflict` — translation diverges from source language
- `jurisdiction_conflict` — cross-border rules conflict

### Publication Rules for Contradictions

| Contradiction status | Can publish? |
|---|---|
| `none` | ✅ Yes |
| `resolved` | ✅ Yes |
| `accepted_uncertainty` | ✅ Only for non-high-risk items |
| `suspected` / `in_review` | ❌ No |
| `quarantined` | ❌ No |

**High-risk contradictions always block publication.**

---

## CI Validation Pipeline

Every PR runs these checks:

```bash
pnpm validate               # JSON Schema validation for all YAML files
pnpm lint-ids               # ID grammar and length rules
pnpm check-references       # All _refs point to existing records
pnpm check-anchors          # Assertion text_quotes exist in snapshot HTML
pnpm check-publication-gate # No unapproved assertions in public_open records
pnpm check-contradictions   # Flag overlapping conflicting claims
pnpm test-scenarios         # Scenario regression tests pass
pnpm test                   # Unit tests pass
pnpm typecheck              # TypeScript type checking
```

All must pass for the PR to be mergeable.

---

## Monitoring (Future)

Sources will eventually be monitored for changes:

```
unmonitored → monitored → review_due → source_changed → stale → quarantined
```

When a source page changes, the monitoring system flags assertions linked to that source for re-review. Assertions linked to `quarantined` sources are automatically hidden from public output.
