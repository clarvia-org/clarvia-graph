import {
  corridorGuidePath,
  publishedCorridorGuides,
  type CorridorGuide,
} from "@/content/corridor-guides";

export const AUTHOR_TOMMI_ORCID = "0009-0002-2467-4045";
export const AUTHOR_TOMMI_ORCID_URL =
  "https://orcid.org/0009-0002-2467-4045";
export const STUDY_AUTHORS_JSONLD = [
  {
    "@type": "Person",
    "@id": "https://clarvia.org/#tommi-lindfors",
    name: "Tommi Lindfors",
    url: AUTHOR_TOMMI_ORCID_URL,
    sameAs: AUTHOR_TOMMI_ORCID_URL,
    affiliation: { "@id": "https://clarvia.org/#organization" },
  },
  { "@id": "https://clarvia.org/#organization" },
] as const;
export const STUDY_1_PUBLISHED_DATE = "2026-11-18";
export const STUDY_1_VERIFY_SNAPSHOT = "November 2026";
export const STUDY_1_CANONICAL_URL =
  "https://clarvia.org/en/research/cross-border-bereavement-integration-index";
export const STUDY_1_CSV_PATH =
  "/data/research/cross-border-integration-index-2026.csv";
export const STUDY_1_JSON_PATH =
  "/data/research/cross-border-integration-index-2026.json";
export const STUDY_1_PDF_PATH =
  "/data/research/cross-border-integration-index-2026.pdf";
export const STUDY_1_ZENODO_DOI = "10.5281/zenodo.24388595";
export const STUDY_1_ZENODO_DOI_URL = "https://doi.org/10.5281/zenodo.24388595";
export const STUDY_1_ZENODO_RECORD_URL = "https://zenodo.org/records/24388595";
export const STUDY_1_DATA_PUBLIC_LU_URL =
  "https://data.public.lu/fr/datasets/cross-border-bereavement-serious-illness-administrative-integration-index-2026/";
export const ZENODO_STUDY_CORPUS_DOI = "10.5281/zenodo.24245341";
export const ZENODO_STUDY_CORPUS_DOI_URL =
  "https://doi.org/10.5281/zenodo.24245341";
export const ZENODO_RECORD_URL = "https://zenodo.org/records/24245341";
export const ZENODO_SOFTWARE_DOI = "10.5281/zenodo.20572455";
export const ZENODO_SOFTWARE_RECORD_URL = "https://zenodo.org/records/20572455";
export const EC_OSOR_URL =
  "https://interoperable-europe.ec.europa.eu/collection/open-source-observatory-osor/solution/clarvia-cross-border-life-event-guidance-cpsv-ap-consequence-graph";
export const DATA_EUROPA_URL =
  "https://data.europa.eu/data/datasets/bereavement-source-register-luxembourg";
export const DATA_PUBLIC_LU_URL =
  "https://data.public.lu/en/organizations/clarvia-asbl/";
export const GITHUB_REPO_URL = "https://github.com/clarvia-org/clarvia-graph";
export const GITHUB_STUDY_SOURCE_URL =
  "https://github.com/clarvia-org/clarvia-graph/blob/main/apps/web/src/content/research/cross-border-integration-study.ts";

export const CORPUS_STATS = {
  canonicalGuides: 592,
  localizedPages: 1000,
  verifiedOfficialCitations: 5396,
} as const;

/** EU27 Member States represented in the 38-country index covered by Regulation (EU) 2016/1191. */
export const EU_PUBLIC_DOCS_2016_1191 = new Set([
  "AT",
  "BE",
  "CY",
  "DE",
  "ES",
  "FR",
  "GR",
  "IE",
  "IT",
  "LU",
  "NL",
  "PL",
  "PT",
  "RO",
]);

/** States participating in the EU Succession Regulation (EU) No 650/2012 (Ireland did not opt in). */
export const EU_SUCCESSION_650_2012 = new Set([
  "AT",
  "BE",
  "CY",
  "DE",
  "ES",
  "FR",
  "GR",
  "IT",
  "LU",
  "NL",
  "PL",
  "PT",
  "RO",
]);

/** Contracting States in force under CIEC Convention No. 16 (Vienna, 8 Sep 1976, Form C). */
export const CIEC_VIENNA_1976_FORM_C = new Set([
  "AT",
  "BE",
  "CH",
  "DE",
  "ES",
  "FR",
  "IT",
  "LU",
  "NL",
  "PL",
  "PT",
  "RO",
  "TR",
]);

/** Verified bilateral legal-assistance / civil-status treaties exempting civil death certificates from apostille. */
export const BILATERAL_DOC_EXEMPT_PAIRS = new Set([
  "FR:MA",
  "MA:FR",
  "PL:UA",
  "UA:PL",
]);

/**
 * Countries in the 38-state index where the 1961 Hague Apostille Convention (HCCH #12)
 * is NOT in force as of November 2026. Thailand acceded 30 June 2026 and enters into
 * force on 28 February 2027.
 */
export const NON_APOSTILLE_IN_FORCE_2026_11 = new Set(["AE", "EG", "TH"]);

/** Germany's active Article 12(2) HCCH #12 objections among the 38 countries (objection to UA withdrawn in 2010). */
export const DE_APOSTILLE_OBJECTIONS = new Set(["DO", "IN", "MA", "PH"]);

/** Council of Europe Agreement on the Transfer of Corpses (Strasbourg 1973, ETS No. 080). */
export const STRASBOURG_1973_CORPSE_TRANSIT = new Set([
  "AD",
  "AT",
  "BE",
  "CY",
  "CZ",
  "EE",
  "FI",
  "FR",
  "GR",
  "IS",
  "LV",
  "LT",
  "LU",
  "MD",
  "NL",
  "NO",
  "PT",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "TR",
  "UA",
]);

/** 1937 Berlin International Arrangement Concerning the Conveyance of Corpses. */
export const BERLIN_1937_CORPSE_TRANSIT = new Set([
  "AT",
  "BE",
  "CL",
  "CZ",
  "DK",
  "EG",
  "FR",
  "DE",
  "IT",
  "MX",
  "NL",
  "PT",
  "RO",
  "SK",
  "CH",
  "TR",
  "CD",
]);

/**
 * 2000 Hague Protection of Adults Convention (HCCH #35) nationwide contracting parties in force
 * among the 38 index countries as of November 2026 (UK ratified for Scotland only).
 */
export const HCCH_2000_ADULTS_FULL = new Set([
  "AT",
  "BE",
  "CH",
  "CY",
  "DE",
  "FR",
  "GR",
  "IE",
  "PT",
]);

/** Reciprocal Commonwealth probate grant resealing network represented in the 38-country index. */
export const COMMONWEALTH_PROBATE_RESEALING = new Set([
  "AU",
  "CA",
  "GB",
  "NZ",
  "SG",
  "ZA",
]);

/** National / co-official administrative languages mapped for the 38 index jurisdictions. */
export const OFFICIAL_LANGUAGES_BY_ISO: Record<string, readonly string[]> = {
  AE: ["ar"],
  AR: ["es"],
  AT: ["de"],
  AU: ["en"],
  BE: ["nl", "fr", "de"],
  BR: ["pt"],
  CA: ["en", "fr"],
  CH: ["de", "fr", "it"],
  CO: ["es"],
  CY: ["el", "tr"],
  DE: ["de"],
  DO: ["es"],
  EG: ["ar"],
  ES: ["es"],
  FR: ["fr"],
  GB: ["en"],
  GR: ["el"],
  ID: ["id"],
  IE: ["en", "ga"],
  IL: ["he", "ar"],
  IN: ["hi", "en"],
  IT: ["it"],
  LU: ["lb", "fr", "de"],
  MA: ["ar"],
  MX: ["es"],
  NL: ["nl"],
  NZ: ["en"],
  PH: ["en", "tl"],
  PL: ["pl"],
  PT: ["pt"],
  RO: ["ro"],
  SA: ["ar"],
  SG: ["en", "ms", "zh", "ta"],
  TH: ["th"],
  TR: ["tr"],
  UA: ["uk"],
  US: ["en"],
  ZA: ["en", "af", "zu"],
};

export type BridgeDocCode =
  | "exempt_from_legalization"
  | "hague_apostille"
  | "consular_legalization";

export type BridgeContinuityCode =
  | "eu_650_ecs"
  | "commonwealth_reseal"
  | "parallel_domestic"
  | "hcch_2000_adults"
  | "hcch_2000_scotland_only"
  | "separate_domestic_poa";

export type BridgeRepatriationCode =
  | "multilateral_laissez_passer"
  | "consular_mortuary_clearance";

export type BridgeLanguageCode =
  | "shared_official_lang"
  | "multilingual_civil_form"
  | "certified_translation";

export type StudyCohortId =
  | "intra_eu_efta"
  | "commonwealth_reseal"
  | "uk_eu_efta"
  | "other_global";

export type BridgeRating<Code extends string> = {
  code: Code;
  score: number;
  label: string;
  shortLabel: string;
  instrument: string;
};

export type CorridorIntegrationRow = {
  id: string;
  slug: string;
  guideHref: string;
  category: "cross-border-bereavement" | "cross-border-terminal-illness";
  trackLabel: string;
  countryOfDeath: string;
  countryOfDeathCode: string;
  citizenshipCountry: string;
  citizenshipCountryCode: string;
  corridorLabel: string;
  searchText: string;
  sourceCount: number;
  localeCount: number;
  lastReviewed: string;
  thailandFeb2027Transition: boolean;
  cohort: StudyCohortId;
  docBridge: BridgeRating<BridgeDocCode>;
  continuityBridge: BridgeRating<BridgeContinuityCode>;
  repatriationBridge: BridgeRating<BridgeRepatriationCode>;
  languageBridge: BridgeRating<BridgeLanguageCode>;
  compositeScore: number;
};

export type CohortSummary = {
  id: StudyCohortId;
  label: string;
  description: string;
  count: number;
  meanScore: number;
};

export type DistributionBucket<Code extends string> = {
  code: Code;
  label: string;
  scoreValue: number;
  count: number;
  pct: number;
};

export type DepositarySource = {
  id: string;
  title: string;
  issuer: string;
  scope: string;
  url: string;
};

export type CrossBorderIntegrationStudy = {
  publishedDate: string;
  verifySnapshot: string;
  totalCorridors: number;
  bereavementCount: number;
  terminalCount: number;
  uniqueCountryCount: number;
  uniquePairCount: number;
  totalVerifiedCitationsInStudyCorridors: number;
  overallMeanScore: number;
  bereavementMeanScore: number;
  terminalMeanScore: number;
  fullScoreCount: number;
  zeroScoreCount: number;
  apostilleOrExemptCount: number;
  apostilleOrExemptPct: number;
  thailandFeb2027Count: number;
  postFeb2027ApostilleOrExemptPct: number;
  bereavementParallelEstateCount: number;
  bereavementParallelEstatePct: number;
  terminalGapCount: number;
  terminalGapPct: number;
  repatriationGapCount: number;
  repatriationGapPct: number;
  cohorts: CohortSummary[];
  bridge1Distribution: DistributionBucket<BridgeDocCode>[];
  bridge2BereavementDistribution: DistributionBucket<BridgeContinuityCode>[];
  bridge2TerminalDistribution: DistributionBucket<BridgeContinuityCode>[];
  bridge3Distribution: DistributionBucket<BridgeRepatriationCode>[];
  bridge4Distribution: DistributionBucket<BridgeLanguageCode>[];
  countries: Array<{ code: string; name: string }>;
  rows: CorridorIntegrationRow[];
  depositarySources: readonly DepositarySource[];
};

export const DEPOSITARY_SOURCES: readonly DepositarySource[] = [
  {
    id: "hcch-12",
    title: "Convention of 5 October 1961 Abolishing the Requirement of Legalisation (HCCH #12 Status Table)",
    issuer: "Hague Conference on Private International Law (HCCH)",
    scope: "Bridge 1: Hague Apostille status, Art. 12(2) objections, and Thailand accession (28 Feb 2027 entry into force)",
    url: "https://www.hcch.net/en/instruments/conventions/status-table/?cid=41",
  },
  {
    id: "hcch-35",
    title: "Convention of 13 January 2000 on the International Protection of Adults (HCCH #35 Status Table)",
    issuer: "Hague Conference on Private International Law (HCCH)",
    scope: "Bridge 2 (Serious & Terminal Illness): Contracting Parties in force and UK territorial extension to Scotland only",
    url: "https://www.hcch.net/en/instruments/conventions/status-table/?cid=71",
  },
  {
    id: "eu-2016-1191",
    title: "Regulation (EU) 2016/1191 on Promoting the Free Movement of Public Documents",
    issuer: "Official Journal of the European Union (EUR-Lex)",
    scope: "Bridges 1 & 4: Intra-EU apostille exemption and Multilingual Standard Forms for civil-status certificates",
    url: "https://eur-lex.europa.eu/eli/reg/2016/1191/oj",
  },
  {
    id: "eu-650-2012",
    title: "Regulation (EU) No 650/2012 on Succession and the European Certificate of Succession",
    issuer: "Official Journal of the European Union (EUR-Lex)",
    scope: "Bridge 2 (Bereavement): Unified succession jurisdiction, professio juris, and European Certificate of Succession",
    url: "https://eur-lex.europa.eu/eli/reg/2012/650/oj",
  },
  {
    id: "ciec-16",
    title: "CIEC Convention No. 16 on Multilingual Extracts from Civil-Status Records (Vienna, 1976, Form C)",
    issuer: "International Commission on Civil Status (ICCS / CIEC)",
    scope: "Bridges 1 & 4: Contracting states issuing translation-exempt and apostille-exempt Form C death extracts",
    url: "https://ciec1.org/convention/convention-n16-relative-a-la-delivrance-dextraits-plurilingues-dactes-de-letat-civil/",
  },
  {
    id: "coe-080",
    title: "Agreement on the Transfer of Corpses (Strasbourg, 1973, ETS No. 080)",
    issuer: "Council of Europe Treaty Office",
    scope: "Bridge 3: Multilateral laissez-passer for international repatriation of human remains",
    url: "https://rm.coe.int/168007617d",
  },
  {
    id: "uk-colonial-probates",
    title: "Colonial Probates Act 1892 (and reciprocal Commonwealth probate resealing framework)",
    issuer: "Legislation.gov.uk (UK National Archives)",
    scope: "Bridge 2 (Bereavement): Reciprocal probate grant resealing across UK, Australia, New Zealand, Canada, Singapore, South Africa",
    url: "https://www.legislation.gov.uk/ukpga/Vict/55-56/6/contents",
  },
  {
    id: "zenodo-corpus",
    title: `Clarvia Global Statutory Source & Administrative Reference Dataset (592 Guides, 5,396 Citations; DOI: ${ZENODO_STUDY_CORPUS_DOI})`,
    issuer: "Clarvia ASBL (archived on CERN Zenodo, CC-BY-4.0)",
    scope: "Underlying 200 cross-border and 392 single-country verified reference corpus",
    url: ZENODO_RECORD_URL,
  },
  {
    id: "zenodo-software",
    title: `Clarvia Graph Open Consequence Graph & Software Archive (DOI: ${ZENODO_SOFTWARE_DOI})`,
    issuer: "Clarvia ASBL (archived on CERN Zenodo, EUPL-1.2 / Apache-2.0 / CC-BY-4.0)",
    scope: "Monorepo release archive containing the open-source scoring module, schemas, and automated verification suite",
    url: ZENODO_SOFTWARE_RECORD_URL,
  },
];

const EU_EFTA_IN_INDEX = new Set([...EU_PUBLIC_DOCS_2016_1191, "CH"]);

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function scoreDocBridge(
  c1: string,
  c2: string,
  isBereavement: boolean,
): BridgeRating<BridgeDocCode> {
  const pairKey = `${c1}:${c2}`;
  const isEu2016 =
    EU_PUBLIC_DOCS_2016_1191.has(c1) && EU_PUBLIC_DOCS_2016_1191.has(c2);
  const isCiec16 =
    CIEC_VIENNA_1976_FORM_C.has(c1) && CIEC_VIENNA_1976_FORM_C.has(c2);
  const isBilateral = BILATERAL_DOC_EXEMPT_PAIRS.has(pairKey);

  if (isBereavement && (isEu2016 || isCiec16 || isBilateral)) {
    const instrument = isEu2016 && isCiec16
      ? "EU Reg. 2016/1191 & CIEC No. 16 Form C"
      : isEu2016
        ? "EU Reg. 2016/1191 (Public Documents)"
        : isCiec16
          ? "CIEC Convention No. 16 (Vienna 1976)"
          : pairKey === "PL:UA" || pairKey === "UA:PL"
            ? "1993 Poland-Ukraine Treaty Art. 15"
            : "1981 Franco-Moroccan Convention";
    return {
      code: "exempt_from_legalization",
      score: 1.0,
      label: "Apostille-exempt civil-status recognition",
      shortLabel: "Exempt (1.0)",
      instrument,
    };
  }

  const isConsular =
    NON_APOSTILLE_IN_FORCE_2026_11.has(c1) ||
    NON_APOSTILLE_IN_FORCE_2026_11.has(c2) ||
    (c1 === "DE" && DE_APOSTILLE_OBJECTIONS.has(c2)) ||
    (c2 === "DE" && DE_APOSTILLE_OBJECTIONS.has(c1));

  if (isConsular) {
    const hasThailand = c1 === "TH" || c2 === "TH";
    return {
      code: "consular_legalization",
      score: 0.0,
      label: hasThailand
        ? "Consular legalization (HCCH #12 enters force 28 Feb 2027)"
        : "MFA & embassy consular legalization",
      shortLabel: "Consular (0.0)",
      instrument: hasThailand
        ? "MFA + Consular Legalization (TH HCCH #12 effective 28 Feb 2027)"
        : "MFA + Embassy Consular Attestation",
    };
  }

  return {
    code: "hague_apostille",
    score: 0.5,
    label: isBereavement
      ? "Single-stamp 1961 Hague Apostille"
      : "Hague Apostille for notarized PoAs",
    shortLabel: "Apostille (0.5)",
    instrument: "1961 Hague Apostille Convention (HCCH #12)",
  };
}

function scoreContinuityBridge(
  c1: string,
  c2: string,
  isBereavement: boolean,
): BridgeRating<BridgeContinuityCode> {
  if (isBereavement) {
    if (EU_SUCCESSION_650_2012.has(c1) && EU_SUCCESSION_650_2012.has(c2)) {
      return {
        code: "eu_650_ecs",
        score: 1.0,
        label: "Unified succession law & European Certificate of Succession",
        shortLabel: "EU 650 / ECS (1.0)",
        instrument: "Regulation (EU) No 650/2012",
      };
    }
    if (
      COMMONWEALTH_PROBATE_RESEALING.has(c1) &&
      COMMONWEALTH_PROBATE_RESEALING.has(c2)
    ) {
      return {
        code: "commonwealth_reseal",
        score: 0.5,
        label: "Reciprocal Commonwealth probate grant resealing",
        shortLabel: "Reseal (0.5)",
        instrument: "Commonwealth Probate Resealing Framework",
      };
    }
    return {
      code: "parallel_domestic",
      score: 0.0,
      label: "Parallel domestic probate / notarial succession",
      shortLabel: "Parallel (0.0)",
      instrument: "Domestic Conflict-of-Law & Ancillary Probate",
    };
  }

  if (HCCH_2000_ADULTS_FULL.has(c1) && HCCH_2000_ADULTS_FULL.has(c2)) {
    return {
      code: "hcch_2000_adults",
      score: 1.0,
      label: "Mutual Hague 2000 Adult Protection recognition",
      shortLabel: "HCCH #35 (1.0)",
      instrument: "2000 Hague Adults Convention (HCCH #35)",
    };
  }

  if (
    (c1 === "GB" && HCCH_2000_ADULTS_FULL.has(c2)) ||
    (c2 === "GB" && HCCH_2000_ADULTS_FULL.has(c1))
  ) {
    return {
      code: "hcch_2000_scotland_only",
      score: 0.5,
      label: "Partial HCCH 2000 scope (UK ratified for Scotland only)",
      shortLabel: "Scotland Only (0.5)",
      instrument: "HCCH #35 (UK Territorial Scope: Scotland Only)",
    };
  }

  return {
    code: "separate_domestic_poa",
    score: 0.0,
    label: "Separate domestic PoAs & advance directives required",
    shortLabel: "Separate PoA (0.0)",
    instrument: "Domestic Incapacity Law in Each State",
  };
}

function scoreRepatriationBridge(
  c1: string,
  c2: string,
): BridgeRating<BridgeRepatriationCode> {
  const inStrasbourg =
    STRASBOURG_1973_CORPSE_TRANSIT.has(c1) &&
    STRASBOURG_1973_CORPSE_TRANSIT.has(c2);
  const inBerlin =
    BERLIN_1937_CORPSE_TRANSIT.has(c1) && BERLIN_1937_CORPSE_TRANSIT.has(c2);

  if (inStrasbourg || inBerlin) {
    return {
      code: "multilateral_laissez_passer",
      score: 1.0,
      label: "Multilateral corpse laissez-passer treaty",
      shortLabel: "Laissez-Passer (1.0)",
      instrument: inStrasbourg && inBerlin
        ? "1973 Strasbourg ETS 080 & 1937 Berlin"
        : inStrasbourg
          ? "1973 Strasbourg Agreement (ETS No. 080)"
          : "1937 Berlin Arrangement",
    };
  }

  return {
    code: "consular_mortuary_clearance",
    score: 0.0,
    label: "Bilateral consular mortuary clearance & border permits",
    shortLabel: "Consular NOC (0.0)",
    instrument: "Bilateral Consular Mortuary Clearance",
  };
}

function scoreLanguageBridge(
  c1: string,
  c2: string,
  isBereavement: boolean,
): BridgeRating<BridgeLanguageCode> {
  const langs1 = OFFICIAL_LANGUAGES_BY_ISO[c1] ?? [];
  const langs2 = OFFICIAL_LANGUAGES_BY_ISO[c2] ?? [];
  const overlap = langs1.filter((code) => langs2.includes(code));

  if (overlap.length > 0) {
    return {
      code: "shared_official_lang",
      score: 1.0,
      label: `Shared official language (${overlap.join("/").toUpperCase()})`,
      shortLabel: "Shared Lang (1.0)",
      instrument: `Common Official Language (${overlap.join("/").toUpperCase()})`,
    };
  }

  const isEu2016 =
    EU_PUBLIC_DOCS_2016_1191.has(c1) && EU_PUBLIC_DOCS_2016_1191.has(c2);
  const isCiec16 =
    CIEC_VIENNA_1976_FORM_C.has(c1) && CIEC_VIENNA_1976_FORM_C.has(c2);

  if (isBereavement && (isEu2016 || isCiec16)) {
    return {
      code: "multilingual_civil_form",
      score: 0.5,
      label: "Standardized multilingual civil-status form (translation-exempt death extract)",
      shortLabel: "Multilingual Form (0.5)",
      instrument: isEu2016
        ? "EU 2016/1191 Multilingual Standard Form"
        : "CIEC Vienna Form C Multilingual Extract",
    };
  }

  return {
    code: "certified_translation",
    score: 0.0,
    label: "Certified or sworn translation required",
    shortLabel: "Translation (0.0)",
    instrument: "Certified / Sworn Translation",
  };
}

function classifyCohort(c1: string, c2: string): StudyCohortId {
  if (EU_EFTA_IN_INDEX.has(c1) && EU_EFTA_IN_INDEX.has(c2)) {
    return "intra_eu_efta";
  }
  if (
    (c1 === "GB" && EU_EFTA_IN_INDEX.has(c2)) ||
    (c2 === "GB" && EU_EFTA_IN_INDEX.has(c1))
  ) {
    return "uk_eu_efta";
  }
  if (
    COMMONWEALTH_PROBATE_RESEALING.has(c1) &&
    COMMONWEALTH_PROBATE_RESEALING.has(c2)
  ) {
    return "commonwealth_reseal";
  }
  return "other_global";
}

function buildRow(guide: CorridorGuide): CorridorIntegrationRow {
  const c1 = guide.countryOfDeathCode;
  const c2 = guide.citizenshipCountryCode;
  const isBereavement = guide.category === "cross-border-bereavement";

  const docBridge = scoreDocBridge(c1, c2, isBereavement);
  const continuityBridge = scoreContinuityBridge(c1, c2, isBereavement);
  const repatriationBridge = scoreRepatriationBridge(c1, c2);
  const languageBridge = scoreLanguageBridge(c1, c2, isBereavement);

  const compositeScore = round2(
    docBridge.score +
      continuityBridge.score +
      repatriationBridge.score +
      languageBridge.score,
  );
  const corridorLabel = `${guide.countryOfDeath} → ${guide.citizenshipCountry}`;
  const trackLabel = isBereavement ? "Bereavement" : "Serious / Terminal Illness";

  return {
    id: guide.id,
    slug: guide.slug,
    guideHref: corridorGuidePath(guide.slug, "en"),
    category: isBereavement
      ? "cross-border-bereavement"
      : "cross-border-terminal-illness",
    trackLabel,
    countryOfDeath: guide.countryOfDeath,
    countryOfDeathCode: c1,
    citizenshipCountry: guide.citizenshipCountry,
    citizenshipCountryCode: c2,
    corridorLabel,
    searchText: [
      guide.countryOfDeath,
      c1,
      guide.citizenshipCountry,
      c2,
      trackLabel,
      docBridge.instrument,
      continuityBridge.instrument,
      repatriationBridge.instrument,
      languageBridge.instrument,
      guide.slug,
    ]
      .join(" ")
      .toLowerCase(),
    sourceCount: guide.sources.length,
    localeCount: guide.locales.length,
    lastReviewed: guide.lastReviewed,
    thailandFeb2027Transition: c1 === "TH" || c2 === "TH",
    cohort: classifyCohort(c1, c2),
    docBridge,
    continuityBridge,
    repatriationBridge,
    languageBridge,
    compositeScore,
  };
}

function buildDistribution<Code extends string>(
  items: readonly BridgeRating<Code>[],
  order: readonly { code: Code; label: string; scoreValue: number }[],
): DistributionBucket<Code>[] {
  const denom = items.length || 1;
  return order.map((meta) => {
    const count = items.filter((item) => item.code === meta.code).length;
    return {
      code: meta.code,
      label: meta.label,
      scoreValue: meta.scoreValue,
      count,
      pct: round1((count / denom) * 100),
    };
  });
}

let cachedStudy: CrossBorderIntegrationStudy | null = null;

/**
 * Deterministically derives the 200-corridor Cross-Border Bereavement & Serious Illness
 * Administrative Integration Index from the live published EN guide corpus and verified
 * international treaty depositary tables (November 2026).
 */
export function getCrossBorderIntegrationStudy(): CrossBorderIntegrationStudy {
  if (cachedStudy) {
    return cachedStudy;
  }

  const crossBorderGuides = publishedCorridorGuides("en").filter(
    (guide) => guide.countryOfDeathCode !== guide.citizenshipCountryCode,
  );

  const rows = crossBorderGuides.map(buildRow).sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    const labelCmp = a.corridorLabel.localeCompare(b.corridorLabel, "en");
    if (labelCmp !== 0) return labelCmp;
    return a.trackLabel.localeCompare(b.trackLabel, "en");
  });

  const countryMap = new Map<string, string>();
  const pairSet = new Set<string>();
  let totalCitations = 0;

  for (const row of rows) {
    countryMap.set(row.countryOfDeathCode, row.countryOfDeath);
    countryMap.set(row.citizenshipCountryCode, row.citizenshipCountry);
    const pairKey = [row.countryOfDeathCode, row.citizenshipCountryCode]
      .sort()
      .join(":");
    pairSet.add(pairKey);
    totalCitations += row.sourceCount;
  }

  const bereavementRows = rows.filter(
    (r) => r.category === "cross-border-bereavement",
  );
  const terminalRows = rows.filter(
    (r) => r.category === "cross-border-terminal-illness",
  );

  const meanOf = (subset: readonly CorridorIntegrationRow[]): number =>
    subset.length
      ? round2(
          subset.reduce((acc, r) => acc + r.compositeScore, 0) / subset.length,
        )
      : 0;

  const cohortSpecs: ReadonlyArray<{
    id: StudyCohortId;
    label: string;
    description: string;
  }> = [
    {
      id: "intra_eu_efta",
      label: "Intra-EU & Switzerland",
      description:
        "Pairs combining overlapping civil-status exemptions (EU 2016/1191 or CIEC No. 16), EU Succession Reg. 650/2012, HCCH 2000 Adult Protection, and multilateral corpse laissez-passer treaties.",
    },
    {
      id: "commonwealth_reseal",
      label: "Commonwealth Resealing Network",
      description:
        "UK, Australia, Canada, New Zealand, Singapore, and South Africa sharing reciprocal probate grant resealing, Hague Apostilles, and English administrative records.",
    },
    {
      id: "other_global",
      label: "Non-Regional Global Corridors",
      description:
        "Transatlantic, Latin American, Middle Eastern, South Asian, East Asian, and Eastern European corridors primarily connected by the 1961 Hague Apostille Convention and consular channels.",
    },
    {
      id: "uk_eu_efta",
      label: "UK–EU / Switzerland Corridors",
      description:
        "Post-Brexit European corridors outside EU Regulations 2016/1191 and 650/2012, relying on Hague Apostilles (plus CIEC No. 16 outgoing acceptance), Scotland-only HCCH 2000 scope, and bilateral consular repatriation.",
    },
  ];

  const cohorts: CohortSummary[] = cohortSpecs.map((spec) => {
    const subset = rows.filter((r) => r.cohort === spec.id);
    return {
      id: spec.id,
      label: spec.label,
      description: spec.description,
      count: subset.length,
      meanScore: meanOf(subset),
    };
  });

  const bridge1Distribution = buildDistribution(
    rows.map((r) => r.docBridge),
    [
      {
        code: "exempt_from_legalization",
        label: "Apostille-exempt civil-status recognition (EU 2016/1191, CIEC No. 16, FR-MA, PL-UA)",
        scoreValue: 1.0,
      },
      {
        code: "hague_apostille",
        label: "Single-stamp 1961 Hague Apostille (HCCH #12)",
        scoreValue: 0.5,
      },
      {
        code: "consular_legalization",
        label: "MFA & embassy consular legalization (UAE, Egypt, and pre-Feb 2027 Thailand)",
        scoreValue: 0.0,
      },
    ],
  );

  const bridge2BereavementDistribution = buildDistribution(
    bereavementRows.map((r) => r.continuityBridge),
    [
      {
        code: "eu_650_ecs",
        label: "Unified EU Succession Regulation (EU) No 650/2012 & ECS",
        scoreValue: 1.0,
      },
      {
        code: "commonwealth_reseal",
        label: "Reciprocal Commonwealth probate grant resealing",
        scoreValue: 0.5,
      },
      {
        code: "parallel_domestic",
        label: "Parallel domestic probate / notarial succession in each state",
        scoreValue: 0.0,
      },
    ],
  );

  const bridge2TerminalDistribution = buildDistribution(
    terminalRows.map((r) => r.continuityBridge),
    [
      {
        code: "hcch_2000_adults",
        label: "2000 Hague Protection of Adults Convention (HCCH #35) in force in both states",
        scoreValue: 1.0,
      },
      {
        code: "hcch_2000_scotland_only",
        label: "HCCH #35 partial scope (UK ratified for Scotland only)",
        scoreValue: 0.5,
      },
      {
        code: "separate_domestic_poa",
        label: "Separate domestic Powers of Attorney & advance directives required",
        scoreValue: 0.0,
      },
    ],
  );

  const bridge3Distribution = buildDistribution(
    rows.map((r) => r.repatriationBridge),
    [
      {
        code: "multilateral_laissez_passer",
        label: "Multilateral corpse laissez-passer (Strasbourg 1973 ETS 080 / Berlin 1937)",
        scoreValue: 1.0,
      },
      {
        code: "consular_mortuary_clearance",
        label: "Bilateral consular mortuary clearance / NOC & border health permits",
        scoreValue: 0.0,
      },
    ],
  );

  const bridge4Distribution = buildDistribution(
    rows.map((r) => r.languageBridge),
    [
      {
        code: "shared_official_lang",
        label: "Shared official or co-official administrative language",
        scoreValue: 1.0,
      },
      {
        code: "multilingual_civil_form",
        label: "Standardized multilingual civil-status form (EU 2016/1191 or CIEC Form C)",
        scoreValue: 0.5,
      },
      {
        code: "certified_translation",
        label: "Certified or sworn translation required across filings",
        scoreValue: 0.0,
      },
    ],
  );

  const exemptCount =
    bridge1Distribution.find((b) => b.code === "exempt_from_legalization")
      ?.count ?? 0;
  const apostilleCount =
    bridge1Distribution.find((b) => b.code === "hague_apostille")?.count ?? 0;
  const apostilleOrExemptCount = exemptCount + apostilleCount;
  const thailandFeb2027Count = rows.filter(
    (r) => r.thailandFeb2027Transition,
  ).length;
  const bereavementParallelEstateCount =
    bridge2BereavementDistribution.find((b) => b.code === "parallel_domestic")
      ?.count ?? 0;
  const terminalGapCount =
    bridge2TerminalDistribution.find((b) => b.code === "separate_domestic_poa")
      ?.count ?? 0;
  const repatriationGapCount =
    bridge3Distribution.find((b) => b.code === "consular_mortuary_clearance")
      ?.count ?? 0;

  const countries = Array.from(countryMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  cachedStudy = {
    publishedDate: STUDY_1_PUBLISHED_DATE,
    verifySnapshot: STUDY_1_VERIFY_SNAPSHOT,
    totalCorridors: rows.length,
    bereavementCount: bereavementRows.length,
    terminalCount: terminalRows.length,
    uniqueCountryCount: countryMap.size,
    uniquePairCount: pairSet.size,
    totalVerifiedCitationsInStudyCorridors: totalCitations,
    overallMeanScore: meanOf(rows),
    bereavementMeanScore: meanOf(bereavementRows),
    terminalMeanScore: meanOf(terminalRows),
    fullScoreCount: rows.filter((r) => r.compositeScore === 4.0).length,
    zeroScoreCount: rows.filter((r) => r.compositeScore === 0.0).length,
    apostilleOrExemptCount,
    apostilleOrExemptPct: round1((apostilleOrExemptCount / rows.length) * 100),
    thailandFeb2027Count,
    postFeb2027ApostilleOrExemptPct: round1(
      ((apostilleOrExemptCount + thailandFeb2027Count) / rows.length) * 100,
    ),
    bereavementParallelEstateCount,
    bereavementParallelEstatePct: round1(
      (bereavementParallelEstateCount / bereavementRows.length) * 100,
    ),
    terminalGapCount,
    terminalGapPct: round1((terminalGapCount / terminalRows.length) * 100),
    repatriationGapCount,
    repatriationGapPct: round1((repatriationGapCount / rows.length) * 100),
    cohorts,
    bridge1Distribution,
    bridge2BereavementDistribution,
    bridge2TerminalDistribution,
    bridge3Distribution,
    bridge4Distribution,
    countries,
    rows,
    depositarySources: DEPOSITARY_SOURCES,
  };

  return cachedStudy;
}

function csvCell(value: string | number | boolean): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Serialize the 200-corridor integration index as RFC-4180 UTF-8 CSV for direct download and verification. */
export function serializeCrossBorderStudyCsv(
  study: CrossBorderIntegrationStudy = getCrossBorderIntegrationStudy(),
): string {
  const header = [
    "id",
    "slug",
    "guide_url",
    "lifecycle_track",
    "country_1_code",
    "country_1_name",
    "country_2_code",
    "country_2_name",
    "cohort",
    "composite_score",
    "doc_bridge_score",
    "doc_bridge_code",
    "doc_bridge_instrument",
    "continuity_bridge_score",
    "continuity_bridge_code",
    "continuity_bridge_instrument",
    "repatriation_bridge_score",
    "repatriation_bridge_code",
    "repatriation_bridge_instrument",
    "language_bridge_score",
    "language_bridge_code",
    "language_bridge_instrument",
    "verified_official_sources",
    "thailand_feb_2027_transition",
    "last_reviewed",
  ];

  const lines = [header.join(",")];
  for (const r of study.rows) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(r.slug),
        csvCell(`https://clarvia.org${r.guideHref}`),
        csvCell(r.category),
        csvCell(r.countryOfDeathCode),
        csvCell(r.countryOfDeath),
        csvCell(r.citizenshipCountryCode),
        csvCell(r.citizenshipCountry),
        csvCell(r.cohort),
        csvCell(r.compositeScore.toFixed(2)),
        csvCell(r.docBridge.score.toFixed(1)),
        csvCell(r.docBridge.code),
        csvCell(r.docBridge.instrument),
        csvCell(r.continuityBridge.score.toFixed(1)),
        csvCell(r.continuityBridge.code),
        csvCell(r.continuityBridge.instrument),
        csvCell(r.repatriationBridge.score.toFixed(1)),
        csvCell(r.repatriationBridge.code),
        csvCell(r.repatriationBridge.instrument),
        csvCell(r.languageBridge.score.toFixed(1)),
        csvCell(r.languageBridge.code),
        csvCell(r.languageBridge.instrument),
        csvCell(r.sourceCount),
        csvCell(r.thailandFeb2027Transition),
        csvCell(r.lastReviewed),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Serialize the full study metadata, aggregates, depositary sources, and 200 rows as reproducible JSON. */
export function serializeCrossBorderStudyJson(
  study: CrossBorderIntegrationStudy = getCrossBorderIntegrationStudy(),
): string {
  const payload = {
    title:
      "Cross-Border Bereavement & Serious Illness Administrative Integration Index (2026)",
    publisher: "Clarvia ASBL (RCS Luxembourg F15680)",
    license: "CC-BY-4.0",
    publishedDate: study.publishedDate,
    verifySnapshot: study.verifySnapshot,
    canonicalUrl: STUDY_1_CANONICAL_URL,
    csvUrl: `https://clarvia.org${STUDY_1_CSV_PATH}`,
    jsonUrl: `https://clarvia.org${STUDY_1_JSON_PATH}`,
    zenodoDatasetDoi: ZENODO_STUDY_CORPUS_DOI,
    zenodoDatasetRecordUrl: ZENODO_RECORD_URL,
    zenodoSoftwareDoi: ZENODO_SOFTWARE_DOI,
    zenodoSoftwareRecordUrl: ZENODO_SOFTWARE_RECORD_URL,
    scoringCodeUrl: GITHUB_STUDY_SOURCE_URL,
    summary: {
      totalCorridors: study.totalCorridors,
      bereavementCount: study.bereavementCount,
      terminalCount: study.terminalCount,
      uniqueCountryCount: study.uniqueCountryCount,
      uniquePairCount: study.uniquePairCount,
      totalVerifiedCitationsInStudyCorridors:
        study.totalVerifiedCitationsInStudyCorridors,
      fullCorpusCanonicalGuides: CORPUS_STATS.canonicalGuides,
      fullCorpusLocalizedPages: CORPUS_STATS.localizedPages,
      fullCorpusVerifiedOfficialCitations:
        CORPUS_STATS.verifiedOfficialCitations,
      overallMeanScore: study.overallMeanScore,
      bereavementMeanScore: study.bereavementMeanScore,
      terminalMeanScore: study.terminalMeanScore,
      fullScoreCount: study.fullScoreCount,
      zeroScoreCount: study.zeroScoreCount,
      apostilleOrExemptCount: study.apostilleOrExemptCount,
      apostilleOrExemptPct: study.apostilleOrExemptPct,
      thailandFeb2027Count: study.thailandFeb2027Count,
      postFeb2027ApostilleOrExemptPct: study.postFeb2027ApostilleOrExemptPct,
      bereavementParallelEstateCount: study.bereavementParallelEstateCount,
      bereavementParallelEstatePct: study.bereavementParallelEstatePct,
      terminalGapCount: study.terminalGapCount,
      terminalGapPct: study.terminalGapPct,
      repatriationGapCount: study.repatriationGapCount,
      repatriationGapPct: study.repatriationGapPct,
    },
    cohorts: study.cohorts,
    bridge1Distribution: study.bridge1Distribution,
    bridge2BereavementDistribution: study.bridge2BereavementDistribution,
    bridge2TerminalDistribution: study.bridge2TerminalDistribution,
    bridge3Distribution: study.bridge3Distribution,
    bridge4Distribution: study.bridge4Distribution,
    depositarySources: study.depositarySources,
    rows: study.rows,
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}
