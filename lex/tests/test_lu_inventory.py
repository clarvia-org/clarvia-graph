"""Unit tests for Luxembourg inventory helpers (no network)."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

_SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "build_lu_inventory.py"
_SPEC = importlib.util.spec_from_file_location("build_lu_inventory", _SCRIPT)
assert _SPEC is not None and _SPEC.loader is not None
_MOD = importlib.util.module_from_spec(_SPEC)
sys.modules["build_lu_inventory"] = _MOD
_SPEC.loader.exec_module(_MOD)

classify_batch = _MOD.classify_batch
consolidation_date = _MOD.consolidation_date
derive_stable_id = _MOD.derive_stable_id
instrument_key = _MOD.instrument_key


def test_instrument_key_strips_consolide_and_code_dates() -> None:
    assert (
        instrument_key(
            "http://data.legilux.public.lu/eli/etat/leg/loi/2006/09/21/n1/consolide/20240801"
        )
        == "http://data.legilux.public.lu/eli/etat/leg/loi/2006/09/21/n1"
    )
    assert (
        instrument_key("http://data.legilux.public.lu/eli/etat/leg/code/penal/20250311")
        == "http://data.legilux.public.lu/eli/etat/leg/code/penal"
    )


def test_consolidation_date_prefers_consolide_segment() -> None:
    assert (
        consolidation_date(
            "http://data.legilux.public.lu/eli/etat/leg/loi/2006/09/21/n1/consolide/20240801"
        )
        == "20240801"
    )
    assert (
        consolidation_date("http://data.legilux.public.lu/eli/etat/leg/code/penal/20250311")
        == "20250311"
    )


def test_derive_stable_id_for_families() -> None:
    assert derive_stable_id(
        "http://data.legilux.public.lu/eli/etat/leg/code/consommation/20260515"
    ) == ("lu/code-consommation", "code")
    assert derive_stable_id(
        "http://data.legilux.public.lu/eli/etat/leg/loi/2006/09/21/n1/consolide/20240801"
    ) == ("lu/loi-2006-09-21-n1", "loi")


def test_classify_batch_codes_and_pdf_and_keywords() -> None:
    assert classify_batch("lu/code-sante", "Code de la santé", "code", "xml") == (
        "04-codes",
        None,
    )
    assert classify_batch("lu/x", "Anything", "loi", "pdf") == ("skip", "pdf-only")
    assert (
        classify_batch(
            "lu/loi-x",
            "Loi sur le bail à usage d'habitation",
            "loi",
            "xml",
        )[0]
        == "06-civil-family"
    )
    assert classify_batch("lu/loi-obscure", "Loi diverse sans mot-clé", "loi", "xml") == (
        "15-tail",
        None,
    )
