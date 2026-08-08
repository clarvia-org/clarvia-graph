import re
import sys
from pathlib import Path


def main() -> None:
    root = Path.cwd()
    broken_links = []

    link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

    for md_file in root.rglob("*.md"):
        if ".venv" in md_file.parts or ".git" in md_file.parts:
            continue

        with open(md_file, encoding="utf-8") as f:
            content = f.read()

        for match in link_pattern.finditer(content):
            link = match.group(2)

            # Skip external URLs, anchors, and prose text containing spaces
            if (
                link.startswith("http://")
                or link.startswith("https://")
                or link.startswith("#")
                or link.startswith("mailto:")
                or " " in link
                or "\n" in link
            ):
                continue

            # Remove anchor from link for file checking
            file_link = link.split("#")[0]
            if not file_link:
                continue

            target_path = (md_file.parent / file_link).resolve()

            if not target_path.exists():
                broken_links.append((md_file.relative_to(root), link))

    if broken_links:
        print("Broken links found:")
        for file_path, link in broken_links:
            print(f"{file_path}: {link}")
        sys.exit(1)
    else:
        print("No broken links found.")
        sys.exit(0)


if __name__ == "__main__":
    main()
