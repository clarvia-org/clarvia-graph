"""Strict application configuration for the Lex email service.

Relative paths (for example the prompt path) resolve from ``SERVICE_ROOT`` — the
directory that contains the ``app`` package — never from the caller's arbitrary
working directory or a parent repository. This keeps the service relocatable
into a future monorepo without configuration rewrites.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Directory containing the ``app`` package (the self-contained service root).
SERVICE_ROOT: Path = Path(__file__).resolve().parent.parent

REQUIRED_REGION = "europe-west1"

ProcessingMode = Literal["disabled", "allowlist", "public"]
Environment = Literal["development", "staging", "production"]
AdapterBackend = Literal["memory", "gcp"]
GenerationPipeline = Literal["single_pass", "two_pass"]


class Settings(BaseSettings):
    """Validated runtime configuration.

    Values are read from environment variables (and an optional local ``.env``).
    No secret values are defined here; secrets are injected at deploy time via
    Secret Manager references only.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
    )

    environment: Environment = "development"
    gcp_project_id: str = "fleet-garage-502110-g6"
    gcp_region: str = REQUIRED_REGION
    lex_mailbox: str = "lex@clarvia.org"
    openai_model: str = "gpt-5.6-luna"
    openai_api_key: str = ""
    max_output_tokens: int = 12000
    research_max_output_tokens: int = 12000
    writer_max_output_tokens: int = 4000
    prompt_version: str = "lex-v1"
    research_prompt_version: str = Field(
        default="lex-research-v1",
        validation_alias=AliasChoices(
            "RESEARCH_PROMPT_VERSION", "research_prompt_version"
        ),
    )
    writer_prompt_version: str = Field(
        default="lex-writer-v1",
        validation_alias=AliasChoices(
            "WRITER_PROMPT_VERSION", "writer_prompt_version"
        ),
    )
    prompt_path: str = Field(
        default="runtime-private/prompts/lex-v1.txt",
        validation_alias=AliasChoices("LEX_PROMPT_PATH", "prompt_path"),
    )
    research_prompt_path: str = Field(
        default="runtime-private/prompts/lex-research-v1.txt",
        validation_alias=AliasChoices(
            "LEX_RESEARCH_PROMPT_PATH", "research_prompt_path"
        ),
    )
    writer_prompt_path: str = Field(
        default="runtime-private/prompts/lex-writer-v1.txt",
        validation_alias=AliasChoices(
            "LEX_WRITER_PROMPT_PATH", "writer_prompt_path"
        ),
    )
    generation_pipeline: GenerationPipeline = Field(
        default="single_pass",
        validation_alias=AliasChoices(
            "LEX_GENERATION_PIPELINE", "generation_pipeline"
        ),
    )
    pipeline_version: str = "single-pass-v1"
    schema_version: str = "lex_response_v1"
    research_schema_version: str = Field(
        default="lex_research_brief_v1",
        validation_alias=AliasChoices(
            "RESEARCH_SCHEMA_VERSION", "research_schema_version"
        ),
    )
    writer_schema_version: str = Field(
        default="lex_written_response_v1",
        validation_alias=AliasChoices(
            "WRITER_SCHEMA_VERSION", "writer_schema_version"
        ),
    )
    processing_mode: ProcessingMode = "disabled"
    processing_enabled: bool = False
    max_visible_recipients: int = 10
    max_sender_requests_per_day: int = 5
    max_thread_lex_replies: int = 5
    include_thread_quote: bool = Field(
        default=True,
        validation_alias=AliasChoices(
            "LEX_INCLUDE_THREAD_QUOTE", "include_thread_quote"
        ),
    )
    thread_quote_max_chars_per_message: int = 2000
    thread_quote_max_total_chars: int = 40_000
    max_body_chars: int = 100_000
    max_thread_chars: int = 120_000
    max_writer_history_chars: int = 20_000
    research_daily_call_limit: int = 500
    writer_daily_call_limit: int = 500
    log_level: str = "INFO"

    # Phase 2: discovery, durable tasks, and worker leases.
    adapter_backend: AdapterBackend = "memory"
    poll_max_results: int = 50
    lease_duration_seconds: int = 600
    max_process_attempts: int = 8
    max_llm_calls_per_message: int = 2
    cloud_tasks_queue: str = "lex-process"
    cloud_tasks_location: str = REQUIRED_REGION
    cloud_tasks_target_url: str = ""
    cloud_tasks_invoker_service_account: str = ""
    firestore_database: str = "(default)"
    internal_auth_token: str = ""
    hmac_secret: str = ""
    website_hmac_secret: str = Field(
        default="",
        validation_alias=AliasChoices(
            "LEX_WEBSITE_HMAC_SECRET", "website_hmac_secret"
        ),
    )
    lex_aliases: str = ""
    global_daily_llm_limit: int = 500
    force_circuit_open: bool = False
    allowlist_sender_hmacs: str = Field(
        default="",
        validation_alias=AliasChoices(
            "ALLOWLIST_SENDER_HMACS", "allowlist_sender_hmacs"
        ),
    )
    allowlist_senders: str = Field(
        default="",
        validation_alias=AliasChoices("ALLOWLIST_SENDERS", "allowlist_senders"),
    )
    retention_trash_gmail: bool = False

    @field_validator("gcp_region", "cloud_tasks_location")
    @classmethod
    def _region_must_be_supported(cls, value: str) -> str:
        if value != REQUIRED_REGION:
            raise ValueError(f"Lex requires region {REQUIRED_REGION!r}; got {value!r}.")
        return value

    @field_validator(
        "gcp_project_id",
        "lex_mailbox",
        "openai_model",
        "prompt_version",
        "research_prompt_version",
        "writer_prompt_version",
        "prompt_path",
        "schema_version",
        "research_schema_version",
        "writer_schema_version",
        "pipeline_version",
        "cloud_tasks_queue",
        "firestore_database",
    )
    @classmethod
    def _not_blank(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("value must not be blank.")
        return value

    @field_validator(
        "max_visible_recipients",
        "max_sender_requests_per_day",
        "max_thread_lex_replies",
        "thread_quote_max_chars_per_message",
        "thread_quote_max_total_chars",
        "max_body_chars",
        "max_thread_chars",
        "poll_max_results",
        "lease_duration_seconds",
        "max_process_attempts",
        "max_llm_calls_per_message",
        "max_output_tokens",
        "research_max_output_tokens",
        "writer_max_output_tokens",
        "max_writer_history_chars",
        "research_daily_call_limit",
        "writer_daily_call_limit",
        "global_daily_llm_limit",
    )
    @classmethod
    def _must_be_positive(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("value must be a positive integer.")
        return value

    @model_validator(mode="after")
    def _require_production_config(self) -> Settings:
        if self.environment == "production" and not self.gcp_project_id.strip():
            raise ValueError("gcp_project_id is required when environment=production.")
        if self.environment == "production" and self.adapter_backend != "gcp":
            raise ValueError(
                "adapter_backend must be 'gcp' when environment=production."
            )
        return self

    @model_validator(mode="after")
    def _require_gcp_backend_config(self) -> Settings:
        """The GCP backend cannot create Cloud Tasks without a target and invoker."""
        if self.adapter_backend != "gcp":
            return self
        missing = [
            name
            for name in (
                "cloud_tasks_target_url",
                "cloud_tasks_invoker_service_account",
            )
            if not getattr(self, name).strip()
        ]
        if missing:
            raise ValueError(
                "adapter_backend='gcp' requires: " + ", ".join(sorted(missing)) + "."
            )
        return self

    @property
    def resolved_lex_aliases(self) -> frozenset[str]:
        """Configured Clarvia aliases (comma-separated) for loop detection."""
        if not self.lex_aliases.strip():
            return frozenset()
        return frozenset(
            part.strip().lower() for part in self.lex_aliases.split(",") if part.strip()
        )

    def _resolve_service_path(self, path: str) -> Path:
        candidate = Path(path)
        if candidate.is_absolute():
            return candidate
        return (SERVICE_ROOT / candidate).resolve()

    @property
    def resolved_prompt_path(self) -> Path:
        """Absolute prompt path resolved from the service root when relative."""
        return self._resolve_service_path(self.prompt_path)

    @property
    def resolved_research_prompt_path(self) -> Path:
        return self._resolve_service_path(self.research_prompt_path)

    @property
    def resolved_writer_prompt_path(self) -> Path:
        return self._resolve_service_path(self.writer_prompt_path)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings, validated at first access."""
    return Settings()
