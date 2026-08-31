"""Dead-link strip: drop 404/410/DNS/refused; keep 403/timeout; fail open."""

from __future__ import annotations

import logging
import socket
import urllib.error

import pytest
from app.infrastructure.openai import FakeLlmAdapter, generation_result_from_response
from app.llm.schema import LexContact, LexSource
from app.llm.url_liveness import (
    find_dead_urls,
    keep_after_error,
    keep_after_status,
    strip_dead_urls,
)
from app.services.model_pipeline import run_model_pipeline

from .conftest import make_answer_response


def test_keep_after_status_drops_only_gone_pages() -> None:
    assert keep_after_status(200) is True
    assert keep_after_status(301) is True
    assert keep_after_status(403) is True
    assert keep_after_status(429) is True
    assert keep_after_status(500) is True
    assert keep_after_status(404) is False
    assert keep_after_status(410) is False


def test_keep_after_error_drops_dns_and_refused_only() -> None:
    assert keep_after_error(TimeoutError()) is True
    assert keep_after_error(socket.gaierror()) is False
    assert keep_after_error(ConnectionRefusedError()) is False
    assert keep_after_error(urllib.error.URLError(TimeoutError())) is True
    assert keep_after_error(urllib.error.URLError(socket.gaierror())) is False
    assert keep_after_error(RuntimeError("boom")) is True


def test_strip_drops_404_source_and_rewrites_markers() -> None:
    body = (
        "Contact the Commune office [1]. The other registry page [2].\n\nLex."
    )
    sources = [
        LexSource(
            id=1,
            title="Death registration guide",
            publisher="Government of Luxembourg",
            url="https://guichet.public.lu",
        ),
        LexSource(
            id=2,
            title="Gone page",
            publisher="Example",
            url="https://example.com/gone",
        ),
    ]
    contacts = [
        LexContact(
            id=1,
            name="Commune office",
            kind="authority",
            country_code="LU",
            website="https://guichet.public.lu",
            phone=None,
            email=None,
            commercial=False,
            note="Handles death registration.",
            source_id=1,
        )
    ]

    def probe(url: str) -> bool:
        return "gone" not in url

    new_body, new_sources, new_contacts = strip_dead_urls(
        body, sources, contacts, probe=probe
    )

    assert [source.url for source in new_sources] == ["https://guichet.public.lu"]
    assert new_sources[0].id == 1
    assert "[2]" not in new_body
    assert "[1]" in new_body
    assert len(new_contacts) == 1


def test_strip_keeps_403_and_timeout_urls() -> None:
    body = "See the ministry [1] and the registry [2].\n\nLex."
    sources = [
        LexSource(
            id=1,
            title="Ministry",
            publisher="Gov",
            url="https://example.com/forbidden",
        ),
        LexSource(
            id=2,
            title="Registry",
            publisher="Gov",
            url="https://example.com/slow",
        ),
    ]

    def probe(url: str) -> bool:
        return True

    new_body, new_sources, new_contacts = strip_dead_urls(
        body, sources, [], probe=probe
    )
    assert len(new_sources) == 2
    assert new_contacts == []
    assert "[1]" in new_body and "[2]" in new_body


def test_strip_fails_open_when_probe_raises() -> None:
    body = "Contact the Commune office [1].\n\nLex."
    sources = [
        LexSource(
            id=1,
            title="Death registration guide",
            publisher="Government of Luxembourg",
            url="https://guichet.public.lu",
        )
    ]

    def probe(_url: str) -> bool:
        raise RuntimeError("network down")

    new_body, new_sources, _contacts = strip_dead_urls(
        body, sources, [], probe=probe
    )
    assert len(new_sources) == 1
    assert "[1]" in new_body


def test_find_dead_urls_unfinished_probes_are_kept() -> None:
    dead = find_dead_urls(
        ["https://example.com/a"],
        probe=lambda _url: True,
    )
    assert dead == frozenset()


def test_pipeline_drops_dead_source_before_send(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.setattr(
        "app.llm.url_liveness.probe_url",
        lambda url, *_args, **_kwargs: "gone" not in url,
    )
    live = "https://guichet.public.lu"
    gone = "https://example.com/gone"
    response = make_answer_response(
        body_markdown=(
            "Contact the Commune office [1]. Ignore this stale page [2].\n\nLex."
        ),
        sources=[
            LexSource(
                id=1,
                title="Death registration guide",
                publisher="Government of Luxembourg",
                url=live,
            ),
            LexSource(
                id=2,
                title="Gone page",
                publisher="Example",
                url=gone,
            ),
        ],
    )
    allowed = frozenset({live, gone})
    llm = FakeLlmAdapter(
        responses=[generation_result_from_response(response, source_urls=allowed)]
    )
    with caplog.at_level(logging.INFO):
        result = run_model_pipeline(
            llm,
            system_prompt="prompt",
            runtime_envelope="envelope",
        )

    assert [source.url for source in result.response.sources] == [live]
    assert "[2]" not in result.response.body_markdown
    assert "[1]" in result.response.body_markdown
    assert result.response.action == "answer"
    assert "lex_dead_urls_stripped" in caplog.text
