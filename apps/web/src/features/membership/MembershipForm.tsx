"use client";

import { useEffect, useId, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ASSOCIATE_ANNUAL_EUR,
  ASSOCIATE_MONTHLY_EUR,
  normalizeLinkedInProfileUrl,
} from "@/content/associate-members";
import MarketingConsent from "@/features/donations/MarketingConsent";
import { trackBeginCheckout } from "@/lib/analytics";
import { type Lang, l } from "@/lib/i18n";

export interface MembershipFormProps {
  lang: Lang;
  onNameChange?: (name: string) => void;
  onPublishChange?: (publish: boolean) => void;
}

function MembershipFormInner({
  lang,
  onNameChange,
  onPublishChange,
}: MembershipFormProps) {
  const searchParams = useSearchParams();
  const baseId = useId();
  const nameId = `${baseId}-member-name`;
  const nameErrorId = `${baseId}-member-name-error`;
  const charterId = `${baseId}-charter`;
  const charterErrorId = `${baseId}-charter-error`;
  const publishId = `${baseId}-publish`;
  const linkedinId = `${baseId}-linkedin`;
  const linkedinHintId = `${baseId}-linkedin-hint`;
  const linkedinErrorId = `${baseId}-linkedin-error`;

  const [frequency, setFrequency] = useState<"monthly" | "annual">("monthly");
  const [memberName, setMemberName] = useState("");
  const [ambassadorAgreed, setAmbassadorAgreed] = useState(false);
  const [publishMember, setPublishMember] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Interaction tracking so errors only display after blur/change or submit attempt
  const [nameEdited, setNameEdited] = useState(false);
  const [nameShowError, setNameShowError] = useState(false);
  const [charterShowError, setCharterShowError] = useState(false);
  const [linkedinEdited, setLinkedinEdited] = useState(false);
  const [linkedinShowError, setLinkedinShowError] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const charterRef = useRef<HTMLInputElement>(null);
  const linkedinRef = useRef<HTMLInputElement>(null);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attribution = {
    source: searchParams.get("utm_source") || undefined,
    medium: searchParams.get("utm_medium") || undefined,
    campaign: searchParams.get("utm_campaign") || undefined,
    term: searchParams.get("utm_term") || undefined,
    content: searchParams.get("utm_content") || undefined,
    gclid: searchParams.get("gclid") || undefined,
  };

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setIsProcessing(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (announceTimerRef.current) {
        clearTimeout(announceTimerRef.current);
      }
    };
  }, []);

  const isNameValid =
    memberName.trim().length >= 2 && memberName.trim().length <= 120;
  const normalizedLinkedIn = normalizeLinkedInProfileUrl(linkedinUrl);
  const isLinkedinValid = !publishMember || normalizedLinkedIn !== null;

  const errorLabelWord = l(lang, "Error", "Erreur", "Fehler", "Feeler");
  const nameErrorText = l(
    lang,
    "Please enter your full name (2 to 120 characters) for Clarvia ASBL's Associate Member register.",
    "Veuillez saisir votre nom complet (2 à 120 caractères) pour le registre des membres adhérents.",
    "Bitte geben Sie Ihren vollständigen Namen (2 bis 120 Zeichen) für das Mitgliederregister ein.",
    "Gitt wgl. Äre ganzen Numm (2 bis 120 Zeechen) fir de Membersregister un.",
  );
  const charterErrorText = l(
    lang,
    "Please confirm the Associate Member & Mission Ambassador agreement before continuing.",
    "Veuillez accepter l'engagement de membre adhérent et d'ambassadeur avant de continuer.",
    "Bitte bestätigen Sie die Erklärung für assoziierte Mitglieder und Botschafter, um fortzufahren.",
    "Bestätegt wgl. d'Erklärung fir assoziéiert Memberen an Ambassadeuren, ier Dir weidergitt.",
  );
  const linkedinErrorText = l(
    lang,
    "Enter a personal LinkedIn profile URL in the format https://www.linkedin.com/in/your-name.",
    "Saisissez une URL de profil LinkedIn personnel au format https://www.linkedin.com/in/votre-nom.",
    "Geben Sie eine persönliche LinkedIn-Profil-URL im Format https://www.linkedin.com/in/ihr-name ein.",
    "Gitt eng perséinlech LinkedIn-Profil-URL am Format https://www.linkedin.com/in/aeren-numm un.",
  );

  function schedulePoliteAnnouncement(message: string) {
    if (announceTimerRef.current) {
      clearTimeout(announceTimerRef.current);
    }
    setLiveAnnouncement("");
    announceTimerRef.current = setTimeout(() => {
      setLiveAnnouncement(`${errorLabelWord}: ${message}`);
    }, 500);
  }

  function clearPoliteAnnouncement() {
    if (announceTimerRef.current) {
      clearTimeout(announceTimerRef.current);
    }
    setLiveAnnouncement("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const nameFail = !isNameValid;
    const charterFail = !ambassadorAgreed;
    const linkedinFail = publishMember && !normalizedLinkedIn;

    setNameShowError(nameFail);
    setCharterShowError(charterFail);
    setLinkedinShowError(linkedinFail);

    if (nameFail || charterFail || linkedinFail) {
      clearPoliteAnnouncement();
      if (nameFail) {
        nameRef.current?.focus();
      } else if (charterFail) {
        charterRef.current?.focus();
      } else if (linkedinFail) {
        linkedinRef.current?.focus();
      }
      return;
    }

    const amount =
      frequency === "annual" ? ASSOCIATE_ANNUAL_EUR : ASSOCIATE_MONTHLY_EUR;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: "associate_membership",
          type: frequency,
          lang,
          memberName: memberName.trim(),
          ambassadorAgreed: true,
          publishMember,
          linkedinUrl: publishMember ? normalizedLinkedIn : undefined,
          marketingOptIn,
          consentTextVersion: "associate-member-v1",
          landingVariant: "membership",
          attribution,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        trackBeginCheckout({
          value: amount,
          currency: "EUR",
          frequency,
          landing_variant: "membership",
          item_category: "associate_membership",
        });

        window.location.href = data.url;
        return;
      }

      setServerError(
        data.error ||
          l(
            lang,
            "Something went wrong creating your membership session. Please try bank transfer below.",
            "Une erreur est survenue lors de la création de votre session. Veuillez utiliser le virement bancaire ci-dessous.",
            "Beim Erstellen Ihrer Zahlungssitzung ist ein Fehler aufgetreten. Bitte nutzen Sie die Banküberweisung unten.",
            "Eppes ass schifgaangen. Probéiert wgl. d'Bankiwwerweisung ënnen.",
          ),
      );
      setIsProcessing(false);
    } catch {
      setServerError(
        l(
          lang,
          "Could not connect to the payment service. Please try bank transfer below.",
          "Impossible de se connecter au service de paiement. Veuillez utiliser le virement bancaire ci-dessous.",
          "Die Verbindung zum Zahlungsdienst konnte nicht hergestellt werden. Bitte nutzen Sie die Banküberweisung unten.",
          "D'Verbindung mam Bezuelservice konnt net hiergestallt ginn. Probéiert wgl. d'Bankiwwerweisung ënnen.",
        ),
      );
      setIsProcessing(false);
    }
  }

  const nameInvalidActive = nameShowError && !isNameValid;
  const charterInvalidActive = charterShowError && !ambassadorAgreed;
  const linkedinInvalidActive =
    publishMember && linkedinShowError && !isLinkedinValid;
  const displayAmount =
    frequency === "annual" ? ASSOCIATE_ANNUAL_EUR : ASSOCIATE_MONTHLY_EUR;

  return (
    <form
      method="POST"
      action="/api/donate"
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="membership-form-heading"
      className="space-y-5"
    >
      <div aria-live="polite" className="visually-hidden">
        {liveAnnouncement}
      </div>

      {/* Membership contribution frequency radio fieldset */}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold uppercase tracking-wider text-calm-blue-600 mb-1">
          {l(
            lang,
            "Statutory Membership Contribution",
            "Cotisation statutaire de membre adhérent",
            "Satzungsmäßiger Mitgliedsbeitrag",
            "Statutaire Membersbäitrag",
          )}
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <input
              type="radio"
              id={`${baseId}-freq-monthly`}
              name="frequency"
              value="monthly"
              checked={frequency === "monthly"}
              onChange={() => setFrequency("monthly")}
              className="peer sr-only"
            />
            <label
              htmlFor={`${baseId}-freq-monthly`}
              className="flex flex-col justify-between min-h-14 p-3.5 rounded-xl border-2 border-calm-blue-200 bg-white/75 cursor-pointer select-none peer-checked:border-calm-blue-700 peer-checked:bg-white peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-calm-blue-500 peer-focus-visible:outline-offset-2"
            >
              <span className="text-base font-semibold text-calm-blue-800">
                {l(
                  lang,
                  `€${ASSOCIATE_MONTHLY_EUR} / month`,
                  `${ASSOCIATE_MONTHLY_EUR} € / mois`,
                  `${ASSOCIATE_MONTHLY_EUR} € / Monat`,
                  `${ASSOCIATE_MONTHLY_EUR} € / Mount`,
                )}
              </span>
              <span className="text-xs text-calm-blue-600 mt-0.5">
                {l(
                  lang,
                  "Flexible monthly billing",
                  "Prélèvement mensuel",
                  "Monatliche Abrechnung",
                  "Monatlech Ofrechnung",
                )}
              </span>
            </label>
          </div>

          <div className="relative">
            <input
              type="radio"
              id={`${baseId}-freq-annual`}
              name="frequency"
              value="annual"
              checked={frequency === "annual"}
              onChange={() => setFrequency("annual")}
              className="peer sr-only"
            />
            <label
              htmlFor={`${baseId}-freq-annual`}
              className="flex flex-col justify-between min-h-14 p-3.5 rounded-xl border-2 border-calm-blue-200 bg-white/75 cursor-pointer select-none peer-checked:border-calm-blue-700 peer-checked:bg-white peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-calm-blue-500 peer-focus-visible:outline-offset-2"
            >
              <span className="text-base font-semibold text-calm-blue-800">
                {l(
                  lang,
                  `€${ASSOCIATE_ANNUAL_EUR} / year`,
                  `${ASSOCIATE_ANNUAL_EUR} € / an`,
                  `${ASSOCIATE_ANNUAL_EUR} € / Jahr`,
                  `${ASSOCIATE_ANNUAL_EUR} € / Joer`,
                )}
              </span>
              <span className="text-xs text-calm-blue-600 mt-0.5">
                {l(
                  lang,
                  "Single annual receipt (€40/mo)",
                  "Un seul reçu annuel (40 €/mois)",
                  "Ein Jahresbeleg (40 €/Monat)",
                  "Een Joresbeleg (40 €/Mount)",
                )}
              </span>
            </label>
          </div>
        </div>
      </fieldset>

      {/* Single Full Name field */}
      <div className="space-y-1">
        <label
          htmlFor={nameId}
          className="block text-sm font-semibold text-calm-blue-800"
        >
          {l(
            lang,
            "Full name",
            "Nom complet",
            "Vollständiger Name",
            "Ganzen Numm",
          )}{" "}
          <span className="text-calm-blue-600 font-normal" aria-hidden="true">
            *
          </span>
        </label>
        <input
          ref={nameRef}
          type="text"
          id={nameId}
          name="memberName"
          autoComplete="name"
          enterKeyHint="next"
          required
          minLength={2}
          maxLength={120}
          value={memberName}
          aria-invalid={nameInvalidActive ? "true" : "false"}
          aria-describedby={nameInvalidActive ? nameErrorId : undefined}
          onChange={(e) => {
            const val = e.target.value;
            setMemberName(val);
            setNameEdited(true);
            onNameChange?.(val);
            if (nameShowError && val.trim().length >= 2 && val.trim().length <= 120) {
              setNameShowError(false);
              clearPoliteAnnouncement();
            }
          }}
          onBlur={() => {
            if (nameEdited && !isNameValid) {
              setNameShowError(true);
              schedulePoliteAnnouncement(nameErrorText);
            }
          }}
          placeholder={l(
            lang,
            "e.g. Dr. Claire Martin",
            "ex. Dr Claire Martin",
            "z. B. Dr. Claire Martin",
            "z. B. Dr. Claire Martin",
          )}
          className={`w-full min-h-12 px-3.5 py-2.5 rounded-xl border text-base text-calm-blue-800 bg-white focus-visible:outline-2 focus-visible:outline-calm-blue-500 focus-visible:outline-offset-1 ${
            nameInvalidActive
              ? "border-red-600 bg-red-50/60"
              : "border-calm-blue-300"
          }`}
        />
        {nameInvalidActive && (
          <p id={nameErrorId} className="text-xs text-red-700 font-medium pt-0.5">
            <span role="img" aria-label={errorLabelWord} className="mr-1">
              ⚠
            </span>
            {nameErrorText}
          </p>
        )}
      </div>

      {/* Required Checkbox: Positive Ambassador & Statutory Charter */}
      <div className="space-y-1.5">
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border bg-white/75 shadow-sm ${
            charterInvalidActive ? "border-red-600 bg-red-50/50" : "border-calm-blue-200"
          }`}
        >
          <div className="flex items-center h-5 mt-0.5">
            <input
              ref={charterRef}
              id={charterId}
              name="ambassadorAgreed"
              type="checkbox"
              required
              checked={ambassadorAgreed}
              aria-invalid={charterInvalidActive ? "true" : "false"}
              aria-describedby={charterInvalidActive ? charterErrorId : undefined}
              onChange={(e) => {
                const checked = e.target.checked;
                setAmbassadorAgreed(checked);
                if (checked) {
                  setCharterShowError(false);
                  clearPoliteAnnouncement();
                } else if (charterShowError) {
                  schedulePoliteAnnouncement(charterErrorText);
                }
              }}
              className="h-4.5 w-4.5 rounded border-calm-blue-300 accent-calm-blue-700 focus-visible:outline-2 focus-visible:outline-calm-blue-500 cursor-pointer"
            />
          </div>
          <label
            htmlFor={charterId}
            className="text-xs text-calm-blue-700 leading-relaxed select-none cursor-pointer"
          >
            {l(
              lang,
              "I apply to join Clarvia ASBL as a non-voting Associate Member (Art. 7 AoA, zero personal liability) and agree to act as a positive ambassador helping spread knowledge of Clarvia's mission to help families worldwide for free. I understand membership confers no editorial influence or commercial endorsement.",
              "Je demande mon admission à Clarvia ASBL en tant que membre adhérent sans droit de vote (art. 7 des statuts, aucune responsabilité personnelle) et m'engage à être un ambassadeur positif faisant connaître la mission gratuite de Clarvia auprès des familles dans le monde, sans droit de regard éditorial ni recommandation commerciale.",
              "Ich beantrage die Aufnahme als nicht stimmberechtigtes assoziiertes Mitglied von Clarvia ASBL (Art. 7 der Satzung, keine persönliche Haftung) und erkläre mich bereit, als positiver Botschafter auf Clarvias kostenlose Hilfe für Familien weltweit aufmerksam zu machen – ohne redaktionellen Einfluss oder kommerzielle Empfehlung.",
              "Ech froen d'Opnam als assoziéierte Member ouni Stëmmrecht bei Clarvia ASBL un (Art. 7 vun de Statuten, keng perséinlech Haftung) an erklären mech bereet, als positiven Ambassadeur op d'gratis Missioun vu Clarvia fir Famillje weltwäit opmierksam ze maachen – ouni redaktionellen Afloss oder kommerziell Recommandatioun.",
            )}{" "}
            <span className="font-semibold text-calm-blue-800" aria-hidden="true">
              *
            </span>
          </label>
        </div>
        {charterInvalidActive && (
          <p id={charterErrorId} className="text-xs text-red-700 font-medium">
            <span role="img" aria-label={errorLabelWord} className="mr-1">
              ⚠
            </span>
            {charterErrorText}
          </p>
        )}
      </div>

      {/* Optional Checkbox: Publish Membership + LinkedIn Portrait & URL */}
      <div className="p-3.5 rounded-xl border border-calm-blue-200 bg-white/65 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id={publishId}
              name="publishMember"
              type="checkbox"
              checked={publishMember}
              onChange={(e) => {
                const next = e.target.checked;
                setPublishMember(next);
                onPublishChange?.(next);
                if (!next) {
                  setLinkedinShowError(false);
                  clearPoliteAnnouncement();
                }
              }}
              className="h-4.5 w-4.5 rounded border-calm-blue-300 accent-calm-blue-700 focus-visible:outline-2 focus-visible:outline-calm-blue-500 cursor-pointer"
            />
          </div>
          <label
            htmlFor={publishId}
            className="text-xs text-calm-blue-700 leading-relaxed select-none cursor-pointer"
          >
            {l(
              lang,
              "Publish my Associate Membership on clarvia.org — displaying my name, LinkedIn profile photo, professional headline, and a link to my LinkedIn profile (optional; leave unchecked to remain private).",
              "Publier mon adhésion sur clarvia.org — avec mon nom, la photo et le titre de mon profil LinkedIn ainsi qu'un lien vers mon profil LinkedIn (facultatif ; laissez décoché pour rester privé).",
              "Meine assoziierte Mitgliedschaft auf clarvia.org veröffentlichen – mit meinem Namen, meinem LinkedIn-Profilbild, meiner Berufsbezeichnung und einem Link zu meinem LinkedIn-Profil (optional; ohne Häkchen privat).",
              "Meng assoziéiert Memberschaft op clarvia.org verëffentlechen – mat mengem Numm, menger LinkedIn-Profilfoto, mengem Titel an engem Link op mäi LinkedIn-Profil (optional; ouni Haischen privat).",
            )}
          </label>
        </div>

        {publishMember && (
          <div className="pt-2 border-t border-calm-blue-100 space-y-1">
            <label
              htmlFor={linkedinId}
              className="block text-xs font-semibold text-calm-blue-800"
            >
              {l(
                lang,
                "Personal LinkedIn profile URL",
                "URL de votre profil LinkedIn personnel",
                "Persönliche LinkedIn-Profil-URL",
                "Perséinlech LinkedIn-Profil-URL",
              )}{" "}
              <span className="text-calm-blue-600 font-normal" aria-hidden="true">
                *
              </span>
            </label>
            <span
              id={linkedinHintId}
              className="block text-[11px] text-calm-blue-600 pb-0.5"
            >
              {l(
                lang,
                "Format: https://www.linkedin.com/in/your-name (the only source we use)",
                "Format : https://www.linkedin.com/in/votre-nom (seule source utilisée)",
                "Format: https://www.linkedin.com/in/ihr-name (einzige verwendete Quelle)",
                "Format: https://www.linkedin.com/in/aeren-numm (eenzeg benotzte Quell)",
              )}
            </span>
            <input
              ref={linkedinRef}
              type="url"
              id={linkedinId}
              name="linkedinUrl"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="done"
              required
              value={linkedinUrl}
              aria-invalid={linkedinInvalidActive ? "true" : "false"}
              aria-describedby={
                linkedinInvalidActive
                  ? `${linkedinHintId} ${linkedinErrorId}`
                  : linkedinHintId
              }
              onChange={(e) => {
                const val = e.target.value;
                setLinkedinUrl(val);
                setLinkedinEdited(true);
                if (linkedinShowError && normalizeLinkedInProfileUrl(val) !== null) {
                  setLinkedinShowError(false);
                  clearPoliteAnnouncement();
                }
              }}
              onBlur={() => {
                if (linkedinEdited && normalizeLinkedInProfileUrl(linkedinUrl) === null) {
                  setLinkedinShowError(true);
                  schedulePoliteAnnouncement(linkedinErrorText);
                }
              }}
              placeholder="https://www.linkedin.com/in/..."
              className={`w-full min-h-12 px-3.5 py-2.5 rounded-xl border text-base text-calm-blue-800 bg-white focus-visible:outline-2 focus-visible:outline-calm-blue-500 focus-visible:outline-offset-1 ${
                linkedinInvalidActive
                  ? "border-red-600 bg-red-50/60"
                  : "border-calm-blue-300"
              }`}
            />
            {linkedinInvalidActive && (
              <p id={linkedinErrorId} className="text-xs text-red-700 font-medium pt-0.5">
                <span role="img" aria-label={errorLabelWord} className="mr-1">
                  ⚠
                </span>
                {linkedinErrorText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Optional occasional updates consent */}
      <MarketingConsent
        lang={lang}
        checked={marketingOptIn}
        onChange={setMarketingOptIn}
      />

      {serverError && (
        <div
          role="alert"
          className="p-3 rounded-xl border border-red-300 bg-red-50 text-xs text-red-800 font-medium"
        >
          <span role="img" aria-label={errorLabelWord} className="mr-1">
            ⚠
          </span>
          {serverError}
        </div>
      )}

      {/* Primary Submit Button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isProcessing}
          className={`btn-primary w-full min-h-12 py-3.5 px-4 text-base flex justify-center items-center gap-2 ${
            isProcessing ? "opacity-65 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing
            ? l(
                lang,
                "Redirecting to Stripe...",
                "Redirection vers Stripe...",
                "Weiterleitung zu Stripe...",
                "Weiderleedung op Stripe...",
              )
            : l(
                lang,
                `Join as Associate Member — €${displayAmount}${
                  frequency === "annual" ? "/year" : "/month"
                }`,
                `Devenir membre adhérent — ${displayAmount} €${
                  frequency === "annual" ? "/an" : "/mois"
                }`,
                `Mitglied werden — ${displayAmount} €${
                  frequency === "annual" ? "/Jahr" : "/Monat"
                }`,
                `Member ginn — ${displayAmount} €${
                  frequency === "annual" ? "/Joer" : "/Mount"
                }`,
              )}
        </button>
      </div>

      {/* Reassurance Micro-Copy */}
      <div className="text-center text-xs text-calm-blue-600 space-y-1">
        <p>
          {l(
            lang,
            "Secure subscription checkout via Stripe · Cancel anytime in 1 click.",
            "Paiement sécurisé via Stripe · Résiliable en 1 clic à tout moment.",
            "Sichere Zahlung über Stripe · Jederzeit mit 1 Klick kündbar.",
            "Séchert Bezuele mat Stripe · Zu all Moment mat 1 Klick kënnegbar.",
          )}
        </p>
        <p>
          {l(
            lang,
            "Zero personal liability (Art. 5 AoA) · Clarvia's family services remain free for everyone.",
            "Aucune responsabilité personnelle (art. 5 des statuts) · Les services aux familles restent gratuits.",
            "Keine persönliche Haftung (Art. 5 der Satzung) · Alle Angebote für Familien bleiben kostenlos.",
            "Keng perséinlech Haftung (Art. 5 vun de Statuten) · All Servicer fir Famillje bleiwe gratis.",
          )}
        </p>
      </div>
    </form>
  );
}

export default function MembershipForm(props: MembershipFormProps) {
  return (
    <Suspense
      fallback={<div className="animate-pulse h-80 bg-calm-blue-50/50 rounded-xl" />}
    >
      <MembershipFormInner {...props} />
    </Suspense>
  );
}
