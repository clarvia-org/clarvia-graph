"use client";

import { useState } from "react";
import { type Lang, l } from "@/lib/i18n";

export const CLARVIA_BANK_ACCOUNT = {
  iban: "LU21 1114 0008 4156 0000",
  bic: "CCPLLULLXXX",
  holder: "Clarvia ASBL",
  rcs: "F15680",
  bankName: "POST Luxembourg",
  bankUrl: "https://www.post.lu/",
} as const;

export function PostLuxembourgNote({
  lang,
  linkClassName = "text-calm-lilac-500 hover:text-calm-lilac-600 underline underline-offset-2 transition-colors",
}: {
  lang: Lang;
  linkClassName?: string;
}) {
  const bankLink = (
    <a
      href={CLARVIA_BANK_ACCOUNT.bankUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClassName}
    >
      {CLARVIA_BANK_ACCOUNT.bankName}
    </a>
  );

  return (
    <>
      {l(
        lang,
        "We bank with ",
        "Notre compte bancaire est détenu auprès de ",
        "Unser Bankkonto wird bei ",
        "Eise Bankkonto ass bei ",
      )}
      {bankLink}
      {l(
        lang,
        ", a state-owned postal financial institution founded in 1842 that supports nonprofits and provides no-barrier banking access regardless of income.",
        ", un établissement financier postal public fondé en 1842 qui soutient les associations sans but lucratif et offre un accès bancaire sans barrière, quel que soit le revenu.",
        " geführt, einem staatlichen Postfinanzinstitut aus dem Jahr 1842, das gemeinnützige Organisationen unterstützt und unabhängig vom Einkommen barrierefreien Zugang zu Bankdienstleistungen bietet.",
        ", engem staatleche Postfinanzinstitut gegrënnt am Joer 1842, dat gemeinnëtzeg Organisatiounen ënnerstëtzt an onofhängeg vum Akommes en Zougang zu Bankdéngschtleeschtungen ouni Barrièren ubitt.",
      )}
    </>
  );
}

export interface BankTransferDetailsProps {
  lang: Lang;
  reference: string;
  referenceNote: string;
  showRcs?: boolean;
  showComfortNote?: boolean;
  alertOnCopyError?: boolean;
}

export default function BankTransferDetails({
  lang,
  reference,
  referenceNote,
  showRcs = false,
  showComfortNote = false,
  alertOnCopyError = false,
}: BankTransferDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      if (alertOnCopyError) {
        alert(
          l(
            lang,
            "Could not copy to clipboard. Please copy manually.",
            "Impossible de copier dans le presse-papiers. Veuillez copier manuellement.",
            "Konnte nicht in die Zwischenablage kopieren. Bitte manuell kopieren.",
            "Konnt net an de Clipboard kopéiert ginn. Kopéiert et wgl. manuell.",
          ),
        );
      }
    }
  };

  const copyLabel = (field: string) =>
    copiedField === field
      ? l(lang, "Copied!", "Copié !", "Kopiert!", "Kopéiert!")
      : l(lang, "Copy", "Copier", "Kopieren", "Kopéieren");

  return (
    <div className="space-y-2.5">
      <div className="space-y-2 text-xs font-mono bg-white/60 border border-calm-blue-100 rounded-xl p-3.5">
        <div className="flex justify-between items-center gap-2">
          <div className="overflow-x-auto scrollbar-none">
            <span className="font-semibold font-sans text-calm-blue-500 mr-1">
              IBAN:
            </span>
            <span className="tracking-wider select-all">
              {CLARVIA_BANK_ACCOUNT.iban}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(CLARVIA_BANK_ACCOUNT.iban, "iban")}
            className="shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 transition-colors font-sans font-medium"
          >
            {copyLabel("iban")}
          </button>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div>
            <span className="font-semibold font-sans text-calm-blue-500 mr-1">
              BIC/SWIFT:
            </span>
            <span className="select-all">{CLARVIA_BANK_ACCOUNT.bic}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(CLARVIA_BANK_ACCOUNT.bic, "bic")}
            className="shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 transition-colors font-sans font-medium"
          >
            {copyLabel("bic")}
          </button>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="overflow-x-auto scrollbar-none">
            <span className="font-semibold font-sans text-calm-blue-500 mr-1">
              Ref:
            </span>
            <span className="select-all">{reference}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(reference, "ref")}
            className="shrink-0 text-[10px] px-2 py-1 rounded bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 transition-colors font-sans font-medium"
          >
            {copyLabel("ref")}
          </button>
        </div>

        <div className="text-[11px] font-sans text-calm-blue-600 space-y-1 pt-1.5 border-t border-calm-blue-100/60">
          <p>
            <span className="font-medium text-calm-blue-500">
              {l(lang, "Holder:", "Titulaire :", "Inhaber:", "Kontohalter:")}
            </span>{" "}
            {CLARVIA_BANK_ACCOUNT.holder}
          </p>
          {showRcs && (
            <p>
              <span className="font-medium text-calm-blue-500">RCS:</span>{" "}
              {CLARVIA_BANK_ACCOUNT.rcs}
            </p>
          )}
          <p>
            <span className="font-medium text-calm-blue-500">
              {l(lang, "Bank:", "Banque :", "Bank:", "Bank:")}
            </span>{" "}
            <a
              href={CLARVIA_BANK_ACCOUNT.bankUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-calm-blue-800 transition-colors"
            >
              {CLARVIA_BANK_ACCOUNT.bankName}
            </a>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-calm-blue-600 leading-snug">
        {referenceNote}
      </p>

      {showComfortNote && (
        <p className="text-[11px] text-calm-blue-500 leading-snug">
          <PostLuxembourgNote
            lang={lang}
            linkClassName="text-calm-blue-700 hover:text-calm-blue-900 underline underline-offset-2 transition-colors font-medium"
          />
        </p>
      )}
    </div>
  );
}
