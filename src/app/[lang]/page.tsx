"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";

import HeroSection from "./sections/HeroSection";
import VideoSection from "./sections/VideoSection";
import ProblemSection from "./sections/ProblemSection";
import ChecklistSection from "./sections/ChecklistSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FormsSection from "./sections/FormsSection";
import FooterSection from "./sections/FooterSection";
import LatestUpdatesSection from "./sections/LatestUpdatesSection";

export default function LandingPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

  return (
    <>
      {/* ═══ Header ═══ */}
      <header aria-label={l(lang, "Site header", "En-tête du site", "Seitenkopf")} className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative">
        <Link href={`/${lang}`} aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia Startseite")} className="block">
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <nav aria-label={l(lang, "Site navigation", "Navigation du site", "Seiten-Navigation")} className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href={`/${lang}/checklist`} className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
              {l(lang, "Checklist", "Checklist", "Checkliste")}
            </Link>
            <Link href={`/${lang}/about`} className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
              {l(lang, "About", "À propos", "Über uns")}
            </Link>
            <Link href={`/${lang}/updates`} className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
              {l(lang, "Updates", "Actualités", "Aktuelles")}
            </Link>
            <Link href={`/${lang}/contribute`} className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
              {l(lang, "Contribute", "Contribuer", "Mitwirken")}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${lang}/support`} className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-sm mr-3">
              ♥ {l(lang, "Support", "Soutenir", "Unterstützen")}
            </Link>
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
          </div>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <HeroSection lang={lang} />
        <VideoSection lang={lang} />
        <ProblemSection lang={lang} />
        <ChecklistSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <FormsSection lang={lang} />
        <LatestUpdatesSection lang={lang} />
      </main>

      <FooterSection lang={lang} />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
