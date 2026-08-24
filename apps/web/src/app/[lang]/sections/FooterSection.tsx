import { type Lang, l } from "@/lib/i18n";
import CookieSettingsTrigger from "@/components/CookieSettingsTrigger";
import Image from "next/image";

export default function FooterSection({ lang }: { lang: Lang }) {
  return (
    <footer className="py-12 border-t border-calm-blue-200/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8">
          <div>
            <Image src="/clarvia-logo.webp" alt="Clarvia logo" width={96} height={48} className="h-12 w-auto mb-4" />
            <p className="text-sm text-calm-blue-600 leading-relaxed">
              {l(lang, "Free bereavement guidance for families.", "Un accompagnement gratuit pour les familles au Luxembourg après un décès.", "Kostenlose Orientierung im Trauerfall für Familien in Luxemburg.", "Gratis Orientéierung am Trauerfall fir Familljen zu Lëtzebuerg.")}
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-calm-blue-700 mb-3">
              {l(lang, "Links", "Liens", "Links", "Linken")}
            </div>
            <nav className="flex flex-col gap-2" aria-label={l(lang, "Footer navigation", "Navigation du pied de page", "Fußzeilennavigation", "Navigatioun am Foussberäich")} >
              {[
                { label: l(lang, "Home", "Accueil", "Startseite", "Startsäit"), href: `/${lang}` },
                { label: l(lang, "Ask us", "Posez-nous votre question", "Fragen Sie uns", "Frot eis"), href: `/${lang}#ask-us` },
                { label: l(lang, "About", "À propos", "Über uns", "Iwwer eis"), href: `/${lang}/about` },
                { label: l(lang, "Contact", "Contact", "Kontakt", "Kontakt"), href: `/${lang}/contact` },
                { label: l(lang, "Donate", "Faire un don", "Spenden", "Spenden"), href: `/${lang}/support` },
                { label: l(lang, "Updates", "Actualités", "Aktuelles", "Neiegkeeten"), href: `/${lang}/updates` },
                { label: l(lang, "Contribute", "Contribuer", "Mitwirken", "Matmaachen"), href: `/${lang}/contribute` },
                { label: l(lang, "Privacy Policy", "Politique de confidentialité", "Datenschutzerklärung", "Dateschutzerklärung"), href: `/${lang}/privacy` },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <div className="text-sm font-semibold text-calm-blue-700 mb-3">
              {l(lang, "Built Openly", "Développé ouvertement", "Offen entwickelt", "Offen entwéckelt")}
            </div>
            <div className="text-sm text-calm-blue-600 leading-relaxed space-y-3">
              <p>
                {l(lang, "Clarvia is built openly. Our public repositories contain the workflow model, validation logic, publishing layer, documentation, and governance standards behind the project.", "Clarvia est développé de manière ouverte. Nos dépôts publics regroupent le modèle de workflows, la logique de validation, la couche de publication, la documentation et les principes de gouvernance du projet.", "Clarvia wird offen entwickelt. Unsere öffentlichen Repositories enthalten das Workflow-Modell, die Validierungslogik, die Veröffentlichungsebene, die Dokumentation und die Governance-Grundsätze hinter dem Projekt.", "Clarvia gëtt offen entwéckelt. Eis ëffentlech Repositorien enthalen de Workflow-Modell, d'Validéierungslogik, d'Publikatiounsschicht, d'Dokumentatioun an d'Gouvernance-Standarden hannert dem Projet.")}
              </p>
              <a href="https://github.com/clarvia-org/clarvia-graph" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-calm-blue-700 hover:text-calm-blue-900 font-medium transition-colors group">
                {l(
                  lang,
                  "Open source · EUPL / Apache-2.0 / CC-BY-4.0",
                  "Open source · EUPL / Apache-2.0 / CC-BY-4.0",
                  "Open source · EUPL / Apache-2.0 / CC-BY-4.0",
                  "Open source · EUPL / Apache-2.0 / CC-BY-4.0"
                )}
                <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-calm-blue-500 leading-relaxed space-y-3 pt-6 border-t border-calm-blue-200/50">
          <p>
            {l(
              lang,
              "Clarvia ASBL is an independent non-profit association. Clarvia provides practical guidance and signposting. We do not provide emergency, legal, tax, medical, psychological, notarial, banking, financial, or succession advice. Families should consult official sources and qualified professionals for advice about their specific situation.",
              "Clarvia ASBL est une association indépendante à but non lucratif. Clarvia propose des informations pratiques et oriente les familles vers les services compétents. Nous n’assurons pas de service d’urgence et ne fournissons aucun conseil juridique, fiscal, médical, psychologique, notarial, bancaire, financier ou successoral. Pour toute question liée à leur situation personnelle, les familles sont invitées à consulter les sources officielles et à s’adresser à des professionnels qualifiés.",
              "Clarvia ASBL ist ein unabhängiger, gemeinnütziger Verein. Clarvia bietet praktische Orientierung und verweist an die zuständigen Anlaufstellen. Wir leisten keine Notfallhilfe und bieten keine Rechts-, Steuer-, medizinische, psychologische, notarielle, Bank-, Finanz- oder Erbrechtsberatung an. Familien sollten sich bei Fragen zu ihrer persönlichen Situation an offizielle Stellen und entsprechend qualifizierte Fachleute wenden.",
              "Clarvia ASBL ass en onofhängegen, net gewënnorientéierte Veräin. Clarvia bitt praktesch Orientéierung a weist Familljen un déi zoustänneg Servicer an Ulafstellen weider. Mir sinn keen Noutdéngscht a bidden och keng juristesch, steierlech, medezinesch, psychologesch, notariell, Bank-, Finanz- oder Ierfschaftsberodung un. Bei Froen zu hirer perséinlecher Situatioun solle Familljen offiziell Informatiounsquellen consultéieren a sech u qualifizéiert Fachleit wenden."
            )}
          </p>
          <p className="font-medium">
            {l(
              lang,
              "Clarvia is not an emergency service. If there is an immediate risk to life or safety, please contact your local emergency services immediately.",
              "Clarvia n’est pas un service d’urgence. En cas de danger immédiat pour la vie ou la sécurité d’une personne, veuillez contacter sans délai les services d’urgence locaux.",
              "Clarvia ist kein Notfalldienst. Besteht eine unmittelbare Gefahr für Leben oder Sicherheit, wenden Sie sich bitte sofort an die örtlichen Rettungsdienste.",
              "Clarvia ass keen Noutdéngscht. Wann eng Persoun direkt a Liewensgefor ass oder hir Sécherheet akut menacéiert ass, kontaktéiert wgl. direkt déi lokal Noutdéngschter."
            )}
          </p>
        </div>

        <div id="cookie-consent-slot-footer" className="mt-8" />

        <div className="text-center text-xs text-calm-blue-500 pt-6 mt-6 border-t border-calm-blue-200/50 space-y-1">
          <p className="font-medium text-sm">Clarvia ASBL</p>
          <p>RCS Luxembourg F15680</p>
          <p>46, Rue de la Lavande · 1923 Luxembourg</p>
          <p>
            <a href={`/${lang}/contact`} className="hover:text-calm-blue-800 transition-colors">
              {l(lang, "Contact form", "Formulaire de contact", "Kontaktformular", "Kontaktformulaire")}
            </a>
          </p>
          <p className="mt-2 text-calm-blue-400">
            {l(lang, "clarvia.org · clarvia.eu", "clarvia.org · clarvia.eu", "clarvia.org · clarvia.eu", "clarvia.org · clarvia.eu")}
            {" · "}
            <CookieSettingsTrigger lang={lang} />
          </p>
        </div>
      </div>
    </footer>
  );
}
