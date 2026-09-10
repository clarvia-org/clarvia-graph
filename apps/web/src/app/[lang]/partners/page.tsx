import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, LANGUAGES, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import PartnerLinkBuilder from "./PartnerLinkBuilder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "partners",
    title: tr(lang, "Add Ask Clarvia to your website | Clarvia"),
    description: tr(
      lang,
      "Paste a short sentence and a link so families can ask Clarvia from your site or emails. No embed, signup, or custom branding.",
    ),
    translated: false,
  });
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />
      <main
        id="main-content"
        className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10"
      >
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
          style={headlineStyle}
        >
          {tr(lang, "Add Ask Clarvia to your website")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed mb-10">
          {tr(
            lang,
            "Families stay on Clarvia to write their question and email. Your organisation adds one sentence and one link beside existing family guidance, aftercare information, or in emails you already send.",
          )}
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {tr(lang, "What to add")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed mb-4">
            {tr(
              lang,
              "Use the canonical link https://clarvia.org/ask. Optional parameters are ref (your organisation slug), market (aggregate geography only), and lang (a language hint). Language on the Ask page is chosen by a saved user choice, then the browser language, then your lang hint, then English. Do not treat language or market as the family’s country or legal situation.",
            )}
          </p>
          <PartnerLinkBuilder />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {tr(lang, "Where it belongs")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {tr(
              lang,
              "Place the sentence next to practical family guidance or aftercare information. The same link can go in emails you already send to families. There is no signup, widget, iframe, or custom branding.",
            )}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {tr(lang, "Rules")}
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-calm-blue-600 leading-relaxed">
            <li>
              {tr(
                lang,
                "Do not collect the family’s question or email on your own forms, or put that information in a URL.",
              )}
            </li>
            <li>
              {tr(
                lang,
                "Do not embed or iframe clarvia.org. Link out. The site is not framed in other pages.",
              )}
            </li>
            <li>
              {tr(
                lang,
                "Do not present Clarvia as your legal, medical, or emergency service. Clarvia is a free nonprofit information service; Lex replies by email with sources.",
              )}
            </li>
            <li>
              {tr(
                lang,
                "Use a ref slug only if Clarvia has given you one. It is for aggregate attribution, not endorsement copy, and it must not change the family’s answer.",
              )}
            </li>
            <li>
              {tr(
                lang,
                "Until translations of this sentence are approved, the paste text is English. Families still get a translated Ask page when their browser or the lang hint matches a supported language.",
              )}
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {tr(lang, "Limits")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {tr(
              lang,
              "Ask Clarvia currently accepts up to three questions per hour from the same network address, uses a bot check, and requires consent. Replies come from Lex at Clarvia, usually within a few minutes. If you plan to send the link to a large mailing list or a clinical network, contact Clarvia first.",
            )}
          </p>
        </section>

        <p className="text-base text-calm-blue-600 leading-relaxed">
          {tr(lang, "Questions about a partnership or a ref slug:")}{" "}
          <Link href={`/${lang}/contact`} className="underline font-medium text-calm-blue-700">
            {tr(lang, "Contact Clarvia")}
          </Link>.
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
