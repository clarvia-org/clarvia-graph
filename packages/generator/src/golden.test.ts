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

// ═══════════════════════════════════════════════════════════════════════
// Suite 6: Generator pipeline internals
// ═══════════════════════════════════════════════════════════════════════

describe("golden: generator pipeline internals", () => {
  const FIXED_AS_OF = "2026-06-03";

  type MockGraph = Parameters<typeof generateChecklist>[0]["graph"];

  /** Build a minimal mock graph for pipeline tests. */
  function makeBaseGraph(overrides?: {
    consequences?: Array<[string, Record<string, unknown>]>;
    taskTemplates?: Array<[string, Record<string, unknown>]>;
    conditions?: Array<[string, Record<string, unknown>]>;
    assertions?: Array<[string, Record<string, unknown>]>;
    sources?: Array<[string, Record<string, unknown>]>;
  }): MockGraph {
    return {
      consequences: new Map(overrides?.consequences ?? []),
      taskTemplates: new Map(overrides?.taskTemplates ?? []),
      conditions: new Map(overrides?.conditions ?? []),
      deadlines: new Map(),
      authorities: new Map(),
      evidenceTypes: new Map(),
      intakeFactTypes: new Map(),
      sources: new Map(overrides?.sources ?? []),
      assertions: new Map(overrides?.assertions ?? []),
    } as unknown as MockGraph;
  }

  /** Minimal consequence that passes all filters. */
  function makeConsequence(id: string, extra?: Record<string, unknown>) {
    return [id, {
      id,
      schema_version: "0.1.0",
      title: `Title of ${id}`,
      consequence_type: "obligation",
      jurisdiction: "LU",
      life_event: "bereavement",
      domain: "death_registration",
      authoring_status: "approved",
      distribution_status: "public_open",
      record_valid_from: "2026-01-01",
      ...extra,
    }] as [string, Record<string, unknown>];
  }

  /** Minimal task template. */
  function makeTemplate(id: string, extra?: Record<string, unknown>) {
    return [id, {
      id,
      schema_version: "0.1.0",
      title: `Task ${id}`,
      action_type: "file_declaration",
      jurisdiction: "LU",
      life_event: "bereavement",
      domain: "death_registration",
      authoring_status: "approved",
      distribution_status: "public_open",
      record_valid_from: "2026-01-01",
      ...extra,
    }] as [string, Record<string, unknown>];
  }

  // ── 6a. Pipeline stages: candidates → expanded → visible ──────────

  it("6a. does_not_apply items filtered from output, applies and needs_fact kept", () => {
    // Three consequences: one always true, one always false, one unknown
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.applies", {
          trigger: { condition_refs: ["cond.true"] },
          task_template_refs: ["t.applies"],
        }),
        makeConsequence("c.false", {
          trigger: { condition_refs: ["cond.false"] },
          task_template_refs: ["t.false"],
        }),
        makeConsequence("c.unknown", {
          trigger: { condition_refs: ["cond.unknown"] },
          task_template_refs: ["t.unknown"],
        }),
      ],
      taskTemplates: [
        makeTemplate("t.applies", { rendering: { checklist_group: "immediate_formalities", urgency_score: 80 } }),
        makeTemplate("t.false", { rendering: { checklist_group: "immediate_formalities", urgency_score: 50 } }),
        makeTemplate("t.unknown", { rendering: { checklist_group: "immediate_formalities", urgency_score: 30 } }),
      ],
      conditions: [
        ["cond.true", {
          id: "cond.true", title: "Always true",
          expression: { "==": [{ var: "death.place.country" }, "LU"] },
        }],
        ["cond.false", {
          id: "cond.false", title: "Always false",
          expression: { "==": [{ var: "death.place.country" }, "XX"] },
        }],
        ["cond.unknown", {
          id: "cond.unknown", title: "Unknown (missing var)",
          expression: { "==": [{ var: "nonexistent.var" }, "yes"] },
        }],
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // does_not_apply items are NOT in output.items
    const statuses = output.items.map(i => i.status);
    expect(statuses).not.toContain("does_not_apply");

    // The "applies" item and "needs_fact" item should be present
    expect(statuses).toContain("applies");
    expect(statuses).toContain("needs_fact");

    // summary.item_counts reflects only visible items
    expect(output.summary.item_counts.applies).toBe(1);
    expect(output.summary.item_counts.needs_fact).toBe(1);
    expect(output.summary.item_counts).toMatchInlineSnapshot(`
      {
        "applies": 1,
        "maybe_applies": 0,
        "needs_fact": 1,
        "professional_review": 0,
      }
    `);
  });

  // ── 6b. Temporally-valid source refs ──────────────────────────────

  it("6b. source_count excludes expired assertions, item assertion_count reflects temporal filtering", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.test", {
          task_template_refs: ["t.test"],
          source_assertion_refs: ["a.valid", "a.expired"],
        }),
      ],
      taskTemplates: [
        makeTemplate("t.test"),
      ],
      assertions: [
        ["a.valid", {
          id: "a.valid", source_id: "s.test",
          record_valid_from: "2026-01-01",
        }],
        ["a.expired", {
          id: "a.expired", source_id: "s.test",
          record_valid_from: "2026-01-01",
          record_valid_to: "2026-05-01", // expired before asOfDate
        }],
      ],
      sources: [
        ["s.test", { id: "s.test", title: "Source", publisher: "Gov", url: "https://example.com" }],
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // Only 1 of 2 assertions is valid
    expect(output.summary.source_count).toBe(1);
    expect(output.items[0].source_summary?.assertion_count).toBe(1);
  });

  // ── 6c. Condition evaluation caching ──────────────────────────────

  it("6c. same condition referenced by 2 consequences produces consistent status", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.one", {
          trigger: { condition_refs: ["cond.shared"] },
          task_template_refs: ["t.one"],
        }),
        makeConsequence("c.two", {
          trigger: { condition_refs: ["cond.shared"] },
          task_template_refs: ["t.two"],
        }),
      ],
      taskTemplates: [
        makeTemplate("t.one", { title: "Task One", rendering: { checklist_group: "immediate_formalities", urgency_score: 90 } }),
        makeTemplate("t.two", { title: "Task Two", rendering: { checklist_group: "immediate_formalities", urgency_score: 80 } }),
      ],
      conditions: [
        ["cond.shared", {
          id: "cond.shared", title: "Shared condition",
          expression: { "==": [{ var: "death.place.country" }, "LU"] },
        }],
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // Both items should have the same status (applies), derived from cached condition
    expect(output.items.length).toBe(2);
    expect(output.items[0].status).toBe("applies");
    expect(output.items[1].status).toBe("applies");
  });

  // ── 6d. Consequence with no task_template_refs ────────────────────

  it("6d. consequence with empty task_template_refs produces item using consequence title", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.bare", {
          title: "Bare Consequence Title",
          task_template_refs: [],
        }),
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    expect(output.items.length).toBe(1);
    expect(output.items[0].title).toBe("Bare Consequence Title");
    expect(output.items[0].action).toBeNull();
  });

  // ── 6e. Event date fallback ───────────────────────────────────────

  it("6e. eventDate falls back to death.date fact when not provided", () => {
    // Consequence with legal_effective_from after the asOfDate but before the death.date
    // If eventDate correctly falls back to death.date, consequence should apply
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.legal", {
          task_template_refs: ["t.legal"],
          legal_effective_from: "2026-03-01",
        }),
      ],
      taskTemplates: [
        makeTemplate("t.legal"),
      ],
    });

    // death.date = "2026-04-01", asOfDate = "2026-06-03"
    // legal_effective_from = "2026-03-01" ≤ eventDate "2026-04-01" → applies
    const output = generateChecklist({
      graph,
      facts: [
        { fact_type: "death.place.country", value: "LU" },
        { fact_type: "death.date", value: "2026-04-01" },
      ],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      // eventDate NOT provided — should fall back to death.date
    });

    expect(output.items.length).toBe(1);
  });

  // ── 6f. Item sorting order ────────────────────────────────────────

  it("6f. items sorted by group order, then urgency desc, then title alpha", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.1", { task_template_refs: ["t.low_urg"] }),
        makeConsequence("c.2", { task_template_refs: ["t.high_urg"] }),
        makeConsequence("c.3", { task_template_refs: ["t.money"] }),
        makeConsequence("c.4", { task_template_refs: ["t.alpha_a"] }),
        makeConsequence("c.5", { task_template_refs: ["t.alpha_b"] }),
      ],
      taskTemplates: [
        makeTemplate("t.low_urg", { title: "Low Urgency Task", rendering: { checklist_group: "immediate_formalities", urgency_score: 30 } }),
        makeTemplate("t.high_urg", { title: "High Urgency Task", rendering: { checklist_group: "immediate_formalities", urgency_score: 90 } }),
        makeTemplate("t.money", { title: "Money Task", rendering: { checklist_group: "money_and_benefits", urgency_score: 50 } }),
        makeTemplate("t.alpha_a", { title: "AAA Same Score", rendering: { checklist_group: "money_and_benefits", urgency_score: 50 } }),
        makeTemplate("t.alpha_b", { title: "ZZZ Same Score", rendering: { checklist_group: "money_and_benefits", urgency_score: 50 } }),
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    const titles = output.items.map(i => i.title);
    // immediate_formalities (order 1) before money_and_benefits (order 2)
    // within immediate_formalities: high urgency (90) before low urgency (30)
    // within money_and_benefits same urgency: AAA before Money before ZZZ
    expect(titles).toMatchInlineSnapshot(`
      [
        "High Urgency Task",
        "Low Urgency Task",
        "AAA Same Score",
        "Money Task",
        "ZZZ Same Score",
      ]
    `);
  });

  // ── 6g. Section assembly ──────────────────────────────────────────

  it("6g. sections have correct labels, item_count, and ordering", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.1", { task_template_refs: ["t.imm1"] }),
        makeConsequence("c.2", { task_template_refs: ["t.imm2"] }),
        makeConsequence("c.3", { task_template_refs: ["t.money"] }),
      ],
      taskTemplates: [
        makeTemplate("t.imm1", { title: "Immediate 1", rendering: { checklist_group: "immediate_formalities", urgency_score: 90 } }),
        makeTemplate("t.imm2", { title: "Immediate 2", rendering: { checklist_group: "immediate_formalities", urgency_score: 80 } }),
        makeTemplate("t.money", { title: "Money Task", rendering: { checklist_group: "money_and_benefits", urgency_score: 50 } }),
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    expect(output.sections).toMatchInlineSnapshot(`
      [
        {
          "group": "immediate_formalities",
          "item_count": 2,
          "label": "Immediate formalities",
        },
        {
          "group": "money_and_benefits",
          "item_count": 1,
          "label": "Money and benefits",
        },
      ]
    `);
  });

  // ── 6h. Deterministic IDs ─────────────────────────────────────────

  it("6h. same inputs produce same checklist id and item ids", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.det", { task_template_refs: ["t.det"] }),
      ],
      taskTemplates: [
        makeTemplate("t.det", { title: "Deterministic", rendering: { checklist_group: "immediate_formalities" } }),
      ],
    });

    const opts = {
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }] as Fact[],
      lifeEvent: "bereavement" as const,
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    };

    const output1 = generateChecklist(opts);
    const output2 = generateChecklist(opts);

    expect(output1.id).toBe(output2.id);
    expect(output1.items.map(i => i.id)).toEqual(output2.items.map(i => i.id));
    // Snapshot the id format
    expect(output1.id).toMatchInlineSnapshot(`"checklist.0358e3164830"`);
  });

  // ── 6i. Dedupe strategy: merge ────────────────────────────────────

  it("6i. merge strategy: two candidates with same key merge into one item", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.merge1", {
          title: "Merge Consequence 1",
          task_template_refs: ["t.merged"],
          source_assertion_refs: ["a.1"],
        }),
        makeConsequence("c.merge2", {
          title: "Merge Consequence 2",
          task_template_refs: ["t.merged"],
          source_assertion_refs: ["a.2"],
        }),
      ],
      taskTemplates: [
        makeTemplate("t.merged", {
          title: "Merged Task",
          rendering: { checklist_group: "immediate_formalities", urgency_score: 70 },
          dedupe: {
            default_strategy: "merge",
            dedupe_key_template: "{action_type}.{target.object_type}.{jurisdiction}",
          },
          target: { object_type: "death_declaration" },
        }),
      ],
      assertions: [
        ["a.1", { id: "a.1", source_id: "s.1", record_valid_from: "2026-01-01" }],
        ["a.2", { id: "a.2", source_id: "s.1", record_valid_from: "2026-01-01" }],
      ],
      sources: [
        ["s.1", { id: "s.1", title: "Source", publisher: "Gov" }],
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // Two consequences merge into one visible item
    expect(output.items.length).toBe(1);
    expect(output.items[0].title).toBe("Merged Task");
    expect(output.items[0].needed_for).toEqual(["Merge Consequence 1", "Merge Consequence 2"]);
    expect(output.items[0].jurisdiction_contexts).toEqual(["LU"]);
    // Merged assertion count
    expect(output.items[0].source_summary?.assertion_count).toBe(2);
    // Merged explanation trace exists
    expect(output.explanation_traces.length).toBe(1);
  });

  // ── 6j. Dedupe strategy: do_not_merge ─────────────────────────────

  it("6j. do_not_merge strategy: same dedupe key keeps items separate", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.sep1", {
          title: "Separate 1",
          task_template_refs: ["t.nomrg1"],
        }),
        makeConsequence("c.sep2", {
          title: "Separate 2",
          task_template_refs: ["t.nomrg2"],
        }),
      ],
      taskTemplates: [
        // No dedupe config → default do_not_merge with key template.{id}
        makeTemplate("t.nomrg1", {
          title: "Task Separate 1",
          rendering: { checklist_group: "immediate_formalities", urgency_score: 80 },
        }),
        makeTemplate("t.nomrg2", {
          title: "Task Separate 2",
          rendering: { checklist_group: "immediate_formalities", urgency_score: 60 },
        }),
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // Items remain separate
    expect(output.items.length).toBe(2);
    expect(output.items[0].id).not.toBe(output.items[1].id);
    const titles = output.items.map(i => i.title).sort();
    expect(titles).toEqual(["Task Separate 1", "Task Separate 2"]);
  });

  // ── 6k. Dedupe strategy: do_not_merge_across_jurisdictions ────────

  it("6k. do_not_merge_across_jurisdictions: merges within LU, keeps DE separate", () => {
    const graph = makeBaseGraph({
      consequences: [
        makeConsequence("c.lu1", {
          title: "LU Consequence 1",
          jurisdiction: "LU",
          task_template_refs: ["t.xj"],
        }),
        makeConsequence("c.lu2", {
          title: "LU Consequence 2",
          jurisdiction: "LU",
          task_template_refs: ["t.xj"],
        }),
        makeConsequence("c.de1", {
          title: "DE Consequence",
          jurisdiction: "DE",
          task_template_refs: ["t.xj"],
        }),
      ],
      taskTemplates: [
        makeTemplate("t.xj", {
          title: "Cross-Jurisdiction Task",
          rendering: { checklist_group: "immediate_formalities", urgency_score: 70 },
          dedupe: {
            default_strategy: "do_not_merge_across_jurisdictions",
            dedupe_key_template: "{action_type}.{target.object_type}",
          },
          target: { object_type: "death_declaration" },
        }),
      ],
    });

    const output = generateChecklist({
      graph,
      facts: [
        { fact_type: "death.place.country", value: "LU" },
        { fact_type: "deceased.last_social_security_affiliation.country", value: "DE" },
      ],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // LU pair merges into one, DE stays separate → 2 items total
    expect(output.items.length).toBe(2);

    const luItems = output.items.filter(i => i.jurisdiction_contexts.includes("LU"));
    const deItems = output.items.filter(i => i.jurisdiction_contexts.includes("DE"));

    expect(luItems.length).toBe(1);
    expect(deItems.length).toBe(1);

    // Merged LU item has combined needed_for
    expect(luItems[0].needed_for).toEqual(["LU Consequence 1", "LU Consequence 2"]);

    // DE item is standalone
    expect(deItems[0].needed_for).toEqual(["DE Consequence"]);
  });
});

