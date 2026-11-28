"use client";

import { useState } from "react";
import Link from "next/link";
import { headlineStyle } from "@/app/[lang]/data";
import FooterSection from "@/app/[lang]/sections/FooterSection";
import Header from "@/components/Header";
import TrustStrip from "@/features/donations/TrustStrip";
import BankTransferDetails from "@/features/donations/BankTransferDetails";
import {
  ASSOCIATE_ANNUAL_EUR,
  ASSOCIATE_MONTHLY_EUR,
  FOUNDING_COHORT_YEARS,
  type MemberKind,
} from "@/content/associate-members";
import { type Lang, l } from "@/lib/i18n";
import CohortShowcase from "./CohortShowcase";
import MembershipForm from "./MembershipForm";
import MembershipSuccessKit from "./MembershipSuccessKit";
import {
  getMembershipAudienceSection,
  getMembershipBenefits,
  getMembershipFaqs,
  getMembershipProofStats,
  type MembershipAudienceCard,
  type MembershipBenefitItem,
} from "./membership-copy";

const STRIPE_BILLING_PORTAL_URL =
  process.env.NEXT_PUBLIC_STRIPE_BILLING_PORTAL_URL ??
  "https://billing.stripe.com/p/login/cNieVd5j90I9dOs2d3b3q00";

function BenefitIcon({ icon }: { icon: MembershipBenefitItem["icon"] }) {
  switch (icon) {
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M19 3A2 2 0 0121 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case "portrait":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="8.5" r="3.5" />
          <path strokeLinecap="round" d="M5 19.5c1.6-3 4.1-4.5 7-4.5s5.4 1.5 7 4.5" />
        </svg>
      );
    case "cohort":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 5.1 5.6.8-4.1 4 1 5.6L12 15.8 7 18.5l1-5.6-4.1-4 5.6-.8L12 3z" />
        </svg>
      );
    case "certificate":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path strokeLinecap="round" d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.9-7 9-4-1.1-7-4.5-7-9V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 000 18M12 3a14.5 14.5 0 010 18" />
        </svg>
      );
  }
}

function AudienceCardIcon({ id }: { id: MembershipAudienceCard["id"] }) {
  switch (id) {
    case "individuals":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0" />
        </svg>
      );
    case "corporate":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 10h2m2 0h2M9 14h2m2 0h2" />
        </svg>
      );
    case "governance":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.9-7 9-4-1.1-7-4.5-7-9V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      );
  }
}

function DisclosureChevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-4 h-4 stroke-current disclosure-chevron text-calm-blue-500"
      fill="none"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
    </svg>
  );
}

export default function AssociateMembershipPage({ lang }: { lang: Lang }) {
  const [previewName, setPreviewName] = useState("");
  const [previewPublish, setPreviewPublish] = useState(false);
  const [previewKind, setPreviewKind] = useState<MemberKind>("individual");

  const proofStats = getMembershipProofStats(lang);
  const benefits = getMembershipBenefits(lang);
  const audienceSection = getMembershipAudienceSection(lang);
  const faqs = getMembershipFaqs(lang);

  return (
    <>
      <Header lang={lang} />

      <main
        id="main-content"
        className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10"
      >
        <MembershipSuccessKit lang={lang} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start no-print">
          {/* LEFT COLUMN: Global Nonprofit Mission, Proof Strip & Benefits */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="badge badge-build">
                {l(
                  lang,
                  `Registered Nonprofit Organization · Founding Cohort ${FOUNDING_COHORT_YEARS}`,
                  `Association à but non lucratif · Cohorte ${FOUNDING_COHORT_YEARS}`,
                  `Eingetragene gemeinnützige Organisation · Kohorte ${FOUNDING_COHORT_YEARS}`,
                  `Gemeinnëtzeg Organisatioun · Kohort ${FOUNDING_COHORT_YEARS}`,
                )}
              </span>

              <h1
                className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance"
                style={headlineStyle}
              >
                {l(
                  lang,
                  "Become an Associate Member & Mission Ambassador",
                  "Devenir membre adhérent et ambassadeur de la mission",
                  "Fördermitglied & Botschafter werden",
                  "Assoziéierte Member & Ambassadeur ginn",
                )}
              </h1>

              <p className="text-lg text-calm-blue-700 leading-relaxed font-semibold text-pretty">
                {l(
                  lang,
                  `Clarvia is an independent nonprofit organization providing 1,000+ free, official-source guides for families navigating serious illness and post-loss administration across 196 countries and 14 languages. Professionals, philanthropists, and socially responsible companies join our Founding Cohort (€${ASSOCIATE_MONTHLY_EUR}/month or €${ASSOCIATE_ANNUAL_EUR}/year) to keep this public resource 100% free and ad-free worldwide.`,
                  `Clarvia est une association à but non lucratif indépendante qui met à disposition plus de 1 000 guides gratuits et sourcés pour accompagner les familles face à la maladie grave et aux démarches après un décès dans 196 pays et 14 langues. Professionnels, philanthropes et entreprises engagées rejoignent notre cohorte fondatrice (${ASSOCIATE_MONTHLY_EUR} €/mois ou ${ASSOCIATE_ANNUAL_EUR} €/an) pour pérenniser cette ressource d'intérêt général sans publicité.`,
                  `Clarvia ist ein unabhängiger gemeinnütziger Verein, der über 1.000 kostenlose, amtlich belegte Leitfäden für Familien bei schwerer Krankheit und im Trauerfall in 196 Ländern und 14 Sprachen bereitstellt. Fachleute, Fördernde und verantwortungsvolle Unternehmen unterstützen den Verein in unserer Gründerkohorte (${ASSOCIATE_MONTHLY_EUR} €/Monat oder ${ASSOCIATE_ANNUAL_EUR} €/Jahr), damit dieses Angebot weltweit zu 100 % kostenlos und werbefrei bleibt.`,
                  `Clarvia ass eng onofhängeg gemeinnëtzeg Organisatioun, déi iwwer 1.000 gratis, op offiziellen Quelle baséiert Guiden fir Familljen bei schwéierer Krankheet an no engem Doudesfall an 196 Länner a 14 Sproochen ubitt. Fachleit, Philanthropen a verantwortungsvoll Entreprisen trieden eiser Grënnerkohort (${ASSOCIATE_MONTHLY_EUR} €/Mount oder ${ASSOCIATE_ANNUAL_EUR} €/Joer) bäi, fir dës Ressource weltwäit zu 100 % gratis an ouni Reklamm ze halen.`,
                )}
              </p>

              <p className="text-base text-calm-blue-600 leading-relaxed text-pretty">
                {l(
                  lang,
                  "Unlike serving as a charity trustee or voting nonprofit board member, Associate Membership carries zero fiduciary liability, zero committee meetings, and zero time quotas. Your role is self-directed: list Clarvia on your personal or company LinkedIn page, share an optional welcome-kit post, or point colleagues, HR teams, and families to clarvia.org when it matters.",
                  "Contrairement à un mandat d'administrateur avec droit de vote, cet engagement associatif n'implique aucune responsabilité fiduciaire, aucune réunion de comité ni quota de temps. Votre rôle reste libre : mentionner Clarvia sur votre profil LinkedIn personnel ou d'entreprise, partager un message facultatif du kit d'accueil, ou orienter collègues, équipes RH et familles vers clarvia.org.",
                  "Anders als ein stimmberechtigtes Vorstandsmandat ist diese Fördermitgliedschaft mit keinerlei Organ- oder Vorstandshaftung, keinen Gremiensitzungen und keinen Zeitpflichten verbunden. Sie gestalten Ihre Rolle frei: Nennen Sie Clarvia auf Ihrem persönlichen LinkedIn-Profil oder Ihrer Unternehmensseite, teilen Sie optional eine Vorlage oder weisen Sie Kolleginnen, HR-Teams und Familien auf clarvia.org hin.",
                  "Anescht wéi e stëmmberechtegt Mandat am Verwaltungsrot bréngt dës assoziéiert Memberschaft keng Haftung, keng Komiteessëtzungen a keng Zäitquoten mat sech. Är Roll bleift ganz fräi: nennt Clarvia op Ärem perséinlechen oder Firmen-LinkedIn-Profil, deelt optional e Post aus eisem Kit oder weist Kollegen, HR-Ekippen a Familljen op clarvia.org hin.",
                )}
              </p>

              {/* Compact Factual Proof Strip */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {proofStats.map((stat) => (
                  <div
                    key={stat.value}
                    className="rounded-xl bg-white/70 border border-calm-blue-200/70 px-3 py-2.5 flex flex-col-reverse justify-end"
                  >
                    <dt className="text-[11px] text-calm-blue-600 leading-snug mt-0.5">
                      {stat.label}
                    </dt>
                    <dd className="text-base font-semibold text-calm-blue-800 leading-tight">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h2
                className="text-xl font-semibold text-calm-blue-800 mb-4 text-balance"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(
                  lang,
                  "What Associate Membership includes",
                  "Ce que comprend le statut de membre adhérent",
                  "Was die Fördermitgliedschaft umfasst",
                  "Wat d'assoziéiert Memberschaft ëmfaasst",
                )}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {benefits.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel p-4 border border-white/75 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-calm-blue-50 border border-calm-blue-200 text-calm-blue-700 flex items-center justify-center shrink-0">
                        <BenefitIcon icon={item.icon} />
                      </div>
                      <h3 className="text-sm font-semibold text-calm-blue-800 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-calm-blue-600 leading-relaxed text-pretty">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Enrollment Card & SEPA Bank Transfer */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-8">
            <div className="glass-panel p-6 border border-white/85 shadow-lg">
              <h2
                id="membership-form-heading"
                className="text-xl font-semibold text-calm-blue-800 mb-1 text-balance"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(
                  lang,
                  "Apply for Associate Membership",
                  "Adhérer comme membre adhérent",
                  "Als Fördermitglied beitreten",
                  "Als assoziéierte Member bäitrieden",
                )}
              </h2>
              <p className="text-xs text-calm-blue-600 mb-4">
                {l(
                  lang,
                  "For individuals & companies · Instant online admission",
                  "Particuliers et entreprises · Admission immédiate",
                  "Für Einzelpersonen & Unternehmen · Sofortige Aufnahme",
                  "Fir Privatpersounen & Entreprisen · Direkt Opnam",
                )}
              </p>

              <MembershipForm
                lang={lang}
                onNameChange={setPreviewName}
                onPublishChange={setPreviewPublish}
                onMemberKindChange={setPreviewKind}
              />

              <div className="mt-4 pt-3 border-t border-calm-blue-100/70 text-center">
                <p className="text-xs text-calm-blue-600">
                  {l(
                    lang,
                    "Already an Associate Member?",
                    "Déjà membre adhérent ?",
                    "Bereits assoziiertes Mitglied?",
                    "Schonn assoziéierte Member?",
                  )}{" "}
                  <a
                    href={STRIPE_BILLING_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-calm-lilac-600 hover:text-calm-blue-800 underline underline-offset-2 font-medium"
                  >
                    {l(
                      lang,
                      "Manage membership",
                      "Gérer mon adhésion",
                      "Mitgliedschaft verwalten",
                      "Memberschaft verwalten",
                    )}
                  </a>
                </p>
              </div>
            </div>

            <details className="glass-panel p-4 border border-white/65">
              <summary className="disclosure-summary text-sm font-medium text-calm-blue-700 hover:text-calm-blue-900">
                <DisclosureChevron />
                <span>
                  {l(
                    lang,
                    "Prefer annual SEPA bank transfer (€480)?",
                    "Vous préférez un virement SEPA annuel (480 €) ?",
                    "Lieber per jährlicher SEPA-Überweisung (480 €)?",
                    "Léiwer per jährlecher SEPA-Iwwerweisung (480 €)?",
                  )}
                </span>
              </summary>

              <div className="mt-3 pt-3 border-t border-calm-blue-100/60 text-left">
                <BankTransferDetails
                  lang={lang}
                  reference="CLARVIA-MEMBER"
                  showComfortNote
                  referenceNote={l(
                    lang,
                    "Use CLARVIA-MEMBER as the reference and send us your LinkedIn URL via the Contact form if you want to be listed publicly.",
                    "Indiquez CLARVIA-MEMBER en référence et envoyez-nous votre URL LinkedIn via le formulaire de contact si vous souhaitez être publié(e).",
                    "Geben Sie CLARVIA-MEMBER als Referenz an und senden Sie uns über das Kontaktformular Ihre LinkedIn-URL, falls Sie öffentlich genannt werden möchten.",
                    "Gitt CLARVIA-MEMBER als Referenz un a schéckt eis iwwer de Kontaktformulaire Är LinkedIn-URL, wann Dir ëffentlech genannt wëllt ginn.",
                  )}
                />
              </div>
            </details>

            <div className="text-center px-2">
              <p className="text-xs text-calm-blue-600 leading-relaxed">
                {l(
                  lang,
                  "Not ready for membership?",
                  "Pas encore prêt(e) à adhérer ?",
                  "Noch nicht bereit für eine Mitgliedschaft?",
                  "Nach net prett fir eng Memberschaft?",
                )}{" "}
                <Link
                  href={`/${lang}/support`}
                  className="text-calm-blue-700 hover:text-calm-blue-900 font-medium underline underline-offset-2"
                >
                  {l(
                    lang,
                    "Make a custom one-time gift on our Support page →",
                    "Faire un don libre sur la page Soutenir →",
                    "Freie Einzelspende auf unserer Spendenseite →",
                    "Fräien Don op eiser Spendesäit →",
                  )}
                </Link>{" "}
                {l(lang, "or explore", "ou découvrir", "oder", "oder entdeckt")}{" "}
                <Link
                  href={`/${lang}/guidance`}
                  className="text-calm-blue-700 hover:text-calm-blue-900 font-medium underline underline-offset-2"
                >
                  {l(
                    lang,
                    "clarvia.org/guidance",
                    "nos guides gratuits",
                    "unsere kostenlosen Leitfäden",
                    "eis gratis Guiden",
                  )}
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* WHO JOINS & WHY: Individual Philanthropy, Corporate CSR/ESG, and Governance */}
        <section
          aria-labelledby="who-joins-heading"
          className="mt-14 pt-12 border-t border-calm-blue-200/50 no-print"
        >
          <div className="max-w-3xl mb-8">
            <span className="badge badge-build mb-3">{audienceSection.badge}</span>
            <h2
              id="who-joins-heading"
              className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-3 text-balance"
              style={{ fontFamily: headlineStyle.fontFamily }}
            >
              {audienceSection.heading}
            </h2>
            <p className="text-base text-calm-blue-600 leading-relaxed text-pretty">
              {audienceSection.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {audienceSection.cards.map((card) => (
              <div
                key={card.id}
                className="glass-panel p-6 border border-white/80 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-calm-blue-50 border border-calm-blue-200 text-calm-blue-700 flex items-center justify-center shrink-0">
                    <AudienceCardIcon id={card.id} />
                  </div>
                  <h3 className="text-base font-semibold text-calm-blue-800 leading-snug text-balance">
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm text-calm-blue-600 leading-relaxed text-pretty">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <CohortShowcase
          lang={lang}
          previewName={previewName}
          previewPublish={previewPublish}
          previewKind={previewKind}
        />

        <section
          aria-labelledby="membership-faq-heading"
          className="mt-14 pt-12 border-t border-calm-blue-200/50 no-print"
        >
          <h2
            id="membership-faq-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-6 text-balance"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(
              lang,
              "Frequently asked questions",
              "Questions fréquentes",
              "Häufig gestellte Fragen",
              "Dacks gestallte Froen",
            )}
          </h2>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="glass-panel p-5 border border-white/75"
              >
                <summary className="disclosure-summary text-base font-semibold text-calm-blue-800">
                  <DisclosureChevron />
                  <span>{faq.question}</span>
                </summary>
                <p className="mt-3 pl-6 text-sm text-calm-blue-600 leading-relaxed text-pretty">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 no-print">
          <TrustStrip lang={lang} />
        </div>
      </main>

      <FooterSection lang={lang} />
    </>
  );
}
