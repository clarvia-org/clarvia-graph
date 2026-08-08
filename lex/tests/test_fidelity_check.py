"""Word-parity fidelity gate tests."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from typing import Any

from lex.fidelity import (
    WORD_COUNT_MARGIN,
    analyze_law_fidelity,
    build_fidelity_report,
    check_law_fidelity,
    markdown_body_words,
    xml_body_words,
)
from lex.frontmatter import parse_frontmatter, serialize_frontmatter

FIXTURES = Path("countries/lu/fixtures")
LAW = Path("countries/lu/laws/loi-2000-06-29-n2")
CODE = Path("countries/lu/laws/code-consommation")


def _load_adapter() -> Any:
    path = Path("countries/lu/adapter.py")
    spec = importlib.util.spec_from_file_location("lu_adapter_word_parity", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["lu_adapter_word_parity"] = module
    spec.loader.exec_module(module)
    return module.adapter


def test_fidelity_fails_on_broken_projection(tmp_path: Path) -> None:
    source = (LAW / "source.xml").read_bytes()
    original = (LAW / "current.md").read_text(encoding="utf-8")
    meta, _ = parse_frontmatter(original)
    broken_body = (FIXTURES / "broken-loi-2000-body.md").read_text(encoding="utf-8")
    md_text = serialize_frontmatter(meta) + "\n" + broken_body
    (tmp_path / "source.xml").write_bytes(source)
    md_path = tmp_path / "current.md"
    md_path.write_text(md_text, encoding="utf-8")

    errors = check_law_fidelity(md_path)
    assert errors, "expected word-parity failure on truncated projection"
    assert "unexplained" in errors[0].message.casefold()
    assert "per-article first differences" in errors[0].message.casefold()
    assert "first diff at token" in errors[0].message.casefold()


def test_article_first_difference_points_at_truncation() -> None:
    from lex.fidelity import article_first_differences_xml

    source = (LAW / "source.xml").read_bytes()
    broken_body = (FIXTURES / "broken-loi-2000-body.md").read_text(encoding="utf-8")
    diffs = article_first_differences_xml(source, broken_body)
    assert diffs, "expected at least one article-level first difference"
    assert diffs[0].kind in {"mismatch", "missing_in_md"}
    assert diffs[0].article_id


def test_boundary_equivalence_recognizes_known_glue() -> None:
    report = build_fidelity_report(
        ["ladirective", "no", "erbis", "laloi", "uedu", "other"],
        ["la", "directive", "n", "o", "er", "bis", "la", "loi", "ue", "du", "other"],
    )
    assert report.recognized_boundary_differences >= 4
    assert report.unexplained_source_only_tokens == 0
    assert report.exact_canonical_token_match is False


def test_ordinal_bridge_prefers_digit_before_bare_erbis() -> None:
    """``1``+``erbis`` must pair with ``1er``+``bis`` before ``erbis``→``er``+``bis``."""
    report = build_fidelity_report(
        ["1", "1", "1", "erbis", "erbis", "erbis", "keep"],
        ["1er", "bis", "1er", "bis", "1er", "bis", "keep"],
    )
    assert report.unexplained_source_only_tokens == 0
    assert report.unexplained_markdown_only_tokens == 0
    assert report.recognized_boundary_differences == 3


def test_boundary_equivalence_rejects_arbitrary_splits() -> None:
    report = build_fidelity_report(
        ["chaton", "keep"],
        ["chat", "on", "keep"],
    )
    assert report.recognized_boundary_differences == 0
    assert report.unexplained_source_only_tokens == 1


def test_renormalized_loi_2000_within_margin(tmp_path: Path) -> None:
    adapter = _load_adapter()
    source = (LAW / "source.xml").read_bytes()
    body = adapter.normalize_bytes(source).body
    original = (LAW / "current.md").read_text(encoding="utf-8")
    meta, _ = parse_frontmatter(original)
    (tmp_path / "source.xml").write_bytes(source)
    md_path = tmp_path / "current.md"
    md_path.write_text(serialize_frontmatter(meta) + "\n" + body, encoding="utf-8")
    errors = check_law_fidelity(md_path)
    assert not errors, [e.message for e in errors]
    report = analyze_law_fidelity(md_path)
    assert report is not None
    assert report.ok
    assert report.unexplained_source_only_tokens == 0


def test_renormalized_code_consommation_word_parity() -> None:
    adapter = _load_adapter()
    source = (CODE / "source.xml").read_bytes()
    body = adapter.normalize_bytes(source, title="Code de la consommation").body
    report = build_fidelity_report(xml_body_words(source), markdown_body_words(body))
    assert report.source_tokens
    assert report.unexplained_source_only_tokens / report.source_tokens <= WORD_COUNT_MARGIN


def test_renormalized_code_fonction_publique_exact_parity() -> None:
    adapter = _load_adapter()
    law = Path("countries/lu/laws/code-fonction-publique")
    source = (law / "source.xml").read_bytes()
    body = adapter.normalize_bytes(source, title="Code de la fonction publique").body
    report = build_fidelity_report(xml_body_words(source), markdown_body_words(body))
    assert report.source_tokens
    assert report.ok
    assert report.missing_articles == 0
    assert report.source_articles == report.markdown_articles
    assert report.unexplained_source_only_tokens == 0
    assert report.unexplained_markdown_only_tokens == 0
    assert report.source_only_tokens == 0
    assert report.markdown_only_tokens == 0
    assert report.exact_canonical_token_match is True
