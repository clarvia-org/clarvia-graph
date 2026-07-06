import { MetadataRoute } from "next";
import { LANGUAGES } from "@/lib/i18n";

const BASE_URL = "https://clarvia.org";

type SitemapPage = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const localizedPages: SitemapPage[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "about", changeFrequency: "monthly", priority: 0.8 },
  { path: "updates", changeFrequency: "weekly", priority: 0.8 },
  { path: "contribute", changeFrequency: "monthly", priority: 0.7 },
  { path: "support", changeFrequency: "weekly", priority: 0.7 },
  { path: "privacy", changeFrequency: "yearly", priority: 0.2 },
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
        alternates: {
          languages: Object.fromEntries(
            LANGUAGES.map((alternateLang) => {
              const alternatePath = page.path
                ? `/${alternateLang}/${page.path}`
                : `/${alternateLang}`;

              return [alternateLang, `${BASE_URL}${alternatePath}`];
            })
          ),
        },
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
