"use client";

import { useState } from "react";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "@/app/[lang]/data";

function detectLang(pathname: string): Lang {
  if (pathname.startsWith("/fr")) return "fr";
  if (pathname.startsWith("/de")) return "de";
  return "en";
}

export default function NotFound() {
  const [lang] = useState<Lang>(() =>
    typeof window !== "undefined" ? detectLang(window.location.pathname) : "en"
  );

  return (
    <>
      <header
        aria-label={l(lang, "Site header", "En-tête du site", "Seitenkopf")}
        className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative"
      >
        <Link
          href={`/${lang}`}
          aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia Startseite")}
          className="block"
        >
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <nav
          aria-label={l(lang, "Language switcher", "Sélecteur de langue", "Sprachauswahl")}
          className="flex items-center gap-2"
        >
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={`/${code}`}
              aria-label={l(lang, `Switch to ${code.toUpperCase()}`, `Passer en ${code.toUpperCase()}`, `Zu ${code.toUpperCase()} wechseln`)}
              aria-current={lang === code ? "page" : undefined}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                lang === code
                  ? "bg-white text-calm-blue-800 shadow-sm border border-calm-blue-200"
                  : "text-calm-blue-500 hover:bg-white/40"
              }`}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center relative z-10">
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {l(lang, "Page not found", "Page introuvable", "Seite nicht gefunden")}
        </h1>
        <p className="text-base sm:text-lg text-calm-blue-600 leading-relaxed mb-10">
          {l(lang,
            "The page you're looking for doesn't exist or has been moved.",
            "La page que vous recherchez n'existe pas ou a été déplacée.",
            "Die gesuchte Seite existiert nicht oder wurde verschoben."
          )}
        </p>
        <Link
          href={`/${lang}`}
          className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
        >
          {l(lang, "Go to homepage", "Retour à l'accueil", "Zur Startseite")}
        </Link>
      </main>
    </>
  );
}
