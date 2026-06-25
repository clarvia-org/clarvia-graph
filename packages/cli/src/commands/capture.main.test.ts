import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./capture.js";

/**
 * Tests for `main()` CLI entry point of capture.
 *
 * Tests the argv parsing and error handling paths of main().
 * The "missing sourceId" path is pure CLI logic with no runner dependency.
 */

describe("main() — capture", () => {
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

  it("exits 1 with usage when no sourceId in argv", async () => {
    process.argv = ["node", "clarvia", "capture"];

    await main();

    expect(console.error).toHaveBeenCalledWith(
      "Usage: clarvia capture <source_id>",
    );
    expect(console.error).toHaveBeenCalledWith(
      "Example: clarvia capture source.guichet_lu.bereavement",
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("exits 1 when source_id is not found in register", async () => {
    process.argv = ["node", "clarvia", "capture", "source.nonexistent.thing"];

    await main();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Capture failed"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
