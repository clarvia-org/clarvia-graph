# ADR 0005: Local manual deployment rather than GitHub-based CI/CD in Phase 1

## Status

Accepted (Phase 1).

## Context

The service handles sensitive material (live prompt, user email content). A
public GitHub repository with CI/CD would risk leaking private runtime material
and adds operational overhead before the service is proven.

## Decision

Phase 1 uses **local development and manual deployment**: build the image
locally, push to Artifact Registry, and deploy to Cloud Run using locally
authenticated `gcloud`. No GitHub repository, no GitHub Actions, no CI/CD, and no
Terraform for this service. No service-account JSON key is created.

## Consequences

- Private runtime material never enters a repository or a build pipeline.
- Deployment requires a human operator running the scripts locally.
- Slower, deliberate releases suitable for early operation.
- CI/CD can be introduced later once a public-safe boundary is established.
