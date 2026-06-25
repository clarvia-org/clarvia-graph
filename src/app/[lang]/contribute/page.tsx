"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";

export default function ContributePage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

  return (
    <>
      {/* ═══ Header (matches main page) ═══ */}
      <header className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative">
        <Link href={`/${lang}`} className="block">
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={`/${code}/contribute`}
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

        {/* ── Title ── */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {l(lang,
            "Help Clarvia help families",
            "Contribuez à Clarvia pour aider les familles",
            "Helfen Sie Clarvia, Familien zu unterstützen"
          )}
        </h1>

        {/* ── What is Clarvia ── */}
        <p className="text-base sm:text-lg text-calm-blue-600 leading-relaxed mb-4">
          {l(lang,
            "Clarvia is a Luxembourg non-profit building a free, multilingual bereavement guide for families after the loss of a loved one. Every contribution — however small — makes that guidance more accurate, more accessible, and more trustworthy.",
            "Clarvia est une association sans but lucratif luxembourgeoise qui développe un guide gratuit et multilingue pour accompagner les familles en deuil. Chaque contribution, même modeste, rend ce guide plus précis, plus accessible et plus fiable.",
            "Clarvia ist ein gemeinnütziger Verein in Luxemburg, der einen kostenlosen, mehrsprachigen Leitfaden für trauernde Familien aufbaut. Jeder Beitrag – noch so klein – macht diesen Leitfaden präziser, zugänglicher und vertrauenswürdiger."
          )}
        </p>

        {/* ── Non-coder note ── */}
        <p className="text-sm font-medium text-calm-blue-500 mb-10">
          {l(lang,
            "No coding experience required. All contributions are welcome.",
            "Aucune expérience en programmation n'est requise. Toutes les contributions sont les bienvenues.",
            "Keine Programmierkenntnisse erforderlich. Alle Beiträge sind willkommen."
          )}
        </p>

        {/* ── Ways to help ── */}
        <h2 className="text-xl font-semibold text-calm-blue-800 mb-4" style={{ fontFamily: headlineStyle.fontFamily }}>
          {l(lang, "Ways you can help", "Comment vous pouvez contribuer", "So können Sie helfen")}
        </h2>

        <ul className="space-y-4 mb-12">
          {[
            {
              icon: "🔍",
              en: "Source verification",
              fr: "Vérification des sources",
              de: "Quellenprüfung",
              en_d: "Check that our guidance matches official Luxembourg sources.",
              fr_d: "Vérifiez que notre contenu correspond aux sources officielles luxembourgeoises.",
              de_d: "Prüfen Sie, ob unsere Anleitungen mit offiziellen luxemburgischen Quellen übereinstimmen.",
            },
            {
              icon: "🌍",
              en: "Translation",
              fr: "Traduction",
              de: "Übersetzung",
              en_d: "Improve our French and German content, or flag awkward phrasing.",
              fr_d: "Améliorez notre contenu en français et en allemand, ou signalez les formulations maladroites.",
              de_d: "Verbessern Sie unsere französischen und deutschen Inhalte oder melden Sie ungeschickte Formulierungen.",
            },
            {
              icon: "♿",
              en: "Accessibility",
              fr: "Accessibilité",
              de: "Barrierefreiheit",
              en_d: "Help us work better with screen readers, keyboard navigation, and assistive technology.",
              fr_d: "Aidez-nous à améliorer la compatibilité avec les lecteurs d'écran, la navigation clavier et les technologies d'assistance.",
              de_d: "Helfen Sie uns, die Kompatibilität mit Bildschirmlesern, Tastaturnavigation und Hilfstechnologien zu verbessern.",
            },
            {
              icon: "📖",
              en: "Documentation",
              fr: "Documentation",
              de: "Dokumentation",
              en_d: "Clarify our contributing guides or improve the README.",
              fr_d: "Clarifiez nos guides de contribution ou améliorez le README.",
              de_d: "Verdeutlichen Sie unsere Beitragsrichtlinien oder verbessern Sie die README.",
            },
          ].map((item) => (
            <li
              key={item.en}
              className="flex gap-4 p-4 rounded-xl bg-white/40 border border-calm-blue-100"
            >
              <span className="text-2xl mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-calm-blue-800">
                  {l(lang, item.en, item.fr, item.de)}
                </p>
                <p className="text-sm text-calm-blue-500 mt-0.5">
                  {l(lang, item.en_d, item.fr_d, item.de_d)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* ── CTAs ── */}
      {/* ── CTAs ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://github.com/clarvia-org/workflow-web/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            {l(lang,
              "Browse good first issues",
              "Voir les issues accessibles",
              "Gute erste Issues ansehen"
            )}
          </a>
          <a
            href="https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            {l(lang,
              "Read the contributing guide",
              "Lire le guide de contribution",
              "Beitragsleitfaden lesen"
            )}
          </a>
        </div>

      </main>

      <FooterSection lang={lang} />
    </>
  );
}