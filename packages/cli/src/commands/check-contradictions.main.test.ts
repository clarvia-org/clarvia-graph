import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./check-contradictions.js";

/**
 * Tests for `main()` CLI entry point of check-contradictions.
 *
 * Calls main() against the real graph data (currently no contradictions)
 * to exercise the CLI formatting and exit-code logic.
 */

describe("main() — check-contradictions", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints success and exits 0 when no contradictions found", async () => {
    await main();

    expect(console.log).toHaveBeenCalledWith("✔ No contradictions found.");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Report written to:"),
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
