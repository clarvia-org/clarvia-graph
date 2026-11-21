"""Tests for source rendering before the Lex sign-off and HTML linkification."""

from __future__ import annotations

from app.email.composition import compose_lex_email, render_response_html
from app.llm.schema import LexSource
from app.llm.source_render import (
    insert_sources_before_signoff,
    linkify_citation_markers_html,
    render_sources_block,
)

from .conftest import make_answer_response

_SOURCE = LexSource(
    id=1,
    title="Death registration guide",
    publisher="Guichet.lu",
    url="https://guichet.public.lu",
)


def test_render_sources_block_formats_entries() -> None:
    response = make_answer_response(sources=[_SOURCE])
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


def test_linkify_citation_markers_html() -> None:
    html = linkify_citation_markers_html(
        "<p>Contact the office [1] today.</p>",
        [_SOURCE],
    )
    assert 'href="https://guichet.public.lu"' in html
    assert "[1]" in html


def test_render_response_html_links_citations() -> None:
    body = "Contact the Commune office [1].\n\nLex."
    html = render_response_html(body, sources=[_SOURCE])
    assert "guichet.public.lu" in html
    assert "[1]" in html


def test_plain_part_keeps_bracket_citations() -> None:
    body = "Contact the Commune office [1].\n\nLex."
    message = compose_lex_email(
        response_body_markdown=body,
        to_addresses=["user@example.com"],
        cc_addresses=[],
        subject="Re: test",
        outbound_message_id="<out@clarvia.org>",
        in_reply_to="<in@example.com>",
        references=[],
        request_id="req-1",
        prompt_version="lex-v1",
        sources=[_SOURCE],
    )
    plain = next(
        part.get_content()
        for part in message.iter_parts()
        if part.get_content_type() == "text/plain"
    )
    assert "[1]" in plain
    assert "href=" not in plain
