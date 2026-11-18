import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";
import GuideShareLinkBox from "../../guide/[slug]/GuideShareLinkBox";
import CorridorIntegrationTable from "./CorridorIntegrationTable";
import {
  CORPUS_STATS,
  GITHUB_STUDY_SOURCE_URL,
  STUDY_1_CANONICAL_URL,
  STUDY_1_CSV_PATH,
  STUDY_1_JSON_PATH,
  STUDY_1_PUBLISHED_DATE,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
  getCrossBorderIntegrationStudy,
} from "@/content/research/cross-border-integration-study";

const PAGE_TITLE =
  "Cross-Border Bereavement & Serious Illness Administrative Integration Index (2026) | Clarvia";
const PAGE_DESCRIPTION =
  "A 4-bridge treaty analysis of 200 bilateral corridors across 38 countries showing how multilateral and bilateral integration reduces duplicate family formalities.";

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
      canonical: STUDY_1_CANONICAL_URL,
    },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: STUDY_1_CANONICAL_URL,
      siteName: "Clarvia",
      locale: "en",
      type: "article",
      publishedTime: STUDY_1_PUBLISHED_DATE,
      images: [
        { url: "https://clarvia.org/og-image.png", width: 1200, height: 630 },
      ],
    },
  };
}

export default async function CrossBorderIntegrationIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "en") notFound();

  const study = getCrossBorderIntegrationStudy();
  const intraEuCohort = study.cohorts.find((c) => c.id === "intra_eu_efta");
  const otherGlobalCohort = study.cohorts.find((c) => c.id === "other_global");
  const exemptBridge1 = study.bridge1Distribution.find(
    (b) => b.code === "exempt_from_legalization",
  );
  const apostilleBridge1 = study.bridge1Distribution.find(
    (b) => b.code === "hague_apostille",
  );
  const consularBridge1 = study.bridge1Distribution.find(
    (b) => b.code === "consular_legalization",
  );
  const euSuccessionBucket = study.bridge2BereavementDistribution.find(
    (b) => b.code === "eu_650_ecs",
  );
  const cwResealBucket = study.bridge2BereavementDistribution.find(
    (b) => b.code === "commonwealth_reseal",
  );
  const hcchFullBucket = study.bridge2TerminalDistribution.find(
    (b) => b.code === "hcch_2000_adults",
  );
  const hcchScotlandBucket = study.bridge2TerminalDistribution.find(
    (b) => b.code === "hcch_2000_scotland_only",
  );
  const repatTreatyBucket = study.bridge3Distribution.find(
    (b) => b.code === "multilateral_laissez_passer",
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
            name: "Cross-Border Administrative Integration Index (2026)",
            item: STUDY_1_CANONICAL_URL,
          },
        ],
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${STUDY_1_CANONICAL_URL}#article`,
        headline:
          "Cross-Border Bereavement & Serious Illness Administrative Integration Index (2026)",
        description: PAGE_DESCRIPTION,
        url: STUDY_1_CANONICAL_URL,
        inLanguage: "en",
        datePublished: study.publishedDate,
        dateModified: study.publishedDate,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isBasedOn: ZENODO_STUDY_CORPUS_DOI_URL,
        sameAs: ZENODO_STUDY_CORPUS_DOI_URL,
        author: { "@id": "https://clarvia.org/#organization" },
        publisher: { "@id": "https://clarvia.org/#organization" },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": STUDY_1_CANONICAL_URL,
        },
        citation: study.depositarySources.map((src) => ({
          "@type": "CreativeWork",
          name: src.title,
          publisher: { "@type": "Organization", name: src.issuer },
          url: src.url,
        })),
      },
      {
        "@type": "Dataset",
        "@id": `${STUDY_1_CANONICAL_URL}#dataset`,
        name: "Clarvia 200-Corridor Cross-Border Bereavement & Serious Illness Administrative Integration Dataset (November 2026)",
        description:
          "4-bridge treaty interoperability scoring across 200 bilateral corridors (160 bereavement and 40 serious/terminal illness corridors) covering 38 jurisdictions.",
        url: STUDY_1_CANONICAL_URL,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isBasedOn: ZENODO_STUDY_CORPUS_DOI_URL,
        sameAs: [ZENODO_RECORD_URL, ZENODO_STUDY_CORPUS_DOI_URL],
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "text/csv",
            contentUrl: `https://clarvia.org${STUDY_1_CSV_PATH}`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `https://clarvia.org${STUDY_1_JSON_PATH}`,
          },
        ],
        creator: { "@id": "https://clarvia.org/#organization" },
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
            Integration Index (2026)
          </span>
        </nav>

        <header className="max-w-3xl mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-white/85 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-800">
              Research Report · {study.totalCorridors} Corridors ·{" "}
              {study.uniqueCountryCount} Countries
            </span>
            <time
              dateTime={study.publishedDate}
              className="inline-flex items-center rounded-full bg-white/85 border border-calm-blue-200 px-3 py-1 text-xs font-medium text-calm-blue-600"
            >
              Published 18 November 2026 · Treaty status:{" "}
              {study.verifySnapshot}
            </time>
            <a
              href={ZENODO_RECORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-calm-blue-50 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-700 hover:bg-calm-blue-100"
            >
              Dataset DOI: {ZENODO_STUDY_CORPUS_DOI} · CC BY 4.0
            </a>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
            style={headlineStyle}
          >
            Cross-Border Bereavement &amp; Serious Illness Administrative
            Integration Index (2026)
          </h1>

          <p className="text-lg text-calm-blue-700 leading-relaxed">
            How bilateral and multilateral treaties spare families duplicate
            legalizations, parallel court proceedings, and border delays across{" "}
            {study.totalCorridors} international corridors, and where
            cross-border legal integration remains unfinished.
          </p>
        </header>

        {/* Direct Raw Data Downloads & Open Verification */}
        <div
          aria-label="Reproducible dataset downloads and source code"
          className="mb-10 rounded-xl border border-calm-blue-200 bg-white/80 p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <span className="text-xs sm:text-sm font-semibold text-calm-blue-800">
            Inspect or verify all {study.totalCorridors} corridor rows directly:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={STUDY_1_CSV_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download CSV ({study.totalCorridors} rows)
            </a>
            <a
              href={STUDY_1_JSON_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download JSON
            </a>
            <a
              href={GITHUB_STUDY_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-200 bg-calm-blue-50/70 hover:bg-calm-blue-100 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              View scoring code on GitHub
            </a>
            <a
              href={ZENODO_RECORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-200 bg-calm-blue-50/70 hover:bg-calm-blue-100 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              592-guide Zenodo archive
            </a>
          </div>
        </div>

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
                {study.overallMeanScore.toFixed(2)} / 4.00
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Global Mean Integration Score
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                {intraEuCohort?.count} Intra-EU/Switzerland corridors average{" "}
                <strong>{intraEuCohort?.meanScore.toFixed(2)}</strong> vs.{" "}
                <strong>{otherGlobalCohort?.meanScore.toFixed(2)}</strong> across{" "}
                {otherGlobalCohort?.count} non-regional corridors, reflecting
                stacked multilateral treaties in force.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.apostilleOrExemptPct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Document Legalization Relief
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                {study.apostilleOrExemptCount} of {study.totalCorridors}{" "}
                corridors avoid multi-embassy legalization ({exemptBridge1?.pct}
                % fully exempt; {apostilleBridge1?.pct}% single-stamp Apostille),
                rising to <strong>{study.postFeb2027ApostilleOrExemptPct.toFixed(1)}%</strong>{" "}
                on 28 February 2027 when Thailand joins HCCH #12.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.terminalGapPct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Adult Incapacity Treaty Gap
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                On {study.terminalGapCount} of {study.terminalCount} serious &amp;
                terminal illness corridors, Powers of Attorney lack mutual
                HCCH 2000 coverage, compared with{" "}
                {study.bereavementParallelEstatePct.toFixed(1)}% (
                {study.bereavementParallelEstateCount}/{study.bereavementCount})
                of bereavement corridors needing parallel domestic probate.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.repatriationGapPct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Consular Repatriation Clearance
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                {repatTreatyBucket?.count} of {study.totalCorridors} corridors (
                {repatTreatyBucket?.pct}%) use a multilateral corpse
                laissez-passer (Strasbourg 1973 / Berlin 1937);{" "}
                {study.repatriationGapCount} rely on bilateral consular mortuary
                permits.
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
            Why bilateral &amp; multilateral integration is the medicine
          </h2>

          <p>
            When someone becomes gravely ill or dies in a country different from
            their nationality or family home, families immediately interface
            with <strong>two sovereign legal systems at once</strong>. Lower
            scores in this index do not reflect shortcomings inside individual
            national ministries; even the best-run domestic civil registry cannot
            unilaterally waive another state’s recognition rules. Friction only
            disappears when two governments connect their legal systems through
            mutual treaties and interoperable forms.
          </p>

          <p>
            Evaluating all {study.totalCorridors} cross-border guides in
            Clarvia’s corpus (backed by{" "}
            {study.totalVerifiedCitationsInStudyCorridors.toLocaleString(
              "en-US",
            )}{" "}
            verified official source links within these corridors and{" "}
            {CORPUS_STATS.verifiedOfficialCitations.toLocaleString("en-US")}{" "}
            across the full {CORPUS_STATS.canonicalGuides}-guide corpus) shows
            two clear lessons for public-interest policymakers and consular
            services:
          </p>

          <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-5 space-y-3">
            <h3 className="text-lg font-semibold text-calm-blue-800">
              Three practical policy levers proven by the data
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base text-calm-blue-700">
              <li>
                <strong>
                  Multilateral document legalization works at near-global scale:
                </strong>{" "}
                The 1961 Hague Apostille Convention ({apostilleBridge1?.count}{" "}
                corridors) plus EU/CIEC/bilateral exemptions (
                {exemptBridge1?.count} corridors) already shield families on{" "}
                {study.apostilleOrExemptPct.toFixed(1)}% of studied corridors
                from multi-embassy chains. Recent accessions by Canada (2024)
                and Thailand (deposited 30 June 2026; entering into force 28
                February 2027) demonstrate how single accessions eliminate
                consular bottlenecks for millions of mobile citizens overnight.
              </li>
              <li>
                <strong>
                  Advancing the 2000 Hague Adults Convention closes an urgent
                  living-patient gap:
                </strong>{" "}
                Only {hcchFullBucket?.count} of {study.terminalCount} studied
                incapacity corridors have mutual HCCH #35 protection in force (plus{" "}
                {hcchScotlandBucket?.count} corridors with Scotland-only UK
                application). Extending ratification among signatory EU and
                non-EU states allows pre-signed healthcare directives and
                Powers of Attorney to work across borders without emergency
                guardianship petitions.
              </li>
              <li>
                <strong>
                  Standardized multilingual extracts and reciprocal probate
                  frameworks spare grieving households duplicate translation and
                  court costs:
                </strong>{" "}
                Combining Regulation (EU) No 650/2012 ({euSuccessionBucket?.count}{" "}
                bereavement corridors) or Commonwealth probate resealing (
                {cwResealBucket?.count} bereavement corridors) with
                translation-exempt civil-status extracts shows how interoperable
                legal instruments turn multi-month cross-border duplication into
                predictable administration.
              </li>
            </ol>
          </div>
        </section>

        {/* Cohort & Bridge Breakdown Tables */}
        <section
          aria-labelledby="summary-tables-heading"
          className="mb-14 space-y-8"
        >
          <h2
            id="summary-tables-heading"
            className="text-2xl font-semibold text-calm-blue-800"
            style={headlineStyle}
          >
            Empirical Summary by Regional Cohort &amp; Treaty Bridge
          </h2>

          <div
            role="region"
            aria-labelledby="cohort-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="cohort-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 1. Mean Cross-Border Integration Score (0.00–4.00) by
                Institutional &amp; Treaty Cohort
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Corridor Cohort
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Corridors
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Mean Score (/ 4.00)
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Defining Treaty Mechanics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.cohorts.map((cohort) => (
                  <tr key={cohort.id} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-calm-blue-800 align-top whitespace-nowrap"
                    >
                      {cohort.label}
                    </th>
                    <td className="px-4 py-3 text-calm-blue-700 align-top tabular-nums">
                      {cohort.count}
                    </td>
                    <td className="px-4 py-3 font-semibold text-calm-blue-900 align-top tabular-nums">
                      {cohort.meanScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-calm-blue-600 align-top leading-snug">
                      {cohort.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            role="region"
            aria-labelledby="bridge-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="bridge-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 2. Corridor Distribution Across All Four Integration
                Bridges ({study.totalCorridors} Corridors)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Bridge &amp; Instrument Tier
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Points
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Corridors
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.bridge1Distribution.map((b) => (
                  <tr key={`b1-${b.code}`}>
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800"
                    >
                      <span className="font-semibold">Bridge 1 (Docs):</span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.scoreValue.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800">
                      {b.count} / {study.totalCorridors}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {study.bridge2BereavementDistribution.map((b) => (
                  <tr key={`b2b-${b.code}`}>
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800"
                    >
                      <span className="font-semibold">
                        Bridge 2 (Estate, Bereavement):
                      </span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.scoreValue.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800">
                      {b.count} / {study.bereavementCount}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {study.bridge2TerminalDistribution.map((b) => (
                  <tr key={`b2t-${b.code}`}>
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800"
                    >
                      <span className="font-semibold">
                        Bridge 2 (Incapacity, Serious Illness):
                      </span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.scoreValue.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800">
                      {b.count} / {study.terminalCount}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {study.bridge3Distribution.map((b) => (
                  <tr key={`b3-${b.code}`}>
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800"
                    >
                      <span className="font-semibold">
                        Bridge 3 (Repatriation):
                      </span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.scoreValue.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800">
                      {b.count} / {study.totalCorridors}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {study.bridge4Distribution.map((b) => (
                  <tr key={`b4-${b.code}`}>
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800"
                    >
                      <span className="font-semibold">Bridge 4 (Language):</span>{" "}
                      {b.label}
                    </th>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.scoreValue.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-calm-blue-800">
                      {b.count} / {study.totalCorridors}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-700">
                      {b.pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Interactive 200-Corridor Dataset Table */}
        <CorridorIntegrationTable
          rows={study.rows}
          countries={study.countries}
        />

        {/* Methodology, Rubric & Important Legal Caveats */}
        <section
          aria-labelledby="methodology-heading"
          className="max-w-3xl mb-12 space-y-4 text-sm sm:text-base text-calm-blue-700 leading-relaxed"
        >
          <h2
            id="methodology-heading"
            className="text-2xl font-semibold text-calm-blue-800"
            style={headlineStyle}
          >
            Methodology, Scoring Rubric &amp; Legal Scope Notes
          </h2>

          <p>
            Each corridor is scored directly from primary international treaty
            status tables as of <strong>{study.verifySnapshot}</strong> and
            Clarvia’s verified statutory guide registry (across{" "}
            {study.uniqueCountryCount} unique jurisdictions and{" "}
            {study.uniquePairCount} unique country pairs), with every row
            exported to the{" "}
            <a
              href={STUDY_1_CSV_PATH}
              download
              className="underline font-medium text-calm-blue-800"
            >
              downloadable CSV
            </a>{" "}
            and{" "}
            <a
              href={STUDY_1_JSON_PATH}
              download
              className="underline font-medium text-calm-blue-800"
            >
              JSON files
            </a>{" "}
            and checked by automated tests in the{" "}
            <a
              href={GITHUB_STUDY_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium text-calm-blue-800"
            >
              public repository
            </a>
            :
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>
                Why bereavement ({study.bereavementCount}) and serious/terminal
                illness ({study.terminalCount}) differ on Bridges 1 &amp; 2:
              </strong>{" "}
              Regulation (EU) 2016/1191 and CIEC Convention No. 16 exempt civil
              status death certificates from Apostilles, whereas private Powers
              of Attorney and Advance Directives prepared during serious illness
              generally still rely on notarization, the 1961 Hague Apostille,
              or separate local execution. Accordingly, serious and terminal
              illness corridors carry their own Bridge 2 framework under the
              2000 Hague Protection of Adults Convention (HCCH #35).
            </li>
            <li>
              <strong>
                Non-cremated remains vs. cremated ashes and serious-illness
                contingency planning:
              </strong>{" "}
              Both the 1973 Strasbourg Agreement (ETS No. 080, Art. 1(2)) and the
              1937 Berlin Arrangement govern international transport of
              non-cremated human remains (sealed coffins), while cremated ashes
              follow lighter national border rules. Serious and terminal illness
              guides ({study.terminalCount} corridors) retain Bridge 3 scoring
              because Step 5 of each guide covers advance funeral and
              repatriation planning.
            </li>
            <li>
              <strong>
                Sub-national and territorial scope caveats:
              </strong>{" "}
              The United Kingdom ratified HCCH #35 solely in respect of{" "}
              <strong>Scotland</strong> (scored <code>0.5</code> when paired
              with a full contracting party because England, Wales, and Northern
              Ireland remain outside treaty force). Similarly,{" "}
              <strong>Ireland</strong> did not opt in to Regulation (EU) No
              650/2012, and Commonwealth probate resealing reflects common-law
              provinces/states (civil-law Quebec follows separate validation rules).
            </li>
            <li>
              <strong>
                Formal treaty status vs. administrative practice:
              </strong>{" "}
              Scores measure binding international instruments in force rather
              than informal administrative discretion. For example, between the
              United Kingdom and Ireland outside the EU, the 1961 Hague Apostille
              Convention (<code>0.5</code>) is the formal public-document treaty
              in force, even though registries and banks across the Common
              Travel Area routinely accept original English-language civil
              certificates without requesting an Apostille.
            </li>
            <li>
              <strong>
                Multilingual jurisdictions and real-world document languages:
              </strong>{" "}
              Bridge 4 scores overlapping national or co-official languages
              (including multilingual states such as Belgium, Canada, India,
              Luxembourg, Singapore, South Africa, and Switzerland); in
              practice, individual regional civil registries or deeds issued in a
              non-shared official language (e.g., an Italian-language Swiss
              certificate sent to France) may still require translation unless
              issued on CIEC Form C.
            </li>
            <li>
              <strong>Active treaty transitions tracked in this snapshot:</strong>{" "}
              Thailand acceded to the 1961 Hague Apostille Convention on{" "}
              <strong>30 June 2026</strong>, with entry into force scheduled for{" "}
              <strong>28 February 2027</strong>. Until entry into force,
              Thailand corridors ({study.thailandFeb2027Count} corridors in this
              index) still require full MFA and embassy legalization (
              <code>{consularBridge1?.count}</code> total consular-bridge
              corridors alongside the United Arab Emirates and Egypt). Germany
              withdrew its Article 12(2) objection to Ukraine in 2010, leaving
              Apostilles active on <code>DE ↔ UA</code> corridors.
            </li>
            <li>
              <strong>Clarvia’s two CERN Zenodo identifiers:</strong> Clarvia
              maintains two distinct Zenodo archives: the open-source monorepo
              software release archive{" "}
              <a
                href={ZENODO_SOFTWARE_RECORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-calm-blue-800"
              >
                {ZENODO_SOFTWARE_DOI}
              </a>{" "}
              (archived June 2026) and the global 592-guide, 5,396-citation
              statutory source dataset{" "}
              <a
                href={ZENODO_RECORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-calm-blue-800"
              >
                {ZENODO_STUDY_CORPUS_DOI}
              </a>{" "}
              (archived 15 November 2026). Both identifiers are cross-referenced
              below.
            </li>
            <li>
              <strong>Administrative guidance boundary:</strong> This index
              measures public-law treaty architecture for research and policy
              comparison. It does not constitute legal, notarial, tax, or
              succession advice for an individual estate or incapacity case.
            </li>
          </ul>
        </section>

        {/* Primary Treaty Depositaries */}
        <section
          aria-labelledby="sources-heading"
          className="max-w-3xl mb-10"
        >
          <h2
            id="sources-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-3"
            style={headlineStyle}
          >
            Primary Treaty Depositaries &amp; Underlying Data Sources
          </h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-sm text-calm-blue-700">
            {study.depositarySources.map((src) => (
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

        {/* 1-Click Citation Box */}
        <div className="max-w-3xl">
          <GuideShareLinkBox
            slug="cross-border-bereavement-integration-index"
            lang="en"
            siteLang="en"
            canonicalUrl={STUDY_1_CANONICAL_URL}
            anchorTitle="Cross-Border Bereavement & Serious Illness Administrative Integration Index (2026)"
            boxId="cite-this-study"
            heading="Cite or link to this study"
            body="Policy teams, consulates, researchers, civil-society partners, and journalists may freely cite, link to, or reuse this CC BY 4.0 study and 200-corridor dataset."
            snippetSuffix="Clarvia ASBL (CC BY 4.0, Dataset DOI: 10.5281/zenodo.24245341)"
            plainTextOverride="Clarvia ASBL (2026). Cross-Border Bereavement & Serious Illness Administrative Integration Index: Treaty Interoperability Across 200 Bilateral Corridors. https://clarvia.org/en/research/cross-border-bereavement-integration-index (Dataset: https://zenodo.org/records/24245341; Software archive: https://zenodo.org/records/20572455)"
          />
        </div>

        {/* Support signpost for families */}
        <div className="max-w-3xl mt-10 rounded-xl border border-calm-blue-200 bg-white/75 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-calm-blue-800">
              Navigating a cross-border serious illness or bereavement right now?
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
