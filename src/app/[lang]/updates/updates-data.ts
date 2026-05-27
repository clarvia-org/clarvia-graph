import { type Lang } from "@/lib/i18n";

export type Update = {
  date: string;
  headline: Record<Lang, string>;
  body?: Record<Lang, string>;
  logo?: string;
};

/* Newest first */
export const UPDATES: Update[] = [
  {
    date: "2026-05-25",
    headline: {
      en: "Clarvia Welcomes Its First Core Open-Source Contributor",
      fr: "Clarvia accueille son premier contributeur open source",
      de: "Clarvia begrüßt seinen ersten Open-Source-Mitwirkenden",
    },
    body: {
      en: "We are thrilled to officially welcome Hiren Gajjar to the Clarvia team as our first GitHub Outside Collaborator. After contributing six high-quality pull requests across both public repositories - including source verification research, accessibility improvements, SEO structured data, and a custom 404 page - we have upgraded Hiren to official write access to help shape the future of the codebase. Clarvia is built as open public-interest infrastructure, and having a dedicated volunteer contributor validates that this model works. We are incredibly grateful for the support and excited to see what we build together.",
      fr: "Nous avons le plaisir d'accueillir officiellement Hiren Gajjar dans l'équipe Clarvia en tant que premier collaborateur externe sur GitHub. Après six demandes de fusion de haute qualité sur nos deux dépôts publics - incluant la vérification de sources, l'amélioration de l'accessibilité, les données structurées SEO et une page 404 personnalisée - nous lui avons accordé un accès en écriture officiel pour contribuer à l'évolution du code. Clarvia est construit comme une infrastructure ouverte d'intérêt public, et l'arrivée d'un contributeur bénévole dévoué confirme que ce modèle fonctionne. Nous sommes profondément reconnaissants et impatients de voir ce que nous construirons ensemble.",
      de: "Wir freuen uns, Hiren Gajjar offiziell als unseren ersten externen GitHub-Mitwirkenden im Clarvia-Team willkommen zu heißen. Nach sechs hochwertigen Pull Requests in beiden öffentlichen Repositories - darunter Quellenverifizierung, Barrierefreiheitsverbesserungen, strukturierte SEO-Daten und eine individuelle 404-Seite - haben wir Hiren offiziellen Schreibzugriff gewährt, um die Zukunft der Codebasis mitzugestalten. Clarvia wird als offene, gemeinwohlorientierte Infrastruktur entwickelt, und ein engagierter ehrenamtlicher Mitwirkender bestätigt, dass dieses Modell funktioniert. Wir sind unglaublich dankbar und gespannt, was wir gemeinsam aufbauen werden.",
    },
  },
  {
    date: "2026-05-21",
    headline: {
      en: "GitHub for Nonprofits Application Approved",
      fr: "Candidature à GitHub for Nonprofits approuvée",
      de: "GitHub for Nonprofits-Antrag genehmigt",
    },
    logo: undefined,
    body: {
      en: "Clarvia has been accepted into the GitHub for Nonprofits programme and upgraded to the GitHub Teams plan. This gives the project professional-grade collaboration tools including branch protection, code ownership rules, and team management - at no cost. It is a meaningful step for a small nonprofit building open-source infrastructure.",
      fr: "Clarvia a été accepté dans le programme GitHub for Nonprofits et a bénéficié d'une mise à niveau vers le plan GitHub Teams. Le projet dispose désormais d'outils de collaboration professionnels, notamment la protection des branches, les règles de propriété du code et la gestion d'équipe - sans frais. C'est une étape importante pour une petite association développant une infrastructure open source.",
      de: "Clarvia wurde in das Programm GitHub for Nonprofits aufgenommen und auf den GitHub-Teams-Plan hochgestuft. Das Projekt verfügt nun über professionelle Zusammenarbeitstools wie Branch-Schutz, Code-Ownership-Regeln und Teamverwaltung - kostenlos. Ein bedeutsamer Schritt für einen kleinen Verein, der Open-Source-Infrastruktur aufbaut.",
    },
  },
  {
    date: "2026-05-20",
    headline: {
      en: "Clarvia Submits First Grant Application to Fund Vital Grief and Heritage Digital Tools",
      fr: "Clarvia soumet sa première demande de subvention pour des outils numériques de deuil et de patrimoine",
      de: "Clarvia reicht ersten Förderantrag für digitale Trauer- und Erbschaftstools ein",
    },
    body: {
      en: "Clarvia has submitted its first grant application to a foundation that supports projects of social value. The application outlines Clarvia's mission to reduce the administrative burden families face after bereavement, and requests funding to develop the first verified Luxembourg bereavement checklist and early heritage folder research. If successful, this grant would allow Clarvia to move from foundational infrastructure to a working public service. We look forward to sharing the outcome when a decision is reached.",
      fr: "Clarvia a soumis sa première demande de subvention auprès d'une fondation soutenant des projets à valeur sociale. La candidature présente la mission de Clarvia visant à réduire la charge administrative que les familles affrontent après un deuil, et sollicite un financement pour développer la première liste de démarches vérifiée pour le Luxembourg ainsi qu'une recherche préliminaire sur le dossier patrimonial. En cas de succès, cette subvention permettrait à Clarvia de passer d'une infrastructure de base à un service public opérationnel. Nous communiquerons le résultat dès qu'une décision sera prise.",
      de: "Clarvia hat seinen ersten Förderantrag bei einer Stiftung eingereicht, die Projekte mit sozialem Mehrwert unterstützt. Der Antrag beschreibt Clarvias Mission, die administrative Belastung trauernder Familien zu reduzieren, und beantragt Mittel für die Entwicklung der ersten verifizierten luxemburgischen Trauer-Checkliste und erste Forschung zum Erinnerungsordner. Bei Erfolg würde diese Förderung Clarvia ermöglichen, von der Grundlageninfrastruktur zu einem funktionierenden öffentlichen Dienst überzugehen. Wir freuen uns darauf, das Ergebnis mitzuteilen, sobald eine Entscheidung getroffen ist.",
    },
  },
  {
    date: "2026-05-19",
    headline: {
      en: "Goodstack Verification Complete",
      fr: "Vérification par Goodstack terminée",
      de: "Goodstack-Verifizierung abgeschlossen",
    },
    logo: undefined,
    body: {
      en: "Clarvia's non-profit status has been independently verified by Goodstack, a platform that connects non-profit organisations with technology partners. This verification confirms Clarvia ASBL's legitimacy as a registered Luxembourg association and unlocks access to discounted and donated technology services that help small nonprofits operate more effectively.",
      fr: "Le statut d'association sans but lucratif de Clarvia a été vérifié de manière indépendante par Goodstack, une plateforme qui met en relation les organisations à but non lucratif avec des partenaires technologiques. Cette vérification confirme la légitimité de Clarvia ASBL en tant qu'association luxembourgeoise enregistrée et donne accès à des services technologiques à prix réduit ou offerts qui aident les petites associations à fonctionner plus efficacement.",
      de: "Clarvias gemeinnütziger Status wurde unabhängig von Goodstack verifiziert, einer Plattform, die gemeinnützige Organisationen mit Technologiepartnern verbindet. Diese Verifizierung bestätigt die Legitimität von Clarvia ASBL als eingetragener luxemburgischer Verein und ermöglicht den Zugang zu vergünstigten oder gespendeten Technologiediensten, die kleinen Vereinen helfen, effektiver zu arbeiten.",
    },
  },
  {
    date: "2026-05-14",
    headline: {
      en: "Clarvia Launches on GitHub",
      fr: "Clarvia est lancé sur GitHub",
      de: "Clarvia startet auf GitHub",
    },
    body: {
      en: "Clarvia's open-source repositories are now live on GitHub under the clarvia-org organisation. The initial release includes structured workflow data and schemas for modelling bereavement administration, a validation pipeline, and contributor guidelines. Everything is open from day one - the code, the data, the methodology, and the governance. Contributions are welcome.",
      fr: "Les dépôts open source de Clarvia sont désormais en ligne sur GitHub sous l'organisation clarvia-org. La version initiale comprend des données de workflow structurées et des schémas pour modéliser l'administration du deuil, un pipeline de validation et des lignes directrices pour les contributeurs. Tout est ouvert dès le premier jour - le code, les données, la méthodologie et la gouvernance. Les contributions sont les bienvenues.",
      de: "Clarvias Open-Source-Repositories sind jetzt auf GitHub unter der Organisation clarvia-org verfügbar. Die erste Version umfasst strukturierte Workflow-Daten und Schemata zur Modellierung der Trauerverwaltung, eine Validierungspipeline und Richtlinien für Mitwirkende. Alles ist von Anfang an offen - der Code, die Daten, die Methodik und die Governance. Beiträge sind willkommen.",
    },
  },
  {
    date: "2026-05-13",
    headline: {
      en: "clarvia.org Is Live",
      fr: "clarvia.org est en ligne",
      de: "clarvia.org ist online",
    },
    body: {
      en: "The Clarvia website is live at clarvia.org and clarvia.eu. The site introduces the project's mission, explains the structured workflow approach, and provides information for potential contributors and partners. Available in English, French, and German.",
      fr: "Le site web de Clarvia est en ligne sur clarvia.org et clarvia.eu. Le site présente la mission du projet, explique l'approche structurée par workflows et fournit des informations pour les contributeurs et partenaires potentiels. Disponible en anglais, français et allemand.",
      de: "Die Clarvia-Website ist unter clarvia.org und clarvia.eu erreichbar. Die Seite stellt die Mission des Projekts vor, erläutert den strukturierten Workflow-Ansatz und bietet Informationen für potenzielle Mitwirkende und Partner. Verfügbar auf Englisch, Französisch und Deutsch.",
    },
  },
  {
    date: "2026-05-07",
    headline: {
      en: "Clarvia ASBL Founded in Luxembourg",
      fr: "Clarvia ASBL fondée au Luxembourg",
      de: "Clarvia ASBL in Luxemburg gegründet",
    },
    body: {
      en: "Clarvia ASBL has been officially registered as a non-profit association in Luxembourg. The association was founded to build open, source-backed workflow infrastructure that helps families navigate bereavement administration across Europe. Luxembourg is the first implementation because of its multilingual, cross-border reality - where a single family's situation can involve multiple countries, languages, and legal systems.",
      fr: "Clarvia ASBL a été officiellement enregistrée en tant qu'association sans but lucratif au Luxembourg. L'association a été fondée pour construire une infrastructure ouverte de workflows, appuyée sur des sources officielles, qui aide les familles à naviguer dans les démarches administratives liées au deuil en Europe. Le Luxembourg est le premier pays d'implémentation en raison de sa réalité multilingue et transfrontalière, où la situation d'une seule famille peut impliquer plusieurs pays, langues et systèmes juridiques.",
      de: "Clarvia ASBL wurde offiziell als gemeinnütziger Verein in Luxemburg eingetragen. Der Verein wurde gegründet, um eine offene, quellenbasierte Workflow-Infrastruktur aufzubauen, die Familien bei der Bewältigung der Trauerverwaltung in Europa unterstützt. Luxemburg ist die erste Umsetzung aufgrund seiner mehrsprachigen, grenzüberschreitenden Realität, in der die Situation einer einzigen Familie mehrere Länder, Sprachen und Rechtssysteme betreffen kann.",
    },
  },
];
