"""Evaluation report generation for synthetic pilot runs (Phase 7)."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.config import SERVICE_ROOT
from app.ops.pilot_harness import PilotSuiteResult, check_launch_thresholds


def default_report_dir(*, private: bool = False) -> Path:
    if private:
        return SERVICE_ROOT / "runtime-private" / "evals" / "reports"
    return SERVICE_ROOT / "tests" / "evals" / "reports"


def build_report_payload(suite: PilotSuiteResult) -> dict[str, Any]:
    """Build a JSON-serialisable evaluation report from pilot results."""
    thresholds = check_launch_thresholds(suite)
    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "synthetic_only": True,
        "case_count": len(suite.results),
        "passed": suite.passed_count,
        "failed": suite.failed_count,
        "duplicate_send_count": suite.duplicate_send_count,
        "launch_thresholds": thresholds,
        "all_thresholds_met": all(thresholds.values()),
        "cases": [
            {
                "case_id": item.case_id,
                "category": item.category,
                "expected_status": item.expected_status,
                "actual_status": item.actual_status,
                "passed": item.passed,
                "send_count": item.send_count,
                "footer_ok": item.footer_ok,
                "continuation_ok": item.continuation_ok,
                "duplicate_send": item.duplicate_send,
                "is_anchor": item.is_anchor,
            }
            for item in suite.results
        ],
    }


def render_markdown_report(payload: dict[str, Any]) -> str:
    """Render a human-readable markdown summary."""
    lines = [
        "# Lex synthetic pilot evaluation report",
        "",
        f"- Generated: `{payload['generated_at']}`",
        f"- Cases: **{payload['case_count']}** (synthetic only)",
        f"- Passed: **{payload['passed']}** / {payload['case_count']}",
        f"- Duplicate sends: **{payload['duplicate_send_count']}**",
        "",
        "## Launch thresholds (§27.5)",
        "",
    ]
    for key, value in payload["launch_thresholds"].items():
        status = "PASS" if value else "FAIL"
        lines.append(f"- `{key}`: **{status}**")
    lines.extend(
        [
            "",
            f"**Overall:** {'PASS' if payload['all_thresholds_met'] else 'FAIL'}",
            "",
            "> Real-user pilot analysis must be stored only under "
            "`runtime-private/evals/` and never copied to public paths.",
            "",
        ]
    )
    failures = [case for case in payload["cases"] if not case["passed"]]
    if failures:
        lines.append("## Failed cases")
        lines.append("")
        for case in failures:
            lines.append(
                f"- `{case['case_id']}` ({case['category']}): "
                f"expected `{case['expected_status']}`, "
                f"got `{case['actual_status']}`"
            )
    return "\n".join(lines) + "\n"


def write_report(
    suite: PilotSuiteResult,
    output_dir: Path,
    *,
    basename: str = "pilot-eval",
) -> tuple[Path, Path]:
    """Write JSON and markdown reports; create parent directories as needed."""
    output_dir.mkdir(parents=True, exist_ok=True)
    payload = build_report_payload(suite)
    json_path = output_dir / f"{basename}.json"
    md_path = output_dir / f"{basename}.md"
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    md_path.write_text(render_markdown_report(payload), encoding="utf-8")
    return json_path, md_path


def load_report_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise TypeError("report JSON must be an object")
    return data


__all__ = [
    "build_report_payload",
    "default_report_dir",
    "load_report_json",
    "render_markdown_report",
    "write_report",
]
