import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FooterSection from "../sections/FooterSection";
import { headlineStyle } from "../data";
import { pageMetadata } from "@/lib/page-meta";
import {
  CORPUS_STATS,
  DATA_EUROPA_URL,
  DATA_PUBLIC_LU_URL,
  EC_OSOR_URL,
  GITHUB_REPO_URL,
  STUDY_1_CANONICAL_URL,
  STUDY_1_CSV_PATH,
  STUDY_1_DATA_PUBLIC_LU_URL,
  STUDY_1_JSON_PATH,
  STUDY_1_PDF_PATH,
  STUDY_1_PUBLISHED_DATE,
  STUDY_1_ZENODO_DOI,
  STUDY_1_ZENODO_DOI_URL,
  STUDY_1_ZENODO_RECORD_URL,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  getCrossBorderIntegrationStudy,
} from "@/content/research/cross-border-integration-study";
import {
  STUDY_2_CANONICAL_URL,
  STUDY_2_CSV_PATH,
  STUDY_2_DATA_PUBLIC_LU_URL,
  STUDY_2_JSON_PATH,
  STUDY_2_PDF_PATH,
  STUDY_2_PUBLISHED_DATE,
  STUDY_2_ZENODO_DOI,
  STUDY_2_ZENODO_DOI_URL,
  STUDY_2_ZENODO_RECORD_URL,
  getPostDeathCivilRegistrationStudy,
} from "@/content/research/post-death-civil-registration-study";
import {
  STUDY_3_CANONICAL_URL,
  STUDY_3_CSV_PATH,
  STUDY_3_DATA_PUBLIC_LU_URL,
  STUDY_3_JSON_PATH,
  STUDY_3_PDF_PATH,
  STUDY_3_PUBLISHED_DATE,
  STUDY_3_ZENODO_DOI,
  STUDY_3_ZENODO_DOI_URL,
  STUDY_3_ZENODO_RECORD_URL,
  getAdvanceDirectivesIncapacityStudy,
} from "@/content/research/advance-directives-incapacity-study";

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
  return pageMetadata({
    lang: "en",
    pathAfterLang: "research",
    title: "Public-Interest Cross-Border Administrative Research | Clarvia",
    description:
      "Empirical studies and open datasets examining how bilateral and multilateral treaties reduce cross-border administrative burden during serious illness and bereavement.",
    translated: false,
  });
}

export default async function ResearchHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "en") notFound();

  const study = getCrossBorderIntegrationStudy();
  const study2 = getPostDeathCivilRegistrationStudy();
  const study3 = getAdvanceDirectivesIncapacityStudy();
  const canonicalUrl = "https://clarvia.org/en/research";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://clarvia.org/en",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Research",
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        name: "Clarvia Public-Interest Research",
        url: canonicalUrl,
        inLanguage: "en",
        publisher: { "@id": "https://clarvia.org/#organization" },
        hasPart: [
          {
            "@type": "ScholarlyArticle",
            url: STUDY_1_CANONICAL_URL,
            sameAs: [STUDY_1_ZENODO_DOI_URL, STUDY_1_ZENODO_RECORD_URL],
            headline:
              "Cross-Border Bereavement & Serious Illness Administrative Integration Index (2026)",
            datePublished: STUDY_1_PUBLISHED_DATE,
          },
          {
            "@type": "ScholarlyArticle",
            url: STUDY_2_CANONICAL_URL,
            sameAs: [STUDY_2_ZENODO_DOI_URL, STUDY_2_ZENODO_RECORD_URL],
            headline:
              "Global Post-Death Civil Registration & Estate Administration Atlas (2026)",
            datePublished: STUDY_2_PUBLISHED_DATE,
          },
          {
            "@type": "ScholarlyArticle",
            url: STUDY_3_CANONICAL_URL,
            sameAs: [STUDY_3_ZENODO_DOI_URL, STUDY_3_ZENODO_RECORD_URL],
            headline:
              "Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (2026)",
            datePublished: STUDY_3_PUBLISHED_DATE,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Header lang="en" />
      <main
        id="main-content"
        className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <nav className="text-sm text-calm-blue-500 mb-5" aria-label="Breadcrumb">
          <Link href="/en" className="underline hover:text-calm-blue-800">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-calm-blue-700 font-medium">Research</span>
        </nav>

        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center rounded-full bg-white/80 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-700 mb-4">
            Open Public-Interest Research · CC BY 4.0
          </span>
          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-tight mb-5"
            style={headlineStyle}
          >
            Cross-border administrative interoperability research
          </h1>
          <p className="text-lg text-calm-blue-700 leading-relaxed">
            Derived directly from Clarvia’s{" "}
            {CORPUS_STATS.canonicalGuides.toLocaleString("en-US")}-guide global
            statutory corpus ({CORPUS_STATS.localizedPages.toLocaleString("en-US")}{" "}
            localized pages and{" "}
            {CORPUS_STATS.verifiedOfficialCitations.toLocaleString("en-US")}{" "}
            verified official source citations), these studies quantify how
            international treaties spare families duplicate legalizations,
            parallel court filings, and translation hurdles.
          </p>
        </div>

        <section aria-labelledby="published-studies-heading" className="mb-14">
          <h2
            id="published-studies-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-5"
            style={headlineStyle}
          >
            Published Research
          </h2>

          <article className="glass-panel p-6 sm:p-8 border border-calm-blue-200">
            <div className="flex flex-wrap items-center gap-2 text-xs text-calm-blue-600 mb-3">
              <span className="inline-flex items-center rounded-full bg-calm-blue-50 border border-calm-blue-200 px-2.5 py-0.5 font-semibold text-calm-blue-800">
                Report
              </span>
              <time dateTime={STUDY_1_PUBLISHED_DATE}>18 November 2026</time>
              <span aria-hidden="true">·</span>
              <span>Treaty snapshot: {study.verifySnapshot}</span>
              <span aria-hidden="true">·</span>
              <span>
                {study.totalCorridors} corridors · {study.uniqueCountryCount}{" "}
                countries
              </span>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 mb-3"
              style={headlineStyle}
            >
              <Link
                href="/en/research/cross-border-bereavement-integration-index"
                className="hover:underline"
              >
                Cross-Border Bereavement &amp; Serious Illness Administrative
                Integration Index (2026)
              </Link>
            </h3>

            <p className="text-base text-calm-blue-700 leading-relaxed mb-6">
              A 4-bridge treaty evaluation across {study.bereavementCount}{" "}
              bereavement corridors and {study.terminalCount} serious &amp;
              terminal illness corridors. Documents where the 1961 Hague
              Apostille Convention ({study.apostilleOrExemptPct}% reach today)
              already relieves families, and how targeted mutual treaties
              (succession rules, 2000 Hague Adult Protection, and corpse
              laissez-passer agreements) lift corridor integration from{" "}
              {study.cohorts
                .find((c) => c.id === "other_global")
                ?.meanScore.toFixed(2)}{" "}
              to{" "}
              {study.cohorts
                .find((c) => c.id === "intra_eu_efta")
                ?.meanScore.toFixed(2)}{" "}
              out of 4.00.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study.overallMeanScore.toFixed(2)} / 4.00
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Global corridor mean score
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study.apostilleOrExemptPct.toFixed(1)}%
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Apostille or full exemption ({study.apostilleOrExemptCount}/
                  {study.totalCorridors})
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study.terminalGapPct.toFixed(1)}%
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Incapacity corridors outside HCCH #35
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study.totalVerifiedCitationsInStudyCorridors.toLocaleString(
                    "en-US",
                  )}
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Official citations across 200 guides
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/en/research/cross-border-bereavement-integration-index"
                className="btn-primary px-6 py-3 text-sm sm:text-base inline-flex items-center"
              >
                Read report &amp; inspect all 200 corridors
              </Link>
              <a
                href={STUDY_1_PDF_PATH}
                download
                aria-label="Download PDF: Cross-Border Bereavement and Serious Illness Integration Index (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download PDF
              </a>
              <a
                href={STUDY_1_CSV_PATH}
                download
                aria-label="Download CSV: Cross-Border Bereavement and Serious Illness Integration Index (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download CSV
              </a>
              <a
                href={STUDY_1_JSON_PATH}
                download
                aria-label="Download JSON: Cross-Border Bereavement and Serious Illness Integration Index (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download JSON
              </a>
            </div>
          </article>

          <article className="glass-panel p-6 sm:p-8 border border-calm-blue-200 mt-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-calm-blue-600 mb-3">
              <span className="inline-flex items-center rounded-full bg-calm-blue-50 border border-calm-blue-200 px-2.5 py-0.5 font-semibold text-calm-blue-800">
                Report
              </span>
              <time dateTime={STUDY_2_PUBLISHED_DATE}>18 November 2026</time>
              <span aria-hidden="true">·</span>
              <span>Corpus snapshot: {study2.verifySnapshot}</span>
              <span aria-hidden="true">·</span>
              <span>
                {study2.totalCountries} countries · {study2.macroRegionCount}{" "}
                regions
              </span>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 mb-3"
              style={headlineStyle}
            >
              <Link
                href="/en/research/global-post-death-civil-registration-atlas"
                className="hover:underline"
              >
                Global Post-Death Civil Registration &amp; Estate Administration
                Atlas (2026)
              </Link>
            </h3>

            <p className="text-base text-calm-blue-700 leading-relaxed mb-6">
              A 196-country comparative atlas examining statutory death
              registration deadlines, electronic health-to-registry reporting (
              {study2.automaticDigitalCount} states with fully automatic entry;{" "}
              {study2.digitalFilingPct.toFixed(1)}% offering digital or e-portal
              filing), once-only agency propagation (
              {study2.automatedPropagationPct.toFixed(1)}% vs.{" "}
              {study2.manualPropagationPct.toFixed(1)}% manual), estate
              gatekeeper models, and 1961 Hague Apostille reach (
              {study2.apostilleInForcePct.toFixed(1)}%).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study2.automaticDigitalCount} / {study2.totalCountries}
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Automatic digital registration ({study2.automaticDigitalPct.toFixed(1)}%)
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study2.manualPropagationPct.toFixed(1)}%
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Manual agency notifications ({study2.manualPropagationCount}/
                  {study2.totalCountries})
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study2.apostilleInForcePct.toFixed(1)}%
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  1961 Hague Apostille in force ({study2.apostilleInForceCount}/
                  {study2.totalCountries})
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study2.totalVerifiedCitationsIn196Guides.toLocaleString(
                    "en-US",
                  )}
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Official citations across 196 guides
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/en/research/global-post-death-civil-registration-atlas"
                className="btn-primary px-6 py-3 text-sm sm:text-base inline-flex items-center"
              >
                Read report &amp; inspect all 196 countries
              </Link>
              <a
                href={STUDY_2_PDF_PATH}
                download
                aria-label="Download PDF: Global Post-Death Civil Registration and Estate Administration Atlas (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download PDF
              </a>
              <a
                href={STUDY_2_CSV_PATH}
                download
                aria-label="Download CSV: Global Post-Death Civil Registration and Estate Administration Atlas (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download CSV
              </a>
              <a
                href={STUDY_2_JSON_PATH}
                download
                aria-label="Download JSON: Global Post-Death Civil Registration and Estate Administration Atlas (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download JSON
              </a>
            </div>
          </article>

          <article className="glass-panel p-6 sm:p-8 border border-calm-blue-200 mt-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-calm-blue-600 mb-3">
              <span className="inline-flex items-center rounded-full bg-calm-blue-50 border border-calm-blue-200 px-2.5 py-0.5 font-semibold text-calm-blue-800">
                Report
              </span>
              <time dateTime={STUDY_3_PUBLISHED_DATE}>18 November 2026</time>
              <span aria-hidden="true">·</span>
              <span>Treaty snapshot: {study3.verifySnapshot}</span>
              <span aria-hidden="true">·</span>
              <span>
                {study3.totalCountries} countries · {study3.totalCorridors}{" "}
                corridors
              </span>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 mb-3"
              style={headlineStyle}
            >
              <Link
                href="/en/research/global-advance-directives-incapacity-mandates-atlas"
                className="hover:underline"
              >
                Global Atlas of Advance Directives, Incapacity Mandates &amp;
                Cross-Border Portability (2026)
              </Link>
            </h3>

            <p className="text-base text-calm-blue-700 leading-relaxed mb-6">
              A 196-country and 40-corridor comparative atlas examining binding
              advance healthcare directives ({study3.bindingStatutoryAhdPct.toFixed(1)}%
              statutory reach; {study3.nationalAhdRegisterPct.toFixed(1)}% with
              a national registry or e-health lookup), incapacity mandate
              continuity ({study3.continuingPoaPct.toFixed(1)}% continuing PoAs
              and {study3.voluntaryGuardianOrSupportPct.toFixed(1)}% voluntary
              guardianship or CRPD support deeds vs.{" "}
              {study3.ordinaryPoaLapsesPct.toFixed(1)}% where ordinary mandates
              lapse), family caregiver leave ({study3.paidCaregiverLeavePct.toFixed(1)}%
              paid), and the {study3.corridorApostilleVsPortabilityGapPts.toFixed(1)}
              -percentage-point gap between Hague Apostille authentication (
              {study3.corridorMutualApostillePct.toFixed(1)}%) and mutual
              nationwide HCCH #35 recognition (
              {study3.corridorMutualHcch35Pct.toFixed(1)}%).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study3.nationalAhdRegisterCount} / {study3.totalCountries}
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  National AHD registry ({study3.nationalAhdRegisterPct.toFixed(1)}%)
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study3.ordinaryPoaLapsesPct.toFixed(1)}%
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Ordinary PoA lapses on incapacity ({study3.ordinaryPoaLapsesCount}/
                  {study3.totalCountries})
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study3.corridorMutualHcch35Count} / {study3.totalCorridors}
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Mutual nationwide HCCH #35 ({study3.corridorMutualHcch35Pct.toFixed(1)}%)
                </div>
              </div>
              <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-3.5">
                <div className="text-xl font-semibold text-calm-blue-900 tabular-nums">
                  {study3.totalVerifiedCitationsCombined.toLocaleString("en-US")}
                </div>
                <div className="text-xs text-calm-blue-600 mt-0.5">
                  Official citations across 236 guides
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/en/research/global-advance-directives-incapacity-mandates-atlas"
                className="btn-primary px-6 py-3 text-sm sm:text-base inline-flex items-center"
              >
                Read report &amp; inspect all 196 countries
              </Link>
              <a
                href={STUDY_3_PDF_PATH}
                download
                aria-label="Download PDF: Global Atlas of Advance Directives, Incapacity Mandates and Cross-Border Portability (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download PDF
              </a>
              <a
                href={STUDY_3_CSV_PATH}
                download
                aria-label="Download CSV: Global Atlas of Advance Directives, Incapacity Mandates and Cross-Border Portability (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download CSV
              </a>
              <a
                href={STUDY_3_JSON_PATH}
                download
                aria-label="Download JSON: Global Atlas of Advance Directives, Incapacity Mandates and Cross-Border Portability (2026)"
                className="btn-secondary px-4 py-3 text-sm inline-flex items-center"
              >
                Download JSON
              </a>
            </div>
          </article>
        </section>

        <section aria-labelledby="open-registries-heading" className="mb-12">
          <h2
            id="open-registries-heading"
            className="text-2xl font-semibold text-calm-blue-800 mb-3"
            style={headlineStyle}
          >
            Archived Open Datasets &amp; Public Registries
          </h2>
          <p className="text-base text-calm-blue-600 leading-relaxed mb-5 max-w-3xl">
            Every study draws on Clarvia’s openly inspectable public datasets
            and standards-aligned workflow infrastructure (CPSV-AP, CCCEV,
            ELI, PROV-O).
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li className="rounded-xl border border-calm-blue-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500 mb-1">
                CERN Zenodo (Dataset {ZENODO_STUDY_CORPUS_DOI})
              </div>
              <a
                href={ZENODO_RECORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-calm-blue-800 underline hover:text-calm-blue-900"
              >
                Clarvia Global Statutory Source &amp; Reference Dataset (CC BY 4.0)
              </a>
              <p className="text-xs text-calm-blue-600 mt-1">
                Archived JSON &amp; CSV dataset covering 592 canonical guides and
                5,396 official citations (separate from Clarvia’s software archive{" "}
                <a
                  href={ZENODO_SOFTWARE_RECORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  {ZENODO_SOFTWARE_DOI}
                </a>
                ). Individual Working Paper &amp; dataset DOIs:{" "}
                <a
                  href={STUDY_1_ZENODO_RECORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Study 1 ({STUDY_1_ZENODO_DOI})
                </a>
                ,{" "}
                <a
                  href={STUDY_2_ZENODO_RECORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Study 2 ({STUDY_2_ZENODO_DOI})
                </a>
                , and{" "}
                <a
                  href={STUDY_3_ZENODO_RECORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Study 3 ({STUDY_3_ZENODO_DOI})
                </a>
                .
              </p>
            </li>
            <li className="rounded-xl border border-calm-blue-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500 mb-1">
                European Commission OSOR
              </div>
              <a
                href={EC_OSOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-calm-blue-800 underline hover:text-calm-blue-900"
              >
                Interoperable Europe Open Source Observatory Solution
              </a>
              <p className="text-xs text-calm-blue-600 mt-1">
                Reviewed public-sector open-source registry entry for Clarvia’s
                CPSV-AP consequence graph.
              </p>
            </li>
            <li className="rounded-xl border border-calm-blue-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500 mb-1">
                European Union Open Data Portal
              </div>
              <a
                href={DATA_EUROPA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-calm-blue-800 underline hover:text-calm-blue-900"
              >
                data.europa.eu: Bereavement Source Register (DCAT-AP)
              </a>
              <p className="text-xs text-calm-blue-600 mt-1">
                Harvested via{" "}
                <a
                  href={DATA_PUBLIC_LU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Luxembourg Open Data (data.public.lu)
                </a>{" "}
                across official European portals. Comparative study datasets on
                data.public.lu:{" "}
                <a
                  href={STUDY_1_DATA_PUBLIC_LU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Study 1
                </a>
                ,{" "}
                <a
                  href={STUDY_2_DATA_PUBLIC_LU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Study 2
                </a>
                , and{" "}
                <a
                  href={STUDY_3_DATA_PUBLIC_LU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-calm-blue-800"
                >
                  Study 3
                </a>
                .
              </p>
            </li>
            <li className="rounded-xl border border-calm-blue-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-calm-blue-500 mb-1">
                Source Code &amp; Validation Tests
              </div>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-calm-blue-800 underline hover:text-calm-blue-900"
              >
                github.com/clarvia-org/clarvia-graph
              </a>
              <p className="text-xs text-calm-blue-600 mt-1">
                Every score calculation and cross-check test runs openly in CI.
              </p>
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-calm-blue-200 bg-white/75 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-calm-blue-800">
              Looking for practical guidance for a family today?
            </p>
            <p className="text-sm text-calm-blue-600 mt-0.5">
              Browse 1,000 free source-linked guides or ask a specific question
              via Ask Clarvia.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/en/guidance"
              className="btn-secondary px-4 py-2.5 text-sm inline-flex items-center"
            >
              Browse guidance library
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
