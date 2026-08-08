# Stage 2 — Luxembourg coverage expansion

**Status:** inventory complete (catalog + batch ID manifests established)  
**Authority:** `BLUEPRINT.md` Stage 2  
**Prerequisite:** Stage 1B complete (`lu/code-civil` + nine approved laws)

## Goal

Expand from the Stage 1B ten-law slice toward current consolidated Luxembourg legislation available via Casemates, within blueprint size and format limits.

Coverage stays **partial** until the maintainer declares it complete in `countries/lu/README.md`.

## Control plane

| Layer | Location | Role |
|---|---|---|
| GitHub Project | org project **lex — LU Stage 2** | Status across agent sessions |
| Milestone | `Stage 2 LU corpus` on `clarvia-org/lex` | Progress grouping |
| Issues | One issue per batch (+ inventory) | Session scope + acceptance |
| ID manifests | `countries/lu/batches/*.txt` | Frozen ingest lists (source of truth) |

Agents execute **one Ready issue at a time**. Do not invent domain scopes from the roadmap table.

## Hard rules

1. Casemates only (SPARQL GET + filestore GET). No Legilux SPA scrape.
2. No OCR / scanned PDF-only sources.
3. Every PR: `uv run pytest`, `uv run lex check`, `uv run python scripts/repo_size_report.py`.
4. Second unchanged update for touched IDs → clean `git status`.
5. Packed repo hard stop: **900 MiB** (blueprint). Stop and escalate if a batch would breach it.
6. Single retained source file ≤ **50 MiB**.
7. Merge one batch before starting the next unless the maintainer explicitly allows parallel drafts.

## Sequence & Inventory Counts

| Order | GitHub issue | Theme | Manifest | Count |
|---|---|---|---|---|
| 0 | [#4](https://github.com/clarvia-org/lex/issues/4) | Inventory + classification | `catalog.jsonl` + `00-inventory-notes.md` | 1,334 unique (128 pdf-skip, 9 stage-1b in catalog; + `loi-2024-07-31-a339` JO outside Consolidation) |
| 1 | [#5](https://github.com/clarvia-org/lex/issues/5) | Remaining official codes (XML) | `04-codes.txt` | 4 |
| 2 | [#6](https://github.com/clarvia-org/lex/issues/6) | Constitutional & state admin | `05-state-admin.txt` | 216 |
| 3 | [#7](https://github.com/clarvia-org/lex/issues/7) | Civil, family, property, housing | `06-civil-family.txt` | 43 |
| 4 | [#8](https://github.com/clarvia-org/lex/issues/8) | Labor, employment, social security | `07-labor-social.txt` | 69 |
| 5 | [#9](https://github.com/clarvia-org/lex/issues/9) | Commercial, corporate, finance | `08-commercial-finance.txt` | 105 |
| 6 | [#10](https://github.com/clarvia-org/lex/issues/10) | Tax, customs, public finance | `09-tax-finance.txt` | 59 |
| 7 | [#11](https://github.com/clarvia-org/lex/issues/11) | Health, welfare, family support | `10-health-welfare.txt` | 46 |
| 8 | [#12](https://github.com/clarvia-org/lex/issues/12) | Environment, agriculture, energy | `11-environment-energy.txt` | 75 |
| 9 | [#13](https://github.com/clarvia-org/lex/issues/13) | Education, research, culture | `12-education-culture.txt` | 83 |
| 10 | [#14](https://github.com/clarvia-org/lex/issues/14) | Transport & infrastructure | `13-transport.txt` | 27 |
| 11 | [#15](https://github.com/clarvia-org/lex/issues/15) | Internal security & data protection | `14-security-data.txt` | 18 |
| 12 | [#16](https://github.com/clarvia-org/lex/issues/16) | Final tail / remaining instruments | `15-tail.txt` | 452 |

**Ingestible Stage 2 total:** 1,197 IDs (unique across manifests). See `batches/00-inventory-notes.md`.

Tracking: [Project — lex LU Stage 2](https://github.com/orgs/clarvia-org/projects/4) · [Milestone](https://github.com/clarvia-org/lex/milestone/1)

## Batch ID manifests

After inventory merges:

```text
countries/lu/batches/
  README.md
  00-inventory-notes.md      # skip reasons, PDF counts, size budget
  04-codes.txt               # one stable ID per line
  05-state-admin.txt
  …
```

Format of `NN-*.txt`:

```text
# comment lines allowed
lu/code-sante
lu/code-route
```

Ingestion command (batch manifests):

```bash
uv run lex update lu --from-file countries/lu/batches/04-codes.txt
```

`--id` and `--from-file` are mutually exclusive. Do not rely on free-text domain prompts.

## Inventory query rule — latest consolidation only

Casemates often returns many historical consolidations for one instrument
(`/consolide/20230101`, `/consolide/20240101`, …).

`scripts/build_lu_inventory.py` (and any SPARQL used for the catalog):

1. Groups by durable legal-instrument identity (complex work / base ELI without consolidation date).
2. Keeps **one** row per instrument: the latest consolidation (`ORDER BY DESC(?consolidationDate)`).
3. Never emits duplicate historical consolidations as separate Stage 2 IDs.

## Agent session template

```text
Task: Execute clarvia-org/lex Stage 2 batch from GitHub issue #<N>.

1. Open workspace C:\Users\tommi\repos\clarvia-org\lex on updated main.
2. Read countries/lu/STAGE_2.md and the issue body.
3. Branch batch-<nn>-<slug> from main.
4. uv run lex update lu --from-file countries/lu/batches/<file>.txt
5. pytest + lex check + repo_size_report.py
6. Second --from-file update → empty porcelain
7. Commit, push, open PR; link the issue; move Project card to Review.
```

## Out of scope for Stage 2 ordinary PRs

Anything that needs a blueprint amendment: new source systems, new frontmatter fields, historical versions, amendment graphs, hosted services.
