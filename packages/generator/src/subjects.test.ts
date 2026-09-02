/**
 * Unit tests for the resolved subject model (issue #36).
 *
 * The contract under test:
 * - Without multi-person facts, resolution is exactly the alpha behavior:
 *   one subject, legacy ID string, for every role in use.
 * - Flat keyed facts (`child.1.date_of_birth`, ...) fan a mapped role out
 *   into one subject per index; index 1 keeps the bare legacy ID.
 * - Unmapped roles and missing targets keep the person.deceased fallback
 *   and never fan out.
 */

import { describe, it, expect } from "vitest";
import { resolveSubjects } from "./subjects.js";
import type { TaskTemplate } from "./loader.js";
import type { Fact } from "./evaluator.js";

function templateWithRole(role: string | null): TaskTemplate {
  return {
    id: "t.probe",
    schema_version: "0.1.0",
    title: "Probe",
    action_type: "file_declaration",
    jurisdiction: "LU",
    life_event: "bereavement",
    domain: "death_registration",
    authoring_status: "approved",
    distribution_status: "public_open",
    record_valid_from: "2026-01-01",
    target: role === null ? null : { subject_role: role },
  } as TaskTemplate;
}

const NO_FACTS: Fact[] = [];

describe("resolveSubjects: single-subject legacy parity", () => {
  const LEGACY_CASES: Array<[string, string]> = [
    ["deceased", "person.deceased"],
    ["survivor", "person.survivor"],
    ["surviving_spouse", "person.survivor"],
    ["surviving_partner", "person.survivor"],
    ["child", "person.child"],
    ["dependant", "person.dependant"],
    ["estate", "estate.primary"],
    // Unmapped roles in use in the graph — bereavement fallback.
    ["heir", "person.deceased"],
    ["declarant", "person.deceased"],
    ["heir_or_legatee", "person.deceased"],
    ["heir_or_tax_representative", "person.deceased"],
    ["heir_or_business_successor", "person.deceased"],
    ["heir_or_surviving_spouse", "person.deceased"],
    ["survivor_or_heir", "person.deceased"],
    ["person_who_advanced_funeral_costs", "person.deceased"],
  ];

  for (const [role, expectedId] of LEGACY_CASES) {
    it(`role ${role} → single subject ${expectedId}`, () => {
      const subjects = resolveSubjects(templateWithRole(role), NO_FACTS);
      expect(subjects).toHaveLength(1);
      expect(subjects[0].id).toBe(expectedId);
      expect(subjects[0].ordinal).toBe(1);
    });
  }

  it("no target and no template → person.deceased fallback", () => {
    expect(resolveSubjects(templateWithRole(null), NO_FACTS)[0].id).toBe("person.deceased");
    expect(resolveSubjects(null, NO_FACTS)[0].id).toBe("person.deceased");
    expect(resolveSubjects(null, NO_FACTS)[0].source).toBe("fallback");
  });
});

describe("resolveSubjects: multi-person fan-out from flat keyed facts", () => {
  const TWO_CHILDREN: Fact[] = [
    { fact_type: "child.1.date_of_birth", value: "2015-03-01" },
    { fact_type: "child.2.date_of_birth", value: "2019-11-14" },
  ];

  it("two children → person.child and person.child.2", () => {
    const subjects = resolveSubjects(templateWithRole("child"), TWO_CHILDREN);
    expect(subjects.map((s) => s.id)).toEqual(["person.child", "person.child.2"]);
    expect(subjects.map((s) => s.ordinal)).toEqual([1, 2]);
    expect(subjects.map((s) => s.label)).toEqual(["child", "child 2"]);
    expect(subjects.every((s) => s.source === "facts")).toBe(true);
  });

  it("fact order does not matter", () => {
    const reversed = [...TWO_CHILDREN].reverse();
    expect(resolveSubjects(templateWithRole("child"), reversed)).toEqual(
      resolveSubjects(templateWithRole("child"), TWO_CHILDREN),
    );
  });

  it("indices are taken literally: child.2 + child.5 without child.1", () => {
    const facts: Fact[] = [
      { fact_type: "child.5.date_of_birth", value: "2010-01-01" },
      { fact_type: "child.2.date_of_birth", value: "2012-01-01" },
    ];
    const subjects = resolveSubjects(templateWithRole("child"), facts);
    expect(subjects.map((s) => s.id)).toEqual(["person.child.2", "person.child.5"]);
  });

  it("multiple facts for the same index count once", () => {
    const facts: Fact[] = [
      { fact_type: "child.1.date_of_birth", value: "2015-03-01" },
      { fact_type: "child.1.residence.country", value: "LU" },
    ];
    const subjects = resolveSubjects(templateWithRole("child"), facts);
    expect(subjects.map((s) => s.id)).toEqual(["person.child"]);
  });

  it("survivor family fans out too (surviving_spouse role)", () => {
    const facts: Fact[] = [
      { fact_type: "survivor.1.residence.country", value: "LU" },
      { fact_type: "survivor.2.residence.country", value: "DE" },
    ];
    const subjects = resolveSubjects(templateWithRole("surviving_spouse"), facts);
    expect(subjects.map((s) => s.id)).toEqual(["person.survivor", "person.survivor.2"]);
    expect(subjects[1].label).toBe("survivor 2");
  });

  it("child facts do not fan out a survivor-role template", () => {
    const subjects = resolveSubjects(templateWithRole("survivor"), TWO_CHILDREN);
    expect(subjects.map((s) => s.id)).toEqual(["person.survivor"]);
  });

  it("unmapped roles never fan out, even with keyed facts present", () => {
    const subjects = resolveSubjects(templateWithRole("heir"), TWO_CHILDREN);
    expect(subjects.map((s) => s.id)).toEqual(["person.deceased"]);
  });

  it("deceased and estate are singletons regardless of facts", () => {
    const facts: Fact[] = [
      { fact_type: "deceased.1.name_known", value: "true" },
      { fact_type: "estate.1.asset_location.country", value: "LU" },
    ];
    expect(resolveSubjects(templateWithRole("deceased"), facts).map((s) => s.id)).toEqual(["person.deceased"]);
    expect(resolveSubjects(templateWithRole("estate"), facts).map((s) => s.id)).toEqual(["estate.primary"]);
  });

  it("non-indexed family facts (e.g. survivor.residence.country) do not fan out", () => {
    const facts: Fact[] = [{ fact_type: "survivor.residence.country", value: "LU" }];
    const subjects = resolveSubjects(templateWithRole("survivor"), facts);
    expect(subjects.map((s) => s.id)).toEqual(["person.survivor"]);
  });
});
