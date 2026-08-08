/**
 * apps/web prebuild helper: ensure public/data/clarvia/ is present.
 *
 * Prefer an in-repo copy from ../../build/exports/web (same checkout).
 * If that export is missing but a previously synced tree exists, keep it
 * (supports Coolify builds that only need the committed/synced data).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const APP_ROOT = path.resolve(import.meta.dirname ?? __dirname, "..");
const MONOREPO_ROOT = path.resolve(APP_ROOT, "..", "..");
const SRC = path.join(MONOREPO_ROOT, "build", "exports", "web");
const DEST = path.join(APP_ROOT, "public", "data", "clarvia");
const DEST_MANIFEST = path.join(DEST, "manifest.json");
const SRC_MANIFEST = path.join(SRC, "manifest.json");

function main(): void {
  if (fs.existsSync(SRC_MANIFEST)) {
    console.log("[sync-web-data] Found build/exports/web — running monorepo sync-web-export");
    execSync("pnpm exec tsx scripts/sync-web-export.ts", {
      cwd: MONOREPO_ROOT,
      stdio: "inherit",
    });
    return;
  }

  if (fs.existsSync(DEST_MANIFEST)) {
    console.log(
      "[sync-web-data] No build/exports/web; using existing apps/web/public/data/clarvia/"
    );
    return;
  }

  console.error(
    "[sync-web-data] Missing graph web export. From monorepo root run: pnpm export-web && pnpm sync:web-data"
  );
  process.exit(1);
}

main();
