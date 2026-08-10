#!/usr/bin/env bash
# Deploy the Lex email service to Cloud Run (europe-west1).
#
# A human operator MUST run this locally. It must not be invoked automatically
# from another tool. It never prints secret values and never creates or uses a
# service-account JSON key; secrets come from Secret Manager references only.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-fleet-garage-502110-g6}"
REGION="${REGION:-europe-west1}"
AR_REPOSITORY="${AR_REPOSITORY:-lex-services}"
SERVICE_NAME="${SERVICE_NAME:-lex-email-service}"
RUNTIME_SERVICE_ACCOUNT="${RUNTIME_SERVICE_ACCOUNT:-lex-email@fleet-garage-502110-g6.iam.gserviceaccount.com}"

# Secret Manager references (names, not values).
OPENAI_API_KEY_SECRET="${OPENAI_API_KEY_SECRET:-lex-openai-api-key:latest}"
HMAC_SECRET_SECRET="${HMAC_SECRET_SECRET:-lex-hmac-secret:latest}"

if [ "${REGION}" != "europe-west1" ]; then
  echo "ERROR: REGION must be europe-west1 for Phase 1 (got '${REGION}')." >&2
  exit 1
fi

if [ -z "${IMAGE_TAG:-}" ]; then
  echo "ERROR: IMAGE_TAG must be set to the immutable tag to deploy." >&2
  exit 1
fi

if [ "${IMAGE_TAG}" = "latest" ]; then
  echo "ERROR: IMAGE_TAG must be an immutable tag, not 'latest'." >&2
  exit 1
fi

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/${SERVICE_NAME}:${IMAGE_TAG}"

echo "Deploying ${SERVICE_NAME} from ${IMAGE_URI} to Cloud Run in ${REGION}"

gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --platform="managed" \
  --image="${IMAGE_URI}" \
  --service-account="${RUNTIME_SERVICE_ACCOUNT}" \
  --no-allow-unauthenticated \
  --set-env-vars="ENVIRONMENT=production,ADAPTER_BACKEND=gcp,GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},LEX_MAILBOX=lex@clarvia.org,OPENAI_MODEL=gpt-5.6-luna,PROMPT_VERSION=lex-v1,SCHEMA_VERSION=lex_response_v1,LEX_GENERATION_PIPELINE=two_pass,RESEARCH_PROMPT_VERSION=lex-research-v1,WRITER_PROMPT_VERSION=lex-writer-v1,RESEARCH_SCHEMA_VERSION=lex_research_brief_v1,WRITER_SCHEMA_VERSION=lex_written_response_v1,RESEARCH_MAX_OUTPUT_TOKENS=12000,WRITER_MAX_OUTPUT_TOKENS=4000,PROCESSING_MODE=disabled,PROCESSING_ENABLED=false,GLOBAL_DAILY_LLM_LIMIT=500,FORCE_CIRCUIT_OPEN=false,RETENTION_TRASH_GMAIL=false,LEX_PROMPT_PATH=/app/runtime-private/prompts/lex-v1.txt,LEX_RESEARCH_PROMPT_PATH=/app/runtime-private/prompts/lex-research-v1.txt,LEX_WRITER_PROMPT_PATH=/app/runtime-private/prompts/lex-writer-v1.txt" \
  --set-secrets="OPENAI_API_KEY=${OPENAI_API_KEY_SECRET},HMAC_SECRET=${HMAC_SECRET_SECRET}"

echo "Deploy submitted. Keep PROCESSING_MODE=disabled until smoke tests pass."
echo ""
echo "Allowlist pilot (after smoke): update env only — no rebuild:"
echo "  PROCESSING_MODE=allowlist PROCESSING_ENABLED=true ALLOWLIST_SENDERS=... \\"
echo "    ./scripts/set-processing-mode.sh"
echo ""
echo "Kill switch (no redeploy): PROCESSING_ENABLED=false or PROCESSING_MODE=disabled"
echo "  See docs/runbooks/controlled-launch.md"
