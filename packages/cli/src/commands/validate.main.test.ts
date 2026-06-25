import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./validate.js";

/**
 * Tests for `main()` CLI entry point of validate.
 *
 * Calls main() against the real graph data to exercise the CLI
 * formatting and exit-code logic.
 */

describe("main() — validate", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates all files and exits 0 when all pass", async () => {
    await main();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("files passed validation"),
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
