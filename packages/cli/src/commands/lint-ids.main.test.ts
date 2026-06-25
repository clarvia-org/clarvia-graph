import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./lint-ids.js";

/**
 * Tests for `main()` CLI entry point of lint-ids.
 *
 * Calls main() against the real graph data to exercise the CLI
 * formatting and exit-code logic.
 */

describe("main() — lint-ids", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("runs lint and exits 0 when all IDs valid", async () => {
    await main();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("error(s)"),
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
