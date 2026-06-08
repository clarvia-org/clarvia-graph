/**
 * Checklist Generator — the 6-step algorithm.
 *
 * Given a loaded graph and a set of user facts, produces a ChecklistOutput
 * that can be serialized to YAML/JSON and rendered in a UI.
 *
 * Steps (per spec §7.2):
 * 1. Load graph & index
 * 2. Evaluate all conditions against user facts (three-valued)
 * 3. Filter consequences by life event, jurisdiction, temporal validity,
 *    and distribution status (only public_open / public_metadata_only)
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
import { recordApplies, type TemporalContext } from "./temporal.js";

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
  resolved_subject_id: string;
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
  checklist_run_id: string;
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

// ── Distribution filter ─────────────────────────────────────────────
// Per spec §10.6, only public_open and public_metadata_only records
// may appear in generated checklists.

const PUBLIC_DISTRIBUTION = new Set(["public_open", "public_metadata_only"]);

// ── Deterministic item ID ────────────────────────────────────────────
// Per spec §14.1: hash includes task_template_id, resolved_subject_id,
// jurisdiction, authority_id, dedupe_group_key, and generator_version.

const GENERATOR_VERSION = "0.1";

function makeItemId(
  scenarioHash: string,
  taskTemplateId: string,
  resolvedSubjectId: string,
  jurisdiction: string,
  authorityId: string | null,
  dedupeGroupKey: string | null,
): string {
  const identity = [
    taskTemplateId,
    resolvedSubjectId,
    jurisdiction,
    authorityId ?? "",
    dedupeGroupKey ?? "",
    GENERATOR_VERSION,
  ].join("::");
  const hash = createHash("sha256")
    .update(identity)
    .digest("hex")
    .slice(0, 12);
  return `checklist_item.${scenarioHash}.${hash}`;
}

// ── Resolved subject ID ─────────────────────────────────────────────
// Alpha deterministic mapping from task_template.target.subject_role.
// Fallback for bereavement: person.deceased.

const SUBJECT_ROLE_MAP: Record<string, string> = {
  deceased: "person.deceased",
  survivor: "person.survivor",
  surviving_spouse: "person.survivor",
  surviving_partner: "person.survivor",
  child: "person.child",
  dependant: "person.dependant",
  estate: "estate.primary",
};

function resolveSubjectId(
  template: TaskTemplate | null,
): string {
  const role = template?.target?.subject_role;
  if (role && SUBJECT_ROLE_MAP[role]) {
    return SUBJECT_ROLE_MAP[role];
  }
  // Bereavement alpha fallback
  return "person.deceased";
}

// ── Deduplication and Merging helpers ────────────────────────────────

interface DedupeConfig {
  default_strategy?: string;
  dedupe_key_template?: string;
}

function resolveDedupeKey(
  template: (TaskTemplate & { dedupe?: DedupeConfig }) | null,
  consequence: Consequence,
): { key: string; strategy: string } {
  if (!template) {
    return { key: `consequence.${consequence.id}`, strategy: "do_not_merge" };
  }

  const dedupe = template.dedupe;
  if (!dedupe?.dedupe_key_template) {
    return { key: `template.${template.id}`, strategy: "do_not_merge" };
  }

  const strategy = dedupe.default_strategy || "do_not_merge_across_jurisdictions";
  let key = dedupe.dedupe_key_template;

  const placeholders = key.match(/\{[a-zA-Z0-9_.]+\}/g) || [];
  for (const placeholder of placeholders) {
    const name = placeholder.slice(1, -1);
    let val: string | null;
    switch (name) {
      case "action_type":
        val = template.action_type || null;
        break;
      case "jurisdiction":
        val = consequence.jurisdiction || null;
        break;
      case "life_event":
        val = consequence.life_event || null;
        break;
      case "domain":
        val = consequence.domain || null;
        break;
      case "target.object_type":
        val = template.target?.object_type || null;
        break;
      case "target.object_ref":
        val = template.target?.object_ref || null;
        break;
      case "target.subject_role":
        val = template.target?.subject_role || null;
        break;
      case "target.primary_authority_ref":
        val = template.target?.primary_authority_ref || (template.authority_refs?.[0] ?? null);
        break;
      default:
        throw new Error(`Invalid placeholder in dedupe key template: ${name}`);
    }
    key = key.replace(placeholder, String(val ?? "null"));
  }

  return { key, strategy };
}

function mergeStatuses(statuses: ItemStatus[]): ItemStatus {
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("needs_fact")) return "needs_fact";
  if (statuses.includes("maybe_applies")) return "maybe_applies";
  return "applies";
}

interface ConditionTrace {
  condition_ref: string;
  result: "true" | "false" | "unknown";
  facts_used: string[];
}

interface SourceTrace {
  source_title: string;
  publisher: string;
  official_url: string;
  assertion_refs: string[];
}

function mergeExplanationTraces(
  traces: ExplanationTrace[],
  mergedTraceId: string,
): ExplanationTrace {
  const why_visible: string[] = [];
  const conditions: ConditionTrace[] = [];
  const sources: SourceTrace[] = [];

  const seenConditionRefs = new Set<string>();

  for (const trace of traces) {
    why_visible.push(...trace.why_visible);
    for (const cond of trace.conditions) {
      if (!seenConditionRefs.has(cond.condition_ref)) {
        conditions.push(cond);
        seenConditionRefs.add(cond.condition_ref);
      }
    }
    for (const src of trace.sources) {
      const existing = sources.find(s => s.official_url === src.official_url);
      if (existing) {
        existing.assertion_refs = [...new Set([...existing.assertion_refs, ...src.assertion_refs])];
      } else {
        sources.push({ ...src });
      }
    }
  }

  return {
    id: mergedTraceId,
    why_visible: [...new Set(why_visible)],
    conditions,
    sources,
  };
}

// ── Urgency label from score ─────────────────────────────────────────

function urgencyLabel(score: number | null): string | null {
  if (score == null) return null;
  if (score >= 90) return "urgent";
  if (score >= 70) return "important";
  if (score >= 40) return "standard";
  return "low";
}

// ── Why-maybe explanation label ──────────────────────────────────────

function whyMaybeLabel(status: ItemStatus, missingFacts: string[]): string | null {
  if (status === "maybe_applies") return "Condition could not be fully evaluated";
  if (status === "needs_fact") return `Missing: ${missingFacts.join(", ")}`;
  return null;
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
  eventDate?: string;
}

// ── Candidate item (internal pipeline type) ──────────────────────────

interface CandidateItem {
  item: ChecklistItem;
  consequence: Consequence;
  template: TaskTemplate | null;
  trace: ExplanationTrace | null;
  dedupeKey: string;
  strategy: string;
}

// ── Step 3: Filter candidate consequences ────────────────────────────

function filterCandidateConsequences(
  graph: LoadedGraph,
  lifeEvent: string,
  relevantJurisdictions: Set<string>,
  temporalCtx: TemporalContext,
): Consequence[] {
  const candidates: Consequence[] = [];
  for (const [, consequence] of graph.consequences) {
    if (consequence.life_event !== lifeEvent) continue;

    if (!PUBLIC_DISTRIBUTION.has(consequence.distribution_status)) {
      continue;
    }

    const juris = consequence.jurisdiction?.toUpperCase();
    if (juris && !relevantJurisdictions.has(juris) && !relevantJurisdictions.has(juris.toLowerCase())) {
      continue;
    }

    if (!recordApplies(consequence, temporalCtx)) {
      continue;
    }

    candidates.push(consequence);
  }
  return candidates;
}

// ── Step 4: Evaluate consequence conditions ──────────────────────────

function evaluateConsequenceConditions(
  consequence: Consequence,
  conditionResultCache: Map<string, { result: TriValue; missingFacts: string[] }>,
  graph: LoadedGraph,
  facts: Fact[],
  temporalCtx: TemporalContext,
): { overallResult: TriValue; allMissingFacts: string[] } {
  const conditionRefs = consequence.trigger?.condition_refs ?? [];
  let overallResult: TriValue = true;
  const allMissingFacts: string[] = [];

  for (const condRef of conditionRefs) {
    let cached = conditionResultCache.get(condRef);
    if (!cached) {
      const condition = graph.conditions.get(condRef);
      if (!condition) {
        cached = { result: "unknown", missingFacts: [] };
      } else if (!recordApplies(condition, temporalCtx)) {
        cached = { result: false, missingFacts: [] };
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

  return { overallResult, allMissingFacts };
}

// ── Step 5: Expand consequence into candidate items ──────────────────

function expandConsequenceToItems(
  consequence: Consequence,
  overallResult: TriValue,
  allMissingFacts: string[],
  conditionRefs: string[],
  conditionResultCache: Map<string, { result: TriValue; missingFacts: string[] }>,
  scenarioHash: string,
  graph: LoadedGraph,
  temporalCtx: TemporalContext,
): CandidateItem[] {
  const taskRefs = consequence.task_template_refs ?? [];
  const results: CandidateItem[] = [];

  if (taskRefs.length === 0) {
    const item = makeItem(scenarioHash, consequence, null, overallResult, allMissingFacts, graph, temporalCtx);
    let trace: ExplanationTrace | null = null;
    if (item.status !== "does_not_apply") {
      trace = buildExplanationTrace(
        `trace.${item.id}`,
        consequence.id,
        conditionRefs,
        conditionResultCache,
        graph,
        temporalCtx,
      );
      item.explanation_trace_id = trace.id;
    }
    const { key, strategy } = resolveDedupeKey(null, consequence);
    results.push({ item, consequence, template: null, trace, dedupeKey: key, strategy });
  } else {
    for (const taskRef of taskRefs) {
      const template = graph.taskTemplates.get(taskRef);
      if (template && !recordApplies(template, temporalCtx)) {
        continue;
      }
      const item = makeItem(
        scenarioHash,
        consequence,
        template ?? null,
        overallResult,
        allMissingFacts,
        graph,
        temporalCtx,
      );

      let trace: ExplanationTrace | null = null;
      if (item.status !== "does_not_apply") {
        trace = buildExplanationTrace(
          `trace.${item.id}`,
          consequence.id,
          conditionRefs,
          conditionResultCache,
          graph,
          temporalCtx,
        );
        item.explanation_trace_id = trace.id;
      }
      const { key, strategy } = resolveDedupeKey(template ?? null, consequence);
      results.push({ item, consequence, template: template ?? null, trace, dedupeKey: key, strategy });
    }
  }

  return results;
}

// ── Deduplication pipeline ───────────────────────────────────────────

/** Group candidates into a Map keyed by their dedupeKey. */
function groupCandidatesByDedupeKey(
  candidates: CandidateItem[],
): Map<string, CandidateItem[]> {
  const groups = new Map<string, CandidateItem[]>();
  for (const c of candidates) {
    let list = groups.get(c.dedupeKey);
    if (!list) {
      list = [];
      groups.set(c.dedupeKey, list);
    }
    list.push(c);
  }
  return groups;
}

/** Add a single candidate to the output, pushing its trace if present. */
function addSingleCandidate(
  candidate: CandidateItem,
  explanationTraces: ExplanationTrace[],
): ChecklistItem {
  if (candidate.trace) {
    explanationTraces.push(candidate.trace);
  }
  return candidate.item;
}

/** Merge a group of candidates into a single checklist item. */
function mergeCandidateGroup(
  subList: CandidateItem[],
  scenarioHash: string,
  explanationTraces: ExplanationTrace[],
): ChecklistItem {
  if (subList.length === 1) {
    return addSingleCandidate(subList[0], explanationTraces);
  }

  const base = subList[0].item;


  const jurisdictions = new Set<string>();
  const neededFor = new Set<string>();
  const missingFacts = new Set<string>();
  const statuses: ItemStatus[] = [];
  const tracesToMerge: ExplanationTrace[] = [];

  let totalAssertionCount = 0;

  for (const c of subList) {
    for (const j of c.item.jurisdiction_contexts) jurisdictions.add(j);
    for (const n of c.item.needed_for) neededFor.add(n);
    for (const f of c.item.missing_fact_refs) missingFacts.add(f);
    statuses.push(c.item.status);
    if (c.trace) {
      tracesToMerge.push(c.trace);
    }
    totalAssertionCount += c.item.source_summary?.assertion_count ?? 0;
  }

  const mergedStatus = mergeStatuses(statuses);

  const mergedIdentity = subList
    .map(c => `${c.consequence.id}::${c.template?.id ?? c.consequence.id}`)
    .sort((a, b) => a.localeCompare(b))
    .join("|");
  const mergedGroupHash = createHash("sha256")
    .update(mergedIdentity)
    .digest("hex")
    .slice(0, 12);
  const mergedItemId = `checklist_item.${scenarioHash}.${mergedGroupHash}`;

  const mergedItem: ChecklistItem = {
    ...base,
    id: mergedItemId,
    status: mergedStatus,
    jurisdiction_contexts: [...jurisdictions].sort((a, b) => a.localeCompare(b)),
    needed_for: [...neededFor].sort((a, b) => a.localeCompare(b)),
    missing_fact_refs: [...missingFacts].sort((a, b) => a.localeCompare(b)),
    source_summary: {
      assertion_count: totalAssertionCount,
      top_tier: null,
    },
  };

  if (tracesToMerge.length > 0) {
    const mergedTraceId = `trace.${mergedItem.id}`;
    const mergedTrace = mergeExplanationTraces(tracesToMerge, mergedTraceId);
    explanationTraces.push(mergedTrace);
    mergedItem.explanation_trace_id = mergedTrace.id;
  }

  return mergedItem;
}

/** Group candidates by their consequence jurisdiction (uppercased). */
function groupByJurisdiction(
  list: CandidateItem[],
): Map<string, CandidateItem[]> {
  const groups = new Map<string, CandidateItem[]>();
  for (const c of list) {
    const j = c.consequence.jurisdiction.toUpperCase();
    let sub = groups.get(j);
    if (!sub) {
      sub = [];
      groups.set(j, sub);
    }
    sub.push(c);
  }
  return groups;
}

/** Process a single dedupe group according to its strategy, returning ChecklistItems. */
function processDedupeGroup(
  list: CandidateItem[],
  strategy: string,
  scenarioHash: string,
  explanationTraces: ExplanationTrace[],
): ChecklistItem[] {
  if (strategy === "do_not_merge_across_jurisdictions") {
    const jurisdictionGroups = groupByJurisdiction(list);
    const items: ChecklistItem[] = [];
    for (const [, subList] of jurisdictionGroups.entries()) {
      items.push(mergeCandidateGroup(subList, scenarioHash, explanationTraces));
    }
    return items;
  }

  if (strategy === "merge") {
    return [mergeCandidateGroup(list, scenarioHash, explanationTraces)];
  }

  return list.map(c => addSingleCandidate(c, explanationTraces));
}

/** Apply dedupe strategy to each group and produce final items. */
function applyDedupeStrategy(
  groups: Map<string, CandidateItem[]>,
  scenarioHash: string,
  explanationTraces: ExplanationTrace[],
): ChecklistItem[] {
  const finalItems: ChecklistItem[] = [];

  for (const [, list] of groups.entries()) {
    finalItems.push(...processDedupeGroup(list, list[0].strategy, scenarioHash, explanationTraces));
  }

  return finalItems;
}

// ── Step 6: Build sections from visible items ────────────────────────

function buildSections(visibleItems: ChecklistItem[]): ChecklistSection[] {
  const sectionMap = new Map<string, number>();
  for (const item of visibleItems) {
    sectionMap.set(
      item.checklist_group,
      (sectionMap.get(item.checklist_group) ?? 0) + 1,
    );
  }

  return [...sectionMap.entries()]
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
}

// ── Count temporally-valid source refs ───────────────────────────────

function countValidSourceRefs(
  candidates: Consequence[],
  graph: LoadedGraph,
  temporalCtx: TemporalContext,
): number {
  const sourceRefs = new Set<string>();
  for (const consequence of candidates) {
    for (const ref of consequence.source_assertion_refs ?? []) {
      const ass = graph.assertions.get(ref);
      if (ass && !recordApplies(ass, temporalCtx)) {
        continue;
      }
      sourceRefs.add(ref);
    }
  }
  return sourceRefs.size;
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
    eventDate: optEventDate,
  } = opts;

  // Determine reference date for temporal filtering
  const referenceDate = asOfDate ?? new Date().toISOString().slice(0, 10);

  // ─── Step 1: Normalize scenario facts ────────────────────────────
  const facts = normalizeFacts(rawFacts);

  // Determine event date for temporal filtering
  const eventDate = optEventDate ?? facts.find(f => f.fact_type === "death.date" || f.fact_type === "death.datetime")?.value ?? referenceDate;

  const temporalCtx: TemporalContext = { asOfDate: referenceDate, eventDate: String(eventDate) };

  // Compute deterministic scenario hash
  const canonicalFacts = JSON.stringify(
    [...facts].sort((a, b) => a.fact_type.localeCompare(b.fact_type)),
  );
  const scenarioHash = createHash("sha256")
    .update(`${lifeEvent}::${canonicalFacts}`)
    .digest("hex")
    .slice(0, 12);

  // ─── Step 2: Resolve jurisdiction roles ──────────────────────────
  const jurisdictionRoles = resolveJurisdictionRoles(facts);
  const relevantJurisdictions = getRelevantJurisdictions(jurisdictionRoles);
  const crossBorder = isCrossBorder(jurisdictionRoles);

  // ─── Step 3: Filter candidate consequences ──────────────────────
  const candidates = filterCandidateConsequences(graph, lifeEvent, relevantJurisdictions, temporalCtx);

  // ─── Step 4+5: Evaluate conditions + expand to items ────────────
  const conditionResultCache = new Map<string, { result: TriValue; missingFacts: string[] }>();
  const candidatesList: CandidateItem[] = [];

  for (const consequence of candidates) {
    const conditionRefs = consequence.trigger?.condition_refs ?? [];
    const { overallResult, allMissingFacts } = evaluateConsequenceConditions(
      consequence, conditionResultCache, graph, facts, temporalCtx,
    );
    candidatesList.push(...expandConsequenceToItems(
      consequence, overallResult, allMissingFacts, conditionRefs,
      conditionResultCache, scenarioHash, graph, temporalCtx,
    ));
  }

  // ─── Deduplicate and merge candidates ───────────────────────────
  const explanationTraces: ExplanationTrace[] = [];
  const groups = groupCandidatesByDedupeKey(candidatesList);
  const finalItems = applyDedupeStrategy(groups, scenarioHash, explanationTraces);

  // Sort — first by group order, then by urgency (desc), then by title
  finalItems.sort((a, b) => {
    const ga = GROUP_ORDER[a.checklist_group]?.order ?? 99;
    const gb = GROUP_ORDER[b.checklist_group]?.order ?? 99;
    if (ga !== gb) return ga - gb;

    const ua = a.urgency?.score ?? 0;
    const ub = b.urgency?.score ?? 0;
    if (ua !== ub) return ub - ua;

    return a.title.localeCompare(b.title);
  });

  // Filter out does_not_apply items from output
  const visibleItems = finalItems.filter((i) => i.status !== "does_not_apply");

  // ─── Step 6: Assemble output with summary ──────────────────────
  const counts = {
    applies: visibleItems.filter((i) => i.status === "applies").length,
    maybe_applies: visibleItems.filter((i) => i.status === "maybe_applies").length,
    needs_fact: visibleItems.filter((i) => i.status === "needs_fact").length,
    professional_review: 0,
  };

  const sections = buildSections(visibleItems);
  const sourceCount = countValidSourceRefs(candidates, graph, temporalCtx);

  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const runId = `checklist_run.${timestamp}.${scenarioHash}`;
  const checklistId = `checklist.${scenarioHash}`;

  return {
    id: checklistId,
    checklist_run_id: runId,
    life_event: lifeEvent,
    generated_at: new Date().toISOString(),
    graph_version: graphVersion,
    graph_commit: graphCommit,
    jurisdiction_roles: jurisdictionRoles,
    is_cross_border: crossBorder,
    summary: {
      item_counts: counts,
      source_count: sourceCount,
    },
    sections,
    items: visibleItems,
    explanation_traces: explanationTraces,
  };
}

// ── Item builder ─────────────────────────────────────────────────────

function makeItem(
  scenarioHash: string,
  consequence: Consequence,
  template: TaskTemplate | null,
  conditionResult: TriValue,
  missingFacts: string[],
  graph: LoadedGraph,
  temporalCtx: TemporalContext,
): ChecklistItem {
  const status = conditionResultToStatus(conditionResult, missingFacts);

  let group =
    template?.rendering?.checklist_group ?? "uncertain_needs_confirmation";
  if (status === "needs_fact" || status === "maybe_applies") {
    group = "uncertain_needs_confirmation";
  }

  let authorityName: string | null = null;
  let authorityRef: string | null = null;
  if (template?.authority_refs?.[0]) {
    authorityRef = template.authority_refs[0];
    const auth = graph.authorities.get(authorityRef);
    authorityName = auth?.name_en ?? auth?.name ?? null;
  }

  let deadlineLabel: string | null = null;
  if (template?.deadline_refs) {
    for (const ref of template.deadline_refs) {
      const dl = graph.deadlines.get(ref);
      if (dl && recordApplies(dl, temporalCtx)) {
        deadlineLabel = `${dl.title} (${dl.calculation.duration ?? "unknown"})`;
        break;
      }
    }
  }

  const urgencyScore = template?.rendering?.urgency_score ?? null;

  const filteredAssertionRefs = (consequence.source_assertion_refs ?? []).filter(ref => {
    const ass = graph.assertions?.get(ref);
    if (ass && !recordApplies(ass, temporalCtx)) {
      return false;
    }
    return true;
  });

  const resolvedSubjectId = resolveSubjectId(template);

  return {
    id: makeItemId(
      scenarioHash,
      template?.id ?? consequence.id,
      resolvedSubjectId,
      consequence.jurisdiction,
      template?.authority_refs?.[0] ?? null,
      null,
    ),
    resolved_subject_id: resolvedSubjectId,
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
    needed_for: [consequence.title],
    missing_fact_refs: missingFacts,
    why_maybe: whyMaybeLabel(status, missingFacts),
    source_summary: {
      assertion_count: filteredAssertionRefs.length,
      top_tier: null,
    },
  };
}
