import dataclasses
from pathlib import Path
from typing import Any

import yaml

from lex.frontmatter import parse_frontmatter


@dataclasses.dataclass
class LawRecord:
    id: str
    country: str
    language: str
    title: str
    status: str
    path: Path
    metadata: dict[str, Any]


def discover_laws(root: Path) -> list[LawRecord]:
    laws: list[LawRecord] = []
    countries_dir = root / "countries"
    if not countries_dir.exists():
        return laws

    for country_dir in countries_dir.iterdir():
        if not country_dir.is_dir():
            continue

        source_yml_path = country_dir / "source.yml"
        default_lang = "en"
        if source_yml_path.exists():
            try:
                with open(source_yml_path, encoding="utf-8") as f:
                    source_meta = yaml.safe_load(f)
                    if isinstance(source_meta, dict) and "default_language" in source_meta:
                        default_lang = source_meta["default_language"]
            except yaml.YAMLError:
                pass

        laws_dir = country_dir / "laws"
        if not laws_dir.exists():
            continue

        for law_dir in laws_dir.iterdir():
            if not law_dir.is_dir():
                continue

            for md_file in law_dir.glob("current*.md"):
                name_parts = md_file.name.split(".")
                if md_file.name == "current.md":
                    lang = default_lang
                elif len(name_parts) == 3 and name_parts[0] == "current" and name_parts[2] == "md":
                    lang = name_parts[1]
                else:
                    continue

                with open(md_file, encoding="utf-8") as f:
                    content = f.read()

                metadata, _ = parse_frontmatter(content)
                if not metadata:
                    continue

                laws.append(
                    LawRecord(
                        id=metadata.get("id", ""),
                        country=metadata.get("country", ""),
                        language=metadata.get("language", lang),
                        title=metadata.get("title", ""),
                        status=metadata.get("status", ""),
                        path=md_file,
                        metadata=metadata,
                    )
                )

    return laws
