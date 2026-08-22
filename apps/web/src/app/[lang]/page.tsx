import { type Metadata } from "next";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import Header from "@/components/Header";
import HeroSection from "./sections/HeroSection";
import ProblemSection from "./sections/ProblemSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FormsSection from "./sections/FormsSection";
import FooterSection from "./sections/FooterSection";

const BASE_URL = "https://clarvia.org";

const HOME_META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Not sure what to do when a loved one is terminally ill or has died? — Clarvia",
    description:
      "Free guidance from a terminal diagnosis through the practical questions that can still arise years after a death.",
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
  lu: {
    title: "Clarvia — Familljen duerch dat begleeden, wat als Nächstes kënnt",
    description:
      "E gratis, méisproochege Guide fir all administrative Schrëtt no engem Doudesfall zu Lëtzebuerg. Kloer Fristen, kloer Prioritéiten. Keng Famill gëtt eleng gelooss.",
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
        <ProblemSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <p className="text-center text-base text-calm-blue-600 mb-20">
          <a href={`/${lang}/checklist`} className="underline hover:text-calm-blue-800">
            {l(
              lang,
              "Looking for step-by-step Luxembourg guidance? See the free bereavement checklist.",
              "Looking for step-by-step Luxembourg guidance? See the free bereavement checklist.",
              "Looking for step-by-step Luxembourg guidance? See the free bereavement checklist.",
              "Looking for step-by-step Luxembourg guidance? See the free bereavement checklist."
            )}
          </a>
        </p>
        <FormsSection lang={lang} showFeedback={false} showContact />
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
