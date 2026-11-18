import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FooterSection from "../../sections/FooterSection";
import { headlineStyle } from "../../data";
import GuideShareLinkBox from "../../guide/[slug]/GuideShareLinkBox";
import AdvanceDirectivesAtlasTable from "./AdvanceDirectivesAtlasTable";
import {
  CORPUS_STATS,
  GITHUB_STUDY_3_SOURCE_URL,
  MACRO_REGION_ORDER,
  STUDY_3_CANONICAL_URL,
  STUDY_3_CSV_PATH,
  STUDY_3_JSON_PATH,
  STUDY_3_PUBLISHED_DATE,
  STUDY_3_SLUG,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
  getAdvanceDirectivesIncapacityStudy,
} from "@/content/research/advance-directives-incapacity-study";
import { STUDY_1_CANONICAL_URL } from "@/content/research/cross-border-integration-study";
import { STUDY_2_CANONICAL_URL } from "@/content/research/post-death-civil-registration-study";

const PAGE_TITLE =
  "Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (2026) | Clarvia";
const PAGE_DESCRIPTION =
  "A 196-country and 40-corridor comparative atlas of statutory advance healthcare directives, continuing powers of attorney, family caregiver protections, and the 2000 Hague Protection of Adults Convention.";

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
      canonical: STUDY_3_CANONICAL_URL,
    },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: STUDY_3_CANONICAL_URL,
      siteName: "Clarvia",
      locale: "en",
      type: "article",
      publishedTime: STUDY_3_PUBLISHED_DATE,
      images: [
        { url: "https://clarvia.org/og-image.png", width: 1200, height: 630 },
      ],
    },
  };
}

export default async function GlobalAdvanceDirectivesIncapacityMandatesAtlasPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "en") notFound();

  const study = getAdvanceDirectivesIncapacityStudy();
  const localStatutoryAhdBucket = study.advanceDirectiveDistribution.find(
    (d) => d.code === "binding_statute_local_or_subnational",
  );
  const patientsRightsBucket = study.advanceDirectiveDistribution.find(
    (d) => d.code === "patients_rights_or_clinical_framework",
  );
  const generalConsentBucket = study.advanceDirectiveDistribution.find(
    (d) => d.code === "general_consent_or_family_consultation",
  );
  const carerAllowanceBucket = study.caregiverProtectionDistribution.find(
    (d) => d.code === "carer_allowance_or_job_protected_leave",
  );
  const signedHcch35Bucket = study.hcch35Distribution.find(
    (d) => d.code === "signed_not_ratified",
  );
  const oneSidedCorridorBucket = study.corridorPortabilityDistribution.find(
    (d) => d.code === "one_sided_party",
  );
  const neitherCorridorBucket = study.corridorPortabilityDistribution.find(
    (d) => d.code === "neither_party",
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
            name: "Global Advance Directives & Incapacity Mandates Atlas (2026)",
            item: STUDY_3_CANONICAL_URL,
          },
        ],
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${STUDY_3_CANONICAL_URL}#article`,
        headline:
          "Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (2026)",
        description: PAGE_DESCRIPTION,
        url: STUDY_3_CANONICAL_URL,
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
          "@id": STUDY_3_CANONICAL_URL,
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
        "@id": `${STUDY_3_CANONICAL_URL}#dataset`,
        name: "Clarvia 196-Country & 40-Corridor Advance Directives and Incapacity Mandates Dataset (November 2026)",
        description:
          "Comparative statutory dataset covering advance healthcare directive frameworks, national e-health registries, continuing powers of attorney, voluntary guardianship contracts, family caregiver protections, and HCCH #35 cross-border mandate portability across all 196 countries and 40 bilateral corridors.",
        url: STUDY_3_CANONICAL_URL,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isBasedOn: ZENODO_STUDY_CORPUS_DOI_URL,
        sameAs: [ZENODO_RECORD_URL, ZENODO_STUDY_CORPUS_DOI_URL],
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "text/csv",
            contentUrl: `https://clarvia.org${STUDY_3_CSV_PATH}`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: `https://clarvia.org${STUDY_3_JSON_PATH}`,
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
            Global Advance Directives &amp; Incapacity Mandates Atlas (2026)
          </span>
        </nav>

        <header className="max-w-3xl mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-white/85 border border-calm-blue-200 px-3 py-1 text-xs font-semibold text-calm-blue-800">
              Research Report · {study.totalCountries} Countries ·{" "}
              {study.totalCorridors} Corridors ·{" "}
              {study.totalVerifiedCitationsCombined.toLocaleString("en-US")}{" "}
              Official Sources
            </span>
            <time
              dateTime={study.publishedDate}
              className="inline-flex items-center rounded-full bg-white/85 border border-calm-blue-200 px-3 py-1 text-xs font-medium text-calm-blue-600"
            >
              Published 18 November 2026 · Treaty snapshot:{" "}
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
            Global Atlas of Advance Directives, Incapacity Mandates &amp;
            Cross-Border Portability (2026)
          </h1>

          <p className="text-lg text-calm-blue-700 leading-relaxed">
            A comparative study of all {study.totalCountries} sovereign countries
            and {study.totalCorridors} bilateral cross-border serious-illness
            corridors examining statutory advance healthcare directives,
            national e-health registries, continuing powers of attorney, family
            caregiver protections, and cross-border mandate recognition under
            the 2000 Hague Protection of Adults Convention.
          </p>
        </header>

        {/* Direct Raw Data Downloads & Open Verification */}
        <div
          aria-label="Reproducible dataset downloads and source code"
          className="mb-10 rounded-xl border border-calm-blue-200 bg-white/80 p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <span className="text-xs sm:text-sm font-semibold text-calm-blue-800">
            Inspect or verify all {study.totalCountries} country rows and{" "}
            {study.totalCorridors} corridor evaluations directly:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={STUDY_3_CSV_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download CSV ({study.totalCountries} rows)
            </a>
            <a
              href={STUDY_3_JSON_PATH}
              download
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              Download JSON ({study.totalGuidesInStudy} guides)
            </a>
            <a
              href={GITHUB_STUDY_3_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-11 rounded-lg border border-calm-blue-200 bg-calm-blue-50/70 hover:bg-calm-blue-100 px-3 py-2 text-xs font-semibold text-calm-blue-800"
            >
              View classification code on GitHub
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
                {study.nationalAhdRegisterCount} / {study.totalCountries} (
                {study.nationalAhdRegisterPct.toFixed(1)}%)
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                National Advance Directive Registry
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                While {study.bindingStatutoryAhdCount} countries (
                {study.bindingStatutoryAhdPct.toFixed(1)}%) recognize binding
                statutory advance directives, only{" "}
                <strong>{study.nationalAhdRegisterCount}</strong> link them to a
                national registry or e-health lookup visible to emergency teams.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.ordinaryPoaLapsesPct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Ordinary PoA Lapses on Incapacity
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                In {study.ordinaryPoaLapsesCount} of {study.totalCountries}{" "}
                countries, ordinary powers of attorney cease or freeze upon loss
                of mental capacity;{" "}
                <strong>{study.continuingPoaCount}</strong> (
                {study.continuingPoaPct.toFixed(1)}%) offer continuing PoAs and{" "}
                <strong>{study.voluntaryGuardianOrSupportCount}</strong> (
                {study.voluntaryGuardianOrSupportPct.toFixed(1)}%) offer
                voluntary-guardianship or support deeds.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.paidCaregiverLeaveCount} / {study.totalCountries} (
                {study.paidCaregiverLeavePct.toFixed(1)}%)
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                Statutory Paid Caregiver Leave
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                {study.paidCaregiverLeaveCount} countries provide paid or
                wage-replaced family caregiver leave, and a further{" "}
                <strong>{carerAllowanceBucket?.count ?? 0}</strong> (
                {carerAllowanceBucket?.pct.toFixed(1)}%) provide carer cash
                allowances or job-protected unpaid leave.
              </p>
            </div>

            <div className="glass-panel p-5">
              <div className="text-2xl sm:text-3xl font-semibold text-calm-blue-900 tabular-nums">
                {study.corridorMutualHcch35Pct.toFixed(1)}% vs.{" "}
                {study.corridorMutualApostillePct.toFixed(1)}%
              </div>
              <p className="text-sm font-semibold text-calm-blue-800 mt-1">
                The Apostille-vs-Portability Gap
              </p>
              <p className="text-xs text-calm-blue-600 mt-2 leading-relaxed">
                Across {study.totalCorridors} cross-border serious-illness
                corridors, {study.corridorMutualApostilleCount} (
                {study.corridorMutualApostillePct.toFixed(1)}%) share Hague
                Apostille authentication, yet only{" "}
                <strong>{study.corridorMutualHcch35Count}</strong> (
                {study.corridorMutualHcch35Pct.toFixed(1)}%) share mutual
                nationwide HCCH #35 mandate portability.
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
            Why pre-mortem administrative continuity breaks down at two borders:
            loss of capacity and national jurisdiction
          </h2>

          <p>
            When a person receives a serious or terminal diagnosis, their family
            must coordinate clinical goals of care, household banking, property
            administration, and caregiver work absences while decision-making
            capacity remains intact. Coding all {study.totalCountries} domestic
            serious-illness guides ({study.totalVerifiedCitationsIn196Guides.toLocaleString("en-US")}{" "}
            official source citations and{" "}
            {study.totalVerifiedContactsIn196Guides.toLocaleString("en-US")}{" "}
            verified public authorities) alongside all {study.totalCorridors}{" "}
            bilateral cross-border serious-illness guides (
            {study.totalVerifiedCitationsIn40Corridors.toLocaleString("en-US")}{" "}
            citations and{" "}
            {study.totalVerifiedContactsIn40Corridors.toLocaleString("en-US")}{" "}
            authorities) completes empirical analysis of Clarvia’s entire{" "}
            {CORPUS_STATS.canonicalGuides}-guide global statutory corpus and
            highlights two structural discontinuities where families lose
            administrative agency.
          </p>

          <p>
            The first discontinuity occurs domestically at the onset of
            cognitive impairment, stroke, or palliative sedation. In{" "}
            {study.ordinaryPoaLapsesCount} of {study.totalCountries} countries (
            {study.ordinaryPoaLapsesPct.toFixed(1)}%), traditional civil and
            common-law agency rules extinguish or suspend an ordinary Power of
            Attorney when the principal loses mental capacity, shifting families
            into court guardianship, curatorship, or interdiction proceedings.
            The second discontinuity occurs across national borders: only{" "}
            {study.hcch35NationwideCount} sovereign states (
            {study.hcch35NationwidePct.toFixed(1)}%), all located in Europe (15
            of 45 European states, alongside Scotland in the United Kingdom and
            Montenegro’s 13 October 2026 accession, versus 0 of 151 states
            across the Americas, Asia-Pacific, the Middle East &amp; North
            Africa, and Sub-Saharan Africa), currently apply the 2000 Hague
            Protection of Adults Convention (HCCH #35) nationwide, leaving{" "}
            {study.hcch35WithoutNationwideForceCount} countries (
            {study.hcch35WithoutNationwideForcePct.toFixed(1)}%) without
            nationwide multilateral recognition for foreign incapacity mandates.
          </p>

          <div className="rounded-xl border border-calm-blue-200 bg-white/80 p-5 space-y-3">
            <h3 className="text-lg font-semibold text-calm-blue-800">
              Three interoperable policy levers observable across the{" "}
              {study.totalGuidesInStudy}-guide corpus
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base text-calm-blue-700">
              <li>
                <strong>
                  Linking statutory advance directives to national e-health
                  records ensures bedside visibility:
                </strong>{" "}
                Although {study.bindingStatutoryAhdCount} countries (
                {study.bindingStatutoryAhdPct.toFixed(1)}%) have enacted
                dedicated binding advance-directive regimes (and a further{" "}
                {patientsRightsBucket?.count ?? 0} countries, or{" "}
                {patientsRightsBucket?.pct.toFixed(1)}%, recognize written
                treatment refusals or palliative care plans under patients&apos;
                rights statutes and medical-council guidelines), paper documents
                stored in a desk drawer rarely reach ambulance paramedics or
                night-shift ICU teams in time. The{" "}
                {study.nationalAhdRegisterCount} jurisdictions (
                {study.nationalAhdRegisterPct.toFixed(1)}%) that connect
                directives to national registries or digital health portals (such
                as Finland’s MyKanta, Spain’s RNIP, Portugal’s RENTEV, South
                Korea’s national LST database, Taiwan’s NHI IC Card, and
                Singapore’s NEHR) eliminate emergency-room guesswork.
              </li>
              <li>
                <strong>
                  Continuing mandates and CRPD support agreements prevent urgent
                  bank freezes without stripping legal capacity:
                </strong>{" "}
                Across {study.continuingPoaCount} jurisdictions (
                {study.continuingPoaPct.toFixed(1)}%), statutory continuing,
                lasting, or durable powers of attorney allow an adult to
                pre-authorize financial and personal representation that survives
                incapacity, increasingly paired with 24/7 notarial or public
                verification registers (such as Germany’s ZVR, Austria’s ÖZVV,
                Belgium’s CRMP, the Netherlands’ CLTR, Ireland’s DSS, and
                Singapore’s OPGO). A further{" "}
                {study.voluntaryGuardianOrSupportCount} jurisdictions (
                {study.voluntaryGuardianOrSupportPct.toFixed(1)}%, including
                Japan, South Korea, Taiwan, China, Italy, Portugal, Colombia,
                Costa Rica, and Peru) provide notarized voluntary-guardianship
                contracts or UN CRPD advance support designations that replace
                adversarial interdiction with self-chosen representation.
              </li>
              <li>
                <strong>
                  Closing the {study.corridorApostilleVsPortabilityGapPts.toFixed(1)}
                  -percentage-point Apostille-vs-Portability Gap through HCCH #35
                  ratification:
                </strong>{" "}
                Families with cross-border pensions, bank accounts, or property
                frequently assume that placing a 1961 Hague Apostille stamp on a
                domestic Power of Attorney makes it valid abroad. Across
                Clarvia’s {study.totalCorridors} cross-border serious-illness
                corridors, {study.corridorMutualApostilleCount} (
                {study.corridorMutualApostillePct.toFixed(1)}%) enjoy mutual
                Apostille signature authentication, yet only{" "}
                {study.corridorMutualHcch35Count} (
                {study.corridorMutualHcch35Pct.toFixed(1)}%) share mutual
                nationwide HCCH #35 recognition (plus{" "}
                {study.corridorPartialUkScotlandCount} corridors where UK
                ratification covers Scotland only). Ratifying HCCH #35, starting
                with the {signedHcch35Bucket?.count ?? 5} EU signatories that
                have already signed the Convention (Italy, Luxembourg, the
                Netherlands, Poland, and Romania) and following Montenegro’s 13
                October 2026 accession, directly bridges cross-border incapacity
                protection.
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
            Global &amp; Cross-Border Empirical Distributions (
            {study.totalCountries} Countries &amp; {study.totalCorridors}{" "}
            Corridors)
          </h2>

          {/* Table 1: Advance Healthcare Directives & Incapacity Mandates */}
          <div
            role="region"
            aria-labelledby="ahd-mandate-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="ahd-mandate-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 1. Advance Healthcare Directives &amp; Incapacity Mandate
                Continuity Across {study.totalCountries} Countries (
                {study.bindingStatutoryAhdCount} binding AHD statutes;{" "}
                {study.anyIncapacityPlanningCount} statutory incapacity-planning
                frameworks)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Pillar &amp; Statutory Architecture
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
                    Institutional &amp; Clinical Mechanics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.advanceDirectiveDistribution.map((b) => (
                  <tr key={`ahd-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">Advance directive:</span>{" "}
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
                {study.incapacityMandateDistribution.map((b) => (
                  <tr key={`im-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">Incapacity mandate:</span>{" "}
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

          {/* Table 2: Family Caregiver Protections & International Treaties */}
          <div
            role="region"
            aria-labelledby="carer-treaty-table-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="carer-treaty-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 2. Family Caregiver Protections &amp; Hague Convention
                Status Across {study.totalCountries} Countries (
                {study.verifySnapshot})
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Protection or Treaty Regime
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
                    Operational Scope for Families &amp; Authorities
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.caregiverProtectionDistribution.map((b) => (
                  <tr key={`cp-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">Caregiver support:</span>{" "}
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
                {study.hcch35Distribution.map((b) => (
                  <tr key={`h35-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">HCCH #35 Adults:</span>{" "}
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
                  <tr key={`h12-${b.code}`} className="hover:bg-calm-blue-50/40">
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-normal text-calm-blue-800 align-top"
                    >
                      <span className="font-semibold">HCCH #12 Apostille:</span>{" "}
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

          {/* Table 3: 40 Cross-Border Serious-Illness Corridors */}
          <div
            role="region"
            aria-labelledby="corridor-portability-caption"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs"
          >
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="corridor-portability-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 3. Cross-Border Incapacity Mandate Portability Across All{" "}
                {study.totalCorridors} Serious-Illness Corridors (
                {study.corridorMutualApostilleCount}/{study.totalCorridors}{" "}
                Mutual Apostille vs. {study.corridorMutualHcch35Count}/
                {study.totalCorridors} Mutual Nationwide HCCH #35)
              </caption>
              <thead className="bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Bilateral HCCH #35 Portability Tier
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
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Corridors &amp; Practical Consequence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-blue-100">
                {study.corridorPortabilityDistribution.map((b) => {
                  const matchingCorridors = study.corridorRows
                    .filter((r) => r.hcch35Portability === b.code)
                    .map((r) => r.corridorCode)
                    .join(", ");
                  return (
                    <tr
                      key={`cb-${b.code}`}
                      className="hover:bg-calm-blue-50/40"
                    >
                      <th
                        scope="row"
                        className="px-4 py-3 font-semibold text-calm-blue-800 align-top"
                      >
                        {b.label}
                      </th>
                      <td className="px-4 py-3 tabular-nums font-medium text-calm-blue-800 align-top whitespace-nowrap">
                        {b.count} / {study.totalCorridors}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-calm-blue-700 align-top">
                        {b.pct.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-calm-blue-600 align-top leading-snug">
                        <div>{b.description}</div>
                        <div className="text-[11px] text-calm-blue-500 mt-1 font-mono">
                          Corridors: {matchingCorridors}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            <table className="w-full min-w-[46rem] border-collapse text-left text-xs sm:text-sm">
              <caption
                id="region-table-caption"
                className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
              >
                Table 4. Pre-Mortem Autonomy &amp; Caregiver Indicators Across
                All {study.macroRegionCount} World Macro-Regions (
                {study.totalCountries} Countries)
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
                    Binding AHD Statute
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Incapacity Mandate / Support
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    Carer Leave / Allowance
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    HCCH #35 Nationwide
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
                      {reg.statutoryAhdCount} / {reg.countryCount} (
                      {reg.statutoryAhdPct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-800">
                      {reg.incapacityPlanningCount} / {reg.countryCount} (
                      {reg.incapacityPlanningPct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-800">
                      {reg.paidOrAllowanceCarerCount} / {reg.countryCount} (
                      {reg.paidOrAllowanceCarerPct.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-calm-blue-800">
                      {reg.hcch35InForceNationwideCount} / {reg.countryCount} (
                      {reg.hcch35InForceNationwidePct.toFixed(1)}%)
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
        <AdvanceDirectivesAtlasTable
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
            <code>terminal-illness-admin</code> guides (
            {study.totalVerifiedCitationsIn196Guides.toLocaleString("en-US")}{" "}
            official source citations and{" "}
            {study.totalVerifiedContactsIn196Guides.toLocaleString("en-US")}{" "}
            public-authority contacts) and {study.totalCorridors} canonical{" "}
            <code>cross-border-terminal-illness</code> guides (
            {study.totalVerifiedCitationsIn40Corridors.toLocaleString("en-US")}{" "}
            citations and{" "}
            {study.totalVerifiedContactsIn40Corridors.toLocaleString("en-US")}{" "}
            contacts), cross-checked against the live HCCH Status Tables for
            Conventions #35 and #12 as of <strong>{study.verifySnapshot}</strong>.
            All {study.totalCountries} country rows and {study.totalCorridors}{" "}
            corridor evaluations are reproducible from the{" "}
            <a
              href={STUDY_3_CSV_PATH}
              download
              className="underline font-medium text-calm-blue-800"
            >
              downloadable CSV
            </a>
            ,{" "}
            <a
              href={STUDY_3_JSON_PATH}
              download
              className="underline font-medium text-calm-blue-800"
            >
              JSON export
            </a>
            , and{" "}
            <a
              href={GITHUB_STUDY_3_SOURCE_URL}
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
                Deterministic statutory coding vs. clinical bedside compliance:
              </strong>{" "}
              This atlas is a comparative coding of enacted statutes, official
              registries, treaty depositaries, and institutional pathways
              documented across Clarvia’s source-verified guidance corpus rather
              than an empirical clinical audit or household survey. It
              classifies legal architecture and public registration channels; it
              does not measure actual advance-directive uptake rates, hospital
              bedside adherence, commercial bank acceptance latency, or informal
              family decision-making practices.
            </li>
            <li>
              <strong>
                National registries vs. local or federal sub-national advance
                directives:
              </strong>{" "}
              Tier 1 (<code>{study.nationalAhdRegisterCount}</code> countries)
              requires both a binding national statutory advance-directive
              framework and a dedicated national registry or nationwide
              electronic health record lookup. Federal and decentralized systems
              where binding advance directives are enacted at state, provincial,
              or cantonal level (including Australia, Canada, Mexico,
              Switzerland, and the United States) are coded in Tier 2 (
              <code>{localStatutoryAhdBucket?.count ?? 20}</code> countries),
              noting where national portals such as Australia’s My Health Record
              support optional document upload. Jurisdictions governed by
              patients&apos; rights consent-refusal rules or medical-council
              resolutions (<code>{patientsRightsBucket?.count ?? 67}</code>{" "}
              countries, such as Brazil’s CFM Resolution 1.995/2012, Japan’s
              MHLW Jinsei Kaigi guidelines, and South Africa’s HPCSA Booklet 7)
              are distinguished from general clinical-consent regimes (
              <code>{generalConsentBucket?.count ?? 90}</code> countries).
            </li>
            <li>
              <strong>
                Continuing powers of attorney vs. voluntary guardianship &amp;
                CRPD support deeds:
              </strong>{" "}
              Rather than collapsing adult-capacity reforms into a binary, Pillar
              2 distinguishes private or administrative continuing, lasting, and
              durable powers of attorney (<code>{study.continuingPoaCount}</code>{" "}
              countries) from civil-law voluntary-guardianship contracts and UN
              CRPD preventive support designations (
              <code>{study.voluntaryGuardianOrSupportCount}</code> countries,
              including Japan’s Nin&apos;i Koken, South Korea’s Im-ui Hugyeon,
              Taiwan’s and China’s Yiding Jianhu, Italy’s Amministrazione di
              Sostegno advance designation, Portugal’s Maior Acompanhado mandate,
              and Law 1996/2019 or DL 1384 support agreements in Colombia and
              Peru), where a supervisory court or judge activates or oversees the
              pre-selected representative.
            </li>
            <li>
              <strong>
                Scope of advance directives vs. assisted-dying legislation:
              </strong>{" "}
              Advance healthcare directives coded in this study measure the legal
              right to refuse disproportionate life-prolonging interventions and
              appoint a healthcare proxy while preserving palliative comfort
              care; in the overwhelming majority of studied jurisdictions (and
              explicitly noted across guides from Argentina and Thailand to
              Greece and Jordan), active euthanasia and assisted suicide remain
              separate or prohibited.
            </li>
            <li>
              <strong>
                HCCH #35 territorial declarations and 2026/2027 treaty
                transitions:
              </strong>{" "}
              In accordance with the official HCCH #35 depositary table in
              November 2026, the United Kingdom (<code>GB</code>) is coded in its
              own sub-national category because ratification extends strictly to
              Scotland (leaving England &amp; Wales Lasting Powers of Attorney
              and Northern Ireland Enduring Powers of Attorney outside treaty
              scope), and Montenegro (<code>ME</code>) is coded separately
              following its 13 October 2026 accession (entering into force on 1
              August 2027). Across the {study.totalCorridors} cross-border
              serious-illness corridors,{" "}
              <code>{oneSidedCorridorBucket?.count ?? 19}</code> one-sided and{" "}
              <code>{neitherCorridorBucket?.count ?? 13}</code> non-party
              corridors lack reciprocal HCCH #35 coverage despite{" "}
              <code>{study.corridorMutualApostilleCount}</code> sharing HCCH #12
              Apostilles.
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
              ). This atlas compares public administrative frameworks for
              research purposes and does not constitute individualized legal,
              medical, notarial, or financial advice.
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
                4-bridge treaty evaluation across 160 bereavement and 40 serious
                illness corridors.
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
                Companion Study 2 · 196 Countries
              </div>
              <p className="font-semibold text-calm-blue-900 mt-0.5">
                Global Post-Death Civil Registration &amp; Estate Administration
                Atlas (2026)
              </p>
              <p className="text-sm text-calm-blue-600 mt-1">
                Statutory death registration windows, digital filing, once-only
                propagation, and probate models.
              </p>
            </div>
            <div>
              <Link
                href={STUDY_2_CANONICAL_URL.replace("https://clarvia.org", "")}
                className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center"
              >
                Read Study 2
              </Link>
            </div>
          </div>
        </div>

        {/* 1-Click Citation Box */}
        <div className="max-w-3xl">
          <GuideShareLinkBox
            slug={STUDY_3_SLUG}
            lang="en"
            siteLang="en"
            canonicalUrl={STUDY_3_CANONICAL_URL}
            anchorTitle="Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (2026)"
            boxId="cite-this-study"
            heading="Cite or link to this atlas"
            body="Policy teams, ministries of health and justice, notariats, palliative care networks, researchers, and journalists may freely cite, link to, or reuse this CC BY 4.0 study and open dataset."
            snippetSuffix="Clarvia ASBL (CC BY 4.0, Dataset DOI: 10.5281/zenodo.24245341)"
            plainTextOverride="Clarvia ASBL (2026). Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability: 196-Country & 40-Corridor Comparative Study. https://clarvia.org/en/research/global-advance-directives-incapacity-mandates-atlas (Dataset: https://zenodo.org/records/24245341; Software archive: https://zenodo.org/records/20572455)"
          />
        </div>

        {/* Support signpost for families */}
        <div className="max-w-3xl mt-10 rounded-xl border border-calm-blue-200 bg-white/75 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-calm-blue-800">
              Navigating a serious diagnosis for a family member today?
            </p>
            <p className="text-sm text-calm-blue-600 mt-0.5">
              Read Clarvia’s free step-by-step serious-illness checklists or ask
              a specific question for source-linked guidance.
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
