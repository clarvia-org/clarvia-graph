/**
 * clarvia check-publication-gate — Enforce publication gate per spec §10.6.
 *
 * For every consequence and task_template, verifies:
 *   - authoring_status === 'approved'
 *   - distribution_status === 'public_open'
 *   - source_assertion_refs is non-empty
 *   - All referenced assertions have review_status === 'approved'
 *   - All referenced assertions have anchor present
 *   - All referenced assertions have source_id present
 *   - All referenced assertions have source_snapshot_id present
 *   - All referenced assertions have confidence not null/undefined
 *
 * Hard enforce: exit 1 if ANY violation found.
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";

// ── helpers ──────────────────────────────────────────────────────────

/** Turn a Windows path into a forward-slash posix-style relative path */
function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

// ── public result types ──────────────────────────────────────────────

export interface GateViolation {
  recordId: string;
  file: string;
  rule: string;
  detail: string;
}

export interface CheckPublicationGateOptions {
  /** Absolute path to the repo root */
  rootDir: string;
}

// ── module-level interfaces ──────────────────────────────────────────

interface LoadedAssertion {
  id: string;
  review_status?: string;
  anchor?: { selector_type?: string; text_quote?: string };
  source_id?: string;
  source_snapshot_id?: string;
  confidence?: unknown;
  [key: string]: unknown;
}

interface GateRecord {
  id: string;
  authoring_status?: string;
  distribution_status?: string;
  source_assertion_refs?: string[];
  [key: string]: unknown;
}

interface GateFileEntry {
  relPath: string;
  record: GateRecord;
}

// ── extracted helpers ────────────────────────────────────────────────

function loadAssertionsWithInheritance(
  rootDir: string,
): Map<string, LoadedAssertion> {
  const assertions = new Map<string, LoadedAssertion>();
  const assertionFiles = globSync("sources/assertions/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  for (const file of assertionFiles) {
    try {
      const raw = readFileSync(file, "utf-8");
      const doc = parseYaml(raw) as {
        source_id?: string;
        source_snapshot_id?: string;
        assertions?: LoadedAssertion[];
      };
      if (doc?.assertions && Array.isArray(doc.assertions)) {
        for (const ass of doc.assertions) {
          if (ass.id) {
            assertions.set(ass.id, {
              ...ass,
              source_id: ass.source_id || doc.source_id,
              source_snapshot_id:
                ass.source_snapshot_id || doc.source_snapshot_id,
            });
          }
        }
      }
    } catch {
      // Skip unparseable files
    }
  }

  return assertions;
}

function loadGateRecords(rootDir: string): GateFileEntry[] {
  const gateRecords: GateFileEntry[] = [];

  const patterns = [
    "graph/consequences/**/*.{yml,yaml}",
    "graph/task_templates/**/*.{yml,yaml}",
  ];

  for (const pattern of patterns) {
    const files = globSync(pattern, { cwd: rootDir, absolute: true });
    for (const file of files) {
      const base = file.split(/[\\/]/).pop()!;
      if (base === ".gitkeep") continue;

      try {
        const raw = readFileSync(file, "utf-8");
        const doc = parseYaml(raw) as GateRecord;
        if (doc?.id) {
          gateRecords.push({
            relPath: toPosixRel(file, rootDir),
            record: doc,
          });
        }
      } catch {
        // Skip unparseable files
      }
    }
  }

  return gateRecords;
}

function checkAssertionRefs(
  record: GateRecord,
  assertions: Map<string, LoadedAssertion>,
  relPath: string,
): GateViolation[] {
  const violations: GateViolation[] = [];
  const refs = record.source_assertion_refs;

  if (!Array.isArray(refs)) {
    return violations;
  }

  for (const ref of refs) {
    const ass = assertions.get(ref);
    if (!ass) {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "assertion_exists",
        detail: `Referenced assertion not found: ${ref}`,
      });
      continue;
    }

    // review_status === 'approved'
    if (ass.review_status !== "approved") {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "assertion_review_status",
        detail: `${ref}: review_status is '${ass.review_status ?? "(missing)"}', expected 'approved'`,
      });
    }

    // anchor present
    if (!ass.anchor) {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "assertion_anchor",
        detail: `${ref}: anchor is missing`,
      });
    }

    // source_id present
    if (!ass.source_id) {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "assertion_source_id",
        detail: `${ref}: source_id is missing`,
      });
    }

    // source_snapshot_id present
    if (!ass.source_snapshot_id) {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "assertion_source_snapshot_id",
        detail: `${ref}: source_snapshot_id is missing`,
      });
    }

    // confidence not null/undefined
    if (ass.confidence == null) {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "assertion_confidence",
        detail: `${ref}: confidence is null or missing`,
      });
    }
  }

  return violations;
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runCheckPublicationGate(
  opts: CheckPublicationGateOptions,
): Promise<{ violations: GateViolation[] }> {
  const { rootDir } = opts;

  const assertions = loadAssertionsWithInheritance(rootDir);
  const gateRecords = loadGateRecords(rootDir);

  const violations: GateViolation[] = [];

  for (const { relPath, record } of gateRecords) {
    if (record.distribution_status !== "public_open") {
      continue;
    }

    // Rule: authoring_status === 'approved'
    if (record.authoring_status !== "approved") {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "authoring_status",
        detail: `Expected 'approved', got '${record.authoring_status ?? "(missing)"}'`,
      });
    }

    // Rule: source_assertion_refs is non-empty array
    const refs = record.source_assertion_refs;
    if (!Array.isArray(refs) || refs.length === 0) {
      violations.push({
        recordId: record.id,
        file: relPath,
        rule: "source_assertion_refs",
        detail: "Must be a non-empty array",
      });
    }

    // Rules on each referenced assertion
    violations.push(...checkAssertionRefs(record, assertions, relPath));
  }

  return { violations };
}

// ── CLI entry point ──────────────────────────────────────────────────

export async function main(): Promise<void> {
  const rootDir = resolve(
    import.meta.dirname ?? ".",
    "..",
    "..",
    "..",
    "..",
  );

  const { violations } = await runCheckPublicationGate({ rootDir });

  if (violations.length === 0) {
    console.log("✔ All consequences and task templates pass publication gate.");
    process.exit(0);
  }

  // Group violations by record
  const byRecord = new Map<string, GateViolation[]>();
  for (const v of violations) {
    let list = byRecord.get(v.recordId);
    if (!list) {
      list = [];
      byRecord.set(v.recordId, list);
    }
    list.push(v);
  }

  for (const [recordId, recordViolations] of byRecord) {
    console.error(`✘ ${recordId} (${recordViolations[0].file})`);
    for (const v of recordViolations) {
      console.error(`    [${v.rule}] ${v.detail}`);
    }
  }

  console.error(
    `\n${violations.length} publication gate violation(s) across ${byRecord.size} record(s).`,
  );

  process.exit(1);
}
