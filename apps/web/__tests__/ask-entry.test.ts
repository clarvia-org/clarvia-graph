import { describe, expect, it } from "vitest";
import translations from "@/content/ask-entry-translations.json";
import {
  ASK_LOCALES,
  buildPartnerAskUrl,
  isRtlAskLocale,
  parseAskLocale,
  resolveAskLocale,
  sanitizeAskSlug,
  siteLangForAskLocale,
} from "@/lib/ask-entry";
import { askCopy, type AskCopyId } from "@/lib/ask-entry-copy";

describe("ask entry locales", () => {
  it("lists 14 tier-1 locales", () => {
    expect(ASK_LOCALES).toHaveLength(14);
  });

  it("maps regional tags and the site lu alias onto supported locales", () => {
    expect(parseAskLocale("fr-BE")).toBe("fr");
    expect(parseAskLocale("nl-BE")).toBe("nl");
    expect(parseAskLocale("pt-BR")).toBe("pt");
    expect(parseAskLocale("ar-DZ")).toBe("ar");
    expect(parseAskLocale("de-AT")).toBe("de");
    expect(parseAskLocale("lu")).toBe("lb");
    expect(parseAskLocale("lb")).toBe("lb");
    expect(parseAskLocale("ja")).toBeNull();
  });

  it("resolves saved choice, then browser, then link hint, then English", () => {
    expect(
      resolveAskLocale({
        saved: "de",
        browserLanguages: ["fr"],
        linkHint: "nl",
      }),
    ).toBe("de");
    expect(
      resolveAskLocale({
        saved: null,
        browserLanguages: ["nl-BE", "en"],
        linkHint: "fr",
      }),
    ).toBe("nl");
    expect(
      resolveAskLocale({
        saved: "not-a-locale",
        browserLanguages: ["ja-JP"],
        linkHint: "fr",
      }),
    ).toBe("fr");
    expect(
      resolveAskLocale({
        saved: null,
        browserLanguages: ["zh-CN"],
        linkHint: "xx",
      }),
    ).toBe("en");
  });

  it("marks Arabic as RTL and maps Luxembourgish onto the site /lu prefix", () => {
    expect(isRtlAskLocale("ar")).toBe(true);
    expect(isRtlAskLocale("fr")).toBe(false);
    expect(siteLangForAskLocale("lb")).toBe("lu");
    expect(siteLangForAskLocale("uk")).toBe("en");
  });

  it("has a complete non-empty bundle for every listed locale", () => {
    const englishKeys = Object.keys(translations.en).sort();
    for (const locale of ASK_LOCALES) {
      const bundle = translations[locale];
      expect(bundle, locale).toBeDefined();
      expect(Object.keys(bundle).sort(), locale).toEqual(englishKeys);
      for (const key of englishKeys) {
        expect(bundle[key as AskCopyId].trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
      expect(askCopy(locale, "operator_line")).toContain("Clarvia ASBL");
      expect(askCopy(locale, "operator_line")).toContain("RCS F15680");
      expect(askCopy(locale, "sent_body_with_address")).toContain("lex@clarvia.org");
    }
  });

  it("keeps French and does not leave Ukrainian on the English title", () => {
    expect(askCopy("fr", "title")).toBe("Demandez à Clarvia");
    expect(askCopy("uk", "title")).not.toBe(askCopy("en", "title"));
    expect(askCopy("uk", "title")).not.toBe(askCopy("ru", "title"));
  });

  it("states that Ask is for terminal illness and bereavement", () => {
    expect(askCopy("en", "eyebrow")).toMatch(/bereavement/i);
    expect(askCopy("en", "blurb")).toMatch(/terminally ill or has died/i);
    expect(askCopy("fr", "blurb")).toMatch(/phase terminale|décédé/i);
  });
});

describe("ask attribution slugs", () => {
  it("accepts short lowercase tokens and rejects family data", () => {
    expect(sanitizeAskSlug("pallialux")).toBe("pallialux");
    expect(sanitizeAskSlug("BE")).toBe("be");
    expect(sanitizeAskSlug("my-org-2")).toBe("my-org-2");
    expect(sanitizeAskSlug("not an email@example.com")).toBeUndefined();
    expect(sanitizeAskSlug("https://evil.example")).toBeUndefined();
    expect(sanitizeAskSlug("a/b")).toBeUndefined();
    expect(sanitizeAskSlug("")).toBeUndefined();
  });

  it("builds a canonical /ask URL without putting questions in the query", () => {
    expect(buildPartnerAskUrl({})).toBe("https://clarvia.org/ask");
    expect(
      buildPartnerAskUrl({
        ref: "pallialux",
        market: "be",
        lang: "fr",
      }),
    ).toBe("https://clarvia.org/ask?ref=pallialux&market=be&lang=fr");
    expect(buildPartnerAskUrl({ lang: "en" })).toBe("https://clarvia.org/ask");
    expect(buildPartnerAskUrl({ lang: "lu" })).toBe("https://clarvia.org/ask?lang=lb");
    expect(
      buildPartnerAskUrl({
        ref: "My father died",
        lang: "fr",
      }),
    ).toBe("https://clarvia.org/ask?lang=fr");
  });
});
