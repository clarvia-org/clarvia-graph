import type { Metadata } from "next";
import { type Lang, hreflangLanguages } from "@/lib/i18n";

const BASE_URL = "https://clarvia.org";

export function pageMetadata({
  lang,
  pathAfterLang,
  title,
  description,
  translated = false,
  index = true,
}: {
  lang: Lang;
  pathAfterLang: string;
  title: string;
  description: string;
  translated?: boolean;
  index?: boolean;
}): Metadata {
  const canonical = pathAfterLang ? `${BASE_URL}/${lang}/${pathAfterLang}` : `${BASE_URL}/${lang}`;
  return {
    title,
    description,
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    alternates: {
      canonical,
      ...(translated ? { languages: hreflangLanguages(pathAfterLang) } : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}
