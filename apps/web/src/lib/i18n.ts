import { NEW_COPY_TRANSLATIONS } from "@/content/new-copy-translations";

export const LANGUAGES = ["en", "fr", "de", "lu"] as const;
export type Lang = (typeof LANGUAGES)[number];

/** Language codes Google Ads / hreflang use. Luxembourgish is `lb`; the site path is `/lu`. */
export const ADS_LANGUAGES = ["en", "fr", "de", "lb"] as const;
export type AdsLanguage = (typeof ADS_LANGUAGES)[number];

export const COUNTRIES = {
  luxembourg: {
    dataDir: "lu",
    label: { en: "Luxembourg", fr: "Luxembourg", de: "Luxemburg", lu: "Lëtzebuerg" },
    languages: ["en", "fr", "de", "lu"] as const,
  },
} as const;

export type CountrySlug = keyof typeof COUNTRIES;

export function isLang(value: string): value is Lang {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** Google Ads / HTML language code for a site prefix (`lu` → `lb`). */
export function adsLanguageCode(lang: Lang): AdsLanguage {
  return lang === "lu" ? "lb" : lang;
}

export function l(lang: Lang, en: string, fr: string, de: string, lu?: string): string {
  if (lang === "lu") return lu || fr || en;
  return lang === "fr" ? fr : lang === "de" ? de : en;
}

/** Copy introduced with the Ad Grants information architecture. */
export function tr(lang: Lang, en: string): string {
  if (lang === "en") return en;
  return NEW_COPY_TRANSLATIONS[en]?.[lang] ?? en;
}

/** hreflang only for locales whose page body is actually translated. */
export function hreflangForLocales(
  pathAfterLang: string,
  locales: readonly Lang[],
): Record<string, string> {
  const suffix = pathAfterLang ? `/${pathAfterLang}` : "";
  const languages: Record<string, string> = {};
  for (const code of locales) {
    languages[code === "lu" ? "lb" : code] = `${SITE_URL}/${code}${suffix}`;
  }
  languages["x-default"] = `${SITE_URL}/en${suffix}`;
  return languages;
}

const SITE_URL = "https://clarvia.org";

export type AdsCampaignKind = "ask" | "support";

/** Final URLs to paste into Google Ads. Luxembourgish campaigns must use `/lu`, not `/en` or `/lb`. */
export function adsFinalUrl(kind: AdsCampaignKind, adsLanguage: AdsLanguage): string {
  const pathLang = adsLanguage === "lb" ? "lu" : adsLanguage;
  return kind === "support" ? `${SITE_URL}/${pathLang}/support` : `${SITE_URL}/${pathLang}`;
}

export const ADS_FINAL_URLS = {
  ask: {
    en: adsFinalUrl("ask", "en"),
    fr: adsFinalUrl("ask", "fr"),
    de: adsFinalUrl("ask", "de"),
    lb: adsFinalUrl("ask", "lb"),
  },
  support: {
    en: adsFinalUrl("support", "en"),
    fr: adsFinalUrl("support", "fr"),
    de: adsFinalUrl("support", "de"),
    lb: adsFinalUrl("support", "lb"),
  },
} as const;

/**
 * `/lb` is the ISO / Google Ads code; the live site prefix is `/lu`.
 * Without this, a `/lb` visit can fall through to English.
 */
export const LANGUAGE_REDIRECTS = [
  { source: "/lb", destination: "/lu", permanent: true },
  { source: "/lb/:path*", destination: "/lu/:path*", permanent: true },
] as const;

/** hreflang map for a path after the language prefix (`""` for home, `"contact"` for /{lang}/contact). */
export function hreflangLanguages(pathAfterLang = ""): Record<string, string> {
  const suffix = pathAfterLang ? `/${pathAfterLang}` : "";
  const languages: Record<string, string> = {};
  for (const code of LANGUAGES) {
    languages[code === "lu" ? "lb" : code] = `${SITE_URL}/${code}${suffix}`;
  }
  languages["x-default"] = `${SITE_URL}/en${suffix}`;
  return languages;
}
