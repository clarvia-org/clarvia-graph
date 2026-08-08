# Clarvia Graph monorepo map

Public monorepo host: `clarvia-org/clarvia-graph`.

## Layout

| Path | What |
|---|---|
| `graph/`, `schemas/`, `vocab/`, `sources/`, `exports/`, `packages/*` | Consequence graph + `@clarvia/cli` / `@clarvia/generator` |
| `apps/web` | Next.js site (former `workflow-web`) — Coolify/GCE production |
| `lex/` | Legislation dataset + CLI (former `clarvia-org/lex`) |
| `services/lex/` | Lex email Cloud Run service — **public-safe code only** |

## Path disambiguation

- `lex/` — legislation corpus and `lex` CLI
- `services/lex/` — Lex email automation service

## Never commit here

Secrets, SA keys, `.env`, live production prompts, real-user evaluation data, or `runtime-private/` contents. Private ops stay outside this repo (`ops-private` when unarchived; Drive hub meanwhile).

## Common commands

```bash
pnpm install
pnpm validate                 # graph
pnpm export-and-sync-web      # build/exports/web → apps/web/public/data/clarvia/
pnpm web:dev                  # Next.js
pnpm web:build
```

Graph data for the website is **not** pinned via `CLARVIA_GRAPH_VERSION` / GitHub Release download. Sync from the in-repo export (see `scripts/sync-web-export.ts`).

## Sparse checkout (optional)

Agents that only need the site or only the graph:

```bash
git sparse-checkout init --cone
git sparse-checkout set apps/web packages graph schemas vocab exports docs
```

## Sibling repos

`workflow-web` / `lex` remain available for rollback until archived after Coolify soak. `workflow-data` and `ops-private` are already archived and are not imported.
