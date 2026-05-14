import { type Lang, l } from "@/lib/i18n";

export default function FooterSection({ lang }: { lang: Lang }) {
  return (
    <footer className="py-12 border-t border-calm-blue-200/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 mb-8">
          <div className="flex-1">
            <img src="/clarvia-logo.png" alt="Clarvia" className="h-12 w-auto mb-4" />
            <p className="text-sm text-calm-blue-600 leading-relaxed">
              {l(lang,
                "Free bereavement guidance for families in Luxembourg.",
                "Un accompagnement gratuit pour les familles au Luxembourg après un décès.",
                "Kostenlose Orientierung im Trauerfall für Familien in Luxemburg."
              )}
            </p>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-calm-blue-700 mb-3">
              {l(lang, "Links", "Liens", "Links")}
            </h4>
            <nav className="grid grid-cols-2 gap-2">
              {[
                { label: l(lang, "Home", "Accueil", "Startseite"), href: `/${lang}` },
                { label: l(lang, "Share your experience", "Partager votre expérience", "Erfahrung teilen"), href: "#experience" },
                { label: l(lang, "Contact", "Contact", "Kontakt"), href: "#contact" },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="text-xs text-calm-blue-500 leading-relaxed space-y-3 pt-6 border-t border-calm-blue-200/50">
          <p>
            {l(lang,
              "Clarvia provides practical guidance and signposting. We do not provide emergency, legal, tax, medical, psychological, notarial, banking, financial, or succession advice. Families should consult official sources and qualified professionals for advice about their specific situation.",
              "Clarvia fournit des informations pratiques et oriente les familles vers les bons interlocuteurs. Nous ne proposons pas d'aide d'urgence ni de conseils juridiques, fiscaux, médicaux, psychologiques, notariaux, bancaires, financiers ou successoraux. Les familles doivent consulter les sources officielles et des professionnels qualifiés pour obtenir des conseils adaptés à leur situation.",
              "Clarvia bietet praktische Orientierung und verweist auf passende Anlaufstellen. Wir leisten keine Notfallhilfe und keine rechtliche, steuerliche, medizinische, psychologische, notarielle, bankfachliche, finanzielle oder nachlassbezogene Beratung. Familien sollten für ihre konkrete Situation offizielle Quellen und qualifizierte Fachleute konsultieren."
            )}
          </p>
          <p className="font-medium">
            {l(lang,
              "Clarvia is not an emergency service. If there is an immediate risk to life or safety, call 112 in Luxembourg.",
              "Clarvia n'est pas un service d'urgence. En cas de risque immédiat pour la vie ou la sécurité, appelez le 112 au Luxembourg.",
              "Clarvia ist kein Notfalldienst. Bei unmittelbarer Gefahr für Leben oder Sicherheit rufen Sie 112 in Luxemburg an."
            )}
          </p>
        </div>

        <div className="text-center text-xs text-calm-blue-500 pt-6 mt-6 border-t border-calm-blue-200/50 space-y-1">
          <p className="font-medium text-sm">Clarvia ASBL</p>
          <p>RCS Luxembourg F15680</p>
          <p>46, Rue de la Lavande · 1923 Luxembourg</p>
          <p className="mt-2">clarvia.org · clarvia.eu</p>
        </div>
      </div>
    </footer>
  );
}
