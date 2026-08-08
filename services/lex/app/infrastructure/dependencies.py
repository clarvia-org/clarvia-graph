"""Lazy import of optional cloud SDKs.

Google SDKs are imported only when ``adapter_backend=gcp`` actually needs them,
so the unit suite runs with no cloud packages, credentials, or network. A
missing package then fails with an actionable message instead of an
``ImportError`` deep inside a request.
"""

from __future__ import annotations

import importlib
from types import ModuleType

from app.domain.errors import MissingDependencyError

#: Install hints keyed by top-level distribution import path.
INSTALL_HINTS: dict[str, str] = {
    "googleapiclient": "pip install google-api-python-client",
    "google.auth": "pip install google-auth",
    "google.oauth2": "pip install google-auth",
    "google.cloud.firestore": "pip install google-cloud-firestore",
    "google.cloud.tasks_v2": "pip install google-cloud-tasks",
}


def require_module(module_name: str) -> ModuleType:
    """Import ``module_name`` or raise :class:`MissingDependencyError`."""
    try:
        return importlib.import_module(module_name)
    except ImportError as exc:
        hint = INSTALL_HINTS.get(module_name, f"pip install {module_name}")
        raise MissingDependencyError(module_name, hint) from exc


__all__ = ["INSTALL_HINTS", "require_module"]
