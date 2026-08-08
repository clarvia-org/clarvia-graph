"""Tests for agent-facing provision JSON and search matched_on (Phase 1)."""

from __future__ import annotations

import json
from pathlib import Path

from click.testing import CliRunner

from lex.cli import main
from lex.evidence import (
    normalize_for_search,
    provision_heading_path,
    provision_plain_text,
)
from lex.frontmatter import parse_frontmatter
from lex.markdown import extract_provision

REPO_ROOT = Path(__file__).resolve().parents[1]
AGD = REPO_ROOT / "countries/lu/laws/agd-1946-03-30-n9/current.md"


def test_normalize_for_search_diacritics_and_apostrophes() -> None:
    assert normalize_for_search("décoration") == normalize_for_search("decoration")
    assert normalize_for_search("d’une") == normalize_for_search("d'une")
    assert "decoration civique" in normalize_for_search("institution d'une décoration civique")


def test_heading_re_ignores_hash_lines_without_space() -> None:
    """Search heading extraction must use HEADING_RE, not startswith('#')."""
    from lex.markdown import HEADING_RE

    body = "#TitleWithoutSpace\n## Real Heading\n#anchor\n###  Spaced\n"
    labels = [
        match.group(2).strip() for line in body.splitlines() if (match := HEADING_RE.match(line))
    ]
    assert labels == ["Real Heading", "Spaced"]


def test_heading_path_agd_art3_no_invented_chapters() -> None:
    _, body = parse_frontmatter(AGD.read_text(encoding="utf-8"))
    assert provision_heading_path(body, "art-3") == ["Art. 3."]


def test_heading_path_structural_stack_excludes_provision_headings() -> None:
    body = """
# Document Title

### Titre Ier. First title.

<a id="art-1"></a>
## Art. 1.

Body.

### Titre II. Second title.

<a id="art-2"></a>
## Art. 2.

More.
"""
    assert provision_heading_path(body, "art-1") == ["Titre Ier. First title.", "Art. 1."]
    assert provision_heading_path(body, "art-2") == ["Titre II. Second title.", "Art. 2."]


def test_provision_plain_text_strips_anchor_and_heading_marks() -> None:
    md = '<a id="art-3"></a>\n## Art. 3.\n\nLa décoration comprend deux degrés.\n'
    plain = provision_plain_text(md)
    assert "<a id=" not in plain
    assert "##" not in plain
    assert plain.startswith("Art. 3.")
    assert "décoration" in plain


def test_get_provision_markdown_byte_identical_to_extract() -> None:
    """Non-JSON provision output must stay byte-for-byte identical."""
    text = AGD.read_text(encoding="utf-8")
    expected = extract_provision(text, "art-3")
    runner = CliRunner()
    result = runner.invoke(main, ["get", "lu/agd-1946-03-30-n9", "--provision", "art-3"])
    assert result.exit_code == 0
    # Click may or may not add a final newline depending on nl=; compare normalized.
    assert result.output.replace("\r\n", "\n").rstrip("\n") == expected.replace(
        "\r\n", "\n"
    ).rstrip("\n")


def test_get_provision_json_evidence_shape() -> None:
    runner = CliRunner()
    result = runner.invoke(
        main,
        ["get", "lu/agd-1946-03-30-n9", "--provision", "art-3", "--json"],
    )
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)

    assert data["provision_id"] == "lu/agd-1946-03-30-n9/art-3"
    assert data["document_id"] == "lu/agd-1946-03-30-n9"
    assert data["anchor"] == "art-3"
    assert data["heading_path"] == ["Art. 3."]
    assert "warning" in data
    assert "legal authority" in data["warning"]
    assert data["published_at"] == "1946-04-29"
    assert data["consolidated_at"] == "2004-01-04"
    assert "retrieved_at" in data

    assert '<a id="art-3"></a>' in data["markdown"]
    assert data["markdown"].lstrip().startswith("<a id=")
    assert "metadata" not in data
    assert "body" not in data

    assert data["character_count"] == len(data["plain_text"])
    assert data["word_count"] == len(data["plain_text"].split())
    assert data["word_count"] > 0

    citation = data["citation"]
    assert citation["publisher"] == "Service central de législation, Luxembourg"
    assert citation["label"] == "Art. 3."
    formatted = citation["formatted"]
    assert data["title"] in formatted
    assert "Art. 3." in formatted
    assert citation["publisher"] in formatted
    assert citation.get("source_url") or citation.get("eli_uri")
    locator = citation.get("source_url") or citation.get("eli_uri")
    assert locator in formatted

    forbidden = {"valid_from", "valid_to", "is_current", "applicable_from", "version_type"}
    assert forbidden.isdisjoint(data.keys())


def test_get_json_without_provision_keeps_metadata_body() -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["get", "lu/agd-1946-03-30-n9", "--json"])
    assert result.exit_code == 0
    data = json.loads(result.output)
    assert set(data.keys()) == {"metadata", "body"}
    assert data["metadata"]["id"] == "lu/agd-1946-03-30-n9"
    assert "provision_id" not in data


def test_provision_json_serializes_unquoted_yaml_dates() -> None:
    """Unquoted YAML dates must not blow up json.dumps (date/datetime objects)."""
    from lex.evidence import build_provision_evidence

    markdown = """---
id: xx/sample
country: xx
title: Sample
language: en
document_type: law
status: official_current
official_id: S-1
source_url: https://example.test
source_file: source.html
source_sha256: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
source_license: CC-BY-4.0
source_attribution: Example Publisher
source_terms_url: https://example.test/terms
rights_reviewed_at: 2026-01-01
published_at: 1946-04-29
consolidated_at: 2004-01-04
retrieved_at: 2026-07-21T21:21:12Z
warning: Cite the official source.
---

<a id="art-1"></a>
## Art. 1.

Body one.
"""
    meta, _ = parse_frontmatter(markdown)
    assert type(meta["published_at"]).__name__ == "date"
    assert type(meta["retrieved_at"]).__name__ == "datetime"

    evidence = build_provision_evidence(markdown, "art-1")
    dumped = json.dumps(evidence)
    data = json.loads(dumped)
    assert data["published_at"] == "1946-04-29"
    assert data["consolidated_at"] == "2004-01-04"
    assert data["retrieved_at"] == "2026-07-21T21:21:12Z"
    assert data["warning"] == "Cite the official source."


def test_get_json_serializes_unquoted_yaml_dates(tmp_path: Path) -> None:
    """Whole-law lex get --json must serialize unquoted YAML dates."""
    import hashlib
    import shutil
    from contextlib import chdir

    from lex.evidence import jsonable_metadata

    src = Path(__file__).parent / "fixtures/sample_dataset"
    dataset = tmp_path / "dataset"
    shutil.copytree(src, dataset)
    md_path = dataset / "countries/xx/laws/sample-law/current.md"
    source_path = dataset / "countries/xx/laws/sample-law/source.html"
    sha = hashlib.sha256(source_path.read_bytes()).hexdigest()
    md_path.write_text(
        f"""---
id: xx/sample-law
country: xx
title: Test Law of 2026
language: en
document_type: law
status: official_current
official_id: TEST-2026-001
source_url: https://example.gov.xx/laws/2026/001
source_file: source.html
source_sha256: {sha}
source_license: CC-BY-4.0
source_attribution: Test Official Publisher, Testland
source_terms_url: https://example.gov.xx/terms
rights_reviewed_at: 2026-01-01
published_at: 1946-04-29
consolidated_at: 2004-01-04
retrieved_at: 2026-07-21T21:21:12Z
---

# Test Law of 2026

<a id="art-1"></a>
## Article 1

First provision text.
""",
        encoding="utf-8",
    )
    meta, _ = parse_frontmatter(md_path.read_text(encoding="utf-8"))
    assert type(meta["published_at"]).__name__ == "date"
    assert type(meta["retrieved_at"]).__name__ == "datetime"
    assert json.dumps(jsonable_metadata(meta))

    runner = CliRunner()
    with chdir(dataset):
        result = runner.invoke(main, ["get", "xx/sample-law", "--json"])
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert set(data.keys()) == {"metadata", "body"}
    assert data["metadata"]["published_at"] == "1946-04-29"
    assert data["metadata"]["consolidated_at"] == "2004-01-04"
    assert data["metadata"]["retrieved_at"] == "2026-07-21T21:21:12Z"


def test_search_diacritic_normalization_and_matched_on() -> None:
    runner = CliRunner()
    accented = runner.invoke(
        main,
        ["search", "décoration civique", "--country", "lu", "--json"],
    )
    plain = runner.invoke(
        main,
        ["search", "decoration civique", "--country", "lu", "--json"],
    )
    assert accented.exit_code == 0, accented.output
    assert plain.exit_code == 0, plain.output

    accented_hits = json.loads(accented.output)
    plain_hits = json.loads(plain.output)
    assert any(h["id"] == "lu/agd-1946-03-30-n9" for h in accented_hits)
    assert any(h["id"] == "lu/agd-1946-03-30-n9" for h in plain_hits)

    hit = next(h for h in plain_hits if h["id"] == "lu/agd-1946-03-30-n9")
    assert "matched_on" in hit
    assert isinstance(hit["matched_on"], list)
    assert len(hit["matched_on"]) >= 1
    # Every listed field must be from the stable order; list is sorted by that order.
    order = ["id", "title", "official_id", "eli_uri", "document_type", "heading", "body"]
    assert hit["matched_on"] == [f for f in order if f in hit["matched_on"]]
    assert "title" in hit["matched_on"] or "body" in hit["matched_on"]
