"""Tests for source rendering before the Lex sign-off."""

from __future__ import annotations

from app.llm.schema import LexSource
from app.llm.source_render import insert_sources_before_signoff, render_sources_block

from .conftest import make_answer_response


def test_render_sources_block_formats_entries() -> None:
    response = make_answer_response(
        sources=[
            LexSource(
                id=1,
                title="Death registration guide",
                publisher="Guichet.lu",
                url="https://guichet.public.lu",
            )
        ]
    )
    block = render_sources_block(response)
    assert block.startswith("Sources checked:")
    assert "[1] Guichet.lu, Death registration guide" in block


def test_insert_sources_before_signoff() -> None:
    response = make_answer_response(
        body_markdown="Contact the Commune office [1].\n\nLex."
    )
    rendered = insert_sources_before_signoff(response.body_markdown, response)
    assert "Sources checked:" in rendered
    assert rendered.index("Sources checked:") < rendered.index("Lex.")
