/* ─── Shared constants for the grant-ready landing page ─── */

export const headlineStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  color: "#1e2a4f",
  letterSpacing: "-0.02em",
  fontWeight: 700,
};

/* ── Luxembourg Stats ── */
export const LU_STATS = [
  {
    num: "40,000+",
    en_label: "people closely affected each year in Luxembourg",
    en_detail: "Based on 4,471 deaths in Luxembourg in 2024 and research estimating around 9 close people closely affected per death.",
    sources: [
      { label: "STATEC", url: "https://statistiques.public.lu/en/actualites/2025/stn16-population-2025.html" },
      { label: "USC Today", url: "https://today.usc.edu/for-every-covid-death-nine-close-family-members-are-left-to-grieve/" },
    ],
    fr_label: "personnes étroitement touchées chaque année au Luxembourg",
    fr_detail: "Estimation basée sur les 4 471 décès enregistrés au Luxembourg en 2024 et sur des recherches estimant qu'environ 9 proches sont directement touchés par chaque décès.",
    de_label: "Menschen im engen Umfeld sind jedes Jahr in Luxemburg betroffen",
    de_detail: "Basierend auf 4.471 Todesfällen in Luxemburg im Jahr 2024 und Studien, die von rund neun eng betroffenen Personen pro Todesfall ausgehen.",
  },
  {
    num: "47%",
    en_label: "of residents are foreign nationals",
    en_detail: "Nearly half of Luxembourg's residents have another nationality, making grief support naturally multilingual and cross-cultural.",
    sources: [
      { label: "CEFIS/STATEC", url: "https://cefis.lu/wp-content/uploads/2026/03/2025_tableau-population_EN.pdf" },
    ],
    fr_label: "des résidents sont de nationalité étrangère",
    fr_detail: "Près de la moitié des résidents du Luxembourg ont une autre nationalité, ce qui rend le soutien au deuil naturellement multilingue et interculturel.",
    de_label: "der Einwohner sind ausländische Staatsangehörige",
    de_detail: "Fast die Hälfte der Einwohner Luxemburgs hat eine andere Staatsangehörigkeit, was Trauerbegleitung natürlicherweise mehrsprachig und interkulturell macht.",
  },
  {
    num: "24h",
    en_label: "to declare a death",
    en_detail: "Some first formalities must be handled very quickly, often while families are still in shock.",
    sources: [
      { label: "Guichet.lu", url: "https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html" },
    ],
    fr_label: "pour déclarer un décès",
    fr_detail: "Certaines premières formalités doivent être accomplies très rapidement, souvent alors que les familles sont encore sous le choc.",
    de_label: "um einen Todesfall zu melden",
    de_detail: "Einige erste Formalitäten müssen sehr schnell erledigt werden, oft während die Familien noch unter Schock stehen.",
  },
];

/* ── Checklist topics ── */
export const CHECKLIST_TOPICS = [
  { en: "first administrative steps after a loss", fr: "les premières démarches administratives après un décès", de: "erste administrative Schritte nach einem Todesfall" },
  { en: "documents to collect and keep", fr: "documents à rassembler et à conserver", de: "Dokumente, die gesammelt und aufbewahrt werden müssen" },
  { en: "institutions and organisations to notify", fr: "institutions et organismes à informer", de: "Institutionen und Organisationen, die benachrichtigt werden müssen" },
  { en: "funeral-related administration", fr: "démarches liées aux funérailles", de: "Verwaltungsschritte rund um die Bestattung" },
  { en: "employer, pension, insurance, banking, and housing-related steps", fr: "démarches liées à l'employeur, à la pension, aux assurances, à la banque et au logement", de: "Schritte in Bezug auf Arbeitgeber, Rente, Versicherung, Bank und Wohnung" },
  { en: "succession-related orientation", fr: "orientation en matière de succession", de: "Orientierung in Erbschaftsfragen" },
  { en: "cross-border considerations where relevant", fr: "aspects transfrontaliers le cas échéant", de: "grenzüberschreitende Aspekte, soweit relevant" },
  { en: "reminders for time-sensitive tasks", fr: "rappels pour les démarches à délai", de: "Erinnerungen an fristgebundene Aufgaben" },
  { en: "links to official sources and qualified professionals", fr: "liens vers les sources officielles et les professionnels qualifiés", de: "Links zu offiziellen Quellen und qualifizierten Fachleuten" },
];

/* ── Feature cards ── */
export const FEATURES = [
  {
    icon: "📋",
    en_title: "Personalised", fr_title: "Personnalisé", de_title: "Personalisiert",
    en: "Steps relevant to the family's situation", fr: "Étapes adaptées à la situation de la famille", de: "Auf die Situation der Familie zugeschnittene Schritte",
  },
  {
    icon: "⏰",
    en_title: "Time-sensitive", fr_title: "Délais intégrés", de_title: "Fristen im Blick",
    en: "Helps to identify urgent steps", fr: "Aide à identifier les démarches urgentes", de: "Hilft, dringende Schritte zu erkennen",
  },
  {
    icon: "🌍",
    en_title: "Trilingual", fr_title: "Trilingue", de_title: "Dreisprachig",
    en: "English, French, and German", fr: "Anglais, français et allemand", de: "Englisch, Französisch und Deutsch",
  },
];

/* ── Heritage folder items ── */
export const HERITAGE_ITEMS = [
  { en: "key documents and contacts", fr: "documents et contacts importants", de: "wichtige Dokumente und Kontakte" },
  { en: "important life details", fr: "informations importantes sur la vie de la personne", de: "wichtige Lebensdaten" },
  { en: "funeral or memorial wishes, where known", fr: "souhaits funéraires ou commémoratifs, s'ils sont connus", de: "Bestattungs- oder Gedenkwünsche, soweit bekannt" },
  { en: "memories, stories, photos, and messages", fr: "souvenirs, récits, photos et messages", de: "Erinnerungen, Geschichten, Fotos und Nachrichten" },
  { en: "practical information relatives may need", fr: "informations pratiques dont les proches peuvent avoir besoin", de: "praktische Informationen, die Angehörige benötigen könnten" },
  { en: "information that should not be lost during a difficult time", fr: "informations qui ne devraient pas se perdre dans un moment difficile", de: "Informationen, die in einer schwierigen Zeit nicht verloren gehen sollten" },
];

/* ── Equal access audiences ── */
export const AUDIENCES = [
  { en: "Luxembourg residents and international families", fr: "résidents luxembourgeois et familles internationales", de: "Luxemburger Einwohner und internationale Familien" },
  { en: "families who speak different languages", fr: "familles parlant différentes langues", de: "Familien, die verschiedene Sprachen sprechen" },
  { en: "people with limited financial means", fr: "personnes disposant de moyens financiers limités", de: "Menschen mit begrenzten finanziellen Mitteln" },
  { en: "people without a strong support network", fr: "personnes sans réseau de soutien solide", de: "Menschen ohne starkes Unterstützungsnetzwerk" },
  { en: "cross-border families managing responsibilities from abroad", fr: "familles transfrontalières gérant des obligations depuis l'étranger", de: "Grenzgänger-Familien, die Pflichten aus dem Ausland wahrnehmen" },
  { en: "people unfamiliar with Luxembourg's administrative system", fr: "personnes peu familières avec le système administratif luxembourgeois", de: "Menschen, die mit dem luxemburgischen Verwaltungssystem nicht vertraut sind" },
];

/* ── Testimonials ── */
export const TESTIMONIALS = [
  {
    flag: "lu",
    en: "When my mother passed away unexpectedly, it felt like falling into a black box. My first instinct was to shut out the world and cry, but almost immediately I was told there were things that had to be done within 24 hours. That felt inhumane. Clear guidance for something that eventually touches every family would be deeply welcome.",
    fr: "Lorsque ma mère est décédée de manière inattendue, j'ai eu l'impression de tomber dans une boîte noire. Mon premier réflexe a été de me couper du monde et de pleurer, mais presque immédiatement, on m'a dit qu'il y avait des choses à faire dans les 24 heures. Cela m'a semblé inhumain. Des indications claires pour une situation qui finit par toucher chaque famille seraient vraiment précieuses.",
    de: "Als meine Mutter unerwartet starb, fühlte es sich an, als würde ich in eine Black Box fallen. Mein erster Impuls war, die Welt auszublenden und einfach zu weinen. Doch fast sofort hieß es, es gebe Dinge, die innerhalb von 24 Stunden erledigt werden müssten. Das empfand ich als unmenschlich. Eine klare Orientierung für eine Situation, die früher oder später jede Familie berührt, wäre unglaublich wertvoll.",
    attribution: { en: "Tom, Luxembourg", fr: "Tom, Luxembourg", de: "Tom, Luxemburg" },
  },

  {
    flag: "gb",
    en: "Our daughter died in a fatal accident while living in Luxembourg. She was not a Luxembourg national, and there was no will. We suddenly had to deal with Luxembourg's administrative system without speaking any of its official languages. No parent should ever have to go through the loss of a child, but there has to be a better way than adding immediate administrative burden on top of grief.",
    fr: "Notre fille est décédée dans un accident mortel alors qu'elle vivait au Luxembourg. Elle n'était pas luxembourgeoise et n'avait pas rédigé de testament. Nous avons soudainement dû faire face au système administratif luxembourgeois sans parler aucune de ses langues officielles. Aucun parent ne devrait avoir à vivre la perte d'un enfant, mais il doit exister une meilleure manière de faire que d'ajouter immédiatement une charge administrative au chagrin.",
    de: "Unsere Tochter kam bei einem tödlichen Unfall ums Leben, während sie in Luxemburg lebte. Sie war keine Luxemburger Staatsangehörige, und es gab kein Testament. Plötzlich mussten wir uns mit dem luxemburgischen Verwaltungssystem auseinandersetzen, ohne eine der Amtssprachen zu sprechen. Kein Elternteil sollte jemals den Verlust eines Kindes erleben müssen. Aber es muss einen besseren Weg geben, als zur Trauer sofort auch noch administrative Belastungen hinzuzufügen.",
    attribution: { en: "Bereaved parents, United Kingdom", fr: "Parents endeuillés, Royaume-Uni", de: "Trauernde Eltern, Vereinigtes Königreich" },
  },
  {
    flag: "ua",
    en: "When someone dies while your family is split between countries, grief becomes mixed with documents, translations, distance, and uncertainty. You do not always know which country's rules matter, who to contact, or what papers are needed. In that moment, a free and multilingual guide would not remove the grief, but it would remove some of the fear and confusion.",
    fr: "Lorsqu'un décès survient alors que la famille est répartie entre plusieurs pays, le deuil se mêle aux documents, aux traductions, à la distance et à l'incertitude. On ne sait pas toujours quelles règles nationales s'appliquent, qui contacter ni quels papiers fournir. Dans un tel moment, un guide gratuit et multilingue ne ferait pas disparaître la douleur, mais il enlèverait une partie de la peur et de la confusion.",
    de: "Wenn jemand stirbt und die Familie über mehrere Länder verteilt ist, vermischen sich Trauer, Dokumente, Übersetzungen, Entfernung und Unsicherheit. Man weiß nicht immer, welche Regeln welches Landes zählen, wen man kontaktieren muss oder welche Unterlagen gebraucht werden. In diesem Moment würde ein kostenloser, mehrsprachiger Leitfaden die Trauer nicht nehmen - aber er könnte einen Teil der Angst und Verwirrung nehmen.",
    attribution: { en: "Ukrainian temporary protection beneficiary, Luxembourg", fr: "Bénéficiaire de la protection temporaire ukrainienne, Luxembourg", de: "Ukrainische Person mit vorübergehendem Schutz, Luxemburg" },
  },
];

/* ── Founding stories (kept exactly from v2 — professionally translated) ── */
export const FOUNDING_STORIES = [
  {
    name: "Günther Schriver",
    title: { en: "Co-Founder & Director", fr: "Cofondateur et administrateur", de: "Mitgründer und Vorstandsmitglied" },
    photo: "/gunther.jfif",
    quote1: {
      en: "Throughout my decades leading social services and senior care, I've seen firsthand how vulnerable families are during a crisis. When you add the complexities of cross-border administration and language barriers, that burden becomes paralyzing.",
      fr: "Au cours de mes décennies à la tête de services sociaux et de structures d'accompagnement des personnes âgées, j'ai vu de près à quel point les familles sont vulnérables en période de crise. Lorsque s'ajoutent la complexité de l'administration transfrontalière et les barrières linguistiques, cette charge peut devenir paralysante.",
      de: "In meinen Jahrzehnten in leitenden Funktionen in Sozialdiensten und in der Seniorenbetreuung habe ich aus nächster Nähe erlebt, wie verletzlich Familien in Krisenzeiten sind. Wenn dann noch grenzüberschreitende Verwaltung und Sprachbarrieren hinzukommen, wird diese Belastung schnell lähmend.",
    },
    quote2: {
      en: "I founded Clarvia because access to clear, structured support during life's hardest moments shouldn't be a privilege. It must be a given.",
      fr: "J'ai fondé Clarvia parce que l'accès à un accompagnement clair et structuré dans les moments les plus difficiles de la vie ne devrait pas être un privilège. Il devrait aller de soi.",
      de: "Ich habe Clarvia gegründet, weil der Zugang zu klarer, strukturierter Unterstützung in den schwersten Momenten des Lebens kein Privileg sein darf. Er sollte selbstverständlich sein.",
    },
  },
  {
    name: "Tommi Lindfors",
    title: { en: "Co-Founder & Director", fr: "Cofondateur et administrateur", de: "Mitgründer und Vorstandsmitglied" },
    photo: "/tommi.jfif",
    quote1: {
      en: "When my mother passed away, my sisters and I were overwhelmed. Even in a straightforward case in our home country, the administrative guides were a maze. In Europe - where families are spread across the globe, speak different languages, and interact with unfamiliar institutions - this burden is amplified beyond reason.",
      fr: "Lorsque ma mère est décédée, mes sœurs et moi avons été dépassés. Même dans un cas simple, dans notre pays d'origine, les guides administratifs formaient un labyrinthe. En Europe – où les familles vivent parfois dans plusieurs pays, parlent différentes langues et doivent traiter avec des institutions inconnues – cette charge devient déraisonnable.",
      de: "Als meine Mutter starb, waren meine Schwestern und ich überfordert. Selbst in einem einfachen Fall in unserem Heimatland waren die Verwaltungsleitfäden ein Labyrinth. In Europa – wo Familien über Ländergrenzen hinweg leben, unterschiedliche Sprachen sprechen und mit unbekannten Institutionen zu tun haben – wird diese Belastung unverhältnismäßig groß.",
    },
    quote2: {
      en: "I founded Clarvia to ensure no family has to navigate the bureaucracy of grief alone.",
      fr: "J'ai fondé Clarvia pour qu'aucune famille n'ait à affronter seule la bureaucratie qui suit un décès.",
      de: "Ich habe Clarvia gegründet, damit keine Familie die Bürokratie nach einem Verlust allein bewältigen muss.",
    },
  },
];

/* ── Founder bios (kept exactly from v2 — professionally translated) ── */
export const FOUNDERS = [
  {
    name: "Günther Schriver",
    title: { en: "Co-Founder & Director", fr: "Cofondateur & administrateur", de: "Mitgründer & Vorstandsmitglied" },
    photo: "/gunther.jfif",
    bio: {
      en: "Former Director of the Berlin Red Cross, where he led Social Services overseeing 550+ employees across refugee aid, senior care, and crisis management. Former CEO of Anderson Holding AG, one of Germany's largest senior care groups, where he led an organisation of 3,500 employees. Brings over 25 years of experience in healthcare operations, social services, and cross-border care delivery.",
      fr: "Ancien directeur de la Croix-Rouge de Berlin, où il a dirigé les services sociaux et supervisé plus de 550 salariés dans l'aide aux réfugiés, l'accompagnement des personnes âgées et la gestion de crise. Ancien CEO d'Anderson Holding AG, l'un des plus grands groupes allemands de prise en charge des personnes âgées, où il a dirigé une organisation de 3 500 salariés. Il apporte plus de 25 ans d'expérience dans la gestion d'organisations de santé, les services sociaux et l'accompagnement transfrontalier.",
      de: "Ehemaliger Direktor des Berliner Roten Kreuzes, wo er die Sozialdienste leitete und mehr als 550 Mitarbeitende in Flüchtlingshilfe, Seniorenbetreuung und Krisenmanagement verantwortete. Ehemaliger CEO der Anderson Holding AG, einer der größten Senior-Care-Gruppen Deutschlands, wo er eine Organisation mit 3.500 Mitarbeitenden führte. Er bringt mehr als 25 Jahre Erfahrung in Gesundheitsorganisationen, sozialen Diensten und grenzüberschreitender Versorgung ein.",
    },
  },
  {
    name: "Tommi Lindfors",
    title: { en: "Co-Founder & Director", fr: "Cofondateur & administrateur", de: "Mitgründer & Vorstandsmitglied" },
    photo: "/tommi.jfif",
    bio: {
      en: "Led a FinTech50 company, held board positions across 6 countries, and built international teams driving growth from startup to scale. Currently Founder & CEO of Bifin Sàrl, applying AI and automation to financial services. Now based in Luxembourg, channelling decades of operational, technology, and AI experience into Clarvia.",
      fr: "A dirigé une entreprise du classement FinTech50, occupé des mandats d'administrateur dans six pays et constitué des équipes internationales capables d'accompagner la croissance, de la start-up au passage à l'échelle. Actuellement fondateur et CEO de Bifin Sàrl, il applique l'IA et l'automatisation aux services financiers. Installé aujourd'hui au Luxembourg, il met des décennies d'expérience opérationnelle, technologique et en IA au service de Clarvia.",
      de: "Leitete ein FinTech50-Unternehmen, hatte Vorstandsmandate in sechs Ländern und baute internationale Teams auf, die Wachstum vom Start-up bis zur Skalierung ermöglichten. Derzeit Gründer und CEO von Bifin Sàrl, wo er KI und Automatisierung im Finanzdienstleistungsbereich einsetzt. Heute in Luxemburg ansässig, bringt er Jahrzehnte an operativer, technologischer und KI-Erfahrung in Clarvia ein.",
    },
  },
];

/* ── Preparation milestones ── */
export const PREPARATION_DONE = [
  { en: "mapping the bereavement journey after a loss", fr: "cartographie du parcours des familles après un décès", de: "Erfassung der Wege, Schritte und Hürden nach einem Todesfall" },
  { en: "identifying common points of confusion for families", fr: "identification des points de confusion fréquents pour les familles", de: "Identifizierung häufiger Verwirrungspunkte für Familien" },
  { en: "defining the structure of a personalised checklist", fr: "définition de la structure d'une liste de démarches personnalisée", de: "Definition der Struktur einer personalisierten Checkliste" },
  { en: "designing the heritage folder concept", fr: "conception du dossier patrimonial", de: "Gestaltung des Konzepts für den Erinnerungsordner" },
  { en: "exploring the technical approach", fr: "exploration de l'approche technique", de: "Erkundung des technischen Ansatzes" },
  { en: "preparing the governance and safeguarding approach", fr: "préparation de l'approche en matière de gouvernance et de protection", de: "Vorbereitung des Governance- und Schutzkonzepts" },
  { en: "assessing what is needed to build and validate the service responsibly", fr: "évaluation des besoins pour construire et valider le service de manière responsable", de: "Bewertung der Anforderungen für einen verantwortungsvollen Aufbau und Validierung des Dienstes" },
];

/* ── Next phase goals ── */
export const NEXT_PHASE = [
  { en: "complete the Luxembourg checklist structure", fr: "finaliser la structure de la liste de démarches luxembourgeoise", de: "die Struktur der luxemburgischen Checkliste fertigstellen" },
  { en: "validate the content with appropriate professionals and official sources", fr: "valider le contenu avec les professionnels et les sources officielles appropriés", de: "den Inhalt mit geeigneten Fachleuten und offiziellen Quellen validieren" },
  { en: "build the first digital version of the checklist", fr: "développer la première version numérique de la liste de démarches", de: "die erste digitale Version der Checkliste entwickeln" },
  { en: "design the heritage folder in a privacy-conscious way", fr: "concevoir le dossier patrimonial dans le respect de la vie privée", de: "den Erinnerungsordner datenschutzkonform gestalten" },
  { en: "prepare multilingual content", fr: "préparer le contenu multilingue", de: "mehrsprachige Inhalte vorbereiten" },
  { en: "test the service with users and community partners", fr: "tester le service avec des utilisateurs et des partenaires communautaires", de: "den Dienst mit Nutzern und Partnern testen" },
  { en: "improve accessibility and plain-language guidance", fr: "améliorer l'accessibilité et la rédaction en langage clair", de: "Barrierefreiheit und Verständlichkeit verbessern" },
  { en: "prepare for a controlled public launch in Luxembourg", fr: "préparer un lancement public contrôlé au Luxembourg", de: "einen kontrollierten öffentlichen Start in Luxemburg vorbereiten" },
];

/* ── Principles ── */
export const PRINCIPLES = [
  { icon: "⚖️", en_title: "Equal access", fr_title: "Accès égal", de_title: "Gleicher Zugang", en: "Bereavement guidance should be available regardless of background, status, language, income, or personal network.", fr: "L'accompagnement en cas de décès devrait être accessible indépendamment de l'origine, du statut, de la langue, des revenus ou du réseau personnel.", de: "Trauerbegleitung sollte unabhängig von Herkunft, Status, Sprache, Einkommen oder persönlichem Netzwerk zugänglich sein." },
  { icon: "💡", en_title: "Clarity", fr_title: "Clarté", de_title: "Klarheit", en: "Families need practical steps, not another maze of information.", fr: "Les familles ont besoin d'étapes pratiques, pas d'un nouveau labyrinthe d'informations.", de: "Familien brauchen praktische Schritte, nicht ein weiteres Labyrinth an Informationen." },
  { icon: "🤍", en_title: "Dignity", fr_title: "Dignité", de_title: "Würde", en: "The person who has passed away should not disappear behind paperwork.", fr: "La personne décédée ne doit pas disparaître derrière les démarches administratives.", de: "Der verstorbene Mensch soll nicht hinter Formularen und Papierkram verschwinden." },
  { icon: "🛡️", en_title: "Safety", fr_title: "Sécurité", de_title: "Sicherheit", en: "Clarvia must be clear about its limits and guide families toward qualified professionals when needed.", fr: "Clarvia doit être clair sur ses limites et orienter les familles vers des professionnels qualifiés lorsque nécessaire.", de: "Clarvia muss seine Grenzen klar benennen und Familien bei Bedarf an qualifizierte Fachleute verweisen." },
  { icon: "🔒", en_title: "Privacy", fr_title: "Vie privée", de_title: "Datenschutz", en: "Bereavement information is sensitive. The service must collect as little as possible and protect what families choose to share.", fr: "Les informations liées au deuil sont sensibles. Le service doit collecter le minimum nécessaire et protéger ce que les familles choisissent de partager.", de: "Informationen im Trauerfall sind sensibel. Der Dienst muss so wenig wie möglich erheben und schützen, was Familien teilen." },
  { icon: "🌍", en_title: "Multilingual", fr_title: "Multilingue", de_title: "Mehrsprachig", en: "Designed from the start in English, French, and German to reflect Luxembourg's multilingual reality.", fr: "Conçu dès le départ en anglais, français et allemand pour refléter la réalité multilingue du Luxembourg.", de: "Von Anfang an in Englisch, Französisch und Deutsch konzipiert, um der mehrsprachigen Realität Luxemburgs gerecht zu werden." },
];

/* ── Supporter ── */
export const SUPPORTER = {
  name: "TSC Real Estate",
  logo: "/tsc-logo.jpg",
  url: "https://www.tsc-realestate.de/en/",
  description: {
    en: "One of Germany's leading healthcare real estate managers, experienced in the residential care sector, with branches in Luxembourg, Italy, and Spain.",
    fr: "L'un des principaux gestionnaires allemands d'actifs immobiliers dans le secteur de la santé, avec une solide expérience dans les établissements de soins résidentiels et des implantations au Luxembourg, en Italie et en Espagne.",
    de: "Einer der führenden deutschen Manager von Gesundheitsimmobilien, erfahren im Bereich stationärer Pflege, mit Niederlassungen in Luxemburg, Italien und Spanien.",
  },
  quote: {
    en: "We believe that Clarvia's mission - making essential post-bereavement information accessible, structured and free - is clearly in the public interest.",
    fr: "Nous considérons que la mission de Clarvia - rendre les informations essentielles après un décès accessibles, structurées et gratuites - relève clairement de l'intérêt public.",
    de: "Wir sind überzeugt, dass Clarvias Ziel, wichtige Informationen nach einem Todesfall zugänglich, strukturiert und kostenlos bereitzustellen, klar im öffentlichen Interesse liegt.",
  },
};
