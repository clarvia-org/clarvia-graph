import { type Lang, l } from "@/lib/i18n";

export interface MembershipBenefitItem {
  id: string;
  icon: "linkedin" | "portrait" | "cohort" | "certificate" | "shield" | "globe";
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
      "Associate Membership & Mission Ambassadors | Clarvia Non-Profit",
      "Membres adhérents et ambassadeurs | Clarvia (à but non lucratif)",
      "Assoziierte Mitgliedschaft & Botschafter | Clarvia Non-Profit",
      "Assoziéiert Memberschaft & Ambassadeuren | Clarvia Non-Profit",
    ),
    description: l(
      lang,
      "Individuals and companies can join Clarvia, an independent non-profit, as Associate Members (€40/month or €480/year). Help sustain and amplify free bereavement and terminal-illness guidance live across 196 countries.",
      "Particuliers et entreprises peuvent rejoindre Clarvia, organisation à but non lucratif, comme membres adhérents (40 €/mois ou 480 €/an) pour soutenir et faire connaître nos guides gratuits dans 196 pays.",
      "Einzelpersonen und Unternehmen können der gemeinnützigen Non-Profit-Organisation Clarvia als assoziierte Mitglieder beitreten (40 €/Monat oder 480 €/Jahr), um kostenlose Orientierung in 196 Ländern zu stärken.",
      "Privatpersounen an Entreprisen kënnen der Non-Profit-Organisatioun Clarvia als assoziéiert Memberen bäitrieden (40 €/Mount oder 480 €/Joer), fir gratis Orientéierung an 196 Länner ze stäerken.",
    ),
  };
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
        "Optional card with your portrait or company logo, headline, and LinkedIn link on clarvia.org.",
        "Carte facultative avec votre portrait ou logo, titre et lien LinkedIn sur clarvia.org.",
        "Optionale Karte mit Porträt oder Firmenlogo, Funktion und LinkedIn-Link auf clarvia.org.",
        "Optional Kaart mat Portrait oder Firmelogo, Titel a LinkedIn-Link op clarvia.org.",
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
        "Printable PDF confirmation issued immediately in your name or company name.",
        "Attestation PDF imprimable délivrée immédiatement à votre nom ou à celui de votre entreprise.",
        "Druckbare PDF-Bestätigung sofort auf Ihren Namen oder Ihr Unternehmen ausgestellt.",
        "Dréckbar PDF-Bestätegung direkt op Ären Numm oder Är Entreprise ausgestallt.",
      ),
    },
    {
      id: "shield",
      icon: "shield",
      title: l(
        lang,
        "Zero Liability or Meetings",
        "Aucune responsabilité ni réunion",
        "Keine Haftung & keine Termine",
        "Keng Haftung & keng Versammlungen",
      ),
      body: l(
        lang,
        "Non-voting status with zero personal or corporate liability, committees, or time quotas.",
        "Statut sans droit de vote, sans responsabilité personnelle ou d'entreprise et sans réunion.",
        "Status ohne Stimmrecht, ohne persönliche oder betriebliche Haftung und ohne Pflichttermine.",
        "Status ouni Stëmmrecht, ouni Haftung an ouni Zäitverpflichtung.",
      ),
    },
    {
      id: "globe",
      icon: "globe",
      title: l(
        lang,
        "100% Free Global Service",
        "100 % dédié au service gratuit",
        "100 % für kostenlose Hilfe",
        "100 % fir eise gratis Service",
      ),
      body: l(
        lang,
        "Sustains live, source-cited guidance across 196 countries and 14 languages, free and ad-free for every family.",
        "Finance nos guides sourcés dans 196 pays et 14 langues, gratuits et sans publicité pour chaque famille.",
        "Trägt quellenbasierte Orientierung in 196 Ländern und 14 Sprachen, kostenlos und werbefrei für alle Familien.",
        "Dréit eis Orientéierung an 196 Länner a 14 Sproochen, gratis a fräi vu Reklamme fir all Famill.",
      ),
    },
  ];
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
        "Individuals and companies join as non-voting Associate Members under Clarvia's non-profit statutes. Membership never confers editorial input, referrals, commercial endorsement, or access to user data.",
        "Particuliers et entreprises adhèrent comme membres sans droit de vote selon les statuts à but non lucratif de Clarvia. L'adhésion ne donne aucune influence éditoriale, recommandation commerciale ni accès aux données.",
        "Einzelpersonen und Unternehmen treten gemäß der gemeinnützigen Satzung von Clarvia stimmrechtslos bei. Die Mitgliedschaft gewährt keinen Einfluss auf Inhalte, keine Empfehlungen und keinen Datenzugang.",
        "Privatpersounen an Entreprisen trieden no de Non-Profit-Statute vu Clarvia ouni Stëmmrecht bäi. D'Memberschaft gëtt keen Afloss op d'Inhalter, keng Recommandatiounen a keen Zougang zu Donnéeën.",
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
        "Your printable certificate and LinkedIn kit unlock immediately after Stripe checkout. Opted-in portrait or company logo cards go live within 1 to 2 business days and can be removed anytime.",
        "Votre certificat imprimable et le kit LinkedIn s'affichent immédiatement après le paiement Stripe. Les cartes avec photo ou logo sont publiées sous 1 à 2 jours ouvrés et retirables à tout moment.",
        "Ihr druckbares Zertifikat und das LinkedIn-Kit stehen sofort nach der Stripe-Zahlung bereit. Optionale Porträt- oder Logokarten erscheinen innerhalb von 1 bis 2 Werktagen und sind jederzeit widerrufbar.",
        "Äert dréckbart Zertifikat an de LinkedIn-Kit sinn direkt no der Stripe-Bezuelung verfügbar. Optional Foto- oder Logokaarte ginn bannent 1 bis 2 Aarbechtsdeeg opgeschalt a sinn zu all Moment läschbar.",
      ),
    },
    {
      question: l(
        lang,
        "Can I manage or cancel my membership at any time?",
        "Puis-je gérer ou résilier mon adhésion à tout moment ?",
        "Kann ich meine Mitgliedschaft jederzeit verwalten oder kündigen?",
        "Kann ech meng Memberschaft zu all Moment verwalten oder kënnegen?",
      ),
      answer: l(
        lang,
        "Yes. Monthly (€40/month) and annual (€480/year) memberships can be updated or cancelled in one click anytime via the Stripe portal, with no notice period.",
        "Oui. Les adhésions mensuelles (40 €/mois) et annuelles (480 €/an) se gèrent ou se résilient en un clic à tout moment via le portail Stripe, sans préavis.",
        "Ja. Monatliche (40 €/Monat) und jährliche (480 €/Jahr) Mitgliedschaften lassen sich jederzeit ohne Frist mit einem Klick im Stripe-Portal beenden.",
        "Jo. Monatlech (40 €/Mount) a jährlech (480 €/Joer) Memberschafte kënnen zu all Moment mat engem Klick am Stripe-Portal gekënnegt ginn.",
      ),
    },
  ];
}
