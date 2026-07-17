/**
 * Validate the project's funding.json manifest.
 *
 * Checks:
 * 1. Parses as strict JSON
 * 2. Validates against the official funding.json v1.1.0 schema
 * 3. Contact email is opensource@clarvia.org (project policy)
 * 4. Repository URL points to clarvia-org/clarvia-graph (factual accuracy)
 * 5. All URLs are well-formed https:// URLs
 *
 * SPDX-FileCopyrightText: 2025-2026 CLARVIA ASBL, Luxembourg
 * SPDX-License-Identifier: EUPL-1.2
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv from "ajv";

const ROOT = resolve(import.meta.dirname, "..");
const MANIFEST_PATH = resolve(ROOT, "funding.json");
const SCHEMA_PATH = resolve(ROOT, "schemas", "funding-json-v1.1.0.json");

const errors: string[] = [];

function fail(msg: string): void {
  errors.push(msg);
  console.error(`  ✗ ${msg}`);
}

function pass(msg: string): void {
  console.log(`  ✓ ${msg}`);
}

// ── 1. Parse JSON ──────────────────────────────────────────────────

let manifest: Record<string, unknown>;
try {
  const raw = readFileSync(MANIFEST_PATH, "utf-8");
  manifest = JSON.parse(raw) as Record<string, unknown>;
  pass("Parses as valid JSON");
} catch (err) {
  fail(`Failed to parse funding.json: ${err}`);
  process.exit(1);
}

// ── 2. Schema validation ───────────────────────────────────────────

let schema: Record<string, unknown>;
try {
  schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8")) as Record<
    string,
    unknown
  >;
} catch (err) {
  fail(`Failed to load schema: ${err}`);
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const valid = validate(manifest);

if (valid) {
  pass("Validates against funding.json v1.1.0 schema");
} else {
  for (const err of validate.errors ?? []) {
    fail(`Schema: ${err.instancePath || "/"} ${err.message}`);
  }
}

// ── 3. Project-policy checks ───────────────────────────────────────

const entity = manifest.entity as Record<string, unknown> | undefined;
if (entity) {
  if (entity.email === "opensource@clarvia.org") {
    pass("Contact email is opensource@clarvia.org");
  } else {
    fail(`Expected email opensource@clarvia.org, got: ${entity.email}`);
  }
}

// ── 4. Repository URL check ────────────────────────────────────────

const projects = manifest.projects as Array<Record<string, unknown>> | undefined;
if (projects && projects.length > 0) {
  const repoUrl = (projects[0].repositoryUrl as Record<string, unknown>)?.url;
  if (
    typeof repoUrl === "string" &&
    repoUrl.includes("clarvia-org/clarvia-graph")
  ) {
    pass("Repository URL points to clarvia-org/clarvia-graph");
  } else {
    fail(`Expected repo URL containing clarvia-org/clarvia-graph, got: ${repoUrl}`);
  }
}

// ── 5. URL well-formedness ─────────────────────────────────────────

function collectUrls(obj: unknown, path = ""): Array<{ path: string; url: string }> {
  const urls: Array<{ path: string; url: string }> = [];
  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (
        (key === "url" || key === "address" || key === "wellKnown") &&
        typeof value === "string" &&
        value.length > 0
      ) {
        urls.push({ path: currentPath, url: value });
      }
      if (typeof value === "object" && value !== null) {
        urls.push(...collectUrls(value, currentPath));
      }
    }
  }
  return urls;
}

const urls = collectUrls(manifest);
let allUrlsValid = true;
for (const { path, url } of urls) {
  if (!url.startsWith("https://")) {
    fail(`URL at ${path} does not start with https://: ${url}`);
    allUrlsValid = false;
  }
}
if (allUrlsValid) {
  pass(`All ${urls.length} URLs use https://`);
}

// ── Result ─────────────────────────────────────────────────────────

console.log("");
if (errors.length > 0) {
  console.error(`funding.json validation failed with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log("funding.json validation passed.");
}
