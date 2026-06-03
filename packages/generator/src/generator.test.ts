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

  it("returns does_not_apply when condition is false (death in DE, not LU)", () => {
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

    // Both conditions are false → items filtered out (does_not_apply)
    expect(output.items.length).toBe(0);
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

    expect(output.id).toMatch(/^checklist_run\./);
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
    expect(output1.id).toMatch(/^checklist_run\.20260603\./);

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
});
