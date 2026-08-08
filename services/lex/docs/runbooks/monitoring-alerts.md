# Monitoring and alerts

Lex emits structured JSON logs. Operational alerts use `event=alert` with
allow-listed fields only (no PII).

## Alert emission

`app/ops/alerts.py` → `emit_alert(code, severity=..., **fields)` logs:

```json
{
  "level": "ERROR",
  "event": "alert",
  "alert_code": "circuit_open",
  "severity": "critical",
  "error_code": "global_llm_budget_reached"
}
```

Alert codes in Phase 6 include:

| Code | When |
| ---- | ---- |
| `circuit_open` | Global LLM budget reached or forced kill switch |
| `composition_invalid` | Missing continuation or footer at pre-send verify |

## Structured processing logs

Normal events include `status`, `error_code`, `latency_ms`, `action`, and
operational identifiers (`gmail_message_id`, `sender_hmac`, etc.) — never
addresses or message content.

## Cloud Monitoring log-based alert (europe-west1)

Create in project `fleet-garage-502110-g6`, region `europe-west1`:

1. **Logs Explorer** — filter:

   ```text
   resource.type="cloud_run_revision"
   resource.labels.service_name="lex-email-service"
   jsonPayload.event="alert"
   ```

2. **Create alert policy** from the query:
   - Condition: log match count > 0 in 5 minutes
   - Notification channel: operator email or on-call route
   - Documentation: link to `docs/runbooks/rollback.md`

3. Optional second alert for repeated technical failures:

   ```text
   jsonPayload.event="process_failed"
   jsonPayload.error_code!="rate_limited"
   ```

See also [controlled-launch.md](controlled-launch.md) for pilot promotion and kill-switch
procedures. Phase 7 includes an alert smoke test in `tests/evals/test_pilot_e2e.py`.

## Retention worker

Schedule `POST /internal/retention` (same OIDC / internal token as other
internal routes) via Cloud Scheduler when ready. The worker logs
`retention_sweep` with anonymised `deleted_count` only.

## Gmail trash (opt-in)

Set `RETENTION_TRASH_GMAIL=true` only after reviewing the retention policy.
Default is `false` for safety.
