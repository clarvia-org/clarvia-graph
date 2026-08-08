# Private operational material

Material that must **never** enter a public GitHub repository.

## Locations

| Material | Location |
| -------- | -------- |
| Live production prompt | `runtime-private/prompts/lex-v1.txt` |
| Operator deploy env | `runtime-private/deploy/env.production.yaml` |
| GCP service account key | **Not used** — Cloud Run runtime SA only |
| OpenAI / HMAC secrets | Secret Manager (`lex-openai-api-key`, `lex-hmac-secret`) |

`runtime-private/` is gitignored. Templates live at
`runtime-private/deploy/env.production.yaml.example` (no secret values).

## Docker build context

Before `scripts/build-image.sh`:

- Confirm `runtime-private/prompts/lex-v1.txt` is the approved prompt version
- Confirm no user data, evaluation transcripts, or credentials are in the build
  context
- Credentials must not appear in Dockerfile `ARG`/`ENV` or image layers

The build script fails if the prompt file is missing.

## Image contents

The image packages the approved prompt at
`/app/runtime-private/prompts/lex-v1.txt` (via `LEX_PROMPT_PATH`). This is
intentional private runtime material inside the operator-built image — not in
git.

## Logs and alerts

Never log message bodies, addresses, names, model output, or secret values.
Structured logs use the allow-list in `app/logging.py`.

## Evaluation and incident data

Real-user conversations, triage notes, and incident dumps stay outside the
public-safe directory. Use synthetic fixtures under `tests/evals/` only.
