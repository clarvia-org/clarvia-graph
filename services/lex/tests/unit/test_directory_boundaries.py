"""Directory-boundary and public-safety static checks (blueprint 31.10)."""

from __future__ import annotations

import re
from pathlib import Path

from app.config import SERVICE_ROOT

APP_DIR = SERVICE_ROOT / "app"


def _python_files(root: Path) -> list[Path]:
    return list(root.rglob("*.py"))


def test_app_has_no_parent_directory_imports() -> None:
    parent_relative = re.compile(r"^\s*from\s+\.\.")
    for path in _python_files(APP_DIR):
        for line in path.read_text(encoding="utf-8").splitlines():
            assert not parent_relative.match(line), f"parent import in {path}"


def test_app_imports_only_self_or_external() -> None:
    # No app module may import the website or a sibling repo package.
    forbidden = ("workflow_web", "workflow-web", "clarvia_graph", "ops_private")
    for path in _python_files(APP_DIR):
        text = path.read_text(encoding="utf-8")
        for token in forbidden:
            assert token not in text, f"{token} referenced in {path}"


def test_dockerfile_copy_sources_are_inside_service_dir() -> None:
    dockerfile = (SERVICE_ROOT / "Dockerfile").read_text(encoding="utf-8")
    for line in dockerfile.splitlines():
        stripped = line.strip()
        if not stripped.upper().startswith("COPY"):
            continue
        tokens = stripped.split()[1:]
        sources = [t for t in tokens if not t.startswith("--")][:-1]
        for source in sources:
            assert ".." not in source, f"COPY escapes context: {line}"
            assert not source.startswith("/"), f"absolute COPY source: {line}"


def test_no_github_directory() -> None:
    assert not (SERVICE_ROOT / ".github").exists()


def test_no_github_actions_workflows() -> None:
    workflows = SERVICE_ROOT / ".github" / "workflows"
    assert not workflows.exists()


def test_no_terraform_files() -> None:
    assert not list(SERVICE_ROOT.rglob("*.tf"))
    assert not list(SERVICE_ROOT.rglob("*.tf.json"))


def test_runtime_private_is_gitignored() -> None:
    gitignore = (SERVICE_ROOT / ".gitignore").read_text(encoding="utf-8")
    assert "runtime-private/prompts/*" in gitignore
    assert "runtime-private/deploy/*" in gitignore
    assert "runtime-private/evals/*" in gitignore
    assert "runtime-private/data/*" in gitignore


def test_dockerignore_excludes_sensitive_material() -> None:
    dockerignore = (SERVICE_ROOT / ".dockerignore").read_text(encoding="utf-8")
    for needle in (".env", "-sa-key.json", "credentials.json", "logs/", "data/"):
        assert needle in dockerignore


def test_env_example_exists_and_dotenv_is_ignored() -> None:
    """Local ``.env`` may exist for operator use; it must never be shippable.

    The service directory may contain a developer ``.env`` (Secret Manager
    values for local runs). What must hold: ``.env.example`` exists with no
    secrets, and both ``.gitignore`` and ``.dockerignore`` exclude ``.env``.
    """
    assert (SERVICE_ROOT / ".env.example").exists()
    gitignore = (SERVICE_ROOT / ".gitignore").read_text(encoding="utf-8")
    dockerignore = (SERVICE_ROOT / ".dockerignore").read_text(encoding="utf-8")
    assert ".env" in gitignore
    assert ".env" in dockerignore
    example = (SERVICE_ROOT / ".env.example").read_text(encoding="utf-8")
    assert "sk-" not in example
    assert "BEGIN PRIVATE" not in example


def test_website_is_not_a_dependency() -> None:
    pyproject = (SERVICE_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    for token in ("workflow-web", "workflow_web", "website"):
        assert token not in pyproject
    # No JavaScript dependency manifest belongs in this Python service.
    assert not (SERVICE_ROOT / "package.json").exists()
    assert not (SERVICE_ROOT / "node_modules").exists()
