/**
 * Characterization tests for the resolved subject model (issue #36, step 1).
 *
 * These tests pin the EXACT current subject resolution behavior before any
 * multi-person work starts. They isolate the two contracts that the item-ID
 * hash depends on:
 *
 *   1. The (item id, resolved_subject_id) table for every real scenario —
 *      tighter than the full golden snapshots, so an intentional change to
 *      unrelated output fields does not hide accidental hash drift.
 *   2. The subject_role → resolved_subject_id mapping for every role string
 *      actually used in the graph data, including the unmapped roles that
 *      currently fall through to the person.deceased bereavement fallback.
 *
 * Any diff here after the subject-model refactor means existing single-subject
 * item IDs changed — which issue #36 forbids unless intentionally migrated.
 */

import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { loadGraph, generateChecklist } from "./index.js";
import type { Fact } from "./evaluator.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..");
const FIXED_AS_OF = "2026-06-03";

function loadScenarioFacts(scenarioPath: string): Fact[] {
  const raw = readFileSync(resolve(ROOT_DIR, scenarioPath), "utf-8");
  const doc = parseYaml(raw) as { facts: Array<{ fact_type: string; value: unknown }> };
  return doc.facts.map((f) => ({ fact_type: f.fact_type, value: f.value }));
}

// ═══════════════════════════════════════════════════════════════════════
// Suite 1: (item id, resolved_subject_id) table per scenario
// ═══════════════════════════════════════════════════════════════════════

describe("characterization: item id / resolved_subject_id table per scenario", () => {
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
      // Sorted, minimal projection: only the fields the item-ID hash contract
      // depends on. Titles are included to keep the table human-readable.
      const table = output.items
        .map((i) => ({ id: i.id, resolved_subject_id: i.resolved_subject_id, title: i.title }))
        .sort((a, b) => a.id.localeCompare(b.id));
      expect(table).toMatchSnapshot();
    });
  }

  it("every emitted resolved_subject_id across all scenarios is in the alpha closed set", () => {
    const ALPHA_SUBJECT_IDS = new Set([
      "person.deceased",
      "person.survivor",
      "person.child",
      "person.dependant",
      "estate.primary",
    ]);
    const seen = new Set<string>();
    for (const scenario of scenarios) {
      const output = generateChecklist({
        graph,
        facts: loadScenarioFacts(scenario.path),
        lifeEvent: "bereavement",
        asOfDate: FIXED_AS_OF,
        eventDate: FIXED_AS_OF,
      });
      for (const item of output.items) {
        seen.add(item.resolved_subject_id);
        expect(ALPHA_SUBJECT_IDS.has(item.resolved_subject_id)).toBe(true);
      }
    }
    // The real scenarios currently only ever produce these two.
    expect([...seen].sort()).toMatchInlineSnapshot(`
      [
        "person.deceased",
      ]
    `);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Suite 2: subject_role → resolved_subject_id mapping for all roles in use
// ═══════════════════════════════════════════════════════════════════════

describe("characterization: subject_role → resolved_subject_id for every role in the graph", () => {
  const graph = loadGraph(ROOT_DIR);

  type MockGraph = Parameters<typeof generateChecklist>[0]["graph"];

  /** Minimal one-consequence/one-template graph carrying the given subject_role. */
  function makeRoleGraph(subjectRole: string | null): MockGraph {
    const template: Record<string, unknown> = {
      id: "t.role_probe",
      schema_version: "0.1.0",
      title: "Role probe task",
      action_type: "file_declaration",
      jurisdiction: "LU",
      life_event: "bereavement",
      domain: "death_registration",
      authoring_status: "approved",
      distribution_status: "public_open",
      record_valid_from: "2026-01-01",
      rendering: { checklist_group: "immediate_formalities", urgency_score: 50 },
    };
    if (subjectRole !== null) {
      template.target = { subject_role: subjectRole };
    }
    return {
      consequences: new Map([
        ["c.role_probe", {
          id: "c.role_probe",
          schema_version: "0.1.0",
          title: "Role probe consequence",
          consequence_type: "obligation",
          jurisdiction: "LU",
          life_event: "bereavement",
          domain: "death_registration",
          authoring_status: "approved",
          distribution_status: "public_open",
          record_valid_from: "2026-01-01",
          task_template_refs: ["t.role_probe"],
        }],
      ]),
      taskTemplates: new Map([["t.role_probe", template]]),
      conditions: new Map(),
      deadlines: new Map(),
      authorities: new Map(),
      evidenceTypes: new Map(),
      intakeFactTypes: new Map(),
      sources: new Map(),
      assertions: new Map(),
    } as unknown as MockGraph;
  }

  /** Resolve a role's subject id through the real generator pipeline. */
  function resolveThroughGenerator(subjectRole: string | null): string {
    const output = generateChecklist({
      graph: makeRoleGraph(subjectRole),
      facts: [{ fact_type: "death.place.country", value: "LU" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });
    expect(output.items).toHaveLength(1);
    return output.items[0].resolved_subject_id;
  }

  it("pins the mapping for every subject_role used in graph task templates", () => {
    const rolesInUse = new Set<string>();
    for (const template of graph.taskTemplates.values()) {
      const role = (template as { target?: { subject_role?: string | null } }).target?.subject_role;
      if (role) rolesInUse.add(role);
    }
    // Guard: the graph actually exercises roles beyond the mapped ones.
    expect(rolesInUse.size).toBeGreaterThan(0);

    const mapping: Record<string, string> = {};
    for (const role of [...rolesInUse].sort()) {
      mapping[role] = resolveThroughGenerator(role);
    }
    expect(mapping).toMatchSnapshot();
  });

  it("mapped roles resolve per the alpha SUBJECT_ROLE_MAP", () => {
    expect(resolveThroughGenerator("deceased")).toBe("person.deceased");
    expect(resolveThroughGenerator("survivor")).toBe("person.survivor");
    expect(resolveThroughGenerator("surviving_spouse")).toBe("person.survivor");
    expect(resolveThroughGenerator("surviving_partner")).toBe("person.survivor");
    expect(resolveThroughGenerator("child")).toBe("person.child");
    expect(resolveThroughGenerator("dependant")).toBe("person.dependant");
    expect(resolveThroughGenerator("estate")).toBe("estate.primary");
  });

  it("unmapped roles and missing targets fall back to person.deceased", () => {
    // Roles used in graph/task_templates/bereavement/lu that have no
    // SUBJECT_ROLE_MAP entry today — they all hash as person.deceased.
    // Changing any of these mappings is an item-ID break (see issue #36).
    for (const role of [
      "heir",
      "declarant",
      "heir_or_legatee",
      "heir_or_tax_representative",
      "heir_or_business_successor",
      "heir_or_surviving_spouse",
      "survivor_or_heir",
      "person_who_advanced_funeral_costs",
      "some_future_role_that_does_not_exist",
    ]) {
      expect(resolveThroughGenerator(role)).toBe("person.deceased");
    }
    // No target at all → same fallback.
    expect(resolveThroughGenerator(null)).toBe("person.deceased");
  });
});
