import { Metadata } from "next";
import { LANGUAGES, type Lang } from "@/lib/i18n";
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
      description: "Clarvia is a Luxembourg non-profit. Your donation helps us maintain our free, trilingual bereavement checklists and support families when they need it most.",
    },
    fr: {
      title: "Soutenir Clarvia - Aidez-nous à garder notre guide de deuil gratuit",
      description: "Clarvia est une ASBL luxembourgeoise. Votre don nous aide à maintenir nos listes de démarches de deuil gratuites et trilingues pour toutes les familles.",
    },
    de: {
      title: "Clarvia unterstützen - Helfen Sie uns, die Trauerbegleitung kostenlos zu halten",
      description: "Clarvia ist ein luxemburgischer gemeinnütziger Verein. Ihre Spende hilft uns, unsere kostenlosen, dreisprachigen Checklisten für Familien zu pflegen.",
    },
    lu: {
      title: "Clarvia ënnerstëtzen - Hëlleft eis, de Guide fir de Trauerfall gratis ze halen",
      description: "Clarvia ass eng lëtzebuergesch A.s.b.l. Är Spend hëlleft eis, eis gratis, méisproocheg Checklëschten ze pflegen an d'Familljen z'ënnerstëtzen, wa si se am meeschte brauchen.",
    },
  };

  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/support`,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l, `${BASE_URL}/${l}/support`])
      ),
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
