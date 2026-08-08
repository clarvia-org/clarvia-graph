"""Phase 7 synthetic end-to-end pilot suite."""

from __future__ import annotations

import logging

import pytest
from app.ops.alerts import emit_alert
from app.ops.eval_report import build_report_payload, write_report
from app.ops.pilot_harness import (
    PilotRunResult,
    assert_no_pii_log_fields,
    check_launch_thresholds,
    default_fixtures_path,
    load_pilot_cases,
)

from tests.evals.pilot_runner import run_full_pilot_suite

REQUIRED_CATEGORIES = frozenset(
    {
        "recent_death",
        "terminal_illness",
        "repatriation",
        "missing_country",
        "off_topic",
        "cc_family",
        "exactly_10_recipients",
        "11_recipients",
        "rate_limit",
        "long_thread_8plus",
        "html_only",
        "attachments",
        "openai_failure",
        "gmail_failure",
        "french",
        "german",
        "portuguese",
        "luxembourgish",
        "english",
    }
)


def test_pilot_fixture_count() -> None:
    cases = load_pilot_cases()
    assert len(cases) == 100


def test_pilot_required_categories_present() -> None:
    cases = load_pilot_cases()
    categories = {case.category for case in cases}
    missing = REQUIRED_CATEGORIES - categories
    assert not missing, f"missing categories: {sorted(missing)}"


def test_pilot_e2e_suite_passes(synthetic_prompt: str) -> None:
    suite = run_full_pilot_suite(prompt_path=synthetic_prompt)
    failures = [item for item in suite.results if not item.passed]
    assert not failures, _format_failures(failures)
    thresholds = check_launch_thresholds(suite)
    assert all(thresholds.values()), thresholds


def test_pilot_launch_thresholds_on_anchors(synthetic_prompt: str) -> None:
    suite = run_full_pilot_suite(prompt_path=synthetic_prompt)
    anchors = suite.anchor_results
    assert len(anchors) >= 10
    assert all(item.actual_status == item.expected_status for item in anchors)
    assert all(item.anchor_validation_ok is not False for item in anchors)


def test_pilot_zero_duplicate_sends(synthetic_prompt: str) -> None:
    suite = run_full_pilot_suite(prompt_path=synthetic_prompt)
    assert suite.duplicate_send_count == 0


def test_pilot_outbound_footer_and_continuation(synthetic_prompt: str) -> None:
    suite = run_full_pilot_suite(prompt_path=synthetic_prompt)
    outbound = [item for item in suite.results if item.send_count > 0]
    assert outbound, "expected at least one outbound email in pilot suite"
    assert all(item.footer_ok and item.continuation_ok for item in outbound)


def test_eval_report_generator_writes_synthetic_report(
    synthetic_prompt: str, tmp_path: object
) -> None:
    from pathlib import Path

    assert isinstance(tmp_path, Path)
    suite = run_full_pilot_suite(prompt_path=synthetic_prompt)
    json_path, md_path = write_report(suite, tmp_path, basename="pilot-ci")
    payload = build_report_payload(suite)
    assert json_path.exists()
    assert md_path.exists()
    assert payload["synthetic_only"] is True
    assert payload["case_count"] == 100


def test_emit_alert_smoke(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.WARNING):
        emit_alert("pilot_smoke", severity="warning", error_code="synthetic_test")
    records = [record for record in caplog.records if record.message == "alert"]
    assert len(records) == 1
    assert records[0].levelname == "WARNING"
    assert assert_no_pii_log_fields(["alert_code", "severity", "error_code"])


def test_fixtures_path_is_public_safe() -> None:
    path = default_fixtures_path()
    assert "runtime-private" not in str(path)
    assert path.exists()


def _format_failures(failures: list[PilotRunResult]) -> str:
    lines = []
    for item in failures:
        lines.append(
            f"{item.case_id}: expected {item.expected_status}, "
            f"got {item.actual_status}, error={item.error}"
        )
    return "\n".join(lines)
