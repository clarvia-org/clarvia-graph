# Clarvia Lex email service (`services/lex`)

[![Lex email CI](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-lex-email.yml/badge.svg)](https://github.com/clarvia-org/clarvia-graph/actions/workflows/validate-lex-email.yml)

Automated bereavement and end-of-life information service for `lex@clarvia.org`. People email a question; Lex replies with an LLM-generated answer plus an application-composed continuation note and approved footer. Production personal-data handling is described in Clarvia’s [Privacy & Cookie Policy](https://clarvia.org/en/privacy).

> **Monorepo path:** [`services/lex/`](https://github.com/clarvia-org/clarvia-graph/tree/main/services/lex) inside [`clarvia-graph`](https://github.com/clarvia-org/clarvia-graph).  
> **Not this package:** legislation data lives at repo-root [`lex/`](../../lex/).  
> See [`docs/MONOREPO.md`](../../docs/MONOREPO.md).  
> **Never commit** `runtime-private/` secrets, `.env`, or live prompts.

## Status

Implements through **Phase 7** (synthetic E2E pilot harness in CI; live allowlist pilot is operator-run):

- Phases 1–2: config, domain contracts, Gmail poll / Cloud Tasks / Firestore leases
- Phases 3–5: MIME gates, model pipeline, outbound send recovery
- Phases 6–7: circuit breaker, retention, controlled-launch runbooks

## Deploy

- **Runtime:** Cloud Run in **`europe-west1` only**
- **Build context:** this directory (`services/lex/`)
- **Not** deployed by Coolify with the website
- Secrets via Secret Manager names only (`lex-openai-api-key`, `lex-hmac-secret`)

## Operations runbooks

See `docs/runbooks/`:

- [controlled-launch.md](docs/runbooks/controlled-launch.md) — allowlist pilot → public promotion, kill switch
- [deploy.md](docs/runbooks/deploy.md) — check → build → push → deploy → smoke `/health`
- [rollback.md](docs/runbooks/rollback.md) — route traffic to a previous revision
- [secrets-rotation.md](docs/runbooks/secrets-rotation.md) — rotate Secret Manager versions
- [monitoring-alerts.md](docs/runbooks/monitoring-alerts.md) — log-based alerts
- [evaluation-report-template.md](docs/runbooks/evaluation-report-template.md) — synthetic report shape
- [private-operational-material.md](docs/runbooks/private-operational-material.md)

## Scope

In scope: practical and administrative process after a death, and end-of-life preparation (registration, certificates, funerals, notifications, benefits, estate administration at an informational level, wills, advance care planning, palliative/hospice pathways, grief support referrals, and directly related cross-border issues). Out of scope: general legal/tax/immigration/employment matters unrelated to bereavement or end of life. Live system prompts stay in local `runtime-private/` only.

## Architecture

- Cloud Run (FastAPI) · Cloud Scheduler → `/internal/poll` · Cloud Tasks → `/internal/process`
- Gmail is conversation source of truth; Firestore holds operational metadata only (no bodies/subjects/addresses)
- Outbound mail is application-composed `multipart/alternative` (body → continuation → footer)
- Generation: one search-enabled Responses API call (`lex-v1` / `lex_response_v1`); application strips off-search URLs (ADR 0007)
- Details: `docs/architecture.md` and `docs/adr/`

### Public / private boundary

- **Public-safe in git:** `app/`, `tests/`, `docs/`, deploy scripts/templates, `Dockerfile`, `Makefile`, `pyproject.toml`
- **Never in git:** live prompts, credentials, `.env`, real-user evals, production operator env files

## Local setup

Requires Python 3.12+.

```bash
git clone https://github.com/clarvia-org/clarvia-graph.git
cd clarvia-graph/services/lex
uv sync --extra dev
# or: python -m venv .venv && pip install -e ".[dev]"
cp .env.example .env   # no secrets in .env for shared machines
uv run pytest
```

## License

Public-safe code in this directory: Apache-2.0.
