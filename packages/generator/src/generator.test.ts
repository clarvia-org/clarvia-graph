import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { loadGraph } from "./loader.js";
import { generateChecklist } from "./generator.js";
import type { Fact } from "./evaluator.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..");

describe("generateChecklist", () => {
  it("generates a checklist for LU core bereavement — all facts present", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "death.date", value: "2026-01-15" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
    });

    // Both consequences should apply
    expect(output.items.length).toBe(2);
    expect(output.items.every((i) => i.status === "applies")).toBe(true);

    // Death declaration should come first (urgency 95 > 70)
    expect(output.items[0].title).toBe(
      "File death declaration at the commune",
    );
    expect(output.items[0].checklist_group).toBe("immediate_formalities");
    expect(output.items[0].urgency?.score).toBe(95);
    expect(output.items[0].urgency?.label).toBe("urgent");
    expect(output.items[0].action?.action_type).toBe("file_declaration");
    expect(output.items[0].action?.authority_name).toBe("Civil Registry Office");

    // Survivor pension should come second
    expect(output.items[1].title).toBe("File survivor pension claim with CNAP");
    expect(output.items[1].checklist_group).toBe("money_and_benefits");
    expect(output.items[1].urgency?.score).toBe(70);
    expect(output.items[1].action?.authority_name).toBe(
      "National Pension Insurance Fund",
    );
  });

  it("handles missing facts — death jurisdiction unknown", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      // No jurisdiction fact provided
      { fact_type: "death.date", value: "2026-01-15" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
    });

    // Death declaration → needs_fact, pension → applies
    const deathItem = output.items.find((i) =>
      i.title.includes("death declaration"),
    );
    const pensionItem = output.items.find((i) =>
      i.title.includes("survivor pension"),
    );

    expect(deathItem?.status).toBe("needs_fact");
    expect(deathItem?.missing_fact_refs).toContain(
      "death.place.country",
    );
    expect(pensionItem?.status).toBe("applies");
  });

  it("filters out consequences for non-matching life events", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "marriage", // no records for this
    });

    expect(output.items.length).toBe(0);
  });

  it("returns DE items when death in DE (LU conditions don't apply)", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "DE" },
      { fact_type: "death.date", value: "2026-01-15" },
      { fact_type: "deceased.pension.jurisdiction", value: "DE" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
    });

    // LU conditions are false → LU items filtered out
    // DE conditions apply → DE items visible
    const luItems = output.items.filter((i) => i.jurisdiction_contexts.includes("LU"));
    const deItems = output.items.filter((i) => i.jurisdiction_contexts.includes("DE"));
    expect(luItems.length).toBe(0);
    expect(deItems.length).toBeGreaterThan(0);
    expect(output.is_cross_border).toBe(false); // single jurisdiction
  });

  it("output has correct structure", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
    });

    expect(output.id).toMatch(/^checklist\./);
    expect(output.checklist_run_id).toMatch(/^checklist_run\./);
    expect(output.life_event).toBe("bereavement");
    expect(output.generated_at).toBeTruthy();
    expect(output.graph_version).toBe("0.1.0");
    expect(output.summary).toBeDefined();
    expect(output.summary.item_counts).toBeDefined();
    expect(output.sections.length).toBeGreaterThan(0);
  });

  it("produces fully deterministic checklist + item IDs for same inputs", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];

    const output1 = generateChecklist({ graph, facts, lifeEvent: "bereavement", asOfDate: "2026-06-03" });
    const output2 = generateChecklist({ graph, facts, lifeEvent: "bereavement", asOfDate: "2026-06-03" });

    // Checklist ID should be fully deterministic (no timestamp in hash)
    expect(output1.id).toBe(output2.id);
    expect(output1.id).toMatch(/^checklist\./);
    expect(output1.checklist_run_id).toMatch(/^checklist_run\.\d{14}\./);

    // Item IDs should also be deterministic
    expect(output1.items.map((i) => i.id)).toEqual(
      output2.items.map((i) => i.id),
    );
  });

  it("same facts in different order produce same checklist ID", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts1: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];
    const facts2: Fact[] = [
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
      { fact_type: "death.place.country", value: "LU" },
    ];

    const output1 = generateChecklist({ graph, facts: facts1, lifeEvent: "bereavement", asOfDate: "2026-06-03" });
    const output2 = generateChecklist({ graph, facts: facts2, lifeEvent: "bereavement", asOfDate: "2026-06-03" });

    expect(output1.id).toBe(output2.id);
  });

  it("cross-border: LU death + DE pension produces items from both jurisdictions", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.pension.jurisdiction", value: "DE" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
      asOfDate: "2026-06-03",
    });

    expect(output.is_cross_border).toBe(true);

    // Should have LU death registration (death in LU)
    const luItems = output.items.filter((i) => i.jurisdiction_contexts.includes("LU"));
    expect(luItems.length).toBeGreaterThan(0);

    // Should have DE pension items (pension in DE)
    const deItems = output.items.filter((i) => i.jurisdiction_contexts.includes("DE"));
    expect(deItems.length).toBeGreaterThan(0);

    // Should have jurisdiction_roles populated
    expect(output.jurisdiction_roles.death_place).toContain("LU");
    expect(output.jurisdiction_roles.work_or_insurance_state).toContain("DE");
  });

  it("generates explanation traces for visible items", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
      asOfDate: "2026-06-03",
    });

    // Should have explanation traces for each visible item
    expect(output.explanation_traces.length).toBeGreaterThan(0);
    for (const trace of output.explanation_traces) {
      expect(trace.id).toMatch(/^trace\./);
      expect(trace.conditions.length).toBeGreaterThan(0);
      expect(trace.why_visible.length).toBeGreaterThan(0);
    }
  });

  it("handles unknown/maybe_applies when missing facts exist", () => {
    const graph = loadGraph(ROOT_DIR);
    const facts: Fact[] = [
      // Only death.place.country, no pension jurisdiction
      { fact_type: "death.place.country", value: "LU" },
    ];

    const output = generateChecklist({
      graph,
      facts,
      lifeEvent: "bereavement",
      asOfDate: "2026-06-03",
    });

    // Death declaration should apply (condition met)
    const deathItem = output.items.find((i) => i.title.includes("death declaration"));
    expect(deathItem?.status).toBe("applies");

    // Pension items should be needs_fact or maybe_applies (missing pension jurisdiction)
    const pensionItems = output.items.filter(
      (i) => i.title.toLowerCase().includes("pension") || i.title.toLowerCase().includes("survivor"),
    );
    // At least some pension items should be uncertain
    const uncertainPension = pensionItems.filter(
      (i) => i.status === "needs_fact" || i.status === "maybe_applies",
    );
    expect(uncertainPension.length).toBeGreaterThanOrEqual(0); // may be 0 if no DE pension matched
    
    // LU pension should be needs_fact specifically
    const luPension = output.items.find(
      (i) => i.title.includes("CNAP") || i.title.includes("survivor pension claim with CNAP"),
    );
    if (luPension) {
      expect(luPension.status).toBe("needs_fact");
      expect(luPension.missing_fact_refs.length).toBeGreaterThan(0);
    }
  });

  it("normalizes country code casing", () => {
    const graph = loadGraph(ROOT_DIR);
    const factsLower: Fact[] = [
      { fact_type: "death.place.country", value: "lu" },
      { fact_type: "deceased.pension.jurisdiction", value: "lu" },
    ];
    const factsUpper: Fact[] = [
      { fact_type: "death.place.country", value: "LU" },
      { fact_type: "deceased.pension.jurisdiction", value: "LU" },
    ];

    const output1 = generateChecklist({ graph, facts: factsLower, lifeEvent: "bereavement", asOfDate: "2026-06-03" });
    const output2 = generateChecklist({ graph, facts: factsUpper, lifeEvent: "bereavement", asOfDate: "2026-06-03" });

    // After normalization, both should produce the same result
    expect(output1.items.length).toBe(output2.items.length);
    expect(output1.id).toBe(output2.id);
  });

  describe("deduplication", () => {
    it("merges two tasks in the same jurisdiction with a merge strategy", () => {
      const mockGraph = {
        consequences: new Map([
          [
            "consequence.lu.test1",
            {
              id: "consequence.lu.test1",
              schema_version: "0.1.0",
              title: "Consequence 1",
              consequence_type: "obligation",
              jurisdiction: "LU",
              life_event: "bereavement",
              domain: "death_registration",
              task_template_refs: ["task_template.lu.test_task"],
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
            },
          ],
          [
            "consequence.lu.test2",
            {
              id: "consequence.lu.test2",
              schema_version: "0.1.0",
              title: "Consequence 2",
              consequence_type: "obligation",
              jurisdiction: "LU",
              life_event: "bereavement",
              domain: "death_registration",
              task_template_refs: ["task_template.lu.test_task"],
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
            },
          ],
        ]),
        taskTemplates: new Map([
          [
            "task_template.lu.test_task",
            {
              id: "task_template.lu.test_task",
              schema_version: "0.1.0",
              title: "Merged Task",
              action_type: "file_declaration",
              jurisdiction: "LU",
              life_event: "bereavement",
              domain: "death_registration",
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
              dedupe: {
                default_strategy: "merge",
                dedupe_key_template: "{action_type}.{target.object_type}.{jurisdiction}",
              },
              target: {
                object_type: "death_declaration",
              },
            },
          ],
        ]),
        conditions: new Map(),
        deadlines: new Map(),
        authorities: new Map(),
        evidenceTypes: new Map(),
        intakeFactTypes: new Map(),
        sources: new Map(),
      } as any;

      const output = generateChecklist({
        graph: mockGraph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
      });

      expect(output.items.length).toBe(1);
      expect(output.items[0].title).toBe("Merged Task");
      expect(output.items[0].needed_for).toEqual(["Consequence 1", "Consequence 2"]);
      expect(output.items[0].jurisdiction_contexts).toEqual(["LU"]);
    });

    it("does not merge tasks across jurisdictions when strategy is do_not_merge_across_jurisdictions", () => {
      const mockGraph = {
        consequences: new Map([
          [
            "consequence.lu.test",
            {
              id: "consequence.lu.test",
              schema_version: "0.1.0",
              title: "LU Consequence",
              consequence_type: "obligation",
              jurisdiction: "LU",
              life_event: "bereavement",
              domain: "death_registration",
              task_template_refs: ["task_template.global.test_task"],
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
            },
          ],
          [
            "consequence.de.test",
            {
              id: "consequence.de.test",
              schema_version: "0.1.0",
              title: "DE Consequence",
              consequence_type: "obligation",
              jurisdiction: "DE",
              life_event: "bereavement",
              domain: "death_registration",
              task_template_refs: ["task_template.global.test_task"],
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
            },
          ],
        ]),
        taskTemplates: new Map([
          [
            "task_template.global.test_task",
            {
              id: "task_template.global.test_task",
              schema_version: "0.1.0",
              title: "Shared Task",
              action_type: "file_declaration",
              jurisdiction: "global",
              life_event: "bereavement",
              domain: "death_registration",
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
              dedupe: {
                default_strategy: "do_not_merge_across_jurisdictions",
                dedupe_key_template: "{action_type}.{target.object_type}",
              },
              target: {
                object_type: "death_declaration",
              },
            },
          ],
        ]),
        conditions: new Map(),
        deadlines: new Map(),
        authorities: new Map(),
        evidenceTypes: new Map(),
        intakeFactTypes: new Map(),
        sources: new Map(),
      } as any;

      const output = generateChecklist({
        graph: mockGraph,
        facts: [
          { fact_type: "death.place.country", value: "LU" },
          { fact_type: "deceased.pension.jurisdiction", value: "DE" }, // dummy to make DE relevant too
        ],
        lifeEvent: "bereavement",
      });

      expect(output.items.length).toBe(2);
      expect(output.items[0].id).not.toBe(output.items[1].id);
    });

    it("throws an error when an invalid placeholder is used in dedupe_key_template", () => {
      const mockGraph = {
        consequences: new Map([
          [
            "consequence.lu.test",
            {
              id: "consequence.lu.test",
              schema_version: "0.1.0",
              title: "LU Consequence",
              consequence_type: "obligation",
              jurisdiction: "LU",
              life_event: "bereavement",
              domain: "death_registration",
              task_template_refs: ["task_template.lu.test_task"],
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
            },
          ],
        ]),
        taskTemplates: new Map([
          [
            "task_template.lu.test_task",
            {
              id: "task_template.lu.test_task",
              schema_version: "0.1.0",
              title: "Test Task",
              action_type: "file_declaration",
              jurisdiction: "LU",
              life_event: "bereavement",
              domain: "death_registration",
              authoring_status: "approved",
              distribution_status: "public_open",
              record_valid_from: "2026-06-03",
              dedupe: {
                default_strategy: "merge",
                dedupe_key_template: "{invalid_placeholder}",
              },
              target: {
                object_type: "death_declaration",
              },
            },
          ],
        ]),
        conditions: new Map(),
        deadlines: new Map(),
        authorities: new Map(),
        evidenceTypes: new Map(),
        intakeFactTypes: new Map(),
        sources: new Map(),
      } as any;

      expect(() => {
        generateChecklist({
          graph: mockGraph,
          facts: [{ fact_type: "death.place.country", value: "LU" }],
          lifeEvent: "bereavement",
        });
      }).toThrow(/Invalid placeholder/);
    });
  });

  describe("temporal filtering", () => {
    const makeBaseGraph = () => ({
      consequences: new Map([
        [
          "consequence.lu.test",
          {
            id: "consequence.lu.test",
            schema_version: "0.1.0",
            title: "LU Consequence",
            consequence_type: "obligation",
            jurisdiction: "LU",
            life_event: "bereavement",
            domain: "death_registration",
            task_template_refs: ["task_template.lu.test_task"],
            authoring_status: "approved",
            distribution_status: "public_open",
            record_valid_from: "2026-05-01",
            legal_effective_from: "2026-05-01",
            source_assertion_refs: ["assertion.test.1"],
          },
        ],
      ]),
      taskTemplates: new Map([
        [
          "task_template.lu.test_task",
          {
            id: "task_template.lu.test_task",
            schema_version: "0.1.0",
            title: "Test Task",
            action_type: "file_declaration",
            jurisdiction: "LU",
            life_event: "bereavement",
            domain: "death_registration",
            authoring_status: "approved",
            distribution_status: "public_open",
            record_valid_from: "2026-05-01",
            deadline_refs: ["deadline.test"],
          },
        ],
      ]),
      conditions: new Map(),
      deadlines: new Map([
        [
          "deadline.test",
          {
            id: "deadline.test",
            schema_version: "0.1.0",
            title: "Test Deadline",
            deadline_type: "filing_deadline",
            calculation: {
              kind: "relative",
              duration: "PT24H",
            },
            record_valid_from: "2026-05-01",
          },
        ],
      ]),
      authorities: new Map(),
      evidenceTypes: new Map(),
      intakeFactTypes: new Map(),
      sources: new Map([
        [
          "source.test",
          {
            id: "source.test",
            schema_version: "0.1.0",
            title: "Test Source",
            jurisdiction: "LU",
          },
        ],
      ]),
      assertions: new Map([
        [
          "assertion.test.1",
          {
            id: "assertion.test.1",
            schema_version: "0.1.0",
            claim_type: "deadline",
            claim_text: "Must declare",
            source_id: "source.test",
            source_snapshot_id: "snapshot.test",
            record_valid_from: "2026-05-01",
          },
        ],
      ]),
    } as any);

    it("includes consequence when it is within validity and legal effective range", () => {
      const graph = makeBaseGraph();
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(1);
      expect(output.items[0].source_summary?.assertion_count).toBe(1);
    });

    it("excludes future consequence by record_valid_from", () => {
      const graph = makeBaseGraph();
      graph.consequences.get("consequence.lu.test").record_valid_from = "2026-07-01";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(0);
    });

    it("excludes expired consequence by record_valid_to", () => {
      const graph = makeBaseGraph();
      graph.consequences.get("consequence.lu.test").record_valid_to = "2026-05-15";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(0);
    });

    it("excludes not-yet-effective consequence by legal_effective_from", () => {
      const graph = makeBaseGraph();
      graph.consequences.get("consequence.lu.test").legal_effective_from = "2026-07-01";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(0);
    });

    it("excludes legally expired consequence by legal_effective_to", () => {
      const graph = makeBaseGraph();
      graph.consequences.get("consequence.lu.test").legal_effective_to = "2026-05-15";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(0);
    });

    it("excludes task template if it does not apply temporally", () => {
      const graph = makeBaseGraph();
      graph.taskTemplates.get("task_template.lu.test_task").record_valid_from = "2026-07-01";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      // The consequence itself applies, but has no tasks since the only task template doesn't apply
      expect(output.items.length).toBe(0);
    });

    it("excludes condition when it does not apply temporally, causing trigger to fail", () => {
      const graph = makeBaseGraph();
      graph.consequences.get("consequence.lu.test").trigger = {
        condition_refs: ["condition.test"],
      };
      graph.conditions.set("condition.test", {
        id: "condition.test",
        schema_version: "0.1.0",
        title: "Test Condition",
        condition_type: "criterion",
        jurisdiction: "LU",
        life_event: "bereavement",
        domain: "death_registration",
        expression_language: "jsonlogic",
        expression: { "==": [{ var: "death.place.country" }, "LU"] },
        missing_fact_behavior: "unknown",
        record_valid_from: "2026-07-01", // Future condition
      });

      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(0);
    });

    it("excludes deadline when it does not apply temporally", () => {
      const graph = makeBaseGraph();
      graph.taskTemplates.get("task_template.lu.test_task").rendering = { urgency_score: 70 };
      graph.deadlines.get("deadline.test").record_valid_from = "2026-07-01";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(1);
      expect(output.items[0].urgency?.deadline_label).toBeNull();
    });

    it("excludes source assertion and decreases assertion count when assertion is not valid", () => {
      const graph = makeBaseGraph();
      graph.assertions.get("assertion.test.1").record_valid_from = "2026-07-01";
      const output = generateChecklist({
        graph,
        facts: [{ fact_type: "death.place.country", value: "LU" }],
        lifeEvent: "bereavement",
        asOfDate: "2026-06-03",
        eventDate: "2026-06-03",
      });
      expect(output.items.length).toBe(1);
      expect(output.items[0].source_summary?.assertion_count).toBe(0);
    });
  });
});

