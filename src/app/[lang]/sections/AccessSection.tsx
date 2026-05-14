import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, AUDIENCES } from "../data";

export default function AccessSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
        {l(lang,
          "Free, multilingual, and easy to understand",
          "Gratuit, multilingue et facile à comprendre",
          "Kostenlos, mehrsprachig und leicht verständlich"
        )}
      </h2>
      <p className="text-base sm:text-lg text-calm-blue-600 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
        {l(lang,
          "Clarvia is being designed for families in Luxembourg in all their diversity.",
          "Clarvia est conçu pour les familles au Luxembourg, dans toute leur diversité.",
          "Clarvia wird für Familien in Luxemburg in ihrer ganzen Vielfalt entwickelt."
        )}
      </p>

      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6">
          {AUDIENCES.map((item, i) => (
            <li key={i} className="flex items-baseline gap-2.5 text-base text-calm-blue-600">
              <span className="text-calm-lilac-400 flex-shrink-0 text-sm leading-none">●</span>
              <span>{l(lang, item.en, item.fr, item.de)}</span>
            </li>
          ))}
        </ul>
        <p className="text-base text-calm-blue-700 font-medium leading-relaxed mb-4 pt-4 border-t border-calm-blue-100">
          {l(lang,
            "Our aim is to give every family a clearer path through the first administrative steps after a loss - not only those who already know where to look or whom to call.",
            "Notre objectif est d'offrir à chaque famille un parcours plus clair dans les premières démarches administratives après un décès - pas seulement à celles qui savent déjà où chercher ou qui appeler.",
            "Unser Ziel ist es, jeder Familie einen klareren Weg durch die ersten administrativen Schritte nach einem Todesfall zu geben - nicht nur jenen, die bereits wissen, wo sie suchen oder wen sie anrufen können."
          )}
        </p>

      </div>
    </section>
  );
}
