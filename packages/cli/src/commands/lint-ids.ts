/**
 * clarvia lint-ids — Check ID grammar and length rules.
 *
 * Early alpha implementation.  Parses all YAML data files and validates
 * that their `id` fields conform to the Clarvia ID grammar spec.
 */

import { readFileSync } from "node:fs";
import { toPosixRel, resolveRootDir } from "../shared/utils.js";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";

// ── ID grammar rules per object type ─────────────────────────────────

/**
 * Directory prefix → expected object type prefix.
 * For life-event-scoped types the full pattern is:
 *   <type>.<jurisdiction>.<life_event>.<domain>.<slug>
 * For reusable types:
 *   authority.<jurisdiction>.<slug>
 *   evidence_type.<jurisdiction_or_global>.<slug>
 *   form.<jurisdiction>.<authority_or_portal>.<slug>
 */
const DIR_TYPE_MAP: Record<
  string,
  { prefix: string; segments: number | number[]; label: string }
> = {
  // Life-event-scoped (5 segments: type.jurisdiction.life_event.domain.slug)
  "graph/consequences": {
    prefix: "consequence",
    segments: 5,
    label: "consequence.<jurisdiction>.<life_event>.<domain>.<slug>",
  },
  "graph/task_templates": {
    prefix: "task_template",
    segments: 5,
    label: "task_template.<jurisdiction>.<life_event>.<domain>.<slug>",
  },
  "graph/conditions": {
    prefix: "condition",
    segments: 5,
    label: "condition.<jurisdiction>.<life_event>.<domain>.<slug>",
  },
  "graph/deadlines": {
    prefix: "deadline",
    segments: 5,
    label: "deadline.<jurisdiction>.<life_event>.<domain>.<slug>",
  },
  "graph/composition_rules": {
    prefix: "composition_rule",
    segments: 5,
    label: "composition_rule.<jurisdiction>.<life_event>.<domain>.<slug>",
  },
  "graph/dedupe_rules": {
    prefix: "dedupe_rule",
    segments: 5,
    label: "dedupe_rule.<jurisdiction>.<life_event>.<domain>.<slug>",
  },
  // Reusable (varying segments)
  "graph/authorities": {
    prefix: "authority",
    segments: 3,
    label: "authority.<jurisdiction>.<slug>",
  },
  "graph/evidence_types": {
    prefix: "evidence_type",
    segments: 3,
    label: "evidence_type.<jurisdiction_or_global>.<slug>",
  },
  "graph/forms": {
    prefix: "form",
    segments: 4,
    label: "form.<jurisdiction>.<authority_or_portal>.<slug>",
  },
  // Intake fact types (4 segments)
  "graph/intake_fact_types": {
    prefix: "intake_fact",
    segments: 4,
    label: "intake_fact.<scope>.<life_event>.<path_slug>",
  },
  // Source chain
  "sources/assertions": {
    prefix: "assertion",
    segments: 4,
    label: "assertion.<origin>.<source_slug>.<claim_slug>",
  },
};

// Files / paths to skip
const SKIP_FILES = new Set([".gitkeep"]);
const SKIP_PATHS = new Set(["sources/register.yml"]);

const ID_CHAR_RE = /^[a-z0-9_.]+$/;
const MAX_ID_LENGTH = 120;
const WARN_ID_LENGTH = 80;

// ── helpers ──────────────────────────────────────────────────────────

function resolveTypeRule(
  relPath: string,
): (typeof DIR_TYPE_MAP)[string] | null {
  for (const [dir, rule] of Object.entries(DIR_TYPE_MAP)) {
    if (relPath.startsWith(dir + "/")) {
      return rule;
    }
  }
  return null;
}

// ── lint a single ID ─────────────────────────────────────────────────

export interface IdLintIssue {
  level: "error" | "warn";
  message: string;
}

export function lintId(
  id: string,
  rule: { prefix: string; segments: number | number[]; label: string },
): IdLintIssue[] {
  const issues: IdLintIssue[] = [];

  // Character set
  if (!ID_CHAR_RE.test(id)) {
    issues.push({
      level: "error",
      message: `ID contains invalid characters (only lowercase, digits, underscores, dots allowed): "${id}"`,
    });
  }

  // Length
  if (id.length > MAX_ID_LENGTH) {
    issues.push({
      level: "error",
      message: `ID exceeds ${MAX_ID_LENGTH} chars (${id.length}): "${id}"`,
    });
  } else if (id.length > WARN_ID_LENGTH) {
    issues.push({
      level: "warn",
      message: `ID length ${id.length} exceeds recommended ${WARN_ID_LENGTH} chars: "${id}"`,
    });
  }

  // Segment count
  const segments = id.split(".");
  const expectedSegments = Array.isArray(rule.segments)
    ? rule.segments
    : [rule.segments];

  // Empty segments
  if (segments.some((s) => s.length === 0)) {
    issues.push({
      level: "error",
      message: `ID has empty segments: "${id}"`,
    });
  }

  // Prefix
  if (segments[0] !== rule.prefix) {
    issues.push({
      level: "error",
      message: `ID prefix "${segments[0]}" does not match expected "${rule.prefix}" for this directory. Expected: ${rule.label}`,
    });
  }

  // Segment count
  if (!expectedSegments.includes(segments.length)) {
    issues.push({
      level: "error",
      message: `ID has ${segments.length} segments, expected ${expectedSegments.join(" or ")}. Pattern: ${rule.label}`,
    });
  }

  return issues;
}

// ── extract IDs from parsed YAML ─────────────────────────────────────

/**
 * Extracts all `id` values from a parsed YAML document.
 * Handles both top-level `id` and nested items (e.g. source_assertion batches
 * have `assertions[].id`).
 */
export function extractIds(data: unknown): string[] {
  const ids: string[] = [];

  function walk(obj: unknown): void {
    if (obj == null || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      for (const item of obj) walk(item);
      return;
    }

    const record = obj as Record<string, unknown>;
    if (typeof record["id"] === "string") {
      ids.push(record["id"]);
    }
    // Walk into arrays (e.g. assertions[])
    for (const val of Object.values(record)) {
      if (Array.isArray(val)) walk(val);
    }
  }

  walk(data);
  return ids;
}

// ── exported runner ──────────────────────────────────────────────────

export interface LintIdResult {
  file: string;
  ids: { id: string; issues: IdLintIssue[] }[];
}

export interface LintIdOptions {
  rootDir: string;
}

export async function runLintIds(
  opts: LintIdOptions,
): Promise<{ results: LintIdResult[]; ok: boolean }> {
  const { rootDir } = opts;

  // Collect YAML files
  const patterns = [
    "graph/**/*.{yml,yaml}",
    "sources/assertions/**/*.{yml,yaml}",
  ];
  const files = patterns.flatMap((p) =>
    globSync(p, { cwd: rootDir, absolute: true }),
  );

  const dataFiles = files.filter((f) => {
    const base = f.split(/[\\/]/).pop()!;
    if (SKIP_FILES.has(base)) return false;
    const rel = toPosixRel(f, rootDir);
    if (SKIP_PATHS.has(rel)) return false;
    return true;
  });

  if (dataFiles.length === 0) {
    return { results: [], ok: true };
  }

  const results: LintIdResult[] = [];

  for (const file of dataFiles) {
    const relPath = toPosixRel(file, rootDir);
    const rule = resolveTypeRule(relPath);

    if (!rule) {
      results.push({
        file: relPath,
        ids: [
          {
            id: "(file)",
            issues: [
              {
                level: "error",
                message: `No ID grammar rule for directory: ${relPath}`,
              },
            ],
          },
        ],
      });
      continue;
    }

    let data: unknown;
    try {
      const raw = readFileSync(file, "utf-8");
      data = parseYaml(raw);
    } catch (err) {
      results.push({
        file: relPath,
        ids: [
          {
            id: "(file)",
            issues: [
              {
                level: "error",
                message: `YAML parse error: ${(err as Error).message}`,
              },
            ],
          },
        ],
      });
      continue;
    }

    const ids = extractIds(data);
    if (ids.length === 0) {
      results.push({
        file: relPath,
        ids: [
          {
            id: "(missing)",
            issues: [
              { level: "error", message: "No id field found in this file" },
            ],
          },
        ],
      });
      continue;
    }

    const lintedIds = ids.map((id) => ({ id, issues: lintId(id, rule) }));
    results.push({ file: relPath, ids: lintedIds });
  }

  const ok = results.every((r) =>
    r.ids.every((i) => i.issues.every((iss) => iss.level !== "error")),
  );
  return { results, ok };
}

// ── output helpers ───────────────────────────────────────────────────

export function countIssuesByLevel(
  results: LintIdResult[],
  level: "error" | "warn",
): number {
  return results.reduce(
    (n, r) =>
      n +
      r.ids.reduce(
        (m, i) => m + i.issues.filter((iss) => iss.level === level).length,
        0,
      ),
    0,
  );
}

export function formatFileResult(r: LintIdResult): void {
  const hasErrors = r.ids.some((i) =>
    i.issues.some((iss) => iss.level === "error"),
  );
  const hasWarns = r.ids.some((i) =>
    i.issues.some((iss) => iss.level === "warn"),
  );

  if (!hasErrors && !hasWarns) {
    console.log(`✔ ${r.file}`);
    return;
  }

  const marker = hasErrors ? "✘" : "⚠";
  console.log(`${marker} ${r.file}`);
  for (const idResult of r.ids) {
    for (const iss of idResult.issues) {
      const icon = iss.level === "error" ? "  ✘" : "  ⚠";
      console.log(`${icon} [${idResult.id}] ${iss.message}`);
    }
  }
}

// ── CLI entry point ──────────────────────────────────────────────────

export async function main(): Promise<void> {
  const rootDir = resolveRootDir(import.meta.dirname ?? __dirname);

  const { results, ok } = await runLintIds({ rootDir });

  if (results.length === 0) {
    console.log(
      "✔ No YAML data files found (only .gitkeep placeholders). Nothing to lint.",
    );
    process.exit(0);
  }

  for (const r of results) {
    formatFileResult(r);
  }

  const errorCount = countIssuesByLevel(results, "error");
  const warnCount = countIssuesByLevel(results, "warn");

  console.log(`\n${errorCount} error(s), ${warnCount} warning(s).`);
  process.exit(ok ? 0 : 1);
}
