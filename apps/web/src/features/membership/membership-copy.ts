import { type Lang, l } from "@/lib/i18n";

export interface MembershipBenefitItem {
  id: string;
  icon: "linkedin" | "portrait" | "cohort" | "certificate" | "shield" | "globe";
  title: string;
  body: string;
}

export interface MembershipProofStat {
  value: string;
  label: string;
}

export interface MembershipAudienceCard {
  id: "individuals" | "corporate" | "governance";
  title: string;
  body: string;
}

export interface MembershipFaqItem {
  question: string;
  answer: string;
}

export function getMembershipMeta(lang: Lang): {
  title: string;
  description: string;
} {
  return {
    title: l(
      lang,
      "Associate Membership & Nonprofit Partners | Clarvia Nonprofit Organization",
      "Membres adhérents et partenaires RSE | Clarvia, association à but non lucratif",
      "Fördermitgliedschaft & CSR-Partner | Clarvia, gemeinnützige Organisation",
      "Assoziéiert Memberschaft & CSR-Partner | Clarvia, gemeinnëtzeg ASBL",
    ),
    description: l(
      lang,
      "Join Clarvia, an independent nonprofit organization, as an individual or corporate Associate Member (€40/month or €480/year). Advance global social impact and corporate social responsibility across 196 countries with zero board liability.",
      "Rejoignez Clarvia, association à but non lucratif d'intérêt général, comme membre adhérent ou partenaire de mécénat d'entreprise (40 €/mois ou 480 €/an). Soutenez notre impact social dans 196 pays sans responsabilité d'administrateur.",
      "Unterstützen Sie Clarvia als gemeinnützigen Verein durch eine Fördermitgliedschaft für Einzelpersonen und Unternehmen (40 €/Monat oder 480 €/Jahr). Stärken Sie soziales Engagement und Ihre CSR-Strategie in 196 Ländern ohne Vorstandshaftung.",
      "Ënnerstëtzt Clarvia, eng onofhängeg gemeinnëtzeg Organisatioun a Lëtzebuerger ASBL, als assoziéierte Member fir Privatpersounen an Entreprisen (40 €/Mount oder 480 €/Joer). Stäerkt sozial Verantwortung an 196 Länner ouni Verwaltungsrotshaftung.",
    ),
  };
}

export function getMembershipProofStats(lang: Lang): MembershipProofStat[] {
  return [
    {
      value: "1,000+",
      label: l(
        lang,
        "localized guides live",
        "guides localisés actifs",
        "lokalisierte Leitfäden live",
        "lokaliséiert Guiden aktiv",
      ),
    },
    {
      value: "196",
      label: l(
        lang,
        "countries & 200 corridors",
        "pays et 200 corridors",
        "Länder & 200 Korridore",
        "Länner & 200 Korridoren",
      ),
    },
    {
      value: "5,396",
      label: l(
        lang,
        "official government citations",
        "sources officielles vérifiées",
        "amtliche Quellenbelege",
        "offiziell Quellebeleeër",
      ),
    },
    {
      value: "100%",
      label: l(
        lang,
        "free, open-source & ad-free",
        "gratuit, open source et sans pub",
        "kostenlos, Open Source & werbefrei",
        "gratis, Open Source & ouni Reklamm",
      ),
    },
  ];
}

export function getMembershipBenefits(lang: Lang): MembershipBenefitItem[] {
  return [
    {
      id: "linkedin",
      icon: "linkedin",
      title: l(
        lang,
        "LinkedIn Affiliation",
        "Affiliation sur LinkedIn",
        "LinkedIn-Zugehörigkeit",
        "LinkedIn-Zougehéieregkeet",
      ),
      body: l(
        lang,
        "Approved Associate Member & Ambassador credentials for your personal profile, company page, or designated contact.",
        "Mention officielle de membre adhérent et ambassadeur pour votre profil personnel, votre page entreprise ou un contact désigné.",
        "Freigegebene Bezeichnung für Ihr persönliches Profil, Ihre Unternehmensseite oder eine benannte Kontaktperson.",
        "Offiziell Bezeechnung fir Äre perséinleche Profil, Är Firmesäit oder eng designéiert Kontaktpersoun.",
      ),
    },
    {
      id: "portrait",
      icon: "portrait",
      title: l(
        lang,
        "Portrait or Logo Listing",
        "Portrait ou logo publié",
        "Porträt oder Logo auf der Website",
        "Portrait oder Logo op der Säit",
      ),
      body: l(
        lang,
        "Optional 96px card with your portrait or company logo, headline, and LinkedIn link on clarvia.org.",
        "Carte facultative de 96 px avec votre portrait ou logo, titre et lien LinkedIn sur clarvia.org.",
        "Optionale 96-px-Karte mit Porträt oder Firmenlogo, Funktion und LinkedIn-Link auf clarvia.org.",
        "Optional 96-px-Kaart mat Portrait oder Firmelogo, Titel a LinkedIn-Link op clarvia.org.",
      ),
    },
    {
      id: "cohort",
      icon: "cohort",
      title: l(
        lang,
        "Founding Cohort (2026-2027)",
        "Cohorte fondatrice (2026-2027)",
        "Gründerkohorte (2026-2027)",
        "Grënnerkohort (2026-2027)",
      ),
      body: l(
        lang,
        "Inaugural cohort status retained for as long as your membership remains active.",
        "Statut de la cohorte inaugurale conservé tant que votre adhésion reste active.",
        "Status der Gründungskohorte bleibt während der gesamten aktiven Mitgliedschaft erhalten.",
        "Status vun der Grënnerkohort bleift wärend der ganzer aktiver Memberschaft erhalen.",
      ),
    },
    {
      id: "certificate",
      icon: "certificate",
      title: l(
        lang,
        "Instant Admission Certificate",
        "Certificat d'admission immédiat",
        "Sofortiges Aufnahmezertifikat",
        "Direkt Opnam-Zertifikat",
      ),
      body: l(
        lang,
        "Printable PDF confirmation unlocked immediately on screen in your name or company name.",
        "Attestation PDF imprimable débloquée immédiatement à l'écran à votre nom ou à celui de votre entreprise.",
        "Druckbare PDF-Bestätigung sofort am Bildschirm auf Ihren Namen oder Ihr Unternehmen ausgestellt.",
        "Dréckbar PDF-Bestätegung direkt um Schierm op Ären Numm oder Är Entreprise ausgestallt.",
      ),
    },
    {
      id: "shield",
      icon: "shield",
      title: l(
        lang,
        "Zero Board Liability or Meetings",
        "Aucune responsabilité ni réunion",
        "Keine Vorstandshaftung & Termine",
        "Keng Haftung & keng Versammlungen",
      ),
      body: l(
        lang,
        "Non-voting status with zero personal or corporate fiduciary liability, committees, or time quotas.",
        "Statut sans droit de vote, sans responsabilité fiduciaire personnelle ou d'entreprise et sans réunion.",
        "Förderstatus ohne Stimmrecht, ohne persönliche oder betriebliche Organhaftung und ohne Pflichttermine.",
        "Status ouni Stëmmrecht, ouni perséinlech oder geschäftlech Haftung an ouni Zäitverpflichtung.",
      ),
    },
    {
      id: "globe",
      icon: "globe",
      title: l(
        lang,
        "Direct Social Impact (€40/mo)",
        "Impact social direct (40 €/mois)",
        "Direktes soziales Engagement (40 €/Mo.)",
        "Direkten sozialen Impakt (40 €/Mount)",
      ),
      body: l(
        lang,
        "Funds continuous statutory verification across 5,396 official sources so families in 196 countries never face paywalls or ads.",
        "Finance la vérification continue de 5 396 sources officielles afin que les familles de 196 pays disposent d'un accès gratuit et sans publicité.",
        "Finanziert die laufende Prüfung von 5.396 amtlichen Quellen, damit Familien in 196 Ländern dauerhaft kostenlose und werbefreie Hilfe finden.",
        "Finanzéiert déi lafend Iwwerpréiwung vu 5.396 offizielle Quellen, fir datt Familljen an 196 Länner gratis an ouni Reklamm gehollef kréien.",
      ),
    },
  ];
}

export function getMembershipAudienceSection(lang: Lang): {
  badge: string;
  heading: string;
  intro: string;
  cards: MembershipAudienceCard[];
} {
  return {
    badge: l(
      lang,
      "Supporters & Governance",
      "Adhérents et gouvernance",
      "Förderkreis & Governance",
      "Ënnerstëtzer & Gouvernance",
    ),
    heading: l(
      lang,
      "Built for Principled Individual & Corporate Philanthropy",
      "Conçu pour l'engagement associatif et le mécénat d'entreprise",
      "Für wirksames soziales Engagement und verantwortungsvolle Unternehmen",
      "Fir engagéiert Privatpersounen, Stëftungen a verantwortungsvoll Entreprisen",
    ),
    intro: l(
      lang,
      "Associate Membership is designed for supporters who want verifiable global social impact and transparent governance without operational burden.",
      "Le statut de membre adhérent s'adresse aux personnes et organisations qui recherchent un impact social vérifiable et une gouvernance transparente, sans charge opérationnelle.",
      "Die Fördermitgliedschaft richtet sich an Unterstützerinnen, Unterstützer und Unternehmen, die transparente gemeinnützige Arbeit ohne operativen Aufwand stärken möchten.",
      "D'assoziéiert Memberschaft riicht sech u Leit an Entreprisen, déi e konkrete sozialen Impakt an eng transparent Gouvernance ouni administrativen Opwand ënnerstëtze wëllen.",
    ),
    cards: [
      {
        id: "individuals",
        title: l(
          lang,
          "Executives, Advisors & Philanthropy Allies",
          "Dirigeants, conseils et acteurs de la philanthropie",
          "Führungskräfte, Beratende & Fördermitglieder",
          "Féierungskräften, Beroder & Philanthropie-Partner",
        ),
        body: l(
          lang,
          "Ideal for legal, healthcare, cross-border, and people leaders, family offices, and philanthropy foundation peers who value practical public infrastructure and legacy giving principles, without taking on the legal duties of a charity trustee or voting nonprofit board member.",
          "Idéal pour les cadres juridiques, médicaux, RH ou internationaux et les acteurs proches de fondations qui souhaitent soutenir la vie associative et un projet d'intérêt général par un engagement associatif durable, sans assumer le mandat juridique d'un administrateur.",
          "Ideal für Fach- und Führungskräfte aus Recht, Gesundheit, Personalwesen und Beratung sowie Stiftungsnahe, die durch gesellschaftliches Engagement und bürgerliches Engagement einen gemeinnützigen Verein unterstützen oder einem Verein beitreten möchten, ohne Organ- oder Vorstandshaftung.",
          "Ideal fir Fach- a Féierungskräften aus Recht, Gesondheet, HR a Berodung souwéi Stëftungen, déi e gemeinnëtzege Veräin ënnerstëtzen an dauerhaft gesellschaftlecht Engagement weise wëllen, ouni déi juristesch Flichte vun engem Verwaltungsrotsmember.",
        ),
      },
      {
        id: "corporate",
        title: l(
          lang,
          "Companies, CSR & ESG Strategy Teams",
          "Entreprises, démarche RSE et mécénat",
          "Unternehmen, CSR-Strategie & ESG",
          "Entreprisen, CSR-Strategie & ESG",
        ),
        body: l(
          lang,
          "A straightforward way for employers, care providers, and international firms to partner with an independent charity partner and nonprofit partner as part of their corporate social responsibility (CSR), social responsibility, corporate philanthropy, and social-pillar ESG strategy.",
          "Une formule claire pour les employeurs, acteurs du soin ou toute entreprise à mission souhaitant intégrer un mécénat association et un mécénat d'entreprise concret au cœur de leur responsabilité sociétale (RSE entreprise), de leur démarche RSE et de leur politique RSE.",
          "Ein klarer Weg für Arbeitgeber, Gesundheitsdienstleister und internationale Firmen, soziale Verantwortung zu übernehmen, nachhaltig soziale Projekte zu fördern und eine unabhängige gemeinnützige Organisation fest in ihrer CSR-Strategie und sozialen ESG-Berichterstattung zu verankern.",
          "E klore Wee fir Employeuren, Fleeg- an Dienstleistungsbetriber an international Firmen, fir sozial Verantwortung z'iwwerhuelen an eng onofhängeg gemeinnëtzeg Organisatioun an hirer CSR-Strategie, hirem Mécénat an hirer sozialer ESG-Ausriichtung ze verankeren.",
        ),
      },
      {
        id: "governance",
        title: l(
          lang,
          "Independent Global NGO Scope, Transparent Roots",
          "Portée internationale et gouvernance ouverte",
          "Internationale Reichweite & transparente Struktur",
          "International Reechwäit & Lëtzebuerger Wuerzelen",
        ),
        body: l(
          lang,
          "Clarvia delivers the worldwide public-service reach of an international NGO and non governmental organization while keeping overhead minimal. Founded as a local nonprofit and local charity in Luxembourg (Clarvia ASBL, RCS F15680) with an unpaid founding board, our open datasets are archived on CERN Zenodo and listed on the EU Open Source Observatory (OSOR), with early institutional letters of support from Trauerwee ASBL and TSC Real Estate.",
          "Clarvia déploie l'utilité mondiale d'une ONG internationale tout en conservant une structure légère et bénévole. Née au sein de l'écosystème associatif et fondations au Luxembourg en tant qu'association à but non lucratif (Clarvia ASBL, RCS F15680) dirigée par un conseil non rémunéré, Clarvia archive ses jeux de données ouverts sur CERN Zenodo et l'OSOR, avec le soutien initial de Trauerwee ASBL et TSC Real Estate.",
          "Clarvia verbindet die weltweite Reichweite einer internationalen Nichtregierungsorganisation mit schlanker, ehrenamtlicher Führung. Gegründet als eingetragener gemeinnütziger Verein und ASBL mit Sitz in Luxemburg (Clarvia ASBL, RCS F15680) mit unentgeltlichem Vorstand, sind unsere offenen Datensätze auf CERN Zenodo und dem EU OSOR gelistet, begleitet von frühen Unterstützungsschreiben von Trauerwee ASBL und TSC Real Estate.",
          "Clarvia verbënnt déi weltwäit Reechwäit vun enger internationaler ONG mat enger schlanker, benevoler Féierung. Gegrënnt als lokal Lëtzebuerger ASBL a gemeinnëtzege Veräin zu Lëtzebuerg (Clarvia ASBL, RCS F15680) mat engem onbezuelte Verwaltungsrot, sinn eis oppen Datesätz op CERN Zenodo an um EU OSOR archivéiert, mat fréien Ënnerstëtzungsbréiwer vun Trauerwee ASBL an TSC Real Estate.",
        ),
      },
    ],
  };
}

export function getMembershipFaqs(lang: Lang): MembershipFaqItem[] {
  return [
    {
      question: l(
        lang,
        "Who can join, and does membership confer commercial influence?",
        "Qui peut adhérer et l'adhésion donne-t-elle un droit commercial ?",
        "Wer kann beitreten und entsteht daraus kommerzieller Einfluss?",
        "Wie ka bäitrieden a gëtt dat kommerziellen Afloss?",
      ),
      answer: l(
        lang,
        "Individuals, philanthropy foundations, and companies join as non-voting Associate Members under Clarvia's nonprofit statutes. Whether you join personally or as a corporate social responsibility partner, membership never confers editorial input, referrals, commercial endorsement, or access to user data.",
        "Les particuliers, fondations et entreprises adhèrent comme membres sans droit de vote selon les statuts de notre association à but non lucratif. Qu'il s'agisse d'un engagement personnel ou d'une démarche RSE, l'adhésion ne donne aucune influence éditoriale, recommandation commerciale ni accès aux données.",
        "Einzelpersonen, Stiftungen und Unternehmen treten gemäß der gemeinnützigen Satzung von Clarvia stimmrechtslos im Rahmen einer Fördermitgliedschaft bei. Ob privat oder im Rahmen Ihrer CSR-Strategie: Die Mitgliedschaft gewährt keinen Einfluss auf Inhalte, keine Empfehlungen und keinen Datenzugang.",
        "Privatpersounen, Stëftungen an Entreprisen trieden no de gemeinnëtzege Statute vu Clarvia ouni Stëmmrecht als assoziéiert Memberen bäi. Egal ob privat oder am Kader vun Ärer CSR-Strategie: d'Memberschaft gëtt keen Afloss op d'Inhalter, keng kommerziell Recommandatiounen a keen Zougang zu Donnéeën.",
      ),
    },
    {
      question: l(
        lang,
        "How does Associate Membership differ from being a charity trustee or board member?",
        "Quelle différence avec un mandat d'administrateur au conseil ?",
        "Worin liegt der Unterschied zu einem Vorstandsmandat oder Kuratorium?",
        "Wat ass den Ënnerscheed zu engem Mandat am Verwaltungsrot?",
      ),
      answer: l(
        lang,
        "Voting directors and charity trustees carry statutory governance and fiduciary duties. Associate Members hold an honorary, non-voting supporter status under Articles 7 and 8 of our statutes: you support global social impact and receive official LinkedIn credentials with zero board liability, zero meetings, and zero time obligations.",
        "Les administrateurs ayant droit de vote assument des obligations statutaires et fiduciaires. Les membres adhérents disposent d'un statut honorifique sans droit de vote au titre des articles 7 et 8 de nos statuts : vous soutenez la vie associative et notre impact social mondial avec mention LinkedIn officielle, sans responsabilité juridique ni réunion.",
        "Stimmberechtigte Vorstandsmitglieder tragen gesetzliche Leitungs- und Haftungspflichten. Assoziierte Fördermitglieder erhalten gemäß Artikel 7 und 8 unserer Satzung einen ehrenvollen Status ohne Stimmrecht: Sie fördern gemeinnützige Arbeit weltweit und erhalten offizielle LinkedIn-Referenzen ohne Vorstandshaftung, Gremiensitzungen oder Zeitpflichten.",
        "Stëmmberechtegt Membere vum Verwaltungsrot droe gesetzlech Gouvernance- an Haftungsflichten. Assoziéiert Memberen hunn no Artikel 7 an 8 vun eise Statuten en honorifesche Status ouni Stëmmrecht: Dir stäerkt eise sozialen Impakt weltwäit a kritt offiziell LinkedIn-Referenzen ouni Haftung, Sëtzungen oder Zäitflichten.",
      ),
    },
    {
      question: l(
        lang,
        "When do I receive my certificate, LinkedIn kit, and optional directory card?",
        "Quand reçois-je mon certificat, le kit LinkedIn et ma carte publique ?",
        "Wann erhalte ich Zertifikat, LinkedIn-Kit und den optionalen Eintrag?",
        "Wéini kréien ech mäin Zertifikat, de LinkedIn-Kit an d'ëffentlech Kaart?",
      ),
      answer: l(
        lang,
        "Your printable Admission Certificate and LinkedIn kit unlock immediately on screen after Stripe checkout. Opted-in portrait or company logo cards go live in the cohort directory within 1 to 2 business days and can be removed anytime.",
        "Votre certificat d'admission imprimable et le kit LinkedIn s'affichent immédiatement après le paiement Stripe. Les cartes avec photo ou logo sont publiées dans le répertoire sous 1 à 2 jours ouvrés et retirables à tout moment.",
        "Ihr druckbares Aufnahmezertifikat und das LinkedIn-Kit stehen sofort nach der Stripe-Zahlung am Bildschirm bereit. Optionale Porträt- oder Logokarten erscheinen innerhalb von 1 bis 2 Werktagen im Verzeichnis und sind jederzeit widerrufbar.",
        "Äert dréckbart Opnam-Zertifikat an de LinkedIn-Kit sinn direkt no der Stripe-Bezuelung um Schierm verfügbar. Optional Foto- oder Logokaarte ginn bannent 1 bis 2 Aarbechtsdeeg opgeschalt a kënnen zu all Moment geläscht ginn.",
      ),
    },
    {
      question: l(
        lang,
        "How is Clarvia governed, and can I cancel my membership anytime?",
        "Comment Clarvia est-elle gouvernée et puis-je résilier à tout moment ?",
        "Wie ist Clarvia organisiert und kann ich jederzeit kündigen?",
        "Wéi ass Clarvia organiséiert a kann ech zu all Moment kënnegen?",
      ),
      answer: l(
        lang,
        "Clarvia is an independent nonprofit organization registered as a Luxembourg ASBL (RCS F15680) and governed by an unpaid board, operating open-source public infrastructure across 196 countries. Monthly (€40/month) and annual (€480/year) memberships can be updated or cancelled in one click anytime via the Stripe portal, with no notice period.",
        "Clarvia est une association à but non lucratif indépendante enregistrée comme ASBL au Luxembourg (RCS F15680) et dirigée par un conseil bénévole, opérant une infrastructure publique open source dans 196 pays. Les adhésions mensuelles (40 €/mois) et annuelles (480 €/an) se gèrent ou se résilient en un clic à tout moment via le portail Stripe, sans préavis.",
        "Clarvia ist ein unabhängiger gemeinnütziger Verein, eingetragen als ASBL mit Sitz in Luxemburg (RCS F15680) unter Leitung eines ehrenamtlichen Vorstands, und betreibt quelloffene Infrastruktur für 196 Länder. Monatliche (40 €/Monat) und jährliche (480 €/Jahr) Fördermitgliedschaften lassen sich jederzeit ohne Frist mit einem Klick im Stripe-Portal beenden.",
        "Clarvia ass eng onofhängeg gemeinnëtzeg Organisatioun, registréiert als Lëtzebuerger ASBL (RCS F15680) mat engem benevole Verwaltungsrot, a bedreift Open-Source-Infrastruktur fir 196 Länner. Monatlech (40 €/Mount) a jährlech (480 €/Joer) Memberschafte kënnen zu all Moment ouni Frist mat engem Klick am Stripe-Portal gekënnegt ginn.",
      ),
    },
  ];
}
