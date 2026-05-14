import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function LuxembourgFocusSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-24 lg:mb-32">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
        {l(lang,
          "Starting in Luxembourg, built for real family situations",
          "Ancré au Luxembourg, pensé pour les réalités familiales d'aujourd'hui",
          "In Luxemburg gestartet, für echte Familiensituationen entwickelt"
        )}
      </h2>

      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto space-y-4">
        <p className="text-base text-calm-blue-600 leading-relaxed">
          {l(lang,
            "Clarvia begins with Luxembourg because this is where the association is founded, and where the first service will be built and validated.",
            "Clarvia commence au Luxembourg, car c'est ici que l'association a été fondée et que le premier service sera développé et validé.",
            "Clarvia beginnt in Luxemburg, weil der Verein hier gegründet wurde und der erste Service hier aufgebaut und validiert wird."
          )}
        </p>
        <p className="text-base text-calm-blue-600 leading-relaxed">
          {l(lang,
            "At the same time, many families in Luxembourg have lives, relatives, assets, responsibilities, and memories across borders. A practical service for Luxembourg therefore needs to recognise international realities from the beginning.",
            "Dans le même temps, de nombreuses familles au Luxembourg ont une vie, des proches, des biens, des responsabilités et des souvenirs qui dépassent les frontières. Un service réellement utile au Luxembourg doit donc tenir compte des réalités internationales dès le départ.",
            "Gleichzeitig haben viele Familien in Luxemburg ihr Leben, Angehörige, Vermögenswerte, Verantwortlichkeiten und Erinnerungen über Landesgrenzen hinweg. Ein praktisches Angebot für Luxemburg muss solche internationalen Realitäten daher von Anfang an mitdenken."
          )}
        </p>
        <p className="text-base text-calm-blue-700 font-medium leading-relaxed pt-4 border-t border-calm-blue-100">
          {l(lang,
            "Clarvia's first focus is Luxembourg. The structure is being designed carefully so that cross-border situations can be handled responsibly, and so that guidance for other European countries can be added in the future.",
            "La première priorité de Clarvia est le Luxembourg. La structure est conçue avec soin afin de pouvoir traiter les situations transfrontalières de manière responsable et, à terme, d'ajouter des informations pour d'autres pays européens.",
            "Clarvias erster Schwerpunkt liegt auf Luxemburg. Die Struktur wird sorgfältig so entwickelt, dass grenzüberschreitende Situationen verantwortungsvoll berücksichtigt werden können - und dass künftig auch Orientierung für weitere europäische Länder ergänzt werden kann."
          )}
        </p>
      </div>
    </section>
  );
}
