# ADR 0007: One search-enabled generation call

## Status

Accepted (Phase 1 generation).

## Context

Ask Clarvia must reply in the language of the latest user message (or the
language they asked for) for every in-scope, model-eligible request. The
application already composes continuation and footer (ADR 0004). The model
must return a usable body; the worker must not substitute the English
technical-failure template because structured fields were imperfect.

The live model family is `gpt-5.6-luna`. One Responses API call with web
search is the generation contract.

## Decision

For in-scope mail that has passed operational gates:

1. Call OpenAI Responses once with `web_search` enabled and schema
   `lex_response_v1` (prompt `lex-v1` at `runtime-private/prompts/lex-v1.txt`).
2. Keep only source and contact URLs that appear in this-turn search results.
   Drop citation markers that no longer resolve.
3. If validation still fails, coerce: keep the prose, drop ungrounded sources
   and contacts, and send as `clarify` when an `answer` has no search evidence.
4. Compose the outbound mail in application code (body, sources block,
   sign-off, continuation, footer).

If both generate attempts return no parseable body, or the provider returns
5xx / timeout / rate-limit, **requeue** (Cloud Tasks). The English
`TECHNICAL_FAILURE_BODY` is used only after `max_process_attempts`.

Operational gates are unchanged: allowlist, rate limit, attachment-only,
recipient limit, thread closed, circuit / kill switch. Those templates stay
as reviewed English copy.

Country mapping, graph YAML, and `lex/` legislation files are not inputs.

## Consequences

- Live mail does not depend on a research-then-writer split.
- A letter may be weaker than a fully sourced answer; it still goes out in
  the user’s language.
- Operators must ship `lex-v1.txt` in the image (not the research/writer pair)
  and set `LEX_GENERATION_PIPELINE=single_pass`.
- `app/pipeline/two_pass.py` remains for unit tests and eval scripts only.
