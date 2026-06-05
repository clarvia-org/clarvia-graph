import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { loadGraph } from "./loader.js";

// Use the real graph data in the repo root
const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..");

describe("loadGraph", () => {
  it("loads all record types from the real graph", () => {
    const graph = loadGraph(ROOT_DIR);

    // We know we have 2 consequences, 2 task templates, etc.
    expect(graph.consequences.size).toBeGreaterThanOrEqual(2);
    expect(graph.taskTemplates.size).toBeGreaterThanOrEqual(2);
    expect(graph.conditions.size).toBeGreaterThanOrEqual(2);
    expect(graph.deadlines.size).toBeGreaterThanOrEqual(1);
    expect(graph.authorities.size).toBeGreaterThanOrEqual(2);
    expect(graph.evidenceTypes.size).toBeGreaterThanOrEqual(4);
    expect(graph.intakeFactTypes.size).toBeGreaterThanOrEqual(3);
  });

  it("indexes records by ID correctly", () => {
    const graph = loadGraph(ROOT_DIR);

    const consequence = graph.consequences.get(
      "consequence.lu.bereavement.death_registration.declare_death",
    );
    expect(consequence).toBeDefined();
    expect(consequence!.title).toBe(
      "Declare the death to the commune civil registrar",
    );
    expect(consequence!.consequence_type).toBe("administrative_step");
  });

  it("loads condition expressions as objects", () => {
    const graph = loadGraph(ROOT_DIR);

    const condition = graph.conditions.get(
      "condition.lu.bereavement.death_registration.death_occurred_in_lu",
    );
    expect(condition).toBeDefined();
    expect(condition!.expression).toBeDefined();
    expect(typeof condition!.expression).toBe("object");
  });
});
