"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import { privacyCookiePolicy } from "./privacy-data";

export default function PrivacyPolicyPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";
  const data = privacyCookiePolicy[lang];

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
                href={`/${code}/privacy`}
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

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        {/* ── Title ── */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-2 text-center"
          style={headlineStyle}
        >
          {data.title}
        </h1>

        <p className="text-sm font-medium text-calm-blue-400 mb-12 text-center">
          {data.lastUpdated}
        </p>

        {/* ── Policy Sections ── */}
        <div className="space-y-10 text-base leading-relaxed text-calm-blue-800">
          {data.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl font-semibold text-[#2b3a67]" style={{ fontFamily: headlineStyle.fontFamily }}>
                {section.heading}
              </h2>
              {section.body.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-calm-blue-700">
                  {paragraph}
                </p>
              ))}

              {section.table && (
                <div className="overflow-x-auto my-6 border border-calm-blue-100 rounded-xl shadow-sm bg-white/50 backdrop-blur-md">
                  <table className="min-w-full divide-y divide-calm-blue-100 text-sm">
                    <thead className="bg-calm-blue-50/50">
                      <tr>
                        {section.table.headers.map((header, hIdx) => (
                          <th
                            key={hIdx}
                            scope="col"
                            className="px-4 py-3 text-left font-semibold text-calm-blue-800"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-calm-blue-100 bg-white/20">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/40 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-3 text-calm-blue-700 ${
                                cIdx === 0 ? "font-mono text-xs font-semibold" : ""
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
