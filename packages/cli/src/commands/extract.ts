/**
 * clarvia extract — Scaffold an assertion batch from a snapshot.
 *
 * Usage:
 *   clarvia extract <snapshot_id>
 *
 * Finds the snapshot YAML, looks up the source register for
 * jurisdiction/domain/life_event metadata, and creates a
 * template assertion batch file ready for manual editing.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { globSync } from "glob";
import { parse as parseYaml, stringify } from "yaml";

// ── helpers ──────────────────────────────────────────────────────────

/** Turn a Windows path into a forward-slash posix-style relative path */
function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

// ── types ────────────────────────────────────────────────────────────

interface SnapshotData {
  id: string;
  source_id: string;
  [key: string]: unknown;
}

interface SourceEntry {
  id: string;
  jurisdiction: string;
  domain: string;
  life_event: string;
  [key: string]: unknown;
}

interface SourceRegister {
  sources: SourceEntry[];
}

export interface ExtractOptions {
  /** Absolute path to the repo root */
  rootDir: string;
  /** The snapshot ID to extract from */
  snapshotId: string;
  /** Override the current date for testing */
  now?: Date;
}

export interface ExtractResult {
  outputPath: string;
  alreadyExists: boolean;
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runExtract(opts: ExtractOptions): Promise<ExtractResult> {
  const { rootDir, snapshotId, now = new Date() } = opts;

  // ── 1. Find the snapshot YAML ────────────────────────────────────
  const snapshotFiles = globSync("sources/snapshots/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  let snapshotData: SnapshotData | undefined;
  for (const file of snapshotFiles) {
    const raw = readFileSync(file, "utf-8");
    const data = parseYaml(raw) as Record<string, unknown>;
    if (data.id === snapshotId) {
      snapshotData = data as SnapshotData;
      break;
    }
  }

  if (!snapshotData) {
    throw new Error(
      `Snapshot "${snapshotId}" not found in sources/snapshots/.`,
    );
  }

  // ── 2. Look up source in register ────────────────────────────────
  const registerPath = resolve(rootDir, "sources", "register.yml");
  const registerRaw = readFileSync(registerPath, "utf-8");
  const register = parseYaml(registerRaw) as SourceRegister;

  const sourceId = snapshotData.source_id;
  const source = register.sources.find(
    (s) => s.id === sourceId,
  );
  if (!source) {
    throw new Error(
      `Source "${snapshotData.source_id}" not found in register.`,
    );
  }

  // ── 3. Parse origin and slug from snapshot ID ────────────────────
  // snapshot_id format: snapshot.<origin>.<slug>.<date>
  const parts = snapshotId.split(".");
  if (parts.length < 4 || parts[0] !== "snapshot") {
    throw new Error(
      `Invalid snapshot_id format: "${snapshotId}". Expected "snapshot.<origin>.<slug>.<date>".`,
    );
  }
  const origin = parts[1];
  const slug = parts.slice(2, -1).join(".");

  // ── 4. Determine output path ────────────────────────────────────
  const jurisdiction = source.jurisdiction.toLowerCase();
  const outputDir = resolve(
    rootDir,
    "sources",
    "assertions",
    jurisdiction,
    origin,
  );
  const outputPath = resolve(outputDir, `${slug}.yml`);

  // ── 5. Check if file already exists ──────────────────────────────
  if (existsSync(outputPath)) {
    return {
      outputPath: toPosixRel(outputPath, rootDir),
      alreadyExists: true,
    };
  }

  // ── 6. Scaffold assertion batch ──────────────────────────────────
  const dateIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const assertionBatch = {
    source_id: snapshotData.source_id,
    source_snapshot_id: snapshotId,
    assertions: [
      {
        id: `assertion.${origin}.${slug}.<claim_slug>`,
        schema_version: "0.1.0",
        claim_type: "legal_scope",
        claim_text: "TODO: Extract the specific claim from the source.\n",
        claim_scope: {
          jurisdiction: source.jurisdiction.toUpperCase(),
          life_event: source.life_event,
          domain: source.domain,
        },
        anchor: {
          selector_type: "text_quote",
          text_quote: "TODO: paste exact quote from source",
        },
        source_tier: "official_guidance",
        record_valid_from: dateIso,
        review_status: "draft",
        confidence: "unassessed",
        provenance: {
          extraction_method: "ai_assisted",
          extracted_at: now.toISOString(),
        },
      },
    ],
  };

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, stringify(assertionBatch), "utf-8");

  return {
    outputPath: toPosixRel(outputPath, rootDir),
    alreadyExists: false,
  };
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

  const snapshotId = process.argv[3];
  if (!snapshotId) {
    console.error("Usage: clarvia extract <snapshot_id>");
    console.error(
      "Example: clarvia extract snapshot.guichet_lu.bereavement.2026_06_03",
    );
    process.exit(1);
  }

  try {
    const result = await runExtract({ rootDir, snapshotId });

    if (result.alreadyExists) {
      console.log(
        `\nAssertion file already exists: ${result.outputPath}`,
      );
      console.log("Skipping to avoid overwriting existing work.");
      process.exit(0);
    }

    console.log(`\n✔ Assertion batch scaffolded!\n`);
    console.log(`  Output: ${result.outputPath}`);
    console.log(`\nWhat to edit:`);
    console.log(`  1. Replace <claim_slug> in the assertion id`);
    console.log(
      `  2. Set claim_type (legal_scope, deadline, authority, document_required, etc.)`,
    );
    console.log(`  3. Write claim_text with the specific claim`);
    console.log(
      `  4. Paste the exact source quote in anchor.text_quote`,
    );
    console.log(`  5. Duplicate the assertion block for each claim`);
    console.log(`\nNext step: run 'pnpm validate' to check the file.`);
  } catch (err) {
    console.error(`\n✘ Extract failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
