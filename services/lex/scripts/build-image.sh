#!/usr/bin/env bash
# Build the Lex email service container image locally (linux/amd64).
# A human operator runs this manually. It does not deploy anything.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-fleet-garage-502110-g6}"
REGION="${REGION:-europe-west1}"
AR_REPOSITORY="${AR_REPOSITORY:-lex-services}"
SERVICE_NAME="${SERVICE_NAME:-lex-email-service}"
IMAGE_TAG="${IMAGE_TAG:-$(date -u +%Y%m%d-%H%M%S)}"

if [ "${REGION}" != "europe-west1" ]; then
  echo "ERROR: REGION must be europe-west1 for Phase 1 (got '${REGION}')." >&2
  exit 1
fi

if [ "${IMAGE_TAG}" = "latest" ]; then
  echo "ERROR: IMAGE_TAG must be an immutable tag, not 'latest'." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "${SCRIPT_DIR}")"
cd "${ROOT_DIR}"

# Approved private runtime material must be present for a deploy-operator build.
if [ ! -f "runtime-private/prompts/lex-v1.txt" ]; then
  echo "ERROR: runtime-private/prompts/lex-v1.txt is missing." >&2
  exit 1
fi
if [ ! -f "runtime-private/prompts/lex-research-v1.txt" ]; then
  echo "ERROR: runtime-private/prompts/lex-research-v1.txt is missing." >&2
  exit 1
fi
if [ ! -f "runtime-private/prompts/lex-writer-v1.txt" ]; then
  echo "ERROR: runtime-private/prompts/lex-writer-v1.txt is missing." >&2
  exit 1
fi

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/${SERVICE_NAME}:${IMAGE_TAG}"

echo "Building ${IMAGE_URI} (context: ${ROOT_DIR})"
docker buildx build \
  --platform="linux/amd64" \
  --tag="${IMAGE_URI}" \
  --load \
  .

echo "Built ${IMAGE_URI}"
echo "Record this immutable IMAGE_TAG for push and deploy: ${IMAGE_TAG}"
