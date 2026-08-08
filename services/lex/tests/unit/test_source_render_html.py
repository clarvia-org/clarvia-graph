"""HTML-only citation linkification (blueprint section 22)."""

from __future__ import annotations

from app.email.composition import compose_lex_email, render_response_html
from app.llm.schema import LexSource
from app.llm.source_render import linkify_citation_markers_html

_SOURCE = LexSource(
    id=1,
    title="Death registration guide",
    publisher="Guichet.lu",
    url="https://guichet.public.lu",
)


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
