# Clarvia Lex email service (`services/lex`)

> **Monorepo location:** public-safe code lives in [`clarvia-graph`](https://github.com/clarvia-org/clarvia-graph) under `services/lex/`. Legislation data is a separate tree at repo-root `lex/`. See [`docs/MONOREPO.md`](../../docs/MONOREPO.md).
>
> Never commit `runtime-private/` secrets, `.env`, or live prompts.

Lex is a fully automated bereavement and end-of-life information service at
`lex@clarvia.org`. People email a question; Lex replies with an LLM-generated
answer plus an application-composed continuation note and approved footer. No
human is in the loop.

This directory currently implements **through Phase 7**:

- Phase 1: configuration, domain contracts, schema/validation, prompt loader,
  recipient rules, multipart composer, Dockerfile, local deploy scripts
- Phase 2: Gmail inbox polling, deterministic Cloud Tasks, Lex labels,
  Firestore message records, worker leases (memory + GCP adapters)
- Phase 3: MIME parsing, HTML sanitisation, auto/loop detection, recipient
  limits, per-sender rate limiting, and deterministic template replies
- Phase 4: OpenAI Responses API (`gpt-5-mini`), web search, strict JSON schema,
  redaction, runtime envelope, source rendering, bounded retry, synthetic eval suite
- Phase 5: Gmail threading headers, MIME send, base64url encoding, HTML citation
  links, deterministic Message-ID / request-id send recovery, unified outbound path
- Phase 6: circuit breaker, daily usage tracking, TTL metadata, retention worker,
  structured alerts, allowlist mode prep, rollback/deploy runbooks
- Phase 7: controlled launch — 100 synthetic E2E pilot cases (CI), evaluation
  report generator, operational launch runbook, kill-switch scripts (`PROCESSING_MODE`
  / `PROCESSING_ENABLED` env updates without redeploy). **Live allowlist pilot is
  operator-run**; CI proves the harness only.

## Operations runbooks

See `docs/runbooks/`:

- [controlled-launch.md](docs/runbooks/controlled-launch.md) — allowlist pilot → public promotion, kill switch
- [deploy.md](docs/runbooks/deploy.md) — check → build → push → deploy → smoke `/health`
- [rollback.md](docs/runbooks/rollback.md) — route traffic to a previous revision
- [secrets-rotation.md](docs/runbooks/secrets-rotation.md) — rotate Secret Manager versions
- [monitoring-alerts.md](docs/runbooks/monitoring-alerts.md) — log-based alerts
- [evaluation-report-template.md](docs/runbooks/evaluation-report-template.md) — synthetic report shape
- [private-operational-material.md](docs/runbooks/private-operational-material.md)

Secrets are provisioned in Secret Manager by name only (`lex-openai-api-key`,
`lex-hmac-secret`) — never commit values.

## Scope

In scope: the practical and administrative process after a death, and end-of-life
preparation (registration, certificates, funerals, notifications, benefits,
estate administration at an informational level, wills, advance care planning,
palliative/hospice pathways, grief support referrals, and directly related
cross-border issues). Out of scope: general legal/tax/immigration/employment
matters and anything unrelated to bereavement or end of life. See
`runtime-private/prompts/lex-v1.txt` (local-only) for the full system prompt.

## Architecture (Phases 1–2)

- **Cloud Run** service (FastAPI) in **`europe-west1` only**.
- Cloud Scheduler → `/internal/poll` creates one durable task per new message;
  Cloud Tasks → `/internal/process` takes a lease (Phase 2). Parsing/model/send
  arrive in later phases. Both endpoints via OIDC; `--no-allow-unauthenticated`.
- Gmail is the conversation source of truth; Firestore holds operational
  metadata only (no bodies/subjects/addresses).
- Every outgoing email (later) is composed by the application as
  `multipart/alternative` with a fixed three-part order: response body,
  continuation note, footer.
- See `docs/architecture.md` and `docs/adr/` for details.

### Regions and the website

- **All Lex GCP resources use `europe-west1`.** Any other `GCP_REGION` fails
  startup.
- The **Stockholm website infrastructure is separate**. The future website calls
  Lex **over HTTP only** and is never a source-code dependency.

### Repository / deployment model

- **No GitHub repository exists for this service in Phase 1**, and there is no
  CI/CD, no GitHub Actions, and no Terraform.
- Phase 1 uses **local development and manual deployment**.
- The public-safe service directory can later move to **`services/lex/`** or
  **`services/emailer/`** in a public monorepo without code changes.
- The **live prompt, credentials, user data, and real-user evaluation material
  must never be committed to GitHub**. They live only in `runtime-private/`
  (gitignored) or in Secret Manager.

## Local setup

Requires Python 3.12+ (the container uses `python:3.12-slim`).

```bash
python -m venv .venv
# Windows PowerShell:  .venv\Scripts\Activate.ps1
# macOS/Linux:         source .venv/bin/activate
pip install -e ".[dev]"
```

Copy `.env.example` to `.env` for local development. Never put secrets in `.env`.

## Commands

`make` targets (GNU make):

| Target | Action |
|---|---|
| `make setup` | Install the package and dev dependencies |
| `make format` | Apply Ruff formatting and autofixes |
| `make lint` | Ruff lint |
| `make typecheck` | mypy (strict) |
| `make test` | pytest with coverage (fails under 90%) |
| `make check` | format-check + lint + typecheck + test (never deploys) |
| `make docker-build` | Build the container image (rejects `IMAGE_TAG=latest`) |

### Windows / no `make`

GNU `make` is not installed by default on Windows. Run the equivalent commands
directly (PowerShell):

```powershell
python -m ruff format --check app tests
python -m ruff check app tests
python -m mypy
python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=90
```

## Configuration

Strict `pydantic-settings` model in `app/config.py`. Key fields and defaults:

| Setting | Env var | Default |
|---|---|---|
| environment | `ENVIRONMENT` | `development` |
| gcp_project_id | `GCP_PROJECT_ID` | `fleet-garage-502110-g6` |
| gcp_region | `GCP_REGION` | `europe-west1` (only value allowed) |
| lex_mailbox | `LEX_MAILBOX` | `lex@clarvia.org` |
| openai_model | `OPENAI_MODEL` | `gpt-5-mini` |
| max_output_tokens | `MAX_OUTPUT_TOKENS` | `2400` |
| prompt_version | `PROMPT_VERSION` | `lex-v1` |
| prompt_path | `LEX_PROMPT_PATH` | `runtime-private/prompts/lex-v1.txt` |
| schema_version | `SCHEMA_VERSION` | `lex_response_v1` |
| processing_mode | `PROCESSING_MODE` | `disabled` |
| max_visible_recipients | `MAX_VISIBLE_RECIPIENTS` | `10` |
| max_sender_requests_per_day | `MAX_SENDER_REQUESTS_PER_DAY` | `10` |
| max_body_chars | `MAX_BODY_CHARS` | `100000` |
| max_thread_chars | `MAX_THREAD_CHARS` | `120000` |
| log_level | `LOG_LEVEL` | `INFO` |
| global_daily_llm_limit | `GLOBAL_DAILY_LLM_LIMIT` | `500` |
| force_circuit_open | `FORCE_CIRCUIT_OPEN` | `false` |
| allowlist_senders | `ALLOWLIST_SENDERS` | `""` (comma-separated emails, hashed at startup) |
| allowlist_sender_hmacs | `ALLOWLIST_SENDER_HMACS` | `""` |
| retention_trash_gmail | `RETENTION_TRASH_GMAIL` | `false` |

Relative paths (for example the prompt path) resolve from the service directory,
not the caller's working directory. No secrets appear in `.env.example`.

### Model name

`OPENAI_MODEL` is `gpt-5-mini`, an intentionally **unpinned model family name**
(not a dated snapshot).

## External integrations

Gmail, Firestore, and Cloud Tasks use GCP adapters when
``ADAPTER_BACKEND=gcp``. OpenAI uses the Responses API when ``ADAPTER_BACKEND=gcp``
(``OPENAI_API_KEY`` from Secret Manager at runtime). Local/tests use in-memory
adapters and ``FakeLlmAdapter``; no live OpenAI in CI.

## Health check

`GET /health` returns status and version identifiers only (never the prompt
content, configuration, or secrets):

```json
{"status": "ok", "version": "0.1.0", "prompt_version": "lex-v1", "schema_version": "lex_response_v1"}
```

## Tests and container

```bash
make check          # or the PowerShell commands above
make docker-build   # linux/amd64 image; then verify:
docker run --rm -p 8080:8080 <image>   # GET http://127.0.0.1:8080/health
```

## Build, push, deploy scripts

`scripts/build-image.sh`, `scripts/push-image.sh`,
`scripts/deploy-cloud-run.sh`, and `scripts/rollback-cloud-run.sh` are **operator-run, manual** templates. They
default to `PROJECT_ID=fleet-garage-502110-g6`, `REGION=europe-west1`,
`AR_REPOSITORY=lex-services`, `SERVICE_NAME=lex-email-service`, reject
`IMAGE_TAG=latest`, build `linux/amd64`, deploy with the runtime service account
`lex-email@fleet-garage-502110-g6.iam.gserviceaccount.com` and
`--no-allow-unauthenticated`, and obtain secrets through Secret Manager
references only. They are **not executed** by this task and must not run
automatically from another tool. See `deploy/README.md`.
