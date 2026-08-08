# ADR 0006: Public-safe code versus private operational material

## Status

Accepted (Phase 1).

## Context

The service will later move into a public monorepo (`services/lex/` or
`services/emailer/`). Some material must never be public: the live prompt,
credentials, deploy env files, real-user evaluation cases, and user data.

## Decision

Separate **public-safe code** from **private operational material**:

- Public-safe: `app/`, `tests/`, `docs/`, `deploy/` examples, `scripts/`,
  `Dockerfile`, `Makefile`, `pyproject.toml`, `README.md`.
- Private: everything under `runtime-private/` except its `README.md`
  (gitignored), plus `.env` and any credentials.

The service is relocatable with no parent-directory imports, no parent Docker
paths, and configuration paths resolved from the service root. The website
depends on Lex over HTTP only.

## Consequences

- The directory can be copied intact into a public monorepo without code
  changes.
- Private material stays local and out of any repository and build context.
- `.gitignore` and `.dockerignore` enforce the boundary; directory-boundary
  tests assert it.
