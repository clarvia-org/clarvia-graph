/**
 * clarvia export-web — Export web runtime bundle for workflow-web.
 *
 * Produces:
 *   build/exports/web/
 *     manifest.json            — index of available life events, jurisdictions, version
 *     intake/bereavement.json  — intake fact types with multilingual labels + options
 *     runtime/bereavement.json — pre-compiled runtime data (conditions, consequences,
 *                                task templates with resolved refs)
 *
 * Publication gate: only consequences with distribution_status public_open or
 * public_metadata_only are included in the export (spec §10.6).
 *
 * The web app loads manifest.json, then lazily loads intake + runtime per life event.
 * The client-side LocalResolver evaluates conditions using the runtime data.
 */

import { resolve } from "node:path";
import { resolveRootDir } from "../shared/utils.js";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { loadGraph } from "@clarvia/generator";
import type { LoadedGraph } from "@clarvia/generator";

/** Distribution statuses allowed in public web export. */
const PUBLIC_DISTRIBUTION = new Set(["public_open", "public_metadata_only"]);

/** Jurisdiction vocab entry shape. */
interface JurisdictionEntry {
  id: string;
  label: string;
  label_fr?: string;
  label_de?: string;
}

/** Load jurisdiction vocab for multilingual labels. */
function loadJurisdictionVocab(rootDir: string): JurisdictionEntry[] {
  const vocabPath = resolve(rootDir, "vocab", "jurisdictions.yml");
  if (!existsSync(vocabPath)) return [];
  const raw = readFileSync(vocabPath, "utf-8");
  const doc = parseYaml(raw) as { entries?: JurisdictionEntry[] } | JurisdictionEntry[];
  if (Array.isArray(doc)) return doc;
  return doc?.entries ?? [];
}

export async function main(): Promise<void> {
  const rootDir = resolveRootDir(import.meta.dirname ?? __dirname);

  console.log(`Loading graph from ${rootDir}...`);
  const graph = loadGraph(rootDir);

  const pkgRaw = readFileSync(resolve(rootDir, "package.json"), "utf-8");
  const pkg = JSON.parse(pkgRaw) as { version: string };

  // Get git commit for provenance
  let gitCommit = "unknown";
  try {
    gitCommit = execSync("git rev-parse --short HEAD", { // NOSONAR — hardcoded command, no user input
      cwd: rootDir,
      env: { PATH: process.env.PATH ?? "" },
    })
      .toString()
      .trim();
  } catch {
    // Not in a git repo — skip
  }

  const webDir = resolve(rootDir, "build", "exports", "web");

  // Load vocab for multilingual labels
  const jurisdictionVocab = loadJurisdictionVocab(rootDir);

  // Discover life events from public consequences only
  const lifeEvents = new Set<string>();
  const jurisdictions = new Set<string>();
  for (const [, c] of graph.consequences) {
    if (!PUBLIC_DISTRIBUTION.has(c.distribution_status)) continue;
    lifeEvents.add(c.life_event);
    jurisdictions.add(c.jurisdiction);
  }

  // Create output directories
  mkdirSync(resolve(webDir, "intake"), { recursive: true });
  mkdirSync(resolve(webDir, "runtime"), { recursive: true });

  // Generate per-life-event files
  for (const lifeEvent of lifeEvents) {
    buildIntakeFile(graph, lifeEvent, webDir, jurisdictionVocab);
    buildRuntimeFile(graph, lifeEvent, webDir);
  }

  // Generate manifest
  const manifest = {
    $schema: "clarvia-web-export/v0.1",
    graph_version: pkg.version,
    graph_commit: gitCommit,
    export_version: "0.1.0",
    generated_at: new Date().toISOString(),
    life_events: [...lifeEvents].map((le) => ({
      id: le,
      intake_url: `intake/${le}.json`,
      runtime_url: `runtime/${le}.json`,
      jurisdictions: [...jurisdictions],
    })),
  };

  writeFileSync(
    resolve(webDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`\nWeb export complete:`);
  console.log(`  Graph version: ${pkg.version} (${gitCommit})`);
  console.log(`  Life events: ${[...lifeEvents].join(", ")}`);
  console.log(`  Jurisdictions: ${[...jurisdictions].join(", ")}`);
  console.log(`  Output: ${webDir}/`);
  console.log(`    manifest.json`);
  for (const le of lifeEvents) {
    console.log(`    intake/${le}.json`);
    console.log(`    runtime/${le}.json`);
  }
}

/**
 * Build intake file — list of questions the UI needs to ask for a life event.
 * Includes multilingual labels and jurisdiction options from vocab.
 */
function buildIntakeFile(
  graph: LoadedGraph,
  lifeEvent: string,
  webDir: string,
  jurisdictionVocab: JurisdictionEntry[],
): void {
  // Find all intake fact types referenced by conditions for this life event
  // (only conditions referenced by public consequences)
  const publicConditionIds = new Set<string>();
  for (const [, c] of graph.consequences) {
    if (c.life_event !== lifeEvent) continue;
    if (!PUBLIC_DISTRIBUTION.has(c.distribution_status)) continue;
    for (const ref of c.trigger?.condition_refs ?? []) {
      publicConditionIds.add(ref);
    }
  }

  const factPaths = new Set<string>();
  for (const [, condition] of graph.conditions) {
    if (!publicConditionIds.has(condition.id) && condition.life_event !== lifeEvent) continue;
    extractVarRefs(condition.expression, factPaths);
  }

  // Resolve to full intake fact type records
  const questions = [...graph.intakeFactTypes.values()]
    .filter((ft) => factPaths.has(ft.path))
    .map((q) => {
      const options = buildQuestionOptions(q.value_type, jurisdictionVocab);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = q as any;

      return {
        id: q.id,
        path: q.path,
        label: q.label,
        label_en: raw.label_en ?? q.label,
        label_fr: raw.label_fr ?? q.label,
        label_de: raw.label_de ?? q.label,
        value_type: q.value_type,
        cardinality: q.cardinality,
        ...(options.length > 0 ? { options } : {}),
      };
    });

  const intake = {
    life_event: lifeEvent,
    questions,
  };

  writeFileSync(
    resolve(webDir, "intake", `${lifeEvent}.json`),
    JSON.stringify(intake, null, 2),
  );
}

/** Build options array for a question. Only jurisdiction_code types get options. */
function buildQuestionOptions(
  valueType: string,
  jurisdictionVocab: JurisdictionEntry[],
): Array<{
  value: string;
  label_en: string;
  label_fr: string;
  label_de: string;
}> {
  if (valueType !== "jurisdiction_code") return [];

  const options: Array<{
    value: string;
    label_en: string;
    label_fr: string;
    label_de: string;
  }> = [];

  // Add real jurisdiction options (exclude meta-jurisdictions)
  const realJurisdictions = jurisdictionVocab.filter(
    (j) => !["EU", "XBORDER", "GLOBAL"].includes(j.id),
  );
  for (const j of realJurisdictions) {
    options.push({
      value: j.id,
      label_en: j.label,
      label_fr: j.label_fr ?? j.label,
      label_de: j.label_de ?? j.label,
    });
  }

  // Add "I don't know" option
  options.push({
    value: "UNKNOWN",
    label_en: "I don't know",
    label_fr: "Je ne sais pas",
    label_de: "Ich weiß nicht",
  });

  return options;
}

/** Collect all transitively referenced entity IDs from consequences. */
interface TransitiveRefs {
  conditionIds: Set<string>;
  taskTemplateIds: Set<string>;
  authorityIds: Set<string>;
  deadlineIds: Set<string>;
  evidenceTypeIds: Set<string>;
}

/** Collect evidence type refs from a single task template. */
function collectEvidenceTypeRefs(
  t: { evidence_requirements?: { sets: Array<{ evidence_type_refs: string[] }> } },
): string[] {
  if (!t.evidence_requirements) return [];
  const refs: string[] = [];
  for (const set of t.evidence_requirements.sets) {
    for (const ref of set.evidence_type_refs) refs.push(ref);
  }
  return refs;
}

function collectTaskTemplateRefs(
  taskTemplateIds: Set<string>,
  graph: LoadedGraph,
): { authorityIds: Set<string>; deadlineIds: Set<string>; evidenceTypeIds: Set<string> } {
  const authorityIds = new Set<string>();
  const deadlineIds = new Set<string>();
  const evidenceTypeIds = new Set<string>();

  for (const id of taskTemplateIds) {
    const t = graph.taskTemplates.get(id);
    if (!t) continue;
    for (const ref of t.authority_refs ?? []) authorityIds.add(ref);
    for (const ref of t.deadline_refs ?? []) deadlineIds.add(ref);
    for (const ref of collectEvidenceTypeRefs(t)) evidenceTypeIds.add(ref);
  }

  return { authorityIds, deadlineIds, evidenceTypeIds };
}

function collectTransitiveRefs(
  consequences: Array<Record<string, unknown>>,
  graph: LoadedGraph,
): TransitiveRefs {
  const conditionIds = new Set<string>();
  const taskTemplateIds = new Set<string>();

  for (const c of consequences) {
    for (const ref of (c.trigger as Record<string, unknown>)?.condition_refs as string[] ?? []) {
      conditionIds.add(ref);
    }
    for (const ref of c.task_template_refs as string[] ?? []) {
      taskTemplateIds.add(ref);
    }
  }

  const { authorityIds, deadlineIds, evidenceTypeIds } = collectTaskTemplateRefs(taskTemplateIds, graph);

  return { conditionIds, taskTemplateIds, authorityIds, deadlineIds, evidenceTypeIds };
}

/**
 * Build runtime file — all data needed for client-side evaluation.
 * Only includes public consequences (per spec §10.6 publication gate).
 */
function buildRuntimeFile(
  graph: LoadedGraph,
  lifeEvent: string,
  webDir: string,
): void {
  // Filter consequences by life event AND distribution_status
  const consequences = [...graph.consequences.values()].filter(
    (c) =>
      c.life_event === lifeEvent &&
      PUBLIC_DISTRIBUTION.has(c.distribution_status),
  );

  const refs = collectTransitiveRefs(consequences, graph);

  const conditions = [...graph.conditions.values()].filter(
    (c) => refs.conditionIds.has(c.id),
  );

  const runtime = {
    life_event: lifeEvent,
    conditions: conditions.map((c) => ({
      id: c.id,
      title: c.title,
      expression_language: c.expression_language,
      expression: c.expression,
      missing_fact_behavior: c.missing_fact_behavior,
    })),
    consequences: consequences.map((c) => ({
      id: c.id,
      title: c.title,
      consequence_type: c.consequence_type,
      jurisdiction: c.jurisdiction,
      distribution_status: c.distribution_status,
      trigger: c.trigger,
      task_template_refs: c.task_template_refs,
      confidence: c.confidence,
    })),
    task_templates: [...refs.taskTemplateIds]
      .map((id) => graph.taskTemplates.get(id))
      .filter(Boolean)
      .map((t) => ({
        id: t!.id,
        title: t!.title,
        action_type: t!.action_type,
        authority_refs: t!.authority_refs,
        deadline_refs: t!.deadline_refs,
        evidence_requirements: t!.evidence_requirements,
        rendering: t!.rendering,
      })),
    authorities: [...refs.authorityIds]
      .map((id) => graph.authorities.get(id))
      .filter(Boolean)
      .map((a) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = a as any;
        return {
          id: a!.id,
          name: a!.name,
          name_en: a!.name_en ?? a!.name,
          name_de: raw.name_de ?? a!.name,
        };
      }),
    deadlines: [...refs.deadlineIds]
      .map((id) => graph.deadlines.get(id))
      .filter(Boolean)
      .map((d) => ({
        id: d!.id,
        title: d!.title,
        deadline_type: d!.deadline_type,
        calculation: d!.calculation,
      })),
    evidence_types: [...refs.evidenceTypeIds]
      .map((id) => graph.evidenceTypes.get(id))
      .filter(Boolean)
      .map((e) => ({
        id: e!.id,
        canonical_name: e!.canonical_name,
        synonyms: e!.synonyms,
      })),
  };

  writeFileSync(
    resolve(webDir, "runtime", `${lifeEvent}.json`),
    JSON.stringify(runtime, null, 2),
  );
}

/**
 * Extract all JsonLogic var references from an expression.
 */
function extractVarRefs(expression: unknown, refs: Set<string>): void {
  if (expression === null || expression === undefined) return;
  if (typeof expression !== "object") return;

  if (Array.isArray(expression)) {
    for (const item of expression) extractVarRefs(item, refs);
    return;
  }

  const obj = expression as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 1 && keys[0] === "var") {
    refs.add(obj["var"] as string);
  } else {
    for (const v of Object.values(obj)) extractVarRefs(v, refs);
  }
}
