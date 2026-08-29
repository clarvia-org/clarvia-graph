import Link from "next/link";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";
import { UPDATES } from "../updates/updates-data";
import { FEATURED_UPDATE_DATES, FEATURED_UPDATE_SLUGS } from "@/content/featured-updates";

function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "lu" ? "lb-LU" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export default function LatestUpdatesSection({ lang }: { lang: Lang }) {
  const featured = FEATURED_UPDATE_SLUGS.flatMap((slug) => {
    const date = FEATURED_UPDATE_DATES[slug];
    const update = UPDATES.find((entry) => entry.date === date);
    return update ? [{ slug, update }] : [];
  });

  return (
    <section className="py-16">
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8" style={headlineStyle}>
        {l(lang, "Latest", "Dernières nouvelles", "Aktuelles", "Neist")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map(({ slug, update }) => (
          <Link
            key={slug}
            href={`/${lang}/updates/${slug}`}
            className="glass-panel p-5 hover:shadow-md transition-shadow"
          >
            <time
              dateTime={update.date}
              className="text-xs font-medium text-calm-blue-400 tabular-nums"
            >
              {formatDate(update.date, lang)}
            </time>
            <span className="block mt-2 text-base text-calm-blue-800 font-medium leading-snug">
              {update.headline[lang] || update.headline.en}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href={`/${lang}/updates`}
        className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-calm-blue-600 hover:text-calm-blue-800 transition-colors group"
      >
        {l(
          lang,
          "View all updates",
          "Voir toutes les actualités",
          "Alle Neuigkeiten anzeigen",
          "All Neiegkeeten uweisen",
        )}
        <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
          &rarr;
        </span>
      </Link>
    </section>
  );
}
