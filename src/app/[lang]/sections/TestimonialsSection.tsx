import { type Lang, l } from "@/lib/i18n";
import Image from "next/image";
import { headlineStyle, TESTIMONIALS } from "../data";

/* Use flagcdn.com for reliable flag rendering on all platforms */
function FlagImg({ code }: { code: string }) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${code}.png`}
      width={32}
      height={24}
      alt={code.toUpperCase()}
      className="rounded-sm shadow-sm"
    />
  );
}

export default function TestimonialsSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={headlineStyle}>
        {l(lang,
          "What families and professionals have told us",
          "Ce que les familles et les professionnels nous ont confié",
          "Was Familien und Fachleute uns gesagt haben"
        )}
      </h2>
      <p className="text-base sm:text-lg text-calm-blue-600 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
        {l(lang,
          "Clarvia is being shaped by people who have experienced bereavement administration first-hand, and by organisations that see families face these challenges in practice.",
          "Clarvia se construit avec des personnes qui ont vécu les démarches liées à un décès, ainsi qu'avec des organisations qui voient concrètement les difficultés auxquelles les familles sont confrontées.",
          "Clarvia entsteht im Austausch mit Menschen, die Verwaltungsfragen nach einem Todesfall selbst erlebt haben, und mit Organisationen, die Familien in solchen Situationen praktisch begleiten."
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="glass-panel p-6 sm:p-8 flex flex-col">
            <div className="mb-4">
              <FlagImg code={t.flag} />
            </div>
            <blockquote className="text-base text-calm-blue-700 leading-relaxed italic flex-grow">
              &ldquo;{l(lang, t.en, t.fr, t.de)}&rdquo;
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-calm-blue-800 pt-3 border-t border-calm-blue-100">
              - {l(lang, t.attribution.en, t.attribution.fr, t.attribution.de)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
