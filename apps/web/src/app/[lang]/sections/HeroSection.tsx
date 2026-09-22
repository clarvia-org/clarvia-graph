"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Lang, l } from "@/lib/i18n";
import AskForm, { type AskFormHandle } from "@/components/AskForm";
import { siteLangToAskLocale } from "@/lib/ask-entry";
import { homepageAskFormCopy } from "@/lib/ask-entry-copy";
import { headlineStyle } from "../data";

const EXAMPLES: Record<Lang, readonly string[]> = {
  en: [
    "My father died last week in Paris. I live in France. What do I need to do first?",
    "My partner has a terminal diagnosis. What should we organise while we still can?",
    "My mother died two years ago. I still have questions about pension and paperwork.",
    "Someone I love died in another country. How do we handle the death certificate and funeral?",
    "I need to tell banks and local authorities after a death. Where do I start?",
    "We are not sure who should handle the funeral and the first official steps.",
  ],
  fr: [
    "Mon père est décédé la semaine dernière à Paris. J’habite en France. Que dois-je faire en premier ?",
    "Mon conjoint a reçu le diagnostic d’une maladie en phase terminale. Que devrions-nous organiser pendant que nous le pouvons encore ?",
    "Ma mère est décédée il y a deux ans. J’ai encore des questions concernant la pension et les démarches administratives.",
    "Un de mes proches est décédé dans un autre pays. Comment devons-nous procéder pour l’acte de décès et les funérailles ?",
    "Je dois informer les banques et les autorités locales d’un décès. Par où commencer ?",
    "Nous ne savons pas qui doit s’occuper des funérailles et des premières démarches officielles.",
  ],
  de: [
    "Mein Vater ist letzte Woche in Paris gestorben. Ich lebe in Frankreich. Was muss ich zuerst tun?",
    "Mein Partner hat die Diagnose einer unheilbaren Erkrankung erhalten. Was sollten wir noch regeln, solange wir es gemeinsam können?",
    "Meine Mutter ist vor zwei Jahren gestorben. Ich habe noch immer Fragen zur Rente und zu den Formalitäten.",
    "Ein geliebter Mensch ist in einem anderen Land gestorben. Wie kümmern wir uns um die Sterbeurkunde und die Beerdigung?",
    "Ich muss nach einem Todesfall Banken und örtliche Behörden informieren. Wo fange ich an?",
    "Wir wissen nicht, wer sich um die Beerdigung und die ersten Behördengänge kümmern sollte.",
  ],
  lu: [
    "Mäi Papp ass d’lescht Woch zu Paräis gestuerwen. Ech wunnen a Frankräich. Wat muss ech als Éischt maachen?",
    "Mäi Partner huet d’Diagnos vun enger onheelbarer Krankheet kritt. Wat solle mir nach organiséieren, soulaang mir dat kënnen?",
    "Meng Mamm ass virun zwee Joer gestuerwen. Ech hunn nach ëmmer Froen iwwer d’Pensioun an déi administrativ Demarchen.",
    "Eng Persoun, déi mir nosteet, ass an engem anere Land gestuerwen. Wéi këmmere mir eis ëm den Doudesakt an d’Begriefnes?",
    "Ech muss no engem Doudesfall d’Banken, d’Gemeng an aner Verwaltungen informéieren. Wou fänken ech un?",
    "Mir wëssen net, wien sech ëm d’Begriefnes an déi éischt offiziell Demarchë këmmere soll.",
  ],
};

export default function HeroSection({ lang }: { lang: Lang }) {
  const router = useRouter();
  const fillQuestionRef = useRef<AskFormHandle | null>(null);
  const [showAllExamples, setShowAllExamples] = useState(false);

  const examples = EXAMPLES[lang];
  const copy = homepageAskFormCopy(lang);
  const visibleExamples = useMemo(
    () => (showAllExamples ? examples : examples.slice(0, 4)),
    [examples, showAllExamples],
  );

  return (
    <>
      <section className="text-center py-8 sm:py-12 mb-16" aria-labelledby="ask-heading">
        <h2
          id="ask-heading"
          className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4"
          style={headlineStyle}
        >
          {l(lang, "Ask Clarvia", "Demandez à Clarvia", "Clarvia fragen", "Frot Clarvia")}
        </h2>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-4">
          {l(
            lang,
            "Type what happened in your own language, from anywhere. Include where your loved one lived, where the death occurred, or where things stand today. The more context you share, the better we can help.",
            "Expliquez ce qui s’est passé dans votre propre langue, où que vous soyez. Précisez si possible où vivait votre proche, où le décès a eu lieu ou où en sont les démarches aujourd’hui. Plus vous nous donnez de contexte, mieux nous pouvons vous aider.",
            "Schildern Sie in Ihrer eigenen Sprache, was passiert ist, ganz gleich, wo Sie sich befinden. Geben Sie möglichst an, wo die Ihnen nahestehende Person gelebt hat, wo der Todesfall eingetreten ist oder wie der aktuelle Stand ist. Je mehr Kontext Sie uns geben, desto gezielter können wir helfen.",
            "Beschreift an Ärer eegener Sprooch, wat geschitt ass, egal wou Dir sidd. Gitt wa méiglech un, wou déi Persoun gelieft huet, wou den Doudesfall geschitt ass oder wou Dir haut mat den Demarchë stitt. Wat Dir eis méi Kontext gitt, wat mir Iech méi geziilt hëllefe kënnen.",
          )}
        </p>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-10">
          {l(
            lang,
            "Clarvia will send a carefully researched reply to your email, usually within a few minutes.",
            "Clarvia vous enverra une réponse soigneusement documentée par e-mail, généralement en quelques minutes.",
            "Clarvia sendet Ihnen eine sorgfältig recherchierte Antwort per E-Mail, in der Regel innerhalb weniger Minuten.",
            "Clarvia schéckt Iech eng virsiichteg recherchéiert Äntwert per E-Mail, normalerweis bannent e puer Minutten.",
          )}
        </p>

        <AskForm
          copy={copy}
          locale={siteLangToAskLocale(lang)}
          fillQuestionRef={fillQuestionRef}
          onSuccess={() => router.push(`/${lang}/ask/sent`)}
        />
        <div id="cookie-consent-slot" className="max-w-2xl mx-auto mt-4" />
      </section>

      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6" style={headlineStyle}>
          {l(
            lang,
            "Examples of what you can ask",
            "Exemples de questions que vous pouvez poser",
            "Beispiele für mögliche Fragen",
            "Beispiller vu Froen, déi Dir stelle kënnt",
          )}
        </h2>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {visibleExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => fillQuestionRef.current?.fillQuestion(example)}
              className="text-left text-sm px-4 py-2 rounded-full bg-white/70 border border-calm-blue-200 text-calm-blue-700 hover:border-calm-lilac-400 hover:bg-white transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
        {!showAllExamples && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setShowAllExamples(true)}
              className="text-sm font-medium text-calm-blue-600 hover:text-calm-blue-800 underline"
            >
              {l(lang, "More examples", "Voir plus d’exemples", "Weitere Beispiele", "Méi Beispiller")}
            </button>
          </div>
        )}
      </section>

      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8" style={headlineStyle}>
          {l(lang, "Why ask us?", "Pourquoi nous poser votre question ?", "Warum Clarvia fragen?", "Firwat eis froen?")}
        </h2>
        <ul className="max-w-3xl mx-auto space-y-4 text-base text-calm-blue-700 leading-relaxed">
          <li>
            <strong>
              {l(
                lang,
                "Researched with cited sources.",
                "Des recherches rigoureuses, sources à l’appui.",
                "Sorgfältig recherchiert und mit Quellen belegt.",
                "Sorgfälteg recherchéiert a mat Quellen nogewisen.",
              )}
            </strong>{" "}
            {l(
              lang,
              "We use reliable online sources and, where available, Clarvia’s maintained official information and current laws. You get links so you can check.",
              "Nous utilisons des sources en ligne fiables ainsi que, lorsqu’elles sont disponibles, les informations officielles tenues à jour par Clarvia et les lois en vigueur. Vous recevez les liens nécessaires pour pouvoir tout vérifier.",
              "Wir nutzen zuverlässige Onlinequellen sowie, sofern verfügbar, von Clarvia gepflegte offizielle Informationen und geltende Gesetze. Sie erhalten die entsprechenden Links, damit Sie alles selbst prüfen können.",
              "Mir notzen zouverlässeg Onlinequellen an, wa verfügbar, offiziell Informatiounen, déi Clarvia um neiste Stand hält, souwéi aktuell Gesetzestexter. Dir kritt d’Linken, fir alles selwer kënnen ze kontrolléieren.",
            )}
          </li>
          <li>
            <strong>
              {l(
                lang,
                "Easy to continue.",
                "Des échanges faciles à poursuivre.",
                "Einfach weiterzuführen.",
                "Einfach weiderzefueren.",
              )}
            </strong>{" "}
            {l(
              lang,
              "Everything arrives by email. Reply, forward, or include family and professionals.",
              "Vous recevez tout par e-mail. Vous pouvez répondre, transférer le message ou inclure des membres de votre famille et des professionnels dans les échanges.",
              "Sie erhalten alles per E-Mail. Sie können antworten, die Nachricht weiterleiten oder Familienangehörige und Fachleute einbeziehen.",
              "Dir kritt alles per E-Mail. Dir kënnt äntweren, de Message weiderleeden oder Familljememberen a Fachleit an den Austausch mat abannen.",
            )}
          </li>
          <li>
            <strong>
              {l(
                lang,
                "Carefully guided.",
                "Une orientation attentive.",
                "Umsichtig begleitet.",
                "Sorgfälteg Orientéierung.",
              )}
            </strong>{" "}
            {l(
              lang,
              "We ask for important missing details, avoid assumptions, and are clear about limits.",
              "Nous demandons les informations importantes qui manquent, évitons les suppositions et indiquons clairement les limites de notre service.",
              "Wir fragen nach wichtigen fehlenden Angaben, treffen keine unbegründeten Annahmen und benennen unsere Grenzen klar.",
              "Mir froen no wichtegen Informatiounen, déi nach feelen, maachen keng ongegrënnten Unhuelen a soen kloer, wou d’Grenze vun eisem Service leien.",
            )}
          </li>
          <li>
            <strong>
              {l(lang, "Made by Clarvia.", "Un service créé par Clarvia.", "Von Clarvia entwickelt.", "Vun Clarvia entwéckelt.")}
            </strong>{" "}
            {l(
              lang,
              "A free service from a registered nonprofit (Clarvia ASBL, RCS F15680), for people who need a next step in a difficult time.",
              "Un service gratuit proposé par une association à but non lucratif enregistrée (Clarvia ASBL, RCS F15680), destiné aux personnes qui ont besoin de savoir quelle prochaine étape entreprendre dans un moment difficile.",
              "Ein kostenloser Dienst eines eingetragenen gemeinnützigen Vereins (Clarvia ASBL, RCS F15680) für Menschen, die in einer schwierigen Zeit Orientierung für den nächsten Schritt brauchen.",
              "E gratis Service vun engem registréierten net gewënnorientéierte Veräin (Clarvia ASBL, RCS F15680) fir Mënschen, déi an enger schwiereger Zäit Hëllef beim nächste Schrëtt brauchen.",
            )}
          </li>
        </ul>
      </section>
    </>
  );
}
