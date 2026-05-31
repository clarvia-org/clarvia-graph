import { MetadataRoute } from "next";
import { LANGUAGES } from "@/lib/i18n";

const BASE_URL = "https://clarvia.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Landing pages: /en, /fr, /de
  for (const lang of LANGUAGES) {
    entries.push({
      url: `${BASE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          LANGUAGES.map((l) => [l, `${BASE_URL}/${l}`])
        ),
      },
    });
  }

  // Subpages: /about, /updates, /contribute
  const subpages = ["about", "updates", "contribute"];
  for (const page of subpages) {
    for (const lang of LANGUAGES) {
      entries.push({
        url: `${BASE_URL}/${lang}/${page}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LANGUAGES.map((l) => [l, `${BASE_URL}/${l}/${page}`])
          ),
        },
      });
    }
  }

  // AI and agent context files
  entries.push({
    url: `${BASE_URL}/llms.txt`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  });
  entries.push({
    url: `${BASE_URL}/llms-full.txt`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  });
  entries.push({
    url: `${BASE_URL}/ai-crawler-policy.txt`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.2,
  });

  return entries;
}
