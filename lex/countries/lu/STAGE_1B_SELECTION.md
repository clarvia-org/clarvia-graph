# Stage 1B — Proposed nine-law selection

**Status:** approved with edits (2026-07-21) — implementation PR (adapter + data)  
**Already on `main`:** `lu/code-civil`  
**Target after implementation:** 10 law IDs total  

Blueprint gate: stable ID, official source URL, document family, selected format, edge case, provision anchor.  
Casemates: [`CASEMATES.md`](CASEMATES.md).

---

## Canonical nine IDs


| #   | Stable ID                  | Edge case(s)                                      | Family       | Format   | Verify anchor             |
| --- | -------------------------- | ------------------------------------------------- | ------------ | -------- | ------------------------- |
| 1   | `lu/loi-2006-09-21-n1`     | Ordinary law                                      | law          | XML      | `art-1er`                 |
| 2   | `lu/rgd-2025-03-13-a93`    | Grand-ducal regulation                            | regulation   | XML      | `art-1er`                 |
| 3   | `lu/code-commerce`         | Code other than Code civil                        | code         | XML      | `art-1er`                 |
| 4   | `lu/constitution`          | Constitution **and** multiple languages (FR + DE) | constitution | XML      | FR `art-1er`; DE match    |
| 5   | `lu/loi-2024-07-31-a339`   | Preferred retained source HTML                    | law          | **HTML** | `art-1er` / `art-1`       |
| 6   | `lu/code-penal`            | Nested / irregular provisions                     | code         | XML      | `art-1er`, `art-97-et-98` |
| 7   | `lu/rgd-2024-12-20-a595`   | Consolidation warning / freshness                 | regulation   | XML      | `art-1er`                 |
| 8   | `lu/code-travail`          | Large corpus (~4.1 MiB XML)                       | code         | XML      | `art-1er`                 |
| 9   | `lu/code-procedure-civile` | Structurally complex (~1418 articles)             | code         | XML      | `art-1er`                 |


All nine blueprint edge cases are covered. Constitution owns both “constitution” and “multiple languages”.

---

## Source details

### 1. `lu/loi-2006-09-21-n1`


| Field               | Value                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                                                        |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/loi/2006/09/21/n1/consolide/20240801`                                                                               |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/loi/2006/09/21/n1/consolide/20240801/fr/xml/eli-etat-leg-loi-2006-09-21-n1-consolide-20240801-fr-xml.xml` |
| Notes               | Consolidated `loi` ELI shape; ~48 articles                                                                                                                      |


### 2. `lu/rgd-2025-03-13-a93`


| Field               | Value                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                                                          |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/rgd/2025/03/13/a93/consolide/20250321`                                                                                |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/rgd/2025/03/13/a93/consolide/20250321/fr/xml/eli-etat-leg-rgd-2025-03-13-a93-consolide-20250321-fr-xml.xml` |
| Notes               | Representative `rgd` consolidation                                                                                                                                |


### 3. `lu/code-commerce`


| Field               | Value                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                            |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/code/commerce/20230201`                                                                 |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/code/commerce/20230201/fr/xml/eli-etat-leg-code-commerce-20230201-fr-xml.xml` |
| Notes               | Second code family; ~578 KiB                                                                                                        |


### 4. `lu/constitution` (FR + DE)


| Field      | Value                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status     | `official_consolidation`                                                                                                                                                          |
| Work / ELI | `http://data.legilux.public.lu/eli/etat/leg/constitution/1868/10/17/n1/consolide/20230701`                                                                                        |
| Source FR  | `http://data.legilux.public.lu/filestore/eli/etat/leg/constitution/1868/10/17/n1/consolide/20230701/fr/xml/eli-etat-leg-constitution-1868-10-17-n1-consolide-20230701-fr-xml.xml` |
| Source DE  | `http://data.legilux.public.lu/filestore/eli/etat/leg/constitution/1868/10/17/n1/consolide/20230701/de/xml/eli-etat-leg-constitution-1868-10-17-n1-consolide-20230701-de-xml.xml` |
| Files      | `current.md` + `source.xml`; `current.de.md` + `source.de.xml`                                                                                                                    |
| Notes      | Strong multi-language Casemates example (FR/DE/LB). Publish FR + DE in Stage 1B.                                                                                                  |


### 5. `lu/loi-2024-07-31-a339`


| Field               | Value                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status              | `official_current`                                                                                                                                                                   |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/loi/2024/07/31/a339/jo`                                                                                                                  |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/loi/2024/07/31/a339/jo/fr/html/eli-etat-leg-loi-2024-07-31-a339-jo-fr-html.html`                                               |
| Notes               | Journal memorial; XML and HTML both exist. **Maintainer edit:** retain the HTML manifestation for Stage 1B to fulfill edge case 6 (preferred retained source HTML / richtext `art_N` path). |


### 6. `lu/code-penal`


| Field               | Value                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                      |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/code/penal/20250311`                                                              |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/code/penal/20250311/fr/xml/eli-etat-leg-code-penal-20250311-fr-xml.xml` |
| Notes               | Irregular IDs such as `art_97_et_98`; ~694 articles                                                                           |


### 7. `lu/rgd-2024-12-20-a595`


| Field               | Value                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                                                            |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/rgd/2024/12/20/a595/consolide/20250101`                                                                                 |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/rgd/2024/12/20/a595/consolide/20250101/fr/xml/eli-etat-leg-rgd-2024-12-20-a595-consolide-20250101-fr-xml.xml` |
| Notes               | Expression title includes *« Version rectifiée applicable au 01/01/2025 »* → populate `warning`                                                                     |


### 8. `lu/code-travail`


| Field               | Value                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                          |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/code/travail/20260701`                                                                |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/code/travail/20260701/fr/xml/eli-etat-leg-code-travail-20260701-fr-xml.xml` |
| Notes               | ~4.1 MiB XML; under 50 MiB limit                                                                                                  |


### 9. `lu/code-procedure-civile`


| Field               | Value                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status              | `official_consolidation`                                                                                                                            |
| Work / ELI          | `http://data.legilux.public.lu/eli/etat/leg/code/procedure_civile/20251219`                                                                         |
| Selected source URL | `http://data.legilux.public.lu/filestore/eli/etat/leg/code/procedure_civile/20251219/fr/xml/eli-etat-leg-code-procedure_civile-20251219-fr-xml.xml` |
| Notes               | Deep hierarchy; ~1418 articles                                                                                                                      |


---

## Not selected


| Candidate                    | Reason                        |
| ---------------------------- | ----------------------------- |
| `code/environnement_annexes` | PDF-only; OCR forbidden       |
| `code/securite_sociale`      | PDF-only in reviewed listings |


---

## Implementation note

Selection PR (#2) was docs-only. The implementation PR extends the Luxembourg adapter and publishes these nine laws beside `lu/code-civil`.

---

## Maintainer decision

- [ ] **Approve**  
- [x] **Approve with edits**  
- [ ] **Reject**

Substitutions / comments:

- `lu/loi-2024-07-31-a339` also has an HTML manifestation — **select HTML** for this ID to fulfill requirement 6 (preferred retained source HTML).

