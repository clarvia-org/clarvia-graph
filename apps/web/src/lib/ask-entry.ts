export const ASK_LOCALES = [
  "en",
  "fr",
  "de",
  "lb",
  "nl",
  "it",
  "es",
  "pt",
  "pl",
  "ro",
  "ar",
  "uk",
  "tr",
  "ru",
] as const;

export type AskLocale = (typeof ASK_LOCALES)[number];

export const ASK_LOCALE_STORAGE_KEY = "clarvia-ask-locale";
export const ASK_REF_STORAGE_KEY = "clarvia-ask-ref";
export const ASK_MARKET_STORAGE_KEY = "clarvia-ask-market";

export const ASK_LOCALE_NAMES: Record<AskLocale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  lb: "Lëtzebuergesch",
  nl: "Nederlands",
  it: "Italiano",
  es: "Español",
  pt: "Português",
  pl: "Polski",
  ro: "Română",
  ar: "العربية",
  uk: "Українська",
  tr: "Türkçe",
  ru: "Русский",
};

const ASK_LOCALE_SET = new Set<string>(ASK_LOCALES);

const ALIASES: Record<string, AskLocale> = {
  lu: "lb",
};

export const MIN_QUESTION_CHARS = 20;
export const PLACE_HINT_RE = /\b(in|at|from|near|within)\s+\S{2,}|\blive[sd]?\s+in\b/i;

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function isAskLocale(value: string): value is AskLocale {
  return ASK_LOCALE_SET.has(value);
}

export function parseAskLocale(raw: string | null | undefined): AskLocale | null {
  if (!raw) return null;
  const lower = raw.trim().replace(/_/g, "-").toLowerCase();
  if (!lower) return null;
  if (ALIASES[lower]) return ALIASES[lower];
  if (isAskLocale(lower)) return lower;
  const primary = lower.split("-")[0] ?? "";
  if (ALIASES[primary]) return ALIASES[primary];
  if (isAskLocale(primary)) return primary;
  return null;
}

export function matchBrowserLanguages(languages: readonly string[]): AskLocale | null {
  for (const language of languages) {
    const match = parseAskLocale(language);
    if (match) return match;
  }
  return null;
}

export function resolveAskLocale(opts: {
  saved?: string | null;
  browserLanguages?: readonly string[] | null;
  linkHint?: string | null;
}): AskLocale {
  return (
    parseAskLocale(opts.saved) ??
    matchBrowserLanguages(opts.browserLanguages ?? []) ??
    parseAskLocale(opts.linkHint) ??
    "en"
  );
}

/** After submit, the forwarded form language beats ambient browser language. */
export function resolveAskSentLocale(opts: {
  saved?: string | null;
  browserLanguages?: readonly string[] | null;
  linkHint?: string | null;
}): AskLocale {
  const hint = parseAskLocale(opts.linkHint);
  return resolveAskLocale({
    saved: opts.saved,
    browserLanguages: hint ? [] : opts.browserLanguages,
    linkHint: opts.linkHint,
  });
}

export function isRtlAskLocale(locale: AskLocale): boolean {
  return locale === "ar";
}

type AskHtmlElement = {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
};

/** Sets html dir/lang for an Ask locale and returns a restore function for unmount. */
export function applyAskHtmlLocale(html: AskHtmlElement, locale: AskLocale): () => void {
  const previousDir = html.getAttribute("dir");
  const previousLang = html.getAttribute("lang");
  html.setAttribute("dir", isRtlAskLocale(locale) ? "rtl" : "ltr");
  html.setAttribute("lang", locale);
  return () => {
    if (previousDir) html.setAttribute("dir", previousDir);
    else html.removeAttribute("dir");
    if (previousLang) html.setAttribute("lang", previousLang);
    else html.removeAttribute("lang");
  };
}

export function siteLangForAskLocale(locale: AskLocale): "en" | "fr" | "de" | "lu" {
  if (locale === "fr" || locale === "de") return locale;
  if (locale === "lb") return "lu";
  return "en";
}

export function siteLangToAskLocale(lang: "en" | "fr" | "de" | "lu"): AskLocale {
  return lang === "lu" ? "lb" : lang;
}

/** Attribution slugs only. Rejects anything that is not a short lowercase token. */
export function sanitizeAskSlug(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim().toLowerCase();
  if (value.length < 1 || value.length > 64) return undefined;
  if (!SLUG_RE.test(value)) return undefined;
  return value;
}

export function buildPartnerAskUrl(opts: {
  ref?: string | null;
  market?: string | null;
  lang?: string | null;
}): string {
  const url = new URL("https://clarvia.org/ask");
  const ref = sanitizeAskSlug(opts.ref);
  const market = sanitizeAskSlug(opts.market);
  const lang = parseAskLocale(opts.lang);
  if (ref) url.searchParams.set("ref", ref);
  if (market) url.searchParams.set("market", market);
  if (lang && lang !== "en") url.searchParams.set("lang", lang);
  return url.toString();
}
