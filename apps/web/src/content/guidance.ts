import type { Lang } from "@/lib/i18n";

export const GUIDANCE_COUNTRY = {
  code: "lu",
  label: "Luxembourg",
} as const;

export type GuideSlug =
  | "first-steps-after-a-death"
  | "registering-a-death"
  | "funeral-or-cremation"
  | "banks-and-financial-assets"
  | "survivor-pension-and-bereavement-leave";

export type Guide = {
  slug: GuideSlug;
  title: string;
  card: string;
  lastReviewed: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "first-steps-after-a-death",
    title: "First steps after a death",
    card: "Start with the place where the death occurred, identify the first official procedure, and avoid applying another country's deadlines to your situation.",
    lastReviewed: "2026-06-05",
  },
  {
    slug: "registering-a-death",
    title: "Registering a death",
    card: "What the reviewed source set says about the commune, the declaration period, and the documents identified in Clarvia's public task data.",
    lastReviewed: "2026-06-05",
  },
  {
    slug: "funeral-or-cremation",
    title: "Funeral or cremation",
    card: "Written authorization, the published timing rule, and additional documents identified for cremation.",
    lastReviewed: "2026-06-10",
  },
  {
    slug: "banks-and-financial-assets",
    title: "Banks and financial assets after a death",
    card: "Who heirs contact, what supporting documents are identified, and why the CSSF does not trace assets for families.",
    lastReviewed: "2026-06-05",
  },
  {
    slug: "survivor-pension-and-bereavement-leave",
    title: "Survivor pension and bereavement leave",
    card: "Two separate checks: possible CNAP survivor-pension eligibility and time-sensitive leave from an employer.",
    lastReviewed: "2026-06-05",
  },
];

const GUIDE_TRANSLATIONS: Record<
  Exclude<Lang, "en">,
  Record<GuideSlug, Pick<Guide, "title" | "card">>
> = {
  fr: {
    "first-steps-after-a-death": {
      title: "Premières démarches après un décès",
      card: "Commencez par le lieu du décès, identifiez la première formalité officielle et n'appliquez pas à votre situation les délais d'un autre pays.",
    },
    "registering-a-death": {
      title: "Déclarer un décès",
      card: "Ce que les sources vérifiées indiquent sur la commune compétente, le délai de déclaration et les documents à préparer.",
    },
    "funeral-or-cremation": {
      title: "Inhumation ou crémation",
      card: "L'autorisation écrite, le délai publié et les documents supplémentaires prévus en cas de crémation.",
    },
    "banks-and-financial-assets": {
      title: "Banques et avoirs financiers après un décès",
      card: "Les organismes que les héritiers doivent contacter, les justificatifs à préparer et les raisons pour lesquelles la CSSF ne recherche pas les avoirs des familles.",
    },
    "survivor-pension-and-bereavement-leave": {
      title: "Pension de survie et congé en cas de décès",
      card: "Deux vérifications distinctes : un éventuel droit à une pension de survie de la CNAP et le congé à demander rapidement à l'employeur.",
    },
  },
  de: {
    "first-steps-after-a-death": {
      title: "Erste Schritte nach einem Todesfall",
      card: "Beginnen Sie mit dem Ort des Todesfalls, klären Sie den ersten amtlichen Schritt und übertragen Sie keine Fristen aus einem anderen Land auf Ihre Situation.",
    },
    "registering-a-death": {
      title: "Einen Todesfall melden",
      card: "Was die geprüften Quellen über die zuständige Gemeinde, die Meldefrist und die vorzubereitenden Unterlagen sagen.",
    },
    "funeral-or-cremation": {
      title: "Bestattung oder Einäscherung",
      card: "Die schriftliche Genehmigung, die veröffentlichte Frist und zusätzliche Unterlagen für eine Einäscherung.",
    },
    "banks-and-financial-assets": {
      title: "Banken und Finanzvermögen nach einem Todesfall",
      card: "An wen sich Erben wenden, welche Nachweise benötigt werden und warum die CSSF keine Vermögenswerte für Familien ermittelt.",
    },
    "survivor-pension-and-bereavement-leave": {
      title: "Hinterbliebenenrente und Sonderurlaub im Todesfall",
      card: "Zwei getrennte Prüfungen: ein möglicher Anspruch auf eine CNAP-Hinterbliebenenrente und der zeitnah beim Arbeitgeber zu beantragende Sonderurlaub.",
    },
  },
  lu: {
    "first-steps-after-a-death": {
      title: "Éischt Schrëtt no engem Doudesfall",
      card: "Fänkt beim Doudesuert un, kläert déi éischt offiziell Demarche a benotzt keng Friste vun engem anere Land fir Är Situatioun.",
    },
    "registering-a-death": {
      title: "En Doudesfall mellen",
      card: "Wat déi iwwerpréifte Quellen iwwer déi zoustänneg Gemeng, d'Meldefrist an déi néideg Dokumenter soen.",
    },
    "funeral-or-cremation": {
      title: "Begriefnes oder Anäscherung",
      card: "Déi schrëftlech Autorisatioun, déi publizéiert Frist an zousätzlech Dokumenter fir eng Anäscherung.",
    },
    "banks-and-financial-assets": {
      title: "Banken a Finanzverméigen no engem Doudesfall",
      card: "U wie sech Ierwe wende sollen, wéi eng Noweiser néideg sinn a firwat d'CSSF keng Verméigenswäerter fir Famillje sicht.",
    },
    "survivor-pension-and-bereavement-leave": {
      title: "Iwwerliewenspensioun a Sondercongé am Doudesfall",
      card: "Zwou getrennte Kontrollen: e méiglecht Recht op eng Iwwerliewenspensioun vun der CNAP an de Sondercongé, dee séier beim Patron ugefrot muss ginn.",
    },
  },
};

export function guidesForLanguage(lang: Lang): Guide[] {
  if (lang === "en") return GUIDES;
  return GUIDES.map((guide) => ({ ...guide, ...GUIDE_TRANSLATIONS[lang][guide.slug] }));
}

export function guidanceCountryLabel(lang: Lang): string {
  return lang === "de" ? "Luxemburg" : lang === "lu" ? "Lëtzebuerg" : "Luxembourg";
}

export function guidePath(lang: string, slug: GuideSlug): string {
  return `/${lang}/guidance/${GUIDANCE_COUNTRY.code}/${slug}`;
}

export function isGuideSlug(value: string): value is GuideSlug {
  return GUIDES.some((guide) => guide.slug === value);
}
