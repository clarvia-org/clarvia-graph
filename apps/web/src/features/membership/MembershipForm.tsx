"use client";

import { useEffect, useId, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ASSOCIATE_ANNUAL_EUR,
  ASSOCIATE_MONTHLY_EUR,
  normalizeLinkedInProfileUrl,
  type MemberKind,
} from "@/content/associate-members";
import { trackBeginCheckout } from "@/lib/analytics";
import { type Lang, l } from "@/lib/i18n";

export interface MembershipFormProps {
  lang: Lang;
  onNameChange?: (name: string) => void;
  onPublishChange?: (publish: boolean) => void;
  onMemberKindChange?: (kind: MemberKind) => void;
}

function MembershipFormInner({
  lang,
  onNameChange,
  onPublishChange,
  onMemberKindChange,
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

  const [memberKind, setMemberKind] = useState<MemberKind>("individual");
  const [frequency, setFrequency] = useState<"monthly" | "annual">("monthly");
  const [memberName, setMemberName] = useState("");
  const [ambassadorAgreed, setAmbassadorAgreed] = useState(false);
  const [publishMember, setPublishMember] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

  const isOrg = memberKind === "organization";
  const isNameValid =
    memberName.trim().length >= 2 && memberName.trim().length <= 120;
  const normalizedLinkedIn = normalizeLinkedInProfileUrl(linkedinUrl);
  const isLinkedinValid = !publishMember || normalizedLinkedIn !== null;

  const errorLabelWord = l(lang, "Error", "Erreur", "Fehler", "Feeler");
  const nameErrorText = isOrg
    ? l(
        lang,
        "Please enter the company name or designated contact (2 to 120 characters).",
        "Veuillez saisir le nom de l'entreprise ou du contact désigné (2 à 120 caractères).",
        "Bitte geben Sie den Unternehmensnamen oder die Kontaktperson (2 bis 120 Zeichen) ein.",
        "Gitt wgl. den Numm vun der Entreprise oder der Kontaktpersoun (2 bis 120 Zeechen) un.",
      )
    : l(
        lang,
        "Please enter your full name (2 to 120 characters).",
        "Veuillez saisir votre nom complet (2 à 120 caractères).",
        "Bitte geben Sie Ihren vollständigen Namen (2 bis 120 Zeichen) ein.",
        "Gitt wgl. Äre ganzen Numm (2 bis 120 Zeechen) un.",
      );
  const charterErrorText = l(
    lang,
    "Please confirm the Associate Member and Ambassador agreement before continuing.",
    "Veuillez confirmer l'engagement de membre adhérent et d'ambassadeur avant de continuer.",
    "Bitte bestätigen Sie die Erklärung für assoziierte Mitglieder und Botschafter, um fortzufahren.",
    "Bestätegt wgl. d'Erklärung fir assoziéiert Memberen an Ambassadeuren, ier Dir weidergitt.",
  );
  const linkedinErrorText = l(
    lang,
    "Enter a LinkedIn URL in the format https://www.linkedin.com/in/name or https://www.linkedin.com/company/name.",
    "Saisissez une URL LinkedIn au format https://www.linkedin.com/in/nom ou https://www.linkedin.com/company/nom.",
    "Geben Sie eine LinkedIn-URL im Format https://www.linkedin.com/in/name oder https://www.linkedin.com/company/name ein.",
    "Gitt eng LinkedIn-URL am Format https://www.linkedin.com/in/numm oder https://www.linkedin.com/company/numm un.",
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
          memberKind,
          type: frequency,
          lang,
          memberName: memberName.trim(),
          ambassadorAgreed: true,
          publishMember,
          linkedinUrl: publishMember ? normalizedLinkedIn : undefined,
          consentTextVersion: "associate-member-v2",
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
      className="space-y-4"
    >
      <div aria-live="polite" className="visually-hidden">
        {liveAnnouncement}
      </div>

      {/* Member Kind Selector: Individual vs Company / Organisation */}
      <fieldset>
        <legend className="sr-only">
          {l(lang, "Member type", "Type de membre", "Mitgliedsart", "Memberstyp")}
        </legend>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-calm-blue-100/70 border border-calm-blue-200/80">
          <div>
            <input
              type="radio"
              id={`${baseId}-kind-ind`}
              name="memberKind"
              value="individual"
              checked={memberKind === "individual"}
              onChange={() => {
                setMemberKind("individual");
                onMemberKindChange?.("individual");
              }}
              className="peer sr-only"
            />
            <label
              htmlFor={`${baseId}-kind-ind`}
              className="flex items-center justify-center min-h-10 px-3 py-1.5 rounded-lg text-xs font-semibold text-calm-blue-700 cursor-pointer select-none peer-checked:bg-white peer-checked:text-calm-blue-900 peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-calm-blue-500"
            >
              {l(lang, "Individual", "Particulier", "Einzelperson", "Privatpersoun")}
            </label>
          </div>
          <div>
            <input
              type="radio"
              id={`${baseId}-kind-org`}
              name="memberKind"
              value="organization"
              checked={memberKind === "organization"}
              onChange={() => {
                setMemberKind("organization");
                onMemberKindChange?.("organization");
              }}
              className="peer sr-only"
            />
            <label
              htmlFor={`${baseId}-kind-org`}
              className="flex items-center justify-center min-h-10 px-3 py-1.5 rounded-lg text-xs font-semibold text-calm-blue-700 cursor-pointer select-none peer-checked:bg-white peer-checked:text-calm-blue-900 peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-calm-blue-500"
            >
              {l(lang, "Company / Org", "Entreprise / Org.", "Unternehmen", "Entreprise")}
            </label>
          </div>
        </div>
      </fieldset>

      {/* Membership contribution frequency radio fieldset */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-calm-blue-600 mb-1">
          {l(
            lang,
            "Membership Contribution",
            "Cotisation",
            "Mitgliedsbeitrag",
            "Membersbäitrag",
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
                  "Monthly subscription",
                  "Prélèvement mensuel",
                  "Monatlich kündbar",
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
                  "Single annual payment",
                  "Un seul versement annuel",
                  "Jährliche Zahlung",
                  "Jährlech Bezuelung",
                )}
              </span>
            </label>
          </div>
        </div>
      </fieldset>

      {/* Name or Company Name field */}
      <div className="space-y-1">
        <label
          htmlFor={nameId}
          className="block text-sm font-semibold text-calm-blue-800"
        >
          {isOrg
            ? l(
                lang,
                "Company name (or designated contact)",
                "Nom de l'entreprise (ou contact désigné)",
                "Unternehmensname (oder Kontaktperson)",
                "Numm vun der Entreprise (oder Kontaktpersoun)",
              )
            : l(
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
          autoComplete={isOrg ? "organization" : "name"}
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
          placeholder={
            isOrg
              ? l(
                  lang,
                  "e.g. Nordisk Care Group",
                  "ex. Groupe Nordisk Care",
                  "z. B. Nordisk Care GmbH",
                  "z. B. Nordisk Care S.A.",
                )
              : l(
                  lang,
                  "e.g. Dr. Claire Martin",
                  "ex. Dr Claire Martin",
                  "z. B. Dr. Claire Martin",
                  "z. B. Dr. Claire Martin",
                )
          }
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

      {/* Required Checkbox: Positive Ambassador Agreement */}
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
              "I apply to join Clarvia as a non-voting Associate Member and agree to act as a positive ambassador helping spread awareness of Clarvia's free non-profit mission worldwide.",
              "Je demande l'admission à Clarvia comme membre adhérent sans droit de vote et m'engage à être un ambassadeur positif faisant connaître la mission gratuite de Clarvia dans le monde.",
              "Ich beantrage die Aufnahme als stimmrechtsloses assoziiertes Mitglied von Clarvia und erkläre mich bereit, als positiver Botschafter auf Clarvias kostenlose gemeinnützige Mission weltweit aufmerksam zu machen.",
              "Ech froen d'Opnam als assoziéierte Member ouni Stëmmrecht bei Clarvia un an erklären mech bereet, als positiven Ambassadeur op d'gratis Non-Profit-Missioun vu Clarvia weltwäit opmierksam ze maachen.",
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

      {/* Optional Checkbox: Publish Membership + LinkedIn URL */}
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
            {isOrg
              ? l(
                  lang,
                  "Publish our membership on clarvia.org with our logo or contact portrait, headline, and LinkedIn link (optional).",
                  "Publier notre adhésion sur clarvia.org avec notre logo ou portrait, titre et lien LinkedIn (facultatif).",
                  "Unsere Mitgliedschaft auf clarvia.org mit Logo oder Porträt, Kurzprofil und LinkedIn-Link veröffentlichen (optional).",
                  "Eis Memberschaft op clarvia.org mat Logo oder Portrait, Titel a LinkedIn-Link verëffentlechen (optional).",
                )
              : l(
                  lang,
                  "Publish my membership on clarvia.org with my name, LinkedIn portrait, headline, and LinkedIn link (optional).",
                  "Publier mon adhésion sur clarvia.org avec mon nom, ma photo LinkedIn, mon titre et mon lien LinkedIn (facultatif).",
                  "Meine Mitgliedschaft auf clarvia.org mit Namen, LinkedIn-Porträt, Funktion und LinkedIn-Link veröffentlichen (optional).",
                  "Meng Memberschaft op clarvia.org mat Numm, LinkedIn-Foto, Titel a LinkedIn-Link verëffentlechen (optional).",
                )}
          </label>
        </div>

        {publishMember && (
          <div className="pt-2 border-t border-calm-blue-100 space-y-1">
            <label
              htmlFor={linkedinId}
              className="block text-xs font-semibold text-calm-blue-800"
            >
              {isOrg
                ? l(
                    lang,
                    "Company or contact LinkedIn URL",
                    "URL LinkedIn de l'entreprise ou du contact",
                    "LinkedIn-URL des Unternehmens oder Kontakts",
                    "LinkedIn-URL vun der Entreprise oder Kontaktpersoun",
                  )
                : l(
                    lang,
                    "LinkedIn profile URL",
                    "URL de votre profil LinkedIn",
                    "LinkedIn-Profil-URL",
                    "LinkedIn-Profil-URL",
                  )}{" "}
              <span className="text-calm-blue-600 font-normal" aria-hidden="true">
                *
              </span>
            </label>
            <span
              id={linkedinHintId}
              className="block text-[11px] text-calm-blue-600 pb-0.5"
            >
              {isOrg
                ? l(
                    lang,
                    "Format: linkedin.com/company/your-company or linkedin.com/in/contact",
                    "Format : linkedin.com/company/entreprise ou linkedin.com/in/contact",
                    "Format: linkedin.com/company/unternehmen oder linkedin.com/in/kontakt",
                    "Format: linkedin.com/company/entreprise oder linkedin.com/in/kontakt",
                  )
                : l(
                    lang,
                    "Format: https://www.linkedin.com/in/your-name",
                    "Format : https://www.linkedin.com/in/votre-nom",
                    "Format: https://www.linkedin.com/in/ihr-name",
                    "Format: https://www.linkedin.com/in/aeren-numm",
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
              placeholder={
                isOrg
                  ? "https://www.linkedin.com/company/..."
                  : "https://www.linkedin.com/in/..."
              }
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
                `Join as Associate Member: €${displayAmount}${
                  frequency === "annual" ? "/year" : "/month"
                }`,
                `Devenir membre adhérent : ${displayAmount} €${
                  frequency === "annual" ? "/an" : "/mois"
                }`,
                `Mitglied werden: ${displayAmount} €${
                  frequency === "annual" ? "/Jahr" : "/Monat"
                }`,
                `Member ginn: ${displayAmount} €${
                  frequency === "annual" ? "/Joer" : "/Mount"
                }`,
              )}
        </button>
      </div>

      <p className="text-center text-xs text-calm-blue-600">
        {l(
          lang,
          "Secure payment via Stripe · Cancel anytime in 1 click.",
          "Paiement sécurisé via Stripe · Résiliable en 1 clic à tout moment.",
          "Sichere Zahlung über Stripe · Jederzeit mit 1 Klick kündbar.",
          "Séchert Bezuele mat Stripe · Zu all Moment mat 1 Klick kënnegbar.",
        )}
      </p>
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
