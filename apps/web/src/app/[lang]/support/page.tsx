import { Metadata } from "next";
import { LANGUAGES, type Lang, hreflangLanguages } from "@/lib/i18n";
import SupportPage from "./SupportPage";

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
      title: "Support Clarvia - Help us keep bereavement guidance free",
      description: "Your donation keeps Ask Clarvia free for families worldwide and helps us improve source-linked bereavement guidance.",
    },
    fr: {
      title: "Soutenir Clarvia - Aidez-nous à garder notre guide de deuil gratuit",
      description: "Votre don permet de garder Ask Clarvia gratuit pour les familles du monde entier et d'améliorer nos réponses avec des liens vers les sources.",
    },
    de: {
      title: "Clarvia unterstützen - Helfen Sie uns, die Trauerbegleitung kostenlos zu halten",
      description: "Ihre Spende hält Ask Clarvia für Familien weltweit kostenlos und hilft uns, unsere quellenbasierte Orientierung zu verbessern.",
    },
    lu: {
      title: "Clarvia ënnerstëtzen - Hëlleft eis, de Guide fir de Trauerfall gratis ze halen",
      description: "Ären Don hält Ask Clarvia fir Famillje weltwäit gratis an hëlleft eis, eis Orientéierung op Basis vu Quellen ze verbesseren.",
    },
  };

  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/support`,
      languages: hreflangLanguages("support"),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/support`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default function Page() {
  return <SupportPage />;
}
