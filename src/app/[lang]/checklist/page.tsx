import { Metadata } from "next";
import { type Lang, LANGUAGES } from "@/lib/i18n";

const BASE_URL = "https://clarvia.org";

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Bereavement Checklist (Alpha) — Clarvia",
    description:
      "Generate a personalised bereavement administration checklist for Luxembourg. Alpha version — early prototype with limited coverage.",
  },
  fr: {
    title: "Liste de démarches en cas de décès (Alpha) — Clarvia",
    description:
      "Générez une liste de démarches personnalisée pour l'administration après un décès au Luxembourg. Version alpha — prototype précoce avec couverture limitée.",
  },
  de: {
    title: "Checkliste im Trauerfall (Alpha) — Clarvia",
    description:
      "Erstellen Sie eine personalisierte Checkliste für Verwaltungsschritte nach einem Todesfall in Luxemburg. Alpha-Version — früher Prototyp mit begrenzter Abdeckung.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const meta = META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/checklist`,
      languages: Object.fromEntries(
        LANGUAGES.map((code) => [code, `${BASE_URL}/${code}/checklist`])
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${lang}/checklist`,
      siteName: "Clarvia",
      locale: lang,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export { default } from "./ChecklistPage";
