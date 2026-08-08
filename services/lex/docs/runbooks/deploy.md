# Deploy runbook (Phase 6)

Manual deployment for the Lex email service in **`europe-west1` only**. No GitHub
Actions, Workload Identity Federation, or Terraform.

## Prerequisites

- Authenticated `gcloud` with the `clarvia` configuration active
- Docker with `buildx` (linux/amd64)
- Approved private runtime material present locally:
  - `runtime-private/prompts/lex-v1.txt`
  - Optional operator file: `runtime-private/deploy/env.production.yaml`
- Secret Manager secrets already provisioned (names only):
  - `lex-openai-api-key` → Cloud Run env `OPENAI_API_KEY`
  - `lex-hmac-secret` → Cloud Run env `HMAC_SECRET`

## Flow

1. **Check** — run quality gates locally:

   ```bash
   make check
   ```

   On Windows PowerShell, run the equivalent `ruff`, `mypy`, and `pytest` commands
   from `README.md`.

2. **Build** — immutable image tag (never `latest`):

   ```bash
   export IMAGE_TAG="$(date -u +%Y%m%d-%H%M%S)"
   ./scripts/build-image.sh
   ```

3. **Push**:

   ```bash
   export IMAGE_TAG="<same tag as build>"
   ./scripts/push-image.sh
   ```

4. **Deploy**:

   ```bash
   export IMAGE_TAG="<same tag as build>"
   ./scripts/deploy-cloud-run.sh
   ```

   The deploy script sets `ADAPTER_BACKEND=gcp`, maps Secret Manager references
   via `--set-secrets` only, and keeps `PROCESSING_MODE=disabled` until smoke
   tests pass.

5. **Smoke test** — authenticated `GET /health` (Cloud Run IAM OIDC or
   `X-Lex-Internal-Token` when configured):

   ```bash
   curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
     "<service-url>/health"
   ```

   Expect `status=ok` and version identifiers only — no secrets or prompt content.

## Firestore TTL (operator step)

After first deploy, enable a Firestore TTL policy on the `expires_at` field for:

- `environments/{env}/messages`
- `environments/{env}/rate_limits`
- `environments/{env}/daily_usage`

The application sets `expires_at` on every record; TTL deletion is enforced by
Firestore once the policy is active.

## Related runbooks

- [Rollback](rollback.md)
- [Secrets rotation](secrets-rotation.md)
- [Monitoring alerts](monitoring-alerts.md)
- [Private operational material](private-operational-material.md)
