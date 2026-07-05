import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./validate.js";

interface MockFsGlobal {
  __mockFsFail?: boolean;
}

// Set up dynamic mock for node:fs to trigger validation failure on YAML files
vi.mock("node:fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs")>();
  return {
    ...original,
    readFileSync: (
      path: Parameters<typeof original.readFileSync>[0],
      options: Parameters<typeof original.readFileSync>[1]
    ) => {
      const g = globalThis as unknown as MockFsGlobal;
      if (
        g.__mockFsFail &&
        typeof path === "string" &&
        (path.endsWith(".yml") || path.endsWith(".yaml"))
      ) {
        throw new Error("mock read error");
      }
      return original.readFileSync(path, options);
    }
  };
});

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
    vi
      .spyOn(process, "exit")
      .mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (() => {}) as unknown as typeof process.exit,
      );
    (globalThis as unknown as MockFsGlobal).__mockFsFail = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as unknown as MockFsGlobal).__mockFsFail = false;
  });

  it("validates all files and exits 0 when all pass", async () => {
    await main();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("files passed validation"),
    );
    expect(console.error).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it("handles validation failure and exits non-zero", async () => {
    (globalThis as unknown as MockFsGlobal).__mockFsFail = true;

    await main();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("mock read error"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
