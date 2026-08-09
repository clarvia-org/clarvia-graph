# Clarvia website (`apps/web`)

[![Web CI](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-web.yml/badge.svg)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-web.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

Public Next.js site for [clarvia.org](https://clarvia.org) — the thin web layer that turns Clarvia Graph exports into multilingual bereavement checklists.

> Part of the [`clarvia-graph`](https://github.com/clarvia-org/clarvia-graph) monorepo. See [`docs/MONOREPO.md`](../../docs/MONOREPO.md).

[![Try the alpha checklist](https://img.shields.io/badge/🧪_Try_the_alpha_checklist-clarvia.org-blue?style=for-the-badge)](https://clarvia.org/en/checklist)

## Role

- Render public checklist and information pages (EN / FR / DE)
- Show source citations and verification status from graph exports
- Host Turnstile-protected feedback, subscribe, and contact forms
- Stay thin: **workflow facts live in the graph**, not duplicated here

Clarvia provides administrative guidance based on official sources. It does **not** provide individualized legal advice.

## Data source

Checklist JSON is produced by the graph toolchain and synced into `public/data/clarvia/`:

```bash
# from monorepo root
pnpm export-and-sync-web
```

Production (Coolify) builds this package with Base Directory `apps/web`. Synced export files are committed so the site can build without re-running the full graph toolchain on the host.

## Develop

Requires **Node 22+** and **pnpm 9.x** (see `packageManager` in this `package.json`).

From the **monorepo root** (preferred):

```bash
pnpm install
pnpm web:dev
pnpm web:build
pnpm web:lint
pnpm web:test
```

Or from this directory after a root install:

```bash
pnpm dev
pnpm build
```

## Deploy

- **Host:** Coolify on GCE
- **Base directory:** `apps/web`
- **Runtime:** Next.js on port 3000
- **Not deployed from this path:** `lex/` legislation corpus, `services/lex/` (Cloud Run)

## Out of scope

Personal case intake, user accounts, case management, unpublished reviewer notes, grant documents, and secrets.

## Contributing

Issues and PRs go to [`clarvia-org/clarvia-graph`](https://github.com/clarvia-org/clarvia-graph). See the root [CONTRIBUTING.md](../../CONTRIBUTING.md) and org [community guide](https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md).

## License

Code: [Apache-2.0](LICENSE). Graph-derived content may be under CC-BY-4.0 as published by the data layer.
