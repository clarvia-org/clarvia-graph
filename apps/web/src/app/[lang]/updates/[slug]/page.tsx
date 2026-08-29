import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Lang, LANGUAGES, l } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";
import { UPDATES } from "../updates-data";
import {
  FEATURED_UPDATE_DATES,
  FEATURED_UPDATE_SLUGS,
  featuredUpdateCategory,
  type FeaturedUpdateSlug,
} from "@/content/featured-updates";

function isFeaturedSlug(value: string): value is FeaturedUpdateSlug {
  return (FEATURED_UPDATE_SLUGS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return FEATURED_UPDATE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  if (!isFeaturedSlug(slug)) return {};
  const update = UPDATES.find((entry) => entry.date === FEATURED_UPDATE_DATES[slug]);
  const title = update
    ? `${update.headline[lang] || update.headline.en} | Clarvia`
    : "Updates | Clarvia";
  return pageMetadata({
    lang,
    pathAfterLang: `updates/${slug}`,
    title,
    description: (update?.body?.[lang] || update?.body?.en || "").slice(0, 160),
    translated: Boolean(update?.body && update.body.fr && update.body.de && update.body.lu),
  });
}

export default async function UpdateArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang as Lang) || "en";
  if (!isFeaturedSlug(slug)) notFound();
  const update = UPDATES.find((entry) => entry.date === FEATURED_UPDATE_DATES[slug]);
  if (!update?.body) notFound();

  const date = new Date(update.date + "T00:00:00").toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "lu" ? "lb-LU" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      <Header lang={lang} />
      <main
        id="main-content"
        className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <p className="text-sm text-calm-blue-500 mb-3">
          {featuredUpdateCategory(lang, slug)} · <time dateTime={update.date}>{date}</time>
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mb-8" style={headlineStyle}>
          {update.headline[lang] || update.headline.en}
        </h1>
        <div className="text-base text-calm-blue-700 leading-relaxed whitespace-pre-line">
          {update.body[lang] || update.body.en}
        </div>
        <p className="mt-12">
          <Link
            href={`/${lang}/updates`}
            className="text-sm font-medium text-calm-blue-600 underline"
          >
            {l(
              lang,
              "Back to updates",
              "Retour aux actualités",
              "Zurück zu Aktuelles",
              "Zréck op d'Neiegkeeten",
            )}
          </Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
