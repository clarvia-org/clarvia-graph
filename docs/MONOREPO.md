# Clarvia Graph monorepo

Public monorepo: [`clarvia-org/clarvia-graph`](https://github.com/clarvia-org/clarvia-graph).

This document is the map for humans, grant reviewers, and agents. The consequence graph remains the primary Digital Public Good artifact; sibling products live in clearly named paths with their own licenses and deploy targets.

## Layout

| Path | What | License (authored) | How it runs |
|---|---|---|---|
| `graph/`, `schemas/`, `vocab/`, `sources/`, `packages/*` | Consequence graph + `@clarvia/cli` / `@clarvia/generator` | EUPL-1.2 / CC-BY-4.0 | Git + CI exports |
| `apps/web` | Next.js website (clarvia.org) | Apache-2.0 | Coolify / GCE (`Base Directory: apps/web`) |
| `lex/` | Legislation dataset + CLI | Apache-2.0 (+ source-specific corpus rights) | Git + local `uv` CLI |
| `services/lex/` | Lex email service (public-safe only) | Apache-2.0 | Cloud Run, `europe-west1` |

## Path disambiguation

- `lex/` — legislation corpus and `lex` CLI (formerly `clarvia-org/lex`)
- `services/lex/` — Lex **email** automation (Gmail → Cloud Run)

## CI (path-filtered)

| Workflow | Paths |
|---|---|
| `ci.yml` | Graph / packages (ignores pure web/lex/email-only changes) |
| `validate-web.yml` | `apps/web/**` |
| `validate-lex.yml` | `lex/**` |
| `validate-lex-email.yml` | `services/lex/**` |
| `validate-n8n.yml` | `apps/web/automation/**` |

## Deploy boundaries

| Component | Deploy system | Notes |
|---|---|---|
| Website | Coolify → GCE | Clones whole repo; builds **only** `apps/web` |
| Lex email | Artifact Registry + Cloud Run | Build context `services/lex/`; prompts/secrets never in git |
| Graph / legislation | GitHub Releases / clone | No always-on API required for the open baseline |

Coolify checking out the full monorepo is expected. That does **not** mean Coolify runs Lex email or the legislation CLI.

## Never commit here

Secrets, SA keys, `.env`, live production prompts, real-user evaluation data, or `runtime-private/` contents (except the public `README.md` placeholder under `services/lex/runtime-private/`).

## Common commands

```bash
pnpm install
pnpm validate                 # graph
pnpm export-and-sync-web      # build/exports/web → apps/web/public/data/clarvia/
pnpm web:dev                  # Next.js
pnpm web:build

cd lex && uv sync --frozen && uv run lex check
cd services/lex && uv sync --extra dev && uv run pytest
```

## Sparse checkout (optional)

```bash
git sparse-checkout init --cone
git sparse-checkout set apps/web packages graph schemas vocab exports docs
```

## Former sibling repositories

| Former repo | Status |
|---|---|
| `workflow-web` | Merged into `apps/web` — keep until soak, then archive |
| `clarvia-org/lex` | Merged into `lex/` — keep until soak, then archive |
| `workflow-data` | **Archived** — superseded by this graph |
| `ops-private` | **Archived** — stays out of the public monorepo; unarchive later if needed |

Org profile and community templates remain in [`clarvia-org/.github`](https://github.com/clarvia-org/.github).
