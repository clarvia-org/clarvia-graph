import { describe, it, expect } from "vitest";
import { toPosixRel, resolveRootDir, mergeErrors, getOrCreate } from "./utils.js";
import { resolve } from "node:path";

describe("toPosixRel", () => {
  it("converts absolute path to posix-style relative path", () => {
    const root = resolve("/project/root");
    const abs = resolve("/project/root/src/file.ts");
    expect(toPosixRel(abs, root)).toBe("src/file.ts");
  });
});

describe("resolveRootDir", () => {
  it("resolves four levels up from the given directory", () => {
    const dir = resolve("/project/packages/cli/src/commands");
    const result = resolveRootDir(dir);
    expect(result).toBe(resolve("/project"));
  });

  it("falls back to current directory when undefined", () => {
    const result = resolveRootDir(undefined);
    // Should resolve from "." four levels up
    expect(result).toBe(resolve(".", "..", "..", "..", ".."));
  });
});

describe("mergeErrors", () => {
  type ResultEntry = { file: string; schema: string; valid: boolean; errors?: string[] };

  it("does nothing when errors array is empty", () => {
    const results: ResultEntry[] = [];
    mergeErrors(results, "test.yml", "test.schema.json", []);
    expect(results).toHaveLength(0);
  });

  it("creates a new result entry when file is not yet in results", () => {
    const results: ResultEntry[] = [];
    mergeErrors(results, "test.yml", "test.schema.json", ["Error 1"]);
    expect(results).toEqual([
      { file: "test.yml", schema: "test.schema.json", valid: false, errors: ["Error 1"] },
    ]);
  });

  it("merges errors into existing result entry", () => {
    const results: ResultEntry[] = [
      { file: "test.yml", schema: "test.schema.json", valid: true },
    ];
    mergeErrors(results, "test.yml", "test.schema.json", ["Error 1"]);
    expect(results[0].valid).toBe(false);
    expect(results[0].errors).toEqual(["Error 1"]);
  });

  it("appends to existing errors", () => {
    const results: ResultEntry[] = [
      { file: "test.yml", schema: "test.schema.json", valid: false, errors: ["Error 1"] },
    ];
    mergeErrors(results, "test.yml", "test.schema.json", ["Error 2"]);
    expect(results[0].errors).toEqual(["Error 1", "Error 2"]);
  });
});

describe("getOrCreate", () => {
  it("returns existing value when key is present", () => {
    const map = new Map<string, number[]>();
    map.set("a", [1, 2]);
    const result = getOrCreate(map, "a", () => []);
    expect(result).toEqual([1, 2]);
  });

  it("creates and inserts new value when key is missing", () => {
    const map = new Map<string, number[]>();
    const result = getOrCreate(map, "a", () => [99]);
    expect(result).toEqual([99]);
    expect(map.get("a")).toEqual([99]);
  });
});
