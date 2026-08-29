"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { type Lang, l, LANGUAGES, tr } from "@/lib/i18n";

const LINK_CLASS =
  "text-sm font-semibold text-calm-blue-600 hover:text-calm-blue-800 transition-colors min-h-11 inline-flex items-center px-1";

function switchLangPath(pathname: string, nextLang: Lang): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLang}`;
  const rest = LANGUAGES.includes(parts[0] as Lang) ? parts.slice(1) : parts;
  return rest.length ? `/${nextLang}/${rest.join("/")}` : `/${nextLang}`;
}

export default function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname() || `/${lang}`;
  const [open, setOpen] = useState(false);

  const askHref = `/${lang}#ask-us`;
  const nav = [
    { href: `/${lang}/how-it-works`, label: tr(lang, "How it works") },
    { href: `/${lang}/guidance`, label: tr(lang, "Guidance") },
    {
      href: `/${lang}/updates`,
      label: l(lang, "Latest", "Actualités", "Aktuelles", "Neiegkeeten"),
    },
    { href: `/${lang}/about`, label: l(lang, "About", "À propos", "Über uns", "Iwwer eis") },
  ];

  return (
    <header
      aria-label={l(
        lang,
        "Site header",
        "En-tête du site",
        "Seitenkopf",
        "Kappberäich vun der Websäit",
      )}
      className="py-4 px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-x-4 z-50 relative"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-calm-blue-800 focus:rounded-lg focus:shadow-lg focus:outline-2 focus:outline-calm-blue-400 focus:text-sm focus:font-medium"
      >
        {l(lang, "Skip to content", "Aller au contenu", "Zum Inhalt springen")}
      </a>
      <Link
        href={`/${lang}`}
        aria-label={l(
          lang,
          "Clarvia home",
          "Accueil Clarvia",
          "Clarvia Startseite",
          "Clarvia Startsäit",
        )}
        className="block relative w-32 h-14 sm:w-40 sm:h-20 transition-transform duration-200 hover:scale-[1.02] shrink-0"
      >
        <Image
          src="/clarvia-logo.webp"
          alt="Clarvia"
          fill
          sizes="160px"
          priority
          className="object-contain"
        />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href={askHref}
          className="btn-primary text-sm px-4 py-2 min-h-11 inline-flex items-center"
        >
          {tr(lang, "Ask Clarvia")}
        </Link>

        <div className="flex items-center gap-1">
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={switchLangPath(pathname, code)}
              aria-label={l(
                lang,
                `Switch to ${code.toUpperCase()}`,
                `Passer en ${code.toUpperCase()}`,
                `Zu ${code.toUpperCase()} wechseln`,
                `Op ${code.toUpperCase()} wiesselen`,
              )}
              aria-current={lang === code ? "page" : undefined}
              className={`px-2.5 py-1.5 rounded-full text-sm font-medium transition-all min-h-11 inline-flex items-center ${
                lang === code
                  ? "bg-white text-calm-blue-800 shadow-sm border border-calm-blue-200"
                  : "text-calm-blue-500 hover:bg-white/40"
              }`}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-calm-blue-200 bg-white text-calm-blue-700"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{tr(lang, "Menu")}</span>
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>

        <nav
          id="site-menu"
          aria-label={l(
            lang,
            "Site navigation",
            "Navigation du site",
            "Seiten-Navigation",
            "Navigatioun vun der Websäit",
          )}
          className={`${open ? "flex" : "hidden"} lg:flex absolute lg:static top-full right-4 left-4 lg:left-auto mt-2 lg:mt-0 flex-col lg:flex-row items-stretch lg:items-center gap-1 lg:gap-4 bg-white lg:bg-transparent border lg:border-0 border-calm-blue-200 rounded-xl lg:rounded-none p-3 lg:p-0 shadow-lg lg:shadow-none`}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={LINK_CLASS}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`/${lang}/support`}
            className={`${LINK_CLASS} lg:ml-1 rounded-full border border-calm-blue-300 bg-white px-3`}
            onClick={() => setOpen(false)}
          >
            {l(lang, "Donate", "Faire un don", "Spenden", "Spenden")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
