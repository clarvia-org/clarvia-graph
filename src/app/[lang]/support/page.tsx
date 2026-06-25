"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";

/* -- Donation tier data -- */

function getMonthlyTiers(lang: Lang) {
  return [
    { amount: 10, label: l(lang, "Keep the service free", "Aider à garder le service gratuit", "Helfen, den Dienst kostenlos zu halten") },
    { amount: 25, label: l(lang, "Support multilingual maintenance", "Soutenir la maintenance multilingue", "Mehrsprachige Pflege unterstützen"), default: true },
    { amount: 50, label: l(lang, "Fund source-backed updates", "Financer les mises à jour fondées sur des sources officielles", "Quellenbasierte Aktualisierungen finanzieren") },
    { amount: 100, label: l(lang, "Founding Circle supporter", "Membre du Cercle fondateur", "Unterstützer im Gründerkreis") },
  ];
}

function getOnetimeTiers(lang: Lang) {
  return [
    { amount: 35, label: l(lang, "Help maintain official-source references", "Aider à maintenir les références aux sources officielles", "Bei der Pflege offizieller Quellenverweise helfen") },
    { amount: 75, label: l(lang, "Support workflow validation", "Soutenir la validation des parcours", "Die Validierung der Abläufe unterstützen") },
    { amount: 150, label: l(lang, "Fund translation and accessibility work", "Financer le travail de traduction et d'accessibilité", "Übersetzungs- und Barrierefreiheitsarbeit finanzieren") },
    { amount: 500, label: l(lang, "Support a public-service module", "Soutenir un module de service public", "Ein gemeinnütziges Servicemodul unterstützen") },
  ];
}

/* -- What donations fund -- */

function getFundItems(lang: Lang) {
  return [
    { icon: "\u{1F4C4}", label: l(lang, "Source review and maintenance", "Vérification et maintenance des sources", "Quellenprüfung und Pflege") },
    { icon: "\u{1F30D}", label: l(lang, "Translation in English, French, and German", "Traduction en anglais, français et allemand", "Übersetzung auf Englisch, Französisch und Deutsch") },
    { icon: "\u267F", label: l(lang, "Accessibility toward WCAG 2.2 AA", "Accessibilité conforme à l'objectif WCAG 2.2 AA", "Barrierefreiheit mit Ziel WCAG 2.2 AA") },
    { icon: "\u2713", label: l(lang, "Workflow validation", "Validation des parcours", "Validierung der Abläufe") },
    { icon: "\u{1F5A5}\uFE0F", label: l(lang, "Hosting and infrastructure", "Hébergement et infrastructure", "Hosting und Infrastruktur") },
    { icon: "\u{1F91D}", label: l(lang, "Community outreach", "Sensibilisation et échanges avec la communauté", "Öffentlichkeitsarbeit und Austausch mit der Community") },
  ];
}

/* -- Thank-you banner (needs Suspense for useSearchParams) -- */

function ThankYouBanner({ lang }: { lang: Lang }) {
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";
  if (!donated) return null;
  return (
    <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
      <p className="text-green-800 font-medium">
        {l(lang, "Thank you for your support! You will receive a receipt from Stripe at the email address you provided.", "Merci pour votre soutien ! Vous recevrez un recu de Stripe a l'adresse e-mail que vous avez indiquee.", "Vielen Dank fuer Ihre Unterstuetzung! Sie erhalten eine Quittung von Stripe an die von Ihnen angegebene E-Mail-Adresse.")}
      </p>
    </div>
  );
}

/* -- Trust elements -- */

function getTrustItems(lang: Lang) {
  return [
    {
      title: l(lang, "Registered non-profit", "Association sans but lucratif enregistrée", "Eingetragene Non-Profit-Organisation"),
      desc: l(lang, "Clarvia ASBL is registered as a non-profit association under RCS F15680.", "Clarvia ASBL est enregistrée comme association sans but lucratif sous le numéro RCS F15680.", "Clarvia ASBL ist als gemeinnützige Vereinigung unter der Nummer RCS F15680 eingetragen."),
    },
    {
      title: l(lang, "Free for families", "Gratuit pour les familles", "Kostenlos für Familien"),
      desc: l(lang, "Clarvia is being built as a public service that families can use for free.", "Clarvia est conçu comme un service public que les familles pourront utiliser gratuitement.", "Clarvia wird als öffentlicher Dienst aufgebaut, den Familien kostenlos nutzen können."),
    },
    {
      title: l(lang, "Early support has outsized impact", "Un soutien précoce a un impact décisif", "Frühe Unterstützung bewirkt besonders viel"),
      desc: l(lang, "Clarvia is in its build and validation phase, where each donation directly supports the foundation of the service.", "Clarvia est en phase de développement et de validation, une étape où chaque don contribue directement aux fondations du service.", "Clarvia befindet sich in der Entwicklungs- und Validierungsphase, in der jede Spende direkt zum Fundament des Dienstes beiträgt."),
    },
    {
      title: l(lang, "Source-backed workflows", "Des parcours fondés sur des sources officielles", "Quellenbasierte Abläufe"),
      desc: l(lang, "Guidance is built around official sources, structured review, and ongoing maintenance.", "Les informations sont construites à partir de sources officielles, d'une revue structurée et d'une maintenance continue.", "Die Orientierungshilfen beruhen auf offiziellen Quellen, strukturierter Prüfung und laufender Pflege."),
    },
    {
      title: l(lang, "Privacy-first donor records", "Des dossiers donateurs respectueux de la confidentialité", "Datensparsame Spenderunterlagen"),
      desc: l(lang, "We collect only the information needed to process your gift, acknowledge support, and maintain basic records.", "Nous collectons uniquement les informations nécessaires pour traiter votre don, confirmer votre soutien et tenir des registres de base.", "Wir erfassen nur die Informationen, die erforderlich sind, um Ihre Spende zu bearbeiten, Ihre Unterstützung zu bestätigen und grundlegende Unterlagen zu führen."),
    },
    {
      title: l(lang, "Open source", "Open source", "Open Source"),
      desc: l(lang, "Clarvia's public GitHub work makes the infrastructure easier to inspect, improve, and maintain.", "Les travaux publics de Clarvia sur GitHub rendent l'infrastructure plus facile à examiner, à améliorer et à maintenir.", "Clarvias öffentliche Arbeit auf GitHub macht die Infrastruktur leichter prüfbar, verbesserbar und wartbar."),
    },
  ];
}

export default function SupportPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";
  const [tab, setTab] = useState<"monthly" | "onetime">("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset "Redirecting..." state when user navigates back from Stripe
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setIsProcessing(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const tiers = tab === "monthly" ? getMonthlyTiers(lang) : getOnetimeTiers(lang);
  const activeAmount = isCustom ? (Number(customAmount) || 0) : selectedAmount;
  const isValidAmount = activeAmount >= 1 && activeAmount <= 100000;

  async function handleCardPayment() {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: activeAmount,
          type: tab === "monthly" ? "monthly" : "onetime",
          lang,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || l(lang, "Something went wrong. Please try bank transfer instead.", "Une erreur est survenue. Veuillez plutôt effectuer un virement bancaire.", "Etwas ist schiefgelaufen. Bitte nutzen Sie stattdessen eine Banküberweisung."));
        setIsProcessing(false);
      }
    } catch {
      alert(l(lang, "Could not connect to the payment service. Please try bank transfer instead.", "Impossible de se connecter au service de paiement. Veuillez plutôt effectuer un virement bancaire.", "Die Verbindung zum Zahlungsdienst konnte nicht hergestellt werden. Bitte nutzen Sie stattdessen eine Banküberweisung."));
      setIsProcessing(false);
    }
  }

  return (
    <>
      {/* Header */}
      <header
        aria-label={l(lang, "Site header", "En-tête du site", "Website-Kopfbereich")}
        className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative"
      >
        <Link
          href={`/${lang}`}
          aria-label={l(lang, "Clarvia home", "Accueil Clarvia", "Clarvia-Startseite")}
          className="block"
        >
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <nav
          aria-label={l(lang, "Language switcher", "Sélecteur de langue", "Sprachauswahl")}
          className="flex items-center gap-2"
        >
          {LANGUAGES.map((code) => (
            <Link
              key={code}
              href={`/${code}/support`}
              aria-label={`Switch to ${code.toUpperCase()}`}
              aria-current={lang === code ? "page" : undefined}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                lang === code
                  ? "bg-white text-calm-blue-800 shadow-sm border border-calm-blue-200"
                  : "text-calm-blue-500 hover:bg-white/40"
              }`}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-16 relative z-10">

        {/* Thank-you banner after successful donation */}
        <Suspense fallback={null}>
          <ThankYouBanner lang={lang} />
        </Suspense>

        {/* A. Hero */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {l(lang, "Support Clarvia", "Soutenir Clarvia", "Clarvia unterstützen")}
        </h1>
        <p className="text-lg text-calm-blue-600 leading-relaxed mb-4">
          {l(lang, "Help build a free, multilingual public service for families after the loss of a loved one.", "Aidez-nous à créer un service public gratuit et multilingue pour accompagner les familles après la perte d’un proche.", "Helfen Sie mit, einen kostenlosen, mehrsprachigen öffentlichen Dienst für Familien nach dem Verlust eines nahestehenden Menschen aufzubauen.")}
        </p>
        <p className="text-base text-calm-blue-500 leading-relaxed mb-12">
          {l(lang, "Clarvia is in its build and validation phase. Your early support helps us lay the foundation: reviewing official sources, translating guidance, improving accessibility, and building trustworthy workflows that families can use for free.", "Clarvia est actuellement en phase de développement et de validation. Votre soutien précoce nous aide à poser les bases du projet : vérifier les sources officielles, traduire les informations, améliorer l’accessibilité et mettre en place des parcours fiables que les familles pourront utiliser gratuitement.", "Clarvia befindet sich derzeit in der Entwicklungs- und Validierungsphase. Ihre frühe Unterstützung hilft uns, das Fundament zu legen: offizielle Quellen zu prüfen, Informationen zu übersetzen, die Barrierefreiheit zu verbessern und vertrauenswürdige Abläufe aufzubauen, die Familien kostenlos nutzen können.")}
        </p>

        {/* B. What your donation funds */}
        <section className="mb-12" aria-labelledby="funds-heading">
          <h2
            id="funds-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-2"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "What your donation funds", "À quoi sert votre don", "Was Ihre Spende ermöglicht")}
          </h2>
          <p className="text-sm text-calm-blue-500 mb-4">
            {l(lang,
              "Every donation goes directly toward building a practical, free public service that reduces confusion and stress after a loss.",
              "Chaque don contribue directement à la construction d'un service public gratuit et pratique qui aide les familles après la perte d'un proche.",
              "Jede Spende fliesst direkt in den Aufbau eines kostenlosen öffentlichen Dienstes, der Familien nach dem Verlust eines Angehörigen unterstützt."
            )}
          </p>

          {/* Funding goal progress */}
          <div className="glass-panel p-5 mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-sm font-semibold text-calm-blue-800">
                {l(lang, "Current goal", "Objectif actuel", "Aktuelles Ziel")}
              </p>
              <p className="text-xs text-calm-blue-400">
                {l(lang, "Updated weekly", "Mis à jour chaque semaine", "Wöchentlich aktualisiert")}
              </p>
            </div>
            <div className="w-full h-3 rounded-full bg-calm-blue-100 overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((3800 / 10000) * 100, 100)}%`,
                  background: "linear-gradient(135deg, #4479e1, #7c6cbb)",
                }}
              />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-semibold text-calm-blue-800">
                &euro;3,800 <span className="text-sm font-normal text-calm-blue-400">{l(lang, "raised", "collectés", "gesammelt")}</span>
              </p>
              <p className="text-sm text-calm-blue-500">
                {l(lang, "of \u20AC10,000 goal", "sur un objectif de 10 000 \u20AC", "von 10.000 \u20AC")}
              </p>
            </div>
            <p className="text-xs text-calm-blue-400 mt-2">
              {l(lang,
                "To finalise the prototype, complete translations in English, French and German, and reach full accessibility standards.",
                "Pour finaliser le prototype, compléter les traductions en anglais, français et allemand, et atteindre les standards d'accessibilité.",
                "Um den Prototyp fertigzustellen, die Übersetzungen auf Englisch, Französisch und Deutsch abzuschliessen und die Barrierefreiheitsstandards zu erreichen."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {getFundItems(lang).map((item) => (
              <div
                key={item.label}
                className="glass-panel p-4 text-center hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="w-12 h-12 mx-auto bg-white/50 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/60">
                  <span className="text-2xl block" aria-hidden="true">{item.icon}</span>
                </div>
                <p className="text-sm font-medium text-calm-blue-700">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* C. Donation amounts */}
        <section className="mb-12" aria-labelledby="amounts-heading">
          <h2
            id="amounts-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Choose an amount", "Choisissez un montant", "Betrag auswählen")}
          </h2>

          {/* Tab toggle */}
          <div className="flex gap-1 p-1 rounded-full bg-calm-blue-100/60 mb-3 w-fit">
            <button
              onClick={() => { setTab("monthly"); setSelectedAmount(25); setIsCustom(false); setCustomAmount(""); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === "monthly"
                  ? "bg-white text-calm-blue-800 shadow-sm"
                  : "text-calm-blue-500 hover:text-calm-blue-700"
              }`}
            >
              {l(lang, "Monthly (recommended)", "Mensuel (recommandé)", "Monatlich (empfohlen)")}
            </button>
            <button
              onClick={() => { setTab("onetime"); setSelectedAmount(75); setIsCustom(false); setCustomAmount(""); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === "onetime"
                  ? "bg-white text-calm-blue-800 shadow-sm"
                  : "text-calm-blue-500 hover:text-calm-blue-700"
              }`}
            >
              {l(lang, "One-time", "Ponctuel", "Einmalig")}
            </button>
          </div>
          <p className="text-sm text-calm-blue-400 mb-6">
            {tab === "monthly"
              ? l(lang,
                  "Recurring donations help us plan and move faster.",
                  "Les dons récurrents nous aident à planifier et à avancer plus vite.",
                  "Regelmäßige Spenden helfen uns, besser zu planen und schneller voranzukommen."
                )
              : l(lang,
                  "Prefer to give once? You can also make a one-time contribution of any amount.",
                  "Vous préférez donner une seule fois ? Vous pouvez faire un don ponctuel du montant de votre choix.",
                  "Lieber einmalig spenden? Sie können auch einen einmaligen Beitrag in beliebiger Höhe leisten."
                )
            }
          </p>

          {/* Tier cards */}
          <div className={`grid gap-3 grid-cols-2`}>
            {tiers.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => { setSelectedAmount(tier.amount); setIsCustom(false); }}
                className={`glass-panel p-4 text-left cursor-pointer transition-all ${
                  !isCustom && selectedAmount === tier.amount
                    ? "ring-2 ring-calm-lilac-400 border-calm-lilac-300"
                    : "hover:ring-1 hover:ring-calm-blue-200"
                }`}
              >
                <p className="text-2xl font-semibold text-calm-blue-800 mb-1">
                  &euro;{tier.amount.toLocaleString()}
                  {tab === "monthly" && (
                    <span className="text-sm font-normal text-calm-blue-400">
                      {l(lang, "/mo", "/mois", "/Monat")}
                    </span>
                  )}
                </p>
                <p className="text-sm text-calm-blue-500">
                  {tier.label}
                </p>
              </button>
            ))}
            {/* Custom amount */}
            <button
              onClick={() => setIsCustom(true)}
              className={`glass-panel p-4 text-left cursor-pointer transition-all col-span-2 ${
                isCustom
                  ? "ring-2 ring-calm-lilac-400 border-calm-lilac-300"
                  : "hover:ring-1 hover:ring-calm-blue-200"
              }`}
            >
              {isCustom ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-calm-blue-800">&euro;</span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    autoFocus
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={l(lang, "Enter amount", "Saisir un montant", "Betrag eingeben")}
                    className="w-full text-2xl font-semibold text-calm-blue-800 bg-transparent outline-none placeholder:text-calm-blue-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {tab === "monthly" && customAmount && (
                    <span className="text-sm font-normal text-calm-blue-400 whitespace-nowrap">{l(lang, "/mo", "/mois", "/Monat")}</span>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-semibold text-calm-blue-800 mb-1">
                  {l(lang, "Custom amount", "Montant libre", "Freier Betrag")}
                </p>
              )}
              <p className="text-sm text-calm-blue-500 mt-1">
                {l(lang, "Choose your own amount", "Choisissez votre propre montant", "W\u00e4hlen Sie Ihren eigenen Betrag")}
              </p>
            </button>
          </div>

          {/* Pay with card button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleCardPayment}
              disabled={isProcessing || !isValidAmount}
              className={`btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg ${
                isProcessing || !isValidAmount ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing
                ? l(lang, "Redirecting...", "Redirection...", "Weiterleitung...")
                : isValidAmount
                  ? l(lang,
                      `Donate \u20AC${activeAmount.toLocaleString()}${tab === "monthly" ? "/mo" : ""} by card`,
                      `Donner ${activeAmount.toLocaleString()} \u20AC${tab === "monthly" ? "/mois" : ""} par carte`,
                      `${activeAmount.toLocaleString()} \u20AC${tab === "monthly" ? "/Monat" : ""} per Karte spenden`
                    )
                  : l(lang, "Enter an amount", "Saisir un montant", "Betrag eingeben")
              }
            </button>
          </div>

          {/* Manage existing subscription */}
          <div className="mt-4 text-center">
            <p className="text-sm text-calm-blue-400">
              {l(lang, "Already a monthly supporter?", "Vous êtes déjà donateur mensuel ?", "Sie unterstützen uns bereits monatlich?")}{" "}
              <a
                href="https://billing.stripe.com/p/login/cNieVd5j90I9dOs2d3b3q00"
                target="_blank"
                rel="noopener noreferrer"
                className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors"
              >
                {l(lang, "Manage your donation", "Gérer votre don", "Spende verwalten")}
              </a>
            </p>
          </div>
        </section>

        {/* D. Bank transfer */}
        <section className="mb-12" aria-labelledby="bank-heading">
          <h2
            id="bank-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Bank transfer", "Virement bancaire", "Banküberweisung")}
          </h2>
          <div className="donation-iban">
            <div className="space-y-1.5 text-sm">
              <p><span className="font-semibold text-calm-blue-700">IBAN:</span> <span className="tracking-wide">LT09 3500 0100 1903 8740</span></p>
              <p><span className="font-semibold text-calm-blue-700">{l(lang, "Account holder:", "Titulaire du compte :", "Kontoinhaber:")} </span>Clarvia ASBL</p>
              <p><span className="font-semibold text-calm-blue-700">RCS:</span> F15680</p>
              <p><span className="font-semibold text-calm-blue-700">BIC/SWIFT:</span> EVIULT2VXXX</p>
              <p><span className="font-semibold text-calm-blue-700">{l(lang, "Bank:", "Banque :", "Bank:")} </span>Paysera LT, UAB</p>
              <p><span className="font-semibold text-calm-blue-700">{l(lang, "Bank address:", "Adresse de la banque :", "Bankadresse:")} </span>Pilait&#x117;s pr. 16, Vilnius, LT-04352, {l(lang, "Lithuania", "Lituanie", "Litauen")}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-calm-blue-200/50 space-y-2">
              <p className="text-xs text-calm-blue-500">
                {l(lang, "Please use your name or email as the payment reference so we can send an acknowledgement.", "Veuillez indiquer votre nom ou votre adresse e-mail comme référence de paiement afin que nous puissions vous envoyer un accusé de réception.", "Bitte geben Sie Ihren Namen oder Ihre E-Mail-Adresse als Zahlungsreferenz an, damit wir Ihnen eine Bestätigung senden können.")}
              </p>
              <p className="text-xs text-calm-blue-400">
                {l(lang, "Please do not include sensitive family details in the payment reference.", "Veuillez ne pas inclure d’informations familiales sensibles dans la référence du paiement.", "Bitte geben Sie keine sensiblen familiären Informationen in der Zahlungsreferenz an.")}
              </p>
            </div>
          </div>
        </section>

        {/* E. GitHub Sponsors */}
        <section className="mb-12" aria-labelledby="github-heading">
          <h2
            id="github-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Sponsor on GitHub", "Sponsoriser sur GitHub", "Auf GitHub sponsern")}
          </h2>
          <div className="glass-panel p-6">
            <p className="text-sm text-calm-blue-600 leading-relaxed mb-2">
              {l(lang, "Support Clarvia's open-source public-interest infrastructure through GitHub Sponsors.", "Soutenez l’infrastructure open source d’intérêt public de Clarvia via GitHub Sponsors.", "Unterstützen Sie Clarvias gemeinwohlorientierte Open-Source-Infrastruktur über GitHub Sponsors.")}
            </p>
            <p className="text-sm text-calm-blue-500 leading-relaxed mb-4">
              {l(lang, "GitHub sponsorship helps fund the source-backed workflow data, validation work, documentation, and maintenance behind Clarvia.", "Le sponsoring GitHub aide à financer les données de parcours fondées sur des sources, le travail de validation, la documentation et la maintenance de Clarvia.", "GitHub-Sponsoring hilft dabei, die quellenbasierten Ablaufdaten, die Validierungsarbeit, die Dokumentation und die laufende Pflege von Clarvia zu finanzieren.")}
            </p>
            <a
              href="https://github.com/sponsors/clarvia-org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              {l(lang, "Sponsor Clarvia on GitHub", "Sponsoriser Clarvia sur GitHub", "Clarvia auf GitHub sponsern")}
            </a>
          </div>
        </section>

        {/* F. Why support Clarvia */}
        <section className="mb-12" aria-labelledby="trust-heading">
          <h2
            id="trust-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Why support Clarvia", "Pourquoi soutenir Clarvia", "Warum Clarvia unterstützen")}
          </h2>
          <ul className="space-y-3">
            {getTrustItems(lang).map((item) => (
              <li
                key={item.title}
                className="flex gap-3 items-start p-4 rounded-xl bg-white/40 border border-calm-blue-100 hover:bg-white/60 transition-all hover:shadow-sm"
              >
                <span className="governance-check mt-0.5" aria-hidden="true">{"\u2713"}</span>
                <div>
                  <p className="text-sm font-semibold text-calm-blue-800">{item.title}</p>
                  <p className="text-sm text-calm-blue-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* G. Corporate sponsors */}
        <section className="mb-12" aria-labelledby="corporate-heading">
          <h2
            id="corporate-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Corporate sponsors", "Partenaires entreprises", "Unternehmenssponsoren")}
          </h2>
          <div className="glass-panel p-6">
            <p className="text-sm text-calm-blue-600 leading-relaxed mb-3">
              {l(lang, "Companies supporting Clarvia help build public-interest infrastructure for families after the loss of a loved one.", "Les entreprises qui soutiennent Clarvia contribuent à créer une infrastructure d’intérêt public pour les familles après la perte d’un proche.", "Unternehmen, die Clarvia unterstützen, helfen beim Aufbau einer gemeinwohlorientierten Infrastruktur für Familien nach dem Verlust eines nahestehenden Menschen.")}
            </p>
            <p className="text-sm text-calm-blue-500 leading-relaxed mb-4">
              {l(lang, "Sponsors may receive acknowledgement, but sponsorship does not provide influence over guidance, access to user data, referrals, preferential placement, exclusivity, or endorsement.", "Les sponsors peuvent être remerciés publiquement, mais leur soutien ne leur donne aucune influence sur les conseils fournis, aucun accès aux données des utilisateurs, aucune recommandation, aucun placement préférentiel, aucune exclusivité et aucune forme d’approbation.", "Sponsoren können öffentlich genannt werden, erhalten durch ihr Sponsoring jedoch keinen Einfluss auf die Inhalte, keinen Zugang zu Nutzerdaten, keine Vermittlungen, keine bevorzugte Platzierung, keine Exklusivität und keine Empfehlung.")}
            </p>
            <a
              href={`/${lang}/contact`}
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              {l(lang, "Get in touch", "Nous contacter", "Kontakt aufnehmen")}
            </a>
          </div>
        </section>

        {/* H. Privacy */}
        <section className="mb-8" aria-labelledby="privacy-heading">
          <h2
            id="privacy-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Privacy", "Confidentialité", "Datenschutz")}
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-calm-blue-500 leading-relaxed">
              {l(lang, "Your donation supports Clarvia ASBL's mission.", "Votre don soutient la mission de Clarvia ASBL.", "Ihre Spende unterstützt die Mission von Clarvia ASBL.")}
            </p>
            <p className="text-sm text-calm-blue-500 leading-relaxed">
              {l(lang, "We collect only the information needed to process your gift, send an acknowledgement, and maintain basic donor records. Donor records are kept separate from any future family-support usage data.", "Nous collectons uniquement les informations nécessaires au traitement de votre don, à l’envoi d’un accusé de réception et à la tenue de registres donateurs de base. Les registres donateurs sont conservés séparément de toute future donnée liée à l’utilisation des services d’accompagnement des familles.", "Wir erfassen nur die Informationen, die erforderlich sind, um Ihre Spende zu bearbeiten, eine Bestätigung zu senden und grundlegende Spenderunterlagen zu führen. Spenderdaten werden getrennt von möglichen künftigen Nutzungsdaten aus der Familienunterstützung aufbewahrt.")}
            </p>
            <p className="text-sm text-calm-blue-400 leading-relaxed">
              {l(lang, "Please do not include personal family details, health information, or details about a loss in donation references or messages.", "Veuillez ne pas inclure de détails personnels sur votre famille, d’informations de santé ou de détails concernant un décès dans les références ou messages liés à votre don.", "Bitte geben Sie in Zahlungsreferenzen oder Nachrichten zu Ihrer Spende keine persönlichen Familiendetails, Gesundheitsinformationen oder Details zu einem Todesfall an.")}
            </p>
          </div>
        </section>

        {/* I. Donation acknowledgement */}
        <section className="mb-12" aria-labelledby="receipt-heading">
          <div className="p-4 rounded-xl bg-calm-blue-50/60 border border-calm-blue-100">
            <p className="text-xs font-semibold text-calm-blue-600 mb-1">
              {l(lang, "Donation acknowledgement", "Accusé de réception du don", "Spendenbestätigung")}
            </p>
            <p className="text-xs text-calm-blue-500 leading-relaxed">
              {l(lang, "Clarvia ASBL does not currently issue tax certificates for donations. Any acknowledgement we send is a confirmation of support, not a tax certificate.", "Clarvia ASBL ne délivre actuellement pas de certificats fiscaux pour les dons. Tout accusé de réception envoyé constitue une confirmation de soutien, et non un certificat fiscal.", "Clarvia ASBL stellt derzeit keine steuerlichen Spendenbescheinigungen aus. Jede von uns gesendete Bestätigung ist eine Bestätigung Ihrer Unterstützung, keine steuerliche Bescheinigung.")}
            </p>
          </div>
        </section>

      </main>

      <FooterSection lang={lang} />
    </>
  );
}
