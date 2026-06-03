/**
 * clarvia export-json — Export the complete graph as a single JSON file.
 *
 * Outputs to .clarvia-output/graph-export.json
 * Contains all records organized by type, plus metadata.
 */

import { resolve } from "node:path";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { loadGraph } from "@clarvia/generator";

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

  // Read package.json for version
  const pkgRaw = readFileSync(resolve(rootDir, "package.json"), "utf-8");
  const pkg = JSON.parse(pkgRaw) as { version: string };

  const mapToArray = <T>(m: Map<string, T>): T[] => [...m.values()];

  const exportData = {
    $schema: "clarvia-graph-export/v0.1",
    version: pkg.version,
    exported_at: new Date().toISOString(),
    stats: {
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
    },
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

  console.log(`\nExported ${exportData.stats.total} records:`);
  console.log(`  ${exportData.stats.consequences} consequences`);
  console.log(`  ${exportData.stats.task_templates} task templates`);
  console.log(`  ${exportData.stats.conditions} conditions`);
  console.log(`  ${exportData.stats.deadlines} deadlines`);
  console.log(`  ${exportData.stats.authorities} authorities`);
  console.log(`  ${exportData.stats.evidence_types} evidence types`);
  console.log(`  ${exportData.stats.intake_fact_types} intake fact types`);
  console.log(`\nSaved to: ${outPath}`);
}
