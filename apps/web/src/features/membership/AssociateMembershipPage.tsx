"use client";

import { useState } from "react";
import Link from "next/link";
import { headlineStyle } from "@/app/[lang]/data";
import FooterSection from "@/app/[lang]/sections/FooterSection";
import Header from "@/components/Header";
import TrustStrip from "@/features/donations/TrustStrip";
import {
  ASSOCIATE_ANNUAL_EUR,
  ASSOCIATE_MONTHLY_EUR,
  FOUNDING_COHORT_YEARS,
} from "@/content/associate-members";
import { type Lang, l } from "@/lib/i18n";
import CohortShowcase from "./CohortShowcase";
import MembershipForm from "./MembershipForm";
import MembershipSuccessKit from "./MembershipSuccessKit";
import {
  getMembershipBenefits,
  getMembershipFaqs,
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const benefits = getMembershipBenefits(lang);
  const faqs = getMembershipFaqs(lang);

  async function handleCopy(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Ignore clipboard failures
    }
  }

  return (
    <>
      <Header lang={lang} />

      <main
        id="main-content"
        className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10"
      >
        {/* Post-checkout confirmation + printable certificate + LinkedIn ambassador kit */}
        <MembershipSuccessKit lang={lang} />

        {/* Two-column layout (no-print during certificate printing) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start no-print">
          {/* LEFT COLUMN: Mission Value Proposition & Prestige Benefits */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="badge badge-build">
                {l(
                  lang,
                  `Clarvia ASBL · Founding Cohort ${FOUNDING_COHORT_YEARS}`,
                  `Clarvia ASBL · Cohorte fondatrice ${FOUNDING_COHORT_YEARS}`,
                  `Clarvia ASBL · Gründerkohorte ${FOUNDING_COHORT_YEARS}`,
                  `Clarvia ASBL · Grënnerkohort ${FOUNDING_COHORT_YEARS}`,
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
                  "Assoziiertes Mitglied & Botschafter werden",
                  "Assoziéierte Member & Ambassadeur ginn",
                )}
              </h1>

              <p className="text-lg text-calm-blue-700 leading-relaxed font-semibold text-pretty">
                {l(
                  lang,
                  "Stand behind free, official-source-cited administrative guidance for families navigating terminal illness and bereavement across 196 countries — and help make Clarvia known across your professional network.",
                  "Soutenez un accompagnement administratif gratuit et sourcé pour les familles confrontées à la maladie grave ou au décès d'un proche dans 196 pays — et faites connaître Clarvia au sein de votre réseau professionnel.",
                  "Stärken Sie kostenlose, quellenbasierte Orientierung für Familien bei schwerer Krankheit und im Trauerfall in 196 Ländern – und tragen Sie die Mission von Clarvia in Ihr berufliches Netzwerk.",
                  "Stäerkt gratis, op offiziellen Quelle baséiert Orientéierung fir Familljen bei schwéierer Krankheet an am Trauerfall an 196 Länner – an hëlleft Clarvia an Ärem berufflechen Netzwierk bekannt ze maachen.",
                )}
              </p>

              <p className="text-base text-calm-blue-600 leading-relaxed text-pretty">
                {l(
                  lang,
                  `Pursuant to Articles 7 and 8 of Clarvia ASBL's Articles of Association (RCS Luxembourg F15680), individuals who believe in accessible public-interest infrastructure may join as Contributing Associate Members (€${ASSOCIATE_MONTHLY_EUR}/month or €${ASSOCIATE_ANNUAL_EUR}/year). The role is honorary and philanthropic: it carries zero personal liability, zero committee obligations, and zero commercial ties.`,
                  `Conformément aux articles 7 et 8 des statuts de Clarvia ASBL (RCS Luxembourg F15680), les personnes souhaitant soutenir une infrastructure d'intérêt général peuvent adhérer en qualité de membre adhérent cotisant (${ASSOCIATE_MONTHLY_EUR} €/mois ou ${ASSOCIATE_ANNUAL_EUR} €/an). Ce statut honorifique et philanthropique n'implique aucune responsabilité personnelle, aucune réunion obligatoire et aucun lien commercial.`,
                  `Gemäß Artikel 7 und 8 der Satzung von Clarvia ASBL (RCS Luxemburg F15680) können Persönlichkeiten, die gemeinnützige Infrastruktur fördern möchten, als beitragende assoziierte Mitglieder (${ASSOCIATE_MONTHLY_EUR} €/Monat oder ${ASSOCIATE_ANNUAL_EUR} €/Jahr) beitreten. Die Stellung ist ideell und ehrenvoll: ohne persönliche Haftung, ohne Gremienpflichten und ohne kommerzielle Verflechtung.`,
                  `Geméiss Artikel 7 an 8 vun de Statute vu Clarvia ASBL (RCS Lëtzebuerg F15680) kënne Persounen als assoziéierte Member (${ASSOCIATE_MONTHLY_EUR} €/Mount oder ${ASSOCIATE_ANNUAL_EUR} €/Joer) bäitrieden. Dëse Status ass honorifesch a philanthropesch: ouni perséinlech Haftung, ouni Versammlungspflichten an ouni kommerziell Verflechtung.`,
                )}
              </p>
            </div>

            {/* 6 Prestige & Zero-Burden Benefits Grid */}
            <div>
              <h2
                className="text-xl font-semibold text-calm-blue-800 mb-4 text-balance"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(
                  lang,
                  "What Associate Membership includes",
                  "Ce que comprend le statut de membre adhérent",
                  "Was die assoziierte Mitgliedschaft umfasst",
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

            {/* Accounting & Independence Clarity Panel */}
            <div className="glass-panel p-5 space-y-3 text-sm text-calm-blue-600 leading-relaxed">
              <h2
                className="text-xl font-semibold text-calm-blue-800 text-balance"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(
                  lang,
                  "Governance, accounting, and editorial independence",
                  "Gouvernance, comptabilité et indépendance éditoriale",
                  "Governance, Buchhaltung und redaktionelle Unabhängigkeit",
                  "Governance, Comptabilitéit a redaktionell Onofhängegkeet",
                )}
              </h2>
              <p className="text-pretty">
                {l(
                  lang,
                  "Clarvia ASBL records Associate Member contributions as statutory non-profit membership fees (Account 7200) under Luxembourg's Law of 7 August 2023. Every euro funds open, source-backed guidance infrastructure and multilingual maintenance — we display zero advertisements and never monetise personal data.",
                  "Clarvia ASBL comptabilise les versements des membres adhérents en tant que cotisations statutaires (compte 7200) conformément à la loi luxembourgeoise du 7 août 2023. Chaque euro finance l'infrastructure ouverte et la maintenance multilingue — nous n'affichons aucune publicité et ne monétisons aucune donnée personnelle.",
                  "Clarvia ASBL verbucht Beiträge assoziierter Mitglieder als satzungsmäßige Mitgliedsbeiträge (Konto 7200) nach dem luxemburgischen Gesetz vom 7. August 2023. Jeder Euro fließt in unsere offene, quellenbasierte Infrastruktur – wir zeigen keine Werbung und monetarisieren keine personenbezogenen Daten.",
                  "Clarvia ASBL verbucht d'Cotisatiounen als statutaire Membersbäiträg (Kont 7200) no dem Lëtzebuerger Gesetz vum 7. August 2023. All Euro fléisst an eis oppen Infrastruktur – mir weise keng Reklammen a verdéngen net u perséinlechen Donnéeën.",
                )}
              </p>
              <p className="text-xs text-calm-blue-500 text-pretty">
                {l(
                  lang,
                  "Clarvia ASBL does not currently issue tax-deductible certificates. Associate Membership confers no voting rights, no influence over guidance content, no referrals, and no access to user data. Live financial transparency is published on ",
                  "Clarvia ASBL ne délivre pas actuellement de certificats fiscaux. Le statut de membre adhérent ne confère aucun droit de vote, aucune influence éditoriale, aucune recommandation et aucun accès aux données des utilisateurs. Suivez notre transparence financière sur ",
                  "Clarvia ASBL stellt derzeit keine steuerlichen Spendenbescheinigungen aus. Die Mitgliedschaft gewährt kein Stimmrecht, keinen Einfluss auf Inhalte, keine Empfehlungen und keinen Zugang zu Nutzerdaten. Laufende Finanztransparenz auf ",
                  "Clarvia ASBL stellt de Moment keng Steierzertifikater aus. D'Memberschaft gëtt kee Stëmmrecht, keen Afloss op d'Inhalter a keen Zougang zu Benotzerdonnéeën. Lafend Finanztransparenz op ",
                )}
                <a
                  href="https://opencollective.com/clarvia-org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-calm-lilac-600 hover:text-calm-lilac-600 underline underline-offset-2 font-medium"
                >
                  opencollective.com/clarvia-org
                </a>
                .
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Membership Enrollment Form & Bank Transfer */}
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
                  "Als assoziiertes Mitglied beitreten",
                  "Als assoziéierte Member bäitrieden",
                )}
              </h2>
              <p className="text-xs text-calm-blue-500 mb-4">
                {l(
                  lang,
                  "Instant electronic admission under Board Resolution 2026-01",
                  "Admission électronique immédiate (résolution 2026-01)",
                  "Direkte elektronische Aufnahme (Vorstandsbeschluss 2026-01)",
                  "Direkt elektronesch Opnam (Resolutioun 2026-01)",
                )}
              </p>

              <MembershipForm
                lang={lang}
                onNameChange={setPreviewName}
                onPublishChange={setPreviewPublish}
              />

              <div className="mt-4 pt-3 border-t border-calm-blue-100/70 text-center">
                <p className="text-xs text-calm-blue-500">
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

            {/* Native <details>/<summary> Bank Transfer Option */}
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

              <div className="mt-3 pt-3 border-t border-calm-blue-100/60 text-left space-y-2.5">
                <div className="space-y-2 text-xs font-mono bg-white/60 border border-calm-blue-100 rounded-xl p-3.5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="overflow-x-auto">
                      <span className="font-semibold font-sans text-calm-blue-500 mr-1">
                        IBAN:
                      </span>
                      <span className="tracking-wider select-all">
                        LT09 3500 0100 1903 8740
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("LT09 3500 0100 1903 8740", "iban")}
                      className="shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 font-sans font-medium"
                    >
                      {copiedField === "iban"
                        ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                        : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                    </button>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <span className="font-semibold font-sans text-calm-blue-500 mr-1">
                        BIC/SWIFT:
                      </span>
                      <span className="select-all">EVIULT2VXXX</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("EVIULT2VXXX", "bic")}
                      className="shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 font-sans font-medium"
                    >
                      {copiedField === "bic"
                        ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                        : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                    </button>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <span className="font-semibold font-sans text-calm-blue-500 mr-1">
                        Ref:
                      </span>
                      <span className="select-all">CLARVIA-MEMBER</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("CLARVIA-MEMBER", "ref")}
                      className="shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 font-sans font-medium"
                    >
                      {copiedField === "ref"
                        ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                        : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                    </button>
                  </div>

                  <div className="text-[11px] font-sans text-calm-blue-600 space-y-0.5 pt-1.5 border-t border-calm-blue-100/60">
                    <p>
                      <span className="font-medium text-calm-blue-500">
                        {l(lang, "Holder:", "Titulaire :", "Inhaber:", "Kontohalter:")}
                      </span>{" "}
                      Clarvia ASBL (RCS Luxembourg F15680)
                    </p>
                    <p>
                      <span className="font-medium text-calm-blue-500">
                        {l(lang, "Bank:", "Banque :", "Bank:", "Bank:")}
                      </span>{" "}
                      Paysera LT, UAB
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-calm-blue-500 leading-snug">
                  {l(
                    lang,
                    "Include CLARVIA-MEMBER as the payment reference and notify us via the Contact form with your LinkedIn URL if you wish to be listed publicly.",
                    "Indiquez CLARVIA-MEMBER en référence et écrivez-nous via le formulaire de contact avec votre URL LinkedIn si vous souhaitez être publié(e).",
                    "Geben Sie CLARVIA-MEMBER als Verwendungszweck an und senden Sie uns über das Kontaktformular Ihre LinkedIn-URL, falls Sie öffentlich genannt werden möchten.",
                    "Gitt CLARVIA-MEMBER als Referenz un a schéckt eis iwwer de Kontaktformulaire Är LinkedIn-URL, wann Dir ëffentlech genannt wëllt ginn.",
                  )}
                </p>
              </div>
            </details>

            {/* Alternative general donation link */}
            <div className="text-center px-2">
              <p className="text-xs text-calm-blue-500">
                {l(
                  lang,
                  "Prefer a general one-time or custom donation without membership?",
                  "Vous préférez effectuer un don libre sans adhésion ?",
                  "Lieber eine freie Einzel- oder Monatsspende ohne Mitgliedschaft?",
                  "Léiwer en einfachen Don ouni Memberschaft?",
                )}{" "}
                <Link
                  href={`/${lang}/support`}
                  className="text-calm-blue-700 hover:text-calm-blue-900 font-medium underline underline-offset-2"
                >
                  {l(
                    lang,
                    "Visit our Support page →",
                    "Aller sur la page Soutenir →",
                    "Zur Spendenseite →",
                    "Op d'Spendesäit →",
                  )}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Founding Cohort Showcase (Board Stewards + Live Preview + Members / Archetype Slots) */}
        <CohortShowcase
          lang={lang}
          previewName={previewName}
          previewPublish={previewPublish}
        />

        {/* Statutory & Governance FAQ Accordion */}
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
