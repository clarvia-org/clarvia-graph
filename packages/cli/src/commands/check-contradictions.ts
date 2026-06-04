/**
 * clarvia check-contradictions — Detect overlapping conflicting claims.
 *
 * Per spec §18.7: compare assertions with overlapping claim_scope.
 *
 * Algorithm:
 * 1. Load all assertion batch files
 * 2. Group assertions by claim_scope key: {jurisdiction}.{life_event}.{domain}
 * 3. Within each scope group, check for direct_value_conflict:
 *    same claim_type, different extracted_value
 * 4. Write report to build/reports/contradictions.yml
 * 5. Exit 0 if no contradictions or all resolved. Exit 1 if unresolved.
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { globSync } from "glob";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// ── public result types ──────────────────────────────────────────────

export interface Contradiction {
  type: "direct_value_conflict";
  scope_key: string;
  claim_type: string;
  assertions: Array<{
    id: string;
    extracted_value: unknown;
    claim_text: string;
  }>;
  resolved: boolean;
}

export interface CheckContradictionsOptions {
  /** Absolute path to the repo root */
  rootDir: string;
}

// ── exported runner (tested in isolation) ────────────────────────────

export async function runCheckContradictions(
  opts: CheckContradictionsOptions,
): Promise<{ contradictions: Contradiction[]; reportPath: string }> {
  const { rootDir } = opts;

  // ── 1. Load assertion batch files ──────────────────────────────────
  const assertionFiles = globSync("sources/assertions/**/*.{yml,yaml}", {
    cwd: rootDir,
    absolute: true,
  });

  interface LoadedAssertion {
    id: string;
    claim_type?: string;
    claim_text?: string;
    claim_scope?: {
      jurisdiction?: string;
      life_event?: string;
      domain?: string;
    };
    extracted_value?: unknown;
    [key: string]: unknown;
  }

  const allAssertions: LoadedAssertion[] = [];

  for (const file of assertionFiles) {
    try {
      const raw = readFileSync(file, "utf-8");
      const doc = parseYaml(raw) as {
        assertions?: LoadedAssertion[];
      };
      if (doc?.assertions && Array.isArray(doc.assertions)) {
        for (const ass of doc.assertions) {
          if (ass.id) {
            allAssertions.push(ass);
          }
        }
      }
    } catch {
      // Skip unparseable files
    }
  }

  // ── 2. Group by claim_scope key ────────────────────────────────────
  const scopeGroups = new Map<string, LoadedAssertion[]>();

  for (const ass of allAssertions) {
    if (!ass.claim_scope) continue;
    const { jurisdiction, life_event, domain } = ass.claim_scope;
    if (!jurisdiction || !life_event || !domain) continue;

    const scopeKey = `${jurisdiction}.${life_event}.${domain}`;
    let group = scopeGroups.get(scopeKey);
    if (!group) {
      group = [];
      scopeGroups.set(scopeKey, group);
    }
    group.push(ass);
  }

  // ── 3. Check for direct_value_conflict ─────────────────────────────
  const contradictions: Contradiction[] = [];

  for (const [scopeKey, group] of scopeGroups) {
    // Sub-group by claim_type
    const byClaimType = new Map<string, LoadedAssertion[]>();
    for (const ass of group) {
      if (!ass.claim_type) continue;
      let sub = byClaimType.get(ass.claim_type);
      if (!sub) {
        sub = [];
        byClaimType.set(ass.claim_type, sub);
      }
      sub.push(ass);
    }

    for (const [claimType, sameType] of byClaimType) {
      // Only check assertions that have extracted_value
      const withValue = sameType.filter(
        (a) => a.extracted_value !== undefined && a.extracted_value !== null,
      );
      if (withValue.length < 2) continue;

      // Compare extracted_value — use JSON.stringify for deep comparison
      const uniqueValues = new Map<string, LoadedAssertion[]>();
      for (const a of withValue) {
        const key = JSON.stringify(a.extracted_value);
        let list = uniqueValues.get(key);
        if (!list) {
          list = [];
          uniqueValues.set(key, list);
        }
        list.push(a);
      }

      if (uniqueValues.size > 1) {
        contradictions.push({
          type: "direct_value_conflict",
          scope_key: scopeKey,
          claim_type: claimType,
          assertions: withValue.map((a) => ({
            id: a.id,
            extracted_value: a.extracted_value,
            claim_text: a.claim_text ?? "",
          })),
          resolved: false,
        });
      }
    }
  }

  // ── 4. Write report ────────────────────────────────────────────────
  const reportPath = resolve(rootDir, "build", "reports", "contradictions.yml");
  mkdirSync(dirname(reportPath), { recursive: true });

  const report = {
    generated_at: new Date().toISOString(),
    total_contradictions: contradictions.length,
    unresolved: contradictions.filter((c) => !c.resolved).length,
    contradictions,
  };

  writeFileSync(reportPath, stringifyYaml(report), "utf-8");

  return { contradictions, reportPath };
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

  const { contradictions, reportPath } = await runCheckContradictions({
    rootDir,
  });

  const unresolved = contradictions.filter((c) => !c.resolved);

  if (contradictions.length === 0) {
    console.log("✔ No contradictions found.");
    console.log(`  Report written to: ${reportPath}`);
    process.exit(0);
  }

  for (const c of contradictions) {
    const status = c.resolved ? "(resolved)" : "(UNRESOLVED)";
    console.warn(
      `⚠ ${c.type} in ${c.scope_key} [${c.claim_type}] ${status}`,
    );
    for (const a of c.assertions) {
      console.warn(
        `    ${a.id}: ${JSON.stringify(a.extracted_value)}`,
      );
    }
  }

  console.log(
    `\n${contradictions.length} contradiction(s) found, ${unresolved.length} unresolved.`,
  );
  console.log(`Report written to: ${reportPath}`);

  process.exit(unresolved.length > 0 ? 1 : 0);
}
