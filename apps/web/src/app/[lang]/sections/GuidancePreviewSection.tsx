import Link from "next/link";
import { type Lang, tr } from "@/lib/i18n";
import { headlineStyle } from "../data";
import {
  GUIDANCE_COUNTRY,
  guidanceCountryLabel,
  guidesForLanguage,
  guidePath,
} from "@/content/guidance";

export default function GuidancePreviewSection({ lang }: { lang: Lang }) {
  const guides = guidesForLanguage(lang);
  return (
    <section className="mb-16" aria-labelledby="published-guidance-heading">
      <h2
        id="published-guidance-heading"
        className="text-2xl sm:text-3xl font-semibold text-center mb-4"
        style={headlineStyle}
      >
        {tr(lang, "Published guidance")}
      </h2>
      <p className="text-base text-calm-blue-600 text-center max-w-3xl mx-auto leading-relaxed mb-8">
        {tr(
          lang,
          "Ask Clarvia works worldwide. Published guides are organised by country. Select a country to read the reviewed pages for that place. If your situation involves another country or the facts do not match a guide, ask Clarvia instead.",
        )}
      </p>
      <div className="max-w-xl mx-auto mb-8">
        <label
          htmlFor="home-guidance-country"
          className="block text-sm font-semibold text-calm-blue-800 mb-2"
        >
          {tr(lang, "Country")}
        </label>
        <select
          id="home-guidance-country"
          className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800"
          defaultValue={GUIDANCE_COUNTRY.code}
          aria-label={tr(lang, "Country")}
        >
          <option value={GUIDANCE_COUNTRY.code}>{guidanceCountryLabel(lang)}</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={guidePath(lang, guide.slug)}
            className="glass-panel p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="text-base font-semibold text-calm-blue-800 mb-2">{guide.title}</h3>
            <p className="text-sm text-calm-blue-600 leading-relaxed">{guide.card}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
