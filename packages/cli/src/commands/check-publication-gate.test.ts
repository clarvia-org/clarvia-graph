import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runCheckPublicationGate } from "./check-publication-gate.js";

/**
 * Characterization tests for `clarvia check-publication-gate`.
 *
 * These pin the current behavior of the publication gate checker against
 * the real graph data so that refactoring cannot silently change results.
 */

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("runCheckPublicationGate — characterization", () => {
  it("returns a result with violations array", async () => {
    const result = await runCheckPublicationGate({ rootDir: ROOT_DIR });

    expect(result).toHaveProperty("violations");
    expect(Array.isArray(result.violations)).toBe(true);
  });

  it("pins the violation count", async () => {
    const { violations } = await runCheckPublicationGate({
      rootDir: ROOT_DIR,
    });

    expect(violations.length).toMatchInlineSnapshot(`0`);
  });

  it("pins violation record IDs, rules, and files if violations exist", async () => {
    const { violations } = await runCheckPublicationGate({
      rootDir: ROOT_DIR,
    });

    const summary = violations.map((v) => ({
      recordId: v.recordId,
      rule: v.rule,
      file: v.file,
    }));

    expect(summary).toMatchSnapshot();
  });

  it("snapshots the full violations array for determinism", async () => {
    const { violations } = await runCheckPublicationGate({
      rootDir: ROOT_DIR,
    });

    expect(violations).toMatchSnapshot();
  });

  it("every violation has all required fields", async () => {
    const { violations } = await runCheckPublicationGate({
      rootDir: ROOT_DIR,
    });

    for (const v of violations) {
      expect(typeof v.recordId).toBe("string");
      expect(typeof v.file).toBe("string");
      expect(typeof v.rule).toBe("string");
      expect(typeof v.detail).toBe("string");
    }
  });
});
