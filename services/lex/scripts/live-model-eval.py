#!/usr/bin/env python3
"""Local Lex eval harness: live OpenAI model track + Fake-LLM gate track.

Usage (from lex-email service root):

  .venv\\Scripts\\python.exe scripts/live-model-eval.py --gates
  .venv\\Scripts\\python.exe scripts/live-model-eval.py --live
  .venv\\Scripts\\python.exe scripts/live-model-eval.py --live --gates
  .venv\\Scripts\\python.exe scripts/live-model-eval.py --live --ids live_fi_funeral,live_lu_death_en

Reports land under runtime-private/evals/reports/ (gitignored).
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

from app.domain.models import (  # noqa: E402
    ConversationMessage,
    ConversationRole,
    ParsedMessage,
)
from app.infrastructure.daily_usage import InMemoryDailyUsage  # noqa: E402
from app.infrastructure.memory import InMemoryGmail  # noqa: E402
from app.infrastructure.openai import (  # noqa: E402
    FakeLlmAdapter,
    OpenAIResponsesAdapter,
)
from app.infrastructure.rate_limit import InMemoryRateLimit  # noqa: E402
from app.llm.envelope import build_runtime_envelope  # noqa: E402
from app.llm.prompt_loader import load_prompt  # noqa: E402
from app.llm.validation import LexValidationError, validate_lex_response  # noqa: E402
from app.ops.pilot_harness import (  # noqa: E402
    PilotCase,
    PilotInboundSpec,
    run_pilot_case,
)
from app.services.model_pipeline import (  # noqa: E402
    ModelPipelineFailure,
    run_model_pipeline,
)
from tests.evals.pilot_runner import (  # noqa: E402
    build_pilot_llm,
    build_pilot_settings,
    seed_rate_limit_history,
)

DEFAULT_SCENARIOS = (
    SERVICE_ROOT / "tests" / "fixtures" / "live_eval" / "scenarios.jsonl"
)
DEFAULT_PROMPT = SERVICE_ROOT / "runtime-private" / "prompts" / "lex-v1.txt"
DEFAULT_REPORT_DIR = SERVICE_ROOT / "runtime-private" / "evals" / "reports"

# Soft language heuristics: fail only when expected non-EN body looks clearly English-only.
_LANG_MARKERS: dict[str, tuple[str, ...]] = {
    "fi": ("ja ", "on ", "kuolema", "hautajais", "todistus", "Suom", "voidaan", "tulee"),
    "de": ("und ", "die ", "der ", "Sterbe", "Anmeldung", "Behörd", "müssen", "sollten"),
    "fr": ("les ", "des ", "une ", "décès", "démarches", "acte ", "pouvez", "commune"),
    "pt": ("os ", "das ", "uma ", "óbito", "certidão", "passos", "deve ", "Portugal"),
}
_EN_MARKERS = (" the ", " and ", " you ", " should ", " contact ", " death ", " certificate ")


@dataclass
class CaseResult:
    id: str
    track: str
    passed: bool
    latency_s: float
    action: str | None = None
    expected: str | None = None
    error_code: str | None = None
    reasons: list[str] = field(default_factory=list)
    body_preview: str | None = None


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


def _language_soft_fail(lang: str, body: str) -> str | None:
    if lang in {"", "en"}:
        return None
    folded = f" {body.casefold()} "
    markers = _LANG_MARKERS.get(lang, ())
    has_target = any(marker in folded for marker in markers)
    en_hits = sum(1 for marker in _EN_MARKERS if marker in folded)
    if not has_target and en_hits >= 3:
        return f"language_mismatch: expected {lang}, body looks English-only"
    return None


def run_live_case(
    row: dict[str, Any],
    *,
    system_prompt: str,
    llm: OpenAIResponsesAdapter,
) -> CaseResult:
    case_id = str(row["id"])
    started = time.perf_counter()
    history_raw = row.get("history") or []
    history = [
        ConversationMessage(
            role=(
                ConversationRole.USER
                if item.get("role") == "user"
                else ConversationRole.ASSISTANT
            ),
            text=str(item["text"]),
        )
        for item in history_raw
    ]
    parsed = ParsedMessage(
        message_id=f"live-{case_id}",
        thread_id=f"thread-live-{case_id}",
        from_address="eval@example.com",
        reply_to=None,
        to_addresses=("eval@example.com",),
        cc_addresses=(),
        subject=str(row.get("subject") or "Lex eval"),
        body_text=str(row.get("body") or ""),
    )
    envelope = build_runtime_envelope(
        parsed=parsed,
        conversation_history=history,
        current_date_utc=datetime.now(tz=UTC),
        prompt_version="lex-v1",
    )
    reasons: list[str] = []
    action: str | None = None
    error_code: str | None = None
    body_preview: str | None = None
    expected = ",".join(sorted(_expected_actions(row))) or None

    try:
        generation = run_model_pipeline(
            llm,
            system_prompt=system_prompt,
            runtime_envelope=envelope,
        )
        response = generation.response
        action = response.action
        body = response.body_markdown
        body_preview = body[:240].replace("\n", " ")
        expected_set = _expected_actions(row)
        if expected_set and action not in expected_set:
            reasons.append(f"action_mismatch: got {action}, expected {sorted(expected_set)}")
        try:
            validate_lex_response(
                response,
                web_search_source_urls=generation.web_search_source_urls,
                web_search_calls=generation.web_search_calls,
            )
        except LexValidationError as exc:
            error_code = exc.code
            reasons.append(f"validation:{exc.code}")
        if "\u2014" in body:
            reasons.append("em_dash_present")
        for needle in row.get("must_contain") or []:
            if str(needle) not in body:
                reasons.append(f"missing_must_contain:{needle}")
        for needle in row.get("must_not_contain") or []:
            if str(needle).casefold() in body.casefold():
                reasons.append(f"forbidden:{needle}")
        soft = _language_soft_fail(str(row.get("lang") or "en"), body)
        if soft:
            reasons.append(soft)
    except ModelPipelineFailure as exc:
        error_code = exc.code
        reasons.append(f"pipeline_failure:{exc.code}")
        cause = exc.__cause__
        if (
            exc.code == "em_dash"
            and isinstance(cause, LexValidationError)
        ):
            # Surface residual code points for operator debugging.
            reasons.append("em_dash_debug:see_pipeline_normalize")
    except Exception as exc:  # noqa: BLE001 — eval harness surfaces unexpected errors
        error_code = type(exc).__name__
        reasons.append(f"exception:{type(exc).__name__}:{exc}")

    latency = time.perf_counter() - started
    return CaseResult(
        id=case_id,
        track="live",
        passed=not reasons,
        latency_s=round(latency, 2),
        action=action,
        expected=expected,
        error_code=error_code,
        reasons=reasons,
        body_preview=body_preview,
    )


def _pilot_case_from_gate(row: dict[str, Any]) -> PilotCase:
    inbound_data = dict(row["inbound"])
    to_addresses = tuple(inbound_data.get("to_addresses") or ())
    cc_addresses = tuple(inbound_data.get("cc_addresses") or ())
    inbound = PilotInboundSpec(
        message_id=str(inbound_data["message_id"]),
        thread_id=str(inbound_data["thread_id"]),
        from_address=str(inbound_data["from_address"]),
        body_text=str(inbound_data.get("body_text") or ""),
        to_addresses=to_addresses,
        cc_addresses=cc_addresses,
        subject=str(inbound_data.get("subject") or "Bereavement question"),
        reply_to=inbound_data.get("reply_to"),
        has_attachments=bool(inbound_data.get("has_attachments", False)),
        auto_submitted=inbound_data.get("auto_submitted"),
        raw_mime_kind=inbound_data.get("raw_mime_kind"),
    )
    return PilotCase(
        id=str(row["id"]),
        category=str(row.get("category") or "gate"),
        language=str(row.get("lang") or "en"),
        expected_status=str(row["expected_status"]),
        inbound=inbound,
        processing_mode=str(row.get("processing_mode") or "public"),
        processing_enabled=bool(row.get("processing_enabled", True)),
        llm_fixture=row.get("llm_fixture"),
        duplicate_retry=bool(row.get("duplicate_retry", False)),
        rate_limit_prior_count=int(row.get("rate_limit_prior_count") or 0),
        allowlisted_sender=bool(row.get("allowlisted_sender", False)),
    )


def run_gate_case(row: dict[str, Any], *, prompt_path: str) -> CaseResult:
    case_id = str(row["id"])
    started = time.perf_counter()
    reasons: list[str] = []
    case = _pilot_case_from_gate(row)
    settings = build_pilot_settings(case, prompt_path=prompt_path)
    rate_limit = InMemoryRateLimit()
    daily_usage = InMemoryDailyUsage()
    if case.rate_limit_prior_count > 0:
        seed_rate_limit_history(
            case,
            settings=settings,
            rate_limit=rate_limit,
            daily_usage=daily_usage,
        )

    extra_blocked = int(row.get("rate_limit_extra_blocked") or 0)
    gmail = InMemoryGmail()
    if extra_blocked > 0:
        # Consume the first blocked notice, then run the scenario message.
        for index in range(extra_blocked):
            prior = PilotCase(
                id=f"{case.id}-blocked-{index}",
                category=case.category,
                language=case.language,
                expected_status="rate_limited",
                inbound=PilotInboundSpec(
                    message_id=f"{case.inbound.message_id}-blocked-{index}",
                    thread_id=case.inbound.thread_id,
                    from_address=case.inbound.from_address,
                    body_text=case.inbound.body_text,
                    to_addresses=case.inbound.to_addresses
                    or (case.inbound.from_address,),
                    subject=case.inbound.subject,
                ),
            )
            run_pilot_case(
                prior,
                settings=settings,
                llm=FakeLlmAdapter(responses=[]),
                prompt_path=prompt_path,
                rate_limit=rate_limit,
                daily_usage=daily_usage,
                gmail=InMemoryGmail(),
            )

    result = run_pilot_case(
        case,
        settings=settings,
        llm=build_pilot_llm(case),
        prompt_path=prompt_path,
        rate_limit=rate_limit,
        daily_usage=daily_usage,
        gmail=gmail if extra_blocked == 0 else InMemoryGmail(),
    )

    if result.actual_status != case.expected_status:
        reasons.append(
            f"status_mismatch: got {result.actual_status}, expected {case.expected_status}"
        )
    if result.error:
        reasons.append(f"error:{result.error}")
    send_min = row.get("expect_send_count_min")
    send_max = row.get("expect_send_count_max")
    if send_min is not None and result.send_count < int(send_min):
        reasons.append(f"send_count<{send_min}: got {result.send_count}")
    if send_max is not None and result.send_count > int(send_max):
        reasons.append(f"send_count>{send_max}: got {result.send_count}")
    if row.get("expect_no_duplicate_send") and result.duplicate_send:
        reasons.append("duplicate_send")

    # For the 12th-request case, total notices across blocked+final must stay at 1.
    if extra_blocked > 0:
        rate2 = InMemoryRateLimit()
        usage2 = InMemoryDailyUsage()
        seed_rate_limit_history(
            case,
            settings=settings,
            rate_limit=rate2,
            daily_usage=usage2,
        )
        total_sends = 0
        for index in range(extra_blocked + 1):
            message_id = f"{case.inbound.message_id}-count-{index}"
            piece = PilotCase(
                id=f"{case.id}-count-{index}",
                category=case.category,
                language=case.language,
                expected_status="rate_limited",
                inbound=PilotInboundSpec(
                    message_id=message_id,
                    thread_id=case.inbound.thread_id,
                    from_address=case.inbound.from_address,
                    body_text=case.inbound.body_text,
                    to_addresses=case.inbound.to_addresses
                    or (case.inbound.from_address,),
                    subject=case.inbound.subject,
                ),
            )
            piece_result = run_pilot_case(
                piece,
                settings=settings,
                llm=FakeLlmAdapter(responses=[]),
                prompt_path=prompt_path,
                rate_limit=rate2,
                daily_usage=usage2,
                gmail=InMemoryGmail(),
            )
            total_sends += piece_result.send_count
        if total_sends != 1:
            reasons.append(f"rate_limit_notice_count={total_sends}, expected 1")

    latency = time.perf_counter() - started
    return CaseResult(
        id=case_id,
        track="gate",
        passed=not reasons,
        latency_s=round(latency, 2),
        action=result.actual_status,
        expected=case.expected_status,
        error_code=None,
        reasons=reasons,
        body_preview=None,
    )


def write_report(
    results: list[CaseResult],
    *,
    report_dir: Path,
    basename: str,
) -> tuple[Path, Path]:
    report_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(tz=UTC).strftime("%Y%m%d-%H%M%S")
    base = report_dir / f"{basename}-{stamp}"
    payload = {
        "generated_at_utc": datetime.now(tz=UTC).isoformat(),
        "passed": sum(1 for item in results if item.passed),
        "failed": sum(1 for item in results if not item.passed),
        "results": [asdict(item) for item in results],
    }
    json_path = Path(f"{base}.json")
    md_path = Path(f"{base}.md")
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    lines = [
        f"# Lex live eval ({stamp})",
        "",
        f"Passed: {payload['passed']}  Failed: {payload['failed']}",
        "",
        "| id | track | pass | action | expected | error | s | reasons |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for item in results:
        mark = "PASS" if item.passed else "FAIL"
        reasons = "; ".join(item.reasons) if item.reasons else ""
        lines.append(
            f"| {item.id} | {item.track} | {mark} | {item.action or ''} | "
            f"{item.expected or ''} | {item.error_code or ''} | {item.latency_s} | "
            f"{reasons} |"
        )
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return json_path, md_path


def _print_table(results: list[CaseResult]) -> None:
    print(
        f"{'ID':40} {'TRACK':5} {'PASS':4} {'ACTION':18} {'ERR':24} {'S':7} REASONS"
    )
    for item in results:
        mark = "OK" if item.passed else "FAIL"
        reasons = "; ".join(item.reasons)
        print(
            f"{item.id:40} {item.track:5} {mark:4} {(item.action or '-')[:18]:18} "
            f"{(item.error_code or '-')[:24]:24} {item.latency_s:7.2f} {reasons}"
        )


def _load_dotenv_key() -> None:
    """Load OPENAI_API_KEY from .env if not already set (never prints values)."""
    if os.environ.get("OPENAI_API_KEY"):
        return
    env_path = SERVICE_ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "OPENAI_API_KEY" and value.strip():
            os.environ["OPENAI_API_KEY"] = value.strip().strip('"').strip("'")
            return


def main() -> int:
    parser = argparse.ArgumentParser(description="Lex local live/gate eval harness")
    parser.add_argument("--live", action="store_true", help="Run real OpenAI cases")
    parser.add_argument("--gates", action="store_true", help="Run Fake-LLM gate cases")
    parser.add_argument(
        "--scenarios",
        type=Path,
        default=DEFAULT_SCENARIOS,
        help="Path to scenarios.jsonl",
    )
    parser.add_argument(
        "--prompt-path",
        type=Path,
        default=DEFAULT_PROMPT,
        help="Path to lex system prompt",
    )
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--basename", default="live-eval")
    parser.add_argument("--ids", default="", help="Comma-separated case ids")
    parser.add_argument("--limit", type=int, default=0, help="Max cases per selected track")
    parser.add_argument("--model", default="gpt-5.6-luna")
    parser.add_argument("--max-output-tokens", type=int, default=16000)
    args = parser.parse_args()

    if not args.live and not args.gates:
        parser.error("Specify --live and/or --gates")

    rows = load_scenarios(args.scenarios)
    id_filter = {item.strip() for item in args.ids.split(",") if item.strip()}
    if id_filter:
        rows = [row for row in rows if row.get("id") in id_filter]

    results: list[CaseResult] = []

    if args.gates:
        gate_rows = [row for row in rows if row.get("track") == "gate"]
        if args.limit:
            gate_rows = gate_rows[: args.limit]
        print(f"Running {len(gate_rows)} gate cases...")
        for row in gate_rows:
            result = run_gate_case(row, prompt_path=str(args.prompt_path))
            results.append(result)
            status = "PASS" if result.passed else "FAIL"
            print(f"  [{status}] {result.id} ({result.latency_s}s)")

    if args.live:
        if not args.prompt_path.exists():
            print(f"ERROR: prompt missing: {args.prompt_path}", file=sys.stderr)
            return 2
        _load_dotenv_key()
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        if not api_key:
            print("ERROR: OPENAI_API_KEY not set", file=sys.stderr)
            return 2
        system_prompt = load_prompt(args.prompt_path)
        llm = OpenAIResponsesAdapter(
            api_key=api_key,
            model=args.model,
            max_output_tokens=args.max_output_tokens,
        )
        live_rows = [row for row in rows if row.get("track") == "live"]
        if args.limit:
            live_rows = live_rows[: args.limit]
        print(f"Running {len(live_rows)} live OpenAI cases (model={args.model})...")
        for row in live_rows:
            print(f"  -> {row['id']} ...", flush=True)
            result = run_live_case(row, system_prompt=system_prompt, llm=llm)
            results.append(result)
            status = "PASS" if result.passed else "FAIL"
            print(
                f"  [{status}] {result.id} action={result.action} "
                f"err={result.error_code} ({result.latency_s}s)",
                flush=True,
            )
            if result.reasons:
                print(f"       reasons: {'; '.join(result.reasons)}", flush=True)

    print()
    _print_table(results)
    json_path, md_path = write_report(
        results, report_dir=args.report_dir, basename=args.basename
    )
    print(f"\nWrote {json_path}")
    print(f"Wrote {md_path}")
    failed = sum(1 for item in results if not item.passed)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
