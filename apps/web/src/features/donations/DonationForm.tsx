import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type Lang, l } from "@/lib/i18n";
import DonationAmountSelector from "./DonationAmountSelector";
import MarketingConsent from "./MarketingConsent";
import { type DonationLandingVariant } from "./landing-page-config";

export interface DonationFormProps {
  lang: Lang;
  landingVariant: string;
  config: DonationLandingVariant;
}

function DonationFormInner({ lang, landingVariant, config }: DonationFormProps) {
  const searchParams = useSearchParams();
  const [frequency, setFrequency] = useState<"monthly" | "onetime">(config.defaultFrequency);
  const [amount, setAmount] = useState<number>(config.defaultAmount);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Parse attribution parameters from URL directly during render
  const attribution = {
    source: searchParams.get("utm_source") || undefined,
    medium: searchParams.get("utm_medium") || undefined,
    campaign: searchParams.get("utm_campaign") || undefined,
    term: searchParams.get("utm_term") || undefined,
    content: searchParams.get("utm_content") || undefined,
    gclid: searchParams.get("gclid") || undefined,
  };

  // Reset redirecting state when user comes back
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setIsProcessing(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSelectorChange = (freq: "monthly" | "onetime", amt: number, valid: boolean) => {
    setFrequency(freq);
    setAmount(amt);
    setIsValid(valid);
  };

  async function handleCardPayment() {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          type: frequency === "monthly" ? "monthly" : "onetime",
          lang,
          marketingOptIn,
          consentTextVersion: "marketing-donation-v1",
          landingVariant,
          attribution,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          data.error ||
            l(
              lang,
              "Something went wrong. Please try bank transfer instead.",
              "Une erreur est survenue. Veuillez plutôt effectuer un virement bancaire.",
              "Etwas ist schiefgelaufen. Bitte nutzen Sie stattdessen eine Banküberweisung.",
              "Eppes ass schifgaangen. Probéiert wgl. amplaz eng Bankiwwerweisung."
            )
        );
        setIsProcessing(false);
      }
    } catch {
      alert(
        l(
          lang,
          "Could not connect to the payment service. Please try bank transfer instead.",
          "Impossible de se connecter au service de paiement. Veuillez plutôt effectuer un virement bancaire.",
          "Die Verbindung zum Zahlungsdienst konnte nicht hergestellt werden. Bitte nutzen Sie stattdessen eine Banküberweisung.",
          "D'Verbindung mam Bezuelservice konnt net hiergestallt ginn. Probéiert wgl. amplaz eng Bankiwwerweisung."
        )
      );
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <DonationAmountSelector
        lang={lang}
        defaultFrequency={config.defaultFrequency}
        defaultAmount={config.defaultAmount}
        onChange={handleSelectorChange}
        tiers={config.customTiers}
      />

      <MarketingConsent
        lang={lang}
        checked={marketingOptIn}
        onChange={setMarketingOptIn}
      />

      {/* Pay with card button */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleCardPayment}
          disabled={isProcessing || !isValid}
          className={`btn-primary w-full py-3.5 text-base flex justify-center items-center gap-2 ${
            isProcessing || !isValid ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing
            ? l(lang, "Redirecting...", "Redirection...", "Weiterleitung...", "Weiderleedung...")
            : isValid
              ? l(
                  lang,
                  `Donate \u20AC${amount.toLocaleString()}${frequency === "monthly" ? "/mo" : ""}`,
                  `Donner ${amount.toLocaleString()} \u20AC${frequency === "monthly" ? "/mois" : ""}`,
                  `${amount.toLocaleString()} \u20AC${frequency === "monthly" ? "/Monat" : ""} spenden`,
                  `${amount.toLocaleString()} \u20AC${frequency === "monthly" ? "/Mount" : ""} spenden`
                )
              : l(lang, "Enter an amount", "Saisir un montant", "Betrag eingeben", "Betrag aginn")}
        </button>
      </div>

      {/* Reassurance text */}
      <div className="text-center text-xs text-calm-blue-400 space-y-1 mt-3">
        <p>
          {l(
            lang,
            "Secure payment through Stripe.",
            "Paiement sécurisé via Stripe.",
            "Sichere Zahlung über Stripe.",
            "Séchert Bezuele mat Stripe."
          )}
        </p>
        <p>
          {l(
            lang,
            "The checklist is free whether or not you donate.",
            "La liste de démarches reste gratuite, que vous fassiez un don ou non.",
            "Die Checkliste bleibt kostenlos, unabhängig davon, ob Sie spenden oder nicht.",
            "D'Checklëscht ass gratis, egal ob Dir spend oder net."
          )}
        </p>
        <p>
          {l(
            lang,
            "Cancel monthly support at any time.",
            "Annulez votre soutien mensuel à tout moment.",
            "Monatliche Unterstützung jederzeit kündbar.",
            "All Mount Ënnerstëtzung zu all Moment kënnen ofgebrach ginn."
          )}
        </p>
      </div>
    </div>
  );
}

export default function DonationForm(props: DonationFormProps) {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-calm-blue-50/50 rounded-xl" />}>
      <DonationFormInner {...props} />
    </Suspense>
  );
}
