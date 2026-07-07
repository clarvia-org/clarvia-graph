"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { type Lang, l } from "@/lib/i18n";
import { headlineStyle, TESTIMONIALS } from "../data";
import FooterSection from "../sections/FooterSection";
import Header from "@/components/Header";
import Image from "next/image";

const STRIPE_BILLING_PORTAL_URL =
  process.env.NEXT_PUBLIC_STRIPE_BILLING_PORTAL_URL ??
  "https://billing.stripe.com/p/login/cNieVd5j90I9dOs2d3b3q00";

const CURRENT_RAISED = 3800;
const FUNDING_GOAL = 10000;

/* -- Donation tier data -- */

function getMonthlyTiers(lang: Lang) {
  return [
    { amount: 10, label: l(lang, "Keep the service free", "Aider à garder le service gratuit", "Helfen, den Dienst kostenlos zu halten", "De Service gratis halen") },
    { amount: 25, label: l(lang, "Support multilingual maintenance", "Soutenir la maintenance multilingue", "Mehrsprachige Pflege unterstützen", "Déi méisproocheg Fleeg ënnerstëtzen"), default: true },
    { amount: 50, label: l(lang, "Fund source-backed updates", "Financer les mises à jour fondées sur des sources officielles", "Quellenbasierte Aktualisierungen finanzieren", "Aktualiséierungen op Basis vun offiziellen Quelle finanzéieren") },
    { amount: 100, label: l(lang, "Founding Circle supporter", "Membre du Cercle fondateur", "Unterstützer im Gründerkreis", "Ënnerstëtzer am Grënnerkrees") },
  ];
}

function getOnetimeTiers(lang: Lang) {
  return [
    { amount: 35, label: l(lang, "Help maintain official-source references", "Aider à maintenir les références aux sources officielles", "Bei der Pflege offizieller Quellenverweise helfen", "Hëllefen, Referenzen op offiziell Quellen aktuell ze halen") },
    { amount: 75, label: l(lang, "Support workflow validation", "Soutenir la validation des parcours", "Die Validierung der Abläufe unterstützen", "D'Validéierung vun den Ofleef ënnerstëtzen") },
    { amount: 150, label: l(lang, "Fund translation and accessibility work", "Financer le travail de traduction et d'accessibilité", "Übersetzungs- und Barrierefreiheitsarbeit finanzieren", "Iwwersetzungs- an Accessibilitéitsaarbecht finanzéieren") },
    { amount: 500, label: l(lang, "Support a public-service module", "Soutenir un module de service public", "Ein gemeinnütziges Servicemodul unterstützen", "E Modul am ëffentlechen Interessi ënnerstëtzen") },
  ];
}

/* -- What donations fund -- */

function getFundItems(lang: Lang) {
  return [
    { icon: "\u{1F4C4}", label: l(lang, "keep the checklists free for everyone", "garder les listes de démarches gratuites pour tous", "die Checklisten für alle kostenlos halten", "d'Checklëschte fir jiddereen gratis halen") },
    { icon: "\u{1F5A5}\uFE0F", label: l(lang, "explain difficult admin tasks in plain language", "expliquer les démarches administratives complexes dans un langage simple", "schwierige administrative Aufgaben in verständlicher Sprache erklären", "schwiereg administrativ Démarchen an einfacher Sprooch erklären") },
    { icon: "\u{1F30D}", label: l(lang, "translate the guidance into more languages", "traduire les conseils dans plus de langues", "die Orientierungshilfen in weitere Sprachen übersetzen", "d'Orientéierung an nach méi Sproochen iwwersetzen") },
    { icon: "\u267F", label: l(lang, "make the resources easier to read and use", "rendre les ressources plus faciles à lire et à utiliser", "die Materialien einfacher zu lesen und zu nutzen machen", "d'Ressourcen méi einfach liesbar a benotzbar maachen") },
    { icon: "\u2713", label: l(lang, "keep the information reviewed and up to date", "maintenir les informations vérifiées et à jour", "die Informationen geprüft und auf dem neuesten Stand halten", "d'Informatiounen iwwerpréift an aktuell halen") },
    { icon: "\u{1F91D}", label: l(lang, "help more families find support when they need it", "aider plus de familles à trouver du soutien au moment où elles en ont besoin", "mehr Familien helfen, Unterstützung zu finden, wenn sie sie brauchen", "méi Familljen hëllefen, Ënnerstëtzung ze fannen, wann se se brauchen") },
  ];
}

/* -- Thank-you banner (needs Suspense for useSearchParams) -- */

function ThankYouBanner({ lang }: { lang: Lang }) {
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!donated || !sessionId) return;

    // Check if already tracked to deduplicate
    const trackingKey = `clarvia-donation-tracked-${sessionId}`;
    if (localStorage.getItem(trackingKey)) return;

    let isMounted = true;

    // Fetch session verification
    fetch(`/api/donate?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        // Ensure payment status is paid/complete
        if (data.payment_status === "paid" || data.status === "complete") {
          // Fire GA4 Event
          if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "donation_complete", {
              event_category: "engagement",
              event_label: "Stripe Donation Success",
              value: data.amount || undefined,
              currency: data.currency || "EUR",
              transaction_id: sessionId,
            });

            // TODO: When Google Ads launches:
            // 1. Add the real AW destination ID to the gtag config.
            // 2. Create a Google Ads donation conversion action.
            // 3. Add the Ads conversion event with send_to: 'AW-.../...'
            // 4. Reuse the same transaction_id (sessionId) for deduplication.
            // 5. Test in Google Tag Assistant and Google Ads diagnostics.
          }

          // Save tracking state to prevent duplicate hits
          try {
            localStorage.setItem(trackingKey, "true");
          } catch {}
        }
      })
      .catch((err) => {
        console.error("Donation verification error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [donated, sessionId]);

  if (!donated) return null;

  return (
    <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
      <p className="text-green-800 font-medium">
        {l(lang, "Thank you for your support! You will receive a receipt from Stripe at the email address you provided.", "Merci pour votre soutien ! Vous recevrez un reçu de Stripe à l'adresse e-mail que vous avez indiquée.", "Vielen Dank für Ihre Unterstützung! Sie erhalten eine Quittung von Stripe an die von Ihnen angegebene E-Mail-Adresse.", "Merci fir Är Ënnerstëtzung! Dir kritt eng Quittung vu Stripe op déi E-Mail-Adress, déi Dir uginn hutt.")}
      </p>
    </div>
  );
}

export default function SupportPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";
  const [tab, setTab] = useState<"monthly" | "onetime">("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

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

  // Goal progress animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((CURRENT_RAISED / FUNDING_GOAL) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      alert(
        l(lang, "Could not copy to clipboard. Please copy manually.", "Impossible de copier dans le presse-papiers. Veuillez copier manuellement.", "Konnte nicht in die Zwischenablage kopieren. Bitte manuell kopieren.", "Konnt net an de Clipboard kopéiert ginn. Kopéiert et wgl. manuell.")
      );
    }
  };

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
        alert(data.error || l(lang, "Something went wrong. Please try bank transfer instead.", "Une erreur est survenue. Veuillez plutôt effectuer un virement bancaire.", "Etwas ist schiefgelaufen. Bitte nutzen Sie stattdessen eine Banküberweisung.", "Eppes ass schifgaangen. Probéiert wgl. amplaz eng Bankiwwerweisung."));
        setIsProcessing(false);
      }
    } catch {
      alert(l(lang, "Could not connect to the payment service. Please try bank transfer instead.", "Impossible de se connecter au service de paiement. Veuillez plutôt effectuer un virement bancaire.", "Die Verbindung zum Zahlungsdienst konnte nicht hergestellt werden. Bitte nutzen Sie stattdessen eine Banküberweisung.", "D'Verbindung mam Bezuelservice konnt net hiergestallt ginn. Probéiert wgl. amplaz eng Bankiwwerweisung."));
      setIsProcessing(false);
    }
  }

  return (
    <>
      <Header lang={lang} />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        {/* Thank-you banner after successful donation */}
        <Suspense fallback={null}>
          <ThankYouBanner lang={lang} />
        </Suspense>

        {/* 2-Column Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: Hero text, image, progress bar, what donations fund */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4"
                style={headlineStyle}
              >
                {l(lang, "Support Clarvia", "Soutenir Clarvia", "Clarvia unterstützen", "Clarvia ënnerstëtzen")}
              </h1>
              <p className="text-lg text-calm-blue-600 leading-relaxed font-semibold">
                {l(lang, "When a loved one dies, families are often expected to handle paperwork, institutions, deadlines, and cross-border questions while they are still grieving.", "Lorsqu’un proche décède, les familles doivent souvent s’occuper de démarches administratives, contacter des institutions, respecter des délais et parfois gérer des questions entre plusieurs pays, alors même qu’elles traversent une période difficile.", "Wenn ein geliebter Mensch stirbt, müssen Familien oft Formulare, Behörden, Fristen und manchmal auch grenzüberschreitende Fragen klären, während sie noch mitten in der Trauer stehen.", "Wann een nooste Mënsch stierft, gi Familljen dacks erwaart, sech ëm Pabeieren, Institutiounen, Fristen a grenziwwerschreidend Froen ze këmmeren, wärend si nach an der Trauer sinn.")}
              </p>
              <p className="text-base text-calm-blue-500 leading-relaxed">
                {l(lang, "The information exists, but it is scattered across official websites, different jurisdictions, and unclear procedures. Clarvia turns that complexity into free, open-source checklists that show what to do first, what each step unlocks, and what deadlines matter most.", "Les informations existent, mais elles sont dispersées sur des sites officiels, dans différentes administrations et dans des procédures souvent peu claires. Clarvia transforme cette complexité en listes d’étapes gratuites et open source, qui expliquent quoi faire en premier, quelles démarches en débloquent d’autres et quels délais sont les plus importants.", "Die Informationen gibt es, aber sie sind über offizielle Websites, verschiedene Zuständigkeiten und oft unklare Abläufe verstreut. Clarvia macht daraus kostenlose Open-Source-Checklisten, die zeigen, was zuerst zu tun ist, welche Schritte andere ermöglichen und welche Fristen besonders wichtig sind.", "D'Informatioune ginn et, mee se sinn iwwer offiziell Websäiten, verschidde Verwaltungen an dacks onkloer Prozedure verstreet. Clarvia mécht aus där Komplexitéit gratis Open-Source-Checklëschten, déi weisen, wat als Éischt ze maachen ass, wéi eng Schrëtt aner Démarchen erméiglechen a wéi eng Fristen am wichtegste sinn.")}
              </p>
              <p className="text-base text-calm-blue-500 leading-relaxed">
                {l(lang, "Your donation helps make this practical guidance available to everyone, not only to those who can afford lawyers, consultants, or private support.", "Votre don nous aide à rendre ces informations pratiques accessibles à toutes et tous, pas seulement aux personnes qui peuvent faire appel à des avocats, des consultants ou un accompagnement privé.", "Ihre Spende hilft dabei, diese praktische Orientierung für alle zugänglich zu machen, nicht nur für Menschen, die sich Anwälte, Berater oder private Unterstützung leisten können.", "Ären Don hëlleft, dës praktesch Orientéierung fir jiddereen zougänglech ze maachen – net nëmme fir Leit, déi sech Affekoten, Beroder oder privat Ënnerstëtzung leeschte kënnen.")}
              </p>
              <p className="text-base text-calm-blue-500 leading-relaxed italic">
                {l(lang, "Most of us will face this responsibility at some point. No one should have to figure it out alone.", "La plupart d’entre nous devront un jour faire face à ces responsabilités. Personne ne devrait avoir à s’y retrouver seul.", "Die meisten von uns werden irgendwann vor dieser Aufgabe stehen. Niemand sollte damit allein sein.", "Déi meescht vun eis kommen iergendwann an déi Situatioun. Keen soll dat eleng erausfanne mussen.")}
              </p>
            </div>

            {/* Hero Image */}
            <div className="overflow-hidden rounded-2xl shadow-md border border-white/60 bg-slate-100">
              <Image
                src="/support-hero.webp"
                alt={l(lang, "Clarvia Support", "Soutien Clarvia", "Clarvia Unterstützung", "Clarvia ënnerstëtzen")}
                width={800}
                height={450}
                className="w-full h-auto object-cover aspect-[16/9]"
              />
            </div>

            {/* Funding goal progress */}
            <div className="glass-panel p-5">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-sm font-semibold text-calm-blue-800">
                  {l(lang, "Current goal", "Objectif actuel", "Aktuelles Ziel", "Aktuellt Zil")}
                </p>
                <p className="text-xs text-calm-blue-400">
                  {l(lang, "Updated weekly", "Mis à jour chaque semaine", "Wöchentlich aktualisiert", "All Woch aktualiséiert")}
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
                  &euro;3,800 <span className="text-sm font-normal text-calm-blue-400">{l(lang, "raised", "collectés", "gesammelt", "gesammelt")}</span>
                </p>
                <p className="text-sm text-calm-blue-500">
                  {l(lang, "of \u20AC10,000 goal", "sur un objectif de 10 000 \u20AC", "von 10.000 \u20AC", "vun engem Zil vun 10.000 €")}
                </p>
              </div>
            </div>

            {/* What your donation funds */}
            <div>
              <h2
                className="text-xl font-semibold text-calm-blue-800 mb-4"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(lang, "Your donation helps us:", "Votre don nous aide à :", "Ihre Spende hilft uns:", "Ären Don hëlleft eis:")}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {getFundItems(lang).map((item) => (
                  <div
                    key={item.label}
                    className="glass-panel p-4 text-center hover:scale-[1.01] transition-transform duration-200"
                  >
                    <div className="w-10 h-10 mx-auto bg-white/50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-white/60">
                      <span className="text-xl block" aria-hidden="true">{item.icon}</span>
                    </div>
                    <p className="text-xs font-semibold text-calm-blue-700">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Donation Selector Card */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="glass-panel p-6 border border-white/80 shadow-lg">
              <h2
                className="text-xl font-semibold text-calm-blue-800 mb-4"
                style={{ fontFamily: headlineStyle.fontFamily }}
              >
                {l(lang, "Select Donation Amount", "Sélectionner le montant", "Spendenbetrag wählen", "Betrag vum Don auswielen")}
              </h2>

              {/* Tab toggle */}
              <div className="flex gap-1 p-1 rounded-full bg-calm-blue-100/60 mb-4 w-full">
                <button
                  onClick={() => { setTab("monthly"); setSelectedAmount(25); setIsCustom(false); setCustomAmount(""); }}
                  className={`flex-1 text-center py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    tab === "monthly"
                      ? "bg-white text-calm-blue-800 shadow-sm"
                      : "text-calm-blue-500 hover:text-calm-blue-700"
                  }`}
                >
                  {l(lang, "Monthly", "Mensuel", "Monatlich", "All Mount")}
                </button>
                <button
                  onClick={() => { setTab("onetime"); setSelectedAmount(75); setIsCustom(false); setCustomAmount(""); }}
                  className={`flex-1 text-center py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    tab === "onetime"
                      ? "bg-white text-calm-blue-800 shadow-sm"
                      : "text-calm-blue-500 hover:text-calm-blue-700"
                  }`}
                >
                  {l(lang, "One-time", "Ponctuel", "Einmalig", "Eng Kéier")}
                </button>
              </div>

              {/* Tier cards */}
              <div className="grid gap-3 grid-cols-2 mb-4">
                {tiers.map((tier) => (
                  <button
                    key={tier.amount}
                    onClick={() => { setSelectedAmount(tier.amount); setIsCustom(false); }}
                    className={`glass-panel p-3 text-left cursor-pointer transition-all ${
                      !isCustom && selectedAmount === tier.amount
                        ? "ring-2 ring-calm-lilac-400 border-calm-lilac-300 bg-white"
                        : "hover:ring-1 hover:ring-calm-blue-200"
                    }`}
                  >
                    <p className="text-xl font-semibold text-calm-blue-800">
                      &euro;{tier.amount.toLocaleString()}
                      {tab === "monthly" && (
                        <span className="text-xs font-normal text-calm-blue-400">
                          {l(lang, "/mo", "/mois", "/Monat", "/Mount")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-calm-blue-500 mt-1 leading-snug">
                      {tier.label}
                    </p>
                  </button>
                ))}

                {/* Custom amount */}
                <button
                  onClick={() => setIsCustom(true)}
                  className={`glass-panel p-3 text-left cursor-pointer transition-all col-span-2 ${
                    isCustom
                      ? "ring-2 ring-calm-lilac-400 border-calm-lilac-300 bg-white"
                      : "hover:ring-1 hover:ring-calm-blue-200"
                  }`}
                >
                  {isCustom ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-calm-blue-800">&euro;</span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="1"
                        autoFocus
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={l(lang, "Enter amount", "Saisir un montant", "Betrag eingeben", "Betrag aginn")}
                        className="w-full text-xl font-semibold text-calm-blue-800 bg-transparent outline-none placeholder:text-calm-blue-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {tab === "monthly" && customAmount && (
                        <span className="text-xs font-normal text-calm-blue-400 whitespace-nowrap">{l(lang, "/mo", "/mois", "/Monat", "/Mount")}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xl font-semibold text-calm-blue-800">
                      {l(lang, "Custom amount", "Montant libre", "Freier Betrag", "Fräie Betrag")}
                    </p>
                  )}
                  <p className="text-xs text-calm-blue-500 mt-1">
                    {l(lang, "Choose your own amount", "Choisissez votre propre montant", "Wählen Sie Ihren eigenen Betrag", "Wielt Ären eegene Betrag")}
                  </p>
                </button>
              </div>

              {/* Pay with card button */}
              <div className="text-center">
                <button
                  onClick={handleCardPayment}
                  disabled={isProcessing || !isValidAmount}
                  className={`btn-primary w-full py-3.5 text-base flex justify-center items-center gap-2 ${
                    isProcessing || !isValidAmount ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing
                    ? l(lang, "Redirecting...", "Redirection...", "Weiterleitung...", "Weiderleedung...")
                    : isValidAmount
                      ? l(lang, `Donate \u20AC${activeAmount.toLocaleString()}${tab === "monthly" ? "/mo" : ""}`, `Donner ${activeAmount.toLocaleString()} \u20AC${tab === "monthly" ? "/mois" : ""}`, `${activeAmount.toLocaleString()} \u20AC${tab === "monthly" ? "/Monat" : ""} spenden`, `${activeAmount.toLocaleString()} \\u20AC${tab === "monthly" ? "/Mount" : ""} spenden`)
                      : l(lang, "Enter an amount", "Saisir un montant", "Betrag eingeben", "Betrag aginn")
                  }
                </button>
              </div>

              {/* Manage existing subscription */}
              <div className="mt-4 text-center">
                <p className="text-xs text-calm-blue-400">
                  {l(lang, "Already a monthly supporter?", "Vous êtes déjà donateur mensuel ?", "Sie unterstützen uns bereits monatlich?", "Ënnerstëtzt Dir eis schonn all Mount?")}{" "}
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
            </div>

            {/* Bank transfer details card */}
            <div className="glass-panel p-4 border border-white/60 text-center">
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="w-full text-sm font-medium text-calm-blue-600 hover:text-calm-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer outline-none"
              >
                <span>{showBankDetails ? "▼" : "▶"}</span>
                {l(lang, "Prefer a bank transfer?", "Vous préférez un virement bancaire ?", "Lieber per Banküberweisung spenden?", "Léiwer per Bankiwwerweisung?")}
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
                        {copiedField === "iban" ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!") : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
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
                        {copiedField === "bic" ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!") : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
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
                        {copiedField === "ref" ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!") : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren")}
                      </button>
                    </div>

                    {/* Text values */}
                    <div className="text-[11px] font-sans text-calm-blue-600 space-y-1 pt-1.5 border-t border-calm-blue-100/50">
                      <p><span className="font-medium text-calm-blue-500">{l(lang, "Holder:", "Titulaire :", "Inhaber:", "Kontohalter:")}</span> Clarvia ASBL</p>
                      <p><span className="font-medium text-calm-blue-500">RCS:</span> F15680</p>
                      <p><span className="font-medium text-calm-blue-500">{l(lang, "Bank:", "Banque :", "Bank:", "Bank:")}</span> Paysera LT, UAB</p>
                    </div>

                  </div>

                  <p className="text-[11px] text-calm-blue-400 mt-2.5 leading-snug">
                    {l(lang, "Use CLARVIA-SUPPORT and your email as the payment reference so we can send an acknowledgement.", "Utilisez CLARVIA-SUPPORT et votre e-mail comme référence pour nous permettre de vous envoyer un accusé de réception.", "Verwenden Sie CLARVIA-SUPPORT und Ihre E-Mail als Referenz, damit wir Ihnen eine Bestätigung senden können.", "Benotzt CLARVIA-SUPPORT an Är E-Mail als Bezuelreferenz, fir datt mir Iech eng Bestätegung schécke kënnen.")}
                  </p>
                </div>
              )}
            </div>

            {/* GitHub Sponsors card */}
            <div className="glass-panel p-5 border border-white/60">
              <h3 className="text-base font-semibold text-calm-blue-800 mb-2">
                {l(lang, "Sponsor on GitHub", "Sponsoriser sur GitHub", "Auf GitHub sponsern", "Op GitHub sponsoren")}
              </h3>
              <p className="text-xs text-calm-blue-500 leading-normal mb-3">
                {l(lang, "Sponsor Clarvia's open-source workflow data and core public infrastructure via GitHub Sponsors.", "Soutenez les données de parcours open source et l'infrastructure publique de Clarvia via GitHub Sponsors.", "Unterstützen Sie Clarvias Open-Source-Ablaufdaten und die öffentliche Infrastruktur über GitHub Sponsors.", "Sponsort Clarvia seng Open-Source-Workflow-Donnéeën an déi ëffentlech Kärinfrastruktur iwwer GitHub Sponsors.")}
              </p>
              <a
                href="https://github.com/sponsors/clarvia-org"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full py-2.5 text-sm inline-flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                {l(lang, "Sponsor on GitHub", "Sponsoriser sur GitHub", "Auf GitHub sponsern", "Op GitHub sponsoren")}
              </a>
            </div>

          </div>

        </div>

        {/* Testimonials block */}
        <section className="mt-16 pt-12 border-t border-calm-blue-200/50" aria-labelledby="testimonials-heading">
          <h2
            id="testimonials-heading"
            className="text-2xl font-semibold text-center text-calm-blue-800 mb-2"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Why people support our mission", "Pourquoi certains soutiennent notre mission", "Warum Menschen unsere Mission unterstützen", "Firwat Leit eis Missioun ënnerstëtzen")}
          </h2>
          <p className="text-sm text-calm-blue-500 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            {l(lang, "Clarvia is built around real feedback from families navigating administrative challenges after a loss.", "Clarvia est construit à partir de retours réels de familles confrontées aux démarches administratives après un décès.", "Clarvia basiert auf realem Feedback von Familien, die nach einem Verlust administrative Hürden bewältigen mussten.", "Clarvia baséiert op richtegem Feedback vu Familljen, déi no engem Doudesfall administrativ Hürde gemeeschtert hunn.")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-panel p-5 flex flex-col justify-between border border-white/60">
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

        {/* Corporate sponsors block */}
        <section className="mt-16 pt-12 border-t border-calm-blue-200/50" aria-labelledby="corporate-heading">
          <h2
            id="corporate-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "Corporate sponsors", "Partenaires entreprises", "Unternehmenssponsoren", "Firmesponsoren")}
          </h2>
          <div className="glass-panel p-6 border border-white/60">
            <p className="text-sm text-calm-blue-600 leading-relaxed mb-3">
              {l(lang, "Companies supporting Clarvia help build public-interest infrastructure for families after the loss of a loved one.", "Les entreprises qui soutiennent Clarvia contribuent à créer une infrastructure d’intérêt public pour les familles après la perte d’un proche.", "Unternehmen, die Clarvia unterstützen, helfen beim Aufbau einer gemeinwohlorientierten Infrastruktur für Familien nach dem Verlust eines nahestehenden Menschen.", "Entreprisen, déi Clarvia ënnerstëtzen, hëllefen eng Infrastruktur am ëffentlechen Interessi fir Familljen nom Verloscht vun engem nooste Mënsch opzebauen.")}
            </p>
            <p className="text-[11px] text-calm-blue-500 leading-relaxed mb-4">
              {l(lang, "Sponsors may receive acknowledgement, but sponsorship does not provide influence over guidance, access to user data, referrals, preferential placement, exclusivity, or endorsement.", "Les sponsors peuvent être remerciés publiquement, mais leur soutien ne leur donne aucune influence sur les conseils fournis, aucun accès aux données des utilisateurs, aucune recommandation, aucun placement préférentiel, aucune exclusivité et aucune forme d’approbation.", "Sponsoren können öffentlich genannt werden, erhalten durch ihr Sponsoring jedoch keinen Einfluss auf die Inhalte, keinen Zugang zu Nutzerdaten, keine Vermittlungen, keine bevorzugte Platzierung, keine Exklusivität und keine Empfehlung.", "Sponsore kënne fir hir Ënnerstëtzung genannt ginn, mee Sponsoring gëtt keen Afloss op d'Orientéierung, keen Zougang zu Benotzerdonnéeën, keng Recommandatiounen, keng bevorzugt Plazéierung, keng Exklusivitéit a keng Ënnerstëtzungsempfehlung.")}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              {l(lang, "Get in touch", "Nous contacter", "Kontakt aufnehmen", "Mellt Iech bei eis")}
            </Link>
          </div>
        </section>

        {/* Privacy, FAQ, and Legal Details (Moved lower/bottom alignment) */}
        <footer className="mt-16 pt-12 border-t border-calm-blue-200/50 space-y-6 text-xs text-calm-blue-500 leading-relaxed" aria-label="Transparency metadata">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Legal / nonprofit info */}
            <div>
              <h3 className="font-semibold text-calm-blue-700 mb-1.5">
                {l(lang, "Nonprofit Status & Registrations", "Statut d'association & Enregistrements", "Gemeinnützigkeit & Registrierungen", "Status als ASBL & Registréierungen")}
              </h3>
              <p>
                {l(lang, "Clarvia ASBL is registered as a non-profit association in Luxembourg under RCS F15680. We operate transparently and build open workflows as a public service.", "Clarvia ASBL est enregistrée comme association sans but lucratif au Luxembourg sous le numéro RCS F15680. Nous opérons en toute transparence et construisons des parcours ouverts au service du public.", "Clarvia ASBL ist in Luxemburg als gemeinnützige Vereinigung unter der Nummer RCS F15680 eingetragen. Wir arbeiten transparent und bauen offene Abläufe als öffentlichen Dienst auf.", "Clarvia ASBL ass zu Lëtzebuerg als Association sans but lucratif ënner der Nummer RCS F15680 registréiert. Mir schaffen transparent a bauen oppen Ofleef als ëffentleche Service op.")}
              </p>
            </div>

            {/* Donation receipts warning */}
            <div>
              <h3 className="font-semibold text-calm-blue-700 mb-1.5">
                {l(lang, "Donation Acknowledgements", "Accusés de réception des dons", "Spendenbestätigungen", "Bestätegunge fir Donen")}
              </h3>
              <p>
                {l(lang, "Clarvia ASBL does not currently issue tax certificates. Any confirmation we send is an acknowledgement of support, not a tax-deductible receipt.", "Clarvia ASBL ne délivre pas de certificats fiscaux actuellement. Toute confirmation envoyée est un accusé de réception de votre soutien, et non un reçu déductible des impôts.", "Clarvia ASBL stellt derzeit keine steuerlichen Spendenbescheinigungen aus. Jede Bestätigung ist eine Bestätigung Ihrer Unterstützung, keine abzugsfähige Bescheinigung.", "Clarvia ASBL stellt de Moment keng Steierzertifikater aus. All Bestätegung, déi mir schécken, ass eng Unerkennung vun Ärer Ënnerstëtzung, net eng steierlech ofsetzbar Quittung.")}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-calm-blue-100/50">

            {/* Privacy details */}
            <div>
              <h3 className="font-semibold text-calm-blue-700 mb-1.5">
                {l(lang, "Privacy & Donor Records", "Confidentialité & Dossiers donateurs", "Datenschutz & Spenderdaten", "Dateschutz & Donateurendonnéeën")}
              </h3>
              <p>
                {l(lang, "We collect only minimal records required for transaction processing via Stripe. Donation records are strictly isolated from any family support checklist usage data.", "Nous collectons le minimum nécessaire pour traiter la transaction via Stripe. Les dossiers donateurs sont strictement isolés de toute donnée d'utilisation des listes d'accompagnement.", "Wir erfassen nur die für die Transaktionsabwicklung über Stripe erforderlichen Mindestdaten. Spenderdaten werden strikt getrennt von Nutzungsdaten der Checklisten aufbewahrt.", "Mir sammele just déi minimal Donnéeën, déi fir d'Veraarbechtung vun der Transaktioun iwwer Stripe néideg sinn. Donateurendonnéeë gi strikt getrennt vun all Benotzerdonnéeë vun de Checklëschten opbewahrt.")}
              </p>
            </div>

            {/* Sensitive info warning */}
            <div>
              <h3 className="font-semibold text-calm-blue-700 mb-1.5">
                {l(lang, "Content Warning", "Mise en garde", "Wichtiger Hinweis", "Wichtegen Hiweis")}
              </h3>
              <p className="text-calm-blue-400">
                {l(lang, "Please do not write any health details, personal family records, or information about a deceased person in payment reference fields or support messages.", "Veuillez ne pas inscrire de détails sur la santé, de données familiales ou d'informations sur un défunt dans les champs de référence de paiement ou messages.", "Bitte tragen Sie keine Gesundheitsdetails, Familiendaten oder Informationen über einen Verstorbenen in Zahlungsreferenzen oder Nachrichten ein.", "Schreift wgl. keng Gesondheetsdetailer, privat Familljedonnéeën oder Informatiounen iwwer eng verstuerwen Persoun an d'Bezuelreferenz oder an Ënnerstëtzungsmessagen.")}
              </p>
            </div>

          </div>

        </footer>

      </main>
      <FooterSection lang={lang} />
    </>
  );
}
