# ADR 0002: Gmail is the conversation and content source of truth

## Status

Accepted (Phase 1).

## Context

Lex needs conversation history for follow-up questions. It could maintain its own
copy of message content, or rely on Gmail threads.

## Decision

**Gmail is the source of truth** for conversation and message content. Lex stores
only minimal processing state (keyed by a deterministic message key and a sender
HMAC), never message bodies, subjects, sender addresses, or recipients.

## Consequences

- Data minimisation: no duplicate content store to secure or retain.
- Thread context for each model call is assembled from Gmail at processing time.
- The state store (Firestore, Phase 2+) holds idempotency and status only.
- Retention of content follows the mailbox, not a separate database.
