"""Tests for app.llm.schema (lex_response_v1)."""

from __future__ import annotations

import pytest
from app.llm.schema import (
    LEX_RESPONSE_JSON_SCHEMA,
    SCHEMA_VERSION,
    LexResponse,
)
from pydantic import ValidationError

from .conftest import make_answer_response


def test_valid_answer_parses() -> None:
    response = make_answer_response()
    assert response.response_version == "lex_response_v1"
    assert response.action == "answer"


def test_additional_properties_forbidden() -> None:
    with pytest.raises(ValidationError):
        make_answer_response(unexpected_field="nope")


def test_response_version_is_constant() -> None:
    with pytest.raises(ValidationError):
        make_answer_response(response_version="lex_response_v2")


def test_invalid_language_pattern_rejected() -> None:
    with pytest.raises(ValidationError):
        make_answer_response(language="english!")


def test_invalid_action_rejected() -> None:
    with pytest.raises(ValidationError):
        make_answer_response(action="refuse")


def test_body_markdown_length_bounds() -> None:
    with pytest.raises(ValidationError):
        make_answer_response(body_markdown="")
    with pytest.raises(ValidationError):
        make_answer_response(body_markdown="x" * 18_001)


def test_source_url_must_be_https() -> None:
    with pytest.raises(ValidationError):
        LexResponse.model_validate(
            {
                "response_version": "lex_response_v1",
                "action": "answer",
                "language": "en",
                "jurisdictions": [],
                "body_markdown": "Body [1].\n\nLex.",
                "contacts": [],
                "sources": [
                    {
                        "id": 1,
                        "title": "t",
                        "publisher": "p",
                        "url": "http://insecure.example",
                    }
                ],
                "research_status": "adequate",
            }
        )


def test_schema_version_constant() -> None:
    assert SCHEMA_VERSION == "lex_response_v1"


def test_json_schema_shape() -> None:
    assert LEX_RESPONSE_JSON_SCHEMA["additionalProperties"] is False
    assert LEX_RESPONSE_JSON_SCHEMA["properties"]["response_version"]["const"] == (
        "lex_response_v1"
    )
    assert set(LEX_RESPONSE_JSON_SCHEMA["required"]) == {
        "response_version",
        "action",
        "language",
        "jurisdictions",
        "body_markdown",
        "contacts",
        "sources",
        "research_status",
    }
