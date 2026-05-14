import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function PublicInterestSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-24 lg:mb-32">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
        {l(lang,
          "A public-interest project",
          "Un projet d'intérêt public",
          "Ein Projekt im öffentlichen Interesse"
        )}
      </h2>

      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto space-y-4">
        <p className="text-base text-calm-blue-600 leading-relaxed">
          {l(lang,
            "Clarvia is being built to make practical post-bereavement guidance easier to access in Luxembourg.",
            "Clarvia est développé pour rendre l'accompagnement pratique après un décès plus accessible au Luxembourg.",
            "Clarvia wird aufgebaut, um praktische Orientierung nach einem Todesfall in Luxemburg leichter zugänglich zu machen."
          )}
        </p>
        <p className="text-base text-calm-blue-600 leading-relaxed">
          {l(lang,
            "The project is free, multilingual, and designed for people who may not know the local system, speak the main administrative languages, have financial means, or have a strong personal network.",
            "Le projet est gratuit, multilingue et pensé pour les personnes qui ne connaissent pas forcément le système local, ne maîtrisent pas les principales langues administratives, disposent de moyens limités ou n'ont pas un réseau personnel solide.",
            "Das Projekt ist kostenlos, mehrsprachig und für Menschen gedacht, die das lokale System nicht kennen, die wichtigsten Verwaltungssprachen nicht sprechen, nur begrenzte finanzielle Mittel haben oder nicht auf ein starkes persönliches Netzwerk zurückgreifen können."
          )}
        </p>
        <p className="text-base text-calm-blue-700 font-medium leading-relaxed pt-4 border-t border-calm-blue-100">
          {l(lang,
            "Clarvia is not a substitute for public authorities or qualified professionals. It is a bridge: helping families understand official information, prepare better questions, and find the right support when they need it.",
            "Clarvia ne se substitue ni aux autorités publiques ni aux professionnels qualifiés. C'est un pont : pour aider les familles à comprendre les informations officielles, à mieux préparer leurs questions et à trouver le bon soutien lorsqu'elles en ont besoin.",
            "Clarvia ersetzt weder öffentliche Stellen noch qualifizierte Fachleute. Clarvia ist eine Brücke: Der Service hilft Familien, offizielle Informationen besser zu verstehen, gezieltere Fragen vorzubereiten und die passende Unterstützung zu finden, wenn sie gebraucht wird."
          )}
        </p>
      </div>
    </section>
  );
}
