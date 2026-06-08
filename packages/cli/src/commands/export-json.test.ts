import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { runExportJson } from "./export-json.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("export-json: runExportJson", () => {
  const outDir = resolve(ROOT_DIR, "build", "exports", "json");
  const outPath = resolve(outDir, "graph-export.json");

  it("exports graph as JSON with correct structure", () => {
    const result = runExportJson(ROOT_DIR);

    expect(result.outPath).toBe(outPath);
    expect(result.stats.total).toBeGreaterThan(0);
    expect(result.stats.consequences).toBeGreaterThanOrEqual(0);
    expect(result.stats.task_templates).toBeGreaterThanOrEqual(0);
    expect(result.stats.conditions).toBeGreaterThanOrEqual(0);
    expect(result.stats.deadlines).toBeGreaterThanOrEqual(0);
    expect(result.stats.authorities).toBeGreaterThanOrEqual(0);
    expect(result.stats.evidence_types).toBeGreaterThanOrEqual(0);
    expect(result.stats.intake_fact_types).toBeGreaterThanOrEqual(0);
    expect(result.stats.total).toBe(
      result.stats.consequences +
        result.stats.task_templates +
        result.stats.conditions +
        result.stats.deadlines +
        result.stats.authorities +
        result.stats.evidence_types +
        result.stats.intake_fact_types,
    );
  });

  it("writes valid JSON file to disk", () => {
    runExportJson(ROOT_DIR);
    expect(existsSync(outPath)).toBe(true);

    const content = JSON.parse(readFileSync(outPath, "utf-8"));
    expect(content.$schema).toBe("clarvia-graph-export/v0.1");
    expect(content.version).toBeDefined();
    expect(content.exported_at).toBeDefined();
    expect(Array.isArray(content.consequences)).toBe(true);
    expect(Array.isArray(content.task_templates)).toBe(true);
    expect(Array.isArray(content.conditions)).toBe(true);
  });
});
