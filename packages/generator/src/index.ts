/**
 * @clarvia/generator — Consequence graph evaluator and checklist generator.
 *
 * Public API:
 * - loadGraph(rootDir)  — load all YAML records from disk
 * - generateChecklist() — run the 6-step algorithm
 * - evaluateCondition() — three-valued condition evaluation
 * - buildFactData()     — convert facts to nested data object
 */

export { loadGraph } from "./loader.js";
export type { LoadedGraph, Consequence, TaskTemplate, Condition } from "./loader.js";

export { generateChecklist } from "./generator.js";
export type { ChecklistOutput, ChecklistItem, GenerateOptions, ItemStatus } from "./generator.js";

export { evaluateCondition, buildFactData } from "./evaluator.js";
export type { Fact, TriValue } from "./evaluator.js";
