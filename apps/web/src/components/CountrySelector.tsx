import { type Lang, l, tr } from "@/lib/i18n";
import { headlineStyle } from "@/app/[lang]/data";
import { GUIDANCE_COUNTRY, guidanceCountryLabel } from "@/content/guidance";

export default function CountrySelector({ lang, id }: { lang: Lang; id: string }) {
  return (
    <div className="max-w-xl mb-8">
      <label htmlFor={id} className="block text-sm font-semibold text-calm-blue-800 mb-2">
        {tr(lang, "Country")}
      </label>
      <select
        id={id}
        className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800"
        defaultValue={GUIDANCE_COUNTRY.code}
        aria-label={tr(lang, "Country")}
      >
        <option value={GUIDANCE_COUNTRY.code}>{guidanceCountryLabel(lang)}</option>
      </select>
    </div>
  );
}

export function GuideTrustBlock({ lang, lastReviewed }: { lang: Lang; lastReviewed: string }) {
  return (
    <div className="mt-10 p-5 rounded-xl bg-white/50 border border-calm-blue-100">
      <h2 className="text-base font-semibold text-calm-blue-800 mb-2" style={headlineStyle}>
        {tr(lang, "How this page was prepared")}
      </h2>
      <p className="text-sm text-calm-blue-600 leading-relaxed">
        {l(
          lang,
          `This page is based on Clarvia task data that passed the graph's publication gate. Last reviewed: ${lastReviewed}. Check the linked official source for the latest wording. Clarvia provides practical information and signposting, not professional advice.`,
          `Cette page repose sur des données de Clarvia ayant franchi toutes les étapes de validation du graphe. Dernière révision : ${lastReviewed}. Consultez la source officielle liée pour vérifier la formulation la plus récente. Clarvia fournit des informations pratiques et oriente vers les services compétents ; elle ne donne pas de conseils professionnels.`,
          `Diese Seite beruht auf Clarvia-Daten, die alle Freigabeschritte im Graphen durchlaufen haben. Zuletzt geprüft: ${lastReviewed}. Den aktuellen Wortlaut finden Sie in der verlinkten amtlichen Quelle. Clarvia bietet praktische Orientierung und verweist an zuständige Stellen, ersetzt aber keine fachliche Beratung.`,
          `Dës Säit baséiert op Donnéeë vu Clarvia, déi all d'Kontrollschrëtt am Graph duerchlaf hunn. Lescht Iwwerpréiwung: ${lastReviewed}. De geneeën aktuelle Wuertlaut fannt Dir an der verlinkter offizieller Quell. Clarvia bitt praktesch Orientéierung a verweist un déi zoustänneg Stellen, ersetzt awer keng professionell Berodung.`,
        )}
      </p>
    </div>
  );
}
