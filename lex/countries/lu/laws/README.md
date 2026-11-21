# Luxembourg Statutory Pilot Corpus (`lu/laws/`)

When populated locally, this directory holds the normalized **1,207-instrument Luxembourg legislation pilot corpus** (`current.md` normalized Markdown with YAML frontmatter + byte-identical official `source.xml` / `source.html` files, ~323 MiB uncompressed; Stage 1B + Stage 2 batches `04-codes` through `15-tail`).

- **Publisher:** Service central de législation, Luxembourg (Legilux Casemates open-data layer)
- **Source licence:** CC-BY-4.0 (as recorded in [`../source.yml`](../source.yml) and per-law frontmatter)

## Why the corpus files are archived offline

The 1,207 normalized law payloads are archived offline rather than tracked directly in Git so this public monorepo remains fast and lightweight while active development focuses on the global guidance library, Ask Clarvia, and the consequence graph. Multi-country legislation corpus expansion will resume as a dedicated funded phase.

## Engine, schemas, and reproducibility

The `lex` CLI (`lex/src/lex/`), schemas (`lex/schemas/`), fidelity checker, Luxembourg Casemates adapter ([`../adapter.py`](../adapter.py)), Stage 2 batch manifests ([`../batches/`](../batches/)), test fixtures ([`../fixtures/`](../fixtures/)), and test suite remain live in this repository.

To regenerate one law or the full Luxembourg catalog locally from official Legilux Casemates endpoints:

```bash
cd lex
uv sync --frozen
uv run lex update lu --id lu/code-civil
# Or regenerate the full Stage 1B + Stage 2 catalog:
uv run lex update lu
```
