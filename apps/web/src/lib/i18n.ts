export const LANGUAGES = ["en", "fr", "de", "lu"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const COUNTRIES = {
  luxembourg: {
    dataDir: "lu",
    label: { en: "Luxembourg", fr: "Luxembourg", de: "Luxemburg", lu: "Lëtzebuerg" },
    languages: ["en", "fr", "de", "lu"] as const,
  },
} as const;

export type CountrySlug = keyof typeof COUNTRIES;

export function l(lang: Lang, en: string, fr: string, de: string, lu?: string): string {
  if (lang === "lu") return lu || fr || en;
  return lang === "fr" ? fr : lang === "de" ? de : en;
}

const SITE_URL = "https://clarvia.org";

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

