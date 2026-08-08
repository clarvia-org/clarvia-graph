import Link from "next/link";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";
import { UPDATES } from "../updates/updates-data";

function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

export default function LatestUpdatesSection({ lang }: { lang: Lang }) {
  const latest = UPDATES.slice(0, 3);

  return (
    <section className="py-16">
      <h2
        className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8"
        style={headlineStyle}
      >
        {l(lang, "Latest", "Dernières nouvelles", "Aktuelles", "Neist")}
      </h2>

      <div className="space-y-4">
        {latest.map((update) => (
          <Link
            key={update.date}
            href={`/${lang}/updates`}
            className="flex items-baseline gap-4 group py-3 px-4 -mx-4 rounded-xl hover:bg-white/40 transition-colors"
          >
            <time
              dateTime={update.date}
              className="text-xs font-medium text-calm-blue-400 whitespace-nowrap min-w-[90px] tabular-nums"
            >
              {formatDate(update.date, lang)}
            </time>
            <span className="text-base text-calm-blue-700 font-medium group-hover:text-calm-blue-900 transition-colors leading-snug">
              {update.headline[lang]}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href={`/${lang}/updates`}
        className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-calm-blue-600 hover:text-calm-blue-800 transition-colors group"
      >
        {l(lang, "View all updates", "Voir toutes les actualités", "Alle Neuigkeiten anzeigen", "All Neiegkeeten uweisen")}
        <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
      </Link>
    </section>
  );
}
