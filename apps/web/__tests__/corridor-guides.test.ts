import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { GUIDE_UI_COPY } from "@/content/corridor-guide-ui";
import {
  allCorridorGuides,
  allCorridorGuideStaticParams,
  corridorGuidePath,
  getAnyCorridorGuideBySlug,
  getCorridorGuideBySlug,
  publishedCorridorGuides,
  publishedCorridorGuideStaticParams,
} from "@/content/corridor-guides";
import { MIN_QUESTION_CHARS, PLACE_HINT_RE } from "@/lib/ask-entry";

const FIRST_PERSON_SINGULAR_EN_RE =
  /\b(I|I'm|I’m|I've|I’ve|I'll|I’ll|my|me|myself)\b/;
const BEREAVEMENT_CONDOLENCE_RE =
  /\b(sorry for your loss|sorry for the loss|condolence|condolences|passed away|passing of your|bereavement|deceased)\b/i;

describe("corridor-guides (full 250-guide dual-locale dataset + Wave 1 live preview gate)", () => {
  it("compiles all 390 guide pages in the dataset (250 EN + 140 L1) with 5 steps, deep live sources, contacts, and clean HTML", () => {
    expect(allCorridorGuides().length).toBe(250);

    const allParams = allCorridorGuideStaticParams();
    expect(allParams.length).toBe(390);

    for (const { lang, slug } of allParams) {
      const guide = getAnyCorridorGuideBySlug(slug, lang);
      expect(guide, `${lang}/${slug}`).toBeDefined();
      if (!guide) continue;

      expect(guide.steps).toHaveLength(5);
      expect(guide.steps.map((s) => s.stepNumber)).toEqual([1, 2, 3, 4, 5]);
      expect(guide.sources.length).toBeGreaterThanOrEqual(3);
      expect(guide.contacts.length).toBeGreaterThanOrEqual(2);
      expect(guide.caseDependentItems.length).toBeGreaterThanOrEqual(3);

      expect(guide.introHtml).not.toContain("`");
      expect(guide.closingQuestion.length, `${lang}/${slug}`).toBeGreaterThan(15);
      expect(guide.closingQuestion.endsWith("?"), `${lang}/${slug}`).toBe(true);
      expect(guide.closingQuestion).not.toContain("*");
      expect(guide.closingQuestion).not.toContain("`");
      expect(guide.closingQuestion).not.toContain("\n");

      const combinedHtml =
        guide.introHtml +
        " " +
        guide.steps.map((s) => s.html).join(" ");
      for (const s of guide.sources) {
        expect(combinedHtml, `${lang}/${slug} source [${s.id}]`).toContain(`[${s.id}]`);
      }

      for (const step of guide.steps) {
        expect(step.html).not.toContain("`");
        expect(step.title).not.toContain("`");
        expect(step.html).not.toMatch(/<p>\s*[-*]\s+/);
        expect(step.html).toContain("<a href=");
      }

      let deepCount = 0;
      for (const s of guide.sources) {
        expect(s.url).toMatch(/^https?:\/\//);
        expect(s.url).not.toContain("vertexaisearch.cloud.google.com");
        const pathname = new URL(s.url).pathname.replace(/^\/+|\/+$/g, "");
        if (pathname.length > 0) {
          deepCount += 1;
        }
      }
      expect(deepCount * 2).toBeGreaterThanOrEqual(guide.sources.length);

      for (const c of guide.contacts) {
        expect(c.website).toMatch(/^https?:\/\//);
        expect(c.website).not.toContain("vertexaisearch.cloud.google.com");
      }
    }
  });

  it("ensures prefillQuestion satisfies MIN_QUESTION_CHARS and PLACE_HINT_RE across all 390 localized guide pages", () => {
    for (const { lang, slug } of allCorridorGuideStaticParams()) {
      const guide = getAnyCorridorGuideBySlug(slug, lang)!;
      expect(
        guide.prefillQuestion.trim().length,
        `${lang}/${slug}`,
      ).toBeGreaterThanOrEqual(MIN_QUESTION_CHARS);
      expect(
        PLACE_HINT_RE.test(guide.prefillQuestion),
        `${lang}/${slug}: ${guide.prefillQuestion}`,
      ).toBe(true);
    }
  });

  it("publishes the Wave 1 preview (1 English-only + 1 Bilingual EN/ES = 3 pages) in sitemap.xml with exact hreflang alternates", () => {
    const published = publishedCorridorGuides("en");
    expect(published.map((g) => g.slug)).toEqual([
      "mexico-us-bereavement-checklist",
      "uae-india-bereavement-checklist",
    ]);
    expect(publishedCorridorGuideStaticParams()).toEqual([
      { lang: "en", slug: "mexico-us-bereavement-checklist" },
      { lang: "es", slug: "mexico-us-bereavement-checklist" },
      { lang: "en", slug: "uae-india-bereavement-checklist" },
    ]);

    const entries = sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    for (const guide of published) {
      const enUrl = `https://clarvia.org${corridorGuidePath(guide.slug, "en")}`;
      const enEntry = byUrl.get(enUrl);
      expect(enEntry, enUrl).toBeDefined();

      if (guide.locales.length === 1) {
        expect(enEntry?.alternates).toBeUndefined();
      } else {
        const l1 = guide.locales.find((c) => c !== "en")!;
        const l1Url = `https://clarvia.org${corridorGuidePath(guide.slug, l1)}`;
        const l1Entry = byUrl.get(l1Url);
        expect(l1Entry, l1Url).toBeDefined();

        const expectedLangs = {
          en: enUrl,
          [l1]: l1Url,
          "x-default": enUrl,
        };
        expect(enEntry?.alternates?.languages).toEqual(expectedLangs);
        expect(l1Entry?.alternates?.languages).toEqual(expectedLangs);
      }
    }
  });

  it("resolves relatedSlugs to valid published guides (no broken internal links)", () => {
    for (const guide of publishedCorridorGuides("en")) {
      expect(guide.relatedSlugs.length).toBeGreaterThan(0);
      for (const relSlug of guide.relatedSlugs) {
        expect(getCorridorGuideBySlug(relSlug, "en")).toBeDefined();
      }
    }
  });

  it("enforces institutional 'we' voice, hides lex@clarvia.org, and never offers bereavement condolences on pre-death guides", () => {
    expect(JSON.stringify(GUIDE_UI_COPY).toLowerCase()).not.toContain("lex@");
    expect(JSON.stringify(allCorridorGuides()).toLowerCase()).not.toContain(
      "lex@clarvia.org",
    );

    for (const guide of allCorridorGuides()) {
      const enGuide = getAnyCorridorGuideBySlug(guide.slug, "en")!;
      const introText = enGuide.introHtml.replace(/<[^>]+>/g, " ");
      expect(
        FIRST_PERSON_SINGULAR_EN_RE.test(introText),
        `${guide.id} introHtml has 1p singular: ${introText}`,
      ).toBe(false);
      expect(
        FIRST_PERSON_SINGULAR_EN_RE.test(enGuide.closingQuestion),
        `${guide.id} closingQuestion has 1p singular: ${enGuide.closingQuestion}`,
      ).toBe(false);

      if (
        guide.category === "cross-border-terminal-illness" ||
        guide.category === "terminal-illness-admin"
      ) {
        expect(
          BEREAVEMENT_CONDOLENCE_RE.test(introText),
          `${guide.id} pre-death guide has bereavement condolence: ${introText}`,
        ).toBe(false);
      }
    }
  });
});
