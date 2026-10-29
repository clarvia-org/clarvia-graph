"""Tests for app.llm.prompt_loader."""

from __future__ import annotations

import re
from pathlib import Path

import pytest
from app.config import SERVICE_ROOT
from app.llm.prompt_loader import PromptLoadError, load_prompt, load_prompt_version

_DEFAULT_RELATIVE = "runtime-private/prompts/lex-prompt.txt"


def test_loads_utf8_synthetic_prompt(tmp_path: Path) -> None:
    prompt_file = tmp_path / "p.txt"
    prompt_file.write_text("S\u00ffnthetic prompt \u00e9\nLex.\n", encoding="utf-8")
    text = load_prompt(str(prompt_file))
    assert "S\u00ffnthetic prompt \u00e9" in text
    assert load_prompt_version(str(prompt_file), fallback="lex-v1") == "lex-v1"


def test_version_header_stripped_from_prompt_and_parsed(tmp_path: Path) -> None:
    prompt_file = tmp_path / "versioned.txt"
    prompt_file.write_text(
        "# prompt_version: lex-v2.1\n\nYou are Lex.\nLex.\n",
        encoding="utf-8",
    )
    text = load_prompt(str(prompt_file))
    assert not text.startswith("# prompt_version")
    assert text.startswith("You are Lex.")
    assert load_prompt_version(str(prompt_file), fallback="lex-v1") == "lex-v2.1"


def test_missing_file_fails_closed(tmp_path: Path) -> None:
    missing = tmp_path / "does-not-exist.txt"
    with pytest.raises(PromptLoadError) as exc:
        load_prompt(str(missing))
    assert exc.value.code == "prompt_missing"
    assert load_prompt_version(str(missing), fallback="lex-v1") == "lex-v1"


def test_empty_file_fails_closed(tmp_path: Path) -> None:
    empty = tmp_path / "empty.txt"
    empty.write_text("   \n\t\n", encoding="utf-8")
    with pytest.raises(PromptLoadError) as exc:
        load_prompt(str(empty))
    assert exc.value.code == "prompt_empty"


def test_header_only_file_fails_closed(tmp_path: Path) -> None:
    header_only = tmp_path / "header-only.txt"
    header_only.write_text("# prompt_version: lex-v2.1\n   \n", encoding="utf-8")
    with pytest.raises(PromptLoadError) as exc:
        load_prompt(str(header_only))
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
    monkeypatch.chdir(tmp_path)
    prompt_dir = SERVICE_ROOT / "runtime-private" / "prompts"
    prompt_dir.mkdir(parents=True, exist_ok=True)
    prompt_file = prompt_dir / "lex-test-relative.txt"
    prompt_file.write_text("IDENTITY\nSCOPE\nLex.\n", encoding="utf-8")
    try:
        text = load_prompt("runtime-private/prompts/lex-test-relative.txt")
        assert "IDENTITY" in text
    finally:
        prompt_file.unlink(missing_ok=True)


def test_private_prompt_present_with_required_sections() -> None:
    prompt_path = SERVICE_ROOT / _DEFAULT_RELATIVE
    if not prompt_path.exists():
        pytest.skip(
            "Live prompt absent (expected in public CI / monorepo without"
            " runtime-private)."
        )
    text = load_prompt(_DEFAULT_RELATIVE)
    assert not text.startswith("# prompt_version:")
    version = load_prompt_version(_DEFAULT_RELATIVE)
    assert re.fullmatch(r"lex-v\d+\.\d+", version)
    for section in ("IDENTITY", "SCOPE", "RESEARCH", "OUTPUT CONTRACT"):
        assert section in text
    assert text.rstrip().endswith("extra fields.")
