# First-hour contributor guide

> New here? This page gets you from "just cloned" to "first PR open" in under an hour.
> Pick the path that matches your skills and interests — you only need **one**.

---

## Which path is right for me?

| Path | Skills needed | Time | Issue to reference |
|---|---|---|---|
| [Path 1 — Source capture (no-code)](#path-1--source-capture-no-code) | Browser only | ~10 min | [#46](https://github.com/clarvia-org/clarvia-graph/issues/46) |
| [Path 2 — Website (`apps/web`)](#path-2--website-appsweb) | JS / React / Next.js | ~30–60 min | [#241](https://github.com/clarvia-org/clarvia-graph/issues/241) |
| [Path 3 — Graph YAML drafts](#path-3--graph-yaml-drafts) | YAML + attention to detail | ~30 min | [#48](https://github.com/clarvia-org/clarvia-graph/issues/48) |

All paths share the same [fork → branch → PR](#fork-branch-pr-the-common-workflow) flow at the end.

---

## Path 1 — Source capture (no-code)

Clarvia's checklist items must each link to an official government source. Your job is to
save those pages before they change.

**Issue:** [#46 — Save web pages from Luxembourg government sites](https://github.com/clarvia-org/clarvia-graph/issues/46)

### What you'll do

1. Pick an **unclaimed URL** from the list in issue [#46](https://github.com/clarvia-org/clarvia-graph/issues/46) and comment to claim it.
2. Open the URL in your browser.
3. Save the page: **File → Save As → "Webpage, Complete"** (or "Web Page, HTML Only").
4. Create a small YAML sidecar file alongside the HTML.
5. Submit a PR.

### YAML sidecar format

Name the YAML file identically to the HTML file but with a `.yml` extension
(e.g. `declaration-deces_fr.html` → `declaration-deces_fr.yml`):

```yaml
url: "https://guichet.public.lu/fr/citoyens/sante/fin-vie/deces/declaration-deces.html"
captured_at: "2026-06-05T18:37:16Z"   # ISO 8601, use UTC
capture_method: manual_download
captured_by: contributor.<your_github_username>
language: fr                           # fr / de / en
page_title: "Page title as shown in your browser tab"
```

### File naming

Use the pattern `<slug>_<language>.html` and `<slug>_<language>.yml`:

```
declaration-deces_fr.html
declaration-deces_fr.yml
declaration-deces_de.html   # optional — swap /fr/ → /de/ in the URL
declaration-deces_de.yml
```

### Where to put the files

```
sources/snapshots/html/lu/<origin>/<slug>/
```

**Example** for the Guichet.lu death-declaration page:

```
sources/snapshots/html/lu/guichet_lu/declaration-deces/
├── declaration-deces_fr.html
├── declaration-deces_fr.yml
├── declaration-deces_de.html   (optional)
└── declaration-deces_de.yml    (optional)
```

Use the closest matching `<origin>` slug (e.g. `guichet_lu`, `legilux_lu`, `cnap_lu`).
Check `sources/snapshots/html/lu/` for existing slugs before creating a new one.

### CLI shortcut (if you have Node.js)

```bash
pnpm run capture <url>
```

This handles file naming and hashing automatically.

---

## Path 2 — Website (`apps/web`)

The public site at [clarvia.org](https://clarvia.org) is a Next.js app. The most-wanted
contributions are **accessibility improvements** and **i18n copy fixes** — no graph knowledge needed.

**Starter issue:** [#241 — Keyboard + screen-reader audit](https://github.com/clarvia-org/clarvia-graph/issues/241)

### Prerequisites

- **Node 22+** — check with `node -v`
- **pnpm 9.x** — install with `npm i -g pnpm` if missing

### Sparse checkout (optional — downloads only `apps/web` and docs)

```bash
git clone --filter=blob:none --sparse https://github.com/<your-fork>/clarvia-graph.git
cd clarvia-graph
git sparse-checkout init --cone
git sparse-checkout set docs packages graph schemas vocab exports apps/web
```

A full clone works fine if you prefer it.

### Local dev setup

Run all commands from the **monorepo root**:

```bash
pnpm install        # install all workspace dependencies
pnpm web:dev        # start Next.js dev server at http://localhost:3000
```

### Before you open a PR

```bash
pnpm web:lint       # ESLint — must pass
pnpm web:test       # unit/component tests — must pass
pnpm web:build      # production build — must succeed
```

### Where things live

| What | Path |
|---|---|
| Pages and components | `apps/web/` |
| Translation strings | `translations/en/`, `translations/fr/`, `translations/de/` |
| Data fed to the site | `apps/web/public/data/clarvia/` (generated — do not edit by hand) |

> **Never duplicate checklist logic here.** Workflow facts live in the graph
> (`graph/`, `sources/`). The website is intentionally thin.

---

## Path 3 — Graph YAML drafts

The consequence graph captures legal facts (tasks, deadlines, conditions) as structured YAML.
As an external contributor you can **draft** new records; a maintainer will review them before
they are approved.

**Issue:** [#48 — Create assertion batches from captured snapshots](https://github.com/clarvia-org/clarvia-graph/issues/48)

### Mandatory status fields

Every record you create **must** start with `draft` status.  
CI will **reject** PRs that use `approved`.

**Source assertions** (`sources/assertions/`):

```yaml
review_status: draft
confidence: unassessed
```

**Graph records** (consequences, task templates, etc. under `graph/`):

```yaml
authoring_status: draft
```

### What a consequence record looks like

```yaml
id: consequence.lu.bereavement.civil.declare_death
schema_version: "0.1.0"
title: Declare the death at the civil registry
description: >
  The death must be declared at the civil registry of the commune where it
  occurred within 24 hours.
consequence_type: administrative_step
jurisdiction: LU
life_event: bereavement
domain: civil
trigger:
  condition_refs: []
task_template_refs:
  - task_template.lu.bereavement.civil.declare_death
source_assertion_refs:
  - assertion.guichet_lu.declaration_deces.must_be_declared_within_24h
authoring_status: draft   # ← always draft for volunteer contributions
```

See `graph/consequences/bereavement/lu/` for real examples.

### Quality checks before your PR

```bash
pnpm validate       # validates all YAML against schemas
pnpm typecheck      # TypeScript type check
pnpm lint           # ESLint
pnpm test           # unit tests
```

### What you must NOT do as an external contributor

| ❌ Forbidden | Why |
|---|---|
| Set `review_status: approved` | Legal sign-off requires a maintainer |
| Set `authoring_status: approved` | Same — CI will block the PR |
| Commit secrets, `.env` files, or live Lex prompts | Security policy |
| Resolve contradictions between sources | Requires editorial authority |
| Merge PRs to `main` | Maintainer-only |

---

## Fork → Branch → PR: the common workflow

These steps apply to **all three paths**.

### 1. Fork the repository

Click **Fork** on [github.com/clarvia-org/clarvia-graph](https://github.com/clarvia-org/clarvia-graph).

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/clarvia-graph.git
cd clarvia-graph
```

### 3. Create a descriptive branch

```bash
# Path 1 example
git checkout -b feat/source-capture-legilux-succession

# Path 2 example
git checkout -b fix/web-keyboard-navigation-checklist

# Path 3 example
git checkout -b feat/graph-draft-lu-declare-death
```

### 4. Make your changes

Follow the relevant path guide above.

### 5. Commit with DCO sign-off

```bash
git add .
git commit -s -m "feat: capture legilux succession snapshot — refs #46"
#                ^ -s adds the required Signed-off-by line
```

The `-s` flag appends:

```
Signed-off-by: Your Name <you@example.com>
```

This is required by our [DCO agreement](https://developercertificate.org/).
Make sure your `git config user.name` and `git config user.email` are set.

### 6. Push and open a Pull Request

```bash
git push origin <your-branch-name>
```

Then go to your fork on GitHub and click **"Compare & pull request"**.

In the PR description:
- Reference the issue you're closing: `Closes #46` (or `Refs #46` if partial)
- Briefly describe what you captured / changed and why

### 7. Wait for review

A maintainer will review your PR. You may be asked to adjust status fields or
add missing metadata. That's normal — just push updates to the same branch.

---

## Signing up for a volunteer sprint team

If you found this project through [For Good First Issue](https://forgoodfirstissue.github.com/)
or want to contribute as a team:

1. Read this guide and [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Browse [good first issues](https://github.com/clarvia-org/clarvia-graph/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
3. Comment on [#246 — Volunteer sprint](https://github.com/clarvia-org/clarvia-graph/issues/246) with:
   - Team name
   - Roles (dev / design / PM / other)
   - Availability window
   - Which issue(s) you want to tackle
4. Or open a [Discussion](https://github.com/clarvia-org/clarvia-graph/discussions) with questions

---

## Questions?

- **GitHub Discussions** — [github.com/clarvia-org/clarvia-graph/discussions](https://github.com/clarvia-org/clarvia-graph/discussions)
- **Issue comments** — reply directly on the issue you're working on
- **Full contributing reference** — [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Monorepo layout** — [docs/MONOREPO.md](MONOREPO.md)
