"""Shared pytest fixtures for all test packages."""

from __future__ import annotations

from collections.abc import Iterator

import pytest


@pytest.fixture(autouse=True)
def _keep_source_urls_in_tests(monkeypatch: pytest.MonkeyPatch) -> None:
    """Do not issue live HTTP from the dead-link strip during tests."""
    monkeypatch.setattr(
        "app.llm.url_liveness.probe_url",
        lambda *_args, **_kwargs: True,
    )


@pytest.fixture
def synthetic_prompt(tmp_path: object) -> Iterator[str]:
    """Yield a path to a small synthetic prompt file (never the real prompt)."""
    from pathlib import Path

    assert isinstance(tmp_path, Path)
    prompt_file = tmp_path / "synthetic-prompt.txt"
    prompt_file.write_text(
        "SYNTHETIC TEST PROMPT\nYou are a test.\nLex.\n", encoding="utf-8"
    )
    yield str(prompt_file)
