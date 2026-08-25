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

export function guidePath(lang: string, slug: GuideSlug): string {
  return `/${lang}/guidance/${GUIDANCE_COUNTRY.code}/${slug}`;
}

export function isGuideSlug(value: string): value is GuideSlug {
  return GUIDES.some((guide) => guide.slug === value);
}
