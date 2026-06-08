import { describe, it, expect, beforeAll } from "vitest";
import { resolve } from "node:path";
import { runCheckAnchors } from "./check-anchors.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("runCheckAnchors characterization", () => {
  let results: Awaited<ReturnType<typeof runCheckAnchors>>["results"];
  let errors: number;

  // Run once, share across tests
  beforeAll(async () => {
    const out = await runCheckAnchors({ rootDir: ROOT_DIR });
    results = out.results;
    errors = out.errors;
  }, 30_000);

  it("pins the total result count", () => {
    // Will fail on first run — update with actual value
    expect(results.length).toMatchInlineSnapshot(`6`);
  });

  it("pins the error count", () => {
    expect(errors).toMatchInlineSnapshot(`0`);
  });

  it("pins the found/not-found breakdown", () => {
    const found = results.filter((r) => r.found).length;
    const notFound = results.filter((r) => !r.found).length;
    expect({ found, notFound }).toMatchInlineSnapshot(`
      {
        "found": 6,
        "notFound": 0,
      }
    `);
  });

  it("pins the assertion IDs that were checked", () => {
    const ids = results.map((r) => r.assertionId).sort();
    expect(ids).toMatchInlineSnapshot(`
      [
        "assertion.guichet_lu.bereavement.death_must_be_declared",
        "assertion.guichet_lu.bereavement.declaration_within_24h",
        "assertion.guichet_lu.bereavement.survivor_pension_available",
        "assertion.guichet_lu.declaration_succession.inheritance_declaration_required",
        "assertion.service_public_fr.succession.notaire_obligatoire",
        "assertion.service_public_fr.succession.option_successorale",
      ]
    `);
  });

  it("snapshots the full results array for determinism", () => {
    // Sort for stability since glob order is not guaranteed
    const sorted = [...results].sort((a, b) =>
      a.assertionId.localeCompare(b.assertionId),
    );
    expect(sorted).toMatchSnapshot();
  });
});
