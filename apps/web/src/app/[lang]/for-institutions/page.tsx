import { type Metadata } from "next";
import Link from "next/link";
import { type Lang, LANGUAGES, s1 } from "@/lib/i18n";
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
    pathAfterLang: "for-institutions",
    title: s1("Open bereavement guidance infrastructure for public services — Clarvia"),
    description: s1(
      "Inspect, reuse, and adapt Clarvia's source-backed bereavement tasks, open data, and schemas."
    ),
  });
}

export default async function ForInstitutionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang as Lang) || "en";

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6" style={headlineStyle}>
          {s1("Open bereavement guidance infrastructure for public services")}
        </h1>
        <p className="text-lg text-calm-blue-700 leading-relaxed mb-10">
          {s1(
            "Clarvia turns official rules into versioned, source-backed tasks that public-interest teams can inspect, reuse, and adapt."
          )}
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {s1("What you can reuse")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {s1(
              "Clarvia Graph contains the provenance model, reviewed source assertions, task templates, validation tooling, static exports, and a public checklist implementation. The lex dataset provides current official legislation in normalized Markdown alongside retained official source files and checksums."
            )}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {s1("Designed for reuse")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {s1(
              "Clarvia maintains native schemas and compatibility views for CPSV-AP, CCCEV, ELI, and PROV-O. Code and data are published under open licenses stated in the repository; retained official legislation remains subject to its source-specific terms."
            )}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-calm-blue-800 mb-3" style={headlineStyle}>
            {s1("Who it is for")}
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed">
            {s1(
              "Public-interest teams can inspect, reuse, and adapt this infrastructure. Official source material remains subject to its own terms."
            )}
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://data.public.lu/en/organizations/clarvia-asbl/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-6 py-3 text-base text-center"
          >
            {s1("View the open dataset")}
          </a>
          <a
            href="https://github.com/clarvia-org/clarvia-graph"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-6 py-3 text-base text-center"
          >
            {s1("Explore Clarvia Graph")}
          </a>
          <Link href={`/${lang}/contact`} className="btn-primary px-6 py-3 text-base text-center">
            {s1("Discuss institutional reuse")}
          </Link>
        </div>
      </main>
      <FooterSection lang={lang} />
    </>
  );
}
