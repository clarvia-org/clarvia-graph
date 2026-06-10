/**
 * clarvia validate — JSON Schema validation of YAML graph files.
 *
 * Early alpha implementation.  Loads schemas from schemas/v0.1/ and
 * validates every YAML data file in graph/ and sources/assertions/.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { toPosixRel, resolveRootDir, mergeErrors } from "../shared/utils.js";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";
import type { ErrorObject } from "ajv";
import { createHash } from "node:crypto";

// ajv/dist/2020 and ajv-formats use CJS default exports that need interop
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _ajvMod: any = await import("ajv/dist/2020.js");
const Ajv = _ajvMod.default ?? _ajvMod;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _fmtMod: any = await import("ajv-formats");
const addFormats = _fmtMod.default ?? _fmtMod;

// ── directory → schema filename mapping ──────────────────────────────
const DIR_SCHEMA_MAP: Record<string, string> = {
  "graph/authorities": "authority.schema.json",
  "graph/conditions": "condition.schema.json",
  "graph/consequences": "consequence.schema.json",
  "graph/deadlines": "deadline.schema.json",
  "graph/evidence_types": "evidence_type.schema.json",
  "graph/forms": "form.schema.json",
  "graph/task_templates": "task_template.schema.json",
  "graph/composition_rules": "composition_rule.schema.json",
  "graph/dedupe_rules": "dedupe_rule.schema.json",
  "graph/intake_fact_types": "intake_fact_type.schema.json",
  "sources/assertions": "source_assertion.schema.json",
  "sources/snapshots": "source_snapshot.schema.json",
};

// Files / paths to skip
const SKIP_FILES = new Set([".gitkeep"]);
const SKIP_PATHS = new Set(["sources/register.yml"]);



/** Resolve which schema file a YAML data file should validate against. */
function resolveSchemaFile(relPath: string): string | null {
  for (const [dir, schema] of Object.entries(DIR_SCHEMA_MAP)) {
    if (relPath.startsWith(dir + "/")) {
      return schema;
    }
  }
  return null;
}

// ── exported runner (tested in isolation) ────────────────────────────

export interface ValidateResult {
  file: string;
  schema: string;
  valid: boolean;
  errors?: string[];
}

export interface ValidateOptions {
  /** Absolute path to the repo root */
  rootDir: string;
}

export async function runValidate(
  opts: ValidateOptions,
): Promise<{ results: ValidateResult[]; ok: boolean }> {
  const { rootDir } = opts;
  const schemaDir = resolve(rootDir, "schemas", "v0.1");
  const defsDir = resolve(schemaDir, "defs");

  // ── 1. Collect YAML files ──────────────────────────────────────────
  const patterns = [
    "graph/**/*.{yml,yaml}",
    "sources/assertions/**/*.{yml,yaml}",
    "sources/snapshots/*.{yml,yaml}",
  ];
  const files = patterns.flatMap((p: string) =>
    globSync(p, { cwd: rootDir, absolute: true }),
  );

  // Filter out skippable files
  const dataFiles = files.filter((f: string) => {
    const base = f.split(/[\\/]/).pop()!;
    if (SKIP_FILES.has(base)) return false;
    const rel = toPosixRel(f, rootDir);
    if (SKIP_PATHS.has(rel)) return false;
    // Skip vocab files — validated separately
    if (rel.startsWith("vocab/")) return false;
    return true;
  });

  if (dataFiles.length === 0) {
    return { results: [], ok: true };
  }

  // ── 2. Set up Ajv ─────────────────────────────────────────────────
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
  });
  addFormats(ajv);

  // Register shared $defs schemas
  if (existsSync(defsDir)) {
    for (const defFile of globSync("*.schema.json", {
      cwd: defsDir,
      absolute: true,
    })) {
      const defSchema = JSON.parse(readFileSync(defFile, "utf-8")) as Record<string, unknown>;
      ajv.addSchema(defSchema);
    }
  }

  // Pre-load & cache entity schemas referenced by the mapping
  const schemaCache = new Map<string, Record<string, unknown>>();
  for (const schemaFile of new Set(Object.values(DIR_SCHEMA_MAP))) {
    const schemaPath = resolve(schemaDir, schemaFile);
    if (existsSync(schemaPath)) {
      const schema = JSON.parse(readFileSync(schemaPath, "utf-8")) as Record<string, unknown>;
      schemaCache.set(schemaFile, schema);
      // Only add if not already registered (avoid duplicate $id)
      if (typeof schema["$id"] === "string" && !ajv.getSchema(schema["$id"])) {
        ajv.addSchema(schema);
      }
    }
  }

  // ── 3. Validate each file ──────────────────────────────────────────
  const results: ValidateResult[] = [];

  for (const file of dataFiles) {
    const relPath = toPosixRel(file, rootDir);
    const schemaFile = resolveSchemaFile(relPath);

    if (!schemaFile) {
      results.push({
        file: relPath,
        schema: "(unknown)",
        valid: false,
        errors: [`No schema mapping for path: ${relPath}`],
      });
      continue;
    }

    const schema = schemaCache.get(schemaFile);
    if (!schema) {
      results.push({
        file: relPath,
        schema: schemaFile,
        valid: false,
        errors: [
          `Schema file not found: schemas/v0.1/${schemaFile} — it may not have been created yet`,
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
        schema: schemaFile,
        valid: false,
        errors: [`YAML parse error: ${(err as Error).message}`],
      });
      continue;
    }

    const schemaId = schema["$id"] as string | undefined;
    const validate = schemaId
      ? ajv.getSchema(schemaId)
      : ajv.compile(schema);

    if (!validate) {
      results.push({
        file: relPath,
        schema: schemaFile,
        valid: false,
        errors: [`Could not compile schema: ${schemaFile}`],
      });
      continue;
    }

    const valid = validate(data) as boolean;
    results.push({
      file: relPath,
      schema: schemaFile,
      valid,
      errors: valid
        ? undefined
        : (validate.errors ?? []).map(
            (e: ErrorObject) =>
              `${e.instancePath || "/"} ${e.message ?? "unknown error"}`,
          ),
    });
  }

  validateSnapshotsAndAnchors(rootDir, results);
  validateConditionsAndIntake(rootDir, results);

  const ok = results.every((r: ValidateResult) => r.valid);
  return { results, ok };
}

// ── Snapshot map type ────────────────────────────────────────────────

interface SnapshotEntry {
  data: Record<string, unknown>;
  file: string;
}

// ── Snapshot integrity validation ────────────────────────────────────

function validateSnapshotIntegrity(
  data: Record<string, unknown>,
  rootDir: string,
): string[] {
  const errors: string[] = [];

  if (data.http_status === undefined || data.http_status === null) {
    errors.push("Missing required field: http_status");
  }

  const contentHash = data.content_hash;
  if (typeof contentHash !== "string") {
    errors.push("Field content_hash must be a string");
  } else if (contentHash === "pending_capture" || contentHash.startsWith("pending_")) {
    errors.push(`Field content_hash has pending value: "${contentHash}"`);
  } else if (!contentHash.startsWith("sha256:")) {
    errors.push(`Field content_hash must start with "sha256:", got "${contentHash}"`);
  } else {
    errors.push(...validateArchiveHash(data, contentHash, rootDir));
  }

  return errors;
}

/** Validate archive file hash against content_hash. */
function validateArchiveHash(
  data: Record<string, unknown>,
  contentHash: string,
  rootDir: string,
): string[] {
  const errors: string[] = [];
  const archiveUri = data.archive_uri;

  if (typeof archiveUri !== "string") {
    errors.push("Field archive_uri must be a string");
    return errors;
  }

  const archivePath = resolve(rootDir, archiveUri);
  if (!existsSync(archivePath)) {
    errors.push(`Archive file does not exist at path: ${archiveUri}`);
    return errors;
  }

  try {
    const expectedHash = contentHash.substring(7).toLowerCase();
    let fileBytes = readFileSync(archivePath);
    // Clarvia convention: text archive content_hash values are computed
    // over LF-normalized UTF-8 content. Binary archive hashes use raw bytes.
    // See docs/CONVENTIONS.md.
    const isTextArchive = archivePath.endsWith(".html") || archivePath.endsWith(".txt");
    if (isTextArchive) {
      fileBytes = Buffer.from(fileBytes.toString("utf-8").replaceAll("\r\n", "\n"));
    }
    const actualHash = createHash("sha256").update(fileBytes).digest("hex").toLowerCase();
    if (actualHash !== expectedHash) {
      const method = isTextArchive ? " using Clarvia LF-normalized text hashing" : "";
      errors.push(`Hash mismatch for archive file. Expected sha256:${expectedHash}, computed sha256:${actualHash}${method}`);
    }
  } catch (err: unknown) {
    errors.push(`Error reading archive file: ${(err as Error).message}`);
  }

  return errors;
}

// ── Assertion anchor validation ──────────────────────────────────────

interface AssertionBatchData {
  assertions: unknown[];
  normalizedHtmlText: string;
  archiveUri: string;
}

/** Load and resolve an assertion batch file's snapshot and archive content. */
function loadAssertionBatchData(
  file: string,
  snapshotMap: Map<string, SnapshotEntry>,
  rootDir: string,
): AssertionBatchData | null {
  let rawData: Record<string, unknown> | null;
  try {
    rawData = parseYaml(readFileSync(file, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }

  if (!rawData || typeof rawData !== "object") return null;

  const snapshotId = rawData.source_snapshot_id;
  if (typeof snapshotId !== "string") return null;

  const snapshotEntry = snapshotMap.get(snapshotId);
  if (!snapshotEntry) return null;

  const archiveUri = snapshotEntry.data.archive_uri;
  if (typeof archiveUri !== "string") return null;

  const archivePath = resolve(rootDir, archiveUri);
  if (!existsSync(archivePath)) return null;

  let archiveContent: string;
  try {
    archiveContent = readFileSync(archivePath, "utf-8");
  } catch {
    return null;
  }

  const assertions = rawData.assertions;
  if (!Array.isArray(assertions)) return null;

  return {
    assertions,
    normalizedHtmlText: getNormalizedTextContent(archiveContent),
    archiveUri,
  };
}

function validateAssertionAnchors(
  file: string,
  snapshotMap: Map<string, SnapshotEntry>,
  rootDir: string,
): { relPath: string; errors: string[] } | null {
  const relPath = toPosixRel(file, rootDir);
  const batchData = loadAssertionBatchData(file, snapshotMap, rootDir);
  if (!batchData) return null;

  const errors: string[] = [];
  for (const assertion of batchData.assertions) {
    if (!assertion || typeof assertion !== "object") continue;
    const a = assertion as Record<string, unknown>;
    const anchor = a.anchor as Record<string, unknown> | undefined;
    if (anchor && typeof anchor === "object" && anchor.selector_type === "text_quote") {
      const textQuote = anchor.text_quote;
      if (typeof textQuote === "string") {
        const normalizedQuote = normalizeText(textQuote);
        if (!batchData.normalizedHtmlText.includes(normalizedQuote)) {
          errors.push(
            `Assertion "${a.id}" anchor text_quote "${textQuote}" not found in snapshot archive "${batchData.archiveUri}"`
          );
        }
      }
    }
  }

  return errors.length > 0 ? { relPath, errors } : null;
}

// ── Template provenance validation ───────────────────────────────────

function validateTemplateProvenance(
  file: string,
  snapshotMap: Map<string, SnapshotEntry>,
  rootDir: string,
): { relPath: string; errors: string[] } | null {
  const relPath = toPosixRel(file, rootDir);

  let data: Record<string, unknown> | null;
  try {
    data = parseYaml(readFileSync(file, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }

  if (!data || typeof data !== "object") return null;

  const errors: string[] = [];

  if (data.distribution_status === "public_open" && data.authoring_status === "approved") {
    if (!data.provenance) {
      errors.push("Public and approved task template requires a provenance block");
    }
  }

  if (data.provenance && typeof data.provenance === "object") {
    const prov = data.provenance as Record<string, unknown>;
    const ref = prov.derived_from_snapshot_ref;
    if (typeof ref !== "string") {
      errors.push("Field provenance.derived_from_snapshot_ref must be a string");
    } else if (!snapshotMap.has(ref)) {
      errors.push(`provenance.derived_from_snapshot_ref "${ref}" does not resolve to an existing source snapshot`);
    }
  }

  return errors.length > 0 ? { relPath, errors } : null;
}

// ── Snapshot and Anchor validation orchestrator ──────────────────────

function validateSnapshotsAndAnchors(
  rootDir: string,
  results: ValidateResult[],
): void {
  const snapshotFiles = globSync("sources/snapshots/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  const assertionFiles = globSync("sources/assertions/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  const snapshotMap = new Map<string, SnapshotEntry>();

  const getRel = (abs: string): string => toPosixRel(abs, rootDir);

  for (const file of snapshotFiles) {
    try {
      const raw = readFileSync(file, "utf-8");
      const data = parseYaml(raw);
      if (data && typeof data === "object" && typeof data.id === "string") {
        snapshotMap.set(data.id, { data, file });
      }
    } catch {
      // Ignore parse errors (handled by schema validator)
    }
  }

  // 1. Validate snapshot integrity
  for (const [, { data, file }] of snapshotMap.entries()) {
    const relPath = getRel(file);
    const errors = validateSnapshotIntegrity(data, rootDir);
    mergeErrors(results, relPath, "source_snapshot.schema.json", errors);
  }

  // 2. Validate assertion anchors
  for (const file of assertionFiles) {
    const result = validateAssertionAnchors(file, snapshotMap, rootDir);
    if (result) {
      mergeErrors(results, result.relPath, "source_assertion.schema.json", result.errors);
    }
  }

  // 3. Validate provenance on task templates
  const templateFiles = globSync("graph/task_templates/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  for (const file of templateFiles) {
    const result = validateTemplateProvenance(file, snapshotMap, rootDir);
    if (result) {
      mergeErrors(results, result.relPath, "task_template.schema.json", result.errors);
    }
  }
}

// ── Condition var path validation ────────────────────────────────────

const NON_INTAKE_CONDITION_VARS = new Set<string>([
  // Allowlist for internal or system variables
]);

/** Check condition var paths against intake fact types. */
function checkConditionVarPaths(
  varPaths: string[],
  intakePathToId: Map<string, string>,
): string[] {
  const errors: string[] = [];
  for (const varPath of varPaths) {
    if (NON_INTAKE_CONDITION_VARS.has(varPath)) continue;
    if (!intakePathToId.has(varPath)) {
      errors.push(`Condition references var path "${varPath}" which is not defined in any intake fact type.`);
    }
  }
  return errors;
}

/** Resolve concept ref IDs to their intake fact paths, collecting errors for missing refs. */
function resolveConceptRefPaths(
  conceptRefs: unknown,
  intakeIdToPath: Map<string, string>,
): { referencedPaths: Set<string>; errors: string[] } {
  const errors: string[] = [];
  const referencedPaths = new Set<string>();

  if (conceptRefs && Array.isArray(conceptRefs)) {
    for (const ref of conceptRefs) {
      if (typeof ref !== "string") continue;

      const path = intakeIdToPath.get(ref);
      if (path) {
        referencedPaths.add(path);
      } else {
        errors.push(`information_concept_ref "${ref}" does not resolve to any defined intake fact type.`);
      }
    }
  } else if (conceptRefs !== undefined) {
    errors.push("Field information_concept_refs must be an array");
  }

  return { referencedPaths, errors };
}

/** Check that all var paths used in a condition are covered by concept refs. */
function checkVarPathsCoverage(
  varPaths: string[],
  referencedPaths: Set<string>,
  intakePathToId: Map<string, string>,
): string[] {
  const errors: string[] = [];
  for (const varPath of varPaths) {
    if (NON_INTAKE_CONDITION_VARS.has(varPath)) continue;

    if (!referencedPaths.has(varPath) && intakePathToId.has(varPath)) {
      const matchingId = intakePathToId.get(varPath);
      errors.push(
        `Condition references var path "${varPath}" but does not reference its intake fact type ID "${matchingId}" in information_concept_refs.`
      );
    }
  }
  return errors;
}

/** Check concept refs resolve to intake fact types and cover var paths. */
function checkConceptRefs(
  conceptRefs: unknown,
  intakeIdToPath: Map<string, string>,
  varPaths: string[],
  intakePathToId: Map<string, string>,
): string[] {
  const { referencedPaths, errors } = resolveConceptRefPaths(conceptRefs, intakeIdToPath);
  errors.push(...checkVarPathsCoverage(varPaths, referencedPaths, intakePathToId));
  return errors;
}

// ── Condition-intake validation orchestrator ─────────────────────────

function validateConditionsAndIntake(
  rootDir: string,
  results: ValidateResult[],
): void {
  const conditionFiles = globSync("graph/conditions/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  const intakeFiles = globSync("graph/intake_fact_types/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  const getRel = (abs: string): string => toPosixRel(abs, rootDir);

  const intakeIdToPath = new Map<string, string>();
  const intakePathToId = new Map<string, string>();

  for (const file of intakeFiles) {
    try {
      const data = parseYaml(readFileSync(file, "utf-8"));
      if (data && typeof data === "object" && typeof data.id === "string" && typeof data.path === "string") {
        intakeIdToPath.set(data.id, data.path);
        intakePathToId.set(data.path, data.id);
      }
    } catch {
      // Ignore parse errors (handled by schema validator)
    }
  }

  for (const file of conditionFiles) {
    const relPath = getRel(file);
    let data: Record<string, unknown> | null;
    try {
      data = parseYaml(readFileSync(file, "utf-8")) as Record<string, unknown>;
    } catch {
      continue;
    }

    if (!data || typeof data !== "object") continue;

    const varPaths = extractVarPathsFromExpression(data.expression);
    const errors: string[] = [];

    errors.push(
      ...checkConditionVarPaths(varPaths, intakePathToId),
      ...checkConceptRefs(data.information_concept_refs, intakeIdToPath, varPaths, intakePathToId),
    );

    mergeErrors(results, relPath, "condition.schema.json", errors);
  }
}

function extractVarPathsFromExpression(expression: unknown): string[] {
  const paths: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const obj = node as Record<string, unknown>;
    if ("var" in obj && typeof obj.var === "string") {
      paths.push(obj.var);
    }
    for (const val of Object.values(obj)) {
      walk(val);
    }
  }

  walk(expression);
  return [...new Set(paths)];
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function getNormalizedTextContent(html: string): string {
  // Loop to handle crafted/nested comment markers like <!--<!- --> -->
  let text = html;
  let prev: string;
  do {
    prev = text;
    text = text.replace(/<!--[\s\S]*?-->/g, "");
  } while (text !== prev);
  text = text.replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities (aligned with check-anchors.ts)
  // NOTE: &amp; is decoded last to avoid double-unescaping (e.g. &amp;lt; → &lt; → <)
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&rsquo;/gi, "\u2019");
  text = text.replace(/&lsquo;/gi, "\u2018");
  text = text.replace(/&rdquo;/gi, "\u201C");
  text = text.replace(/&ldquo;/gi, "\u201D");
  text = text.replace(/&ndash;/gi, "\u2013");
  text = text.replace(/&mdash;/gi, "\u2014");
  text = text.replace(/&amp;/gi, "&");
  return normalizeText(text);
}

// ── CLI entry point ──────────────────────────────────────────────────

export async function main(): Promise<void> {
  // Walk up from packages/cli/src/commands/ to find the repo root
  const rootDir = resolveRootDir(import.meta.dirname);

  const { results, ok } = await runValidate({ rootDir });

  if (results.length === 0) {
    console.log(
      "✔ No YAML data files found (only .gitkeep placeholders). Nothing to validate.",
    );
    process.exit(0);
  }

  for (const r of results) {
    if (r.valid) {
      console.log(`✔ ${r.file}`);
    } else {
      console.error(`✘ ${r.file} (${r.schema})`);
      for (const e of r.errors ?? []) {
        console.error(`    ${e}`);
      }
    }
  }

  console.log(
    `\n${results.filter((r: ValidateResult) => r.valid).length}/${results.length} files passed validation.`,
  );
  process.exit(ok ? 0 : 1);
}
