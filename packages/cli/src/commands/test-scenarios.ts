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
import type { LoadedGraph, Consequence, ChecklistItem } from "@clarvia/generator";

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

// ── scenario document shape ──────────────────────────────────────────

interface ScenarioDoc {
  id: string;
  title: string;
  life_event: string;
  facts: Array<{ fact_type: string; value: unknown }>;
  expected_consequence_statuses?: Record<string, string>;
  expected_checklist_groups?: Record<string, string[]>;
}

// ── parsing ──────────────────────────────────────────────────────────

function parseScenarioFile(
  file: string,
  relPath: string,
): { scenario: ScenarioDoc } | { error: ScenarioResult } {
  let scenario: ScenarioDoc;
  try {
    const raw = readFileSync(file, "utf-8");
    scenario = parseYaml(raw) as ScenarioDoc;
  } catch {
    return {
      error: {
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
      },
    };
  }

  if (!scenario?.id || !scenario?.life_event || !scenario?.facts) {
    return {
      error: {
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
      },
    };
  }

  return { scenario };
}

// ── item matching ────────────────────────────────────────────────────

/** Find output items that are relevant to a given consequence. */
function findRelevantItems(
  consequence: Consequence,
  output: { items: ChecklistItem[] },
): ChecklistItem[] {
  const taskRefs = consequence.task_template_refs ?? [];
  return output.items.filter((item) => {
    for (const taskRef of taskRefs) {
      if (
        item.needed_for.includes(consequence.title) ||
        item.id.includes(taskRef.split(".").pop()!)
      ) {
        return true;
      }
    }
    if (taskRefs.length === 0) {
      return item.needed_for.includes(consequence.title);
    }
    return false;
  });
}

/** Determine the "strongest" status from a list of relevant items. */
function determineConsequenceStatus(items: ChecklistItem[]): string {
  if (items.length === 0) return "does_not_apply";

  const statuses = items.map((i) => i.status);
  if (statuses.includes("applies")) return "applies";
  if (statuses.includes("maybe_applies")) return "maybe_applies";
  if (statuses.includes("needs_fact")) return "needs_fact";
  return statuses[0];
}

// ── consequence status checks ────────────────────────────────────────

function checkConsequenceStatuses(
  expected: Record<string, string>,
  output: { items: ChecklistItem[] },
  graph: LoadedGraph,
): ScenarioFailure[] {
  const failures: ScenarioFailure[] = [];

  for (const [consequenceId, expectedStatus] of Object.entries(expected)) {
    const consequence = graph.consequences.get(consequenceId);
    if (!consequence) {
      failures.push({
        check: `consequence_status:${consequenceId}`,
        expected: expectedStatus,
        actual: "consequence not found in graph",
      });
      continue;
    }

    const relevantItems = findRelevantItems(consequence, output);
    const actualStatus = determineConsequenceStatus(relevantItems);

    if (actualStatus !== expectedStatus) {
      failures.push({
        check: `consequence_status:${consequenceId}`,
        expected: expectedStatus,
        actual: actualStatus,
      });
    }
  }

  return failures;
}

// ── checklist group checks ───────────────────────────────────────────

function checkChecklistGroups(
  expected: Record<string, string[]>,
  output: { items: ChecklistItem[] },
  graph: LoadedGraph,
): ScenarioFailure[] {
  const failures: ScenarioFailure[] = [];

  for (const [groupName, expectedTaskIds] of Object.entries(expected)) {
    const groupItems = output.items.filter(
      (item) => item.checklist_group === groupName,
    );
    const groupItemTaskIds = new Set<string>();

    for (const item of groupItems) {
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

  return failures;
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
    const parsed = parseScenarioFile(file, relPath);

    if ("error" in parsed) {
      results.push(parsed.error);
      failed++;
      continue;
    }

    const { scenario } = parsed;

    const facts: Fact[] = scenario.facts.map((f) => ({
      fact_type: f.fact_type,
      value: f.value,
    }));

    const output = generateChecklist({
      lifeEvent: scenario.life_event,
      facts,
      graph,
    });

    const failures: ScenarioFailure[] = [];

    if (scenario.expected_consequence_statuses) {
      failures.push(
        ...checkConsequenceStatuses(
          scenario.expected_consequence_statuses,
          output,
          graph,
        ),
      );
    }

    if (scenario.expected_checklist_groups) {
      failures.push(
        ...checkChecklistGroups(
          scenario.expected_checklist_groups,
          output,
          graph,
        ),
      );
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
