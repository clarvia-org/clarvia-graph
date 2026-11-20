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
import { trackMembershipComplete } from "@/lib/analytics";
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
            trackMembershipComplete({
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
    "Associate Member of Clarvia, an independent non-profit providing free, official-source-cited terminal illness and bereavement guidance live across 196 countries and 14 languages (https://clarvia.org).",
    "Membre adhérent de Clarvia, organisation indépendante à but non lucratif offrant un accompagnement administratif gratuit et sourcé face à la maladie grave et au décès dans 196 pays et 14 langues (https://clarvia.org).",
    "Assoziiertes Mitglied von Clarvia, einer unabhängigen gemeinnützigen Non-Profit-Organisation für kostenlose, quellenbasierte Orientierung bei schwerer Krankheit und im Trauerfall in 196 Ländern und 14 Sprachen (https://clarvia.org).",
    "Assoziéierte Member vu Clarvia, enger onofhängeger Non-Profit-Organisatioun fir gratis, op offiziellen Quelle baséiert Orientéierung bei schwéierer Krankheet an am Trauerfall an 196 Länner a 14 Sproochen (https://clarvia.org).",
  );

  const postDraftOne = l(
    lang,
    "When a family faces a terminal illness diagnosis or a death, especially across borders and languages, the administrative deadlines begin immediately while people are grieving.\n\nWe have joined Clarvia, an independent non-profit, as an Associate Member in its Founding Cohort to help keep its live 196-country guidance library and Ask Clarvia service 100% free and ad-free for families worldwide: https://clarvia.org/en/membership",
    "Lorsqu'une famille fait face au diagnostic d'une maladie grave ou au décès d'un proche, en particulier entre plusieurs pays ou langues, les démarches administratives s'imposent immédiatement.\n\nNous avons rejoint l'organisation à but non lucratif Clarvia en tant que membre adhérent au sein de sa cohorte fondatrice afin de contribuer à maintenir ses guides couvrant 196 pays et son service Ask Clarvia 100 % gratuits et sans publicité : https://clarvia.org/fr/membership",
    "Wenn eine Familie mit einer schweren Diagnose oder einem Todesfall konfrontiert wird, besonders über Ländergrenzen und Sprachbarrieren hinweg, beginnen die behördlichen Fristen sofort.\n\nWir sind der gemeinnützigen Non-Profit-Organisation Clarvia als assoziiertes Mitglied der Gründerkohorte beigetreten, um mitzuhelfen, die Leitfäden für 196 Länder und den Dienst Ask Clarvia dauerhaft kostenlos und werbefrei für alle Familien zu halten: https://clarvia.org/de/membership",
    "Wann eng Famill mat enger schwéierer Diagnos oder engem Doudesfall konfrontéiert gëtt, besonnesch iwwer Landesgrenzen a Sproochen ewech, fänken déi administrativ Fristen direkt un.\n\nMir sinn der Non-Profit-Organisatioun Clarvia als assoziéierte Member an der Grënnerkohort bäigetrueden, fir ze hëllefen, d'Guiden fir 196 Länner an Ask Clarvia fir all Famill gratis ze halen: https://clarvia.org/lu/membership",
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
            "Thank you for supporting free guidance for families worldwide. Stripe has emailed your receipt; if you opted in to public recognition, your portrait or company logo card will go live within 1 to 2 business days.",
            "Merci de soutenir nos ressources gratuites dans le monde entier. Stripe vous a envoyé votre reçu ; si vous avez choisi la publication, votre carte avec photo ou logo sera mise en ligne sous 1 à 2 jours ouvrés.",
            "Vielen Dank für Ihre Unterstützung. Stripe hat Ihnen Ihren Beleg per E-Mail gesendet; bei aktivierter Veröffentlichung erscheint Ihre Porträt- oder Logokarte innerhalb von 1 bis 2 Werktagen.",
            "Merci fir Är Ënnerstëtzung. Stripe huet Iech Är Quittung per E-Mail geschéckt; wann Dir d'Verëffentlechung gewielt hutt, gëtt Är Kaart bannent 1 bis 2 Aarbechtsdeeg opgeschalt.",
          )}
        </p>

        {/* Member Ambassador Kit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-calm-blue-200 bg-calm-blue-50/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-calm-blue-800 mb-1">
                {l(
                  lang,
                  "1. LinkedIn Credentials (Personal or Company)",
                  "1. Mention LinkedIn (profil personnel ou entreprise)",
                  "1. LinkedIn-Eintrag (Person oder Unternehmen)",
                  "1. LinkedIn-Andrag (Persoun oder Entreprise)",
                )}
              </h3>
              <p className="text-xs text-calm-blue-600 mb-2">
                {l(
                  lang,
                  "Use on your personal profile, company LinkedIn page, or designated contact person:",
                  "Utilisable sur votre profil personnel, votre page entreprise ou par un contact désigné :",
                  "Für Ihr persönliches Profil, Ihre Unternehmensseite oder eine benannte Kontaktperson:",
                  "Fir Äre perséinleche Profil, Är Firmesäit oder eng designéiert Kontaktpersoun:",
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
                "Member or company name on your Admission Certificate",
                "Nom du membre ou de l'entreprise sur le certificat",
                "Mitglieds- oder Unternehmensname auf dem Zertifikat",
                "Numm vum Member oder der Entreprise um Zertifikat",
              )}
            </label>
            <input
              id={certNameInputId}
              type="text"
              autoComplete="name"
              placeholder={l(
                lang,
                "e.g. Dr. Claire Martin / Nordisk Care",
                "ex. Dr Claire Martin / Nordisk Care",
                "z. B. Dr. Claire Martin / Nordisk Care GmbH",
                "z. B. Dr. Claire Martin / Nordisk Care S.A.",
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
              <p className="font-semibold text-calm-blue-800">CLARVIA</p>
              <p>
                {l(
                  lang,
                  "Registered Non-Profit Organisation",
                  "Association enregistrée à but non lucratif",
                  "Eingetragene gemeinnützige Non-Profit-Organisation",
                  "Registréiert Non-Profit-Organisatioun",
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
              "is hereby admitted as a Contributing Associate Member of Clarvia pursuant to Articles 7 and 8 of the Articles of Association, supporting free, multilingual administrative guidance for families across 196 countries.",
              "est admis(e) en qualité de membre adhérent cotisant de Clarvia conformément aux articles 7 et 8 des statuts, en soutien à un accompagnement administratif gratuit et multilingue pour les familles dans 196 pays.",
              "wird hiermit gemäß Artikel 7 und 8 der Satzung als beitragendes assoziiertes Mitglied von Clarvia aufgenommen, zur Unterstützung kostenloser, mehrsprachiger Orientierung für Familien in 196 Ländern.",
              "gëtt heimat geméiss Artikel 7 an 8 vun de Statuten als assoziéierte Member vu Clarvia opgeholl, fir gratis méisproocheg Orientéierung fir Familljen an 196 Länner z'ënnerstëtzen.",
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
                  "Contributing Associate Member (non-voting, zero liability)",
                  "Membre adhérent cotisant (sans droit de vote, sans responsabilité)",
                  "Beitragendes assoziiertes Mitglied (stimmrechtslos, ohne Haftung)",
                  "Assoziéierte Member (ouni Stëmmrecht, ouni Haftung)",
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
