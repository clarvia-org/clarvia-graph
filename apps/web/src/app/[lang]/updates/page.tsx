import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { type Lang, l, LANGUAGES, hreflangLanguages } from "@/lib/i18n";
import Header from "@/components/Header";
import { headlineStyle } from "../data";
import { UPDATES } from "./updates-data";
import FooterSection from "../sections/FooterSection";
import VideoSection from "../sections/VideoSection";

const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Updates — Clarvia",
    description: "Milestones and news from the Clarvia project.",
  },
  fr: {
    title: "Actualités | Clarvia",
    description: "Étapes clés et actualités du projet Clarvia.",
  },
  de: {
    title: "Aktuelles | Clarvia",
    description: "Meilensteine und Neuigkeiten aus dem Clarvia-Projekt.",
  },
  lu: {
    title: "Neiegkeeten | Clarvia",
    description: "Meilesteng an Neiegkeeten aus dem Clarvia-Projet.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/updates`,
      languages: hreflangLanguages("updates"),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/updates`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
}

export default async function UpdatesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />

      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">

        {/* ── Page title ── */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3"
          style={headlineStyle}
        >
          {l(lang, "Updates", "Actualités", "Aktuelles", "Neiegkeeten")}
        </h1>
        <p className="text-base text-calm-blue-500 mb-12">
          {l(lang, "Milestones and news from the Clarvia project.", "Étapes clés et actualités du projet Clarvia.", "Meilensteine und Neuigkeiten aus dem Clarvia-Projekt.", "Meilesteng an Neiegkeeten aus dem Clarvia-Projet.")}
        </p>

        <VideoSection lang={lang} />

        {/* ── Timeline ── */}
        <div className="space-y-0">
          {UPDATES.map((update) => (
            <article
              key={update.date}
              className="relative pl-8 pb-10 border-l-2 border-calm-blue-100 last:border-l-0 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-calm-blue-300 border-2 border-white" />

              {/* Date badge */}
              <time
                dateTime={update.date}
                className="inline-block text-xs font-semibold text-calm-blue-500 bg-calm-blue-50 px-3 py-1 rounded-full mb-3 tracking-wide uppercase"
              >
                {formatDate(update.date, lang)}
              </time>

              {/* Headline + optional logo */}
              <div className="flex items-start gap-3 mb-2">
                <h2
                  className="text-xl font-semibold text-calm-blue-800 leading-snug"
                  style={{ fontFamily: headlineStyle.fontFamily }}
                >
                  {update.headline[lang] || update.headline.fr || update.headline.en}
                </h2>
                {update.logo && (
                  <Image
                    src={update.logo}
                    alt=""
                    width={120}
                    height={28}
                    className="h-7 w-auto flex-shrink-0 mt-0.5 opacity-70 object-contain"
                  />
                )}
              </div>

              {/* Body */}
              {update.body && (
                <p className="text-sm sm:text-base text-calm-blue-600 leading-relaxed whitespace-pre-line">
                  {update.body[lang] || update.body.fr || update.body.en}
                </p>
              )}
            </article>
          ))}
        </div>

        {/* ── Back link ── */}
        <div className="mt-12 pt-8 border-t border-calm-blue-100">
          <Link
            href={`/${lang}`}
            className="text-sm font-medium text-calm-blue-600 hover:text-calm-blue-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span aria-hidden="true">&larr;</span>
            {l(lang, "Back to home", "Retour à l'accueil", "Zurück zur Startseite", "Zréck op d'Startsäit")}
          </Link>
        </div>

      </main>

      <FooterSection lang={lang} />
    </>
  );
}
