"""Offline renormalize of LU current*.md from retained source files (no network)."""

from __future__ import annotations

import importlib.util
import sys
from datetime import UTC, datetime
from pathlib import Path

from lex.adapters import LawRef, SourceDocument
from lex.frontmatter import parse_frontmatter, serialize_frontmatter

ROOT = Path(__file__).resolve().parent.parent
LAWS = ROOT / "countries" / "lu" / "laws"


def _load_adapter():  # type: ignore[no-untyped-def]
    path = ROOT / "countries" / "lu" / "adapter.py"
    spec = importlib.util.spec_from_file_location("lu_adapter_renorm", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["lu_adapter_renorm"] = module
    spec.loader.exec_module(module)
    return module.adapter


def _renorm_one(adapter, md_path: Path) -> bool:  # type: ignore[no-untyped-def]
    text = md_path.read_text(encoding="utf-8")
    meta, _old_body = parse_frontmatter(text)
    source_file = meta.get("source_file")
    if not isinstance(source_file, str):
        return False
    source_path = md_path.parent / source_file
    if not source_path.is_file():
        return False

    content = source_path.read_bytes()
    ext = source_path.suffix.lstrip(".").lower() or "xml"
    law_id = str(meta.get("id", ""))
    language = str(meta.get("language", "fr"))
    ref = LawRef(
        id=law_id or f"lu/{md_path.parent.name}",
        language=language,
        source_url=str(meta.get("source_url", "fixture://local")),
        official_id=meta.get("official_id") if isinstance(meta.get("official_id"), str) else None,
        eli_uri=meta.get("eli_uri") if isinstance(meta.get("eli_uri"), str) else None,
    )
    source = SourceDocument(
        content=content,
        extension=ext if ext in {"xml", "html"} else "xml",
        final_url=str(meta.get("source_url", source_path.as_uri())),
        media_type="application/xml" if ext == "xml" else "text/html",
        retrieved_at=datetime(2026, 1, 1, tzinfo=UTC),
        title=str(meta.get("title", "")),
        document_type=str(meta.get("document_type", "law")),
        status=str(meta.get("status", "official_consolidation")),
    )
    try:
        normalized = adapter.normalize(ref, source)
    except Exception as exc:  # noqa: BLE001
        print(f"SKIP {md_path}: {exc}")
        return False

    # Preserve all existing frontmatter fields; only replace Markdown body.
    new_text = serialize_frontmatter(meta) + "\n" + normalized.body
    if not new_text.endswith("\n"):
        new_text += "\n"
    new_text = new_text.replace("\r\n", "\n")
    if new_text == text.replace("\r\n", "\n"):
        return False
    md_path.write_text(new_text, encoding="utf-8", newline="\n")
    return True


def main() -> None:
    adapter = _load_adapter()
    changed = 0
    scanned = 0
    for md_path in sorted(LAWS.glob("*/current*.md")):
        scanned += 1
        if _renorm_one(adapter, md_path):
            changed += 1
            if changed <= 20 or changed % 100 == 0:
                print(f"updated {md_path.relative_to(ROOT).as_posix()}")
    print(f"done: scanned={scanned} changed={changed}")


if __name__ == "__main__":
    main()
