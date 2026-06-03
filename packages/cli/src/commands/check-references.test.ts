import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { extractIds, extractRefs, runCheckReferences } from "./check-references.js";

/**
 * Tests for the `clarvia check-references` command.
 *
 * Uses self-contained fixtures under packages/cli/tests/fixtures/check-references/
 * so tests run independently of the real graph data.
 */

const CHECK_REF_FIXTURES = resolve(
  import.meta.dirname!,
  "..",
  "..",
  "tests",
  "fixtures",
  "check-references",
);

// ── unit tests for extractIds ────────────────────────────────────────

describe("extractIds", () => {
  it("extracts top-level id", () => {
    expect(extractIds({ id: "foo.bar", title: "x" })).toEqual(["foo.bar"]);
  });

  it("extracts nested ids from assertion batches", () => {
    const data = {
      source_id: "source.test.x",
      assertions: [
        { id: "assertion.test.x.a" },
        { id: "assertion.test.x.b" },
      ],
    };
    const ids = extractIds(data);
    expect(ids).toContain("assertion.test.x.a");
    expect(ids).toContain("assertion.test.x.b");
  });

  it("returns empty array for null/undefined", () => {
    expect(extractIds(null)).toEqual([]);
    expect(extractIds(undefined)).toEqual([]);
  });
});

// ── unit tests for extractRefs ───────────────────────────────────────

describe("extractRefs", () => {
  it("extracts _ref string fields", () => {
    const data = {
      id: "task.x",
      target: {
        primary_authority_ref: "authority.lu.cnap",
      },
    };
    const refs = extractRefs(data);
    expect(refs).toContainEqual({
      field: "primary_authority_ref",
      target: "authority.lu.cnap",
    });
  });

  it("extracts _refs array fields", () => {
    const data = {
      id: "consequence.x",
      condition_refs: ["condition.a", "condition.b"],
    };
    const refs = extractRefs(data);
    expect(refs).toHaveLength(2);
    expect(refs).toContainEqual({ field: "condition_refs", target: "condition.a" });
    expect(refs).toContainEqual({ field: "condition_refs", target: "condition.b" });
  });

  it("finds deeply nested refs", () => {
    const data = {
      id: "task.x",
      evidence_requirements: {
        sets: [
          {
            evidence_type_refs: ["evidence_type.lu.death_certificate"],
          },
        ],
      },
    };
    const refs = extractRefs(data);
    expect(refs).toContainEqual({
      field: "evidence_type_refs",
      target: "evidence_type.lu.death_certificate",
    });
  });

  it("skips null and empty values", () => {
    const data = {
      some_ref: null,
      other_ref: "",
      list_refs: [null, "", "valid.id"],
    };
    const refs = extractRefs(data);
    expect(refs).toHaveLength(1);
    expect(refs[0].target).toBe("valid.id");
  });

  it("returns empty array for null input", () => {
    expect(extractRefs(null)).toEqual([]);
  });
});

// ── integration tests for runCheckReferences ─────────────────────────

describe("runCheckReferences integration", () => {
  it("detects broken refs and reports them as warnings", async () => {
    const { results, warnings } = await runCheckReferences({
      rootDir: CHECK_REF_FIXTURES,
    });

    // The broken_refs.yml file has refs to IDs that don't exist in the fixture set
    const broken = results.find((r) => r.file.includes("broken_refs.yml"));
    expect(broken).toBeDefined();
    expect(broken!.brokenRefs.length).toBeGreaterThan(0);
    expect(warnings).toBeGreaterThan(0);

    // Check that the specific broken targets are reported
    const brokenTargets = broken!.brokenRefs.map((b) => b.target);
    expect(brokenTargets).toContain(
      "condition.lu.bereavement.survivor_pension.does_not_exist",
    );
    expect(brokenTargets).toContain(
      "assertion.lu_gov.guichet_bereavement.nonexistent_claim",
    );
  });

  it("reports no broken refs when all references are valid", async () => {
    const { results } = await runCheckReferences({
      rootDir: CHECK_REF_FIXTURES,
    });

    // The valid_refs.yml file should NOT appear in results (no broken refs)
    const valid = results.find((r) => r.file.includes("valid_refs.yml"));
    expect(valid).toBeUndefined();
  });

  it("resolves assertion IDs from batch files", async () => {
    const { results } = await runCheckReferences({
      rootDir: CHECK_REF_FIXTURES,
    });

    // valid_refs.yml references assertion.lu_gov.guichet_bereavement.pension_exists
    // which is defined inside the assertion batch file — should NOT be broken
    const valid = results.find((r) => r.file.includes("valid_refs.yml"));
    expect(valid).toBeUndefined();
  });

  it("returns empty results when no YAML data files exist", async () => {
    const emptyDir = resolve(
      import.meta.dirname!,
      "..",
      "..",
      "tests",
      "fixtures-empty",
    );
    const { results, warnings } = await runCheckReferences({
      rootDir: emptyDir,
    });
    expect(results).toHaveLength(0);
    expect(warnings).toBe(0);
  });
});
