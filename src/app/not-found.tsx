"use client";

import { useState } from "react";
import Link from "next/link";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "@/app/[lang]/data";
import Header from "@/components/Header";

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
      <Header lang={lang} />

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
