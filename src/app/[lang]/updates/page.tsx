"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";
import { UPDATES } from "./updates-data";
import FooterSection from "../sections/FooterSection";

function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
}

export default function UpdatesPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

  return (
    <>
      {/* ═══ Header (matches other pages) ═══ */}
      <header className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative">
        <Link href={`/${lang}`} className="block">
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={`/${code}/updates`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                lang === code
                  ? "bg-white text-calm-blue-800 shadow-sm border border-calm-blue-200"
                  : "text-calm-blue-500 hover:bg-white/40"
              }`}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </div>
      </header>

      <main className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-16 relative z-10">

        {/* ── Page title ── */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3"
          style={headlineStyle}
        >
          {l(lang, "Updates", "Actualités", "Aktuelles")}
        </h1>
        <p className="text-base text-calm-blue-500 mb-12">
          {l(lang,
            "Milestones and news from the Clarvia project.",
            "Étapes clés et actualités du projet Clarvia.",
            "Meilensteine und Neuigkeiten aus dem Clarvia-Projekt."
          )}
        </p>

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
                  {update.headline[lang]}
                </h2>
                {update.logo && (
                  <img
                    src={update.logo}
                    alt=""
                    className="h-7 w-auto flex-shrink-0 mt-0.5 opacity-70"
                  />
                )}
              </div>

              {/* Body */}
              {update.body && (
                <p className="text-sm sm:text-base text-calm-blue-600 leading-relaxed">
                  {update.body[lang]}
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
            {l(lang, "Back to home", "Retour à l'accueil", "Zurück zur Startseite")}
          </Link>
        </div>

      </main>

      <FooterSection lang={lang} />
    </>
  );
}
