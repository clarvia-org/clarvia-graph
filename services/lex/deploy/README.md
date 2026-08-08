# Deployment (Phase 1)

Phase 1 uses **local development and manual deployment**. There is no GitHub
repository, no GitHub Actions, no CI/CD, and no Terraform for this service.

All Lex Google Cloud resources live in **`europe-west1` only**. The Stockholm
website infrastructure is separate and calls Lex over HTTP only.

## Flow

1. Build the image locally (`scripts/build-image.sh`).
2. Push it to Artifact Registry (`scripts/push-image.sh`).
3. Deploy to Cloud Run (`scripts/deploy-cloud-run.sh`).

A human operator runs these scripts locally. They must not run automatically
from another tool. See the repository `README.md` for details and the
prerequisites (authenticated `gcloud`, Artifact Registry repository).

## Configuration

- Non-secret configuration: see `env.production.example.yaml` (public-safe).
- Secrets (`OPENAI_API_KEY`, `HMAC_SECRET`): Cloud Run Secret Manager references
  only. Never place secret values in an env file, source code, build arguments,
  or logs.
- Private operator env file: `runtime-private/deploy/env.production.yaml`
  (gitignored; template at `runtime-private/deploy/env.production.yaml.example`).

## Runtime identity

- Cloud Run runtime service account:
  `lex-email@fleet-garage-502110-g6.iam.gserviceaccount.com`
- Deployed with `--no-allow-unauthenticated`.
- No service-account JSON key is created or used.
