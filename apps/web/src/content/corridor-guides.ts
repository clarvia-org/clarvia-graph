import rawGuides from "./corridor-guides.json";

/**
 * Graduated rollout gate:
 * - Wave 1: 2 preview guides (1 English-only + 1 Bilingual EN/ES = 3 pages) for live visual review
 * - Wave 2: Full 250 guides (250 EN + 140 L1 = 390 pages)
 */
export const MAX_PUBLISHED_WAVE = 1;

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
  mailtoSubject: string;
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
  mailtoSubject: string;
  contacts: CorridorGuideContact[];
  sources: CorridorGuideSource[];
  localizations?: Record<string, CorridorGuideLocalization>;
  relatedSlugs: string[];
};

const ALL_CORRIDOR_GUIDES = rawGuides as CorridorGuide[];
const SITE_URL = "https://clarvia.org";

function localizeGuide(
  guide: CorridorGuide,
  lang: string,
  publishedSlugSet?: ReadonlySet<string>,
): CorridorGuide {
  let relatedSlugs = guide.relatedSlugs;
  if (publishedSlugSet) {
    const filtered = guide.relatedSlugs.filter(
      (s) => s !== guide.slug && publishedSlugSet.has(s),
    );
    if (filtered.length < 3) {
      for (const candidate of publishedSlugSet) {
        if (candidate !== guide.slug && !filtered.includes(candidate)) {
          filtered.push(candidate);
        }
        if (filtered.length >= 3) break;
      }
    }
    relatedSlugs = filtered;
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
    mailtoSubject: loc.mailtoSubject,
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
    languages[code] = `${SITE_URL}${corridorGuidePath(guide.slug, code)}`;
  }
  languages["x-default"] = `${SITE_URL}${corridorGuidePath(guide.slug, "en")}`;
  return languages;
}
