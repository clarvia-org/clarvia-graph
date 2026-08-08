"""Tests for app.config."""

from __future__ import annotations

from pathlib import Path

import pytest
from app.config import SERVICE_ROOT, Settings, get_settings
from pydantic import ValidationError

from .conftest import build_settings


@pytest.mark.usefixtures("clean_env")
def test_defaults_match_blueprint() -> None:
    settings = Settings(_env_file=None)  # type: ignore[call-arg]
    assert settings.environment == "development"
    assert settings.gcp_region == "europe-west1"
    assert settings.lex_mailbox == "lex@clarvia.org"
    assert settings.openai_model == "gpt-5-mini"
    assert settings.prompt_version == "lex-v1"
    assert settings.prompt_path == "runtime-private/prompts/lex-v1.txt"
    assert settings.schema_version == "lex_response_v1"
    assert settings.processing_mode == "disabled"
    assert settings.processing_enabled is False
    assert settings.adapter_backend == "memory"
    assert settings.lease_duration_seconds == 600
    assert settings.max_visible_recipients == 10
    assert settings.max_sender_requests_per_day == 10
    assert settings.max_body_chars == 100_000
    assert settings.max_thread_chars == 120_000
    assert settings.generation_pipeline == "two_pass"
    assert settings.research_prompt_version == "lex-research-v1"
    assert settings.writer_prompt_version == "lex-writer-v1"
    assert settings.research_max_output_tokens == 12000
    assert settings.writer_max_output_tokens == 4000
    assert settings.max_writer_history_chars == 20_000
    assert settings.pipeline_version == "two-pass-v1"


@pytest.mark.usefixtures("clean_env")
def test_region_other_than_europe_west1_is_rejected() -> None:
    with pytest.raises(ValidationError):
        build_settings(gcp_region="us-east1")
    with pytest.raises(ValidationError):
        build_settings(cloud_tasks_location="us-central1")


@pytest.mark.usefixtures("clean_env")
def test_production_requires_gcp_backend() -> None:
    with pytest.raises(ValidationError):
        build_settings(environment="production", adapter_backend="memory")


@pytest.mark.usefixtures("clean_env")
def test_gcp_backend_requires_task_target_and_invoker() -> None:
    with pytest.raises(ValidationError):
        build_settings(adapter_backend="gcp")


@pytest.mark.usefixtures("clean_env")
def test_blank_required_field_is_rejected() -> None:
    with pytest.raises(ValidationError):
        build_settings(gcp_project_id="   ")


@pytest.mark.usefixtures("clean_env")
def test_non_positive_limit_is_rejected() -> None:
    with pytest.raises(ValidationError):
        build_settings(max_body_chars=0)


@pytest.mark.usefixtures("clean_env")
def test_relative_prompt_path_resolves_from_service_root() -> None:
    settings = build_settings()
    resolved = settings.resolved_prompt_path
    assert resolved.is_absolute()
    assert resolved == (SERVICE_ROOT / settings.prompt_path).resolve()
    # Must not depend on the caller's current working directory.
    assert str(SERVICE_ROOT) in str(resolved)


@pytest.mark.usefixtures("clean_env")
def test_absolute_prompt_path_is_preserved(tmp_path: Path) -> None:
    absolute = tmp_path / "prompt.txt"
    settings = build_settings(LEX_PROMPT_PATH=str(absolute))
    assert settings.resolved_prompt_path == absolute


@pytest.mark.usefixtures("clean_env")
def test_prompt_path_reads_lex_prompt_path_env(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    absolute = tmp_path / "from-env.txt"
    monkeypatch.setenv("LEX_PROMPT_PATH", str(absolute))
    settings = build_settings()
    assert settings.prompt_path == str(absolute)


@pytest.mark.usefixtures("clean_env")
def test_production_requires_project_id() -> None:
    with pytest.raises(ValidationError):
        build_settings(environment="production", gcp_project_id="")


def test_get_settings_is_cached() -> None:
    get_settings.cache_clear()
    first = get_settings()
    second = get_settings()
    assert first is second
    get_settings.cache_clear()
