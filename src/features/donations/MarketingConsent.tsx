import { type Lang, l } from "@/lib/i18n";

export interface MarketingConsentProps {
  lang: Lang;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function MarketingConsent({ lang, checked, onChange }: MarketingConsentProps) {
  const checkboxLabel = l(
    lang,
    "Yes, email me occasional updates about Clarvia’s impact and ways to support its free bereavement resources. I can unsubscribe at any time.",
    "Oui, je souhaite recevoir occasionnellement des nouvelles sur l’impact de Clarvia et les moyens de soutenir ses ressources gratuites consacrées aux démarches après un décès. Je peux me désabonner à tout moment.",
    "Ja, ich möchte gelegentlich Neuigkeiten über die Wirkung von Clarvia und Möglichkeiten zur Unterstützung der kostenlosen Hilfen für Formalitäten nach einem Todesfall erhalten. Ich kann mich jederzeit abmelden.",
    "Jo, ech wëll geleeëntlech Neiegkeeten iwwer d'Wierkung vu Clarvia a Weeër fir hir gratis Hëllef fir Formalitéiten no engem Doudesfall ze ënnerstëtzen kréien. Ech ka mech zu all Moment ofmelden."
  );

  return (
    <div className="flex items-start gap-3 mt-4 text-left p-3 rounded-xl border border-calm-blue-100 bg-white/50 shadow-sm">
      <div className="flex items-center h-5">
        <input
          id="marketing-consent"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-calm-blue-200 text-calm-blue-600 focus:ring-calm-blue-400 cursor-pointer"
        />
      </div>
      <label
        htmlFor="marketing-consent"
        className="text-xs text-calm-blue-600 leading-normal select-none cursor-pointer"
      >
        {checkboxLabel}
      </label>
    </div>
  );
}
