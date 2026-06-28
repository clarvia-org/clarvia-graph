import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { runExportJson } from "./export-json.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("export-json: runExportJson", () => {
  const outDir = resolve(ROOT_DIR, "build", "exports", "json");
  const outPath = resolve(outDir, "graph-export.json");

  // ── Basic structure ────────────────────────────────────────────────

  it("exports graph as JSON with correct structure", () => {
    const result = runExportJson(ROOT_DIR);

    expect(result.outPath).toBe(outPath);
    expect(result.stats.total).toBeGreaterThan(0);
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

  // ── Record count snapshot ──────────────────────────────────────────
  // Pins the breakdown so unintentional graph changes are caught.
  // Update with `pnpm vitest run -u` when the graph changes intentionally.

  it("pins record counts against snapshot", () => {
    const result = runExportJson(ROOT_DIR);
    expect(result.stats).toMatchSnapshot();
  });

  // ── File output ────────────────────────────────────────────────────

  it("writes valid JSON file to disk", () => {
    runExportJson(ROOT_DIR);
    expect(existsSync(outPath)).toBe(true);

    const raw = readFileSync(outPath, "utf-8");
    let content: any;
    expect(() => {
      content = JSON.parse(raw);
    }).not.toThrow();
    expect(content.$schema).toBe("clarvia-graph-export/v0.1");
    expect(content.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(content.exported_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
    expect(Array.isArray(content.consequences)).toBe(true);
    expect(Array.isArray(content.task_templates)).toBe(true);
    expect(Array.isArray(content.conditions)).toBe(true);
    expect(Array.isArray(content.deadlines)).toBe(true);
    expect(Array.isArray(content.authorities)).toBe(true);
    expect(Array.isArray(content.evidence_types)).toBe(true);
    expect(Array.isArray(content.intake_fact_types)).toBe(true);
  });

  // ── Consequence record structure ───────────────────────────────────

  it("every exported consequence has required fields", () => {
    const result = runExportJson(ROOT_DIR);
    expect(result.outPath).toBe(outPath);
    expect(result.stats.total).toBeGreaterThan(0);
    const content = JSON.parse(readFileSync(outPath, "utf-8"));

    for (const c of content.consequences) {
      expect(c, `consequence missing id`).toHaveProperty("id");
      expect(c, `consequence ${c.id} missing title`).toHaveProperty("title");
      expect(c, `consequence ${c.id} missing consequence_type`).toHaveProperty(
        "consequence_type",
      );
      expect(c, `consequence ${c.id} missing jurisdiction`).toHaveProperty(
        "jurisdiction",
      );
      expect(c, `consequence ${c.id} missing life_event`).toHaveProperty(
        "life_event",
      );
      expect(c, `consequence ${c.id} missing distribution_status`).toHaveProperty(
        "distribution_status",
      );
      expect(typeof c.id).toBe("string");
      expect(c.id.length).toBeGreaterThan(0);
    }
  });

  // ── Task template record structure ─────────────────────────────────

  it("every exported task_template has required fields", () => {
    const result = runExportJson(ROOT_DIR);
    expect(result).toHaveProperty("stats");
    const content = JSON.parse(readFileSync(outPath, "utf-8"));

    for (const t of content.task_templates) {
      expect(t, `task_template missing id`).toHaveProperty("id");
      expect(t, `task_template ${t.id} missing title`).toHaveProperty("title");
      expect(t, `task_template ${t.id} missing action_type`).toHaveProperty(
        "action_type",
      );
      expect(t, `task_template ${t.id} missing jurisdiction`).toHaveProperty(
        "jurisdiction",
      );
      expect(typeof t.id).toBe("string");
      expect(t.id.length).toBeGreaterThan(0);
    }
  });

  // ── ID uniqueness ──────────────────────────────────────────────────

  it("has no duplicate IDs across all record types", () => {
    const result = runExportJson(ROOT_DIR);
    expect(result.outPath).toBe(outPath);
    const content = JSON.parse(readFileSync(outPath, "utf-8"));

    const allIds: string[] = [
      ...content.consequences.map((r: { id: string }) => r.id),
      ...content.task_templates.map((r: { id: string }) => r.id),
      ...content.conditions.map((r: { id: string }) => r.id),
      ...content.deadlines.map((r: { id: string }) => r.id),
      ...content.authorities.map((r: { id: string }) => r.id),
      ...content.evidence_types.map((r: { id: string }) => r.id),
      ...content.intake_fact_types.map((r: { id: string }) => r.id),
    ];

    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const id of allIds) {
      if (seen.has(id)) duplicates.push(id);
      seen.add(id);
    }

    expect(duplicates).toEqual([]);
  });

  // ── ID grammar ─────────────────────────────────────────────────────

  it("all consequence IDs follow the expected grammar", () => {
    const result = runExportJson(ROOT_DIR);
    expect(result.outPath).toBe(outPath);
    const content = JSON.parse(readFileSync(outPath, "utf-8"));

    for (const c of content.consequences) {
      expect(c.id).toMatch(
        /^consequence\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$/,
      );
    }
  });

  it("all task_template IDs follow the expected grammar", () => {
    const result = runExportJson(ROOT_DIR);
    expect(result.outPath).toBe(outPath);
    const content = JSON.parse(readFileSync(outPath, "utf-8"));

    for (const t of content.task_templates) {
      expect(t.id).toMatch(/^task_template\.[a-z0-9_.]+$/);
    }
  });

  // ── Stats consistency ──────────────────────────────────────────────

  it("stats match actual array lengths in exported file", () => {
    const result = runExportJson(ROOT_DIR);
    const content = JSON.parse(readFileSync(outPath, "utf-8"));

    expect(content.consequences.length).toBe(result.stats.consequences);
    expect(content.task_templates.length).toBe(result.stats.task_templates);
    expect(content.conditions.length).toBe(result.stats.conditions);
    expect(content.deadlines.length).toBe(result.stats.deadlines);
    expect(content.authorities.length).toBe(result.stats.authorities);
    expect(content.evidence_types.length).toBe(result.stats.evidence_types);
    expect(content.intake_fact_types.length).toBe(
      result.stats.intake_fact_types,
    );
  });
});
