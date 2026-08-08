import json
from pathlib import Path
from typing import Any

import jsonschema  # type: ignore[import-untyped]
import yaml

from lex.errors import ErrorCode, LexError

FIELD_ORDER: list[str] = [
    "id",
    "country",
    "title",
    "language",
    "document_type",
    "status",
    "official_id",
    "eli_uri",
    "source_url",
    "source_file",
    "source_sha256",
    "source_license",
    "source_attribution",
    "source_terms_url",
    "rights_reviewed_at",
    "published_at",
    "consolidated_at",
    "source_modified_at",
    "retrieved_at",
    "warning",
]


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---\n"):
        return {}, text
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return {}, text

    frontmatter_text = parts[0][4:]
    body_text = parts[1]

    try:
        metadata = yaml.safe_load(frontmatter_text)
        if not isinstance(metadata, dict):
            metadata = {}
    except yaml.YAMLError:
        metadata = {}

    return metadata, body_text


def serialize_frontmatter(metadata: dict[str, Any]) -> str:
    ordered_meta: dict[str, Any] = {}

    for field in FIELD_ORDER:
        if field in metadata:
            ordered_meta[field] = metadata[field]

    for k, v in metadata.items():
        if k not in FIELD_ORDER:
            ordered_meta[k] = v

    class NoAliasDumper(yaml.SafeDumper):
        def ignore_aliases(self, data: Any) -> bool:
            return True

    yaml_str = yaml.dump(
        ordered_meta,
        Dumper=NoAliasDumper,
        default_flow_style=False,
        sort_keys=False,
        allow_unicode=True,
    )

    return f"---\n{yaml_str}---\n"


def validate_frontmatter(metadata: dict[str, Any], schema_path: Path) -> list[LexError]:
    with open(schema_path, encoding="utf-8") as f:
        schema = json.load(f)

    validator = jsonschema.Draft202012Validator(schema)
    errors: list[LexError] = []

    for error in validator.iter_errors(metadata):
        message = error.message
        if error.path:
            path_str = ".".join(str(p) for p in error.path)
            message = f"Field '{path_str}': {message}"

        errors.append(
            LexError(
                code=ErrorCode.LEX_INVALID_DATA,
                path=schema_path,
                message=message,
            )
        )

    for k in metadata:
        if k not in FIELD_ORDER:
            errors.append(
                LexError(
                    code=ErrorCode.LEX_INVALID_DATA,
                    path=schema_path,
                    message=f"Unknown field '{k}'",
                )
            )

    ordered_keys = [k for k in FIELD_ORDER if k in metadata]
    actual_keys = [k for k in metadata if k in FIELD_ORDER]
    if ordered_keys != actual_keys:
        errors.append(
            LexError(
                code=ErrorCode.LEX_INVALID_DATA,
                path=schema_path,
                message="Fields are not in the correct order",
            )
        )

    return errors
