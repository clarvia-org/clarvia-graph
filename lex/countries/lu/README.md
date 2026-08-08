# Luxembourg Coverage

- **Publisher**: Service central de législation
- **Official entry point**: https://legilux.public.lu/
- **Data access**: Casemates open-data layer (`sparqlendpoint` + filestore). See [CASEMATES.md](CASEMATES.md).
- **Rights**: CC-BY-4.0 with attribution to Service central de législation, Luxembourg
- **Coverage**: Partial — Stage 1B + Stage 2 batches `04-codes` … `15-tail` (1,207 discoverable IDs)
- **Supported families**: Codes, ordinary laws, grand-ducal / government acts, constitution (LegalDocML/XML; one HTML Journal memorial)
- **Default language**: French (Constitution also published in German)
- **Source selection**: Prefer complete LegalDocML/XML; HTML retained when selected (see Stage 1B)
- **Known caveats**: The public Legilux website is an Angular SPA and must not be scraped. Use Casemates only.
- **Update command**: `uv run lex update lu` (or `--id <law-id>` / `--from-file …`)
- **Reviewer credits**: Maintainer review required before merge
- **Stage 1B selection**: [`STAGE_1B_SELECTION.md`](STAGE_1B_SELECTION.md) (approved — implemented)
- **Stage 2 expansion**: [`STAGE_2.md`](STAGE_2.md) (inventory gate → batch ID manifests)
- **Adapter registry**: catalog-backed via `batches/catalog.jsonl` + `ACTIVE_BATCHES` in `adapter.py`


## Published laws

| ID | Title | Status | Notes |
|---|---|---|---|
| `lu/code-civil` | Code civil | official_consolidation | Stage 1A (`resolve_latest`) |
| `lu/loi-2006-09-21-n1` | Loi du 21 septembre 2006 (consol.) | official_consolidation | Ordinary law |
| `lu/rgd-2025-03-13-a93` | RGD du 13 mars 2025 (consol.) | official_consolidation | Regulation |
| `lu/code-commerce` | Code de commerce | official_consolidation | Second code |
| `lu/constitution` | Constitution | official_consolidation | FR + DE |
| `lu/loi-2024-07-31-a339` | Loi du 31 juillet 2024 | official_current | HTML Journal memorial |
| `lu/code-penal` | Code pénal | official_consolidation | Irregular anchors |
| `lu/rgd-2024-12-20-a595` | RGD du 20 décembre 2024 (consol.) | official_consolidation | Rectification warning |
| `lu/code-travail` | Code du travail | official_consolidation | Large corpus |
| `lu/code-procedure-civile` | Nouveau Code de procédure civile | official_consolidation | Deep hierarchy |
| `lu/code-consommation` | Code de la consommation | official_consolidation | Stage 2 batch 04 |
| `lu/code-fonction-publique` | Code de la fonction publique | official_consolidation | Stage 2 batch 04 |
| `lu/code-instruction-criminelle` | Code d'Instruction Criminelle | official_consolidation | Stage 2 batch 04 |
| `lu/code-procedure-penale` | Code de procédure pénale | official_consolidation | Stage 2 batch 04 |
| *(+216)* | Constitutional & state administration | official_consolidation | Stage 2 batch 05 — see `batches/05-state-admin.txt` |
| *(+43)* | Civil, family, property & housing | official_consolidation | Stage 2 batch 06 — see `batches/06-civil-family.txt` |
| *(+69)* | Labor, employment & social security | official_consolidation | Stage 2 batch 07 — see `batches/07-labor-social.txt` |
| *(+105)* | Commercial, corporate & finance | official_consolidation | Stage 2 batch 08 — see `batches/08-commercial-finance.txt` |
| *(+59)* | Tax, customs & public finance | official_consolidation | Stage 2 batch 09 — see `batches/09-tax-finance.txt` |
| *(+46)* | Health, welfare & family support | official_consolidation | Stage 2 batch 10 — see `batches/10-health-welfare.txt` |
| *(+75)* | Environment, agriculture & energy | official_consolidation | Stage 2 batch 11 — see `batches/11-environment-energy.txt` |
| *(+83)* | Education, research & culture | official_consolidation | Stage 2 batch 12 — see `batches/12-education-culture.txt` |
| *(+27)* | Transport & infrastructure | official_consolidation | Stage 2 batch 13 — see `batches/13-transport.txt` |
| *(+18)* | Internal security & data protection | official_consolidation | Stage 2 batch 14 — see `batches/14-security-data.txt` |
| *(+452)* | Final tail / remaining instruments | official_consolidation | Stage 2 batch 15 — see `batches/15-tail.txt` |
