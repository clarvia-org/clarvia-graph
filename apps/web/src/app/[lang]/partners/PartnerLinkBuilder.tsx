"use client";

import { useMemo, useState } from "react";
import {
  ASK_LOCALES,
  ASK_LOCALE_NAMES,
  buildPartnerAskUrl,
  type AskLocale,
} from "@/lib/ask-entry";

const PASTE_SENTENCE =
  "If you need practical next steps after a death or during a terminal illness, you can ask Clarvia for free, source-linked guidance by email:";

function CopyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label className="text-sm font-semibold text-calm-blue-800">{label}</label>
        <button
          type="button"
          onClick={copy}
          className="text-sm font-medium text-calm-blue-600 underline hover:text-calm-blue-800"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={label === "HTML" ? 4 : 3}
        className="w-full px-4 py-3 rounded-xl border border-calm-blue-200 bg-white text-sm text-calm-blue-800 font-mono"
      />
    </div>
  );
}

export default function PartnerLinkBuilder() {
  const [ref, setRef] = useState("");
  const [market, setMarket] = useState("");
  const [lang, setLang] = useState<AskLocale>("en");

  const url = useMemo(
    () => buildPartnerAskUrl({ ref, market, lang }),
    [ref, market, lang],
  );
  const sentence = `${PASTE_SENTENCE} ${url}`;
  const html = `<p>If you need practical next steps after a death or during a terminal illness, you can <a href="${url}">ask Clarvia</a> for free, source-linked guidance by email.</p>`;

  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <label className="text-sm text-calm-blue-700">
          <span className="block font-semibold text-calm-blue-800 mb-1.5">ref (optional)</span>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="your-org"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-calm-blue-200 bg-white text-calm-blue-800"
          />
        </label>
        <label className="text-sm text-calm-blue-700">
          <span className="block font-semibold text-calm-blue-800 mb-1.5">market (optional)</span>
          <input
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="be"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-calm-blue-200 bg-white text-calm-blue-800"
          />
        </label>
        <label className="text-sm text-calm-blue-700">
          <span className="block font-semibold text-calm-blue-800 mb-1.5">lang hint</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as AskLocale)}
            className="w-full min-h-11 px-3 py-2 rounded-lg border border-calm-blue-200 bg-white text-calm-blue-800"
          >
            {ASK_LOCALES.map((code) => (
              <option key={code} value={code} lang={code}>
                {ASK_LOCALE_NAMES[code]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CopyField label="Sentence and link" value={sentence} />
      <CopyField label="Link only" value={url} />
      <CopyField label="HTML" value={html} />
    </div>
  );
}
