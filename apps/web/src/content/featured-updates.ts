import { type Lang, l } from "@/lib/i18n";

export const FEATURED_UPDATE_SLUGS = [
  "ask-clarvia-launches",
  "checklist-accessibility-update",
  "privacy-by-design",
  "trauerwee-supports-clarvia",
] as const;

export type FeaturedUpdateSlug = (typeof FEATURED_UPDATE_SLUGS)[number];

export const FEATURED_UPDATE_DATES: Record<FeaturedUpdateSlug, string> = {
  "ask-clarvia-launches": "2026-08-22",
  "checklist-accessibility-update": "2026-08-18",
  "privacy-by-design": "2026-08-11",
  "trauerwee-supports-clarvia": "2026-07-05",
};

export const FEATURED_UPDATE_CATEGORIES: Record<FeaturedUpdateSlug, string> = {
  "ask-clarvia-launches": "Service",
  "checklist-accessibility-update": "Guidance",
  "privacy-by-design": "Trust",
  "trauerwee-supports-clarvia": "Organization",
};

export function featuredUpdateCategory(lang: Lang, slug: FeaturedUpdateSlug): string {
  const category = FEATURED_UPDATE_CATEGORIES[slug];
  if (category === "Guidance")
    return l(lang, "Guidance", "Orientation", "Orientierung", "Orientéierung");
  if (category === "Trust") return l(lang, "Trust", "Confiance", "Vertrauen", "Vertrauen");
  if (category === "Organization")
    return l(lang, "Organization", "Organisation", "Organisation", "Organisatioun");
  return "Service";
}
