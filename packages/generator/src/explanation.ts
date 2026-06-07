/**
 * Step 6: Explanation trace generation.
 *
 * Produces human-readable explanation traces that link checklist items
 * to their conditions, sources, and legal basis. Essential for making
 * alpha output credible to reviewers and grant evaluators.
 */

import type { LoadedGraph } from "./loader.js";
import type { TriValue } from "./evaluator.js";
import { recordApplies, type TemporalContext } from "./temporal.js";

export interface ConditionTrace {
  condition_ref: string;
  result: "true" | "false" | "unknown";
  facts_used: string[];
}

export interface SourceTrace {
  source_title: string;
  publisher: string;
  official_url: string;
  assertion_refs: string[];
}

export interface ExplanationTrace {
  id: string;
  why_visible: string[];
  conditions: ConditionTrace[];
  sources: SourceTrace[];
}

/** Convert a TriValue (true | false | "unknown") to a string label */
function triValueToString(value: TriValue): "true" | "false" | "unknown" {
  if (value === true) return "true";
  if (value === false) return "false";
  return "unknown";
}

/** Build an explanation trace for a checklist item */
export function buildExplanationTrace(
  traceId: string,
  consequenceId: string,
  conditionRefs: string[],
  conditionResults: Map<string, { result: TriValue; missingFacts: string[] }>,
  graph: LoadedGraph,
  temporalCtx?: TemporalContext,
): ExplanationTrace {
  const conditions: ConditionTrace[] = [];
  const whyVisible: string[] = [];

  for (const ref of conditionRefs) {
    const result = conditionResults.get(ref);
    const condition = graph.conditions.get(ref);

    if (result && condition) {
      const resultStr = triValueToString(result.result);

      conditions.push({
        condition_ref: ref,
        result: resultStr,
        facts_used: result.missingFacts.length > 0
          ? result.missingFacts.map((f) => `${f} (missing)`)
          : extractVarPaths(condition.expression),
      });

      if (result.result === true) {
        whyVisible.push(`${condition.title ?? ref}: satisfied`);
      } else if (result.result === "unknown") {
        whyVisible.push(`${condition.title ?? ref}: uncertain — missing facts`);
      }
    }
  }

  // Gather sources from the consequence
  const consequence = graph.consequences.get(consequenceId);
  const sources: SourceTrace[] = [];

  if (consequence) {
    // Group assertion refs by their owning source
    const sourceAssertionMap = new Map<string, string[]>();

    for (const assertionRef of consequence.source_assertion_refs ?? []) {
      const ass = graph.assertions?.get(assertionRef);
      if (ass && temporalCtx && !recordApplies(ass, temporalCtx)) {
        continue;
      }
      // Use the assertion's source_id to find the owning source
      const sourceId = ass?.source_id;
      if (sourceId) {
        const existing = sourceAssertionMap.get(sourceId);
        if (existing) {
          existing.push(assertionRef);
        } else {
          sourceAssertionMap.set(sourceId, [assertionRef]);
        }
      }
    }

    for (const [sourceId, assertionRefs] of sourceAssertionMap) {
      const source = graph.sources?.get(sourceId);
      sources.push({
        source_title: source?.title ?? sourceId,
        publisher: source?.publisher ?? "Unknown",
        official_url: source?.url ?? "",
        assertion_refs: assertionRefs,
      });
    }
  }

  return {
    id: traceId,
    why_visible: whyVisible,
    conditions,
    sources,
  };
}

/** Extract var paths from a JsonLogic expression */
function extractVarPaths(expression: unknown): string[] {
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
  return paths;
}
