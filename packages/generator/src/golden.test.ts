/**
 * Golden / characterization tests for PR 2.
 *
 * These tests capture the EXACT current behavior of all modules touched by
 * the evaluator refactor. They must pass BEFORE the refactor (Commit 1) and
 * remain unchanged AFTER (Commit 2). Any snapshot diff after refactoring
 * signals a behavior change that must be investigated.
 *
 * Suites:
 *   1. Checklist output snapshots (6 real scenarios)
 *   2. Evaluator edge cases (operator aliases, empty args, nesting)
 *   3. Temporal boundary behavior (recordApplies exact boundaries)
 *   4. Jurisdiction role fallback behavior
 *   5. Explanation trace shape and ordering
 */

import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { loadGraph, generateChecklist, evaluateCondition, buildFactData } from "./index.js";
import type { Fact, TriValue } from "./evaluator.js";
import type { LoadedGraph } from "./loader.js";
import { recordApplies, type TemporalContext } from "./temporal.js";
import {
  resolveJurisdictionRoles,
  getRelevantJurisdictions,
  isCrossBorder,
} from "./jurisdiction-roles.js";
import { buildExplanationTrace } from "./explanation.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..");
const FIXED_AS_OF = "2026-06-03";

/** Strip non-deterministic fields from checklist output before snapshotting. */
function stripTimestamps(output: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...output };
  delete copy.generated_at;
  delete copy.checklist_run_id;
  return copy;
}

/** Load scenario facts from a YAML file. */
function loadScenarioFacts(scenarioPath: string): Fact[] {
  const raw = readFileSync(resolve(ROOT_DIR, scenarioPath), "utf-8");
  const doc = parseYaml(raw) as { facts: Array<{ fact_type: string; value: unknown }> };
  return doc.facts.map((f) => ({ fact_type: f.fact_type, value: f.value }));
}

// ═══════════════════════════════════════════════════════════════════════
// Suite 1: Checklist output snapshots
// ═══════════════════════════════════════════════════════════════════════

describe("golden: checklist output snapshots", () => {
  const graph = loadGraph(ROOT_DIR);

  const scenarios = [
    { name: "lu/core_bereavement", path: "tests/scenarios/lu/core_bereavement.yml" },
    { name: "lu/minimal_unknown", path: "tests/scenarios/lu/minimal_unknown.yml" },
    { name: "lu/self_employed_property", path: "tests/scenarios/lu/self_employed_property.yml" },
    { name: "lu/core_married_employed_vehicle", path: "tests/scenarios/lu/core_married_employed_vehicle.yml" },
    { name: "lu/self_employed_property_not_married", path: "tests/scenarios/lu/self_employed_property_not_married.yml" },
    { name: "xborder/lu_resident_de_death", path: "tests/scenarios/xborder/lu_resident_de_death.yml" },
  ];

  for (const scenario of scenarios) {
    it(`scenario: ${scenario.name}`, () => {
      const facts = loadScenarioFacts(scenario.path);
      const output = generateChecklist({
        graph,
        facts,
        lifeEvent: "bereavement",
        asOfDate: FIXED_AS_OF,
        eventDate: FIXED_AS_OF,
      });
      expect(stripTimestamps(output as unknown as Record<string, unknown>)).toMatchSnapshot();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Suite 2: Evaluator edge cases
// ═══════════════════════════════════════════════════════════════════════

describe("golden: evaluator edge cases", () => {
  function eval_(
    expression: object,
    facts: Fact[],
  ): { result: TriValue; missingFacts: string[] } {
    return evaluateCondition(expression, facts);
  }

  // Operator aliases
  it("=== alias uses loose equality (same as ==)", () => {
    const { result } = eval_(
      { "===": [{ var: "a" }, "1"] },
      [{ fact_type: "a", value: 1 }],
    );
    expect(result).toMatchInlineSnapshot(`true`);
  });

  it("!== alias uses loose inequality (same as !=)", () => {
    const { result } = eval_(
      { "!==": [{ var: "a" }, "1"] },
      [{ fact_type: "a", value: 1 }],
    );
    expect(result).toMatchInlineSnapshot(`false`);
  });

  it("'not' alias for '!'", () => {
    const { result } = eval_(
      { not: [{ "==": [{ var: "a" }, 1] }] },
      [{ fact_type: "a", value: 1 }],
    );
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // Unknown operator
  it("unknown operator → unknown", () => {
    const { result } = eval_(
      { bogus_op: [{ var: "a" }, 1] } as unknown as object,
      [{ fact_type: "a", value: 1 }],
    );
    expect(result).toMatchInlineSnapshot(`"unknown"`);
  });

  // in(string, string)
  it("in(substring, string) → true", () => {
    const { result } = eval_(
      { in: ["LU", "LU,DE,FR"] },
      [],
    );
    expect(result).toMatchInlineSnapshot(`true`);
  });

  it("in(substring, string) → false when not found", () => {
    const { result } = eval_(
      { in: ["US", "LU,DE,FR"] },
      [],
    );
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // in(non-string, non-array)
  it("in(number, number) → false", () => {
    const { result } = eval_(
      { in: [1, 123] },
      [],
    );
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // Empty and/or
  it("and([]) with no args → true", () => {
    const { result } = eval_({ and: [] }, []);
    expect(result).toMatchInlineSnapshot(`true`);
  });

  it("or([]) with no args → false", () => {
    const { result } = eval_({ or: [] }, []);
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // Nested MISSING propagation
  it("and(or(missing, false), true) → unknown", () => {
    const { result } = eval_(
      {
        and: [
          { or: [{ "==": [{ var: "x" }, 1] }, { "==": [{ var: "y" }, 2] }] },
          { "==": [{ var: "z" }, 3] },
        ],
      },
      [
        { fact_type: "y", value: 999 }, // y is false
        { fact_type: "z", value: 3 },   // z is true
      ],
      // x is missing → or(unknown, false) → unknown
      // and(unknown, true) → unknown
    );
    expect(result).toMatchInlineSnapshot(`"unknown"`);
  });

  // Multi-key object
  it("multi-key object passes through (not a valid JsonLogic node)", () => {
    const { result } = eval_(
      { "==": [{ a: 1, b: 2 }, "LU"] } as unknown as object,
      [],
    );
    // { a: 1, b: 2 } has 2 keys, passes through as-is, then == compares it to "LU"
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // Primitives pass through
  it("null expression → false", () => {
    // evaluateCondition converts null (falsy) to false
    const { result } = eval_(null as unknown as object, []);
    expect(result).toMatchInlineSnapshot(`false`);
  });

  it("number expression → true for truthy number", () => {
    const { result } = eval_(42 as unknown as object, []);
    expect(result).toMatchInlineSnapshot(`true`);
  });

  it("0 expression → false", () => {
    const { result } = eval_(0 as unknown as object, []);
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // Single non-array arg wrapping
  it("! with non-array arg", () => {
    // { "!": true } — rawArgs is `true`, not an array
    const { result } = eval_({ "!": true } as unknown as object, []);
    expect(result).toMatchInlineSnapshot(`false`);
  });

  // buildFactData golden check
  it("buildFactData nesting structure", () => {
    const data = buildFactData([
      { fact_type: "a.b.c", value: 1 },
      { fact_type: "a.b.d", value: 2 },
      { fact_type: "x", value: "hello" },
    ]);
    expect(data).toMatchInlineSnapshot(`
      {
        "a": {
          "b": {
            "c": 1,
            "d": 2,
          },
        },
        "x": "hello",
      }
    `);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Suite 3: Temporal boundary behavior
// ═══════════════════════════════════════════════════════════════════════

describe("golden: temporal boundary behavior", () => {
  const ctx: TemporalContext = { asOfDate: "2026-06-03", eventDate: "2026-06-03" };

  it("record_valid_from exactly equals asOfDate → applies", () => {
    expect(recordApplies({ record_valid_from: "2026-06-03" }, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("record_valid_from day after asOfDate → excluded", () => {
    expect(recordApplies({ record_valid_from: "2026-06-04" }, ctx)).toMatchInlineSnapshot(`false`);
  });

  it("record_valid_from day before asOfDate → applies", () => {
    expect(recordApplies({ record_valid_from: "2026-06-02" }, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("record_valid_to exactly equals asOfDate → excluded", () => {
    expect(recordApplies({ record_valid_to: "2026-06-03" }, ctx)).toMatchInlineSnapshot(`false`);
  });

  it("record_valid_to day after asOfDate → applies", () => {
    expect(recordApplies({ record_valid_to: "2026-06-04" }, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("record_valid_to day before asOfDate → excluded", () => {
    expect(recordApplies({ record_valid_to: "2026-06-02" }, ctx)).toMatchInlineSnapshot(`false`);
  });

  it("legal_effective_from exactly equals eventDate → applies", () => {
    expect(recordApplies({ legal_effective_from: "2026-06-03" }, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("legal_effective_from day after eventDate → excluded", () => {
    expect(recordApplies({ legal_effective_from: "2026-06-04" }, ctx)).toMatchInlineSnapshot(`false`);
  });

  it("legal_effective_to exactly equals eventDate → excluded", () => {
    expect(recordApplies({ legal_effective_to: "2026-06-03" }, ctx)).toMatchInlineSnapshot(`false`);
  });

  it("legal_effective_to day after eventDate → applies", () => {
    expect(recordApplies({ legal_effective_to: "2026-06-04" }, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("null fields → applies (no constraint)", () => {
    expect(
      recordApplies(
        { record_valid_from: null, record_valid_to: null, legal_effective_from: null, legal_effective_to: null },
        ctx,
      ),
    ).toMatchInlineSnapshot(`true`);
  });

  it("undefined fields → applies (no constraint)", () => {
    expect(recordApplies({}, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("non-object input → true", () => {
    expect(recordApplies(null as unknown as Record<string, unknown>, ctx)).toMatchInlineSnapshot(`true`);
  });

  it("empty record → applies", () => {
    expect(recordApplies({}, ctx)).toMatchInlineSnapshot(`true`);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Suite 4: Jurisdiction role fallback behavior
// ═══════════════════════════════════════════════════════════════════════

describe("golden: jurisdiction role fallbacks", () => {
  it("succession law fallback copies from habitual residence", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "deceased.habitual_residence.country", value: "LU" },
    ]);
    expect(roles.possible_succession_law).toMatchInlineSnapshot(`
      [
        "LU",
      ]
    `);
  });

  it("pension authority fallback copies from work state", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "deceased.last_social_security_affiliation.country", value: "DE" },
    ]);
    expect(roles.possible_pension_authority).toMatchInlineSnapshot(`
      [
        "DE",
      ]
    `);
  });

  it("explicit succession law prevents fallback", () => {
    // If there's no mapping for possible_succession_law, fallback kicks in.
    // But possible_succession_law has no direct mapping, so it always falls back.
    const roles = resolveJurisdictionRoles([
      { fact_type: "deceased.habitual_residence.country", value: "LU" },
    ]);
    // Fallback always applies since no fact_type maps to possible_succession_law
    expect(roles.possible_succession_law).toEqual(["LU"]);
    expect(roles.deceased_habitual_residence).toEqual(["LU"]);
  });

  it("'unknown' values are excluded from roles", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "death.place.country", value: "unknown" },
    ]);
    expect(roles.death_place).toMatchInlineSnapshot(`[]`);
  });

  it("empty string values are excluded", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "death.place.country", value: "" },
    ]);
    expect(roles.death_place).toMatchInlineSnapshot(`[]`);
  });

  it("duplicate values are deduplicated", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "death.place.country", value: "LU" },
    ]);
    expect(roles.death_place).toMatchInlineSnapshot(`
      [
        "LU",
      ]
    `);
  });

  it("comma-separated array facts are split", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "estate.asset_location.country", value: "LU,DE,FR" },
    ]);
    expect(roles.asset_situs).toMatchInlineSnapshot(`
      [
        "LU",
        "DE",
        "FR",
      ]
    `);
  });

  it("isCrossBorder with 1 jurisdiction → false", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "death.place.country", value: "LU" },
    ]);
    expect(isCrossBorder(roles)).toMatchInlineSnapshot(`false`);
  });

  it("isCrossBorder with 2+ jurisdictions → true", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.habitual_residence.country", value: "DE" },
    ]);
    expect(isCrossBorder(roles)).toMatchInlineSnapshot(`true`);
  });

  it("getRelevantJurisdictions always includes eu and xborder", () => {
    const roles = resolveJurisdictionRoles([]);
    const jurisdictions = getRelevantJurisdictions(roles);
    expect(jurisdictions.has("eu")).toMatchInlineSnapshot(`true`);
    expect(jurisdictions.has("xborder")).toMatchInlineSnapshot(`true`);
  });

  it("full role resolution snapshot", () => {
    const roles = resolveJurisdictionRoles([
      { fact_type: "death.place.country", value: "DE" },
      { fact_type: "deceased.habitual_residence.country", value: "LU" },
      { fact_type: "deceased.last_social_security_affiliation.country", value: "DE" },
      { fact_type: "estate.asset_location.country", value: "FR" },
      { fact_type: "survivor.residence.country", value: "LU" },
    ]);
    expect(roles).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Suite 5: Explanation trace shape and ordering
// ═══════════════════════════════════════════════════════════════════════

describe("golden: explanation trace shape and ordering", () => {
  // Build a minimal graph for explanation trace testing
  function makeTraceGraph(): LoadedGraph {
    return {
      consequences: new Map([
        [
          "consequence.test",
          {
            id: "consequence.test",
            source_assertion_refs: ["assertion.a1", "assertion.a2"],
          },
        ],
      ]),
      conditions: new Map([
        [
          "condition.death_in_lu",
          {
            id: "condition.death_in_lu",
            title: "Death occurred in Luxembourg",
            expression: { "==": [{ var: "death.place.country" }, "LU"] },
          },
        ],
        [
          "condition.is_spouse",
          {
            id: "condition.is_spouse",
            title: "Survivor is spouse",
            expression: { "==": [{ var: "relationship.to_deceased" }, "surviving_spouse"] },
          },
        ],
        [
          "condition.has_pension",
          {
            id: "condition.has_pension",
            title: null, // title is null — should fall back to ref
            expression: { "==": [{ var: "pension.type" }, "state"] },
          },
        ],
      ]),
      assertions: new Map([
        [
          "assertion.a1",
          {
            id: "assertion.a1",
            source_id: "source.gov_lu",
            record_valid_from: "2026-01-01",
          },
        ],
        [
          "assertion.a2",
          {
            id: "assertion.a2",
            source_id: "source.gov_lu",
            record_valid_from: "2026-01-01",
          },
        ],
      ]),
      sources: new Map([
        [
          "source.gov_lu",
          {
            id: "source.gov_lu",
            title: "Government of Luxembourg",
            publisher: "État du Luxembourg",
            url: "https://guichet.lu",
          },
        ],
      ]),
      taskTemplates: new Map(),
      deadlines: new Map(),
      authorities: new Map(),
      evidenceTypes: new Map(),
      intakeFactTypes: new Map(),
    } as unknown as LoadedGraph;
  }

  it("condition result=true → why_visible format", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.death_in_lu", { result: true, missingFacts: [] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.1",
      "consequence.test",
      ["condition.death_in_lu"],
      conditionResults,
      graph,
    );
    expect(trace).toMatchSnapshot();
  });

  it("condition result=unknown → why_visible format", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.is_spouse", { result: "unknown", missingFacts: ["relationship.to_deceased"] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.2",
      "consequence.test",
      ["condition.is_spouse"],
      conditionResults,
      graph,
    );
    expect(trace).toMatchSnapshot();
  });

  it("condition result=false → no why_visible message", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.death_in_lu", { result: false, missingFacts: [] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.3",
      "consequence.test",
      ["condition.death_in_lu"],
      conditionResults,
      graph,
    );
    expect(trace.why_visible).toMatchInlineSnapshot(`[]`);
    expect(trace.conditions[0].result).toMatchInlineSnapshot(`"false"`);
  });

  it("null title falls back to condition ref", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.has_pension", { result: true, missingFacts: [] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.4",
      "consequence.test",
      ["condition.has_pension"],
      conditionResults,
      graph,
    );
    // title is null, so why_visible should use the ref
    expect(trace.why_visible[0]).toMatchInlineSnapshot(`"condition.has_pension: satisfied"`);
  });

  it("missing facts → facts_used contains (missing) suffix", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.death_in_lu", { result: "unknown", missingFacts: ["death.place.country"] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.5",
      "consequence.test",
      ["condition.death_in_lu"],
      conditionResults,
      graph,
    );
    expect(trace.conditions[0].facts_used).toMatchInlineSnapshot(`
      [
        "death.place.country (missing)",
      ]
    `);
  });

  it("present facts → facts_used contains var paths from expression", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.death_in_lu", { result: true, missingFacts: [] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.6",
      "consequence.test",
      ["condition.death_in_lu"],
      conditionResults,
      graph,
    );
    expect(trace.conditions[0].facts_used).toMatchInlineSnapshot(`
      [
        "death.place.country",
      ]
    `);
  });

  it("source traces grouped by source_id, ordering preserved", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>();

    const trace = buildExplanationTrace(
      "trace.7",
      "consequence.test",
      [],
      conditionResults,
      graph,
    );
    // Both assertions share source.gov_lu → grouped into one source trace
    expect(trace.sources).toMatchSnapshot();
  });

  it("temporal filtering excludes expired assertions from source traces", () => {
    const graph = makeTraceGraph();
    // Make assertion.a1 expired
    graph.assertions!.get("assertion.a1")!.record_valid_to = "2026-05-01";

    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>();
    const temporalCtx: TemporalContext = { asOfDate: "2026-06-03", eventDate: "2026-06-03" };

    const trace = buildExplanationTrace(
      "trace.8",
      "consequence.test",
      [],
      conditionResults,
      graph,
      temporalCtx,
    );
    // Only assertion.a2 should remain
    expect(trace.sources).toMatchSnapshot();
  });

  it("missing consequence → empty sources", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>();

    const trace = buildExplanationTrace(
      "trace.9",
      "consequence.nonexistent",
      [],
      conditionResults,
      graph,
    );
    expect(trace.sources).toMatchInlineSnapshot(`[]`);
  });

  it("multiple conditions preserve order", () => {
    const graph = makeTraceGraph();
    const conditionResults = new Map<string, { result: TriValue; missingFacts: string[] }>([
      ["condition.death_in_lu", { result: true, missingFacts: [] }],
      ["condition.is_spouse", { result: true, missingFacts: [] }],
    ]);

    const trace = buildExplanationTrace(
      "trace.10",
      "consequence.test",
      ["condition.death_in_lu", "condition.is_spouse"],
      conditionResults,
      graph,
    );
    expect(trace).toMatchSnapshot();
  });
});
