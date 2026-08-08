"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle, TESTIMONIALS } from "@/app/[lang]/data";
import FooterSection from "@/app/[lang]/sections/FooterSection";
import Header from "@/components/Header";
import DonationForm from "./DonationForm";
import DonationSuccessTracker from "./DonationSuccessTracker";
import TrustStrip from "./TrustStrip";
import { type DonationLandingVariant } from "./landing-page-config";

export interface DonationLandingPageProps {
  config: DonationLandingVariant;
}

const STRIPE_BILLING_PORTAL_URL =
  process.env.NEXT_PUBLIC_STRIPE_BILLING_PORTAL_URL ??
  "https://billing.stripe.com/p/login/cNieVd5j90I9dOs2d3b3q00";

const CURRENT_RAISED = 3800;
const FUNDING_GOAL = 10000;

export default function DonationLandingPage({ config }: DonationLandingPageProps) {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";
  const [progress, setProgress] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Goal progress animation on load (only if progress bar is enabled)
  useEffect(() => {
    if (!config.showProgressBar) return;
    const timer = setTimeout(() => {
      setProgress((CURRENT_RAISED / FUNDING_GOAL) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [config.showProgressBar]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      alert(
        l(
          lang,
          "Could not copy to clipboard. Please copy manually.",
          "Impossible de copier dans le presse-papiers. Veuillez copier manuellement.",
          "Konnte nicht in die Zwischenablage kopieren. Bitte manuell kopieren.",
          "Konnt net an de Clipboard kopéiert ginn. Kopéiert et wgl. manuell."
        )
      );
    }
  };

  const localizedHeadline = l(
    lang,
    config.headline.en,
    config.headline.fr,
    config.headline.de,
    config.headline.lu
  );

  const localizedSummary = l(
    lang,
    config.summary.en,
    config.summary.fr,
    config.summary.de,
    config.summary.lu
  );

  return (
    <>
      {config.showFullNavigation ? (
        <Header lang={lang} />
      ) : (
        /* Simplified ad landing page header */
        <header className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative">
          <Link
            href={`/${lang}/checklist`}
            aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia Startseite", "Clarvia Startsäit")}
            className="block relative w-40 h-20 transition-transform duration-200 hover:scale-[1.02]"
          >
            <Image
              src="/clarvia-logo.webp"
              alt="Clarvia logo"
              fill
              sizes="160px"
              priority
              className="object-contain"
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href={`/${lang}/checklist`}
              className="text-sm font-semibold text-calm-blue-600 hover:text-calm-blue-800 transition-colors"
            >
              {l(
                lang,
                "View free checklist",
                "Voir la liste gratuite",
                "Kostenlose Checkliste ansehen",
                "Gratis Checklëscht uweisen"
              )}
            </Link>
            <div className="flex items-center gap-2">
              {LANGUAGES.map((code) => (
                <Link
                  key={code}
                  href={`/${code}/support`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    lang === code
                      ? "bg-white text-calm-blue-800 shadow-sm border border-calm-blue-200"
                      : "text-calm-blue-500 hover:bg-white/40"
                  }`}
                >
                  {code.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </header>
      )}

      <main
        id="main-content"
        className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10"
      >
        {/* Thank-you banner after successful donation */}
        <DonationSuccessTracker lang={lang} />

        {/* 2-Column Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Hero text, image, progress bar, what donations fund */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4"
                style={headlineStyle}
              >
                {localizedHeadline}
              </h1>
              <p className="text-lg text-calm-blue-600 leading-relaxed font-semibold">
                {localizedSummary}
              </p>

              {config.id === "support" && (
                <>
                  <p className="text-base text-calm-blue-500 leading-relaxed">
                    {l(
                      lang,
                      "The information exists, but it is scattered across official websites, different jurisdictions, and unclear procedures. Clarvia turns that complexity into free, open-source checklists that show what to do first, what each step unlocks, and what deadlines matter most.",
                      "Les informations existent, mais elles sont dispersées sur des sites officiels, dans différentes administrations et dans des procédures souvent peu claires. Clarvia transforme cette complexité en listes d’étapes gratuites et open source, qui expliquent quoi faire en premier, quelles démarches en débloquent d’autres et quels délais sont les plus importants.",
                      "Die Informationen gibt es, aber sie sind über offizielle Websites, verschiedene Zuständigkeiten und oft unklare Abläufe verstreut. Clarvia macht daraus kostenlose Open-Source-Checklisten, die zeigen, was zuerst zu tun ist, welche Schritte andere ermöglichen und welche Fristen besonders wichtig sind.",
                      "D'Informatioune ginn et, mee se sinn iwwer offiziell Websäiten, verschidde Verwaltungen an dacks onkloer Prozedure verstreet. Clarvia mécht aus där Komplexitéit gratis Open-Source-Checklëschten, déi weisen, wat als Éischt ze maachen ass, wéi eng Schrëtt aner Démarchen erméiglechen a wéi eng Fristen am wichtegste sinn."
                    )}
                  </p>
                  <p className="text-base text-calm-blue-500 leading-relaxed">
                    {l(
                      lang,
                      "Your donation helps make this practical guidance available to everyone, not only to those who can afford lawyers, consultants, or private support.",
                      "Votre don nous aide à rendre ces informations pratiques accessibles à toutes et tous, pas seulement aux personnes qui peuvent faire appel à des avocats, des consultants ou un accompagnement privé.",
                      "Ihre Spende hilft dabei, diese praktische Orientierung für alle zugänglich zu machen, nicht nur für Menschen, die sich Anwälte, Berater oder private Unterstützung leisten können.",
                      "Ären Don hëlleft, dës praktesch Orientéierung fir jiddereen zougänglech ze maachen – net nëmme fir Leit, déi sech Affekoten, Beroder oder privat Ënnerstëtzung leeschte kënnen."
                    )}
                  </p>
                  <p className="text-base text-calm-blue-500 leading-relaxed italic">
                    {l(
                      lang,
                      "Most of us will face this responsibility at some point. No one should have to figure it out alone.",
                      "La plupart d’entre nous devront un jour faire face à ces responsabilités. Personne ne devrait avoir à s’y retrouver seul.",
                      "Die meisten von uns werden irgendwann vor dieser Aufgabe stehen. Niemand sollte damit allein sein.",
                      "Déi meescht vun eis kommen iergendwann an déi Situatioun. Keen soll dat eleng erausfanne mussen."
                    )}
                  </p>
                </>
              )}
            </div>

            {/* Hero Image */}
            {config.showImage && (
              <div className="overflow-hidden rounded-2xl shadow-md border border-white/60 bg-slate-100">
                <Image
                  src="/support-hero.webp"
                  alt={localizedHeadline}
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover aspect-[16/9]"
                />
              </div>
            )}

            {/* Funding goal progress */}
            {config.showProgressBar && (
              <div className="glass-panel p-5">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-semibold text-calm-blue-800">
                    {l(lang, "Current goal", "Objectif actuel", "Aktuelles Ziel", "Aktuellt Zil")}
                  </p>
                  <p className="text-xs text-calm-blue-400">
                    {l(
                      lang,
                      "Updated weekly",
                      "Mis à jour chaque semaine",
                      "Wöchentlich aktualisiert",
                      "All Woch aktualiséiert"
                    )}
                  </p>
                </div>
                <div className="w-full h-3 rounded-full bg-calm-blue-100/80 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(135deg, #4479e1, #7c6cbb)",
                    }}
                  />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-calm-blue-800">
                    &euro;3,800{" "}
                    <span className="text-sm font-normal text-calm-blue-400">
                      {l(lang, "raised", "collectés", "gesammelt", "gesammelt")}
                    </span>
                  </p>
                  <p className="text-sm text-calm-blue-500">
                    {l(
                      lang,
                      "of \u20AC10,000 goal",
                      "sur un objectif de 10 000 \u20AC",
                      "von 10.000 \u20AC",
                      "vun engem Zil vun 10.000 €"
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* What your donation funds (Impact Points Grid) */}
            <div>
              <h2
                className="text-xl font-semibold text-calm-blue-800 mb-4"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(
                  lang,
                  "Your donation helps us:",
                  "Votre don nous aide à :",
                  "Ihre Spende hilft uns:",
                  "Ären Don hëlleft eis:"
                )}
              </h2>
              {config.id === "support" ? (
                /* 2-column grid for support page with 6 items */
                <div className="grid grid-cols-2 gap-3">
                  {config.impactPoints.map((item) => (
                    <div
                      key={item.text.en}
                      className="glass-panel p-4 text-center hover:scale-[1.01] transition-transform duration-200"
                    >
                      <div className="w-10 h-10 mx-auto bg-white/50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-white/60">
                        <span className="text-xl block" aria-hidden="true">
                          {item.icon}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-calm-blue-700">
                        {l(lang, item.text.en, item.text.fr, item.text.de, item.text.lu)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* Simple check list format for ad variants */
                <ul className="space-y-3.5 pl-1">
                  {config.impactPoints.map((item) => (
                    <li key={item.text.en} className="flex items-start gap-2.5 text-sm text-calm-blue-600 font-medium">
                      <span className="text-calm-lilac-500 font-bold block text-base leading-none select-none" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span>
                        {l(lang, item.text.en, item.text.fr, item.text.de, item.text.lu)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Donation Selector Card */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="glass-panel p-6 border border-white/80 shadow-lg">
              <h2
                className="text-xl font-semibold text-calm-blue-800 mb-4"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(
                  lang,
                  "Select Donation Amount",
                  "Sélectionner le montant",
                  "Spendenbetrag wählen",
                  "Betrag vum Don auswielen"
                )}
              </h2>

              <DonationForm
                lang={lang}
                landingVariant={config.id}
                config={config}
              />

              {/* Manage existing subscription */}
              {config.showFullNavigation && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-calm-blue-400">
                    {l(
                      lang,
                      "Already a monthly supporter?",
                      "Vous êtes déjà donateur mensuel ?",
                      "Sie unterstützen uns bereits monatlich?",
                      "Ënnerstëtzt Dir eis schonn all Mount?"
                    )}{" "}
                    <a
                      href={STRIPE_BILLING_PORTAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors"
                    >
                      {l(lang, "Manage your donation", "Gérer votre don", "Spende verwalten", "Ären Don verwalten")}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Bank transfer details card */}
            {config.showBankTransfer && (
              <div className="glass-panel p-4 border border-white/60 text-center">
                <button
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  className="w-full text-sm font-medium text-calm-blue-600 hover:text-calm-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer outline-none"
                >
                  <span>{showBankDetails ? "▼" : "▶"}</span>
                  {l(
                    lang,
                    "Prefer a bank transfer?",
                    "Vous préférez un virement bancaire ?",
                    "Lieber per Banküberweisung spenden?",
                    "Léiwer per Bankiwwerweisung?"
                  )}
                </button>

                {showBankDetails && (
                  <div className="mt-4 text-left border-t border-calm-blue-100/50 pt-4 animate-fadeIn">
                    <div className="space-y-2.5 text-xs font-mono bg-white/50 border border-calm-blue-100 rounded-xl p-3.5">
                      {/* IBAN Row */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="overflow-x-auto scrollbar-none">
                          <span className="font-semibold font-sans text-calm-blue-500 mr-1">IBAN:</span>
                          <span className="tracking-wider select-all">LT09 3500 0100 1903 8740</span>
                        </div>
                        <button
                          onClick={() => handleCopy("LT09 3500 0100 1903 8740", "iban")}
                          className="flex-shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 transition-colors font-sans font-medium"
                        >
                          {copiedField === "iban"
                            ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                            : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                        </button>
                      </div>

                      {/* BIC Row */}
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <span className="font-semibold font-sans text-calm-blue-500 mr-1">BIC/SWIFT:</span>
                          <span className="select-all">EVIULT2VXXX</span>
                        </div>
                        <button
                          onClick={() => handleCopy("EVIULT2VXXX", "bic")}
                          className="flex-shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 transition-colors font-sans font-medium"
                        >
                          {copiedField === "bic"
                            ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                            : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                        </button>
                      </div>

                      {/* Suggested Reference Row */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="overflow-x-auto scrollbar-none">
                          <span className="font-semibold font-sans text-calm-blue-500 mr-1">Ref:</span>
                          <span className="select-all">CLARVIA-SUPPORT</span>
                        </div>
                        <button
                          onClick={() => handleCopy("CLARVIA-SUPPORT", "ref")}
                          className="flex-shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 transition-colors font-sans font-medium"
                        >
                          {copiedField === "ref"
                            ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
                            : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                        </button>
                      </div>

                      {/* Text values */}
                      <div className="text-[11px] font-sans text-calm-blue-600 space-y-1 pt-1.5 border-t border-calm-blue-100/50">
                        <p>
                          <span className="font-medium text-calm-blue-500">
                            {l(lang, "Holder:", "Titulaire :", "Inhaber:", "Kontohalter:")}
                          </span>{" "}
                          Clarvia ASBL
                        </p>
                        <p>
                          <span className="font-medium text-calm-blue-500">RCS:</span> F15680
                        </p>
                        <p>
                          <span className="font-medium text-calm-blue-500">
                            {l(lang, "Bank:", "Banque :", "Bank:", "Bank:")}
                          </span>{" "}
                          Paysera LT, UAB
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-calm-blue-400 mt-2.5 leading-snug">
                      {l(
                        lang,
                        "Use CLARVIA-SUPPORT and your email as the payment reference so we can send an acknowledgement.",
                        "Utilisez CLARVIA-SUPPORT et votre e-mail comme référence pour nous permettre de vous envoyer un accusé de réception.",
                        "Verwenden Sie CLARVIA-SUPPORT und Ihre E-Mail als Referenz, damit wir Ihnen eine Bestätigung senden können.",
                        "Benotzt CLARVIA-SUPPORT an Är E-Mail als Bezuelreferenz, fir datt mir Iech eng Bestätegung schécke kënnen."
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* GitHub Sponsors card */}
            {config.showGitHubSponsors && (
              <div className="glass-panel p-5 border border-white/60">
                <h3 className="text-base font-semibold text-calm-blue-800 mb-2">
                  {l(lang, "Sponsor on GitHub", "Sponsoriser sur GitHub", "Auf GitHub sponsern", "Op GitHub sponsoren")}
                </h3>
                <p className="text-xs text-calm-blue-500 leading-normal mb-3">
                  {l(
                    lang,
                    "Sponsor Clarvia's open-source workflow data and core public infrastructure via GitHub Sponsors.",
                    "Soutenez les données de parcours open source et l'infrastructure publique de Clarvia via GitHub Sponsors.",
                    "Unterstützen Sie Clarvias Open-Source-Ablaufdaten und die öffentliche Infrastruktur über GitHub Sponsors.",
                    "Sponsort Clarvia seng Open-Source-Workflow-Donnéeën an déi ëffentlech Kärinfrastruktur iwwer GitHub Sponsors."
                  )}
                </p>
                <a
                  href="https://github.com/sponsors/clarvia-org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full py-2.5 text-sm inline-flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  {l(lang, "Sponsor on GitHub", "Sponsoriser sur GitHub", "Auf GitHub sponsern", "Op GitHub sponsoren")}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Testimonials block */}
        {config.showTestimonials && (
          <section
            className="mt-16 pt-12 border-t border-calm-blue-200/50"
            aria-labelledby="testimonials-heading"
          >
            <h2
              id="testimonials-heading"
              className="text-2xl font-semibold text-center text-calm-blue-800 mb-2"
              style={{ fontFamily: headlineStyle.fontFamily }}
            >
              {l(
                lang,
                "Why people support our mission",
                "Pourquoi certains soutiennent notre mission",
                "Warum Menschen unsere Mission unterstützen",
                "Firwat Leit eis Missioun ënnerstëtzen"
              )}
            </h2>
            <p className="text-sm text-calm-blue-500 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
              {l(
                lang,
                "Clarvia is built around real feedback from families navigating administrative challenges after a loss.",
                "Clarvia est construit à partir de retours réels de familles confrontées aux démarches administratives après un décès.",
                "Clarvia basiert auf realem Feedback von Familien, die nach einem Verlust administrative Hürden bewältigen mussten.",
                "Clarvia baséiert op richtegem Feedback vu Familljen, déi no engem Doudesfall administrativ Hürde gemeeschtert hunn."
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="glass-panel p-5 flex flex-col justify-between border border-white/60"
                >
                  <div>
                    <div className="mb-3">
                      <Image
                        src={`https://flagcdn.com/w40/${t.flag}.png`}
                        width={24}
                        height={18}
                        alt={t.flag.toUpperCase()}
                        className="rounded-sm shadow-sm"
                      />
                    </div>
                    <blockquote className="text-sm text-calm-blue-700 leading-relaxed italic">
                      &ldquo;{l(lang, t.en, t.fr, t.de)}&rdquo;
                    </blockquote>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-calm-blue-800 pt-2.5 border-t border-calm-blue-100">
                    - {l(lang, t.attribution.en, t.attribution.fr, t.attribution.de)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Corporate sponsors block */}
        {config.showCorporateSponsors && (
          <section
            className="mt-16 pt-12 border-t border-calm-blue-200/50"
            aria-labelledby="corporate-heading"
          >
            <h2
              id="corporate-heading"
              className="text-xl font-semibold text-calm-blue-800 mb-4"
              style={{ fontFamily: headlineStyle.fontFamily }}
            >
              {l(
                lang,
                "Corporate sponsors",
                "Partenaires entreprises",
                "Unternehmenssponsoren",
                "Firmesponsoren"
              )}
            </h2>
            <div className="glass-panel p-6 border border-white/60">
              <p className="text-sm text-calm-blue-600 leading-relaxed mb-3">
                {l(
                  lang,
                  "Companies supporting Clarvia help build public-interest infrastructure for families after the loss of a loved one.",
                  "Les entreprises qui soutiennent Clarvia contribuent à créer une infrastructure d’intérêt public pour les familles après la perte d’un proche.",
                  "Unternehmen, die Clarvia unterstützen, helfen beim Aufbau einer gemeinwohlorientierten Infrastruktur für Familien nach dem Verlust eines nahestehenden Menschen.",
                  "Entreprisen, déi Clarvia ënnerstëtzen, hëllefen eng Infrastruktur am ëffentlechen Interessi fir Familljen nom Verloscht vun engem nooste Mënsch opzebauen."
                )}
              </p>
              <p className="text-[11px] text-calm-blue-500 leading-relaxed mb-4">
                {l(
                  lang,
                  "Sponsors may receive acknowledgement, but sponsorship does not provide influence over guidance, access to user data, referrals, preferential placement, exclusivity, or endorsement.",
                  "Les sponsors peuvent être remerciés publiquement, mais leur soutien ne leur donne aucune influence sur les conseils fournis, aucun accès aux données des utilisateurs, aucune recommandation, aucun placement préférentiel, aucune exclusivité et aucune forme d’approbation.",
                  "Sponsoren können öffentlich genannt werden, erhalten durch ihr Sponsoring jedoch keinen Einfluss auf die Inhalte, keinen Zugang zu Nutzerdaten, keine Vermittlungen, keine bevorzugte Platzierung, keine Exklusivität und keine Empfehlung.",
                  "Sponsore kënne fir hir Ënnerstëtzung genannt ginn, mee Sponsoring gëtt keen Afloss op d'Orientéierung, keen Zougang zu Benotzerdonnéeën, keng Recommandatiounen, keng bevorzugt Plazéierung, keng Exklusivitéit a keng Ënnerstëtzungsempfehlung."
                )}
              </p>
              <Link
                href={`/${lang}/contact`}
                className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                {l(lang, "Get in touch", "Nous contacter", "Kontakt aufnehmen", "Mellt Iech bei eis")}
              </Link>
            </div>
          </section>
        )}

        {/* Privacy, FAQ, and Legal Details (Moved lower/bottom alignment) */}
        <div className="mt-16">
          <TrustStrip lang={lang} />
        </div>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
