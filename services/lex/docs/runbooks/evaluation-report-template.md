# Lex evaluation report template (synthetic)

This template shows the **shape** of a pilot evaluation report. It contains **no
real user data**. Use it as a reference when reviewing generated reports.

Real-user pilot analysis must be stored only under `runtime-private/evals/` and
must never be copied into `tests/`, `docs/`, or any public Git tree.

## Metadata

| Field | Example |
| --- | --- |
| Generated | `2026-07-25T12:00:00+00:00` |
| Synthetic only | `true` |
| Case count | `100` |
| Passed | `100` |
| Failed | `0` |
| Duplicate sends | `0` |

## Launch thresholds (§27.5)

| Threshold | Result |
| --- | --- |
| `anchor_action_correct` | PASS |
| `zero_invented_contacts` | PASS |
| `formatting_compliance` | PASS |
| `zero_duplicate_sends` | PASS |
| `footer_on_all_outbound` | PASS |

**Overall:** PASS

## Case summary (abbreviated)

| case_id | category | expected | actual | passed |
| --- | --- | --- | --- | --- |
| pilot_001 | recent_death | sent | sent | yes |
| pilot_008 | 11_recipients | recipient_limited | recipient_limited | yes |
| pilot_009 | rate_limit | rate_limited | rate_limited | yes |
| pilot_013 | openai_failure | failed | failed | yes |
| pilot_027 | duplicate_retry | already_done | already_done | yes |

## Generating reports

Synthetic CI artifact:

```bash
python scripts/generate-eval-report.py --basename pilot-ci
```

Private live-pilot artifact (operator machine only):

```bash
python scripts/generate-eval-report.py --private --basename pilot-live-YYYYMMDD
```

## Monitoring cross-link

Structured alerts emitted during pilot or production processing are documented in
[monitoring-alerts.md](monitoring-alerts.md). Alert log events use `event=alert` and
allow-listed fields only.
