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

export function isValidLang(lang: string): lang is Lang {
  return LANGUAGES.includes(lang as Lang);
}

export function isValidCountry(country: string): country is CountrySlug {
  return country in COUNTRIES;
}

export function l(lang: Lang, en: string, fr: string, de: string, lu?: string): string {
  if (lang === "lu") return lu || fr || en;
  return lang === "fr" ? fr : lang === "de" ? de : en;
}

