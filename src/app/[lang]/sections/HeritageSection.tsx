import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, HERITAGE_ITEMS } from "../data";

export default function HeritageSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-2" style={headlineStyle}>
        {l(lang, "More than paperwork", "Au-delà des démarches administratives", "Mehr als Papierkram")}
      </h2>
      <p className="text-lg text-calm-blue-500 text-center mb-10 font-medium">
        {l(lang,
          "A heritage folder to preserve what matters",
          "Un dossier de transmission pour préserver l'essentiel",
          "Ein Erinnerungsordner für das, was zählt"
        )}
      </p>

      <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto">
        <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
          {l(lang,
            "Bereavement is not only administrative. Families also need to preserve the memory, wishes, and important information of the person they have lost.",
            "Le deuil ne se résume pas aux formalités. Les familles ont aussi besoin de préserver la mémoire, les volontés et les informations importantes de la personne disparue.",
            "Ein Trauerfall ist nicht nur eine administrative Herausforderung. Familien möchten auch Erinnerungen, Wünsche und wichtige Informationen der verstorbenen Person bewahren."
          )}
        </p>
        <p className="text-base text-calm-blue-700 font-medium mb-4">
          {l(lang,
            "Clarvia is developing a dedicated heritage folder to help families organise:",
            "Clarvia développe un dossier de transmission dédié pour aider les familles à organiser :",
            "Clarvia entwickelt einen eigenen Erinnerungsordner, der Familien hilft, Folgendes zu ordnen:"
          )}
        </p>
        <ul className="space-y-2 mb-6">
          {HERITAGE_ITEMS.map((item, i) => (
            <li key={i} className="flex items-baseline gap-2.5 text-base text-calm-blue-600">
              <span className="text-calm-lilac-400 flex-shrink-0 text-sm leading-none">●</span>
              <span>{l(lang, item.en, item.fr, item.de)}</span>
            </li>
          ))}
        </ul>
        <p className="text-base text-calm-blue-700 font-medium leading-relaxed pt-4 border-t border-calm-blue-100 text-center italic">
          {l(lang,
            "The goal is both practical and human: to reduce confusion while giving families a dignified place to remember the person behind the paperwork.",
            "L'objectif est à la fois pratique et profondément humain : réduire la confusion tout en offrant aux familles un espace digne pour se souvenir de la personne derrière les documents.",
            "Das Ziel ist zugleich praktisch und menschlich: weniger Verwirrung - und ein würdevoller Ort, um an den Menschen hinter den Dokumenten zu erinnern."
          )}
        </p>
      </div>
    </section>
  );
}
