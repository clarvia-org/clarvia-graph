"""Characterization tests for LU Markdown fidelity (lists / paragraph wrappers)."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def _load_adapter():  # type: ignore[no-untyped-def]
    path = Path(__file__).resolve().parent.parent / "adapter.py"
    spec = importlib.util.spec_from_file_location("lu_adapter_fidelity", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["lu_adapter_fidelity"] = module
    spec.loader.exec_module(module)
    return module.adapter


def _article_body(markdown: str, anchor: str) -> str:
    needle = f'<a id="{anchor}"></a>'
    start = markdown.find(needle)
    assert start >= 0, f"missing anchor {anchor}"
    rest = markdown[start + len(needle) :]
    next_anchor = rest.find('<a id="')
    section = rest if next_anchor < 0 else rest[:next_anchor]
    lines = section.splitlines()
    # Drop blank lines and the ## heading
    body_lines: list[str] = []
    seen_heading = False
    for line in lines:
        if not seen_heading:
            if line.startswith("## "):
                seen_heading = True
            continue
        body_lines.append(line)
    return "\n".join(body_lines).strip()


def test_lists_fixture_art3_nonempty() -> None:
    adapter = _load_adapter()
    body = adapter.normalize_bytes((FIXTURES / "fidelity-lists-source.xml").read_bytes()).body
    art3 = _article_body(body, "art-3")
    assert art3, "Art. 3 must have body text (paragraph-wrapped lists)"
    assert (
        "conseil d'administration" in art3.casefold()
        or "conseil d’administration" in art3.casefold()
    )


def test_lists_fixture_art7_includes_resource_items() -> None:
    adapter = _load_adapter()
    body = adapter.normalize_bytes((FIXTURES / "fidelity-lists-source.xml").read_bytes()).body
    art7 = _article_body(body, "art-7")
    assert "Les ressources du Centre proviennent notamment" in art7
    assert "contributions inscrites au budget" in art7
    assert "dons et legs" in art7
    assert "emprunts" in art7


def test_lists_fixture_art13_ballpark_length() -> None:
    adapter = _load_adapter()
    body = adapter.normalize_bytes((FIXTURES / "fidelity-lists-source.xml").read_bytes()).body
    art13 = _article_body(body, "art-13")
    # Source article visible text is ~3.6k chars; heading-only/truncated was ~366.
    assert len(art13) >= 1500, f"Art. 13 too short ({len(art13)} chars)"
    assert "(1)" in art13
    assert "fonctionnaires" in art13.casefold()


def test_lists_fixture_art2_retains_mission_list() -> None:
    adapter = _load_adapter()
    body = adapter.normalize_bytes((FIXTURES / "fidelity-lists-source.xml").read_bytes()).body
    art2 = _article_body(body, "art-2")
    assert "vocation sportive" in art2
    assert "vocation culturelle" in art2


def test_paragraph_fixture_articles_nonempty() -> None:
    adapter = _load_adapter()
    body = adapter.normalize_bytes((FIXTURES / "fidelity-paragraph-source.xml").read_bytes()).body
    assert '<a id="art-1er"></a>' in body
    art1 = _article_body(body, "art-1er")
    assert art1, "paragraph-wrapped Art. 1er must not be empty"
    assert len(art1) >= 200


def test_embedded_text_retained_inline() -> None:
    """Amending formula quotes in <embeddedText> must not be dropped."""
    xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD13"
            xmlns:scl="http://www.scl.lu">
  <act>
    <body>
      <article id="art_1">
        <num>Art. 1er.</num>
        <alinea>
          <content>
            <p>Les mots <embeddedText>un directeur adjoint</embeddedText>
            sont remplaces par les mots
            <embeddedText>deux directeurs adjoints</embeddedText>.</p>
          </content>
        </alinea>
      </article>
    </body>
  </act>
</akomaNtoso>
"""
    adapter = _load_adapter()
    body = adapter.normalize_bytes(xml).body
    assert "un directeur adjoint" in body
    assert "deux directeurs adjoints" in body
