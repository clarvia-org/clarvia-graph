/**
 * Three-valued condition evaluator.
 *
 * Evaluates JsonLogic expressions against intake facts.
 * Returns "true", "false", or "unknown" (when a required fact is missing).
 *
 * Per spec §6: missing_fact_behavior is always "unknown".
 */

// json-logic-js is CJS-only — handle interop carefully
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _cachedJL: any = null;

async function getJsonLogic() {
  if (_cachedJL) return _cachedJL;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("json-logic-js");
  // CJS interop: check for is_logic (a json-logic-specific method)
  if (mod.default?.is_logic) {
    _cachedJL = mod.default;
  } else if (mod.is_logic) {
    _cachedJL = mod;
  } else {
    // Fallback: try module.exports key from Node CJS interop
    const me = mod["module.exports"];
    _cachedJL = me?.is_logic ? me : mod.default ?? mod;
  }
  return _cachedJL;
}

export type TriValue = "true" | "false" | "unknown";

export interface Fact {
  fact_type: string;
  value: unknown;
  confidence?: string;
}

/**
 * Build a nested data object for JsonLogic evaluation from user facts.
 *
 * json-logic-js uses dots for nested property access, so we convert
 * flat fact_type IDs like "intake_fact.lu.bereavement.jurisdiction_of_death"
 * into nested objects: { intake_fact: { lu: { bereavement: { jurisdiction_of_death: "LU" } } } }
 */
function buildFactData(facts: Fact[]): Record<string, unknown> {
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

/**
 * Check if all "var" references in a JsonLogic expression have values.
 * If any var resolves to undefined, the fact is missing.
 */
function findMissingVars(
  expression: unknown,
  data: Record<string, unknown>,
): string[] {
  const missing: string[] = [];

  function resolveVar(varName: string): boolean {
    const parts = varName.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = data;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") {
        return false;
      }
      if (!(part in current)) return false;
      current = current[part];
    }
    return current !== undefined;
  }

  function walk(node: unknown): void {
    if (node === null || node === undefined) return;
    if (typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const obj = node as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === "var") {
      const varName = obj["var"] as string;
      if (!resolveVar(varName)) {
        missing.push(varName);
      }
    } else {
      for (const v of Object.values(obj)) walk(v);
    }
  }

  walk(expression);
  return missing;
}

/**
 * Evaluate a condition's JsonLogic expression against user facts.
 *
 * Returns:
 * - "true" if the expression evaluates to truthy and all vars are present
 * - "false" if the expression evaluates to falsy and all vars are present
 * - "unknown" if any required var is missing
 */
export async function evaluateCondition(
  expression: object,
  facts: Fact[],
): Promise<{ result: TriValue; missingFacts: string[] }> {
  const data = buildFactData(facts);
  const missingFacts = findMissingVars(expression, data);

  if (missingFacts.length > 0) {
    return { result: "unknown", missingFacts };
  }

  try {
    const jsonLogic = await getJsonLogic();
    const result = jsonLogic.apply(expression, data);
    return {
      result: result ? "true" : "false",
      missingFacts: [],
    };
  } catch {
    // If JsonLogic evaluation fails, treat as unknown
    return { result: "unknown", missingFacts: [] };
  }
}
