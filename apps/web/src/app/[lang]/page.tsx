import { type Metadata } from "next";
import { type Lang, LANGUAGES, l, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import MissionHero from "./sections/MissionHero";
import ProgramCardsSection from "./sections/ProgramCardsSection";
import HeroSection from "./sections/HeroSection";
import HomeMissionSection from "./sections/HomeMissionSection";
import HowTrustWorksSection from "./sections/HowTrustWorksSection";
import OrgSupportSection from "./sections/OrgSupportSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import LatestUpdatesSection from "./sections/LatestUpdatesSection";
import FooterSection from "./sections/FooterSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "",
    title: tr(lang, "Clear next steps after someone dies. | Clarvia"),
    description: l(
      lang,
      "Free bereavement guidance from Clarvia ASBL, with links to the sources used. Ask Clarvia or read a published guide.",
      "Une aide gratuite de Clarvia ASBL pour les familles confrontées à la fin de vie ou au décès d’un proche. Posez une question à Ask Clarvia ou consultez nos guides publiés.",
      "Kostenlose Orientierung von Clarvia ASBL bei schwerer Krankheit und nach einem Todesfall. Fragen Sie Ask Clarvia oder lesen Sie unsere veröffentlichten Leitfäden.",
      "Gratis Orientéierung vu Clarvia ASBL bei schwéierer Krankheet an no engem Doudesfall. Stellt Ask Clarvia eng Fro oder liest eis publizéiert Guiden.",
    ),
    translated: true,
  });
}

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />

      <main
        id="main-content"
        className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10"
      >
        <MissionHero lang={lang} />
        <ProgramCardsSection lang={lang} />
        <HeroSection lang={lang} />
        <HomeMissionSection lang={lang} />
        <HowTrustWorksSection lang={lang} />
        <OrgSupportSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <LatestUpdatesSection lang={lang} />
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
