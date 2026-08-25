import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, LANGUAGES, s1 } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import CountrySelector from "@/components/CountrySelector";
import { headlineStyle } from "../data";
import { GUIDES, guidePath } from "@/content/guidance";

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
    title: s1("Published bereavement guidance — Clarvia"),
    description: s1("Read source-linked bereavement guidance organised by country."),
  });
}

export default async function GuidanceHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6" style={headlineStyle}>
          {s1("Published bereavement guidance")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed mb-8">
          {s1(
            "Ask Clarvia is available worldwide. This library is organised by country. Select a country to read guidance Clarvia has prepared from reviewed, source-backed task data. If your situation involves another country, several countries, or facts that do not match a guide, ask Clarvia instead."
          )}
        </p>
        <CountrySelector lang={lang} id="guidance-country" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={guidePath(lang, guide.slug)}
              className="glass-panel p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-calm-blue-800 mb-2">{guide.title}</h2>
              <p className="text-base text-calm-blue-600 leading-relaxed">{guide.card}</p>
            </Link>
          ))}
        </div>
        <p className="mt-10">
          <Link href={`/${lang}#ask-us`} className="text-calm-blue-700 font-medium underline">
            {s1("Ask Clarvia")}
          </Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
