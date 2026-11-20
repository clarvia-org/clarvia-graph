import { type Metadata } from "next";
import AssociateMembershipPage from "@/features/membership/AssociateMembershipPage";
import { getMembershipMeta } from "@/features/membership/membership-copy";
import {
  generateSiteLangStaticParams,
  hreflangLanguages,
  LANGUAGES,
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

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/membership`,
      languages: hreflangLanguages("membership"),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/membership`,
      siteName: "Clarvia",
      locale: lang,
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

  return <AssociateMembershipPage lang={lang} />;
}

export const dynamicParams = false;
export { generateSiteLangStaticParams as generateStaticParams };
