/**
 * Characterization tests for test-scenarios.ts.
 *
 * These pin the EXACT current behavior of runTestScenarios against the
 * real graph. They must pass BEFORE refactoring and remain unchanged AFTER.
 */

import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runTestScenarios, findRelevantItems } from "./test-scenarios.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("runTestScenarios characterization", () => {
  it("pins scenario result count and pass/fail status", async () => {
    const { results, failed } = await runTestScenarios({ rootDir: ROOT_DIR });

    // Pin the overall counts
    expect(results.length).toBeGreaterThan(0);
    expect(failed).toMatchInlineSnapshot(`0`);

    // Pin each result's structure: id, file, title, pass/fail, failures
    const pinned = results.map((r) => ({
      id: r.id,
      file: r.file,
      title: r.title,
      passed: r.passed,
      failures: r.failures,
    }));
    expect(pinned).toMatchSnapshot();
  });

  it("pins scenario count", async () => {
    const { results } = await runTestScenarios({ rootDir: ROOT_DIR });

    // All current scenarios should pass
    const allPassed = results.every((r) => r.passed);
    expect(allPassed).toBe(true);
  });

  it("pins consequence status checks for core_bereavement", async () => {
    const { results } = await runTestScenarios({ rootDir: ROOT_DIR });

    const core = results.find((r) => r.id.includes("core_bereavement"));
    expect(core).toBeDefined();
    expect(core!.passed).toBe(true);
    expect(core!.failures).toEqual([]);
  });

  it("pins checklist group checks for scenarios with expected_checklist_groups", async () => {
    const { results } = await runTestScenarios({ rootDir: ROOT_DIR });

    // Find scenarios that have checklist group expectations (if any fail, pin the failures)
    const withGroups = results.filter((r) =>
      r.failures.some((f) => f.check.startsWith("checklist_group:")),
    );
    // Pin: currently no checklist group failures
    expect(withGroups.length).toMatchInlineSnapshot(`0`);
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
describe("findRelevantItems", () => {
  it("matches item by needed_for", () => {
    const consequence = {
      title: "My Consequence",
    } as any;
    const output = {
      items: [
        { needed_for: ["My Consequence"], id: "task-1" },
        { needed_for: ["Other"], id: "task-2" },
      ],
    } as any;
    const result = findRelevantItems(consequence, output);
    expect(result).toEqual([{ needed_for: ["My Consequence"], id: "task-1" }]);
  });

  it("matches item by task_template_refs when needed_for doesn't match", () => {
    const consequence = {
      title: "My Consequence",
      task_template_refs: ["prefix.task-2"],
    } as any;
    const output = {
      items: [
        { needed_for: ["Other"], id: "task-1" },
        { needed_for: ["Other"], id: "task-2" },
      ],
    } as any;
    const result = findRelevantItems(consequence, output);
    expect(result).toEqual([{ needed_for: ["Other"], id: "task-2" }]);
  });

  it("handles empty/missing task_template_refs", () => {
    const consequence = {
      title: "My Consequence",
      task_template_refs: undefined,
    } as any;
    const output = {
      items: [
        { needed_for: ["Other"], id: "task-1" },
      ],
    } as any;
    const result = findRelevantItems(consequence, output);
    expect(result).toEqual([]);
  });
});
