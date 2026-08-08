# Batch ID manifests

Frozen ingest lists for Stage 2 PRs. **Empty until the inventory PR lands.**

Each `NN-*.txt` file:

- one stable law ID per line (`lu/…`)
- `#` comments allowed
- no duplicates across batch files
- Stage 1B IDs must not reappear (already on `main`)

Ingest:

```bash
uv run lex update lu --from-file countries/lu/batches/04-codes.txt
```

See [`../STAGE_2.md`](../STAGE_2.md) for the latest-consolidation inventory rule.
