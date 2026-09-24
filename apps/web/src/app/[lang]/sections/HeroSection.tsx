import Link from "next/link";
import { type Lang, l, tr } from "@/lib/i18n";
import { siteAskHref } from "@/lib/ask-entry";
import { headlineStyle } from "../data";

const EXAMPLES: Record<Lang, { title: string; question: string }[]> = {
  en: [
    { title: "Before a death", question: "What should we arrange while my partner is seriously ill?" },
    { title: "First steps", question: "My father died yesterday. What should I do first?" },
    { title: "Across borders", question: "My mother died in another country. Where do we begin?" },
  ],
  fr: [
    { title: "Avant un décès", question: "Que devrions-nous prévoir maintenant que mon conjoint est gravement malade ?" },
    { title: "Premières démarches", question: "Mon père est décédé hier. Par quoi commencer ?" },
    { title: "Entre plusieurs pays", question: "Ma mère est décédée dans un autre pays. Par où commencer ?" },
  ],
  de: [
    { title: "Vor einem Todesfall", question: "Was sollten wir regeln, während mein Partner schwer krank ist?" },
    { title: "Erste Schritte", question: "Mein Vater ist gestern gestorben. Wo fange ich an?" },
    { title: "Über Ländergrenzen hinweg", question: "Meine Mutter ist in einem anderen Land gestorben. Wo beginnen wir?" },
  ],
  lu: [
    { title: "Virun engem Doudesfall", question: "Wat solle mir regelen, wärend mäi Partner schwéier krank ass?" },
    { title: "Déi éischt Schrëtt", question: "Mäi Papp ass gëschter gestuerwen. Wou fänken ech un?" },
    { title: "Iwwer d’Grenzen ewech", question: "Meng Mamm ass an engem anere Land gestuerwen. Wou fänke mir un?" },
  ],
};

export default function HeroSection({ lang }: { lang: Lang }) {
  return (
    <section id="ask-us" className="mb-16 scroll-mt-24 text-center" aria-labelledby="ask-heading">
      <h2 id="ask-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4" style={headlineStyle}>
        {l(lang, "One question is enough to begin", "Une question suffit pour commencer", "Eine Frage reicht für den Anfang", "Eng Fro geet duer fir unzefänken")}
      </h2>
      <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-8">
        {l(
          lang,
          "When someone you love is dying or has died, ask about what matters today. Ask Clarvia sends practical guidance with links to sources you can check, then you can reply by email with more questions.",
          "Quand un proche est en fin de vie ou est décédé, posez la question qui vous préoccupe aujourd’hui. Ask Clarvia vous envoie des repères pratiques et des liens vers les sources à consulter. Vous pouvez ensuite poser d’autres questions en répondant à l’e-mail.",
          "Wenn ein geliebter Mensch im Sterben liegt oder gestorben ist, fragen Sie, was Sie gerade beschäftigt. Ask Clarvia schickt Ihnen praktische Orientierung mit Links zu Quellen. Weitere Fragen können Sie einfach per E-Mail stellen.",
          "Wann e léiwe Mënsch am Stierwe läit oder gestuerwen ass, frot dat, wat Iech haut beschäftegt. Ask Clarvia schéckt Iech praktesch Orientéierung mat Linken op Quellen. Weider Froe kënnt Dir per E-Mail stellen.",
        )}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
        {EXAMPLES[lang].map(({ title, question }) => (
          <div key={title} className="glass-panel p-5">
            <h3 className="text-base font-semibold text-calm-blue-800 mb-2">{title}</h3>
            <p className="text-sm text-calm-blue-600 leading-relaxed mb-0">“{question}”</p>
          </div>
        ))}
      </div>
      <Link href={siteAskHref(lang)} className="btn-primary px-8 py-3 text-base min-h-11 inline-flex items-center">
        {tr(lang, "Ask Clarvia")}
      </Link>
      <p className="text-sm text-calm-blue-500 mt-4">
        {l(
          lang,
          "The question page is in 14 languages. You can receive an email reply in more than 100 languages.",
          "La page de questions existe en 14 langues. Vous pouvez recevoir une réponse par e-mail dans plus de 100 langues.",
          "Die Frageseite gibt es in 14 Sprachen. Antworten per E-Mail sind in mehr als 100 Sprachen möglich.",
          "D’Froesäit gëtt et a 14 Sproochen. Eng Äntwert per E-Mail ass a méi wéi 100 Sprooche méiglech.",
        )}
      </p>
    </section>
  );
}
