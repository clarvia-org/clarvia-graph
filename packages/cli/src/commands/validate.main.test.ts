import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { main } from "./validate.js";

// Set up dynamic mock for node:fs to trigger validation failure on YAML files
vi.mock("node:fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs")>();
  return {
    ...original,
    readFileSync: (path: string, options: any) => {
      if ((globalThis as any).__mockFsFail && (path.endsWith(".yml") || path.endsWith(".yaml"))) {
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
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    (globalThis as any).__mockFsFail = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).__mockFsFail = false;
  });

  it("validates all files and exits 0 when all pass", async () => {
    await main();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("files passed validation"),
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it("handles validation failure and exits non-zero", async () => {
    (globalThis as any).__mockFsFail = true;

    await main();

    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
