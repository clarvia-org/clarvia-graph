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
    date: "2026-06-26",
    headline: {
      en: "Clarvia submits project proposal for a free Belgian bereavement guide",
      fr: "Clarvia soumet un projet pour créer un guide belge gratuit sur les démarches après un décès",
      de: "Clarvia reicht Projektantrag für einen kostenlosen belgischen Leitfaden nach einem Todesfall ein",
    },
    body: {
      en: "Clarvia has submitted a project proposal to a Belgian philanthropic fund to create a free, practical guide to the first administrative steps after a death in Belgium. The project runs from October 2026 to January 2027. Clarvia finances 45% of the total project cost itself, and the directors contribute their time on an unpaid, voluntary basis on top of that. The guide will cover civil registration, banks, health insurance, pensions, housing, and succession - adapted for Wallonia, Flanders, Brussels, and the German-speaking community. If funded, this will be Clarvia's first expansion beyond Luxembourg.",
      fr: "Clarvia a soumis une demande de soutien à un fonds philanthropique belge afin de créer un guide gratuit et pratique consacré aux premières démarches administratives après un décès en Belgique. Le projet se déroulera d'octobre 2026 à janvier 2027. Clarvia finance elle-même 45 % du coût total du projet, en plus du temps consacré bénévolement et sans rémunération par les administrateurs. Le guide couvrira l'état civil, les banques, les mutualités, les pensions, le logement et la succession, avec une adaptation pour la Wallonie, la Flandre, Bruxelles et la communauté germanophone. Si le projet est soutenu, il s'agira de la première extension de Clarvia au-delà du Luxembourg.",
      de: "Clarvia hat bei einem belgischen gemeinnützigen Fonds einen Förderantrag eingereicht, um einen kostenlosen und praktischen Leitfaden zu den ersten administrativen Schritten nach einem Todesfall in Belgien zu erstellen. Das Projekt läuft von Oktober 2026 bis Januar 2027. Clarvia finanziert 45 % der gesamten Projektkosten selbst. Zusätzlich bringen die Vorstandsmitglieder ihre Zeit unbezahlt und ehrenamtlich ein. Der Leitfaden wird Personenstandsangelegenheiten, Banken, Krankenversicherung, Renten, Wohnen und Erbschaft abdecken und für Wallonien, Flandern, Brüssel sowie die Deutschsprachige Gemeinschaft angepasst. Im Falle einer Förderung wäre dies die erste Erweiterung von Clarvia über Luxemburg hinaus.",
    },
  },
  {
    date: "2026-06-25",
    headline: {
      en: "Clarvia YouTube channel launched",
      fr: "Lancement de la chaîne YouTube Clarvia",
      de: "Clarvia YouTube-Kanal gestartet",
    },
    body: {
      en: "Clarvia now has a YouTube channel to share our journey building practical support for families after loss. The first short introduces our mission — making the invisible admin job after a death more manageable. We plan to post 2–3 short videos per month.",
      fr: "Clarvia now has a YouTube channel to share our journey building practical support for families after loss. The first short introduces our mission — making the invisible admin job after a death more manageable. We plan to post 2–3 short videos per month.",
      de: "Clarvia now has a YouTube channel to share our journey building practical support for families after loss. The first short introduces our mission — making the invisible admin job after a death more manageable. We plan to post 2–3 short videos per month.",
    },
  },
  {
    date: "2026-06-24",
    headline: {
      en: "Clarvia's bereavement source register published on data.public.lu",
      fr: "Le registre des sources de deuil de Clarvia est publie sur data.public.lu",
      de: "Clarvias Trauerfall-Quellenregister auf data.public.lu veroeffentlicht",
    },
    body: {
      en: "Clarvia's first dataset is now published on data.public.lu, Luxembourg's national open data portal. The Bereavement Source Register is a structured, machine-readable registry of official government sources related to bereavement administration in Luxembourg, covering guidance from Guichet.lu, CNAP, CNS, and cross-border jurisdictions. The dataset is published under CC-BY-4.0. Clarvia ASBL is now listed as an organisation on the portal alongside government ministries and public institutions. Dataset: https://data.public.lu/en/datasets/bereavement-source-register-luxembourg/",
      fr: "Le premier jeu de donnees de Clarvia est desormais publie sur data.public.lu, le portail national de donnees ouvertes du Luxembourg. Le registre des sources de deuil est un repertoire structure et lisible par machine des sources gouvernementales officielles liees aux demarches administratives de deuil au Luxembourg, couvrant les informations de Guichet.lu, CNAP, CNS et les juridictions transfrontalieres. Le jeu de donnees est publie sous licence CC-BY-4.0. Clarvia ASBL est desormais repertoriee comme organisation sur le portail aux cotes des ministeres et institutions publiques. Jeu de donnees : https://data.public.lu/fr/datasets/bereavement-source-register-luxembourg/",
      de: "Der erste Datensatz von Clarvia ist jetzt auf data.public.lu, dem nationalen Open-Data-Portal Luxemburgs, veroeffentlicht. Das Trauerfall-Quellenregister ist ein strukturiertes, maschinenlesbares Verzeichnis offizieller Regierungsquellen zu Verwaltungsverfahren im Trauerfall in Luxemburg, das Informationen von Guichet.lu, CNAP, CNS und grenzueberschreitenden Zustaendigkeiten umfasst. Der Datensatz ist unter CC-BY-4.0 lizenziert. Clarvia ASBL ist nun als Organisation auf dem Portal neben Ministerien und oeffentlichen Institutionen gelistet. Datensatz: https://data.public.lu/de/datasets/bereavement-source-register-luxembourg/",
    },
  },
  {
    date: "2026-06-24",
    headline: {
      en: "GitHub Sponsors now active for Clarvia",
      fr: "GitHub Sponsors est maintenant actif pour Clarvia",
      de: "GitHub Sponsors jetzt aktiv fuer Clarvia",
    },
    body: {
      en: "Clarvia is now enrolled in GitHub Sponsors. Anyone who values free, multilingual bereavement guidance can support the project directly through GitHub. Sponsorships help fund development, hosting, and the expansion of Clarvia's checklist to new countries. The Sponsor button is now visible on all Clarvia repositories.",
      fr: "Clarvia est desormais inscrit sur GitHub Sponsors. Toute personne attachee a un accompagnement administratif gratuit et multilingue en cas de deuil peut soutenir le projet directement via GitHub. Les parrainages contribuent a financer le developpement, l'hebergement et l'extension de la checklist Clarvia a de nouveaux pays. Le bouton Sponsor est desormais visible sur tous les depots Clarvia.",
      de: "Clarvia ist jetzt bei GitHub Sponsors registriert. Alle, die kostenlose und mehrsprachige Unterstuetzung bei Verwaltungsaufgaben im Trauerfall schaetzen, koennen das Projekt direkt ueber GitHub unterstuetzen. Sponsoring hilft bei der Finanzierung von Entwicklung, Hosting und der Erweiterung der Clarvia-Checkliste auf weitere Laender. Der Sponsor-Button ist jetzt auf allen Clarvia-Repositories sichtbar.",
    },
  },
  {
    date: "2026-06-22",
    headline: {
      en: "Clarvia support page is live",
      fr: "La page de soutien Clarvia est en ligne",
      de: "Clarvia-Unterstuetzungsseite ist online",
    },
    body: {
      en: "Clarvia now has a dedicated support page at clarvia.org/en/support. The page accepts one-time and recurring donations via Stripe, available in English, French, and German. All contributions go directly to Clarvia ASBL and help fund development, hosting, and country expansion.",
      fr: "Clarvia dispose desormais d'une page de soutien dediee sur clarvia.org/fr/support. La page accepte les dons ponctuels et recurrents via Stripe, disponible en anglais, francais et allemand. Toutes les contributions vont directement a Clarvia ASBL et aident a financer le developpement, l'hebergement et l'expansion vers de nouveaux pays.",
      de: "Clarvia hat jetzt eine eigene Unterstuetzungsseite unter clarvia.org/de/support. Die Seite akzeptiert einmalige und wiederkehrende Spenden ueber Stripe, verfuegbar auf Englisch, Franzoesisch und Deutsch. Alle Beitraege gehen direkt an Clarvia ASBL und helfen bei der Finanzierung von Entwicklung, Hosting und Laendererweiterung.",
    },
  },
  {
    date: "2026-06-08",
    headline: {
      en: "Continuous code quality analysis via SonarCloud",
      fr: "Analyse continue de la qualite du code via SonarCloud",
      de: "Kontinuierliche Codequalitaetsanalyse via SonarCloud",
    },
    body: {
      en: "Clarvia Graph is now continuously analysed by SonarCloud, one of the most widely recognised code quality platforms in the open source ecosystem. Every commit is checked for bugs, security vulnerabilities, code smells, and maintainability issues. SonarCloud is particularly valued as an independent quality signal. The SonarCloud quality gate badge is now displayed in the clarvia-graph README and the Clarvia organisation profile.",
      fr: "Clarvia Graph est desormais analyse en continu par SonarCloud, l'une des plateformes de qualite de code les plus reconnues dans l'ecosysteme open source. Chaque commit est verifie pour les bugs, les vulnerabilites de securite, les mauvaises pratiques de code et les problemes de maintenabilite. SonarCloud est particulierement apprecie comme signal de qualite independant. Le badge SonarCloud est desormais affiche dans le README de clarvia-graph et dans le profil de l'organisation Clarvia.",
      de: "Clarvia Graph wird jetzt kontinuierlich von SonarCloud analysiert, einer der anerkanntesten Plattformen fuer Codequalitaet im Open-Source-Oekosystem. Jeder Commit wird auf Bugs, Sicherheitsluecken, Code Smells und Wartbarkeitsprobleme geprueft. SonarCloud wird besonders als unabhaengiges Qualitaetssignal geschaetzt. Das SonarCloud-Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.",
    },
  },
  {
    date: "2026-06-08",
    headline: {
      en: "Test coverage monitoring via Codecov",
      fr: "Suivi de la couverture de tests via Codecov",
      de: "Testabdeckungs-Monitoring via Codecov",
    },
    body: {
      en: "Clarvia Graph now tracks test coverage automatically using Codecov. Every pull request and merge to main measures how much of the codebase is exercised by the test suite, with results reported directly in GitHub. This gives contributors and reviewers immediate visibility into whether changes improve or reduce test coverage. The Codecov badge is now displayed in the clarvia-graph README and the Clarvia organisation profile.",
      fr: "Clarvia Graph suit desormais automatiquement la couverture de tests grace a Codecov. Chaque pull request et chaque fusion vers main mesure la part du code exercee par la suite de tests, avec des resultats reportes directement dans GitHub. Cela offre aux contributeurs et relecteurs une visibilite immediate sur l'impact des modifications sur la couverture de tests. Le badge Codecov est desormais affiche dans le README de clarvia-graph et dans le profil de l'organisation Clarvia.",
      de: "Clarvia Graph verfolgt die Testabdeckung jetzt automatisch mit Codecov. Jeder Pull Request und jeder Merge auf main misst, welcher Anteil des Codes durch die Testsuite abgedeckt wird, wobei die Ergebnisse direkt in GitHub angezeigt werden. So sehen Mitwirkende und Reviewer sofort, ob Aenderungen die Testabdeckung verbessern oder verringern. Das Codecov-Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.",
    },
  },
  {
    date: "2026-06-07",
    headline: {
      en: "FSFE REUSE compliance achieved",
      fr: "Conformite a la specification REUSE de la FSFE",
      de: "FSFE REUSE-Konformitaet erreicht",
    },
    body: {
      en: "Clarvia Graph is now fully compliant with the FSFE REUSE specification (version 3.3) - every file in the repository carries machine-readable SPDX copyright and license information. REUSE is the licensing standard explicitly recommended by the European Commission for publicly funded open source projects. A CI workflow enforces compliance on every pull request. The REUSE badge is now displayed on the clarvia-graph README and the Clarvia organisation profile.",
      fr: "Clarvia Graph est desormais entierement conforme a la specification REUSE de la FSFE (version 3.3) - chaque fichier du depot contient des informations de copyright et de licence lisibles par machine au format SPDX. REUSE est la norme de licence explicitement recommandee par la Commission europeenne pour les projets open source finances par des fonds publics. Un workflow CI garantit la conformite a chaque pull request. Le badge REUSE est desormais affiche dans le README de clarvia-graph et dans le profil de l'organisation Clarvia.",
      de: "Clarvia Graph ist jetzt vollstaendig konform mit der FSFE REUSE-Spezifikation (Version 3.3) - jede Datei im Repository enthaelt maschinenlesbare SPDX-Copyright- und Lizenzinformationen. REUSE ist der Lizenzstandard, der von der Europaeischen Kommission ausdruecklich fuer oeffentlich finanzierte Open-Source-Projekte empfohlen wird. Ein CI-Workflow stellt die Konformitaet bei jedem Pull Request sicher. Das REUSE-Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.",
    },
  },
  {
    date: "2026-06-07",
    headline: {
      en: "OpenSSF Scorecard enabled for automated security scoring",
      fr: "OpenSSF Scorecard active pour l'evaluation automatisee de la securite",
      de: "OpenSSF Scorecard fuer automatisierte Sicherheitsbewertung aktiviert",
    },
    body: {
      en: "Clarvia Graph now runs the OpenSSF Scorecard - an automated tool from the Open Source Security Foundation that evaluates security best practices including branch protection, CI/CD configuration, dependency management, and vulnerability disclosure. Results are published weekly to the OpenSSF API and integrated into GitHub code scanning. The Scorecard badge is now displayed on the clarvia-graph README and the Clarvia organisation profile.",
      fr: "Clarvia Graph utilise desormais l'OpenSSF Scorecard - un outil automatise de l'Open Source Security Foundation qui evalue les bonnes pratiques de securite, notamment la protection des branches, la configuration CI/CD, la gestion des dependances et la divulgation des vulnerabilites. Les resultats sont publies chaque semaine sur l'API OpenSSF et integres dans l'analyse de code GitHub. Le badge Scorecard est desormais affiche dans le README de clarvia-graph et dans le profil de l'organisation Clarvia.",
      de: "Clarvia Graph nutzt jetzt die OpenSSF Scorecard - ein automatisiertes Tool der Open Source Security Foundation, das Sicherheitspraktiken wie Branch-Schutz, CI/CD-Konfiguration, Abhaengigkeitsverwaltung und Offenlegung von Schwachstellen bewertet. Die Ergebnisse werden woechentlich an die OpenSSF-API veroeffentlicht und in das GitHub-Code-Scanning integriert. Das Scorecard-Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.",
    },
  },
  {
    date: "2026-06-06",
    headline: {
      en: "FAIR software compliance",
      fr: "Conformite FAIR",
      de: "FAIR-Softwarekonformitaet",
    },
    body: {
      en: "Clarvia Graph now meets 4 out of 5 recommendations from fair-software.eu, covering open repository, open license, citation via Zenodo DOI, and a software quality checklist via OpenSSF Best Practices. The only unmet recommendation is registration in a package registry, which does not apply to a data and ontology project. The FAIR badge is now displayed in the clarvia-graph README and the Clarvia organisation profile.",
      fr: "Clarvia Graph remplit desormais 4 des 5 recommandations de fair-software.eu, couvrant le depot ouvert, la licence ouverte, la citation via un DOI Zenodo et une liste de controle qualite via OpenSSF Best Practices. La seule recommandation non remplie est l'enregistrement dans un registre de paquets, ce qui ne s'applique pas a un projet de donnees et d'ontologie. Le badge FAIR est desormais affiche dans le README de clarvia-graph et dans le profil de l'organisation Clarvia.",
      de: "Clarvia Graph erfuellt nun 4 der 5 Empfehlungen von fair-software.eu: offenes Repository, offene Lizenz, Zitierbarkeit ueber Zenodo-DOI und eine Qualitaetscheckliste ueber OpenSSF Best Practices. Die einzige nicht erfuellte Empfehlung ist die Registrierung in einem Paketregister, was auf ein Daten- und Ontologieprojekt nicht zutrifft. Das FAIR-Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.",
    },
  },
  {
    date: "2026-06-06",
    headline: {
      en: "Clarvia Graph is now citable - DOI via Zenodo",
      fr: "Clarvia Graph est desormais citable - DOI via Zenodo",
      de: "Clarvia Graph ist jetzt zitierbar - DOI via Zenodo",
    },
    body: {
      en: "Clarvia Graph has been archived on Zenodo and assigned a persistent Digital Object Identifier (DOI). Researchers, institutions, and grant reviewers can now formally cite the project in academic publications and funding proposals. Each future release will be automatically archived with a versioned DOI. Record: doi.org/10.5281/zenodo.20572455",
      fr: "Clarvia Graph a ete archive sur Zenodo et a recu un identifiant d'objet numerique (DOI) persistant. Les chercheurs, institutions et evaluateurs de subventions peuvent desormais citer formellement le projet dans leurs publications academiques et demandes de financement. Chaque future version sera automatiquement archivee avec un DOI versionne. Enregistrement : doi.org/10.5281/zenodo.20572455",
      de: "Clarvia Graph wurde auf Zenodo archiviert und hat einen persistenten Digital Object Identifier (DOI) erhalten. Forschende, Institutionen und Foerdermittelgutachter koennen das Projekt nun formal in wissenschaftlichen Publikationen und Foerderantraegen zitieren. Jede zukuenftige Version wird automatisch mit einer versionierten DOI archiviert. Eintrag: doi.org/10.5281/zenodo.20572455",
    },
  },
  {
    date: "2026-06-06",
    headline: {
      en: "OpenSSF Best Practices badge - 100% passing",
      fr: "Badge OpenSSF Best Practices - 100% des criteres remplis",
      de: "OpenSSF Best Practices Badge - 100% bestanden",
    },
    body: {
      en: "clarvia-graph has earned the OpenSSF Best Practices passing badge with a perfect score - 67 out of 67 criteria met. The badge covers security practices, change control, reporting, quality assurance, and analysis. It is one of the most respected signals of project maturity in open source. The badge is now displayed in the clarvia-graph README and the Clarvia organisation profile.",
      fr: "clarvia-graph a obtenu le badge OpenSSF Best Practices au niveau \"passing\" avec un score parfait - 67 criteres sur 67 remplis. Le badge couvre les pratiques de securite, le controle des modifications, le signalement, l'assurance qualite et l'analyse. C'est l'un des indicateurs de maturite les plus respectes dans le monde du logiciel libre. Le badge est desormais affiche dans le README de clarvia-graph et dans le profil de l'organisation Clarvia.",
      de: "clarvia-graph hat das OpenSSF Best Practices Badge auf der Stufe \"passing\" mit einem perfekten Ergebnis erhalten - 67 von 67 Kriterien erfuellt. Das Badge deckt Sicherheitspraktiken, Aenderungskontrolle, Berichterstattung, Qualitaetssicherung und Analyse ab. Es ist eines der angesehensten Reifezeichen in der Open-Source-Welt. Das Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.",
    },
  },
  {
    date: "2026-06-03",
    headline: {
      en: "Clarvia Launches First Preliminary Alpha Checklist",
      fr: "Clarvia lance sa première liste de contrôle préliminaire en version alpha",
      de: "Clarvia veröffentlicht erste vorläufige Alpha-Checkliste",
    },
    body: {
      en: "We have launched the first preliminary, experimental alpha checklist on the Clarvia website to test our underlying consequence graph model. This early release serves as a proof of concept, demonstrating how official public sources can be modeled and evaluated client-side to generate dynamic administrative guidance for bereavement. Available for initial testing under the /checklist route, this alpha version uses a simplified Luxembourg bereavement scenario to verify the end-to-end routing logic before we expand our source coverage. For technical details on the graph model behind the checklist, see the announcement on GitHub: https://github.com/clarvia-org/clarvia-graph/discussions/40",
      fr: "Nous avons mis en ligne la première version alpha préliminaire et expérimentale de la liste de démarches sur le site de Clarvia pour tester notre modèle sous-jacent de graphe de conséquences. Cette version initiale sert de preuve de concept, illustrant comment les sources publiques officielles peuvent être modélisées et évaluées côté client pour générer des conseils administratifs dynamiques pour le deuil. Disponible pour des tests initiaux sous la route /checklist, cette version alpha utilise un scénario simplifié de deuil au Luxembourg pour valider la logique de routage de bout en bout avant d'étendre la couverture des sources. Pour les détails techniques sur le modèle de graphe derrière la liste de démarches, consultez l'annonce sur GitHub : https://github.com/clarvia-org/clarvia-graph/discussions/40",
      de: "Wir haben die erste vorläufige, experimentelle Alpha-Checkliste auf der Clarvia-Website veröffentlicht, um unser zugrunde liegendes Konsequenz-Graph-Modell zu testen. Diese frühe Version dient als Machbarkeitsnachweis und zeigt, wie offizielle öffentliche Quellen modelliert und clientseitig ausgewertet werden können, um dynamische administrative Unterstützung im Trauerfall zu generieren. Diese Alpha-Version ist für erste Tests unter dem Pfad /checklist verfügbar und nutzt ein vereinfachtes Luxemburger Trauerfallszenario, um die durchgehende Routing-Logik zu verifizieren, bevor wir unsere Quellenabdeckung erweitern. Technische Details zum Graph-Modell hinter der Checkliste finden Sie in der Ankündigung auf GitHub: https://github.com/clarvia-org/clarvia-graph/discussions/40",
    },
  },
  {
    date: "2026-06-03",
    headline: {
      en: "Clarvia Joins the Open Invention Network Community",
      fr: "Clarvia rejoint la communauté de l'Open Invention Network",
      de: "Clarvia tritt der Open Invention Network-Gemeinschaft bei",
    },
    body: {
      en: "Clarvia has joined the Open Invention Network (OIN) community, supporting patent non-aggression around open-source software. By participating in this global defensive patent pool, we reinforce our commitment to building open, public-interest infrastructure that remains free and accessible to all.",
      fr: "Clarvia a rejoint la communauté de l'Open Invention Network (OIN), soutenant la non-agression en matière de brevets autour des logiciels open source. En participant à ce regroupement mondial de défense des brevets, nous renforçons notre engagement à développer une infrastructure ouverte d'intérêt public qui reste libre et accessible à tous.",
      de: "Clarvia ist der Gemeinschaft des Open Invention Network (OIN) beigetreten, um die Patent-Non-Aggression im Bereich von Open-Source-Software zu unterstützen. Durch unsere Teilnahme an diesem globalen defensiven Patentpool stärken wir unser Engagement für den Aufbau einer offenen, gemeinwohlorientierten Infrastruktur, die für alle frei und zugänglich bleibt.",
    },
  },
  {
    date: "2026-05-29",
    headline: {
      en: "Clarvia Submits Proposal for Reusable Workflow Commons Infrastructure",
      fr: "Clarvia soumet une proposition pour l'infrastructure des Workflows Communs réutilisables",
      de: "Clarvia reicht Vorschlag für wiederverwendbare Workflow-Commons-Infrastruktur ein",
    },
    body: {
      en: "Clarvia has submitted a grant proposal to fund the development of our core open-source workflow infrastructure. This project focuses on building the underlying schema design, provenance machinery, validation tooling, and machine-readable export formats that will make up the Clarvia Workflow Commons. By standardizing how administrative procedures are modelled, versioned, and validated, we aim to create a reusable technical foundation that can be adopted across multiple European jurisdictions. We will share further updates once the proposal has been evaluated.",
      fr: "Clarvia a soumis une demande de subvention pour financer le développement de son infrastructure open source de workflows. Ce projet se concentre sur la création de la structure des schémas sous-jacents, du mécanisme de provenance, des outils de validation et des formats d'exportation lisibles par machine qui constitueront les Workflows Communs de Clarvia. En standardisant la manière dont les démarches administratives sont modélisées, versionnées et validées, notre objectif est de créer une base technique réutilisable pouvant être adoptée dans plusieurs juridictions européennes. Nous partagerons de nouvelles informations dès que la proposition aura été évaluée.",
      de: "Clarvia hat einen Förderantrag eingereicht, um die Entwicklung unserer Open-Source-Workflow-Infrastruktur zu finanzieren. Dieses Projekt konzentriert sich auf den Aufbau des zugrunde liegenden Schema-Designs, des Herkunfts-Nachweis-Systems, der Validierungswerkzeuge und maschinenlesbarer Exportformate, die die Clarvia Workflow Commons bilden werden. Durch die Standardisierung der Art und Weise, wie Verwaltungsverfahren modelliert, versioniert und validiert werden, wollen wir eine wiederverwendbare technische Grundlage schaffen, die in verschiedenen europäischen Ländern eingesetzt werden kann. Wir werden weitere Updates teilen, sobald der Antrag geprüft wurde.",
    },
  },
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
      en: "TSC Real Estate Endorses Clarvia's Mission with Strong Support Letter",
      fr: "TSC Real Estate soutient la mission de Clarvia avec une lettre de recommandation",
      de: "TSC Real Estate unterstützt Clarvias Mission mit starkem Empfehlungsschreiben",
    },
    body: {
      en: "Prior to our official registration, TSC Real Estate provided a strong letter of support endorsing Clarvia's mission. As a leading healthcare real estate manager operating across Europe, TSC Real Estate highlighted the public-interest value of our open, source-backed administrative workflow infrastructure. We are incredibly grateful for their early trust and support, which helped validate our plans during the foundation process.",
      fr: "En amont de notre constitution officielle, TSC Real Estate a fourni une solide lettre de soutien approuvant la mission de Clarvia. En tant que gestionnaire d'actifs immobiliers de santé de premier plan en Europe, TSC Real Estate a souligné la valeur d'intérêt public de notre infrastructure de workflows administratifs ouverts et fondés sur des sources. Nous sommes profondément reconnaissants de leur confiance et de leur soutien précoces, qui ont contribué à valider nos plans durant le processus de fondation.",
      de: "Noch vor unserer offiziellen Vereinsgründung hat TSC Real Estate ein starkes Unterstützungsschreiben vorgelegt, das Clarvias Mission bekräftigt. Als führender Manager von Gesundheitsimmobilien in Europa hob TSC Real Estate den gemeinnützigen Wert unserer offenen, quellenbasierten Infrastruktur für administrative Workflows hervor. Wir sind unglaublich dankbar für dieses frühe Vertrauen und die Unterstützung, die unsere Pläne während des Gründungsprozesses bestätigt haben.",
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
