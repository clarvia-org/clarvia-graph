import { useState, useEffect } from "react";
import { type Lang, l } from "@/lib/i18n";
import { getMonthlyTiers, getOnetimeTiers, type DonationTier } from "./landing-page-config";

export interface DonationAmountSelectorProps {
  lang: Lang;
  defaultFrequency: "monthly" | "onetime";
  defaultAmount: number;
  onChange: (frequency: "monthly" | "onetime", amount: number, isValid: boolean) => void;
  tiers?: {
    monthly: DonationTier[];
    onetime: DonationTier[];
  };
}

export default function DonationAmountSelector({
  lang,
  defaultFrequency,
  defaultAmount,
  onChange,
  tiers: customTiers,
}: DonationAmountSelectorProps) {
  const [tab, setTab] = useState<"monthly" | "onetime">(defaultFrequency);
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const monthlyTiers = customTiers?.monthly ?? getMonthlyTiers(lang);
  const onetimeTiers = customTiers?.onetime ?? getOnetimeTiers(lang);
  const currentTiers = tab === "monthly" ? monthlyTiers : onetimeTiers;

  const activeAmount = isCustom ? (Number(customAmount) || 0) : selectedAmount;
  const isValidAmount = activeAmount >= 1 && activeAmount <= 100000;

  // Sync back to parent when states change
  useEffect(() => {
    onChange(tab, activeAmount, isValidAmount);
  }, [tab, activeAmount, isValidAmount, onChange]);

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 rounded-full bg-calm-blue-100/60 mb-4 w-full">
        <button
          type="button"
          onClick={() => {
            setTab("monthly");
            // Pick default amount from monthly tiers if available, else first
            const defaultTier = monthlyTiers.find((t) => t.default) || monthlyTiers[0];
            setSelectedAmount(defaultTier?.amount ?? 25);
            setIsCustom(false);
            setCustomAmount("");
          }}
          className={`flex-1 text-center py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
            tab === "monthly"
              ? "bg-white text-calm-blue-800 shadow-sm"
              : "text-calm-blue-500 hover:text-calm-blue-700"
          }`}
        >
          {l(lang, "Monthly", "Mensuel", "Monatlich", "All Mount")}
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("onetime");
            // Pick default amount from onetime tiers if available, else first
            const defaultTier = onetimeTiers.find((t) => t.default) || onetimeTiers[0];
            setSelectedAmount(defaultTier?.amount ?? 75);
            setIsCustom(false);
            setCustomAmount("");
          }}
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
        {currentTiers.map((tier) => (
          <button
            type="button"
            key={tier.amount}
            onClick={() => {
              setSelectedAmount(tier.amount);
              setIsCustom(false);
            }}
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
              {typeof tier.label === "string"
                ? tier.label
                : l(lang, tier.label.en, tier.label.fr, tier.label.de, tier.label.lu)}
            </p>
          </button>
        ))}

        {/* Custom amount */}
        <button
          type="button"
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
                <span className="text-xs font-normal text-calm-blue-400 whitespace-nowrap">
                  {l(lang, "/mo", "/mois", "/Monat", "/Mount")}
                </span>
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
    </div>
  );
}
