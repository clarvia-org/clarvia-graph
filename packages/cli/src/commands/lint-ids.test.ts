import { describe, it, expect, vi } from "vitest";
import { resolve } from "node:path";
import { lintId, extractIds, runLintIds, countIssuesByLevel, formatFileResult } from "./lint-ids.js";

/**
 * Tests for the `clarvia lint-ids` command.
 */

const FIXTURES_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures");
const EMPTY_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures-empty");

// ── unit tests for lintId ────────────────────────────────────────────

describe("lintId", () => {
  const consequenceRule = {
    prefix: "consequence",
    segments: 5,
    label: "consequence.<jurisdiction>.<life_event>.<domain>.<slug>",
  };

  const authorityRule = {
    prefix: "authority",
    segments: 3,
    label: "authority.<jurisdiction>.<slug>",
  };

  it("accepts a valid life-event-scoped ID", () => {
    const issues = lintId(
      "consequence.lu.bereavement.social_security.survivors_pension",
      consequenceRule,
    );
    expect(issues).toHaveLength(0);
  });

  it("accepts a valid reusable ID", () => {
    const issues = lintId("authority.lu.cnap", authorityRule);
    expect(issues).toHaveLength(0);
  });

  it("rejects uppercase characters", () => {
    const issues = lintId(
      "CONSEQUENCE.LU.bereavement.social_security.bad",
      consequenceRule,
    );
    const charErr = issues.find((i) => i.message.includes("invalid characters"));
    expect(charErr).toBeDefined();
    expect(charErr!.level).toBe("error");
  });

  it("rejects empty segments", () => {
    const issues = lintId("authority..missing", authorityRule);
    const emptyErr = issues.find((i) => i.message.includes("empty segments"));
    expect(emptyErr).toBeDefined();
    expect(emptyErr!.level).toBe("error");
  });

  it("rejects wrong prefix", () => {
    const issues = lintId(
      "consequence.lu.bereavement.social_security.x",
      authorityRule,
    );
    const prefixErr = issues.find((i) => i.message.includes("prefix"));
    expect(prefixErr).toBeDefined();
    expect(prefixErr!.level).toBe("error");
  });

  it("rejects wrong segment count", () => {
    const issues = lintId("consequence.lu.only_three", consequenceRule);
    const segErr = issues.find((i) => i.message.includes("segments"));
    expect(segErr).toBeDefined();
    expect(segErr!.level).toBe("error");
  });

  it("warns on long IDs (>80 chars)", () => {
    const longSlug = "a".repeat(60);
    const id = `consequence.lu.bereavement.social_security.${longSlug}`;
    expect(id.length).toBeGreaterThan(80);
    expect(id.length).toBeLessThanOrEqual(120);

    const issues = lintId(id, consequenceRule);
    const warn = issues.find((i) => i.level === "warn");
    expect(warn).toBeDefined();
    expect(warn!.message).toContain("recommended");
  });

  it("errors on very long IDs (>120 chars)", () => {
    const longSlug = "a".repeat(100);
    const id = `consequence.lu.bereavement.social_security.${longSlug}`;
    expect(id.length).toBeGreaterThan(120);

    const issues = lintId(id, consequenceRule);
    const err = issues.find(
      (i) => i.level === "error" && i.message.includes("exceeds"),
    );
    expect(err).toBeDefined();
  });
});

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

  it("returns empty array when no id fields exist", () => {
    expect(extractIds({ title: "no id" })).toEqual([]);
  });

  it("returns empty array for null/undefined", () => {
    expect(extractIds(null)).toEqual([]);
    expect(extractIds(undefined)).toEqual([]);
  });
});

// ── integration tests for runLintIds ─────────────────────────────────

describe("runLintIds integration", () => {
  it("returns ok=true and empty results when no YAML data files exist", async () => {
    const { results, ok } = await runLintIds({ rootDir: EMPTY_DIR });
    expect(ok).toBe(true);
    expect(results).toHaveLength(0);
  });

  it("lints valid fixture files without errors", async () => {
    const { results } = await runLintIds({ rootDir: FIXTURES_DIR });

    const consequence = results.find((r) =>
      r.file.includes("survivors_pension.yml"),
    );
    expect(consequence).toBeDefined();
    const consequenceErrors = consequence!.ids.flatMap((i) =>
      i.issues.filter((iss) => iss.level === "error"),
    );
    expect(consequenceErrors).toHaveLength(0);
  });

  it("detects uppercase IDs as errors", async () => {
    const { results, ok } = await runLintIds({ rootDir: FIXTURES_DIR });

    const badId = results.find((r) => r.file.includes("bad_id.yml"));
    expect(badId).toBeDefined();
    const errors = badId!.ids.flatMap((i) =>
      i.issues.filter((iss) => iss.level === "error"),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(ok).toBe(false);
  });

  it("detects empty segments as errors", async () => {
    const { results } = await runLintIds({ rootDir: FIXTURES_DIR });

    const emptySegment = results.find((r) =>
      r.file.includes("empty_segment.yml"),
    );
    expect(emptySegment).toBeDefined();
    const errors = emptySegment!.ids.flatMap((i) =>
      i.issues.filter((iss) => iss.level === "error"),
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it("detects wrong prefix as error", async () => {
    const { results } = await runLintIds({ rootDir: FIXTURES_DIR });

    const wrongPrefix = results.find((r) =>
      r.file.includes("wrong_prefix.yml"),
    );
    expect(wrongPrefix).toBeDefined();
    const errors = wrongPrefix!.ids.flatMap((i) =>
      i.issues.filter((iss) => iss.level === "error"),
    );
    // Should have both prefix and segment count errors
    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.some((e) => e.message.includes("prefix")),
    ).toBe(true);
  });

  it("skips .gitkeep files", async () => {
    const { results } = await runLintIds({ rootDir: FIXTURES_DIR });
    const gitkeep = results.find((r) => r.file.includes(".gitkeep"));
    expect(gitkeep).toBeUndefined();
  });
});

// ── unit tests for countIssuesByLevel ────────────────────────────────

describe("countIssuesByLevel", () => {
  it("returns 0 for empty results", () => {
    expect(countIssuesByLevel([], "error")).toBe(0);
    expect(countIssuesByLevel([], "warn")).toBe(0);
  });

  it("counts errors across files and ids", () => {
    const results = [
      {
        file: "a.yml",
        ids: [
          { id: "a.b", issues: [{ level: "error" as const, message: "bad" }] },
          { id: "a.c", issues: [{ level: "warn" as const, message: "ok" }] },
        ],
      },
      {
        file: "b.yml",
        ids: [
          { id: "b.b", issues: [{ level: "error" as const, message: "bad2" }, { level: "error" as const, message: "bad3" }] },
        ],
      },
    ];
    expect(countIssuesByLevel(results, "error")).toBe(3);
    expect(countIssuesByLevel(results, "warn")).toBe(1);
  });
});

// ── unit tests for formatFileResult ─────────────────────────────────

describe("formatFileResult", () => {
  it("prints checkmark for clean file", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    formatFileResult({ file: "clean.yml", ids: [{ id: "a.b", issues: [] }] });
    const output = spy.mock.calls.map(c => c[0]).join("\n");
    expect(output).toContain("✔ clean.yml");
    spy.mockRestore();
  });

  it("prints cross for file with errors", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    formatFileResult({
      file: "bad.yml",
      ids: [{ id: "bad.id", issues: [{ level: "error", message: "invalid" }] }],
    });
    const output = spy.mock.calls.map(c => c[0]).join("\n");
    expect(output).toContain("✘ bad.yml");
    expect(output).toContain("✘ [bad.id] invalid");
    spy.mockRestore();
  });

  it("prints warning marker for file with only warnings", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    formatFileResult({
      file: "warn.yml",
      ids: [{ id: "w.id", issues: [{ level: "warn", message: "long" }] }],
    });
    const output = spy.mock.calls.map(c => c[0]).join("\n");
    expect(output).toContain("⚠ warn.yml");
    expect(output).toContain("⚠ [w.id] long");
    spy.mockRestore();
  });
});
