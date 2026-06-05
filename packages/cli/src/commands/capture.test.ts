import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve, join } from "node:path";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { parse as parseYaml } from "yaml";
import { runCapture } from "./capture.js";

/**
 * Tests for the `clarvia capture` command.
 *
 * Uses temp directories and a mock fetch to test the runCapture
 * function in isolation from real network calls.
 */

function createMockFetch(body: string, status = 200, contentType = "text/html; charset=utf-8") {
  return async (_url: string | URL | Request): Promise<Response> => {
    return new Response(body, {
      status,
      headers: { "content-type": contentType },
    });
  };
}

describe("capture command", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "clarvia-capture-test-"));
    // Write a minimal source register
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
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("captures a source and produces correct YAML and HTML output", async () => {
    const htmlContent = "<html>\n<body>Hello world</body>\n</html>\n";
    const now = new Date("2026-06-05T10:00:00Z");

    const result = await runCapture({
      rootDir: tempDir,
      sourceId: "source.guichet_lu.bereavement",
      fetchFn: createMockFetch(htmlContent),
      now,
    });

    // Check snapshot ID
    expect(result.snapshotId).toBe(
      "snapshot.guichet_lu.bereavement.2026_06_05",
    );

    // Check hash
    const expectedHash = createHash("sha256")
      .update(htmlContent, "utf-8")
      .digest("hex");
    expect(result.contentHash).toBe(`sha256:${expectedHash}`);

    // Check HTML file was written
    const htmlPath = resolve(tempDir, result.htmlPath);
    const savedHtml = readFileSync(htmlPath, "utf-8");
    expect(savedHtml).toBe(htmlContent);

    // Check YAML file was written with correct fields
    const yamlPath = resolve(tempDir, result.yamlPath);
    const yamlRaw = readFileSync(yamlPath, "utf-8");
    const snapshot = parseYaml(yamlRaw) as Record<string, unknown>;

    expect(snapshot.id).toBe("snapshot.guichet_lu.bereavement.2026_06_05");
    expect(snapshot.schema_version).toBe("0.1.0");
    expect(snapshot.source_id).toBe("source.guichet_lu.bereavement");
    expect(snapshot.capture_method).toBe("http_get");
    expect(snapshot.http_status).toBe(200);
    expect(snapshot.content_hash).toBe(`sha256:${expectedHash}`);
    expect(snapshot.archive_uri).toBe(
      "sources/snapshots/html/guichet_lu_bereavement_2026_06_05.html",
    );
    expect(snapshot.authoring_status).toBe("approved");
    expect(snapshot.distribution_status).toBe("public_open");
    expect(snapshot.record_valid_from).toBe("2026-06-05");
    expect(snapshot.captured_by).toBe("software.cli.v0.1");
    expect(snapshot.source_last_modified_at).toBeNull();
    expect(snapshot.page_url).toBe(
      "https://guichet.public.lu/en/citoyens/deces.html",
    );
  });

  it("throws when source_id is not found in register", async () => {
    await expect(
      runCapture({
        rootDir: tempDir,
        sourceId: "source.nonexistent.thing",
        fetchFn: createMockFetch("<html></html>"),
      }),
    ).rejects.toThrow("not found in register");
  });

  it("throws on HTTP error status", async () => {
    await expect(
      runCapture({
        rootDir: tempDir,
        sourceId: "source.guichet_lu.bereavement",
        fetchFn: createMockFetch("Not Found", 404),
      }),
    ).rejects.toThrow("HTTP 404");
  });

  it("normalizes CRLF to LF and produces correct hash", async () => {
    const crlfContent = "<html>\r\n<body>\r\nHello\r\n</body>\r\n</html>\r\n";
    const lfContent = "<html>\n<body>\nHello\n</body>\n</html>\n";
    const now = new Date("2026-06-05T10:00:00Z");

    const result = await runCapture({
      rootDir: tempDir,
      sourceId: "source.guichet_lu.bereavement",
      fetchFn: createMockFetch(crlfContent),
      now,
    });

    // Hash should be computed from LF-normalized content
    const expectedHash = createHash("sha256")
      .update(lfContent, "utf-8")
      .digest("hex");
    expect(result.contentHash).toBe(`sha256:${expectedHash}`);

    // Saved HTML should have LF line endings
    const htmlPath = resolve(tempDir, result.htmlPath);
    const savedHtml = readFileSync(htmlPath, "utf-8");
    expect(savedHtml).toBe(lfContent);
    expect(savedHtml).not.toContain("\r\n");
  });

  it("preserves content-type from response headers", async () => {
    const now = new Date("2026-06-05T10:00:00Z");
    await runCapture({
      rootDir: tempDir,
      sourceId: "source.guichet_lu.bereavement",
      fetchFn: createMockFetch("<html></html>", 200, "text/html; charset=iso-8859-1"),
      now,
    });

    const yamlPath = resolve(
      tempDir,
      "sources",
      "snapshots",
      "guichet_lu_bereavement_2026_06_05.yml",
    );
    const yamlRaw = readFileSync(yamlPath, "utf-8");
    const snapshot = parseYaml(yamlRaw) as Record<string, unknown>;
    expect(snapshot.content_type).toBe("text/html; charset=iso-8859-1");
  });
});
