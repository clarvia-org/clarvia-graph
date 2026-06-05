/**
 * Step 2: Resolve jurisdiction roles from normalized scenario facts.
 *
 * Determines which jurisdictions are relevant for each role in the scenario,
 * enabling proper candidate retrieval in Step 3.
 */

import type { Fact } from "./evaluator.js";

export interface JurisdictionRoles {
  death_place: string[];
  deceased_habitual_residence: string[];
  survivor_residence: string[];
  work_or_insurance_state: string[];
  asset_situs: string[];
  possible_succession_law: string[];
  possible_pension_authority: string[];
}

/** Map from fact path to jurisdiction role */
const ROLE_MAPPING: Record<string, keyof JurisdictionRoles> = {
  "death.place.country": "death_place",
  "deceased.habitual_residence.country": "deceased_habitual_residence",
  "survivor.residence.country": "survivor_residence",
  "deceased.last_social_security_affiliation.country": "work_or_insurance_state",
};

/** Array facts that map to roles */
const ARRAY_ROLE_MAPPING: Record<string, keyof JurisdictionRoles> = {
  "deceased.work_history.country": "work_or_insurance_state",
  "estate.asset_location.country": "asset_situs",
};

/** Resolve jurisdiction roles from normalized facts */
export function resolveJurisdictionRoles(facts: Fact[]): JurisdictionRoles {
  const roles: JurisdictionRoles = {
    death_place: [],
    deceased_habitual_residence: [],
    survivor_residence: [],
    work_or_insurance_state: [],
    asset_situs: [],
    possible_succession_law: [],
    possible_pension_authority: [],
  };

  for (const fact of facts) {
    const val = String(fact.value ?? "");

    // Single-value roles
    const singleRole = ROLE_MAPPING[fact.fact_type];
    if (singleRole && val && val !== "unknown") {
      if (!roles[singleRole].includes(val)) {
        roles[singleRole].push(val);
      }
    }

    // Array roles (comma-separated)
    const arrayRole = ARRAY_ROLE_MAPPING[fact.fact_type];
    if (arrayRole && val) {
      const values = val.split(",").map((v: string) => v.trim());
      for (const v of values) {
        if (v && v !== "unknown" && !roles[arrayRole].includes(v)) {
          roles[arrayRole].push(v);
        }
      }
    }
  }

  // Derived roles:
  // possible_succession_law defaults to habitual residence
  if (roles.possible_succession_law.length === 0) {
    roles.possible_succession_law = [...roles.deceased_habitual_residence];
  }

  // possible_pension_authority comes from work/insurance state
  if (roles.possible_pension_authority.length === 0) {
    roles.possible_pension_authority = [...roles.work_or_insurance_state];
  }

  return roles;
}

/** Get the set of all relevant jurisdiction codes for candidate retrieval */
export function getRelevantJurisdictions(roles: JurisdictionRoles): Set<string> {
  const jurisdictions = new Set<string>();

  // Always include supranational scopes
  jurisdictions.add("eu");
  jurisdictions.add("xborder");

  // Add all jurisdictions from all roles
  for (const values of Object.values(roles)) {
    for (const v of values) {
      jurisdictions.add(v);
    }
  }

  return jurisdictions;
}

/** Check if the scenario involves cross-border elements */
export function isCrossBorder(roles: JurisdictionRoles): boolean {
  const allJurisdictions = new Set<string>();
  for (const values of Object.values(roles)) {
    for (const v of values) {
      allJurisdictions.add(v);
    }
  }
  // Cross-border if more than one national jurisdiction is involved
  return allJurisdictions.size > 1;
}
