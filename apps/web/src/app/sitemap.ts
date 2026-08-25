import { MetadataRoute } from "next";
import { LANGUAGES, hreflangLanguages } from "@/lib/i18n";
import { GUIDES, GUIDANCE_COUNTRY } from "@/content/guidance";
import { FEATURED_UPDATE_SLUGS } from "@/content/featured-updates";

const BASE_URL = "https://clarvia.org";

type SitemapPage = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  translated: boolean;
};

const localizedPages: SitemapPage[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0, translated: false },
  { path: "about", changeFrequency: "monthly", priority: 0.8, translated: true },
  { path: "how-it-works", changeFrequency: "monthly", priority: 0.8, translated: false },
  { path: "guidance", changeFrequency: "weekly", priority: 0.8, translated: false },
  { path: "checklist", changeFrequency: "weekly", priority: 0.7, translated: false },
  { path: "for-institutions", changeFrequency: "monthly", priority: 0.6, translated: false },
  { path: "updates", changeFrequency: "weekly", priority: 0.8, translated: true },
  { path: "contribute", changeFrequency: "monthly", priority: 0.7, translated: true },
  { path: "support", changeFrequency: "weekly", priority: 0.7, translated: true },
  { path: "contact", changeFrequency: "monthly", priority: 0.6, translated: true },
  { path: "privacy", changeFrequency: "yearly", priority: 0.2, translated: true },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const page of localizedPages) {
    for (const lang of LANGUAGES) {
      const localizedPath = page.path ? `/${lang}/${page.path}` : `/${lang}`;
      entries.push({
        url: `${BASE_URL}${localizedPath}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        ...(page.translated
          ? { alternates: { languages: hreflangLanguages(page.path) } }
          : {}),
      });
    }
  }

  for (const guide of GUIDES) {
    for (const lang of LANGUAGES) {
      entries.push({
        url: `${BASE_URL}/${lang}/guidance/${GUIDANCE_COUNTRY.code}/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const slug of FEATURED_UPDATE_SLUGS) {
    for (const lang of LANGUAGES) {
      entries.push({
        url: `${BASE_URL}/${lang}/updates/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  entries.push(
    {
      url: `${BASE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/ai-crawler-policy.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    }
  );

  return entries;
}
