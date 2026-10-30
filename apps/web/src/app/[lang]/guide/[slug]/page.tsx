import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";
import { parseAskLocale, siteLangForAskLocale } from "@/lib/ask-entry";
import {
  GUIDE_LOCALE_LABELS,
  type GuideLocale,
  getGuideUiCopy,
} from "@/content/corridor-guide-ui";
import {
  corridorGuideHreflangAlternates,
  corridorGuidePath,
  getCorridorGuideBySlug,
  publishedCorridorGuideStaticParams,
} from "@/content/corridor-guides";
import GuideCtaClient from "./GuideCtaClient";

const BASE_URL = "https://clarvia.org";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedCorridorGuideStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const guide = getCorridorGuideBySlug(slug, lang);
  if (!guide) return {};

  const canonical = `${BASE_URL}${corridorGuidePath(guide.slug, lang)}`;
  const languages = corridorGuideHreflangAlternates(guide);
  const title = `${guide.title} | Clarvia`;
  const description = guide.cardSummary;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function CorridorGuidePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const guide = getCorridorGuideBySlug(slug, lang);
  if (!guide) notFound();

  const siteLang = siteLangForAskLocale(parseAskLocale(lang) ?? "en");
  const ui = getGuideUiCopy(lang);

  const relatedGuides = guide.relatedSlugs
    .map((relSlug) => {
      const sameLang = getCorridorGuideBySlug(relSlug, lang);
      if (sameLang) return { guide: sameLang, targetLang: lang };
      const enFallback = getCorridorGuideBySlug(relSlug, "en");
      return enFallback ? { guide: enFallback, targetLang: "en" } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const canonicalUrl = `${BASE_URL}${corridorGuidePath(guide.slug, lang)}`;
  const mailtoQuick = `mailto:lex@clarvia.org?subject=${encodeURIComponent(guide.mailtoSubject)}&body=${encodeURIComponent(guide.prefillQuestion)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: ui.breadcrumbGuidance,
            item: `${BASE_URL}/${siteLang}/guidance`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: guide.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: guide.title,
        description: guide.cardSummary,
        inLanguage: lang,
        dateModified: guide.lastReviewed,
        publisher: {
          "@id": "https://clarvia.org/#organization",
        },
        step: guide.steps.map((s) => ({
          "@type": "HowToStep",
          position: s.stepNumber,
          name: `${ui.stepPrefix} ${s.stepNumber}: ${s.title}`,
          url: `${canonicalUrl}#step-${s.stepNumber}`,
        })),
      },
    ],
  };

  const isCrossBorder =
    guide.countryOfDeathCode !== guide.citizenshipCountryCode;

  const alternateLocales = guide.locales.filter((code) => code !== lang);

  return (
    <>
      <Header lang={siteLang} />
      <main
        id="main-content"
        lang={lang}
        className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <nav className="text-sm text-calm-blue-500 mb-5" aria-label="Breadcrumb">
          <Link
            href={`/${siteLang}/guidance`}
            className="underline hover:text-calm-blue-800"
          >
            {ui.breadcrumbGuidance}
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{guide.region}</span>
          <span aria-hidden="true"> / </span>
          <span className="text-calm-blue-700 font-medium">
            {isCrossBorder
              ? `${guide.countryOfDeath} & ${guide.citizenshipCountry}`
              : guide.countryOfDeath}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center rounded-full bg-white/80 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-800">
            {isCrossBorder
              ? ui.crossBorderBadge(
                  guide.countryOfDeath,
                  guide.countryOfDeathCode,
                  guide.citizenshipCountry,
                  guide.citizenshipCountryCode,
                )
              : ui.jurisdictionBadge(
                  guide.countryOfDeath,
                  guide.countryOfDeathCode,
                )}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/80 border border-calm-blue-200 px-3 py-1 text-xs font-medium text-calm-blue-600">
            {ui.sourcesVerifiedBadge(guide.sources.length, guide.lastReviewed)}
          </span>

          {alternateLocales.map((altCode) => {
            const altLabel =
              GUIDE_LOCALE_LABELS[altCode as GuideLocale] ?? altCode.toUpperCase();
            const currentLabel =
              GUIDE_LOCALE_LABELS[lang as GuideLocale] ?? lang.toUpperCase();
            const altUi = getGuideUiCopy(altCode);
            return (
              <Link
                key={altCode}
                href={corridorGuidePath(guide.slug, altCode)}
                className="inline-flex items-center gap-1.5 rounded-full bg-calm-blue-50 hover:bg-calm-blue-100 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-800 transition-colors"
              >
                <span>
                  {ui.languageSwitchLabel} {currentLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="underline">{altUi.readInOtherLang(altLabel)}</span>
              </Link>
            );
          })}
        </div>

        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight mb-5"
          style={headlineStyle}
        >
          {guide.title}
        </h1>

        {/* Top Quick-Action CTA Box */}
        <div className="mb-8 rounded-xl border border-calm-blue-200 bg-white/75 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-calm-blue-800">
              {ui.topCtaTitle}
            </p>
            <p className="text-xs text-calm-blue-600 mt-0.5">
              {ui.topCtaSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#ask-bridge"
              className="btn-primary text-sm px-4 py-2.5 min-h-11 inline-flex items-center whitespace-nowrap"
            >
              {ui.topCtaButton}
            </a>
          </div>
        </div>

        {guide.introHtml ? (
          <div
            className="text-base text-calm-blue-700 leading-relaxed mb-8 space-y-3"
            dangerouslySetInnerHTML={{ __html: guide.introHtml }}
          />
        ) : null}

        {/* 5-Step Official Summary Checklist */}
        <section aria-labelledby="five-step-heading" className="mb-10">
          <div className="flex items-baseline justify-between mb-5 border-b border-calm-blue-200 pb-3">
            <h2
              id="five-step-heading"
              className="text-xl sm:text-2xl font-semibold text-calm-blue-800"
              style={headlineStyle}
            >
              {ui.fiveStepHeading}
            </h2>
            <span className="text-xs font-medium text-calm-blue-500">
              {ui.fiveStepSublabel}
            </span>
          </div>

          <ol className="space-y-6">
            {guide.steps.map((step) => (
              <li
                key={step.stepNumber}
                id={`step-${step.stepNumber}`}
                className="glass-panel p-5 sm:p-6 scroll-mt-24"
              >
                <div className="flex items-start gap-3.5 mb-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-calm-blue-800 text-white text-sm font-semibold">
                    {step.stepNumber}
                  </span>
                  <h3
                    className="text-lg sm:text-xl font-semibold text-calm-blue-800 pt-0.5"
                    style={headlineStyle}
                  >
                    {step.title}
                  </h3>
                </div>
                <div
                  className="text-base text-calm-blue-700 leading-relaxed space-y-3 pl-0 sm:pl-11"
                  dangerouslySetInnerHTML={{ __html: step.html }}
                />
              </li>
            ))}
          </ol>
        </section>

        {/* Mid-Page Institutional & Family Referral Banner */}
        <div className="my-8 rounded-xl border border-calm-blue-200 bg-calm-blue-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-calm-blue-800">
              {ui.midCtaTitle}
            </p>
            <p className="text-xs text-calm-blue-600 mt-1">
              {ui.midCtaSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href="#ask-bridge"
              className="btn-primary text-sm px-4 py-2 min-h-11 inline-flex items-center"
            >
              {ui.midCtaPrimary}
            </a>
            <a
              href={mailtoQuick}
              className="btn-secondary text-sm px-4 py-2 min-h-11 inline-flex items-center"
            >
              {ui.midCtaSecondary}
            </a>
          </div>
        </div>

        {/* Verified Official Authorities & Contacts */}
        {guide.contacts.length > 0 ? (
          <section aria-labelledby="official-contacts-heading" className="mb-10">
            <h2
              id="official-contacts-heading"
              className="text-xl font-semibold text-calm-blue-800 mb-4"
              style={headlineStyle}
            >
              {ui.contactsHeading}
            </h2>
            <div className="grid grid-cols-1 gap-3.5">
              {guide.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-xl border border-calm-blue-100 bg-white/75 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-baseline gap-1.5">
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-calm-blue-800 underline hover:text-calm-blue-900"
                      >
                        {contact.name}
                      </a>
                      <span className="text-xs font-medium text-calm-blue-500">
                        [{contact.source_id}]
                      </span>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-calm-blue-50 text-calm-blue-600 border border-calm-blue-100">
                      {contact.country_code} · {contact.kind.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-calm-blue-600 leading-relaxed">{contact.note}</p>
                  {contact.phone || contact.email ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-calm-blue-700 mt-2">
                      {contact.phone ? (
                        <span>
                          {ui.phoneLabel}: {contact.phone}
                        </span>
                      ) : null}
                      {contact.email ? (
                        <span>
                          {ui.emailLabel}: {contact.email}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Verified Official Sources */}
        <section aria-labelledby="official-sources-heading" className="mb-10">
          <h2
            id="official-sources-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-3"
            style={headlineStyle}
          >
            {ui.sourcesHeading}
          </h2>
          <ol className="list-none space-y-2 text-sm text-calm-blue-700">
            {guide.sources.map((source) => (
              <li key={source.id} className="flex items-start gap-2">
                <span className="font-semibold text-calm-blue-500 shrink-0">
                  [{source.id}]
                </span>
                <div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium text-calm-blue-800 hover:text-calm-blue-900"
                  >
                    {source.title}
                  </a>
                  <span className="text-calm-blue-600"> — {source.publisher}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Prominent Pre-Filled Ask Clarvia Web-Form & Email Funnel */}
        <GuideCtaClient
          slug={guide.slug}
          lang={lang}
          prefillQuestion={guide.prefillQuestion}
          mailtoSubject={guide.mailtoSubject}
          closingQuestion={guide.closingQuestion}
          caseDependentItems={guide.caseDependentItems}
        />

        {/* Localized Trust & Provenance Block */}
        <div className="mt-10 p-5 rounded-xl bg-white/50 border border-calm-blue-100">
          <h2 className="text-base font-semibold text-calm-blue-800 mb-2" style={headlineStyle}>
            {ui.trustHeading}
          </h2>
          <p className="text-sm text-calm-blue-600 leading-relaxed">
            {ui.trustBody(guide.lastReviewed)}
          </p>
        </div>

        {/* Hub-and-Spoke Related Corridor & Situation Guides */}
        {relatedGuides.length > 0 ? (
          <section aria-labelledby="related-guides-heading" className="mt-10">
            <h2
              id="related-guides-heading"
              className="text-lg font-semibold text-calm-blue-800 mb-3"
              style={headlineStyle}
            >
              {ui.relatedHeading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedGuides.map(({ guide: rel, targetLang }) => (
                <Link
                  key={`${targetLang}-${rel.slug}`}
                  href={corridorGuidePath(rel.slug, targetLang)}
                  className="glass-panel p-4 hover:shadow-md transition-shadow block"
                >
                  <p className="text-xs font-semibold text-calm-blue-500 mb-1">
                    {rel.countryOfDeathCode !== rel.citizenshipCountryCode
                      ? `${rel.countryOfDeathCode} ↔ ${rel.citizenshipCountryCode}`
                      : rel.countryOfDeathCode}
                  </p>
                  <p className="text-sm font-semibold text-calm-blue-800 leading-snug">
                    {rel.title.split(":")[0]}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-8">
          <Link
            href={`/${siteLang}/guidance`}
            className="text-sm font-medium text-calm-blue-600 underline hover:text-calm-blue-800"
          >
            {ui.backToGuidance}
          </Link>
        </p>
      </main>
      <FooterSection lang={siteLang} />
    </>
  );
}
