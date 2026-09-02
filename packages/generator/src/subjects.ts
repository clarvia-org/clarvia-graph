/**
 * Resolved subject model (issue #36).
 *
 * Maps a task template's target.subject_role — plus any multi-person scenario
 * facts — to the list of concrete subjects the task applies to.
 *
 * ID grammar (decided on issue #36):
 * - The first subject of a role family keeps the legacy alpha ID unchanged
 *   (person.child, person.survivor, ...), so existing single-subject checklist
 *   item IDs are preserved by construction.
 * - Additional subjects use the fact index as an ordinal suffix:
 *   person.child.2, person.child.3, ...
 *
 * Multi-person facts use the flat keyed convention `<family>.<n>.<path>`
 * (e.g. child.1.date_of_birth, child.2.date_of_birth). Fan-out only happens
 * for roles with a genuine SUBJECT_ROLE_MAP entry; unmapped roles keep the
 * single person.deceased bereavement fallback untouched — mapping them is an
 * intentional future migration (see issue #36 discussion).
 */

import type { Fact } from "./evaluator.js";
import type { TaskTemplate } from "./loader.js";

export interface ResolvedSubject {
  /** Deterministic subject ID used in checklist item hashes. */
  id: string;
  /** Role family the subject belongs to (child, survivor, ...). */
  role_family: string;
  /** 1-based index within the family; 1 keeps the legacy bare ID. */
  ordinal: number;
  /** Neutral, non-personal label identifying the subject (e.g. "child 2"). */
  label: string;
  /** How the subject was derived. */
  source: "facts" | "role_default" | "fallback";
}

// Alpha deterministic mapping from task_template.target.subject_role.
// Fallback for bereavement: person.deceased.
const SUBJECT_ROLE_MAP: Record<string, string> = {
  deceased: "person.deceased",
  survivor: "person.survivor",
  surviving_spouse: "person.survivor",
  surviving_partner: "person.survivor",
  child: "person.child",
  dependant: "person.dependant",
  estate: "estate.primary",
};

// Fact-type prefix family per base subject ID. Only these families can fan
// out from scenario facts; person.deceased and estate.primary are singletons.
const SUBJECT_FACT_FAMILY: Record<string, string> = {
  "person.survivor": "survivor",
  "person.child": "child",
  "person.dependant": "dependant",
};

const SUBJECT_LABELS: Record<string, string> = {
  "person.deceased": "deceased person",
  "person.survivor": "survivor",
  "person.child": "child",
  "person.dependant": "dependant",
  "estate.primary": "estate",
};

/** Distinct numeric indices found in `<family>.<n>.<path>` facts, ascending. */
function factIndicesForFamily(family: string, facts: Fact[]): number[] {
  const pattern = new RegExp(`^${family}\\.(\\d+)\\.`);
  const indices = new Set<number>();
  for (const fact of facts) {
    const match = pattern.exec(fact.fact_type);
    if (match) {
      indices.add(Number(match[1]));
    }
  }
  return [...indices].sort((a, b) => a - b);
}

function makeSubject(
  baseId: string,
  family: string,
  index: number,
  source: ResolvedSubject["source"],
): ResolvedSubject {
  const baseLabel = SUBJECT_LABELS[baseId] ?? family;
  return {
    id: index === 1 ? baseId : `${baseId}.${index}`,
    role_family: family,
    ordinal: index,
    label: index === 1 ? baseLabel : `${baseLabel} ${index}`,
    source,
  };
}

/**
 * Resolve the subjects a task template targets, given the scenario facts.
 *
 * Always returns at least one subject. Without multi-person facts the result
 * is exactly the alpha single-subject behavior (same ID, same hash inputs).
 */
export function resolveSubjects(
  template: TaskTemplate | null,
  facts: Fact[],
): ResolvedSubject[] {
  const role = template?.target?.subject_role;
  const mappedId = role ? SUBJECT_ROLE_MAP[role] : undefined;

  if (!mappedId) {
    // Bereavement alpha fallback — never fans out.
    return [makeSubject("person.deceased", "deceased", 1, "fallback")];
  }

  const family = SUBJECT_FACT_FAMILY[mappedId];
  if (family) {
    const indices = factIndicesForFamily(family, facts);
    if (indices.length > 0) {
      return indices.map((n) => makeSubject(mappedId, family, n, "facts"));
    }
  }

  return [makeSubject(mappedId, family ?? role, 1, "role_default")];
}
