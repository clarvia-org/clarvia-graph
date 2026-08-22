"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { type Lang, l } from "@/lib/i18n";
import { isPlausibleEmail } from "@/lib/email";
import Turnstile from "@/components/Turnstile";
import { headlineStyle } from "../data";

const MIN_QUESTION_CHARS = 20;
const PLACE_HINT_RE = /\b(in|at|from|near|within)\s+\S{2,}|\blive[sd]?\s+in\b/i;
const ASK_OK_KEY = "clarvia-ask-submitted";

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

function askErrorMessage(lang: Lang, message: string): string {
  switch (message) {
    case "Please wait a bit before asking again.":
      return l(
        lang,
        message,
        "Veuillez patienter un peu avant de poser une nouvelle question.",
        "Bitte warten Sie einen Moment, bevor Sie erneut eine Frage stellen.",
        "Waart wgl. e bëssen, ier Dir nach eng Kéier eng Fro stellt."
      );
    case "We're temporarily unable to take questions. Please try again shortly.":
      return l(
        lang,
        message,
        "Nous ne pouvons temporairement pas recevoir de questions. Veuillez réessayer dans quelques instants.",
        "Wir können derzeit keine Fragen entgegennehmen. Bitte versuchen Sie es in Kürze erneut.",
        "Mir kënnen de Moment keng Froen unhuelen. Probéiert et wgl. geschwënn nach eng Kéier."
      );
    case "Consent is required.":
      return l(
        lang,
        message,
        "Votre consentement est requis.",
        "Ihre Einwilligung ist erforderlich.",
        "Är Zoustëmmung ass néideg."
      );
    case "Please enter a valid email address.":
      return l(
        lang,
        message,
        "Veuillez saisir une adresse e-mail valide.",
        "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        "Gitt wgl. eng gülteg E-Mail-Adress an."
      );
    case "Please describe your situation in at least a sentence or two.":
      return l(
        lang,
        message,
        "Veuillez décrire votre situation en une ou deux phrases au minimum.",
        "Bitte beschreiben Sie Ihre Situation in mindestens ein bis zwei Sätzen.",
        "Beschreift Är Situatioun wgl. a mindestens engem oder zwee Sätz."
      );
    case "Please shorten your question a little.":
      return l(
        lang,
        message,
        "Veuillez raccourcir légèrement votre question.",
        "Bitte kürzen Sie Ihre Frage ein wenig.",
        "Kierzt Är Fro wgl. e bëssen."
      );
    case "Bot check failed":
      return l(
        lang,
        message,
        "Le contrôle antibot a échoué.",
        "Die Bot-Prüfung ist fehlgeschlagen.",
        "D’Kontroll géint Bots ass feelgeschloen."
      );
    case "Please check your question and email, then try again.":
      return l(
        lang,
        message,
        "Veuillez vérifier votre question et votre adresse e-mail, puis réessayer.",
        "Bitte überprüfen Sie Ihre Frage und Ihre E-Mail-Adresse und versuchen Sie es erneut.",
        "Kontrolléiert wgl. Är Fro an Är E-Mail-Adress a probéiert et dann nach eng Kéier."
      );
    default:
      return l(
        lang,
        "Something went wrong.",
        "Une erreur s’est produite.",
        "Etwas ist schiefgelaufen.",
        "Et ass e Feeler opgetrueden."
      );
  }
}

export default function HeroSection({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | null>("");
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const examples = EXAMPLES[lang];
  const trimmedQuestion = question.trim();
  const validEmail = isPlausibleEmail(email.trim().toLowerCase());
  const longEnough = trimmedQuestion.length >= MIN_QUESTION_CHARS;
  const showMinHint = trimmedQuestion.length > 0 && !longEnough;
  const showPlaceHint = longEnough && !PLACE_HINT_RE.test(trimmedQuestion);
  const canSubmit =
    longEnough && validEmail && consent && Boolean(token) && status !== "sending";

  const visibleExamples = useMemo(
    () => (showAllExamples ? examples : examples.slice(0, 4)),
    [examples, showAllExamples]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          question: trimmedQuestion,
          consent: true,
          turnstileToken: token ?? "",
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          typeof payload.error === "string" ? payload.error : "Something went wrong."
        );
      }
      try {
        sessionStorage.setItem(ASK_OK_KEY, "1");
      } catch {
        /* private mode */
      }
      router.push(`/${lang}/ask/sent`);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMsg(askErrorMessage(lang, raw));
      setStatus("error");
      setToken("");
      setTurnstileKey((n) => n + 1);
    }
  }

  return (
    <>
      <section id="ask-us" className="text-center py-12 sm:py-20 scroll-mt-24">
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 drop-shadow-sm max-w-4xl mx-auto"
          style={headlineStyle}
        >
          {l(
            lang,
            "Not sure what to do when a loved one is terminally ill or has died?",
            "Vous ne savez pas quoi faire lorsqu’un proche est en phase terminale ou est décédé ?",
            "Sie wissen nicht, was zu tun ist, wenn ein geliebter Mensch unheilbar krank ist oder verstorben ist?",
            "Wësst Dir net, wat Dir maache sollt, wann eng Persoun, déi Iech nosteet, onheelbar krank ass oder gestuerwen ass?"
          )}
        </h1>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-4">
          {l(
            lang,
            "Free, source-linked guidance from a terminal diagnosis through the practical questions that can arise years after a death.",
            "Des informations pratiques gratuites, accompagnées de leurs sources, depuis le diagnostic d’une maladie en phase terminale jusqu’aux questions qui peuvent encore se poser des années après un décès.",
            "Kostenlose Orientierung mit Links zu den Quellen, von der Diagnose einer unheilbaren Erkrankung bis zu praktischen Fragen, die noch Jahre nach einem Todesfall auftreten können.",
            "Gratis praktesch Orientéierung mat Linken op d’Quellen, vun der Diagnos vun enger onheelbarer Krankheet bis bei Froen, déi nach Joren no engem Doudesfall opkomme kënnen."
          )}
        </p>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-4">
          {l(
            lang,
            "Type what happened in your own language, from anywhere. Include where your loved one lived, where the death occurred, or where things stand today. The more context you share, the better we can help.",
            "Expliquez ce qui s’est passé dans votre propre langue, où que vous soyez. Précisez si possible où vivait votre proche, où le décès a eu lieu ou où en sont les démarches aujourd’hui. Plus vous nous donnez de contexte, mieux nous pouvons vous aider.",
            "Schildern Sie in Ihrer eigenen Sprache, was passiert ist, ganz gleich, wo Sie sich befinden. Geben Sie möglichst an, wo die Ihnen nahestehende Person gelebt hat, wo der Todesfall eingetreten ist oder wie der aktuelle Stand ist. Je mehr Kontext Sie uns geben, desto gezielter können wir helfen.",
            "Beschreift an Ärer eegener Sprooch, wat geschitt ass, egal wou Dir sidd. Gitt wa méiglech un, wou déi Persoun gelieft huet, wou den Doudesfall geschitt ass oder wou Dir haut mat den Demarchë stitt. Wat Dir eis méi Kontext gitt, wat mir Iech méi geziilt hëllefe kënnen."
          )}
        </p>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-10">
          {l(
            lang,
            "Clarvia will send a carefully researched reply to your email, usually within a few minutes.",
            "Clarvia vous enverra une réponse soigneusement documentée par e-mail, généralement en quelques minutes.",
            "Clarvia sendet Ihnen eine sorgfältig recherchierte Antwort per E-Mail, in der Regel innerhalb weniger Minuten.",
            "Clarvia schéckt Iech eng virsiichteg recherchéiert Äntwert per E-Mail, normalerweis bannent e puer Minutten."
          )}
        </p>

        <form onSubmit={onSubmit} className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto text-left">
          <label htmlFor="ask-question" className="block text-sm font-semibold text-calm-blue-800 mb-1.5">
            {l(lang, "Your situation", "Votre situation", "Ihre Situation", "Är Situatioun")}
          </label>
          <textarea
            id="ask-question"
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={examples[0]}
            className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent resize-y min-h-[8rem]"
          />
          {showMinHint && (
            <p className="text-sm text-calm-blue-500 mt-2">
              {l(
                lang,
                "Please describe your situation in at least a sentence or two.",
                "Veuillez décrire votre situation en une ou deux phrases au minimum.",
                "Bitte beschreiben Sie Ihre Situation in mindestens ein bis zwei Sätzen.",
                "Beschreift Är Situatioun wgl. a mindestens engem oder zwee Sätz."
              )}
            </p>
          )}
          {showPlaceHint && (
            <p className="text-sm text-calm-blue-500 mt-2">
              {l(
                lang,
                "If you can, add where your loved one lived and where they are now or where the death occurred. That helps us send the right information.",
                "Si possible, précisez où vivait votre proche et où il se trouve actuellement, ou bien où le décès a eu lieu. Cela nous aidera à vous envoyer les informations adaptées.",
                "Geben Sie nach Möglichkeit an, wo die Ihnen nahestehende Person gelebt hat und wo sie sich jetzt befindet oder wo der Todesfall eingetreten ist. So können wir Ihnen die passenden Informationen senden.",
                "Gitt wa méiglech un, wou déi Persoun gelieft huet a wou si elo ass, oder wou den Doudesfall geschitt ass. Dat hëlleft eis, Iech déi richteg Informatiounen ze schécken."
              )}
            </p>
          )}

          <label htmlFor="ask-email" className="block text-sm font-semibold text-calm-blue-800 mt-5 mb-1.5">
            {l(lang, "Your email", "Votre email", "Ihre E-Mail", "Är E-Mail-Adress")}
          </label>
          <input
            id="ask-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent"
          />

          <div className="mt-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <label className="flex items-start gap-3 text-sm text-calm-blue-700 leading-relaxed flex-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-calm-blue-300 text-calm-lilac-600 focus:ring-calm-lilac-400"
              />
              <span>
                {l(
                  lang,
                  "I consent to Clarvia processing the information in my question, including any health information I choose to provide, to answer me by email. I understand that Clarvia uses AI and may reply automatically.",
                  "J’accepte que Clarvia traite les informations contenues dans ma question, y compris les éventuelles informations de santé que je choisis de communiquer, afin de me répondre par e-mail. Je comprends que Clarvia utilise l’intelligence artificielle et peut répondre automatiquement.",
                  "Ich willige ein, dass Clarvia die Angaben in meiner Frage verarbeitet, einschließlich aller Gesundheitsinformationen, die ich freiwillig mitteile, um mir per E-Mail zu antworten. Mir ist bewusst, dass Clarvia KI einsetzt und möglicherweise automatisch antwortet.",
                  "Ech stëmmen zou, datt Clarvia d’Informatiounen a menger Fro verschafft, dorënner och all Gesondheetsinformatiounen, déi ech fräiwëlleg uginn, fir mir per E-Mail ze äntweren. Ech verstinn, datt Clarvia kënschtlech Intelligenz asetzt an eventuell automatesch äntwert."
                )}{" "}
                <a href={`/${lang}/privacy`} className="underline hover:text-calm-blue-900">
                  {l(lang, "Privacy Policy", "Politique de confidentialité", "Datenschutzerklärung", "Dateschutzerklärung")}
                </a>
              </span>
            </label>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary px-8 py-3 text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed sm:self-end"
            >
              {status === "sending"
                ? l(lang, "Sending...", "Envoi...", "Senden...", "Gëtt geschéckt...")
                : l(lang, "Send", "Envoyer", "Senden", "Schécken")}
            </button>
          </div>

          <div className="mt-4">
            <Turnstile key={turnstileKey} onVerify={setToken} />
          </div>

          {errorMsg && (
            <p className="text-[#c8102e] text-sm bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
              {errorMsg}
            </p>
          )}

          <p className="text-sm text-calm-blue-500 text-center mt-5 leading-relaxed">
            {l(
              lang,
              "You’ll get an email from Lex at Clarvia. You can reply, forward, or include family and professionals.",
              "Vous recevrez un e-mail de Lex, de l’équipe Clarvia. Vous pourrez y répondre, le transférer ou inclure des membres de votre famille et des professionnels dans les échanges.",
              "Sie erhalten eine E-Mail von Lex bei Clarvia. Sie können darauf antworten, sie weiterleiten oder Familienangehörige und Fachleute in den Austausch einbeziehen.",
              "Dir kritt eng E-Mail vum Lex bei Clarvia. Dir kënnt drop äntweren, se weiderleeden oder Familljememberen a Fachleit an den Austausch mat abannen."
            )}
          </p>
        </form>
        <div id="cookie-consent-slot" className="max-w-2xl mx-auto mt-4" />
      </section>

      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6" style={headlineStyle}>
          {l(
            lang,
            "Examples of what you can ask",
            "Exemples de questions que vous pouvez poser",
            "Beispiele für mögliche Fragen",
            "Beispiller vu Froen, déi Dir stelle kënnt"
          )}
        </h2>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {visibleExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuestion(example)}
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
                "Sorgfälteg recherchéiert a mat Quellen nogewisen."
              )}
            </strong>{" "}
            {l(
              lang,
              "We use reliable online sources and, where available, Clarvia’s maintained official information and current laws. You get links so you can check.",
              "Nous utilisons des sources en ligne fiables ainsi que, lorsqu’elles sont disponibles, les informations officielles tenues à jour par Clarvia et les lois en vigueur. Vous recevez les liens nécessaires pour pouvoir tout vérifier.",
              "Wir nutzen zuverlässige Onlinequellen sowie, sofern verfügbar, von Clarvia gepflegte offizielle Informationen und geltende Gesetze. Sie erhalten die entsprechenden Links, damit Sie alles selbst prüfen können.",
              "Mir notzen zouverlässeg Onlinequellen an, wa verfügbar, offiziell Informatiounen, déi Clarvia um neiste Stand hält, souwéi aktuell Gesetzestexter. Dir kritt d’Linken, fir alles selwer kënnen ze kontrolléieren."
            )}
          </li>
          <li>
            <strong>
              {l(
                lang,
                "Easy to continue.",
                "Des échanges faciles à poursuivre.",
                "Einfach weiterzuführen.",
                "Einfach weiderzefueren."
              )}
            </strong>{" "}
            {l(
              lang,
              "Everything arrives by email. Reply, forward, or include family and professionals.",
              "Vous recevez tout par e-mail. Vous pouvez répondre, transférer le message ou inclure des membres de votre famille et des professionnels dans les échanges.",
              "Sie erhalten alles per E-Mail. Sie können antworten, die Nachricht weiterleiten oder Familienangehörige und Fachleute einbeziehen.",
              "Dir kritt alles per E-Mail. Dir kënnt äntweren, de Message weiderleeden oder Familljememberen a Fachleit an den Austausch mat abannen."
            )}
          </li>
          <li>
            <strong>
              {l(
                lang,
                "Carefully guided.",
                "Une orientation attentive.",
                "Umsichtig begleitet.",
                "Sorgfälteg Orientéierung."
              )}
            </strong>{" "}
            {l(
              lang,
              "We ask for important missing details, avoid assumptions, and are clear about limits.",
              "Nous demandons les informations importantes qui manquent, évitons les suppositions et indiquons clairement les limites de notre service.",
              "Wir fragen nach wichtigen fehlenden Angaben, treffen keine unbegründeten Annahmen und benennen unsere Grenzen klar.",
              "Mir froen no wichtegen Informatiounen, déi nach feelen, maachen keng ongegrënnten Unhuelen a soen kloer, wou d’Grenze vun eisem Service leien."
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
              "E gratis Service vun engem registréierten net gewënnorientéierte Veräin (Clarvia ASBL, RCS F15680) fir Mënschen, déi an enger schwiereger Zäit Hëllef beim nächste Schrëtt brauchen."
            )}
          </li>
        </ul>
      </section>
    </>
  );
}
