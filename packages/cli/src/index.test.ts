import { describe, it, expect, vi } from "vitest";

describe("CLI", () => {
  it("should export help text without errors", async () => {
    // Mock process.exit so the CLI help handler doesn't terminate the test
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    try {
      const mod = await import("./index.js");
      expect(mod).toBeDefined();
    } finally {
      exitSpy.mockRestore();
    }
  });
});
