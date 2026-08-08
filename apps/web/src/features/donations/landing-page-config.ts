import { type Lang, l } from "@/lib/i18n";

export type LocalisedText = {
  en: string;
  fr: string;
  de: string;
  lu?: string;
};

export type ImpactPoint = {
  icon: string;
  text: LocalisedText;
};

export interface DonationTier {
  amount: number;
  label: string | LocalisedText;
  default?: boolean;
}

export type DonationLandingVariant = {
  id: string;
  headline: LocalisedText;
  summary: LocalisedText;
  impactPoints: ImpactPoint[];
  defaultFrequency: "onetime" | "monthly";
  defaultAmount: number;
  showImage: boolean;
  showBankTransfer: boolean;
  customTiers?: {
    monthly: DonationTier[];
    onetime: DonationTier[];
  };
  // Optional layout flags for modular sections
  showTestimonials?: boolean;
  showCorporateSponsors?: boolean;
  showGitHubSponsors?: boolean;
  showProgressBar?: boolean;
  showFullNavigation?: boolean;
};

export function getMonthlyTiers(lang: Lang): DonationTier[] {
  return [
    {
      amount: 10,
      label: l(
        lang,
        "Keep the service free",
        "Aider à garder le service gratuit",
        "Helfen, den Dienst kostenlos zu halten",
        "De Service gratis halen"
      ),
    },
    {
      amount: 25,
      label: l(
        lang,
        "Support multilingual maintenance",
        "Soutenir la maintenance multilingue",
        "Mehrsprachige Pflege unterstützen",
        "Déi méisproocheg Fleeg ënnerstëtzen"
      ),
      default: true,
    },
    {
      amount: 50,
      label: l(
        lang,
        "Fund source-backed updates",
        "Financer les mises à jour fondées sur des sources officielles",
        "Quellenbasierte Aktualisierungen finanzieren",
        "Aktualiséierungen op Basis vun offiziellen Quelle finanzéieren"
      ),
    },
    {
      amount: 100,
      label: l(
        lang,
        "Founding Circle supporter",
        "Membre du Cercle fondateur",
        "Unterstützer im Gründerkreis",
        "Ënnerstëtzer am Grënnerkrees"
      ),
    },
  ];
}

export function getOnetimeTiers(lang: Lang): DonationTier[] {
  return [
    {
      amount: 35,
      label: l(
        lang,
        "Help maintain official-source references",
        "Aider à maintenir les références aux sources officielles",
        "Bei der Pflege offizieller Quellenverweise helfen",
        "Hëllefen, Referenzen op offiziell Quellen aktuell ze halen"
      ),
    },
    {
      amount: 75,
      label: l(
        lang,
        "Support workflow validation",
        "Soutenir la validation des parcours",
        "Die Validierung der Abläufe unterstützen",
        "D'Validéierung vun den Ofleef ënnerstëtzen"
      ),
    },
    {
      amount: 150,
      label: l(
        lang,
        "Fund translation and accessibility work",
        "Financer le travail de traduction et d'accessibilité",
        "Übersetzungs- und Barrierefreiheitsarbeit finanzieren",
        "Iwwersetzungs- an Accessibilitéitsaarbecht finanzéieren"
      ),
    },
    {
      amount: 500,
      label: l(
        lang,
        "Support a public-service module",
        "Soutenir un module de service public",
        "Ein gemeinnütziges Servicemodul unterstützen",
        "E Modul am ëffentlechen Interessi ënnerstëtzen"
      ),
    },
  ];
}

export const DEFAULT_CONFIG: DonationLandingVariant = {
  id: "support",
  headline: {
    en: "Support Clarvia",
    fr: "Soutenir Clarvia",
    de: "Clarvia unterstützen",
    lu: "Clarvia ënnerstëtzen",
  },
  summary: {
    en: "When a loved one dies, families are often expected to handle paperwork, institutions, deadlines, and cross-border questions while they are still grieving.",
    fr: "Lorsqu’un proche décède, les familles doivent souvent s’occuper de démarches administratives, contacter des institutions, respecter des délais et parfois gérer des questions entre plusieurs pays, alors même qu’elles traversent une période difficile.",
    de: "Wenn ein geliebter Mensch stirbt, müssen Familien oft Formulare, Behörden, Fristen und manchmal auch grenzüberschreitende Fragen klären, während sie noch mitten in der Trauer stehen.",
    lu: "Wann een nooste Mënsch stierft, gi Familljen dacks erwaart, sech ëm Pabeieren, Institutiounen, Fristen a grenziwwerschreidend Froen ze këmmeren, wärend si nach an der Trauer sinn.",
  },
  impactPoints: [
    {
      icon: "\u{1F4C4}",
      text: {
        en: "keep the checklists free for everyone",
        fr: "garder les listes de démarches gratuites pour tous",
        de: "die Checklisten für alle kostenlos halten",
        lu: "d'Checklëschte fir jiddereen gratis halen",
      },
    },
    {
      icon: "\u{1F5A5}\uFE0F",
      text: {
        en: "explain difficult admin tasks in plain language",
        fr: "expliquer les démarches administratives complexes dans un langage simple",
        de: "schwierige administrative Aufgaben in verständlicher Sprache erklären",
        lu: "schwiereg administrativ Démarchen an einfacher Sprooch erklären",
      },
    },
    {
      icon: "\u{1F30D}",
      text: {
        en: "translate the guidance into more languages",
        fr: "traduire les conseils dans plus de langues",
        de: "die Orientierungshilfen in weitere Sprachen übersetzen",
        lu: "d'Orientéierung an nach méi Sproochen iwwersetzen",
      },
    },
    {
      icon: "\u267F",
      text: {
        en: "make the resources easier to read and use",
        fr: "rendre les ressources plus faciles à lire et à utiliser",
        de: "die Materialien einfacher zu lesen und zu nutzen machen",
        lu: "d'Ressourcen méi einfach liesbar a benotzbar maachen",
      },
    },
    {
      icon: "\u2713",
      text: {
        en: "keep the information reviewed and up to date",
        fr: "maintenir les informations vérifiées et à jour",
        de: "die Informationen geprüft und auf dem neuesten Stand halten",
        lu: "d'Informatiounen iwwerpréift an aktuell halen",
      },
    },
    {
      icon: "\u{1F91D}",
      text: {
        en: "help more families find support when they need it",
        fr: "aider plus de familles à trouver du soutien au moment où elles en ont besoin",
        de: "mehr Familien helfen, Unterstützung zu finden, wenn sie sie brauchen",
        lu: "méi Familljen hëllefen, Ënnerstëtzung ze fannen, wann se se brauchen",
      },
    },
  ],
  defaultFrequency: "monthly",
  defaultAmount: 25,
  showImage: true,
  showBankTransfer: true,
  showTestimonials: true,
  showCorporateSponsors: true,
  showGitHubSponsors: true,
  showProgressBar: true,
  showFullNavigation: true,
};

export const ADS_KEEP_FREE_V1: DonationLandingVariant = {
  id: "ads-keep-free-v1",
  headline: {
    en: "Keep practical bereavement guidance free",
    fr: "Garder l'accompagnement gratuit",
    de: "Praktische Orientierung im Trauerfall kostenlos halten",
    lu: "Praktesch Orientéierung am Trauerfall gratis halen",
  },
  summary: {
    en: "Clarvia turns scattered official information into free, open-source checklists for families handling administration after a death.",
    fr: "Clarvia transforme les informations officielles éparpillées en listes d'étapes gratuites pour les familles après un décès.",
    de: "Clarvia macht aus verstreuten offiziellen Informationen kostenlose Open-Source-Checklisten für Familien.",
    lu: "Clarvia mécht aus verstreeten offiziellen Informatiounen gratis Open-Source-Checklëschten fir Familljen.",
  },
  impactPoints: [
    {
      icon: "✓",
      text: {
        en: "Reviewed against official sources",
        fr: "Vérifié par rapport aux sources officielles",
        de: "Geprüft anhand offizieller Quellen",
        lu: "Iwwerpréift op Basis vun offiziellen Quellen",
      },
    },
    {
      icon: "✓",
      text: {
        en: "Free and open to everyone",
        fr: "Gratuit et accessible à tous",
        de: "Kostenlos und für jeden zugänglich",
        lu: "Gratis a fir jidderee zougänglech",
      },
    },
    {
      icon: "✓",
      text: {
        en: "Maintained by a Luxembourg nonprofit",
        fr: "Géré par une association sans but lucratif luxembourgeoise",
        de: "Gepflegt von einer luxemburgischen Non-Profit-Organisation",
        lu: "Gepflegt vun enger Lëtzebuerger ASBL",
      },
    },
  ],
  defaultFrequency: "onetime",
  defaultAmount: 25,
  showImage: false,
  showBankTransfer: false,
  customTiers: {
    monthly: [
      {
        amount: 10,
        label: {
          en: "Keep the service free",
          fr: "Aider à garder le service gratuit",
          de: "Helfen, den Dienst kostenlos zu halten",
          lu: "De Service gratis halen",
        },
      },
      {
        amount: 25,
        label: {
          en: "Support multilingual maintenance",
          fr: "Soutenir la maintenance multilingue",
          de: "Mehrsprachige Pflege unterstützen",
          lu: "Déi méisproocheg Fleeg ënnerstëtzen",
        },
        default: true,
      },
      {
        amount: 50,
        label: {
          en: "Fund source-backed updates",
          fr: "Financer les mises à jour fondées sur des sources officielles",
          de: "Quellenbasierte Aktualisierungen finanzieren",
          lu: "Aktualiséierungen op Basis vun offiziellen Quelle finanzéieren",
        },
      },
      {
        amount: 100,
        label: {
          en: "Founding Circle supporter",
          fr: "Membre du Cercle fondateur",
          de: "Unterstützer im Gründerkreis",
          lu: "Ënnerstëtzer am Grënnerkrees",
        },
      },
    ],
    onetime: [
      {
        amount: 25,
        label: {
          en: "Support free bereavement resources",
          fr: "Soutenir les ressources gratuites",
          de: "Kostenlose Hilfen unterstützen",
          lu: "Gratis Hëllef ënnerstëtzen",
        },
      },
      {
        amount: 50,
        label: {
          en: "Help families in Luxembourg",
          fr: "Aider les familles au Luxembourg",
          de: "Familien in Luxemburg helfen",
          lu: "Familljen zu Lëtzebuerg hëllefen",
        },
      },
      {
        amount: 100,
        label: {
          en: "Keep guidance free for everyone",
          fr: "Garder les conseils gratuits pour tous",
          de: "Orientierung für alle kostenlos halten",
          lu: "Orientéierung fir jiddereen gratis halen",
        },
      },
    ],
  },
  showTestimonials: false,
  showCorporateSponsors: false,
  showGitHubSponsors: false,
  showProgressBar: false,
  showFullNavigation: false,
};
