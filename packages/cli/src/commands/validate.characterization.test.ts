/**
 * Characterization tests for validate.ts — extended.
 *
 * These pin the EXACT current behavior of runValidate against the
 * real graph. They supplement the existing validate.test.ts unit tests.
 */

import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runValidate } from "./validate.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("runValidate characterization against real graph", () => {
  it("pins total file count and pass/fail breakdown", async () => {
    const { results, ok } = await runValidate({ rootDir: ROOT_DIR });

    expect(results.length).toBeGreaterThan(0);

    const validCount = results.filter((r) => r.valid).length;
    const invalidCount = results.filter((r) => !r.valid).length;

    // Pin the counts
    expect({ total: results.length, valid: validCount, invalid: invalidCount }).toMatchSnapshot();
    expect(ok).toMatchSnapshot();
  });

  it("pins schema assignments for all validated files", async () => {
    const { results } = await runValidate({ rootDir: ROOT_DIR });

    // Pin the file → schema mapping (sorted for determinism)
    const fileSchemaMap = results
      .map((r) => ({ file: r.file, schema: r.schema, valid: r.valid }))
      .sort((a, b) => a.file.localeCompare(b.file));

    expect(fileSchemaMap).toMatchSnapshot();
  });

  it("pins exact error messages for any invalid files", async () => {
    const { results } = await runValidate({ rootDir: ROOT_DIR });

    const invalid = results
      .filter((r) => !r.valid)
      .map((r) => ({
        file: r.file,
        schema: r.schema,
        errors: r.errors,
      }))
      .sort((a, b) => a.file.localeCompare(b.file));

    expect(invalid).toMatchSnapshot();
  });

  it("validates snapshot integrity checks exist", async () => {
    const { results } = await runValidate({ rootDir: ROOT_DIR });

    // Snapshot files should be validated
    const snapshotResults = results.filter((r) =>
      r.file.startsWith("sources/snapshots/"),
    );
    expect(snapshotResults.length).toBeGreaterThan(0);

    // Pin snapshot validation results
    const snapshotSummary = snapshotResults.map((r) => ({
      file: r.file,
      valid: r.valid,
      errorCount: r.errors?.length ?? 0,
    }));
    expect(snapshotSummary).toMatchSnapshot();
  });

  it("validates condition-intake cross-references exist", async () => {
    const { results } = await runValidate({ rootDir: ROOT_DIR });

    // Condition files should be validated
    const conditionResults = results.filter((r) =>
      r.file.startsWith("graph/conditions/"),
    );
    expect(conditionResults.length).toBeGreaterThan(0);

    // Pin condition validation results
    const conditionSummary = conditionResults.map((r) => ({
      file: r.file,
      valid: r.valid,
      errorCount: r.errors?.length ?? 0,
    }));
    expect(conditionSummary).toMatchSnapshot();
  });
});
