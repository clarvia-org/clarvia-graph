from __future__ import annotations

import json
import sys
from pathlib import Path

import click

from lex.dataset import LawRecord, discover_laws
from lex.errors import ErrorCode, LexError
from lex.evidence import (
    build_provision_evidence,
    jsonable_metadata,
    normalize_for_search,
    search_field_matches,
    search_rank_score,
)
from lex.frontmatter import parse_frontmatter
from lex.markdown import HEADING_RE, extract_provision
from lex.runner import load_id_list, update_country
from lex.validate import validate_dataset


def _root() -> Path:
    return Path.cwd()


def _emit_error(exc: LexError, *, as_json: bool = False) -> None:
    if as_json:
        click.echo(
            json.dumps(
                {"code": exc.code.value, "path": str(exc.path), "message": exc.message},
                indent=2,
            ),
            err=True,
        )
    else:
        click.echo(f"{exc.code.value} {exc.path}: {exc.message}", err=True)


def _parse_id(law_id: str, language_option: str | None) -> tuple[str, str | None]:
    if "@" in law_id:
        base, lang = law_id.split("@", 1)
        if language_option and language_option != lang:
            raise LexError(
                ErrorCode.LEX_AMBIGUOUS_MATCH,
                law_id,
                "Conflicting language from ID@lang and --language",
            )
        return base, lang
    return law_id, language_option


def _find_law(root: Path, law_id: str, language: str | None) -> Path:
    laws = [law for law in discover_laws(root) if law.id == law_id]
    if not laws:
        raise LexError(ErrorCode.LEX_NOT_FOUND, law_id, "Law not found")

    if language is None:
        # Prefer default-language file (current.md) when multiple exist.
        default = [law for law in laws if law.path.name == "current.md"]
        chosen = default[0] if default else laws[0]
        return chosen.path

    matches = [law for law in laws if law.language == language]
    if not matches:
        raise LexError(
            ErrorCode.LEX_LANGUAGE_NOT_FOUND,
            law_id,
            f"Language '{language}' not found",
        )
    return matches[0].path


@click.group()
def main() -> None:
    """lex — current national legislation for AI agents."""


@main.command("list")
@click.option("--country", default=None)
@click.option("--language", default=None)
@click.option("--json", "as_json", is_flag=True)
def list_cmd(country: str | None, language: str | None, as_json: bool) -> None:
    root = _root()
    laws = discover_laws(root)
    if country:
        laws = [law for law in laws if law.country == country]
    if language:
        laws = [law for law in laws if law.language == language]

    if as_json:
        output = [
            {
                "id": law.id,
                "country": law.country,
                "language": law.language,
                "title": law.title,
                "status": law.status,
                "path": str(law.path.relative_to(root).as_posix()),
            }
            for law in laws
        ]
        click.echo(json.dumps(output, indent=2, ensure_ascii=False))
    else:
        for law in laws:
            path_str = str(law.path.relative_to(root).as_posix())
            click.echo(f"{law.id}\t{law.language}\t{law.title}\t{law.status}\t{path_str}")


@main.command("search")
@click.argument("query")
@click.option("--country", default=None)
@click.option("--language", default=None)
@click.option("--json", "as_json", is_flag=True)
def search_cmd(query: str, country: str | None, language: str | None, as_json: bool) -> None:
    root = _root()
    needle = normalize_for_search(query)
    laws = discover_laws(root)
    if country:
        laws = [law for law in laws if law.country == country]
    if language:
        laws = [law for law in laws if law.language == language]

    ranked: list[tuple[int, str, LawRecord, list[str]]] = []
    for law in laws:
        text = law.path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)
        title = str(meta.get("title", ""))
        official_id = str(meta.get("official_id", ""))
        eli_uri = str(meta.get("eli_uri", ""))
        doc_type = str(meta.get("document_type", ""))
        headings = [
            match.group(2).strip()
            for line in body.splitlines()
            if (match := HEADING_RE.match(line))
        ]

        matched_on = search_field_matches(
            law_id=law.id,
            title=title,
            official_id=official_id,
            eli_uri=eli_uri,
            document_type=doc_type,
            headings=headings,
            body=body,
            needle=needle,
        )
        score = search_rank_score(
            law_id=law.id,
            title=title,
            matched_on=matched_on,
            needle=needle,
        )
        if score is None:
            continue
        ranked.append((score, law.id, law, matched_on))

    ranked.sort(key=lambda item: (item[0], item[1]))

    if as_json:
        output = [
            {
                "id": law.id,
                "country": law.country,
                "language": law.language,
                "title": law.title,
                "status": law.status,
                "path": str(law.path.relative_to(root).as_posix()),
                "matched_on": matched_on,
            }
            for _, _, law, matched_on in ranked
        ]
        click.echo(json.dumps(output, indent=2, ensure_ascii=False))
    else:
        for _, _, law, _ in ranked:
            path_str = str(law.path.relative_to(root).as_posix())
            click.echo(f"{law.id}\t{law.language}\t{law.title}\t{law.status}\t{path_str}")


@main.command("get")
@click.argument("law_id")
@click.option("--language", default=None)
@click.option("--provision", default=None)
@click.option("--body", "body_only", is_flag=True)
@click.option("--json", "as_json", is_flag=True)
def get_cmd(
    law_id: str,
    language: str | None,
    provision: str | None,
    body_only: bool,
    as_json: bool,
) -> None:
    try:
        root = _root()
        base_id, lang = _parse_id(law_id, language)
        path = _find_law(root, base_id, lang)
        text = path.read_text(encoding="utf-8")
        if provision and as_json and not body_only:
            evidence = build_provision_evidence(text, provision)
            click.echo(json.dumps(evidence, indent=2, ensure_ascii=False))
            return
        if provision:
            text = extract_provision(text, provision)
        meta, body = parse_frontmatter(text)
        if body_only:
            click.echo(body, nl=not body.endswith("\n"))
            return
        if as_json:
            click.echo(
                json.dumps(
                    {"metadata": jsonable_metadata(meta), "body": body},
                    indent=2,
                    ensure_ascii=False,
                )
            )
            return
        click.echo(text, nl=not text.endswith("\n"))
    except LexError as exc:
        _emit_error(exc, as_json=as_json)
        sys.exit(1)


@main.command("source")
@click.argument("law_id")
@click.option("--language", default=None)
@click.option("--verify", is_flag=True)
@click.option("--path-only", is_flag=True)
def source_cmd(law_id: str, language: str | None, verify: bool, path_only: bool) -> None:
    try:
        import hashlib

        root = _root()
        base_id, lang = _parse_id(law_id, language)
        md_path = _find_law(root, base_id, lang)
        text = md_path.read_text(encoding="utf-8")
        meta, _ = parse_frontmatter(text)
        source_file = meta.get("source_file")
        if not isinstance(source_file, str):
            raise LexError(ErrorCode.LEX_SOURCE_NOT_FOUND, base_id, "Missing source_file")
        source_path = md_path.parent / source_file
        if not source_path.is_file():
            raise LexError(
                ErrorCode.LEX_SOURCE_NOT_FOUND,
                source_path,
                "Source file not found",
            )
        rel = source_path.relative_to(root).as_posix()
        if verify:
            expected = meta.get("source_sha256")
            actual = hashlib.sha256(source_path.read_bytes()).hexdigest()
            if expected != actual:
                raise LexError(
                    ErrorCode.LEX_HASH_MISMATCH,
                    rel,
                    f"Expected {expected}, got {actual}",
                )
        if path_only:
            click.echo(rel)
        else:
            click.echo(rel)
            if verify:
                click.echo("OK")
    except LexError as exc:
        _emit_error(exc)
        sys.exit(1)


@main.command("check")
@click.argument("path", required=False, type=click.Path(exists=True, path_type=Path))
@click.option("--json", "as_json", is_flag=True)
@click.option(
    "--id",
    "law_id",
    default=None,
    help="Limit fidelity-focused reporting to one law ID (dataset checks still scan PATH).",
)
def check_cmd(path: Path | None, as_json: bool, law_id: str | None) -> None:
    """Validate frontmatter, source hashes, anchors, and Markdown↔source fidelity."""
    from lex.fidelity import analyze_law_fidelity, check_law_fidelity

    root = path if path else _root()

    # Single law directory: .../laws/<slug>/ containing current.md + source.*
    single_law = (root / "current.md").is_file() and any(root.glob("source.*"))
    if single_law:
        errors = check_law_fidelity(root / "current.md", rel_path=root.as_posix())
    else:
        errors = validate_dataset(root)
        if law_id is not None:
            base_id, lang = _parse_id(law_id, None)
            md_path = _find_law(root, base_id, lang)
            rel = md_path.relative_to(root).as_posix()
            errors = [err for err in errors if str(err.path).replace("\\", "/") == rel]

    if errors:
        if as_json:
            output = [
                {"code": err.code.value, "path": str(err.path), "message": err.message}
                for err in errors
            ]
            click.echo(json.dumps(output, indent=2))
        else:
            for err in errors:
                click.echo(f"{err.code.value} {err.path}: {err.message}", err=True)
        sys.exit(1)

    # Single-law review: always print the classified fidelity report.
    if single_law and not as_json:
        report = analyze_law_fidelity(root / "current.md")
        if report is not None:
            click.echo(report.format_public())
    sys.exit(0)


@main.command("update")
@click.argument("country")
@click.option("--id", "law_id", default=None, help="Update a single law ID.")
@click.option(
    "--from-file",
    "from_file",
    type=click.Path(path_type=Path, exists=True, dir_okay=False),
    default=None,
    help="Update every law ID listed in a batch manifest (one ID per line).",
)
@click.option("--dry-run", is_flag=True)
def update_cmd(
    country: str,
    law_id: str | None,
    from_file: Path | None,
    dry_run: bool,
) -> None:
    if law_id is not None and from_file is not None:
        click.echo("Pass only one of --id or --from-file.", err=True)
        sys.exit(1)
    try:
        law_ids = load_id_list(from_file) if from_file is not None else None
        changed = update_country(
            country,
            _root(),
            law_id=law_id,
            law_ids=law_ids,
            dry_run=dry_run,
        )
    except LexError as exc:
        _emit_error(exc)
        sys.exit(1)

    if changed:
        for path in changed:
            click.echo(path)
    else:
        click.echo("No changes.")


if __name__ == "__main__":
    main()
