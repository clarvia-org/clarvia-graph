"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import AskForm, { type AskFormHandle } from "@/components/AskForm";
import {
  ASK_LOCALE_STORAGE_KEY,
  ASK_MARKET_STORAGE_KEY,
  ASK_REF_STORAGE_KEY,
  parseAskLocale,
} from "@/lib/ask-entry";
import { askFormCopy } from "@/lib/ask-entry-copy";
import { getGuideUiCopy } from "@/content/corridor-guide-ui";
import { headlineStyle } from "@/app/[lang]/data";

export default function GuideCtaClient({
  slug,
  lang = "en",
  prefillQuestion,
  closingQuestion,
  caseDependentItems,
}: {
  slug: string;
  lang?: string;
  prefillQuestion: string;
  closingQuestion: string;
  caseDependentItems: string[];
}) {
  const router = useRouter();
  const fillRef = useRef<AskFormHandle | null>(null);
  const askLocale = useMemo(() => parseAskLocale(lang) ?? "en", [lang]);
  const copy = useMemo(() => askFormCopy(askLocale), [askLocale]);
  const ui = useMemo(() => getGuideUiCopy(lang), [lang]);

  useEffect(() => {
    try {
      sessionStorage.setItem(ASK_REF_STORAGE_KEY, "corridor-guide");
      sessionStorage.setItem(ASK_MARKET_STORAGE_KEY, slug.slice(0, 64));
    } catch {
      /* private mode */
    }
    if (fillRef.current) {
      fillRef.current.fillQuestion(prefillQuestion);
    }
  }, [slug, prefillQuestion]);

  function selectFocusItem(itemText: string) {
    const prompt = `${prefillQuestion.trim()} ${ui.ctaSpecificPrefix} ${itemText}. `;
    if (fillRef.current) {
      fillRef.current.fillQuestion(prompt);
    }
    const el = document.getElementById("ask-question");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  }

  return (
    <section
      id="ask-bridge"
      aria-labelledby="personalized-roadmap-heading"
      className="mt-12 scroll-mt-24 rounded-2xl border border-calm-blue-200 bg-white/80 p-6 sm:p-8 shadow-sm"
    >
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-calm-blue-500 mb-2">
          {ui.ctaEyebrow}
        </p>
        <h2
          id="personalized-roadmap-heading"
          className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-3"
          style={headlineStyle}
        >
          {ui.ctaHeading}
        </h2>
        <p className="text-base text-calm-blue-700 leading-relaxed mb-4">
          {ui.ctaIntro}
        </p>

        <div className="mb-6 space-y-2">
          <p className="text-sm font-semibold text-calm-blue-800">
            {ui.ctaFocusLabel}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {caseDependentItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectFocusItem(item)}
                className="text-left text-sm text-calm-blue-700 hover:text-calm-blue-900 bg-calm-blue-50/70 hover:bg-calm-blue-100/70 border border-calm-blue-200 rounded-xl px-4 py-2.5 transition-colors flex items-start gap-2.5"
              >
                <span className="font-semibold text-calm-blue-500 shrink-0">→</span>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {closingQuestion ? (
          <p className="text-sm text-calm-blue-700 bg-white border border-calm-blue-100 rounded-xl p-3.5 mb-6 italic">
            “{closingQuestion}”
          </p>
        ) : null}
      </div>

      <AskForm
        copy={copy}
        locale={askLocale}
        formId="guide-ask-form"
        fillQuestionRef={fillRef}
        onSuccess={() => {
          try {
            localStorage.setItem(ASK_LOCALE_STORAGE_KEY, askLocale);
          } catch {
            /* private mode */
          }
          router.push(`/ask/sent?lang=${askLocale}`);
        }}
      />
    </section>
  );
}
