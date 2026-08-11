"""``lex_response_v1`` structured response schema.

Both the Pydantic model (runtime validation) and the canonical JSON Schema
(sent to the model as the response contract) are defined here and must stay in
sync with blueprint section 17.
"""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

SCHEMA_VERSION = "lex_response_v1"

JurisdictionRole = Literal[
    "death_location",
    "habitual_residence",
    "nationality",
    "care_location",
    "family_location",
    "asset_location",
    "burial_or_cremation_location",
    "other",
]

ContactKind = Literal[
    "authority",
    "civil_registry",
    "health_service",
    "pension_or_benefits_body",
    "consular_service",
    "support_service",
    "professional_directory",
    "funeral_provider",
    "repatriation_provider",
    "legal_or_notarial_directory",
    "other",
]

CountryCode = Annotated[str, Field(pattern=r"^([A-Z]{2}|ZZ)$")]
HttpsUrl = Annotated[str, Field(min_length=9, max_length=2000, pattern=r"^https?://")]


class LexJurisdiction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    country_code: CountryCode
    subdivision: Annotated[str, Field(max_length=120)] | None
    role: JurisdictionRole


class LexContact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int = Field(ge=1, le=12)
    name: str = Field(min_length=1, max_length=250)
    kind: ContactKind
    country_code: CountryCode
    website: HttpsUrl
    phone: Annotated[str, Field(min_length=3, max_length=80)] | None
    email: Annotated[str, Field(min_length=3, max_length=254)] | None
    commercial: bool
    note: str = Field(min_length=1, max_length=400)
    source_id: int = Field(ge=1, le=16)


class LexSource(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int = Field(ge=1, le=16)
    title: str = Field(min_length=1, max_length=300)
    publisher: str = Field(min_length=1, max_length=200)
    url: HttpsUrl


class LexResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    response_version: Literal["lex_response_v1"]
    action: Literal["answer", "clarify", "decline"]
    language: str = Field(
        min_length=2,
        max_length=35,
        pattern=r"^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$",
    )
    jurisdictions: list[LexJurisdiction] = Field(max_length=10)
    body_markdown: str = Field(min_length=1, max_length=18000)
    contacts: list[LexContact] = Field(max_length=12)
    sources: list[LexSource] = Field(max_length=16)
    research_status: Literal["not_needed", "adequate", "insufficient"]


# Canonical JSON Schema (blueprint section 17), sent to the model verbatim.
LEX_RESPONSE_JSON_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "additionalProperties": False,
    "required": [
        "response_version",
        "action",
        "language",
        "jurisdictions",
        "body_markdown",
        "contacts",
        "sources",
        "research_status",
    ],
    "properties": {
        "response_version": {"type": "string", "const": "lex_response_v1"},
        "action": {"type": "string", "enum": ["answer", "clarify", "decline"]},
        "language": {
            "type": "string",
            "minLength": 2,
            "maxLength": 35,
            "pattern": "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$",
        },
        "jurisdictions": {
            "type": "array",
            "maxItems": 10,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["country_code", "subdivision", "role"],
                "properties": {
                    "country_code": {"type": "string", "pattern": "^([A-Z]{2}|ZZ)$"},
                    "subdivision": {
                        "anyOf": [
                            {"type": "string", "maxLength": 120},
                            {"type": "null"},
                        ]
                    },
                    "role": {
                        "type": "string",
                        "enum": [
                            "death_location",
                            "habitual_residence",
                            "nationality",
                            "care_location",
                            "family_location",
                            "asset_location",
                            "burial_or_cremation_location",
                            "other",
                        ],
                    },
                },
            },
        },
        "body_markdown": {"type": "string", "minLength": 1, "maxLength": 18000},
        "contacts": {
            "type": "array",
            "maxItems": 12,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "id",
                    "name",
                    "kind",
                    "country_code",
                    "website",
                    "phone",
                    "email",
                    "commercial",
                    "note",
                    "source_id",
                ],
                "properties": {
                    "id": {"type": "integer", "minimum": 1, "maximum": 12},
                    "name": {"type": "string", "minLength": 1, "maxLength": 250},
                    "kind": {
                        "type": "string",
                        "enum": [
                            "authority",
                            "civil_registry",
                            "health_service",
                            "pension_or_benefits_body",
                            "consular_service",
                            "support_service",
                            "professional_directory",
                            "funeral_provider",
                            "repatriation_provider",
                            "legal_or_notarial_directory",
                            "other",
                        ],
                    },
                    "country_code": {"type": "string", "pattern": "^([A-Z]{2}|ZZ)$"},
                    "website": {
                        "type": "string",
                        "minLength": 9,
                        "maxLength": 2000,
                        "pattern": "^https?://",
                    },
                    "phone": {
                        "anyOf": [
                            {"type": "string", "minLength": 3, "maxLength": 80},
                            {"type": "null"},
                        ]
                    },
                    "email": {
                        "anyOf": [
                            {"type": "string", "minLength": 3, "maxLength": 254},
                            {"type": "null"},
                        ]
                    },
                    "commercial": {"type": "boolean"},
                    "note": {"type": "string", "minLength": 1, "maxLength": 400},
                    "source_id": {"type": "integer", "minimum": 1, "maximum": 16},
                },
            },
        },
        "sources": {
            "type": "array",
            "maxItems": 16,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["id", "title", "publisher", "url"],
                "properties": {
                    "id": {"type": "integer", "minimum": 1, "maximum": 16},
                    "title": {"type": "string", "minLength": 1, "maxLength": 300},
                    "publisher": {"type": "string", "minLength": 1, "maxLength": 200},
                    "url": {
                        "type": "string",
                        "minLength": 9,
                        "maxLength": 2000,
                        "pattern": "^https?://",
                    },
                },
            },
        },
        "research_status": {
            "type": "string",
            "enum": ["not_needed", "adequate", "insufficient"],
        },
    },
}


__all__ = [
    "SCHEMA_VERSION",
    "LexJurisdiction",
    "LexContact",
    "LexSource",
    "LexResponse",
    "LEX_RESPONSE_JSON_SCHEMA",
]
