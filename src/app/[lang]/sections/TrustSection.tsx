import { type Lang, l } from "@/lib/i18n";
import Image from "next/image";
import { headlineStyle, SUPPORTERS, FOUNDERS, PRINCIPLES } from "../data";

export default function TrustSection({ lang }: { lang: Lang }) {
  return (
    <>
      {/* ═══ Supported By ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Supporters and future pilot partners", "Soutiens et futurs partenaires pilotes", "Unterstützer und zukünftige Pilotpartner", "Ënnerstëtzer an zukünfteg Pilotpartner")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {SUPPORTERS.map((supporter, idx) => (
            <div key={idx} className="glass-panel p-6 sm:p-8 flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-col items-center mb-6">
                  <div className="h-16 flex items-center justify-center mb-4">
                    <a href={supporter.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-full w-40 bg-white rounded-lg px-4 py-2 shadow-sm border border-calm-blue-100 hover:shadow-md transition-shadow relative">
                      <Image src={supporter.logo} alt={supporter.name} width={160} height={64} className="max-h-full max-w-full object-contain" />
                    </a>
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2" style={{ color: "#2b3a67" }}>
                    <a href={supporter.url} target="_blank" rel="noopener noreferrer" className="hover:text-calm-lilac-600 transition-colors">
                      {supporter.name}
                    </a>
                  </h3>
                  <p className="text-sm text-calm-blue-600 leading-relaxed text-center md:min-h-[4.5rem] flex items-center justify-center break-words">
                    {l(lang, supporter.description.en, supporter.description.fr, supporter.description.de)}
                  </p>
                </div>

                <blockquote className="bg-calm-lilac-50/60 rounded-xl p-5 border border-calm-lilac-100/60 mb-6">
                  <p className="text-sm text-calm-blue-700 leading-relaxed italic text-center break-words">
                    &ldquo;{l(lang, supporter.quote.en, supporter.quote.fr, supporter.quote.de)}&rdquo;
                  </p>
                </blockquote>
              </div>

              <p className="text-xs text-calm-blue-500 leading-relaxed text-center mt-auto pt-2 border-t border-calm-blue-100/30 break-words">
                {l(lang, supporter.thanks.en, supporter.thanks.fr, supporter.thanks.de)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Who We Are ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Founded by people with care-sector and technology experience", "Fondé par des personnes issues du secteur du soin et de la technologie", "Gegründet von Menschen mit Erfahrung im Pflegebereich und in der Technologie", "Gegrënnt vu Leit mat Erfarung am Fleegesecteur an an der Technologie")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
          {FOUNDERS.map((f, i) => (
            <div key={i} className="glass-panel p-6 sm:p-8 flex flex-col items-center text-center">
              <Image src={f.photo} alt={f.name} width={96} height={96} className={`w-24 h-24 rounded-full object-cover border-3 border-white shadow-md mb-4${i === 1 ? " [transform:scaleX(-1)]" : ""}`} style={f.photo.includes("gunther") ? { objectPosition: "center 20%" } : undefined} />
              <h3 className="text-xl font-semibold mb-1" style={{ color: "#2b3a67" }}>{f.name}</h3>
              <p className="text-sm font-medium text-calm-lilac-500 mb-3">{l(lang, f.title.en, f.title.fr, f.title.de)}</p>
              <p className="text-base text-calm-blue-600 leading-relaxed">{l(lang, f.bio.en, f.bio.fr, f.bio.de)}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-calm-blue-500 text-center">
          {l(lang, "Clarvia's directors serve voluntarily and without remuneration.", "Les administrateurs de Clarvia exercent leur mandat bénévolement et sans rémunération.", "Die Mitglieder des Verwaltungsrats von Clarvia arbeiten ehrenamtlich und unentgeltlich.", "D'Direktere vu Clarvia schaffen fräiwëlleg an ouni Bezuelung.")}
        </p>
      </section>

      {/* ═══ Our Principles ═══ */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={headlineStyle}>
          {l(lang, "Built with care", "Conçu avec soin", "Mit Sorgfalt entwickelt", "Mat Suergfalt opgebaut")}
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
