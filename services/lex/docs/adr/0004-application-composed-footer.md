# ADR 0004: Continuation and footer composed in application code

## Status

Accepted (Phase 1).

## Context

Outgoing replies must always carry an approved continuation note and Clarvia
footer. Gmail signatures do not apply to Gmail API sends, and a Workspace-level
append rule would be brittle and outside version control.

## Decision

The **application composes** the continuation note and footer as reviewed
constants (`app/email/templates.py`) and assembles every outgoing message in one
composer (`app/email/composition.py`) as `multipart/alternative`. The model
never generates continuation or footer content; the composer rejects such content
in the body and verifies presence, count, and order before send.

## Consequences

- Legal and brand-critical text stays outside model control and in version
  control.
- No reliance on Gmail compose signatures or Workspace footer rules.
- Fail-closed verification prevents missing, duplicated, or reordered content.
- The plain-text and HTML alternatives stay in sync by construction.
