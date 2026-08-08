#!/usr/bin/env python3
"""Generate a synthetic pilot evaluation report from fixture results."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from app.ops.eval_report import default_report_dir, write_report  # noqa: E402
from tests.evals.pilot_runner import run_full_pilot_suite  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate Lex synthetic pilot eval report"
    )
    parser.add_argument(
        "--prompt-path",
        default=str(SERVICE_ROOT / "runtime-private" / "prompts" / "lex-v1.txt"),
        help="Prompt path for harness runs (use synthetic path in CI)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Report directory (default: tests/evals/reports for synthetic CI)",
    )
    parser.add_argument(
        "--private",
        action="store_true",
        help="Write under runtime-private/evals/reports (real-user analysis only)",
    )
    parser.add_argument("--basename", default="pilot-eval")
    args = parser.parse_args()

    prompt_path = args.prompt_path
    if not Path(prompt_path).exists():
        prompt_path = str(SERVICE_ROOT / "tests" / "fixtures" / "synthetic-prompt.txt")
        Path(prompt_path).write_text(
            "SYNTHETIC REPORT PROMPT\nLex.\n", encoding="utf-8"
        )

    output_dir = args.output_dir or default_report_dir(private=args.private)
    suite = run_full_pilot_suite(prompt_path=prompt_path)
    json_path, md_path = write_report(suite, output_dir, basename=args.basename)
    print(f"Wrote {json_path}")
    print(f"Wrote {md_path}")
    if suite.failed_count:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
