import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./check-references.js";

/**
 * Tests for `main()` CLI entry point of check-references.
 *
 * Calls main() against the real graph data to exercise the CLI
 * formatting and exit-code logic.
 */

describe("main() — check-references", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("runs to completion and exits 0", async () => {
    // Alpha behavior: always exits 0
    await main();

    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
