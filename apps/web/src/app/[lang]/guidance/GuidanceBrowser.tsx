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

const QUICK_COUNTRY_CODES = ["LU", "FR", "DE", "BE", "PT", "GB", "US", "ES"] as const;

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
        "After a death (Bereavement)",
        "Après un décès (Succession & démarches)",
        "Nach einem Todesfall",
        "No engem Doudesfall",
      );
    case "terminal-illness-admin":
      return l(
        lang,
        "Serious or terminal illness",
        "Maladie grave ou en phase terminale",
        "Schwere Krankheit & Vorsorge",
        "Schwéier Krankheet & Virsuerg",
      );
    case "cross-border-bereavement":
      return l(
        lang,
        "Cross-border bereavement",
        "Décès transfrontalier",
        "Grenzüberschreitender Todesfall",
        "Grenzüberschreidenden Doudesfall",
      );
    case "cross-border-terminal-illness":
      return l(
        lang,
        "Cross-border terminal illness",
        "Maladie grave transfrontalière",
        "Grenzüberschreitende Vorsorge",
        "Grenzüberschreidend Virsuerg",
      );
  }
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
            {item.localLabel ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-calm-blue-700 border border-calm-blue-200">
                EN + {item.localLabel}
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

  const quickCountries = useMemo(
    () =>
      QUICK_COUNTRY_CODES.map((code) =>
        countries.find((c) => c.code === code),
      ).filter((c): c is GuidanceCountryOption => Boolean(c)),
    [countries],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

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

      const haystack = `${item.countryOfDeath} ${item.countryOfDeathEn} ${item.countryOfDeathCode} ${item.citizenshipCountry} ${item.citizenshipCountryEn} ${item.citizenshipCountryCode} ${item.title} ${item.cardSummary}`.toLowerCase();
      const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [items, normalizedQuery, selectedCountryCode, situation]);

  const singleCountryItems = useMemo(
    () =>
      filteredItems
        .filter((i) => i.countryOfDeathCode === i.citizenshipCountryCode)
        .sort((a, b) => {
          const cmp = a.countryOfDeath.localeCompare(b.countryOfDeath, lang);
          if (cmp !== 0) return cmp;
          return a.category === "domestic-bereavement" ? -1 : 1;
        }),
    [filteredItems, lang],
  );

  const crossBorderItems = useMemo(
    () =>
      filteredItems.filter(
        (i) => i.countryOfDeathCode !== i.citizenshipCountryCode,
      ),
    [filteredItems],
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
                  `All countries (${countries.length} jurisdictions)`,
                  `Tous les pays (${countries.length} juridictions)`,
                  `Alle Länder (${countries.length} Rechtsordnungen)`,
                  `All Länner (${countries.length} Jurisdiktiounen)`,
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
                "Search by country, corridor, or topic",
                "Rechercher par pays, corridor ou sujet",
                "Suche nach Land, Korridor oder Thema",
                "Sich no Land, Korridor oder Thema",
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
                  "e.g. Luxembourg, France, UK Spain, probate, pension…",
                  "ex. Luxembourg, France, Maroc, succession, pension…",
                  "z. B. Luxemburg, Deutschland, Nachlass, Rente…",
                  "z. B. Lëtzebuerg, Frankräich, Ierfschaft, Pensioun…",
                )}
                className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Quick-Jump Country Chips */}
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
                    "All checklists",
                    "Tous les guides",
                    "Alle Checklisten",
                    "All Checklëschten",
                  ),
                },
                {
                  id: "bereavement",
                  label: l(
                    lang,
                    "After a death (Bereavement)",
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
                    "Cross-border corridors only",
                    "Corridors transfrontaliers",
                    "Nur grenzüberschreitende Korridore",
                    "Nëmme grenzüberschreidend Korridoren",
                  ),
                },
              ] as const
            ).map((tab) => {
              const active = situation === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
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
                `${filteredItems.length} published checklist${filteredItems.length === 1 ? "" : "s"}`,
                `${filteredItems.length} guide${filteredItems.length === 1 ? "" : "s"} publié${filteredItems.length === 1 ? "" : "s"}`,
                `${filteredItems.length} veröffentlichte Checkliste${filteredItems.length === 1 ? "" : "n"}`,
                `${filteredItems.length} publizéiert Checklëscht${filteredItems.length === 1 ? "" : "en"}`,
              )}
            </span>
          </div>

          {singleCountryItems.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-3">
                {l(
                  lang,
                  `National Administrative Checklists for ${selectedCountry.label}`,
                  `Guides administratifs nationaux — ${selectedCountry.label}`,
                  `Nationale Behörden-Checklisten — ${selectedCountry.label}`,
                  `National administrativ Checklëschten — ${selectedCountry.label}`,
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
                `Cross-Border Corridors Involving ${selectedCountry.label}`,
                `Corridors transfrontaliers impliquant ${selectedCountry.label}`,
                `Grenzüberschreitende Korridore mit Bezug zu ${selectedCountry.label}`,
                `Grenzüberschreidend Korridore mat Bezug op ${selectedCountry.label}`,
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
                    `Need cross-border guidance connecting ${selectedCountry.label} with another country (repatriation, foreign death certificate recognition, or cross-border estate settlement)? Start with the ${selectedCountry.label} checklist above or ask Clarvia directly about your two-country situation.`,
                    `Vous avez besoin d'informations transfrontalières reliant ${selectedCountry.label} à un autre pays (rapatriement, reconnaissance d'acte de décès étranger ou succession internationale) ? Consultez le guide national ci-dessus ou posez votre question à Ask Clarvia.`,
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
                `Matching Checklists (${filteredItems.length})`,
                `Guides correspondants (${filteredItems.length})`,
                `Passende Checklisten (${filteredItems.length})`,
                `Passend Checklëschten (${filteredItems.length})`,
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
                      `Single-Country Checklists (${singleCountryItems.length})`,
                      `Guides nationaux par pays (${singleCountryItems.length})`,
                      `Nationale Länder-Checklisten (${singleCountryItems.length})`,
                      `National Länner-Checklëschten (${singleCountryItems.length})`,
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
                      `Cross-Border Corridors (${crossBorderItems.length})`,
                      `Corridors transfrontaliers (${crossBorderItems.length})`,
                      `Grenzüberschreitende Korridore (${crossBorderItems.length})`,
                      `Grenzüberschreidend Korridoren (${crossBorderItems.length})`,
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
                "Browse All 196 Jurisdictions & Cross-Border Corridors by Region",
                "Parcourir les 196 juridictions et corridors transfrontaliers par région",
                "Alle 196 Rechtsordnungen & grenzüberschreitenden Korridore nach Region",
                "All 196 Jurisdiktiounen & grenzüberschreidend Korridoren no Regioun",
              )}
            </h2>
            <p className="text-sm text-calm-blue-600 leading-relaxed">
              {l(
                lang,
                "Select a country above for instant access, or expand a region below to browse national hub checklists and bilateral cross-border corridors.",
                "Sélectionnez un pays ci-dessus pour un accès immédiat, ou ouvrez une région ci-dessous pour parcourir les guides nationaux et les corridors bilatéraux.",
                "Wählen Sie oben ein Land für den Direktzugriff oder klappen Sie unten eine Region auf, um nationale Checklisten und bilaterale Korridore zu durchsuchen.",
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
                        `${regionCountryCount} countries (${regionSingle.length} national hub checklists + ${regionCorridors.length} cross-border corridors)`,
                        `${regionCountryCount} pays (${regionSingle.length} guides nationaux + ${regionCorridors.length} corridors transfrontaliers)`,
                        `${regionCountryCount} Länder (${regionSingle.length} nationale Checklisten + ${regionCorridors.length} grenzüberschreitende Korridore)`,
                        `${regionCountryCount} Länner (${regionSingle.length} national Checklëschten + ${regionCorridors.length} grenzüberschreidend Korridoren)`,
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
                          `Cross-Border Corridors (${regionCorridors.length})`,
                          `Corridors transfrontaliers (${regionCorridors.length})`,
                          `Grenzüberschreitende Korridore (${regionCorridors.length})`,
                          `Grenzüberschreidend Korridoren (${regionCorridors.length})`,
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
