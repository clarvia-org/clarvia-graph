import shutil
from pathlib import Path

from lex.errors import ErrorCode
from lex.validate import validate_dataset


def test_valid_dataset() -> None:
    root = Path("tests/fixtures/sample_dataset")
    if not root.exists():
        return
    errors = validate_dataset(root)
    assert not errors


def test_invalid_id_format(tmp_path: Path) -> None:
    src = Path("tests/fixtures/sample_dataset")
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    md_file = tmp_path / "dataset/countries/xx/laws/sample-law/current.md"
    content = md_file.read_text(encoding="utf-8")
    content = content.replace("id: xx/sample-law", "id: XX/BAD")
    md_file.write_text(content, encoding="utf-8")

    errors = validate_dataset(tmp_path / "dataset")
    assert any(
        err.code == ErrorCode.LEX_INVALID_ID and "Invalid ID format" in err.message
        for err in errors
    )


def test_sha256_mismatch(tmp_path: Path) -> None:
    src = Path("tests/fixtures/sample_dataset")
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    md_file = tmp_path / "dataset/countries/xx/laws/sample-law/current.md"
    content = md_file.read_text(encoding="utf-8")
    # Replace first 4 chars of hash with 1111
    content = content.replace(
        "source_sha256: 12cf",
        "source_sha256: 1111",
    )
    md_file.write_text(content, encoding="utf-8")

    errors = validate_dataset(tmp_path / "dataset")
    assert any(err.code == ErrorCode.LEX_HASH_MISMATCH for err in errors)


def test_missing_source_file(tmp_path: Path) -> None:
    src = Path("tests/fixtures/sample_dataset")
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    (tmp_path / "dataset/countries/xx/laws/sample-law/source.html").unlink()

    errors = validate_dataset(tmp_path / "dataset")
    assert any(err.code == ErrorCode.LEX_SOURCE_NOT_FOUND for err in errors)


def test_duplicate_ids(tmp_path: Path) -> None:
    src = Path("tests/fixtures/sample_dataset")
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    shutil.copytree(
        tmp_path / "dataset/countries/xx/laws/sample-law",
        tmp_path / "dataset/countries/xx/laws/sample-law2",
    )

    errors = validate_dataset(tmp_path / "dataset")
    assert any(
        err.code == ErrorCode.LEX_INVALID_ID and "Duplicate" in err.message for err in errors
    )


def test_missing_rights_fields(tmp_path: Path) -> None:
    src = Path("tests/fixtures/sample_dataset")
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    md_file = tmp_path / "dataset/countries/xx/laws/sample-law/current.md"
    content = md_file.read_text(encoding="utf-8")
    content = content.replace("source_license: CC-BY-4.0\n", "")
    md_file.write_text(content, encoding="utf-8")

    errors = validate_dataset(tmp_path / "dataset")
    assert any(
        err.code == ErrorCode.LEX_INVALID_RIGHTS and "source_license" in err.message
        for err in errors
    )
