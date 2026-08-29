import type { Lang } from "@/lib/i18n";

type ChecklistTaskText = { title: string; description: string };
type LocalizedChecklistTask = Record<Lang, ChecklistTaskText>;

export const CHECKLIST_TASK_COPY: Record<string, LocalizedChecklistTask> = {
  "task_template.lu.bereavement.estate_assets.understand_housing_rights": {
    en: {
      title: "Understand housing and lease rights",
      description:
        "Lease rights depend on the household and the tenancy. Contact the landlord, a tenant-advice service, or a legal professional if the situation is disputed.",
    },
    fr: {
      title: "Comprendre les droits liés au logement et au bail",
      description:
        "Les droits liés au bail dépendent du ménage et du contrat de location. En cas de désaccord, contactez le propriétaire, un service d'information aux locataires ou un professionnel du droit.",
    },
    de: {
      title: "Wohn- und Mietrechte klären",
      description:
        "Mietrechte hängen vom Haushalt und vom Mietvertrag ab. Wenden Sie sich bei Streitfragen an den Vermieter, eine Mieterberatung oder eine juristische Fachperson.",
    },
    lu: {
      title: "Wunn- a Locatiounsrechter klären",
      description:
        "D'Rechter aus dem Bail hänke vum Stot a vum Locatiounskontrakt of. Wend Iech bei engem Sträit un de Proprietär, eng Berodungsstell fir Locatairen oder eng juristesch Fachpersoun.",
    },
  },
  "task_template.lu.bereavement.succession.understand_applicable_succession_law": {
    en: {
      title: "Check which succession law may apply",
      description:
        "The applicable law can depend on the deceased person's habitual residence, nationality, and any valid choice of law. Seek professional advice when more than one country is involved.",
    },
    fr: {
      title: "Vérifier quelle loi successorale peut s'appliquer",
      description:
        "La loi applicable peut dépendre de la résidence habituelle et de la nationalité de la personne décédée, ainsi que d'un éventuel choix de loi valable. Demandez conseil à un professionnel si plusieurs pays sont concernés.",
    },
    de: {
      title: "Prüfen, welches Erbrecht gelten kann",
      description:
        "Das anwendbare Recht kann vom gewöhnlichen Aufenthalt und der Staatsangehörigkeit der verstorbenen Person sowie von einer wirksamen Rechtswahl abhängen. Holen Sie fachlichen Rat ein, wenn mehrere Länder betroffen sind.",
    },
    lu: {
      title: "Kontrolléieren, wéi en Ierfrecht uwennbar ka sinn",
      description:
        "Dat uwennbart Recht ka vum gewéinlechen Openthalt a vun der Nationalitéit vun der verstuerwener Persoun an och vun enger valabeler Rechtswahl ofhänken. Sicht professionell Berodung, wa méi Länner betraff sinn.",
    },
  },
  "task_template.lu.bereavement.estate_assets.transfer_vehicle_registration": {
    en: {
      title: "Transfer or otherwise handle vehicle registration",
      description:
        "Ask the SNCA which succession document and registration steps are required for a Luxembourg-registered vehicle.",
    },
    fr: {
      title: "Transférer ou régler l'immatriculation d'un véhicule",
      description:
        "Demandez à la SNCA quel document successoral et quelles démarches d'immatriculation sont nécessaires pour un véhicule immatriculé au Luxembourg.",
    },
    de: {
      title: "Fahrzeug ummelden oder die Zulassung anderweitig regeln",
      description:
        "Fragen Sie die SNCA, welcher Erbnachweis und welche Zulassungsschritte für ein in Luxemburg zugelassenes Fahrzeug erforderlich sind.",
    },
    lu: {
      title: "E Gefier ëmellen oder d'Umeldung anescht regelen",
      description:
        "Frot d'SNCA, wéi en Noweis iwwer d'Ierfschaft a wéi eng Schrëtt fir e Gefier néideg sinn, dat zu Lëtzebuerg ugemellt ass.",
    },
  },
  "task_template.lu.bereavement.death_registration.obtain_medical_death_certificate": {
    en: {
      title: "Obtain the medical certificate of death",
      description: "A doctor prepares the medical certificate needed to declare the death.",
    },
    fr: {
      title: "Obtenir le certificat médical de décès",
      description: "Un médecin établit le certificat médical nécessaire à la déclaration du décès.",
    },
    de: {
      title: "Ärztliche Todesbescheinigung erhalten",
      description:
        "Eine Ärztin oder ein Arzt stellt die Bescheinigung aus, die für die Meldung des Todesfalls benötigt wird.",
    },
    lu: {
      title: "De medezineschen Doudesattest kréien",
      description:
        "Eng Doktesch oder en Dokter stellt den Attest aus, dee fir d'Meldung vum Doudesfall gebraucht gëtt.",
    },
  },
  "task_template.lu.bereavement.employment.notify_ccss_business_matters": {
    en: {
      title: "Notify the CCSS and deal with business matters",
      description:
        "Contact the CCSS promptly if the deceased was self-employed or ran a business. Ask which declarations, supporting documents, and deadlines apply.",
    },
    fr: {
      title: "Informer le CCSS et régler les questions liées à l'activité professionnelle",
      description:
        "Contactez rapidement le CCSS si la personne décédée était indépendante ou dirigeait une entreprise. Demandez quelles déclarations, quels justificatifs et quels délais s'appliquent.",
    },
    de: {
      title: "CCSS informieren und betriebliche Angelegenheiten regeln",
      description:
        "Wenden Sie sich zeitnah an die CCSS, wenn die verstorbene Person selbstständig war oder ein Unternehmen geführt hat. Fragen Sie nach den erforderlichen Meldungen, Nachweisen und Fristen.",
    },
    lu: {
      title: "D'CCSS informéieren a Betribsfroe regelen",
      description:
        "Kontaktéiert d'CCSS séier, wann déi verstuerwe Persoun selbstänneg war oder e Betrib gefouert huet. Frot, wéi eng Deklaratiounen, Noweiser a Friste gëllen.",
    },
  },
  "task_template.lu.bereavement.estate_assets.notify_banks_trace_assets": {
    en: {
      title: "Notify banks and trace financial assets",
      description:
        "Contact banks and other financial institutions directly. Account access, freezes, documents, and fees vary by institution.",
    },
    fr: {
      title: "Informer les banques et rechercher les avoirs financiers",
      description:
        "Contactez directement les banques et les autres établissements financiers. L'accès aux comptes, les blocages, les documents demandés et les frais varient selon l'établissement.",
    },
    de: {
      title: "Banken informieren und Finanzvermögen ermitteln",
      description:
        "Wenden Sie sich direkt an Banken und andere Finanzinstitute. Kontozugriff, Sperren, benötigte Unterlagen und Gebühren unterscheiden sich je nach Institut.",
    },
    lu: {
      title: "Banken informéieren a Finanzverméige sichen",
      description:
        "Wend Iech direkt u Banken an aner Finanzinstituter. Kontzougang, Spären, néideg Dokumenter an Taxe si jee no Institut anescht.",
    },
  },
  "task_template.lu.bereavement.inheritance_tax.file_aed_declaration": {
    en: {
      title: "File the AED succession declaration and check inheritance tax",
      description:
        "Ask the AED whether a succession declaration is required and whether any inheritance tax applies to the heirs and shares involved.",
    },
    fr: {
      title:
        "Déposer la déclaration de succession auprès de l'AED et vérifier les droits de succession",
      description:
        "Demandez à l'AED si une déclaration de succession est nécessaire et si des droits de succession s'appliquent aux héritiers et aux parts concernés.",
    },
    de: {
      title: "Erbschaftserklärung bei der AED einreichen und Erbschaftsteuer prüfen",
      description:
        "Fragen Sie die AED, ob eine Erbschaftserklärung erforderlich ist und ob für die beteiligten Erben und Anteile Erbschaftsteuer anfällt.",
    },
    lu: {
      title: "D'Ierfschaftsdeklaratioun bei der AED areechen an d'Ierfschaftssteier kontrolléieren",
      description:
        "Frot d'AED, ob eng Ierfschaftsdeklaratioun néideg ass an ob fir déi betraffen Ierwen an Undeeler Ierfschaftssteier ufält.",
    },
  },
  "task_template.lu.bereavement.inheritance_tax.file_final_income_tax_return": {
    en: {
      title: "File the final income tax return if required",
      description:
        "Check with the tax authorities whether a final return is required and which filing deadline applies to the deceased person's tax situation.",
    },
    fr: {
      title: "Déposer la dernière déclaration d'impôt si nécessaire",
      description:
        "Vérifiez auprès de l'administration fiscale si une dernière déclaration est requise et quel délai s'applique à la situation fiscale de la personne décédée.",
    },
    de: {
      title: "Falls erforderlich, die letzte Einkommensteuererklärung einreichen",
      description:
        "Klären Sie mit der Steuerverwaltung, ob eine letzte Erklärung erforderlich ist und welche Frist für die steuerliche Situation der verstorbenen Person gilt.",
    },
    lu: {
      title: "Wann néideg, déi lescht Akommessteiererklärung areechen",
      description:
        "Kläert mat der Steierverwaltung, ob eng lescht Deklaratioun néideg ass a wéi eng Frist fir d'Steiersituatioun vun der verstuerwener Persoun gëllt.",
    },
  },
  "task_template.lu.bereavement.succession.engage_notary": {
    en: {
      title: "Contact a notary when inheritance evidence or a complex estate requires one",
      description:
        "A notary may be needed to establish inheritance rights or deal with a complex estate. Ask for the likely procedure and costs before instructing one.",
    },
    fr: {
      title: "Contacter un notaire si une preuve d'hérédité ou une succession complexe l'exige",
      description:
        "Un notaire peut être nécessaire pour établir les droits des héritiers ou régler une succession complexe. Demandez des informations sur la procédure et les coûts prévisibles avant de lui confier le dossier.",
    },
    de: {
      title: "Bei Erbnachweisen oder einem komplexen Nachlass einen Notar kontaktieren",
      description:
        "Ein Notar kann erforderlich sein, um Erbrechte nachzuweisen oder einen komplexen Nachlass zu regeln. Erkundigen Sie sich vor der Beauftragung nach dem voraussichtlichen Verfahren und den Kosten.",
    },
    lu: {
      title: "En Notaire kontaktéieren, wann en Noweis iwwer d'Ierfschaft néideg oder d'Ierfschaft komplex ass",
      description:
        "En Notaire kann néideg sinn, fir Ierfrechter nozewise oder eng komplex Ierfschaft ze regelen. Frot, ier Dir en mandatéiert, no der méiglecher Prozedur an de Käschten.",
    },
  },
  "task_template.lu.bereavement.death_registration.file_death_declaration": {
    en: {
      title: "Declare the death at the commune and request death-certificate copies",
      description:
        "Declare the death at the commune where it occurred. Ask which extracts or multilingual copies are available and whether fees apply.",
    },
    fr: {
      title: "Déclarer le décès à la commune et demander des copies de l'acte de décès",
      description:
        "Déclarez le décès dans la commune où il a eu lieu. Demandez quels extraits ou quelles copies plurilingues sont disponibles et si des frais s'appliquent.",
    },
    de: {
      title: "Todesfall bei der Gemeinde melden und Abschriften der Sterbeurkunde anfordern",
      description:
        "Melden Sie den Todesfall bei der Gemeinde, in der er eingetreten ist. Fragen Sie, welche Auszüge oder mehrsprachigen Abschriften erhältlich sind und ob Gebühren anfallen.",
    },
    lu: {
      title: "Den Doudesfall bei der Gemeng mellen a Kopie vum Doudesakt ufroen",
      description:
        "Mellt den Doudesfall bei der Gemeng, an där en agetrueden ass. Frot, wéi eng Extraiten oder méisproocheg Kopien disponibel sinn an ob Taxen ufalen.",
    },
  },
  "task_template.lu.bereavement.succession.decide_accept_renounce": {
    en: {
      title: "Decide whether to accept, challenge, or renounce the inheritance",
      description:
        "This is an important legal choice. Seek professional advice before acting if the estate may include debts, a dispute, or a minor heir.",
    },
    fr: {
      title: "Décider d'accepter, de contester ou de renoncer à la succession",
      description:
        "Il s'agit d'un choix juridique important. Demandez conseil à un professionnel avant d'agir si la succession peut comporter des dettes, un litige ou un héritier mineur.",
    },
    de: {
      title: "Entscheiden, ob die Erbschaft angenommen, angefochten oder ausgeschlagen wird",
      description:
        "Dies ist eine wichtige rechtliche Entscheidung. Holen Sie vorab fachlichen Rat ein, wenn der Nachlass Schulden, einen Streitfall oder minderjährige Erben umfassen kann.",
    },
    lu: {
      title: "Decidéieren, ob d'Ierfschaft ugeholl, contestéiert oder ausgeschloe gëtt",
      description:
        "Dat ass eng wichteg juristesch Decisioun. Sicht virdru professionell Berodung, wann d'Ierfschaft Scholden, e Sträit oder e mannerjäregen Ierwe kann enthalen.",
    },
  },
  "task_template.lu.bereavement.survivor_pension.file_cnap_claim": {
    en: {
      title: "Apply for the CNAP survivor pension",
      description:
        "Check eligibility with the CNAP and ask for the current application form and supporting documents.",
    },
    fr: {
      title: "Demander la pension de survie de la CNAP",
      description:
        "Vérifiez les conditions auprès de la CNAP et demandez le formulaire actuel ainsi que la liste des justificatifs.",
    },
    de: {
      title: "CNAP-Hinterbliebenenrente beantragen",
      description:
        "Prüfen Sie den Anspruch bei der CNAP und fragen Sie nach dem aktuellen Antragsformular und den erforderlichen Nachweisen.",
    },
    lu: {
      title: "Eng Iwwerliewenspensioun bei der CNAP ufroen",
      description:
        "Kontrolléiert d'Konditioune bei der CNAP a frot no dem aktuelle Formulaire an den néidegen Noweiser.",
    },
  },
  "task_template.lu.bereavement.health_insurance.claim_funeral_allowance": {
    en: {
      title: "Apply for the CNS funeral allowance",
      description:
        "Ask the CNS whether the funeral allowance applies, which documents are required, and what current amount may be paid.",
    },
    fr: {
      title: "Demander l'indemnité funéraire de la CNS",
      description:
        "Demandez à la CNS si l'indemnité funéraire s'applique, quels documents sont nécessaires et quel montant peut actuellement être versé.",
    },
    de: {
      title: "Bestattungskostenbeihilfe der CNS beantragen",
      description:
        "Fragen Sie die CNS, ob die Beihilfe gewährt werden kann, welche Unterlagen erforderlich sind und welcher aktuelle Betrag gezahlt werden kann.",
    },
    lu: {
      title: "D'Begriefnesindemnitéit vun der CNS ufroen",
      description:
        "Frot d'CNS, ob d'Begriefnesindemnitéit gëllt, wéi eng Dokumenter néideg sinn a wéi en aktuelle Betrag ka bezuelt ginn.",
    },
  },
  "task_template.lu.bereavement.employment.claim_bereavement_leave": {
    en: {
      title: "Request bereavement leave from your employer",
      description:
        "Request the leave expressly from your employer. The number of days depends on your relationship to the deceased person.",
    },
    fr: {
      title: "Demander le congé en cas de décès à votre employeur",
      description:
        "Demandez expressément ce congé à votre employeur. Le nombre de jours dépend de votre lien avec la personne décédée.",
    },
    de: {
      title: "Sonderurlaub im Todesfall beim Arbeitgeber beantragen",
      description:
        "Beantragen Sie den Urlaub ausdrücklich bei Ihrem Arbeitgeber. Die Zahl der Tage hängt von Ihrer Beziehung zur verstorbenen Person ab.",
    },
    lu: {
      title: "Sondercongé am Doudesfall beim Patron ufroen",
      description:
        "Frot de Congé ausdrécklech beim Patron un. D'Zuel vun den Deeg hänkt vun Ärer Bezéiung mat der verstuerwener Persoun of.",
    },
  },
  "task_template.lu.bereavement.funeral.arrange_funeral_or_cremation": {
    en: {
      title: "Arrange the burial or cremation",
      description:
        "Obtain the required authorization and confirm the current timing and documents with the civil registrar or funeral professional.",
    },
    fr: {
      title: "Organiser l'inhumation ou la crémation",
      description:
        "Obtenez l'autorisation requise et confirmez le délai et les documents actuels auprès de l'officier de l'état civil ou de l'entreprise de pompes funèbres.",
    },
    de: {
      title: "Bestattung oder Einäscherung organisieren",
      description:
        "Holen Sie die erforderliche Genehmigung ein und bestätigen Sie die aktuelle Frist und die Unterlagen beim Standesamt oder Bestattungsunternehmen.",
    },
    lu: {
      title: "D'Begriefnes oder d'Anäscherung organiséieren",
      description:
        "Kritt déi néideg Autorisatioun a confirméiert déi aktuell Frist an d'Dokumenter beim Zivilstandsbeamten oder Bestattungsentreprener.",
    },
  },
};

export function checklistTaskText(
  lang: Lang,
  id: string,
  fallbackTitle: string,
  fallbackDescription: string,
): ChecklistTaskText {
  return (
    CHECKLIST_TASK_COPY[id]?.[lang] ?? { title: fallbackTitle, description: fallbackDescription }
  );
}

type IntakeLabels = { label_en: string; label_fr: string; label_de: string };

const INTAKE_QUESTION_COPY: Record<string, { fr?: string; de?: string; lu: string }> = {
  "survivor.employment_status": {
    fr: "Quelle est votre situation professionnelle ?",
    de: "Wie ist Ihre Beschäftigungssituation?",
    lu: "Wéi ass Är Aarbechtssituatioun?",
  },
  "survivor.cohabitation.months": {
    lu: "Wéi vill Méint hutt Dir virum Doud mat der verstuerwener Persoun zesummegelieft?",
  },
  "repatriation.requested": {
    fr: "La famille souhaite-t-elle transporter le corps ou les cendres dans un autre pays ?",
    de: "Möchte die Familie den Leichnam oder die Asche in ein anderes Land überführen?",
    lu: "Wëll d'Famill de Läichnam oder d'Äschen an en anert Land iwwerféieren?",
  },
  "relationship.to_deceased": {
    fr: "Quel est votre lien avec la personne décédée ?",
    de: "In welcher Beziehung stehen Sie zur verstorbenen Person?",
    lu: "A wéi enger Bezéiung stitt Dir zu der verstuerwener Persoun?",
  },
  "marriage_or_partnership.status": {
    fr: "Quelle était la situation matrimoniale ou le partenariat ?",
    de: "Wie war der Ehe- oder Partnerschaftsstatus?",
    lu: "Wéi war den Ehe- oder Partnerschaftsstatus?",
  },
  "death.place.country": {
    fr: "Dans quel pays le décès a-t-il eu lieu ?",
    de: "In welchem Land ist der Todesfall eingetreten?",
    lu: "A wéi engem Land ass d'Persoun gestuerwen?",
  },
  "estate.real_estate.exists": {
    fr: "La personne décédée possédait-elle un bien immobilier ?",
    de: "Besaß die verstorbene Person Immobilien?",
    lu: "Hat déi verstuerwe Persoun Immobilien?",
  },
  "estate.asset_location.country": {
    fr: "Dans quels pays se trouvent les biens de la succession ?",
    de: "In welchen Ländern befindet sich das Nachlassvermögen?",
    lu: "A wéi enge Länner läit d'Ierfschaftsverméigen?",
  },
  "deceased.housing.was_tenant": {
    fr: "La personne décédée était-elle locataire ?",
    de: "War die verstorbene Person Mieterin oder Mieter?",
    lu: "War déi verstuerwe Persoun Locataire?",
  },
  "deceased.last_social_security_affiliation.country": {
    fr: "Dans quel pays la personne décédée était-elle affiliée en dernier lieu pour la pension ou la sécurité sociale ?",
    de: "In welchem Land war die verstorbene Person zuletzt renten- oder sozialversichert?",
    lu: "A wéi engem Land war déi verstuerwe Persoun fir d'lescht fir Pensioun oder Sozialversécherung affiliéiert?",
  },
  "deceased.owned_vehicle": {
    fr: "La personne décédée possédait-elle un véhicule immatriculé au Luxembourg ?",
    de: "Besaß die verstorbene Person ein in Luxemburg zugelassenes Fahrzeug?",
    lu: "Hat déi verstuerwe Persoun e Gefier, dat zu Lëtzebuerg ugemellt ass?",
  },
  "deceased.habitual_residence.country": {
    fr: "Dans quel pays la personne décédée avait-elle sa résidence habituelle ?",
    de: "In welchem Land hatte die verstorbene Person ihren gewöhnlichen Aufenthalt?",
    lu: "A wéi engem Land hat déi verstuerwe Persoun hire gewéinlechen Openthalt?",
  },
  "deceased.employment_status": {
    fr: "Quelle était la situation professionnelle de la personne décédée ?",
    de: "Wie war die Beschäftigungssituation der verstorbenen Person?",
    lu: "Wéi war d'Aarbechtssituatioun vun der verstuerwener Persoun?",
  },
};

const INTAKE_OPTION_LU: Record<string, string> = {
  true: "Jo",
  false: "Nee",
  UNKNOWN: "Ech weess et net",
  unknown: "Ech weess et net",
  LU: "Lëtzebuerg",
  DE: "Däitschland",
  FR: "Frankräich",
  BE: "Belsch",
  employee: "Salariéiert",
  apprentice: "An der Léier",
  self_employed: "Selbstänneg",
  business_owner: "Betribsbesëtzer oder Betribsbesëtzerin",
  not_employed: "Net beruffstäteg",
  retired: "An der Pensioun",
  surviving_spouse: "Iwwerliewenden Ehepartner",
  registered_partner: "Agedroene Partner",
  child: "Kand",
  parent: "Elterendeel",
  sibling: "Brudder oder Schwëster",
  other_relative: "Aner Familljemember",
  unrelated_person: "Net Famill",
  married: "Bestuet",
  registered_partnership: "Agedroe Partnerschaft",
  divorced: "Gescheet",
  former_partner: "Fréiere Partner",
  not_married_or_partnered: "Net bestuet an net an enger Partnerschaft",
};

export function intakeQuestionText(lang: Lang, path: string, labels: IntakeLabels): string {
  if (lang === "en") return labels.label_en;
  const translated = INTAKE_QUESTION_COPY[path]?.[lang];
  if (translated) return translated;
  return lang === "de" ? labels.label_de : labels.label_fr;
}

export function intakeOptionText(lang: Lang, value: string, labels: IntakeLabels): string {
  if (lang === "lu") return INTAKE_OPTION_LU[value] ?? labels.label_fr ?? labels.label_en;
  return lang === "fr" ? labels.label_fr : lang === "de" ? labels.label_de : labels.label_en;
}
