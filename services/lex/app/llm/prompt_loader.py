"""Load the private Lex system prompt (fail closed).

The prompt is local-only operational material. It is read through a configurable
path (``LEX_PROMPT_PATH`` / ``Settings.prompt_path``), resolved relative to the
service root when relative. The prompt content is never logged and never
returned through ``/health``; error messages contain only the resolved path.
"""

from __future__ import annotations

from pathlib import Path

from app.config import SERVICE_ROOT, get_settings


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


def load_prompt(path: str | Path | None = None) -> str:
    """Return the UTF-8 prompt text, failing closed on any problem."""
    resolved = (
        get_settings().resolved_prompt_path if path is None else _resolve_path(path)
    )

    try:
        text = resolved.read_text(encoding="utf-8")
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

    if not text.strip():
        raise PromptLoadError("prompt_empty", f"Prompt file is empty: {resolved}")

    return text


__all__ = ["PromptLoadError", "load_prompt"]
