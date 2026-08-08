from lex.markdown import extract_provision, normalize_anchor


def test_normalize_anchor() -> None:
    assert normalize_anchor("art_13") == "art-13"
    assert normalize_anchor("__Art__13__") == "art-13"


def test_extract_provision_stops_at_same_level() -> None:
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
source_attribution: Example
source_terms_url: https://example.test/terms
rights_reviewed_at: '2026-01-01'
retrieved_at: '2026-01-01T00:00:00Z'
---

# Sample

<a id="art-1"></a>
## Article 1

Body one.

<a id="art-1-1"></a>
### Article 1-1

Nested.

<a id="art-2"></a>
## Article 2

Body two.
"""
    result = extract_provision(markdown, "art-1")
    assert "Body one." in result
    assert "Nested." in result
    assert "Body two." not in result
    assert "provision: art-1" in result
