import rawGuides from "./corridor-guides.json";

/**
 * Graduated rollout gate:
 * - Wave 1: 2 preview guides (1 English-only + 1 Bilingual EN/ES = 3 pages) for live visual review
 * - Wave 2: Full 250 guides (250 EN + 140 L1 = 390 pages)
 */
export const MAX_PUBLISHED_WAVE = 2;

export type CorridorGuideStep = {
  stepNumber: number;
  title: string;
  html: string;
};

export type CorridorGuideContact = {
  id: number;
  name: string;
  kind: string;
  country_code: string;
  website: string;
  phone: string | null;
  email: string | null;
  commercial: boolean;
  note: string;
  source_id: number;
};

export type CorridorGuideSource = {
  id: number;
  title: string;
  publisher: string;
  url: string;
};

export type CorridorGuideLocalization = {
  lang: string;
  countryOfDeath: string;
  citizenshipCountry: string;
  title: string;
  cardSummary: string;
  introHtml: string;
  steps: CorridorGuideStep[];
  closingQuestion: string;
  caseDependentItems: string[];
  prefillQuestion: string;
  contacts: CorridorGuideContact[];
  sources: CorridorGuideSource[];
};

export type CorridorGuide = {
  id: string;
  slug: string;
  wave: number;
  masterLang?: string;
  locales: string[];
  category:
    | "cross-border-bereavement"
    | "cross-border-terminal-illness"
    | "terminal-illness-admin"
    | "domestic-bereavement";
  region: string;
  countryOfDeath: string;
  countryOfDeathCode: string;
  citizenshipCountry: string;
  citizenshipCountryCode: string;
  title: string;
  titleEn?: string;
  cardSummary: string;
  lastReviewed: string;
  introHtml: string;
  steps: CorridorGuideStep[];
  closingQuestion: string;
  caseDependentItems: string[];
  prefillQuestion: string;
  contacts: CorridorGuideContact[];
  sources: CorridorGuideSource[];
  localizations?: Record<string, CorridorGuideLocalization>;
  relatedSlugs: string[];
};

const ALL_CORRIDOR_GUIDES = rawGuides as CorridorGuide[];
const SITE_URL = "https://clarvia.org";

const SINGLE_COUNTRY_SIBLING_BY_SLUG: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  const singleByCountry = new Map<string, CorridorGuide[]>();
  for (const g of ALL_CORRIDOR_GUIDES) {
    if (g.countryOfDeathCode === g.citizenshipCountryCode) {
      const arr = singleByCountry.get(g.countryOfDeathCode) ?? [];
      arr.push(g);
      singleByCountry.set(g.countryOfDeathCode, arr);
    }
  }
  for (const pair of singleByCountry.values()) {
    if (pair.length === 2) {
      map.set(pair[0].slug, pair[1].slug);
      map.set(pair[1].slug, pair[0].slug);
    }
  }
  return map;
})();

function localizeGuide(
  guide: CorridorGuide,
  lang: string,
  publishedSlugSet?: ReadonlySet<string>,
): CorridorGuide {
  let relatedSlugs = guide.relatedSlugs;
  const siblingSlug = SINGLE_COUNTRY_SIBLING_BY_SLUG.get(guide.slug);
  if (publishedSlugSet) {
    const filtered = guide.relatedSlugs.filter(
      (s) => s !== guide.slug && publishedSlugSet.has(s),
    );
    if (
      siblingSlug &&
      publishedSlugSet.has(siblingSlug) &&
      !filtered.includes(siblingSlug)
    ) {
      filtered.unshift(siblingSlug);
      if (filtered.length > 3) {
        filtered.length = 3;
      }
    }
    if (filtered.length < 3) {
      for (const candidate of publishedSlugSet) {
        if (candidate !== guide.slug && !filtered.includes(candidate)) {
          filtered.push(candidate);
        }
        if (filtered.length >= 3) break;
      }
    }
    relatedSlugs = filtered;
  } else if (siblingSlug && !guide.relatedSlugs.includes(siblingSlug)) {
    relatedSlugs = [siblingSlug, ...guide.relatedSlugs].slice(0, 3);
  }

  if (lang === "en") {
    return relatedSlugs === guide.relatedSlugs
      ? guide
      : { ...guide, relatedSlugs };
  }
  const loc = guide.localizations?.[lang];
  if (!loc) {
    return relatedSlugs === guide.relatedSlugs
      ? guide
      : { ...guide, relatedSlugs };
  }
  return {
    ...guide,
    countryOfDeath: loc.countryOfDeath,
    citizenshipCountry: loc.citizenshipCountry,
    title: loc.title,
    cardSummary: loc.cardSummary,
    introHtml: loc.introHtml,
    steps: loc.steps,
    closingQuestion: loc.closingQuestion,
    caseDependentItems: loc.caseDependentItems,
    prefillQuestion: loc.prefillQuestion,
    contacts: loc.contacts,
    sources: loc.sources,
    relatedSlugs,
  };
}

export function allCorridorGuides(): CorridorGuide[] {
  return ALL_CORRIDOR_GUIDES;
}

export function getAnyCorridorGuideBySlug(
  slug: string,
  lang = "en",
): CorridorGuide | undefined {
  const guide = ALL_CORRIDOR_GUIDES.find((item) => item.slug === slug);
  if (!guide || !guide.locales.includes(lang)) {
    return undefined;
  }
  return localizeGuide(guide, lang);
}

export function allCorridorGuideStaticParams(): Array<{
  lang: string;
  slug: string;
}> {
  const params: Array<{ lang: string; slug: string }> = [];
  for (const guide of ALL_CORRIDOR_GUIDES) {
    for (const lang of guide.locales) {
      params.push({ lang, slug: guide.slug });
    }
  }
  return params;
}

export function publishedCorridorGuides(lang = "en"): CorridorGuide[] {
  const base = ALL_CORRIDOR_GUIDES.filter(
    (guide) => guide.wave <= MAX_PUBLISHED_WAVE,
  );
  const publishedSlugSet = new Set(base.map((g) => g.slug));
  if (lang === "en") {
    return base.map((guide) => localizeGuide(guide, "en", publishedSlugSet));
  }
  return base
    .filter((guide) => guide.locales.includes(lang))
    .map((guide) => localizeGuide(guide, lang, publishedSlugSet));
}

export function getCorridorGuideBySlug(
  slug: string,
  lang = "en",
): CorridorGuide | undefined {
  const base = ALL_CORRIDOR_GUIDES.filter(
    (item) => item.wave <= MAX_PUBLISHED_WAVE,
  );
  const guide = base.find((item) => item.slug === slug);
  if (!guide || !guide.locales.includes(lang)) {
    return undefined;
  }
  const publishedSlugSet = new Set(base.map((g) => g.slug));
  return localizeGuide(guide, lang, publishedSlugSet);
}

export function corridorGuidePath(slug: string, lang = "en"): string {
  return `/${lang}/guide/${slug}`;
}

export function publishedCorridorGuideStaticParams(): Array<{
  lang: string;
  slug: string;
}> {
  const params: Array<{ lang: string; slug: string }> = [];
  for (const guide of publishedCorridorGuides("en")) {
    for (const lang of guide.locales) {
      params.push({ lang, slug: guide.slug });
    }
  }
  return params;
}

export function corridorGuideHreflangAlternates(
  guide: CorridorGuide,
): Record<string, string> | undefined {
  if (guide.locales.length <= 1) {
    return undefined;
  }
  const languages: Record<string, string> = {};
  for (const code of guide.locales) {
    const hreflangCode = code === "lu" ? "lb" : code;
    languages[hreflangCode] = `${SITE_URL}${corridorGuidePath(guide.slug, code)}`;
  }
  languages["x-default"] = `${SITE_URL}${corridorGuidePath(guide.slug, "en")}`;
  return languages;
}

/**
 * Always returns complete hreflang alternates (including self-referencing `en` + `x-default`
 * on single-locale guides) for HTML `<head>` metadata.
 */
export function corridorGuidePageHreflangAlternates(
  guide: CorridorGuide,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const code of guide.locales) {
    const hreflangCode = code === "lu" ? "lb" : code;
    languages[hreflangCode] = `${SITE_URL}${corridorGuidePath(guide.slug, code)}`;
  }
  languages["x-default"] = `${SITE_URL}${corridorGuidePath(guide.slug, "en")}`;
  return languages;
}

const SHORT_FIVE_STEP_SUFFIX_BY_LANG: Record<string, string> = {
  en: " (5 Steps)",
  fr: " (5 étapes)",
  de: " (5 Schritte)",
  es: " (5 pasos)",
  pt: " (5 passos)",
  it: " (5 passi)",
  nl: " (5 stappen)",
  pl: " (5 kroków)",
  ro: " (5 pași)",
  tr: " (5 Adım)",
  uk: " (5 кроків)",
  ru: " (5 шагов)",
  ar: " (5 خطوات)",
  lu: " (5 Schrëtt)",
};

/**
 * Formats a concise SERP `<title>` (targeting <= 65-68 chars) so Google/Bing do not
 * truncate the country/corridor or checklist hook mid-sentence, while keeping `| Clarvia`.
 */
export function formatGuideSeoTitle(
  guide: Pick<
    CorridorGuide,
    "title" | "category" | "countryOfDeath" | "citizenshipCountry"
  >,
  lang: string,
): string {
  const full = `${guide.title} | Clarvia`;
  if (full.length <= 65) return full;

  if (lang === "en") {
    if (guide.category === "terminal-illness-admin") {
      const compact = `Terminal Illness & End-of-Life Checklist: ${guide.countryOfDeath} | Clarvia`;
      if (compact.length <= 68) return compact;
      return `Terminal Illness Checklist: ${guide.countryOfDeath} | Clarvia`;
    }
    if (guide.category === "cross-border-terminal-illness") {
      const pair = guide.title.includes(":")
        ? guide.title.split(/\s*:\s*/)[1]
        : `${guide.countryOfDeath} & ${guide.citizenshipCountry}`;
      const compact = `Terminal Illness & Advance Care: ${pair} | Clarvia`;
      if (compact.length <= 68) return compact;
      return `Cross-Border Terminal Illness: ${pair} | Clarvia`;
    }
  }

  const parts = guide.title.split(/\s*:\s*/);
  if (parts.length >= 2) {
    const left = parts[0]
      .replace(" Citizen or Resident ", " Citizen ")
      .replace(" citoyen ou résident ", " citoyen ")
      .replace(" Staatsangehörige oder Einwohner ", " Staatsangehörige ")
      .replace(" ciudadano o residente ", " ciudadano ")
      .replace(" cidadão ou residente ", " cidadão ")
      .replace(" cittadino o residente ", " cittadino ")
      .replace(" staatsburger of inwoner ", " staatsburger ")
      .replace(" Vatandaşı veya Mukimi Bir Kişi ", " Vatandaşı ");
    const suf = SHORT_FIVE_STEP_SUFFIX_BY_LANG[lang] ?? "";
    const candidate = `${left}${suf} | Clarvia`;
    if (candidate.length <= 68) return candidate;
    return `${left} | Clarvia`;
  }
  return full;
}

/**
 * Formats a SERP `<meta name="description">` within the 120-158 char display window,
 * avoiding mid-word truncation and enriching generic cross-border summaries with verified authorities.
 */
export function formatGuideSeoDescription(
  guide: Pick<CorridorGuide, "cardSummary" | "sources" | "contacts">,
  lang: string,
): string {
  let base = guide.cardSummary.trim();
  if (
    lang === "en" &&
    base.includes(
      "licensed international funeral providers, civil death registration and multilingual extracts",
    ) &&
    guide.contacts.length >= 2
  ) {
    const names = guide.contacts
      .slice(0, 2)
      .map((c) => c.name)
      .join(", ");
    base = `Free 5-step checklist (${guide.sources.length} official sources): medical death certificate, ${names}, consular registration & repatriation.`;
  }
  if (base.length <= 158) return base;

  const slice = base.slice(0, 156);
  const lastComma = Math.max(
    slice.lastIndexOf(","),
    slice.lastIndexOf(";"),
    slice.lastIndexOf("،"),
  );
  if (lastComma >= 118) {
    return `${slice.slice(0, lastComma).replace(/[\s,:;،]+$/, "")}.`;
  }
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = (lastSpace >= 110 ? slice.slice(0, lastSpace) : slice)
    .replace(
      /\s+(?:and|or|to|in|of|for|with|by|the|a|an|&|y|o|de|del|en|el|la|los|las|para|con|et|ou|du|des|le|les|pour|avec|und|oder|im|für|mit|von|der|die|das|den|dem|e|do|da|dos|das|em|no|na|di|della|per|voor|met|van|het|i|lub|w|z|dla|și|sau|în|cu|pentru|ve|veya|için|ile|та|або|у|в|з|для|и|или|с|و|أو|في|من|إلى|مع|zu|mat|fir)$/i,
      "",
    )
    .replace(/[\s,:;،.(&-]+$/, "");
  return `${trimmed}...`;
}

/**
 * Returns a compact card/link title for internal hub-and-spoke cards without stripping
 * country names when the countries appear after the colon (`Cross-Border Terminal Illness...: UK & France`).
 */
export function shortGuideCardTitle(
  guide: Pick<CorridorGuide, "title" | "category">,
): string {
  const parts = guide.title.split(/\s*:\s*/);
  if (parts.length < 2) return guide.title;
  if (
    guide.category === "cross-border-terminal-illness" &&
    parts[0].startsWith("Cross-Border Terminal Illness")
  ) {
    return `Terminal Illness & Advance Care: ${parts[1]}`;
  }
  return parts[0];
}

/**
 * Returns all published cross-border corridor guides (spokes) involving `countryCode`
 * (either as countryOfDeathCode or citizenshipCountryCode) so every single-country guide
 * acts as an SEO Hub Page linking down into its cross-border corridor pages.
 */
export function getCrossBorderSpokesForCountry(
  countryCode: string,
  preferredCategory: CorridorGuide["category"],
  lang = "en",
): Array<{ guide: CorridorGuide; targetLang: string }> {
  const base = ALL_CORRIDOR_GUIDES.filter(
    (item) => item.wave <= MAX_PUBLISHED_WAVE,
  );
  const publishedSlugSet = new Set(base.map((g) => g.slug));
  const isBereavementHub = preferredCategory.includes("bereavement");

  const matching = base.filter(
    (item) =>
      item.countryOfDeathCode !== item.citizenshipCountryCode &&
      (item.countryOfDeathCode === countryCode ||
        item.citizenshipCountryCode === countryCode),
  );

  matching.sort((a, b) => {
    const aSameTheme = a.category.includes("bereavement") === isBereavementHub ? 0 : 1;
    const bSameTheme = b.category.includes("bereavement") === isBereavementHub ? 0 : 1;
    if (aSameTheme !== bSameTheme) return aSameTheme - bSameTheme;
    const aOutbound = a.countryOfDeathCode === countryCode ? 0 : 1;
    const bOutbound = b.countryOfDeathCode === countryCode ? 0 : 1;
    return aOutbound - bOutbound;
  });

  return matching.map((item) => {
    if (lang !== "en" && item.locales.includes(lang)) {
      return {
        guide: localizeGuide(item, lang, publishedSlugSet),
        targetLang: lang,
      };
    }
    return {
      guide: localizeGuide(item, "en", publishedSlugSet),
      targetLang: "en",
    };
  });
}

/**
 * Returns the published single-country Hub guides for the two countries of a cross-border corridor guide.
 */
export function getParentSingleCountryHubsForCorridor(
  guide: CorridorGuide,
  lang = "en",
): Array<{ guide: CorridorGuide; targetLang: string }> {
  if (guide.countryOfDeathCode === guide.citizenshipCountryCode) {
    return [];
  }
  const base = ALL_CORRIDOR_GUIDES.filter(
    (item) => item.wave <= MAX_PUBLISHED_WAVE,
  );
  const publishedSlugSet = new Set(base.map((g) => g.slug));
  const targetCat = guide.category.includes("bereavement")
    ? "domestic-bereavement"
    : "terminal-illness-admin";

  const codes = [guide.countryOfDeathCode, guide.citizenshipCountryCode];
  const results: Array<{ guide: CorridorGuide; targetLang: string }> = [];

  for (const code of codes) {
    const hub =
      base.find(
        (item) =>
          item.countryOfDeathCode === code &&
          item.citizenshipCountryCode === code &&
          item.category === targetCat,
      ) ??
      base.find(
        (item) =>
          item.countryOfDeathCode === code &&
          item.citizenshipCountryCode === code,
      );
    if (hub) {
      const targetLang =
        lang !== "en" && hub.locales.includes(lang) ? lang : "en";
      results.push({
        guide: localizeGuide(hub, targetLang, publishedSlugSet),
        targetLang,
      });
    }
  }
  return results;
}
