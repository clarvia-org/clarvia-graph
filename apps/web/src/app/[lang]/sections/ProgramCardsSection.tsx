import Link from "next/link";
import { siteAskHref } from "@/lib/ask-entry";
import { type Lang, l, tr } from "@/lib/i18n";
import { headlineStyle } from "../data";

type FlagshipGuideLink = {
  slug: string;
  targetLang: Record<Lang, string>;
  label: Record<Lang, string>;
};

const FLAGSHIP_GUIDES: readonly FlagshipGuideLink[] = [
  {
    slug: "us-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "United States",
      fr: "États-Unis",
      de: "Vereinigte Staaten",
      lu: "USA",
    },
  },
  {
    slug: "india-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "India",
      fr: "Inde",
      de: "Indien",
      lu: "Indien",
    },
  },
  {
    slug: "uk-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "United Kingdom",
      fr: "Royaume-Uni",
      de: "Vereinigtes Königreich",
      lu: "Groussbritannien",
    },
  },
  {
    slug: "brazil-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "Brazil",
      fr: "Brésil",
      de: "Brasilien",
      lu: "Brasilien",
    },
  },
  {
    slug: "mexico-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "Mexico",
      fr: "Mexique",
      de: "Mexiko",
      lu: "Mexiko",
    },
  },
  {
    slug: "germany-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "de", lu: "de" },
    label: {
      en: "Germany",
      fr: "Allemagne",
      de: "Deutschland",
      lu: "Däitschland",
    },
  },
  {
    slug: "france-bereavement-checklist",
    targetLang: { en: "en", fr: "fr", de: "en", lu: "fr" },
    label: {
      en: "France",
      fr: "France",
      de: "Frankreich",
      lu: "Frankräich",
    },
  },
  {
    slug: "canada-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "Canada",
      fr: "Canada",
      de: "Kanada",
      lu: "Kanada",
    },
  },
  {
    slug: "mexico-us-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "US ↔ Mexico",
      fr: "États-Unis ↔ Mexique",
      de: "USA ↔ Mexiko",
      lu: "USA ↔ Mexiko",
    },
  },
  {
    slug: "uae-india-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "UAE ↔ India",
      fr: "ÉAU ↔ Inde",
      de: "VAE ↔ Indien",
      lu: "VAE ↔ Indien",
    },
  },
  {
    slug: "spain-uk-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "en", lu: "en" },
    label: {
      en: "UK ↔ Spain",
      fr: "Royaume-Uni ↔ Espagne",
      de: "UK ↔ Spanien",
      lu: "UK ↔ Spuenien",
    },
  },
  {
    slug: "morocco-france-bereavement-checklist",
    targetLang: { en: "en", fr: "fr", de: "en", lu: "fr" },
    label: {
      en: "France ↔ Morocco",
      fr: "France ↔ Maroc",
      de: "Frankreich ↔ Marokko",
      lu: "Frankräich ↔ Marokko",
    },
  },
  {
    slug: "turkey-germany-bereavement-checklist",
    targetLang: { en: "en", fr: "en", de: "de", lu: "de" },
    label: {
      en: "Germany ↔ Turkey",
      fr: "Allemagne ↔ Turquie",
      de: "Deutschland ↔ Türkei",
      lu: "Däitschland ↔ Tierkei",
    },
  },
];

export default function ProgramCardsSection({ lang }: { lang: Lang }) {
  const cards = [
    {
      href: siteAskHref(lang),
      title: tr(lang, "Ask Clarvia"),
      body: tr(
        lang,
        "Describe what happened in your own language. Receive a sourced reply by email from anywhere, free and without an account.",
      ),
      action: tr(lang, "Ask now"),
    },
    {
      href: `/${lang}/guidance`,
      title: tr(lang, "Published guidance"),
      body: tr(
        lang,
        "Read practical, source-linked guides prepared from information Clarvia has reviewed for publication.",
      ),
      action: tr(lang, "Browse guidance"),
    },
    {
      href: `/${lang}/how-it-works`,
      title: tr(lang, "How answers are sourced"),
      body: tr(
        lang,
        "See how Clarvia uses official sources, maintained legislation, human review, and AI, including the limits of each approach.",
      ),
      action: tr(lang, "How it works"),
    },
    {
      href: `/${lang}/for-institutions`,
      title: tr(lang, "For institutions"),
      body: tr(
        lang,
        "Explore open data and reusable infrastructure designed to help public-interest services publish clearer administrative guidance.",
      ),
      action: tr(lang, "Explore reuse"),
    },
  ];

  return (
    <section className="mb-16" aria-labelledby="programs-heading">
      <h2 id="programs-heading" className="sr-only">
        {tr(lang, "Programs")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass-panel p-6 flex flex-col hover:shadow-md transition-shadow focus-visible:outline-2 focus-visible:outline-calm-blue-400"
          >
            <h3 className="text-lg font-semibold text-calm-blue-800 mb-2" style={headlineStyle}>
              {card.title}
            </h3>
            <p className="text-base text-calm-blue-600 leading-relaxed flex-grow mb-4">
              {card.body}
            </p>
            <span className="text-calm-blue-700 font-medium underline underline-offset-2">
              {card.action}
            </span>
          </Link>
        ))}
      </div>

      <nav
        aria-label={l(
          lang,
          "High-demand country and cross-border checklists",
          "Guides nationaux et internationaux les plus consultés",
          "Häufig gesuchte Länder- und grenzüberschreitende Checklisten",
          "Dacks gesichte Länner- a grenzüberschreidend Checklëschten",
        )}
        className="glass-panel px-5 py-4 mt-5 max-w-5xl mx-auto"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-calm-blue-700 mr-1">
            {l(
              lang,
              "Direct checklists:",
              "Accès direct :",
              "Direktzugriff:",
              "Direkten Zougrëff:",
            )}
          </span>
          {FLAGSHIP_GUIDES.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.targetLang[lang]}/guide/${item.slug}`}
              className="inline-flex items-center rounded-full border border-calm-blue-200 bg-white/80 hover:bg-calm-blue-50 px-3 py-1 text-xs font-medium text-calm-blue-800 transition-colors"
            >
              {item.label[lang]}
            </Link>
          ))}
          <Link
            href={`/${lang}/guidance`}
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-calm-blue-700 underline hover:text-calm-blue-900"
          >
            {l(
              lang,
              "All 196 countries →",
              "Les 196 pays →",
              "Alle 196 Länder →",
              "All 196 Länner →",
            )}
          </Link>
        </div>
      </nav>
    </section>
  );
}
