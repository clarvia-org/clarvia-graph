# runtime-private/

Local-only operational material for the Lex email service.

**Nothing in this directory except this `README.md` may be committed to any Git
repository.** The live production prompt, deployment environment files,
evaluation cases, and any user or incident data are private runtime material.

## Contents

| Path | Purpose | Committed? |
|---|---|---|
| `README.md` | This file — the only public-safe file here | Yes |
| `prompts/lex-v1.txt` | Live approved Lex system prompt | No (gitignored) |
| `deploy/env.production.yaml.example` | Template for the private deploy env file | No (gitignored) |
| `deploy/env.production.yaml` | Real deploy env values (operator-created) | No (gitignored) |
| `evals/` | Real-user evaluation cases (future) | No (gitignored) |
| `data/` | Any user or incident data (future) | No (gitignored) |

## Rules

- Never place credentials or service-account keys anywhere in the repository.
- Never copy `runtime-private/evals`, `runtime-private/data`, or `.env` into a
  Docker build context (see `.dockerignore`).
- The prompt is read through `LEX_PROMPT_PATH` (default
  `runtime-private/prompts/lex-v1.txt`). Its contents are never logged and never
  returned by `/health`.
- For a deploy operator build, only `runtime-private/prompts/` may be packaged
  into the image as approved private runtime material.
