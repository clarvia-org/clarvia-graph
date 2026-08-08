#!/usr/bin/env python3
"""Build Luxembourg Stage 2 inventory catalog and batch manifests from Casemates SPARQL.

Rules:
- Group by durable instrument URI (strip /consolide/YYYYMMDD and trailing /YYYYMMDD).
- Keep only the latest consolidation date per instrument.
- Prefer XML over HTML over PDF for the selected work.
- Classify each instrument into exactly one batch (no round-robin).
- Exclude Stage 1B IDs from ingest manifests.
"""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

SPARQL_ENDPOINT = "http://data.legilux.public.lu/sparqlendpoint"

STAGE_1B_PUBLISHED_IDS = {
    "lu/code-civil",
    "lu/loi-2006-09-21-n1",
    "lu/rgd-2025-03-13-a93",
    "lu/code-commerce",
    "lu/constitution",
    "lu/loi-2024-07-31-a339",
    "lu/code-penal",
    "lu/rgd-2024-12-20-a595",
    "lu/code-travail",
    "lu/code-procedure-civile",
}

BATCH_FILES = [
    "04-codes.txt",
    "05-state-admin.txt",
    "06-civil-family.txt",
    "07-labor-social.txt",
    "08-commercial-finance.txt",
    "09-tax-finance.txt",
    "10-health-welfare.txt",
    "11-environment-energy.txt",
    "12-education-culture.txt",
    "13-transport.txt",
    "14-security-data.txt",
    "15-tail.txt",
]


@dataclass
class CatalogEntry:
    stable_id: str
    work_eli: str
    title: str
    document_family: str
    preferred_format: str
    batch: str
    skip_reason: str | None
    approx_source_bytes: int | None


def sparql_query(query: str) -> list[dict[str, dict[str, str]]]:
    url = f"{SPARQL_ENDPOINT}?{urllib.parse.urlencode({'query': query, 'format': 'json'})}"
    req = urllib.request.Request(url, headers={"User-Agent": "clarvia-lex/0.1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    bindings: list[dict[str, dict[str, str]]] = data.get("results", {}).get("bindings", [])
    return bindings


def discover_consolidations() -> list[dict[str, str]]:
    query = """
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
"""
    rows = sparql_query(query)
    results: list[dict[str, str]] = []
    for row in rows:
        results.append(
            {
                "work": row.get("work", {}).get("value", ""),
                "title": row.get("title", {}).get("value", ""),
                "file_url": row.get("fileUrl", {}).get("value", ""),
            }
        )
    return results


def instrument_key(work_uri: str) -> str:
    """Durable instrument URI without consolidation/version date."""
    clean = re.sub(r"/consolide/\d{8}$", "", work_uri.rstrip("/"))
    clean = re.sub(r"/\d{8}$", "", clean)
    return clean


def consolidation_date(work_uri: str) -> str:
    """Return YYYYMMDD sort key; empty string sorts last as unknown."""
    match = re.search(r"/consolide/(\d{8})", work_uri)
    if match:
        return match.group(1)
    match = re.search(r"/(\d{8})(?:/|$)", work_uri)
    if match:
        return match.group(1)
    return ""


def derive_stable_id(work_uri: str) -> tuple[str, str]:
    clean = instrument_key(work_uri)
    prefix = "http://data.legilux.public.lu/eli/etat/leg/"
    if not clean.startswith(prefix):
        raise ValueError(f"Non-leg ELI skipped upstream: {work_uri}")
    path = clean[len(prefix) :]
    parts = [p for p in path.split("/") if p]
    if not parts:
        return "lu/unknown", "unknown"

    doc_type = parts[0]
    if doc_type == "code":
        slug = f"code-{parts[1]}" if len(parts) > 1 else "code"
    elif doc_type == "constitution":
        slug = "constitution"
    elif doc_type == "loi":
        slug = "loi-" + "-".join(parts[1:])
    elif doc_type in {"rgd", "reglement_grand_ducal"}:
        slug = "rgd-" + "-".join(parts[1:])
    elif doc_type == "arr":
        slug = "arr-" + "-".join(parts[1:])
    elif doc_type == "recueil":
        slug = "recueil-" + "-".join(parts[1:])
    else:
        slug = doc_type + "-" + "-".join(parts[1:])

    slug = re.sub(r"[^a-z0-9]+", "-", slug.lower()).strip("-")
    return f"lu/{slug}", doc_type


def _norm(text: str) -> str:
    # Fold common French accents so keyword matching is robust.
    table = str.maketrans(
        {
            "à": "a",
            "â": "a",
            "ä": "a",
            "é": "e",
            "è": "e",
            "ê": "e",
            "ë": "e",
            "î": "i",
            "ï": "i",
            "ô": "o",
            "ö": "o",
            "ù": "u",
            "û": "u",
            "ü": "u",
            "ç": "c",
            "œ": "oe",
            "æ": "ae",
        }
    )
    return text.casefold().translate(table)


def classify_batch(
    stable_id: str, title: str, doc_type: str, preferred_format: str
) -> tuple[str, str | None]:
    if preferred_format == "pdf":
        return "skip", "pdf-only"

    if doc_type == "code":
        return "04-codes", None
    if doc_type == "constitution":
        return "05-state-admin", None

    t = _norm(f"{title} {stable_id}")

    rules: list[tuple[str, tuple[str, ...]]] = [
        (
            "05-state-admin",
            (
                "constitution",
                "commune",
                "communal",
                "fonction publique",
                "fonctionnaire",
                "depute",
                "chambre des deputes",
                "conseil d'etat",
                "conseil d etat",
                "magistrat",
                "organisation judiciaire",
                "etat civil",
                "nationalite",
                "elections",
                "referendum",
                "gouvernement",
            ),
        ),
        (
            "06-civil-family",
            (
                "bail a usage",
                "bail d habitation",
                "loyer",
                "succession",
                "mariage",
                "divorce",
                "famille",
                "tutelle",
                "adoption",
                "propriete",
                "copropriete",
                "hypotheque",
                "logement",
                "cadastre",
            ),
        ),
        (
            "07-labor-social",
            (
                "travail",
                "emploi",
                "salarie",
                "securite sociale",
                "adem",
                "chomage",
                "convention collective",
                "inspection du travail",
            ),
        ),
        (
            "08-commercial-finance",
            (
                "societe",
                "commercial",
                "banque",
                "cssf",
                "faillite",
                "assurance",
                "financier",
                "fonds d investissement",
                "opcvm",
                "aifm",
                "professionnels du secteur financier",
            ),
        ),
        (
            "09-tax-finance",
            (
                "impot",
                "taxe",
                "tva",
                "douane",
                "budget",
                "comptabilite",
                "enregistrement",
                "fiscal",
                "droits de succession",
            ),
        ),
        (
            "10-health-welfare",
            (
                "sante",
                "medical",
                "dependance",
                "handicap",
                "hopital",
                "soins",
                "allocations familiales",
                "pension",
                "caisse nationale",
            ),
        ),
        (
            "11-environment-energy",
            (
                "environnement",
                "nature",
                "eau",
                "energie",
                "agriculture",
                "dechets",
                "climat",
                "foret",
                "chasse",
                "peche",
            ),
        ),
        (
            "12-education-culture",
            (
                "enseignement",
                "ecole",
                "universite",
                "recherche",
                "culture",
                "media",
                "presse",
                "sport",
                "bibliotheque",
                "archives",
            ),
        ),
        (
            "13-transport",
            (
                "transport",
                "route",
                "circulation",
                "aviation",
                "ferroviaire",
                "navigation",
                "vehicule",
                "permis de conduire",
            ),
        ),
        (
            "14-security-data",
            (
                "police",
                "armee",
                "cnpd",
                "protection des donnees",
                "protection civile",
                "defense",
                "securite interieure",
                "armes",
            ),
        ),
    ]

    for batch_name, keywords in rules:
        if any(k in t for k in keywords):
            return batch_name, None

    return "15-tail", None


def preferred_format_for(formats: set[str]) -> str:
    if "xml" in formats:
        return "xml"
    if "html" in formats:
        return "html"
    return "pdf"


def main() -> None:
    print("Querying Casemates SPARQL endpoint...")
    raw_rows = discover_consolidations()
    print(f"Total raw consolidation manifestation rows: {len(raw_rows):,}")

    # instrument_key -> date -> aggregate
    instruments: dict[str, dict[str, dict[str, Any]]] = defaultdict(
        lambda: defaultdict(lambda: {"formats": set(), "urls": {}, "title": "", "work_uri": ""})
    )

    for row in raw_rows:
        work_uri = row["work"]
        if not work_uri:
            continue
        key = instrument_key(work_uri)
        dated = consolidation_date(work_uri) or "00000000"
        bucket = instruments[key][dated]
        bucket["work_uri"] = work_uri
        title = row["title"]
        if title and (not bucket["title"] or len(title) > len(bucket["title"])):
            bucket["title"] = title
        file_url = row["file_url"]
        if "/xml" in file_url:
            bucket["formats"].add("xml")
            bucket["urls"]["xml"] = file_url
        elif "/html" in file_url:
            bucket["formats"].add("html")
            bucket["urls"]["html"] = file_url
        elif "/pdf" in file_url:
            bucket["formats"].add("pdf")
            bucket["urls"]["pdf"] = file_url

    print(f"Unique instruments (before latest filter): {len(instruments):,}")

    catalog: list[CatalogEntry] = []
    batch_manifests: dict[str, list[str]] = defaultdict(list)
    skip_counts: dict[str, int] = defaultdict(int)
    stage_1b_count = 0

    for key in sorted(instruments):
        dated_map = instruments[key]
        latest_date = max(dated_map.keys())
        info = dated_map[latest_date]
        work_eli = info["work_uri"] or f"{key}/{latest_date}"
        stable_id, doc_type = derive_stable_id(key)
        title = info["title"] or stable_id
        preferred_format = preferred_format_for(info["formats"])

        if stable_id in STAGE_1B_PUBLISHED_IDS:
            batch_name = "stage-1b"
            skip_reason = None
            stage_1b_count += 1
        else:
            batch_name, skip_reason = classify_batch(stable_id, title, doc_type, preferred_format)

        entry = CatalogEntry(
            stable_id=stable_id,
            work_eli=work_eli,
            title=title,
            document_family=doc_type,
            preferred_format=preferred_format,
            batch=batch_name,
            skip_reason=skip_reason,
            approx_source_bytes=None,
        )
        catalog.append(entry)

        if batch_name == "skip":
            skip_counts[skip_reason or "unknown"] += 1
        elif batch_name != "stage-1b":
            batch_manifests[batch_name].append(stable_id)

    # Enforce uniqueness across all batch manifests.
    seen_ids: set[str] = set()
    collisions: list[str] = []
    for batch_name in [f.replace(".txt", "") for f in BATCH_FILES]:
        unique_ids: list[str] = []
        for sid in sorted(set(batch_manifests[batch_name])):
            if sid in seen_ids:
                collisions.append(sid)
                continue
            seen_ids.add(sid)
            unique_ids.append(sid)
        batch_manifests[batch_name] = unique_ids

    if collisions:
        raise SystemExit(
            "Duplicate stable IDs across batches after classification: "
            + ", ".join(sorted(set(collisions))[:20])
        )

    # Catalog must be 1:1 on stable_id.
    id_counts: dict[str, int] = defaultdict(int)
    for entry in catalog:
        id_counts[entry.stable_id] += 1
    dup_catalog = [sid for sid, count in id_counts.items() if count > 1]
    if dup_catalog:
        raise SystemExit(
            "Catalog still has duplicate stable_ids (latest consolidation failed): "
            + ", ".join(dup_catalog[:20])
        )

    batches_dir = Path("countries/lu/batches")
    batches_dir.mkdir(parents=True, exist_ok=True)

    catalog_path = batches_dir / "catalog.jsonl"
    with open(catalog_path, "w", encoding="utf-8", newline="\n") as handle:
        for item in catalog:
            handle.write(json.dumps(asdict(item), ensure_ascii=False) + "\n")
    print(f"Wrote {len(catalog)} catalog entries to {catalog_path}")

    digital_count = sum(1 for e in catalog if e.preferred_format in {"xml", "html"})
    ingestible_count = sum(len(v) for v in batch_manifests.values())

    for filename in BATCH_FILES:
        batch_key = filename.replace(".txt", "")
        ids = batch_manifests[batch_key]
        file_path = batches_dir / filename
        with open(file_path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(f"# Stage 2 batch manifest: {filename}\n")
            handle.write(f"# Total IDs: {len(ids)}\n")
            for sid in ids:
                handle.write(f"{sid}\n")
        print(f"Wrote {len(ids)} IDs to {file_path}")

    notes_path = batches_dir / "00-inventory-notes.md"
    with open(notes_path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("# Stage 2 Inventory & Classification Notes\n\n")
        handle.write("## Method\n\n")
        handle.write(
            "FILTER to `eli/etat/leg/` consolidations only. "
            "Titles via COALESCE of ELI + Jolux title predicates.\n\n"
        )
        handle.write("### SPARQL\n\n```sparql\n")
        handle.write("SELECT ?work ?title ?fileUrl WHERE {\n")
        handle.write(
            "  ?work a <http://data.legilux.public.lu/resource/ontology/jolux#Consolidation> .\n"
        )
        handle.write(
            '  FILTER(STRSTARTS(STR(?work), "http://data.legilux.public.lu/eli/etat/leg/"))\n'
        )
        handle.write(
            "  ?work <http://data.legilux.public.lu/resource/ontology/jolux#isRealizedBy> ?expr .\n"
        )
        handle.write(
            "  OPTIONAL { ?expr <http://data.europa.eu/eli/ontology#title> ?t1 . }\n"
            "  OPTIONAL { ?expr <http://www.europa.eu/eli/ontology#title> ?t2 . }\n"
            "  OPTIONAL { ?work <http://data.europa.eu/eli/ontology#title> ?t3 . }\n"
            "  OPTIONAL {\n"
            "    ?expr <http://data.legilux.public.lu/resource/ontology/jolux#title> ?t4 .\n"
            "  }\n"
            "  BIND(COALESCE(?t1, ?t2, ?t3, ?t4) AS ?title)\n"
        )
        handle.write(
            "  ?expr <http://data.legilux.public.lu/resource/ontology/jolux#isEmbodiedBy>"
            " ?manifest .\n"
        )
        handle.write(
            "  ?manifest <http://data.legilux.public.lu/resource/ontology/jolux#isExemplifiedBy>"
            " ?fileUrl .\n"
        )
        handle.write("}\n```\n\n")
        handle.write(
            "Note: `lu/loi-2024-07-31-a339` is Stage 1B HTML Journal memorial (`/jo`), "
            "not a Jolux Consolidation, so it does not appear in this Consolidation catalog.\n\n"
        )
        handle.write("### Latest consolidation only\n\n")
        handle.write(
            "Rows are grouped by durable instrument URI "
            "(strip `/consolide/YYYYMMDD` and trailing `/YYYYMMDD` for codes). "
            "Only the latest dated work is retained. Preferred format: XML > HTML > PDF.\n\n"
        )
        handle.write("### Classification\n\n")
        handle.write(
            "Each instrument is assigned to **exactly one** batch. "
            "`code` → `04-codes`; `constitution` → `05-state-admin`; "
            "otherwise keyword match on title+id; unmatched digital → `15-tail`. "
            "No round-robin. PDF-only → `skip` / `pdf-only`. "
            "Stage 1B IDs → catalog batch `stage-1b` (excluded from manifests).\n\n"
        )
        handle.write("## Inventory Counts\n\n")
        handle.write(f"- **Unique instruments (catalog rows):** {len(catalog):,}\n")
        handle.write(f"- **Digital (XML/HTML):** {digital_count:,}\n")
        handle.write(f"- **Stage 1B (already on main):** {stage_1b_count}\n")
        handle.write(f"- **Skipped (PDF-only):** {skip_counts.get('pdf-only', 0):,}\n")
        handle.write(f"- **Ingestible Stage 2 IDs (all manifests):** {ingestible_count:,}\n\n")
        handle.write("## Batch ID Manifest Summary\n\n")
        handle.write("| Batch File | Theme | Ingestible ID Count |\n|---|---|---|\n")
        for filename in BATCH_FILES:
            bkey = filename.replace(".txt", "")
            handle.write(f"| `{filename}` | {bkey} | {len(batch_manifests[bkey])} |\n")
        # Size budget on unique ingestible digital IDs (not historical row count).
        est_mib = ingestible_count * 0.25
        handle.write("\n## Size Budget Assessment\n\n")
        handle.write("- **Current Repo Size:** ~18 MiB tracked working tree\n")
        handle.write(
            f"- **Estimated retained source for ingestible IDs:** "
            f"~{ingestible_count:,} × ~250 KiB ≈ **{est_mib:.0f} MiB** uncompressed\n"
        )
        handle.write(
            "- **Estimated packed `.git` growth:** roughly 30–50% of uncompressed "
            "(order-of-magnitude only)\n"
        )
        verdict = "PASS" if est_mib < 700 else "REVIEW"
        handle.write(
            f"- **Packed repo verdict vs 900 MiB hard stop:** **{verdict}** "
            f"(estimate {est_mib:.0f} MiB sources before git packing)\n"
        )

    print(f"Wrote inventory notes to {notes_path}")
    print(
        f"Summary: catalog={len(catalog)} digital={digital_count} "
        f"pdf_skip={skip_counts.get('pdf-only', 0)} "
        f"stage1b={stage_1b_count} ingestible={ingestible_count}"
    )


if __name__ == "__main__":
    main()
