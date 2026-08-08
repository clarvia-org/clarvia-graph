/**
 * Copy in-repo graph web export → apps/web/public/data/clarvia/
 *
 * Replaces the former cross-repo pin (CLARVIA_GRAPH_VERSION + fetch-clarvia-data.ts
 * that downloaded a GitHub Release asset).
 *
 * Usage (from monorepo root):
 *   pnpm export-web && pnpm sync:web-data
 *   pnpm sync:web-data   # after export-web already ran
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..");
const SRC = path.join(ROOT, "build", "exports", "web");
const DEST = path.join(ROOT, "apps", "web", "public", "data", "clarvia");

function copyRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

function main(): void {
  const manifest = path.join(SRC, "manifest.json");
  if (!fs.existsSync(manifest)) {
    console.error(
      `[sync-web-export] Missing ${manifest}. Run \`pnpm export-web\` from the monorepo root first.`
    );
    process.exit(1);
  }

  if (fs.existsSync(DEST)) {
    fs.rmSync(DEST, { recursive: true, force: true });
  }
  copyRecursive(SRC, DEST);

  const destManifest = JSON.parse(fs.readFileSync(path.join(DEST, "manifest.json"), "utf-8")) as {
    graph_version?: string;
  };
  console.log(
    `[sync-web-export] ✓ Copied build/exports/web → apps/web/public/data/clarvia/ (graph_version=${destManifest.graph_version ?? "unknown"})`
  );
}

main();
