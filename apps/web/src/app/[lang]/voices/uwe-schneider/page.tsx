import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/page-meta";
import { adsLanguageCode, isLang } from "@/lib/i18n";
import { siteAskHref } from "@/lib/ask-entry";
import { UWE_COMMENTARY } from "@/content/uwe-commentary";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const copy = UWE_COMMENTARY[lang];
  return pageMetadata({
    lang,
    pathAfterLang: "voices/uwe-schneider",
    title: `${copy.title}: Uwe Schneider | Clarvia`,
    description: copy.description,
    translated: true,
  });
}

export default async function CommentaryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const copy = UWE_COMMENTARY[lang];

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <p className="text-sm text-calm-blue-500 mb-3">
          {copy.category} · {copy.published} <time dateTime="2026-10-04">{copy.date}</time>
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mb-6" style={headlineStyle}>
          {copy.title}
        </h1>
        <p className="text-base font-medium text-calm-blue-800 mb-2">
          Uwe Schneider, {copy.role}
        </p>
        <p className="text-sm text-calm-blue-500 mb-8">Berlin / Potsdam / Usedom</p>
        <div className="text-sm text-calm-blue-600 leading-relaxed mb-10 border-l-2 border-calm-blue-200 pl-4 space-y-3">
          <p>{copy.note}</p>
          <p>
            {copy.original}
            {lang !== "de" && (
              <>{" "}<Link href="/de/voices/uwe-schneider" hrefLang="de" className="underline">{copy.originalLink}</Link></>
            )}
          </p>
        </div>
        <article lang={adsLanguageCode(lang)} aria-label={copy.articleLabel} className="space-y-6 text-base text-calm-blue-700 leading-relaxed">
          {copy.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </article>
        <div className="mt-12 glass-panel p-6">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>{copy.ctaTitle}</h2>
          <p className="text-calm-blue-700 mb-4">{copy.ctaBody}</p>
          <Link href={siteAskHref(lang)} className="font-medium text-calm-blue-600 underline">{copy.cta}</Link>
        </div>
        <p className="mt-10">
          <Link href={`/${lang}`} className="text-sm font-medium text-calm-blue-600 underline">{copy.back}</Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
