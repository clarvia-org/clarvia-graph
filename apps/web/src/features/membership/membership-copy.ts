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
      "Join Clarvia, an independent European non-profit, as an Associate Member (€40/month or €480/year, zero personal liability). Help keep bereavement and terminal-illness guidance 100% free across 196 countries.",
      "Rejoignez Clarvia, organisation européenne à but non lucratif, comme membre adhérent (40 €/mois ou 480 €/an, sans responsabilité personnelle). Soutenez un accompagnement administratif gratuit dans 196 pays.",
      "Werden Sie assoziiertes Mitglied der gemeinnützigen Non-Profit-Organisation Clarvia (40 €/Monat oder 480 €/Jahr, ohne persönliche Haftung). Halten Sie unsere Orientierung für Familien in 196 Ländern kostenlos.",
      "Gitt assoziéierte Member vun der Non-Profit-Organisatioun Clarvia (40 €/Mount oder 480 €/Joer, ouni perséinlech Haftung). Hëlleft eis Orientéierung fir Familljen an 196 Länner gratis ze halen.",
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
        "Official LinkedIn Affiliation",
        "Affiliation officielle sur LinkedIn",
        "Offizielle LinkedIn-Zugehörigkeit",
        "Offiziell LinkedIn-Zougehéieregkeet",
      ),
      body: l(
        lang,
        "Receive pre-approved credentials to list Clarvia as an Associate Member and Mission Ambassador on your LinkedIn profile.",
        "Recevez la mention officielle pour indiquer Clarvia comme membre adhérent et ambassadeur sur votre profil LinkedIn.",
        "Erhalten Sie die freigegebene Bezeichnung, um Clarvia als assoziiertes Mitglied und Botschafter in Ihrem LinkedIn-Profil zu führen.",
        "Kritt déi offiziell Bezeechnung, fir Clarvia als assoziéierte Member an Ambassadeur op Ärem LinkedIn-Profil unzeginn.",
      ),
    },
    {
      id: "portrait",
      icon: "portrait",
      title: l(
        lang,
        "Optional Portrait & Directory Listing",
        "Portrait et profil publiés sur choix",
        "Optionales Porträt & Verzeichniseintrag",
        "Optional Portrait- & Profilernimmung",
      ),
      body: l(
        lang,
        "Opt in to display your LinkedIn portrait, headline, and profile link on clarvia.org and in our Annual Activity Report.",
        "Choisissez d'afficher votre photo LinkedIn, votre titre et un lien vers votre profil sur clarvia.org ainsi que dans notre rapport annuel.",
        "Lassen Sie auf Wunsch Ihr LinkedIn-Porträt, Ihre Funktion und Ihren Profillink auf clarvia.org sowie im Jahresbericht aufführen.",
        "Loosst op Wonsch Är LinkedIn-Foto, Ären Titel an e Link op Äre Profil op clarvia.org an am Joresrapport weisen.",
      ),
    },
    {
      id: "cohort",
      icon: "cohort",
      title: l(
        lang,
        "Founding Cohort (2026-2027) Status",
        "Mention Cohorte fondatrice (2026-2027)",
        "Status Gründerkohorte (2026-2027)",
        "Status Grënnerkohort (2026-2027)",
      ),
      body: l(
        lang,
        "Members joining during our inaugural year keep the Founding Cohort designation for as long as their membership remains active.",
        "Les membres rejoignant notre premier exercice conservent la mention Cohorte fondatrice tant que leur adhésion reste active.",
        "Mitglieder des ersten Jahres behalten den Status der Gründerkohorte dauerhaft während ihrer aktiven Mitgliedschaft.",
        "Memberen aus dem éischte Joer behalen de Status Grënnerkohort soulaang hir Memberschaft aktiv bleift.",
      ),
    },
    {
      id: "certificate",
      icon: "certificate",
      title: l(
        lang,
        "Printable Admission Certificate",
        "Certificat d'admission imprimable",
        "Druckbares Aufnahmezertifikat",
        "Dréckbart Opnam-Zertifikat",
      ),
      body: l(
        lang,
        "Download or print your formal Associate Member admission confirmation immediately after joining.",
        "Imprimez ou enregistrez en PDF votre attestation officielle d'admission dès votre adhésion.",
        "Drucken oder speichern Sie unmittelbar nach dem Beitritt Ihre formelle Aufnahmebestätigung als PDF.",
        "Dréckt oder späichert direkt nom Bäitrëtt Är offiziell Opnambestätegung als PDF.",
      ),
    },
    {
      id: "shield",
      icon: "shield",
      title: l(
        lang,
        "Zero Liability & Zero Meetings",
        "Aucune responsabilité ni réunion",
        "Keine Haftung & keine Pflichttermine",
        "Keng Haftung & keng Versammlungen",
      ),
      body: l(
        lang,
        "Honorary non-voting status under our non-profit statutes with no personal liability, committees, or time commitments.",
        "Statut honorifique sans droit de vote, sans responsabilité personnelle, sans comité et sans obligation de temps.",
        "Ehrenamtlicher Status ohne Stimmrecht, ohne persönliche Haftung, ohne Gremienarbeit und ohne Zeitaufwand.",
        "Honorifesche Status ouni Stëmmrecht, ouni perséinlech Haftung, ouni Comitéeën an ouni Zäitverpflichtung.",
      ),
    },
    {
      id: "globe",
      icon: "globe",
      title: l(
        lang,
        "100% Free Public Service",
        "100 % dédié au service gratuit",
        "100 % für kostenlose Hilfe",
        "100 % fir eise gratis Service",
      ),
      body: l(
        lang,
        "Every euro funds official-source verification and multilingual guidance across 14 languages, keeping Clarvia free and ad-free for families.",
        "Chaque euro finance la vérification des sources officielles et nos guides en 14 langues, sans publicité ni frais pour les familles.",
        "Jeder Euro finanziert die Quellenprüfung und Pflege in 14 Sprachen, damit Clarvia für alle Familien kostenlos und werbefrei bleibt.",
        "All Euro finanzéiert d'Quelleniwwerpréiwung an d'Fleeg a 14 Sproochen, fir datt Clarvia gratis a fräi vu Reklamme bleift.",
      ),
    },
  ];
}

export function getMembershipFaqs(lang: Lang): MembershipFaqItem[] {
  return [
    {
      question: l(
        lang,
        "What is the role of an Associate Member?",
        "Quel est le rôle d'un membre adhérent ?",
        "Welche Rolle hat ein assoziiertes Mitglied?",
        "Wat ass d'Roll vun engem assoziéierte Member?",
      ),
      answer: l(
        lang,
        "Associate Members are philanthropic supporters admitted under Clarvia's Luxembourg non-profit statutes who help sustain our free global guidance and share our mission in their networks. To protect family trust, membership is non-voting and never confers editorial influence, commercial referrals, or access to user data.",
        "Les membres adhérents sont des soutiens philanthropiques admis conformément aux statuts à but non lucratif de Clarvia qui financent nos ressources gratuites et font connaître notre mission. Afin de protéger la confiance des familles, ce statut sans droit de vote ne confère aucune influence éditoriale, aucune recommandation commerciale et aucun accès aux données.",
        "Assoziierte Mitglieder sind ideelle Fördernde gemäß der gemeinnützigen Satzung von Clarvia, die unsere kostenlose Orientierung mittragen und im eigenen Netzwerk bekannt machen. Zum Schutz des Vertrauens von Familien ist die Mitgliedschaft stimmrechtslos und gewährt keinen Einfluss auf Inhalte, keine Empfehlungen und keinen Datenzugang.",
        "Assoziéiert Membere si philanthropesch Ënnerstëtzer no de Non-Profit-Statute vu Clarvia, déi eis gratis Orientéierung matdroen an an hirem Netzwierk bekannt maachen. Fir d'Vertraue vun de Familljen ze schützen, gëtt d'Memberschaft kee Stëmmrecht, keen Afloss op d'Inhalter a keen Zougang zu Benotzerdonnéeën.",
      ),
    },
    {
      question: l(
        lang,
        "How does optional recognition with my LinkedIn profile work?",
        "Comment fonctionne la publication facultative de mon profil LinkedIn ?",
        "Wie funktioniert die optionale Nennung mit meinem LinkedIn-Profil?",
        "Wéi funktionéiert déi optional Ernimmung mat mengem LinkedIn-Profil?",
      ),
      answer: l(
        lang,
        "Public recognition is strictly opt-in. If you check the box and add your personal LinkedIn URL, we display your portrait, name, short headline, and LinkedIn link in the cohort directory; leave it unchecked to remain private, or contact us anytime to remove your card.",
        "La publication est strictement facultative. Si vous cochez la case dédiée et indiquez votre URL LinkedIn personnelle, nous affichons votre portrait, votre nom, votre titre et un lien vers votre profil ; laissez la case décochée pour rester privé, ou écrivez-nous à tout moment pour retirer votre carte.",
        "Die öffentliche Nennung erfolgt nur auf Wunsch (Opt-in). Wenn Sie das Feld aktivieren und Ihre persönliche LinkedIn-URL angeben, zeigen wir Ihr Porträt, Ihren Namen, Ihre Funktion und Ihren Profillink; ohne Häkchen bleiben Sie privat und können die Nennung jederzeit widerrufen.",
        "Déi ëffentlech Ernimmung ass reng fräiwëlleg (Opt-in). Wann Dir d'Këscht ukreuzt an Är perséinlech LinkedIn-URL ugitt, weise mir Äert Portrait, Ären Numm, Ären Titel an Äre Link; ouni Haischen bleift Dir privat a kënnt d'Ernimmung zu all Moment widerruffen.",
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
        "Yes. Both monthly (€40/month) and annual (€480/year) memberships can be updated or cancelled in one click at any time through the Stripe self-service portal, with no notice period.",
        "Oui. Les adhésions mensuelles (40 €/mois) et annuelles (480 €/an) peuvent être modifiées ou résiliées en un clic à tout moment depuis le portail Stripe, sans préavis.",
        "Ja. Sowohl monatliche (40 €/Monat) als auch jährliche (480 €/Jahr) Mitgliedschaften lassen sich jederzeit ohne Frist mit einem Klick im Stripe-Portal verwalten oder beenden.",
        "Jo. Souwuel monatlech (40 €/Mount) wéi och jährlech (480 €/Joer) Memberschafte kënnen zu all Moment ouni Frist mat engem Klick am Stripe-Portal verwalt oder gekënnegt ginn.",
      ),
    },
  ];
}
