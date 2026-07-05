import { Metadata } from "next";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import CookieConsent from "@/components/CookieConsent";


const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Clarvia — Guiding families through what comes next",
    description:
      "Open workflow infrastructure for bereavement administration in Luxembourg and across Europe. Free, multilingual, source-backed guidance to help families navigate every administrative step after a loss.",
  },
  fr: {
    title: "Clarvia — Accompagner les familles dans ce qui suit",
    description:
      "Un guide gratuit et multilingue pour chaque démarche administrative après un décès au Luxembourg. Des délais clairs, des priorités claires. Aucune famille laissée seule.",
  },
  de: {
    title: "Clarvia — Familien durch das begleiten, was als Nächstes kommt",
    description:
      "Ein kostenloser, mehrsprachiger Leitfaden für jeden Verwaltungsschritt nach einem Verlust in Luxemburg. Klare Fristen, klare Prioritäten. Keine Familie allein gelassen.",
  },
};

export async function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

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
      canonical: `${BASE_URL}/${lang}`,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${lang}"`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "NGO",
                "@id": "https://clarvia.org/#organization",
                "name": "Clarvia",
                "legalName": "CLARVIA ASBL",
                "url": "https://clarvia.org",
                "sameAs": [
                  "https://clarvia.eu",
                  "https://github.com/clarvia-org",
                  "https://github.com/clarvia-org/workflow-data",
                  "https://github.com/clarvia-org/workflow-web"
                ],
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "46, Rue de la Lavande",
                  "postalCode": "1923",
                  "addressLocality": "Luxembourg",
                  "addressCountry": "LU"
                },
                "foundingDate": "2026-05",
                "nonprofitStatus": "NonprofitType",
                "description": "Clarvia is a Luxembourgish non-profit building open, source-backed workflow infrastructure for bereavement administration across Europe, starting with a free multilingual bereavement checklist for families in Luxembourg.",
                "knowsAbout": [
                  "bereavement administration",
                  "life-event consequence modeling",
                  "workflow infrastructure",
                  "digital public infrastructure",
                  "civic technology",
                  "open-source public goods",
                  "source-backed administrative guidance",
                  "provenance",
                  "CPSV-AP",
                  "CCCEV",
                  "ELI",
                  "PROV-O",
                  "Luxembourg",
                  "France",
                  "Germany",
                  "Belgium",
                  "Portugal"
                ]
              },
              {
                "@type": "WebSite",
                "@id": "https://clarvia.org/#website",
                "url": "https://clarvia.org",
                "name": "Clarvia",
                "publisher": {
                  "@id": "https://clarvia.org/#organization"
                },
                "inLanguage": ["en", "fr", "de"],
                "description": "Free multilingual bereavement guidance for families in Luxembourg, backed by open workflow infrastructure."
              },
              {
                "@type": "SoftwareSourceCode",
                "@id": "https://github.com/clarvia-org/workflow-data#sourcecode",
                "name": "workflow-data",
                "codeRepository": "https://github.com/clarvia-org/workflow-data",
                "programmingLanguage": ["Python", "YAML", "JSON"],
                "license": [
                  "https://www.apache.org/licenses/LICENSE-2.0",
                  "https://creativecommons.org/licenses/by/4.0/"
                ],
                "isPartOf": {
                  "@id": "https://clarvia.org/#organization"
                },
                "description": "Core source-backed workflow data, schemas, provenance, exports, validation, and tests for Clarvia's open bereavement workflow infrastructure."
              },
              {
                "@type": "SoftwareSourceCode",
                "@id": "https://github.com/clarvia-org/workflow-web#sourcecode",
                "name": "workflow-web",
                "codeRepository": "https://github.com/clarvia-org/workflow-web",
                "programmingLanguage": ["TypeScript", "React", "Next.js"],
                "license": "https://www.apache.org/licenses/LICENSE-2.0",
                "isPartOf": {
                  "@id": "https://clarvia.org/#organization"
                },
                "description": "Thin multilingual web layer for publishing Clarvia bereavement checklists, workflow views, and generated API views."
              },
              {
                "@type": "CreativeWork",
                "@id": "https://clarvia.org/#two-layer-model",
                "name": "Clarvia two-layer model",
                "creator": {
                  "@id": "https://clarvia.org/#organization"
                },
                "description": "Clarvia combines an infrastructure layer and an application layer. The infrastructure layer is open, standards-compatible consequence graph infrastructure for EU life events. The application layer is a free bereavement checklist for real people in Luxembourg and cross-border family situations.",
                "about": [
                  "open workflow infrastructure",
                  "bereavement checklist",
                  "life-event consequence graph",
                  "European administrative interoperability",
                  "source-backed guidance"
                ]
              }
            ]
          })
        }}
      />
      {LANGUAGES.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${BASE_URL}/${l}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/en`} />
      {children}
      <CookieConsent lang={lang as Lang} />
    </>
  );
}

