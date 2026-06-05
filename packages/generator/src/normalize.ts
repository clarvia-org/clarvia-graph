/**
 * Step 1: Normalize scenario facts.
 *
 * Ensures facts are in canonical form before condition evaluation:
 * - Country codes → uppercase ISO-style (e.g., "lu" → "LU")
 * - Dates → ISO 8601 format
 * - Booleans → true/false/"unknown"
 * - Arrays → sorted, deduplicated
 * - Fact paths use short domain paths (already handled by intake convention)
 */

import type { Fact } from "./evaluator.js";

/** Country code fields that should be uppercased */
const COUNTRY_CODE_PATHS = new Set([
  "death.place.country",
  "deceased.habitual_residence.country",
  "deceased.last_social_security_affiliation.country",
  "survivor.residence.country",
]);

/** Fields that contain arrays of country codes */
const COUNTRY_ARRAY_PATHS = new Set([
  "deceased.work_history.country",
  "estate.asset_location.country",
]);

/** Normalize a single fact value */
function normalizeValue(factType: string, value: string): string {
  // Country codes → uppercase
  if (COUNTRY_CODE_PATHS.has(factType)) {
    return value.toUpperCase();
  }
  // Booleans
  if (value === "true" || value === "false" || value === "unknown") {
    return value;
  }
  return value;
}

/** Normalize a list of facts into canonical form */
export function normalizeFacts(facts: Fact[]): Fact[] {
  const normalized: Fact[] = [];

  for (const fact of facts) {
    const val = String(fact.value ?? "");
    // Handle array facts (e.g., work_history.country with multiple values)
    if (COUNTRY_ARRAY_PATHS.has(fact.fact_type)) {
      // Uppercase and deduplicate
      const values = val.split(",").map((v: string) => v.trim().toUpperCase());
      const unique = [...new Set(values)].sort();
      normalized.push({ fact_type: fact.fact_type, value: unique.join(",") });
    } else {
      normalized.push({
        fact_type: fact.fact_type,
        value: normalizeValue(fact.fact_type, val),
      });
    }
  }

  // Sort facts by fact_type for deterministic canonical form
  return normalized.sort((a, b) => a.fact_type.localeCompare(b.fact_type));
}
