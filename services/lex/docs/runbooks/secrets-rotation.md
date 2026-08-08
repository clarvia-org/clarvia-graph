# Secrets rotation runbook

Lex secrets live in **Google Secret Manager** and are referenced by Cloud Run at
deploy time. Rotating secrets requires **no code changes**.

## Secret names (fixed)

| Secret Manager name   | Cloud Run env var  |
| --------------------- | ------------------ |
| `lex-openai-api-key`  | `OPENAI_API_KEY`   |
| `lex-hmac-secret`     | `HMAC_SECRET`      |

Never commit secret values. Never add them to `.env.example` or deploy env files.

## Rotate a secret

1. Add a new Secret Manager version:

   ```bash
   gcloud secrets versions add lex-openai-api-key \
     --project=fleet-garage-502110-g6 \
     --data-file=-   # paste value at stdin; do not echo in shell history
   ```

   Repeat for `lex-hmac-secret` when rotating the HMAC secret.

2. Cloud Run references use `:latest` by default in `scripts/deploy-cloud-run.sh`:

   ```text
   OPENAI_API_KEY=lex-openai-api-key:latest
   HMAC_SECRET=lex-hmac-secret:latest
   ```

3. **Redeploy** the same immutable image (no rebuild required) so running
   containers pick up the new secret versions:

   ```bash
   export IMAGE_TAG="<currently deployed tag>"
   ./scripts/deploy-cloud-run.sh
   ```

   Alternatively, update only the service to refresh secret bindings:

   ```bash
   gcloud run services update lex-email-service \
     --project=fleet-garage-502110-g6 \
     --region=europe-west1 \
     --set-secrets="OPENAI_API_KEY=lex-openai-api-key:latest,HMAC_SECRET=lex-hmac-secret:latest"
   ```

4. Smoke-test `/health` and a synthetic internal process path in staging before
   re-enabling public processing.

## Pinning versions

To pin a specific version instead of `:latest`, change the deploy script
reference (for example `lex-openai-api-key:3`) and redeploy. Document the pinned
version in the private operator env file only — never in git.

## HMAC rotation note

Rotating `HMAC_SECRET` changes sender HMAC digests. Rate-limit and allowlist
records keyed by the old digest will not match until the new day boundary or
until records expire. Plan rotations accordingly.
