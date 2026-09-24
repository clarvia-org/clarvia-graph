"use client";

import { useState } from "react";
import Link from "next/link";
import { type Lang, l, tr } from "@/lib/i18n";
import { guidePath, type Guide } from "@/content/guidance";
import { headlineStyle } from "../data";

const COUNTRIES = [
  { code: "lu", label: { en: "Luxembourg", fr: "Luxembourg", de: "Luxemburg", lu: "Lëtzebuerg" } },
  { code: "fr", label: { en: "France", fr: "France", de: "Frankreich", lu: "Frankräich" }, issue: 344 },
  { code: "be", label: { en: "Belgium", fr: "Belgique", de: "Belgien", lu: "Belsch" }, issue: 345 },
  { code: "de", label: { en: "Germany", fr: "Allemagne", de: "Deutschland", lu: "Däitschland" }, issue: 346 },
  { code: "pt", label: { en: "Portugal", fr: "Portugal", de: "Portugal", lu: "Portugal" }, issue: 347 },
] as const;

type CountryCode = (typeof COUNTRIES)[number]["code"];

export default function GuidanceBrowser({ lang, guides }: { lang: Lang; guides: Guide[] }) {
  const [countryCode, setCountryCode] = useState<CountryCode>("lu");
  const country = COUNTRIES.find((item) => item.code === countryCode)!;

  return (
    <>
      <div className="max-w-xl mb-8">
        <label htmlFor="guidance-country" className="block text-sm font-semibold text-calm-blue-800 mb-2">
          {tr(lang, "Country")}
        </label>
        <select
          id="guidance-country"
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value as CountryCode)}
          className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800"
        >
          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>{item.label[lang]}</option>
          ))}
        </select>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-calm-blue-800 mb-5" style={headlineStyle}>
          {country.label[lang]}
        </h2>
        {country.code === "lu" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={guidePath(lang, guide.slug)}
                className="glass-panel p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">{guide.title}</h3>
                <p className="text-base text-calm-blue-600 leading-relaxed">{guide.card}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-8 max-w-2xl" aria-live="polite">
            <p className="text-base text-calm-blue-700 leading-relaxed mb-4">
              {l(
                lang,
                "Published guides for this country are in preparation. You can help build them as a Clarvia volunteer.",
                "Les guides pour ce pays sont en préparation. Vous pouvez contribuer à leur création en tant que bénévole de Clarvia.",
                "Die veröffentlichten Leitfäden für dieses Land sind in Vorbereitung. Als freiwillige Helferin oder freiwilliger Helfer können Sie bei Clarvia daran mitarbeiten.",
                "Déi publizéiert Guide fir dëst Land sinn an der Virbereedung. Als Benevole bei Clarvia kënnt Dir hëllefen, se auszeschaffen.",
              )}
            </p>
            <a
              href={`https://github.com/clarvia-org/clarvia-graph/issues/${country.issue}`}
              className="text-calm-blue-700 font-semibold underline underline-offset-2 hover:text-calm-blue-900"
            >
              {l(lang, "Help build these guides on GitHub →", "Contribuer aux guides sur GitHub →", "Bei den Leitfäden auf GitHub mithelfen →", "Op GitHub bei de Guide mathëllefen →")}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
