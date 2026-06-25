import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./check-publication-gate.js";

/**
 * Tests for `main()` CLI entry point of check-publication-gate.
 *
 * Strategy: override `import.meta.dirname` via vi.stubGlobal is not feasible,
 * so we mock the internal runner. However, ESM same-module references can't be
 * intercepted, so we test main() against the real graph data (characterization)
 * to exercise the CLI formatting and exit-code logic.
 */

describe("main() — check-publication-gate", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints success and exits 0 when all gates pass", async () => {
    // main() resolves rootDir from import.meta.dirname (4 levels up).
    // Against the real graph data, all records currently pass the gate.
    await main();

    expect(console.log).toHaveBeenCalledWith(
      "✔ All consequences and task templates pass publication gate.",
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
