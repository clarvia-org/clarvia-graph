/**
 * Checklist Generator — the 6-step algorithm.
 *
 * Given a loaded graph and a set of user facts, produces a ChecklistOutput
 * that can be serialized to YAML/JSON and rendered in a UI.
 *
 * Steps (per spec §7.2):
 * 1. Load graph & index
 * 2. Evaluate all conditions against user facts (three-valued)
 * 3. Filter consequences by condition results
 * 4. Expand consequences into checklist items via task templates
 * 5. Sort items by checklist group and urgency
 * 6. Assemble output with summary
 */

import { createHash } from "node:crypto";
import type {
  LoadedGraph,
  Consequence,
  TaskTemplate,
} from "./loader.js";
import { evaluateCondition, type Fact, type TriValue } from "./evaluator.js";
import { normalizeFacts } from "./normalize.js";
import {
  resolveJurisdictionRoles,
  getRelevantJurisdictions,
  isCrossBorder,
  type JurisdictionRoles,
} from "./jurisdiction-roles.js";
import {
  buildExplanationTrace,
  type ExplanationTrace,
} from "./explanation.js";

// Re-export types for convenience
export type { Fact } from "./evaluator.js";

// ── Output types ─────────────────────────────────────────────────────

export type ItemStatus =
  | "applies"
  | "maybe_applies"
  | "needs_fact"
  | "blocked"
  | "does_not_apply";

export interface ChecklistItem {
  id: string;
  status: ItemStatus;
  title: string;
  description: string | null;
  jurisdiction_contexts: string[];
  checklist_group: string;
  urgency: {
    score: number | null;
    label: string | null;
    deadline_label: string | null;
    overdue: boolean | null;
  } | null;
  action: {
    action_type: string;
    authority_name: string | null;
    authority_ref: string | null;
  } | null;
  needed_for: string[];
  missing_fact_refs: string[];
  why_maybe: string | null;
  source_summary: {
    assertion_count: number;
    top_tier: string | null;
  } | null;
  explanation_trace_id?: string;
}

export interface ChecklistSection {
  group: string;
  label: string;
  item_count: number;
}

export interface ChecklistOutput {
  id: string;
  life_event: string;
  generated_at: string;
  graph_version: string;
  graph_commit: string | null;
  jurisdiction_roles: JurisdictionRoles;
  is_cross_border: boolean;
  summary: {
    item_counts: {
      applies: number;
      maybe_applies: number;
      needs_fact: number;
      professional_review: number;
    };
    source_count: number;
  };
  sections: ChecklistSection[];
  items: ChecklistItem[];
  explanation_traces: ExplanationTrace[];
}

// ── Checklist group labels and ordering ──────────────────────────────

const GROUP_ORDER: Record<string, { order: number; label: string }> = {
  immediate_formalities: { order: 1, label: "Immediate formalities" },
  money_and_benefits: { order: 2, label: "Money and benefits" },
  estate_and_inheritance: { order: 3, label: "Estate and inheritance" },
  employment_and_tax: { order: 4, label: "Employment and tax" },
  cross_border_issues: { order: 5, label: "Cross-border issues" },
  uncertain_needs_confirmation: {
    order: 6,
    label: "Uncertain — needs confirmation",
  },
  professional_review_recommended: {
    order: 7,
    label: "Professional review recommended",
  },
};

// ── Deterministic item ID ────────────────────────────────────────────

function makeItemId(
  consequenceId: string,
  taskTemplateId: string,
): string {
  const hash = createHash("sha256")
    .update(`${consequenceId}::${taskTemplateId}`)
    .digest("hex")
    .slice(0, 12);
  return `item.${hash}`;
}

// ── Urgency label from score ─────────────────────────────────────────

function urgencyLabel(score: number | null): string | null {
  if (score === null || score === undefined) return null;
  if (score >= 90) return "urgent";
  if (score >= 70) return "important";
  if (score >= 40) return "standard";
  return "low";
}

// ── Map condition TriValue to item status ─────────────────────────────

function conditionResultToStatus(
  result: TriValue,
  missingFacts: string[],
): ItemStatus {
  if (result === true) return "applies";
  if (result === false) return "does_not_apply";
  return missingFacts.length > 0 ? "needs_fact" : "maybe_applies";
}

// ── Generate options ─────────────────────────────────────────────────

export interface GenerateOptions {
  graph: LoadedGraph;
  facts: Fact[];
  lifeEvent: string;
  graphVersion?: string;
  graphCommit?: string | null;
  asOfDate?: string;
}

// ── The 6-step algorithm ─────────────────────────────────────────────

export function generateChecklist(opts: GenerateOptions): ChecklistOutput {
  const {
    graph,
    facts: rawFacts,
    lifeEvent,
    graphVersion = "0.1.0",
    graphCommit = null,
    asOfDate,
  } = opts;

  // Determine reference date for temporal filtering
  const referenceDate = asOfDate ?? new Date().toISOString().slice(0, 10);

  // ─── Step 1: Normalize scenario facts ────────────────────────────
  const facts = normalizeFacts(rawFacts);

  // ─── Step 2: Resolve jurisdiction roles ──────────────────────────
  const jurisdictionRoles = resolveJurisdictionRoles(facts);
  const relevantJurisdictions = getRelevantJurisdictions(jurisdictionRoles);
  const crossBorder = isCrossBorder(jurisdictionRoles);

  const items: ChecklistItem[] = [];
  const explanationTraces: ExplanationTrace[] = [];

  // ─── Step 3: Retrieve candidate consequences ────────────────────
  // Filter by life event, jurisdiction scope, and temporal validity
  const candidates: Consequence[] = [];
  for (const [, consequence] of graph.consequences) {
    // Filter by life event
    if (consequence.life_event !== lifeEvent) continue;

    // Filter by jurisdiction scope — include if consequence jurisdiction
    // is in the set of relevant jurisdictions
    const juris = consequence.jurisdiction?.toUpperCase();
    if (juris && !relevantJurisdictions.has(juris) && !relevantJurisdictions.has(juris.toLowerCase())) {
      continue;
    }

    // Temporal filtering
    if (
      consequence.record_valid_to &&
      consequence.record_valid_to < referenceDate
    ) {
      continue;
    }
    if (
      consequence.record_valid_from &&
      consequence.record_valid_from > referenceDate
    ) {
      continue;
    }

    candidates.push(consequence);
  }

  // ─── Step 4: Evaluate conditions ────────────────────────────────
  // Store per-condition results for explanation traces
  const conditionResultCache = new Map<string, { result: TriValue; missingFacts: string[] }>();

  for (const consequence of candidates) {
    const conditionRefs = consequence.trigger?.condition_refs ?? [];
    let overallResult: TriValue = true;
    const allMissingFacts: string[] = [];

    for (const condRef of conditionRefs) {
      // Check cache first
      let cached = conditionResultCache.get(condRef);
      if (!cached) {
        const condition = graph.conditions.get(condRef);
        if (!condition) {
          cached = { result: "unknown", missingFacts: [] };
        } else {
          cached = evaluateCondition(condition.expression, facts);
        }
        conditionResultCache.set(condRef, cached);
      }

      allMissingFacts.push(...cached.missingFacts);

      if (cached.result === false) {
        overallResult = false;
        break;
      }
      if (cached.result === "unknown") {
        overallResult = "unknown";
      }
    }

    if (conditionRefs.length === 0) {
      overallResult = true;
    }

    // ─── Step 5: Expand into checklist items via task templates ──
    const taskRefs = consequence.task_template_refs ?? [];

    if (taskRefs.length === 0) {
      items.push(
        makeItem(consequence, null, overallResult, allMissingFacts, graph),
      );
    } else {
      for (const taskRef of taskRefs) {
        const template = graph.taskTemplates.get(taskRef);
        const item = makeItem(
          consequence,
          template ?? null,
          overallResult,
          allMissingFacts,
          graph,
        );

        // Build explanation trace for visible items
        if (item.status !== "does_not_apply") {
          const trace = buildExplanationTrace(
            `trace.${item.id}`,
            consequence.id,
            conditionRefs,
            conditionResultCache,
            graph,
          );
          explanationTraces.push(trace);
          item.explanation_trace_id = trace.id;
        }

        items.push(item);
      }
    }
  }

  // Sort — first by group order, then by urgency (desc), then by title
  items.sort((a, b) => {
    const ga = GROUP_ORDER[a.checklist_group]?.order ?? 99;
    const gb = GROUP_ORDER[b.checklist_group]?.order ?? 99;
    if (ga !== gb) return ga - gb;

    const ua = a.urgency?.score ?? 0;
    const ub = b.urgency?.score ?? 0;
    if (ua !== ub) return ub - ua;

    return a.title.localeCompare(b.title);
  });

  // Filter out does_not_apply items from output
  const visibleItems = items.filter((i) => i.status !== "does_not_apply");

  // ─── Step 6: Assemble output with summary ──────────────────────
  const counts = {
    applies: visibleItems.filter((i) => i.status === "applies").length,
    maybe_applies: visibleItems.filter((i) => i.status === "maybe_applies")
      .length,
    needs_fact: visibleItems.filter((i) => i.status === "needs_fact").length,
    professional_review: 0,
  };

  const sectionMap = new Map<string, number>();
  for (const item of visibleItems) {
    sectionMap.set(
      item.checklist_group,
      (sectionMap.get(item.checklist_group) ?? 0) + 1,
    );
  }

  const sections: ChecklistSection[] = [...sectionMap.entries()]
    .map(([group, count]) => ({
      group,
      label: GROUP_ORDER[group]?.label ?? group,
      item_count: count,
    }))
    .sort(
      (a, b) =>
        (GROUP_ORDER[a.group]?.order ?? 99) -
        (GROUP_ORDER[b.group]?.order ?? 99),
    );

  // Collect unique source refs
  const sourceRefs = new Set<string>();
  for (const consequence of candidates) {
    for (const ref of consequence.source_assertion_refs ?? []) {
      sourceRefs.add(ref);
    }
  }

  // Deterministic checklist ID
  const canonicalFacts = JSON.stringify(
    [...facts].sort((a, b) => a.fact_type.localeCompare(b.fact_type)),
  );
  const scenarioHash = createHash("sha256")
    .update(`${lifeEvent}::${canonicalFacts}`)
    .digest("hex")
    .slice(0, 12);

  const checklistId = `checklist_run.${referenceDate.replace(/-/g, "")}.${scenarioHash}`;

  return {
    id: checklistId,
    life_event: lifeEvent,
    generated_at: new Date().toISOString(),
    graph_version: graphVersion,
    graph_commit: graphCommit,
    jurisdiction_roles: jurisdictionRoles,
    is_cross_border: crossBorder,
    summary: {
      item_counts: counts,
      source_count: sourceRefs.size,
    },
    sections,
    items: visibleItems,
    explanation_traces: explanationTraces,
  };
}

// ── Item builder ─────────────────────────────────────────────────────

function makeItem(
  consequence: Consequence,
  template: TaskTemplate | null,
  conditionResult: TriValue,
  missingFacts: string[],
  graph: LoadedGraph,
): ChecklistItem {
  const status = conditionResultToStatus(conditionResult, missingFacts);

  // If status is needs_fact or maybe_applies, move to appropriate group
  let group =
    template?.rendering?.checklist_group ?? "uncertain_needs_confirmation";
  if (status === "needs_fact" || status === "maybe_applies") {
    group = "uncertain_needs_confirmation";
  }

  // Resolve authority name
  let authorityName: string | null = null;
  let authorityRef: string | null = null;
  if (template?.authority_refs?.[0]) {
    authorityRef = template.authority_refs[0];
    const auth = graph.authorities.get(authorityRef);
    authorityName = auth?.name_en ?? auth?.name ?? null;
  }

  // Resolve deadline label
  let deadlineLabel: string | null = null;
  if (template?.deadline_refs?.[0]) {
    const dl = graph.deadlines.get(template.deadline_refs[0]);
    if (dl) {
      deadlineLabel = `${dl.title} (${dl.calculation.duration ?? "unknown"})`;
    }
  }

  const urgencyScore = template?.rendering?.urgency_score ?? null;

  return {
    id: makeItemId(
      consequence.id,
      template?.id ?? consequence.id,
    ),
    status,
    title: template?.title ?? consequence.title,
    description: (template as Record<string, unknown>)?.description as string | null ?? null,
    jurisdiction_contexts: [consequence.jurisdiction],
    checklist_group: group,
    urgency:
      urgencyScore !== null
        ? {
            score: urgencyScore,
            label: urgencyLabel(urgencyScore),
            deadline_label: deadlineLabel,
            overdue: null,
          }
        : null,
    action: template
      ? {
          action_type: template.action_type,
          authority_name: authorityName,
          authority_ref: authorityRef,
        }
      : null,
    needed_for: [],
    missing_fact_refs: missingFacts,
    why_maybe:
      status === "maybe_applies"
        ? "Condition could not be fully evaluated"
        : status === "needs_fact"
          ? `Missing: ${missingFacts.join(", ")}`
          : null,
    source_summary: {
      assertion_count: consequence.source_assertion_refs?.length ?? 0,
      top_tier: null,
    },
  };
}
