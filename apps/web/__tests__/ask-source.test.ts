import { beforeEach, describe, expect, it, vi } from "vitest";
import { askSourceFromSearch } from "@/lib/ask-source";

describe("Ask source", () => {
  beforeEach(() => { vi.unstubAllGlobals(); });
  it.each(["gclid", "gbraid", "wbraid"])("recognises %s without retaining its value", (key) => {
    expect(askSourceFromSearch(`?${key}=test-click`)).toBe("google_ads");
    expect(askSourceFromSearch(`?${key}=`)).toBe("unknown");
  });
  it("recognises a shared account-wide paid Google tag", () => {
    expect(askSourceFromSearch("?lang=fr&utm_source=google&utm_medium=cpc")).toBe("google_ads");
    expect(askSourceFromSearch("?utm_source=google&utm_medium=organic")).toBe("unknown");
    expect(askSourceFromSearch("?utm_source=partner&utm_medium=cpc")).toBe("unknown");
    expect(askSourceFromSearch("?lang=en")).toBe("unknown");
  });
  it("keeps the marker through client navigation without browser storage", async () => {
    vi.resetModules();
    const source = await import("@/lib/ask-source");
    vi.stubGlobal("window", { location: { search: "?gclid=test-click" } });
    expect(source.currentAskSource()).toBe("google_ads");
    vi.stubGlobal("window", { location: { search: "?lang=fr" } });
    expect(source.currentAskSource()).toBe("google_ads");
  });
  it("does not share attribution across server requests", async () => {
    vi.resetModules();
    const source = await import("@/lib/ask-source");
    source.captureAskSource("?gclid=test-click");
    expect(source.currentAskSource()).toBe("unknown");
  });
});
