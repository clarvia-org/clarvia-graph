/**
 * Shared CLI utilities.
 *
 * Consolidates patterns that were duplicated across multiple CLI commands.
 */

import { resolve, relative } from "node:path";

/**
 * Convert an absolute path to a POSIX-style relative path from the given root.
 *
 * Replaces the `relative(root, abs).split("\\").join("/")` pattern that
 * was duplicated in every CLI command.
 */
export function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

/**
 * Resolve the monorepo root directory from an `import.meta.dirname`
 * (or `__dirname` fallback) inside `packages/cli/src/commands/`.
 *
 * Walks up four directory levels:
 *   commands/ → src/ → cli/ → packages/ → <root>
 */
export function resolveRootDir(metaDirname: string | undefined): string {
  return resolve(metaDirname ?? ".", "..", "..", "..", "..");
}

/**
 * Append errors to a result list, merging into an existing entry if one
 * already exists for the given file path.
 *
 * This replaces the find-and-merge pattern repeated 4× in validate.ts.
 */
export function mergeErrors(
  results: Array<{ file: string; schema: string; valid: boolean; errors?: string[] }>,
  relPath: string,
  schema: string,
  errors: string[],
): void {
  if (errors.length === 0) return;

  const existing = results.find((r) => r.file === relPath);
  if (existing) {
    existing.valid = false;
    existing.errors = [...(existing.errors ?? []), ...errors];
  } else {
    results.push({
      file: relPath,
      schema,
      valid: false,
      errors,
    });
  }
}

/**
 * Get a value from a Map, inserting a new one via `factory()` if the key
 * is not yet present.
 *
 * Replaces the `let x = map.get(k); if (!x) { x = f(); map.set(k, x); }` pattern.
 */
export function getOrCreate<K, V>(
  map: Map<K, V>,
  key: K,
  factory: () => V,
): V {
  let value = map.get(key);
  if (value === undefined) {
    value = factory();
    map.set(key, value);
  }
  return value;
}
