"""Diagnose remaining omission failures."""

from __future__ import annotations

import importlib.util
import sys
from collections import Counter
from pathlib import Path

from lex.fidelity import check_law_fidelity, markdown_body_words, xml_body_words


def test_diag_remaining() -> None:
    path = Path("countries/lu/adapter.py")
    spec = importlib.util.spec_from_file_location("lu_rem", path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    sys.modules["lu_rem"] = mod
    spec.loader.exec_module(mod)

    for law_id in (
        "loi-2015-03-25-n3",
        "recueil-conseil-etat",
        "recueil-elections",
        "rgd-2020-09-02-a734",
    ):
        law = Path("countries/lu/laws") / law_id
        src = (law / "source.xml").read_bytes()
        body = mod.adapter.normalize_bytes(src, title="t").body
        sw = xml_body_words(src)
        mw = markdown_body_words(body)
        missing = Counter(sw) - Counter(mw)
        print(law_id, "src", len(sw), "miss", sum(missing.values()), missing.most_common(8))
        errs = check_law_fidelity(law / "current.md")
        print("  published errs", [e.message[:80] for e in errs])
