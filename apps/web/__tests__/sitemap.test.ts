import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  ADS_FINAL_URLS,
  ASK_PATH_REDIRECTS,
  LANGUAGE_REDIRECTS,
  LEGACY_GUIDANCE_REDIRECTS,
  RESEARCH_REDIRECTS,
  hreflangLanguages,
} from "@/lib/i18n";

describe("sitemap", () => {
  it("includes guidance, how-it-works, checklist, guide, and EN research URLs", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(entries).toHaveLength(1076);
    expect(urls).toContain("https://clarvia.org/en/how-it-works");
    expect(urls).toContain("https://clarvia.org/fr/guidance");
    expect(urls).toContain("https://clarvia.org/en/checklist");
    expect(urls).toContain("https://clarvia.org/en/research");
    expect(urls).toContain(
      "https://clarvia.org/en/research/cross-border-bereavement-integration-index",
    );
    expect(urls).toContain(
      "https://clarvia.org/en/research/global-post-death-civil-registration-atlas",
    );
    expect(urls).toContain(
      "https://clarvia.org/en/research/global-advance-directives-incapacity-mandates-atlas",
    );
    expect(urls).not.toContain("https://clarvia.org/fr/research");
    expect(urls).toContain(
      "https://clarvia.org/en/guide/luxembourg-bereavement-checklist",
    );
    expect(urls).toContain(
      "https://clarvia.org/fr/guide/luxembourg-bereavement-checklist",
    );
    expect(urls).not.toContain(
      "https://clarvia.org/en/guidance/lu/registering-a-death",
    );
    expect(urls).toContain("https://clarvia.org/en/updates/ask-clarvia-launches");
    expect(urls).toContain("https://clarvia.org/ask");
    expect(urls).toContain("https://clarvia.org/en/partners");
  });

  it("redirects retired /guidance/lu/* URLs permanently to the Luxembourg bereavement hub", () => {
    expect(LEGACY_GUIDANCE_REDIRECTS).toEqual([
      {
        source: "/fr/guidance/lu/:slug*",
        destination: "/fr/guide/luxembourg-bereavement-checklist",
        permanent: true,
      },
      {
        source: "/en/guidance/lu/:slug*",
        destination: "/en/guide/luxembourg-bereavement-checklist",
        permanent: true,
      },
      {
        source: "/de/guidance/lu/:slug*",
        destination: "/en/guide/luxembourg-bereavement-checklist",
        permanent: true,
      },
      {
        source: "/lu/guidance/lu/:slug*",
        destination: "/en/guide/luxembourg-bereavement-checklist",
        permanent: true,
      },
    ]);
  });

  it("redirects /research and non-EN /:lang/research paths permanently to /en/research", () => {
    expect(RESEARCH_REDIRECTS).toEqual([
      { source: "/research", destination: "/en/research", permanent: true },
      { source: "/research/:slug*", destination: "/en/research/:slug*", permanent: true },
      { source: "/fr/research", destination: "/en/research", permanent: true },
      { source: "/fr/research/:slug*", destination: "/en/research/:slug*", permanent: true },
      { source: "/de/research", destination: "/en/research", permanent: true },
      { source: "/de/research/:slug*", destination: "/en/research/:slug*", permanent: true },
      { source: "/lu/research", destination: "/en/research", permanent: true },
      { source: "/lu/research/:slug*", destination: "/en/research/:slug*", permanent: true },
    ]);
  });

  it("sets hreflang x-default to the English URL on translated pages", () => {
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

  it("sends /en/ask onto the canonical family entry without touching /ask/sent", () => {
    expect(ASK_PATH_REDIRECTS.map((row) => row.source)).toEqual([
      "/en/ask",
      "/fr/ask",
      "/de/ask",
      "/lu/ask",
    ]);
    expect(ASK_PATH_REDIRECTS.find((row) => row.source === "/lu/ask")?.destination).toBe(
      "/ask?lang=lb",
    );
  });
});

describe("llms.txt Lighthouse Agentic Browsing compliance", () => {
  it("starts with an H1, includes a blockquote summary, and formats resource lists as Markdown links", () => {
    const llmsPath = path.join(__dirname, "..", "public", "llms.txt");
    const content = fs.readFileSync(llmsPath, "utf8");

    expect(content).toMatch(/^# .+/m);
    expect(content).toMatch(/^> .+/m);
    const mdLinks = Array.from(
      content.matchAll(/^- \[[^\]]+\]\(https:\/\/[^)]+\)/gm),
    );
    expect(mdLinks.length).toBeGreaterThanOrEqual(15);
  });

  it("keeps llms.txt and llms-full.txt canonical URL counts and research links synced with sitemap.ts", () => {
    const expectedCount = sitemap().length.toLocaleString("en-US");
    const llmsTxt = fs.readFileSync(
      path.join(__dirname, "..", "public", "llms.txt"),
      "utf8",
    );
    const llmsFullTxt = fs.readFileSync(
      path.join(__dirname, "..", "public", "llms-full.txt"),
      "utf8",
    );

    expect(llmsTxt).toContain(`${expectedCount} canonical URLs`);
    expect(llmsFullTxt).toContain(`${expectedCount} canonical URLs`);
    for (const url of [
      "https://clarvia.org/en/research",
      "https://clarvia.org/en/research/cross-border-bereavement-integration-index",
      "https://clarvia.org/en/research/global-post-death-civil-registration-atlas",
      "https://clarvia.org/en/research/global-advance-directives-incapacity-mandates-atlas",
      "10.5281/zenodo.24245341",
    ]) {
      expect(llmsTxt).toContain(url);
      expect(llmsFullTxt).toContain(url);
    }
  });
});
