# Synthetic evaluation fixtures for Phase 4+ validation harness.

This directory holds **synthetic** anchor cases and the Phase 7 pilot E2E suite.
Full live scoring against real OpenAI calls is operator-run during controlled launch.

- Phase 4 anchors: `fixtures/anchors.json`
- Phase 7 pilot: `../fixtures/pilot/conversations.jsonl` (100 synthetic E2E cases)
- Pilot tests: `test_pilot_e2e.py`
- Report generator: `scripts/generate-eval-report.py`

Real-user pilot analysis must remain under `runtime-private/evals/` only.
