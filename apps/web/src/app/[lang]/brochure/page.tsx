import { redirect } from "next/navigation";
import { type Lang, LANGUAGES } from "@/lib/i18n";

const brochureUrls: Record<Lang, string> = {
  en: "/brochure.html",
  fr: "/brochure-fr.html",
  de: "/brochure-de.html",
  lu: "/brochure-lb.html",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = LANGUAGES.includes(lang as Lang) ? (lang as Lang) : "en";
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: `https://clarvia.org${brochureUrls[locale]}` },
  };
}

export default async function BrochurePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(brochureUrls[lang as Lang] ?? brochureUrls.en);
}
