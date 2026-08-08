from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import pytest

from lex.adapters import LawRef, SourceDocument
from lex.errors import ErrorCode, LexError
from lex.markdown import extract_provision, normalize_anchor

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def _load_adapter():  # type: ignore[no-untyped-def]
    import importlib.util
    import sys

    path = Path(__file__).resolve().parent.parent / "adapter.py"
    spec = importlib.util.spec_from_file_location("lu_adapter_under_test", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["lu_adapter_under_test"] = module
    spec.loader.exec_module(module)
    return module.adapter


def test_stable_id_and_discovery_selects_latest_xml() -> None:
    adapter = _load_adapter()
    payload = json.loads((FIXTURES / "discovery.json").read_text(encoding="utf-8"))
    ref = adapter.parse_discovery(payload)
    assert ref.id == "lu/code-civil"
    assert ref.language == "fr"
    assert ref.eli_uri.endswith("/20251226")
    assert "/xml/" in ref.source_url
    assert "20251226" in ref.source_url


def test_source_selection_prefers_xml_over_html() -> None:
    adapter = _load_adapter()
    payload = {
        "results": {
            "bindings": [
                {
                    "work": {
                        "type": "uri",
                        "value": "http://data.legilux.public.lu/eli/etat/leg/code/civil/20251226",
                    },
                    "fileUrl": {
                        "type": "uri",
                        "value": (
                            "http://data.legilux.public.lu/filestore/eli/etat/leg/code/civil/"
                            "20251226/fr/html/eli-etat-leg-code-civil-20251226-fr-html.html"
                        ),
                    },
                },
                {
                    "work": {
                        "type": "uri",
                        "value": "http://data.legilux.public.lu/eli/etat/leg/code/civil/20251226",
                    },
                    "fileUrl": {
                        "type": "uri",
                        "value": (
                            "http://data.legilux.public.lu/filestore/eli/etat/leg/code/civil/"
                            "20251226/fr/xml/eli-etat-leg-code-civil-20251226-fr-xml.xml"
                        ),
                    },
                },
            ]
        }
    }
    ref = adapter.parse_discovery(payload)
    assert ref.source_url.endswith(".xml")


def test_registry_covers_active_batches() -> None:
    _load_adapter()
    import sys

    module = sys.modules["lu_adapter_under_test"]
    ids = {spec.id for spec in module.LAWS}
    assert "lu/code-civil" in ids
    assert "lu/loi-2024-07-31-a339" in ids
    assert len(ids) == 1207  # 755 prior + 452 tail
    assert "lu/loi-1817-12-27-n1" in ids
    assert "lu/conv-2016-12-21-n1" in ids
    assert "lu/loi-1915-08-10-n1" in ids
    assert "lu/agd-1923-06-29-n1" in ids
    assert "lu/loi-1876-03-20-n1" in ids
    assert "lu/a-1938-01-14-n1" in ids
    assert "lu/agd-1913-02-14-n1" in ids
    assert "lu/loi-1843-01-13-n1" in ids
    assert "lu/amin-2022-07-15-a355" in ids
    assert "lu/agd-1904-01-16-n2" in ids
    constitution = module.LAWS_BY_ID["lu/constitution"]
    assert constitution.languages == ("fr", "de")
    html_law = module.LAWS_BY_ID["lu/loi-2024-07-31-a339"]
    assert html_law.format == "html"
    assert module.LAWS_BY_ID["lu/rgd-2024-12-20-a595"].warning_mode == "rectification"
    assert module.LAWS_BY_ID["lu/code-civil"].resolve_latest is True
    for code_id in (
        "lu/code-consommation",
        "lu/code-fonction-publique",
        "lu/code-instruction-criminelle",
        "lu/code-procedure-penale",
    ):
        assert code_id in ids
        assert module.LAWS_BY_ID[code_id].format == "xml"
    assert "lu/agc-2025-04-04-a132" in ids
    assert module._filestore_url(
        "http://data.legilux.public.lu/eli/etat/leg/code/consommation/20260515",
        "fr",
        "xml",
    ).endswith("eli-etat-leg-code-consommation-20260515-fr-xml.xml")


def test_ordinary_normalization_matches_fixture() -> None:
    adapter = _load_adapter()
    content = (FIXTURES / "ordinary-source.xml").read_bytes()
    expected = (FIXTURES / "expected-ordinary.md").read_text(encoding="utf-8")
    body = adapter.normalize_bytes(content).body
    assert body == expected
    assert '<a id="art-1er"></a>' in body
    assert '<a id="art-2"></a>' in body
    assert '<a id="art-13"></a>' in body


def test_complex_normalization_matches_fixture() -> None:
    adapter = _load_adapter()
    content = (FIXTURES / "complex-source.xml").read_bytes()
    expected = (FIXTURES / "expected-complex.md").read_text(encoding="utf-8")
    assert adapter.normalize_bytes(content).body == expected


def test_html_normalization_matches_fixture() -> None:
    adapter = _load_adapter()
    content = (FIXTURES / "ordinary-source.html").read_bytes()
    expected = (FIXTURES / "expected-ordinary-html.md").read_text(encoding="utf-8")
    ref = LawRef(id="lu/loi-2024-07-31-a339", language="fr", source_url="fixture://html")
    source = SourceDocument(
        content=content,
        extension="html",
        final_url="fixture://html",
        media_type="text/html",
        retrieved_at=datetime(2026, 1, 1, tzinfo=UTC),
        title="Loi",
        document_type="law",
        status="official_current",
    )
    normalized = adapter.normalize(ref, source)
    assert normalized.body == expected
    assert '<a id="art-1er"></a>' in normalized.body
    assert "Art. 1" in normalized.body


def test_normalization_is_deterministic() -> None:
    adapter = _load_adapter()
    content = (FIXTURES / "ordinary-source.xml").read_bytes()
    first = adapter.normalize_bytes(content).body
    second = adapter.normalize_bytes(content).body
    assert first == second


def test_invalid_browser_shell_rejected() -> None:
    adapter = _load_adapter()
    content = (FIXTURES / "invalid-response.html").read_bytes()
    with pytest.raises(LexError) as exc:
        adapter.normalize_bytes(content)
    assert exc.value.code == ErrorCode.LEX_INVALID_DATA


def test_parse_jolux_dates() -> None:
    _load_adapter()
    import sys
    from datetime import date

    module = sys.modules["lu_adapter_under_test"]
    assert module._parse_jolux_date("2024-06-26") == date(2024, 6, 26)
    assert module._parse_jolux_date("26 juin 2024") == date(2024, 6, 26)
    assert module._parse_jolux_date("1er janvier 2025") == date(2025, 1, 1)
    assert module._parse_jolux_date("not-a-date") is None


def test_xml_article_id_preserves_trailing_marker() -> None:
    _load_adapter()
    import sys

    module = sys.modules["lu_adapter_under_test"]
    assert module._normalize_xml_article_id("art_5") == "art-5"
    assert module._normalize_xml_article_id("art_5-") == "art-5-"
    assert module._normalize_xml_article_id("art_1er") == "art-1er"


def test_anchor_normalization() -> None:
    assert normalize_anchor("art_13") == "art-13"
    assert normalize_anchor("art_1er") == "art-1er"
    assert normalize_anchor("Art. 13.") == "art-13"
    assert normalize_anchor("art_97_et_98") == "art-97-et-98"


def test_provision_extraction_nested_without_neighbors() -> None:
    adapter = _load_adapter()
    body = adapter.normalize_bytes((FIXTURES / "ordinary-source.xml").read_bytes()).body
    markdown = (
        "---\n"
        "id: lu/code-civil\n"
        "country: lu\n"
        "title: Code civil\n"
        "language: fr\n"
        "document_type: code\n"
        "status: official_consolidation\n"
        "official_id: Code civil\n"
        "source_url: https://example.test/source.xml\n"
        "source_file: source.xml\n"
        "source_sha256: " + ("a" * 64) + "\n"
        "source_license: CC-BY-4.0\n"
        "source_attribution: Service central de législation, Luxembourg\n"
        "source_terms_url: https://data.legilux.public.lu/home/intro\n"
        "rights_reviewed_at: '2026-07-21'\n"
        "retrieved_at: '2026-07-21T12:00:00Z'\n"
        "---\n\n"
        f"{body}"
    )
    extracted = extract_provision(markdown, "art-13")
    assert "provision: art-13" in extracted
    assert "Art. 13." in extracted
    assert "Art. 1er." not in extracted
    assert "Art. 2." not in extracted
