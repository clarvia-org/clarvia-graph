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

const EXAMPLES = [
  "My father died last week in Paris. I live in France. What do I need to do first?",
  "My partner has a terminal diagnosis and we live in Luxembourg. What should we organise while we still can?",
  "My mother died in Germany two years ago. I still have questions about pension and paperwork in Luxembourg.",
  "Someone I love died abroad. They lived in Luxembourg. How do we handle the death certificate and funeral?",
  "I need to tell banks and the commune after a death in Luxembourg. Where do I start?",
  "We are not sure who should handle the funeral and the first official steps.",
] as const;

function t(lang: Lang, s: string): string {
  return l(lang, s, s, s, s);
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

  const trimmedQuestion = question.trim();
  const validEmail = isPlausibleEmail(email.trim().toLowerCase());
  const longEnough = trimmedQuestion.length >= MIN_QUESTION_CHARS;
  const showMinHint = trimmedQuestion.length > 0 && !longEnough;
  const showPlaceHint = longEnough && !PLACE_HINT_RE.test(trimmedQuestion);
  const canSubmit =
    longEnough && validEmail && consent && Boolean(token) && status !== "sending";

  const visibleExamples = useMemo(
    () => (showAllExamples ? EXAMPLES : EXAMPLES.slice(0, 4)),
    [showAllExamples]
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
          typeof payload.error === "string" ? payload.error : "Something went wrong"
        );
      }
      try {
        sessionStorage.setItem(ASK_OK_KEY, "1");
      } catch {
        /* private mode */
      }
      router.push(`/${lang}/ask/sent`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
      setToken("");
      setTurnstileKey((n) => n + 1);
    }
  }

  return (
    <>
      <section className="text-center py-12 sm:py-20">
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 drop-shadow-sm max-w-4xl mx-auto"
          style={headlineStyle}
        >
          {t(lang, "Not sure what to do when a loved one is terminally ill or has died?")}
        </h1>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-4">
          {t(
            lang,
            "Free guidance from a terminal diagnosis through the practical questions that can still arise years after a death."
          )}
        </p>
        <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-10">
          {t(lang, "Type what happened. Include")}{" "}
          <strong>{t(lang, "where your loved one lived")}</strong>
          {t(lang, ", and")}{" "}
          <strong>{t(lang, "where they are now or where the death occurred")}</strong>
          {t(lang, ". You’ll get a thoughtful email, usually within a few minutes.")}
        </p>

        <form onSubmit={onSubmit} className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto text-left">
          <label htmlFor="ask-question" className="block text-sm font-semibold text-calm-blue-800 mb-1.5">
            {t(lang, "Your situation")}
          </label>
          <textarea
            id="ask-question"
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={EXAMPLES[0]}
            className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent resize-y min-h-[8rem]"
          />
          {showMinHint && (
            <p className="text-sm text-calm-blue-500 mt-2">
              {t(lang, "Please describe your situation in at least a sentence or two.")}
            </p>
          )}
          {showPlaceHint && (
            <p className="text-sm text-calm-blue-500 mt-2">
              {t(
                lang,
                "If you can, add where your loved one lived and where they are now or where the death occurred. That helps us send the right information."
              )}
            </p>
          )}

          <label htmlFor="ask-email" className="block text-sm font-semibold text-calm-blue-800 mt-5 mb-1.5">
            {t(lang, "Your email")}
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
                {t(
                  lang,
                  "I consent to Clarvia processing the information in my question, including any health information I choose to provide, to answer me by email. I understand that Clarvia uses AI and may reply automatically."
                )}{" "}
                <a href={`/${lang}/privacy`} className="underline hover:text-calm-blue-900">
                  {t(lang, "Privacy Policy")}
                </a>
              </span>
            </label>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary px-8 py-3 text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed sm:self-end"
            >
              {status === "sending" ? t(lang, "Sending...") : t(lang, "Ask us")}
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
            {t(
              lang,
              "You’ll get an email from Lex at Clarvia. You can reply, forward, or include family and professionals."
            )}
          </p>
        </form>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6" style={headlineStyle}>
          {t(lang, "Examples of what you can ask")}
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
              {t(lang, "More examples")}
            </button>
          </div>
        )}
      </section>

      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8" style={headlineStyle}>
          {t(lang, "Why ask us?")}
        </h2>
        <ul className="max-w-3xl mx-auto space-y-4 text-base text-calm-blue-700 leading-relaxed">
          <li>
            <strong>{t(lang, "Researched, not guessed.")}</strong>{" "}
            {t(
              lang,
              "We use reliable online sources and, where available, Clarvia’s maintained official information and current laws. You get links so you can check."
            )}
          </li>
          <li>
            <strong>{t(lang, "Easy to continue.")}</strong>{" "}
            {t(
              lang,
              "Everything arrives by email. Reply, forward, or include family and professionals."
            )}
          </li>
          <li>
            <strong>{t(lang, "Carefully guided.")}</strong>{" "}
            {t(
              lang,
              "We ask for important missing details, avoid assumptions, and are clear about limits."
            )}
          </li>
          <li>
            <strong>{t(lang, "Made by Clarvia.")}</strong>{" "}
            {t(
              lang,
              "A free service from a registered Luxembourg nonprofit (Clarvia ASBL, RCS F15680), for people who need a next step in a difficult time."
            )}
          </li>
        </ul>
        <p className="text-sm text-calm-blue-500 text-center mt-8">
          {t(lang, "This is information, not medical or legal advice.")}
        </p>
      </section>
    </>
  );
}
