import { type Metadata } from "next";
import Link from "next/link";
import { siteAskHref } from "@/lib/ask-entry";
import { type Lang, LANGUAGES, l, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import { guidesForLanguage } from "@/content/guidance";
import { GUIDE_LOCALE_LABELS, type GuideLocale } from "@/content/corridor-guide-ui";
import { corridorGuidePath, publishedCorridorGuides } from "@/content/corridor-guides";
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
  const guideTargetLang = lang === "fr" || lang === "de" ? lang : "en";
  const corridorGuides = publishedCorridorGuides(guideTargetLang);

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

        {corridorGuides.length > 0 ? (
          <section className="mt-14" aria-labelledby="corridor-guides-heading">
            <h2
              id="corridor-guides-heading"
              className="text-2xl font-semibold text-calm-blue-800 mb-2"
              style={headlineStyle}
            >
              {l(
                lang,
                "Global Cross-Border & End-of-Life Checklists (English + Local Languages)",
                "Guides transfrontaliers et de fin de vie en 5 étapes (Français)",
                "Grenzüberschreitende & Vorsorge-Checklisten in 5 Schritten (Deutsch)",
              )}
            </h2>
            <p className="text-base text-calm-blue-600 leading-relaxed mb-6">
              {l(
                lang,
                "5-step official summary checklists with verified primary sources and direct access to Ask Clarvia for personalized case guidance.",
                "Listes de contrôle officielles en 5 étapes avec sources primaires vérifiées et accès direct à Ask Clarvia pour un accompagnement personnalisé.",
                "Offizielle 5-Schritte-Checklisten mit geprüften Primärquellen und direktem Zugang zu Ask Clarvia für persönliche Orientierung.",
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {corridorGuides.map((cg) => {
                const localCode = cg.locales.find((c) => c !== "en");
                const localLabel = localCode
                  ? GUIDE_LOCALE_LABELS[localCode as GuideLocale] ?? localCode.toUpperCase()
                  : null;
                return (
                  <Link
                    key={cg.slug}
                    href={corridorGuidePath(cg.slug, guideTargetLang)}
                    className="glass-panel p-6 hover:shadow-md transition-shadow block"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500">
                        {cg.countryOfDeathCode !== cg.citizenshipCountryCode
                          ? `${cg.countryOfDeath} (${cg.countryOfDeathCode}) ↔ ${cg.citizenshipCountry} (${cg.citizenshipCountryCode})`
                          : `${cg.countryOfDeath} (${cg.countryOfDeathCode})`}
                      </p>
                      {guideTargetLang === "en" && localLabel ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-calm-blue-50 text-calm-blue-700 border border-calm-blue-200">
                          EN + {localLabel}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold text-calm-blue-800 mb-2">
                      {cg.title}
                    </h3>
                    <p className="text-sm text-calm-blue-600 leading-relaxed">
                      {cg.cardSummary}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

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
export const dynamicParams = false;
export { generateSiteLangStaticParams as generateStaticParams } from '@/lib/i18n';
