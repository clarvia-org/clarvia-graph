import { type Lang, l } from "@/lib/i18n";

export const MEMBERSHIP_PENDING_STORAGE_KEY = "clarvia-membership-pending";

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
      "Become an Associate Member & Mission Ambassador | Clarvia ASBL",
      "Devenir membre adhérent et ambassadeur | Clarvia ASBL",
      "Assoziiertes Mitglied & Botschafter werden | Clarvia ASBL",
      "Assoziéiert Member & Ambassadeur ginn | Clarvia ASBL",
    ),
    description: l(
      lang,
      "Join Clarvia ASBL as a statutory Associate Member (€40/month or €480/year, zero personal liability). Help keep source-cited bereavement and terminal-illness guidance free across 196 countries.",
      "Rejoignez Clarvia ASBL en tant que membre adhérent statutaire (40 €/mois ou 480 €/an, sans responsabilité personnelle). Soutenez un accompagnement administratif gratuit dans 196 pays.",
      "Werden Sie satzungsmäßiges assoziiertes Mitglied von Clarvia ASBL (40 €/Monat oder 480 €/Jahr, ohne persönliche Haftung). Unterstützen Sie kostenlose Orientierung für Familien in 196 Ländern.",
      "Gitt statutaire assoziéierte Member vu Clarvia ASBL (40 €/Mount oder 480 €/Joer, ouni perséinlech Haftung). Hëlleft eis Orientéierung fir Familljen an 196 Länner gratis ze halen.",
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
        "Receive pre-approved credentials to list Clarvia ASBL (RCS Luxembourg F15680) as an Associate Member & Mission Ambassador on your LinkedIn profile.",
        "Recevez la mention officielle pour indiquer Clarvia ASBL (RCS Luxembourg F15680) comme membre adhérent et ambassadeur sur votre profil LinkedIn.",
        "Erhalten Sie die freigegebene Bezeichnung, um Clarvia ASBL (RCS Luxemburg F15680) als assoziiertes Mitglied und Botschafter in Ihrem LinkedIn-Profil zu führen.",
        "Kritt déi offiziell Bezeechnung, fir Clarvia ASBL (RCS Lëtzebuerg F15680) als assoziéierte Member an Ambassadeur op Ärem LinkedIn-Profil unzeginn.",
      ),
    },
    {
      id: "portrait",
      icon: "portrait",
      title: l(
        lang,
        "Optional Portrait & Profile Recognition",
        "Portrait et profil publiés sur choix",
        "Optionales Porträt & Verzeichniseintrag",
        "Optional Portrait- & Profilernimmung",
      ),
      body: l(
        lang,
        "Choose whether to appear in our Associate Members directory with your LinkedIn portrait, headline, and profile link, plus our Annual Activity Report.",
        "Choisissez d'apparaître dans notre répertoire des membres adhérents avec votre photo LinkedIn, votre titre et un lien vers votre profil, ainsi que dans notre rapport annuel.",
        "Wählen Sie frei, ob Sie mit Ihrem LinkedIn-Porträt, Ihrer Funktion und Ihrem Profillink im Mitgliederverzeichnis sowie im Jahresbericht genannt werden möchten.",
        "Entscheet fräi, ob Dir mat Ärer LinkedIn-Foto, Ärem Titel an engem Link op Äre Profil op clarvia.org an am Joresrapport genannt wëllt ginn.",
      ),
    },
    {
      id: "cohort",
      icon: "cohort",
      title: l(
        lang,
        "Founding Cohort (2026–2027) Designation",
        "Mention Cohorte fondatrice (2026–2027)",
        "Status Gründerkohorte (2026–2027)",
        "Status Grënnerkohort (2026–2027)",
      ),
      body: l(
        lang,
        "Members admitted during Clarvia's inaugural financial year retain the Founding Cohort designation for as long as their membership remains active.",
        "Les membres admis durant le premier exercice de Clarvia conservent la mention Cohorte fondatrice tant que leur adhésion reste active.",
        "Mitglieder, die im ersten Geschäftsjahr aufgenommen werden, behalten den Status der Gründerkohorte dauerhaft während ihrer aktiven Mitgliedschaft.",
        "Memberen, déi am éischte Geschäftsjoer opgeholl ginn, behalen de Status Grënnerkohort soulaang hir Memberschaft aktiv bleift.",
      ),
    },
    {
      id: "certificate",
      icon: "certificate",
      title: l(
        lang,
        "Printable Certificate of Admission",
        "Certificat d'admission imprimable",
        "Druckbares Aufnahmezertifikat",
        "Dréckbart Opnam-Zertifikat",
      ),
      body: l(
        lang,
        "Download or print your formal Associate Member admission statement issued under Clarvia ASBL's Articles of Association immediately after joining.",
        "Imprimez ou enregistrez en PDF votre attestation officielle d'admission de membre adhérent émise conformément aux statuts de Clarvia ASBL.",
        "Drucken oder speichern Sie unmittelbar nach dem Beitritt Ihre formelle Aufnahmebestätigung gemäß der Satzung von Clarvia ASBL als PDF.",
        "Dréckt oder späichert direkt nom Bäitrëtt Är offiziell Opnambestätegung geméiss de Statute vu Clarvia ASBL als PDF.",
      ),
    },
    {
      id: "shield",
      icon: "shield",
      title: l(
        lang,
        "Zero Liability & Zero Time Quotas",
        "Aucune responsabilité ni obligation de temps",
        "Keine Haftung & kein Zeitaufwand",
        "Keng Haftung & keng Zäitverpflichtung",
      ),
      body: l(
        lang,
        "Under Articles 5 and 7 of our Articles of Association, Associate Members carry zero personal liability, zero governance burden, and zero committee meetings.",
        "En vertu des articles 5 et 7 des statuts, les membres adhérents n'assument aucune responsabilité personnelle, aucune charge de gouvernance et aucune réunion obligatoire.",
        "Nach Artikel 5 und 7 unserer Satzung tragen assoziierte Mitglieder keinerlei persönliche Haftung, keine Gremienpflichten und keine Pflichttermine.",
        "Geméiss Artikel 5 a 7 vun eise Statuten droen assoziéiert Memberen keng perséinlech Haftung, keng Gouvernance-Flichten a keng Versammlungspflichten.",
      ),
    },
    {
      id: "globe",
      icon: "globe",
      title: l(
        lang,
        "Sustaining Free Access Worldwide",
        "Maintenir la gratuité dans 196 pays",
        "Kostenlosen Zugang weltweit sichern",
        "Gratis Zougang weltwäit sécheren",
      ),
      body: l(
        lang,
        "100% of statutory membership fees fund official-source verification, multilingual maintenance across 14 languages, and free Ask Clarvia replies for families.",
        "100 % des cotisations statutaires financent la vérification des sources officielles, la maintenance en 14 langues et la gratuité d'Ask Clarvia pour les familles.",
        "100 % der satzungsmäßigen Mitgliedsbeiträge finanzieren die Quellenprüfung, die Pflege in 14 Sprachen und kostenlose Ask-Clarvia-Antworten für Familien.",
        "100 % vun de statutaire Cotisatioune finanzéieren d'Quelleniwwerpréiwung, d'Fleeg a 14 Sproochen a gratis Ask-Clarvia-Äntwerte fir Familljen.",
      ),
    },
  ];
}

export function getMembershipFaqs(lang: Lang): MembershipFaqItem[] {
  return [
    {
      question: l(
        lang,
        "What is the legal status of an Associate Member under Clarvia's Articles of Association?",
        "Quel est le statut juridique d'un membre adhérent selon les statuts de Clarvia ?",
        "Welchen rechtlichen Status hat ein assoziiertes Mitglied gemäß der Satzung von Clarvia?",
        "Wat ass de juristesche Status vun engem assoziéierte Member no de Statute vu Clarvia?",
      ),
      answer: l(
        lang,
        "Clarvia ASBL is governed by the Luxembourg Law of 7 August 2023 on non-profit associations and foundations. Under Articles 5, 7, and 8 of our Articles of Association and Board Resolution 2026-01, Contributing Associate Members (membres adhérents) pay a statutory membership contribution of €40/month (€480/year). Associate Members do not vote at the General Assembly, do not serve as directors, and carry zero personal liability for any obligations of the association.",
        "Clarvia ASBL est régie par la loi luxembourgeoise du 7 août 2023 sur les associations sans but lucratif et les fondations. En vertu des articles 5, 7 et 8 de nos statuts et de la résolution du conseil 2026-01, les membres adhérents cotisants versent une cotisation statutaire de 40 €/mois (480 €/an). Ils ne disposent pas de droit de vote à l'assemblée générale, ne siègent pas au conseil d'administration et n'encourent aucune responsabilité personnelle.",
        "Clarvia ASBL unterliegt dem luxemburgischen Gesetz vom 7. August 2023 über Vereinigungen ohne Gewinnzweck und Stiftungen. Gemäß Artikel 5, 7 und 8 unserer Satzung sowie Vorstandsbeschluss 2026-01 leisten beitragende assoziierte Mitglieder einen satzungsmäßigen Beitrag von 40 €/Monat (480 €/Jahr). Sie haben kein Stimmrecht in der Generalversammlung, kein Vorstandsamt und keinerlei persönliche Haftung.",
        "Clarvia ASBL ënnerläit dem Lëtzebuerger Gesetz vum 7. August 2023 iwwer ASBLen a Fondatiounen. Geméiss Artikel 5, 7 an 8 vun eise Statuten an der Verwaltungsrotsresolutioun 2026-01 bezuelen assoziéiert Memberen eng statutaire Cotisatioun vu 40 €/Mount (480 €/Joer). Si hu kee Stëmmrecht an der Generalversammlung, kee Mandat am Verwaltungsrot a keng perséinlech Haftung.",
      ),
    },
    {
      question: l(
        lang,
        "How is my membership contribution accounted for, and is it tax-deductible?",
        "Comment ma cotisation est-elle comptabilisée et donne-t-elle droit à un reçu fiscal ?",
        "Wie wird mein Mitgliedsbeitrag verbucht und ist er steuerlich absetzbar?",
        "Wéi gëtt meng Cotisatioun verbucht an ass se steierlech ofsetzbar?",
      ),
      answer: l(
        lang,
        "Contributions are booked as statutory non-profit membership fees (Account 7200 — Mitgliedsbeiträge) under Clarvia ASBL's financial accounts, exempt from VAT, and dedicated exclusively to our non-profit purpose. Clarvia ASBL does not currently hold public-utility tax status and does not issue tax-deduction certificates; Stripe issues a standard payment receipt.",
        "Les versements sont comptabilisés en tant que cotisations statutaires d'association sans but lucratif (compte 7200), hors champ / exonérées de TVA, et affectés exclusivement à notre objet social. Clarvia ASBL ne délivre pas actuellement de certificats fiscaux ; Stripe émet un reçu de paiement standard.",
        "Die Beiträge werden in der Vereinsbuchhaltung von Clarvia ASBL als satzungsmäßige Mitgliedsbeiträge (Konto 7200 – Mitgliedsbeiträge) erfasst, sind umsatzsteuerbefreit und fließen ausschließlich in den Satzungszweck. Clarvia ASBL stellt derzeit keine steuerlichen Zuwendungsbestätigungen aus; Sie erhalten einen Zahlungsbeleg über Stripe.",
        "D'Cotisatioune ginn an der Comptabilitéit vu Clarvia ASBL als statutaire Membersbäiträg (Kont 7200) verbucht a fléissen ausschliisslech an eisen ASBL-Zweck. Clarvia ASBL stellt de Moment keng Steierbescheinegungen aus; Stripe schéckt eng normal Bezuelquittung.",
      ),
    },
    {
      question: l(
        lang,
        "How does public recognition with my LinkedIn profile and photo work?",
        "Comment fonctionne la publication de mon profil et de ma photo LinkedIn ?",
        "Wie funktioniert die öffentliche Nennung mit meinem LinkedIn-Profil und Porträt?",
        "Wéi funktionéiert déi ëffentlech Ernimmung mat mengem LinkedIn-Profil a Portrait?",
      ),
      answer: l(
        lang,
        "Public listing is strictly opt-in. If you check the recognition box and provide your personal LinkedIn URL, we display your name, your LinkedIn profile portrait (or initials if none is public), your short professional headline, and a link to your LinkedIn profile in the Associate Members directory. Leave the box unchecked to remain private in our internal statutory register. You can ask us to update or remove your public card at any time.",
        "La publication sur le site est strictement facultative. Si vous cochez la case dédiée et indiquez l'URL de votre profil LinkedIn personnel, nous affichons votre nom, la photo de votre profil LinkedIn (ou vos initiales), votre titre professionnel et un lien vers votre profil. Laissez la case décochée pour figurer uniquement dans le registre statutaire interne. Vous pouvez demander le retrait de votre mention publique à tout moment.",
        "Die öffentliche Nennung erfolgt ausschließlich auf ausdrücklichen Wunsch (Opt-in). Wenn Sie das Feld aktivieren und Ihre persönliche LinkedIn-URL angeben, zeigen wir Ihren Namen, Ihr LinkedIn-Profilbild (bzw. Initialen), Ihre Berufsbezeichnung und einen Link zu Ihrem LinkedIn-Profil. Ohne Häkchen erfolgt nur die interne Führung im Mitgliederregister. Sie können die Veröffentlichung jederzeit widerrufen.",
        "Déi ëffentlech Ernimmung ass reng fräiwëlleg (Opt-in). Wann Dir d'Këscht ukreuzt an Är perséinlech LinkedIn-URL ugitt, weise mir Ären Numm, Är LinkedIn-Profilfoto (oder Initialen), Ären Titel an e Link op Äre Profil. Ouni Haischen bleift Dir eleng am interne Register agedroen. Dir kënnt d'Verëffentlechung zu all Moment widerruffen.",
      ),
    },
    {
      question: l(
        lang,
        "Does Associate Membership confer commercial endorsement or editorial influence?",
        "L'adhésion confère-t-elle une recommandation commerciale ou un droit de regard éditorial ?",
        "Gewährt die Mitgliedschaft kommerzielle Empfehlungen oder Einfluss auf Inhalte?",
        "Gëtt d'Memberschaft kommerziell Recommandatiounen oder Afloss op d'Inhalter?",
      ),
      answer: l(
        lang,
        "No. To protect family trust, Associate Membership never provides influence over Clarvia's guidance, referrals, preferred-provider status, commercial endorsement, or access to user data. Members may resign or cancel recurring billing at any time in one click via the Stripe Billing Portal.",
        "Non. Afin de préserver la confiance des familles, la qualité de membre adhérent ne confère aucune influence sur les contenus de Clarvia, aucune recommandation commerciale, aucun statut de prestataire privilégié et aucun accès aux données des utilisateurs. L'abonnement est résiliable en un clic à tout moment via le portail Stripe.",
        "Nein. Zum Schutz des Vertrauens von Familien gewährt die assoziierte Mitgliedschaft keinerlei Einfluss auf Inhalte, keine Empfehlungen, keinen bevorzugten Anbieterstatus und keinen Zugang zu Nutzerdaten. Sie können Ihre Mitgliedschaft jederzeit mit einem Klick über das Stripe-Kundenportal beenden.",
        "Nee. Fir d'Vertraue vun de Familljen ze schützen, gëtt d'Memberschaft keen Afloss op d'Inhalter vu Clarvia, keng kommerziell Recommandatiounen a keen Zougang zu Benotzerdonnéeën. Dir kënnt Är Memberschaft zu all Moment mat engem Klick iwwer de Stripe-Portal kënnegen.",
      ),
    },
  ];
}
