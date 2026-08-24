import Link from "next/link";
import Image from "next/image";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";

const NAV_CLASS =
  "text-sm font-semibold text-calm-blue-600 hover:text-calm-blue-800 transition-colors min-h-11 inline-flex items-center";

export default function Header({ lang }: { lang: Lang }) {
  return (
    <header
      aria-label={l(lang, "Site header", "En-tête du site", "Seitenkopf", "Kappberäich vun der Websäit")}
      className="py-4 px-4 sm:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 z-50 relative"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-calm-blue-800 focus:rounded-lg focus:shadow-lg focus:outline-2 focus:outline-calm-blue-400 focus:text-sm focus:font-medium"
      >
        {l(lang, "Skip to content", "Aller au contenu", "Zum Inhalt springen")}
      </a>
      <Link
        href={`/${lang}`}
        aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia Startseite", "Clarvia Startsäit")}
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

      <nav
        aria-label={l(lang, "Site navigation", "Navigation du site", "Seiten-Navigation", "Navigatioun vun der Websäit")}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6"
      >
        <Link href={`/${lang}#ask-us`} className={NAV_CLASS}>
          {l(lang, "Ask us", "Posez-nous votre question", "Fragen Sie uns", "Frot eis")}
        </Link>
        <Link href={`/${lang}/about`} className={NAV_CLASS}>
          {l(lang, "About", "À propos", "Über uns", "Iwwer eis")}
        </Link>
        <Link href={`/${lang}/contact`} className={NAV_CLASS}>
          {l(lang, "Contact", "Contact", "Kontakt", "Kontakt")}
        </Link>
        <Link href={`/${lang}/support`} className={`${NAV_CLASS} sm:ml-1`}>
          {l(lang, "Donate", "Faire un don", "Spenden", "Spenden")}
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 sm:ml-2">
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={`/${code}`}
              aria-label={l(lang, `Switch to ${code.toUpperCase()}`, `Passer en ${code.toUpperCase()}`, `Zu ${code.toUpperCase()} wechseln`, `Op ${code.toUpperCase()} wiesselen`)}
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
      </nav>
    </header>
  );
}
