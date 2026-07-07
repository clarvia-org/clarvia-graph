"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";

export default function Header({ lang }: { lang: Lang }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header
        aria-label={l(lang, "Site header", "En-tête du site", "Seitenkopf", "Kappberäich vun der Websäit")}
        className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative"
      >
        <Link
          href={`/${lang}`}
          aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia Startseite", "Clarvia Startsäit")}
          className="block relative w-40 h-20 transition-transform duration-200 hover:scale-[1.02]"
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

        <nav
          aria-label={l(lang, "Site navigation", "Navigation du site", "Seiten-Navigation", "Navigatioun vun der Websäit")}
          className="flex items-center gap-6"
        >
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href={`/${lang}/checklist`}
              className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors"
            >
              {l(lang, "Checklist", "Checklist", "Checkliste", "Checklëscht")}
            </Link>
            <Link
              href={`/${lang}/about`}
              className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors"
            >
              {l(lang, "About", "À propos", "Über uns", "Iwwer eis")}
            </Link>
            <Link
              href={`/${lang}/updates`}
              className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors"
            >
              {l(lang, "Updates", "Actualités", "Aktuelles", "Neiegkeeten")}
            </Link>
            <Link
              href={`/${lang}/contribute`}
              className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors"
            >
              {l(lang, "Contribute", "Contribuer", "Mitwirken", "Matmaachen")}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`/${lang}/support`}
              className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-sm mr-3"
            >
              ♥ {l(lang, "Support", "Soutenir", "Unterstützen", "Ënnerstëtzen")}
            </Link>
            {LANGUAGES.map((code) => (
              <Link
                key={code}
                href={`/${code}`}
                aria-label={l(
                  lang,
                  `Switch to ${code.toUpperCase()}`,
                  `Passer en ${code.toUpperCase()}`,
                  `Zu ${code.toUpperCase()} wechseln`
                )}
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
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-xl text-calm-blue-600 hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 z-50 relative"
            aria-expanded={isOpen}
            aria-label={l(lang, "Toggle menu", "Menu", "Menü ein-/ausblenden", "Menü op- an zouklappen")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer (Calm/Glass aesthetic) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white/80 backdrop-blur-xl border-l border-white/50 shadow-2xl z-40 transform transition-transform duration-300 ease-out md:hidden flex flex-col p-6 pt-24 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-5 text-lg font-semibold flex-grow">
          <Link
            href={`/${lang}/checklist`}
            onClick={toggleMenu}
            className="text-calm-blue-700 hover:text-calm-blue-900 transition-colors py-1.5 border-b border-calm-blue-100/50"
          >
            {l(lang, "Checklist", "Checklist", "Checkliste", "Checklëscht")}
          </Link>
          <Link
            href={`/${lang}/about`}
            onClick={toggleMenu}
            className="text-calm-blue-700 hover:text-calm-blue-900 transition-colors py-1.5 border-b border-calm-blue-100/50"
          >
            {l(lang, "About", "À propos", "Über uns", "Iwwer eis")}
          </Link>
          <Link
            href={`/${lang}/updates`}
            onClick={toggleMenu}
            className="text-calm-blue-700 hover:text-calm-blue-900 transition-colors py-1.5 border-b border-calm-blue-100/50"
          >
            {l(lang, "Updates", "Actualités", "Aktuelles", "Neiegkeeten")}
          </Link>
          <Link
            href={`/${lang}/contribute`}
            onClick={toggleMenu}
            className="text-calm-blue-700 hover:text-calm-blue-900 transition-colors py-1.5 border-b border-calm-blue-100/50"
          >
            {l(lang, "Contribute", "Contribuer", "Mitwirken", "Matmaachen")}
          </Link>
          <Link
            href={`/${lang}/support`}
            onClick={toggleMenu}
            className="btn-primary text-center py-3 text-base mt-4 shadow-md inline-flex items-center justify-center gap-1.5"
          >
            ♥ {l(lang, "Support Our Mission", "Soutenir notre mission", "Mission unterstützen", "Eis Missioun ënnerstëtzen")}
          </Link>
        </nav>

        {/* Mobile Language Switcher */}
        <div className="pt-6 border-t border-calm-blue-200/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-calm-blue-400 mb-3">
            {l(lang, "Language", "Langue", "Sprache", "Sprooch")}
          </p>
          <div className="flex gap-2">
            {LANGUAGES.map((code) => (
              <Link
                key={code}
                href={`/${code}`}
                onClick={toggleMenu}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-1 text-center ${
                  lang === code
                    ? "bg-calm-blue-800 text-white shadow-sm"
                    : "bg-calm-blue-50 text-calm-blue-600 hover:bg-calm-blue-100"
                }`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
