"use client";

import { useEffect, useId, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { headlineStyle } from "@/app/[lang]/data";
import { CLARVIA_LINKEDIN_URL } from "@/components/LinkedInLink";
import {
  classifyMembershipSessionResponse,
  FOUNDING_COHORT_YEARS,
} from "@/content/associate-members";
import { trackDonationComplete } from "@/lib/analytics";
import { type Lang, l } from "@/lib/i18n";

export interface MembershipSuccessKitProps {
  lang: Lang;
}

type VerificationViewState =
  | { status: "idle" }
  | { status: "verifying" }
  | { status: "pending_settlement" }
  | { status: "paid"; admittedDate: string };

function MembershipSuccessKitInner({ lang }: MembershipSuccessKitProps) {
  const searchParams = useSearchParams();
  const certNameInputId = useId();
  const joined = searchParams.get("joined") === "true";
  const sessionId = searchParams.get("session_id")?.trim() || null;

  const [viewState, setViewState] = useState<VerificationViewState>({
    status: "idle",
  });
  const [certificateName, setCertificateName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!joined || !sessionId) {
      setViewState({ status: "idle" });
      return;
    }

    let isMounted = true;
    setViewState({ status: "verifying" });

    const trackingKey = `clarvia-donation-tracked-${sessionId}`;

    fetch(`/api/donate?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const body = res.ok ? await res.json() : null;
        return classifyMembershipSessionResponse(res.ok, body);
      })
      .then((outcome) => {
        if (!isMounted) return;

        if (outcome.kind === "paid") {
          setViewState({
            status: "paid",
            admittedDate: outcome.admittedDate,
          });

          let alreadyTracked = false;
          try {
            alreadyTracked = Boolean(localStorage.getItem(trackingKey));
          } catch {
            alreadyTracked = false;
          }

          if (!alreadyTracked) {
            trackDonationComplete({
              value: outcome.amount,
              currency: outcome.currency,
              transaction_id: sessionId,
            });
            try {
              localStorage.setItem(trackingKey, "true");
            } catch {
              // Ignore private-mode storage restrictions
            }
          }
          return;
        }

        if (outcome.kind === "pending_settlement") {
          setViewState({ status: "pending_settlement" });
          return;
        }

        setViewState({ status: "idle" });
      })
      .catch((err) => {
        console.error("Membership verification error:", err);
        if (isMounted) {
          setViewState({ status: "idle" });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [joined, sessionId]);

  if (!joined || !sessionId || viewState.status === "idle") {
    return null;
  }

  if (viewState.status === "verifying") {
    return (
      <div
        role="status"
        className="mb-10 glass-panel p-5 border border-calm-blue-200 text-center text-sm text-calm-blue-700 no-print"
      >
        {l(
          lang,
          "Verifying your Associate Membership session with Stripe...",
          "Vérification de votre adhésion auprès de Stripe...",
          "Ihre Mitgliedschaftssitzung wird bei Stripe geprüft...",
          "Är Memberschaft gëtt bei Stripe iwwerpréift...",
        )}
      </div>
    );
  }

  if (viewState.status === "pending_settlement") {
    return (
      <div
        role="status"
        className="mb-10 glass-panel p-6 border border-calm-blue-300 bg-white/90 text-sm text-calm-blue-700 space-y-2 no-print"
      >
        <p className="font-semibold text-calm-blue-800">
          {l(
            lang,
            "Associate Membership application received: awaiting payment settlement",
            "Demande d'adhésion enregistrée : en attente de compensation bancaire",
            "Aufnahmeantrag eingegangen: Zahlungsausgleich ausstehend",
            "Opnamufro registréiert: Bezuelung gëtt nach ofgewéckelt",
          )}
        </p>
        <p className="text-pretty">
          {l(
            lang,
            "Thank you. Stripe has recorded your subscription mandate and will issue your confirmation once the bank transfer clears.",
            "Merci. Stripe a bien enregistré votre mandat et vous adressera votre confirmation dès réception du règlement bancaire.",
            "Vielen Dank. Stripe hat Ihr Mandat erfasst und sendet Ihre Bestätigung, sobald die Bankzahlung abgeschlossen ist.",
            "Merci. Stripe huet Äert Mandat registréiert a schéckt Är Bestätegung, soubal d'Bankbezuelung ofgeschloss ass.",
          )}
        </p>
      </div>
    );
  }

  async function copySnippet(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Ignore clipboard failures
    }
  }

  const linkedinRoleTitle = l(
    lang,
    `Associate Member & Mission Ambassador (Founding Cohort ${FOUNDING_COHORT_YEARS})`,
    `Membre adhérent et ambassadeur (Cohorte fondatrice ${FOUNDING_COHORT_YEARS})`,
    `Assoziiertes Mitglied & Botschafter (Gründerkohorte ${FOUNDING_COHORT_YEARS})`,
    `Assoziéierte Member & Ambassadeur (Grënnerkohort ${FOUNDING_COHORT_YEARS})`,
  );

  const linkedinProfileBio = l(
    lang,
    "Associate Member of Clarvia, a European non-profit providing free, official-source-cited terminal illness and bereavement guidance for families across 196 countries and 14 languages (https://clarvia.org).",
    "Membre adhérent de Clarvia, organisation européenne à but non lucratif offrant un accompagnement administratif gratuit et sourcé face à la maladie grave et au décès dans 196 pays et 14 langues (https://clarvia.org).",
    "Assoziiertes Mitglied von Clarvia, einer europäischen gemeinnützigen Non-Profit-Organisation für kostenlose, quellenbasierte Orientierung bei schwerer Krankheit und im Trauerfall in 196 Ländern und 14 Sprachen (https://clarvia.org).",
    "Assoziéierte Member vu Clarvia, enger europäescher Non-Profit-Organisatioun fir gratis, op offiziellen Quelle baséiert Orientéierung bei schwéierer Krankheet an am Trauerfall an 196 Länner a 14 Sproochen (https://clarvia.org).",
  );

  const postDraftOne = l(
    lang,
    "When a family faces a terminal illness diagnosis or a death, especially across borders and languages, the administrative deadlines begin immediately while people are grieving.\n\nI have joined Clarvia, an independent European non-profit, as an Associate Member in its Founding Cohort to help keep its 196-country guidance library and Ask Clarvia service 100% free and ad-free for families worldwide: https://clarvia.org/en/membership",
    "Lorsqu'une famille fait face au diagnostic d'une maladie grave ou au décès d'un proche, en particulier entre plusieurs pays ou langues, les démarches administratives s'imposent immédiatement.\n\nJ'ai rejoint l'organisation européenne à but non lucratif Clarvia en tant que membre adhérent au sein de sa cohorte fondatrice afin de contribuer à maintenir ses guides couvrant 196 pays et son service Ask Clarvia 100 % gratuits et sans publicité : https://clarvia.org/fr/membership",
    "Wenn eine Familie mit einer schweren Diagnose oder einem Todesfall konfrontiert wird, besonders über Ländergrenzen und Sprachbarrieren hinweg, beginnen die behördlichen Fristen sofort.\n\nIch bin der europäischen gemeinnützigen Non-Profit-Organisation Clarvia als assoziiertes Mitglied der Gründerkohorte beigetreten, um mitzuhelfen, die Leitfäden für 196 Länder und den Dienst Ask Clarvia dauerhaft kostenlos und werbefrei für alle Familien zu halten: https://clarvia.org/de/membership",
    "Wann eng Famill mat enger schwéierer Diagnos oder engem Doudesfall konfrontéiert gëtt, besonnesch iwwer Landesgrenzen a Sproochen ewech, fänken déi administrativ Fristen direkt un.\n\nEch sinn der europäescher Non-Profit-Organisatioun Clarvia als assoziéierte Member an der Grënnerkohort bäigetrueden, fir ze hëllefen, d'Guiden fir 196 Länner an Ask Clarvia fir all Famill gratis ze halen: https://clarvia.org/lu/membership",
  );

  const displayMemberName =
    certificateName.trim() ||
    l(
      lang,
      "Admitted Associate Member",
      "Membre adhérent admis",
      "Aufgenommenes Mitglied",
      "Opgehollene Member",
    );

  return (
    <section
      aria-labelledby="welcome-member-heading"
      className="mb-12 space-y-6"
    >
      {/* Confirmation Banner */}
      <div className="glass-panel p-6 sm:p-8 border-2 border-green-300 bg-white/90 no-print">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-900 border border-green-300 mb-3">
          {l(
            lang,
            "Admission Confirmed · Clarvia Non-Profit",
            "Admission confirmée · Clarvia",
            "Aufnahme bestätigt · Clarvia Non-Profit",
            "Opnam bestätegt · Clarvia Non-Profit",
          )}
        </span>
        <h2
          id="welcome-member-heading"
          className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-2 text-balance"
          style={{ fontFamily: headlineStyle.fontFamily }}
        >
          {l(
            lang,
            "Welcome to Clarvia's Founding Cohort",
            "Bienvenue au sein de la cohorte fondatrice de Clarvia",
            "Willkommen in der Gründerkohorte von Clarvia",
            "Wëllkomm an der Grënnerkohort vu Clarvia",
          )}
        </h2>
        <p className="text-sm sm:text-base text-calm-blue-600 leading-relaxed text-pretty">
          {l(
            lang,
            "Thank you for supporting free administrative guidance for families worldwide. Stripe has emailed your receipt, and if you opted in to public recognition, your LinkedIn portrait and link will replace an open cohort seat shortly.",
            "Merci de soutenir un accompagnement administratif gratuit pour les familles du monde entier. Stripe vous a envoyé votre reçu par e-mail, et si vous avez choisi la publication, votre photo et votre lien LinkedIn remplaceront prochainement un siège ouvert.",
            "Vielen Dank, dass Sie kostenlose Orientierung für Familien weltweit mittragen. Stripe hat Ihnen Ihren Beleg per E-Mail gesendet. Falls Sie der Veröffentlichung zugestimmt haben, werden Ihr LinkedIn-Porträt und Profillink in Kürze freigeschaltet.",
            "Merci datt Dir gratis Orientéierung fir Famillje weltwäit ënnerstëtzt. Stripe huet Iech Är Quittung per E-Mail geschéckt. Wann Dir der Verëffentlechung zougestëmmt hutt, ginn Är LinkedIn-Foto an Äre Link an Kürze opgeschalt.",
          )}
        </p>

        {/* Member Ambassador Kit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-calm-blue-200 bg-calm-blue-50/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-calm-blue-800 mb-1">
                {l(
                  lang,
                  "1. Add Clarvia to Your LinkedIn Profile",
                  "1. Ajouter Clarvia à votre profil LinkedIn",
                  "1. Clarvia im LinkedIn-Profil ergänzen",
                  "1. Clarvia op Ärem LinkedIn-Profil derbäisetzen",
                )}
              </h3>
              <p className="text-xs text-calm-blue-600 mb-2">
                {l(
                  lang,
                  "Authorized entry under LinkedIn Volunteering or Organizations (Organization: Clarvia):",
                  "Mention autorisée sous Bénévolat ou Organisations sur LinkedIn (Organisation : Clarvia) :",
                  "Freigegebener Eintrag unter Ehrenamt oder Organisationen auf LinkedIn (Organisation: Clarvia):",
                  "Autoriséierten Andrag ënner Benevolat oder Organisatiounen op LinkedIn (Organisatioun: Clarvia):",
                )}
              </p>
              <div className="rounded-lg bg-white border border-calm-blue-200/80 p-2.5 text-xs text-calm-blue-700 space-y-1">
                <p className="font-semibold">{linkedinRoleTitle}</p>
                <p className="text-[11px] text-calm-blue-600 leading-snug">
                  {linkedinProfileBio}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  copySnippet(
                    `${linkedinRoleTitle}\nClarvia\n\n${linkedinProfileBio}`,
                    "credential",
                  )
                }
                className="btn-secondary text-xs px-3.5 py-2 min-h-10"
              >
                {copiedKey === "credential"
                  ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                  : l(
                      lang,
                      "Copy LinkedIn credential",
                      "Copier la mention LinkedIn",
                      "LinkedIn-Text kopieren",
                      "LinkedIn-Text kopéieren",
                    )}
              </button>
              <a
                href={CLARVIA_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-calm-blue-700 hover:text-calm-blue-900 underline underline-offset-2 px-2 py-1"
              >
                {l(
                  lang,
                  "Clarvia LinkedIn page ↗",
                  "Page LinkedIn Clarvia ↗",
                  "Clarvia LinkedIn-Seite ↗",
                  "Clarvia LinkedIn-Säit ↗",
                )}
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-calm-blue-200 bg-calm-blue-50/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-calm-blue-800 mb-1">
                {l(
                  lang,
                  "2. Share With Your Network (Optional Draft)",
                  "2. Partager avec votre réseau (texte prêt à publier)",
                  "2. Im eigenen Netzwerk teilen (Textvorlage)",
                  "2. An Ärem Netzwierk deelen (Textvirschau)",
                )}
              </h3>
              <p className="text-[11px] text-calm-blue-600 whitespace-pre-line bg-white border border-calm-blue-200/80 rounded-lg p-2.5 leading-relaxed">
                {postDraftOne}
              </p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => copySnippet(postDraftOne, "post")}
                className="btn-secondary text-xs px-3.5 py-2 min-h-10"
              >
                {copiedKey === "post"
                  ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                  : l(
                      lang,
                      "Copy post text",
                      "Copier le message",
                      "Beitragstext kopieren",
                      "Post-Text kopéieren",
                    )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Official Certificate of Admission */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 no-print">
          <div className="flex-grow max-w-sm">
            <label
              htmlFor={certNameInputId}
              className="block text-xs font-semibold text-calm-blue-700 mb-1"
            >
              {l(
                lang,
                "Enter your name to personalize your Admission Certificate",
                "Saisissez votre nom pour personnaliser votre certificat d'admission",
                "Name für Ihr Aufnahmezertifikat eingeben",
                "Gitt Ären Numm fir Äert Opnam-Zertifikat an",
              )}
            </label>
            <input
              id={certNameInputId}
              type="text"
              autoComplete="name"
              placeholder={l(
                lang,
                "e.g. Dr. Claire Martin",
                "ex. Dr Claire Martin",
                "z. B. Dr. Claire Martin",
                "z. B. Dr. Claire Martin",
              )}
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              maxLength={120}
              className="w-full min-h-11 px-3 py-2 rounded-xl border border-calm-blue-300 bg-white text-base text-calm-blue-800"
            />
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary text-sm px-5 py-2.5 min-h-11"
          >
            {l(
              lang,
              "Print / Save Certificate as PDF",
              "Imprimer / Enregistrer le certificat en PDF",
              "Zertifikat drucken / als PDF speichern",
              "Zertifikat drécken / als PDF späicheren",
            )}
          </button>
        </div>

        <div className="membership-certificate-print glass-panel p-8 sm:p-10 border-2 border-calm-blue-300 bg-white">
          <div className="flex items-center justify-between border-b border-calm-blue-200 pb-4 mb-6">
            <Image
              src="/clarvia-logo.webp"
              alt="Clarvia"
              width={128}
              height={56}
              unoptimized
              className="h-11 w-auto object-contain"
            />
            <div className="text-right text-xs text-calm-blue-600">
              <p className="font-semibold text-calm-blue-800">CLARVIA ASBL</p>
              <p>
                {l(
                  lang,
                  "Registered Non-Profit · Grand Duchy of Luxembourg",
                  "Association à but non lucratif · Grand-Duché de Luxembourg",
                  "Gemeinnützige Non-Profit-Organisation · Luxemburg",
                  "Registréiert Non-Profit-Organisatioun · Lëtzebuerg",
                )}
              </p>
              <p>clarvia.org</p>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-calm-lilac-600 mb-2">
            {l(
              lang,
              `Certificate of Admission · Founding Cohort (${FOUNDING_COHORT_YEARS})`,
              `Certificat d'admission · Cohorte fondatrice (${FOUNDING_COHORT_YEARS})`,
              `Aufnahmebestätigung · Gründerkohorte (${FOUNDING_COHORT_YEARS})`,
              `Opnambestätegung · Grënnerkohort (${FOUNDING_COHORT_YEARS})`,
            )}
          </p>
          <h3
            className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {displayMemberName}
          </h3>
          <p className="text-sm text-calm-blue-700 leading-relaxed mb-6">
            {l(
              lang,
              "is hereby admitted as a Contributing Associate Member of Clarvia pursuant to Articles 7 and 8 of the Articles of Association, in support of free, multilingual administrative guidance for families worldwide.",
              "est admis(e) en qualité de membre adhérent cotisant de Clarvia conformément aux articles 7 et 8 des statuts, en soutien à la diffusion gratuite d'une orientation administrative multilingue pour les familles dans le monde entier.",
              "wird hiermit gemäß Artikel 7 und 8 der Satzung als beitragendes assoziiertes Mitglied von Clarvia aufgenommen, zur Förderung kostenloser, mehrsprachiger Orientierung für Familien weltweit.",
              "gëtt heimat geméiss Artikel 7 an 8 vun de Statuten als assoziéierte Member vu Clarvia opgeholl, fir gratis méisproocheg Orientéierung fir Famillje weltwäit z'ënnerstëtzen.",
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-calm-blue-200 text-xs text-calm-blue-600">
            <div>
              <p>
                <span className="font-semibold text-calm-blue-800">
                  {l(
                    lang,
                    "Date of admission:",
                    "Date d'admission :",
                    "Aufnahmedatum:",
                    "Opnamdatum:",
                  )}
                </span>{" "}
                {viewState.admittedDate}
              </p>
              <p>
                <span className="font-semibold text-calm-blue-800">
                  {l(
                    lang,
                    "Membership category:",
                    "Catégorie :",
                    "Kategorie:",
                    "Kategorie:",
                  )}
                </span>{" "}
                {l(
                  lang,
                  "Contributing Associate Member (non-voting, zero personal liability)",
                  "Membre adhérent cotisant (sans droit de vote, sans responsabilité personnelle)",
                  "Beitragendes assoziiertes Mitglied (stimmrechtslos, ohne persönliche Haftung)",
                  "Assoziéierte Member (ouni Stëmmrecht, ouni perséinlech Haftung)",
                )}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-calm-blue-800">Tommi Lindfors</p>
              <p>
                {l(
                  lang,
                  "President & Co-Founder, Clarvia",
                  "Président et cofondateur, Clarvia",
                  "Präsident & Mitgründer, Clarvia",
                  "President & Matgrënner, Clarvia",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MembershipSuccessKit(props: MembershipSuccessKitProps) {
  return (
    <Suspense fallback={null}>
      <MembershipSuccessKitInner {...props} />
    </Suspense>
  );
}
