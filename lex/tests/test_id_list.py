from pathlib import Path

import pytest

from lex.errors import ErrorCode, LexError
from lex.runner import load_id_list


def test_load_id_list_skips_comments_and_blanks(tmp_path: Path) -> None:
    path = tmp_path / "batch.txt"
    path.write_text(
        "# remaining codes\n\nlu/code-sante\nlu/code-route\n",
        encoding="utf-8",
    )
    assert load_id_list(path) == ["lu/code-sante", "lu/code-route"]


def test_load_id_list_rejects_duplicates(tmp_path: Path) -> None:
    path = tmp_path / "batch.txt"
    path.write_text("lu/code-sante\nlu/code-sante\n", encoding="utf-8")
    with pytest.raises(LexError) as exc:
        load_id_list(path)
    assert exc.value.code == ErrorCode.LEX_INVALID_DATA


def test_load_id_list_rejects_empty(tmp_path: Path) -> None:
    path = tmp_path / "batch.txt"
    path.write_text("# only comments\n\n", encoding="utf-8")
    with pytest.raises(LexError) as exc:
        load_id_list(path)
    assert exc.value.code == ErrorCode.LEX_INVALID_DATA
