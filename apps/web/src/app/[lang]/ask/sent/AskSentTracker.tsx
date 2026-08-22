"use client";

import { useEffect, useState } from "react";
import { type Lang, l } from "@/lib/i18n";

const ASK_OK_KEY = "clarvia-ask-submitted";

function notice(lang: Lang, showAddress: boolean): string {
  const withAddress = l(
    lang,
    "Look for an email from Lex at Clarvia (lex@clarvia.org). Check your spam folder if it doesn’t arrive within a few minutes.",
    "Vous allez recevoir un e-mail de Lex, de l’équipe Clarvia (lex@clarvia.org). Vérifiez votre dossier de courriers indésirables s’il n’arrive pas dans les prochaines minutes.",
    "Halten Sie Ausschau nach einer E-Mail von Lex bei Clarvia (lex@clarvia.org). Prüfen Sie Ihren Spam-Ordner, falls sie nicht innerhalb weniger Minuten eintrifft.",
    "Kuckt no enger E-Mail vum Lex bei Clarvia (lex@clarvia.org). Kontrolléiert Äre Spam-Dossier, wann se net bannent e puer Minutten ukënnt."
  );
  return showAddress ? withAddress : withAddress.replace(" (lex@clarvia.org)", "");
}

export default function AskSentTracker({ lang }: { lang: Lang }) {
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    let submitted = false;
    try {
      submitted = sessionStorage.getItem(ASK_OK_KEY) === "1";
      if (submitted) sessionStorage.removeItem(ASK_OK_KEY);
    } catch {
      return;
    }
    if (!submitted) return;
    setShowAddress(true);
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "ask_submitted", {
        source_page: `/${lang}`,
        consent_type: "ask-consent-v1",
      });
    }
  }, [lang]);

  return (
    <p className="text-base sm:text-lg text-calm-blue-600 leading-relaxed">
      {notice(lang, showAddress)}
    </p>
  );
}
