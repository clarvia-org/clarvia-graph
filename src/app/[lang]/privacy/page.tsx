import { Metadata } from "next";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import PrivacyPage from "./PrivacyPage";

const BASE_URL = "https://clarvia.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;

  const META = {
    en: {
      title: "Privacy & Cookie Policy - Clarvia",
      description: "Learn how Clarvia ASBL protects your privacy, uses cookies transparently, complies with GDPR, and manages your personal data.",
    },
    fr: {
      title: "Politique de confidentialité et cookies - Clarvia",
      description: "Découvrez comment Clarvia ASBL protège votre vie privée, utilise les cookies de manière transparente, respecte le RGPD et gère vos données.",
    },
    de: {
      title: "Datenschutz- und Cookie-Richtlinie - Clarvia",
      description: "Erfahren Sie, wie Clarvia ASBL Ihre Privatsphäre schützt, Cookies transparent nutzt, die DSGVO einhält und Ihre Daten verwaltet.",
    },
  };

  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/privacy`,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l, `${BASE_URL}/${l}/privacy`])
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/privacy`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default function Page() {
  return <PrivacyPage />;
}
