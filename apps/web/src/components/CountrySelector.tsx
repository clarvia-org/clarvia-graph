import { type Lang, s1 } from "@/lib/i18n";
import { headlineStyle } from "@/app/[lang]/data";
import { GUIDANCE_COUNTRY } from "@/content/guidance";

export default function CountrySelector({
  id,
}: {
  lang: Lang;
  id: string;
}) {
  return (
    <div className="max-w-xl mb-8">
      <label htmlFor={id} className="block text-sm font-semibold text-calm-blue-800 mb-2">
        {s1("Country")}
      </label>
      <select
        id={id}
        className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800"
        defaultValue={GUIDANCE_COUNTRY.code}
        aria-label={s1("Country")}
      >
        <option value={GUIDANCE_COUNTRY.code}>{GUIDANCE_COUNTRY.label}</option>
      </select>
    </div>
  );
}

export function GuideTrustBlock({ lastReviewed }: { lastReviewed: string }) {
  return (
    <div className="mt-10 p-5 rounded-xl bg-white/50 border border-calm-blue-100">
      <h2 className="text-base font-semibold text-calm-blue-800 mb-2" style={headlineStyle}>
        {s1("How this page was prepared")}
      </h2>
      <p className="text-sm text-calm-blue-600 leading-relaxed">
        {s1(
          `This page is based on Clarvia task data that passed the graph's publication gate. Last reviewed: ${lastReviewed}. Check the linked official source for the latest wording. Clarvia provides practical information and signposting, not professional advice.`
        )}
      </p>
    </div>
  );
}
