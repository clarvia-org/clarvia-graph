#!/usr/bin/env python3
"""Live two-pass OpenAI eval with full research/writer dump for human review.

Usage (from lex-email service root):

  .venv\\Scripts\\python.exe scripts/live-two-pass-eval.py
  .venv\\Scripts\\python.exe scripts/live-two-pass-eval.py --limit 20
  .venv\\Scripts\\python.exe scripts/live-two-pass-eval.py --ids live_lu_death_en,live_fi_funeral

Writes under runtime-private/evals/reports/:
  - *-summary.md / *-summary.json  (pass/fail table)
  - *-review.md                    (inbound + research brief + writer body per case)
  - *-review.jsonl                 (machine-readable dump, one case per line)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from app.domain.models import ParsedMessage  # noqa: E402
from app.domain.ports import StructuredLlmResult  # noqa: E402
from app.infrastructure.openai import OpenAIResponsesAdapter  # noqa: E402
from app.pipeline.two_pass import (  # noqa: E402
    TwoPassPipelineFailure,
    run_two_pass_pipeline,
)
from tests.unit.conftest import build_settings  # noqa: E402

DEFAULT_SCENARIOS = (
    SERVICE_ROOT / "tests" / "fixtures" / "live_eval" / "scenarios.jsonl"
)
DEFAULT_REPORT_DIR = SERVICE_ROOT / "runtime-private" / "evals" / "reports"


@dataclass
class CaseResult:
    id: str
    passed: bool
    latency_s: float
    action: str | None = None
    expected: str | None = None
    error_code: str | None = None
    reasons: list[str] = field(default_factory=list)
    used_fallback: bool = False
    research_calls: int = 0
    writer_calls: int = 0


class RecordingLlmAdapter:
    """Wraps OpenAIResponsesAdapter and records every structured call."""

    def __init__(self, inner: OpenAIResponsesAdapter) -> None:
        self._inner = inner
        self.calls: list[dict[str, Any]] = []

    def generate(self, **kwargs: Any) -> Any:
        return self._inner.generate(**kwargs)

    def generate_structured(
        self,
        *,
        system_prompt: str,
        runtime_envelope: str,
        json_schema: dict[str, object],
        schema_name: str,
        enable_web_search: bool,
        force_web_search: bool = False,
        reasoning_effort: str | None = None,
        max_output_tokens: int | None = None,
    ) -> StructuredLlmResult:
        record: dict[str, Any] = {
            "schema_name": schema_name,
            "enable_web_search": enable_web_search,
            "force_web_search": force_web_search,
            "reasoning_effort": reasoning_effort,
            "max_output_tokens": max_output_tokens,
            "runtime_envelope": runtime_envelope,
        }
        try:
            result = self._inner.generate_structured(
                system_prompt=system_prompt,
                runtime_envelope=runtime_envelope,
                json_schema=json_schema,
                schema_name=schema_name,
                enable_web_search=enable_web_search,
                force_web_search=force_web_search,
                reasoning_effort=reasoning_effort,
                max_output_tokens=max_output_tokens,
            )
        except Exception as exc:  # noqa: BLE001
            record["error"] = f"{type(exc).__name__}:{exc}"
            self.calls.append(record)
            raise
        record.update(
            {
                "openai_response_id": result.openai_response_id,
                "web_search_calls": result.web_search_calls,
                "web_search_source_urls": sorted(result.web_search_source_urls),
                "output": result.data,
            }
        )
        self.calls.append(record)
        return result


def load_scenarios(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        text = line.strip()
        if not text or text.startswith("#"):
            continue
        rows.append(json.loads(text))
    return rows


def _expected_actions(row: dict[str, Any]) -> set[str]:
    if "expected_actions" in row:
        return {str(item) for item in row["expected_actions"]}
    if "expected_action" in row:
        return {str(row["expected_action"])}
    return set()


def _load_dotenv_key(env_path: Path | None = None) -> None:
    if os.environ.get("OPENAI_API_KEY"):
        return
    candidates = [p for p in [env_path, SERVICE_ROOT / ".env"] if p and p.exists()]
    for candidate in candidates:
        for line in candidate.read_text(encoding="utf-8").splitlines():
            if not line.strip() or line.strip().startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key.strip() == "OPENAI_API_KEY" and value.strip():
                os.environ["OPENAI_API_KEY"] = value.strip().strip('"').strip("'")
                return


def run_case(
    row: dict[str, Any],
    *,
    llm: RecordingLlmAdapter,
    settings: object,
) -> tuple[CaseResult, dict[str, Any]]:
    case_id = str(row["id"])
    started = time.perf_counter()
    llm.calls.clear()
    history_raw = row.get("history") or []
    thread_messages: list[ParsedMessage] = []
    for index, item in enumerate(history_raw):
        role = str(item.get("role") or "user")
        from_address = (
            "lex@clarvia.org" if role == "assistant" else "eval@example.com"
        )
        thread_messages.append(
            ParsedMessage(
                message_id=f"live-{case_id}-h{index}",
                thread_id=f"thread-live-{case_id}",
                from_address=from_address,
                reply_to=None,
                to_addresses=("lex@clarvia.org",),
                cc_addresses=(),
                subject=str(row.get("subject") or "Lex eval"),
                body_text=str(item.get("text") or ""),
                date_header="2026-07-20",
            )
        )
    parsed = ParsedMessage(
        message_id=f"live-{case_id}",
        thread_id=f"thread-live-{case_id}",
        from_address="eval@example.com",
        reply_to=None,
        to_addresses=("lex@clarvia.org",),
        cc_addresses=(),
        subject=str(row.get("subject") or "Lex eval"),
        body_text=str(row.get("body") or ""),
        date_header="2026-07-25",
    )
    thread_messages.append(parsed)

    reasons: list[str] = []
    action: str | None = None
    error_code: str | None = None
    used_fallback = False
    final_body = ""
    dump: dict[str, Any] = {
        "id": case_id,
        "subject": parsed.subject,
        "body": parsed.body_text,
        "history": history_raw,
        "expected_actions": sorted(_expected_actions(row)),
        "lang": row.get("lang"),
        "research_calls": [],
        "writer_calls": [],
        "final_body_markdown": None,
        "action": None,
        "used_fallback_renderer": False,
        "error": None,
    }

    try:
        prepared = run_two_pass_pipeline(
            llm,  # type: ignore[arg-type]
            settings=settings,
            parsed=parsed,
            thread_messages=thread_messages,
            current_date_utc=datetime.now(tz=UTC),
        )
        action = prepared.action
        final_body = prepared.body_markdown
        used_fallback = prepared.used_fallback_renderer
        dump["action"] = action
        dump["final_body_markdown"] = final_body
        dump["used_fallback_renderer"] = used_fallback
        dump["prompt_version"] = prepared.prompt_version
        dump["pipeline_version"] = prepared.pipeline_version
        dump["sources"] = [source.model_dump() for source in prepared.sources]
        dump["contacts"] = [contact.model_dump() for contact in prepared.contacts]

        expected_set = _expected_actions(row)
        if expected_set and action not in expected_set:
            reasons.append(
                f"action_mismatch: got {action}, expected {sorted(expected_set)}"
            )
        if "\u2014" in final_body:
            reasons.append("em_dash_present")
        for needle in row.get("must_contain") or []:
            if str(needle) not in final_body:
                reasons.append(f"missing_must_contain:{needle}")
        for needle in row.get("must_not_contain") or []:
            if str(needle).casefold() in final_body.casefold():
                reasons.append(f"forbidden:{needle}")
        if used_fallback and row.get("forbid_fallback"):
            reasons.append("writer_fallback_used")
    except TwoPassPipelineFailure as exc:
        error_code = str(exc.code)
        reasons.append(f"pipeline_failure:{exc.code}")
        dump["error"] = error_code
    except Exception as exc:  # noqa: BLE001
        error_code = type(exc).__name__
        reasons.append(f"exception:{type(exc).__name__}:{exc}")
        dump["error"] = f"{type(exc).__name__}:{exc}"

    for call in llm.calls:
        if "research" in call["schema_name"]:
            dump["research_calls"].append(call)
        else:
            dump["writer_calls"].append(call)

    latency = time.perf_counter() - started
    result = CaseResult(
        id=case_id,
        passed=not reasons,
        latency_s=round(latency, 2),
        action=action,
        expected=",".join(sorted(_expected_actions(row))) or None,
        error_code=error_code,
        reasons=reasons,
        used_fallback=used_fallback,
        research_calls=len(dump["research_calls"]),
        writer_calls=len(dump["writer_calls"]),
    )
    dump["passed"] = result.passed
    dump["reasons"] = reasons
    dump["latency_s"] = result.latency_s
    return result, dump


def _render_review_md(dumps: list[dict[str, Any]], stamp: str) -> str:
    lines = [
        f"# Lex two-pass live review ({stamp})",
        "",
        "Each case shows the inbound message, research-model output(s), "
        "writer-model output(s), and the final signed body.",
        "",
    ]
    for dump in dumps:
        lines.extend(
            [
                f"## {dump['id']}",
                "",
                f"- passed: `{dump.get('passed')}`",
                f"- action: `{dump.get('action')}`",
                f"- expected: `{dump.get('expected_actions')}`",
                f"- fallback: `{dump.get('used_fallback_renderer')}`",
                f"- latency_s: `{dump.get('latency_s')}`",
                f"- reasons: `{dump.get('reasons')}`",
                "",
                "### Inbound message",
                "",
                f"**Subject:** {dump.get('subject')}",
                "",
                "```text",
                str(dump.get("body") or ""),
                "```",
                "",
            ]
        )
        history = dump.get("history") or []
        if history:
            lines.append("### Prior history")
            lines.append("")
            for item in history:
                role = item.get("role")
                lines.append(f"**{role}:**")
                lines.append("")
                lines.append("```text")
                lines.append(str(item.get("text") or ""))
                lines.append("```")
                lines.append("")

        for index, call in enumerate(dump.get("research_calls") or [], start=1):
            lines.extend(
                [
                    f"### Research call {index}",
                    "",
                    f"- web_search_calls: `{call.get('web_search_calls')}`",
                    f"- force_web_search: `{call.get('force_web_search')}`",
                    f"- response_id: `{call.get('openai_response_id')}`",
                    "",
                    "<details><summary>Research input envelope</summary>",
                    "",
                    "```text",
                    str(call.get("runtime_envelope") or ""),
                    "```",
                    "",
                    "</details>",
                    "",
                    "```json",
                    json.dumps(call.get("output"), indent=2, ensure_ascii=False),
                    "```",
                    "",
                ]
            )

        for index, call in enumerate(dump.get("writer_calls") or [], start=1):
            lines.extend(
                [
                    f"### Writer call {index}",
                    "",
                    f"- response_id: `{call.get('openai_response_id')}`",
                    "",
                    "<details><summary>Writer input envelope</summary>",
                    "",
                    "```text",
                    str(call.get("runtime_envelope") or ""),
                    "```",
                    "",
                    "</details>",
                    "",
                    "```json",
                    json.dumps(call.get("output"), indent=2, ensure_ascii=False),
                    "```",
                    "",
                ]
            )

        lines.extend(
            [
                "### Final body (after app sign-off)",
                "",
                "```markdown",
                str(dump.get("final_body_markdown") or dump.get("error") or ""),
                "```",
                "",
                "---",
                "",
            ]
        )
    return "\n".join(lines)


def write_outputs(
    results: list[CaseResult],
    dumps: list[dict[str, Any]],
    *,
    report_dir: Path,
    basename: str,
) -> tuple[Path, Path, Path, Path]:
    report_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(tz=UTC).strftime("%Y%m%d-%H%M%S")
    base = report_dir / f"{basename}-{stamp}"
    summary = {
        "generated_at_utc": datetime.now(tz=UTC).isoformat(),
        "pipeline": "two_pass",
        "passed": sum(1 for item in results if item.passed),
        "failed": sum(1 for item in results if not item.passed),
        "results": [asdict(item) for item in results],
    }
    json_path = Path(f"{base}-summary.json")
    md_path = Path(f"{base}-summary.md")
    review_md = Path(f"{base}-review.md")
    review_jsonl = Path(f"{base}-review.jsonl")

    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    lines = [
        f"# Lex two-pass live eval ({stamp})",
        "",
        f"Passed: {summary['passed']}  Failed: {summary['failed']}",
        "",
        "| id | pass | action | expected | fallback | research | writer | s | reasons |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for item in results:
        mark = "PASS" if item.passed else "FAIL"
        reasons = "; ".join(item.reasons) if item.reasons else ""
        lines.append(
            f"| {item.id} | {mark} | {item.action or ''} | {item.expected or ''} | "
            f"{item.used_fallback} | {item.research_calls} | {item.writer_calls} | "
            f"{item.latency_s} | {reasons} |"
        )
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    review_md.write_text(_render_review_md(dumps, stamp), encoding="utf-8")
    with review_jsonl.open("w", encoding="utf-8") as handle:
        for dump in dumps:
            handle.write(json.dumps(dump, ensure_ascii=False) + "\n")
    return json_path, md_path, review_md, review_jsonl


def main() -> int:
    parser = argparse.ArgumentParser(description="Lex two-pass live OpenAI eval")
    parser.add_argument("--scenarios", type=Path, default=DEFAULT_SCENARIOS)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--basename", default="two-pass-live")
    parser.add_argument("--ids", default="", help="Comma-separated case ids")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--model", default="gpt-5-mini")
    parser.add_argument(
        "--research-prompt",
        type=Path,
        default=None,
        help="Absolute path to lex-research-v1.txt",
    )
    parser.add_argument(
        "--writer-prompt",
        type=Path,
        default=None,
        help="Absolute path to lex-writer-v1.txt",
    )
    parser.add_argument(
        "--dotenv",
        type=Path,
        default=None,
        help="Path to .env file containing OPENAI_API_KEY",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=8,
        help="Parallel workers for running cases (default: 8)",
    )
    args = parser.parse_args()

    _load_dotenv_key(env_path=args.dotenv)
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        print("ERROR: OPENAI_API_KEY not set", file=sys.stderr)
        return 2

    research_prompt_path = str(
        args.research_prompt
        or SERVICE_ROOT / "runtime-private" / "prompts" / "lex-research-v1.txt"
    )
    writer_prompt_path = str(
        args.writer_prompt
        or SERVICE_ROOT / "runtime-private" / "prompts" / "lex-writer-v1.txt"
    )

    rows = [
        row
        for row in load_scenarios(args.scenarios)
        if row.get("track") == "live"
    ]
    id_filter = {item.strip() for item in args.ids.split(",") if item.strip()}
    if id_filter:
        rows = [row for row in rows if row.get("id") in id_filter]
    if args.limit:
        rows = rows[: args.limit]

    settings = build_settings(
        generation_pipeline="two_pass",
        research_prompt_path=research_prompt_path,
        writer_prompt_path=writer_prompt_path,
        research_max_output_tokens=12000,
        writer_max_output_tokens=4000,
        max_writer_history_chars=20_000,
    )
    inner_llm = OpenAIResponsesAdapter(
        api_key=api_key,
        model=args.model,
        max_output_tokens=12000,
    )

    print(
        f"Running {len(rows)} two-pass live cases "
        f"(model={args.model}, workers={args.workers})..."
    )

    def _run_one(row: dict[str, Any]) -> tuple[CaseResult, dict[str, Any]]:
        thread_llm = RecordingLlmAdapter(inner_llm)
        return run_case(row, llm=thread_llm, settings=settings)

    from concurrent.futures import ThreadPoolExecutor, as_completed

    ordered: dict[str, tuple[CaseResult, dict[str, Any]]] = {}
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(_run_one, row): row["id"] for row in rows}
        for future in as_completed(futures):
            case_id = futures[future]
            result, dump = future.result()
            ordered[case_id] = (result, dump)
            status = "PASS" if result.passed else "FAIL"
            print(
                f"  [{status}] {result.id} action={result.action} "
                f"fallback={result.used_fallback} "
                f"r={result.research_calls}/w={result.writer_calls} "
                f"({result.latency_s}s)",
                flush=True,
            )
            if result.reasons:
                print(f"       reasons: {'; '.join(result.reasons)}", flush=True)

    # Restore original scenario order for reports
    results = [ordered[row["id"]][0] for row in rows if row["id"] in ordered]
    dumps = [ordered[row["id"]][1] for row in rows if row["id"] in ordered]

    json_path, md_path, review_md, review_jsonl = write_outputs(
        results,
        dumps,
        report_dir=args.report_dir,
        basename=args.basename,
    )
    print(f"\nSummary JSON: {json_path}")
    print(f"Summary MD:   {md_path}")
    print(f"Review MD:    {review_md}")
    print(f"Review JSONL: {review_jsonl}")
    failed = sum(1 for item in results if not item.passed)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
