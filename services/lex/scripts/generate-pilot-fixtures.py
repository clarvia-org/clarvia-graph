"""Deterministic generator for 100 synthetic Phase 7 pilot E2E cases.

Run from the service root:

    python scripts/generate-pilot-fixtures.py

Writes ``tests/fixtures/pilot/conversations.jsonl``.
"""

from __future__ import annotations

import json
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = SERVICE_ROOT / "tests" / "fixtures" / "pilot" / "conversations.jsonl"

BODIES: dict[str, str] = {
    "recent_death": (
        "My father died yesterday in Luxembourg. What are the first steps?"
    ),
    "terminal_illness": (
        "My mother has terminal cancer. What advance care planning exists in LU?"
    ),
    "repatriation": (
        "A relative died abroad and we need repatriation to Luxembourg. What next?"
    ),
    "missing_country": "Someone close to me died. What should I do first?",
    "off_topic": "Can you help me with a general tax return question?",
    "cc_family": "We are coordinating after a death. What should the family do?",
    "long_thread": (
        "Follow-up 9: continuing our long thread about death registration steps."
    ),
    "fr": "Ma mère est décédée hier au Luxembourg. Que dois-je faire?",
    "de": "Mein Vater ist gestern in Luxemburg gestorben. Was muss ich tun?",
    "pt": "O meu pai faleceu ontem no Luxemburgo. O que devo fazer?",
    "lb": "Meng Mamm ass gëschter zu Lëtzebuerg gestuerwen. Wat muss ech maachen?",
    "en": "My mother died yesterday in Luxembourg. What should I do?",
}


def _case(
    index: int,
    *,
    category: str,
    expected_status: str,
    language: str = "en",
    body_key: str | None = None,
    llm_fixture: str | None = "answer_lu_death",
    anchor: bool = False,
    inbound_cc: tuple[str, ...] | None = None,
    inbound_to: tuple[str, ...] | None = None,
    body_text: str | None = None,
    has_attachments: bool = False,
    raw_mime_kind: str | None = None,
    auto_submitted: str | None = None,
    **extra: object,
) -> dict[str, object]:
    case_id = f"pilot_{index:03d}"
    body = (
        body_text
        if body_text is not None
        else BODIES.get(body_key or category, BODIES["en"])
    )
    from_addr = f"family{index:03d}@example.com"
    inbound: dict[str, object] = {
        "message_id": case_id,
        "thread_id": f"thread_{case_id}",
        "from_address": from_addr,
        "body_text": body,
        "to_addresses": list(inbound_to or (from_addr,)),
        "cc_addresses": list(inbound_cc or ()),
        "subject": "Bereavement question",
    }
    if has_attachments:
        inbound["has_attachments"] = True
    if raw_mime_kind:
        inbound["raw_mime_kind"] = raw_mime_kind
    if auto_submitted:
        inbound["auto_submitted"] = auto_submitted
    data: dict[str, object] = {
        "id": case_id,
        "category": category,
        "language": language,
        "expected_status": expected_status,
        "inbound": inbound,
        "anchor": anchor,
    }
    if llm_fixture is not None:
        data["llm_fixture"] = llm_fixture
    data.update(extra)
    return data


def build_cases() -> list[dict[str, object]]:
    cases: list[dict[str, object]] = []
    index = 1

    def add(**kwargs: object) -> None:
        nonlocal index
        cases.append(_case(index, **kwargs))  # type: ignore[arg-type]
        index += 1

    add(
        category="recent_death",
        expected_status="sent",
        body_key="recent_death",
        anchor=True,
    )
    add(
        category="terminal_illness",
        expected_status="sent",
        body_key="terminal_illness",
        llm_fixture="answer_eol_prep",
    )
    add(
        category="repatriation",
        expected_status="sent",
        body_key="repatriation",
        llm_fixture="answer_repatriation",
    )
    add(
        category="missing_country",
        expected_status="sent",
        body_key="missing_country",
        llm_fixture="clarify_missing_country",
    )
    add(
        category="off_topic",
        expected_status="sent",
        body_key="off_topic",
        llm_fixture="decline_off_topic",
    )
    add(
        category="cc_family",
        expected_status="sent",
        body_key="cc_family",
        inbound_cc=("sibling@example.com",),
    )
    add(
        category="exactly_10_recipients",
        expected_status="sent",
        inbound_to=tuple(f"user{i}@example.com" for i in range(9)),
        inbound_cc=(),
    )
    add(
        category="11_recipients",
        expected_status="recipient_limited",
        llm_fixture=None,
        inbound_to=tuple(f"user{i}@example.com" for i in range(10)),
    )
    add(
        category="rate_limit",
        expected_status="rate_limited",
        llm_fixture=None,
        rate_limit_prior_count=10,
    )
    add(
        category="long_thread_8plus",
        expected_status="sent",
        body_key="long_thread",
        llm_fixture="follow_up_thread",
    )
    add(
        category="html_only",
        expected_status="sent",
        raw_mime_kind="html_only",
        body_key="en",
    )
    add(
        category="attachments",
        expected_status="attachment_only",
        llm_fixture=None,
        has_attachments=True,
        body_text="",
    )
    add(
        category="openai_failure",
        expected_status="failed",
        openai_failure=True,
        llm_fixture=None,
    )
    add(category="gmail_failure", expected_status="failed", gmail_failure=True)
    add(
        category="french",
        expected_status="sent",
        language="fr",
        body_key="fr",
        llm_fixture="answer_fr_language",
    )
    add(
        category="german",
        expected_status="sent",
        language="de",
        body_key="de",
        llm_fixture="answer_de_language",
    )
    add(
        category="portuguese",
        expected_status="sent",
        language="pt",
        body_key="pt",
        llm_fixture="answer_pt_language",
    )
    add(category="luxembourgish", expected_status="sent", language="lb", body_key="lb")
    add(
        category="english",
        expected_status="sent",
        language="en",
        body_key="en",
        anchor=True,
    )

    add(
        category="allowlist_rejected",
        expected_status="allowlist_rejected",
        processing_mode="allowlist",
        allowlisted_sender=False,
        llm_fixture=None,
    )
    add(
        category="allowlist_accepted",
        expected_status="sent",
        processing_mode="allowlist",
        allowlisted_sender=True,
    )
    add(
        category="processing_disabled",
        expected_status="disabled",
        processing_enabled=False,
        llm_fixture=None,
    )
    add(
        category="circuit_open",
        expected_status="circuit_open",
        force_circuit_open=True,
        llm_fixture=None,
    )
    add(
        category="auto_ignored",
        expected_status="ignored",
        auto_submitted="auto-generated",
        llm_fixture=None,
    )
    add(
        category="duplicate_retry",
        expected_status="already_done",
        duplicate_retry=True,
        anchor=True,
    )

    anchor_fixtures = [
        ("answer_cross_border", "cross_border"),
        ("answer_funeral_provider", "provider_request"),
        ("clarify_two_questions", "missing_information"),
        ("answer_emergency_signpost", "immediate_danger"),
        ("mixed_scope_decline", "off_topic"),
        ("answer_will_signpost", "end_of_life_preparation"),
        ("answer_pension_notification", "immediate_post_death"),
        ("answer_belgium", "cross_border"),
        ("answer_germany", "cross_border"),
        ("mixed_scope_decline", "off_topic"),
    ]
    for fixture, category in anchor_fixtures:
        add(
            category=category,
            expected_status="sent",
            llm_fixture=fixture,
            anchor=True,
        )

    bulk_templates = [
        ("recent_death", "sent", "answer_lu_death"),
        ("terminal_illness", "sent", "answer_eol_prep"),
        ("repatriation", "sent", "answer_repatriation"),
        ("missing_country", "sent", "clarify_missing_country"),
        ("off_topic", "sent", "decline_off_topic"),
        ("cross_border", "sent", "answer_cross_border"),
        ("provider_request", "sent", "answer_funeral_provider"),
        ("end_of_life_preparation", "sent", "answer_will_signpost"),
        ("immediate_post_death", "sent", "answer_pension_notification"),
        ("immediate_danger", "sent", "answer_emergency_signpost"),
    ]
    while len(cases) < 100:
        template = bulk_templates[(len(cases) - 1) % len(bulk_templates)]
        add(
            category=template[0],
            expected_status=template[1],
            llm_fixture=template[2],
        )

    if len(cases) != 100:
        raise RuntimeError(f"expected 100 cases, got {len(cases)}")
    return cases


def main() -> None:
    cases = build_cases()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8") as handle:
        for case in cases:
            handle.write(json.dumps(case, ensure_ascii=False) + "\n")
    print(f"Wrote {len(cases)} pilot cases to {OUTPUT}")


if __name__ == "__main__":
    main()
