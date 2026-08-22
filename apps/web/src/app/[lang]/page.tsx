import { type Metadata } from "next";
import { type Lang, LANGUAGES } from "@/lib/i18n";
import Header from "@/components/Header";
import HeroSection from "./sections/HeroSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FormsSection from "./sections/FormsSection";
import FooterSection from "./sections/FooterSection";

const BASE_URL = "https://clarvia.org";

const HOME_META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Not sure what to do when a loved one is terminally ill or has died? — Clarvia",
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
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = HOME_META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
      languages: Object.fromEntries(
        LANGUAGES.map((code) => [code === "lu" ? "lb" : code, `${BASE_URL}/${code}`])
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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />

      <main id="main-content" className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <HeroSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <FormsSection lang={lang} showFeedback={false} showContact />
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
