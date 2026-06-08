import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runCheckContradictions } from "./check-contradictions.js";

/**
 * Characterization tests for `clarvia check-contradictions`.
 *
 * These pin the current behavior of the contradiction checker against
 * the real graph data so that refactoring cannot silently change results.
 */

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("runCheckContradictions — characterization", () => {
  it("returns a result with contradictions array and reportPath", async () => {
    const result = await runCheckContradictions({ rootDir: ROOT_DIR });

    expect(result).toHaveProperty("contradictions");
    expect(result).toHaveProperty("reportPath");
    expect(Array.isArray(result.contradictions)).toBe(true);
    expect(typeof result.reportPath).toBe("string");
  });

  it("pins the contradiction count", async () => {
    const { contradictions } = await runCheckContradictions({
      rootDir: ROOT_DIR,
    });

    expect(contradictions.length).toMatchInlineSnapshot(`0`);
  });

  it("pins the reportPath segments", async () => {
    const { reportPath } = await runCheckContradictions({ rootDir: ROOT_DIR });

    expect(reportPath).toContain("build");
    expect(reportPath).toContain("reports");
    expect(reportPath).toContain("contradictions.yml");
  });

  it("pins scope keys, claim types, and resolved status if contradictions exist", async () => {
    const { contradictions } = await runCheckContradictions({
      rootDir: ROOT_DIR,
    });

    const summary = contradictions.map((c) => ({
      scope_key: c.scope_key,
      claim_type: c.claim_type,
      resolved: c.resolved,
    }));

    expect(summary).toMatchSnapshot();
  });

  it("every contradiction has type direct_value_conflict", async () => {
    const { contradictions } = await runCheckContradictions({
      rootDir: ROOT_DIR,
    });

    for (const c of contradictions) {
      expect(c.type).toBe("direct_value_conflict");
    }
  });

  it("every contradiction has at least two assertions", async () => {
    const { contradictions } = await runCheckContradictions({
      rootDir: ROOT_DIR,
    });

    for (const c of contradictions) {
      expect(c.assertions.length).toBeGreaterThanOrEqual(2);
    }
  });
});
