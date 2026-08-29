import { type Metadata } from "next";
import { type Lang, LANGUAGES, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import MissionHero from "./sections/MissionHero";
import ProgramCardsSection from "./sections/ProgramCardsSection";
import HeroSection from "./sections/HeroSection";
import GuidancePreviewSection from "./sections/GuidancePreviewSection";
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
    description: tr(
      lang,
      "Free bereavement guidance from Clarvia ASBL, with links to the sources used. Ask Clarvia, read a published guide, or use the checklist.",
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
        <GuidancePreviewSection lang={lang} />
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
