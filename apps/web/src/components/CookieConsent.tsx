"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type Lang, l } from "@/lib/i18n";
import {
  saveConsentPreference,
  updateGoogleConsent,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "@/lib/consent";

export default function CookieConsent({ lang }: { lang: Lang }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [openedFromSettings, setOpenedFromSettings] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

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

    setSlot(
      document.getElementById("cookie-consent-slot") ??
        document.getElementById("cookie-consent-slot-footer"),
    );

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
      setOpenedFromSettings(true);
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
    };

    window.addEventListener("clarvia-open-cookie-settings", handleOpen);
    return () => window.removeEventListener("clarvia-open-cookie-settings", handleOpen);
  }, []);

  const useInline = Boolean(slot) && !openedFromSettings;

  useEffect(() => {
    if (!isRendered || useInline) {
      document.documentElement.style.removeProperty("--cookie-banner-height");
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty("--cookie-banner-height", `${el.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--cookie-banner-height");
    };
  }, [isRendered, isVisible, lang, useInline]);

  const handleChoice = (status: "granted" | "denied") => {
    saveConsentPreference(status);
    updateGoogleConsent(status);
    window.dispatchEvent(new Event("clarvia-consent-updated"));

    setIsVisible(false);
    setOpenedFromSettings(false);
    setTimeout(() => setIsRendered(false), 500);
  };

  if (!isRendered) return null;

  const bar = (
    <div
      ref={barRef}
      role="region"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className={
        useInline
          ? `rounded-2xl border border-calm-blue-200/70 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(43,58,103,0.08)] transition-all duration-500 ease-in-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`
          : `fixed inset-x-0 bottom-0 z-50 border-t border-calm-blue-200/70 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(43,58,103,0.08)] transition-all duration-500 ease-in-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 pointer-events-none"
            }`
      }
    >
      <div
        className={`max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
          useInline ? "max-w-none" : ""
        }`}
        style={
          useInline
            ? undefined
            : { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }
        }
      >
        <div className="flex-1 min-w-0">
          <h2 id="consent-title" className="font-semibold text-sm text-[#2b3a67]">
            {l(
              lang,
              "Privacy preferences",
              "Préférences de confidentialité",
              "Datenschutzeinstellungen",
              "Dateschutz-Astellungen",
            )}
          </h2>
          <p
            id="consent-description"
            className="text-xs text-calm-blue-600 leading-snug mt-0.5 line-clamp-2 sm:line-clamp-none"
          >
            {l(
              lang,
              "We are a non-profit building a free bereavement service. To understand site performance and measure whether ads help people reach Ask Clarvia, we use Google Analytics and Google Ads conversion measurement. We do not use remarketing. You can accept optional measurement to support this work or continue with essential settings only.",
              "Nous sommes une association sans but lucratif qui développe un service d'accompagnement gratuit. Pour nous aider à comprendre les performances du site et à améliorer nos listes de démarches, nous utilisons Google Analytics. Accepter ces mesures facultatives soutient directement notre mission — ou vous pouvez continuer avec les paramètres essentiels uniquement.",
              "Wir sind ein gemeinnütziger Verein, der eine kostenlose Orientierungshilfe im Trauerfall entwickelt. Um die Leistung unserer Website besser zu verstehen und unsere Checklisten zu verbessern, nutzen wir Google Analytics. Wenn Sie diesen optionalen Messungen zustimmen, unterstützen Sie unsere Arbeit direkt — oder Sie können nur mit den erforderlichen Einstellungen fortfahren.",
              "Mir sinn eng ASBL, déi e gratis Service fir Begleedung am Trauerfall opbaut. Fir besser ze verstoen, wéi eis Websäit funktionéiert, an eis Checklëschten ze verbesseren, benotze mir Google Analytics. Wann Dir déi fakultativ Miessungen akzeptéiert, ënnerstëtzt Dir direkt eis Missioun — oder Dir kënnt mat nëmmen den néidegen Astellunge weiderfueren.",
            )}
          </p>
        </div>
        <div className="flex flex-row gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => handleChoice("denied")}
            className="flex-1 sm:flex-none py-2 px-4 border border-calm-blue-200 hover:border-calm-blue-300 text-calm-blue-800 font-medium text-xs rounded-xl bg-white hover:bg-calm-blue-50 transition-all cursor-pointer text-center"
          >
            {l(
              lang,
              "Decline / Essential only",
              "Refuser / Essentiel uniquement",
              "Ablehnen / Nur erforderlich",
              "Refuséieren / nëmmen dat Noutwendegt",
            )}
          </button>
          <button
            type="button"
            onClick={() => handleChoice("granted")}
            className="flex-1 sm:flex-none py-2 px-4 border border-calm-blue-200 hover:border-calm-blue-300 text-calm-blue-800 font-medium text-xs rounded-xl bg-white hover:bg-calm-blue-50 transition-all cursor-pointer text-center"
          >
            {l(lang, "Accept all", "Tout accepter", "Alle akzeptieren", "Alles akzeptéieren")}
          </button>
        </div>
      </div>
    </div>
  );

  if (useInline && slot) {
    return createPortal(bar, slot);
  }

  return bar;
}
