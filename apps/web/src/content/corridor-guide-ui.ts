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
  | "uk";

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
  relatedHeading: string;
  backToGuidance: string;
};

export const GUIDE_UI_COPY: Record<GuideLocale, GuideUiCopy> = {
  en: {
    breadcrumbGuidance: "Guidance",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Cross-Border Corridor: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Related Corridor & Situation Checklists",
    backToGuidance: "← Back to all published guidance",
  },
  de: {
    breadcrumbGuidance: "Orientierungshilfen",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Grenzüberschreitender Korridor: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Verwandte Länder- & Situations-Checklisten",
    backToGuidance: "← Zurück zu allen veröffentlichten Orientierungshilfen",
  },
  es: {
    breadcrumbGuidance: "Guías prácticas",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Corredor transfronterizo: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Guías y listas de control relacionadas",
    backToGuidance: "← Volver a todas las guías publicadas",
  },
  fr: {
    breadcrumbGuidance: "Guides pratiques",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Corridor transfrontalier : ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Guides et listes de contrôle connexes",
    backToGuidance: "← Retour à tous les guides publiés",
  },
  pt: {
    breadcrumbGuidance: "Guias práticos",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Corredor transfronteiriço: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Guias e listas de verificação relacionados",
    backToGuidance: "← Voltar a todos os guias publicados",
  },
  it: {
    breadcrumbGuidance: "Guide pratiche",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Corridoio transfrontaliero: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Guide e checklist correlate",
    backToGuidance: "← Torna a tutte le guide pubblicate",
  },
  nl: {
    breadcrumbGuidance: "Praktische gidsen",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Grensoverschrijdende corridor: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Gerelateerde landen- & situatiechecklists",
    backToGuidance: "← Terug naar alle gepubliceerde gidsen",
  },
  tr: {
    breadcrumbGuidance: "Rehberler",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Ülkeler Arası Koridor: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "İlgili Ülke ve Durum Rehberleri",
    backToGuidance: "← Yayınlanan tüm rehberlere dön",
  },
  pl: {
    breadcrumbGuidance: "Poradniki",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Korytarz transgraniczny: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Powiązane listy kontrolne i poradniki",
    backToGuidance: "← Powrót do wszystkich opublikowanych poradników",
  },
  ro: {
    breadcrumbGuidance: "Ghiduri practice",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Coridor transfrontalier: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Ghiduri și liste de verificare conexe",
    backToGuidance: "← Înapoi la toate ghidurile publicate",
  },
  uk: {
    breadcrumbGuidance: "Практичні посібники",
    crossBorderBadge: (c1, code1, c2, code2) =>
      `Транскордонний коридор: ${c1} (${code1}) ↔ ${c2} (${code2})`,
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
    relatedHeading: "Пов’язані чек-листи та посібники",
    backToGuidance: "← Назад до всіх опублікованих посібників",
  },
};

export function getGuideUiCopy(lang: string): GuideUiCopy {
  return GUIDE_UI_COPY[(lang as GuideLocale) in GUIDE_UI_COPY ? (lang as GuideLocale) : "en"];
}
