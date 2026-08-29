import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, LANGUAGES, l, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import { UPDATES } from "./updates-data";
import { FEATURED_UPDATE_DATES, FEATURED_UPDATE_SLUGS } from "@/content/featured-updates";

const MORE_SERVICE_DATES = new Set(["2026-08-21", "2026-07-13", "2026-06-28"]);

function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "lu" ? "lb-LU" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "updates",
    title: l(
      lang,
      "Updates | Clarvia",
      "Actualités | Clarvia",
      "Aktuelles | Clarvia",
      "Neiegkeeten | Clarvia",
    ),
    description: l(
      lang,
      "Milestones and news from the Clarvia project.",
      "Étapes clés et actualités du projet Clarvia.",
      "Meilensteine und Neuigkeiten aus dem Clarvia-Projekt.",
      "Meilesteng an Neiegkeeten aus dem Clarvia-Projet.",
    ),
    translated: true,
  });
}

export default async function UpdatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";
  const featuredDates = new Set(Object.values(FEATURED_UPDATE_DATES));

  const featured = FEATURED_UPDATE_SLUGS.map((slug) => {
    const date = FEATURED_UPDATE_DATES[slug];
    const update = UPDATES.find((entry) => entry.date === date);
    return update ? { slug, update } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const more = UPDATES.filter(
    (update) => MORE_SERVICE_DATES.has(update.date) && !featuredDates.has(update.date),
  );
  const notes = UPDATES.filter(
    (update) => !featuredDates.has(update.date) && !MORE_SERVICE_DATES.has(update.date),
  );

  return (
    <>
      <Header lang={lang} />
      <main
        id="main-content"
        className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3"
          style={headlineStyle}
        >
          {l(lang, "Updates", "Actualités", "Aktuelles", "Neiegkeeten")}
        </h1>
        <p className="text-base text-calm-blue-500 mb-12">
          {l(
            lang,
            "Latest from Clarvia, with project notes kept in a compact archive.",
            "Étapes clés et actualités du projet Clarvia.",
            "Meilensteine und Neuigkeiten aus dem Clarvia-Projekt.",
            "Meilesteng an Neiegkeeten aus dem Clarvia-Projet.",
          )}
        </p>

        <section className="mb-14" aria-labelledby="latest-from-heading">
          <h2
            id="latest-from-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-6"
            style={headlineStyle}
          >
            {tr(lang, "Latest from Clarvia")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map(({ slug, update }) => (
              <Link
                key={slug}
                href={`/${lang}/updates/${slug}`}
                className="glass-panel p-5 hover:shadow-md transition-shadow"
              >
                <time dateTime={update.date} className="text-xs font-medium text-calm-blue-400">
                  {formatDate(update.date, lang)}
                </time>
                <span className="block mt-2 font-medium text-calm-blue-800 leading-snug">
                  {update.headline[lang] || update.headline.en}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-14" aria-labelledby="more-updates-heading">
          <h2
            id="more-updates-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={headlineStyle}
          >
            {tr(lang, "More service and community updates")}
          </h2>
          <ul className="space-y-3">
            {more.map((update) => (
              <li
                key={`${update.date}-${update.headline.en}`}
                className="text-base text-calm-blue-700"
              >
                <time dateTime={update.date} className="text-sm text-calm-blue-400 mr-2">
                  {formatDate(update.date, lang)}
                </time>
                {update.headline[lang] || update.headline.en}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="project-notes-heading">
          <h2
            id="project-notes-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={headlineStyle}
          >
            {tr(lang, "Project notes")}
          </h2>
          <ul className="space-y-2">
            {notes.map((update, index) => (
              <li key={`${update.date}-${index}`} className="text-sm text-calm-blue-600">
                <time dateTime={update.date} className="text-calm-blue-400 mr-2 tabular-nums">
                  {update.date}
                </time>
                {update.headline[lang] || update.headline.en}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
