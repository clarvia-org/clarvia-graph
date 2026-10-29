"""Load the private Lex system prompt (fail closed).

The prompt is local-only operational material. It is read through a configurable
path (``LEX_PROMPT_PATH`` / ``Settings.prompt_path``), resolved relative to the
service root when relative. The prompt content is never logged and never
returned through ``/health``; error messages contain only the resolved path.

Line 1 of ``runtime-private/prompts/lex-prompt.txt`` may carry a version header
(``# prompt_version: lex-v2.1``). ``load_prompt`` strips that metadata line
before returning the system prompt text to the LLM, while ``load_prompt_version``
reads it as the single source of truth for ``/health`` and runtime metadata.
"""

from __future__ import annotations

import re
from pathlib import Path

from app.config import SERVICE_ROOT, get_settings

_PROMPT_VERSION_RE = re.compile(r"^#\s*prompt_version\s*:\s*(\S+)\s*$")


class PromptLoadError(RuntimeError):
    """Raised when the prompt cannot be loaded. Never contains prompt content."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(message)


def _resolve_path(path: str | Path) -> Path:
    candidate = Path(path)
    if candidate.is_absolute():
        return candidate
    return (SERVICE_ROOT / candidate).resolve()


def _strip_version_header(text: str) -> tuple[str | None, str]:
    lines = text.splitlines(keepends=True)
    if not lines:
        return None, text
    match = _PROMPT_VERSION_RE.match(lines[0].strip())
    if not match:
        return None, text
    return match.group(1), "".join(lines[1:]).lstrip("\r\n")


def load_prompt(path: str | Path | None = None) -> str:
    """Return the UTF-8 prompt text (with optional header stripped), failing closed."""
    resolved = (
        get_settings().resolved_prompt_path if path is None else _resolve_path(path)
    )

    try:
        raw_text = resolved.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise PromptLoadError(
            "prompt_missing", f"Prompt file not found: {resolved}"
        ) from exc
    except UnicodeDecodeError as exc:
        raise PromptLoadError(
            "prompt_not_utf8", f"Prompt file is not valid UTF-8: {resolved}"
        ) from exc
    except OSError as exc:
        raise PromptLoadError(
            "prompt_unreadable", f"Prompt file is unreadable: {resolved}"
        ) from exc

    _, text = _strip_version_header(raw_text)
    if not text.strip():
        raise PromptLoadError("prompt_empty", f"Prompt file is empty: {resolved}")

    return text


def load_prompt_version(
    path: str | Path | None = None, *, fallback: str = "lex-v1"
) -> str:
    """Return the ``# prompt_version:`` header from the prompt file, or ``fallback``."""
    resolved = (
        get_settings().resolved_prompt_path if path is None else _resolve_path(path)
    )
    try:
        raw_text = resolved.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return fallback
    version, _ = _strip_version_header(raw_text)
    return version or fallback


__all__ = ["PromptLoadError", "load_prompt", "load_prompt_version"]
