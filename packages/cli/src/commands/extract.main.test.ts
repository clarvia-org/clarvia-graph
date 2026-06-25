import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./extract.js";

/**
 * Tests for `main()` CLI entry point of extract.
 *
 * Tests the argv parsing and error handling paths of main().
 * The "missing snapshotId" path is pure CLI logic with no runner dependency.
 */

describe("main() — extract", () => {
  let savedArgv: string[];

  beforeEach(() => {
    savedArgv = [...process.argv];
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    process.argv = savedArgv;
    vi.restoreAllMocks();
  });

  it("exits 1 with usage when no snapshotId in argv", async () => {
    process.argv = ["node", "clarvia", "extract"];

    await main();

    expect(console.error).toHaveBeenCalledWith(
      "Usage: clarvia extract <snapshot_id>",
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("exits 1 when snapshot_id is not found", async () => {
    process.argv = ["node", "clarvia", "extract", "snapshot.nonexistent.thing"];

    await main();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Extract failed"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("handles already-existing assertion file", async () => {
    // Use a real snapshot ID that has already been extracted
    process.argv = [
      "node",
      "clarvia",
      "extract",
      "snapshot.guichet_lu.bereavement.2026_06_03",
    ];

    await main();

    // The assertion file already exists, so main() should log that
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("already exists"),
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
