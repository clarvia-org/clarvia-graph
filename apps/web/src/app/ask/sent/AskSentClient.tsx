"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ASK_SUBMITTED_STORAGE_KEY, trackAskSubmitted } from "@/lib/analytics";
import { headlineStyle } from "@/app/[lang]/data";
import {
  ASK_LOCALE_STORAGE_KEY,
  ASK_MARKET_STORAGE_KEY,
  ASK_REF_STORAGE_KEY,
  isRtlAskLocale,
  resolveAskLocale,
  sanitizeAskSlug,
  siteLangForAskLocale,
  type AskLocale,
} from "@/lib/ask-entry";
import { askCopy } from "@/lib/ask-entry-copy";

function readStoredLocale(): AskLocale {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(ASK_LOCALE_STORAGE_KEY);
  } catch {
    saved = null;
  }
  const browser =
    typeof navigator !== "undefined"
      ? navigator.languages?.length
        ? [...navigator.languages]
        : navigator.language
          ? [navigator.language]
          : []
      : [];
  return resolveAskLocale({ saved, browserLanguages: browser, linkHint: null });
}

export default function AskSentClient() {
  const [locale, setLocale] = useState<AskLocale>("en");
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    const next = readStoredLocale();
    setLocale(next);
    document.documentElement.setAttribute("dir", isRtlAskLocale(next) ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", next);

    let submitted = false;
    let ref: string | undefined;
    let market: string | undefined;
    try {
      submitted = sessionStorage.getItem(ASK_SUBMITTED_STORAGE_KEY) === "1";
      if (submitted) sessionStorage.removeItem(ASK_SUBMITTED_STORAGE_KEY);
      ref = sanitizeAskSlug(sessionStorage.getItem(ASK_REF_STORAGE_KEY));
      market = sanitizeAskSlug(sessionStorage.getItem(ASK_MARKET_STORAGE_KEY));
    } catch {
      return;
    }
    if (!submitted) return;
    setShowAddress(true);
    trackAskSubmitted({
      source_page: "/ask",
      language: next,
      ref,
      market,
    });
  }, []);

  const siteLang = siteLangForAskLocale(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-8 lg:px-12">
        <Link
          href={`/${siteLang}`}
          aria-label="Clarvia home"
          className="block relative w-32 h-14 sm:w-40 sm:h-20"
        >
          <Image
            src="/clarvia-logo.webp"
            alt="Clarvia"
            fill
            sizes="160px"
            priority
            className="object-contain"
          />
        </Link>
      </header>
      <main
        id="main-content"
        className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-20 relative z-10 text-center"
      >
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {askCopy(locale, "sent_title")}
        </h1>
        <p className="text-base sm:text-lg text-calm-blue-600 leading-relaxed">
          {askCopy(locale, showAddress ? "sent_body_with_address" : "sent_body")}
        </p>
      </main>
    </div>
  );
}
