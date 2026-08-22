import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { ADS_FINAL_URLS, LANGUAGE_REDIRECTS, hreflangLanguages } from "@/lib/i18n";

describe("sitemap", () => {
  it("includes an indexable contact page for every language", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://clarvia.org/en/contact");
    expect(urls).toContain("https://clarvia.org/fr/contact");
    expect(urls).toContain("https://clarvia.org/de/contact");
    expect(urls).toContain("https://clarvia.org/lu/contact");
  });

  it("sets hreflang x-default to the English URL", () => {
    const home = sitemap().find((entry) => entry.url === "https://clarvia.org/en");
    expect(home?.alternates?.languages?.["x-default"]).toBe("https://clarvia.org/en");

    const contact = sitemap().find((entry) => entry.url === "https://clarvia.org/en/contact");
    expect(contact?.alternates?.languages?.["x-default"]).toBe("https://clarvia.org/en/contact");
  });
});

describe("hreflangLanguages", () => {
  it("maps Luxembourgish to lb and defaults to English", () => {
    expect(hreflangLanguages()).toMatchObject({
      en: "https://clarvia.org/en",
      fr: "https://clarvia.org/fr",
      de: "https://clarvia.org/de",
      lb: "https://clarvia.org/lu",
      "x-default": "https://clarvia.org/en",
    });
  });
});

describe("ads landing URLs", () => {
  it("sends Luxembourgish ads to /lu, not /en or /lb", () => {
    expect(ADS_FINAL_URLS.ask).toEqual({
      en: "https://clarvia.org/en",
      fr: "https://clarvia.org/fr",
      de: "https://clarvia.org/de",
      lb: "https://clarvia.org/lu",
    });
    expect(ADS_FINAL_URLS.support.lb).toBe("https://clarvia.org/lu/support");
    expect(ADS_FINAL_URLS.ask.lb).not.toContain("/en");
    expect(ADS_FINAL_URLS.ask.lb).not.toMatch(/\/lb$/);
  });

  it("redirects Google’s lb path onto the Luxembourgish site", () => {
    expect(LANGUAGE_REDIRECTS).toEqual([
      { source: "/lb", destination: "/lu", permanent: true },
      { source: "/lb/:path*", destination: "/lu/:path*", permanent: true },
    ]);
  });
});
