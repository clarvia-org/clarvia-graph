"""``lex_written_response_v1`` writer output schema."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

WRITER_SCHEMA_VERSION = "lex_written_response_v1"


class LexWrittenResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    response_version: Literal["lex_written_response_v1"]
    body_markdown: str = Field(min_length=1, max_length=12000)
    used_action_ids: list[Annotated[str, Field(pattern=r"^A[1-8]$")]] = Field(
        max_length=8
    )
    used_source_ids: list[Annotated[int, Field(ge=1, le=12)]] = Field(max_length=12)
    used_contact_ids: list[Annotated[int, Field(ge=1, le=12)]] = Field(max_length=12)


LEX_WRITTEN_RESPONSE_JSON_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "additionalProperties": False,
    "required": [
        "response_version",
        "body_markdown",
        "used_action_ids",
        "used_source_ids",
        "used_contact_ids",
    ],
    "properties": {
        "response_version": {
            "type": "string",
            "const": "lex_written_response_v1",
        },
        "body_markdown": {"type": "string", "minLength": 1, "maxLength": 12000},
        "used_action_ids": {
            "type": "array",
            "maxItems": 8,
            "items": {"type": "string", "pattern": "^A[1-8]$"},
        },
        "used_source_ids": {
            "type": "array",
            "maxItems": 12,
            "items": {"type": "integer", "minimum": 1, "maximum": 12},
        },
        "used_contact_ids": {
            "type": "array",
            "maxItems": 12,
            "items": {"type": "integer", "minimum": 1, "maximum": 12},
        },
    },
}


__all__ = [
    "WRITER_SCHEMA_VERSION",
    "LexWrittenResponse",
    "LEX_WRITTEN_RESPONSE_JSON_SCHEMA",
]
