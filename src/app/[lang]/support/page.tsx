"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import { headlineStyle } from "../data";

/* -- Donation tier data -- */

const MONTHLY_TIERS = [
  { amount: 10, label: "Keep the service free" },
  { amount: 25, label: "Support multilingual maintenance", default: true },
  { amount: 50, label: "Fund source-backed updates" },
  { amount: 100, label: "Founding Circle supporter" },
];

const ONETIME_TIERS = [
  { amount: 35, label: "Help maintain official-source references" },
  { amount: 75, label: "Support workflow validation" },
  { amount: 150, label: "Fund translation and accessibility work" },
  { amount: 500, label: "Support a public-service module" },
];

/* -- What donations fund -- */

const FUND_ITEMS = [
  { icon: "\u{1F4C4}", label: "Source review and maintenance" },
  { icon: "\u{1F30D}", label: "Translation in English, French, and German" },
  { icon: "\u267F", label: "Accessibility toward WCAG 2.2 AA" },
  { icon: "\u2713", label: "Workflow validation" },
  { icon: "\u{1F5A5}\uFE0F", label: "Hosting and infrastructure" },
  { icon: "\u{1F91D}", label: "Community outreach" },
];

/* -- Thank-you banner (needs Suspense for useSearchParams) -- */

function ThankYouBanner() {
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";
  if (!donated) return null;
  return (
    <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
      <p className="text-green-800 font-medium">
        Thank you for your donation. We will send an acknowledgement to the email address you provided.
      </p>
    </div>
  );
}

/* -- Trust elements -- */

const TRUST_ITEMS = [
  {
    title: "Registered non-profit",
    desc: "Clarvia ASBL is registered as a non-profit association under RCS F15680.",
  },
  {
    title: "Free for families",
    desc: "Clarvia is being built as a public service that families can use for free.",
  },
  {
    title: "Early support has outsized impact",
    desc: "Clarvia is in its build and validation phase, where each donation directly supports the foundation of the service.",
  },
  {
    title: "Source-backed workflows",
    desc: "Guidance is built around official sources, structured review, and ongoing maintenance.",
  },
  {
    title: "Privacy-first donor records",
    desc: "We collect only the information needed to process your gift, acknowledge support, and maintain basic records.",
  },
  {
    title: "Open source",
    desc: "Clarvia's public GitHub work makes the infrastructure easier to inspect, improve, and maintain.",
  },
];

export default function SupportPage() {
  const params = useParams();
  const lang = (params.lang as Lang) || "en";
  const [tab, setTab] = useState<"monthly" | "onetime">("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers = tab === "monthly" ? MONTHLY_TIERS : ONETIME_TIERS;

  async function handleCardPayment() {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          type: tab === "monthly" ? "monthly" : "onetime",
          lang,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try bank transfer instead.");
        setIsProcessing(false);
      }
    } catch {
      alert("Could not connect to the payment service. Please try bank transfer instead.");
      setIsProcessing(false);
    }
  }

  return (
    <>
      {/* Header */}
      <header
        aria-label={l(lang, "Site header", "Site header", "Site header")}
        className="py-5 px-6 sm:px-12 flex items-center justify-between z-50 relative"
      >
        <Link
          href={`/${lang}`}
          aria-label={l(lang, "Clarvia home", "Clarvia home", "Clarvia home")}
          className="block"
        >
          <img src="/clarvia-logo.png" alt="Clarvia" className="h-20 w-auto" />
        </Link>
        <nav
          aria-label={l(lang, "Language switcher", "Language switcher", "Language switcher")}
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
          <ThankYouBanner />
        </Suspense>

        {/* A. Hero */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {l(lang, "Support Clarvia", "Support Clarvia", "Support Clarvia")}
        </h1>
        <p className="text-lg text-calm-blue-600 leading-relaxed mb-4">
          {l(lang,
            "Help build a free, multilingual public service for families after the loss of a loved one.",
            "Help build a free, multilingual public service for families after the loss of a loved one.",
            "Help build a free, multilingual public service for families after the loss of a loved one."
          )}
        </p>
        <p className="text-base text-calm-blue-500 leading-relaxed mb-12">
          {l(lang,
            "Clarvia is in its build and validation phase. Your early support helps us lay the foundation: reviewing official sources, translating guidance, improving accessibility, and building trustworthy workflows that families can use for free.",
            "Clarvia is in its build and validation phase. Your early support helps us lay the foundation: reviewing official sources, translating guidance, improving accessibility, and building trustworthy workflows that families can use for free.",
            "Clarvia is in its build and validation phase. Your early support helps us lay the foundation: reviewing official sources, translating guidance, improving accessibility, and building trustworthy workflows that families can use for free."
          )}
        </p>

        {/* B. What your donation funds */}
        <section className="mb-12" aria-labelledby="funds-heading">
          <h2
            id="funds-heading"
            className="text-xl font-semibold text-calm-blue-800 mb-4"
            style={{ fontFamily: headlineStyle.fontFamily }}
          >
            {l(lang, "What your donation funds", "What your donation funds", "What your donation funds")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FUND_ITEMS.map((item) => (
              <div
                key={item.label}
                className="glass-panel p-4 text-center"
              >
                <span className="text-2xl mb-2 block" aria-hidden="true">{item.icon}</span>
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
            {l(lang, "Choose an amount", "Choose an amount", "Choose an amount")}
          </h2>

          {/* Tab toggle */}
          <div className="flex gap-1 p-1 rounded-full bg-calm-blue-100/60 mb-6 w-fit">
            <button
              onClick={() => { setTab("monthly"); setSelectedAmount(25); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === "monthly"
                  ? "bg-white text-calm-blue-800 shadow-sm"
                  : "text-calm-blue-500 hover:text-calm-blue-700"
              }`}
            >
              {l(lang, "Monthly", "Monthly", "Monthly")}
            </button>
            <button
              onClick={() => { setTab("onetime"); setSelectedAmount(75); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === "onetime"
                  ? "bg-white text-calm-blue-800 shadow-sm"
                  : "text-calm-blue-500 hover:text-calm-blue-700"
              }`}
            >
              {l(lang, "One-time", "One-time", "One-time")}
            </button>
          </div>

          {/* Tier cards */}
          <div className={`grid gap-3 ${tab === "monthly" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-2"}`}>
            {tiers.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => setSelectedAmount(tier.amount)}
                className={`glass-panel p-4 text-left cursor-pointer transition-all ${
                  selectedAmount === tier.amount
                    ? "ring-2 ring-calm-lilac-400 border-calm-lilac-300"
                    : "hover:ring-1 hover:ring-calm-blue-200"
                }`}
              >
                <p className="text-2xl font-semibold text-calm-blue-800 mb-1">
                  &euro;{tier.amount.toLocaleString()}
                  {tab === "monthly" && (
                    <span className="text-sm font-normal text-calm-blue-400">
                      /mo
                    </span>
                  )}
                </p>
                <p className="text-sm text-calm-blue-500">
                  {tier.label}
                </p>
              </button>
            ))}
          </div>

          {/* Pay with card button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleCardPayment}
              disabled={isProcessing}
              className={`btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg ${
                isProcessing ? "opacity-60 cursor-wait" : ""
              }`}
            >
              {isProcessing
                ? l(lang, "Redirecting...", "Redirecting...", "Redirecting...")
                : l(lang,
                    `Donate \u20AC${selectedAmount.toLocaleString()}${tab === "monthly" ? "/mo" : ""} by card`,
                    `Donate \u20AC${selectedAmount.toLocaleString()}${tab === "monthly" ? "/mo" : ""} by card`,
                    `Donate \u20AC${selectedAmount.toLocaleString()}${tab === "monthly" ? "/mo" : ""} by card`
                  )
              }
            </button>
          </div>

          {/* Manage existing subscription */}
          <div className="mt-4 text-center">
            <p className="text-sm text-calm-blue-400">
              {l(lang,
                "Already a monthly supporter?",
                "Already a monthly supporter?",
                "Already a monthly supporter?"
              )}{" "}
              <a
                href="https://billing.stripe.com/p/login/cNieVd5j90I9dOs2d3b3q00"
                target="_blank"
                rel="noopener noreferrer"
                className="text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors"
              >
                {l(lang,
                  "Manage your donation",
                  "Manage your donation",
                  "Manage your donation"
                )}
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
            {l(lang, "Bank transfer", "Bank transfer", "Bank transfer")}
          </h2>
          <div className="donation-iban">
            <div className="space-y-1.5 text-sm">
              <p><span className="font-semibold text-calm-blue-700">IBAN:</span> <span className="tracking-wide">LT09 3500 0100 1903 8740</span></p>
              <p><span className="font-semibold text-calm-blue-700">Account holder:</span> Clarvia ASBL</p>
              <p><span className="font-semibold text-calm-blue-700">RCS:</span> F15680</p>
              <p><span className="font-semibold text-calm-blue-700">BIC/SWIFT:</span> EVIULT2VXXX</p>
              <p><span className="font-semibold text-calm-blue-700">Bank:</span> Paysera LT, UAB</p>
              <p><span className="font-semibold text-calm-blue-700">Bank address:</span> Pilait&#x117;s pr. 16, Vilnius, LT-04352, Lithuania</p>
            </div>
            <div className="mt-4 pt-3 border-t border-calm-blue-200/50 space-y-2">
              <p className="text-xs text-calm-blue-500">
                {l(lang,
                  "Please use your name or email as the payment reference so we can send an acknowledgement.",
                  "Please use your name or email as the payment reference so we can send an acknowledgement.",
                  "Please use your name or email as the payment reference so we can send an acknowledgement."
                )}
              </p>
              <p className="text-xs text-calm-blue-400">
                {l(lang,
                  "Please do not include sensitive family details in the payment reference.",
                  "Please do not include sensitive family details in the payment reference.",
                  "Please do not include sensitive family details in the payment reference."
                )}
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
            {l(lang, "Sponsor on GitHub", "Sponsor on GitHub", "Sponsor on GitHub")}
          </h2>
          <div className="glass-panel p-6">
            <p className="text-sm text-calm-blue-600 leading-relaxed mb-2">
              {l(lang,
                "Support Clarvia's open-source public-interest infrastructure through GitHub Sponsors.",
                "Support Clarvia's open-source public-interest infrastructure through GitHub Sponsors.",
                "Support Clarvia's open-source public-interest infrastructure through GitHub Sponsors."
              )}
            </p>
            <p className="text-sm text-calm-blue-500 leading-relaxed mb-4">
              {l(lang,
                "GitHub sponsorship helps fund the source-backed workflow data, validation work, documentation, and maintenance behind Clarvia.",
                "GitHub sponsorship helps fund the source-backed workflow data, validation work, documentation, and maintenance behind Clarvia.",
                "GitHub sponsorship helps fund the source-backed workflow data, validation work, documentation, and maintenance behind Clarvia."
              )}
            </p>
            <a
              href="https://github.com/sponsors/clarvia-org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              {l(lang, "Sponsor Clarvia on GitHub", "Sponsor Clarvia on GitHub", "Sponsor Clarvia on GitHub")}
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
            {l(lang, "Why support Clarvia", "Why support Clarvia", "Why support Clarvia")}
          </h2>
          <ul className="space-y-3">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item.title}
                className="flex gap-3 items-start p-4 rounded-xl bg-white/40 border border-calm-blue-100"
              >
                <span className="governance-check mt-0.5" aria-hidden="true">&check;</span>
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
            {l(lang, "Corporate sponsors", "Corporate sponsors", "Corporate sponsors")}
          </h2>
          <div className="glass-panel p-6">
            <p className="text-sm text-calm-blue-600 leading-relaxed mb-3">
              {l(lang,
                "Companies supporting Clarvia help build public-interest infrastructure for families after the loss of a loved one.",
                "Companies supporting Clarvia help build public-interest infrastructure for families after the loss of a loved one.",
                "Companies supporting Clarvia help build public-interest infrastructure for families after the loss of a loved one."
              )}
            </p>
            <p className="text-sm text-calm-blue-500 leading-relaxed mb-4">
              {l(lang,
                "Sponsors may receive acknowledgement, but sponsorship does not provide influence over guidance, access to user data, referrals, preferential placement, exclusivity, or endorsement.",
                "Sponsors may receive acknowledgement, but sponsorship does not provide influence over guidance, access to user data, referrals, preferential placement, exclusivity, or endorsement.",
                "Sponsors may receive acknowledgement, but sponsorship does not provide influence over guidance, access to user data, referrals, preferential placement, exclusivity, or endorsement."
              )}
            </p>
            <a
              href={`/${lang}/contact`}
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              {l(lang, "Get in touch", "Get in touch", "Get in touch")}
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
            {l(lang, "Privacy", "Privacy", "Privacy")}
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-calm-blue-500 leading-relaxed">
              {l(lang,
                "Your donation supports Clarvia ASBL's mission.",
                "Your donation supports Clarvia ASBL's mission.",
                "Your donation supports Clarvia ASBL's mission."
              )}
            </p>
            <p className="text-sm text-calm-blue-500 leading-relaxed">
              {l(lang,
                "We collect only the information needed to process your gift, send an acknowledgement, and maintain basic donor records. Donor records are kept separate from any future family-support usage data.",
                "We collect only the information needed to process your gift, send an acknowledgement, and maintain basic donor records. Donor records are kept separate from any future family-support usage data.",
                "We collect only the information needed to process your gift, send an acknowledgement, and maintain basic donor records. Donor records are kept separate from any future family-support usage data."
              )}
            </p>
            <p className="text-sm text-calm-blue-400 leading-relaxed">
              {l(lang,
                "Please do not include personal family details, health information, or details about a loss in donation references or messages.",
                "Please do not include personal family details, health information, or details about a loss in donation references or messages.",
                "Please do not include personal family details, health information, or details about a loss in donation references or messages."
              )}
            </p>
          </div>
        </section>

        {/* I. Donation acknowledgement */}
        <section className="mb-12" aria-labelledby="receipt-heading">
          <div className="p-4 rounded-xl bg-calm-blue-50/60 border border-calm-blue-100">
            <p className="text-xs font-semibold text-calm-blue-600 mb-1">
              {l(lang, "Donation acknowledgement", "Donation acknowledgement", "Donation acknowledgement")}
            </p>
            <p className="text-xs text-calm-blue-500 leading-relaxed">
              {l(lang,
                "Clarvia ASBL does not currently issue tax certificates for donations. Any acknowledgement we send is a confirmation of support, not a tax certificate.",
                "Clarvia ASBL does not currently issue tax certificates for donations. Any acknowledgement we send is a confirmation of support, not a tax certificate.",
                "Clarvia ASBL does not currently issue tax certificates for donations. Any acknowledgement we send is a confirmation of support, not a tax certificate."
              )}
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
