"""Synthetic evaluation fixtures for Phase 4 validation harness."""

from __future__ import annotations

import json
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "fixtures"
ANCHORS_PATH = FIXTURES_DIR / "anchors.json"


def load_anchor_fixtures() -> list[dict[str, object]]:
    with ANCHORS_PATH.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise TypeError("anchor fixtures must be a JSON list")
    return data
