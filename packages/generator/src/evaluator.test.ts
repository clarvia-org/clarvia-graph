import { describe, it, expect } from "vitest";
import { evaluateCondition, type Fact, type TriValue } from "./evaluator.js";

describe("evaluateCondition — native three-valued evaluator", () => {
  // ── Helper ──────────────────────────────────────────────────────
  function eval_(
    expression: object,
    facts: Fact[],
  ): { result: TriValue; missingFacts: string[] } {
    return evaluateCondition(expression, facts);
  }

  // ── var resolution ──────────────────────────────────────────────

  describe("var resolution", () => {
    it("resolves dot-path variables", () => {
      const { result } = eval_(
        { "==": [{ var: "death.place.country" }, "LU"] },
        [{ fact_type: "death.place.country", value: "LU" }],
      );
      expect(result).toBe(true);
    });

    it("missing var returns unknown", () => {
      const { result, missingFacts } = eval_(
        { "==": [{ var: "death.place.country" }, "LU"] },
        [],
      );
      expect(result).toBe("unknown");
      expect(missingFacts).toContain("death.place.country");
    });

    it("partially missing path returns unknown", () => {
      const { result } = eval_(
        { "==": [{ var: "death.place.country" }, "LU"] },
        [{ fact_type: "death.place", value: "test" }],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── == operator ─────────────────────────────────────────────────

  describe("== operator", () => {
    it("returns true when values match", () => {
      const { result } = eval_(
        { "==": [{ var: "death.place.country" }, "LU"] },
        [{ fact_type: "death.place.country", value: "LU" }],
      );
      expect(result).toBe(true);
    });

    it("returns false when values don't match", () => {
      const { result } = eval_(
        { "==": [{ var: "death.place.country" }, "LU"] },
        [{ fact_type: "death.place.country", value: "DE" }],
      );
      expect(result).toBe(false);
    });

    it("unknown == value → unknown", () => {
      const { result } = eval_(
        { "==": [{ var: "missing" }, "LU"] },
        [],
      );
      expect(result).toBe("unknown");
    });

    it("value == unknown → unknown", () => {
      const { result } = eval_(
        { "==": ["LU", { var: "missing" }] },
        [],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── != operator ─────────────────────────────────────────────────

  describe("!= operator", () => {
    it("returns true when values differ", () => {
      const { result } = eval_(
        { "!=": [{ var: "death.place.country" }, "LU"] },
        [{ fact_type: "death.place.country", value: "DE" }],
      );
      expect(result).toBe(true);
    });

    it("returns false when values match", () => {
      const { result } = eval_(
        { "!=": [{ var: "death.place.country" }, "LU"] },
        [{ fact_type: "death.place.country", value: "LU" }],
      );
      expect(result).toBe(false);
    });

    it("unknown != value → unknown", () => {
      const { result } = eval_(
        { "!=": [{ var: "missing" }, "LU"] },
        [],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── and operator — three-valued truth table ─────────────────────

  describe("and operator — three-valued", () => {
    it("and(true, true) → true", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 1 }, { fact_type: "b", value: 2 }],
      );
      expect(result).toBe(true);
    });

    it("and(true, false) → false", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 1 }, { fact_type: "b", value: 999 }],
      );
      expect(result).toBe(false);
    });

    it("and(false, true) → false", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 999 }, { fact_type: "b", value: 2 }],
      );
      expect(result).toBe(false);
    });

    it("and(false, false) → false", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 999 }, { fact_type: "b", value: 999 }],
      );
      expect(result).toBe(false);
    });

    it("and(true, unknown) → unknown", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 1 }], // b is missing
      );
      expect(result).toBe("unknown");
    });

    it("and(unknown, true) → unknown", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "b", value: 2 }], // a is missing
      );
      expect(result).toBe("unknown");
    });

    it("and(false, unknown) → false (short-circuit!)", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 999 }], // a is false, b is missing
      );
      expect(result).toBe(false);
    });

    it("and(unknown, false) → false", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "b", value: 999 }], // a is missing, b is false
      );
      expect(result).toBe(false);
    });

    it("and(unknown, unknown) → unknown", () => {
      const { result } = eval_(
        { and: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── or operator — three-valued truth table ──────────────────────

  describe("or operator — three-valued", () => {
    it("or(true, true) → true", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 1 }, { fact_type: "b", value: 2 }],
      );
      expect(result).toBe(true);
    });

    it("or(true, false) → true", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 1 }, { fact_type: "b", value: 999 }],
      );
      expect(result).toBe(true);
    });

    it("or(false, true) → true", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 999 }, { fact_type: "b", value: 2 }],
      );
      expect(result).toBe(true);
    });

    it("or(false, false) → false", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 999 }, { fact_type: "b", value: 999 }],
      );
      expect(result).toBe(false);
    });

    it("or(true, unknown) → true (short-circuit!)", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 1 }], // b is missing
      );
      expect(result).toBe(true);
    });

    it("or(unknown, true) → true", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "b", value: 2 }], // a is missing
      );
      expect(result).toBe(true);
    });

    it("or(false, unknown) → unknown", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "a", value: 999 }], // a is false, b is missing
      );
      expect(result).toBe("unknown");
    });

    it("or(unknown, false) → unknown", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [{ fact_type: "b", value: 999 }], // a is missing, b is false
      );
      expect(result).toBe("unknown");
    });

    it("or(unknown, unknown) → unknown", () => {
      const { result } = eval_(
        { or: [{ "==": [{ var: "a" }, 1] }, { "==": [{ var: "b" }, 2] }] },
        [],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── ! (not) operator ────────────────────────────────────────────

  describe("! (not) operator", () => {
    it("!(true) → false", () => {
      const { result } = eval_(
        { "!": [{ "==": [{ var: "a" }, 1] }] },
        [{ fact_type: "a", value: 1 }],
      );
      expect(result).toBe(false);
    });

    it("!(false) → true", () => {
      const { result } = eval_(
        { "!": [{ "==": [{ var: "a" }, 1] }] },
        [{ fact_type: "a", value: 999 }],
      );
      expect(result).toBe(true);
    });

    it("!(unknown) → unknown", () => {
      const { result } = eval_(
        { "!": [{ "==": [{ var: "a" }, 1] }] },
        [], // a is missing
      );
      expect(result).toBe("unknown");
    });
  });

  // ── exists operator ─────────────────────────────────────────────

  describe("exists operator", () => {
    it("exists(present) → true", () => {
      const { result } = eval_(
        { exists: "death.date" },
        [{ fact_type: "death.date", value: "2026-05-20" }],
      );
      expect(result).toBe(true);
    });

    it("exists(missing) → false", () => {
      const { result } = eval_(
        { exists: "death.date" },
        [],
      );
      expect(result).toBe(false);
    });

    it("exists does not contribute to missingFacts", () => {
      const { missingFacts } = eval_(
        { exists: "death.date" },
        [],
      );
      expect(missingFacts).toHaveLength(0);
    });
  });

  // ── in operator ─────────────────────────────────────────────────

  describe("in operator", () => {
    it("in(value, array) → true when found", () => {
      const { result } = eval_(
        { in: [{ var: "country" }, ["LU", "DE", "FR"]] },
        [{ fact_type: "country", value: "LU" }],
      );
      expect(result).toBe(true);
    });

    it("in(value, array) → false when not found", () => {
      const { result } = eval_(
        { in: [{ var: "country" }, ["LU", "DE", "FR"]] },
        [{ fact_type: "country", value: "US" }],
      );
      expect(result).toBe(false);
    });

    it("in(missing, array) → unknown", () => {
      const { result } = eval_(
        { in: [{ var: "country" }, ["LU", "DE", "FR"]] },
        [],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── Comparison operators ────────────────────────────────────────

  describe("comparison operators", () => {
    it("> returns true when left > right", () => {
      const { result } = eval_(
        { ">": [{ var: "score" }, 50] },
        [{ fact_type: "score", value: 70 }],
      );
      expect(result).toBe(true);
    });

    it("> returns false when left <= right", () => {
      const { result } = eval_(
        { ">": [{ var: "score" }, 50] },
        [{ fact_type: "score", value: 30 }],
      );
      expect(result).toBe(false);
    });

    it(">= returns true when equal", () => {
      const { result } = eval_(
        { ">=": [{ var: "score" }, 50] },
        [{ fact_type: "score", value: 50 }],
      );
      expect(result).toBe(true);
    });

    it("< returns true when left < right", () => {
      const { result } = eval_(
        { "<": [{ var: "score" }, 50] },
        [{ fact_type: "score", value: 30 }],
      );
      expect(result).toBe(true);
    });

    it("<= returns true when equal", () => {
      const { result } = eval_(
        { "<=": [{ var: "score" }, 50] },
        [{ fact_type: "score", value: 50 }],
      );
      expect(result).toBe(true);
    });

    it("comparison with missing var → unknown", () => {
      const { result } = eval_(
        { ">": [{ var: "missing" }, 50] },
        [],
      );
      expect(result).toBe("unknown");
    });
  });

  // ── Nested expressions ──────────────────────────────────────────

  describe("nested expressions", () => {
    it("and(== country LU, exists date) — both present", () => {
      const { result } = eval_(
        {
          and: [
            { "==": [{ var: "death.place.country" }, "LU"] },
            { exists: "death.date" },
          ],
        },
        [
          { fact_type: "death.place.country", value: "LU" },
          { fact_type: "death.date", value: "2026-05-20" },
        ],
      );
      expect(result).toBe(true);
    });

    it("and(== country LU, exists date) — date missing", () => {
      const { result } = eval_(
        {
          and: [
            { "==": [{ var: "death.place.country" }, "LU"] },
            { exists: "death.date" },
          ],
        },
        [{ fact_type: "death.place.country", value: "LU" }],
      );
      // exists(missing) → false, so and(true, false) → false
      expect(result).toBe(false);
    });

    it("or(== country LU, == residence LU) — first matches", () => {
      const { result } = eval_(
        {
          or: [
            { "==": [{ var: "death.place.country" }, "LU"] },
            { "==": [{ var: "deceased.habitual_residence.country" }, "LU"] },
          ],
        },
        [{ fact_type: "death.place.country", value: "LU" }],
      );
      expect(result).toBe(true);
    });

    it("or(== country LU, == residence LU) — neither matches", () => {
      const { result } = eval_(
        {
          or: [
            { "==": [{ var: "death.place.country" }, "LU"] },
            { "==": [{ var: "deceased.habitual_residence.country" }, "LU"] },
          ],
        },
        [
          { fact_type: "death.place.country", value: "DE" },
          { fact_type: "deceased.habitual_residence.country", value: "DE" },
        ],
      );
      expect(result).toBe(false);
    });

    it("deeply nested: and(or(...), ==, exists)", () => {
      const { result } = eval_(
        {
          and: [
            {
              or: [
                { "==": [{ var: "death.place.country" }, "LU"] },
                { "==": [{ var: "deceased.habitual_residence.country" }, "LU"] },
              ],
            },
            { "==": [{ var: "relationship.to_deceased" }, "surviving_spouse"] },
            { exists: "death.date" },
          ],
        },
        [
          { fact_type: "death.place.country", value: "DE" },
          { fact_type: "deceased.habitual_residence.country", value: "LU" },
          { fact_type: "relationship.to_deceased", value: "surviving_spouse" },
          { fact_type: "death.date", value: "2026-05-20" },
        ],
      );
      expect(result).toBe(true);
    });
  });

  // ── Backward compatibility ──────────────────────────────────────

  describe("backward compatibility with old-style fact paths", () => {
    it("still works with long intake_fact paths (pre-migration)", () => {
      const { result } = eval_(
        {
          "==": [
            { var: "intake_fact.lu.bereavement.jurisdiction_of_death" },
            "LU",
          ],
        },
        [
          {
            fact_type: "intake_fact.lu.bereavement.jurisdiction_of_death",
            value: "LU",
          },
        ],
      );
      expect(result).toBe(true);
    });
  });

  // ── missingFacts reporting ──────────────────────────────────────

  describe("missingFacts reporting", () => {
    it("reports all missing vars", () => {
      const { missingFacts } = eval_(
        {
          and: [
            { "==": [{ var: "a.b" }, 1] },
            { "==": [{ var: "c.d" }, 2] },
          ],
        },
        [],
      );
      expect(missingFacts).toContain("a.b");
      expect(missingFacts).toContain("c.d");
    });

    it("does not report present vars", () => {
      const { missingFacts } = eval_(
        {
          and: [
            { "==": [{ var: "a" }, 1] },
            { "==": [{ var: "b" }, 2] },
          ],
        },
        [{ fact_type: "a", value: 1 }],
      );
      expect(missingFacts).toContain("b");
      expect(missingFacts).not.toContain("a");
    });
  });
});
