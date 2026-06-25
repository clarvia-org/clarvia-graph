import { Metadata } from "next";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import LuxembourgFocusSection from "../sections/LuxembourgFocusSection";
import HeritageSection from "../sections/HeritageSection";
import FoundingSection from "../sections/FoundingSection";
import StageSection from "../sections/StageSection";

const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "About Clarvia — Mission, legal identity, and governance",
    description:
      "Clarvia ASBL is a Luxembourg non-profit building free, multilingual bereavement guidance for families. Learn about our mission, legal structure, and how we work.",
  },
  fr: {
    title: "À propos de Clarvia — Mission, identité légale et gouvernance",
    description:
      "Clarvia ASBL est une association sans but lucratif luxembourgeoise qui développe un accompagnement gratuit et multilingue pour les familles en deuil. Découvrez notre mission, notre structure juridique et notre mode de fonctionnement.",
  },
  de: {
    title: "Über Clarvia — Mission, rechtliche Identität und Governance",
    description:
      "Clarvia ASBL is ein gemeinnütziger Verein in Luxemburg, der kostenlose, mehrsprachige Trauerbegleitung für Familien aufbaut. Erfahren Sie mehr über unsere Mission, Rechtsstruktur und Arbeitsweise.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/about`,
      languages: Object.fromEntries(
        LANGUAGES.map((code) => [code, `${BASE_URL}/${code}/about`])
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/about`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;

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
            <Link href={`/${lang}/about`} className="text-calm-blue-600 hover:text-calm-blue-800 transition-colors font-bold border-b border-calm-blue-600">
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
                href={`/${code}/about`}
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

        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-10 text-center"
          style={headlineStyle}
        >
          {l(lang, "About Clarvia", "À propos de Clarvia", "Über Clarvia")}
        </h1>

        <section className="mb-16" aria-labelledby="mission-heading">
          <h2
            id="mission-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Our mission", "Notre mission", "Unsere Mission")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed mb-4">
            {l(lang,
              "Clarvia is a Luxembourg non-profit building a free, multilingual bereavement guidance service for families after the loss of a loved one. When someone dies, families must navigate complex administrative processes — often while in shock, often across language barriers, often without knowing where to start.",
              "Clarvia est une association sans but lucratif luxembourgeoise qui développe un service d'accompagnement gratuit et multilingue pour les familles après la perte d'un proche. Lorsqu'un décès survient, les familles doivent gérer des démarches administratives complexes — souvent sous le choc, souvent confrontées à des barrières linguistiques, souvent sans savoir par où commencer.",
              "Clarvia ist ein gemeinnütziger Verein in Luxemburg, der einen kostenlosen, mehrsprachigen Begleitservice für Familien nach dem Verlust eines nahestehenden Menschen aufbaut. Wenn jemand stirbt, müssen Familien komplexe Verwaltungsprozesse bewältigen — oft unter Schock, oft mit Sprachbarrieren, oft ohne zu wissen, wo sie anfangen sollen."
            )}
          </p>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {l(lang,
              "Clarvia exists to make that guidance clearer, more accessible, and trustworthy — regardless of language, nationality, income, or personal network. Our approach is source-backed, structured, and open: every piece of guidance traces back to an official source, and everything we build is public.",
              "Clarvia a pour vocation de rendre cet accompagnement plus clair, plus accessible et plus fiable — quelle que soit la langue, la nationalité, les revenus ou le réseau personnel. Notre approche est fondée sur des sources officielles, structurée et ouverte : chaque élément d'orientation renvoie à une source officielle, et tout ce que nous construisons est public.",
              "Clarvia hat das Ziel, diese Orientierung klarer, zugänglicher und vertrauenswürdiger zu gestalten — unabhängig von Sprache, Nationalität, Einkommen oder persönlichem Netzwerk. Unser Ansatz ist quellenbasiert, strukturiert und offen: Jeder Orientierungshinweis lässt sich auf eine offizielle Quelle zurückführen, und alles, was wir aufbauen, ist öffentlich zugänglich."
            )}
          </p>
        </section>

        <section className="mb-16" aria-labelledby="legal-heading">
          <h2
            id="legal-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Legal identity", "Identité légale", "Rechtliche Identität")}
          </h2>
          <div className="glass-panel p-6 space-y-2 text-sm text-calm-blue-600">
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Legal name", "Nom légal", "Rechtsname")}:
              </span>{" "}
              CLARVIA ASBL
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Type", "Type", "Rechtsform")}:
              </span>{" "}
              {l(lang,
                "Non-profit association (ASBL) under Luxembourg law",
                "Association sans but lucratif (ASBL) de droit luxembourgeois",
                "Gemeinnütziger Verein (ASBL) nach luxemburgischem Recht"
              )}
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Registration", "Enregistrement", "Registrierung")}:
              </span>{" "}
              RCS Luxembourg F15680
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Address", "Adresse", "Adresse")}:
              </span>{" "}
              46, Rue de la Lavande · 1923 Luxembourg
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Founded by", "Fondée par", "Gegründet von")}:
              </span>{" "}
              Gunther Schriver {l(lang, "and", "et", "und")} Tommi Lindfors
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Founded", "Fondée", "Gegründet")}:
              </span>{" "}
              {l(lang, "May 2026", "Mai 2026", "Mai 2026")}
            </p>
          </div>
        </section>

        <section className="mb-16">
          <FoundingSection lang={lang} />
        </section>

        <section className="mb-16" aria-labelledby="how-heading">
          <h2
            id="how-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "How it works", "Comment ça fonctionne", "So funktioniert es")}
          </h2>
          <ul className="space-y-4">
            {([
              {
                en: "Structured workflow data from official sources",
                fr: "Données de workflow structurées à partir de sources officielles",
                de: "Strukturierte Workflow-Daten aus offiziellen Quellen",
                en_d: "Every administrative step, deadline, and document requirement is extracted directly from official government sources and encoded in a validated, open data model.",
                fr_d: "Chaque démarche administrative, délai et exigence documentaire est extrait directement de sources gouvernementales officielles et encodé dans un modèle de données ouvert et validé.",
                de_d: "Jeder Verwaltungsschritt, jede Frist und jede Dokumentenanforderung wird direkt aus offiziellen Regierungsquellen entnommen und in einem validierten, offenen Datenmodell erfasst.",
              },
              {
                en: "Multilingual checklists from verified data",
                fr: "Listes de démarches multilingues issues de données vérifiées",
                de: "Mehrsprachige Checklisten aus verifizierten Daten",
                en_d: "The guidance families receive is generated from verified data, available in English, French, and German to reflect Luxembourg's multilingual reality.",
                fr_d: "L'accompagnement fourni aux familles est généré à partir de données vérifiées, disponibles en anglais, français et allemand pour refléter la réalité multilingue du Luxembourg.",
                de_d: "Die Orientierung für Familien wird aus verifizierten Daten generiert, verfügbar auf Englisch, Französisch und Deutsch, um der mehrsprachigen Realität Luxemburgs gerecht zu werden.",
              },
              {
                en: "Open-source infrastructure designed for Europe",
                fr: "Infrastructure open source conçue pour l'Europe",
                de: "Open-Source-Infrastruktur für Europa",
                en_d: "Everything Clarvia builds — the data model, validation logic, and publishing layer — is open source and designed to be reused across European jurisdictions.",
                fr_d: "Tout ce que Clarvia construit — le modèle de données, la logique de validation et la couche de publication — est open source et conçu pour être réutilisé dans d'autres juridictions européennes.",
                de_d: "Alles, was Clarvia aufbaut — das Datenmodell, die Validierungslogik und die Veröffentlichungsschicht — ist Open Source und für die Wiederverwendung in europäischen Rechtsordnungen konzipiert.",
              },
            ] as const).map((item) => (
              <li
                key={item.en}
                className="flex gap-4 p-4 rounded-xl bg-white/40 border border-calm-blue-100"
              >
                <div>
                  <p className="font-semibold text-calm-blue-800 mb-1">
                    {l(lang, item.en, item.fr, item.de)}
                  </p>
                  <p className="text-sm text-calm-blue-500">
                    {l(lang, item.en_d, item.fr_d, item.de_d)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <LuxembourgFocusSection lang={lang} />
        </section>

        <section className="mb-16">
          <HeritageSection lang={lang} />
        </section>

        <section className="mb-16">
          <StageSection lang={lang} />
        </section>

        <section className="mb-16" aria-labelledby="governance-heading">
          <h2
            id="governance-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Governance and transparency", "Gouvernance et transparence", "Governance und Transparenz")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
            {l(lang,
              "Clarvia operates openly. Our governance standards, contribution guidelines, and source code are all public.",
              "Clarvia fonctionne de manière ouverte. Nos normes de gouvernance, nos directives de contribution et notre code source sont tous publics.",
              "Clarvia arbeitet transparent. Unsere Governance-Standards, Beitragsrichtlinien und der Quellcode sind alle öffentlich zugänglich."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://github.com/clarvia-org/.github/blob/main/GOVERNANCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
            >
              {l(lang, "Governance Document", "Document de gouvernance", "Governance-Dokument")}
            </a>
            <a
              href="https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
            >
              {l(lang, "Contributing Guide", "Guide de contribution", "Beitragsleitfaden")}
            </a>
            <a
              href="https://github.com/clarvia-org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
            >
              {l(lang, "GitHub Organisation", "Organisation GitHub", "GitHub-Organisation")}
            </a>
          </div>
        </section>

      </main>

      <FooterSection lang={lang} />
    </>
  );
}
