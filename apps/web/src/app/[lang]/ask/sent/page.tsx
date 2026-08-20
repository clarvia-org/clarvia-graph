import { type Metadata } from "next";
import { type Lang, l, LANGUAGES } from "@/lib/i18n";
import Header from "@/components/Header";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";
import AskSentTracker from "./AskSentTracker";

const BASE_URL = "https://clarvia.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;

  return {
    title: "We're on it. — Clarvia",
    robots: { index: false, follow: false, nocache: true },
    alternates: {
      canonical: `${BASE_URL}/${lang}/ask/sent`,
    },
  };
}

export default async function AskSentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-20 relative z-10 text-center">
        <AskSentTracker lang={lang} />
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6" style={headlineStyle}>
          {l(lang, "We’re on it.", "We’re on it.", "We’re on it.", "We’re on it.")}
        </h1>
        <p className="text-base sm:text-lg text-calm-blue-600 leading-relaxed">
          {l(
            lang,
            "Look for an email from Lex at Clarvia (lex@clarvia.org). Check your spam folder if it doesn’t arrive within a few minutes.",
            "Look for an email from Lex at Clarvia (lex@clarvia.org). Check your spam folder if it doesn’t arrive within a few minutes.",
            "Look for an email from Lex at Clarvia (lex@clarvia.org). Check your spam folder if it doesn’t arrive within a few minutes.",
            "Look for an email from Lex at Clarvia (lex@clarvia.org). Check your spam folder if it doesn’t arrive within a few minutes."
          )}
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
