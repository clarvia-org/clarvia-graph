#!/usr/bin/env bash
# Update Lex Cloud Run processing switches without redeploying the image.
#
# Human-operated only. Defaults to europe-west1. Never prints secret values.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-fleet-garage-502110-g6}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-lex-email-service}"

if [ "${REGION}" != "europe-west1" ]; then
  echo "ERROR: REGION must be europe-west1 (got '${REGION}')." >&2
  exit 1
fi

PROCESSING_MODE="${PROCESSING_MODE:-}"
PROCESSING_ENABLED="${PROCESSING_ENABLED:-}"

if [ -z "${PROCESSING_MODE}" ] && [ -z "${PROCESSING_ENABLED}" ]; then
  echo "Usage: PROCESSING_MODE=allowlist PROCESSING_ENABLED=true $0" >&2
  echo "  PROCESSING_MODE: disabled | allowlist | public" >&2
  echo "  PROCESSING_ENABLED: true | false" >&2
  exit 1
fi

ENV_VARS=()
if [ -n "${PROCESSING_MODE}" ]; then
  ENV_VARS+=("PROCESSING_MODE=${PROCESSING_MODE}")
fi
if [ -n "${PROCESSING_ENABLED}" ]; then
  ENV_VARS+=("PROCESSING_ENABLED=${PROCESSING_ENABLED}")
fi

JOINED=$(IFS=,; echo "${ENV_VARS[*]}")

echo "Updating ${SERVICE_NAME} env in ${REGION} (no image rebuild)"
gcloud run services update "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --update-env-vars="${JOINED}"

echo "Done. Verify with: gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(spec.template.spec.containers[0].env)'"
