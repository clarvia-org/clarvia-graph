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

  return entries;
}
