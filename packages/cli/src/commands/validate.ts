/**
 * clarvia validate — JSON Schema validation of YAML graph files.
 *
 * Early alpha implementation.  Loads schemas from schemas/v0.1/ and
 * validates every YAML data file in graph/ and sources/assertions/.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";
import type { ErrorObject } from "ajv";

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
};

// Files / paths to skip
const SKIP_FILES = new Set([".gitkeep"]);
const SKIP_PATHS = new Set(["sources/register.yml"]);

// ── helpers ──────────────────────────────────────────────────────────

/** Turn a Windows path into a forward-slash posix-style relative path */
function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

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
      if (schema["$id"] && !ajv.getSchema(schema["$id"] as string)) {
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

  const ok = results.every((r: ValidateResult) => r.valid);
  return { results, ok };
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
