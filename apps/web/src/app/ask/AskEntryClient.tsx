"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AskForm from "@/components/AskForm";
import CookieConsent from "@/components/CookieConsent";
import { headlineStyle } from "@/app/[lang]/data";
import {
  ASK_LOCALES,
  ASK_LOCALE_NAMES,
  ASK_LOCALE_STORAGE_KEY,
  ASK_MARKET_STORAGE_KEY,
  ASK_REF_STORAGE_KEY,
  isRtlAskLocale,
  parseAskLocale,
  resolveAskLocale,
  sanitizeAskSlug,
  siteLangForAskLocale,
  type AskLocale,
} from "@/lib/ask-entry";
import { askCopy, askFormCopy } from "@/lib/ask-entry-copy";

function readBrowserLanguages(): string[] {
  if (typeof navigator === "undefined") return [];
  if (navigator.languages?.length) return [...navigator.languages];
  return navigator.language ? [navigator.language] : [];
}

function persistAttribution(ref: string | undefined, market: string | undefined) {
  try {
    if (ref) sessionStorage.setItem(ASK_REF_STORAGE_KEY, ref);
    else sessionStorage.removeItem(ASK_REF_STORAGE_KEY);
    if (market) sessionStorage.setItem(ASK_MARKET_STORAGE_KEY, market);
    else sessionStorage.removeItem(ASK_MARKET_STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

export default function AskEntryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkHint = searchParams.get("lang");
  const initialLocale = parseAskLocale(linkHint) ?? "en";
  const [locale, setLocale] = useState<AskLocale>(initialLocale);

  const ref = sanitizeAskSlug(searchParams.get("ref"));
  const market = sanitizeAskSlug(searchParams.get("market"));

  useEffect(() => {
    persistAttribution(ref, market);
  }, [ref, market]);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(ASK_LOCALE_STORAGE_KEY);
    } catch {
      saved = null;
    }
    setLocale(
      resolveAskLocale({
        saved,
        browserLanguages: readBrowserLanguages(),
        linkHint,
      }),
    );
  }, [linkHint]);

  useEffect(() => {
    const html = document.documentElement;
    const previousDir = html.getAttribute("dir");
    const previousLang = html.getAttribute("lang");
    html.setAttribute("dir", isRtlAskLocale(locale) ? "rtl" : "ltr");
    html.setAttribute("lang", locale);
    return () => {
      if (previousDir) html.setAttribute("dir", previousDir);
      else html.removeAttribute("dir");
      if (previousLang) html.setAttribute("lang", previousLang);
      else html.removeAttribute("lang");
    };
  }, [locale]);

  const copy = useMemo(() => askFormCopy(locale), [locale]);
  const siteLang = siteLangForAskLocale(locale);

  function onSelectLocale(next: AskLocale) {
    setLocale(next);
    try {
      localStorage.setItem(ASK_LOCALE_STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      dir={isRtlAskLocale(locale) ? "rtl" : "ltr"}
      lang={locale}
    >
      <header className="py-4 px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-x-4 z-50 relative">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-calm-blue-800 focus:rounded-lg focus:shadow-lg focus:outline-2 focus:outline-calm-blue-400 focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <Link
          href={`/${siteLang}`}
          aria-label="Clarvia home"
          className="block relative w-32 h-14 sm:w-40 sm:h-20 transition-transform duration-200 hover:scale-[1.02] shrink-0"
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
        <label className="flex items-center gap-2 text-sm text-calm-blue-700">
          <span className="font-medium">{askCopy(locale, "language_label")}</span>
          <select
            value={locale}
            onChange={(e) => {
              const next = parseAskLocale(e.target.value);
              if (next) onSelectLocale(next);
            }}
            className="min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus:outline-none focus:ring-2 focus:ring-calm-lilac-400"
          >
            {ASK_LOCALES.map((code) => (
              <option key={code} value={code} lang={code}>
                {ASK_LOCALE_NAMES[code]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main
        id="main-content"
        className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10"
      >
        <section className="text-center py-8 sm:py-12" aria-labelledby="ask-heading">
          <p className="text-sm font-semibold tracking-wide uppercase text-calm-blue-500 mb-4">
            {askCopy(locale, "eyebrow")}
          </p>
          <h1
            id="ask-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4"
            style={headlineStyle}
          >
            {askCopy(locale, "title")}
          </h1>
          <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-4">
            {askCopy(locale, "blurb")}
          </p>
          <p className="text-base sm:text-lg text-calm-blue-600 max-w-3xl mx-auto leading-relaxed mb-10">
            {askCopy(locale, "reply_timing")}
          </p>
          <AskForm copy={copy} onSuccess={() => router.push(`/ask/sent?lang=${locale}`)} />
          <div id="cookie-consent-slot" className="max-w-2xl mx-auto mt-4" />
          <p className="text-sm text-calm-blue-500 max-w-2xl mx-auto mt-6 leading-relaxed">
            {askCopy(locale, "operator_line")}{" "}
            <Link href={`/${siteLang}/how-it-works`} className="underline hover:text-calm-blue-800">
              {askCopy(locale, "how_it_works")}
            </Link>
            {" · "}
            <Link href={`/${siteLang}/privacy`} className="underline hover:text-calm-blue-800">
              {askCopy(locale, "privacy")}
            </Link>
          </p>
        </section>
      </main>

      <footer className="py-8 px-4 text-center text-sm text-calm-blue-500">
        <p>Clarvia ASBL · RCS Luxembourg F15680</p>
        <p className="mt-2">
          <Link href={`/${siteLang}/partners`} className="underline hover:text-calm-blue-800">
            {askCopy(locale, "partners_link")}
          </Link>
        </p>
      </footer>
      <CookieConsent lang={siteLang} />
    </div>
  );
}
