export const LANGUAGES = ["en", "fr", "de"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const COUNTRIES = {
  luxembourg: {
    dataDir: "lu",
    label: { en: "Luxembourg", fr: "Luxembourg", de: "Luxemburg" },
    languages: ["en", "fr", "de"] as const,
  },
} as const;

export type CountrySlug = keyof typeof COUNTRIES;

export function isValidLang(lang: string): lang is Lang {
  return LANGUAGES.includes(lang as Lang);
}

export function isValidCountry(country: string): country is CountrySlug {
  return country in COUNTRIES;
}

export function l(lang: Lang, en: string, fr: string, de: string): string {
  return lang === "fr" ? fr : lang === "de" ? de : en;
}
