/**
 * Generator-level tests for multi-person subject fan-out (issue #36).
 *
 * Verifies the pipeline end to end: keyed multi-person facts produce one
 * checklist item per subject with distinct, deterministic IDs; the subject
 * is always part of the dedupe key; single-subject output keeps the alpha
 * shape (plus the new subject_label field).
 */

import { describe, it, expect } from "vitest";
import { generateChecklist } from "./index.js";
import type { Fact } from "./evaluator.js";

const FIXED_AS_OF = "2026-06-03";

type MockGraph = Parameters<typeof generateChecklist>[0]["graph"];

function makeGraph(overrides: {
  consequences: Array<[string, Record<string, unknown>]>;
  taskTemplates: Array<[string, Record<string, unknown>]>;
}): MockGraph {
  return {
    consequences: new Map(overrides.consequences),
    taskTemplates: new Map(overrides.taskTemplates),
    conditions: new Map(),
    deadlines: new Map(),
    authorities: new Map(),
    evidenceTypes: new Map(),
    intakeFactTypes: new Map(),
    sources: new Map(),
    assertions: new Map(),
  } as unknown as MockGraph;
}

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
    rendering: { checklist_group: "money_and_benefits", urgency_score: 50 },
    ...extra,
  }] as [string, Record<string, unknown>];
}

const BASE_FACTS: Fact[] = [{ fact_type: "death.place.country", value: "LU" }];

const TWO_CHILDREN_FACTS: Fact[] = [
  ...BASE_FACTS,
  { fact_type: "child.1.date_of_birth", value: "2015-03-01" },
  { fact_type: "child.2.date_of_birth", value: "2019-11-14" },
];

describe("generator: multi-person subject fan-out", () => {
  const childGraph = () => makeGraph({
    consequences: [
      makeConsequence("c.orphan_pension", { task_template_refs: ["t.claim_orphan_pension"] }),
    ],
    taskTemplates: [
      makeTemplate("t.claim_orphan_pension", {
        title: "Claim orphan pension",
        target: { subject_role: "child" },
      }),
    ],
  });

  it("two children produce two items with distinct IDs and subjects", () => {
    const output = generateChecklist({
      graph: childGraph(),
      facts: TWO_CHILDREN_FACTS,
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    expect(output.items).toHaveLength(2);
    const [first, second] = [...output.items].sort((a, b) =>
      a.resolved_subject_id.localeCompare(b.resolved_subject_id));
    expect(first.resolved_subject_id).toBe("person.child");
    expect(second.resolved_subject_id).toBe("person.child.2");
    expect(first.subject_label).toBe("child");
    expect(second.subject_label).toBe("child 2");
    expect(first.id).not.toBe(second.id);
    // Both items share the template title; the subject fields disambiguate.
    expect(first.title).toBe(second.title);
    // Each item carries its own explanation trace.
    expect(output.explanation_traces).toHaveLength(2);
  });

  it("first child's item ID equals the single-child item ID for the same fact set", () => {
    // Same scenario facts, but only one child declared: the single item must
    // hash identically to the first item of the two-children run, because
    // index 1 keeps the bare legacy subject ID and the scenario hash prefix
    // is the only part allowed to differ... so compare the task-hash suffix.
    const two = generateChecklist({
      graph: childGraph(),
      facts: TWO_CHILDREN_FACTS,
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });
    const one = generateChecklist({
      graph: childGraph(),
      facts: [...BASE_FACTS, { fact_type: "child.1.date_of_birth", value: "2015-03-01" }],
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    const taskHash = (id: string) => id.split(".").at(-1);
    const firstOfTwo = two.items.find((i) => i.resolved_subject_id === "person.child")!;
    expect(one.items).toHaveLength(1);
    expect(taskHash(one.items[0].id)).toBe(taskHash(firstOfTwo.id));
  });

  it("without keyed facts the output keeps the alpha single-subject shape", () => {
    const output = generateChecklist({
      graph: childGraph(),
      facts: BASE_FACTS,
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });
    expect(output.items).toHaveLength(1);
    expect(output.items[0].resolved_subject_id).toBe("person.child");
    expect(output.items[0].subject_label).toBe("child");
  });

  it("determinism: repeated runs and reordered facts give identical IDs", () => {
    const a = generateChecklist({
      graph: childGraph(),
      facts: TWO_CHILDREN_FACTS,
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });
    const b = generateChecklist({
      graph: childGraph(),
      facts: [...TWO_CHILDREN_FACTS].reverse(),
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });
    expect(a.items.map((i) => i.id)).toEqual(b.items.map((i) => i.id));
  });
});

describe("generator: dedupe/merge never crosses subjects", () => {
  it("merge strategy produces one merged item per subject", () => {
    const graph = makeGraph({
      consequences: [
        makeConsequence("c.merge1", { title: "Merge One", task_template_refs: ["t.merged"] }),
        makeConsequence("c.merge2", { title: "Merge Two", task_template_refs: ["t.merged"] }),
      ],
      taskTemplates: [
        makeTemplate("t.merged", {
          title: "Merged child task",
          target: { object_type: "orphan_pension_application", subject_role: "child" },
          dedupe: {
            default_strategy: "merge",
            dedupe_key_template: "{action_type}.{target.object_type}.{jurisdiction}",
          },
        }),
      ],
    });

    const output = generateChecklist({
      graph,
      facts: TWO_CHILDREN_FACTS,
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    // Two consequences × two children → four candidates → two merged items,
    // one per child, each covering both consequences.
    expect(output.items).toHaveLength(2);
    const ids = output.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
    for (const item of output.items) {
      expect(item.needed_for).toEqual(["Merge One", "Merge Two"]);
    }
    const subjects = output.items.map((i) => i.resolved_subject_id).sort();
    expect(subjects).toEqual(["person.child", "person.child.2"]);
  });

  it("merged item ID for the first subject matches the pre-fan-out merged ID", () => {
    const consequences = [
      makeConsequence("c.merge1", { title: "Merge One", task_template_refs: ["t.merged"] }),
      makeConsequence("c.merge2", { title: "Merge Two", task_template_refs: ["t.merged"] }),
    ];
    const template = (role: string) => makeTemplate("t.merged", {
      title: "Merged task",
      target: { object_type: "death_declaration", subject_role: role },
      dedupe: {
        default_strategy: "merge",
        dedupe_key_template: "{action_type}.{target.object_type}.{jurisdiction}",
      },
    });

    // The merged identity for ordinal-1 subjects must not carry a subject
    // suffix, so single-subject merged IDs are unchanged from alpha. Compare
    // the merged task-hash across two different roles: identity depends only
    // on (consequence, template) pairs, exactly as before #36.
    const run = (role: string) => generateChecklist({
      graph: makeGraph({ consequences, taskTemplates: [template(role)] }),
      facts: BASE_FACTS,
      lifeEvent: "bereavement",
      asOfDate: FIXED_AS_OF,
      eventDate: FIXED_AS_OF,
    });

    const taskHash = (id: string) => id.split(".").at(-1);
    expect(run("survivor").items).toHaveLength(1);
    expect(taskHash(run("survivor").items[0].id)).toBe(taskHash(run("deceased").items[0].id));
  });
});
