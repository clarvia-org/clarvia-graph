import subprocess
import sys
from collections import defaultdict
from pathlib import Path


def main() -> None:
    try:
        output = subprocess.check_output(["git", "ls-files"], text=True)
        tracked_files = output.splitlines()
    except subprocess.CalledProcessError:
        print("Not a git repository or git not found.")
        tracked_files = [
            str(p) for p in Path.cwd().rglob("*") if p.is_file() and ".git" not in p.parts
        ]

    total_size = 0
    largest_file = None
    largest_size = 0

    source_stats: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    has_large_files = False

    for file_path_str in tracked_files:
        path = Path(file_path_str)
        if not path.exists() or not path.is_file():
            continue

        size = path.stat().st_size
        total_size += size

        if size > largest_size:
            largest_size = size
            largest_file = path

        # Check source files (countries/*/laws/**/source.*)
        parts = path.parts
        if (
            len(parts) >= 4
            and parts[0] == "countries"
            and parts[2] == "laws"
            and path.name.startswith("source.")
        ):
            country = parts[1]
            ext = path.suffix
            source_stats[country][ext] += size

            if size > 50 * 1024 * 1024:
                mib = size / 1024 / 1024
                print(f"ERROR: Source file exceeds 50 MiB: {path} ({mib:.2f} MiB)")
                has_large_files = True
            elif size > 25 * 1024 * 1024:
                mib = size / 1024 / 1024
                print(f"WARNING: Source file exceeds 25 MiB: {path} ({mib:.2f} MiB)")

    print(f"Tracked file count: {len(tracked_files)}")
    print(f"Total working tree bytes: {total_size} ({total_size / 1024 / 1024:.2f} MiB)")
    if largest_file:
        print(f"Largest tracked file: {largest_file} ({largest_size} bytes)")

    print("\nSource files by country and extension:")
    for country, exts in source_stats.items():
        for ext, size in exts.items():
            print(f"  {country} {ext}: {size / 1024 / 1024:.2f} MiB")

    if has_large_files:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
