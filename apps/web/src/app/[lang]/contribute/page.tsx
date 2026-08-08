import { type Lang, l } from "@/lib/i18n";
import Header from "@/components/Header";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import AccessSection from "../sections/AccessSection";
import PublicInterestSection from "../sections/PublicInterestSection";
import TrustSection from "../sections/TrustSection";

export default async function ContributePage({
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

        {/* ── Title ── */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6 text-center"
          style={headlineStyle}
        >
          {l(lang, "Help Clarvia help families", "Contribuez à Clarvia pour aider les familles", "Helfen Sie Clarvia, Familien zu unterstützen", "Hëlleft Clarvia, Familljen ze hëllefen")}
        </h1>

        {/* ── What is Clarvia ── */}
        <p className="text-base sm:text-lg text-calm-blue-600 leading-relaxed mb-4 text-center">
          {l(lang, "Clarvia is a Luxembourg non-profit building a free, multilingual bereavement guide for families after the loss of a loved one. Every contribution — however small — makes that guidance more accurate, more accessible, and more trustworthy.", "Clarvia est une association sans but lucratif luxembourgeoise qui développe un guide gratuit et multilingue pour accompagner les familles en deuil. Chaque contribution, même modeste, rend ce guide plus précis, plus accessible et plus fiable.", "Clarvia ist ein gemeinnütziger Verein in Luxemburg, der einen kostenlosen, mehrsprachigen Leitfaden für trauernde Familien aufbaut. Jeder Beitrag – noch so klein – macht diesen Leitfaden präziser, zugänglicher und vertrauenswürdiger.", "Clarvia ass eng lëtzebuergesch Associatioun ouni Gewënnzweck, déi e gratis, méisproochege Guide fir Familljen nom Verloscht vun engem nooste Mënsch opbaut. All Bäitrag – egal wéi kleng – mécht dës Orientéierung méi genee, méi zougänglech a méi vertrauenswierdeg.")}
        </p>

        {/* ── Non-coder note ── */}
        <p className="text-sm font-medium text-calm-blue-500 mb-12 text-center">
          {l(lang, "No coding experience required. All contributions are welcome.", "Aucune expérience en programmation n'est requise. Toutes les contributions sont les bienvenues.", "Keine Programmierkenntnisse erforderlich. Alle Beiträge sind willkommen.", "Kee Programméierwëssen néideg. All Bäiträg si wëllkomm.")}
        </p>

        {/* ── Ways to help ── */}
        <h2 className="text-2xl font-semibold text-calm-blue-800 mb-4" style={{ fontFamily: headlineStyle.fontFamily }}>
          {l(lang, "Ways you can help", "Comment vous pouvez contribuer", "So können Sie helfen", "Wéi Dir hëllefe kënnt")}
        </h2>

        <ul className="space-y-4 mb-8">
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
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a
            href="https://github.com/clarvia-org/workflow-web/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
          >
            {l(lang, "Browse good first issues", "Voir les issues accessibles", "Gute erste Issues ansehen", "Einfach Ufanks-Issuen ukucken")}
          </a>
          <a
            href="https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
          >
            {l(lang, "Read the contributing guide", "Lire le guide de contribution", "Beitragsleitfaden lesen", "De Bäitragsguide liesen")}
          </a>
        </div>

        <div className="space-y-16">
          <AccessSection lang={lang} />
          <PublicInterestSection lang={lang} />
          <TrustSection lang={lang} />
        </div>

      </main>

      <FooterSection lang={lang} />
    </>
  );
}