import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, PREPARATION_DONE, NEXT_PHASE } from "../data";

export default function StageSection({ lang }: { lang: Lang }) {
  return (
    <>
      {/* ═══ Current Stage ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Newly founded, carefully prepared", "Une association récemment fondée, un projet soigneusement préparé", "Neu gegründet, sorgfältig vorbereitet", "Nei gegrënnt, suergfälteg virbereet")}
        </h2>

        <div className="glass-panel p-8 sm:p-10 max-w-2xl mx-auto">
          <p className="text-base text-calm-blue-600 leading-relaxed mb-2">
            {l(lang, "Clarvia ASBL was founded in Luxembourg in May 2026.", "Clarvia ASBL a été fondée au Luxembourg en mai 2026.", "Clarvia ASBL wurde im Mai 2026 in Luxemburg gegründet.", "Clarvia ASBL gouf am Mee 2026 zu Lëtzebuerg gegrënnt.")}
          </p>
          <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
            {l(lang, "The association is new, but the project has been carefully prepared. During this period, the founders have worked on:", "L'association est nouvelle, mais le projet a été préparé avec soin. Durant cette période, les fondateurs ont travaillé sur :", "Der Verein ist neu, doch das Projekt wurde sorgfältig vorbereitet. In dieser Zeit haben die Gründerinnen und Gründer gearbeitet an:", "D'Associatioun ass nei, mee de Projet gouf suergfälteg virbereet. An där Zäit hunn d'Grënner geschafft un:")}
          </p>

          <div className="space-y-3 mb-6">
            {PREPARATION_DONE.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-calm-lilac-500 border-2 border-calm-lilac-500 text-white">✓</div>
                <p className="text-base text-calm-blue-600 pt-0.5">{l(lang, item.en, item.fr, item.de)}</p>
              </div>
            ))}
          </div>

          <p className="text-base text-calm-blue-700 font-medium leading-relaxed pt-4 border-t border-calm-blue-100">
            {l(lang, "The next phase is a focused build and validation project.", "La prochaine étape est une phase ciblée de développement et de validation.", "Die nächste Phase ist ein fokussierter Aufbau- und Validierungsprozess.", "Déi nächst Phas ass e cibléierten Opbau- a Validéierungsprojet.")}
          </p>
        </div>
      </section>

      {/* ═══ Next Phase ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Six months to build, validate, and prepare the service", "Six mois pour développer, valider et préparer le service", "Sechs Monate, um den Service aufzubauen, zu validieren und vorzubereiten", "Sechs Méint, fir de Service opzebauen, ze validéieren an ze preparéieren")}
        </h2>

        <div className="glass-panel p-8 sm:p-10 max-w-2xl mx-auto">
          <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
            {l(lang, "Clarvia's next phase is expected to take approximately six months. During this phase, we aim to:", "La prochaine phase de Clarvia devrait durer environ six mois. Durant cette période, nous souhaitons :", "Clarvias nächste Phase wird voraussichtlich rund sechs Monate dauern. In dieser Zeit möchten wir:", "Déi nächst Phas vu Clarvia soll ongeféier sechs Méint daueren. An där Zäit wëlle mir:")}
          </p>

          <div className="space-y-3 mb-6">
            {NEXT_PHASE.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-white border-2 border-calm-blue-200 text-calm-blue-300" />
                <p className="text-base text-calm-blue-600 pt-0.5">{l(lang, item.en, item.fr, item.de)}</p>
              </div>
            ))}
          </div>

          <p className="text-base text-calm-blue-700 font-medium leading-relaxed mb-6 pt-4 border-t border-calm-blue-100">
            {l(lang, "By the end of this phase, Clarvia aims to have a first validated Luxembourg checklist, multilingual plain-language content, a working digital prototype, a privacy-conscious heritage folder concept, and feedback from families and relevant professionals.", "À l'issue de cette phase, Clarvia vise à disposer d'une première checklist luxembourgeoise validée, de contenus multilingues rédigés en langage clair, d'un prototype numérique fonctionnel, d'un concept de dossier de transmission respectueux de la vie privée, ainsi que de retours de familles et de professionnels concernés.", "Am Ende dieser Phase soll Clarvia über eine erste validierte Luxemburg-Checkliste, mehrsprachige Inhalte in klarer Sprache, einen funktionsfähigen digitalen Prototyp, ein datenschutzbewusstes Konzept für den Erinnerungsordner sowie Feedback von Familien und relevanten Fachleuten verfügen.", "Um Enn vun där Phas wëll Clarvia eng éischt validéiert Lëtzebuerg-Checklëscht, méisproocheg Inhalter a kloerer Sprooch, e funktionéierende digitale Prototyp, e Konzept fir en Erënnerungsdossier mat Respekt fir d'Privatsphär an Feedback vu Familljen a relevante Fachleit hunn.")}
          </p>

          <p className="text-sm text-calm-blue-500 leading-relaxed pt-4 border-t border-calm-blue-100">
            {l(lang, "This work requires dedicated capacity, either through an employee, a specialised third party, or a combination of both.", "Ce travail nécessite une capacité dédiée, que ce soit par l'intermédiaire d'un salarié, d'un prestataire spécialisé ou d'une combinaison des deux.", "Diese Arbeit erfordert gezielte Kapazitäten - entweder durch eine angestellte Fachkraft, einen spezialisierten externen Partner oder eine Kombination aus beidem.", "Dës Aarbecht erfuerdert gezielt Kapazitéit – entweder duerch eng Mataarbechterin oder e Mataarbechter, eng spezialiséiert extern Partei oder eng Kombinatioun dovun.")}
          </p>
        </div>
      </section>
    </>
  );
}
