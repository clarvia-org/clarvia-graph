import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  matchesGuidanceSearch,
  type GuidanceCardItem,
} from "@/app/[lang]/guidance/GuidanceBrowser";
import { GUIDE_UI_COPY, getGuideUiCopy } from "@/content/corridor-guide-ui";
import {
  allCorridorGuides,
  allCorridorGuideStaticParams,
  corridorGuidePageHreflangAlternates,
  corridorGuidePath,
  formatGuideSeoDescription,
  formatGuideSeoTitle,
  getAnyCorridorGuideBySlug,
  getCorridorGuideBySlug,
  getCrossBorderSpokesForCountry,
  getParentSingleCountryHubsForCorridor,
  publishedCorridorGuides,
  publishedCorridorGuideStaticParams,
  shortGuideCardTitle,
} from "@/content/corridor-guides";
import { MAX_QUESTION_CHARS } from "@/app/api/ask/route";
import { buildGuideFocusPrompt } from "@/app/[lang]/guide/[slug]/GuideCtaClient";
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

  it("ensures prefillQuestion and focus chips satisfy length bounds, PLACE_HINT_RE, uniqueness, disambiguation, and zero clarify-bait across all 1,000 localized guide pages", () => {
    const EN_CLIFFHANGER_RE =
      /\btailored to\b|\bwhether\b|^(?:exact|specific)\b|\b(?:exact|specific)\s+(?:[a-z.]+\s+){0,2}(?:municipality|city|city\/municipality|province|state|emirate|county|commune|d[ée]partement|bundesland|consular district)\b/i;
    const NON_EN_CLIFFHANGERS = [
      "notre commune",
      "dans notre région",
      "notre région",
      "adaptées à",
      "adaptés à",
      "unsere genaue gemeinde",
      "für unsere region",
      "unsere region",
      "zugeschnitten auf",
      "nuestro municipio",
      "nuestra región",
      "nuestra provincia",
      "adaptada a",
      "adaptadas a",
      "nostro comune",
      "nella nostra regione",
      "nostra regione",
      "adattate a",
      "onze gemeente",
      "in onze regio",
      "onze regio",
      "afgestemd op",
      "naszej miejscowości",
      "w naszym regionie",
      "w naszym województwie",
      "dopasowanych do",
      "dopasowane do",
      "nosso município",
      "na nossa região",
      "nossa região",
      "adaptada ao",
      "adaptadas ao",
      "localitatea noastră",
      "în județul nostru",
      "județul nostru",
      "adaptate localității",
      "нашего города",
      "в нашем регионе",
      "нашого міста",
      "у нашому регіоні",
      "مدينتنا",
      "بلديتنا",
      "في منطقتنا",
      "منطقتنا",
      "خاصة بـ",
      "خاصة ببلديتنا",
      "خاصة بمدينتنا",
      "eis gemeng",
      "ugeschnidden op",
      "il/belediye işlemlerimiz",
      "il/ilçe belediye işlemleri",
      "bulunduğumuz ilde",
      "bulunduğumuz ilçede",
    ];
    const DISAMBIGUATED_COUNTRY_NAMES: Record<string, Partial<Record<string, string>>> = {
      FM: {
        en: "Federated States of Micronesia",
        de: "Föderierte Staaten von Mikronesien",
        es: "Estados Federados de Micronesia",
        fr: "États fédérés de Micronésie",
        it: "Stati Federati di Micronesia",
        nl: "Federale Staten van Micronesië",
        pl: "Sfederowane Stany Mikronezji",
        pt: "Estados Federados da Micronésia",
        ro: "Statele Federate ale Microneziei",
        tr: "Mikronezya Federal Devletleri",
        uk: "Федеративні Штати Мікронезії",
        ru: "Федеративные Штаты Микронезии",
        ar: "ولايات ميكرونيزيا الموحدة",
        lu: "Federéiert Staate vu Mikronesien",
      },
      GE: {
        en: "country of Georgia",
        de: "Georgien",
        es: "Georgia",
        fr: "Géorgie",
        it: "Georgia",
        nl: "Georgië",
        pl: "Gruzj",
        pt: "Geórgia",
        ro: "Georgia",
        tr: "Gürcistan",
        uk: "Грузі",
        ru: "Грузи",
        ar: "جورجيا",
        lu: "Georgien",
      },
      DM: {
        en: "Commonwealth of Dominica",
        de: "Commonwealth Dominica",
        es: "Mancomunidad de Dominica",
        fr: "Commonwealth de la Dominique",
        it: "Commonwealth di Dominica",
        nl: "Gemenebest Dominica",
        pl: "Wspólnota Dominiki",
        pt: "Comunidade da Dominica",
        ro: "Commonwealth-ul Dominica",
        tr: "Dominika Topluluğu",
        uk: "Співдружність Домініки",
        ru: "Содружество Доминики",
        ar: "كومنولث دومينيكا",
        lu: "Commonwealth vu Dominica",
      },
      WS: {
        en: "Independent State of Samoa",
        de: "Unabhängiger Staat Samoa",
        es: "Estado Independiente de Samoa",
        fr: "État indépendant des Samoa",
        it: "Stato Indipendente di Samoa",
        nl: "Onafhankelijke Staat Samoa",
        pl: "Niezależne Państwo Samoa",
        pt: "Estado Independente de Samoa",
        ro: "Statul Independent Samoa",
        tr: "Bağımsız Samoa Devleti",
        uk: "Незалежна Держава Самоа",
        ru: "Независимое Государство Самоа",
        ar: "دولة ساموا المستقلة",
        lu: "Onofhängege Staat Samoa",
      },
      GN: {
        en: "Republic of Guinea",
        de: "Republik Guinea",
        es: "República de Guinea",
        fr: "République de Guinée",
        it: "Repubblica di Guinea",
        nl: "Republiek Guinee",
        pl: "Republika Gwinei",
        pt: "República da Guiné",
        ro: "Republica Guineea",
        tr: "Gine Cumhuriyeti",
        uk: "Гвінейськ",
        ru: "Гвинейск",
        ar: "جمهورية غينيا",
        lu: "Republik Guinea",
      },
      IE: {
        en: "Republic of Ireland",
        de: "Republik Irland",
        es: "República de Irlanda",
        fr: "République d'Irlande",
        it: "Repubblica d'Irlanda",
        nl: "Republiek Ierland",
        pl: "Republika Irlandii",
        pt: "República da Irlanda",
        ro: "Republica Irlanda",
        tr: "İrlanda Cumhuriyeti",
        uk: "Республік",
        ru: "Республик",
        ar: "جمهورية أيرلندا",
        lu: "Republik Irland",
      },
    };
    const seenPrefills = new Map<string, string>();

    for (const { lang, slug } of allCorridorGuideStaticParams()) {
      const guide = getAnyCorridorGuideBySlug(slug, lang)!;
      const pf = guide.prefillQuestion;
      const idLabel = `${lang}/${slug}`;
      const ui = getGuideUiCopy(lang);

      expect(seenPrefills.has(pf), `${idLabel} duplicates ${seenPrefills.get(pf)}`).toBe(false);
      seenPrefills.set(pf, idLabel);

      expect(pf, idLabel).toBe(pf.trim());
      expect(pf.normalize("NFC"), idLabel).toBe(pf);
      expect(pf.length, idLabel).toBeGreaterThanOrEqual(MIN_QUESTION_CHARS);
      expect(pf.length, idLabel).toBeLessThanOrEqual(MAX_QUESTION_CHARS);
      expect(PLACE_HINT_RE.test(pf), `${idLabel}: ${pf}`).toBe(true);
      expect(pf.endsWith("."), `${idLabel}: ${pf}`).toBe(true);
      expect(/[?:؟\u2014]/.test(pf), `${idLabel}: ${pf}`).toBe(false);

      for (const [code, localeMap] of Object.entries(DISAMBIGUATED_COUNTRY_NAMES)) {
        if (guide.countryOfDeathCode === code || guide.citizenshipCountryCode === code) {
          const expectedName = localeMap[lang];
          expect(expectedName, `missing disambiguation map for ${code}/${lang}`).toBeDefined();
          expect(pf, `${idLabel} (${code})`).toContain(expectedName!);
        }
      }

      if (lang === "en") {
        expect(EN_CLIFFHANGER_RE.test(pf), `${idLabel}: ${pf}`).toBe(false);
        expect(FIRST_PERSON_SINGULAR_EN_RE.test(pf), `${idLabel}: ${pf}`).toBe(false);
        if (guide.category === "domestic-bereavement") {
          expect(/\brepatriation\b/i.test(pf), `${idLabel}: ${pf}`).toBe(false);
          if (/^p(?:3[1-9]|4\d|5[01])_/.test(guide.id)) {
            expect(pf, idLabel).toContain("estate probate or succession requirements");
          }
        }
        if (
          guide.category === "terminal-illness-admin" ||
          guide.category === "cross-border-terminal-illness"
        ) {
          expect(BEREAVEMENT_CONDOLENCE_RE.test(pf), `${idLabel}: ${pf}`).toBe(false);
        }
      } else {
        const lowerPf = pf.toLowerCase();
        for (const phrase of NON_EN_CLIFFHANGERS) {
          expect(lowerPf.includes(phrase), `${idLabel} (${phrase}): ${pf}`).toBe(false);
        }
      }

      for (const item of guide.caseDependentItems) {
        expect(/[?:؟\u2014]/.test(item), `${idLabel} chip: ${item}`).toBe(false);
        const combined = buildGuideFocusPrompt(pf, ui.ctaSpecificPrefix, item).trim();
        expect(combined.length, idLabel).toBeGreaterThanOrEqual(MIN_QUESTION_CHARS);
        expect(combined.length, idLabel).toBeLessThanOrEqual(MAX_QUESTION_CHARS);
        expect(PLACE_HINT_RE.test(combined), `${idLabel}: ${combined}`).toBe(true);
        expect(combined.endsWith("."), `${idLabel}: ${combined}`).toBe(true);
        expect(/[?؟\u2014]/.test(combined), `${idLabel}: ${combined}`).toBe(false);
        expect(combined.includes(`: ${ui.ctaSpecificPrefix}`), idLabel).toBe(false);

        if (lang === "en") {
          expect(EN_CLIFFHANGER_RE.test(item), `${idLabel} chip: ${item}`).toBe(false);
          expect(FIRST_PERSON_SINGULAR_EN_RE.test(combined), `${idLabel}: ${combined}`).toBe(false);
          if (
            guide.category === "terminal-illness-admin" ||
            guide.category === "cross-border-terminal-illness"
          ) {
            expect(BEREAVEMENT_CONDOLENCE_RE.test(combined), `${idLabel}: ${combined}`).toBe(false);
          }
        } else {
          const lowerItem = item.toLowerCase();
          const lowerCombined = combined.toLowerCase();
          for (const phrase of NON_EN_CLIFFHANGERS) {
            expect(lowerItem.includes(phrase), `${idLabel} chip (${phrase}): ${item}`).toBe(false);
            expect(lowerCombined.includes(phrase), `${idLabel} combined (${phrase}): ${combined}`).toBe(false);
          }
        }
      }
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
    expect(search("pension").length).toBeGreaterThan(0);
    expect(search("burial").length).toBeGreaterThan(0);
    expect(search("probate").length).toBeGreaterThan(0);
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

  it("enforces all 5 factual validation layers (treaty signatory matrix, statutory thresholds, multi-locale citation/contact parity, zero dead/soft-404/wrong-audience URLs, and zero generic WHO/WB/UNICEF/UNDP/SSA-SSPTW proxy sources)", () => {
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

    const FORBIDDEN_PROXY_DOMAINS = [
      "academia.edu",
      "aljazeera.com",
      "amnesty.org",
      "baochinhphu.vn",
      "bbc.co.uk",
      "bbc.com",
      "bham.ac.uk",
      "britannica.com",
      "brookings.edu",
      "chinadaily.com.cn",
      "clientearth.fr",
      "clientearth.org",
      "cnn.com",
      "cornell.edu",
      "crin.org",
      "droitcamerounais.info",
      "dw.com",
      "ecoi.net",
      "france24.com",
      "hrw.org",
      "icj.org",
      "jafbase.fr",
      "jstor.org",
      "lefaso.net",
      "nationalityforall.org",
      "nrc.no",
      "nytimes.com",
      "oceaniacommons.net",
      "paho.org",
      "reliefweb.int",
      "researchgate.net",
      "reuters.com",
      "scmp.com",
      "scribd.com",
      "southsudanngoforum.org",
      "ssrn.com",
      "theguardian.com",
      "uliege.be",
      "undp.org",
      "unicef.org",
      "unife.it",
      "who.int",
      "wikidata.org",
      "wikimedia.org",
      "wikipedia.org",
      "worldbank.org",
      "xinhuanet.com",
    ];
    const FORBIDDEN_PROXY_HOST_PREFIXES = ["etheses.", "orbi.", "dspace."];
    const FORBIDDEN_PROXY_PATH_SUBSTRINGS = [
      "ssa.gov/policy/docs/progdesc/ssptw",
      "ilovepdf",
      "smallpdf",
      "/detail.aspx/detail.aspx",
    ];
    const isForbiddenProxyUrl = (rawUrl: string): boolean => {
      const lowerUrl = rawUrl.toLowerCase();
      const host = new URL(rawUrl).hostname.toLowerCase();
      return (
        FORBIDDEN_PROXY_DOMAINS.some(
          (dom) => host === dom || host.endsWith(`.${dom}`),
        ) ||
        FORBIDDEN_PROXY_HOST_PREFIXES.some((pfx) => host.startsWith(pfx)) ||
        FORBIDDEN_PROXY_PATH_SUBSTRINGS.some((sub) => lowerUrl.includes(sub))
      );
    };
    const isNfcNormalizedUrl = (rawUrl: string): boolean => {
      let decoded = rawUrl;
      try {
        decoded = decodeURIComponent(rawUrl);
      } catch (err) {
        if (!(err instanceof URIError)) throw err;
      }
      return decoded.normalize("NFC") === decoded;
    };

    expect(isForbiddenProxyUrl("https://apps.who.int/iris/handle/10665/123")).toBe(true);
    expect(isForbiddenProxyUrl("https://en.wikipedia.org/wiki/Fiji")).toBe(true);
    expect(isForbiddenProxyUrl("https://www.chinadaily.com.cn/a/2020/01/01.html")).toBe(true);
    expect(isForbiddenProxyUrl("https://www.nrc.no/resources/reports/example")).toBe(true);
    expect(isForbiddenProxyUrl("https://reliefweb.int/report/world/example")).toBe(true);
    expect(isForbiddenProxyUrl("https://etheses.bham.ac.uk/id/eprint/1234")).toBe(true);
    expect(isForbiddenProxyUrl("https://jafbase.fr/docAfrica/Burundi/code.pdf")).toBe(true);
    expect(
      isForbiddenProxyUrl(
        "https://www.ssa.gov/policy/docs/progdesc/ssptw/2018-2019/asia/fiji.html",
      ),
    ).toBe(true);
    expect(
      isForbiddenProxyUrl("https://www.gov.uk/guidance/when-someone-dies-in-myanmar"),
    ).toBe(false);
    expect(isNfcNormalizedUrl("https://example.gov/cafe%CC%81")).toBe(false);
    expect(isNfcNormalizedUrl("https://example.gov/caf%C3%A9")).toBe(true);
    expect(isNfcNormalizedUrl("https://example.gov/%E0%A4%A")).toBe(true);

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
      if (enGuide.id === "p531_fiji_bereavement_checklist") {
        expect(enFullText.toLowerCase(), `${enGuide.id} 7-day statutory death deadline`).toContain(
          "7 days",
        );
        expect(
          enFullText.toLowerCase(),
          `${enGuide.id} must not apply 60-day birth rule to death registration`,
        ).not.toMatch(/register(?:ed|ing)?\s+(?:the\s+)?death\s+within\s+(?:2\s+months|two\s+months|60\s+days)/);
      }

      if (enGuide.id === "p538_terminal_illness_admin_kazakhstan") {
        expect(
          enGuide.steps[4]?.html.toLowerCase(),
          `${enGuide.id} step 5 Hague Apostille`,
        ).toContain("apostille");
        expect(
          enGuide.steps[4]?.html,
          `${enGuide.id} step 5 cites HCCH [6]`,
        ).toContain(">[6]</a>");
        expect(
          enGuide.steps[1]?.html,
          `${enGuide.id} step 2 does not mis-cite HCCH [6]`,
        ).not.toContain(">[6]</a>");
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

        if (enGuide.id === "p538_terminal_illness_admin_kazakhstan" && loc === "ru") {
          expect(
            view.steps[4]?.html.toLowerCase(),
            `${prefix} step 5 Hague Apostille`,
          ).toContain("апостил");
        }

        const isRemediated20261114 = enGuide.lastReviewed === "2026-11-14";
        const sourceMap = new Map(view.sources.map((s) => [s.id, s.url]));
        for (const m of combinedHtml.matchAll(/<a\s+href="([^"]+)"[^>]*>\[(\d+)\]<\/a>/g)) {
          const hrefUrl = m[1].replace(/&amp;/g, "&");
          const citeId = Number(m[2]);
          expect(hrefUrl, `${prefix} citation [${citeId}] href`).toBe(
            sourceMap.get(citeId),
          );
        }
        for (const m of combinedHtml.matchAll(/<a\s+[^>]*href="(https?:\/\/[^"]+)"/gi)) {
          const inlineUrl = m[1].replace(/&amp;/g, "&");
          expect(
            isForbiddenProxyUrl(inlineUrl),
            `${prefix} forbidden proxy inline URL: ${inlineUrl}`,
          ).toBe(false);
          expect(
            isNfcNormalizedUrl(inlineUrl),
            `${prefix} non-NFC inline URL: ${inlineUrl}`,
          ).toBe(true);
          if (isRemediated20261114) {
            expect(
              inlineUrl.startsWith("https://"),
              `${prefix} non-HTTPS inline URL: ${inlineUrl}`,
            ).toBe(true);
          }
        }

        for (const c of view.contacts) {
          expect(
            combinedPlain.toLowerCase().includes(c.name.trim().toLowerCase()),
            `${prefix} contact ${c.name} in prose`,
          ).toBe(true);
          expect(FORBIDDEN_DEAD_OR_WRONG_URLS.has(c.website), `${prefix} dead contact URL`).toBe(
            false,
          );
          expect(
            isForbiddenProxyUrl(c.website),
            `${prefix} forbidden proxy contact URL: ${c.website}`,
          ).toBe(false);
          expect(
            isNfcNormalizedUrl(c.website),
            `${prefix} non-NFC contact URL: ${c.website}`,
          ).toBe(true);
          if (isRemediated20261114) {
            expect(
              c.website.startsWith("https://"),
              `${prefix} non-HTTPS contact URL: ${c.website}`,
            ).toBe(true);
            const linkedSource = view.sources.find((s) => s.id === c.source_id);
            expect(
              linkedSource,
              `${prefix} contact ${c.name} missing source_id=${c.source_id}`,
            ).toBeDefined();
            const contactHost = new URL(c.website).hostname.toLowerCase().replace(/^www\./, "");
            const sourceHost = new URL(linkedSource!.url).hostname
              .toLowerCase()
              .replace(/^www\./, "");
            expect(
              contactHost,
              `${prefix} contact ${c.name} host mismatch with source [${c.source_id}]`,
            ).toBe(sourceHost);
          }
        }

        for (const s of view.sources) {
          expect(FORBIDDEN_DEAD_OR_WRONG_URLS.has(s.url), `${prefix} dead source URL`).toBe(
            false,
          );
          expect(
            isForbiddenProxyUrl(s.url),
            `${prefix} forbidden proxy source URL: ${s.url}`,
          ).toBe(false);
          expect(
            isNfcNormalizedUrl(s.url),
            `${prefix} non-NFC source URL: ${s.url}`,
          ).toBe(true);
          if (isRemediated20261114) {
            expect(
              s.url.startsWith("https://"),
              `${prefix} non-HTTPS source URL: ${s.url}`,
            ).toBe(true);
          }
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

  it("optimizes SERP titles, meta descriptions, self-referencing hreflang, and 196/196 same-country sibling cross-links", () => {
    const guides = publishedCorridorGuides("en");
    const domestic = guides.filter((g) => g.category === "domestic-bereavement");
    const terminal = guides.filter((g) => g.category === "terminal-illness-admin");

    for (const d of domestic) {
      const sibling = terminal.find(
        (t) => t.countryOfDeathCode === d.countryOfDeathCode,
      )!;
      expect(d.relatedSlugs, d.slug).toContain(sibling.slug);
      expect(sibling.relatedSlugs, sibling.slug).toContain(d.slug);
    }

    const titleLengths: number[] = [];
    for (const { lang, slug } of publishedCorridorGuideStaticParams()) {
      const guide = getCorridorGuideBySlug(slug, lang)!;
      const seoTitle = formatGuideSeoTitle(guide, lang);
      const seoDesc = formatGuideSeoDescription(guide, lang);
      const pageAlternates = corridorGuidePageHreflangAlternates(guide);

      expect(seoTitle.endsWith(" | Clarvia"), `${lang}/${slug}: ${seoTitle}`).toBe(
        true,
      );
      titleLengths.push(seoTitle.length);

      expect(seoDesc.length, `${lang}/${slug}: ${seoDesc}`).toBeGreaterThanOrEqual(
        110,
      );
      expect(seoDesc.length, `${lang}/${slug}: ${seoDesc}`).toBeLessThanOrEqual(158);

      expect(pageAlternates["en"]).toBe(
        `https://clarvia.org${corridorGuidePath(guide.slug, "en")}`,
      );
      expect(pageAlternates["x-default"]).toBe(
        `https://clarvia.org${corridorGuidePath(guide.slug, "en")}`,
      );
    }

    titleLengths.sort((a, b) => a - b);
    const medianTitleLen = titleLengths[Math.floor(titleLengths.length / 2)];
    expect(medianTitleLen).toBeLessThanOrEqual(65);

    const ukFranceTerminal = getCorridorGuideBySlug(
      "uk-france-terminal-illness-checklist",
      "en",
    )!;
    expect(shortGuideCardTitle(ukFranceTerminal)).toBe(
      "Terminal Illness & Advance Care: UK & France",
    );
  });
});
