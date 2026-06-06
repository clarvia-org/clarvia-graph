# Cross-Border Bereavement Corridors

Part of the Clarvia Graph Foundation Specification.

This document captures corridor-level knowledge for the four major Luxembourg
cross-border bereavement corridors. Each corridor represents a distinct
administrative pathway for families connected to Luxembourg and a neighbouring
country.

This information was originally authored by HirenGajjar in `clarvia-org/workflow-data`
and migrated here in June 2026. It informs the design of cross-border
`consequence`, `condition`, and `composition_rule` records but is not itself a
graph record type.

---

## Luxembourg — France (~120,000 frontaliers)

France is the largest frontalier corridor for Luxembourg.

| Aspect | Detail |
|---|---|
| **Survivor pension** | Filed via Info Retraite (single request covers all French schemes) |
| **Pension coordination** | CARSAT Alsace-Moselle coordinates with CNAP via form P5000 |
| **Death certificate** | Luxembourg death certificate requires SCEC transcription for French civil registry |
| **Succession** | Governed by Brussels IV (habitual residence rule) |

**Sources:** `source.fr_info_retraite.reversion`, `source.fr_service_public.deces`, `source.eur_lex.brussels_iv`, `source.eur_lex.ec_883_2004`

**Authorities:** `authority.fr.carsat`, `authority.fr.scec`

---

## Luxembourg — Germany (~55,000 frontaliers)

Germany is the second largest frontalier corridor for Luxembourg.

| Aspect | Detail |
|---|---|
| **Survivor pension** | DRV survivor pension requires marriage/partnership at death and 5-year qualifying period |
| **Sterbevierteljahr** | 3 months at deceased's full pension rate with no income offset |
| **Pension coordination** | DRV coordinates with CNAP via EU social security coordination |
| **Advisory service** | DRV provides international advisory days for frontaliers |
| **Succession** | Governed by Brussels IV (habitual residence rule) |

**Sources:** `source.de_drv.hinterbliebenenrente`, `source.de_drv.rente_und_ausland`, `source.eur_lex.brussels_iv`, `source.eur_lex.ec_883_2004`

**Authorities:** `authority.de.drv`, `authority.de.standesamt`

---

## Luxembourg — Belgium (~50,000 frontaliers)

Belgium is the third largest frontalier corridor for Luxembourg.

| Aspect | Detail |
|---|---|
| **Death declaration** | Declared to municipality where death occurred, usually by undertaker |
| **Death certificate** | Forwarded to municipality of last residence |
| **Succession duties** | Regional in Belgium — depend on fiscal residence |
| **Pension coordination** | SFP handles survivor pension coordination with CNAP via EU social security rules |
| **Succession** | Governed by Brussels IV (habitual residence rule) |

**Sources:** `source.be_gouv.deces`, `source.eur_lex.brussels_iv`, `source.eur_lex.ec_883_2004`

**Authorities:** `authority.be.sfp`

---

## Luxembourg — Portugal (~100,000 residents)

Portugal represents the largest foreign national community in Luxembourg.

| Aspect | Detail |
|---|---|
| **Death registration** | Death of a Portuguese national in Luxembourg must be registered in Portugal via consular services |
| **Survivor pension** | Pensão de sobrevivência requires 36 months of contributions |
| **Application** | Form RP 5075 via Segurança Social Direta or online at seg-social.pt |
| **Succession** | Governed by Brussels IV (habitual residence rule) |

**Sources:** `source.pt_eportugal.obito`, `source.eur_lex.brussels_iv`, `source.eur_lex.ec_883_2004`

**Authorities:** `authority.pt.seguranca_social`
