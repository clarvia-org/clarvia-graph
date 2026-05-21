import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function HeroSection({ lang }: { lang: Lang }) {
  return (
    <section className="text-center py-16 sm:py-24 animate-fadeIn">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-8 drop-shadow-sm" style={headlineStyle}>
        {l(lang, "Guiding families through what comes next", "Accompagner les familles dans les démarches qui suivent un décès", "Familien nach einem Todesfall durch die nächsten Schritte begleiten")}
      </h1>
      <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-8">
        {l(lang,
          "Clarvia is a Luxembourg non-profit building a free, multilingual bereavement service for families after the loss of a loved one. We help families understand what needs to be done, what may be urgent, which documents matter, and where to turn for qualified help - regardless of language, nationality, income, family situation, or personal network.",
          "Clarvia est une association sans but lucratif luxembourgeoise qui développe un service gratuit et multilingue pour accompagner les familles après la perte d'un proche. Nous aidons les familles à comprendre les démarches à entreprendre, les urgences éventuelles, les documents importants et les interlocuteurs qualifiés vers lesquels se tourner - quels que soient leur langue, leur nationalité, leurs moyens, leur situation familiale ou leur réseau personnel.",
          "Clarvia ist ein gemeinnütziger Verein in Luxemburg, der ein kostenloses, mehrsprachiges Unterstützungsangebot für Familien nach dem Verlust eines nahestehenden Menschen aufbaut. Wir helfen Angehörigen zu verstehen, was zu tun ist, was dringend sein kann, welche Dokumente wichtig sind und wo sie qualifizierte Unterstützung finden - unabhängig von Sprache, Nationalität, Einkommen, Familiensituation oder persönlichem Netzwerk."
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <a href="#experience" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
          {l(lang, "Share your experience", "Partager votre expérience", "Erfahrung teilen")}
        </a>
        <a href="#contact" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base">
          {l(lang, "Contact us", "Nous contacter", "Kontakt")}
        </a>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-full bg-calm-blue-100/50 border border-calm-blue-200/50 text-xs text-calm-blue-500 max-w-xl mx-auto leading-relaxed">
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-calm-blue-400"></span>
        {l(lang,
          "Clarvia is in its build and validation phase. We are not yet publicly launched as a full service.",
          "Clarvia est actuellement en phase de construction et de validation. Le service complet n'est pas encore ouvert au public.",
          "Clarvia befindet sich derzeit in der Aufbau- und Validierungsphase. Als vollständiges öffentliches Angebot sind wir noch nicht gestartet."
        )}
      </div>
    </section>
  );
}
