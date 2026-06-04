import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve } from "node:path";
import { runValidate } from "./validate.js";

/**
 * Tests for the `clarvia validate` command.
 *
 * These use self-contained fixtures under packages/cli/tests/ so they
 * run independently of whether the real schemas have been created yet.
 */

const FIXTURES_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures");
const EMPTY_DIR = resolve(import.meta.dirname!, "..", "..", "tests", "fixtures-empty");

describe("validate command", () => {
  it("returns ok=true and empty results when no YAML data files exist", async () => {
    const { results, ok } = await runValidate({ rootDir: EMPTY_DIR });
    expect(ok).toBe(true);
    expect(results).toHaveLength(0);
  });

  it("validates a valid consequence file against its schema", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });

    // There should be at least the consequence fixture
    const consequence = results.find((r) =>
      r.file.includes("survivors_pension.yml"),
    );
    expect(consequence).toBeDefined();
    expect(consequence!.schema).toBe("consequence.schema.json");
    expect(consequence!.valid).toBe(true);
  });

  it("validates a valid authority file against its schema", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });

    const authority = results.find((r) => r.file.includes("cnap.yml"));
    expect(authority).toBeDefined();
    expect(authority!.schema).toBe("authority.schema.json");
    expect(authority!.valid).toBe(true);
  });

  it("validates source assertion batch files with $ref resolution", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });

    const assertion = results.find((r) =>
      r.file.includes("guichet_bereavement.yml"),
    );
    expect(assertion).toBeDefined();
    expect(assertion!.schema).toBe("source_assertion.schema.json");
    expect(assertion!.valid).toBe(true);
  });

  it("reports validation errors for files that don't match the schema", async () => {
    const { results, ok } = await runValidate({ rootDir: FIXTURES_DIR });

    // The bad_id fixture has an uppercase ID — won't match the id pattern
    const badId = results.find((r) => r.file.includes("bad_id.yml"));
    expect(badId).toBeDefined();
    expect(badId!.valid).toBe(false);
    expect(badId!.errors).toBeDefined();
    expect(badId!.errors!.length).toBeGreaterThan(0);

    // Overall should fail because of the bad files
    expect(ok).toBe(false);
  });

  it("skips .gitkeep files", async () => {
    const { results } = await runValidate({ rootDir: FIXTURES_DIR });
    const gitkeep = results.find((r) => r.file.includes(".gitkeep"));
    expect(gitkeep).toBeUndefined();
  });
});

import { writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

describe("snapshot and anchor validation integration", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = resolve(import.meta.dirname!, "..", "..", `temp-test-snapshots-${Math.random().toString(36).substring(7)}`);
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
    cpSync(resolve(FIXTURES_DIR, "schemas"), resolve(tempDir, "schemas"), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("passes when snapshot is valid and anchor quote is found in archive", async () => {
    // Write valid HTML archive
    const htmlContent = "<html><body>this is some official guidance and pension de survie text</body></html>";
    const computedHash = createHash("sha256").update(htmlContent).digest("hex");

    mkdirSync(join(tempDir, "sources", "snapshots", "html"), { recursive: true });
    mkdirSync(join(tempDir, "sources", "assertions", "lu"), { recursive: true });

    writeFileSync(
      join(tempDir, "sources", "snapshots", "html", "guichet_lu_20250101.html"),
      htmlContent,
    );

    // Write valid snapshot YAML
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:${computedHash}"
archive_uri: "sources/snapshots/html/guichet_lu_20250101.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    // Write valid assertion batch YAML
    writeFileSync(
      join(tempDir, "sources", "assertions", "lu", "guichet_bereavement.yml"),
      `source_id: "source.lu_gov.guichet_bereavement"
source_snapshot_id: "snapshot.lu_gov.guichet_bereavement.20250101"
assertions:
  - id: "assertion.lu_gov.guichet_bereavement.survivors_pension_exists"
    schema_version: "0.1.0"
    claim_type: "entitlement_exists"
    claim_text: "A survivor's pension is available."
    claim_scope:
      jurisdiction: "lu"
      life_event: "bereavement"
      domain: "social_security"
    anchor:
      selector_type: "text_quote"
      text_quote: "pension de survie"
    source_tier: "official_guidance"
    record_valid_from: "2025-01-01"
    review_status: "draft"
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(true);
    expect(results.every(r => r.valid)).toBe(true);
  });

  it("fails when snapshot archive is missing", async () => {
    mkdirSync(join(tempDir, "sources", "snapshots"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:47c76342e232d4bd3185c1048f52a4def133e471146263f52d4cc0a8e5598ad3"
archive_uri: "sources/snapshots/html/missing.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const snapshotResult = results.find(r => r.file.includes("guichet_lu_20250101.yml"));
    expect(snapshotResult).toBeDefined();
    expect(snapshotResult!.valid).toBe(false);
    expect(snapshotResult!.errors!.join(" ")).toContain("Archive file does not exist");
  });

  it("fails when content_hash has pending value", async () => {
    mkdirSync(join(tempDir, "sources", "snapshots"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "pending_capture"
archive_uri: "sources/snapshots/html/guichet_lu_20250101.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const snapshotResult = results.find(r => r.file.includes("guichet_lu_20250101.yml"));
    expect(snapshotResult!.valid).toBe(false);
    expect(snapshotResult!.errors!.join(" ")).toContain("pending value");
  });

  it("fails when hash mismatch occurs", async () => {
    mkdirSync(join(tempDir, "sources", "snapshots", "html"), { recursive: true });
    writeFileSync(join(tempDir, "sources", "snapshots", "html", "guichet_lu_20250101.html"), "different content");
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:47c76342e232d4bd3185c1048f52a4def133e471146263f52d4cc0a8e5598ad3"
archive_uri: "sources/snapshots/html/guichet_lu_20250101.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const snapshotResult = results.find(r => r.file.includes("guichet_lu_20250101.yml"));
    expect(snapshotResult!.valid).toBe(false);
    expect(snapshotResult!.errors!.join(" ")).toContain("Hash mismatch for archive file");
  });

  it("validates .html with LF line endings", async () => {
    const htmlContent = "<html>\n<body>\nsome text\n</body>\n</html>\n";
    const computedHash = createHash("sha256").update(htmlContent).digest("hex");

    mkdirSync(join(tempDir, "sources", "snapshots", "html"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "snapshots", "html", "lf_test.html"),
      htmlContent,
    );
    writeFileSync(
      join(tempDir, "sources", "snapshots", "lf_test.yml"),
      `id: snapshot.test.lf_test.20250101
schema_version: "0.1.0"
source_id: source.test.lf_test
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:${computedHash}"
archive_uri: "sources/snapshots/html/lf_test.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    const snapshotResult = results.find(r => r.file.includes("lf_test.yml"));
    expect(snapshotResult?.valid ?? true).toBe(true);
    expect(ok).toBe(true);
  });

  it(".html with CRLF produces same canonical hash as LF", async () => {
    const lfContent = "<html>\n<body>\nsome text\n</body>\n</html>\n";
    const crlfContent = "<html>\r\n<body>\r\nsome text\r\n</body>\r\n</html>\r\n";
    const lfHash = createHash("sha256").update(lfContent).digest("hex");

    mkdirSync(join(tempDir, "sources", "snapshots", "html"), { recursive: true });
    // Write file with CRLF line endings
    writeFileSync(
      join(tempDir, "sources", "snapshots", "html", "crlf_test.html"),
      crlfContent,
    );
    // Use the LF hash — validator should normalize CRLF to LF before hashing
    writeFileSync(
      join(tempDir, "sources", "snapshots", "crlf_test.yml"),
      `id: snapshot.test.crlf_test.20250101
schema_version: "0.1.0"
source_id: source.test.crlf_test
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:${lfHash}"
archive_uri: "sources/snapshots/html/crlf_test.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    const snapshotResult = results.find(r => r.file.includes("crlf_test.yml"));
    expect(snapshotResult?.valid ?? true).toBe(true);
    expect(ok).toBe(true);
  });

  it(".txt with CRLF produces same canonical hash as LF", async () => {
    const lfContent = "line one\nline two\nline three\n";
    const crlfContent = "line one\r\nline two\r\nline three\r\n";
    const lfHash = createHash("sha256").update(lfContent).digest("hex");

    mkdirSync(join(tempDir, "sources", "snapshots", "html"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "snapshots", "html", "crlf_test.txt"),
      crlfContent,
    );
    writeFileSync(
      join(tempDir, "sources", "snapshots", "crlf_test_txt.yml"),
      `id: snapshot.test.crlf_txt.20250101
schema_version: "0.1.0"
source_id: source.test.crlf_txt
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:${lfHash}"
archive_uri: "sources/snapshots/html/crlf_test.txt"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    const snapshotResult = results.find(r => r.file.includes("crlf_test_txt.yml"));
    expect(snapshotResult?.valid ?? true).toBe(true);
    expect(ok).toBe(true);
  });

  it("binary files are hashed as raw bytes without line-ending normalization", async () => {
    // Create a fake PDF with CRLF bytes — these should NOT be normalized
    const binaryContent = Buffer.from("%PDF-1.4\r\nfake binary content\r\nwith CRLF\r\n");
    const rawHash = createHash("sha256").update(binaryContent).digest("hex");

    mkdirSync(join(tempDir, "sources", "snapshots", "pdf"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "snapshots", "pdf", "test_binary.pdf"),
      binaryContent,
    );
    // Use the raw-byte hash — validator must NOT normalize CRLF for .pdf files
    writeFileSync(
      join(tempDir, "sources", "snapshots", "binary_test.yml"),
      `id: snapshot.test.binary.20250101
schema_version: "0.1.0"
source_id: source.test.binary
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:${rawHash}"
archive_uri: "sources/snapshots/pdf/test_binary.pdf"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    const snapshotResult = results.find(r => r.file.includes("binary_test.yml"));
    expect(snapshotResult?.valid ?? true).toBe(true);
    expect(ok).toBe(true);
  });

  it("fails when http_status is missing", async () => {
    mkdirSync(join(tempDir, "sources", "snapshots"), { recursive: true });
    // http_status is missing in YAML, but notice that source_snapshot.schema.json doesn't list it as required.
    // However, our custom validator checks it!
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:47c76342e232d4bd3185c1048f52a4def133e471146263f52d4cc0a8e5598ad3"
archive_uri: "sources/snapshots/html/guichet_lu_20250101.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const snapshotResult = results.find(r => r.file.includes("guichet_lu_20250101.yml"));
    expect(snapshotResult!.valid).toBe(false);
    expect(snapshotResult!.errors!.join(" ")).toContain("Missing required field: http_status");
  });

  it("fails when assertion text quote is missing from archive content", async () => {
    const htmlContent = "<html><body>only some other text here</body></html>";
    const computedHash = createHash("sha256").update(htmlContent).digest("hex");

    mkdirSync(join(tempDir, "sources", "snapshots", "html"), { recursive: true });
    mkdirSync(join(tempDir, "sources", "assertions", "lu"), { recursive: true });

    writeFileSync(join(tempDir, "sources", "snapshots", "html", "guichet_lu_20250101.html"), htmlContent);
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:${computedHash}"
archive_uri: "sources/snapshots/html/guichet_lu_20250101.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    writeFileSync(
      join(tempDir, "sources", "assertions", "lu", "guichet_bereavement.yml"),
      `source_id: "source.lu_gov.guichet_bereavement"
source_snapshot_id: "snapshot.lu_gov.guichet_bereavement.20250101"
assertions:
  - id: "assertion.lu_gov.guichet_bereavement.survivors_pension_exists"
    schema_version: "0.1.0"
    claim_type: "entitlement_exists"
    claim_text: "A survivor's pension is available."
    claim_scope:
      jurisdiction: "lu"
      life_event: "bereavement"
      domain: "social_security"
    anchor:
      selector_type: "text_quote"
      text_quote: "pension de survie"
    source_tier: "official_guidance"
    record_valid_from: "2025-01-01"
    review_status: "draft"
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const assertionResult = results.find(r => r.file.includes("guichet_bereavement.yml"));
    expect(assertionResult).toBeDefined();
    expect(assertionResult!.valid).toBe(false);
    expect(assertionResult!.errors!.join(" ")).toContain("anchor text_quote \"pension de survie\" not found");
  });

  it("fails when a task template is public/approved but has no provenance block", async () => {
    // Write valid snapshot
    mkdirSync(join(tempDir, "sources", "snapshots"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "snapshots", "guichet_lu_20250101.yml"),
      `id: snapshot.lu_gov.guichet_bereavement.20250101
schema_version: "0.1.0"
source_id: source.lu_gov.guichet_bereavement
captured_at: "2025-01-01T12:00:00Z"
capture_method: http_get
content_hash: "sha256:47c76342e232d4bd3185c1048f52a4def133e471146263f52d4cc0a8e5598ad3"
archive_uri: "sources/snapshots/html/guichet_lu_20250101.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2025-01-01"
http_status: 200
`,
    );

    // Write task template that is public/approved but has NO provenance
    mkdirSync(join(tempDir, "graph", "task_templates"), { recursive: true });
    writeFileSync(
      join(tempDir, "graph", "task_templates", "test_task.yml"),
      `id: task_template.lu.bereavement.death_registration.test_task
schema_version: "0.1.0"
title: "Test Task"
action_type: file_declaration
jurisdiction: LU
life_event: bereavement
domain: death_registration
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-03"
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const templateResult = results.find(r => r.file.includes("test_task.yml"));
    expect(templateResult).toBeDefined();
    expect(templateResult!.valid).toBe(false);
    expect(templateResult!.errors!.join(" ")).toContain("Public and approved task template requires a provenance block");
  });

  it("fails when task template provenance references a missing snapshot", async () => {
    // Write task template that is public/approved with broken provenance snapshot reference
    mkdirSync(join(tempDir, "graph", "task_templates"), { recursive: true });
    writeFileSync(
      join(tempDir, "graph", "task_templates", "test_task.yml"),
      `id: task_template.lu.bereavement.death_registration.test_task
schema_version: "0.1.0"
title: "Test Task"
action_type: file_declaration
jurisdiction: LU
life_event: bereavement
domain: death_registration
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-03"
provenance:
  derived_from_snapshot_ref: snapshot.missing.ref.20250101
  extraction_method: ai_assisted
  extracted_by: software.extractor.v0.1
  extracted_at: "2026-06-03T12:00:00Z"
  reviewed_by: reviewer.lu.001
  reviewed_at: "2026-06-03T12:00:00Z"
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const templateResult = results.find(r => r.file.includes("test_task.yml"));
    expect(templateResult).toBeDefined();
    expect(templateResult!.valid).toBe(false);
    expect(templateResult!.errors!.join(" ")).toContain("provenance.derived_from_snapshot_ref \"snapshot.missing.ref.20250101\" does not resolve to an existing source snapshot");
  });
});

describe("condition and intake cross-validation integration", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = resolve(import.meta.dirname!, "..", "..", `temp-test-conditions-${Math.random().toString(36).substring(7)}`);
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
    cpSync(resolve(FIXTURES_DIR, "schemas"), resolve(tempDir, "schemas"), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("passes when condition var matches referenced intake fact path", async () => {
    mkdirSync(join(tempDir, "graph", "intake_fact_types", "bereavement"), { recursive: true });
    mkdirSync(join(tempDir, "graph", "conditions", "bereavement"), { recursive: true });

    writeFileSync(
      join(tempDir, "graph", "intake_fact_types", "bereavement", "jurisdiction_of_death.yml"),
      `id: intake_fact.global.bereavement.jurisdiction_of_death
schema_version: "0.1.0"
path: death.place.country
label: Country of death
value_type: string
cardinality: single
`,
    );

    writeFileSync(
      join(tempDir, "graph", "conditions", "bereavement", "death_occurred_in_lu.yml"),
      `id: condition.lu.bereavement.death_registration.death_occurred_in_lu
schema_version: "0.1.0"
title: "Death occurred in Luxembourg"
condition_type: criterion
jurisdiction: LU
life_event: bereavement
domain: death_registration
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-03"
expression_language: jsonlogic
expression:
  "==":
    - { "var": "death.place.country" }
    - "LU"
missing_fact_behavior: unknown
information_concept_refs:
  - intake_fact.global.bereavement.jurisdiction_of_death
`,
    );

    const { ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(true);
  });

  it("fails when condition var has no matching intake fact path", async () => {
    mkdirSync(join(tempDir, "graph", "conditions", "bereavement"), { recursive: true });
    writeFileSync(
      join(tempDir, "graph", "conditions", "bereavement", "death_occurred_in_lu.yml"),
      `id: condition.lu.bereavement.death_registration.death_occurred_in_lu
schema_version: "0.1.0"
title: "Death occurred in Luxembourg"
condition_type: criterion
jurisdiction: LU
life_event: bereavement
domain: death_registration
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-03"
expression_language: jsonlogic
expression:
  "==":
    - { "var": "death.place.country" }
    - "LU"
missing_fact_behavior: unknown
information_concept_refs: []
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const condResult = results.find(r => r.file.includes("death_occurred_in_lu.yml"));
    expect(condResult!.valid).toBe(false);
    expect(condResult!.errors!.join(" ")).toContain("is not defined in any intake fact type");
  });

  it("fails when information_concept_ref does not exist", async () => {
    mkdirSync(join(tempDir, "graph", "conditions", "bereavement"), { recursive: true });
    writeFileSync(
      join(tempDir, "graph", "conditions", "bereavement", "death_occurred_in_lu.yml"),
      `id: condition.lu.bereavement.death_registration.death_occurred_in_lu
schema_version: "0.1.0"
title: "Death occurred in Luxembourg"
condition_type: criterion
jurisdiction: LU
life_event: bereavement
domain: death_registration
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-03"
expression_language: jsonlogic
expression:
  "==":
    - "LU"
    - "LU"
missing_fact_behavior: unknown
information_concept_refs:
  - intake_fact.global.bereavement.missing_id
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const condResult = results.find(r => r.file.includes("death_occurred_in_lu.yml"));
    expect(condResult!.valid).toBe(false);
    expect(condResult!.errors!.join(" ")).toContain("does not resolve to any defined intake fact type");
  });

  it("fails when condition var is not referenced in information_concept_refs", async () => {
    mkdirSync(join(tempDir, "graph", "intake_fact_types", "bereavement"), { recursive: true });
    mkdirSync(join(tempDir, "graph", "conditions", "bereavement"), { recursive: true });

    writeFileSync(
      join(tempDir, "graph", "intake_fact_types", "bereavement", "jurisdiction_of_death.yml"),
      `id: intake_fact.global.bereavement.jurisdiction_of_death
schema_version: "0.1.0"
path: death.place.country
label: Country of death
value_type: string
cardinality: single
`,
    );

    writeFileSync(
      join(tempDir, "graph", "conditions", "bereavement", "death_occurred_in_lu.yml"),
      `id: condition.lu.bereavement.death_registration.death_occurred_in_lu
schema_version: "0.1.0"
title: "Death occurred in Luxembourg"
condition_type: criterion
jurisdiction: LU
life_event: bereavement
domain: death_registration
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-03"
expression_language: jsonlogic
expression:
  "==":
    - { "var": "death.place.country" }
    - "LU"
missing_fact_behavior: unknown
information_concept_refs: []
`,
    );

    const { results, ok } = await runValidate({ rootDir: tempDir });
    expect(ok).toBe(false);
    const condResult = results.find(r => r.file.includes("death_occurred_in_lu.yml"));
    expect(condResult!.valid).toBe(false);
    expect(condResult!.errors!.join(" ")).toContain("does not reference its intake fact type ID");
  });
});

