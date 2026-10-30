import { type Metadata } from "next";
import Link from "next/link";
import { siteAskHref } from "@/lib/ask-entry";
import { type Lang, LANGUAGES, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import {
  GUIDE_LOCALE_LABELS,
  type GuideLocale,
} from "@/content/corridor-guide-ui";
import {
  corridorGuidePath,
  getCorridorGuideBySlug,
  publishedCorridorGuides,
} from "@/content/corridor-guides";
import GuidanceBrowser, {
  type GuidanceCardItem,
  type GuidanceCountryOption,
  type MacroRegion,
} from "./GuidanceBrowser";

const EUROPE_CODES = new Set([
  "AD",
  "AL",
  "AT",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SK",
  "SM",
  "TR",
  "UA",
  "XK",
]);

const AMERICAS_CODES = new Set([
  "AG",
  "AR",
  "BB",
  "BO",
  "BR",
  "BS",
  "BZ",
  "CA",
  "CL",
  "CO",
  "CR",
  "CU",
  "DM",
  "DO",
  "EC",
  "GD",
  "GT",
  "GY",
  "HN",
  "HT",
  "JM",
  "KN",
  "LC",
  "MX",
  "NI",
  "PA",
  "PE",
  "PY",
  "SR",
  "SV",
  "TT",
  "US",
  "UY",
  "VC",
  "VE",
]);

const ASIA_PACIFIC_CODES = new Set([
  "AF",
  "AM",
  "AU",
  "AZ",
  "BD",
  "BN",
  "BT",
  "CN",
  "FJ",
  "FM",
  "GE",
  "ID",
  "IN",
  "JP",
  "KG",
  "KH",
  "KI",
  "KP",
  "KR",
  "KZ",
  "LA",
  "LK",
  "MH",
  "MM",
  "MN",
  "MV",
  "MY",
  "NP",
  "NR",
  "NZ",
  "PG",
  "PH",
  "PK",
  "PW",
  "SB",
  "SG",
  "TH",
  "TJ",
  "TL",
  "TM",
  "TO",
  "TV",
  "TW",
  "UZ",
  "VN",
  "VU",
  "WS",
]);

function classifyMacroRegion(countryCode: string): MacroRegion {
  if (EUROPE_CODES.has(countryCode)) return "europe";
  if (AMERICAS_CODES.has(countryCode)) return "americas";
  if (ASIA_PACIFIC_CODES.has(countryCode)) return "asia_pacific";
  return "mea";
}

const COUNTRY_NAME_OVERRIDES: Partial<Record<Lang, Record<string, string>>> = {
  lu: {
    LU: "Lëtzebuerg",
    FR: "Frankräich",
    DE: "Däitschland",
    BE: "Belsch",
    PT: "Portugal",
    XK: "Kosovo",
  },
  en: { XK: "Kosovo" },
  fr: { XK: "Kosovo" },
  de: { XK: "Kosovo" },
};

function localizedCountryName(
  code: string,
  fallbackEn: string,
  lang: Lang,
  displayNames: Intl.DisplayNames | null,
): string {
  const override = COUNTRY_NAME_OVERRIDES[lang]?.[code];
  if (override) return override;
  if (lang === "en") return fallbackEn;
  try {
    const intlName = displayNames?.of(code);
    if (intlName && intlName !== code) return intlName;
  } catch {
    // Fallback to English label
  }
  return fallbackEn;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "guidance",
    title: tr(lang, "Published bereavement guidance | Clarvia"),
    description: tr(
      lang,
      "Read bereavement guidance organised by country, with links to the official sources used.",
    ),
    translated: true,
  });
}

export default async function GuidanceHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  const intlLocale = lang === "lu" ? "fr" : lang;
  const displayNames =
    lang === "en"
      ? null
      : new Intl.DisplayNames([intlLocale], { type: "region" });

  const enGuides = publishedCorridorGuides("en");
  const countryMap = new Map<string, GuidanceCountryOption>();

  const items: GuidanceCardItem[] = enGuides.map((enGuide) => {
    const preferredTargetLang =
      (lang === "fr" || lang === "de") && enGuide.locales.includes(lang)
        ? lang
        : "en";
    const localizedGuide =
      preferredTargetLang !== "en"
        ? (getCorridorGuideBySlug(enGuide.slug, preferredTargetLang) ?? enGuide)
        : enGuide;

    const codLabel = localizedCountryName(
      enGuide.countryOfDeathCode,
      enGuide.countryOfDeath,
      lang,
      displayNames,
    );
    const citLabel = localizedCountryName(
      enGuide.citizenshipCountryCode,
      enGuide.citizenshipCountry,
      lang,
      displayNames,
    );

    const macroRegion = classifyMacroRegion(enGuide.countryOfDeathCode);

    if (
      enGuide.countryOfDeathCode === enGuide.citizenshipCountryCode &&
      !countryMap.has(enGuide.countryOfDeathCode)
    ) {
      countryMap.set(enGuide.countryOfDeathCode, {
        code: enGuide.countryOfDeathCode,
        label: codLabel,
        labelEn: enGuide.countryOfDeath,
        macroRegion,
      });
    }

    const localCode = enGuide.locales.find((c) => c !== "en");
    const localLabel = localCode
      ? (GUIDE_LOCALE_LABELS[localCode as GuideLocale] ??
        localCode.toUpperCase())
      : null;

    return {
      slug: enGuide.slug,
      href: corridorGuidePath(enGuide.slug, preferredTargetLang),
      targetLang: preferredTargetLang,
      localLabel,
      category: enGuide.category,
      macroRegion,
      countryOfDeath: codLabel,
      countryOfDeathEn: enGuide.countryOfDeath,
      countryOfDeathCode: enGuide.countryOfDeathCode,
      citizenshipCountry: citLabel,
      citizenshipCountryEn: enGuide.citizenshipCountry,
      citizenshipCountryCode: enGuide.citizenshipCountryCode,
      title: localizedGuide.title,
      cardSummary: localizedGuide.cardSummary,
    };
  });

  const countries = Array.from(countryMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label, intlLocale),
  );

  return (
    <>
      <Header lang={lang} />
      <main
        id="main-content"
        className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {tr(lang, "Published bereavement guidance")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed mb-8">
          {tr(
            lang,
            "Browse practical guides prepared from reviewed information, with links to the official sources used. You can also ask Clarvia about your own situation.",
          )}
        </p>

        <GuidanceBrowser lang={lang} countries={countries} items={items} />

        <p className="mt-10">
          <Link
            href={siteAskHref(lang)}
            className="text-calm-blue-700 font-medium underline"
          >
            {tr(lang, "Ask Clarvia")}
          </Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}

export const dynamicParams = false;
export { generateSiteLangStaticParams as generateStaticParams } from "@/lib/i18n";
