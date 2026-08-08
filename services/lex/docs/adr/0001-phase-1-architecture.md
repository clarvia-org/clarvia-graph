# ADR 0001: Scheduled polling rather than Gmail watch for Phase 1

## Status

Accepted (Phase 1).

## Context

Lex must discover new inbound messages at `lex@clarvia.org`. Options include
Gmail push notifications (`users.watch` + Pub/Sub) and scheduled polling of the
inbox with a Gmail query.

## Decision

Phase 1 uses **scheduled polling**. Cloud Scheduler invokes `/internal/poll`
with OIDC; the poll query finds unprocessed messages and enqueues a durable task
per message. Gmail push (`users.watch`) is deferred to a later phase.

## Consequences

- Simpler operational model with no Pub/Sub topic or watch-renewal lifecycle.
- Bounded, predictable latency acceptable for an email service.
- The polling query and idempotency keys must avoid duplicate processing.
- Migrating to Gmail push later does not change the processing contract.
