# ADR 0003: No attachment processing in Phase 1

## Status

Accepted (Phase 1).

## Context

Users may send attachments (PDFs, images, documents). Parsing untrusted
attachments adds significant security surface and complexity.

## Decision

Phase 1 does **not** read attachments. An attachment-only message receives a
deterministic response asking the user to paste the key facts and the country
concerned into the message body.

## Consequences

- Reduced security surface; no untrusted file parsing.
- Clear, compassionate fallback for attachment-only requests.
- The response is composed through the same continuation and footer path.
- Attachment handling can be reconsidered in a later phase with proper isolation.
