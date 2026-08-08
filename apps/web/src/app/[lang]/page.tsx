import { type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import HeroSection from "./sections/HeroSection";
import VideoSection from "./sections/VideoSection";
import ProblemSection from "./sections/ProblemSection";
import ChecklistSection from "./sections/ChecklistSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FormsSection from "./sections/FormsSection";
import FooterSection from "./sections/FooterSection";
import LatestUpdatesSection from "./sections/LatestUpdatesSection";

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
        <VideoSection lang={lang} />
        <ProblemSection lang={lang} />
        <ChecklistSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <FormsSection lang={lang} />
        <LatestUpdatesSection lang={lang} />
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
