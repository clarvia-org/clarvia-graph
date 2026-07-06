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
              {l(lang,
                "Free bereavement guidance for families in Luxembourg.",
                "Un accompagnement gratuit pour les familles au Luxembourg après un décès.",
                "Kostenlose Orientierung im Trauerfall für Familien in Luxemburg."
              )}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-calm-blue-700 mb-3">
              {l(lang, "Links", "Liens", "Links")}
            </h4>
            <nav className="flex flex-col gap-2" aria-label={l(lang, "Footer navigation", "Navigation du pied de page", "Fußzeilennavigation")} >
              {[
                { label: l(lang, "Home", "Accueil", "Startseite"), href: `/${lang}` },
                { label: l(lang, "Support", "Soutenir", "Unterstützen"), href: `/${lang}/support` },
                { label: l(lang, "Checklist", "Liste de démarches", "Checkliste"), href: `/${lang}/checklist` },
                { label: l(lang, "About", "À propos", "Über uns"), href: `/${lang}/about` },
                { label: l(lang, "Updates", "Actualités", "Aktuelles"), href: `/${lang}/updates` },
                { label: l(lang, "Presentation Brochure", "Brochure de présentation", "Präsentationsbroschüre"), href: `/${lang}/brochure` },
                { label: l(lang, "Privacy Policy", "Politique de confidentialité", "Datenschutzerklärung"), href: `/${lang}/privacy` },
                { label: l(lang, "Share your experience", "Partager votre expérience", "Erfahrung teilen"), href: "#experience" },
                { label: l(lang, "Contact", "Contact", "Kontakt"), href: "#contact" },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-calm-blue-600 hover:text-calm-blue-800 transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-calm-blue-700 mb-3 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              {l(lang, "Built Openly", "Développé ouvertement", "Offen entwickelt")}
            </h4>
            <div className="text-sm text-calm-blue-600 leading-relaxed space-y-3">
              <p>
                {l(lang,
                  "Clarvia is built openly. Our public repositories contain the workflow model, validation logic, publishing layer, documentation, and governance standards behind the project.",
                  "Clarvia est développé de manière ouverte. Nos dépôts publics regroupent le modèle de workflows, la logique de validation, la couche de publication, la documentation et les principes de gouvernance du projet.",
                  "Clarvia wird offen entwickelt. Unsere öffentlichen Repositories enthalten das Workflow-Modell, die Validierungslogik, die Veröffentlichungsebene, die Dokumentation und die Governance-Grundsätze hinter dem Projekt."
                )}
              </p>
              <a href="https://github.com/clarvia-org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-calm-blue-700 hover:text-calm-blue-900 font-medium transition-colors group">
                github.com/clarvia-org
                <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </a>
              <p className="text-xs text-calm-blue-400 mt-2">
                {l(lang, "AI and agent context", "Contexte pour IA et agents", "KI- und Agentenkontext")}:{" "}
                <a href="/llms.txt" className="hover:text-calm-blue-600 transition-colors">/llms.txt</a>
                {" · "}
                <a href="/llms-full.txt" className="hover:text-calm-blue-600 transition-colors">/llms-full.txt</a>
                {" · "}
                <a href="/ai-crawler-policy.txt" className="hover:text-calm-blue-600 transition-colors">/ai-crawler-policy.txt</a>
              </p>
            </div>
          </div>
        </div>

        {/* Standards & Licensing Banner */}
        <div className="border-t border-calm-blue-200/30 pt-6 pb-2 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-calm-blue-700">
              {l(lang, "Standards & Licensing", "Normes & Licences", "Standards & Lizenzen")}
            </h5>
            <p className="text-xs text-calm-blue-500 max-w-md leading-relaxed">
              {l(lang,
                "Clarvia complies with open science standards and open source licensing models.",
                "Clarvia respecte les normes de l'open science et les modèles de licences open source.",
                "Clarvia hält sich an Open-Science-Standards und Open-Source-Lizenzmodelle."
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <a 
              href="https://github.com/clarvia-org/clarvia-graph/actions/workflows/ci.yml" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://github.com/clarvia-org/clarvia-graph/actions/workflows/ci.yml/badge.svg" 
                alt="CI (graph)" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://github.com/clarvia-org/workflow-web/actions/workflows/validate.yml" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://github.com/clarvia-org/workflow-web/actions/workflows/validate.yml/badge.svg" 
                alt="CI (web)" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://www.bestpractices.dev/en/projects/13112/passing" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://www.bestpractices.dev/projects/13112/badge" 
                alt="OpenSSF Best Practices" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://scorecard.dev/#/projects/github.com/clarvia-org/clarvia-graph" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://api.scorecard.dev/projects/github.com/clarvia-org/clarvia-graph/badge" 
                alt="OpenSSF Scorecard" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://api.reuse.software/info/github.com/clarvia-org/clarvia-graph" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://api.reuse.software/badge/github.com/clarvia-org/clarvia-graph" 
                alt="REUSE compliant" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://codecov.io/gh/clarvia-org/clarvia-graph" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://codecov.io/gh/clarvia-org/clarvia-graph/graph/badge.svg" 
                alt="Codecov" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://sonarcloud.io/summary/new_code?id=clarvia-org_clarvia-graph" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://sonarcloud.io/api/project_badges/measure?project=clarvia-org_clarvia-graph&metric=alert_status" 
                alt="SonarCloud Quality Gate" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://doi.org/10.5281/zenodo.20572455" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://img.shields.io/badge/DOI-10.5281%2Fzenodo.20572455-blue" 
                alt="DOI: 10.5281/zenodo.20572455" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://fair-software.eu" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://img.shields.io/badge/fair--software.eu-%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8B%20%20%E2%97%8F%20%20%E2%97%8F-green" 
                alt="FAIR 4/5" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://github.com/clarvia-org/clarvia-graph/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://img.shields.io/badge/Code_(graph)-EUPL--1.2-blue.svg" 
                alt="License: EUPL-1.2" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://github.com/clarvia-org/workflow-web/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://img.shields.io/badge/Code_(web)-Apache--2.0-blue.svg" 
                alt="License: Apache-2.0" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
            <a 
              href="https://github.com/clarvia-org/clarvia-graph/blob/main/LICENSE-DATA" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://img.shields.io/badge/Data-CC--BY--4.0-green.svg" 
                alt="License: CC-BY-4.0" 
                className="h-6 w-auto"
                loading="lazy"
              />
            </a>
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
          <p>
            {l(lang,
              "Clarvia is currently built for Luxembourg and planned European jurisdictions. It is not offered in the United States.",
              "Clarvia est actuellement conçu pour le Luxembourg et des juridictions européennes à venir. Il n'est pas proposé aux États-Unis.",
              "Clarvia ist derzeit für Luxemburg und geplante europäische Rechtsordnungen entwickelt. Es wird nicht in den Vereinigten Staaten angeboten."
            )}
          </p>
        </div>

        <div className="text-center text-xs text-calm-blue-500 pt-6 mt-6 border-t border-calm-blue-200/50 space-y-1">
          <p className="font-medium text-sm">Clarvia ASBL</p>
          <p>RCS Luxembourg F15680</p>
          <p>46, Rue de la Lavande · 1923 Luxembourg</p>
          <p className="mt-2 text-calm-blue-400">
            {l(lang, "clarvia.org · clarvia.eu", "clarvia.org · clarvia.eu", "clarvia.org · clarvia.eu")}
            {" · "}
            <CookieSettingsTrigger lang={lang} />
          </p>
        </div>
      </div>
    </footer>
  );
}
