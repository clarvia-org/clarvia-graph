import Link from "next/link";
import { type Lang, adsLanguageCode, l } from "@/lib/i18n";
import { UWE_COMMENTARY } from "@/content/uwe-commentary";
import { headlineStyle } from "../data";

export default function CommentarySection({ lang }: { lang: Lang }) {
  const copy = UWE_COMMENTARY[lang];
  return (
    <section className="mb-20" aria-labelledby="commentary-heading">
      <h2 id="commentary-heading" className="text-2xl sm:text-3xl font-semibold text-center mb-6" style={headlineStyle}>
        {l(lang, "An outside perspective", "Un regard extérieur", "Eine Stimme von außen", "Eng Stëmm vu baussen")}
      </h2>
      <figure className="glass-panel p-6 sm:p-8 max-w-3xl mx-auto">
        <blockquote lang={adsLanguageCode(lang)} className="text-lg text-calm-blue-700 leading-relaxed italic">
          {lang === "de" ? "„" : "“"}{copy.quote}{lang === "de" ? "“" : "”"}
        </blockquote>
        <figcaption className="mt-4 text-sm text-calm-blue-800">
          <span className="font-semibold">Uwe Schneider</span>
          {", "}{copy.role}
          <span className="block mt-1 text-calm-blue-500">
            {l(lang, "Commentary published with the author's permission.", "Une contribution publiée avec l’autorisation de l’auteur.", "Gastbeitrag mit freundlicher Genehmigung des Autors.", "Gaaschtbäitrag mat der Erlaabnes vum Auteur publizéiert.")}
            {" "}{copy.original}
          </span>
        </figcaption>
        <Link href={`/${lang}/voices/uwe-schneider`} className="inline-block mt-5 text-sm font-medium text-calm-blue-600 underline">
          {copy.link}
        </Link>
      </figure>
    </section>
  );
}
