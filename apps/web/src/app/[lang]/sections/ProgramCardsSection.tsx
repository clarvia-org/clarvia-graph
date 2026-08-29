import Link from "next/link";
import { type Lang, tr } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function ProgramCardsSection({ lang }: { lang: Lang }) {
  const cards = [
    {
      href: `/${lang}#ask-us`,
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
        "Read practical, source-linked pages based on guidance Clarvia has reviewed and approved for publication. Choose a country to see the guides for that place.",
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
    </section>
  );
}
