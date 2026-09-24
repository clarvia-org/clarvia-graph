import { type Metadata } from "next";
import Link from "next/link";
import { siteAskHref } from "@/lib/ask-entry";
import { type Lang, LANGUAGES, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import { guidesForLanguage } from "@/content/guidance";
import GuidanceBrowser from "./GuidanceBrowser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "guidance",
    title: tr(lang, "Published bereavement guidance | Clarvia"),
    description: tr(
      lang,
      "Read bereavement guidance organised by country, with links to the official sources used.",
    ),
    translated: true,
  });
}

export default async function GuidanceHubPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";
  const guides = guidesForLanguage(lang);

  return (
    <>
      <Header lang={lang} />
      <main
        id="main-content"
        className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {tr(lang, "Published bereavement guidance")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed mb-8">
          {tr(
            lang,
            "Browse practical guides prepared from reviewed information, with links to the official sources used. You can also ask Clarvia about your own situation.",
          )}
        </p>
        <GuidanceBrowser lang={lang} guides={guides} />
        <p className="mt-10">
          <Link href={siteAskHref(lang)} className="text-calm-blue-700 font-medium underline">
            {tr(lang, "Ask Clarvia")}
          </Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
