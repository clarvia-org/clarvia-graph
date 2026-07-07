"use client";

import { type Lang, l } from "@/lib/i18n";

export default function CookieSettingsTrigger({ lang }: { lang: Lang }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("clarvia-open-cookie-settings"))}
      className="hover:text-calm-blue-600 underline cursor-pointer transition-colors"
    >
      {l(lang, "Cookie settings", "Paramètres des cookies", "Cookie-Einstellungen", "Cookie-Astellungen")}
    </button>
  );
}
