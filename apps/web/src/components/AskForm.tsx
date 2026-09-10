"use client";

import { useEffect, useState, type FormEvent, type MutableRefObject } from "react";
import { isPlausibleEmail } from "@/lib/email";
import Turnstile from "@/components/Turnstile";
import { ASK_SUBMITTED_STORAGE_KEY } from "@/lib/analytics";
import { MIN_QUESTION_CHARS, PLACE_HINT_RE } from "@/lib/ask-entry";
import type { AskFormCopy } from "@/lib/ask-entry-copy";

export type AskFormHandle = {
  fillQuestion: (value: string) => void;
};

export default function AskForm({
  copy,
  onSuccess,
  formId = "ask-us",
  fillQuestionRef,
}: {
  copy: AskFormCopy;
  onSuccess: () => void;
  formId?: string;
  fillQuestionRef?: MutableRefObject<AskFormHandle | null>;
}) {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | null>("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  useEffect(() => {
    if (!fillQuestionRef) return;
    fillQuestionRef.current = { fillQuestion: setQuestion };
    return () => {
      fillQuestionRef.current = null;
    };
  }, [fillQuestionRef]);

  const trimmedQuestion = question.trim();
  const validEmail = isPlausibleEmail(email.trim().toLowerCase());
  const longEnough = trimmedQuestion.length >= MIN_QUESTION_CHARS;
  const showMinHint = trimmedQuestion.length > 0 && !longEnough;
  const showPlaceHint = longEnough && !PLACE_HINT_RE.test(trimmedQuestion);
  const canSubmit =
    longEnough && validEmail && consent && Boolean(token) && status !== "sending";

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
          typeof payload.error === "string" ? payload.error : "Something went wrong.",
        );
      }
      try {
        sessionStorage.setItem(ASK_SUBMITTED_STORAGE_KEY, "1");
      } catch {
        /* private mode */
      }
      onSuccess();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMsg(copy.error(raw));
      setStatus("error");
      setToken("");
      setTurnstileKey((n) => n + 1);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto text-start scroll-mt-24"
    >
      <label htmlFor="ask-question" className="block text-sm font-semibold text-calm-blue-800 mb-1.5">
        {copy.situationLabel}
      </label>
      <textarea
        id="ask-question"
        rows={6}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={copy.situationPlaceholder}
        className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-base text-calm-blue-800 placeholder:text-calm-blue-400 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400 focus:border-transparent resize-y min-h-[8rem]"
      />
      {showMinHint && <p className="text-sm text-calm-blue-500 mt-2">{copy.minHint}</p>}
      {showPlaceHint && <p className="text-sm text-calm-blue-500 mt-2">{copy.placeHint}</p>}

      <label htmlFor="ask-email" className="block text-sm font-semibold text-calm-blue-800 mt-5 mb-1.5">
        {copy.emailLabel}
      </label>
      <input
        id="ask-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={copy.emailPlaceholder}
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
            {copy.consent}{" "}
            <a href={copy.privacyHref} className="underline hover:text-calm-blue-900">
              {copy.privacy}
            </a>
          </span>
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary px-8 py-3 text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed sm:self-end"
        >
          {status === "sending" ? copy.sending : copy.submit}
        </button>
      </div>

      <div className="mt-4">
        <Turnstile key={turnstileKey} onVerify={setToken} />
      </div>

      {errorMsg && (
        <p className="text-[#c8102e] text-sm bg-red-50 p-3 rounded-lg border border-red-200 mt-4" role="alert">
          {errorMsg}
        </p>
      )}

      <p className="text-sm text-calm-blue-500 text-center mt-5 leading-relaxed">{copy.formFooter}</p>
    </form>
  );
}
