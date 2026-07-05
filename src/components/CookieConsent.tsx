"use client";

import { useEffect, useState } from "react";
import { type Lang, l } from "@/lib/i18n";
import { saveConsentPreference, updateGoogleConsent, CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/consent";

export default function CookieConsent({ lang }: { lang: Lang }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let showBanner = true;
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === CONSENT_VERSION) {
          showBanner = false;
        }
      }
    } catch (e) {
      console.error("Error reading consent from localStorage", e);
    }

    if (showBanner) {
      const t1 = setTimeout(() => setIsRendered(true), 50);
      const t2 = setTimeout(() => setIsVisible(true), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
    };

    window.addEventListener("clarvia-open-cookie-settings", handleOpen);
    return () => window.removeEventListener("clarvia-open-cookie-settings", handleOpen);
  }, []);

  const handleChoice = (status: "granted" | "denied") => {
    saveConsentPreference(status);
    updateGoogleConsent(status);
    window.dispatchEvent(new Event("clarvia-consent-updated"));

    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 500); // Wait for transition animation to finish
  };

  if (!isRendered) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="glass-panel shadow-2xl border border-calm-blue-200/50 rounded-2xl p-5 md:p-6 text-sm flex flex-col gap-4">
        <div>
          <h4 id="consent-title" className="font-semibold text-base text-[#2b3a67] mb-1">
            {l(lang, "Privacy preferences", "Préférences de confidentialité", "Datenschutzeinstellungen")}
          </h4>
          <p id="consent-description" className="text-xs text-calm-blue-600 leading-relaxed">
            {l(
              lang,
              "We use essential technologies to keep this site secure. With your permission, we also use Google Analytics to understand site performance and prepare privacy-conscious donation measurement. You can accept all optional measurement or continue with essential-only settings.",
              "Nous utilisons des technologies essentielles pour assurer la sécurité du site. Avec votre accord, nous utilisons également Google Analytics afin de comprendre les performances du site et de préparer une mesure respectueuse de la vie privée des dons. Vous pouvez accepter les mesures optionnelles ou continuer avec les paramètres essentiels uniquement.",
              "Wir verwenden notwendige Technologien, um diese Website sicher zu betreiben. Mit Ihrer Zustimmung verwenden wir außerdem Google Analytics, um die Website-Leistung zu verstehen und eine datenschutzbewusste Spendenmessung vorzubereiten. Sie können alle optionalen Messungen akzeptieren oder nur mit den erforderlichen Einstellungen fortfahren."
            )}
          </p>
        </div>

        <div className="flex flex-row gap-2">
          <button
            onClick={() => handleChoice("denied")}
            className="flex-1 py-2 px-3 border border-calm-blue-200 hover:border-calm-blue-300 text-calm-blue-800 font-medium text-xs rounded-xl bg-white hover:bg-calm-blue-50 transition-all cursor-pointer text-center"
          >
            {l(lang, "Decline / Essential only", "Refuser / Essentiel uniquement", "Ablehnen / Nur erforderlich")}
          </button>
          <button
            onClick={() => handleChoice("granted")}
            className="flex-1 py-2 px-3 bg-calm-blue-100 hover:bg-calm-blue-200 hover:border-calm-blue-300 border border-transparent text-calm-blue-900 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            {l(lang, "Accept all", "Tout accepter", "Alle akzeptieren")}
          </button>
        </div>
      </div>
    </div>
  );
}
