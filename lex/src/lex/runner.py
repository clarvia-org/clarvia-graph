from __future__ import annotations

import hashlib
import importlib.util
import sys
from collections.abc import Sequence
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

import yaml

from lex.adapters import CountryAdapter, LawRef, NormalizedLaw, SourceDocument
from lex.errors import ErrorCode, LexError
from lex.frontmatter import serialize_frontmatter
from lex.http import HttpClient
from lex.validate import validate_dataset


def load_adapter(country: str, root: Path) -> CountryAdapter:
    adapter_path = root / "countries" / country / "adapter.py"
    if not adapter_path.is_file():
        raise LexError(
            ErrorCode.LEX_NOT_FOUND,
            adapter_path,
            f"No adapter for country '{country}'",
        )

    module_name = f"lex_country_adapter_{country}"
    spec = importlib.util.spec_from_file_location(module_name, adapter_path)
    if spec is None or spec.loader is None:
        raise LexError(ErrorCode.LEX_INVALID_DATA, adapter_path, "Cannot load adapter")

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)

    adapter = getattr(module, "adapter", None)
    if adapter is None:
        raise LexError(
            ErrorCode.LEX_INVALID_DATA,
            adapter_path,
            "adapter.py must expose module-level 'adapter'",
        )
    return adapter  # type: ignore[no-any-return]


def load_source_yml(country: str, root: Path) -> dict[str, Any]:
    path = root / "countries" / country / "source.yml"
    if not path.is_file():
        raise LexError(ErrorCode.LEX_NOT_FOUND, path, "Missing source.yml")
    with open(path, encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    if not isinstance(data, dict):
        raise LexError(ErrorCode.LEX_INVALID_DATA, path, "source.yml must be a mapping")
    return data


def update_country(
    country: str,
    root: Path,
    *,
    law_id: str | None = None,
    law_ids: Sequence[str] | None = None,
    dry_run: bool = False,
    client: HttpClient | None = None,
) -> list[str]:
    """Run discover → fetch → normalize → write for one country.

    Returns list of changed relative paths (empty when idempotent).
    """
    if law_id is not None and law_ids is not None:
        raise LexError(
            ErrorCode.LEX_INVALID_DATA,
            country,
            "Pass only one of law_id or law_ids",
        )

    owns_client = client is None
    http = client or HttpClient()
    try:
        source_meta = load_source_yml(country, root)
        adapter = load_adapter(country, root)
        refs = list(adapter.discover(http))

        selected: set[str] | None = None
        order: dict[str, int] | None = None
        if law_id is not None:
            selected = {law_id}
            order = {law_id: 0}
        elif law_ids is not None:
            if not law_ids:
                raise LexError(
                    ErrorCode.LEX_INVALID_DATA,
                    country,
                    "law_ids list is empty",
                )
            selected = set(law_ids)
            order = {law_id_item: index for index, law_id_item in enumerate(law_ids)}

        if selected is not None:
            refs = [ref for ref in refs if ref.id in selected]
            found = {ref.id for ref in refs}
            missing = selected - found
            if missing:
                raise LexError(
                    ErrorCode.LEX_NOT_FOUND,
                    country,
                    "Laws not returned by discover(): " + ", ".join(sorted(missing)),
                )
            assert order is not None
            refs.sort(key=lambda ref: (order.get(ref.id, 10_000), ref.language))

        published_ids = _published_ids(country, root)
        discovered_ids = {ref.id for ref in refs}
        # Deletion protection applies to the full discover set when not filtering.
        if selected is None:
            missing_published = published_ids - discovered_ids
            if missing_published:
                raise LexError(
                    ErrorCode.LEX_UNEXPECTED_DELETION,
                    country,
                    "Published laws missing from discover(): "
                    + ", ".join(sorted(missing_published)),
                )

        changed: list[str] = []
        for ref in refs:
            source_doc = adapter.fetch(ref, http)
            normalized = adapter.normalize(ref, source_doc)
            paths = _write_law(
                root=root,
                country=country,
                ref=ref,
                source_doc=source_doc,
                normalized=normalized,
                source_meta=source_meta,
                dry_run=dry_run,
            )
            changed.extend(paths)

        if not dry_run:
            errors = validate_dataset(root)
            # Only fail on errors for laws we touched / country dataset generally.
            if errors:
                messages = "; ".join(f"{e.code.value} {e.path}: {e.message}" for e in errors[:5])
                raise LexError(ErrorCode.LEX_INVALID_DATA, root, messages)

        return changed
    finally:
        if owns_client:
            http.close()


def load_id_list(path: Path) -> list[str]:
    """Load stable law IDs from a batch manifest (one ID per line; ``#`` comments)."""
    if not path.is_file():
        raise LexError(ErrorCode.LEX_NOT_FOUND, path, f"ID list file not found: {path}")
    ids: list[str] = []
    seen: set[str] = set()
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line in seen:
            raise LexError(
                ErrorCode.LEX_INVALID_DATA,
                path,
                f"Duplicate ID in list at line {line_no}: {line}",
            )
        seen.add(line)
        ids.append(line)
    if not ids:
        raise LexError(ErrorCode.LEX_INVALID_DATA, path, "ID list file contains no IDs")
    return ids


def _published_ids(country: str, root: Path) -> set[str]:
    laws_dir = root / "countries" / country / "laws"
    if not laws_dir.is_dir():
        return set()
    ids: set[str] = set()
    for law_dir in laws_dir.iterdir():
        if law_dir.is_dir() and (law_dir / "current.md").is_file():
            ids.add(f"{country}/{law_dir.name}")
    return ids


def _law_dir(root: Path, ref: LawRef) -> Path:
    country, slug = ref.id.split("/", 1)
    return root / "countries" / country / "laws" / slug


def _source_filename(ref: LawRef, extension: str, default_language: str) -> str:
    if ref.language == default_language:
        return f"source.{extension}"
    return f"source.{ref.language}.{extension}"


def _markdown_filename(ref: LawRef, default_language: str) -> str:
    if ref.language == default_language:
        return "current.md"
    return f"current.{ref.language}.md"


def _write_law(
    *,
    root: Path,
    country: str,
    ref: LawRef,
    source_doc: SourceDocument,
    normalized: NormalizedLaw,
    source_meta: dict[str, Any],
    dry_run: bool,
) -> list[str]:
    default_language = str(source_meta.get("default_language", "fr"))
    law_dir = _law_dir(root, ref)
    source_name = _source_filename(ref, source_doc.extension, default_language)
    md_name = _markdown_filename(ref, default_language)
    source_path = law_dir / source_name
    md_path = law_dir / md_name

    new_hash = hashlib.sha256(source_doc.content).hexdigest()
    existing_bytes = source_path.read_bytes() if source_path.is_file() else None
    source_unchanged = existing_bytes == source_doc.content

    retrieved_at = source_doc.retrieved_at
    if source_unchanged and md_path.is_file():
        # Preserve retrieved_at from existing frontmatter.
        existing_text = md_path.read_text(encoding="utf-8")
        from lex.frontmatter import parse_frontmatter

        existing_meta, _ = parse_frontmatter(existing_text)
        existing_retrieved = existing_meta.get("retrieved_at")
        if isinstance(existing_retrieved, str):
            retrieved_at = datetime.fromisoformat(existing_retrieved.replace("Z", "+00:00"))

    metadata = _build_frontmatter(
        ref=ref,
        source_doc=source_doc,
        normalized=normalized,
        source_meta=source_meta,
        source_file=source_name,
        source_sha256=new_hash,
        retrieved_at=retrieved_at,
    )
    markdown = serialize_frontmatter(metadata) + "\n" + normalized.body
    if not markdown.endswith("\n"):
        markdown += "\n"
    # Ensure LF
    markdown = markdown.replace("\r\n", "\n")

    changed: list[str] = []
    rel_source = source_path.relative_to(root).as_posix()
    rel_md = md_path.relative_to(root).as_posix()

    if not source_unchanged:
        changed.append(rel_source)
        if not dry_run:
            law_dir.mkdir(parents=True, exist_ok=True)
            source_path.write_bytes(source_doc.content)

    existing_md = md_path.read_text(encoding="utf-8") if md_path.is_file() else None
    if existing_md != markdown:
        # If source unchanged and only formatting would change due to bug, still rewrite
        # when content differs — idempotent path requires byte-identical regeneration.
        if source_unchanged and existing_md is not None:
            # Re-normalize path: if bytes identical source, regenerated markdown should match.
            # Difference means adapter/serializer drift or prior corruption — rewrite.
            pass
        changed.append(rel_md)
        if not dry_run:
            law_dir.mkdir(parents=True, exist_ok=True)
            md_path.write_text(markdown, encoding="utf-8", newline="\n")

    return changed


def _build_frontmatter(
    *,
    ref: LawRef,
    source_doc: SourceDocument,
    normalized: NormalizedLaw,
    source_meta: dict[str, Any],
    source_file: str,
    source_sha256: str,
    retrieved_at: datetime,
) -> dict[str, Any]:
    if retrieved_at.tzinfo is None:
        retrieved_at = retrieved_at.replace(tzinfo=UTC)
    retrieved_at = retrieved_at.astimezone(UTC)

    meta: dict[str, Any] = {
        "id": ref.id,
        "country": ref.id.split("/", 1)[0],
        "title": normalized.title,
        "language": ref.language,
        "document_type": normalized.document_type,
        "status": source_doc.status,
    }

    official_id = source_doc.official_id or ref.official_id
    eli_uri = source_doc.eli_uri or ref.eli_uri
    if official_id:
        meta["official_id"] = official_id
    if eli_uri:
        meta["eli_uri"] = eli_uri

    meta.update(
        {
            "source_url": source_doc.final_url,
            "source_file": source_file,
            "source_sha256": source_sha256,
            "source_license": source_meta["source_license"],
            "source_attribution": source_meta["source_attribution"],
            "source_terms_url": source_meta["source_terms_url"],
            "rights_reviewed_at": _as_date_str(source_meta["rights_reviewed_at"]),
        }
    )

    if source_doc.published_at is not None:
        meta["published_at"] = source_doc.published_at.isoformat()
    if source_doc.consolidated_at is not None:
        meta["consolidated_at"] = source_doc.consolidated_at.isoformat()
    if source_doc.source_modified_at:
        meta["source_modified_at"] = source_doc.source_modified_at

    meta["retrieved_at"] = retrieved_at.strftime("%Y-%m-%dT%H:%M:%SZ")

    if source_doc.warning:
        meta["warning"] = source_doc.warning

    return meta


def _as_date_str(value: Any) -> str:
    if isinstance(value, date):
        return value.isoformat()
    return str(value)
