export type GuideLocale =
  | "en"
  | "de"
  | "es"
  | "fr"
  | "pt"
  | "it"
  | "nl"
  | "tr"
  | "pl"
  | "ro"
  | "uk"
  | "ar"
  | "ru"
  | "lu";

export const GUIDE_LOCALE_LABELS: Record<GuideLocale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  pt: "Português",
  it: "Italiano",
  nl: "Nederlands",
  tr: "Türkçe",
  pl: "Polski",
  ro: "Română",
  uk: "Українська",
  ar: "العربية",
  ru: "Русский",
  lu: "Lëtzebuergesch",
};

export type GuideUiCopy = {
  breadcrumbGuidance: string;
  crossBorderBadge: (c1: string, code1: string, c2: string, code2: string) => string;
  jurisdictionBadge: (c1: string, code1: string) => string;
  sourcesVerifiedBadge: (count: number, date: string) => string;
  languageSwitchLabel: string;
  readInOtherLang: (langName: string) => string;
  topCtaTitle: string;
  topCtaSubtitle: string;
  topCtaButton: string;
  fiveStepHeading: string;
  fiveStepSublabel: string;
  stepPrefix: string;
  midCtaTitle: string;
  midCtaSubtitle: string;
  midCtaPrimary: string;
  contactsHeading: string;
  phoneLabel: string;
  emailLabel: string;
  sourcesHeading: string;
  ctaEyebrow: string;
  ctaHeading: string;
  ctaIntro: string;
  ctaFocusLabel: string;
  ctaSpecificPrefix: string;
  trustHeading: string;
  trustBody: (date: string) => string;
  abroadHubHeading: string;
  abroadHubIntro: (country: string) => string;
  abroadHubTriggers: (country: string) => [string, string, string];
  abroadHubCorridorsLabel: (country: string) => string;
  abroadHubCtaPrompt: (country: string) => string;
  abroadHubCtaButton: string;
  parentHubsHeading: string;
  relatedHeading: string;
  backToGuidance: string;
};

export const GUIDE_UI_COPY: Record<GuideLocale, GuideUiCopy> = {
  en: {
    breadcrumbGuidance: "Guidance",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Cross-Border: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Jurisdiction: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} Official Sources Verified (${date})`,
    languageSwitchLabel: "Language:",
    readInOtherLang: (langName) => `Read in ${langName} →`,
    topCtaTitle:
      "Need a personalized step-by-step roadmap for your family’s exact municipality or situation?",
    topCtaSubtitle:
      "Free nonprofit service by Clarvia ASBL · Replies by email in 100+ languages with official sources.",
    topCtaButton: "Ask Clarvia (Pre-Filled)",
    fiveStepHeading: "5-Step Official Summary Checklist",
    fiveStepSublabel: "Public Reference Roadmap",
    stepPrefix: "Step",
    midCtaTitle:
      "Unsure how these 5 steps apply to your local registry, consulate, or insurance policy?",
    midCtaSubtitle:
      "Describe what has already been done below. Ask Clarvia compiles the exact next steps and contacts for your case.",
    midCtaPrimary: "Get Personalized Next Steps",
    contactsHeading: "Official Authorities & Verified Contacts",
    phoneLabel: "Phone",
    emailLabel: "Email",
    sourcesHeading: "Official Sources Checked by Clarvia",
    ctaEyebrow: "Free Personalized Case Guidance · Clarvia ASBL",
    ctaHeading: "Get the Remaining Steps Tailored to Your Exact Situation by Email",
    ctaIntro:
      "The 5-step official summary above covers the national framework. The remaining steps depend on your specific facts. Click any topic below to pre-fill your question, or write your situation directly:",
    ctaFocusLabel: "What Ask Clarvia checks for your specific case (click to pre-fill):",
    ctaSpecificPrefix: "Specifically regarding:",
    trustHeading: "How this page was prepared",
    trustBody: (date) =>
      `This page is based on Clarvia task data that passed the publication gate. Last reviewed: ${date}. Check the linked official sources for the latest wording. Clarvia provides practical information and signposting, not professional legal, tax, medical, or notarial advice.`,
    abroadHubHeading: "If the Deceased or an Heir Lives Abroad",
    abroadHubIntro: (country) =>
      `The 5 steps above cover domestic procedures within ${country}. When the person held foreign citizenship, died outside their country of habitual residence, or left heirs, bank accounts, or property in another country, additional cross-border requirements apply:`,
    abroadHubTriggers: (country) => [
      `Consular Death Registration & Repatriation Permits: Before mortal remains or cremated ashes can cross an international border (or before a foreign estate can be opened), the death must be reported to the relevant foreign embassy or consulate alongside the civil registry in ${country}.`,
      `Apostille or Consular Legalization & Certified Translations: Official death certificates, wills, and powers of attorney issued in ${country} generally require a Hague Apostille (or diplomatic legalization) and certified translation to be accepted by foreign courts, registries, and banks.`,
      `Cross-Border Succession & Conflict-of-Law Rules: When an heir lives abroad or assets span ${country} and another jurisdiction, private international law rules (such as EU Succession Regulation 650/2012 or lex rei sitae for real estate) determine which court or notary handles each asset.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Dedicated Cross-Border Checklists Involving ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Coordinating between ${country} and another country not listed above?`,
    abroadHubCtaButton: "Ask Clarvia for Your Exact Two-Country Roadmap →",
    parentHubsHeading: "National Checklists for Each Country",
    relatedHeading: "Related Checklists & Guides",
    backToGuidance: "← Back to all published guidance",
  },
  de: {
    breadcrumbGuidance: "Orientierungshilfen",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Grenzüberschreitend: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Rechtsraum: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} amtliche Quellen geprüft (${date})`,
    languageSwitchLabel: "Sprache:",
    readInOtherLang: (langName) => `Auf ${langName} lesen →`,
    topCtaTitle:
      "Benötigen Sie einen auf Ihre genaue Gemeinde oder Familiensituation zugeschnittenen Leitfaden?",
    topCtaSubtitle:
      "Kostenloser gemeinnütziger Dienst von Clarvia ASBL · Antwort per E-Mail in über 100 Sprachen mit amtlichen Quellen.",
    topCtaButton: "Clarvia fragen (vorausgefüllt)",
    fiveStepHeading: "Offizielle 5-Schritte-Checkliste",
    fiveStepSublabel: "Öffentlicher Orientierungsleitfaden",
    stepPrefix: "Schritt",
    midCtaTitle:
      "Unsicher, wie diese 5 Schritte für Ihr örtliches Standesamt, Konsulat oder Ihre Versicherung gelten?",
    midCtaSubtitle:
      "Schildern Sie unten kurz Ihre Situation. Ask Clarvia stellt die genauen nächsten Schritte und Kontakte für Ihren Fall zusammen.",
    midCtaPrimary: "Persönliche nächste Schritte erhalten",
    contactsHeading: "Zuständige Behörden & geprüfte Anlaufstellen",
    phoneLabel: "Telefon",
    emailLabel: "E-Mail",
    sourcesHeading: "Von Clarvia geprüfte offizielle Quellen",
    ctaEyebrow: "Kostenlose persönliche Orientierung · Clarvia ASBL",
    ctaHeading: "Erhalten Sie die weiteren Schritte passend zu Ihrer Situation per E-Mail",
    ctaIntro:
      "Die obige 5-Schritte-Übersicht beschreibt den allgemeinen gesetzlichen Rahmen. Die weiteren Schritte hängen von Ihrem konkreten Einzelfall ab. Klicken Sie auf ein Thema zum Vorausfüllen oder schildern Sie Ihre Situation direkt:",
    ctaFocusLabel: "Was Ask Clarvia für Ihren konkreten Fall prüft (zum Vorausfüllen klicken):",
    ctaSpecificPrefix: "Insbesondere bezüglich:",
    trustHeading: "Wie diese Seite erstellt wurde",
    trustBody: (date) =>
      `Diese Seite beruht auf geprüften Clarvia-Daten. Zuletzt geprüft: ${date}. Den aktuellen Wortlaut finden Sie in den verlinkten amtlichen Quellen. Clarvia bietet praktische Orientierung und verweist an zuständige Stellen, ersetzt aber keine Rechts-, Steuer-, medizinische oder notarielle Beratung.`,
    abroadHubHeading: "Wenn die verstorbene Person oder ein Erbe im Ausland lebt (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Die obigen 5 Schritte beschreiben das innerstaatliche Verfahren in ${country}. Wenn eine ausländische Staatsangehörigkeit vorlag, der gewöhnliche Aufenthalt im Ausland lag oder Erben bzw. Vermögenswerte in einem anderen Staat betroffen sind, greifen zusätzliche grenzüberschreitende Vorgaben:`,
    abroadHubTriggers: (country) => [
      `Konsularische Meldung & Leichenpass / Überführung: Für eine internationale Überführung oder die Nachlassabwicklung im Ausland muss neben dem Standesamt in ${country} regelmäßig das zuständige Konsulat eingeschaltet werden.`,
      `Apostille oder Legalisation & beglaubigte Übersetzung: Urkunden, Vollmachten und Erbnachweise aus ${country} benötigen für ausländische Gerichte, Grundbuchämter und Banken meist eine Haager Apostille (oder mehrsprachige Formulare) sowie eine beglaubigte Übersetzung.`,
      `Internationales Erbrecht & Zuständigkeit: Leben Erben im Ausland oder befindet sich Vermögen in mehreren Staaten, bestimmen Kollisionsnormen (wie die EU-Erbrechtsverordnung Nr. 650/2012 oder das Belegenheitsrecht bei Immobilien), welches Gericht oder Notariat zuständig ist.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Grenzüberschreitende Checklisten mit Bezug zu ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Besteht eine Verbindung zwischen ${country} und einem weiteren Land?`,
    abroadHubCtaButton: "Individuellen Zwei-Länder-Leitfaden bei Ask Clarvia anfordern →",
    parentHubsHeading: "Nationale Checklisten für diese beiden Länder",
    relatedHeading: "Verwandte Länder- & Situations-Checklisten",
    backToGuidance: "← Zurück zu allen veröffentlichten Orientierungshilfen",
  },
  es: {
    breadcrumbGuidance: "Guías prácticas",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Internacional: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Jurisdicción: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} fuentes oficiales verificadas (${date})`,
    languageSwitchLabel: "Idioma:",
    readInOtherLang: (langName) => `Leer en ${langName} →`,
    topCtaTitle:
      "¿Necesita una hoja de ruta paso a paso adaptada al municipio o situación exacta de su familia?",
    topCtaSubtitle:
      "Servicio gratuito sin ánimo de lucro de Clarvia ASBL · Respuestas por correo electrónico en más de 100 idiomas con fuentes oficiales.",
    topCtaButton: "Preguntar a Clarvia (precompletado)",
    fiveStepHeading: "Lista oficial resumida en 5 pasos",
    fiveStepSublabel: "Guía pública de referencia",
    stepPrefix: "Paso",
    midCtaTitle:
      "¿Tiene dudas sobre cómo se aplican estos 5 pasos en su Registro Civil, consulado o póliza de seguro?",
    midCtaSubtitle:
      "Describa abajo lo que ya se ha gestionado. Ask Clarvia recopila los siguientes pasos exactos y contactos para su caso.",
    midCtaPrimary: "Recibir pasos personalizados",
    contactsHeading: "Autoridades oficiales y contactos verificados",
    phoneLabel: "Teléfono",
    emailLabel: "Correo",
    sourcesHeading: "Fuentes oficiales verificadas por Clarvia",
    ctaEyebrow: "Orientación personalizada gratuita · Clarvia ASBL",
    ctaHeading: "Reciba por correo electrónico los pasos restantes adaptados a su situación",
    ctaIntro:
      "El resumen oficial de 5 pasos anterior cubre el marco general. Los pasos siguientes dependen de las circunstancias de su caso. Haga clic en cualquier tema para precompletar su consulta o escriba directamente su situación:",
    ctaFocusLabel: "Qué verifica Ask Clarvia para su caso concreto (clic para precompletar):",
    ctaSpecificPrefix: "Específicamente en relación con:",
    trustHeading: "Cómo se ha elaborado esta página",
    trustBody: (date) =>
      `Esta página se basa en datos revisados de Clarvia. Última revisión: ${date}. Consulte las fuentes oficiales enlazadas para verificar la normativa vigente. Clarvia ofrece información práctica y orientación hacia organismos oficiales, no asesoramiento jurídico, fiscal, médico ni notarial.`,
    abroadHubHeading: "Si la persona fallecida o un heredero reside en el extranjero (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Los 5 pasos anteriores cubren el procedimiento interno en ${country}. Cuando la persona tenía otra nacionalidad, residía habitualmente en otro país o existen herederos, cuentas bancarias o inmuebles en el extranjero, se activan requisitos transfronterizos adicionales:`,
    abroadHubTriggers: (country) => [
      `Inscripción consular y permisos de repatriación: Para trasladar restos mortales o cenizas a través de una frontera internacional (o abrir una sucesión en otro país), debe coordinarse el Registro Civil de ${country} con el consulado correspondiente.`,
      `Apostilla de La Haya o legalización y traducción jurada: Las actas de defunción, testamentos y poderes emitidos en ${country} suelen requerir Apostilla de La Haya (o legalización diplomática) y traducción oficial para surtir efectos ante tribunales, registros y bancos extranjeros.`,
      `Sucesión internacional y ley aplicable: Cuando un heredero vive en el extranjero o el patrimonio se reparte entre ${country} y otro Estado, las normas de derecho internacional privado determinan qué juzgado o notaría es competente para cada bien.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Guías transfronterizas específicas vinculadas con ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `¿Necesita coordinar trámites entre ${country} y otro país?`,
    abroadHubCtaButton: "Solicitar hoja de ruta binacional en Ask Clarvia →",
    parentHubsHeading: "Guías nacionales principales de ambos países",
    relatedHeading: "Guías y listas de control relacionadas",
    backToGuidance: "← Volver a todas las guías publicadas",
  },
  fr: {
    breadcrumbGuidance: "Guides pratiques",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `International : ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Juridiction : ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} sources officielles vérifiées (${date})`,
    languageSwitchLabel: "Langue :",
    readInOtherLang: (langName) => `Lire en ${langName} →`,
    topCtaTitle:
      "Besoin d’une feuille de route étape par étape adaptée à votre commune ou à votre situation familiale ?",
    topCtaSubtitle:
      "Service gratuit à but non lucratif de Clarvia ASBL · Réponses par e-mail dans plus de 100 langues avec sources officielles.",
    topCtaButton: "Demander à Clarvia (pré-rempli)",
    fiveStepHeading: "Liste officielle résumée en 5 étapes",
    fiveStepSublabel: "Feuille de route publique de référence",
    stepPrefix: "Étape",
    midCtaTitle:
      "Vous souhaitez vérifier comment ces 5 étapes s’appliquent à votre mairie, consulat ou contrat d’assurance ?",
    midCtaSubtitle:
      "Décrivez ci-dessous les démarches déjà effectuées. Ask Clarvia rassemble les prochaines étapes et les contacts précis pour votre situation.",
    midCtaPrimary: "Obtenir les prochaines étapes personnalisées",
    contactsHeading: "Autorités officielles et contacts vérifiés",
    phoneLabel: "Téléphone",
    emailLabel: "E-mail",
    sourcesHeading: "Sources officielles vérifiées par Clarvia",
    ctaEyebrow: "Orientation personnalisée gratuite · Clarvia ASBL",
    ctaHeading: "Recevez par e-mail les démarches restantes adaptées à votre situation exacte",
    ctaIntro:
      "Le résumé officiel en 5 étapes ci-dessus présente le cadre général. Les démarches suivantes dépendent de votre situation précise. Cliquez sur un sujet ci-dessous pour pré-remplir votre question ou décrivez directement votre cas :",
    ctaFocusLabel: "Ce qu’Ask Clarvia vérifie pour votre dossier (cliquez pour pré-remplir) :",
    ctaSpecificPrefix: "Plus précisément concernant :",
    trustHeading: "Comment cette page a été préparée",
    trustBody: (date) =>
      `Cette page repose sur des données vérifiées de Clarvia. Dernière révision : ${date}. Consultez les sources officielles liées pour vérifier les textes en vigueur. Clarvia fournit des informations pratiques et oriente vers les services compétents, sans remplacer un conseil juridique, fiscal, médical ou notarial.`,
    abroadHubHeading: "Si le défunt ou un héritier réside à l’étranger (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Les 5 étapes ci-dessus couvrent les démarches nationales (${country}). Lorsque la personne possédait une nationalité étrangère, résidait dans un autre pays ou laisse des héritiers, des comptes bancaires ou des biens immobiliers à l’étranger, des formalités transfrontalières supplémentaires s’appliquent :`,
    abroadHubTriggers: (country) => [
      `Transcription consulaire et laissez-passer mortuaire : Tout rapatriement international de corps ou de cendres, ainsi que la reconnaissance du décès à l’étranger, nécessite de coordonner l’état civil local (${country}) et le consulat compétent.`,
      `Apostille ou légalisation et traduction assermentée : Les actes de décès, procurations et actes notariés délivrés (${country}) requièrent généralement une apostille de La Haye (ou une légalisation consulaire) et une traduction certifiée pour être reconnus par les banques et juridictions étrangères.`,
      `Règlement successoral international : Lorsqu’un héritier vit à l’étranger ou que le patrimoine s’étend sur plusieurs États, les règles de conflit de lois (comme le Règlement européen n° 650/2012 ou la loi du lieu de situation de l’immeuble) déterminent l’autorité compétente.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Guides transfrontaliers dédiés impliquant ${country} :`,
    abroadHubCtaPrompt: (country) =>
      `Votre situation implique ${country} et un autre pays ?`,
    abroadHubCtaButton: "Demander votre feuille de route binationale à Ask Clarvia →",
    parentHubsHeading: "Guides nationaux de référence pour ces deux pays",
    relatedHeading: "Guides et listes de contrôle connexes",
    backToGuidance: "← Retour à tous les guides publiés",
  },
  pt: {
    breadcrumbGuidance: "Guias práticos",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Internacional: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Jurisdição: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} fontes oficiais verificadas (${date})`,
    languageSwitchLabel: "Idioma:",
    readInOtherLang: (langName) => `Ler em ${langName} →`,
    topCtaTitle:
      "Precisa de um roteiro passo a passo adaptado ao município ou à situação exata da sua família?",
    topCtaSubtitle:
      "Serviço gratuito sem fins lucrativos da Clarvia ASBL · Respostas por e-mail em mais de 100 idiomas com fontes oficiais.",
    topCtaButton: "Perguntar à Clarvia (pré-preenchido)",
    fiveStepHeading: "Lista oficial resumida em 5 passos",
    fiveStepSublabel: "Roteiro público de referência",
    stepPrefix: "Passo",
    midCtaTitle:
      "Tem dúvidas sobre como estes 5 passos se aplicam à sua conservatória, cartório, consulado ou seguro?",
    midCtaSubtitle:
      "Descreva abaixo o que já foi tratado. A Ask Clarvia reúne os próximos passos exatos e os contactos para o seu caso.",
    midCtaPrimary: "Obter próximos passos personalizados",
    contactsHeading: "Autoridades oficiais e contactos verificados",
    phoneLabel: "Telefone",
    emailLabel: "E-mail",
    sourcesHeading: "Fontes oficiais verificadas pela Clarvia",
    ctaEyebrow: "Orientação personalizada gratuita · Clarvia ASBL",
    ctaHeading: "Receba por e-mail os passos seguintes adaptados à sua situação exata",
    ctaIntro:
      "O resumo oficial de 5 passos acima abrange o enquadramento geral. Os passos seguintes dependem dos detalhes do seu caso. Clique num tópico abaixo para pré-preencher a sua questão ou descreva diretamente a sua situação:",
    ctaFocusLabel: "O que a Ask Clarvia verifica para o seu caso específico (clique para pré-preencher):",
    ctaSpecificPrefix: "Especificamente sobre:",
    trustHeading: "Como esta página foi elaborada",
    trustBody: (date) =>
      `Esta página baseia-se em dados revistos pela Clarvia. Última revisão: ${date}. Consulte as fontes oficiais associadas para confirmar a redação mais recente. A Clarvia presta informação prática e encaminhamento institucional, não substituindo aconselhamento jurídico, fiscal, médico ou notarial.`,
    abroadHubHeading: "Se a pessoa falecida ou um herdeiro residir no estrangeiro (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Os 5 passos acima abrangem os procedimentos internos (${country}). Quando a pessoa tinha nacionalidade estrangeira, residia habitualmente noutro país ou deixa herdeiros, contas bancárias ou imóveis no exterior, aplicam-se exigências transfronteiriças adicionais:`,
    abroadHubTriggers: (country) => [
      `Registo consular e autorização de trasladação internacional: O transporte internacional de corpo ou cinzas e o reconhecimento do óbito no exterior exigem articulação entre o registo civil local (${country}) e o consulado competente.`,
      `Apostila de Haia ou legalização e tradução certificada: Certidões de óbito, procurações e testamentos emitidos (${country}) necessitam geralmente de Apostila de Haia (ou legalização consular) e tradução oficial para produzirem efeitos junto de tribunais e bancos estrangeiros.`,
      `Sucessão internacional e conflito de leis: Quando um herdeiro vive no estrangeiro ou existem bens em mais de um país, as normas de direito internacional privado determinam qual o tribunal, conservatória ou cartório competente.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Guias transfronteiriços específicos envolvendo ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Precisa de articular procedimentos entre ${country} e outro país?`,
    abroadHubCtaButton: "Pedir roteiro binacional personalizado à Ask Clarvia →",
    parentHubsHeading: "Guias nacionais principais destes dois países",
    relatedHeading: "Guias e listas de verificação relacionados",
    backToGuidance: "← Voltar a todos os guias publicados",
  },
  it: {
    breadcrumbGuidance: "Guide pratiche",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Internazionale: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Giurisdizione: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} fonti ufficiali verificate (${date})`,
    languageSwitchLabel: "Lingua:",
    readInOtherLang: (langName) => `Leggi in ${langName} →`,
    topCtaTitle:
      "Hai bisogno di una guida passo dopo passo adattata al comune o alla situazione specifica della tua famiglia?",
    topCtaSubtitle:
      "Servizio gratuito non-profit di Clarvia ASBL · Risposte via e-mail in oltre 100 lingue con fonti ufficiali.",
    topCtaButton: "Chiedi a Clarvia (precompilato)",
    fiveStepHeading: "Guida ufficiale riassuntiva in 5 passi",
    fiveStepSublabel: "Quadro pubblico di riferimento",
    stepPrefix: "Passo",
    midCtaTitle:
      "Non sei sicuro di come questi 5 passi si applichino al tuo comune, consolato o polizza assicurativa?",
    midCtaSubtitle:
      "Descrivi qui sotto cosa è già stato fatto. Ask Clarvia raccoglie i prossimi passi esatti e i contatti per il tuo caso.",
    midCtaPrimary: "Ricevi i prossimi passi personalizzati",
    contactsHeading: "Autorità ufficiali e contatti verificati",
    phoneLabel: "Telefono",
    emailLabel: "E-mail",
    sourcesHeading: "Fonti ufficiali verificate da Clarvia",
    ctaEyebrow: "Orientamento personalizzato gratuito · Clarvia ASBL",
    ctaHeading: "Ricevi via e-mail i passaggi successivi su misura per la tua situazione",
    ctaIntro:
      "Il riepilogo ufficiale in 5 passi sopra copre il quadro nazionale generale. I passaggi successivi dipendono dai dettagli del tuo caso. Clicca su un argomento qui sotto per precompilare la domanda o descrivi direttamente la tua situazione:",
    ctaFocusLabel: "Cosa verifica Ask Clarvia per il tuo caso specifico (clicca per precompilare):",
    ctaSpecificPrefix: "In particolare riguardo a:",
    trustHeading: "Come è stata preparata questa pagina",
    trustBody: (date) =>
      `Questa pagina si basa su dati verificati da Clarvia. Ultima revisione: ${date}. Consulta le fonti ufficiali collegate per verificare le disposizioni vigenti. Clarvia fornisce informazioni pratiche e orientamento verso gli enti competenti, non consulenza legale, fiscale, medica o notarile.`,
    abroadHubHeading: "Se la persona deceduta o un erede vive all’estero (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `I 5 passi sopra indicati riguardano le procedure interne (${country}). Se la persona aveva cittadinanza straniera, risiedeva abitualmente all’estero o lascia eredi, conti bancari o immobili in un altro Stato, si applicano ulteriori adempimenti transfrontalieri:`,
    abroadHubTriggers: (country) => [
      `Trascrizione consolare e passaporto mortuario: Il rimpatrio internazionale della salma o delle ceneri e la registrazione del decesso all’estero richiedono il coordinamento tra l’ufficio di stato civile (${country}) e l’autorità consolare competente.`,
      `Apostille o legalizzazione e traduzione certificata: Gli atti di morte, le procure e gli atti notarili formati (${country}) necessitano di norma di Apostille dell’Aia (o modulo plurilingue) e traduzione ufficiale per banche, tribunali e registri esteri.`,
      `Successione internazionale e legge applicabile: Quando un erede risiede all’estero o il patrimonio è diviso tra più Stati, le norme di diritto internazionale privato (come il Regolamento UE n. 650/2012) stabiliscono l’autorità competente.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Guide transfrontaliere specifiche relative a ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Devi coordinare pratiche tra ${country} e un altro Paese?`,
    abroadHubCtaButton: "Richiedi a Ask Clarvia la guida per i tuoi due Paesi →",
    parentHubsHeading: "Guide nazionali di riferimento per questi due Paesi",
    relatedHeading: "Guide e checklist correlate",
    backToGuidance: "← Torna a tutte le guide pubblicate",
  },
  nl: {
    breadcrumbGuidance: "Praktische gidsen",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Grensoverschrijdend: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Rechtsgebied: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} officiële bronnen gecontroleerd (${date})`,
    languageSwitchLabel: "Taal:",
    readInOtherLang: (langName) => `Lees in het ${langName} →`,
    topCtaTitle:
      "Heeft u een persoonlijk stappenplan nodig dat is afgestemd op uw specifieke gemeente of gezinssituatie?",
    topCtaSubtitle:
      "Gratis non-profitdienst van Clarvia ASBL · Antwoord per e-mail in meer dan 100 talen met officiële bronnen.",
    topCtaButton: "Vraag het Clarvia (vooraf ingevuld)",
    fiveStepHeading: "Officiële samenvattende checklist in 5 stappen",
    fiveStepSublabel: "Publiek referentieoverzicht",
    stepPrefix: "Stap",
    midCtaTitle:
      "Twijfelt u hoe deze 5 stappen gelden voor uw gemeente, consulaat of verzekeringspolis?",
    midCtaSubtitle:
      "Beschrijf hieronder wat al is geregeld. Ask Clarvia stelt de exacte vervolgstappen en contactgegevens voor uw situatie samen.",
    midCtaPrimary: "Ontvang persoonlijke vervolgstappen",
    contactsHeading: "Officiële instanties & gecontroleerde contactgegevens",
    phoneLabel: "Telefoon",
    emailLabel: "E-mail",
    sourcesHeading: "Door Clarvia gecontroleerde officiële bronnen",
    ctaEyebrow: "Gratis persoonlijke wegwijzer · Clarvia ASBL",
    ctaHeading: "Ontvang de overige stappen op maat van uw situatie per e-mail",
    ctaIntro:
      "De bovenstaande checklist in 5 stappen behandelt het algemene kader. De vervolgstappen hangen af van uw specifieke omstandigheden. Klik op een onderwerp hieronder om uw vraag vooraf in te vullen of beschrijf uw situatie direct:",
    ctaFocusLabel: "Wat Ask Clarvia voor uw specifieke situatie nagaat (klik om in te vullen):",
    ctaSpecificPrefix: "Specifiek met betrekking tot:",
    trustHeading: "Hoe deze pagina tot stand is gekomen",
    trustBody: (date) =>
      `Deze pagina is gebaseerd op gecontroleerde gegevens van Clarvia. Laatst gecontroleerd: ${date}. Raadpleeg de gelinkte officiële bronnen voor de meest actuele regelgeving. Clarvia biedt praktische informatie en doorverwijzing naar bevoegde instanties, geen juridisch, fiscaal, medisch of notarieel advies.`,
    abroadHubHeading: "Als de overledene of een erfgenaam in het buitenland woont (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `De 5 bovenstaande stappen beschrijven de binnenlandse procedure in ${country}. Wanneer de persoon een buitenlandse nationaliteit had, in het buitenland woonde of erfgenamen, bankrekeningen of onroerend goed in een ander land nalaat, gelden aanvullende grensoverschrijdende regels:`,
    abroadHubTriggers: (country) => [
      `Consulaire registratie & laissez-passer voor overbrenging: Voor internationaal vervoer van een lichaam of asbus en erkenning in het buitenland is afstemming nodig tussen de burgerlijke stand in ${country} en het bevoegde consulaat.`,
      `Apostille of legalisatie & beëdigde vertaling: Overlijdensakten, volmachten en verklaringen van erfrecht uit ${country} vereisen doorgaans een Haags apostille (of meertalig uittreksel) en beëdigde vertaling voor buitenlandse banken en rechtbanken.`,
      `Internationaal erfrecht: Wanneer een erfgenaam in het buitenland woont of vermogen in meerdere landen ligt, bepalen regels van internationaal privaatrecht (zoals de Europese Erfrechtverordening) welke notaris of rechter bevoegd is.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Specifieke grensoverschrijdende checklists met ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Te maken met zowel ${country} als een ander land?`,
    abroadHubCtaButton: "Vraag uw persoonlijke twee-landenstappenplan aan bij Ask Clarvia →",
    parentHubsHeading: "Nationale overzichtsgidsen voor deze twee landen",
    relatedHeading: "Gerelateerde landen- & situatiechecklists",
    backToGuidance: "← Terug naar alle gepubliceerde gidsen",
  },
  tr: {
    breadcrumbGuidance: "Rehberler",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Ülkeler Arası: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Yetki Alanı: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} Resmi Kaynak Doğrulandı (${date})`,
    languageSwitchLabel: "Dil:",
    readInOtherLang: (langName) => `${langName} olarak oku →`,
    topCtaTitle:
      "Ailenizin bulunduğu il/belediye veya özel durumuna göre uyarlanmış adım adım bir yol haritasına mı ihtiyacınız var?",
    topCtaSubtitle:
      "Clarvia ASBL tarafından sunulan ücretsiz, kâr amacı gütmeyen hizmet · Resmi kaynaklarla 100'den fazla dilde e-posta yanıtı.",
    topCtaButton: "Clarvia'ya Sorun (Ön Doldurulmuş)",
    fiveStepHeading: "5 Adımlı Resmi Özet Kontrol Listesi",
    fiveStepSublabel: "Kamusal Referans Rehberi",
    stepPrefix: "Adım",
    midCtaTitle:
      "Bu 5 adımın bulunduğunuz belediye, nüfus müdürlüğü, konsolosluk veya sigorta poliçeniz için nasıl işlediğinden emin değil misiniz?",
    midCtaSubtitle:
      "Aşağıda şimdiye kadar yapılan işlemleri kısaca belirtin. Ask Clarvia durumunuza özel sonraki adımları ve resmi iletişim bilgilerini derler.",
    midCtaPrimary: "Durumunuza Özel Adımları Alın",
    contactsHeading: "Resmi Kurumlar ve Doğrulanmış İletişim Bilgileri",
    phoneLabel: "Telefon",
    emailLabel: "E-posta",
    sourcesHeading: "Clarvia Tarafından Doğrulanan Resmi Kaynaklar",
    ctaEyebrow: "Ücretsiz Kişiselleştirilmiş Rehberlik · Clarvia ASBL",
    ctaHeading: "Durumunuza Özel Kalan Adımları E-posta ile Alın",
    ctaIntro:
      "Yukarıdaki 5 adımlı resmi özet genel yasal çerçeveyi kapsar. Sonraki adımlar özel durumunuza bağlıdır. Sorunuzu otomatik doldurmak için aşağıdaki başlıklardan birine tıklayın veya durumunuzu doğrudan yazın:",
    ctaFocusLabel: "Ask Clarvia'nın durumunuz için kontrol ettiği konular (doldurmak için tıklayın):",
    ctaSpecificPrefix: "Özellikle şu konuda:",
    trustHeading: "Bu sayfa nasıl hazırlandı",
    trustBody: (date) =>
      `Bu sayfa, Clarvia'nın doğrulama sürecinden geçmiş resmi verilere dayanmaktadır. Son inceleme: ${date}. En güncel mevzuat için bağlantılı resmi kaynakları kontrol edin. Clarvia pratik bilgi ve resmi kurumlara yönlendirme sunar; hukuki, vergisel, tıbbi veya noterlik danışmanlığı vermez.`,
    abroadHubHeading: "Vefat Eden Kişi veya Bir Mirasçı Yurt Dışında Yaşıyorsa (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Yukarıdaki 5 adım ${country} içindeki ulusal işlemleri kapsar. Kişinin yabancı vatandaşlığı varsa, mutat meskeni başka bir ülkedeyse veya mirasçılar, banka hesapları ya da taşınmazlar başka bir ülkede bulunuyorsa ek uluslararası prosedürler devreye girer:`,
    abroadHubTriggers: (country) => [
      `Konsolosluk Bildirimi ve Uluslararası Cenaze Nakil İzni: Cenazenin veya küllerin uluslararası sınır geçişi ve yabancı ülkede nüfus tescili için ${country} makamları ile ilgili başkonsolosluk/büyükelçilik koordinasyonu gerekir.`,
      `Apostil / Tasdik Şerhi ve Yeminli Tercüme: ${country} makamlarınca düzenlenen ölüm belgeleri, vekaletnameler ve mirasçılık belgelerinin yabancı mahkeme, tapu ve bankalarda geçerli olması için Lahey Apostili (veya konsolosluk tasdiki) ve onaylı tercüme gerekir.`,
      `Uluslararası Miras ve Yetkili Mahkeme Kuralları: Mirasçılardan biri yurt dışında yaşadığında veya malvarlığı birden fazla ülkeye yayıldığında, milletlerarası özel hukuk kuralları (özellikle taşınmazlarda bulunduğu ülke hukuku) hangi makamın yetkili olduğunu belirler.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `${country} Bağlantılı Ülkeler Arası Rehberler:`,
    abroadHubCtaPrompt: (country) =>
      `${country} ile listede yer almayan başka bir ülke arasında işlem mi yürütüyorsunuz?`,
    abroadHubCtaButton: "Ask Clarvia'dan İki Ülkeli Özel Yol Haritanızı İsteyin →",
    parentHubsHeading: "Bu İki Ülke İçin Ulusal Ana Rehberler",
    relatedHeading: "İlgili Ülke ve Durum Rehberleri",
    backToGuidance: "← Yayınlanan tüm rehberlere dön",
  },
  pl: {
    breadcrumbGuidance: "Poradniki",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Międzynarodowe: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Jurysdykcja: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `Zweryfikowane źródła oficjalne: ${count} (${date})`,
    languageSwitchLabel: "Język:",
    readInOtherLang: (langName) => `Czytaj po: ${langName} →`,
    topCtaTitle:
      "Potrzebujesz szczegółowego planu działania dopasowanego do konkretnej miejscowości lub sytuacji Twojej rodziny?",
    topCtaSubtitle:
      "Bezpłatna usługa organizacji non-profit Clarvia ASBL · Odpowiedzi e-mailem w ponad 100 językach z oficjalnymi źródłami.",
    topCtaButton: "Zapytaj Clarvię (wstępnie wypełnione)",
    fiveStepHeading: "Oficjalna lista kontrolna w 5 krokach",
    fiveStepSublabel: "Publiczny przewodnik referencyjny",
    stepPrefix: "Krok",
    midCtaTitle:
      "Nie masz pewności, jak te 5 kroków odnosi się do Twojego Urzędu Stanu Cywilnego, konsulatu lub polisy ubezpieczeniowej?",
    midCtaSubtitle:
      "Opisz poniżej, co zostało już zrobione. Ask Clarvia przygotuje dokładne kolejne kroki i kontakty dla Twojej sprawy.",
    midCtaPrimary: "Otrzymaj spersonalizowane kolejne kroki",
    contactsHeading: "Oficjalne urzędy i zweryfikowane dane kontaktowe",
    phoneLabel: "Telefon",
    emailLabel: "E-mail",
    sourcesHeading: "Oficjalne źródła zweryfikowane przez Clarvię",
    ctaEyebrow: "Bezpłatne spersonalizowane wskazówki · Clarvia ASBL",
    ctaHeading: "Otrzymaj e-mailem dalsze kroki dopasowane do Twojej sytuacji",
    ctaIntro:
      "Powyższe oficjalne podsumowanie w 5 krokach obejmuje ogólne ramy prawne. Dalsze kroki zależą od szczegółów Twojej sprawy. Kliknij dowolny temat poniżej, aby wstępnie wypełnić pytanie, lub opisz swoją sytuację bezpośrednio:",
    ctaFocusLabel: "Co Ask Clarvia sprawdza w Twojej sprawie (kliknij, aby wypełnić):",
    ctaSpecificPrefix: "W szczególności w kwestii:",
    trustHeading: "Jak powstała ta strona",
    trustBody: (date) =>
      `Ta strona opiera się na zweryfikowanych danych Clarvia. Ostatni przegląd: ${date}. Sprawdź podlinkowane oficjalne źródła, aby upewnić się co do aktualnych przepisów. Clarvia zapewnia praktyczne informacje i wskazuje właściwe instytucje, ale nie świadczy porad prawnych, podatkowych, medycznych ani notarialnych.`,
    abroadHubHeading: "Gdy osoba zmarła lub spadkobierca mieszka za granicą (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Powyższe 5 kroków obejmuje procedury krajowe (${country}). Jeżeli osoba posiadała obce obywatelstwo, mieszkała na stałe za granicą lub pozostawiła spadkobierców, rachunki bankowe bądź nieruchomości w innym państwie, zastosowanie mają dodatkowe wymogi transgraniczne:`,
    abroadHubTriggers: (country) => [
      `Rejestracja konsularna i przewóz zwłok lub prochów: Międzynarodowy transport ciała lub urny oraz umiejscowienie aktu zgonu za granicą wymagają współdziałania urzędu stanu cywilnego (${country}) oraz właściwego konsulatu.`,
      `Apostille lub legalizacja oraz tłumaczenie przysięgłe: Akty zgonu, pełnomocnictwa i dokumenty spadkowe wydane (${country}) wymagają co do zasady klauzuli Apostille (lub wielojęzycznego odpisu) oraz tłumaczenia uwierzytelnionego dla zagranicznych sądów i banków.`,
      `Międzynarodowe postępowanie spadkowe: Gdy spadkobierca mieszka za granicą lub majątek znajduje się w więcej niż jednym kraju, przepisy prawa prywatnego międzynarodowego (np. rozporządzenie spadkowe UE nr 650/2012) określają właściwy sąd lub notariusza.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Dedykowane poradniki transgraniczne obejmujące ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Sprawa dotyczy ${country} oraz innego kraju spoza powyższej listy?`,
    abroadHubCtaButton: "Poproś Ask Clarvia o plan działania dla obu krajów →",
    parentHubsHeading: "Krajowe poradniki główne dla tych dwóch państw",
    relatedHeading: "Powiązane listy kontrolne i poradniki",
    backToGuidance: "← Powrót do wszystkich opublikowanych poradników",
  },
  ro: {
    breadcrumbGuidance: "Ghiduri practice",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Transfrontalier: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Jurisdicție: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} surse oficiale verificate (${date})`,
    languageSwitchLabel: "Limbă:",
    readInOtherLang: (langName) => `Citește în ${langName} →`,
    topCtaTitle:
      "Aveți nevoie de un plan pas cu pas adaptat localității sau situației exacte a familiei dumneavoastră?",
    topCtaSubtitle:
      "Serviciu gratuit non-profit oferit de Clarvia ASBL · Răspunsuri prin e-mail în peste 100 de limbi, bazate pe surse oficiale.",
    topCtaButton: "Întrebați Clarvia (precompletat)",
    fiveStepHeading: "Listă oficială rezumată în 5 pași",
    fiveStepSublabel: "Ghid public de referință",
    stepPrefix: "Pasul",
    midCtaTitle:
      "Nu sunteți sigur cum se aplică acești 5 pași la primăria, consulatul sau polița dumneavoastră de asigurare?",
    midCtaSubtitle:
      "Descrieți mai jos ce demersuri au fost deja făcute. Ask Clarvia reunește pașii următori exacți și datele de contact pentru cazul dumneavoastră.",
    midCtaPrimary: "Obțineți pașii următori personalizați",
    contactsHeading: "Autorități oficiale și date de contact verificate",
    phoneLabel: "Telefon",
    emailLabel: "E-mail",
    sourcesHeading: "Surse oficiale verificate de Clarvia",
    ctaEyebrow: "Îndrumare personalizată gratuită · Clarvia ASBL",
    ctaHeading: "Primiți prin e-mail pașii rămași adaptați situației dumneavoastră exacte",
    ctaIntro:
      "Rezumatul oficial în 5 pași de mai sus acoperă cadrul național general. Pașii următori depind de detaliile cazului dumneavoastră. Faceți clic pe orice subiect de mai jos pentru a precompleta întrebarea sau descrieți direct situația:",
    ctaFocusLabel: "Ce verifică Ask Clarvia pentru cazul dumneavoastră (clic pentru precompletare):",
    ctaSpecificPrefix: "În special cu privire la:",
    trustHeading: "Cum a fost pregătită această pagină",
    trustBody: (date) =>
      `Această pagină se bazează pe date verificate de Clarvia. Ultima verificare: ${date}. Consultați sursele oficiale asociate pentru a verifica prevederile în vigoare. Clarvia oferă informații practice și îndrumare către instituțiile competente, nu consultanță juridică, fiscală, medicală sau notarială.`,
    abroadHubHeading: "Dacă persoana decedată sau un moștenitor locuiește în străinătate (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Cei 5 pași de mai sus acoperă procedurile interne din ${country}. Când persoana avea cetățenie străină, reședința obișnuită într-un alt stat sau există moștenitori, conturi bancare ori bunuri imobile în străinătate, se aplică cerințe transfrontaliere suplimentare:`,
    abroadHubTriggers: (country) => [
      `Înregistrarea consulară și pașaportul mortuar: Repatrierea internațională a corpului neînsuflețit sau a urnei și transcrierea decesului în străinătate presupun coordonarea între starea civilă din ${country} și consulatul competent.`,
      `Apostila de la Haga sau supralegalizarea și traducerea autorizată: Certificatele de deces, procurile și actele succesorale emise în ${country} necesită, de regulă, Apostila de la Haga (sau extras multilingv) și traducere legalizată pentru băncile și instanțele străine.`,
      `Succesiunea internațională și conflictul de legi: Când un moștenitor locuiește în străinătate sau patrimoniul este împărțit între mai multe țări, normele de drept internațional privat (precum Regulamentul UE nr. 650/2012) stabilesc notarul sau instanța competentă.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Ghiduri transfrontaliere dedicate care implică ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Gestionați demersuri între ${country} și o altă țară?`,
    abroadHubCtaButton: "Solicitați de la Ask Clarvia planul pentru cele două țări →",
    parentHubsHeading: "Ghiduri naționale principale pentru aceste două țări",
    relatedHeading: "Ghiduri și liste de verificare conexe",
    backToGuidance: "← Înapoi la toate ghidurile publicate",
  },
  uk: {
    breadcrumbGuidance: "Практичні посібники",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Міжнародний випадок: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Юрисдикція: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `Перевірено офіційних джерел: ${count} (${date})`,
    languageSwitchLabel: "Мова:",
    readInOtherLang: (langName) => `Читати мовою: ${langName} →`,
    topCtaTitle:
      "Потрібен покроковий план дій, адаптований до конкретного міста чи ситуації вашої родини?",
    topCtaSubtitle:
      "Безкоштовна неприбуткова служба Clarvia ASBL · Відповіді електронною поштою понад 100 мовами з посиланнями на офіційні джерела.",
    topCtaButton: "Запитати Clarvia (попередньо заповнено)",
    fiveStepHeading: "Офіційний стислий чек-лист у 5 кроків",
    fiveStepSublabel: "Публічний довідковий посібник",
    stepPrefix: "Крок",
    midCtaTitle:
      "Не впевнені, як ці 5 кроків застосовуються у вашому органі реєстрації актів цивільного стану, консульстві чи страховій компанії?",
    midCtaSubtitle:
      "Опишіть нижче, що вже було зроблено. Ask Clarvia підготує точні наступні кроки та контакти для вашої ситуації.",
    midCtaPrimary: "Отримати персоналізовані наступні кроки",
    contactsHeading: "Офіційні органи та перевірені контакти",
    phoneLabel: "Телефон",
    emailLabel: "Ел. пошта",
    sourcesHeading: "Офіційні джерела, перевірені Clarvia",
    ctaEyebrow: "Безкоштовна персоналізована допомога · Clarvia ASBL",
    ctaHeading: "Отримайте наступні кроки для вашої ситуації електронною поштою",
    ctaIntro:
      "Наведений вище офіційний огляд у 5 кроків охоплює загальні правила. Подальші дії залежать від обставин вашої справи. Натисніть будь-яку тему нижче, щоб підставити її у запитання, або опишіть вашу ситуацію безпосередньо:",
    ctaFocusLabel: "Що саме Ask Clarvia перевіряє для вашого випадку (натисніть для заповнення):",
    ctaSpecificPrefix: "Зокрема щодо:",
    trustHeading: "Як було підготовлено цю сторінку",
    trustBody: (date) =>
      `Ця сторінка базується на перевірених даних Clarvia. Остання перевірка: ${date}. Перевіряйте актуальні формулювання за посиланнями на офіційні джерела. Clarvia надає практичну інформацію та контакти компетентних установ, але не надає юридичних, податкових, медичних чи нотаріальних консультацій.`,
    abroadHubHeading: "Якщо померла особа або спадкоємець проживає за кордоном (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Наведені вище 5 кроків охоплюють внутрішні процедури (${country}). Якщо особа мала іноземне громадянство, постійно проживала в іншій державі або залишила спадкоємців, банківські рахунки чи нерухомість за кордоном, застосовуються додаткові транскордонні правила:`,
    abroadHubTriggers: (country) => [
      `Консульський облік та дозвіл на міжнародне перевезення: Для репатріації тіла чи урни з прахом через кордон та визнання факту смерті за кордоном необхідна взаємодія між органами реєстрації актів цивільного стану (${country}) та відповідним консульством.`,
      `Апостиль або консульська легалізація та засвідчений переклад: Свідоцтва про смерть, нотаріальні довіреності та спадкові документи, видані (${country}), зазвичай потребують апостиля (або легалізації) і офіційного перекладу для іноземних судів, реєстрів та банків.`,
      `Міжнародне спадкування та колізійні норми: Коли спадкоємець проживає за кордоном або майно розташоване в кількох державах, норми міжнародного приватного права визначають компетентний нотаріат або суд щодо кожного активу.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Спеціальні транскордонні посібники, пов’язані з країною (${country}):`,
    abroadHubCtaPrompt: (country) =>
      `Ваша ситуація пов’язана з країною (${country}) та іншою державою?`,
    abroadHubCtaButton: "Запитати в Ask Clarvia покроковий план для двох країн →",
    parentHubsHeading: "Національні базові посібники для цих двох країн",
    relatedHeading: "Пов’язані чек-листи та посібники",
    backToGuidance: "← Назад до всіх опублікованих посібників",
  },
  ar: {
    breadcrumbGuidance: "الأدلة الإرشادية",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `عابر للحدود: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `الاختصاص القانوني: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} مصادر رسمية موثقة (${date})`,
    languageSwitchLabel: "اللغة:",
    readInOtherLang: (langName) => `اقرأ باللغة ${langName} ←`,
    topCtaTitle:
      "هل تحتاج إلى خارطة طريق مفصلة خطوة بخطوة تناسب بلديتك أو وضع عائلتك الدقيق؟",
    topCtaSubtitle:
      "خدمة مجانية غير ربحية من Clarvia ASBL · ردود عبر البريد الإلكتروني بأكثر من 100 لغة مع مصادر رسمية.",
    topCtaButton: "اسأل Clarvia (مُعبأ مسبقاً)",
    fiveStepHeading: "القائمة المرجعية الرسمية الملخصة في 5 خطوات",
    fiveStepSublabel: "دليل مرجعي عام",
    stepPrefix: "الخطوة",
    midCtaTitle:
      "غير متأكد من كيفية تطبيق هذه الخطوات الخمس لدى مكتب الأحوال المدنية أو القنصلية أو شركة التأمين؟",
    midCtaSubtitle:
      "اشرح أدناه ما تم إنجازه حتى الآن. تقوم خدمة Ask Clarvia بتجميع الخطوات التالية الدقيقة وجهات الاتصال الرسمية لحالتك.",
    midCtaPrimary: "احصل على الخطوات التالية المخصصة لحالتك",
    contactsHeading: "الجهات الرسمية وجهات الاتصال المعتمدة",
    phoneLabel: "الهاتف",
    emailLabel: "البريد الإلكتروني",
    sourcesHeading: "المصادر الرسمية التي تحققت منها Clarvia",
    ctaEyebrow: "إرشاد شخصي مجاني · Clarvia ASBL",
    ctaHeading: "احصل عبر البريد الإلكتروني على الخطوات المتبقية المخصصة لوضعك الدقيق",
    ctaIntro:
      "يغطي الملخص الرسمي المكون من 5 خطوات أعلاه الإطار الوطني العام. وتعتمد الخطوات التالية على تفاصيل حالتك. انقر على أي موضوع أدناه لتعبئة سؤالك تلقائياً، أو اكتب وضعك مباشرة:",
    ctaFocusLabel: "ما تتحقق منه خدمة Ask Clarvia لحالتك المحددة (انقر للتعبئة):",
    ctaSpecificPrefix: "وتحديداً بخصوص:",
    trustHeading: "كيف أُعدّت هذه الصفحة",
    trustBody: (date) =>
      `تستند هذه الصفحة إلى بيانات Clarvia الموثقة. آخر مراجعة: ${date}. يُرجى الرجوع إلى المصادر الرسمية المرتبطة للتحقق من أحدث النصوص القانونية. تقدم Clarvia معلومات عملية وتوجيهاً إلى الجهات المختصة، ولا تقدم استشارات قانونية أو ضريبية أو طبية أو توثيقية.`,
    abroadHubHeading: "إذا كان المتوفى أو أحد الورثة مقيماً في الخارج (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `تغطي الخطوات الخمس أعلاه الإجراءات الداخلية في ${country}. وعندما يحمل الشخص جنسية أجنبية، أو يقيم عادةً خارج البلاد، أو يترك ورثة أو حسابات بنكية أو عقارات في دولة أخرى، تنطبق متطلبات إضافية عابرة للحدود:`,
    abroadHubTriggers: (country) => [
      `التسجيل القنصلي وتصاريح نقل الجثمان: يتطلب نقل الجثمان أو الرفات عبر الحدود الدولية أو فتح التركة في الخارج التنسيق بين مكتب الأحوال المدنية في ${country} والسفارة أو القنصلية المختصة.`,
      `تصديق الأبوستيل أو التصديق القنصلي والترجمة المعتمدة: تتطلب شهادات الوفاة والوكالات وحجج حصر الإرث الصادرة في ${country} عادةً ختم الأبوستيل (أو التصديق الدبلوماسي) وترجمة محلفة للاعتراف بها لدى المحاكم والبنوك الأجنبية.`,
      `الميراث الدولي وتنازع القوانين: عندما يقيم أحد الورثة في الخارج أو تتوزع الأصول بين ${country} ودولة أخرى، تحدد قواعد القانون الدولي الخاص المحكمة أو الجهة التوثيقية المختصة لكل أصل.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `أدلة الإجراءات العابرة للحدود المرتبطة بـ ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `هل تنسق إجراءات بين ${country} ودولة أخرى غير مدرجة أعلاه؟`,
    abroadHubCtaButton: "اطلب خارطة الطريق الثنائية الخاصة بك من Ask Clarvia ←",
    parentHubsHeading: "الأدلة الوطنية الرئيسية لهاتين الدولتين",
    relatedHeading: "أدلة وقوائم مرجعية ذات صلة",
    backToGuidance: "→ العودة إلى جميع الأدلة المنشورة",
  },
  ru: {
    breadcrumbGuidance: "Практические руководства",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Международный случай: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Юрисдикция: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `Проверено официальных источников: ${count} (${date})`,
    languageSwitchLabel: "Язык:",
    readInOtherLang: (langName) => `Читать на языке: ${langName} →`,
    topCtaTitle:
      "Нужен пошаговый план действий с учётом конкретного города или ситуации вашей семьи?",
    topCtaSubtitle:
      "Бесплатная некоммерческая служба Clarvia ASBL · Ответы по электронной почте более чем на 100 языках со ссылками на официальные источники.",
    topCtaButton: "Спросить Clarvia (предзаполнено)",
    fiveStepHeading: "Официальный краткий чек-лист в 5 шагов",
    fiveStepSublabel: "Публичное справочное руководство",
    stepPrefix: "Шаг",
    midCtaTitle:
      "Не уверены, как эти 5 шагов применяются в вашем отделе ЗАГС, консульстве или страховой компании?",
    midCtaSubtitle:
      "Опишите ниже, что уже сделано. Ask Clarvia подготовит точные следующие шаги и контакты ведомств для вашей ситуации.",
    midCtaPrimary: "Получить персональные следующие шаги",
    contactsHeading: "Официальные ведомства и проверенные контакты",
    phoneLabel: "Телефон",
    emailLabel: "Эл. почта",
    sourcesHeading: "Официальные источники, проверенные Clarvia",
    ctaEyebrow: "Бесплатная персональная помощь · Clarvia ASBL",
    ctaHeading: "Получите дальнейшие шаги для вашей ситуации по электронной почте",
    ctaIntro:
      "Приведённый выше обзор из 5 шагов охватывает общий порядок. Дальнейшие действия зависят от обстоятельств вашего дела. Нажмите на любую тему ниже, чтобы подставить её в вопрос, или опишите вашу ситуацию напрямую:",
    ctaFocusLabel: "Что именно Ask Clarvia проверяет для вашего случая (нажмите для заполнения):",
    ctaSpecificPrefix: "В частности по вопросу:",
    trustHeading: "Как была подготовлена эта страница",
    trustBody: (date) =>
      `Эта страница основана на проверенных данных Clarvia. Последняя проверка: ${date}. Сверяйте актуальные формулировки по ссылкам на официальные источники. Clarvia предоставляет практическую информацию и контакты компетентных органов, но не оказывает юридических, налоговых, медицинских или нотариальных консультаций.`,
    abroadHubHeading: "Если умерший или наследник проживает за рубежом (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Приведённые выше 5 шагов описывают внутренний порядок (${country}). Если у человека было иностранное гражданство, постоянное место жительства за границей или остались наследники, банковские счета либо недвижимость в другом государстве, применяются дополнительные трансграничные правила:`,
    abroadHubTriggers: (country) => [
      `Консульский учёт и разрешение на репатриацию: Для международной перевозки тела или урны с прахом и признания факта смерти за рубежом необходимо взаимодействие органов ЗАГС (${country}) и соответствующего консульства.`,
      `Апостиль или консульская легализация и нотариальный перевод: Свидетельства о смерти, доверенности и документы о наследстве, выданные в стране (${country}), как правило, требуют штампа «Апостиль» (или консульской легализации) и заверенного перевода для иностранных судов и банков.`,
      `Международное наследование и коллизионные нормы: Когда наследник проживает за рубежом или имущество находится в нескольких государствах, нормы международного частного права определяют компетентного нотариуса или суд по каждому активу.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Специальные трансграничные руководства (${country}):`,
    abroadHubCtaPrompt: (country) =>
      `Ваша ситуация связана со страной (${country}) и другим государством?`,
    abroadHubCtaButton: "Запросить у Ask Clarvia маршрут для двух стран →",
    parentHubsHeading: "Национальные базовые руководства для этих двух стран",
    relatedHeading: "Связанные чек-листы и руководства",
    backToGuidance: "← Назад ко всем опубликованным руководствам",
  },
  lu: {
    breadcrumbGuidance: "Orientéierungshëllefen",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Grenzüberschreidend: ${c1} (${code1}) ↔ ${c2} (${code2})`,
    jurisdictionBadge: (c1, code1) => `Juridictioun: ${c1} (${code1})`,
    sourcesVerifiedBadge: (count, date) => `${count} offiziell Quelle gepréift (${date})`,
    languageSwitchLabel: "Sprooch:",
    readInOtherLang: (langName) => `Op ${langName} liesen →`,
    topCtaTitle:
      "Braucht Dir e Schrëtt-fir-Schrëtt-Plang, deen op Är Gemeng oder Är genee Familljesituatioun ugepasst ass?",
    topCtaSubtitle:
      "Gratis Service ouni Gewënnzweck vu Clarvia ASBL · Äntwerten per E-Mail an iwwer 100 Sprooche mat offizielle Quellen.",
    topCtaButton: "Clarvia froen (virausgefëllt)",
    fiveStepHeading: "Offiziell 5-Schrëtt-Checklëscht",
    fiveStepSublabel: "Ëffentleche Referenzguide",
    stepPrefix: "Schrëtt",
    midCtaTitle:
      "Onsécher, wéi dës 5 Schrëtt fir Är Gemeng, Äert Konsulat oder Är Versécherung gëllen?",
    midCtaSubtitle:
      "Beschreift hei ënnen kuerz Är Situatioun. Ask Clarvia stellt déi genee nächst Schrëtt a Kontakter fir Äre Fall zesummen.",
    midCtaPrimary: "Perséinlech nächst Schrëtt kréien",
    contactsHeading: "Offiziell Autoritéiten & gepréift Kontaktstellen",
    phoneLabel: "Telefon",
    emailLabel: "E-Mail",
    sourcesHeading: "Vu Clarvia gepréift offiziell Quellen",
    ctaEyebrow: "Gratis perséinlech Orientéierung · Clarvia ASBL",
    ctaHeading: "Kritt déi weider Schrëtt passend zu Ärer Situatioun per E-Mail",
    ctaIntro:
      "D'Iwwersiicht a 5 Schrëtt hei uewen deckt den nationale Kader of. Déi weider Schrëtt hänke vun Ärem konkrete Fall of. Klickt op en Thema fir Är Fro virauszefëllen oder beschreift Är Situatioun direkt:",
    ctaFocusLabel: "Wat Ask Clarvia fir Äre konkrete Fall préift (klickt fir virauszefëllen):",
    ctaSpecificPrefix: "Besonnesch betreffend:",
    trustHeading: "Wéi dës Säit erstallt gouf",
    trustBody: (date) =>
      `Dës Säit baséiert op gepréiften Date vu Clarvia. Lescht Iwwerpréiwung: ${date}. Kuckt déi verlinkt offiziell Quelle fir déi aktuellst Texter. Clarvia bitt praktesch Informatioun an Orientéierung, awer keng juristesch, steierlech, medezinesch oder notariell Berodung.`,
    abroadHubHeading: "Wann déi verstuerwe Persoun oder en Ierwen am Ausland wunnt (If the Deceased or an Heir Lives Abroad)",
    abroadHubIntro: (country) =>
      `Déi 5 Schrëtt hei uewen decken d'national Prozeduren zu ${country} of. Wann eng auslännesch Nationalitéit virlouch, de gewéinleche Wunnsëtz am Ausland war oder Ierwen, Bankkonten oder Immobilien an engem anere Land betraff sinn, gëllen zousätzlech grenzüberschreidend Reegelen:`,
    abroadHubTriggers: (country) => [
      `Konsularesch Meldung & Laissez-passer mortuaire: Fir eng international Iwwerféierung oder d'Noloossregelung am Ausland muss nieft dem État civil zu ${country} och dat zoustännegt Konsulat kontaktéiert ginn.`,
      `Apostille oder Legalisatioun & vereedegt Iwwersetzung: Akten, Vollmaachten an Ierfschaftsdokumenter aus ${country} brauchen am Ausland dacks eng Haager Apostille (oder e méisproochege Formulaire C) an eng zertifiéiert Iwwersetzung.`,
      `Internationalt Ierfrecht & Zoustännegkeet: Wann Ierwen am Ausland wunnen oder Verméigen a méi Länner läit, bestëmmen d'EU-Ierfrechtsveruerdnung Nr. 650/2012 an d'internationalt Privatrecht, wéi een Notaire oder Geriicht zoustänneg ass.`,
    ],
    abroadHubCorridorsLabel: (country) =>
      `Grenzüberschreidend Checklëschte mat Bezug op ${country}:`,
    abroadHubCtaPrompt: (country) =>
      `Betrëfft Är Situatioun ${country} an en anert Land?`,
    abroadHubCtaButton: "Perséinlechen Zwee-Länner-Plang bei Ask Clarvia ufroen →",
    parentHubsHeading: "National Haaptchecklëschte fir dës zwee Länner",
    relatedHeading: "Verwandte Checklëschten & Guiden",
    backToGuidance: "← Zréck bei all publizéiert Orientéierungshëllefen",
  },
};

export function getGuideUiCopy(lang: string): GuideUiCopy {
  return GUIDE_UI_COPY[(lang as GuideLocale) in GUIDE_UI_COPY ? (lang as GuideLocale) : "en"];
}
