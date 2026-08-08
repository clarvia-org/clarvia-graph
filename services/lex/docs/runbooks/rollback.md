# Rollback runbook

Rollback means routing Cloud Run traffic to a **previous revision**. It does not
rebuild or push a new image.

## When to rollback

- Regression in processing, sending, or health checks after a deploy
- Unexpected alert volume after a configuration change
- Need to restore a known-good revision quickly

## Steps

1. List revisions:

   ```bash
   export PROJECT_ID=fleet-garage-502110-g6
   export REGION=europe-west1
   export SERVICE_NAME=lex-email-service

   gcloud run revisions list \
     --project="${PROJECT_ID}" \
     --region="${REGION}" \
     --service="${SERVICE_NAME}"
   ```

2. Identify the last known-good revision name (for example
   `lex-email-service-00042-abc`).

3. Route all traffic to that revision:

   ```bash
   export PREVIOUS_REVISION="lex-email-service-00042-abc"
   ./scripts/rollback-cloud-run.sh
   ```

   Or run the `gcloud run services update-traffic` command directly as documented
   in the script.

4. Verify:

   ```bash
   gcloud run services describe "${SERVICE_NAME}" \
     --project="${PROJECT_ID}" \
     --region="${REGION}" \
     --format="yaml(status.traffic)"
   ```

5. Smoke-test `/health` with authentication.

6. If processing was enabled before rollback, consider setting
   `PROCESSING_MODE=disabled` on the rolled-back revision via env update until
   validation completes.

## What rollback does not do

- Does not rotate secrets
- Does not change Firestore data
- Does not delete the bad revision (it remains available for investigation)
