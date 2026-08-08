import json
import shutil
from pathlib import Path

from click.testing import CliRunner

from lex.cli import main


def test_cli_list() -> None:
    runner = CliRunner()
    with runner.isolated_filesystem():
        src = Path(__file__).parent / "fixtures/sample_dataset"
        if not src.exists():
            return
        shutil.copytree(src, Path("."), dirs_exist_ok=True)

        result = runner.invoke(main, ["list"])
        assert result.exit_code == 0
        assert "xx/sample-law" in result.output
        assert "en" in result.output

        result_json = runner.invoke(main, ["list", "--json"])
        assert result_json.exit_code == 0
        data = json.loads(result_json.output)
        assert len(data) == 1
        assert data[0]["id"] == "xx/sample-law"


def test_cli_check_valid() -> None:
    runner = CliRunner()
    src = Path(__file__).parent / "fixtures/sample_dataset"
    if not src.exists():
        return

    result = runner.invoke(main, ["check", str(src)])
    assert result.exit_code == 0


def test_cli_check_invalid(tmp_path: Path) -> None:
    runner = CliRunner()
    src = Path(__file__).parent / "fixtures/sample_dataset"
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    md_file = tmp_path / "dataset/countries/xx/laws/sample-law/current.md"
    content = md_file.read_text(encoding="utf-8")
    content = content.replace("id: xx/sample-law", "id: bad")
    md_file.write_text(content, encoding="utf-8")

    result = runner.invoke(main, ["check", str(tmp_path / "dataset")])
    assert result.exit_code == 1
    assert "LEX_INVALID" in result.output

    result_json = runner.invoke(main, ["check", str(tmp_path / "dataset"), "--json"])
    assert result_json.exit_code == 1
    data = json.loads(result_json.output)
    assert len(data) > 0


def test_cli_update_rejects_id_and_from_file(tmp_path: Path) -> None:
    runner = CliRunner()
    manifest = tmp_path / "ids.txt"
    manifest.write_text("lu/code-civil\n", encoding="utf-8")
    result = runner.invoke(
        main,
        ["update", "lu", "--id", "lu/code-civil", "--from-file", str(manifest)],
    )
    assert result.exit_code == 1
    assert "--id or --from-file" in result.output
