import Image from "next/image";
import { type Lang, l, s1 } from "@/lib/i18n";
import { headlineStyle, SUPPORTERS } from "../data";

export default function OrgSupportSection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-16" aria-labelledby="org-support-heading">
      <h2
        id="org-support-heading"
        className="text-2xl sm:text-3xl font-semibold text-center mb-8"
        style={headlineStyle}
      >
        {s1("Organizations supporting the mission")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {SUPPORTERS.map((supporter) => (
          <div key={supporter.name} className="glass-panel p-6 flex flex-col items-center text-center">
            <a
              href={supporter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 w-40 bg-white rounded-lg px-3 py-2 border border-calm-blue-100 flex items-center justify-center mb-3"
            >
              <Image src={supporter.logo} alt={supporter.name} width={140} height={48} className="max-h-full object-contain" />
            </a>
            <h3 className="text-base font-semibold text-calm-blue-800 mb-2">{supporter.name}</h3>
            <p className="text-sm text-calm-blue-600 leading-relaxed">
              {l(lang, supporter.description.en, supporter.description.fr, supporter.description.de)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
