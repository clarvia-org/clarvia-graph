import Link from "next/link";
import { type Lang, tr } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function MissionHero({ lang }: { lang: Lang }) {
  return (
    <section className="text-center py-12 sm:py-16">
      <p className="text-sm font-semibold tracking-wide uppercase text-calm-blue-500 mb-4">
        {tr(lang, "Free bereavement guidance from Clarvia ASBL")}
      </p>
      <h1
        className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 drop-shadow-sm max-w-4xl mx-auto"
        style={headlineStyle}
      >
        {tr(lang, "Clear next steps after someone dies.")}
      </h1>
      <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-8">
        {tr(
          lang,
          "Clarvia helps families worldwide find free, source-linked guidance through Ask Clarvia, published guides, and a growing bereavement checklist.",
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <Link
          href={`/${lang}#ask-us`}
          className="btn-primary px-8 py-3 text-base min-h-11 inline-flex items-center"
        >
          {tr(lang, "Ask Clarvia")}
        </Link>
        <Link
          href={`/${lang}/guidance`}
          className="btn-secondary px-8 py-3 text-base min-h-11 inline-flex items-center"
        >
          {tr(lang, "Read published guidance")}
        </Link>
      </div>
      <p className="text-sm text-calm-blue-500">
        {tr(lang, "Free · No account · Reply by email · Available worldwide")}
      </p>
    </section>
  );
}
