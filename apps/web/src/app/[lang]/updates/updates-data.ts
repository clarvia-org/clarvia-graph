export type Update = {
  date: string;
  headline: { en: string; fr: string; de: string; lu?: string };
  body?: { en: string; fr: string; de: string; lu?: string };
  logo?: string;
};

/* Newest first — sorted by date descending */
export const UPDATES: Update[] = [
  {
    date: "2026-08-22",
    headline: {
      en: "Clarvia launches 'Ask Clarvia' to provide direct, automated guidance from the homepage",
      fr: "Clarvia lance « Demandez à Clarvia », un service d’orientation directe et automatisée accessible depuis la page d’accueil",
      de: "Clarvia startet „Clarvia fragen“ für direkte, automatisierte Orientierung über die Startseite",
      lu: "Clarvia lancéiert „Clarvia froen“ fir direkt an automatiséiert Orientéierung iwwer d'Startsäit",
    },
    body: {
      en: 'Clarvia has introduced "Ask Clarvia", a direct interactive service on the clarvia.org homepage designed to help families and individuals quickly navigate administrative procedures following a loss.\n\nVisitors can describe their current situation or question directly on the website. The query is securely processed by our automated guidance pipeline, and a detailed, structured reply is sent back by email signed by "Lex from Clarvia". The response provides clear next steps, applicable deadlines, relevant public authorities to contact, and verified official sources.\n\nAsk Clarvia is completely free to use, requires no account registration, and complements our structured open-source legal database (lex) and interactive checklist tools.',
      fr: "Clarvia a lancé « Demandez à Clarvia », un service interactif directement accessible depuis la page d’accueil de clarvia.org. Il aide les familles et les particuliers à s’orienter rapidement dans les démarches administratives qui suivent un décès.\n\nLes visiteurs peuvent décrire leur situation ou poser leur question directement sur le site. La demande est traitée de manière sécurisée par notre système automatisé d’orientation. Une réponse détaillée et structurée, signée « Lex de Clarvia », leur est ensuite envoyée par e-mail. Elle présente clairement les prochaines étapes, les délais applicables, les autorités publiques compétentes à contacter et des sources officielles vérifiées.\n\nDemandez à Clarvia est entièrement gratuit, ne nécessite aucune création de compte et complète notre base de données juridique structurée et open source (lex), ainsi que nos outils de checklist interactifs.",
      de: "Clarvia hat mit „Clarvia fragen“ einen interaktiven Service eingeführt, der direkt über die Startseite von clarvia.org erreichbar ist. Er hilft Familien und Einzelpersonen, sich nach einem Todesfall schnell in den erforderlichen Verwaltungsverfahren zurechtzufinden.\n\nBesucherinnen und Besucher können ihre aktuelle Situation oder ihre Frage direkt auf der Website beschreiben. Die Anfrage wird sicher durch unser automatisiertes Orientierungssystem verarbeitet. Anschließend wird eine ausführliche, strukturierte und mit „Lex von Clarvia“ unterzeichnete Antwort per E-Mail versendet. Sie enthält klare nächste Schritte, geltende Fristen, die zuständigen Behörden und geprüfte amtliche Quellen.\n\nClarvia fragen ist vollständig kostenlos, erfordert keine Registrierung und ergänzt unsere strukturierte, quelloffene Rechtsdatenbank (lex) sowie unsere interaktiven Checklisten.",
      lu: "Clarvia huet mat „Clarvia froen“ en interaktive Service lancéiert, deen direkt iwwer d'Startsäit vu clarvia.org disponibel ass. E soll Famillen an Eenzelpersounen hëllefen, sech no engem Doudesfall méi séier an den néidegen administrativen Demarchen erëmzefannen.\n\nVisiteure kënnen hir Situatioun oder hir Fro direkt op der Websäit beschreiwen. D'Ufro gëtt sécher vun eisem automatiséierten Orientéierungssystem verschafft. Duerno kréie si per E-Mail eng detailléiert a kloer strukturéiert Äntwert, ënnerschriwwe mam Numm „Lex vu Clarvia“. D'Äntwert weist déi nächst Schrëtt, uwennbar Fristen, zoustänneg Administratiounen a kontrolléiert offiziell Quellen.\n\nClarvia froen ass gratis, verlaangt kee Benotzerkont an ergänzt eis strukturéiert Open-Source-Rechtsdatebank lex an eis interaktiv Checklëschten.",
    },
  },
  {
    date: "2026-08-21",
    headline: {
      en: "Open-source community contributors help improve Clarvia",
      fr: "La communauté open source contribue à améliorer Clarvia",
      de: "Mitwirkende aus der Open-Source-Community helfen, Clarvia zu verbessern",
    },
    body: {
      en: "As an open-source public-interest project, Clarvia relies on community collaboration to make essential public guidance more accessible. We are excited to highlight recent contributions from open-source developers who have helped enhance the clarvia-graph codebase.\n\nCommunity contributions have brought important refinements across our repository, including plain-language review of our English checklist instructions, improved empty states, and web accessibility enhancements. These improvements ensure that our tools remain clear, welcoming, and easy to navigate for everyone.\n\nWe welcome developers, researchers, and translators to explore our open issues and collaborate with us on GitHub: https://github.com/clarvia-org/clarvia-graph",
      fr: "En tant que projet open source d’intérêt général, Clarvia s’appuie sur la collaboration de sa communauté pour rendre les informations publiques essentielles plus accessibles. Nous sommes heureux de mettre en lumière les récentes contributions de développeurs open source qui ont participé à l’amélioration de la base de code de clarvia-graph.\n\nCes contributions ont permis d’apporter d’importantes améliorations à notre dépôt, notamment une révision en langage clair des instructions de notre checklist en anglais, de meilleurs états vides et une accessibilité web renforcée. Grâce à ces changements, nos outils restent clairs, accueillants et faciles à utiliser pour tout le monde.\n\nNous invitons les développeurs, les chercheurs et les traducteurs à consulter nos tickets ouverts et à collaborer avec nous sur GitHub : https://github.com/clarvia-org/clarvia-graph",
      de: "Als gemeinwohlorientiertes Open-Source-Projekt ist Clarvia auf die Zusammenarbeit mit der Community angewiesen, um wichtige öffentliche Informationen leichter zugänglich zu machen. Wir freuen uns, aktuelle Beiträge von Open-Source-Entwicklerinnen und -Entwicklern hervorzuheben, die zur Verbesserung der Codebasis von clarvia-graph beigetragen haben.\n\nDie Beiträge aus der Community haben wichtige Verbesserungen in unserem Repository ermöglicht. Dazu gehören eine Überarbeitung der englischen Checklistenanweisungen in verständlicher Sprache, verbesserte Leerzustände und eine höhere Barrierefreiheit im Web. Diese Änderungen tragen dazu bei, dass unsere Werkzeuge für alle klar, einladend und einfach zu bedienen bleiben.\n\nWir laden Entwicklerinnen und Entwickler, Forschende sowie Übersetzerinnen und Übersetzer ein, unsere offenen Issues anzusehen und auf GitHub mit uns zusammenzuarbeiten: https://github.com/clarvia-org/clarvia-graph",
    },
  },
  {
    date: "2026-08-18",
    headline: {
      en: "Alpha checklist updated with enhanced accessibility and clearer guidance",
      fr: "La checklist alpha bénéficie d’une meilleure accessibilité et d’indications plus claires",
      de: "Alpha-Checkliste mit verbesserter Barrierefreiheit und klareren Hinweisen aktualisiert",
      lu: "Alpha-Checklëscht mat besserer Accessibilitéit a méi kloren Erklärungen aktualiséiert",
    },
    body: {
      en: "We have released an update to the preliminary alpha checklist on the Clarvia website (/checklist), focusing on accessibility standards and plain-language communication.\n\nThe update introduces refined ARIA attributes, improved keyboard navigation, and enhanced contrast across interactive checklist items. In addition, the introductory sections and guidance notes have undergone a plain-language pass to ensure complex administrative procedures and legal requirements are simple and stress-free to understand.\n\nThese updates help ensure that our dynamic consequence graph remains fully usable across all devices and assistive technologies as we continue expanding our coverage of European jurisdictions.",
      fr: "Nous avons publié une mise à jour de la checklist en version alpha préliminaire sur le site de Clarvia (/checklist), en mettant l’accent sur les normes d’accessibilité et la communication en langage clair.\n\nCette mise à jour affine les attributs ARIA, améliore la navigation au clavier et renforce les contrastes des éléments interactifs de la checklist. Les sections d’introduction et les notes explicatives ont également été réécrites en langage clair afin de rendre les procédures administratives complexes et les obligations légales plus simples à comprendre et aussi peu stressantes que possible.\n\nCes améliorations permettent à notre graphe dynamique des conséquences de rester pleinement utilisable sur tous les appareils et avec les technologies d’assistance, tandis que nous continuons à étendre notre couverture à d’autres juridictions européennes.",
      de: "Wir haben die vorläufige Alpha-Version der Checkliste auf der Clarvia-Website (/checklist) aktualisiert. Im Mittelpunkt stehen die Einhaltung von Barrierefreiheitsstandards und eine leicht verständliche Sprache.\n\nDas Update umfasst überarbeitete ARIA-Attribute, eine verbesserte Tastaturnavigation und stärkere Kontraste bei den interaktiven Elementen der Checkliste. Außerdem wurden die einleitenden Abschnitte und Hinweise sprachlich überarbeitet, damit komplexe Verwaltungsverfahren und rechtliche Anforderungen einfach und ohne unnötige Belastung verständlich sind.\n\nDiese Verbesserungen tragen dazu bei, dass unser dynamischer Folgegraph auf allen Geräten und mit assistiven Technologien vollständig nutzbar bleibt, während wir die Abdeckung weiterer europäischer Rechtsordnungen ausbauen.",
      lu: "Mir hunn déi virleefeg Alpha-Versioun vun der Checklëscht op der Clarvia-Websäit (/checklist) aktualiséiert. Dobäi louchen d'Accessibilitéit an eng einfach, verständlech Sprooch am Mëttelpunkt.\n\nDen Update ëmfaasst iwwerschafft ARIA-Attributer, eng besser Navigatioun mat der Tastatur a méi staark Kontraster bei den interaktiven Elementer. Och d'Aféierung an d'Erklärunge goufe méi einfach formuléiert, fir komplex administrativ Demarchen a rechtlech Ufuerderunge méi liicht verständlech ze maachen.\n\nDës Verbesserunge suergen dofir, datt eisen dynamesche Konsequenzgraph op allen Apparater a mat Hëllefstechnologien benotzbar bleift, wärend mir weider europäesch Rechtsuerdnungen ofdecken.",
    },
  },
  {
    date: "2026-08-11",
    headline: {
      en: "Privacy by design: How Clarvia automatically redacts sensitive personal data under GDPR",
      fr: "Protection des données dès la conception : comment Clarvia masque automatiquement les données personnelles sensibles conformément au RGPD",
      de: "Datenschutz von Anfang an: Wie Clarvia sensible personenbezogene Daten gemäß DSGVO automatisch entfernt",
      lu: "Dateschutz vun Ufank un: Wéi Clarvia sensibel perséinlech Donnéeën automatesch am Aklang mam RGPD läscht",
    },
    body: {
      en: "When navigating bereavement or end-of-life administration, people frequently handle documents and questions containing highly sensitive personal data. To protect user confidentiality in full alignment with GDPR principles, Clarvia has implemented a deterministic, privacy-by-design redaction pipeline.\n\nBefore any automated processing or language model evaluation occurs, our systems automatically identify and strip sensitive identifiers, including email addresses, phone numbers, IBANs, bank account numbers, payment cards, national identity numbers, passport numbers, and medical or insurance policy identifiers.\n\nIn addition, user IP addresses and sender email addresses are never stored in plain text in our persistent application databases. By anonymising input data at the application boundary, Clarvia ensures that families receive practical, verified guidance without compromising their personal privacy.",
      fr: "Lorsqu’une personne doit gérer des démarches liées à un décès ou à une fin de vie, elle manipule souvent des documents et pose des questions contenant des données personnelles particulièrement sensibles. Afin de protéger la confidentialité des utilisateurs dans le plein respect des principes du RGPD, Clarvia a mis en place un processus déterministe de masquage des données, fondé sur la protection des données dès la conception.\n\nAvant tout traitement automatisé ou toute analyse par un modèle de langage, nos systèmes détectent et suppriment automatiquement les identifiants sensibles. Cela comprend notamment les adresses e-mail, les numéros de téléphone, les IBAN, les numéros de compte bancaire, les cartes de paiement, les numéros nationaux d’identification, les numéros de passeport ainsi que les identifiants médicaux ou de contrats d’assurance.\n\nPar ailleurs, les adresses IP des utilisateurs et les adresses e-mail des expéditeurs ne sont jamais conservées en clair dans les bases de données permanentes de notre application. En anonymisant les données dès leur entrée dans l’application, Clarvia permet aux familles de recevoir des informations pratiques et vérifiées sans compromettre la confidentialité de leurs données personnelles.",
      de: "Bei Verwaltungsangelegenheiten rund um einen Todesfall oder das Lebensende arbeiten Menschen häufig mit Dokumenten und Fragen, die besonders sensible personenbezogene Daten enthalten. Um die Vertraulichkeit der Nutzerinnen und Nutzer vollständig im Einklang mit den Grundsätzen der DSGVO zu schützen, hat Clarvia einen deterministischen Prozess zur Datenbereinigung nach dem Prinzip „Datenschutz von Anfang an“ eingeführt.\n\nBevor eine automatisierte Verarbeitung oder Auswertung durch ein Sprachmodell stattfindet, erkennen und entfernen unsere Systeme automatisch sensible Identifikationsmerkmale. Dazu gehören E-Mail-Adressen, Telefonnummern, IBANs, Bankkontonummern, Zahlungskarten, nationale Identifikationsnummern, Reisepassnummern sowie medizinische Kennnummern und Versicherungsnummern.\n\nDarüber hinaus werden die IP-Adressen der Nutzerinnen und Nutzer sowie die E-Mail-Adressen der Absender niemals im Klartext in unseren dauerhaft genutzten Anwendungsdatenbanken gespeichert. Indem Clarvia eingegebene Daten bereits beim Eingang in die Anwendung anonymisiert, erhalten Familien praktische und geprüfte Orientierung, ohne dass die Vertraulichkeit ihrer persönlichen Daten beeinträchtigt wird.",
      lu: "Bei administrativen Demarchen am Zesummenhang mat engem Doudesfall oder dem Liewensenn hunn d'Leit dacks mat Dokumenter a Froen ze dinn, déi besonnesch sensibel perséinlech Donnéeën enthalen. Fir d'Vertraulechkeet vun de Benotzer am Aklang mat de Grondsätz vum RGPD ze schützen, huet Clarvia en deterministesche Prozess agefouert, deen Donnéeë vun Ufank un anonymiséiert.\n\nIer eng automatiséiert Veraarbechtung oder Analys duerch e Sproochemodell stattfënnt, erkennen a läschen eis Systemer automatesch sensibel Identifikatiounsdonnéeën. Dozou gehéieren E-Mail-Adressen, Telefonsnummeren, IBANen, Bankkontonummeren, Bezuelkaarten, national Identifikatiounsnummeren, Passnummeren a medezinesch oder Versécherungsnummeren.\n\nAusserdeem ginn d'IP-Adressen vun de Benotzer an d'E-Mail-Adresse vun den Absender ni am Kloertext an eise permanenten Applikatiounsdatebanke gespäichert. Well Clarvia déi aginn Donnéeë schonn um Agank an d'Applikatioun anonymiséiert, kréie Famille praktesch a kontrolléiert Orientéierung, ouni datt hir Privatsphär a Gefor kënnt.",
    },
  },
  {
    date: "2026-08-10",
    headline: {
      en: "Clarvia upgrades automated guidance engine to two-pass verification architecture",
      fr: "Clarvia dote son moteur d’orientation automatisée d’une architecture de vérification en deux étapes",
      de: "Clarvia stellt automatisiertes Orientierungssystem auf eine zweistufige Prüfarchitektur um",
    },
    body: {
      en: "Clarvia has upgraded the core intelligence engine behind its automated information services to a robust two-pass verification architecture powered by GPT-5.6 Luna.\n\nUnder this new architecture, queries are processed in two separate stages. First, a research pass performs live, search-grounded discovery across official government portals and legal registers, producing a strictly validated structured factual brief with verified citations. Second, a dedicated writing pass translates that validated brief into empathetic, clear, and plain language without external browsing.\n\nThis separation of factual verification from text composition eliminates hallucinations, ensures every cited deadline and public contact is grounded in official sources, and significantly improves response clarity for users in distress.",
      fr: "Clarvia a fait évoluer le moteur intelligent au cœur de ses services d’information automatisés vers une architecture robuste de vérification en deux étapes, reposant sur GPT-5.6 Luna.\n\nAvec cette nouvelle architecture, les demandes sont traitées en deux étapes distinctes. La première effectue une recherche en temps réel sur les portails officiels des administrations et les registres juridiques. Elle produit une synthèse factuelle structurée, soumise à une validation stricte et accompagnée de références vérifiées. La seconde transforme cette synthèse validée en une réponse empathique, claire et rédigée en langage simple, sans effectuer de nouvelle recherche en ligne.\n\nCette séparation entre la vérification des faits et la rédaction écarte les hallucinations, garantit que chaque délai et chaque contact public mentionnés reposent sur des sources officielles et améliore nettement la clarté des réponses destinées aux personnes en situation difficile.",
      de: "Clarvia hat das zentrale Intelligenzsystem hinter seinen automatisierten Informationsdiensten auf eine robuste zweistufige Prüfarchitektur umgestellt, die von GPT-5.6 Luna unterstützt wird.\n\nIn dieser neuen Architektur werden Anfragen in zwei getrennten Schritten bearbeitet. Zunächst werden offizielle Behördenportale und Rechtsregister in Echtzeit durchsucht. Daraus entsteht eine streng geprüfte, strukturierte Zusammenfassung der Fakten mit verifizierten Quellenangaben. Anschließend überführt ein eigener Schreibschritt diese geprüfte Zusammenfassung in eine einfühlsame, klare und leicht verständliche Antwort, ohne eine weitere externe Websuche durchzuführen.\n\nDie Trennung von Faktenprüfung und Textformulierung verhindert Halluzinationen, stellt sicher, dass jede genannte Frist und jede öffentliche Kontaktstelle auf amtlichen Quellen beruht, und verbessert die Verständlichkeit der Antworten für Menschen in belastenden Situationen erheblich.",
    },
  },
  {
    date: "2026-07-30",
    headline: {
      en: 'Clarvia approved for GitHub\'s "For Good First Issue" program',
      fr: "Clarvia rejoint officiellement le programme « For Good First Issue » de GitHub",
      de: "Clarvia in das GitHub-Programm „For Good First Issue“ aufgenommen",
    },
    body: {
      en: "Clarvia has been officially accepted into GitHub's \"For Good First Issue\" program, an initiative by GitHub Social Impact that connects social-impact open-source projects with dedicated teams of volunteer developers, designers, and project managers.\n\nClarvia's project listing will be featured on forgoodfirstissue.github.com, allowing volunteer teams from around the world to discover our repositories and contribute to building free, open-source public-interest infrastructure for bereavement guidance.\n\nWe are grateful to GitHub Social Impact for supporting our mission and look forward to collaborating with talented contributors to accelerate our open-source tools.",
      fr: "Clarvia a été officiellement accepté dans le programme « For Good First Issue » de GitHub. Cette initiative de GitHub Social Impact met en relation des projets open source à impact social avec des équipes engagées de développeurs, de designers et de chefs de projet bénévoles.\n\nLa fiche du projet Clarvia sera publiée sur forgoodfirstissue.github.com. Des équipes bénévoles du monde entier pourront ainsi découvrir nos dépôts et contribuer à la création d’une infrastructure gratuite, open source et d’intérêt général pour accompagner les démarches liées au deuil.\n\nNous remercions GitHub Social Impact de soutenir notre mission et nous réjouissons de collaborer avec des contributeurs talentueux afin d’accélérer le développement de nos outils open source.",
      de: "Clarvia wurde offiziell in das GitHub-Programm „For Good First Issue“ aufgenommen. Diese Initiative von GitHub Social Impact bringt gemeinwohlorientierte Open-Source-Projekte mit engagierten Teams aus ehrenamtlichen Entwicklerinnen und Entwicklern, Designerinnen und Designern sowie Projektmanagerinnen und Projektmanagern zusammen.\n\nDas Clarvia-Projekt wird auf forgoodfirstissue.github.com vorgestellt. Dadurch können ehrenamtliche Teams aus aller Welt unsere Repositories entdecken und zum Aufbau einer kostenlosen, quelloffenen und gemeinwohlorientierten Infrastruktur für die Orientierung nach einem Todesfall beitragen.\n\nWir danken GitHub Social Impact für die Unterstützung unserer Mission und freuen uns auf die Zusammenarbeit mit talentierten Mitwirkenden, um die Entwicklung unserer Open-Source-Werkzeuge zu beschleunigen.",
    },
  },
  {
    date: "2026-07-21",
    headline: {
      en: "Clarvia launches lex - an open-source framework standardising national legislation",
      fr: "Clarvia lance lex, un framework open source pour standardiser les législations nationales",
      de: "Clarvia veröffentlicht lex - ein Open-Source-Framework zur Standardisierung nationaler Gesetzestexte",
    },
    body: {
      en: "Clarvia has published lex, a new open-source repository that normalises national legislation into a single, predictable format for AI agents.\n\nRather than requiring agents to parse fragmented government portals, APIs, or PDFs, lex normalises legal texts into standard Markdown paired with byte-identical official source files and SHA-256 verification.\n\nStarting with Luxembourg legal codes, lex includes a CLI and a three-function adapter pattern allowing contributors to add legislation from any country.\n\nView the repository: https://github.com/clarvia-org/clarvia-graph/tree/main/lex",
      fr: "Clarvia a publié lex, un nouveau dépôt open source qui convertit les législations nationales dans un format unique, cohérent et prévisible pour les agents d’intelligence artificielle.\n\nAu lieu de devoir extraire les textes depuis des portails publics fragmentés, des API ou des documents PDF, lex les normalise en Markdown standardisé. Les fichiers sources officiels sont également conservés à l’identique, octet par octet, et vérifiés au moyen de sommes de contrôle SHA-256.\n\nDans sa première version, lex comprend les codes juridiques luxembourgeois, un outil en ligne de commande ainsi qu’un modèle d’adaptateur fondé sur trois fonctions, permettant aux contributeurs d’ajouter la législation de n’importe quel pays.\n\nDécouvrir le dépôt : https://github.com/clarvia-org/clarvia-graph/tree/main/lex",
      de: "Clarvia hat lex veröffentlicht, ein neues Open-Source-Repository, das nationale Gesetzestexte in ein einheitliches und verlässlich strukturiertes Format für KI-Agenten überführt.\n\nAnstatt Inhalte aus fragmentierten Behördenportalen, APIs oder PDF-Dokumenten auslesen zu müssen, stellt lex Gesetzestexte als standardisiertes Markdown bereit. Zusätzlich werden die offiziellen Quelldateien bytegenau gespeichert und mittels SHA-256 verifiziert.\n\nZum Start enthält lex luxemburgische Gesetzbücher, eine Kommandozeilenanwendung sowie ein Adaptermodell mit drei Funktionen, über das Mitwirkende Rechtsvorschriften aus beliebigen Ländern ergänzen können.\n\nRepository ansehen: https://github.com/clarvia-org/clarvia-graph/tree/main/lex",
    },
  },
  {
    date: "2026-07-13",
    headline: {
      en: "Clarvia joins benevolat.lu to welcome new volunteers",
      fr: "Clarvia rejoint benevolat.lu pour accueillir de nouveaux bénévoles",
      de: "Clarvia ist jetzt auf benevolat.lu und sucht neue Freiwillige",
    },
    body: {
      en: "Clarvia is now listed on benevolat.lu, Luxembourg’s national platform for volunteering. Through the platform, we hope to connect with people who want to contribute their skills to a practical public-interest project. Our first opportunity focuses on open-source development, with future roles planned for administrative, legal, and content validation. Volunteers will help us improve free, multilingual guidance for families navigating the procedures that follow the loss of a loved one.",
      fr: "Clarvia est désormais présente sur benevolat.lu, la plateforme nationale du bénévolat au Luxembourg. Nous souhaitons y rencontrer des personnes prêtes à mettre leurs compétences au service d’un projet concret d’intérêt général. Notre première mission concerne le développement open source. D’autres possibilités suivront dans les domaines de la validation administrative, juridique et éditoriale. Les bénévoles contribueront à améliorer des informations gratuites et multilingues pour les familles confrontées aux démarches après la perte d’un proche.",
      de: "Clarvia ist ab sofort auf benevolat.lu, Luxemburgs nationaler Plattform für freiwilliges Engagement, vertreten. Dort möchten wir Menschen erreichen, die ihre Fähigkeiten in ein konkretes gemeinnütziges Projekt einbringen wollen. Unsere erste Aufgabe richtet sich an Open-Source-Entwicklerinnen und -Entwickler. Weitere Einsatzmöglichkeiten in der administrativen, rechtlichen und redaktionellen Prüfung sind geplant. Freiwillige helfen uns dabei, kostenlose und mehrsprachige Orientierung für Familien nach dem Tod eines nahestehenden Menschen weiterzuentwickeln.",
    },
  },
  {
    date: "2026-07-13",
    headline: {
      en: "Clarvia joins Luxembourg’s leading sustainability network, IMS",
      fr: "Clarvia rejoint IMS, le principal réseau luxembourgeois dédié au développement durable",
      de: "Clarvia wird Mitglied bei IMS, Luxemburgs führendem Nachhaltigkeitsnetzwerk",
    },
    body: {
      en: "Clarvia has joined IMS Luxembourg, the country’s leading network for corporate responsibility and sustainable development. Membership connects Clarvia with organisations across Luxembourg committed to responsible practices, social impact, and collective action. Through the IMS network, we look forward to learning from experienced partners, contributing our perspective as a public-interest non-profit, and building new collaborations that help make essential support more accessible to families.",
      fr: "Clarvia a rejoint IMS Luxembourg, le principal réseau du pays consacré à la responsabilité sociétale des entreprises et au développement durable. Cette adhésion nous permet d’échanger avec de nombreuses organisations luxembourgeoises engagées en faveur de pratiques responsables, de l’impact social et de l’action collective. Au sein du réseau IMS, nous souhaitons apprendre de partenaires expérimentés, apporter notre regard d’association d’intérêt général et développer de nouvelles collaborations afin de rendre les services essentiels plus accessibles aux familles.",
      de: "Clarvia ist IMS Luxembourg beigetreten, dem führenden Netzwerk des Landes für unternehmerische Verantwortung und nachhaltige Entwicklung. Die Mitgliedschaft bringt uns mit Organisationen aus ganz Luxemburg zusammen, die sich für verantwortungsvolles Handeln, gesellschaftliche Wirkung und gemeinsames Engagement einsetzen. Im IMS-Netzwerk möchten wir von erfahrenen Partnern lernen, unsere Perspektive als gemeinnütziger Verein einbringen und neue Kooperationen aufbauen, die Familien den Zugang zu wichtigen Unterstützungsangeboten erleichtern.",
    },
  },
  {
    date: "2026-07-12",
    headline: {
      en: "Clarvia moves production infrastructure to carbon-neutral Google Cloud in Stockholm",
      fr: "Clarvia transfère son infrastructure de production vers Google Cloud Stockholm, neutre en carbone",
      de: "Clarvia verlagert seine Produktionsinfrastruktur in die klimaneutrale Google-Cloud-Region Stockholm",
    },
    body: {
      en: "Clarvia has migrated its production servers from Hetzner in Nuremberg to Google Cloud in Stockholm, a region powered by 100% carbon-free energy. The move reduces our infrastructure costs, allowing more funds to support our public-interest mission, while strengthening our integration with Google following our acceptance into Google for Nonprofits.",
      fr: "Clarvia a transféré ses serveurs de production de Hetzner à Nuremberg vers Google Cloud à Stockholm, une région alimentée à 100 % par une énergie sans carbone. Cette migration réduit nos coûts d'infrastructure, ce qui nous permet de consacrer davantage de moyens à notre mission d'intérêt général, tout en renforçant notre intégration avec Google après notre admission au programme Google pour les associations.",
      de: "Clarvia hat seine Produktionsserver von Hetzner in Nürnberg zu Google Cloud nach Stockholm verlagert. Die Region wird zu 100 % mit CO₂-freier Energie betrieben. Durch den Wechsel sinken unsere Infrastrukturkosten, sodass mehr Mittel für unseren gemeinnützigen Zweck zur Verfügung stehen. Zugleich ist die Migration ein weiterer Schritt in Richtung einer engeren Google-Integration nach unserer Aufnahme in Google for Nonprofits.",
    },
  },
  {
    date: "2026-07-08",
    headline: {
      en: "Clarvia website adds Luxembourgish language support",
      fr: "Le site web de Clarvia est désormais disponible en luxembourgeois",
      de: "Clarvia-Website jetzt auch auf Luxemburgisch verfügbar",
    },
    body: {
      en: "The Clarvia website is now available in Luxembourgish, bringing the total number of supported languages to four alongside English, French, and German.",
      fr: "Le site web de Clarvia est maintenant disponible en luxembourgeois, portant à quatre le nombre de langues proposées, aux côtés de l’anglais, du français et de l’allemand.",
      de: "Die Clarvia-Website ist ab sofort auch auf Luxemburgisch verfügbar. Damit unterstützt die Website nun insgesamt vier Sprachen: Englisch, Französisch, Deutsch und Luxemburgisch.",
    },
  },
  {
    date: "2026-07-05",
    headline: {
      en: "Trauerwee ASBL Endorses Clarvia's Mission and Future Pilot",
      fr: "Trauerwee ASBL soutient la mission et le futur pilote de Clarvia",
      de: "Trauerwee ASBL unterstützt Clarvias Mission und zukünftiges Pilotprojekt",
      lu: "Trauerwee ASBL ënnerstëtzt dem Clarvia seng Missioun an en zukünftege Pilotprojet",
    },
    body: {
      en: "Trauerwee ASBL, a Luxembourg non-profit supporting bereaved children, young people, and their families, has expressed its support for the mission and public-interest objectives of Clarvia ASBL, including plans for a future pilot. In their letter of support, Trauerwee highlighted the public value of initiatives that make administrative processes more understandable, structured, and predictable. We are grateful for Trauerwee's support and for the vital work they do with children, youth, and families navigating grief.",
      fr: "Trauerwee ASBL, une association luxembourgeoise qui accompagne les enfants, les jeunes et les familles endeuillés, a exprimé son soutien à la mission et aux objectifs d'intérêt public de Clarvia ASBL, y compris son intention de participer à un futur projet pilote. Dans sa lettre de soutien, l'association a souligné l'intérêt public d'initiatives visant à rendre les démarches administratives plus compréhensibles, plus structurées et plus prévisibles. Nous sommes reconnaissants du soutien de Trauerwee et du travail essentiel qu'elle mène auprès des familles confrontées au deuil.",
      de: "Trauerwee ASBL, eine luxemburgische gemeinnützige Organisation, die trauernde Kinder, Jugendliche und Familien begleitet, hat ihre Unterstützung für die Mission und die gemeinwohlorientierten Ziele von Clarvia ASBL bekräftigt und beabsichtigt, sich an einem zukünftigen Pilotprojekt zu beteiligen. In ihrem Unterstützungsschreiben hob die Organisation den öffentlichen Nutzen von Initiativen hervor, die administrative Abläufe verständlicher, strukturierter und vorhersehbarer machen. Wir danken Trauerwee für diese Unterstützung und für die wichtige Arbeit, die sie für trauernde Kinder, Jugendliche und Familien leistet.",
      lu: "Trauerwee ASBL, eng lëtzebuergesch Associatioun, déi trauernd Kanner, Jugendlecher a Famillje begleet, huet hir Ënnerstëtzung fir d'Missioun an déi gemeinnëtzeg Ziler vu Clarvia ASBL ausgedréckt. Dat ëmfaasst och d'Pläng fir en zukünftege Pilotprojet. A sengem Ënnerstëtzungsbréif huet Trauerwee de gesellschaftleche Wäert vun Initiative betount, déi administrativ Demarchë méi verständlech, strukturéiert a viraussiichtlech maachen. Mir soen Trauerwee Merci fir seng Ënnerstëtzung a fir déi wichteg Aarbecht mat Kanner, Jugendlechen a Familljen an der Trauer.",
    },
  },
  {
    date: "2026-07-01",
    headline: {
      en: "Google Workspace for Nonprofits approved and activated for Clarvia",
      fr: "Google Workspace for Nonprofits activé pour Clarvia",
      de: "Google Workspace for Nonprofits für Clarvia freigeschaltet",
    },
    body: {
      en: "Clarvia's application for Google Workspace for Nonprofits has been successfully approved and activated.\n\nThis activation gives Clarvia access to professional collaboration, communication, and storage tools at no cost. Following our acceptance into GitHub for Nonprofits and Goodstack verification, this milestone strengthens our operational capacity as a registered non-profit, allowing us to manage administrative workflows and collaborate more effectively as we build free bereavement guidance.",
      fr: "La candidature de Clarvia au programme Google Workspace for Nonprofits a été officiellement approuvée et activée.\n\nCette activation nous donne accès gratuitement aux outils professionnels de collaboration, de communication et de stockage de Google Workspace. Après notre admission au programme GitHub for Nonprofits et notre vérification par Goodstack, cette étape renforce notre capacité opérationnelle en tant qu'association sans but lucratif. Elle nous permettra de gérer nos flux administratifs et de collaborer plus efficacement au développement de nos guides d'accompagnement gratuits après un décès.",
      de: "Der Antrag von Clarvia für Google Workspace für Nonprofits wurde erfolgreich genehmigt und freigeschaltet.\n\nDiese Freischaltung ermöglicht Clarvia den kostenlosen Zugriff auf professionelle Tools für Zusammenarbeit, Kommunikation und Datenspeicherung von Google Workspace. Nach der Aufnahme in das Programm GitHub for Nonprofits und der Goodstack-Verifizierung ist dieser Meilenstein ein weiterer wichtiger Schritt zur Stärkung unserer operativen Handlungsfähigkeit als gemeinnütziger Verein. Er hilft uns dabei, administrative Abläufe effizienter zu verwalten und bei der Entwicklung unserer kostenlosen Trauerbegleitung noch besser zusammenzuarbeiten.",
    },
  },
  {
    date: "2026-06-28",
    headline: {
      en: "Clarvia joins Open Collective to make donation-funded work more transparent",
      fr: "Clarvia rejoint Open Collective pour rendre les dons plus transparents",
      de: "Clarvia nutzt Open Collective für mehr Transparenz bei Spenden",
    },
    body: {
      en: "Clarvia is now active on Open Collective.\n\nAs a Luxembourg non-profit building free, open-source public-interest infrastructure, we want supporters to understand how donation-funded work is supported and spent.\n\nThrough Open Collective, contributors can view Clarvia's public budget, follow incoming donations, and see eligible project expenses where they are submitted and approved through the platform.\n\nFunds raised through the collective support Clarvia's work on free, multilingual bereavement guidance, source-backed checklists, open data, and reusable workflow tools.\n\nYou can view and support Clarvia here:\nhttps://opencollective.com/clarvia-org",
      fr: "Clarvia est désormais présente sur Open Collective.\n\nEn tant qu'ASBL luxembourgeoise qui développe une infrastructure gratuite, open source et d'intérêt public, nous voulons permettre aux personnes qui nous soutiennent de mieux comprendre comment les dons contribuent au projet.\n\nGrâce à Open Collective, les contributeurs peuvent consulter le budget public de Clarvia, suivre les dons reçus et voir les dépenses de projet lorsqu'elles sont soumises et approuvées via la plateforme.\n\nLes fonds collectés soutiennent le travail de Clarvia : guides pratiques multilingues après un décès, checklists fondées sur des sources officielles, données ouvertes et outils de workflow réutilisables.\n\nVous pouvez consulter et soutenir Clarvia ici :\nhttps://opencollective.com/clarvia-org",
      de: "Clarvia ist jetzt auf Open Collective vertreten.\n\nAls luxemburgische gemeinnützige Organisation, die kostenlose, offene Infrastruktur im öffentlichen Interesse entwickelt, möchten wir transparent zeigen, wie Spenden unsere Arbeit unterstützen.\n\nÜber Open Collective können Unterstützerinnen und Unterstützer das öffentliche Budget von Clarvia einsehen, eingehende Spenden verfolgen und projektbezogene Ausgaben sehen, wenn sie über die Plattform eingereicht und freigegeben werden.\n\nDie über Open Collective gesammelten Mittel unterstützen Clarvias Arbeit an kostenlosen, mehrsprachigen Orientierungshilfen nach einem Todesfall, quellenbasierten Checklisten, offenen Daten und wiederverwendbaren Workflow-Werkzeugen.\n\nSie können Clarvia hier ansehen und unterstützen:\nhttps://opencollective.com/clarvia-org",
    },
  },
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
      en: "Clarvia now has a YouTube channel where we share our work to make practical support easier to find after a loss. The first short introduces our mission: making the often unseen administrative work after a death more manageable. We plan to post two or three short videos per month.",
      fr: "Clarvia dispose désormais d'une chaîne YouTube pour partager notre parcours dans la création d'un soutien pratique aux familles après un deuil. Le premier format court présente notre mission — rendre plus gérable le travail administratif invisible qui suit un décès. Nous prévoyons de publier 2 à 3 courtes vidéos par mois.",
      de: "Clarvia hat jetzt einen YouTube-Kanal, um unseren Weg beim Aufbau praktischer Unterstützung für Familien nach einem Verlust zu teilen. Das erste Kurzvideo stellt unsere Mission vor — die unsichtbare Verwaltungsarbeit nach einem Todesfall besser handhabbar zu machen. Wir planen, pro Monat 2–3 kurze Videos zu veröffentlichen.",
    },
  },
  {
    date: "2026-06-24",
    headline: {
      en: "Clarvia's bereavement source register published on data.public.lu",
      fr: "Le registre des sources de deuil de Clarvia est publié sur data.public.lu",
      de: "Clarvias Trauerfall-Quellenregister auf data.public.lu veröffentlicht",
    },
    body: {
      en: "Clarvia's first dataset is now published on data.public.lu, Luxembourg's national open data portal. The Bereavement Source Register is a structured, machine-readable registry of official government sources related to bereavement administration in Luxembourg, covering guidance from Guichet.lu, CNAP, CNS, and cross-border jurisdictions. The dataset is published under CC-BY-4.0. Clarvia ASBL is now listed as an organisation on the portal alongside government ministries and public institutions. Dataset: https://data.public.lu/en/datasets/bereavement-source-register-luxembourg/",
      fr: "Le premier jeu de données de Clarvia est désormais publié sur data.public.lu, le portail national de données ouvertes du Luxembourg. Le registre des sources de deuil est un répertoire structuré et lisible par machine des sources gouvernementales officielles liées aux démarches administratives de deuil au Luxembourg, couvrant les informations de Guichet.lu, CNAP, CNS et les juridictions transfrontalières. Le jeu de données est publié sous licence CC-BY-4.0. Clarvia ASBL est désormais répertoriée comme organisation sur le portail aux côtés des ministères et institutions publiques. Jeu de données : https://data.public.lu/fr/datasets/bereavement-source-register-luxembourg/",
      de: "Der erste Datensatz von Clarvia ist jetzt auf data.public.lu, dem nationalen Open-Data-Portal Luxemburgs, veröffentlicht. Das Trauerfall-Quellenregister ist ein strukturiertes, maschinenlesbares Verzeichnis offizieller Regierungsquellen zu Verwaltungsverfahren im Trauerfall in Luxemburg, das Informationen von Guichet.lu, CNAP, CNS und grenzüberschreitenden Zuständigkeiten umfasst. Der Datensatz ist unter CC-BY-4.0 lizenziert. Clarvia ASBL ist nun als Organisation auf dem Portal neben Ministerien und öffentlichen Institutionen gelistet. Datensatz: https://data.public.lu/de/datasets/bereavement-source-register-luxembourg/",
    },
  },
  {
    date: "2026-06-24",
    headline: {
      en: "GitHub Sponsors now active for Clarvia",
      fr: "GitHub Sponsors est maintenant actif pour Clarvia",
      de: "GitHub Sponsors jetzt aktiv für Clarvia",
    },
    body: {
      en: "Clarvia is now enrolled in GitHub Sponsors. Anyone who values free, multilingual bereavement guidance can support the project directly through GitHub. Sponsorships help fund development, hosting, and the expansion of Clarvia's checklist to new countries. The Sponsor button is now visible on all Clarvia repositories.",
      fr: "Clarvia est désormais inscrit sur GitHub Sponsors. Toute personne attachée à un accompagnement administratif gratuit et multilingue en cas de deuil peut soutenir le projet directement via GitHub. Les parrainages contribuent à financer le développement, l'hébergement et l'extension de la checklist Clarvia à de nouveaux pays. Le bouton Sponsor est désormais visible sur tous les dépôts Clarvia.",
      de: "Clarvia ist jetzt bei GitHub Sponsors registriert. Alle, die kostenlose und mehrsprachige Unterstützung bei Verwaltungsaufgaben im Trauerfall schätzen, können das Projekt direkt über GitHub unterstützen. Sponsoring hilft bei der Finanzierung von Entwicklung, Hosting und der Erweiterung der Clarvia-Checkliste auf weitere Länder. Der Sponsor-Button ist jetzt auf allen Clarvia-Repositories sichtbar.",
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
      fr: "Clarvia dispose désormais d'une page de soutien dédiée sur clarvia.org/fr/support. La page accepte les dons ponctuels et récurrents via Stripe, disponible en anglais, français et allemand. Toutes les contributions vont directement à Clarvia ASBL et aident à financer le développement, l'hébergement et l'expansion vers de nouveaux pays.",
      de: "Clarvia hat jetzt eine eigene Unterstützungsseite unter clarvia.org/de/support. Die Seite akzeptiert einmalige und wiederkehrende Spenden über Stripe, verfügbar auf Englisch, Französisch und Deutsch. Alle Beiträge gehen direkt an Clarvia ASBL und helfen bei der Finanzierung von Entwicklung, Hosting und Ländererweiterung.",
    },
  },
  {
    date: "2026-06-10",
    headline: {
      en: "Clarvia's review team grows with a new organisation member",
      fr: "L’équipe de relecture de Clarvia s’agrandit avec un nouveau membre",
      de: "Das Review-Team von Clarvia wächst um ein neues Mitglied",
    },
    body: {
      en: "Clarvia has welcomed a new member to the organisation and the reviewers team. The new reviewer brings independent oversight to pull requests on clarvia-graph, strengthening the project's code review process - a key factor in Clarvia's OpenSSF Scorecard rating. Since joining, the reviewer has approved pull requests covering documentation, CI hardening, refactoring, test coverage, and security fixes. Every Clarvia pull request now benefits from an independent review before merging.",
      fr: "Clarvia accueille un nouveau membre au sein de l’organisation et de son équipe de relecture. Ce nouveau reviewer apporte un regard indépendant sur les pull requests du dépôt clarvia-graph, ce qui renforce le processus de revue de code du projet. C’est aussi un élément important pour l’évaluation OpenSSF Scorecard de Clarvia.\n\nDepuis son arrivée, il a approuvé des pull requests portant sur la documentation, le renforcement de la CI, le refactoring, la couverture de tests et les correctifs de sécurité. Désormais, chaque pull request Clarvia bénéficie d’une relecture indépendante avant d’être fusionnée.",
      de: "Clarvia hat ein neues Mitglied in der Organisation und im Review-Team aufgenommen. Der neue Reviewer bringt eine unabhängige Prüfung der Pull Requests im Repository clarvia-graph ein und stärkt damit den Code-Review-Prozess des Projekts. Das ist zugleich ein wichtiger Faktor für die OpenSSF-Scorecard-Bewertung von Clarvia.\n\nSeit seinem Einstieg hat der Reviewer Pull Requests zu Dokumentation, CI-Härtung, Refactoring, Testabdeckung und Sicherheitskorrekturen freigegeben. Damit profitiert nun jeder Pull Request bei Clarvia vor dem Merge von einer unabhängigen Überprüfung.",
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
      de: 'clarvia-graph hat das OpenSSF Best Practices Badge auf der Stufe "passing" mit einem perfekten Ergebnis erhalten - 67 von 67 Kriterien erfuellt. Das Badge deckt Sicherheitspraktiken, Aenderungskontrolle, Berichterstattung, Qualitaetssicherung und Analyse ab. Es ist eines der angesehensten Reifezeichen in der Open-Source-Welt. Das Badge wird jetzt im README von clarvia-graph und im Profil der Organisation Clarvia angezeigt.',
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
