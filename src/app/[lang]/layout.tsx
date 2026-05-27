import { Metadata } from "next";
import { LANGUAGES, type Lang, COUNTRIES, l } from "@/lib/i18n";

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
            "@type": "Organization",
            "name": "Clarvia ASBL",
            "url": "https://clarvia.org",
            "logo": "https://clarvia.org/clarvia-logo.png",
            "description": "Clarvia helps bereaved families navigate administrative processes across Europe.",
            "foundingDate": "2025",
            "foundingLocation": {
              "@type": "Place",
              "name": "Luxembourg"
            },
            "nonprofitStatus": "NonprofitASBL",
            "areaServed": {
              "@type": "Place",
              "name": "Luxembourg"
            },
            "sameAs": [
              "https://github.com/clarvia-org",
              "https://clarvia.eu"
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
    </>
  );
}

