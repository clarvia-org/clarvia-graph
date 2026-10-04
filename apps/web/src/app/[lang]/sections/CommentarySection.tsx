import Link from "next/link";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function CommentarySection({ lang }: { lang: Lang }) {
  return (
    <section className="mb-20" aria-labelledby="commentary-heading">
      <h2 id="commentary-heading" className="text-2xl sm:text-3xl font-semibold text-center mb-6" style={headlineStyle}>
        {l(lang, "An outside perspective", "Un regard extérieur", "Eine Stimme von außen", "Eng Stëmm vu baussen")}
      </h2>
      <figure className="glass-panel p-6 sm:p-8 max-w-3xl mx-auto">
        <blockquote lang="de" className="text-lg text-calm-blue-700 leading-relaxed italic">
          „Menschlichkeit, wenn es bitter nötig ist, auch zur Selbsthilfe.“
        </blockquote>
        <figcaption className="mt-4 text-sm text-calm-blue-800">
          <span className="font-semibold">Uwe Schneider</span>
          {", "}
          {l(lang, "journalist and entrepreneur", "journaliste et entrepreneur", "Journalist und Unternehmer", "Journalist an Entrepreneur")}
          <span className="block mt-1 text-calm-blue-500">
            {l(lang, "Commentary published with the author's permission.", "Un témoignage publié avec l’autorisation de l’auteur.", "Gastbeitrag mit freundlicher Genehmigung des Autors.", "Gaaschtbäitrag mat der Erlaabnes vum Auteur publizéiert.")}
          </span>
        </figcaption>
        <Link href="/de/voices/uwe-schneider" className="inline-block mt-5 text-sm font-medium text-calm-blue-600 underline">
          {l(lang, "Read the commentary (German)", "Lire le témoignage (en allemand)", "Den Beitrag lesen", "De Bäitrag liesen (op Däitsch)")}
        </Link>
      </figure>
    </section>
  );
}
