/**
 * Graph Loader — loads all YAML records from the graph into typed maps.
 *
 * Early alpha implementation. Loads files from disk and indexes by ID.
 */

import { readFileSync } from "node:fs";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";

// ── Record types (minimal typed interfaces for alpha) ────────────────

export interface GraphRecord {
  id: string;
  schema_version: string;
  [key: string]: unknown;
}

export interface Consequence extends GraphRecord {
  title: string;
  consequence_type: string;
  jurisdiction: string;
  life_event: string;
  domain: string;
  trigger?: { condition_refs?: string[] };
  task_template_refs?: string[];
  source_assertion_refs?: string[];
  authoring_status: string;
  distribution_status: string;
  confidence?: string;
  record_valid_from: string;
  record_valid_to?: string | null;
}

export interface TaskTemplate extends GraphRecord {
  title: string;
  action_type: string;
  jurisdiction: string;
  life_event: string;
  domain: string;
  authority_refs?: string[];
  deadline_refs?: string[];
  evidence_requirements?: {
    satisfy_if: string;
    sets: Array<{
      id: string;
      operator: string;
      evidence_type_refs: string[];
    }>;
  };
  rendering?: {
    checklist_group?: string;
    urgency_score?: number | null;
    dependency_rank?: number | null;
    user_visible_caveat?: string | null;
  };
  authoring_status: string;
  distribution_status: string;
}

export interface Condition extends GraphRecord {
  title: string;
  condition_type: string;
  jurisdiction: string;
  life_event: string;
  domain: string;
  expression_language: string;
  expression: object;
  missing_fact_behavior: string;
}

export interface Deadline extends GraphRecord {
  title: string;
  deadline_type: string;
  calculation: {
    kind: string;
    duration?: string | null;
    starts_from_fact?: string | null;
    calendar?: string;
    if_weekend_or_holiday?: string;
  };
}

export interface Authority extends GraphRecord {
  name: string;
  name_en?: string;
  jurisdiction: string;
}

export interface EvidenceType extends GraphRecord {
  canonical_name: string;
  synonyms?: string[];
  jurisdiction: string;
}

export interface IntakeFactType extends GraphRecord {
  path: string;
  label: string;
  value_type: string;
  cardinality: string;
}

// ── The loaded graph ─────────────────────────────────────────────────

export interface LoadedGraph {
  consequences: Map<string, Consequence>;
  taskTemplates: Map<string, TaskTemplate>;
  conditions: Map<string, Condition>;
  deadlines: Map<string, Deadline>;
  authorities: Map<string, Authority>;
  evidenceTypes: Map<string, EvidenceType>;
  intakeFactTypes: Map<string, IntakeFactType>;
}

// ── Loader ───────────────────────────────────────────────────────────

function loadDir<T extends GraphRecord>(
  rootDir: string,
  globPattern: string,
): Map<string, T> {
  const map = new Map<string, T>();
  const files = globSync(globPattern, { cwd: rootDir, absolute: true });

  for (const file of files) {
    const base = file.split(/[\\/]/).pop()!;
    if (base === ".gitkeep") continue;

    const raw = readFileSync(file, "utf-8");
    const doc = parseYaml(raw) as T;
    if (doc?.id) {
      map.set(doc.id, doc);
    }
  }

  return map;
}

export function loadGraph(rootDir: string): LoadedGraph {
  return {
    consequences: loadDir<Consequence>(
      rootDir,
      "graph/consequences/**/*.{yml,yaml}",
    ),
    taskTemplates: loadDir<TaskTemplate>(
      rootDir,
      "graph/task_templates/**/*.{yml,yaml}",
    ),
    conditions: loadDir<Condition>(
      rootDir,
      "graph/conditions/**/*.{yml,yaml}",
    ),
    deadlines: loadDir<Deadline>(rootDir, "graph/deadlines/**/*.{yml,yaml}"),
    authorities: loadDir<Authority>(
      rootDir,
      "graph/authorities/**/*.{yml,yaml}",
    ),
    evidenceTypes: loadDir<EvidenceType>(
      rootDir,
      "graph/evidence_types/**/*.{yml,yaml}",
    ),
    intakeFactTypes: loadDir<IntakeFactType>(
      rootDir,
      "graph/intake_fact_types/**/*.{yml,yaml}",
    ),
  };
}
