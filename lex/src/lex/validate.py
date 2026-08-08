import hashlib
import json
import re
from pathlib import Path

import jsonschema  # type: ignore[import-untyped]

from lex.dataset import discover_laws
from lex.errors import ErrorCode, LexError
from lex.fidelity import check_law_fidelity
from lex.frontmatter import FIELD_ORDER, parse_frontmatter


def validate_dataset(root: Path) -> list[LexError]:
    errors: list[LexError] = []

    schema_path = Path(__file__).parent.parent.parent / "schemas" / "law-frontmatter.schema.json"
    if not schema_path.exists():
        schema_path = root / "schemas" / "law-frontmatter.schema.json"

    schema: dict[str, object] | None = None
    if schema_path.exists():
        with open(schema_path, encoding="utf-8") as f:
            schema = json.load(f)

    validator = jsonschema.Draft202012Validator(schema) if schema else None

    laws = discover_laws(root)
    # Uniqueness is per law-language record; the same id is shared across languages.
    seen_id_langs: set[tuple[str, str]] = set()

    for law in laws:
        rel_path = law.path.relative_to(root)

        # Validate frontmatter schema
        if validator:
            for error in validator.iter_errors(law.metadata):
                message = error.message
                if error.path:
                    path_str = ".".join(str(p) for p in error.path)
                    message = f"Field '{path_str}': {message}"
                errors.append(LexError(ErrorCode.LEX_INVALID_DATA, rel_path, message))

        # Validate exact field order
        ordered_keys = [k for k in FIELD_ORDER if k in law.metadata]
        actual_keys = [k for k in law.metadata if k in FIELD_ORDER]
        if ordered_keys != actual_keys:
            errors.append(
                LexError(
                    ErrorCode.LEX_INVALID_DATA, rel_path, "Fields are not in the correct order"
                )
            )

        # Check duplicate ID+language pairs
        law_id = law.id
        if law_id:
            key = (law_id, law.language)
            if key in seen_id_langs:
                errors.append(
                    LexError(
                        ErrorCode.LEX_INVALID_ID,
                        rel_path,
                        f"Duplicate ID/language: {law_id} ({law.language})",
                    )
                )
            seen_id_langs.add(key)

            # Check ID format match
            country_part = law.country
            if law_id.split("/")[0] != country_part:
                errors.append(
                    LexError(ErrorCode.LEX_INVALID_ID, rel_path, f"ID country mismatch: {law_id}")
                )

            # Basic uppercase check
            if not re.match(r"^[a-z]{2}/[a-z0-9]+(?:-[a-z0-9]+)*$", law_id):
                errors.append(
                    LexError(ErrorCode.LEX_INVALID_ID, rel_path, f"Invalid ID format: {law_id}")
                )

        # Validate rights fields
        required_rights = [
            "source_license",
            "source_attribution",
            "source_terms_url",
            "rights_reviewed_at",
        ]
        for rf in required_rights:
            if rf not in law.metadata:
                errors.append(LexError(ErrorCode.LEX_INVALID_RIGHTS, rel_path, f"Missing {rf}"))

        # Check source file and hash
        source_file = law.metadata.get("source_file")
        source_sha256 = law.metadata.get("source_sha256")

        if source_file and source_sha256:
            source_path = law.path.parent / source_file
            if not source_path.exists():
                errors.append(
                    LexError(
                        ErrorCode.LEX_SOURCE_NOT_FOUND,
                        rel_path,
                        f"Source file {source_file} not found",
                    )
                )
            else:
                with open(source_path, "rb") as f:
                    source_bytes = f.read()
                actual_hash = hashlib.sha256(source_bytes).hexdigest()
                if actual_hash != source_sha256:
                    errors.append(
                        LexError(
                            ErrorCode.LEX_HASH_MISMATCH,
                            rel_path,
                            f"Expected {source_sha256}, got {actual_hash}",
                        )
                    )

        # Check duplicate anchors
        with open(law.path, encoding="utf-8") as f:
            text_content = f.read()

        _, body_text = parse_frontmatter(text_content)
        anchors = re.findall(r'<a\s+id="([^"]+)"></a>', body_text)
        seen_anchors: set[str] = set()
        for anchor in anchors:
            if anchor in seen_anchors:
                errors.append(
                    LexError(ErrorCode.LEX_INVALID_DATA, rel_path, f"Duplicate anchor: {anchor}")
                )
            seen_anchors.add(anchor)

        # Markdown ↔ retained source fidelity (lists/paragraphs not silently dropped)
        errors.extend(check_law_fidelity(law.path, rel_path=rel_path))

    return errors
