import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Lang, LANGUAGES, s1 } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../../../sections/FooterSection";
import { GuideTrustBlock } from "@/components/CountrySelector";
import { headlineStyle } from "../../../data";
import { GUIDANCE_COUNTRY, GUIDES, isGuideSlug } from "@/content/guidance";
import { GUIDE_BODIES } from "@/content/guide-bodies";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ country: GUIDANCE_COUNTRY.code, slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; country: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, country, slug } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const guide = GUIDES.find((item) => item.slug === slug);
  return pageMetadata({
    lang,
    pathAfterLang: `guidance/${country}/${slug}`,
    title: `${guide?.title ?? "Guidance"} — Clarvia`,
    description: guide?.card ?? s1("Published bereavement guidance from Clarvia."),
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string; country: string; slug: string }>;
}) {
  const { lang: rawLang, country, slug } = await params;
  const lang = (rawLang as Lang) || "en";
  if (country !== GUIDANCE_COUNTRY.code || !isGuideSlug(slug)) notFound();

  const guide = GUIDES.find((item) => item.slug === slug);
  const body = GUIDE_BODIES.find((item) => item.slug === slug);
  if (!guide || !body) notFound();

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <nav className="text-sm text-calm-blue-500 mb-6" aria-label={s1("Breadcrumb")}>
          <Link href={`/${lang}/guidance`} className="underline">
            {s1("Guidance")}
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{GUIDANCE_COUNTRY.label}</span>
          <span aria-hidden="true"> / </span>
          <span>{guide.title}</span>
        </nav>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-8" style={headlineStyle}>
          {body.headline}
        </h1>

        <div className="space-y-8 text-base text-calm-blue-700 leading-relaxed">
          {body.sections.map((section, index) => (
            <section key={index}>
              {section.title ? (
                <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
                  {section.title}
                </h2>
              ) : null}
              <div dangerouslySetInnerHTML={{ __html: section.html }} />
            </section>
          ))}
        </div>

        <GuideTrustBlock lastReviewed={guide.lastReviewed} />

        <p id="ask-bridge" className="mt-8 scroll-mt-24">
          <Link href={`/${lang}#ask-us`} className="btn-primary px-6 py-3 inline-flex items-center">
            {s1("Ask Clarvia")}
          </Link>
        </p>
        <p className="mt-6">
          <Link href={`/${lang}/guidance`} className="text-sm font-medium text-calm-blue-600 underline">
            {s1("Back to guidance")}
          </Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
