# workflow-web

**Clarvia helps grieving families navigate the mountain of paperwork after losing a loved one.** This repository powers the public website that makes that guidance accessible, clear, and trustworthy.

🌐 [clarvia.org](https://clarvia.org) · 📋 [Good first issues](https://github.com/clarvia-org/workflow-web/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) · 📖 [How to contribute](https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md)

---

## How to help in under 30 minutes

| Task | Time | Skills needed |
|---|---|---|
| [Add ARIA labels for screen readers](https://github.com/clarvia-org/workflow-web/issues/10) | ~30 min | Basic HTML/React |
| [Add GitHub link to website footer](https://github.com/clarvia-org/workflow-web/issues/11) | ~20 min | Basic React/CSS |
| [Create a 'Contribute' page](https://github.com/clarvia-org/workflow-web/issues/12) | ~45 min | React/Next.js |

👉 **Browse all [good first issues](https://github.com/clarvia-org/workflow-web/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** to find something that fits your skills.

---

Static web layer for publishing Clarvia workflows, checklists, and generated API views.

The web layer should remain thin.

Workflow facts, source metadata, deadlines, conditions, and review status should come from [`workflow-data`](https://github.com/clarvia-org/workflow-data), not be duplicated manually in this repository.

---

## Project scope

Clarvia provides administrative guidance based on official sources.

It does not provide individualized legal advice.

The website exists to make workflow data understandable, accessible, and trustworthy for public use.

The first public service is being built and validated for Luxembourg. The website should present that first service clearly while keeping the architecture ready for multilingual, cross-border, and future European workflow outputs.

---

## Responsibilities of this repository

This repository is responsible for:

- rendering public checklist pages,
- displaying source citations,
- displaying last-verified dates,
- presenting workflow status clearly,
- supporting accessibility,
- generating lightweight public API views where appropriate,
- presenting future heritage-folder pages clearly and safely,
- and making correction paths visible.

---

## Not in scope

This repository should not contain:

- manually duplicated workflow facts,
- personal bereavement case intake,
- user accounts,
- case-management features,
- personalized legal advice,
- unpublished reviewer notes,
- grant documents,
- partner correspondence,
- or operationally sensitive material,
- storing heritage-folder personal content.

---

## Data source

Published workflow content should be generated from structured data maintained in:

[`clarvia-org/workflow-data`](https://github.com/clarvia-org/workflow-data)

If a web page needs administrative content, first check whether that content belongs in `workflow-data`.

---

## Current status

This repository powers the live website at [clarvia.org](https://clarvia.org).

Current pages:

- Trilingual landing page (English, French, German),
- Language-aware root redirect,
- Dynamic sitemap with hreflang alternates,
- Turnstile-protected feedback, subscribe, and contact forms.

---

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Contributing

Contributions are welcome for:

- frontend implementation,
- accessibility,
- documentation,
- static generation,
- visual clarity,
- performance,
- validation integration,
- and generated API views.

Do not submit sensitive personal information.

See [CONTRIBUTING.md](https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md) for details.

## License

Unless otherwise specified, code and tooling in this repository are licensed under [Apache License 2.0](LICENSE).

Content generated from workflow data may be licensed separately under Creative Commons Attribution 4.0 International.
