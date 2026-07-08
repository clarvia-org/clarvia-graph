"use client";

import { useParams } from "next/navigation";
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

export default function LandingPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";

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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
