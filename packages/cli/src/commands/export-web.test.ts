/**
 * Characterization tests for export-web.ts.
 *
 * These pin the EXACT current output of the web export pipeline against
 * the real graph. They must pass BEFORE refactoring and remain unchanged AFTER.
 *
 * Since buildIntakeFile/buildRuntimeFile are private, we call main() once
 * and then snapshot the generated output files.
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { main } from "./export-web.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");
const WEB_DIR = resolve(ROOT_DIR, "build", "exports", "web");

// Run export once before all tests
beforeAll(async () => {
  // Suppress console output during export
  vi.spyOn(console, "log").mockImplementation(() => {});
  try {
    await main();
  } finally {
    vi.restoreAllMocks();
  }
}, 30_000);

describe("export-web characterization", () => {
  it("produces manifest.json with expected life events and structure", () => {
    const manifestPath = resolve(WEB_DIR, "manifest.json");
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    // Pin structure (strip non-deterministic fields)
    expect(manifest.$schema).toMatchInlineSnapshot(`"clarvia-web-export/v0.1"`);
    expect(manifest.life_events.length).toBeGreaterThan(0);

    // Pin life event IDs and URL patterns
    const lifeEventSummary = manifest.life_events.map(
      (le: { id: string; intake_url: string; runtime_url: string; jurisdictions: string[] }) => ({
        id: le.id,
        intake_url: le.intake_url,
        runtime_url: le.runtime_url,
        jurisdiction_count: le.jurisdictions.length,
        jurisdictions: [...le.jurisdictions].sort(),
      }),
    );
    expect(lifeEventSummary).toMatchSnapshot();
  });

  it("produces intake/bereavement.json with expected question structure", () => {
    const intakePath = resolve(WEB_DIR, "intake", "bereavement.json");
    expect(existsSync(intakePath)).toBe(true);

    const intake = JSON.parse(readFileSync(intakePath, "utf-8"));
    expect(intake.life_event).toBe("bereavement");
    expect(intake.questions.length).toBeGreaterThan(0);

    // Pin question structure: id, path, value_type, cardinality, option count
    const questionSummary = intake.questions.map(
      (q: {
        id: string;
        path: string;
        value_type: string;
        cardinality: string;
        options?: unknown[];
      }) => ({
        id: q.id,
        path: q.path,
        value_type: q.value_type,
        cardinality: q.cardinality,
        has_options: !!q.options,
        option_count: q.options?.length ?? 0,
      }),
    );
    expect(questionSummary).toMatchSnapshot();
  });

  it("produces runtime/bereavement.json with expected entity counts and IDs", () => {
    const runtimePath = resolve(WEB_DIR, "runtime", "bereavement.json");
    expect(existsSync(runtimePath)).toBe(true);

    const runtime = JSON.parse(readFileSync(runtimePath, "utf-8"));
    expect(runtime.life_event).toBe("bereavement");

    // Pin counts and sorted IDs for determinism
    const summary = {
      consequence_count: runtime.consequences.length,
      condition_count: runtime.conditions.length,
      task_template_count: runtime.task_templates.length,
      authority_count: runtime.authorities.length,
      deadline_count: runtime.deadlines.length,
      evidence_type_count: runtime.evidence_types.length,
      consequence_ids: runtime.consequences
        .map((c: { id: string }) => c.id)
        .sort(),
      condition_ids: runtime.conditions
        .map((c: { id: string }) => c.id)
        .sort(),
      task_template_ids: runtime.task_templates
        .map((t: { id: string }) => t.id)
        .sort(),
    };
    expect(summary).toMatchSnapshot();
  });

  it("runtime consequences only include public distribution statuses", () => {
    const runtimePath = resolve(WEB_DIR, "runtime", "bereavement.json");
    const runtime = JSON.parse(readFileSync(runtimePath, "utf-8"));

    const PUBLIC = new Set(["public_open", "public_metadata_only"]);
    for (const c of runtime.consequences) {
      expect(PUBLIC.has(c.distribution_status)).toBe(true);
    }
  });

  it("intake questions for jurisdiction_code type have correct option structure", () => {
    const intakePath = resolve(WEB_DIR, "intake", "bereavement.json");
    const intake = JSON.parse(readFileSync(intakePath, "utf-8"));

    const jurisdictionQuestions = intake.questions.filter(
      (q: { value_type: string }) => q.value_type === "jurisdiction_code",
    );

    for (const q of jurisdictionQuestions) {
      expect(q.options).toBeDefined();
      expect(q.options.length).toBeGreaterThan(0);

      // Last option should be "I don't know" (UNKNOWN)
      const lastOption = q.options[q.options.length - 1];
      expect(lastOption.value).toBe("UNKNOWN");
      expect(lastOption.label_en).toBe("I don't know");

      // Each option should have multilingual labels
      for (const opt of q.options) {
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("label_en");
        expect(opt).toHaveProperty("label_fr");
        expect(opt).toHaveProperty("label_de");
      }
    }
  });
});
