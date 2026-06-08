import { describe, it, expect, vi } from "vitest";
import { printChecklist, parseArgs } from "./build-checklist.js";
import type { ChecklistOutput } from "@clarvia/generator";
import { resolve } from "node:path";

const FIXTURES_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures");

describe("build-checklist: parseArgs", () => {
  it("defaults to bereavement with no args", () => {
    const result = parseArgs([], FIXTURES_DIR);
    expect(result.lifeEvent).toBe("bereavement");
    expect(result.facts).toEqual([]);
  });

  it("parses --life-event and --fact flags", () => {
    const result = parseArgs(
      ["--life-event", "retirement", "--fact", "age=65", "--fact", "country=LU"],
      FIXTURES_DIR,
    );
    expect(result.lifeEvent).toBe("retirement");
    expect(result.facts).toEqual([
      { fact_type: "age", value: "65" },
      { fact_type: "country", value: "LU" },
    ]);
  });
});

describe("build-checklist: printChecklist", () => {
  it("prints empty message when no items", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const output: ChecklistOutput = {
      items: [],
      sections: [],
      summary: {
        item_counts: { applies: 0, needs_fact: 0, maybe_applies: 0 },
        source_count: 0,
      },
    } as unknown as ChecklistOutput;

    printChecklist(output, "bereavement");

    const allOutput = spy.mock.calls.map(c => c[0]).join("\n");
    expect(allOutput).toContain("CHECKLIST: bereavement");
    expect(allOutput).toContain("No items match the provided facts");
    spy.mockRestore();
  });

  it("prints items with status icons, authority, deadline, and why_maybe", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const output: ChecklistOutput = {
      items: [
        {
          title: "Register death",
          status: "applies",
          checklist_group: "admin",
          action: { authority_name: "Commune office" },
          urgency: { label: "Urgent", deadline_label: "Within 3 days" },
          why_maybe: undefined,
        },
        {
          title: "Optional task",
          status: "maybe_applies",
          checklist_group: "admin",
          action: {},
          urgency: {},
          why_maybe: "Depends on residency",
        },
        {
          title: "Unknown status task",
          status: "unknown_status",
          checklist_group: "finance",
          action: {},
          urgency: {},
        },
      ],
      sections: [
        { group: "admin", label: "Administrative", item_count: 2 },
        { group: "finance", label: "Financial", item_count: 1 },
      ],
      summary: {
        item_counts: { applies: 1, needs_fact: 0, maybe_applies: 1 },
        source_count: 3,
      },
    } as unknown as ChecklistOutput;

    printChecklist(output, "bereavement");

    const allOutput = spy.mock.calls.map(c => c[0]).join("\n");
    // Status icons
    expect(allOutput).toContain("✔ Register death [Urgent]");
    expect(allOutput).toContain("~ Optional task");
    expect(allOutput).toContain("✘ Unknown status task");
    // Authority
    expect(allOutput).toContain("→ Commune office");
    // Deadline
    expect(allOutput).toContain("⏰ Within 3 days");
    // Why maybe
    expect(allOutput).toContain("⚠ Depends on residency");
    // Summary
    expect(allOutput).toContain("1 applies");
    expect(allOutput).toContain("Sources referenced: 3");
    // Sections
    expect(allOutput).toContain("Administrative (2)");
    expect(allOutput).toContain("Financial (1)");

    spy.mockRestore();
  });
});
