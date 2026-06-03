/**
 * clarvia export-web — Export web runtime bundle for workflow-web.
 *
 * Produces:
 *   .clarvia-output/web/
 *     manifest.json          — index of available life events and jurisdictions
 *     intake/bereavement.json — intake fact types needed for bereavement
 *     runtime/bereavement.json — pre-compiled runtime data (conditions, consequences,
 *                                task templates with resolved refs)
 *
 * The web app loads manifest.json, then lazily loads intake + runtime per life event.
 * The client-side LocalResolver evaluates conditions using the runtime data.
 */

import { resolve } from "node:path";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { loadGraph } from "@clarvia/generator";
import type { LoadedGraph } from "@clarvia/generator";

export async function main(): Promise<void> {
  const rootDir = resolve(
    import.meta.dirname ?? __dirname,
    "..",
    "..",
    "..",
    "..",
  );

  console.log(`Loading graph from ${rootDir}...`);
  const graph = loadGraph(rootDir);

  const pkgRaw = readFileSync(resolve(rootDir, "package.json"), "utf-8");
  const pkg = JSON.parse(pkgRaw) as { version: string };

  const webDir = resolve(rootDir, "build", "exports", "web");

  // Discover life events from consequences
  const lifeEvents = new Set<string>();
  const jurisdictions = new Set<string>();
  for (const [, c] of graph.consequences) {
    lifeEvents.add(c.life_event);
    jurisdictions.add(c.jurisdiction);
  }

  // Create output directories
  mkdirSync(resolve(webDir, "intake"), { recursive: true });
  mkdirSync(resolve(webDir, "runtime"), { recursive: true });

  // Generate per-life-event files
  for (const lifeEvent of lifeEvents) {
    buildIntakeFile(graph, lifeEvent, webDir);
    buildRuntimeFile(graph, lifeEvent, webDir);
  }

  // Generate manifest
  const manifest = {
    $schema: "clarvia-web-export/v0.1",
    version: pkg.version,
    exported_at: new Date().toISOString(),
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
 */
function buildIntakeFile(
  graph: LoadedGraph,
  lifeEvent: string,
  webDir: string,
): void {
  // Find all intake fact types referenced by conditions for this life event
  const factTypeIds = new Set<string>();
  for (const [, condition] of graph.conditions) {
    if (condition.life_event !== lifeEvent) continue;
    // Extract var references from the expression
    extractVarRefs(condition.expression, factTypeIds);
  }

  // Resolve to full intake fact type records
  const questions = [...factTypeIds]
    .map((id) => {
      const factType = graph.intakeFactTypes.get(id);
      if (!factType) {
        // Try to find by path matching
        for (const [, ft] of graph.intakeFactTypes) {
          if (ft.path === id || ft.id === id) return ft;
        }
        return null;
      }
      return factType;
    })
    .filter(Boolean);

  const intake = {
    life_event: lifeEvent,
    questions: questions.map((q) => ({
      id: q!.id,
      path: q!.path,
      label: q!.label,
      value_type: q!.value_type,
      cardinality: q!.cardinality,
    })),
  };

  writeFileSync(
    resolve(webDir, "intake", `${lifeEvent}.json`),
    JSON.stringify(intake, null, 2),
  );
}

/**
 * Build runtime file — all data needed for client-side evaluation.
 */
function buildRuntimeFile(
  graph: LoadedGraph,
  lifeEvent: string,
  webDir: string,
): void {
  // Filter records by life event
  const consequences = [...graph.consequences.values()].filter(
    (c) => c.life_event === lifeEvent,
  );
  const conditions = [...graph.conditions.values()].filter(
    (c) => c.life_event === lifeEvent,
  );

  // Collect referenced task templates, authorities, deadlines, evidence types
  const taskTemplateIds = new Set<string>();
  const authorityIds = new Set<string>();
  const deadlineIds = new Set<string>();
  const evidenceTypeIds = new Set<string>();

  for (const c of consequences) {
    for (const ref of c.task_template_refs ?? []) taskTemplateIds.add(ref);
  }

  for (const id of taskTemplateIds) {
    const t = graph.taskTemplates.get(id);
    if (t) {
      for (const ref of t.authority_refs ?? []) authorityIds.add(ref);
      for (const ref of t.deadline_refs ?? []) deadlineIds.add(ref);
      if (t.evidence_requirements) {
        for (const set of t.evidence_requirements.sets) {
          for (const ref of set.evidence_type_refs) evidenceTypeIds.add(ref);
        }
      }
    }
  }

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
      trigger: c.trigger,
      task_template_refs: c.task_template_refs,
      confidence: c.confidence,
    })),
    task_templates: [...taskTemplateIds]
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
    authorities: [...authorityIds]
      .map((id) => graph.authorities.get(id))
      .filter(Boolean)
      .map((a) => ({
        id: a!.id,
        name: a!.name,
        name_en: a!.name_en,
      })),
    deadlines: [...deadlineIds]
      .map((id) => graph.deadlines.get(id))
      .filter(Boolean)
      .map((d) => ({
        id: d!.id,
        title: d!.title,
        deadline_type: d!.deadline_type,
        calculation: d!.calculation,
      })),
    evidence_types: [...evidenceTypeIds]
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
