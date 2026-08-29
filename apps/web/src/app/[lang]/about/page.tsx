import { Metadata } from "next";
import Link from "next/link";
import { type Lang, l, LANGUAGES, hreflangLanguages, tr } from "@/lib/i18n";
import Header from "@/components/Header";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import FoundingSection from "../sections/FoundingSection";
import ProblemSection from "../sections/ProblemSection";

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
      "Clarvia ASBL ist ein gemeinnütziger Verein in Luxemburg, der kostenlose, mehrsprachige Trauerbegleitung für Familien aufbaut. Erfahren Sie mehr über unsere Mission, Rechtsstruktur und Arbeitsweise.",
  },
  lu: {
    title: "Iwwer Clarvia - Missioun, juristesch Identitéit a Governance",
    description:
      "Clarvia ASBL ass eng lëtzebuergesch Vereenegung ouni Gewënnzweck (A.s.b.l.), déi e gratis a méisproochege Guide fir Familljen am Trauerfall entwéckelt. Entdeckt eis Missioun, eis juristesch Struktur a wéi mir schaffen.",
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
      languages: hreflangLanguages("about"),
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

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;

  return (
    <>
      <Header lang={lang} />

      <main
        id="main-content"
        className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        {/* ═══ Page Title ═══ */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6 text-center"
          style={headlineStyle}
        >
          {l(
            lang,
            "About Clarvia ASBL",
            "À propos de Clarvia ASBL",
            "Über Clarvia ASBL",
            "Iwwer Clarvia ASBL",
          )}
        </h1>

        {/* ═══ Lead Paragraph ═══ */}
        <p className="text-lg text-calm-blue-700 leading-relaxed text-center max-w-2xl mx-auto mb-16">
          {l(
            lang,
            "Clarvia ASBL is a registered non-profit association in Luxembourg (RCS F15680), dedicated to helping families navigate the administrative burden that follows the death of a loved one. All of our services are free, multilingual, and open to the public.",
            "Clarvia ASBL est une association sans but lucratif enregistrée au Luxembourg (RCS F15680). Elle aide les familles à faire face aux démarches administratives qui suivent le décès d'un proche. Tous nos services sont gratuits, multilingues et accessibles au public.",
            "Clarvia ASBL ist ein in Luxemburg eingetragener gemeinnütziger Verein (RCS F15680). Wir unterstützen Familien dabei, die administrativen Aufgaben zu bewältigen, die nach dem Tod eines nahestehenden Menschen entstehen. Alle unsere Angebote sind kostenlos, mehrsprachig und öffentlich zugänglich.",
            "Clarvia ASBL ass eng zu Lëtzebuerg registréiert Associatioun ouni Gewënnzweck (RCS F15680). Si hëlleft Familljen, sech an den administrativen Demarchen nom Doud vun engem nooste Mënsch zurechtzefannen. All eis Servicer si gratis, méisproocheg an ëffentlech zougänglech.",
          )}
        </p>

        {/* ═══ Our Mission ═══ */}
        <section className="mb-16" aria-labelledby="mission-heading">
          <h2
            id="mission-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Our Mission", "Notre mission", "Unsere Mission", "Eis Missioun")}
          </h2>
          <div className="space-y-4 text-base text-calm-blue-600 leading-relaxed">
            <p>
              {l(
                lang,
                "When someone dies, families are immediately faced with an overwhelming number of administrative obligations: deadlines, documents, notifications to institutions, scattered across government registries, social security systems, insurers, banks, and sometimes across national borders.",
                "Lorsqu'une personne décède, les familles se retrouvent très vite confrontées à un grand nombre d'obligations administratives : délais à respecter, documents à rassembler, organismes à prévenir. Ces démarches sont réparties entre les registres publics, les systèmes de sécurité sociale, les assurances, les banques et, parfois, plusieurs pays.",
                "Wenn ein Mensch stirbt, stehen Familien oft unmittelbar vor einer Vielzahl administrativer Pflichten: Fristen, Dokumente, Mitteilungen an Behörden und Institutionen. Diese Aufgaben verteilen sich auf öffentliche Register, Sozialversicherungssysteme, Versicherungen, Banken und manchmal auch auf mehrere Länder.",
                "Wann e Mënsch stierft, stinn d'Familljen direkt virun enger ganzer Rei administrativen Obligatiounen: Fristen, Dokumenter, Matdeelungen un Institutiounen – verdeelt iwwer staatlech Registeren, Sozialversécherungen, Assurancen, Banken an heiansdo och iwwer Landesgrenzen ewech.",
              )}
            </p>
            <p>
              {l(
                lang,
                "Most of this information exists in official sources, but it is fragmented, hard to find, and rarely available in plain language. Families are expected to figure it out while grieving.",
                "La plupart de ces informations existent déjà dans des sources officielles, mais elles sont dispersées, difficiles à trouver et rarement formulées dans un langage simple. Les familles doivent pourtant s'y retrouver au moment même où elles traversent une période de deuil.",
                "Die meisten Informationen dazu gibt es bereits in offiziellen Quellen. Sie sind jedoch häufig verstreut, schwer zu finden und selten in verständlicher Sprache aufbereitet. Gleichzeitig müssen Familien sich genau in einer Zeit zurechtfinden, in der sie trauern.",
                "Déi meescht vun dësen Informatioune ginn et an offiziellen Quellen, mee si sinn dacks verspreet, schwéier ze fannen an rar a kloerer Sprooch erkläert. Famillje musse sech doranner zurechtfannen, wärend se traueren.",
              )}
            </p>
            <p className="text-calm-blue-700 font-medium">
              {l(
                lang,
                "Our mission is to translate this fragmented guidance into clear, structured, and accessible checklists, so that no family has to navigate grief alongside administrative confusion.",
                "Notre mission est de transformer ces informations fragmentées en listes claires, structurées et accessibles, afin qu'aucune famille n'ait à gérer son deuil dans la confusion administrative.",
                "Unsere Mission ist es, diese verstreuten Informationen in klare, strukturierte und leicht zugängliche Checklisten zu übersetzen, damit keine Familie neben der Trauer auch noch mit administrativer Unsicherheit allein gelassen wird.",
                "Eis Missioun ass et, dës verspreet Informatiounen a kloer, strukturéiert an zougänglech Checklisten ëmzesetzen, fir datt keng Famill nieft der Trauer och nach mat administrativer Onkloerheet eleng bleift.",
              )}
            </p>
          </div>
        </section>

        <ProblemSection lang={lang} />

        {/* ═══ Active Programs & Services ═══ */}
        <section className="mb-16" aria-labelledby="programs-heading">
          <h2
            id="programs-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-2"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(
              lang,
              "Active Programs & Services",
              "Programmes et services actifs",
              "Aktive Programme und Angebote",
              "Aktiv Programmer a Servicer",
            )}
          </h2>
          <p className="text-base text-calm-blue-600 mb-6">
            {l(
              lang,
              "Clarvia operates four free, public-interest programs:",
              "Clarvia gère quatre programmes gratuits d'intérêt public :",
              "Clarvia betreibt vier kostenlose Programme im öffentlichen Interesse:",
              "Clarvia bedreift véier gratis Programmer am ëffentlechen Interessi:",
            )}
          </p>

          <div className="space-y-6">
            {/* Program 1 */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {tr(lang, "1. Ask Clarvia")}
              </h3>
              <div className="space-y-3 text-base text-calm-blue-600 leading-relaxed">
                <p>
                  {l(
                    lang,
                    "Ask Clarvia is our live email service for families worldwide. Describe what happened in your own language. Lex at Clarvia replies by email, usually within a few minutes, with cited sources. The service is free.",
                    "Demandez à Clarvia est notre service de réponse par e-mail destiné aux familles du monde entier. Décrivez ce qui s’est passé dans votre propre langue. Lex, de l’équipe Clarvia, vous répond par e-mail, généralement en quelques minutes, en indiquant les sources utilisées. Le service est gratuit.",
                    "Clarvia fragen ist unser E-Mail-Service für Familien weltweit. Schildern Sie in Ihrer eigenen Sprache, was passiert ist. Lex bei Clarvia antwortet Ihnen per E-Mail, in der Regel innerhalb weniger Minuten und mit Angaben zu den verwendeten Quellen. Der Service ist kostenlos.",
                    "Frot Clarvia ass eisen E-Mail-Service fir Famillje weltwäit. Beschreift an Ärer eegener Sprooch, wat geschitt ass. De Lex bei Clarvia äntwert Iech per E-Mail, normalerweis bannent e puer Minutten a mat Linken op déi benotzte Quellen. De Service ass gratis.",
                  )}
                </p>
                <p>
                  <Link
                    href={`/${lang}#ask-us`}
                    className="text-calm-blue-700 font-medium hover:text-calm-blue-900 underline underline-offset-2 transition-colors"
                  >
                    {l(
                      lang,
                      "Ask us →",
                      "Posez-nous votre question →",
                      "Fragen Sie uns →",
                      "Frot eis →",
                    )}
                  </Link>
                </p>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {tr(lang, "2. Published guidance")}
              </h3>
              <p className="text-base text-calm-blue-600 leading-relaxed mb-3">
                {tr(
                  lang,
                  "Families can read source-linked guides organised by country, and use the bereavement checklist, which turns reviewed task data into a practical list evaluated in the visitor's browser. If a guide or task does not match the country or facts, use Ask Clarvia.",
                )}
              </p>
              <Link href={`/${lang}/guidance`} className="text-calm-blue-700 font-medium underline">
                {tr(lang, "Browse guidance →")}
              </Link>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {tr(lang, "3. How answers are sourced")}
              </h3>
              <p className="text-base text-calm-blue-600 leading-relaxed mb-3">
                {tr(
                  lang,
                  "Clarvia publishes how official sources, maintained legislation, human review, and AI are used for Ask Clarvia and for guidance pages, including where those methods differ.",
                )}
              </p>
              <Link
                href={`/${lang}/how-it-works`}
                className="text-calm-blue-700 font-medium underline"
              >
                {tr(lang, "How it works →")}
              </Link>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                {tr(lang, "4. For institutions")}
              </h3>
              <p className="text-base text-calm-blue-600 leading-relaxed mb-3">
                {tr(
                  lang,
                  "Clarvia publishes open, source-backed guidance infrastructure that public-interest teams can inspect, reuse, and adapt.",
                )}
              </p>
              <Link
                href={`/${lang}/for-institutions`}
                className="text-calm-blue-700 font-medium underline"
              >
                {tr(lang, "Explore reuse →")}
              </Link>
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
            {l(
              lang,
              "Funding & Independence",
              "Financement et indépendance",
              "Finanzierung und Unabhängigkeit",
              "Finanzéierung an Onofhängegkeet",
            )}
          </h2>
          <div className="glass-panel p-6 space-y-4 text-base text-calm-blue-600 leading-relaxed">
            <p>
              {l(
                lang,
                "Clarvia is a non-profit association. We do not charge fees, display advertisements, or monetise personal data. There are no premium tiers or paid features. All services are free for every family.",
                "Clarvia est une association sans but lucratif. Nous ne facturons aucun frais, n'affichons pas de publicité et ne monétisons pas les données personnelles. Il n'existe ni offre premium ni fonctionnalité payante : tous les services sont gratuits pour toutes les familles.",
                "Clarvia ist ein gemeinnütziger Verein. Wir erheben keine Gebühren, schalten keine Werbung und monetarisieren keine personenbezogenen Daten. Es gibt keine Premium-Stufen und keine kostenpflichtigen Funktionen. Alle Angebote sind für jede Familie kostenlos.",
                "Clarvia ass eng Associatioun ouni Gewënnzweck. Mir froe keng Fraisen, weisen keng Reklammen a verdéngen net un perséinlechen Donnéeën. Et gëtt keng Premium-Offeren a keng bezuelte Funktiounen. All Servicer si fir all Famill gratis.",
              )}
            </p>
            <p>
              {l(
                lang,
                "Our operations are supported by donations, corporate sponsors, grant funding, and volunteer contributions. Our tools, data, and source code are all freely available to the public.",
                "Nos activités sont soutenues par des sponsors d'entreprise, des financements sous forme de subventions et des contributions bénévoles. Nos outils, nos données et notre code source sont librement accessibles au public.",
                "Unsere Arbeit wird durch Unternehmenssponsoren, Fördermittel und ehrenamtliche Beiträge ermöglicht. Unsere Werkzeuge, Daten und unser Quellcode sind der Öffentlichkeit frei zugänglich.",
                "Eis Aarbecht gëtt duerch Entreprisesponsoren, Subventiounen a fräiwëlleg Bäiträg ënnerstëtzt. Eis Tools, Donnéeën an eise Quellcode si fir de Public fräi zougänglech.",
              )}
            </p>
            <p>
              {l(
                lang,
                "Donations keep our free services running. We do not show ads. Payments are processed through Stripe, Open Collective, and GitHub Sponsors. We do not currently issue tax certificates. Our 2026 accounts have not yet been filed. Current income and eligible expenses are available on Open Collective.",
                "Les dons permettent de maintenir nos services gratuits. Nous n’affichons aucune publicité. Les paiements sont traités par Stripe, Open Collective et GitHub Sponsors. Nous ne délivrons actuellement aucun certificat fiscal. Nos comptes pour 2026 n’ont pas encore été déposés. Nos recettes et les dépenses admissibles peuvent être consultées en temps réel sur Open Collective.",
                "Spenden sichern den Betrieb unserer kostenlosen Angebote. Wir zeigen keine Werbung. Zahlungen werden über Stripe, Open Collective und GitHub Sponsors abgewickelt. Derzeit stellen wir keine Spendenbescheinigungen aus. Unser Jahresabschluss für 2026 wurde noch nicht eingereicht. Laufende Einnahmen und anerkannte Ausgaben können auf Open Collective eingesehen werden.",
                "Spenden halen eis gratis Servicer um Lafen. Mir weise keng Reklammen. D’Bezuelunge ginn iwwer Stripe, Open Collective a GitHub Sponsors ofgewéckelt. De Moment stelle mir keng Steierbescheinegungen aus. Eis Konte fir 2026 sinn nach net agereecht ginn. Déi aktuell Recetten an eligible Ausgabe kënnen op Open Collective nogekuckt ginn.",
              )}{" "}
              <a
                href="https://opencollective.com/clarvia-org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-calm-blue-700 font-medium hover:text-calm-blue-900 underline underline-offset-2"
              >
                opencollective.com/clarvia-org
              </a>
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
            {l(
              lang,
              "Legal identity",
              "Identité légale",
              "Rechtliche Identität",
              "Juristesch Identitéit",
            )}
          </h2>
          <div className="glass-panel p-6 space-y-2 text-sm text-calm-blue-600">
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Legal name", "Nom légal", "Rechtsname", "Juristeschen Numm")}:
              </span>{" "}
              CLARVIA ASBL
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Type", "Type", "Rechtsform", "Form")}:
              </span>{" "}
              {l(
                lang,
                "Non-profit association (ASBL) under Luxembourg law",
                "Association sans but lucratif (ASBL) de droit luxembourgeois",
                "Gemeinnütziger Verein (ASBL) nach luxemburgischem Recht",
                "Associatioun ouni Gewënnzweck (ASBL) no lëtzebuergeschem Recht",
              )}
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Registration", "Enregistrement", "Registrierung", "Aschreiwung")}:
              </span>{" "}
              RCS Luxembourg F15680
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Address", "Adresse", "Adresse", "Adress")}:
              </span>{" "}
              46, Rue de la Lavande · 1923 Luxembourg
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Founded by", "Fondée par", "Gegründet von", "Gegrënnt vun")}:
              </span>{" "}
              Gunther Schriver {l(lang, "and", "et", "und", "an")} Tommi Lindfors
            </p>
            <p>
              <span className="font-semibold text-calm-blue-800">
                {l(lang, "Founded", "Fondée", "Gegründet", "Gegrënnt")}:
              </span>{" "}
              {l(lang, "May 2026", "Mai 2026", "Mai 2026", "Mee 2026")}
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
            {tr(lang, "How it works")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {tr(lang, "See How it works for sourcing, human review, AI, and privacy.")}{" "}
            <Link
              href={`/${lang}/how-it-works`}
              className="font-medium underline text-calm-blue-700"
            >
              {tr(lang, "How it works →")}
            </Link>
          </p>
        </section>

        {/* ═══ Governance & Transparency ═══ */}
        <section className="mb-16" aria-labelledby="governance-heading">
          <h2
            id="governance-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(
              lang,
              "Governance and transparency",
              "Gouvernance et transparence",
              "Governance und Transparenz",
              "Governance an Transparenz",
            )}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
            {l(
              lang,
              "Clarvia operates openly. Our governance standards, contribution guidelines, and source code are all public.",
              "Clarvia fonctionne de manière ouverte. Nos normes de gouvernance, nos directives de contribution et notre code source sont tous publics.",
              "Clarvia arbeitet transparent. Unsere Governance-Standards, Beitragsrichtlinien und der Quellcode sind alle öffentlich zugänglich.",
              "Clarvia schafft oppe. Eis Governance-Standarden, Richtlinne fir Contributiounen an eise Quellcode sinn ëffentlech.",
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://github.com/clarvia-org/.github/blob/main/GOVERNANCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
            >
              {l(
                lang,
                "Governance Document",
                "Document de gouvernance",
                "Governance-Dokument",
                "Governance-Dokument",
              )}
            </a>
            <a
              href="https://github.com/clarvia-org/.github/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
            >
              {l(
                lang,
                "Contributing Guide",
                "Guide de contribution",
                "Beitragsleitfaden",
                "Bäitragsguide",
              )}
            </a>
            <a
              href="https://github.com/clarvia-org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base flex-grow text-center"
            >
              {l(
                lang,
                "GitHub Organisation",
                "Organisation GitHub",
                "GitHub-Organisation",
                "GitHub-Organisatioun",
              )}
            </a>
          </div>
        </section>
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
