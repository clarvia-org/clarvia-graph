# Controlled launch runbook (Phase 7)

Manual procedure for moving Lex from **disabled** → **allowlist pilot** → **public**
processing. No GitHub Actions or Terraform. All resources in **`europe-west1`**.

See also:

- [deploy.md](deploy.md) — image build and initial deploy
- [rollback.md](rollback.md) — route traffic to a previous revision
- [monitoring-alerts.md](monitoring-alerts.md) — structured alerts and log policies
- [evaluation-report-template.md](evaluation-report-template.md) — synthetic report shape
- [private-operational-material.md](private-operational-material.md) — where real-user data lives

## 1. Pre-flight

1. Run quality gates locally:

   ```bash
   make check
   ```

2. Confirm Secret Manager secrets exist (names only — never copy values into env files):
   - `lex-openai-api-key`
   - `lex-hmac-secret`

3. Confirm Firestore TTL policy is active for Lex message metadata.

4. Confirm Artifact Registry repository `lex-services` exists in `europe-west1`.

5. Confirm `runtime-private/prompts/lex-v1.txt` is baked into the deploy image or mounted
   at `LEX_PROMPT_PATH=/app/runtime-private/prompts/lex-v1.txt`.

## 2. Deploy with allowlist pilot defaults

Deploy an immutable image tag (see [deploy.md](deploy.md)). Example env for **controlled
pilot** (commented defaults also appear in `deploy/env.production.example.yaml`):

```text
PROCESSING_MODE=allowlist
PROCESSING_ENABLED=true
ALLOWLIST_SENDERS=pilot1@example.com,pilot2@example.com
# or ALLOWLIST_SENDER_HMACS=<comma-separated HMACs>
```

After deploy, processing accepts only allowlisted senders. Everyone else is labelled
`LEX_IGNORED` with status `allowlist_rejected` — no model call.

## 3. Smoke test

1. `GET /health` — expect `status: ok` and version fields only (no secrets).

2. Run one allowlisted synthetic path locally (CI uses 100 synthetic E2E cases in
   `tests/fixtures/pilot/conversations.jsonl` via `pytest tests/evals/test_pilot_e2e.py`).

3. Optionally generate a synthetic evaluation report:

   ```bash
   python scripts/generate-eval-report.py --basename pilot-prelaunch
   ```

   Default output: `tests/evals/reports/` (synthetic only, safe to inspect in CI).

## 4. Pilot suite and launch thresholds

Before promoting to public mode, review synthetic thresholds (blueprint §27.5):

| Threshold | Synthetic CI check |
| --- | --- |
| 100% correct action on anchors | `test_pilot_launch_thresholds_on_anchors` |
| Zero invented contacts/URLs (anchors) | anchor validation in pilot harness |
| Formatting compliance | footer + continuation on all outbound |
| Zero duplicate sends | `test_pilot_zero_duplicate_sends` |
| No PII in logs | logging allow-list tests + alert smoke |

**Real-user pilot notes** (emails, transcripts, scores) belong **only** under
`runtime-private/evals/` — never in `tests/`, `docs/`, or any GitHub repository.

Generate a private report after a live allowlist pilot:

```bash
python scripts/generate-eval-report.py --private --basename pilot-live-YYYYMMDD
```

## 5. Promote to public processing (env update only)

No image rebuild required:

```bash
PROCESSING_MODE=public PROCESSING_ENABLED=true ./scripts/set-processing-mode.sh
```

Windows PowerShell:

```powershell
.\scripts\set-processing-mode.ps1 -ProcessingMode public -ProcessingEnabled true
```

## 6. Kill switch (no redeploy)

Stop all processing immediately:

```bash
PROCESSING_ENABLED=false ./scripts/set-processing-mode.sh
```

Or:

```bash
PROCESSING_MODE=disabled ./scripts/set-processing-mode.sh
```

Both can be combined. Existing Cloud Run revision and image stay unchanged.

## 7. Rollback

If a bad revision is live, follow [rollback.md](rollback.md) to shift traffic to the
previous revision. The kill switch above stops new processing even on a bad revision.

## 8. Where operational material lives

| Material | Location |
| --- | --- |
| Live prompt | `runtime-private/prompts/` (gitignored) |
| Production env overrides | `runtime-private/deploy/` (gitignored) |
| Real-user pilot analysis | `runtime-private/evals/` (gitignored) |
| Synthetic CI fixtures | `tests/fixtures/pilot/` |
| Synthetic CI reports | `tests/evals/reports/` |
