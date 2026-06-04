import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, SUPPORTER, FOUNDERS, PRINCIPLES } from "../data";

export default function TrustSection({ lang }: { lang: Lang }) {
  return (
    <>
      {/* ═══ Supported By ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Supported by", "Avec le soutien de", "Unterstützt von")}
        </h2>

        <div className="glass-panel p-8 sm:p-10 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <a href={SUPPORTER.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <img src={SUPPORTER.logo} alt={SUPPORTER.name} className="h-14 object-contain rounded bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow" />
            </a>
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "#2b3a67" }}>
                <a href={SUPPORTER.url} target="_blank" rel="noopener noreferrer" className="hover:text-calm-lilac-600 transition-colors">
                  {SUPPORTER.name}
                </a>
              </h3>
              <p className="text-base text-calm-blue-600 leading-relaxed">
                {l(lang, SUPPORTER.description.en, SUPPORTER.description.fr, SUPPORTER.description.de)}
              </p>
            </div>
          </div>

          <blockquote className="bg-calm-lilac-50/60 rounded-xl p-5 border border-calm-lilac-100/60 mb-6">
            <p className="text-base text-calm-blue-700 leading-relaxed italic text-center">
              &ldquo;{l(lang, SUPPORTER.quote.en, SUPPORTER.quote.fr, SUPPORTER.quote.de)}&rdquo;
            </p>
          </blockquote>

          <p className="text-sm text-calm-blue-500 leading-relaxed text-center">
            {l(lang,
              "We are grateful for TSC Real Estate's early support for Clarvia's mission to make practical bereavement guidance free and accessible to families.",
              "Nous remercions TSC Real Estate pour son soutien précoce à la mission de Clarvia : rendre l'accompagnement pratique après un décès gratuit et accessible aux familles.",
              "Wir danken TSC Real Estate für die frühe Unterstützung von Clarvias Mission, praktische Orientierung im Trauerfall für Familien kostenlos und zugänglich zu machen."
            )}
          </p>
        </div>
      </section>

      {/* ═══ Who We Are ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang,
            "Founded by people with care-sector and technology experience",
            "Fondé par des personnes issues du secteur du soin et de la technologie",
            "Gegründet von Menschen mit Erfahrung im Pflegebereich und in der Technologie"
          )}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
          {FOUNDERS.map((f, i) => (
            <div key={i} className="glass-panel p-6 sm:p-8 flex flex-col items-center text-center">
              <img src={f.photo} alt={f.name} className={`w-24 h-24 rounded-full object-cover border-3 border-white shadow-md mb-4${i === 1 ? " [transform:scaleX(-1)]" : ""}`} style={f.photo.includes("gunther") ? { objectPosition: "center 20%" } : undefined} />
              <h3 className="text-xl font-semibold mb-1" style={{ color: "#2b3a67" }}>{f.name}</h3>
              <p className="text-sm font-medium text-calm-lilac-500 mb-3">{l(lang, f.title.en, f.title.fr, f.title.de)}</p>
              <p className="text-base text-calm-blue-600 leading-relaxed">{l(lang, f.bio.en, f.bio.fr, f.bio.de)}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-calm-blue-500 text-center">
          {l(lang,
            "Clarvia's directors serve voluntarily and without remuneration.",
            "Les administrateurs de Clarvia exercent leur mandat bénévolement et sans rémunération.",
            "Die Mitglieder des Verwaltungsrats von Clarvia arbeiten ehrenamtlich und unentgeltlich."
          )}
        </p>
      </section>

      {/* ═══ Our Principles ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Built with care", "Conçu avec soin", "Mit Sorgfalt entwickelt")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {PRINCIPLES.map((p, i) => (
            <div key={i} className="glass-panel p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{p.icon}</span>
                <div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: "#2b3a67" }}>
                    {l(lang, p.en_title, p.fr_title, p.de_title)}
                  </h3>
                  <p className="text-sm text-calm-blue-600 leading-relaxed">
                    {l(lang, p.en, p.fr, p.de)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
