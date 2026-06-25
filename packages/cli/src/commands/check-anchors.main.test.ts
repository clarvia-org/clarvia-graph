import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./check-anchors.js";

/**
 * Tests for `main()` CLI entry point of check-anchors.
 *
 * Calls main() against the real graph data to exercise the CLI formatting
 * and exit-code logic. Current data has anchors that all pass.
 */

describe("main() — check-anchors", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints results and exits 0 when all anchors verified", async () => {
    await main();

    // Should print at least one anchor verification result
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("anchor(s) verified"),
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
