"""Insert the application-owned source list before the Lex sign-off (section 22)."""

from __future__ import annotations

import html as html_module
import re
from collections.abc import Sequence

from app.llm.schema import LexResponse, LexSource

_SIGN_OFF_RE = re.compile(r"(?:^|\n)Lex\.\s*$")
_CITATION_MARKER_RE = re.compile(r"\[(\d+)\]")


def render_sources_block(response: LexResponse) -> str:
    """Build the plain-text ``Sources checked`` section from structured sources."""
    if not response.sources:
        return ""
    lines = ["Sources checked:"]
    for source in response.sources:
        label = source.publisher.strip()
        title = source.title.strip()
        entry = f"{label}, {title}" if label and title else title or label
        lines.append(f"[{source.id}] {entry}")
    return "\n".join(lines)


def linkify_citation_markers_html(
    html: str,
    sources: Sequence[LexSource],
) -> str:
    """Turn ``[n]`` markers into clickable links in the HTML alternative only."""
    by_id = {source.id: str(source.url) for source in sources}
    if not by_id:
        return html

    def _replace(match: re.Match[str]) -> str:
        source_id = int(match.group(1))
        url = by_id.get(source_id)
        if url is None:
            return match.group(0)
        escaped_url = html_module.escape(url, quote=True)
        return f'<a href="{escaped_url}">[{source_id}]</a>'

    return _CITATION_MARKER_RE.sub(_replace, html)


def insert_sources_before_signoff(body_markdown: str, response: LexResponse) -> str:
    """Insert ``Sources checked`` immediately before the final ``Lex.`` sign-off."""
    sources_block = render_sources_block(response)
    if not sources_block:
        return body_markdown

    match = _SIGN_OFF_RE.search(body_markdown)
    if match is None:
        return body_markdown

    prefix = body_markdown[: match.start()].rstrip()
    suffix = body_markdown[match.start() :]
    return f"{prefix}\n\n{sources_block}\n\n{suffix}"


__all__ = [
    "render_sources_block",
    "linkify_citation_markers_html",
    "insert_sources_before_signoff",
]
