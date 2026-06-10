/**
 * clarvia check-anchors — Verify assertion anchors exist in snapshots.
 *
 * For every source_assertion with an `anchor.text_quote`, verifies that
 * the anchor text exists in the corresponding snapshot HTML (after
 * stripping tags).  Case-insensitive matching.
 *
 * Exit 1 if any anchor text is not found.
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

/** Strip HTML tags from a string, returning text content only. */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ") // NOSONAR — negated char class [^>]+ cannot backtrack
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "\u2019")
    .replace(/&lsquo;/gi, "\u2018")
    .replace(/&rdquo;/gi, "\u201C")
    .replace(/&ldquo;/gi, "\u201D")
    .replace(/&ndash;/gi, "\u2013")
    .replace(/&mdash;/gi, "\u2014")
    .replace(/&#\d+;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ── public result types ──────────────────────────────────────────────

export interface AnchorResult {
  assertionId: string;
  file: string;
  textQuote: string;
  snapshotId: string;
  found: boolean;
  error?: string;
}

export interface CheckAnchorsOptions {
  /** Absolute path to the repo root */
  rootDir: string;
}

// ── internal types ───────────────────────────────────────────────────

interface SnapshotRecord {
  id: string;
  archive_uri: string;
}

interface AssertionBatch {
  source_id?: string;
  source_snapshot_id?: string;
  assertions?: Array<{
    id: string;
    source_snapshot_id?: string;
    anchor?: {
      selector_type?: string;
      text_quote?: string;
    };
    [key: string]: unknown;
  }>;
}

// ── extracted helpers ────────────────────────────────────────────────

/** Glob + parse snapshot YAML files into a Map keyed by snapshot id. */
function loadSnapshotRecords(rootDir: string): Map<string, SnapshotRecord> {
  const snapshotFiles = globSync("sources/snapshots/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  const snapshots = new Map<string, SnapshotRecord>();
  for (const file of snapshotFiles) {
    try {
      const raw = readFileSync(file, "utf-8");
      const doc = parseYaml(raw) as SnapshotRecord;
      if (doc?.id && doc?.archive_uri) {
        snapshots.set(doc.id, doc);
      }
    } catch {
      // Skip unparseable files
    }
  }
  return snapshots;
}

/**
 * Check a single assertion's anchor against its snapshot HTML.
 * Returns null if the assertion has no text_quote (caller should skip).
 * Returns an AnchorResult otherwise, and sets `result.found` accordingly.
 *
 * When an HTML file is loaded and stripped, it is cached in `htmlCache`
 * for subsequent lookups.
 */
function checkAssertionAnchor(
  assertion: NonNullable<AssertionBatch["assertions"]>[number],
  batch: AssertionBatch,
  snapshots: Map<string, SnapshotRecord>,
  htmlCache: Map<string, string>,
  rootDir: string,
  relPath: string,
): AnchorResult | null {
  if (!assertion.anchor?.text_quote) return null;

  const textQuote = assertion.anchor.text_quote;
  const snapshotId =
    assertion.source_snapshot_id ?? batch.source_snapshot_id;

  if (!snapshotId) {
    return {
      assertionId: assertion.id,
      file: relPath,
      textQuote,
      snapshotId: "(missing)",
      found: false,
      error: "No source_snapshot_id found",
    };
  }

  const snapshot = snapshots.get(snapshotId);
  if (!snapshot) {
    return {
      assertionId: assertion.id,
      file: relPath,
      textQuote,
      snapshotId,
      found: false,
      error: `Snapshot record not found: ${snapshotId}`,
    };
  }

  // Get plain text from HTML
  let plainText = htmlCache.get(snapshotId);
  if (plainText === undefined) {
    const htmlPath = resolve(rootDir, snapshot.archive_uri);
    try {
      const html = readFileSync(htmlPath, "utf-8");
      plainText = stripHtmlTags(html);
      htmlCache.set(snapshotId, plainText);
    } catch {
      return {
        assertionId: assertion.id,
        file: relPath,
        textQuote,
        snapshotId,
        found: false,
        error: `Cannot read HTML: ${snapshot.archive_uri}`,
      };
    }
  }

  // Case-insensitive check
  const found = plainText
    .toLowerCase()
    .includes(textQuote.toLowerCase());

  return {
    assertionId: assertion.id,
    file: relPath,
    textQuote,
    snapshotId,
    found,
  };
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runCheckAnchors(
  opts: CheckAnchorsOptions,
): Promise<{ results: AnchorResult[]; errors: number }> {
  const { rootDir } = opts;

  // ── 1. Load snapshot records (NOT from html/) ──────────────────────
  const snapshots = loadSnapshotRecords(rootDir);

  // ── 2. Load assertion batch files ──────────────────────────────────
  const assertionFiles = globSync("sources/assertions/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  const results: AnchorResult[] = [];
  let errors = 0;

  // Cache for loaded + stripped HTML content
  const htmlCache = new Map<string, string>();

  for (const file of assertionFiles) {
    const relPath = toPosixRel(file, rootDir);
    let batch: AssertionBatch;
    try {
      const raw = readFileSync(file, "utf-8");
      batch = parseYaml(raw) as AssertionBatch;
    } catch {
      continue;
    }

    if (!batch?.assertions || !Array.isArray(batch.assertions)) continue;

    for (const assertion of batch.assertions) {
      const result = checkAssertionAnchor(
        assertion,
        batch,
        snapshots,
        htmlCache,
        rootDir,
        relPath,
      );
      if (!result) continue;

      results.push(result);
      if (!result.found) errors++;
    }
  }

  return { results, errors };
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

  const { results, errors } = await runCheckAnchors({ rootDir });

  if (results.length === 0) {
    console.log("✔ No assertions with anchors found (nothing to check).");
    process.exit(0);
  }

  for (const r of results) {
    if (r.found) {
      console.log(`  ✔ ${r.assertionId}`);
    } else {
      console.error(`  ✘ ${r.assertionId}`);
      console.error(`    text_quote: "${r.textQuote}"`);
      console.error(`    snapshot: ${r.snapshotId}`);
      if (r.error) {
        console.error(`    error: ${r.error}`);
      }
    }
  }

  const passed = results.filter((r) => r.found).length;
  console.log(
    `\n${passed}/${results.length} anchor(s) verified. ${errors} error(s).`,
  );

  process.exit(errors > 0 ? 1 : 0);
}
