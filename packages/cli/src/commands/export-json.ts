/**
 * clarvia export-json — Export the complete graph as a single JSON file.
 *
 * Outputs to build/exports/json/graph-export.json
 * Contains all records organized by type, plus metadata.
 */

import { resolve } from "node:path";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { loadGraph } from "@clarvia/generator";
import { resolveRootDir } from "../shared/utils.js";

export interface ExportResult {
  outPath: string;
  stats: {
    consequences: number;
    task_templates: number;
    conditions: number;
    deadlines: number;
    authorities: number;
    evidence_types: number;
    intake_fact_types: number;
    total: number;
  };
}

export function runExportJson(rootDir: string): ExportResult {
  const graph = loadGraph(rootDir);

  const pkgRaw = readFileSync(resolve(rootDir, "package.json"), "utf-8");
  const pkg = JSON.parse(pkgRaw) as { version: string };

  const mapToArray = <T>(m: Map<string, T>): T[] => [...m.values()];

  const stats = {
    consequences: graph.consequences.size,
    task_templates: graph.taskTemplates.size,
    conditions: graph.conditions.size,
    deadlines: graph.deadlines.size,
    authorities: graph.authorities.size,
    evidence_types: graph.evidenceTypes.size,
    intake_fact_types: graph.intakeFactTypes.size,
    total:
      graph.consequences.size +
      graph.taskTemplates.size +
      graph.conditions.size +
      graph.deadlines.size +
      graph.authorities.size +
      graph.evidenceTypes.size +
      graph.intakeFactTypes.size,
  };

  const exportData = {
    $schema: "clarvia-graph-export/v0.1",
    version: pkg.version,
    exported_at: new Date().toISOString(),
    stats,
    consequences: mapToArray(graph.consequences),
    task_templates: mapToArray(graph.taskTemplates),
    conditions: mapToArray(graph.conditions),
    deadlines: mapToArray(graph.deadlines),
    authorities: mapToArray(graph.authorities),
    evidence_types: mapToArray(graph.evidenceTypes),
    intake_fact_types: mapToArray(graph.intakeFactTypes),
  };

  const outDir = resolve(rootDir, "build", "exports", "json");
  mkdirSync(outDir, { recursive: true });

  const outPath = resolve(outDir, "graph-export.json");
  writeFileSync(outPath, JSON.stringify(exportData, null, 2));

  return { outPath, stats };
}

export async function main(): Promise<void> {
  const rootDir = resolveRootDir(import.meta.dirname ?? __dirname);

  console.log(`Loading graph from ${rootDir}...`);
  const { outPath, stats } = runExportJson(rootDir);

  console.log(`\nExported ${stats.total} records:`);
  console.log(`  ${stats.consequences} consequences`);
  console.log(`  ${stats.task_templates} task templates`);
  console.log(`  ${stats.conditions} conditions`);
  console.log(`  ${stats.deadlines} deadlines`);
  console.log(`  ${stats.authorities} authorities`);
  console.log(`  ${stats.evidence_types} evidence types`);
  console.log(`  ${stats.intake_fact_types} intake fact types`);
  console.log(`\nSaved to: ${outPath}`);
}
