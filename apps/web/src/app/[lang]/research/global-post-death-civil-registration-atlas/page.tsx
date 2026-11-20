import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";
import GuideShareLinkBox from "../../guide/[slug]/GuideShareLinkBox";
import CountryRegistrationAtlasTable from "./CountryRegistrationAtlasTable";
import {
  CORPUS_STATS,
  GITHUB_STUDY_2_SOURCE_URL,
  MACRO_REGION_ORDER,
  STUDY_2_CANONICAL_URL,
  STUDY_2_CSV_PATH,
  STUDY_2_DATA_PUBLIC_LU_URL,
  STUDY_2_JSON_PATH,
  STUDY_2_PDF_PATH,
  STUDY_2_PUBLISHED_DATE,
  STUDY_2_SLUG,
  STUDY_2_ZENODO_DOI,
  STUDY_2_ZENODO_DOI_URL,
  STUDY_2_ZENODO_RECORD_URL,
  STUDY_AUTHORS_JSONLD,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
  getPostDeathCivilRegistrationStudy,
} from "@/content/research/post-death-civil-registration-study";
import { STUDY_1_CANONICAL_URL } from "@/content/research/cross-border-integration-study";
import { STUDY_3_CANONICAL_URL } from "@/content/research/advance-directives-incapacity-study";

const PAGE_TITLE =
  "Global Post-Death Civil Registration & Estate Administration Atlas (2026) | Clarvia";
const STUDY_HEADLINE =
  "Global Post-Death Civil Registration & Estate Administration Atlas (2026)";
const PAGE_DESCRIPTION =
  "A 196-country comparative atlas of statutory death registration windows, digital health-to-registry reporting, once-only agency notifications, succession gatekeepers, and Hague Apostille reach.";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ lang: string }> {
  return [{ lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return {};

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    robots: { index: true, follow: true },
    alternates: {
      canonical: STUDY_2_CANONICAL_URL,
    },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: STUDY_2_CANONICAL_URL,
      siteName: "Clarvia",
      locale: "en",
      type: "article",
      publishedTime: STUDY_2_PUBLISHED_DATE,
      images: [
        { url: "https://clarvia.org/og-image.png", width: 1200, height: 630 },
      ],
    },
    other: {
      citation_title: STUDY_HEADLINE,
      citation_author: ["Tommi Lindfors", "Clarvia ASBL"],
      citation_author_institution: "Clarvia ASBL",
      citation_publication_date: "2026/11/18",
      citation_doi: STUDY_2_ZENODO_DOI,
      citation_pdf_url: `https://clarvia.org${STUDY_2_PDF_PATH}`,
      citation_public_url: STUDY_2_CANONICAL_URL,
      citation_publisher: "Clarvia ASBL",
      citation_language: "en",
    },
  };
}

export default async function GlobalPostDeathCivilRegistrationAtlasPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "en") notFound();

  const study = getPostDeathCivilRegistrationStudy();
  const window48h = study.registrationWindowDistribution.find(
    (d) => d.code === "within_48h",
  );
  const window3To7 = study.registrationWindowDistribution.find(
    (d) => d.code === "days_3_to_7",
  );
  const window8To35 = study.registrationWindowDistribution.find(
    (d) => d.code === "days_8_to_35",
  );
  const windowExtended = study.registrationWindowDistribution.find(
    (d) => d.code === "extended_42d_to_12m",
  );
  const windowDisposition = study.registrationWindowDistribution.find(
    (d) => d.code === "disposition_or_prompt",
  );
  const windowFederal = study.registrationWindowDistribution.find(
    (d) => d.code === "subnational_federal",
  );
  const informantBucket = study.filingChannelDistribution.find(
    (d) => d.code === "in_person_informant",
  );
  const funeralBucket = study.filingChannelDistribution.find(
    (d) => d.code === "funeral_director_or_facility",
  );
  const thailandBucket = study.apostilleDistribution.find(
    (d) => d.code === "entering_force_feb_2027",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Research",
            item: "https://clarvia.org/en/research",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Global Post-Death Civil Registration Atlas (2026)",
            item: STUDY_2_CANONICAL_URL,
          },
        ],
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${STUDY_2_CANONICAL_URL}#article`,
        headline:
          "Global Post-Death Civil Registration & Estate Administration Atlas (2026)",
        description: PAGE_DESCRIPTION,
        url: STUDY_2_CANONICAL_URL,
        inLanguage: "en",
        datePublished: study.publishedDate,
        dateModified: study.publishedDate,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isBasedOn: ZENODO_STUDY_CORPUS_DOI_URL,
        sameAs: [STUDY_2_ZENODO_DOI_URL, STUDY_2_ZENODO_RECORD_URL],
        author: STUDY_AUTHORS_JSONLD,
        publisher: { "@id": "https://clarvia.org/#organization" },
        encoding: {
          "@type": "MediaObject",
          encodingFormat: "application/pdf",
          contentUrl: `https://clarvia.org${STUDY_2_PDF_PATH}`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": STUDY_2_CANONICAL_URL,
        },
        citation: study.referenceSources.map((src) => ({
          "@type": "CreativeWork",
          name: src.title,
          publisher: { "@type": "Organization", name: src.issuer },
          url: src.url,
        })),
      },
      {
        "@type": "Dataset",
        "@id": `${STUDY_2_CANONICAL_URL}#dataset`,
        name: "Clarvia 196-Country Post-Death Civil Registration & Estate Administration Dataset (November 2026)",
        description:
          "Comparative empirical dataset covering statutory death registration deadlines, filing channels, inter-agency notification automation, succession gatekeepers, and Hague Apostille status across all 196 countries.",
        url: STUDY_2_CANONICAL_URL,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isBasedOn: ZENODO_STUDY_CORPUS_DOI_URL,
        sameAs: [
          STUDY_2_ZENODO_RECORD_URL,
          STUDY_2_ZENODO_DOI_URL,
          STUDY_2_DATA_PUBLIC_LU_URL,
        ],
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/pdf",
            contentUrl: `https://clarvia.org${STUDY_2_PDF_PATH}`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "text/csv",
            contentUrl: `https://clarvia.org${STUDY_2_CSV_PATH}`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `https://clarvia.org${STUDY_2_JSON_PATH}`,
          },
        ],
        creator: STUDY_AUTHORS_JSONLD,
        temporalCoverage: "2026-11",
      },
    ],
  };

  return (
    <>
      <Header lang="en" />
      <main
        id="main-content"
        className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <nav className="text-sm text-calm-blue-500 mb-5" aria-label="Breadcrumb">
          <Link
            href="/en/research"
            className="underline hover:text-calm-blue-800"
          >
            Research
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-calm-blue-700 font-medium">
            Global Civil Registration Atlas (2026)
          </span>
        </nav>

        <header className="max-w-3xl mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-white/85 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-800">
              Research Report · {study.totalCountries} Countries ·{" "}
              {study.totalVerifiedCitationsIn196Guides.toLocaleString("en-US")}{" "}
              Official Sources
            </span>
            <time
              dateTime={study.publishedDate}
              className="inline-flex items-center rounded-full bg-white/85 border border-calm-blue-200 px-3 py-1 text-xs font-medium text-calm-blue-600"
            >
              Published 18 November 2026 · Corpus snapshot:{" "}
              {study.verifySnapshot}
            </time>
            <a
              href={STUDY_2_ZENODO_RECORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-calm-blue-50 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-700 hover:bg-calm-blue-100"
            >
              Study DOI: {STUDY_2_ZENODO_DOI} · CC BY 4.0
            </a>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
            style={headlineStyle}
          >
            Global Post-Death Civil Registration &amp; Estate Administration Atlas
            (2026)
          </h1>

          <p className="text-lg text-calm-blue-700 leading-relaxed">
            A comparative study of all {study.totalCountries} sovereign countries
            examining statutory death registration windows, digital
            health-to-registry reporting, once-only multi-agency notification,
            and succession gatekeepers.
          </p>
        </header>

        {/* Direct Raw Data Downloads & Open Verification */}
        <section
          aria-label="Reproducible dataset downloads and source code"
          className="mb-10 rounded-xl border border-calm-blue-200 bg-white/80 p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <span className="text-xs sm:text-sm font-semibold text-calm-blue-800">
            Inspect or verify all {study.totalCountries} country rows directly:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={STUDY_2_PDF_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download PDF (Working Paper)
            </a>
            <a
              href={STUDY_2_CSV_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download CSV ({study.totalCountries} rows)
            </a>
            <a
              href={STUDY_2_JSON_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download JSON
            </a>
            <a
              href={GITHUB_STUDY_2_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-200 bg-calm-blue-50/70 hover:bg-calm-blue-100 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              View classification code on GitHub
            </a>
            <a
              href={STUDY_2_ZENODO_RECORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-200 bg-calm-blue-50/70 hover:bg-calm-blue-100 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Zenodo record ({STUDY_2_ZENODO_DOI})
            </a>
            <a
              href={STUDY_2_DATA_PUBLIC_LU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-200 bg-calm-blue-50/70 hover:bg-calm-blue-100 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              data.public.lu open dataset
            </a>
          </div>
        </section>

        {/* Key Findings */}
        <section aria-labelledby="key-findings-heading" className="mb-12">
          <h2
            id="key-findings-heading"
            className="text-xl sm:text-2xl font-semibold text-calm-blue-800 mb-4"
            style={headlineStyle}
          >
            Key Findings ({study.verifySnapshot})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.automaticDigitalCount} / {study.totalCountries} (
                {study.automaticDigitalPct.toFixed(1)}%)
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Automatic Digital Registration
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                In {study.automaticDigitalCount} states, electronic physician
                certification feeds directly into the national civil register,
                eliminating an in-person registry counter visit altogether.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.manualPropagationPct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Manual Agency-by-Agency Filing
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                In {study.manualPropagationCount} of {study.totalCountries}{" "}
                countries, families still notify pension, social security, tax,
                and ID agencies separately, while{" "}
                <strong>{study.automatedPropagationCount}</strong> (
                {study.automatedPropagationPct.toFixed(1)}%) propagate updates
                automatically or via a one-stop desk.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.exOfficioProbateCount} / {study.totalCountries} (
                {study.exOfficioProbatePct.toFixed(1)}%)
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Ex-Officio Probate Initiation
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                Central European and Nordic frameworks initiate succession or
                court guidance automatically upon civil registration, sparing
                families from filing an opening probate petition first.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.apostilleInForcePct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                1961 Hague Apostille Reach
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                {study.apostilleInForceCount} of {study.totalCountries}{" "}
                countries issue and accept Apostilles as of{" "}
                {study.verifySnapshot}, rising to{" "}
                <strong>{study.postFeb2027ApostillePct.toFixed(1)}%</strong> on
                28 February 2027 when Thailand enters into force.
              </p>
            </div>
          </div>
        </section>

        {/* Constructive Synthesis */}
        <section
          aria-labelledby="synthesis-heading"
          className="max-w-3xl mb-12 space-y-5 text-base text-calm-blue-700 leading-relaxed"
        >
          <h2
            id="synthesis-heading"
            className="text-2xl sm:text-3xl font-semibold text-calm-blue-800"
            style={headlineStyle}
          >
            How interoperable civil registries remove post-death administrative
            burden
          </h2>

          <p>
            Every national civil registration law balances two distinct
            administrative goals: timely sanitary clearance for burial or
            cremation, and accessible public-record filing across diverse
            territories. Measuring all {study.totalCountries} domestic
            bereavement guides in Clarvia’s corpus (backed by{" "}
            {study.totalVerifiedCitationsIn196Guides.toLocaleString("en-US")}{" "}
            verified official source citations and{" "}
            {study.totalVerifiedContactsIn196Guides.toLocaleString("en-US")}{" "}
            verified public authorities) shows that post-death workload for
            bereaved relatives is shaped less by the calendar deadline itself than
            by how public databases connect once a physician certifies a death.
          </p>

          <p>
            Across continents, statutory registration deadlines run from 12 hours
            (Brunei) and 24 hours (for example France, Italy, Spain, Greece,
            Egypt, and Thailand) up to 3 to 12 months (for example Ireland, Uganda,
            Guyana, and Tuvalu), while {windowFederal?.count ?? 0} federal or
            sub-national systems ({windowFederal?.pct.toFixed(1)}%: the United
            States, Canada, Australia, the United Arab Emirates, and the Federated
            States of Micronesia) set deadlines at state, provincial, emirate, or
            island-state level. Where civil registration is connected directly to
            healthcare certification, funeral intermediaries, or once-only
            population registers, families rarely carry paper certificates from
            office to office regardless of the statutory day count.
          </p>

          <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-5 space-y-3">
            <h3 className="text-lg font-semibold text-calm-blue-800">
              Three interoperable reforms observable across the 196-country corpus
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base text-calm-blue-700">
              <li>
                <strong>
                  Electronic hospital-to-registry links and funeral-director filing
                  eliminate early-grief counter queues:
                </strong>{" "}
                In {study.digitalFilingCount} countries (
                {study.digitalFilingPct.toFixed(1)}%), doctors or online
                government portals feed civil registries digitally (including{" "}
                {study.automaticDigitalCount} countries where human counter filing
                is skipped altogether), and in a further{" "}
                {funeralBucket?.count ?? 0} countries (
                {funeralBucket?.pct.toFixed(1)}%) licensed funeral directors submit
                declarations on the family’s behalf. Together,{" "}
                {study.digitalOrIntermediaryFilingPct.toFixed(1)}% of studied
                jurisdictions offer digital or intermediary filing, whereas{" "}
                {informantBucket?.count ?? 0} countries (
                {informantBucket?.pct.toFixed(1)}%) still depend primarily on a
                surviving relative attending in person.
              </li>
              <li>
                <strong>
                  Once-only population-register propagation prevents pension
                  overpayments and duplicate form-filling:
                </strong>{" "}
                Under Regulation (EU) 2018/1724 and comparable digital-government
                reforms in countries such as Brazil, South Korea, Singapore, Saudi
                Arabia, Mauritius, and Taiwan, {study.automatedPropagationCount}{" "}
                states ({study.automatedPropagationPct.toFixed(1)}%) broadcast
                newly registered deaths across tax, pension, health, and identity
                databases or pool notifications into a Tell-Us-Once channel. Even
                partial automatic links immediately stop pension disbursements so
                heirs are not asked months later to repay overpaid installments.
              </li>
              <li>
                <strong>
                  Proactive succession intake and Hague Apostille coverage prepare
                  records for cross-border use:
                </strong>{" "}
                While {study.exOfficioProbateCount} countries initiate estate
                cases ex officio upon death registration, families elsewhere
                navigate{" "}
                {study.estateGatekeeperDistribution
                  .find((d) => d.code === "civil_law_notary")
                  ?.count ?? 0}{" "}
                civil-law notarial systems,{" "}
                {study.estateGatekeeperDistribution
                  .find((d) => d.code === "common_law_probate_court")
                  ?.count ?? 0}{" "}
                common-law probate courts,{" "}
                {study.estateGatekeeperDistribution
                  .find((d) => d.code === "civil_judicial_or_registry")
                  ?.count ?? 0}{" "}
                civil court or registry procedures, and{" "}
                {study.estateGatekeeperDistribution
                  .find((d) => d.code === "personal_status_or_plural")
                  ?.count ?? 0}{" "}
                personal-status or plural frameworks. Whenever a family member
                lives abroad, Hague Apostille coverage ({study.apostilleInForceCount}{" "}
                countries today; {study.postFeb2027ApostillePct.toFixed(1)}% once
                Thailand’s accession takes force on 28 February 2027) determines
                whether one authentication stamp replaces multi-step consular
                chains.
              </li>
            </ol>
          </div>
        </section>

        {/* Summary Tables */}
        <section
          aria-labelledby="summary-tables-heading"
          className="mb-14 space-y-8"
        >
          <h2
            id="summary-tables-heading"
            className="text-2xl font-semibold text-calm-blue-800"
            style={headlineStyle}
          >
            Global Empirical Distributions ({study.totalCountries} Countries)
          </h2>

          {/* Table 1: Registration Windows */}
          <div
            role="region"
            aria-labelledby="window-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="window-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 1. Statutory Civil Death Registration Windows Across{" "}
                {study.totalCountries} Countries (
                {(window48h?.count ?? 0) +
                  (window3To7?.count ?? 0) +
                  (window8To35?.count ?? 0) +
                  (windowExtended?.count ?? 0) +
                  study.automaticDigitalCount}{" "}
                uniform timelines + {windowDisposition?.count ?? 0} burial-tied +{" "}
                {windowFederal?.count ?? 0} sub-national)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Registration Window Regime
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Countries
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Share
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Institutional Mechanics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.registrationWindowDistribution.map((bucket) => (
                  <tr key={bucket.code} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-calm-blue-800 align-top whitespace-nowrap"
                    >
                      {bucket.label}
                    </th>
                    <td className="px-4 py-3 text-calm-blue-800 font-medium align-top tabular-nums whitespace-nowrap">
                      {bucket.count} / {study.totalCountries}
                    </td>
                    <td className="px-4 py-3 text-calm-blue-700 align-top tabular-nums">
                      {bucket.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-calm-blue-600 align-top leading-snug">
                      {bucket.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 2: Filing Channel & Inter-Agency Propagation */}
          <div
            role="region"
            aria-labelledby="channel-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="channel-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 2. Filing Channels &amp; Downstream Inter-Agency
                Propagation ({study.totalCountries} Countries)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    System Stage &amp; Model
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Countries
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Share
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Operational Impact for Families
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.filingChannelDistribution.map((b) => (
                  <tr key={`fc-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">Filing channel:</span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800 align-top whitespace-nowrap">
                      {b.count} / {study.totalCountries}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700 align-top">
                      {b.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-calm-blue-600 align-top leading-snug">
                      {b.description}
                    </td>
                  </tr>
                ))}
                {study.agencyPropagationDistribution.map((b) => (
                  <tr key={`ap-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">
                        Downstream agencies:
                      </span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800 align-top whitespace-nowrap">
                      {b.count} / {study.totalCountries}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700 align-top">
                      {b.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-calm-blue-600 align-top leading-snug">
                      {b.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 3: Estate Gatekeepers & Cross-Border Document Bridge */}
          <div
            role="region"
            aria-labelledby="estate-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="estate-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 3. Non-Contentious Estate Gatekeepers &amp; Cross-Border
                Authentication ({study.totalCountries} Countries)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Legal Framework / Instrument
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Countries
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Share
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Estate Release &amp; Foreign-Use Mechanism
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.estateGatekeeperDistribution.map((b) => (
                  <tr key={`eg-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">Estate model:</span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800 align-top whitespace-nowrap">
                      {b.count} / {study.totalCountries}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700 align-top">
                      {b.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-calm-blue-600 align-top leading-snug">
                      {b.description}
                    </td>
                  </tr>
                ))}
                {study.apostilleDistribution.map((b) => (
                  <tr key={`ha-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">HCCH #12 bridge:</span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800 align-top whitespace-nowrap">
                      {b.count} / {study.totalCountries}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700 align-top">
                      {b.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-calm-blue-600 align-top leading-snug">
                      {b.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 4: Regional Breakdown */}
          <div
            role="region"
            aria-labelledby="region-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[44rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="region-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 4. Regional Interoperability Indicators Across All{" "}
                {study.macroRegionCount} World Macro-Regions ({study.totalCountries}{" "}
                Countries)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Macro-Region
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Countries
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Digital / e-Portal Filing
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Auto / One-Stop Agencies
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Apostille in Force
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Verified Sources
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.macroRegionSummaries.map((reg) => (
                  <tr key={reg.region} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-semibold text-calm-blue-800 whitespace-nowrap"
                    >
                      {reg.region}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {reg.countryCount}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-800">
                      {reg.digitalFilingCount} / {reg.countryCount} (
                      {reg.digitalFilingPct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-800">
                      {reg.automatedPropagationCount} / {reg.countryCount} (
                      {reg.automatedPropagationPct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-800">
                      {reg.apostilleInForceCount} / {reg.countryCount} (
                      {reg.apostilleInForcePct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {reg.verifiedSourcesCount.toLocaleString("en-US")} (
                      {reg.verifiedContactsCount} contacts)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Interactive 196-Country Atlas Table */}
        <CountryRegistrationAtlasTable
          rows={study.rows}
          regions={MACRO_REGION_ORDER}
        />

        {/* Methodology & Scope Caveats */}
        <section
          aria-labelledby="methodology-heading"
          className="max-w-3xl mb-12 space-y-4 text-sm sm:text-base text-calm-blue-700 leading-relaxed"
        >
          <h2
            id="methodology-heading"
            className="text-2xl font-semibold text-calm-blue-800"
            style={headlineStyle}
          >
            Methodology, Data Grounding &amp; Scope Boundaries
          </h2>

          <p>
            Every classification in this atlas is derived systematically from
            Clarvia’s {study.totalCountries} canonical{" "}
            <code>domestic-bereavement</code> guides (containing{" "}
            {study.totalVerifiedCitationsIn196Guides.toLocaleString("en-US")}{" "}
            official source citations and{" "}
            {study.totalVerifiedContactsIn196Guides.toLocaleString("en-US")}{" "}
            public-authority contacts within the broader{" "}
            {CORPUS_STATS.canonicalGuides}-guide corpus), cross-checked against
            the official HCCH Status Table for Convention #12 as of{" "}
            <strong>{study.verifySnapshot}</strong>. All 196 rows are
            reproducible from the{" "}
            <a
              href={STUDY_2_CSV_PATH}
              download
              className="underline font-medium text-calm-blue-800"
            >
              downloadable CSV
            </a>
            ,{" "}
            <a
              href={STUDY_2_JSON_PATH}
              download
              className="underline font-medium text-calm-blue-800"
            >
              JSON export
            </a>
            , and{" "}
            <a
              href={GITHUB_STUDY_2_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium text-calm-blue-800"
            >
              open TypeScript module on GitHub
            </a>
            :
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>
                Deterministic statutory coding vs. field-measured burden:
              </strong>{" "}
              This atlas is a comparative coding of enacted statutes, official
              portals, and institutional pathways documented across Clarvia’s
              source-verified guidance corpus rather than an external household
              survey or empirical audit. It classifies legal architecture and
              documented public channels; it does not measure actual processing
              times, civil-registration completeness rates, rural service gaps,
              or informal workarounds (for demographic completeness benchmarks,
              see the UN DESA and Legal Identity Agenda evaluations cited
              below).
            </li>
            <li>
              <strong>
                Federal and sub-national vital-statistics jurisdictions (
                {windowFederal?.count ?? 0} states):
              </strong>{" "}
              Australia, Canada, the Federated States of Micronesia, the United
              Arab Emirates, and the United States delegate death-registration
              windows and filing portals to states, provinces, emirates, or
              island courts. Rather than flattening them to one notional figure,
              this study places all {windowFederal?.count ?? 0} in a dedicated
              sub-national category.
            </li>
            <li>
              <strong>
                Urban vs. rural statutory ranges and burial-permit decoupling:
              </strong>{" "}
              Countries such as Algeria, Mongolia, Nigeria, Suriname, and
              Uruguay distinguish urban or hospital deadlines (often 24 to 72
              hours or 3 working days) from rural windows. Several Latin American
              civil-status statutes (including Brazil and Honduras) permit
              extended registry filing windows in remote areas while sanitary
              burial permits remain required within 24 to 48 hours.
            </li>
            <li>
              <strong>
                Automatic registration vs. automatic downstream propagation:
              </strong>{" "}
              Automatic digital entry (
              <code>{study.automaticDigitalCount}</code> countries) records the
              death in the civil/population register directly from the doctor’s
              electronic notice, whereas automated downstream agency propagation
              (<code>{study.automatedPropagationCount}</code> countries)
              additionally broadcasts that registered death to tax, social
              insurance, or pension agencies (as in Germany, Austria, Belgium,
              South Korea, or the UK’s Tell Us Once system).
            </li>
            <li>
              <strong>
                Conflict-affected and remote registration constraints:
              </strong>{" "}
              Statutory deadlines reflect enacted national law documented in
              Clarvia’s country guides; in jurisdictions experiencing conflict or
              severely constrained hospital/registry access (such as Afghanistan,
              Myanmar, Somalia, South Sudan, Sudan, Syria, and Yemen), families
              often rely on relocated regional hubs or witness-supported
              declarations.
            </li>
            <li>
              <strong>
                Hague Apostille snapshot and February 2027 transition:
              </strong>{" "}
              The {study.apostilleInForceCount} Apostille-in-force figure reflects
              sovereign contracting states where HCCH #12 is actively in force
              in November 2026 (including 2025/2026 entrants Bangladesh, Algeria,
              and Viet Nam). Thailand (<code>{thailandBucket?.count ?? 1}</code>{" "}
              state) deposited its accession on 30 June 2026 and enters into
              force on 28 February 2027; Palestine (<code>PS</code>) and Togo (
              <code>TG</code>) remain outside the live HCCH #12 contracting-party
              table. Individual bilateral Article 12(2) objections (for example
              covering Burundi or Viet Nam) and EU/CIEC exemptions are tracked at
              the bilateral corridor level in{" "}
              <Link
                href="/en/research/cross-border-bereavement-integration-index"
                className="underline font-medium text-calm-blue-800"
              >
                Study 1
              </Link>
              .
            </li>
            <li>
              <strong>Dual CERN Zenodo provenance &amp; guidance boundary:</strong>{" "}
              Clarvia’s underlying 592-guide, 5,396-citation statutory source
              dataset is archived under{" "}
              <a
                href={ZENODO_RECORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-calm-blue-800"
              >
                {ZENODO_STUDY_CORPUS_DOI}
              </a>{" "}
              (distinct from the software archive{" "}
              <a
                href={ZENODO_SOFTWARE_RECORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-calm-blue-800"
              >
                {ZENODO_SOFTWARE_DOI}
              </a>
              ). This atlas compares public administrative frameworks for research
              purposes and does not constitute individualized legal, notarial, or
              probate advice.
            </li>
          </ul>
        </section>

        {/* Reference Sources */}
        <section
          aria-labelledby="sources-heading"
          className="max-w-3xl mb-10"
        >
          <h2
            id="sources-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-3"
            style={headlineStyle}
          >
            International Standards &amp; Treaty References
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-sm text-calm-blue-700">
            {study.referenceSources.map((src) => (
              <li key={src.id}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-calm-blue-800 underline hover:text-calm-blue-900"
                >
                  {src.title}
                </a>{" "}
                <span className="text-calm-blue-600">({src.issuer}).</span>{" "}
                <span className="block text-xs text-calm-blue-500 mt-0.5">
                  {src.scope}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Companion Study Cards */}
        <div className="max-w-3xl mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500">
                Companion Study 1 · 200 Corridors
              </div>
              <p className="font-semibold text-calm-blue-900 mt-0.5">
                Cross-Border Bereavement &amp; Serious Illness Integration Index
                (2026)
              </p>
              <p className="text-sm text-calm-blue-600 mt-1">
                Explore how treaties score across 200 cross-border corridors in
                38 countries.
              </p>
            </div>
            <div>
              <Link
                href={STUDY_1_CANONICAL_URL.replace("https://clarvia.org", "")}
                className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center"
              >
                Read Study 1
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500">
                Companion Study 3 · 196 Countries &amp; 40 Corridors
              </div>
              <p className="font-semibold text-calm-blue-900 mt-0.5">
                Global Atlas of Advance Directives, Incapacity Mandates &amp;
                Cross-Border Portability (2026)
              </p>
              <p className="text-sm text-calm-blue-600 mt-1">
                Advance healthcare directives, continuing powers of attorney,
                caregiver leave, and HCCH #35 reach.
              </p>
            </div>
            <div>
              <Link
                href={STUDY_3_CANONICAL_URL.replace("https://clarvia.org", "")}
                className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center"
              >
                Read Study 3
              </Link>
            </div>
          </div>
        </div>

        {/* 1-Click Citation Box */}
        <div className="max-w-3xl">
          <GuideShareLinkBox
            slug={STUDY_2_SLUG}
            lang="en"
            siteLang="en"
            canonicalUrl={STUDY_2_CANONICAL_URL}
            anchorTitle="Global Post-Death Civil Registration & Estate Administration Atlas (2026)"
            boxId="cite-this-study"
            heading="Cite or link to this atlas"
            body="Policy teams, registries, researchers, civil-society partners, and journalists may freely cite, link to, or reuse this CC BY 4.0 study and 196-country dataset."
            snippetSuffix="Clarvia ASBL (CC BY 4.0, Study DOI: 10.5281/zenodo.24388597)"
            plainTextOverride="Clarvia ASBL & Lindfors, T. (2026). Global Post-Death Civil Registration & Estate Administration Atlas: 196-Country Comparative Study. https://clarvia.org/en/research/global-post-death-civil-registration-atlas (Study DOI: https://doi.org/10.5281/zenodo.24388597; Corpus Dataset: https://zenodo.org/records/24245341; Software archive: https://zenodo.org/records/20572455)"
          />
        </div>

        {/* Support signpost for families */}
        <div className="max-w-3xl mt-10 rounded-xl border border-calm-blue-200 bg-white/75 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-calm-blue-800">
              Looking for practical administrative guidance for your own country?
            </p>
            <p className="text-sm text-calm-blue-600 mt-0.5">
              Read Clarvia’s free step-by-step checklists or send a specific
              question for source-linked guidance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/en/guidance"
              className="btn-secondary px-4 py-2.5 text-sm inline-flex items-center"
            >
              Browse 1,000 guides
            </Link>
            <Link
              href="/ask?lang=en"
              className="btn-primary px-4 py-2.5 text-sm inline-flex items-center"
            >
              Ask Clarvia
            </Link>
          </div>
        </div>
      </main>
      <FooterSection lang="en" />
    </>
  );
}
