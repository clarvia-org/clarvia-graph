from pathlib import Path

from lex.errors import ErrorCode
from lex.frontmatter import parse_frontmatter, serialize_frontmatter, validate_frontmatter

SCHEMA_PATH = Path("schemas/law-frontmatter.schema.json")


def test_parse_frontmatter() -> None:
    text = """---
id: xx/test
title: Test
---
# Body"""
    meta, body = parse_frontmatter(text)
    assert meta["id"] == "xx/test"
    assert meta["title"] == "Test"
    assert body.strip() == "# Body"


def test_deterministic_serialization() -> None:
    meta = {
        "id": "xx/test",
        "country": "xx",
        "title": "Test Title",
        "language": "en",
        "document_type": "law",
        "status": "official_current",
    }
    serialized1 = serialize_frontmatter(meta)
    parsed_meta, _ = parse_frontmatter(f"{serialized1}\n# Body")
    serialized2 = serialize_frontmatter(parsed_meta)
    assert serialized1 == serialized2


def test_validate_frontmatter_unknown_field() -> None:
    meta = {
        "id": "xx/test",
        "country": "xx",
        "title": "Test",
        "language": "en",
        "document_type": "law",
        "status": "official_current",
        "official_id": "1",
        "source_url": "http",
        "source_file": "a",
        "source_sha256": "a" * 64,
        "source_license": "cc",
        "source_attribution": "a",
        "source_terms_url": "u",
        "rights_reviewed_at": "d",
        "retrieved_at": "d",
        "unknown_field": "bad",
    }
    if not SCHEMA_PATH.exists():
        return
    errors = validate_frontmatter(meta, SCHEMA_PATH)
    assert any("unknown_field" in err.message for err in errors)


def test_validate_frontmatter_missing_required() -> None:
    meta = {
        "id": "xx/test",
    }
    if not SCHEMA_PATH.exists():
        return
    errors = validate_frontmatter(meta, SCHEMA_PATH)
    assert len(errors) > 0
    assert any(err.code == ErrorCode.LEX_INVALID_DATA for err in errors)


def test_field_order() -> None:
    meta = {
        "country": "xx",
        "id": "xx/test",
    }
    if not SCHEMA_PATH.exists():
        return
    errors = validate_frontmatter(meta, SCHEMA_PATH)
    assert any("correct order" in err.message for err in errors)
