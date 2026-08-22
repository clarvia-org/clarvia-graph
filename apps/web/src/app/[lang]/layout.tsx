import { Metadata } from "next";
import { LANGUAGES, type Lang, hreflangLanguages } from "@/lib/i18n";
import CookieConsent from "@/components/CookieConsent";


const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Clarvia — Guiding families through what comes next",
    description:
      "Free, source-linked guidance from a terminal diagnosis through the practical questions that can arise years after a death.",
  },
  fr: {
    title: "Vous ne savez pas quoi faire lorsqu’un proche est en phase terminale ou est décédé ? | Clarvia",
    description:
      "Des informations pratiques gratuites, accompagnées de leurs sources, depuis le diagnostic d’une maladie en phase terminale jusqu’aux questions qui peuvent encore se poser des années après un décès.",
  },
  de: {
    title: "Sie wissen nicht, was zu tun ist, wenn ein geliebter Mensch unheilbar krank ist oder verstorben ist? | Clarvia",
    description:
      "Kostenlose Orientierung mit Links zu den Quellen, von der Diagnose einer unheilbaren Erkrankung bis zu praktischen Fragen, die noch Jahre nach einem Todesfall auftreten können.",
  },
  lu: {
    title: "Wësst Dir net, wat Dir maache sollt, wann eng Persoun, déi Iech nosteet, onheelbar krank ass oder gestuerwen ass? | Clarvia",
    description:
      "Gratis praktesch Orientéierung mat Linken op d’Quellen, vun der Diagnos vun enger onheelbarer Krankheet bis bei Froen, déi nach Joren no engem Doudesfall opkomme kënnen.",
  }
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
      languages: hreflangLanguages(),
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
          __html: `document.documentElement.lang="${lang === "lu" ? "lb" : lang}"`,
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
                  "https://github.com/clarvia-org/clarvia-graph"
                ],
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "46, Rue de la Lavande",
                  "postalCode": "1923",
                  "addressLocality": "Luxembourg",
                  "addressCountry": "LU"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "url": "https://clarvia.org/en/contact",
                  "contactType": "customer support"
                },
                "foundingDate": "2026-05",

                "description": "Clarvia is an independent non-profit providing free, source-linked bereavement and end-of-life guidance for families worldwide.",
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
                  "PROV-O"
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
                "inLanguage": ["en", "fr", "de", "lu"],
                "description": "Free multilingual bereavement guidance for families worldwide, backed by open workflow infrastructure."
              },
              {
                "@type": "SoftwareSourceCode",
                "@id": "https://github.com/clarvia-org/clarvia-graph#sourcecode",
                "name": "clarvia-graph",
                "codeRepository": "https://github.com/clarvia-org/clarvia-graph",
                "programmingLanguage": ["TypeScript", "JavaScript", "Python", "YAML", "JSON"],
                "license": [
                  "https://www.apache.org/licenses/LICENSE-2.0",
                  "https://creativecommons.org/licenses/by/4.0/",
                  "https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12"
                ],
                "isPartOf": {
                  "@id": "https://clarvia.org/#organization"
                },
                "description": "Clarvia public monorepo: consequence graph, clarvia.org website (apps/web), legislation dataset (lex/), and public-safe Lex email service (services/lex/)."
              },
              {
                "@type": "CreativeWork",
                "@id": "https://clarvia.org/#two-layer-model",
                "name": "Clarvia two-layer model",
                "creator": {
                  "@id": "https://clarvia.org/#organization"
                },
                "description": "Clarvia combines an infrastructure layer and an application layer. The infrastructure layer is open, standards-compatible consequence graph infrastructure for life events. The application layer is free bereavement guidance for families worldwide.",
                "about": [
                  "open workflow infrastructure",
                  "bereavement checklist",
                  "life-event consequence graph",
                  "source-backed guidance"
                ]
              }
            ]
          })
        }}
      />

      {children}
      <CookieConsent lang={lang as Lang} />
    </>
  );
}

