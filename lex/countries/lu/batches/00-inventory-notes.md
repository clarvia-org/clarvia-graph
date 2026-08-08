# Stage 2 Inventory & Classification Notes

## Method

FILTER to `eli/etat/leg/` consolidations only. Titles via COALESCE of ELI + Jolux title predicates.

### SPARQL

```sparql
SELECT ?work ?title ?fileUrl WHERE {
  ?work a <http://data.legilux.public.lu/resource/ontology/jolux#Consolidation> .
  FILTER(STRSTARTS(STR(?work), "http://data.legilux.public.lu/eli/etat/leg/"))
  ?work <http://data.legilux.public.lu/resource/ontology/jolux#isRealizedBy> ?expr .
  OPTIONAL { ?expr <http://data.europa.eu/eli/ontology#title> ?t1 . }
  OPTIONAL { ?expr <http://www.europa.eu/eli/ontology#title> ?t2 . }
  OPTIONAL { ?work <http://data.europa.eu/eli/ontology#title> ?t3 . }
  OPTIONAL {
    ?expr <http://data.legilux.public.lu/resource/ontology/jolux#title> ?t4 .
  }
  BIND(COALESCE(?t1, ?t2, ?t3, ?t4) AS ?title)
  ?expr <http://data.legilux.public.lu/resource/ontology/jolux#isEmbodiedBy> ?manifest .
  ?manifest <http://data.legilux.public.lu/resource/ontology/jolux#isExemplifiedBy> ?fileUrl .
}
```

Note: `lu/loi-2024-07-31-a339` is Stage 1B HTML Journal memorial (`/jo`), not a Jolux Consolidation, so it does not appear in this Consolidation catalog.

### Latest consolidation only

Rows are grouped by durable instrument URI (strip `/consolide/YYYYMMDD` and trailing `/YYYYMMDD` for codes). Only the latest dated work is retained. Preferred format: XML > HTML > PDF.

### Classification

Each instrument is assigned to **exactly one** batch. `code` → `04-codes`; `constitution` → `05-state-admin`; otherwise keyword match on title+id; unmatched digital → `15-tail`. No round-robin. PDF-only → `skip` / `pdf-only`. Stage 1B IDs → catalog batch `stage-1b` (excluded from manifests).

## Inventory Counts

- **Unique instruments (catalog rows):** 1,334
- **Digital (XML/HTML):** 1,206
- **Stage 1B (already on main):** 9
- **Skipped (PDF-only):** 128
- **Ingestible Stage 2 IDs (all manifests):** 1,197

## Batch ID Manifest Summary

| Batch File | Theme | Ingestible ID Count |
|---|---|---|
| `04-codes.txt` | 04-codes | 4 |
| `05-state-admin.txt` | 05-state-admin | 216 |
| `06-civil-family.txt` | 06-civil-family | 43 |
| `07-labor-social.txt` | 07-labor-social | 69 |
| `08-commercial-finance.txt` | 08-commercial-finance | 105 |
| `09-tax-finance.txt` | 09-tax-finance | 59 |
| `10-health-welfare.txt` | 10-health-welfare | 46 |
| `11-environment-energy.txt` | 11-environment-energy | 75 |
| `12-education-culture.txt` | 12-education-culture | 83 |
| `13-transport.txt` | 13-transport | 27 |
| `14-security-data.txt` | 14-security-data | 18 |
| `15-tail.txt` | 15-tail | 452 |

## Size Budget Assessment

- **Current Repo Size:** ~18 MiB tracked working tree
- **Estimated retained source for ingestible IDs:** ~1,197 × ~250 KiB ≈ **299 MiB** uncompressed
- **Estimated packed `.git` growth:** roughly 30–50% of uncompressed (order-of-magnitude only)
- **Packed repo verdict vs 900 MiB hard stop:** **PASS** (estimate 299 MiB sources before git packing)
