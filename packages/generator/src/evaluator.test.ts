import { describe, it, expect } from "vitest";
import { evaluateCondition, type Fact } from "./evaluator.js";

describe("evaluateCondition", () => {
  const luDeathExpression = {
    "==": [
      { var: "intake_fact.lu.bereavement.jurisdiction_of_death" },
      "LU",
    ],
  };

  it("returns true when fact matches", async () => {
    const facts: Fact[] = [
      { fact_type: "intake_fact.lu.bereavement.jurisdiction_of_death", value: "LU" },
    ];

    const { result, missingFacts } = await evaluateCondition(luDeathExpression, facts);
    expect(result).toBe("true");
    expect(missingFacts).toHaveLength(0);
  });

  it("returns false when fact does not match", async () => {
    const facts: Fact[] = [
      { fact_type: "intake_fact.lu.bereavement.jurisdiction_of_death", value: "DE" },
    ];

    const { result, missingFacts } = await evaluateCondition(luDeathExpression, facts);
    expect(result).toBe("false");
    expect(missingFacts).toHaveLength(0);
  });

  it("returns unknown when fact is missing", async () => {
    const facts: Fact[] = [];

    const { result, missingFacts } = await evaluateCondition(luDeathExpression, facts);
    expect(result).toBe("unknown");
    expect(missingFacts).toContain("intake_fact.lu.bereavement.jurisdiction_of_death");
  });

  it("handles nested expressions", async () => {
    const andExpression = {
      and: [
        { "==": [{ var: "a" }, 1] },
        { "==": [{ var: "b" }, 2] },
      ],
    };

    const facts: Fact[] = [
      { fact_type: "a", value: 1 },
      { fact_type: "b", value: 2 },
    ];

    const { result } = await evaluateCondition(andExpression, facts);
    expect(result).toBe("true");
  });

  it("returns unknown when one nested var is missing", async () => {
    const andExpression = {
      and: [
        { "==": [{ var: "a" }, 1] },
        { "==": [{ var: "b" }, 2] },
      ],
    };

    const facts: Fact[] = [{ fact_type: "a", value: 1 }];

    const { result, missingFacts } = await evaluateCondition(andExpression, facts);
    expect(result).toBe("unknown");
    expect(missingFacts).toContain("b");
  });
});
