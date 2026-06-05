/**
 * scripts/fetch-clarvia-data.ts
 *
 * Downloads the clarvia-web-export zip from a pinned clarvia-graph release
 * and extracts it to public/data/clarvia/.
 *
 * Usage:  pnpm fetch-data          (via package.json script)
 *    or:  npx tsx scripts/fetch-clarvia-data.ts
 *
 * Environment variables:
 *   GITHUB_TOKEN  – optional, used for authenticated requests (CI)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";
import { execSync } from "node:child_process";

const ROOT = path.resolve(__dirname, "..");
const VERSION_FILE = path.join(ROOT, "CLARVIA_GRAPH_VERSION");
const OUT_DIR = path.join(ROOT, "public", "data", "clarvia");
const MANIFEST = path.join(OUT_DIR, "manifest.json");

/* ── helpers ─────────────────────────────────────────────── */

function readVersion(): string {
  if (!fs.existsSync(VERSION_FILE)) {
    throw new Error(`Version file not found: ${VERSION_FILE}`);
  }
  return fs.readFileSync(VERSION_FILE, "utf-8").trim();
}

/** HTTPS GET with redirect-following and optional auth. Returns a Buffer. */
function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      "User-Agent": "clarvia-workflow-web/fetch-script",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    // Accept octet-stream for GitHub release assets
    headers["Accept"] = "application/octet-stream";

    const get = (reqUrl: string) => {
      https
        .get(reqUrl, { headers }, (res) => {
          // Follow redirects (GitHub sends 302 for release assets)
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            // On redirect, drop the Authorization header (redirect goes to S3)
            const redirectHeaders: Record<string, string> = {
              "User-Agent": headers["User-Agent"],
              Accept: "application/octet-stream",
            };
            https
              .get(res.headers.location, { headers: redirectHeaders }, (rRes) => {
                if (rRes.statusCode !== 200) {
                  reject(
                    new Error(
                      `Redirect responded with ${rRes.statusCode} for ${res.headers.location}`
                    )
                  );
                  return;
                }
                const chunks: Buffer[] = [];
                rRes.on("data", (c: Buffer) => chunks.push(c));
                rRes.on("end", () => resolve(Buffer.concat(chunks)));
                rRes.on("error", reject);
              })
              .on("error", reject);
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on("data", (c: Buffer) => chunks.push(c));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        })
        .on("error", reject);
    };

    get(url);
  });
}

/** Extract a zip buffer to a directory using the `tar` or PowerShell fallback. */
function extractZip(zipBuffer: Buffer, dest: string): void {
  // Write zip to a temp file, then extract
  const tmp = path.join(ROOT, ".clarvia-export-tmp.zip");
  fs.writeFileSync(tmp, zipBuffer);

  try {
    fs.mkdirSync(dest, { recursive: true });

    // Try `unzip` first (Linux/macOS CI), fall back to PowerShell (Windows)
    try {
      execSync(`unzip -o "${tmp}" -d "${dest}"`, { stdio: "pipe" });
    } catch {
      // PowerShell Expand-Archive
      execSync(
        `powershell -NoProfile -Command "Expand-Archive -Force -Path '${tmp}' -DestinationPath '${dest}'"`,
        { stdio: "pipe" }
      );
    }
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

/* ── main ────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const version = readVersion();
  console.log(`[fetch-clarvia-data] Pinned version: ${version}`);

  // Cache check: if manifest already exists with matching version, skip
  if (fs.existsSync(MANIFEST)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf-8"));
      if (manifest.version === version) {
        console.log(
          `[fetch-clarvia-data] public/data/clarvia/manifest.json already matches ${version} — skipping download.`
        );
        return;
      }
      console.log(
        `[fetch-clarvia-data] Existing manifest version (${manifest.version}) differs from pinned (${version}) — re-downloading.`
      );
    } catch {
      console.log(
        "[fetch-clarvia-data] Could not parse existing manifest — re-downloading."
      );
    }
  }

  const assetName = `clarvia-web-export-${version}.zip`;
  const url = `https://github.com/clarvia-org/clarvia-graph/releases/download/${version}/${assetName}`;
  console.log(`[fetch-clarvia-data] Downloading ${url}`);

  let zipBuffer: Buffer;
  try {
    zipBuffer = await download(url);
  } catch (err) {
    console.error(`[fetch-clarvia-data] ✗ Download failed: ${err}`);
    process.exit(1);
  }

  console.log(
    `[fetch-clarvia-data] Downloaded ${(zipBuffer.length / 1024).toFixed(1)} KB`
  );

  // Clean existing output
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }

  // Extract
  try {
    extractZip(zipBuffer, OUT_DIR);
  } catch (err) {
    console.error(`[fetch-clarvia-data] ✗ Extraction failed: ${err}`);
    process.exit(1);
  }

  // Verify manifest
  if (!fs.existsSync(MANIFEST)) {
    console.error(
      `[fetch-clarvia-data] ✗ manifest.json not found after extraction at ${MANIFEST}`
    );
    process.exit(1);
  }

  let manifest: { version?: string };
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf-8"));
  } catch (err) {
    console.error(
      `[fetch-clarvia-data] ✗ Could not parse manifest.json: ${err}`
    );
    process.exit(1);
  }

  if (!manifest.version) {
    console.error(
      '[fetch-clarvia-data] ✗ manifest.json is missing a "version" field.'
    );
    process.exit(1);
  }

  console.log(
    `[fetch-clarvia-data] ✓ Extracted clarvia web export ${manifest.version} to public/data/clarvia/`
  );
}

main();
