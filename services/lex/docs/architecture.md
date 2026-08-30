# Lex email service — architecture (Phase 1)

Lex is a fully automated bereavement and end-of-life information email service at
`lex@clarvia.org`. People email a question; Lex replies with an LLM-generated
answer plus an application-composed continuation note and footer. No human is in
the loop.

This document describes the Phase 1 scaffold. External integrations (Gmail,
Firestore, Cloud Tasks, OpenAI) are defined as ports but not implemented.

## Phase 1 component diagram

```text
                         europe-west1 (all Lex resources)
  +-----------------+      +--------------------------------------+
  | Cloud Scheduler | ---> | Cloud Run: lex-email-service         |
  | (OIDC)          |      |                                      |
  +-----------------+      |  FastAPI                             |
                           |   GET  /health                      |
  +-----------------+      |   POST /internal/poll    (Phase 2)   |
  | Cloud Tasks     | ---> |   POST /internal/process (Phase 3+)  |
  | (OIDC)          |      |                                      |
  +-----------------+      |  Ports (not implemented in Phase 1): |
                           |   GmailPort, TaskQueuePort,          |
                           |   MessageStatePort, LlmPort, Clock   |
                           +--------------------------------------+
                                  |            |            |
                                  v            v            v
                             Gmail API     Firestore     OpenAI
                             (Phase 2+)    (Phase 2+)    (Phase 3+)
```

The Stockholm website infrastructure is **separate**. The future website will
call Lex over **HTTP only** and is never a source-code dependency.

## Single-region rule

All Lex Google Cloud resources run in **`europe-west1` only**. Configuration
rejects any other `GCP_REGION` at startup.

## Email processing boundaries

- Gmail is the source of truth for conversation history (see ADR 0002).
- No attachment processing in Phase 1 (see ADR 0003); attachment-only requests
  receive a deterministic "please paste the details" response.
- Size limits: current-message body up to 100,000 characters; full model thread
  input up to 120,000 characters.
- Automatic messages, bounces, loops, and list mail are ignored.

## Generation

In-scope model-eligible mail uses **one** OpenAI Responses API call with web
search and structured schema `lex_response_v1`. The application then keeps
only this-turn search URLs, coerces a parsed body if remaining schema checks
fail, and composes sources, `Lex.` sign-off, continuation, and footer.

The reply body is written in the same language as the latest user message, or
in a language the user asked for. No country graph or legislation files are
injected.

If the provider is unavailable or structured output is empty, Lex does not keep
paying for retries of the same mail. At most two model calls per inbound
message; the English technical-failure template is used when that budget is
spent (see ADR 0007).

## Application-composed multipart email

Every outgoing email — including deterministic operational responses — goes
through one composer (`app/email/composition.py`). Gmail signatures do not apply
to API sends, so the application composes the entire message as
`multipart/alternative` (plain text + HTML). Continuation note and footer are
approved constants outside model control (see ADR 0004).

### Three-part outgoing order

1. Response body, signed `Lex.`
2. Approved continuation note.
3. Approved Clarvia footer.

The composer verifies, immediately before returning, that the continuation and
footer appear exactly once in each alternative and in the correct order, failing
closed otherwise.

## Recipients: To + CC counting, no BCC

- The visible reply list is built from `Reply-To`/`From`, `To`, and `Cc`.
- `lex@clarvia.org` and configured aliases are removed; addresses are deduped
  case-insensitively; invalid addresses are dropped.
- The recipient limit (10) is computed from the visible **To + CC** list only.
- BCC is never read, reconstructed, or counted. The composer cannot emit a Bcc
  header.

## Local-only Phase 1 source directory

The service is a self-contained local directory. In Phase 1 there is no GitHub
repository, no CI/CD, and manual deployment only (see ADR 0005).

## Future public-monorepo boundary

The public-safe directory can be copied intact into `services/lex/` or
`services/emailer/` in a future public monorepo without Python import changes,
Docker path changes, or configuration path rewrites. The service never imports
from a parent directory, and Docker builds use this directory as the build
context (see ADR 0006).

## Private runtime-material boundary

The live prompt, deploy env files, evaluation cases, and user data live only in
`runtime-private/` and are gitignored. Only `runtime-private/README.md` is
public-safe. Credentials never enter the repository or the Docker build context.

## Website HTTP-only dependency

The website integrates with Lex strictly over HTTP. It is not a Python or
JavaScript build dependency of this service, and this service does not import the
website.
