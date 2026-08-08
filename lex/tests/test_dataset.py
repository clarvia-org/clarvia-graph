import shutil
from pathlib import Path

from lex.dataset import discover_laws


def test_discovery() -> None:
    root = Path("tests/fixtures/sample_dataset")
    if not root.exists():
        return
    laws = discover_laws(root)
    assert len(laws) == 1
    assert laws[0].id == "xx/sample-law"
    assert laws[0].language == "en"
    assert laws[0].country == "xx"


def test_language_detection(tmp_path: Path) -> None:
    src = Path("tests/fixtures/sample_dataset")
    if not src.exists():
        return
    shutil.copytree(src, tmp_path / "dataset")

    md_file = tmp_path / "dataset/countries/xx/laws/sample-law/current.md"
    fr_file = tmp_path / "dataset/countries/xx/laws/sample-law/current.fr.md"

    content = md_file.read_text(encoding="utf-8")
    content = content.replace("language: en", "language: fr")
    fr_file.write_text(content, encoding="utf-8")

    laws = discover_laws(tmp_path / "dataset")
    assert len(laws) == 2
    langs = {law.language for law in laws}
    assert langs == {"en", "fr"}
