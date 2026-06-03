/**
 * clarvia check-references — Verify referential integrity across the graph.
 *
 * Every field ending in `_ref` (string) or `_refs` (array) must point to
 * a record whose `id` exists somewhere in graph/ or sources/assertions/.
 *
 * Alpha behaviour: all broken refs are reported as warnings and the
 * command exits 0.  Once the graph is more complete, broken refs on
 * `distribution_status: public_open` records will become errors.
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";

// Files to skip
const SKIP_FILES = new Set([".gitkeep"]);

// ── helpers ──────────────────────────────────────────────────────────

/** Turn a Windows path into a forward-slash posix-style relative path */
function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

// ── extract all IDs from a parsed YAML document ──────────────────────

/**
 * Extracts all `id` values from a parsed YAML document.
 * Handles both top-level `id` and nested items (e.g. source_assertion
 * batches have `assertions[].id`).
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

// ── extract all _ref / _refs values from a parsed YAML document ──────

export interface RefEntry {
  /** The field name (e.g. "condition_refs", "primary_authority_ref") */
  field: string;
  /** The referenced ID value */
  target: string;
}

/**
 * Recursively find all fields whose name ends with `_ref` or `_refs` and
 * collect the target ID strings.
 */
export function extractRefs(data: unknown): RefEntry[] {
  const refs: RefEntry[] = [];

  function walk(obj: unknown): void {
    if (obj == null || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      for (const item of obj) walk(item);
      return;
    }

    const record = obj as Record<string, unknown>;
    for (const [key, val] of Object.entries(record)) {
      if (key.endsWith("_refs")) {
        // Array of IDs
        if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === "string" && item.length > 0) {
              refs.push({ field: key, target: item });
            }
          }
        }
      } else if (key.endsWith("_ref")) {
        // Single ID
        if (typeof val === "string" && val.length > 0) {
          refs.push({ field: key, target: val });
        }
      }

      // Recurse into nested objects and arrays regardless
      if (val != null && typeof val === "object") {
        walk(val);
      }
    }
  }

  walk(data);
  return refs;
}

// ── public result types ──────────────────────────────────────────────

export interface BrokenRef {
  field: string;
  target: string;
}

export interface CheckRefFileResult {
  file: string;
  brokenRefs: BrokenRef[];
}

export interface CheckReferencesOptions {
  /** Absolute path to the repo root */
  rootDir: string;
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runCheckReferences(
  opts: CheckReferencesOptions,
): Promise<{ results: CheckRefFileResult[]; warnings: number }> {
  const { rootDir } = opts;

  // ── 1. Collect YAML files ──────────────────────────────────────────
  const patterns = [
    "graph/**/*.{yml,yaml}",
    "sources/assertions/**/*.{yml,yaml}",
    "sources/snapshots/**/*.{yml,yaml}",
  ];
  const files = patterns.flatMap((p: string) =>
    globSync(p, { cwd: rootDir, absolute: true }),
  );

  const dataFiles = files.filter((f: string) => {
    const base = f.split(/[\\/]/).pop()!;
    if (SKIP_FILES.has(base)) return false;
    return true;
  });

  if (dataFiles.length === 0) {
    return { results: [], warnings: 0 };
  }

  // ── 2. Parse all files and build the ID set ────────────────────────
  interface ParsedFile {
    relPath: string;
    data: unknown;
  }
  const parsed: ParsedFile[] = [];
  const knownIds = new Set<string>();

  for (const file of dataFiles) {
    const relPath = toPosixRel(file, rootDir);
    let data: unknown;
    try {
      const raw = readFileSync(file, "utf-8");
      data = parseYaml(raw);
    } catch {
      // Skip files that can't be parsed — other commands catch these
      continue;
    }

    parsed.push({ relPath, data });

    for (const id of extractIds(data)) {
      knownIds.add(id);
    }
  }

  // ── 3. Check refs against the ID set ───────────────────────────────
  const results: CheckRefFileResult[] = [];
  let warnings = 0;

  for (const { relPath, data } of parsed) {
    const refs = extractRefs(data);
    const brokenRefs: BrokenRef[] = [];

    for (const ref of refs) {
      if (!knownIds.has(ref.target)) {
        brokenRefs.push({ field: ref.field, target: ref.target });
      }
    }

    if (brokenRefs.length > 0) {
      results.push({ file: relPath, brokenRefs });
      warnings += brokenRefs.length;
    }
  }

  return { results, warnings };
}

// ── CLI entry point ──────────────────────────────────────────────────

export async function main(): Promise<void> {
  // Walk up from packages/cli/src/commands/ to find the repo root
  const rootDir = resolve(
    import.meta.dirname ?? ".",
    "..",
    "..",
    "..",
    "..",
  );

  const { results, warnings } = await runCheckReferences({ rootDir });

  if (results.length === 0) {
    console.log("✔ All references resolve to known IDs.");
    process.exit(0);
  }

  for (const r of results) {
    console.warn(`⚠ ${r.file}`);
    for (const br of r.brokenRefs) {
      console.warn(`    ${br.field} → ${br.target} (not found)`);
    }
  }

  console.warn(
    `\n${warnings} broken reference(s) found (reported as warnings in alpha).`,
  );

  // Alpha: always exit 0 — many records are not yet authored
  process.exit(0);
}
