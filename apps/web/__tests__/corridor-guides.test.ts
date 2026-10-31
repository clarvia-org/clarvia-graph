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
  it("compiles all 1,000 guide pages in the dataset (592 EN + 408 non-EN across the 14 /ask locales) with 5 steps, deep live sources, contacts, and clean HTML", () => {
    expect(allCorridorGuides().length).toBe(592);

    const allParams = allCorridorGuideStaticParams();
    expect(allParams.length).toBe(1000);

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
      expect(guide.closingQuestion.length, `${lang}/${slug}`).toBeGreaterThan(12);
      expect(
        guide.closingQuestion.endsWith("?") || guide.closingQuestion.endsWith("؟"),
        `${lang}/${slug}`,
      ).toBe(true);
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

  it("publishes all 592 guides (1,000 localized pages: 592 EN + 408 non-EN, max 3 locales per guide) in sitemap.xml with exact hreflang alternates", () => {
    const published = publishedCorridorGuides("en");
    expect(published.length).toBe(592);
    expect(publishedCorridorGuideStaticParams().length).toBe(1000);

    const entries = sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    for (const guide of published) {
      expect(guide.locales.length).toBeLessThanOrEqual(3);
      expect(guide.locales).toContain("en");

      const enUrl = `https://clarvia.org${corridorGuidePath(guide.slug, "en")}`;
      const enEntry = byUrl.get(enUrl);
      expect(enEntry, enUrl).toBeDefined();

      if (guide.locales.length === 1) {
        expect(enEntry?.alternates).toBeUndefined();
      } else {
        const expectedLangs: Record<string, string> = {
          "x-default": enUrl,
        };
        for (const loc of guide.locales) {
          const hreflangCode = loc === "lu" ? "lb" : loc;
          expectedLangs[hreflangCode] = `https://clarvia.org${corridorGuidePath(guide.slug, loc)}`;
        }
        expect(enEntry?.alternates?.languages).toEqual(expectedLangs);

        for (const loc of guide.locales) {
          const locUrl = `https://clarvia.org${corridorGuidePath(guide.slug, loc)}`;
          const locEntry = byUrl.get(locUrl);
          expect(locEntry, locUrl).toBeDefined();
          expect(locEntry?.alternates?.languages).toEqual(expectedLangs);
        }
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

  it("prioritizes selected site language (fr, de, lu) across Phase 3 multi-locale guides", () => {
    const frPublished = publishedCorridorGuides("fr");
    const dePublished = publishedCorridorGuides("de");
    const luPublished = publishedCorridorGuides("lu");

    expect(frPublished.length).toBe(98);
    expect(dePublished.length).toBe(49);
    expect(luPublished.length).toBe(2);

    // Phase 3 L2 translations resolve natively on /fr, /de, and /lu
    expect(getCorridorGuideBySlug("spain-france-bereavement-checklist", "fr")?.title).toContain("Espagne");
    expect(getCorridorGuideBySlug("france-germany-bereavement-checklist", "de")?.title).toContain("Frankreich");
    expect(getCorridorGuideBySlug("luxembourg-bereavement-checklist", "lu")?.title).toContain("Lëtzebuerg");
  });

  it("enforces all 4 factual validation layers (treaty signatory matrix, statutory thresholds, multi-locale citation/contact parity, and zero dead/soft-404/wrong-audience URLs)", () => {
    const STRASBOURG_1973 = new Set([
      "AD", "AT", "BE", "CY", "CZ", "EE", "FI", "FR", "GR", "IS",
      "LV", "LT", "LU", "MD", "NL", "NO", "PT", "SK", "SI", "ES",
      "SE", "CH", "TR", "UA",
    ]);
    const BERLIN_1937 = new Set([
      "AT", "BE", "CL", "CZ", "DK", "EG", "FR", "DE", "IT", "MX",
      "NL", "PT", "RO", "SK", "CH", "TR", "CD",
    ]);
    const NEGATION_RE =
      /\b(not a (?:party|signatory|contracting|member)|not party|non-party|non-signatory|not bound by|opted out|opt-out|neither .* nor|do not apply|does not apply|not issued|not applicable|cannot be apostilled|does not issue apostilles|rather than an apostille|instead of an apostille|no apostille|not yet issuing)\b/i;

    const FORBIDDEN_DEAD_OR_WRONG_URLS = new Set([
      "https://consumer.ftc.gov/articles/ftc-funeral-rule",
      "https://www.mea.gov.in/apostille.htm",
      "https://www.pv.at/web/pflege-betreuung/pflegegeld",
      "https://www.testamentsregister.de/de/sterbefallmitteilung",
      "https://www.testamentsregister.de/en",
    ]);

    const ENTITY_MAP: Record<string, string> = {
      "&amp;": "&",
      "&quot;": '"',
      "&#39;": "'",
      "&apos;": "'",
      "&nbsp;": " ",
    };

    const unescapeHtml = (html: string) =>
      html
        .replace(/<[^>]+>/g, " ")
        .replace(/&(?:amp|quot|#39|apos|nbsp);/g, (m) => ENTITY_MAP[m] ?? m)
        .replace(/\s+/g, " ")
        .trim();

    for (const enGuide of allCorridorGuides()) {
      const c1 = enGuide.countryOfDeathCode;
      const c2 = enGuide.citizenshipCountryCode;
      const enFullText = unescapeHtml(
        `${enGuide.introHtml}. ${enGuide.steps.map((s) => `${s.title}. ${s.html}`).join(" ")}`,
      );

      // Layer 1: Treaty & Convention Signatory Matrix
      expect(enFullText.toLowerCase(), `${enGuide.id} 1975 Strasbourg`).not.toContain(
        "1975 strasbourg",
      );
      const sentences = enFullText.split(/(?<=[.;])\s+/);
      for (const sent of sentences) {
        if (NEGATION_RE.test(sent)) continue;
        const low = sent.toLowerCase();
        if (
          low.includes("strasbourg") &&
          (low.includes("agreement") ||
            low.includes("convention") ||
            low.includes("laissez-passer") ||
            low.includes("leichenpass"))
        ) {
          if (c1 !== c2) {
            expect(
              STRASBOURG_1973.has(c1) && STRASBOURG_1973.has(c2),
              `${enGuide.id} (${c1}->${c2}) positive Strasbourg 1973 claim: ${sent}`,
            ).toBe(true);
          } else {
            expect(
              STRASBOURG_1973.has(c1),
              `${enGuide.id} (${c1}) positive Strasbourg 1973 claim: ${sent}`,
            ).toBe(true);
          }
        }
        if (
          low.includes("berlin") &&
          (low.includes("agreement") ||
            low.includes("convention") ||
            low.includes("arrangement"))
        ) {
          if (c1 !== c2) {
            expect(
              BERLIN_1937.has(c1) && BERLIN_1937.has(c2),
              `${enGuide.id} (${c1}->${c2}) positive Berlin 1937 claim: ${sent}`,
            ).toBe(true);
          } else {
            expect(
              BERLIN_1937.has(c1),
              `${enGuide.id} (${c1}) positive Berlin 1937 claim: ${sent}`,
            ).toBe(true);
          }
        }
      }

      // Layer 2: Statutory Thresholds & Fees
      if (
        [
          "p34_new_zealand_bereavement_checklist",
          "p55_terminal_illness_admin_new_zealand",
          "p131_new_zealand_us_bereavement",
          "p178_new_zealand_uk_bereavement",
          "p179_uk_new_zealand_bereavement",
        ].includes(enGuide.id)
      ) {
        expect(enFullText, `${enGuide.id} NZD 40,000`).toContain("40,000");
        expect(enFullText, `${enGuide.id} outdated NZD 15,000`).not.toContain("15,000");
      }
      if (enGuide.id === "p24_germany_poland_bereavement") {
        expect(enFullText.toLowerCase(), `${enGuide.id} outdated 50 EUR`).not.toContain(
          "50 eur",
        );
      }

      // Layer 3 & Layer 4 across all locales of this guide
      const enStepCites = enGuide.steps.map((s) =>
        Array.from(new Set(Array.from(s.html.matchAll(/\[(\d+)\]/g), (m) => m[1]))).sort(),
      );
      const enContactMeta = enGuide.contacts.map((c) => ({
        id: c.id,
        source_id: c.source_id,
        website: c.website,
        phone: c.phone,
        email: c.email,
      }));

      for (const loc of enGuide.locales) {
        const view = getAnyCorridorGuideBySlug(enGuide.slug, loc)!;
        const prefix = `${enGuide.id}:${loc}`;
        const combinedHtml = `${view.introHtml} ${view.steps.map((s) => s.html).join(" ")}`;
        const combinedPlain = unescapeHtml(combinedHtml);

        expect(combinedHtml, `${prefix} em-dash`).not.toContain("\u2014");
        expect(view.closingQuestion, `${prefix} closingQuestion em-dash`).not.toContain(
          "\u2014",
        );
        expect(combinedHtml, `${prefix} truncated (.S.`).not.toContain("(.S.");
        expect(combinedHtml, `${prefix} unclosed ALO)`).not.toMatch(/<(?:strong|em)>ALO\)/);

        for (const tag of ["strong", "em", "span", "a", "p", "ul", "li"]) {
          const openCount = Array.from(
            combinedHtml.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi")),
          ).length;
          const closeCount = Array.from(
            combinedHtml.matchAll(new RegExp(`</${tag}\\s*>`, "gi")),
          ).length;
          expect(openCount, `${prefix} balanced <${tag}> tags`).toBe(closeCount);
        }

        const sourceMap = new Map(view.sources.map((s) => [s.id, s.url]));
        for (const m of combinedHtml.matchAll(/<a\s+href="([^"]+)"[^>]*>\[(\d+)\]<\/a>/g)) {
          const hrefUrl = m[1].replace(/&amp;/g, "&");
          const citeId = Number(m[2]);
          expect(hrefUrl, `${prefix} citation [${citeId}] href`).toBe(
            sourceMap.get(citeId),
          );
        }

        for (const c of view.contacts) {
          expect(
            combinedPlain.toLowerCase().includes(c.name.trim().toLowerCase()),
            `${prefix} contact ${c.name} in prose`,
          ).toBe(true);
          expect(FORBIDDEN_DEAD_OR_WRONG_URLS.has(c.website), `${prefix} dead contact URL`).toBe(
            false,
          );
        }

        for (const s of view.sources) {
          expect(FORBIDDEN_DEAD_OR_WRONG_URLS.has(s.url), `${prefix} dead source URL`).toBe(
            false,
          );
          expect(s.url, `${prefix} physician-only URL`).not.toContain(
            "/medecin/exercice-liberal/",
          );
        }

        if (loc !== "en") {
          const locStepCites = view.steps.map((s) =>
            Array.from(new Set(Array.from(s.html.matchAll(/\[(\d+)\]/g), (m) => m[1]))).sort(),
          );
          expect(locStepCites, `${prefix} step citation parity vs EN`).toEqual(
            enStepCites,
          );
          const locContactMeta = view.contacts.map((c) => ({
            id: c.id,
            source_id: c.source_id,
            website: c.website,
            phone: c.phone,
            email: c.email,
          }));
          expect(locContactMeta, `${prefix} contact metadata parity vs EN`).toEqual(
            enContactMeta,
          );
        }
      }
    }
  });
});
