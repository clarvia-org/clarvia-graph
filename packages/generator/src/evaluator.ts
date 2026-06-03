/**
 * Clarvia native three-valued condition evaluator.
 *
 * Evaluates a JsonLogic-subset expression against scenario facts.
 * Returns true, false, or "unknown" — unknown is NEVER collapsed to false.
 *
 * Supported operators (v0.1 alpha):
 *   var, ==, !=, and, or, !, exists, in, >, >=, <, <=
 *
 * Three-valued truth table:
 *   missing var                   → "unknown"
 *   unknown == value              → "unknown"
 *   unknown != value              → "unknown"
 *   and(false, anything)          → false   (short-circuit)
 *   and(true, unknown)            → "unknown"
 *   or(true, anything)            → true    (short-circuit)
 *   or(false, unknown)            → "unknown"
 *   !(unknown)                    → "unknown"
 *   exists(missing)               → false
 *   exists(present)               → true
 *
 * Per spec §6.2: missing_fact_behavior is always "unknown".
 */

// ── Types ────────────────────────────────────────────────────────────

export type TriValue = true | false | "unknown";

export interface Fact {
  fact_type: string;
  value: unknown;
  confidence?: string;
}

// Sentinel value for missing/unresolved variables
const MISSING = Symbol("MISSING");

// ── Var resolution ───────────────────────────────────────────────────

/**
 * Resolve a dot-path variable from nested data.
 * Returns MISSING if the path cannot be resolved.
 */
function resolveVar(
  varName: string,
  data: Record<string, unknown>,
): unknown {
  const parts = varName.split(".");
  let current: unknown = data;
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return MISSING;
    }
    if (!(part in (current as Record<string, unknown>))) {
      return MISSING;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current === undefined ? MISSING : current;
}

// ── Build fact data ──────────────────────────────────────────────────

/**
 * Build a nested data object from flat fact entries.
 *
 * Converts:
 *   [{ fact_type: "death.place.country", value: "LU" }]
 * Into:
 *   { death: { place: { country: "LU" } } }
 */
export function buildFactData(facts: Fact[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const f of facts) {
    const parts = f.fact_type.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = f.value;
  }
  return data;
}

// ── Core recursive evaluator ─────────────────────────────────────────

/**
 * Evaluate a JsonLogic-subset expression against nested data.
 *
 * Returns:
 *   - A concrete value (string, number, boolean, array, etc.)
 *   - MISSING sentinel if a variable cannot be resolved
 *
 * The top-level evaluateCondition() converts this to a TriValue.
 */
function evaluate(
  expression: unknown,
  data: Record<string, unknown>,
): unknown {
  // Primitives pass through
  if (expression === null || expression === undefined) return expression;
  if (typeof expression !== "object") return expression;
  if (Array.isArray(expression)) return expression;

  const obj = expression as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length !== 1) return expression;

  const op = keys[0];
  const rawArgs = obj[op];

  // ── var ────────────────────────────────────────────────────────
  if (op === "var") {
    const varName = rawArgs as string;
    return resolveVar(varName, data);
  }

  // ── exists ─────────────────────────────────────────────────────
  if (op === "exists") {
    const varName = rawArgs as string;
    const resolved = resolveVar(varName, data);
    return resolved !== MISSING;
  }

  // Ensure args is an array
  const args = Array.isArray(rawArgs) ? rawArgs : [rawArgs];

  // ── ! (not) ────────────────────────────────────────────────────
  if (op === "!" || op === "not") {
    const val = evaluate(args[0], data);
    if (val === MISSING) return MISSING;
    return !val;
  }

  // ── and ────────────────────────────────────────────────────────
  // Three-valued: and(false, anything) → false (short-circuit)
  //               and(true, unknown) → unknown
  if (op === "and") {
    let hasMissing = false;
    for (const arg of args) {
      const val = evaluate(arg, data);
      if (val === MISSING) {
        hasMissing = true;
        continue; // don't short-circuit — keep checking for false
      }
      if (!val) return false; // false short-circuits
    }
    if (hasMissing) return MISSING;
    return true;
  }

  // ── or ─────────────────────────────────────────────────────────
  // Three-valued: or(true, anything) → true (short-circuit)
  //               or(false, unknown) → unknown
  if (op === "or") {
    let hasMissing = false;
    for (const arg of args) {
      const val = evaluate(arg, data);
      if (val === MISSING) {
        hasMissing = true;
        continue;
      }
      if (val) return true; // true short-circuits
    }
    if (hasMissing) return MISSING;
    return false;
  }

  // ── == ─────────────────────────────────────────────────────────
  if (op === "==" || op === "===") {
    const left = evaluate(args[0], data);
    const right = evaluate(args[1], data);
    if (left === MISSING || right === MISSING) return MISSING;
    // Use loose equality for "==" per JsonLogic convention
    return left == right;
  }

  // ── != ─────────────────────────────────────────────────────────
  if (op === "!=" || op === "!==") {
    const left = evaluate(args[0], data);
    const right = evaluate(args[1], data);
    if (left === MISSING || right === MISSING) return MISSING;
    return left != right;
  }

  // ── > ──────────────────────────────────────────────────────────
  if (op === ">") {
    const left = evaluate(args[0], data);
    const right = evaluate(args[1], data);
    if (left === MISSING || right === MISSING) return MISSING;
    return (left as number) > (right as number);
  }

  // ── >= ─────────────────────────────────────────────────────────
  if (op === ">=") {
    const left = evaluate(args[0], data);
    const right = evaluate(args[1], data);
    if (left === MISSING || right === MISSING) return MISSING;
    return (left as number) >= (right as number);
  }

  // ── < ──────────────────────────────────────────────────────────
  if (op === "<") {
    const left = evaluate(args[0], data);
    const right = evaluate(args[1], data);
    if (left === MISSING || right === MISSING) return MISSING;
    return (left as number) < (right as number);
  }

  // ── <= ─────────────────────────────────────────────────────────
  if (op === "<=") {
    const left = evaluate(args[0], data);
    const right = evaluate(args[1], data);
    if (left === MISSING || right === MISSING) return MISSING;
    return (left as number) <= (right as number);
  }

  // ── in ─────────────────────────────────────────────────────────
  if (op === "in") {
    const needle = evaluate(args[0], data);
    const haystack = evaluate(args[1], data);
    if (needle === MISSING || haystack === MISSING) return MISSING;
    if (Array.isArray(haystack)) {
      return haystack.includes(needle);
    }
    if (typeof haystack === "string" && typeof needle === "string") {
      return haystack.includes(needle);
    }
    return false;
  }

  // Unknown operator — treat as unknown
  return MISSING;
}

// ── Find missing vars ────────────────────────────────────────────────

/**
 * Walk the expression tree and collect all var paths that don't resolve.
 */
export function findMissingVars(
  expression: unknown,
  data: Record<string, unknown>,
): string[] {
  const missing: string[] = [];

  function walk(node: unknown): void {
    if (node === null || node === undefined) return;
    if (typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const obj = node as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length !== 1) return;

    const op = keys[0];
    const rawArgs = obj[op];

    if (op === "var") {
      const varName = rawArgs as string;
      if (resolveVar(varName, data) === MISSING) {
        missing.push(varName);
      }
      return;
    }

    if (op === "exists") {
      // exists doesn't contribute to "missing" — it explicitly tests presence
      return;
    }

    // Walk children
    if (Array.isArray(rawArgs)) {
      for (const item of rawArgs) walk(item);
    } else if (rawArgs && typeof rawArgs === "object") {
      walk(rawArgs);
    }
  }

  walk(expression);
  return missing;
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Evaluate a condition's JsonLogic expression against user facts.
 *
 * Returns:
 *   - result: true if the expression evaluates to truthy and all vars are present
 *   - result: false if the expression evaluates to falsy and all vars are present
 *   - result: "unknown" if any required var is missing
 *   - missingFacts: list of var paths that could not be resolved
 *
 * This function is synchronous — no external library dependency.
 */
export function evaluateCondition(
  expression: object,
  facts: Fact[],
): { result: TriValue; missingFacts: string[] } {
  const data = buildFactData(facts);
  const missingFacts = findMissingVars(expression, data);
  const rawResult = evaluate(expression, data);

  if (rawResult === MISSING) {
    return { result: "unknown", missingFacts };
  }

  return {
    result: rawResult ? true : false,
    missingFacts: [],
  };
}
