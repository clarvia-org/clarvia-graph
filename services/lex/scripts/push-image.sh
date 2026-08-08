#!/usr/bin/env bash
# Push a previously built Lex image to Artifact Registry in europe-west1.
# A human operator runs this manually.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-fleet-garage-502110-g6}"
REGION="${REGION:-europe-west1}"
AR_REPOSITORY="${AR_REPOSITORY:-lex-services}"
SERVICE_NAME="${SERVICE_NAME:-lex-email-service}"

if [ "${REGION}" != "europe-west1" ]; then
  echo "ERROR: REGION must be europe-west1 for Phase 1 (got '${REGION}')." >&2
  exit 1
fi

if [ -z "${IMAGE_TAG:-}" ]; then
  echo "ERROR: IMAGE_TAG must be set to the immutable tag that was built." >&2
  exit 1
fi

if [ "${IMAGE_TAG}" = "latest" ]; then
  echo "ERROR: IMAGE_TAG must be an immutable tag, not 'latest'." >&2
  exit 1
fi

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/${SERVICE_NAME}:${IMAGE_TAG}"

echo "Pushing ${IMAGE_URI}"
docker push "${IMAGE_URI}"
echo "Pushed ${IMAGE_URI}"
