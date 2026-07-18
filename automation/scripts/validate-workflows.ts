/**
 * automation/scripts/validate-workflows.ts
 *
 * CI validation for n8n workflow JSON files per blueprint §13.5.
 *
 * Checks:
 *   1. Parse every JSON file in automation/workflows/
 *   2. Validate naming convention: clarvia.<domain>.<name>.v<N>
 *   3. Scan for secret patterns (emails, tokens, passwords, connection strings)
 *   4. Reject non-synthetic pinData
 *   5. Check for duplicate workflow IDs across files and duplicate node IDs within
 *   6. Validate manifest.json completeness
 *   7. Check required Sticky Note per §13.1
 *
 * Usage:
 *   npx tsx automation/scripts/validate-workflows.ts
 *
 * Exit code 0 = all checks pass, non-zero = failures found.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// ── Configuration ────────────────────────────────────────────────

const REPO_ROOT = join(import.meta.dirname ?? __dirname, "..", "..");
const WORKFLOWS_DIR = join(REPO_ROOT, "automation", "workflows");
const MANIFEST_PATH = join(WORKFLOWS_DIR, "manifest.json");

const NAMING_PATTERN = /^clarvia\.[a-z]+\.[a-z][a-z0-9-]*\.v\d+$/;

// Secret patterns that must never appear in workflow JSON (§13.2)
const SECRET_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /sk_live_[a-zA-Z0-9]{20,}/,
    label: "Stripe live secret key",
  },
  {
    pattern: /sk_test_[a-zA-Z0-9]{20,}/,
    label: "Stripe test secret key",
  },
  {
    pattern: /pk_live_[a-zA-Z0-9]{20,}/,
    label: "Stripe live publishable key",
  },
  {
    pattern: /re_[a-zA-Z0-9]{20,}/,
    label: "Resend API key",
  },
  {
    pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/,
    label: "Private key",
  },
  {
    pattern:
      /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^/]+/i,
    label: "Hardcoded database connection string",
  },
  {
    pattern: /ghp_[a-zA-Z0-9]{36,}/,
    label: "GitHub personal access token",
  },
  {
    pattern: /gho_[a-zA-Z0-9]{36,}/,
    label: "GitHub OAuth token",
  },
  {
    pattern: /xoxb-[a-zA-Z0-9-]+/,
    label: "Slack bot token",
  },
  {
    pattern: /xoxp-[a-zA-Z0-9-]+/,
    label: "Slack user token",
  },
];

// Email regex for PII detection in pinData
const EMAIL_PATTERN =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Synthetic email patterns that are acceptable in pinData
const SYNTHETIC_EMAIL_PATTERNS = [
  /test[@.]/, /example\.(com|org|net)/, /localhost/,
  /synthetic/, /fixture/, /fake/, /dummy/, /noreply/,
  /\+test@/,
];

// ── Types ────────────────────────────────────────────────────────

interface N8nWorkflow {
  id?: string;
  name?: string;
  nodes?: N8nNode[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  pinData?: Record<string, unknown>;
  active?: boolean;
  [key: string]: unknown;
}

interface N8nNode {
  id?: string;
  name?: string;
  type?: string;
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Manifest {
  version?: number;
  workflows?: Record<string, { file: string; id: string }>;
}

interface ValidationError {
  file: string;
  check: string;
  message: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function collectStringValues(obj: unknown): string[] {
  const values: string[] = [];

  function walk(val: unknown): void {
    if (typeof val === "string") {
      values.push(val);
    } else if (Array.isArray(val)) {
      for (const item of val) walk(item);
    } else if (val && typeof val === "object") {
      for (const v of Object.values(val as Record<string, unknown>)) {
        walk(v);
      }
    }
  }

  walk(obj);
  return values;
}

function isSyntheticEmail(email: string): boolean {
  return SYNTHETIC_EMAIL_PATTERNS.some((p) => p.test(email.toLowerCase()));
}

// ── Validators ───────────────────────────────────────────────────

const errors: ValidationError[] = [];
const workflowIds = new Map<string, string>(); // id → filename

function addError(file: string, check: string, message: string): void {
  errors.push({ file, check, message });
}

function validateNamingConvention(
  fileName: string,
  workflow: N8nWorkflow,
): void {
  const stem = fileName.replace(/\.json$/, "");

  if (!NAMING_PATTERN.test(stem)) {
    addError(
      fileName,
      "naming",
      `File name "${stem}" does not match pattern: clarvia.<domain>.<name>.v<N>`,
    );
  }

  if (workflow.name && workflow.name !== stem) {
    addError(
      fileName,
      "naming",
      `Workflow name "${workflow.name}" does not match file name "${stem}"`,
    );
  }
}

function validateSecretPatterns(
  fileName: string,
  rawContent: string,
): void {
  for (const { pattern, label } of SECRET_PATTERNS) {
    if (pattern.test(rawContent)) {
      addError(fileName, "secrets", `Found ${label} in workflow JSON`);
    }
  }
}

function validatePinData(
  fileName: string,
  workflow: N8nWorkflow,
): void {
  if (!workflow.pinData) return;

  const pinValues = collectStringValues(workflow.pinData);
  for (const value of pinValues) {
    const emailMatch = value.match(EMAIL_PATTERN);
    if (emailMatch && !isSyntheticEmail(emailMatch[0])) {
      addError(
        fileName,
        "pinData",
        `Non-synthetic email "${emailMatch[0]}" found in pinData. ` +
          `Use test/example domains for fixtures.`,
      );
    }
  }
}

function validateDuplicateNodeIds(
  fileName: string,
  workflow: N8nWorkflow,
): void {
  if (!workflow.nodes) return;

  const nodeIds = new Map<string, string>();
  for (const node of workflow.nodes) {
    if (!node.id) continue;
    if (nodeIds.has(node.id)) {
      addError(
        fileName,
        "duplicateNodeId",
        `Duplicate node ID "${node.id}" found in nodes ` +
          `"${nodeIds.get(node.id)}" and "${node.name}"`,
      );
    } else {
      nodeIds.set(node.id, node.name || "unnamed");
    }
  }
}

function validateDuplicateWorkflowId(
  fileName: string,
  workflow: N8nWorkflow,
): void {
  if (!workflow.id) {
    addError(fileName, "workflowId", "Workflow is missing an ID");
    return;
  }

  if (workflowIds.has(workflow.id)) {
    addError(
      fileName,
      "duplicateWorkflowId",
      `Duplicate workflow ID "${workflow.id}" — also used by "${workflowIds.get(workflow.id)}"`,
    );
  } else {
    workflowIds.set(workflow.id, fileName);
  }
}

function validateStickyNote(
  fileName: string,
  workflow: N8nWorkflow,
): void {
  if (!workflow.nodes) return;

  const hasStickyNote = workflow.nodes.some(
    (node) => node.type === "n8n-nodes-base.stickyNote",
  );

  if (!hasStickyNote) {
    addError(
      fileName,
      "stickyNote",
      "Workflow is missing a required Sticky Note (§13.1: purpose, input/output contract, owner)",
    );
  }
}

function validateManifest(workflowFiles: string[]): void {
  if (!existsSync(MANIFEST_PATH)) {
    addError("manifest.json", "manifest", "manifest.json does not exist");
    return;
  }

  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")) as Manifest;
  } catch (err) {
    addError(
      "manifest.json",
      "manifest",
      `Failed to parse manifest.json: ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }

  if (!manifest.workflows || typeof manifest.workflows !== "object") {
    addError(
      "manifest.json",
      "manifest",
      "manifest.json is missing the 'workflows' object",
    );
    return;
  }

  // Check every workflow file has a manifest entry
  for (const file of workflowFiles) {
    const stem = file.replace(/\.json$/, "");
    if (!manifest.workflows[stem]) {
      addError(
        "manifest.json",
        "manifest",
        `Workflow file "${file}" has no entry in manifest.json`,
      );
    }
  }

  // Check every manifest entry has a corresponding file
  for (const [name, entry] of Object.entries(manifest.workflows)) {
    if (!workflowFiles.includes(entry.file)) {
      addError(
        "manifest.json",
        "manifest",
        `Manifest entry "${name}" references file "${entry.file}" which does not exist`,
      );
    }

    if (!entry.id) {
      addError(
        "manifest.json",
        "manifest",
        `Manifest entry "${name}" is missing an ID`,
      );
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────

function main(): void {
  console.log("Validating n8n workflows...\n");
  console.log(`Workflows directory: ${WORKFLOWS_DIR}`);

  if (!existsSync(WORKFLOWS_DIR)) {
    console.error(`Error: Workflows directory not found: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  const allFiles = readdirSync(WORKFLOWS_DIR);
  const workflowFiles = allFiles.filter(
    (f) => f.endsWith(".json") && f !== "manifest.json",
  );

  if (workflowFiles.length === 0) {
    console.warn("Warning: No workflow JSON files found.");
    process.exit(0);
  }

  console.log(`Found ${workflowFiles.length} workflow file(s):\n`);

  // Validate each workflow file
  for (const file of workflowFiles) {
    const filePath = join(WORKFLOWS_DIR, file);
    console.log(`  Checking ${file}...`);

    let rawContent: string;
    try {
      rawContent = readFileSync(filePath, "utf-8");
    } catch (err) {
      addError(
        file,
        "parse",
        `Failed to read file: ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    let workflow: N8nWorkflow;
    try {
      workflow = JSON.parse(rawContent) as N8nWorkflow;
    } catch (err) {
      addError(
        file,
        "parse",
        `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    validateNamingConvention(file, workflow);
    validateSecretPatterns(file, rawContent);
    validatePinData(file, workflow);
    validateDuplicateNodeIds(file, workflow);
    validateDuplicateWorkflowId(file, workflow);
    validateStickyNote(file, workflow);
  }

  // Validate manifest completeness
  console.log("\n  Checking manifest.json...");
  validateManifest(workflowFiles);

  // ── Report ───────────────────────────────────────────────────
  console.log("");

  if (errors.length === 0) {
    console.log("✓ All checks passed.\n");
    process.exit(0);
  }

  console.error(`✗ ${errors.length} validation error(s) found:\n`);

  // Group errors by file
  const byFile = new Map<string, ValidationError[]>();
  for (const error of errors) {
    const list = byFile.get(error.file) ?? [];
    list.push(error);
    byFile.set(error.file, list);
  }

  for (const [file, fileErrors] of byFile) {
    console.error(`  ${file}:`);
    for (const error of fileErrors) {
      console.error(`    [${error.check}] ${error.message}`);
    }
    console.error("");
  }

  process.exit(1);
}

main();
