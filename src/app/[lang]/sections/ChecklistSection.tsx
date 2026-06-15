import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, CHECKLIST_TOPICS, FEATURES } from "../data";

export default function ChecklistSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
        {l(lang,
          "A free bereavement service for Luxembourg",
          "Un service gratuit d'accompagnement après décès pour le Luxembourg",
          "Ein kostenloses Unterstützungsangebot im Trauerfall für Luxemburg"
        )}
      </h2>
      <p className="text-base sm:text-lg text-calm-blue-600 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
        {l(lang,
          "Clarvia's first project is a free digital service that helps families understand the practical steps after a loss in Luxembourg.",
          "Le premier projet de Clarvia est un service numérique gratuit qui aide les familles à comprendre les démarches pratiques à effectuer après un décès au Luxembourg.",
          "Clarvias erstes Projekt ist ein kostenloser digitaler Service, der Familien hilft, die praktischen Schritte nach einem Todesfall in Luxemburg zu verstehen."
        )}
      </p>

      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto mb-8">
        <p className="text-base text-calm-blue-700 font-medium mb-4">
          {l(lang,
            "The service will guide families through relevant topics such as:",
            "Le service guidera les familles à travers des sujets essentiels tels que :",
            "Der Service wird Familien durch relevante Themen führen, darunter:"
          )}
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
          {CHECKLIST_TOPICS.map((item, i) => (
            <li key={i} className="flex items-baseline gap-2.5 text-base text-calm-blue-600">
              <span className="text-calm-lilac-400 flex-shrink-0 text-sm leading-none">●</span>
              <span>{l(lang, item.en, item.fr, item.de)}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-calm-blue-500 leading-relaxed pt-4 border-t border-calm-blue-100">
          {l(lang,
            "Clarvia will not replace legal, notarial, tax, medical, psychological, banking, financial, or succession advice. It will help families understand where to start, what to prepare, and when to seek professional support.",
            "Clarvia ne remplace pas les conseils juridiques, notariaux, fiscaux, médicaux, psychologiques, bancaires, financiers ou successoraux. Le service aide les familles à comprendre par où commencer, quoi préparer et à quel moment faire appel à des professionnels qualifiés.",
            "Clarvia ersetzt keine rechtliche, notarielle, steuerliche, medizinische, psychologische, bankfachliche, finanzielle oder nachlassbezogene Beratung. Der Service hilft Familien zu verstehen, wo sie beginnen können, was vorzubereiten ist und wann professionelle Unterstützung sinnvoll ist."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
        {FEATURES.map((f, i) => (
          <div key={i} className="glass-panel p-6 text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#2b3a67" }}>
              {l(lang, f.en_title, f.fr_title, f.de_title)}
            </h3>
            <p className="text-base text-calm-blue-600">{l(lang, f.en, f.fr, f.de)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
