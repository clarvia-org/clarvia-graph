import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve, join } from "node:path";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { parse as parseYaml } from "yaml";
import { runExtract } from "./extract.js";

/**
 * Tests for the `clarvia extract` command.
 *
 * Uses temp directories with fixture snapshot/register files
 * to test the runExtract function in isolation.
 */

describe("extract command", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "clarvia-extract-test-"));

    // Write source register
    mkdirSync(join(tempDir, "sources"), { recursive: true });
    writeFileSync(
      join(tempDir, "sources", "register.yml"),
      `sources:
  - id: source.guichet_lu.bereavement
    title: "Dealing with the death of a loved one"
    url: "https://guichet.public.lu/en/citoyens/deces.html"
    source_type: government_portal
    jurisdiction: LU
    publisher: "Guichet.lu"
    languages: [en]
    domain: death_registration
    life_event: bereavement
    source_role: primary_guidance
    monitoring:
      active: true
      frequency_days: 30
    verified_at: "2026-05-27"
`,
    );

    // Write a snapshot YAML
    mkdirSync(join(tempDir, "sources", "snapshots"), { recursive: true });
    writeFileSync(
      join(
        tempDir,
        "sources",
        "snapshots",
        "guichet_lu_bereavement_2026_06_05.yml",
      ),
      `id: snapshot.guichet_lu.bereavement.2026_06_05
schema_version: "0.1.0"
source_id: source.guichet_lu.bereavement
captured_at: "2026-06-05T10:00:00Z"
capture_method: http_get
http_status: 200
content_type: "text/html"
content_hash: "sha256:abc123"
archive_uri: "sources/snapshots/html/guichet_lu_bereavement_2026_06_05.html"
page_url: "https://guichet.public.lu/en/citoyens/deces.html"
authoring_status: approved
distribution_status: public_open
record_valid_from: "2026-06-05"
captured_by: "software.cli.v0.1"
source_last_modified_at: null
`,
    );
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("scaffolds an assertion batch with correct structure", async () => {
    const now = new Date("2026-06-05T10:00:00Z");

    const result = await runExtract({
      rootDir: tempDir,
      snapshotId: "snapshot.guichet_lu.bereavement.2026_06_05",
      now,
    });

    expect(result.alreadyExists).toBe(false);
    expect(result.outputPath).toBe(
      "sources/assertions/lu/guichet_lu/bereavement.yml",
    );

    // Verify file was created
    const filePath = resolve(tempDir, result.outputPath);
    expect(existsSync(filePath)).toBe(true);

    // Parse and verify structure
    const raw = readFileSync(filePath, "utf-8");
    const data = parseYaml(raw) as Record<string, unknown>;

    expect(data.source_id).toBe("source.guichet_lu.bereavement");
    expect(data.source_snapshot_id).toBe(
      "snapshot.guichet_lu.bereavement.2026_06_05",
    );

    const assertions = data.assertions as Array<Record<string, unknown>>;
    expect(assertions).toHaveLength(1);

    const assertion = assertions[0];
    expect(assertion.schema_version).toBe("0.1.0");
    expect(assertion.claim_type).toBe("legal_scope");
    expect(assertion.source_tier).toBe("official_guidance");
    expect(assertion.review_status).toBe("draft");
    expect(assertion.confidence).toBe("unassessed");
    expect(assertion.record_valid_from).toBe("2026-06-05");

    const scope = assertion.claim_scope as Record<string, unknown>;
    expect(scope.jurisdiction).toBe("LU");
    expect(scope.life_event).toBe("bereavement");
    expect(scope.domain).toBe("death_registration");

    const anchor = assertion.anchor as Record<string, unknown>;
    expect(anchor.selector_type).toBe("text_quote");

    const provenance = assertion.provenance as Record<string, unknown>;
    expect(provenance.extraction_method).toBe("ai_assisted");
  });

  it("throws when snapshot is not found", async () => {
    await expect(
      runExtract({
        rootDir: tempDir,
        snapshotId: "snapshot.nonexistent.thing.2026_06_05",
      }),
    ).rejects.toThrow("not found");
  });

  it("does not overwrite an existing file", async () => {
    const outputDir = join(
      tempDir,
      "sources",
      "assertions",
      "lu",
      "guichet_lu",
    );
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, "bereavement.yml");
    writeFileSync(outputPath, "existing content\n");

    const result = await runExtract({
      rootDir: tempDir,
      snapshotId: "snapshot.guichet_lu.bereavement.2026_06_05",
    });

    expect(result.alreadyExists).toBe(true);

    // Verify original content is preserved
    const content = readFileSync(outputPath, "utf-8");
    expect(content).toBe("existing content\n");
  });
});
