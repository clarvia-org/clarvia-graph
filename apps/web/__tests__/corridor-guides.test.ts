import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  matchesGuidanceSearch,
  type GuidanceCardItem,
} from "@/app/[lang]/guidance/GuidanceBrowser";
import { GUIDE_UI_COPY } from "@/content/corridor-guide-ui";
import {
  allCorridorGuides,
  allCorridorGuideStaticParams,
  corridorGuidePath,
  getAnyCorridorGuideBySlug,
  getCorridorGuideBySlug,
  getCrossBorderSpokesForCountry,
  getParentSingleCountryHubsForCorridor,
  publishedCorridorGuides,
  publishedCorridorGuideStaticParams,
} from "@/content/corridor-guides";
import { MIN_QUESTION_CHARS, PLACE_HINT_RE } from "@/lib/ask-entry";

const FIRST_PERSON_SINGULAR_EN_RE =
  /\b(I|I'm|I’m|I've|I’ve|I'll|I’ll|my|me|myself)\b/;
const BEREAVEMENT_CONDOLENCE_RE =
  /\b(sorry for your loss|sorry for the loss|condolence|condolences|passed away|passing of your|bereavement|deceased)\b/i;

describe("corridor-guides (full 592-guide global dataset + SEO Hub-and-Spoke architecture)", () => {
  it("compiles all 844 guide pages in the dataset (592 EN + 252 L1) with 5 steps, deep live sources, contacts, and clean HTML", () => {
    expect(allCorridorGuides().length).toBe(592);

    const allParams = allCorridorGuideStaticParams();
    expect(allParams.length).toBe(844);

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

  it("ensures prefillQuestion satisfies MIN_QUESTION_CHARS and PLACE_HINT_RE across all 844 localized guide pages", () => {
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

  it("publishes all 592 guides (844 localized pages: 592 EN + 252 L1) in sitemap.xml with exact hreflang alternates", () => {
    const published = publishedCorridorGuides("en");
    expect(published.length).toBe(592);
    expect(publishedCorridorGuideStaticParams().length).toBe(844);

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

  it("wires the SEO Hub-and-Spoke architecture across all 392 single-country hubs (196 jurisdictions) and 200 cross-border corridors", () => {
    expect(GUIDE_UI_COPY.en.abroadHubHeading).toBe(
      "If the Deceased or an Heir Lives Abroad",
    );
    for (const copy of Object.values(GUIDE_UI_COPY)) {
      expect(copy.abroadHubHeading.length).toBeGreaterThan(10);
      expect(copy.abroadHubIntro("France").length).toBeGreaterThan(20);
      expect(copy.abroadHubTriggers("France")).toHaveLength(3);
      expect(copy.abroadHubCorridorsLabel("France").length).toBeGreaterThan(10);
      expect(copy.abroadHubCtaPrompt("France").length).toBeGreaterThan(20);
      expect(copy.abroadHubCtaButton.length).toBeGreaterThan(5);
      expect(copy.parentHubsHeading.length).toBeGreaterThan(10);
    }

    const guides = publishedCorridorGuides("en");
    const singleCountryHubs = guides.filter(
      (g) => g.countryOfDeathCode === g.citizenshipCountryCode,
    );
    const crossBorderCorridors = guides.filter(
      (g) => g.countryOfDeathCode !== g.citizenshipCountryCode,
    );

    expect(singleCountryHubs.length).toBe(392);
    expect(crossBorderCorridors.length).toBe(200);

    const distinctHubCountryCodes = new Set(
      singleCountryHubs.map((g) => g.countryOfDeathCode),
    );
    expect(distinctHubCountryCodes.size).toBe(196);

    let hubsWithSpokes = 0;
    for (const hub of singleCountryHubs) {
      const spokes = getCrossBorderSpokesForCountry(
        hub.countryOfDeathCode,
        hub.category,
        "en",
      );
      if (spokes.length > 0) {
        hubsWithSpokes += 1;
        for (const { guide: spoke } of spokes) {
          expect(spoke.countryOfDeathCode).not.toBe(
            spoke.citizenshipCountryCode,
          );
          expect(
            spoke.countryOfDeathCode === hub.countryOfDeathCode ||
              spoke.citizenshipCountryCode === hub.countryOfDeathCode,
          ).toBe(true);
        }
      }
    }
    expect(hubsWithSpokes).toBeGreaterThanOrEqual(50);

    for (const corridor of crossBorderCorridors) {
      const parentHubs = getParentSingleCountryHubsForCorridor(corridor, "en");
      expect(parentHubs.length, corridor.slug).toBe(2);
      expect(parentHubs.map((h) => h.guide.countryOfDeathCode)).toEqual([
        corridor.countryOfDeathCode,
        corridor.citizenshipCountryCode,
      ]);
    }
  });

  it("folds accents and matches multilingual country aliases in GuidanceBrowser search", () => {
    const cards: GuidanceCardItem[] = publishedCorridorGuides("en").map((g) => ({
      slug: g.slug,
      href: corridorGuidePath(g.slug, "en"),
      targetLang: "en",
      localLabel: null,
      category: g.category,
      macroRegion: "europe",
      countryOfDeath: g.countryOfDeath,
      countryOfDeathEn: g.countryOfDeath,
      countryOfDeathCode: g.countryOfDeathCode,
      citizenshipCountry: g.citizenshipCountry,
      citizenshipCountryEn: g.citizenshipCountry,
      citizenshipCountryCode: g.citizenshipCountryCode,
      title: g.title,
      cardSummary: g.cardSummary,
    }));

    const search = (q: string) =>
      cards.filter((item) => matchesGuidanceSearch(item, q));

    expect(search("cote d'ivoire").length).toBeGreaterThanOrEqual(2);
    expect(search("etats-unis").length).toBe(44);
    expect(search("suede").length).toBeGreaterThanOrEqual(2);
    expect(search("letzebuerg").length).toBeGreaterThanOrEqual(3);
    expect(search("USA").length).toBe(44);
    expect(search("UK").length).toBe(51);
    expect(search("UK Spain").length).toBeGreaterThanOrEqual(2);
    expect(search("UAE").length).toBe(8);
    expect(search("Holland").length).toBeGreaterThanOrEqual(8);
  });
});
