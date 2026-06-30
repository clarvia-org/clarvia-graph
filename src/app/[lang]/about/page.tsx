import { Metadata } from "next";
import Link from "next/link";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import FoundingSection from "../sections/FoundingSection";

const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "About Clarvia - Mission, legal identity, and governance",
    description:
      "Clarvia ASBL is a Luxembourg non-profit building free, multilingual bereavement guidance for families. Learn about our mission, legal structure, and how we work.",
  },
  fr: {
    title: "À propos de Clarvia - Mission, identité légale et gouvernance",
    description:
      "Clarvia ASBL est une association sans but lucratif luxembourgeoise qui développe un accompagnement gratuit et multilingue pour les familles en deuil. Découvrez notre mission, notre structure juridique et notre mode de fonctionnement.",
  },
  de: {
    title: "Über Clarvia - Mission, rechtliche Identität und Governance",
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

        {/* ═══ Page Title ═══ */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6 text-center"
          style={headlineStyle}
        >
          {l(lang, "About Clarvia ASBL", "À propos de Clarvia ASBL", "Über Clarvia ASBL")}
        </h1>

        {/* ═══ Lead Paragraph ═══ */}
        <p className="text-lg text-calm-blue-700 leading-relaxed text-center max-w-2xl mx-auto mb-16">
          {l(lang,
            "Clarvia ASBL is a registered non-profit association in Luxembourg (RCS F15680), dedicated to helping families navigate the administrative burden that follows the death of a loved one. All of our services are free, multilingual, and open to the public.",
            "Clarvia ASBL est une association sans but lucratif enregistrée au Luxembourg (RCS F15680). Elle aide les familles à faire face aux démarches administratives qui suivent le décès d'un proche. Tous nos services sont gratuits, multilingues et accessibles au public.",
            "Clarvia ASBL ist ein in Luxemburg eingetragener gemeinnütziger Verein (RCS F15680). Wir unterstützen Familien dabei, die administrativen Aufgaben zu bewältigen, die nach dem Tod eines nahestehenden Menschen entstehen. Alle unsere Angebote sind kostenlos, mehrsprachig und öffentlich zugänglich."
          )}
        </p>

        {/* ═══ Our Mission ═══ */}
        <section className="mb-16" aria-labelledby="mission-heading">
          <h2
            id="mission-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Our Mission", "Notre mission", "Unsere Mission")}
          </h2>
          <div className="space-y-4 text-base text-calm-blue-600 leading-relaxed">
            <p>
              {l(lang,
                "When someone dies, families are immediately faced with an overwhelming number of administrative obligations: deadlines, documents, notifications to institutions, scattered across government registries, social security systems, insurers, banks, and sometimes across national borders.",
                "Lorsqu'une personne décède, les familles se retrouvent très vite confrontées à un grand nombre d'obligations administratives : délais à respecter, documents à rassembler, organismes à prévenir. Ces démarches sont réparties entre les registres publics, les systèmes de sécurité sociale, les assurances, les banques et, parfois, plusieurs pays.",
                "Wenn ein Mensch stirbt, stehen Familien oft unmittelbar vor einer Vielzahl administrativer Pflichten: Fristen, Dokumente, Mitteilungen an Behörden und Institutionen. Diese Aufgaben verteilen sich auf öffentliche Register, Sozialversicherungssysteme, Versicherungen, Banken und manchmal auch auf mehrere Länder."
              )}
            </p>
            <p>
              {l(lang,
                "Most of this information exists in official sources, but it is fragmented, hard to find, and rarely available in plain language. Families are expected to figure it out while grieving.",
                "La plupart de ces informations existent déjà dans des sources officielles, mais elles sont dispersées, difficiles à trouver et rarement formulées dans un langage simple. Les familles doivent pourtant s'y retrouver au moment même où elles traversent une période de deuil.",
                "Die meisten Informationen dazu gibt es bereits in offiziellen Quellen. Sie sind jedoch häufig verstreut, schwer zu finden und selten in verständlicher Sprache aufbereitet. Gleichzeitig müssen Familien sich genau in einer Zeit zurechtfinden, in der sie trauern."
              )}
            </p>
            <p className="text-calm-blue-700 font-medium">
              {l(lang,
                "Our mission is to translate this fragmented guidance into clear, structured, and accessible checklists, so that no family has to navigate grief alongside administrative confusion.",
                "Notre mission est de transformer ces informations fragmentées en listes claires, structurées et accessibles, afin qu'aucune famille n'ait à gérer son deuil dans la confusion administrative.",
                "Unsere Mission ist es, diese verstreuten Informationen in klare, strukturierte und leicht zugängliche Checklisten zu übersetzen, damit keine Familie neben der Trauer auch noch mit administrativer Unsicherheit allein gelassen wird."
              )}
            </p>
          </div>
        </section>

        {/* ═══ Active Programs & Services ═══ */}
        <section className="mb-16" aria-labelledby="programs-heading">
          <h2
            id="programs-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-2"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Active Programs & Services", "Programmes et services actifs", "Aktive Programme und Angebote")}
          </h2>
          <p className="text-base text-calm-blue-600 mb-6">
            {l(lang,
              "Clarvia operates three free, public-interest programs:",
              "Clarvia gère trois programmes gratuits d'intérêt public :",
              "Clarvia betreibt drei kostenlose Programme im öffentlichen Interesse:"
            )}
          </p>

          <div className="space-y-6">
            {/* Program 1 */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {l(lang,
                  "1. Bereavement Guidance Service",
                  "1. Service d'accompagnement après un décès",
                  "1. Orientierungshilfe nach einem Todesfall"
                )}
              </h3>
              <div className="space-y-3 text-base text-calm-blue-600 leading-relaxed">
                <p>
                  {l(lang,
                    "We operate a free public service at clarvia.org that provides families with a personalised, step-by-step checklist of administrative steps following a death. An early alpha version is already available for public use.",
                    "Nous proposons, sur clarvia.org, un service public gratuit qui fournit aux familles une liste personnalisée et étape par étape des démarches administratives à effectuer après un décès. Une première version alpha est déjà accessible au public.",
                    "Auf clarvia.org bieten wir einen kostenlosen öffentlichen Dienst an, der Familien eine personalisierte Schritt-für-Schritt-Checkliste für die administrativen Aufgaben nach einem Todesfall bereitstellt. Eine erste Alpha-Version ist bereits öffentlich nutzbar."
                  )}
                </p>
                <p>
                  <Link href={`/${lang}/checklist`} className="text-calm-blue-700 font-medium hover:text-calm-blue-900 underline underline-offset-2 transition-colors">
                    {l(lang,
                      "Try the checklist →",
                      "Essayer la checklist →",
                      "Checkliste ausprobieren →"
                    )}
                  </Link>
                </p>
                <p className="text-sm text-calm-blue-500">
                  {l(lang,
                    "The service is designed to protect family privacy: it does not collect, store, or share personal data.",
                    "Le service est conçu pour protéger la vie privée des familles : il ne collecte, ne conserve et ne partage aucune donnée personnelle.",
                    "Der Dienst ist so gestaltet, dass die Privatsphäre der Familien geschützt bleibt: Es werden keine personenbezogenen Daten erhoben, gespeichert oder weitergegeben."
                  )}
                </p>
              </div>
            </div>

            {/* Program 2 */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {l(lang,
                  "2. Government Source Registry",
                  "2. Registre des sources officielles",
                  "2. Register offizieller Quellen"
                )}
              </h3>
              <p className="text-base text-calm-blue-600 leading-relaxed">
                {l(lang,
                  "Every administrative step in our checklists is mapped back to its official government source. We maintain a structured, openly licensed registry of these sources so that families and professionals can verify the accuracy of every recommendation.",
                  "Chaque démarche administrative figurant dans nos checklists est reliée à sa source gouvernementale officielle. Nous maintenons un registre structuré, publié sous licence ouverte, afin que les familles et les professionnels puissent vérifier l'exactitude de chaque recommandation.",
                  "Jeder administrative Schritt in unseren Checklisten ist mit der jeweiligen offiziellen staatlichen Quelle verknüpft. Wir pflegen ein strukturiertes Register dieser Quellen unter einer offenen Lizenz, damit Familien und Fachpersonen die Genauigkeit jeder Empfehlung überprüfen können."
                )}
              </p>
            </div>

            {/* Program 3 */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {l(lang,
                  "3. Cross-Border Support",
                  "3. Accompagnement transfrontalier",
                  "3. Grenzüberschreitende Unterstützung"
                )}
              </h3>
              <p className="text-base text-calm-blue-600 leading-relaxed">
                {l(lang,
                  "Our initial focus is Luxembourg, but we extend into critical cross-border corridors, including France, Germany, Belgium, and Portugal, to support migrant workers and cross-border families who face obligations in more than one country.",
                  "Notre premier champ d'action est le Luxembourg, mais nous couvrons également les principaux contextes transfrontaliers, notamment avec la France, l'Allemagne, la Belgique et le Portugal, afin d'aider les travailleurs migrants et les familles concernées par des obligations dans plusieurs pays.",
                  "Unser erster Schwerpunkt liegt auf Luxemburg. Gleichzeitig berücksichtigen wir wichtige grenzüberschreitende Situationen, insbesondere mit Frankreich, Deutschland, Belgien und Portugal, um Grenzgängerinnen und Grenzgänger, Migrantinnen und Migranten sowie Familien zu unterstützen, die Pflichten in mehr als einem Land erfüllen müssen."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ═══ Funding & Independence ═══ */}
        <section className="mb-16" aria-labelledby="funding-heading">
          <h2
            id="funding-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Funding & Independence", "Financement et indépendance", "Finanzierung und Unabhängigkeit")}
          </h2>
          <div className="glass-panel p-6 space-y-4 text-base text-calm-blue-600 leading-relaxed">
            <p>
              {l(lang,
                "Clarvia is a non-profit association. We do not charge fees, display advertisements, or monetise personal data. There are no premium tiers or paid features. All services are free for every family.",
                "Clarvia est une association sans but lucratif. Nous ne facturons aucun frais, n'affichons pas de publicité et ne monétisons pas les données personnelles. Il n'existe ni offre premium ni fonctionnalité payante : tous les services sont gratuits pour toutes les familles.",
                "Clarvia ist ein gemeinnütziger Verein. Wir erheben keine Gebühren, schalten keine Werbung und monetarisieren keine personenbezogenen Daten. Es gibt keine Premium-Stufen und keine kostenpflichtigen Funktionen. Alle Angebote sind für jede Familie kostenlos."
              )}
            </p>
            <p>
              {l(lang,
                "Our operations are supported by corporate sponsors, grant funding, and volunteer contributions. Our tools, data, and source code are all freely available to the public.",
                "Nos activités sont soutenues par des sponsors d'entreprise, des financements sous forme de subventions et des contributions bénévoles. Nos outils, nos données et notre code source sont librement accessibles au public.",
                "Unsere Arbeit wird durch Unternehmenssponsoren, Fördermittel und ehrenamtliche Beiträge ermöglicht. Unsere Werkzeuge, Daten und unser Quellcode sind der Öffentlichkeit frei zugänglich."
              )}
            </p>
          </div>
        </section>

        {/* ═══ Legal Identity ═══ */}
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

        {/* ═══ Founded by ═══ */}
        <section className="mb-16">
          <FoundingSection lang={lang} />
        </section>

        {/* ═══ How It Works ═══ */}
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
                en_d: "Everything Clarvia builds, including the data model, validation logic, and publishing layer, is open source and designed to be reused across European jurisdictions.",
                fr_d: "Tout ce que Clarvia construit - le modèle de données, la logique de validation et la couche de publication - est open source et conçu pour être réutilisé dans d'autres juridictions européennes.",
                de_d: "Alles, was Clarvia aufbaut - das Datenmodell, die Validierungslogik und die Veröffentlichungsschicht - ist Open Source und für die Wiederverwendung in europäischen Rechtsordnungen konzipiert.",
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

        {/* ═══ Governance & Transparency ═══ */}
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
