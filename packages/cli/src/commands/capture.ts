/**
 * clarvia capture — Fetch a source URL and save a snapshot.
 *
 * Usage:
 *   clarvia capture <source_id>
 *
 * Fetches the source's URL, normalizes line endings to LF,
 * computes a SHA-256 hash, and writes the HTML archive and
 * snapshot YAML metadata.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { createHash } from "node:crypto";
import { parse as parseYaml, stringify } from "yaml";

// ── helpers ──────────────────────────────────────────────────────────

/** Turn a Windows path into a forward-slash posix-style relative path */
function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

// ── types ────────────────────────────────────────────────────────────

interface SourceEntry {
  id: string;
  url: string;
  jurisdiction: string;
  domain: string;
  life_event: string;
  [key: string]: unknown;
}

interface SourceRegister {
  sources: SourceEntry[];
}

export interface CaptureOptions {
  /** Absolute path to the repo root */
  rootDir: string;
  /** The source ID to capture */
  sourceId: string;
  /** Override fetch for testing */
  fetchFn?: typeof globalThis.fetch;
  /** Override the current date for testing */
  now?: Date;
}

export interface CaptureResult {
  snapshotId: string;
  contentHash: string;
  htmlPath: string;
  yamlPath: string;
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runCapture(opts: CaptureOptions): Promise<CaptureResult> {
  const { rootDir, sourceId, now = new Date() } = opts;
  const fetchFn = opts.fetchFn ?? globalThis.fetch;

  // ── 1. Load source register ──────────────────────────────────────
  const registerPath = resolve(rootDir, "sources", "register.yml");
  const registerRaw = readFileSync(registerPath, "utf-8");
  const register = parseYaml(registerRaw) as SourceRegister;

  const source = register.sources.find((s) => s.id === sourceId);
  if (!source) {
    const available = register.sources.map((s) => s.id).join("\n  ");
    throw new Error(
      `Source "${sourceId}" not found in register.\n\nAvailable sources:\n  ${available}`,
    );
  }

  // ── 2. Fetch the source URL ──────────────────────────────────────
  const response = await fetchFn(source.url);
  if (response.status !== 200) {
    throw new Error(
      `HTTP ${response.status} fetching ${source.url}`,
    );
  }

  const rawText = await response.text();
  const contentType =
    response.headers.get("content-type") ?? "text/html";

  // ── 3. Normalize CRLF → LF ──────────────────────────────────────
  const normalized = rawText.replaceAll("\r\n", "\n");

  // ── 4. Compute SHA-256 hash of LF-normalized UTF-8 bytes ────────
  const hash = createHash("sha256")
    .update(normalized, "utf-8")
    .digest("hex");

  // ── 5. Derive origin and slug from source_id ─────────────────────
  // source_id format: source.<origin>.<slug>
  const parts = sourceId.split(".");
  if (parts.length < 3 || parts[0] !== "source") {
    throw new Error(
      `Invalid source_id format: "${sourceId}". Expected "source.<origin>.<slug>".`,
    );
  }
  const origin = parts[1];
  const slug = parts.slice(2).join(".");

  // ── 6. Generate date stamp ───────────────────────────────────────
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStamp = `${yyyy}_${mm}_${dd}`;
  const dateIso = `${yyyy}-${mm}-${dd}`;

  // ── 7. Write HTML archive ────────────────────────────────────────
  const fileBase = `${origin}_${slug}_${dateStamp}`;
  const htmlDir = resolve(rootDir, "sources", "snapshots", "html");
  mkdirSync(htmlDir, { recursive: true });
  const htmlPath = resolve(htmlDir, `${fileBase}.html`);
  writeFileSync(htmlPath, normalized, "utf-8");

  // ── 8. Write snapshot YAML ───────────────────────────────────────
  const snapshotId = `snapshot.${origin}.${slug}.${dateStamp}`;
  const archiveUri = `sources/snapshots/html/${fileBase}.html`;

  const snapshotData = {
    id: snapshotId,
    schema_version: "0.1.0",
    source_id: sourceId,
    captured_at: now.toISOString(),
    capture_method: "http_get",
    http_status: 200,
    content_type: contentType,
    content_hash: `sha256:${hash}`,
    archive_uri: archiveUri,
    page_url: source.url,
    authoring_status: "approved",
    distribution_status: "public_open",
    record_valid_from: dateIso,
    captured_by: "software.cli.v0.1",
    source_last_modified_at: null,
  };

  const snapshotsDir = resolve(rootDir, "sources", "snapshots");
  mkdirSync(snapshotsDir, { recursive: true });
  const yamlPath = resolve(snapshotsDir, `${fileBase}.yml`);
  writeFileSync(yamlPath, stringify(snapshotData), "utf-8");

  return {
    snapshotId,
    contentHash: `sha256:${hash}`,
    htmlPath: toPosixRel(htmlPath, rootDir),
    yamlPath: toPosixRel(yamlPath, rootDir),
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

  const sourceId = process.argv[3];
  if (!sourceId) {
    console.error("Usage: clarvia capture <source_id>");
    console.error("Example: clarvia capture source.guichet_lu.bereavement");
    process.exit(1);
  }

  try {
    const result = await runCapture({ rootDir, sourceId });

    console.log(`\n✔ Snapshot captured successfully!\n`);
    console.log(`  Snapshot ID:  ${result.snapshotId}`);
    console.log(`  Content hash: ${result.contentHash}`);
    console.log(`  HTML archive: ${result.htmlPath}`);
    console.log(`  Snapshot YAML: ${result.yamlPath}`);
    console.log(`\nNext step: run 'pnpm extract ${result.snapshotId}' to scaffold assertions.`);
  } catch (err) {
    console.error(`\n✘ Capture failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
