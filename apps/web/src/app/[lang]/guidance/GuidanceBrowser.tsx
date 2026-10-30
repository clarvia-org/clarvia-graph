"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { siteAskHref } from "@/lib/ask-entry";
import { type Lang, l, tr } from "@/lib/i18n";
import { headlineStyle } from "../data";

export type MacroRegion = "europe" | "americas" | "asia_pacific" | "mea";

export type GuidanceCardItem = {
  slug: string;
  href: string;
  targetLang: string;
  localLabel: string | null;
  category:
    | "domestic-bereavement"
    | "terminal-illness-admin"
    | "cross-border-bereavement"
    | "cross-border-terminal-illness";
  macroRegion: MacroRegion;
  countryOfDeath: string;
  countryOfDeathEn: string;
  countryOfDeathCode: string;
  citizenshipCountry: string;
  citizenshipCountryEn: string;
  citizenshipCountryCode: string;
  title: string;
  cardSummary: string;
};

export type GuidanceCountryOption = {
  code: string;
  label: string;
  labelEn: string;
  macroRegion: MacroRegion;
};

type SituationFilter = "all" | "bereavement" | "terminal" | "cross_border";

const QUICK_COUNTRY_CODES_BY_LANG: Record<Lang, readonly string[]> = {
  en: ["US", "GB", "CA", "AU", "IN", "FR", "DE", "ES", "IT", "MX"],
  fr: ["FR", "CA", "US", "GB", "DE", "ES", "IT", "AU", "IN", "MX"],
  de: ["DE", "US", "GB", "FR", "ES", "IT", "CA", "AU", "IN", "MX"],
  lu: ["LU", "FR", "DE", "GB", "US", "ES", "IT", "CA", "AU", "IN"],
};

export const COUNTRY_SEARCH_ALIASES: Record<string, string> = {
  AE: "uae u.a.e. united arab emirates dubai abu dhabi emirats arabes unis vereinigte arabische emirate",
  AT: "austria autriche osterreich",
  BE: "belgium belgique belgien belsch",
  CH: "switzerland suisse schweiz confederation helvetique",
  CI: "cote d'ivoire cote divoire ivory coast elfenbeinkuste",
  CD: "drc dr congo democratic republic of the congo congo-kinshasa rdc",
  CG: "republic of the congo congo-brazzaville",
  CV: "cape verde cabo verde cap-vert kap verde",
  CZ: "czechia czech republic tchequie tschechien",
  DE: "germany deutschland allemagne daitschland",
  DK: "denmark danemark",
  ES: "spain espagne spanien spuenien",
  FR: "france frankreich frankraich",
  GB: "uk u.k. united kingdom great britain britain england scotland wales northern ireland royaume-uni grande-bretagne angleterre grossbritannien",
  GR: "greece grece griechenland",
  IT: "italy italie italien",
  KP: "north korea dprk coree du nord nordkorea",
  KR: "south korea rok republic of korea coree du sud sudkorea",
  LU: "luxembourg luxemburg letzebuerg",
  MA: "morocco maroc marokko",
  MK: "north macedonia macedonia macedoine du nord nordmazedonien",
  MM: "myanmar burma birmanie",
  NL: "holland netherlands the netherlands pays-bas niederlande",
  NZ: "new zealand nz nouvelle-zelande neuseeland",
  PL: "poland pologne polen",
  PT: "portugal",
  RO: "romania roumanie rumanien",
  RU: "russia russian federation russie russland",
  SA: "saudi arabia ksa arabie saoudite saudi-arabien",
  SE: "sweden suede schweden",
  SZ: "eswatini swaziland",
  TL: "timor-leste east timor timor oriental osttimor",
  TR: "turkey turkiye turquie turkei",
  TW: "taiwan roc",
  UA: "ukraine",
  US: "usa u.s. u.s.a. united states united states of america america etats-unis etats unis vereinigte staaten amerika",
  VN: "vietnam viet nam",
  ZA: "south africa rsa afrique du sud sudafrika",
};

const DISPLAY_NAMES_CACHE: Record<string, string> = {};
const INTL_LOCALES = ["en", "fr", "de"] as const;
const INTL_FORMATTERS =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined"
    ? INTL_LOCALES.map(
        (loc) => new Intl.DisplayNames([loc], { type: "region" }),
      )
    : [];

export function foldSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .toLowerCase()
    .trim();
}

function getMultilingualCountryAliases(code: string): string {
  const cached = DISPLAY_NAMES_CACHE[code];
  if (cached !== undefined) return cached;
  const parts: string[] = [COUNTRY_SEARCH_ALIASES[code] ?? ""];
  for (const fmt of INTL_FORMATTERS) {
    try {
      const name = fmt.of(code);
      if (name && name !== code) parts.push(name);
    } catch {
      // Ignore unsupported region code
    }
  }
  const built = foldSearchText(parts.join(" "));
  DISPLAY_NAMES_CACHE[code] = built;
  return built;
}

function matchesTokenInText(tok: string, text: string): boolean {
  if (tok.length <= 3) {
    const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`).test(text);
  }
  return text.includes(tok);
}

export function matchesGuidanceSearch(
  item: GuidanceCardItem,
  rawQuery: string,
): boolean {
  const normalizedQuery = foldSearchText(rawQuery);
  if (!normalizedQuery) return true;

  const haystack = foldSearchText(
    `${item.countryOfDeath} ${item.countryOfDeathEn} ${item.countryOfDeathCode} ${getMultilingualCountryAliases(item.countryOfDeathCode)} ${item.citizenshipCountry} ${item.citizenshipCountryEn} ${item.citizenshipCountryCode} ${getMultilingualCountryAliases(item.citizenshipCountryCode)} ${item.title} ${item.cardSummary}`,
  );

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return tokens.every((tok) => matchesTokenInText(tok, haystack));
}

/**
 * Returns how many search tokens match the item's country names/codes/aliases directly
 * (so country hits rank ahead of incidental summary text hits).
 */
function countryMatchScore(item: GuidanceCardItem, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;
  const countryHaystack = foldSearchText(
    `${item.countryOfDeath} ${item.countryOfDeathEn} ${item.countryOfDeathCode} ${getMultilingualCountryAliases(item.countryOfDeathCode)} ${item.citizenshipCountry} ${item.citizenshipCountryEn} ${item.citizenshipCountryCode} ${getMultilingualCountryAliases(item.citizenshipCountryCode)}`,
  );
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const tok of tokens) {
    if (matchesTokenInText(tok, countryHaystack)) {
      score += 1;
    }
  }
  return score;
}

const MACRO_REGION_ORDER: MacroRegion[] = [
  "europe",
  "americas",
  "mea",
  "asia_pacific",
];

function macroRegionLabel(region: MacroRegion, lang: Lang): string {
  switch (region) {
    case "europe":
      return l(lang, "Europe", "Europe", "Europa", "Europa");
    case "americas":
      return l(
        lang,
        "Americas & Caribbean",
        "Amériques et Caraïbes",
        "Amerika & Karibik",
        "Amerika & Karibik",
      );
    case "mea":
      return l(
        lang,
        "Middle East & Africa",
        "Moyen-Orient et Afrique",
        "Naher Osten & Afrika",
        "Noen Osten & Afrika",
      );
    case "asia_pacific":
      return l(
        lang,
        "Asia-Pacific",
        "Asie-Pacifique",
        "Asien-Pazifik",
        "Asien-Pazifik",
      );
  }
}

function categoryBadgeLabel(
  category: GuidanceCardItem["category"],
  lang: Lang,
): string {
  switch (category) {
    case "domestic-bereavement":
      return l(
        lang,
        "After a death",
        "Après un décès",
        "Nach einem Todesfall",
        "No engem Doudesfall",
      );
    case "terminal-illness-admin":
      return l(
        lang,
        "Serious or terminal illness",
        "Maladie grave ou fin de vie",
        "Schwere Krankheit & Vorsorge",
        "Schwéier Krankheet & Virsuerg",
      );
    case "cross-border-bereavement":
      return l(
        lang,
        "Cross-border · After a death",
        "International · Après un décès",
        "Grenzüberschreitend · Todesfall",
        "Grenzüberschreidend · Doudesfall",
      );
    case "cross-border-terminal-illness":
      return l(
        lang,
        "Cross-border · Serious illness",
        "International · Maladie grave",
        "Grenzüberschreitend · Vorsorge",
        "Grenzüberschreidend · Virsuerg",
      );
  }
}

function languageBadgeInfo(
  item: GuidanceCardItem,
  siteLang: Lang,
): { text: string; isNativeMatch: boolean } | null {
  if (siteLang === "fr" || siteLang === "de" || siteLang === "lu") {
    if (item.targetLang === siteLang) {
      return {
        text:
          siteLang === "fr"
            ? "Français"
            : siteLang === "de"
              ? "Deutsch"
              : "Lëtzebuergesch",
        isNativeMatch: true,
      };
    }
    if (siteLang === "fr" || siteLang === "de") {
      return {
        text: l(siteLang, "English", "En anglais", "Auf Englisch", "Op Englesch"),
        isNativeMatch: false,
      };
    }
  }
  if (item.localLabel) {
    return {
      text: `EN + ${item.localLabel}`,
      isNativeMatch: false,
    };
  }
  return null;
}

function matchesSituation(
  item: GuidanceCardItem,
  situation: SituationFilter,
): boolean {
  if (situation === "all") return true;
  if (situation === "bereavement") {
    return (
      item.category === "domestic-bereavement" ||
      item.category === "cross-border-bereavement"
    );
  }
  if (situation === "terminal") {
    return (
      item.category === "terminal-illness-admin" ||
      item.category === "cross-border-terminal-illness"
    );
  }
  return item.countryOfDeathCode !== item.citizenshipCountryCode;
}

function GuideCard({ item, lang }: { item: GuidanceCardItem; lang: Lang }) {
  const isCrossBorder = item.countryOfDeathCode !== item.citizenshipCountryCode;
  const isTerminal =
    item.category === "terminal-illness-admin" ||
    item.category === "cross-border-terminal-illness";
  const langBadge = languageBadgeInfo(item, lang);

  return (
    <Link
      href={item.href}
      className="glass-panel p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500">
            {isCrossBorder
              ? `${item.countryOfDeath} (${item.countryOfDeathCode}) ↔ ${item.citizenshipCountry} (${item.citizenshipCountryCode})`
              : `${item.countryOfDeath} (${item.countryOfDeathCode})`}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                isTerminal
                  ? "bg-amber-50/80 text-amber-900 border-amber-200"
                  : "bg-calm-blue-50 text-calm-blue-700 border-calm-blue-200"
              }`}
            >
              {categoryBadgeLabel(item.category, lang)}
            </span>
            {langBadge ? (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  langBadge.isNativeMatch
                    ? "bg-emerald-50/90 text-emerald-800 border-emerald-200 font-semibold"
                    : "bg-white/80 text-calm-blue-600 border-calm-blue-200"
                }`}
              >
                {langBadge.text}
              </span>
            ) : null}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-calm-blue-800 mb-2 leading-snug">
          {item.title}
        </h3>
      </div>
      <p className="text-sm text-calm-blue-600 leading-relaxed">
        {item.cardSummary}
      </p>
    </Link>
  );
}

export default function GuidanceBrowser({
  lang,
  countries,
  items,
}: {
  lang: Lang;
  countries: GuidanceCountryOption[];
  items: GuidanceCardItem[];
}) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [situation, setSituation] = useState<SituationFilter>("all");

  const selectedCountry = useMemo(
    () =>
      selectedCountryCode === "all"
        ? undefined
        : countries.find((c) => c.code === selectedCountryCode),
    [countries, selectedCountryCode],
  );

  const quickCountries = useMemo(() => {
    const codes = QUICK_COUNTRY_CODES_BY_LANG[lang] ?? QUICK_COUNTRY_CODES_BY_LANG.en;
    return codes
      .map((code) => countries.find((c) => c.code === code))
      .filter((c): c is GuidanceCountryOption => Boolean(c));
  }, [countries, lang]);

  const normalizedQuery = foldSearchText(searchQuery);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!matchesSituation(item, situation)) return false;

      if (selectedCountryCode !== "all") {
        const matchesCountry =
          item.countryOfDeathCode === selectedCountryCode ||
          item.citizenshipCountryCode === selectedCountryCode;
        if (!matchesCountry) return false;
      }

      if (!normalizedQuery) return true;

      return matchesGuidanceSearch(item, normalizedQuery);
    });
  }, [items, normalizedQuery, selectedCountryCode, situation]);

  const singleCountryItems = useMemo(
    () =>
      filteredItems
        .filter((i) => i.countryOfDeathCode === i.citizenshipCountryCode)
        .sort((a, b) => {
          if (normalizedQuery) {
            const scoreDiff =
              countryMatchScore(b, normalizedQuery) -
              countryMatchScore(a, normalizedQuery);
            if (scoreDiff !== 0) return scoreDiff;
          }
          const aNative = a.targetLang === lang ? 0 : 1;
          const bNative = b.targetLang === lang ? 0 : 1;
          if (aNative !== bNative) return aNative - bNative;
          const cmp = a.countryOfDeath.localeCompare(b.countryOfDeath, lang);
          if (cmp !== 0) return cmp;
          return a.category === "domestic-bereavement" ? -1 : 1;
        }),
    [filteredItems, lang, normalizedQuery],
  );

  const crossBorderItems = useMemo(
    () =>
      filteredItems
        .filter((i) => i.countryOfDeathCode !== i.citizenshipCountryCode)
        .sort((a, b) => {
          const aNative = a.targetLang === lang ? 0 : 1;
          const bNative = b.targetLang === lang ? 0 : 1;
          if (aNative !== bNative) return aNative - bNative;

          if (normalizedQuery) {
            const scoreDiff =
              countryMatchScore(b, normalizedQuery) -
              countryMatchScore(a, normalizedQuery);
            if (scoreDiff !== 0) return scoreDiff;
          }

          if (selectedCountryCode !== "all") {
            const aOutbound = a.countryOfDeathCode === selectedCountryCode ? 0 : 1;
            const bOutbound = b.countryOfDeathCode === selectedCountryCode ? 0 : 1;
            if (aOutbound !== bOutbound) return aOutbound - bOutbound;
          }

          const aBereavement = a.category.includes("bereavement") ? 0 : 1;
          const bBereavement = b.category.includes("bereavement") ? 0 : 1;
          if (aBereavement !== bBereavement) return aBereavement - bBereavement;

          return a.countryOfDeath.localeCompare(b.countryOfDeath, lang);
        }),
    [filteredItems, lang, normalizedQuery, selectedCountryCode],
  );

  const hasActiveFilter =
    selectedCountryCode !== "all" ||
    normalizedQuery.length > 0 ||
    situation !== "all";

  return (
    <div className="space-y-10">
      {/* Unified Country Selector + Search + Situation Filter Panel */}
      <section
        aria-label={l(
          lang,
          "Find checklists by country or situation",
          "Rechercher un guide par pays ou par situation",
          "Checklisten nach Land oder Situation finden",
          "Checklëschten no Land oder Situatioun fannen",
        )}
        className="glass-panel p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Country Selector Dropdown (All 196 Sovereign Jurisdictions) */}
          <div>
            <label
              htmlFor="guidance-country"
              className="block text-sm font-semibold text-calm-blue-800 mb-2"
            >
              {tr(lang, "Country")}{" "}
              <span className="font-normal text-calm-blue-500">
                ({countries.length})
              </span>
            </label>
            <select
              id="guidance-country"
              value={selectedCountryCode}
              onChange={(event) => setSelectedCountryCode(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 focus:outline-none focus:ring-2 focus:ring-calm-blue-400"
            >
              <option value="all">
                {l(
                  lang,
                  `All countries (${countries.length})`,
                  `Tous les pays (${countries.length})`,
                  `Alle Länder (${countries.length})`,
                  `All Länner (${countries.length})`,
                )}
              </option>
              {countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label} ({item.code})
                </option>
              ))}
            </select>
          </div>

          {/* Instant Search Input */}
          <div>
            <label
              htmlFor="guidance-search"
              className="block text-sm font-semibold text-calm-blue-800 mb-2"
            >
              {l(
                lang,
                "Search by country or topic",
                "Rechercher par pays ou par sujet",
                "Suche nach Land oder Thema",
                "Sich no Land oder Thema",
              )}
            </label>
            <div className="relative">
              <input
                id="guidance-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={l(
                  lang,
                  "e.g. United States, UK Spain, probate, pension…",
                  "ex. France, Maroc, Royaume-Uni, succession, pension…",
                  "z. B. Deutschland, Österreich, Nachlass, Rente…",
                  "z. B. Lëtzebuerg, Frankräich, Ierfschaft, Pensioun…",
                )}
                className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Quick-Jump Country Chips (Major Global Jurisdictions) */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-calm-blue-500 mr-1">
            {l(
              lang,
              "Quick select:",
              "Accès rapide :",
              "Schnellauswahl:",
              "Schnellauswiel:",
            )}
          </span>
          {quickCountries.map((c) => {
            const active = selectedCountryCode === c.code;
            return (
              <button
                key={c.code}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setSelectedCountryCode(active ? "all" : c.code)
                }
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-calm-blue-700 text-white border-calm-blue-700"
                    : "bg-white/80 text-calm-blue-700 border-calm-blue-200 hover:bg-calm-blue-50"
                }`}
              >
                {c.label} ({c.code})
              </button>
            );
          })}
        </div>

        {/* Situation Filter Pills + Reset */}
        <div className="mt-5 pt-4 border-t border-calm-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={l(
              lang,
              "Filter by situation",
              "Filtrer par situation",
              "Nach Situation filtern",
              "No Situatioun filteren",
            )}
          >
            {(
              [
                {
                  id: "all",
                  label: l(
                    lang,
                    "All guides",
                    "Tous les guides",
                    "Alle Leitfäden",
                    "All Guiden",
                  ),
                },
                {
                  id: "bereavement",
                  label: l(
                    lang,
                    "After a death",
                    "Après un décès",
                    "Nach einem Todesfall",
                    "No engem Doudesfall",
                  ),
                },
                {
                  id: "terminal",
                  label: l(
                    lang,
                    "Serious or terminal illness",
                    "Maladie grave & fin de vie",
                    "Schwere Krankheit & Vorsorge",
                    "Schwéier Krankheet & Virsuerg",
                  ),
                },
                {
                  id: "cross_border",
                  label: l(
                    lang,
                    "Cross-border (two countries)",
                    "International (deux pays)",
                    "Grenzüberschreitend (zwei Länder)",
                    "Grenzüberschreidend (zwee Länner)",
                  ),
                },
              ] as const
            ).map((tab) => {
              const active = situation === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSituation(tab.id)}
                  className={`text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-calm-blue-800 text-white border-calm-blue-800"
                      : "bg-white text-calm-blue-700 border-calm-blue-200 hover:bg-calm-blue-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilter ? (
            <button
              type="button"
              onClick={() => {
                setSelectedCountryCode("all");
                setSearchQuery("");
                setSituation("all");
              }}
              className="text-xs font-semibold text-calm-blue-700 underline hover:text-calm-blue-900"
            >
              {l(
                lang,
                "Reset filters",
                "Réinitialiser les filtres",
                "Filter zurücksetzen",
                "Filter zrécksetzen",
              )}
            </button>
          ) : null}
        </div>
      </section>

      {/* CASE 1: Specific Country Selected from Dropdown or Quick Chip */}
      {selectedCountry ? (
        <section aria-live="polite" className="space-y-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-calm-blue-100 pb-3">
            <h2
              className="text-2xl sm:text-3xl font-semibold text-calm-blue-800"
              style={headlineStyle}
            >
              {selectedCountry.label} ({selectedCountry.code})
            </h2>
            <span className="text-sm text-calm-blue-600">
              {l(
                lang,
                `${filteredItems.length} published guide${filteredItems.length === 1 ? "" : "s"}`,
                `${filteredItems.length} guide${filteredItems.length === 1 ? "" : "s"} publié${filteredItems.length === 1 ? "" : "s"}`,
                `${filteredItems.length} veröffentlichte Leitfäden`,
                `${filteredItems.length} publizéiert Guiden`,
              )}
            </span>
          </div>

          {singleCountryItems.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-3">
                {l(
                  lang,
                  `National Checklists for ${selectedCountry.label}`,
                  `Guides nationaux — ${selectedCountry.label}`,
                  `Nationale Checklisten — ${selectedCountry.label}`,
                  `National Checklëschten — ${selectedCountry.label}`,
                )}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {singleCountryItems.map((item) => (
                  <GuideCard key={item.slug} item={item} lang={lang} />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
              {l(
                lang,
                `Cross-Border Guides Involving ${selectedCountry.label}`,
                `Guides internationaux impliquant ${selectedCountry.label}`,
                `Grenzüberschreitende Leitfäden mit Bezug zu ${selectedCountry.label}`,
                `Grenzüberschreidend Guide mat Bezug op ${selectedCountry.label}`,
              )}
            </h3>
            {crossBorderItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
                {crossBorderItems.map((item) => (
                  <GuideCard key={item.slug} item={item} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-6">
                <p className="text-sm text-calm-blue-700 leading-relaxed mb-3">
                  {l(
                    lang,
                    `Need cross-border guidance connecting ${selectedCountry.label} with another country (repatriation, foreign death certificate recognition, or international estate settlement)? Start with the ${selectedCountry.label} checklist above or ask Clarvia directly about your two-country situation.`,
                    `Vous avez besoin d'informations internationales reliant ${selectedCountry.label} à un autre pays (rapatriement, reconnaissance d'acte de décès étranger ou succession internationale) ? Consultez le guide national ci-dessus ou posez votre question à Ask Clarvia.`,
                    `Benötigen Sie grenzüberschreitende Orientierung zwischen ${selectedCountry.label} und einem anderen Staat (Überführung, Anerkennung ausländischer Sterbeurkunden oder internationaler Nachlass)? Nutzen Sie die obige nationale Checkliste oder wenden Sie sich direkt an Ask Clarvia.`,
                    `Braucht Dir grenzüberschreidend Orientéierung tëscht ${selectedCountry.label} an engem anere Land? Kuckt d'national Checklëscht hei uewen oder stellt Är Fro direkt un Ask Clarvia.`,
                  )}
                </p>
                <Link
                  href={siteAskHref(lang)}
                  className="text-sm font-semibold text-calm-blue-700 underline hover:text-calm-blue-900"
                >
                  {tr(lang, "Ask Clarvia")} →
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : normalizedQuery.length > 0 || situation !== "all" ? (
        /* CASE 2: Search Query or Situation Tab Active across All Countries */
        <section aria-live="polite" className="space-y-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-calm-blue-100 pb-3">
            <h2
              className="text-2xl font-semibold text-calm-blue-800"
              style={headlineStyle}
            >
              {l(
                lang,
                `Matching Guides (${filteredItems.length})`,
                `Guides correspondants (${filteredItems.length})`,
                `Passende Leitfäden (${filteredItems.length})`,
                `Passend Guiden (${filteredItems.length})`,
              )}
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="glass-panel p-6 sm:p-8">
              <p className="text-base text-calm-blue-700 leading-relaxed mb-4">
                {l(
                  lang,
                  "No pre-published checklist matched that exact filter. You can reset the filter above or ask Clarvia directly about your specific country or cross-border situation.",
                  "Aucun guide pré-publié ne correspond exactement à cette recherche. Vous pouvez réinitialiser les filtres ou poser directement votre question à Ask Clarvia.",
                  "Keine veröffentlichte Checkliste entspricht genau diesem Filter. Setzen Sie den Filter zurück oder schildern Sie Ihre Situation direkt bei Ask Clarvia.",
                  "Keng publizéiert Checklëscht entsprécht genee dësem Filter. Setzt de Filter zréck oder stellt Är Fro direkt bei Ask Clarvia.",
                )}
              </p>
              <Link
                href={siteAskHref(lang)}
                className="text-calm-blue-700 font-semibold underline"
              >
                {tr(lang, "Ask Clarvia")} →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {singleCountryItems.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-calm-blue-800 mb-3">
                    {l(
                      lang,
                      `National Checklists (${singleCountryItems.length})`,
                      `Guides nationaux (${singleCountryItems.length})`,
                      `Nationale Checklisten (${singleCountryItems.length})`,
                      `National Checklëschten (${singleCountryItems.length})`,
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {singleCountryItems.map((item) => (
                      <GuideCard key={item.slug} item={item} lang={lang} />
                    ))}
                  </div>
                </div>
              ) : null}

              {crossBorderItems.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-calm-blue-800 mb-3">
                    {l(
                      lang,
                      `Cross-Border Guides (${crossBorderItems.length})`,
                      `Guides internationaux (${crossBorderItems.length})`,
                      `Grenzüberschreitende Leitfäden (${crossBorderItems.length})`,
                      `Grenzüberschreidend Guiden (${crossBorderItems.length})`,
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {crossBorderItems.map((item) => (
                      <GuideCard key={item.slug} item={item} lang={lang} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : (
        /* CASE 3: Default View — Clean Collapsible Regional Accordions (<details>) */
        <section
          aria-labelledby="regional-directory-heading"
          className="space-y-4"
        >
          <div className="mb-4">
            <h2
              id="regional-directory-heading"
              className="text-2xl font-semibold text-calm-blue-800 mb-1"
              style={headlineStyle}
            >
              {l(
                lang,
                "Browse All 196 Countries & Cross-Border Guides by Region",
                "Parcourir les 196 pays et guides internationaux par région",
                "Alle 196 Länder & grenzüberschreitenden Leitfäden nach Region",
                "All 196 Länner & grenzüberschreidend Guiden no Regioun",
              )}
            </h2>
            <p className="text-sm text-calm-blue-600 leading-relaxed">
              {l(
                lang,
                "Select a country above for instant access, or expand a region below to browse national checklists and two-country cross-border guides.",
                "Sélectionnez un pays ci-dessus pour un accès immédiat, ou ouvrez une région ci-dessous pour parcourir les guides nationaux et internationaux.",
                "Wählen Sie oben ein Land für den Direktzugriff oder klappen Sie unten eine Region auf, um nationale Checklisten und grenzüberschreitende Leitfäden zu durchsuchen.",
                "Wielt uewen e Land fir den direkten Zougrëff oder klappt ënnen eng Regioun op.",
              )}
            </p>
          </div>

          {MACRO_REGION_ORDER.map((region, idx) => {
            const regionSingle = singleCountryItems.filter(
              (i) => i.macroRegion === region,
            );
            const regionCorridors = crossBorderItems.filter(
              (i) => i.macroRegion === region,
            );
            const regionCountryCount = new Set(
              regionSingle.map((i) => i.countryOfDeathCode),
            ).size;
            const totalRegionGuides =
              regionSingle.length + regionCorridors.length;

            return (
              <details
                key={region}
                open={idx === 0}
                className="glass-panel group overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex flex-wrap items-center justify-between gap-3 hover:bg-calm-blue-50/40 transition-colors">
                  <div>
                    <h3
                      className="text-xl font-semibold text-calm-blue-800 inline"
                      style={headlineStyle}
                    >
                      {macroRegionLabel(region, lang)}
                    </h3>
                    <p className="text-xs sm:text-sm text-calm-blue-600 mt-0.5">
                      {l(
                        lang,
                        `${regionCountryCount} countries (${regionSingle.length} national checklists + ${regionCorridors.length} cross-border guides)`,
                        `${regionCountryCount} pays (${regionSingle.length} guides nationaux + ${regionCorridors.length} guides internationaux)`,
                        `${regionCountryCount} Länder (${regionSingle.length} nationale Checklisten + ${regionCorridors.length} grenzüberschreitende Leitfäden)`,
                        `${regionCountryCount} Länner (${regionSingle.length} national Checklëschten + ${regionCorridors.length} grenzüberschreidend Guiden)`,
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-calm-blue-50 text-calm-blue-700 border border-calm-blue-200">
                    {totalRegionGuides}{" "}
                    {l(lang, "guides", "guides", "Leitfäden", "Guiden")}
                  </span>
                </summary>

                <div className="px-6 pb-6 pt-2 border-t border-calm-blue-100 space-y-8">
                  <div>
                    <h4 className="text-base font-semibold text-calm-blue-800 mb-3">
                      {l(
                        lang,
                        `National Checklists (${regionSingle.length})`,
                        `Guides nationaux (${regionSingle.length})`,
                        `Nationale Checklisten (${regionSingle.length})`,
                        `National Checklëschten (${regionSingle.length})`,
                      )}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {regionSingle.map((item) => (
                        <GuideCard key={item.slug} item={item} lang={lang} />
                      ))}
                    </div>
                  </div>

                  {regionCorridors.length > 0 ? (
                    <div>
                      <h4 className="text-base font-semibold text-calm-blue-800 mb-3">
                        {l(
                          lang,
                          `Cross-Border Guides (${regionCorridors.length})`,
                          `Guides internationaux (${regionCorridors.length})`,
                          `Grenzüberschreitende Leitfäden (${regionCorridors.length})`,
                          `Grenzüberschreidend Guiden (${regionCorridors.length})`,
                        )}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {regionCorridors.map((item) => (
                          <GuideCard key={item.slug} item={item} lang={lang} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })}
        </section>
      )}
    </div>
  );
}
