import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runValidate } from "./validate.js";

/**
 * Tests for the `clarvia validate` command.
 *
 * These use self-contained fixtures under packages/cli/tests/ so they
 * run independently of whether the real schemas have been created yet.
 */

const FIXTURES_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures");
const EMPTY_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures-empty");

describe("validate command", () => {
  it("returns ok=true and empty results when no YAML data files exist", async () => {
    const { results, ok } = await runValidate({ rootDir: EMPTY_DIR });
    expect(ok).toBe(true);
    expect(results).toHaveLength(0);
  });

  it("validates a valid consequence file against its schema", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });

    // There should be at least the consequence fixture
    const consequence = results.find((r) =>
      r.file.includes("survivors_pension.yml"),
    );
    expect(consequence).toBeDefined();
    expect(consequence!.schema).toBe("consequence.schema.json");
    expect(consequence!.valid).toBe(true);
  });

  it("validates a valid authority file against its schema", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });

    const authority = results.find((r) => r.file.includes("cnap.yml"));
    expect(authority).toBeDefined();
    expect(authority!.schema).toBe("authority.schema.json");
    expect(authority!.valid).toBe(true);
  });

  it("validates source assertion batch files with $ref resolution", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });

    const assertion = results.find((r) =>
      r.file.includes("guichet_bereavement.yml"),
    );
    expect(assertion).toBeDefined();
    expect(assertion!.schema).toBe("source_assertion.schema.json");
    expect(assertion!.valid).toBe(true);
  });

  it("reports validation errors for files that don't match the schema", async () => {
    const { results, ok } = await runValidate({ rootDir: FIXTURES_DIR });

    // The bad_id fixture has an uppercase ID — won't match the id pattern
    const badId = results.find((r) => r.file.includes("bad_id.yml"));
    expect(badId).toBeDefined();
    expect(badId!.valid).toBe(false);
    expect(badId!.errors).toBeDefined();
    expect(badId!.errors!.length).toBeGreaterThan(0);

    // Overall should fail because of the bad files
    expect(ok).toBe(false);
  });

  it("skips .gitkeep files", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });
    const gitkeep = results.find((r) => r.file.includes(".gitkeep"));
    expect(gitkeep).toBeUndefined();
  });
});
