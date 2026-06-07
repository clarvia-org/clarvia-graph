/**
 * clarvia build-checklist — Generate a checklist from a scenario file or inline facts.
 *
 * Usage:
 *   clarvia build-checklist tests/scenarios/lu/core_bereavement.yml
 *   clarvia build-checklist --life-event bereavement --fact jurisdiction_of_death=LU
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { loadGraph, generateChecklist, type Fact } from "@clarvia/generator";

export async function main(): Promise<void> {
  const rootDir = resolve(
    import.meta.dirname ?? __dirname,
    "..",
    "..",
    "..",
    "..",
  );

  const args = process.argv.slice(3);
  let facts: Fact[] = [];
  let lifeEvent = "bereavement";

  if (args.length > 0 && !args[0].startsWith("--")) {
    // Scenario file mode
    const scenarioPath = resolve(rootDir, args[0]);
    const raw = readFileSync(scenarioPath, "utf-8");
    const scenario = parseYaml(raw) as {
      life_event: string;
      facts: Array<{ fact_type: string; value: unknown }>;
    };
    lifeEvent = scenario.life_event;
    facts = scenario.facts.map((f) => ({
      fact_type: f.fact_type,
      value: f.value,
    }));
  } else {
    // Inline mode
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--life-event" && args[i + 1]) {
        lifeEvent = args[++i];
      } else if (args[i] === "--fact" && args[i + 1]) {
        const [key, val] = args[++i].split("=");
        facts.push({ fact_type: key, value: val });
      }
    }
  }

  console.log(`Loading graph from ${rootDir}...`);
  const graph = loadGraph(rootDir);
  console.log(
    `Loaded: ${graph.consequences.size} consequences, ${graph.conditions.size} conditions, ${graph.taskTemplates.size} templates`,
  );

  console.log(`\nGenerating checklist for life_event="${lifeEvent}" with ${facts.length} facts...`);
  const output = generateChecklist({ graph, facts, lifeEvent });

  console.log(`\n${"═".repeat(60)}`);
  console.log(` CHECKLIST: ${lifeEvent}`);
  console.log(`${"═".repeat(60)}`);

  if (output.items.length === 0) {
    console.log("\n  No items match the provided facts.\n");
    process.exit(0);
  }

  // Print by section
  for (const section of output.sections) {
    console.log(`\n── ${section.label} (${section.item_count}) ──`);

    const sectionItems = output.items.filter(
      (i) => i.checklist_group === section.group,
    );

    for (const item of sectionItems) {
      const statusIcons: Record<string, string> = {
        applies: "✔",
        needs_fact: "?",
        maybe_applies: "~",
      };
      const statusIcon = statusIcons[item.status] ?? "✘";
      const urgencyTag = item.urgency?.label
        ? ` [${item.urgency.label}]`
        : "";
      console.log(`  ${statusIcon} ${item.title}${urgencyTag}`);

      if (item.action?.authority_name) {
        console.log(`    → ${item.action.authority_name}`);
      }
      if (item.urgency?.deadline_label) {
        console.log(`    ⏰ ${item.urgency.deadline_label}`);
      }
      if (item.why_maybe) {
        console.log(`    ⚠ ${item.why_maybe}`);
      }
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(
    `Summary: ${output.summary.item_counts.applies} applies, ` +
      `${output.summary.item_counts.needs_fact} needs fact, ` +
      `${output.summary.item_counts.maybe_applies} maybe`,
  );
  console.log(`Sources referenced: ${output.summary.source_count}`);
  console.log();

  // Also output as YAML
  const yamlOutput = JSON.stringify(output, null, 2);
  const outputDir = resolve(rootDir, "build", "exports", "checklist");
  const outputPath = resolve(outputDir, "last-checklist.json");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, yamlOutput);
  console.log(`Full output saved to: ${outputPath}`);
}
