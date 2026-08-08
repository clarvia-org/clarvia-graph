#!/usr/bin/env bash
# Route Cloud Run traffic to a previous revision (no rebuild).
#
# A human operator MUST run this locally. It never rebuilds or pushes an image.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-fleet-garage-502110-g6}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-lex-email-service}"

if [ "${REGION}" != "europe-west1" ]; then
  echo "ERROR: REGION must be europe-west1 (got '${REGION}')." >&2
  exit 1
fi

if [ -z "${PREVIOUS_REVISION:-}" ]; then
  echo "Listing recent revisions for ${SERVICE_NAME}:"
  gcloud run revisions list \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --service="${SERVICE_NAME}" \
    --format="table(metadata.name,status.conditions[0].status,metadata.creationTimestamp)"
  echo ""
  echo "Set PREVIOUS_REVISION to the known-good revision name, then re-run." >&2
  exit 1
fi

echo "Routing 100% traffic on ${SERVICE_NAME} to revision ${PREVIOUS_REVISION}"

gcloud run services update-traffic "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --to-revisions="${PREVIOUS_REVISION}=100"

echo "Rollback submitted. Verify /health on the service URL before re-enabling processing."
