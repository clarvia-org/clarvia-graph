import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, LANGUAGES, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (LANGUAGES.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  return pageMetadata({
    lang,
    pathAfterLang: "how-it-works",
    title: tr(lang, "How Clarvia finds and checks information | Clarvia"),
    description: tr(
      lang,
      "How official sources, human review, AI, and privacy work for Ask Clarvia and published guidance.",
    ),
    translated: true,
  });
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
        {title}
      </h2>
      <div className="space-y-3 text-base text-calm-blue-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default async function HowItWorksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  const faqs = [
    {
      q: tr(lang, "Is Ask Clarvia free?"),
      a: tr(lang, "Yes. Ask Clarvia is free, has no paid tier, and does not require an account."),
    },
    {
      q: tr(lang, "Can I use Ask Clarvia outside Luxembourg?"),
      a: tr(
        lang,
        "Yes. Ask Clarvia is available worldwide. Tell us which countries are involved so the reply can look for the relevant sources.",
      ),
    },
    {
      q: tr(lang, "Does the checklist cover every country?"),
      a: tr(
        lang,
        "The checklist includes the tasks published for the countries it lists. If the country or facts do not match, use Ask Clarvia.",
      ),
    },
    {
      q: tr(lang, "Is Clarvia legal or medical advice?"),
      a: tr(
        lang,
        "No. Clarvia provides practical information and signposting. Check official sources and use a qualified professional for advice about your situation.",
      ),
    },
    {
      q: tr(lang, "Does Ask Clarvia use AI?"),
      a: tr(
        lang,
        "Yes. AI is used to research and prepare replies, and replies may be automatic. Sources are included so you can check them.",
      ),
    },
    {
      q: tr(lang, "Who reviews published checklist claims?"),
      a: tr(
        lang,
        "Human reviewers approve source assertions under Clarvia's public review policy. A checklist claim cannot publish from the maintained graph unless its required source and review states pass.",
      ),
    },
    {
      q: tr(lang, "Does the checklist send my answers to Clarvia?"),
      a: tr(
        lang,
        "Checklist conditions are evaluated in your browser. Ask Clarvia is a separate service and processes your question and email to send the reply.",
      ),
    },
    {
      q: tr(lang, "How do I know which page applies to me?"),
      a: tr(
        lang,
        "Check the country in the selector and the breadcrumb on the page. If the country or facts do not match, use Ask Clarvia.",
      ),
    },
    {
      q: tr(lang, "Can an institution reuse Clarvia's work?"),
      a: tr(
        lang,
        "Yes. Clarvia publishes open code and data under the licenses stated in the repository, with official source material remaining subject to its own terms.",
      ),
    },
  ];

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
          {tr(lang, "How Clarvia finds and checks information")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed mb-12">
          {tr(
            lang,
            "Clarvia uses different methods for a live Ask Clarvia reply and for guidance published from our maintained dataset. This page explains the difference, how AI is used, and what a human has reviewed.",
          )}
        </p>

        <Block id="ask-clarvia" title={tr(lang, "Ask Clarvia is a live global email service.")}>
          <p>
            {tr(
              lang,
              "Your question is processed to research relevant official sources and prepare a reply with links. AI is used and a reply may be sent automatically. Maintained Clarvia data and legislation may be used when relevant, but an individual email reply is not the same as a human-approved checklist record. Do not assume that each reply has been reviewed by a person or lawyer before it reaches you.",
            )}
          </p>
        </Block>

        <Block
          id="official-sources"
          title={tr(lang, "Published guides and checklist tasks use a controlled source chain.")}
        >
          <p>
            {tr(
              lang,
              "Clarvia captures an official source, records a supported assertion, models the consequence and task, and publishes a checklist item only after the required review states pass. In plain language: official source → saved version → checked claim → practical consequence → task → checklist item.",
            )}
          </p>
        </Block>

        <Block id="human-review" title={tr(lang, "AI and human review")}>
          <p>
            {tr(
              lang,
              "AI may help discover sources and draft structured records. A human reviewer checks the source anchor and decides whether an assertion can be approved. AI-assisted records remain labelled as AI-assisted after approval. Clarvia's public review policy sets the publication gate; current founder review requires a delay between extracting and approving a source assertion.",
            )}
          </p>
        </Block>

        <Block id="graph-lex" title={tr(lang, "Clarvia Graph and lex")}>
          <p>
            {tr(
              lang,
              "Clarvia Graph organizes source-backed administrative tasks. lex stores current official legislation in a consistent, checksummed format for answering systems. lex is not the official publisher and is not itself a family guide. Clarvia cites the official source.",
            )}
          </p>
        </Block>

        <Block
          id="privacy"
          title={tr(lang, "The checklist and Ask Clarvia process information differently.")}
        >
          <p>
            {tr(
              lang,
              "Checklist conditions are evaluated in your browser, so the personal facts used to generate the checklist are not sent to Clarvia for that generation. Ask Clarvia is a separate email service: your question and email address are processed so Clarvia can send a reply. Read the Privacy Policy before submitting sensitive information.",
            )}{" "}
            <Link href={`/${lang}/privacy`} className="underline font-medium text-calm-blue-700">
              {tr(lang, "Privacy Policy")}
            </Link>
          </p>
        </Block>

        <Block id="responsibility" title={tr(lang, "Who is responsible")}>
          <p>
            {tr(
              lang,
              "Clarvia ASBL is governed by its unpaid directors, Günther Schriver and Tommi Lindfors. Published graph records carry review information and follow Clarvia's public review policy. This governance does not turn Clarvia into an emergency, legal, tax, medical, psychological, notarial, banking, financial, or succession adviser.",
            )}
          </p>
        </Block>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {tr(lang, "Inspect the method")}
          </h2>
          <ul className="space-y-2 text-base">
            <li>
              <a
                className="underline text-calm-blue-700"
                href="https://github.com/clarvia-org/clarvia-graph/blob/main/docs/FOUNDATION.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr(lang, "Foundation specification")}
              </a>
            </li>
            <li>
              <a
                className="underline text-calm-blue-700"
                href="https://github.com/clarvia-org/clarvia-graph/blob/main/docs/REVIEW_POLICY.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr(lang, "Review policy")}
              </a>
            </li>
            <li>
              <a
                className="underline text-calm-blue-700"
                href="https://github.com/clarvia-org/clarvia-graph"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr(lang, "Clarvia Graph")}
              </a>
            </li>
            <li>
              <a
                className="underline text-calm-blue-700"
                href="https://data.public.lu/en/organizations/clarvia-asbl/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr(lang, "Open dataset on data.public.lu")}
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-6"
            style={headlineStyle}
          >
            {tr(lang, "Questions")}
          </h2>
          <dl className="space-y-6">
            {faqs.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-calm-blue-800 mb-1">{item.q}</dt>
                <dd className="text-base text-calm-blue-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12">
          <Link href={`/${lang}#ask-us`} className="btn-primary px-6 py-3 inline-flex items-center">
            {tr(lang, "Ask Clarvia")}
          </Link>
        </p>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
