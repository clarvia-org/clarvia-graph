"""Tests for app.llm.prompt_loader."""

from __future__ import annotations

from pathlib import Path

import pytest
from app.config import SERVICE_ROOT
from app.llm.prompt_loader import PromptLoadError, load_prompt

_DEFAULT_RELATIVE = "runtime-private/prompts/lex-v1.txt"


def test_loads_utf8_synthetic_prompt(tmp_path: Path) -> None:
    prompt_file = tmp_path / "p.txt"
    prompt_file.write_text("Sÿnthetic prompt \u00e9\nLex.\n", encoding="utf-8")
    text = load_prompt(str(prompt_file))
    assert "S\u00ffnthetic prompt \u00e9" in text


def test_missing_file_fails_closed(tmp_path: Path) -> None:
    with pytest.raises(PromptLoadError) as exc:
        load_prompt(str(tmp_path / "does-not-exist.txt"))
    assert exc.value.code == "prompt_missing"


def test_empty_file_fails_closed(tmp_path: Path) -> None:
    empty = tmp_path / "empty.txt"
    empty.write_text("   \n\t\n", encoding="utf-8")
    with pytest.raises(PromptLoadError) as exc:
        load_prompt(str(empty))
    assert exc.value.code == "prompt_empty"


def test_non_utf8_fails_and_hides_content(tmp_path: Path) -> None:
    bad = tmp_path / "bad.txt"
    bad.write_bytes(b"\xff\xfeSECRETMARKER\x00\x81")
    with pytest.raises(PromptLoadError) as exc:
        load_prompt(str(bad))
    assert exc.value.code == "prompt_not_utf8"
    assert "SECRETMARKER" not in str(exc.value)


def test_relative_path_resolves_from_service_root_not_cwd(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    # Change cwd somewhere unrelated; a relative prompt path must still resolve
    # from the service root.
    monkeypatch.chdir(tmp_path)
    text = load_prompt(_DEFAULT_RELATIVE)
    assert "IDENTITY" in text


def test_private_prompt_present_with_required_sections() -> None:
    prompt_path = SERVICE_ROOT / _DEFAULT_RELATIVE
    assert prompt_path.exists(), "The private live prompt must exist locally."
    text = load_prompt(_DEFAULT_RELATIVE)
    for section in ("IDENTITY", "SCOPE", "RESEARCH", "OUTPUT CONTRACT"):
        assert section in text
    assert text.rstrip().endswith("extra fields.")
