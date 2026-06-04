import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, FOUNDING_STORIES } from "../data";

export default function FoundingSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
        {l(lang, "Why we founded Clarvia", "Pourquoi nous avons fondé Clarvia", "Warum wir Clarvia gegründet haben")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {FOUNDING_STORIES.map((f, i) => (
          <div key={i} className="glass-panel p-8 sm:p-10 flex flex-col">
            <blockquote className="text-base leading-relaxed text-calm-blue-700 space-y-4 flex-grow">
              <p>&ldquo;{l(lang, f.quote1.en, f.quote1.fr, f.quote1.de)}</p>
              <p>{l(lang, f.quote2.en, f.quote2.fr, f.quote2.de)}&rdquo;</p>
            </blockquote>
            <div className="mt-6 flex items-center gap-4">
              <img src={f.photo} alt={f.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" style={f.photo.includes("gunther") ? { objectPosition: "center 20%" } : undefined} />
              <div>
                <p className="font-semibold text-calm-blue-800">{f.name}</p>
                <p className="text-sm text-calm-blue-500">{l(lang, f.title.en, f.title.fr, f.title.de)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
