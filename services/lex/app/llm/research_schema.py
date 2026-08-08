"""``lex_research_brief_v1`` structured research output schema."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field

RESEARCH_SCHEMA_VERSION = "lex_research_brief_v1"

SituationStage = Literal[
    "planning_ahead",
    "imminent_death",
    "recent_death",
    "later_administration",
    "focused_follow_up",
    "cross_border",
    "unknown",
]
SafetyStatus = Literal["ordinary", "immediate_risk"]
ActionTiming = Literal[
    "now",
    "before_death",
    "first_hours",
    "first_day",
    "next_few_days",
    "later",
]
MissingField = Literal[
    "death_or_planning_status",
    "death_country",
    "residence_country",
    "care_country",
    "subdivision",
    "asset_country",
    "other",
]

CountryCode = Annotated[str, Field(pattern=r"^([A-Z]{2}|ZZ)$")]
HttpsUrl = Annotated[str, Field(min_length=9, max_length=2000, pattern=r"^https://")]

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


class ResearchJurisdiction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    country_code: CountryCode
    subdivision: Annotated[str, Field(max_length=120)] | None
    role: JurisdictionRole


class ResearchImmediateAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Annotated[str, Field(pattern=r"^A[1-8]$")]
    action: Annotated[str, Field(min_length=1, max_length=300)]
    explanation: Annotated[str, Field(min_length=1, max_length=1000)]
    timing: ActionTiming
    handled_by: list[Annotated[str, Field(max_length=100)]] = Field(max_length=6)
    documents: list[Annotated[str, Field(max_length=200)]] = Field(max_length=10)
    source_ids: list[Annotated[int, Field(ge=1, le=12)]] = Field(max_length=8)
    contact_ids: list[Annotated[int, Field(ge=1, le=12)]] = Field(max_length=8)
    required: bool


class ResearchContact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int = Field(ge=1, le=12)
    name: str = Field(min_length=1, max_length=250)
    kind: ContactKind
    country_code: CountryCode
    website: HttpsUrl
    phone: Annotated[str, Field(max_length=80)] | None
    email: Annotated[str, Field(max_length=254)] | None
    commercial: bool
    note: str = Field(min_length=1, max_length=400)
    source_id: int = Field(ge=1, le=12)


class ResearchSource(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int = Field(ge=1, le=12)
    title: str = Field(min_length=1, max_length=300)
    publisher: str = Field(min_length=1, max_length=200)
    url: HttpsUrl


class LexResearchBrief(BaseModel):
    model_config = ConfigDict(extra="forbid")

    response_version: Literal["lex_research_brief_v1"]
    action: Literal["answer", "clarify", "decline"]
    language: str = Field(
        min_length=2,
        max_length=35,
        pattern=r"^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$",
    )
    situation_stage: SituationStage
    safety_status: SafetyStatus
    jurisdictions: list[ResearchJurisdiction] = Field(max_length=10)
    user_facts: list[Annotated[str, Field(min_length=1, max_length=500)]] = Field(
        max_length=30
    )
    completed_actions: list[
        Annotated[str, Field(min_length=1, max_length=300)]
    ] = Field(default_factory=list, max_length=20)
    current_question: Annotated[str, Field(min_length=1, max_length=1000)] | None = None
    missing_fields: list[MissingField] = Field(default_factory=list, max_length=5)
    off_topic_label: Annotated[str, Field(max_length=150)] | None = None
    immediate_actions: list[ResearchImmediateAction] = Field(
        default_factory=list, max_length=8
    )
    later_topics: list[Annotated[str, Field(min_length=1, max_length=200)]] = Field(
        default_factory=list, max_length=8
    )
    contacts: list[ResearchContact] = Field(default_factory=list, max_length=12)
    sources: list[ResearchSource] = Field(default_factory=list, max_length=12)
    research_status: Literal["not_needed", "adequate", "insufficient"]


LEX_RESEARCH_BRIEF_JSON_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "additionalProperties": False,
    "required": [
        "response_version",
        "action",
        "language",
        "situation_stage",
        "safety_status",
        "jurisdictions",
        "user_facts",
        "completed_actions",
        "current_question",
        "missing_fields",
        "off_topic_label",
        "immediate_actions",
        "later_topics",
        "contacts",
        "sources",
        "research_status",
    ],
    "properties": {
        "response_version": {"type": "string", "const": "lex_research_brief_v1"},
        "action": {"type": "string", "enum": ["answer", "clarify", "decline"]},
        "language": {
            "type": "string",
            "minLength": 2,
            "maxLength": 35,
            "pattern": "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$",
        },
        "situation_stage": {
            "type": "string",
            "enum": [
                "planning_ahead",
                "imminent_death",
                "recent_death",
                "later_administration",
                "focused_follow_up",
                "cross_border",
                "unknown",
            ],
        },
        "safety_status": {
            "type": "string",
            "enum": ["ordinary", "immediate_risk"],
        },
        "jurisdictions": {
            "type": "array",
            "maxItems": 10,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["country_code", "subdivision", "role"],
                "properties": {
                    "country_code": {
                        "type": "string",
                        "pattern": "^([A-Z]{2}|ZZ)$",
                    },
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
        "user_facts": {
            "type": "array",
            "maxItems": 30,
            "items": {"type": "string", "minLength": 1, "maxLength": 500},
        },
        "completed_actions": {
            "type": "array",
            "maxItems": 20,
            "items": {"type": "string", "minLength": 1, "maxLength": 300},
        },
        "current_question": {
            "anyOf": [
                {"type": "string", "minLength": 1, "maxLength": 1000},
                {"type": "null"},
            ]
        },
        "missing_fields": {
            "type": "array",
            "maxItems": 5,
            "items": {
                "type": "string",
                "enum": [
                    "death_or_planning_status",
                    "death_country",
                    "residence_country",
                    "care_country",
                    "subdivision",
                    "asset_country",
                    "other",
                ],
            },
        },
        "off_topic_label": {
            "anyOf": [
                {"type": "string", "maxLength": 150},
                {"type": "null"},
            ]
        },
        "immediate_actions": {
            "type": "array",
            "maxItems": 8,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "id",
                    "action",
                    "explanation",
                    "timing",
                    "handled_by",
                    "documents",
                    "source_ids",
                    "contact_ids",
                    "required",
                ],
                "properties": {
                    "id": {"type": "string", "pattern": "^A[1-8]$"},
                    "action": {"type": "string", "minLength": 1, "maxLength": 300},
                    "explanation": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 1000,
                    },
                    "timing": {
                        "type": "string",
                        "enum": [
                            "now",
                            "before_death",
                            "first_hours",
                            "first_day",
                            "next_few_days",
                            "later",
                        ],
                    },
                    "handled_by": {
                        "type": "array",
                        "maxItems": 6,
                        "items": {"type": "string", "maxLength": 100},
                    },
                    "documents": {
                        "type": "array",
                        "maxItems": 10,
                        "items": {"type": "string", "maxLength": 200},
                    },
                    "source_ids": {
                        "type": "array",
                        "maxItems": 8,
                        "items": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 12,
                        },
                    },
                    "contact_ids": {
                        "type": "array",
                        "maxItems": 8,
                        "items": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 12,
                        },
                    },
                    "required": {"type": "boolean"},
                },
            },
        },
        "later_topics": {
            "type": "array",
            "maxItems": 8,
            "items": {"type": "string", "minLength": 1, "maxLength": 200},
        },
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
                    "country_code": {
                        "type": "string",
                        "pattern": "^([A-Z]{2}|ZZ)$",
                    },
                    "website": {
                        "type": "string",
                        "minLength": 9,
                        "maxLength": 2000,
                        "pattern": "^https://",
                    },
                    "phone": {
                        "anyOf": [
                            {"type": "string", "maxLength": 80},
                            {"type": "null"},
                        ]
                    },
                    "email": {
                        "anyOf": [
                            {"type": "string", "maxLength": 254},
                            {"type": "null"},
                        ]
                    },
                    "commercial": {"type": "boolean"},
                    "note": {"type": "string", "minLength": 1, "maxLength": 400},
                    "source_id": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 12,
                    },
                },
            },
        },
        "sources": {
            "type": "array",
            "maxItems": 12,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["id", "title", "publisher", "url"],
                "properties": {
                    "id": {"type": "integer", "minimum": 1, "maximum": 12},
                    "title": {"type": "string", "minLength": 1, "maxLength": 300},
                    "publisher": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 200,
                    },
                    "url": {
                        "type": "string",
                        "minLength": 9,
                        "maxLength": 2000,
                        "pattern": "^https://",
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
    "RESEARCH_SCHEMA_VERSION",
    "LexResearchBrief",
    "LEX_RESEARCH_BRIEF_JSON_SCHEMA",
    "ResearchImmediateAction",
    "ResearchContact",
    "ResearchSource",
    "ResearchJurisdiction",
]
