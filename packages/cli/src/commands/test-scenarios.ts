/**
 * clarvia test-scenarios — Run scenario regression tests.
 *
 * For each scenario YAML in tests/scenarios/**\/*.yml:
 * 1. Parse facts, expected_consequence_statuses, expected_checklist_groups
 * 2. Load the graph and run generateChecklist
 * 3. Verify that each expected consequence status matches actual output
 * 4. Verify that expected checklist groups contain expected task template IDs
 *
 * Exit 1 if any scenario fails.
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { globSync } from "glob";
import { parse as parseYaml } from "yaml";
import {
  loadGraph,
  generateChecklist,
  type Fact,
} from "@clarvia/generator";

// ── helpers ──────────────────────────────────────────────────────────

/** Turn a Windows path into a forward-slash posix-style relative path */
function toPosixRel(abs: string, root: string): string {
  return relative(root, abs).split("\\").join("/");
}

// ── public result types ──────────────────────────────────────────────

export interface ScenarioFailure {
  check: string;
  expected: string;
  actual: string;
}

export interface ScenarioResult {
  id: string;
  file: string;
  title: string;
  passed: boolean;
  failures: ScenarioFailure[];
}

export interface TestScenariosOptions {
  /** Absolute path to the repo root */
  rootDir: string;
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runTestScenarios(
  opts: TestScenariosOptions,
): Promise<{ results: ScenarioResult[]; failed: number }> {
  const { rootDir } = opts;

  // ── 1. Load graph once ─────────────────────────────────────────────
  const graph = loadGraph(rootDir);

  // ── 2. Glob scenario files ─────────────────────────────────────────
  const scenarioFiles = globSync("tests/scenarios/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  if (scenarioFiles.length === 0) {
    return { results: [], failed: 0 };
  }

  const results: ScenarioResult[] = [];
  let failed = 0;

  for (const file of scenarioFiles) {
    const relPath = toPosixRel(file, rootDir);

    interface ScenarioDoc {
      id: string;
      title: string;
      life_event: string;
      facts: Array<{ fact_type: string; value: unknown }>;
      expected_consequence_statuses?: Record<string, string>;
      expected_checklist_groups?: Record<string, string[]>;
    }

    let scenario: ScenarioDoc;
    try {
      const raw = readFileSync(file, "utf-8");
      scenario = parseYaml(raw) as ScenarioDoc;
    } catch {
      results.push({
        id: "(parse error)",
        file: relPath,
        title: "(could not parse)",
        passed: false,
        failures: [
          {
            check: "parse",
            expected: "valid YAML",
            actual: "parse error",
          },
        ],
      });
      failed++;
      continue;
    }

    if (!scenario?.id || !scenario?.life_event || !scenario?.facts) {
      results.push({
        id: scenario?.id ?? "(missing id)",
        file: relPath,
        title: scenario?.title ?? "(missing title)",
        passed: false,
        failures: [
          {
            check: "structure",
            expected: "id, life_event, facts",
            actual: "missing required fields",
          },
        ],
      });
      failed++;
      continue;
    }

    // Convert scenario facts to Fact[]
    const facts: Fact[] = scenario.facts.map((f) => ({
      fact_type: f.fact_type,
      value: f.value,
    }));

    // Run the generator
    const output = generateChecklist({
      lifeEvent: scenario.life_event,
      facts,
      graph,
    });

    const failures: ScenarioFailure[] = [];

    // ── Check expected_consequence_statuses ───────────────────────
    if (scenario.expected_consequence_statuses) {
      // Build a map of consequence ID → status from the output
      // The generator outputs checklist items, not consequences directly.
      // We need to figure out which consequences apply by looking at the
      // items' needed_for and the consequence IDs.
      //
      // For now, we check against consequence evaluation by looking at
      // what task_template items got generated (and their statuses).
      // The consequence status is "applies" if any of its task_template
      // items have status "applies" or "maybe_applies".
      //
      // Alternatively, we can evaluate conditions directly. Since the
      // generator filters consequences and expands them into items,
      // if a consequence has items in the output, it "applies".

      for (const [consequenceId, expectedStatus] of Object.entries(
        scenario.expected_consequence_statuses,
      )) {
        const consequence = graph.consequences.get(consequenceId);
        if (!consequence) {
          failures.push({
            check: `consequence_status:${consequenceId}`,
            expected: expectedStatus,
            actual: "consequence not found in graph",
          });
          continue;
        }

        // Check if any items in the output are from this consequence's
        // task templates
        const taskRefs = consequence.task_template_refs ?? [];
        const relevantItems = output.items.filter((item) => {
          // Match by checking if any of the consequence's task templates
          // produced this item. Items have id based on template id.
          for (const taskRef of taskRefs) {
            if (
              item.needed_for.includes(consequence.title) ||
              item.id.includes(taskRef.split(".").pop()!)
            ) {
              return true;
            }
          }
          // Also check items that come directly from the consequence
          // (no task templates)
          if (taskRefs.length === 0) {
            return item.needed_for.includes(consequence.title);
          }
          return false;
        });

        let actualStatus: string;
        if (relevantItems.length === 0) {
          actualStatus = "does_not_apply";
        } else {
          // Take the "strongest" status
          const statuses = relevantItems.map((i) => i.status);
          if (statuses.includes("applies")) {
            actualStatus = "applies";
          } else if (statuses.includes("maybe_applies")) {
            actualStatus = "maybe_applies";
          } else if (statuses.includes("needs_fact")) {
            actualStatus = "needs_fact";
          } else {
            actualStatus = statuses[0];
          }
        }

        if (actualStatus !== expectedStatus) {
          failures.push({
            check: `consequence_status:${consequenceId}`,
            expected: expectedStatus,
            actual: actualStatus,
          });
        }
      }
    }

    // ── Check expected_checklist_groups ───────────────────────────
    if (scenario.expected_checklist_groups) {
      for (const [groupName, expectedTaskIds] of Object.entries(
        scenario.expected_checklist_groups,
      )) {
        const groupItems = output.items.filter(
          (item) => item.checklist_group === groupName,
        );
        const groupItemTaskIds = new Set<string>();

        // Try to identify which task template produced each item.
        // Items' titles match their task templates' titles.
        for (const item of groupItems) {
          // Walk task templates to find a match by title
          for (const [id, template] of graph.taskTemplates) {
            if (template.title === item.title) {
              groupItemTaskIds.add(id);
            }
          }
        }

        for (const expectedId of expectedTaskIds) {
          if (!groupItemTaskIds.has(expectedId)) {
            failures.push({
              check: `checklist_group:${groupName}`,
              expected: `contains ${expectedId}`,
              actual: `not found (group has: ${[...groupItemTaskIds].join(", ") || "empty"})`,
            });
          }
        }
      }
    }

    const passed = failures.length === 0;
    if (!passed) failed++;

    results.push({
      id: scenario.id,
      file: relPath,
      title: scenario.title,
      passed,
      failures,
    });
  }

  return { results, failed };
}

// ── CLI entry point ──────────────────────────────────────────────────

export async function main(): Promise<void> {
  const rootDir = resolve(
    import.meta.dirname ?? ".",
    "..",
    "..",
    "..",
    "..",
  );

  const { results, failed } = await runTestScenarios({ rootDir });

  if (results.length === 0) {
    console.log("⚠ No scenario files found in tests/scenarios/.");
    process.exit(0);
  }

  for (const r of results) {
    if (r.passed) {
      console.log(`  ✔ ${r.id} — ${r.title}`);
    } else {
      console.error(`  ✘ ${r.id} — ${r.title}`);
      for (const f of r.failures) {
        console.error(`    [${f.check}] expected: ${f.expected}, actual: ${f.actual}`);
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  console.log(
    `\n${passed}/${results.length} scenario(s) passed. ${failed} failed.`,
  );

  process.exit(failed > 0 ? 1 : 0);
}
