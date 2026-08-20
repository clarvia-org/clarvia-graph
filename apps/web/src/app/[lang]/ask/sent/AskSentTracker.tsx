"use client";

import { useEffect } from "react";
import { type Lang } from "@/lib/i18n";

const ASK_OK_KEY = "clarvia-ask-submitted";

export default function AskSentTracker({ lang }: { lang: Lang }) {
  useEffect(() => {
    let shouldTrack = false;
    try {
      shouldTrack = sessionStorage.getItem(ASK_OK_KEY) === "1";
      if (shouldTrack) sessionStorage.removeItem(ASK_OK_KEY);
    } catch {
      return;
    }
    if (!shouldTrack) return;
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "ask_submitted", {
        source_page: `/${lang}`,
        consent_type: "ask-consent-v1",
      });
    }
  }, [lang]);

  return null;
}
