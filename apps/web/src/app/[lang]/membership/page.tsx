import { type Metadata } from "next";
import AssociateMembershipPage from "@/features/membership/AssociateMembershipPage";
import { getMembershipMeta } from "@/features/membership/membership-copy";
import {
  generateSiteLangStaticParams,
  hreflangLanguages,
  LANGUAGES,
  l,
  type Lang,
} from "@/lib/i18n";

const BASE_URL = "https://clarvia.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = getMembershipMeta(lang);
  const canonical = `${BASE_URL}/${lang}/membership`;

  return {
    title: meta.title,
    description: meta.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: hreflangLanguages("membership"),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: "Clarvia",
      locale: lang === "lu" ? "lb" : lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function MembershipRoutePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = getMembershipMeta(lang);
  const canonicalUrl = `${BASE_URL}/${lang}/membership`;
  const bcp47Lang = lang === "lu" ? "lb" : lang;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Clarvia",
            item: `${BASE_URL}/${lang}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: l(
              lang,
              "Associate Membership",
              "Membres adhérents",
              "Fördermitgliedschaft",
              "Assoziéiert Memberschaft",
            ),
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": canonicalUrl,
        name: meta.title,
        description: meta.description,
        url: canonicalUrl,
        inLanguage: bcp47Lang,
        isPartOf: {
          "@id": "https://clarvia.org/#website",
        },
        about: {
          "@id": "https://clarvia.org/#organization",
        },
        publisher: {
          "@id": "https://clarvia.org/#organization",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AssociateMembershipPage lang={lang} />
    </>
  );
}

export const dynamicParams = false;
export { generateSiteLangStaticParams as generateStaticParams };
