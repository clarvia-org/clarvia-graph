import {
  corridorGuidePath,
  publishedCorridorGuides,
  type CorridorGuide,
} from "@/content/corridor-guides";
import {
  CORPUS_STATS,
  DATA_EUROPA_URL,
  DATA_PUBLIC_LU_URL,
  EC_OSOR_URL,
  GITHUB_REPO_URL,
  HCCH_12_IN_FORCE_2026_11,
  MACRO_REGION_BY_ISO,
  MACRO_REGION_ORDER,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
  type ApostilleStatus,
  type MacroRegion,
} from "./post-death-civil-registration-study";

export {
  CORPUS_STATS,
  DATA_EUROPA_URL,
  DATA_PUBLIC_LU_URL,
  EC_OSOR_URL,
  GITHUB_REPO_URL,
  HCCH_12_IN_FORCE_2026_11,
  MACRO_REGION_BY_ISO,
  MACRO_REGION_ORDER,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
  type ApostilleStatus,
  type MacroRegion,
};

export const STUDY_3_PUBLISHED_DATE = "2026-11-18";
export const STUDY_3_VERIFY_SNAPSHOT = "November 2026";
export const STUDY_3_SLUG =
  "global-advance-directives-incapacity-mandates-atlas";
export const STUDY_3_CANONICAL_URL =
  "https://clarvia.org/en/research/global-advance-directives-incapacity-mandates-atlas";
export const STUDY_3_CSV_PATH =
  "/data/research/global-advance-directives-incapacity-mandates-2026.csv";
export const STUDY_3_JSON_PATH =
  "/data/research/global-advance-directives-incapacity-mandates-2026.json";
export const STUDY_3_PDF_PATH =
  "/data/research/global-advance-directives-incapacity-mandates-2026.pdf";
export const GITHUB_STUDY_3_SOURCE_URL =
  "https://github.com/clarvia-org/clarvia-graph/blob/main/apps/web/src/content/research/advance-directives-incapacity-study.ts";

export type AdvanceDirectiveRegime =
  | "statute_with_national_register"
  | "binding_statute_local_or_subnational"
  | "patients_rights_or_clinical_framework"
  | "general_consent_or_family_consultation";

export type IncapacityMandateRegime =
  | "continuing_or_lasting_poa"
  | "advance_guardian_or_support_designation"
  | "ordinary_poa_court_guardianship";

export type CaregiverProtectionRegime =
  | "paid_caregiver_or_palliative_leave"
  | "carer_allowance_or_job_protected_leave"
  | "patient_sick_or_invalidity_only";

export type Hcch35Status =
  | "in_force_nationwide"
  | "in_force_scotland_only"
  | "acceded_eif_aug_2027"
  | "signed_not_ratified"
  | "non_party";

export type CorridorHcch35Portability =
  | "mutual_nationwide"
  | "partial_uk_scotland"
  | "one_sided_party"
  | "neither_party";

/** Official HCCH #35 (2000 Protection of Adults Convention) Contracting States in force nationwide as of November 2026. */
export const HCCH_35_IN_FORCE_NATIONWIDE_2026_11 = new Set([
  "AT",
  "BE",
  "CH",
  "CY",
  "CZ",
  "DE",
  "EE",
  "FI",
  "FR",
  "GR",
  "IE",
  "LV",
  "MC",
  "MT",
  "PT",
]);

/** United Kingdom ratified HCCH #35 with territorial extension to Scotland only (not England & Wales or Northern Ireland). */
export const HCCH_35_SCOTLAND_ONLY_2026_11 = new Set(["GB"]);

/** Montenegro acceded to HCCH #35 on 13 October 2026; enters into force on 1 August 2027. */
export const HCCH_35_ACCEDED_EIF_AUG_2027 = new Set(["ME"]);

/** Signatory states to HCCH #35 that have signed without ratifying as of November 2026. */
export const HCCH_35_SIGNED_NOT_RATIFIED_2026_11 = new Set([
  "IT",
  "LU",
  "NL",
  "PL",
  "RO",
]);

export const ADVANCE_DIRECTIVE_META: Record<
  AdvanceDirectiveRegime,
  { rank: number; label: string; shortLabel: string; description: string }
> = {
  statute_with_national_register: {
    rank: 1,
    label: "Binding statute with national registry or e-health lookup",
    shortLabel: "Statute + national registry",
    description:
      "Enacted national legislation provides a legally binding advance healthcare directive or living will backed by a dedicated national registry or nationwide electronic health record lookup accessible to treating clinicians.",
  },
  binding_statute_local_or_subnational: {
    rank: 2,
    label: "Binding statute (clinician, notary, or sub-national filing)",
    shortLabel: "Binding statute (local / state)",
    description:
      "Dedicated national, constitutional-court, or state/provincial statutes recognize binding advance healthcare directives and medical proxies, stored with clinicians, civil-law notaries, or sub-national systems rather than one central national database.",
  },
  patients_rights_or_clinical_framework: {
    rank: 3,
    label: "Patients' rights written-refusal or medical-council framework",
    shortLabel: "Patients' rights / clinical rules",
    description:
      "Enacted Patients' Rights, Public Health, or Palliative Care statutes or national medical-council guidelines formally govern written treatment refusals, palliative care goals, and designated hospital spokespersons without a standalone living-will statute.",
  },
  general_consent_or_family_consultation: {
    rank: 4,
    label: "Contemporaneous clinical consent & family consultation",
    shortLabel: "Clinical consent & family consult",
    description:
      "Medical treatment decisions rely on contemporaneous patient consent while competent and physician-family consultation thereafter, without a dedicated statutory advance-directive or codified advance-refusal regime.",
  },
};

export const INCAPACITY_MANDATE_META: Record<
  IncapacityMandateRegime,
  { rank: number; label: string; shortLabel: string; description: string }
> = {
  continuing_or_lasting_poa: {
    rank: 1,
    label: "Continuing, lasting, or durable Power of Attorney",
    shortLabel: "Continuing / lasting PoA",
    description:
      "Dedicated statutory enduring, lasting, durable, or future power of attorney survives or activates upon loss of mental capacity (immediately, upon medical certification, or via administrative/notarial registration) without court-appointed guardianship.",
  },
  advance_guardian_or_support_designation: {
    rank: 2,
    label: "Notarized voluntary guardianship or CRPD support designation",
    shortLabel: "Voluntary guardian / support deed",
    description:
      "Enacted civil-code or UN CRPD legislation allows a capable adult to execute a notarized voluntary-guardianship contract or preventive support/accompaniment designation that binds or guides supervisory or court activation if capacity declines.",
  },
  ordinary_poa_court_guardianship: {
    rank: 3,
    label: "Ordinary PoA lapses; court guardianship on incapacity",
    shortLabel: "Ordinary PoA (court guardianship)",
    description:
      "Standard civil or common-law mandates require ongoing capacity and terminate, freeze, or become legally vulnerable upon mental incapacity, requiring judicial guardianship, curatorship, or interdiction proceedings.",
  },
};

export const CAREGIVER_PROTECTION_META: Record<
  CaregiverProtectionRegime,
  { rank: number; label: string; shortLabel: string; description: string }
> = {
  paid_caregiver_or_palliative_leave: {
    rank: 1,
    label: "Statutory paid caregiver or end-of-life accompaniment leave",
    shortLabel: "Paid caregiver / palliative leave",
    description:
      "National employment or social-insurance legislation provides paid or wage-replaced leave specifically for employed relatives caring for or accompanying a seriously ill or dying family member.",
  },
  carer_allowance_or_job_protected_leave: {
    rank: 2,
    label: "Statutory carer cash allowance or job-protected unpaid leave",
    shortLabel: "Carer allowance / protected leave",
    description:
      "Statute provides either a dedicated monthly caregiver/constant-attendance cash supplement or job-protected unpaid family-caregiver / inpatient-companion leave.",
  },
  patient_sick_or_invalidity_only: {
    rank: 3,
    label: "Patient sick pay, invalidity pension, or fund withdrawal only",
    shortLabel: "Patient sick / invalidity cover",
    description:
      "Statutory protection centers on the ill person's own paid sick leave, contributory invalidity pension, or early provident-fund medical withdrawal, while family caregivers rely on annual or employer-agreed leave.",
  },
};

export const HCCH_35_STATUS_META: Record<
  Hcch35Status,
  { rank: number; label: string; shortLabel: string; description: string }
> = {
  in_force_nationwide: {
    rank: 1,
    label: "HCCH #35 in force nationwide",
    shortLabel: "HCCH #35 nationwide",
    description:
      "2000 Hague Protection of Adults Convention is in force nationwide, providing treaty rules on jurisdiction, applicable law, and cross-border recognition of powers of representation granted for incapacity.",
  },
  in_force_scotland_only: {
    rank: 2,
    label: "HCCH #35 in force for Scotland only (UK)",
    shortLabel: "HCCH #35 (Scotland only)",
    description:
      "United Kingdom ratification extends strictly to Scotland; Continuing and Welfare Powers of Attorney under Scots law fall within HCCH #35, whereas England & Wales LPAs and Northern Ireland EPAs remain outside treaty scope.",
  },
  acceded_eif_aug_2027: {
    rank: 3,
    label: "Acceded Oct 2026 (enters into force 1 Aug 2027)",
    shortLabel: "EIF 1 Aug 2027 (ME)",
    description:
      "Montenegro deposited its instrument of accession on 13 October 2026; HCCH #35 enters into force for Montenegro on 1 August 2027.",
  },
  signed_not_ratified: {
    rank: 4,
    label: "Signed HCCH #35 (not yet ratified / not in force)",
    shortLabel: "Signed, not ratified",
    description:
      "State has signed the 2000 Hague Protection of Adults Convention (Italy, Luxembourg, Netherlands, Poland, Romania) without ratifying; domestic conflict-of-laws rules govern foreign mandates.",
  },
  non_party: {
    rank: 5,
    label: "Non-party to HCCH #35 (domestic recognition rules)",
    shortLabel: "Non-party",
    description:
      "Outside the 2000 Hague Protection of Adults Convention; foreign powers of attorney and guardianship orders have no automatic multilateral recognition and typically require local execution or court validation.",
  },
};

export const CORRIDOR_HCCH_35_META: Record<
  CorridorHcch35Portability,
  { rank: number; label: string; shortLabel: string; description: string }
> = {
  mutual_nationwide: {
    rank: 1,
    label: "Mutual nationwide HCCH #35 portability",
    shortLabel: "Mutual HCCH #35",
    description:
      "Both corridor states apply the 2000 Hague Protection of Adults Convention nationwide, enabling treaty-backed recognition of incapacity mandates (Article 15) and Central Authority coordination.",
  },
  partial_uk_scotland: {
    rank: 2,
    label: "Sub-national UK-Scotland HCCH #35 portability only",
    shortLabel: "Partial (UK Scotland only)",
    description:
      "Partner state applies HCCH #35 nationwide while UK ratification covers Scotland only; England & Wales LPAs and Northern Ireland EPAs require separate local mandates or court steps.",
  },
  one_sided_party: {
    rank: 3,
    label: "Asymmetric (only one state in HCCH #35)",
    shortLabel: "One-sided HCCH #35",
    description:
      "Only one of the two corridor countries is a Contracting State to HCCH #35, leaving families without a reciprocal treaty bridge and generally requiring parallel local mandates while capacity holds.",
  },
  neither_party: {
    rank: 4,
    label: "Neither state in HCCH #35 (parallel local mandates)",
    shortLabel: "Neither party",
    description:
      "Neither corridor state participates in HCCH #35; cross-border bank accounts, care decisions, and property require separate compliant domestic mandates in each country before capacity declines.",
  },
};

export const AHD_TIER_1_BY_ISO: Record<string, string> = {
  AD: "Binding Document de Voluntats Anticipades registered in National Registry (RNVA) linked to shared EHR",
  AT: "Binding Patientenverfügung (PatVG) registered in Patientenverfügungsregister and ELGA electronic health record",
  BE: "Binding negative healthcare directive and euthanasia advance directive with SPF Santé publique registration",
  DE: "Binding Patientenverfügung (§ 1827 BGB) with 24/7 clinician and court notice lookup via Central Register (ZVR)",
  DK: "Binding Behandlingstestamente registered digitally in Sundhedsdatastyrelsen national register (Sundhed.dk)",
  ES: "Binding Instrucciones Previas (Law 41/2002 Art. 11) synchronized in National Registry (RNIP)",
  FI: "Binding Hoitotahto (Patient Rights Act 785/1992) recorded directly in national MyKanta (OmaKanta) repository",
  FR: "Binding Directives anticipées (Claeys-Leonetti Act) stored in national Mon espace santé shared record",
  IL: "Dying Patient Act 2005 Advance Medical Directives scanned into Ministry of Health national database",
  IS: "Binding end-of-life treatment directive recorded digitally in national Lífsskrá registry via Heilsuvera",
  IT: "Binding Disposizioni Anticipate di Trattamento (Law 219/2017) transmitted to National DAT Database",
  KR: "Statutory Advance Directive registered in National Agency for Management of Life-Sustaining Treatment database",
  LT: "Notarized Civil Code Advance Instruction (išankstinis nurodymas) in national Register of Powers of Attorney and esveikata.lt",
  PT: "Binding Testamento Vital / DAV (Law 25/2012) registered in National Living Will Register (RENTEV)",
  SG: "Statutory Advance Medical Directive (AMD Registrar) alongside myACP in National Electronic Health Record (NEHR)",
  SI: "Statutory advance expression of will (ZPacP Art. 34) and healthcare proxy recorded in central ZZZS health card registry",
  TH: "National Health Act B.E. 2550 Section 12 Living Will with digital e-Living Will registration (NHCO via ThaID)",
  TW: "Patient Right to Autonomy Act Advance Decision and Hospice Act DNR registered on national NHI IC Card",
  UY: "Statutory Voluntad Anticipada (Law 18.473) uploaded mandatorily to national electronic medical record",
};

export const AHD_TIER_2_BY_ISO: Record<string, string> = {
  AR: "Binding advance medical directives (Law 26.529 and Dignified Death Law 26.742) before civil-law notary or judge",
  AU: "State and territory statutory Advance Care Directives (uploadable to federal My Health Record)",
  CA: "Provincial and territorial statutory Advance Healthcare Directives, Personal Directives, and Representation Agreements",
  CH: "Binding written Patientenverfügung (Swiss Civil Code Art. 370 ZGB) noted on health insurance card or EPD",
  CL: "Statutory terminal-illness advance directives (Law 20.584 Art. 16 and Universal Palliative Care Law 21.375)",
  CO: "Statutory Advance Directive Document (DVA, Law 1733/2014 and Res. 2665/2018) before physician, witnesses, or notary",
  CU: "Family Code notarial deed of self-protection (escritura de autoprotección) executed before State Notary",
  CZ: "Binding statutory advance directive (dříve vyslovené přání, Health Services Act § 36) with verified signature or chart entry",
  GB: "Statutory Advance Decision to Refuse Treatment (MCA 2005 in E&W; NI ADRT; Scottish Advance Directive) plus ReSPECT plan",
  GE: "Law on Patient Rights statutory written advance will covering resuscitation and life-supporting interventions",
  HR: "Family Act notarized anticipated order (anticipirana naredba) binding healthcare decisions, logged in e-Karton",
  HU: "Healthcare Act CLIV/1997 binding advance medical directive in public deed plus EESZT digital proxy registration",
  IE: "Assisted Decision-Making (Capacity) Act 2015 Advance Healthcare Directive and Designated Healthcare Representative",
  IN: "Supreme Court Constitution Bench binding Advance Medical Directive framework (2018 and Jan 2023 attestation order)",
  LI: "Binding Patientenverfügung under Patient Directive Act (PatVG) executed before physician and notary or attorney",
  LU: "Law of 16 March 2009 on Palliative Care directive anticipée and personne de confiance (separate commission register for euthanasia provisions)",
  MX: "State-level Voluntad Anticipada statutes (Mexico City and 15+ states) executed before notary or healthcare facility",
  NL: "Binding written behandelverbod / schriftelijke wilsverklaring (WGBO) recorded with GP (huisarts) or in levenstestament",
  NZ: "Legally recognized Advance Directive under Right 7(5) of the Code of Health and Disability Services Consumers' Rights",
  US: "50-state statutory Living Wills, Durable Powers of Attorney for Health Care, and actionable POLST/MOLST orders",
};

export const AHD_TIER_3_COUNTRIES = new Set([
  "AE","AL","AM","AO","AZ","BA","BG","BJ","BO","BR","BW","BY","CR","CY","DO","EC",
  "EE","GH","GR","GT","HN","ID","JO","JP","KG","KW","KZ","LB","LV","MC","MD","ME",
  "MK","MN","MT","MY","NG","NI","NO","NP","OM","PA","PE","PH","PL","PS","PY","QA",
  "RO","RS","RU","SA","SE","SK","SM","SN","SV","TG","TL","TR","UA","UG","UZ","VE",
  "VN","XK","ZA",
]);

export const CONTINUING_POA_BY_ISO: Record<string, string> = {
  AT: "Enduring Vorsorgevollmacht registered and activated in ÖZVV (Austrian Chamber of Civil-Law Notaries)",
  AU: "State and territory Enduring Power of Attorney and Enduring Guardian / Medical Treatment Decision Maker",
  BE: "Extrajudicial protection mandate (mandat de protection extrajudiciaire / zorgvolmacht) in Central Register of Mandate Contracts",
  CA: "Provincial Continuing or Enduring Power of Attorney for Property and Quebec Protection Mandate",
  CH: "Holographic or notarized Vorsorgeauftrag (Art. 360 ZGB), storage registered at Zivilstandsamt and validated by KESB",
  DE: "Durable Vorsorgevollmacht (§ 1820 BGB) registered in Central Register of Advance Directives (ZVR)",
  DK: "Future Power of Attorney (fremtidsfuldmagt) in Fremtidsfuldmagtsregisteret, activated by Familieretshuset",
  ES: "Notarial Preventive Power of Attorney (poder preventivo, Law 8/2021) with ex-officio Civil Registry notice",
  FI: "Continuing Power of Attorney (edunvalvontavaltuutus, Act 648/2007) confirmed upon incapacity by DVV",
  FR: "Future Protection Mandate (mandat de protection future, notarial or Cerfa) certified by judicial court registry",
  GB: "Lasting Power of Attorney (E&W), Continuing/Welfare PoA (Scotland), or Enduring PoA (NI) registered with OPG",
  IE: "Enduring Power of Attorney registered and activated digitally through the Decision Support Service (DSS)",
  IL: "Enduring Power of Attorney (Yipui Koach Mitmashech) deposited electronically with the Guardian General",
  IS: "Continuing Power of Attorney (vedurfarandi umboð, Lögræðislög) confirmed upon incapacity by Sýslumenn",
  LI: "Continuing Power of Attorney (Vorsorgevollmacht, § 284f ABGB) registered at Princely Court of Justice",
  LV: "Notarized Future Power of Attorney (nākotnes pilnvarojums) recorded in official Power of Attorney Register",
  NL: "Notarial living will and enduring PoA (notarieel levenstestament) registered in Central Register (CLTR)",
  NO: "Continuing Power of Attorney (fremtidsfullmakt, Vergemålsloven Ch. 10) confirmed by County Governor (Statsforvalteren)",
  NZ: "Enduring Power of Attorney for Property and Personal Care & Welfare (PPPR Act 1988)",
  SE: "Continuing Power of Attorney (framtidsfullmakt, Act 2017:310) surviving permanent incapacity",
  SG: "Digital Lasting Power of Attorney (LPA Form 1 or 2) registered via Office of the Public Guardian Online (OPGO)",
  US: "State-law Durable Financial Power of Attorney (UPOAA / state statutory forms) surviving incapacity",
};

export const VOLUNTARY_GUARDIAN_OR_SUPPORT_BY_ISO: Record<string, string> = {
  CN: "Civil Code Art. 33 notarized Voluntary Guardianship Agreement (Yiding Jianhu) taking effect upon loss of capacity",
  CO: "Law 1996 of 2019 notarial or conciliation support agreements (acuerdos de apoyo) and advance directives",
  CR: "Law 9379 preventive autonomy support safeguards by notarial deed alongside RNP Digital plenary mandate",
  CU: "Family Code notarial deed of self-protection (escritura de autoprotección) before State Notary",
  CZ: "Civil Code §§ 38-44 preventive guardianship declaration (předběžné prohlášení) guiding court guardian appointment",
  HR: "Family Act notarized anticipated order (anticipirana naredba) pre-designating personal/healthcare guardian",
  HU: "Civil Code preventive legal declaration (előzetes jognyilatkozat) in National Register of Advance Declarations",
  IT: "Law 6/2004 advance notarial designation of future Support Administrator (amministratore di sostegno)",
  JP: "Notarized Voluntary Guardianship Contract (Nin'i Koken Keiyaku) in Adult Guardianship Registry, activated via Family Court supervisor",
  KR: "Notarized Voluntary Guardianship Contract (Im-ui Hugyeon Gyeyak) registered with Family Court and activated via supervisor",
  LT: "Notarized Civil Code Advance Instruction (išankstinis nurodymas) registered in Register of Powers of Attorney",
  PE: "Legislative Decree 1384 preventive notarial designation of future support and safeguards (apoyos y salvaguardias) in SUNARP",
  PT: "Civil Code Art. 156 preventive mandate with a view to accompaniment (mandato com vista a acompanhamento, Law 49/2018)",
  TW: "Civil Code Art. 1113-2 notarized Adult Guardianship by Agreement (Yiding Jianhu) notified to District Court",
};

export const PAID_CAREGIVER_LEAVE_COUNTRIES = new Set([
  "AT","AU","BA","BE","BG","CA","CH","CO","CR","CZ","DE","DK","EE","ES","FI","FR",
  "HR","ID","IE","IL","IT","JP","KI","LT","LU","ME","MV","NL","NO","NZ","PE","PL",
  "RO","RS","SE","SI","SK","UZ","WS","ZA",
]);

export const CARER_ALLOWANCE_OR_PROTECTED_LEAVE_COUNTRIES = new Set([
  "AL","AM","AR","BH","BJ","BO","BR","BY","CG","CL","CU","CV","CY","DZ","EC","GB",
  "GQ","GR","HU","IQ","IS","JO","KR","KW","KZ","LI","LV","MA","MC","MD","MK","MN",
  "MT","MU","MX","MY","PA","PT","QA","RU","SA","SC","SG","SM","TD","TG","TH","TN",
  "TR","TW","UA","US","UY","XK",
]);

const APOSTILLE_LABEL_BY_STATUS: Record<ApostilleStatus, string> = {
  in_force_2026: "HCCH #12 in force",
  entering_force_feb_2027: "EIF 28 Feb 2027 (TH)",
  consular_legalization_required: "Consular legalization",
};

export type Study3DistributionBucket<Code extends string> = {
  code: Code;
  label: string;
  shortLabel: string;
  description: string;
  count: number;
  pct: number;
};

export type Study3MacroRegionSummary = {
  region: MacroRegion;
  countryCount: number;
  statutoryAhdCount: number;
  statutoryAhdPct: number;
  nationalAhdRegisterCount: number;
  nationalAhdRegisterPct: number;
  incapacityPlanningCount: number;
  incapacityPlanningPct: number;
  paidOrAllowanceCarerCount: number;
  paidOrAllowanceCarerPct: number;
  hcch35InForceNationwideCount: number;
  hcch35InForceNationwidePct: number;
  verifiedSourcesCount: number;
  verifiedContactsCount: number;
};

export type AdvanceDirectivesCountryRow = {
  id: string;
  countryCode: string;
  countryName: string;
  macroRegion: MacroRegion;
  guideSlug: string;
  guideHref: string;
  advanceDirectiveRegime: AdvanceDirectiveRegime;
  advanceDirectiveLabel: string;
  advanceDirectiveRank: number;
  advanceDirectiveSummary: string;
  incapacityMandateRegime: IncapacityMandateRegime;
  incapacityMandateLabel: string;
  incapacityMandateRank: number;
  incapacityMandateSummary: string;
  caregiverProtectionRegime: CaregiverProtectionRegime;
  caregiverProtectionLabel: string;
  caregiverProtectionRank: number;
  hcch35Status: Hcch35Status;
  hcch35StatusLabel: string;
  hcch35Rank: number;
  apostilleStatus: ApostilleStatus;
  apostilleStatusLabel: string;
  verifiedSourcesCount: number;
  verifiedContactsCount: number;
  localeCount: number;
  primarySourceTitle: string;
  primarySourcePublisher: string;
  primarySourceUrl: string;
  lastReviewed: string;
  searchText: string;
};

export type IncapacityCorridorPortabilityRow = {
  id: string;
  slug: string;
  guideHref: string;
  corridorCode: string;
  corridorLabel: string;
  countryACode: string;
  countryAName: string;
  countryBCode: string;
  countryBName: string;
  hcch35Portability: CorridorHcch35Portability;
  hcch35PortabilityLabel: string;
  mutualApostille: boolean;
  verifiedSourcesCount: number;
  verifiedContactsCount: number;
  localeCount: number;
  lastReviewed: string;
};

export type Study3ReferenceSource = {
  id: string;
  title: string;
  issuer: string;
  url: string;
  scope: string;
};

export const STUDY_3_REFERENCE_SOURCES: readonly Study3ReferenceSource[] = [
  {
    id: "hcch-35-status",
    title:
      "HCCH Convention #35 of 13 January 2000 on the International Protection of Adults: Official Status Table",
    issuer: "Hague Conference on Private International Law (HCCH)",
    url: "https://www.hcch.net/en/instruments/conventions/status-table/?cid=71",
    scope:
      "Primary treaty depositary status table verifying the 15 states with nationwide entry into force, the United Kingdom's Scotland-only territorial extension, Montenegro's 13 October 2026 accession (entering into force 1 August 2027), and the 5 unratified signatories as of November 2026.",
  },
  {
    id: "hcch-12-status",
    title:
      "HCCH Convention #12 of 5 October 1961 Abolishing the Requirement of Legalisation for Foreign Public Documents: Official Status Table",
    issuer: "Hague Conference on Private International Law (HCCH)",
    url: "https://www.hcch.net/en/instruments/conventions/status-table/?cid=41",
    scope:
      "Verifies Apostille treaty force across 127 of 196 sovereign countries in November 2026 (plus Thailand's 28 February 2027 entry into force) and across 39 of 40 cross-border serious-illness corridors.",
  },
  {
    id: "eu-com-2023-280-adults",
    title:
      "Proposal for a Regulation on Jurisdiction, Applicable Law, Recognition and Enforcement of Measures and Cooperation in Matters Relating to the Protection of Adults (COM(2023) 280 final)",
    issuer: "European Commission (EUR-Lex)",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52023PC0280",
    scope:
      "European Union legislative package addressing cross-border non-recognition of powers of representation and proposing a European Certificate of Representation alongside coordinated HCCH #35 participation.",
  },
  {
    id: "coe-rec-2009-11",
    title:
      "Recommendation CM/Rec(2009)11 on Principles Concerning Continuing Powers of Attorney and Advance Directives for Incapacity",
    issuer: "Council of Europe Committee of Ministers",
    url: "https://search.coe.int/cm/Pages/result_details.aspx?ObjectId=09000016805d0092",
    scope:
      "International legal benchmark favoring self-determination through continuing mandates and advance directives over judicial deprivation of legal capacity.",
  },
  {
    id: "un-crpd-art-12",
    title:
      "Convention on the Rights of Persons with Disabilities (CRPD), Article 12: Equal Recognition Before the Law",
    issuer: "United Nations Treaty Collection / OHCHR",
    url: "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-persons-disabilities",
    scope:
      "Global human-rights standard underpinning supported decision-making and advance support-agreement reforms across Latin America, Europe, and Asia.",
  },
  {
    id: "eu-work-life-2019-1158",
    title:
      "Directive (EU) 2019/1158 on Work-Life Balance for Parents and Carers (Article 6 Carers' Leave)",
    issuer: "European Parliament and Council of the European Union",
    url: "https://eur-lex.europa.eu/eli/dir/2019/1158/oj",
    scope:
      "Establishes a minimum statutory carers' leave floor across EU Member States alongside national paid palliative and family-caregiver benefit schemes.",
  },
  {
    id: "who-palliative-care",
    title: "Palliative Care: Health Systems, Essential Medicines, and Family Support",
    issuer: "World Health Organization (WHO)",
    url: "https://www.who.int/news-room/fact-sheets/detail/palliative-care",
    scope:
      "Global public-health benchmark on integrating advance care planning, pain relief, and family caregiver support into national health systems.",
  },
  {
    id: "clarvia-zenodo-24245341",
    title:
      "Clarvia Global Statutory Source & Reference Dataset for Terminal Illness and Bereavement Administration (592 Guides, 196 Countries & 200 Cross-Border Corridors)",
    issuer: "CERN Zenodo Open-Access Repository (CC BY 4.0)",
    url: ZENODO_RECORD_URL,
    scope:
      "Underlying 592-guide, 5,396-citation dataset from which all 196 domestic terminal-illness guides (1,541 citations) and 40 cross-border serious-illness guides (397 citations) in this atlas are derived.",
  },
];

export type AdvanceDirectivesIncapacityStudy = {
  publishedDate: string;
  verifySnapshot: string;
  totalCountries: number;
  totalCorridors: number;
  totalGuidesInStudy: number;
  macroRegionCount: number;
  totalVerifiedCitationsIn196Guides: number;
  totalVerifiedContactsIn196Guides: number;
  totalVerifiedCitationsIn40Corridors: number;
  totalVerifiedContactsIn40Corridors: number;
  totalVerifiedCitationsCombined: number;
  totalVerifiedContactsCombined: number;
  nationalAhdRegisterCount: number;
  nationalAhdRegisterPct: number;
  bindingStatutoryAhdCount: number;
  bindingStatutoryAhdPct: number;
  continuingPoaCount: number;
  continuingPoaPct: number;
  voluntaryGuardianOrSupportCount: number;
  voluntaryGuardianOrSupportPct: number;
  anyIncapacityPlanningCount: number;
  anyIncapacityPlanningPct: number;
  ordinaryPoaLapsesCount: number;
  ordinaryPoaLapsesPct: number;
  paidCaregiverLeaveCount: number;
  paidCaregiverLeavePct: number;
  anyStatutoryCarerSupportCount: number;
  anyStatutoryCarerSupportPct: number;
  patientOnlyProtectionCount: number;
  patientOnlyProtectionPct: number;
  hcch35NationwideCount: number;
  hcch35NationwidePct: number;
  hcch35WithoutNationwideForceCount: number;
  hcch35WithoutNationwideForcePct: number;
  apostilleInForceCount: number;
  apostilleInForcePct: number;
  postFeb2027ApostillePct: number;
  corridorMutualHcch35Count: number;
  corridorMutualHcch35Pct: number;
  corridorPartialUkScotlandCount: number;
  corridorPartialUkScotlandPct: number;
  corridorNoBilateralHcch35Count: number;
  corridorNoBilateralHcch35Pct: number;
  corridorMutualApostilleCount: number;
  corridorMutualApostillePct: number;
  corridorApostilleVsPortabilityGapPts: number;
  advanceDirectiveDistribution: Study3DistributionBucket<AdvanceDirectiveRegime>[];
  incapacityMandateDistribution: Study3DistributionBucket<IncapacityMandateRegime>[];
  caregiverProtectionDistribution: Study3DistributionBucket<CaregiverProtectionRegime>[];
  hcch35Distribution: Study3DistributionBucket<Hcch35Status>[];
  apostilleDistribution: Study3DistributionBucket<ApostilleStatus>[];
  corridorPortabilityDistribution: Study3DistributionBucket<CorridorHcch35Portability>[];
  macroRegionSummaries: Study3MacroRegionSummary[];
  rows: AdvanceDirectivesCountryRow[];
  corridorRows: IncapacityCorridorPortabilityRow[];
  referenceSources: readonly Study3ReferenceSource[];
};

let cachedStudy3: AdvanceDirectivesIncapacityStudy | null = null;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function pct1(part: number, total: number): number {
  return total > 0 ? round1((part / total) * 100) : 0;
}

function classifyHcch35Status(iso: string): Hcch35Status {
  if (HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(iso)) {
    return "in_force_nationwide";
  }
  if (HCCH_35_SCOTLAND_ONLY_2026_11.has(iso)) {
    return "in_force_scotland_only";
  }
  if (HCCH_35_ACCEDED_EIF_AUG_2027.has(iso)) {
    return "acceded_eif_aug_2027";
  }
  if (HCCH_35_SIGNED_NOT_RATIFIED_2026_11.has(iso)) {
    return "signed_not_ratified";
  }
  return "non_party";
}

function classifyTerminalIllnessCountryGuide(
  guide: CorridorGuide,
): AdvanceDirectivesCountryRow {
  const code = guide.countryOfDeathCode;
  const macroRegion = MACRO_REGION_BY_ISO[code];
  if (!macroRegion) {
    throw new Error(`Missing macro-region classification for country code: ${code}`);
  }

  let advanceDirectiveRegime: AdvanceDirectiveRegime;
  let advanceDirectiveSummary: string;
  if (code in AHD_TIER_1_BY_ISO) {
    advanceDirectiveRegime = "statute_with_national_register";
    advanceDirectiveSummary = AHD_TIER_1_BY_ISO[code];
  } else if (code in AHD_TIER_2_BY_ISO) {
    advanceDirectiveRegime = "binding_statute_local_or_subnational";
    advanceDirectiveSummary = AHD_TIER_2_BY_ISO[code];
  } else if (AHD_TIER_3_COUNTRIES.has(code)) {
    advanceDirectiveRegime = "patients_rights_or_clinical_framework";
    advanceDirectiveSummary =
      "Patients' rights or health-law written treatment-refusal and clinical spokesperson rules (no standalone national living-will register)";
  } else {
    advanceDirectiveRegime = "general_consent_or_family_consultation";
    advanceDirectiveSummary =
      "Contemporaneous clinical consent and family/physician consultation recorded in hospital chart";
  }

  let incapacityMandateRegime: IncapacityMandateRegime;
  let incapacityMandateSummary: string;
  if (code in CONTINUING_POA_BY_ISO) {
    incapacityMandateRegime = "continuing_or_lasting_poa";
    incapacityMandateSummary = CONTINUING_POA_BY_ISO[code];
  } else if (code in VOLUNTARY_GUARDIAN_OR_SUPPORT_BY_ISO) {
    incapacityMandateRegime = "advance_guardian_or_support_designation";
    incapacityMandateSummary = VOLUNTARY_GUARDIAN_OR_SUPPORT_BY_ISO[code];
  } else {
    incapacityMandateRegime = "ordinary_poa_court_guardianship";
    incapacityMandateSummary =
      "Ordinary mandate requires ongoing capacity; judicial guardianship, curatorship, or interdiction required upon incapacity";
  }

  const caregiverProtectionRegime: CaregiverProtectionRegime =
    PAID_CAREGIVER_LEAVE_COUNTRIES.has(code)
      ? "paid_caregiver_or_palliative_leave"
      : CARER_ALLOWANCE_OR_PROTECTED_LEAVE_COUNTRIES.has(code)
        ? "carer_allowance_or_job_protected_leave"
        : "patient_sick_or_invalidity_only";

  const hcch35Status = classifyHcch35Status(code);

  const apostilleStatus: ApostilleStatus = HCCH_12_IN_FORCE_2026_11.has(code)
    ? "in_force_2026"
    : code === "TH"
      ? "entering_force_feb_2027"
      : "consular_legalization_required";

  const primarySource = guide.sources[0];
  if (!primarySource) {
    throw new Error(`Guide ${guide.slug} (${code}) is missing primary source`);
  }

  const ahdMeta = ADVANCE_DIRECTIVE_META[advanceDirectiveRegime];
  const mandateMeta = INCAPACITY_MANDATE_META[incapacityMandateRegime];
  const carerMeta = CAREGIVER_PROTECTION_META[caregiverProtectionRegime];
  const hcch35Meta = HCCH_35_STATUS_META[hcch35Status];

  const primaryContactNames = guide.contacts
    .slice(0, 3)
    .map((c) => c.name)
    .join(" ");

  const searchText = [
    guide.countryOfDeath,
    code,
    macroRegion,
    ahdMeta.shortLabel,
    advanceDirectiveSummary,
    mandateMeta.shortLabel,
    incapacityMandateSummary,
    carerMeta.shortLabel,
    hcch35Meta.shortLabel,
    APOSTILLE_LABEL_BY_STATUS[apostilleStatus],
    primarySource.publisher,
    primaryContactNames,
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: guide.id,
    countryCode: code,
    countryName: guide.countryOfDeath,
    macroRegion,
    guideSlug: guide.slug,
    guideHref: corridorGuidePath(guide.slug, "en"),
    advanceDirectiveRegime,
    advanceDirectiveLabel: ahdMeta.shortLabel,
    advanceDirectiveRank: ahdMeta.rank,
    advanceDirectiveSummary,
    incapacityMandateRegime,
    incapacityMandateLabel: mandateMeta.shortLabel,
    incapacityMandateRank: mandateMeta.rank,
    incapacityMandateSummary,
    caregiverProtectionRegime,
    caregiverProtectionLabel: carerMeta.shortLabel,
    caregiverProtectionRank: carerMeta.rank,
    hcch35Status,
    hcch35StatusLabel: hcch35Meta.shortLabel,
    hcch35Rank: hcch35Meta.rank,
    apostilleStatus,
    apostilleStatusLabel: APOSTILLE_LABEL_BY_STATUS[apostilleStatus],
    verifiedSourcesCount: guide.sources.length,
    verifiedContactsCount: guide.contacts.length,
    localeCount: guide.locales.length,
    primarySourceTitle: primarySource.title,
    primarySourcePublisher: primarySource.publisher,
    primarySourceUrl: primarySource.url,
    lastReviewed: guide.lastReviewed,
    searchText,
  };
}

function classifyCorridorGuide(
  guide: CorridorGuide,
): IncapacityCorridorPortabilityRow {
  const a = guide.countryOfDeathCode;
  const b = guide.citizenshipCountryCode;

  let hcch35Portability: CorridorHcch35Portability;
  if (
    HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(a) &&
    HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(b)
  ) {
    hcch35Portability = "mutual_nationwide";
  } else if (
    (HCCH_35_SCOTLAND_ONLY_2026_11.has(a) &&
      HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(b)) ||
    (HCCH_35_SCOTLAND_ONLY_2026_11.has(b) &&
      HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(a))
  ) {
    hcch35Portability = "partial_uk_scotland";
  } else if (
    HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(a) ||
    HCCH_35_SCOTLAND_ONLY_2026_11.has(a) ||
    HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(b) ||
    HCCH_35_SCOTLAND_ONLY_2026_11.has(b)
  ) {
    hcch35Portability = "one_sided_party";
  } else {
    hcch35Portability = "neither_party";
  }

  const mutualApostille =
    HCCH_12_IN_FORCE_2026_11.has(a) && HCCH_12_IN_FORCE_2026_11.has(b);

  return {
    id: guide.id,
    slug: guide.slug,
    guideHref: corridorGuidePath(guide.slug, "en"),
    corridorCode: `${a}-${b}`,
    corridorLabel: `${guide.countryOfDeath} / ${guide.citizenshipCountry}`,
    countryACode: a,
    countryAName: guide.countryOfDeath,
    countryBCode: b,
    countryBName: guide.citizenshipCountry,
    hcch35Portability,
    hcch35PortabilityLabel: CORRIDOR_HCCH_35_META[hcch35Portability].shortLabel,
    mutualApostille,
    verifiedSourcesCount: guide.sources.length,
    verifiedContactsCount: guide.contacts.length,
    localeCount: guide.locales.length,
    lastReviewed: guide.lastReviewed,
  };
}

function buildDistribution<Code extends string>(
  values: readonly Code[],
  total: number,
  defs: ReadonlyArray<{
    code: Code;
    label: string;
    shortLabel: string;
    description: string;
  }>,
): Study3DistributionBucket<Code>[] {
  const counts = new Map<Code, number>();
  for (const val of values) {
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  return defs.map((d) => {
    const count = counts.get(d.code) ?? 0;
    return {
      code: d.code,
      label: d.label,
      shortLabel: d.shortLabel,
      description: d.description,
      count,
      pct: pct1(count, total),
    };
  });
}

/**
 * Deterministic 196-country + 40-corridor study quantifying statutory advance healthcare directives,
 * incapacity financial mandate continuity, family caregiver protections, and HCCH #35 / #12 portability.
 */
export function getAdvanceDirectivesIncapacityStudy(): AdvanceDirectivesIncapacityStudy {
  if (cachedStudy3) return cachedStudy3;

  const allEnGuides = publishedCorridorGuides("en");
  const domesticTiGuides = allEnGuides.filter(
    (g) =>
      g.category === "terminal-illness-admin" &&
      g.countryOfDeathCode === g.citizenshipCountryCode,
  );
  const crossBorderTiGuides = allEnGuides.filter(
    (g) => g.category === "cross-border-terminal-illness",
  );

  const rows = domesticTiGuides
    .map(classifyTerminalIllnessCountryGuide)
    .sort((a, b) => a.countryName.localeCompare(b.countryName, "en"));

  const corridorRows = crossBorderTiGuides
    .map(classifyCorridorGuide)
    .sort((a, b) => a.corridorLabel.localeCompare(b.corridorLabel, "en"));

  const total = rows.length;
  const totalCorridors = corridorRows.length;

  const totalVerifiedCitationsIn196Guides = rows.reduce(
    (acc, r) => acc + r.verifiedSourcesCount,
    0,
  );
  const totalVerifiedContactsIn196Guides = rows.reduce(
    (acc, r) => acc + r.verifiedContactsCount,
    0,
  );
  const totalVerifiedCitationsIn40Corridors = corridorRows.reduce(
    (acc, r) => acc + r.verifiedSourcesCount,
    0,
  );
  const totalVerifiedContactsIn40Corridors = corridorRows.reduce(
    (acc, r) => acc + r.verifiedContactsCount,
    0,
  );

  const advanceDirectiveDistribution = buildDistribution<AdvanceDirectiveRegime>(
    rows.map((r) => r.advanceDirectiveRegime),
    total,
    (
      [
        "statute_with_national_register",
        "binding_statute_local_or_subnational",
        "patients_rights_or_clinical_framework",
        "general_consent_or_family_consultation",
      ] as const
    ).map((code) => ({
      code,
      label: ADVANCE_DIRECTIVE_META[code].label,
      shortLabel: ADVANCE_DIRECTIVE_META[code].shortLabel,
      description: ADVANCE_DIRECTIVE_META[code].description,
    })),
  );

  const incapacityMandateDistribution =
    buildDistribution<IncapacityMandateRegime>(
      rows.map((r) => r.incapacityMandateRegime),
      total,
      (
        [
          "continuing_or_lasting_poa",
          "advance_guardian_or_support_designation",
          "ordinary_poa_court_guardianship",
        ] as const
      ).map((code) => ({
        code,
        label: INCAPACITY_MANDATE_META[code].label,
        shortLabel: INCAPACITY_MANDATE_META[code].shortLabel,
        description: INCAPACITY_MANDATE_META[code].description,
      })),
    );

  const caregiverProtectionDistribution =
    buildDistribution<CaregiverProtectionRegime>(
      rows.map((r) => r.caregiverProtectionRegime),
      total,
      (
        [
          "paid_caregiver_or_palliative_leave",
          "carer_allowance_or_job_protected_leave",
          "patient_sick_or_invalidity_only",
        ] as const
      ).map((code) => ({
        code,
        label: CAREGIVER_PROTECTION_META[code].label,
        shortLabel: CAREGIVER_PROTECTION_META[code].shortLabel,
        description: CAREGIVER_PROTECTION_META[code].description,
      })),
    );

  const hcch35Distribution = buildDistribution<Hcch35Status>(
    rows.map((r) => r.hcch35Status),
    total,
    (
      [
        "in_force_nationwide",
        "in_force_scotland_only",
        "acceded_eif_aug_2027",
        "signed_not_ratified",
        "non_party",
      ] as const
    ).map((code) => ({
      code,
      label: HCCH_35_STATUS_META[code].label,
      shortLabel: HCCH_35_STATUS_META[code].shortLabel,
      description: HCCH_35_STATUS_META[code].description,
    })),
  );

  const apostilleDistribution = buildDistribution<ApostilleStatus>(
    rows.map((r) => r.apostilleStatus),
    total,
    [
      {
        code: "in_force_2026",
        label: "1961 Hague Apostille in force (November 2026)",
        shortLabel: APOSTILLE_LABEL_BY_STATUS.in_force_2026,
        description:
          "Notarized powers of attorney and medical certificates receive single-stamp signature authentication across contracting states (without conferring substantive incapacity recognition).",
      },
      {
        code: "entering_force_feb_2027",
        label: "Acceded; enters into force 28 February 2027 (Thailand)",
        shortLabel: APOSTILLE_LABEL_BY_STATUS.entering_force_feb_2027,
        description:
          "Thailand deposited its accession on 30 June 2026; consular legalization applies until entry into force on 28 February 2027.",
      },
      {
        code: "consular_legalization_required",
        label: "Non-party (diplomatic / consular legalization required)",
        shortLabel: APOSTILLE_LABEL_BY_STATUS.consular_legalization_required,
        description:
          "Cross-border powers of attorney and clinical records require multi-step Foreign Ministry and embassy legalization unless bilaterally exempt.",
      },
    ],
  );

  const corridorPortabilityDistribution =
    buildDistribution<CorridorHcch35Portability>(
      corridorRows.map((r) => r.hcch35Portability),
      totalCorridors,
      (
        [
          "mutual_nationwide",
          "partial_uk_scotland",
          "one_sided_party",
          "neither_party",
        ] as const
      ).map((code) => ({
        code,
        label: CORRIDOR_HCCH_35_META[code].label,
        shortLabel: CORRIDOR_HCCH_35_META[code].shortLabel,
        description: CORRIDOR_HCCH_35_META[code].description,
      })),
    );

  const macroRegionSummaries: Study3MacroRegionSummary[] =
    MACRO_REGION_ORDER.map((region) => {
      const subset = rows.filter((r) => r.macroRegion === region);
      const count = subset.length;
      const statAhd = subset.filter(
        (r) =>
          r.advanceDirectiveRegime === "statute_with_national_register" ||
          r.advanceDirectiveRegime === "binding_statute_local_or_subnational",
      ).length;
      const regAhd = subset.filter(
        (r) => r.advanceDirectiveRegime === "statute_with_national_register",
      ).length;
      const incPlan = subset.filter(
        (r) =>
          r.incapacityMandateRegime === "continuing_or_lasting_poa" ||
          r.incapacityMandateRegime ===
            "advance_guardian_or_support_designation",
      ).length;
      const carerSup = subset.filter(
        (r) => r.caregiverProtectionRegime !== "patient_sick_or_invalidity_only",
      ).length;
      const h35Count = subset.filter(
        (r) => r.hcch35Status === "in_force_nationwide",
      ).length;

      return {
        region,
        countryCount: count,
        statutoryAhdCount: statAhd,
        statutoryAhdPct: pct1(statAhd, count),
        nationalAhdRegisterCount: regAhd,
        nationalAhdRegisterPct: pct1(regAhd, count),
        incapacityPlanningCount: incPlan,
        incapacityPlanningPct: pct1(incPlan, count),
        paidOrAllowanceCarerCount: carerSup,
        paidOrAllowanceCarerPct: pct1(carerSup, count),
        hcch35InForceNationwideCount: h35Count,
        hcch35InForceNationwidePct: pct1(h35Count, count),
        verifiedSourcesCount: subset.reduce(
          (acc, r) => acc + r.verifiedSourcesCount,
          0,
        ),
        verifiedContactsCount: subset.reduce(
          (acc, r) => acc + r.verifiedContactsCount,
          0,
        ),
      };
    });

  const nationalAhdRegisterCount =
    advanceDirectiveDistribution.find(
      (d) => d.code === "statute_with_national_register",
    )?.count ?? 0;
  const localStatutoryAhdCount =
    advanceDirectiveDistribution.find(
      (d) => d.code === "binding_statute_local_or_subnational",
    )?.count ?? 0;
  const bindingStatutoryAhdCount =
    nationalAhdRegisterCount + localStatutoryAhdCount;

  const continuingPoaCount =
    incapacityMandateDistribution.find(
      (d) => d.code === "continuing_or_lasting_poa",
    )?.count ?? 0;
  const voluntaryGuardianOrSupportCount =
    incapacityMandateDistribution.find(
      (d) => d.code === "advance_guardian_or_support_designation",
    )?.count ?? 0;
  const anyIncapacityPlanningCount =
    continuingPoaCount + voluntaryGuardianOrSupportCount;
  const ordinaryPoaLapsesCount = total - anyIncapacityPlanningCount;

  const paidCaregiverLeaveCount =
    caregiverProtectionDistribution.find(
      (d) => d.code === "paid_caregiver_or_palliative_leave",
    )?.count ?? 0;
  const carerAllowanceCount =
    caregiverProtectionDistribution.find(
      (d) => d.code === "carer_allowance_or_job_protected_leave",
    )?.count ?? 0;
  const anyStatutoryCarerSupportCount =
    paidCaregiverLeaveCount + carerAllowanceCount;
  const patientOnlyProtectionCount = total - anyStatutoryCarerSupportCount;

  const hcch35NationwideCount =
    hcch35Distribution.find((d) => d.code === "in_force_nationwide")?.count ?? 0;
  const hcch35WithoutNationwideForceCount = total - hcch35NationwideCount;

  const apostilleInForceCount =
    apostilleDistribution.find((d) => d.code === "in_force_2026")?.count ?? 0;
  const thailandTransitionCount =
    apostilleDistribution.find((d) => d.code === "entering_force_feb_2027")
      ?.count ?? 0;

  const corridorMutualHcch35Count =
    corridorPortabilityDistribution.find((d) => d.code === "mutual_nationwide")
      ?.count ?? 0;
  const corridorPartialUkScotlandCount =
    corridorPortabilityDistribution.find(
      (d) => d.code === "partial_uk_scotland",
    )?.count ?? 0;
  const corridorNoBilateralHcch35Count =
    totalCorridors - corridorMutualHcch35Count - corridorPartialUkScotlandCount;
  const corridorMutualApostilleCount = corridorRows.filter(
    (r) => r.mutualApostille,
  ).length;

  const corridorMutualHcch35Pct = pct1(
    corridorMutualHcch35Count,
    totalCorridors,
  );
  const corridorMutualApostillePct = pct1(
    corridorMutualApostilleCount,
    totalCorridors,
  );

  cachedStudy3 = {
    publishedDate: STUDY_3_PUBLISHED_DATE,
    verifySnapshot: STUDY_3_VERIFY_SNAPSHOT,
    totalCountries: total,
    totalCorridors,
    totalGuidesInStudy: total + totalCorridors,
    macroRegionCount: macroRegionSummaries.length,
    totalVerifiedCitationsIn196Guides,
    totalVerifiedContactsIn196Guides,
    totalVerifiedCitationsIn40Corridors,
    totalVerifiedContactsIn40Corridors,
    totalVerifiedCitationsCombined:
      totalVerifiedCitationsIn196Guides + totalVerifiedCitationsIn40Corridors,
    totalVerifiedContactsCombined:
      totalVerifiedContactsIn196Guides + totalVerifiedContactsIn40Corridors,
    nationalAhdRegisterCount,
    nationalAhdRegisterPct: pct1(nationalAhdRegisterCount, total),
    bindingStatutoryAhdCount,
    bindingStatutoryAhdPct: pct1(bindingStatutoryAhdCount, total),
    continuingPoaCount,
    continuingPoaPct: pct1(continuingPoaCount, total),
    voluntaryGuardianOrSupportCount,
    voluntaryGuardianOrSupportPct: pct1(voluntaryGuardianOrSupportCount, total),
    anyIncapacityPlanningCount,
    anyIncapacityPlanningPct: pct1(anyIncapacityPlanningCount, total),
    ordinaryPoaLapsesCount,
    ordinaryPoaLapsesPct: pct1(ordinaryPoaLapsesCount, total),
    paidCaregiverLeaveCount,
    paidCaregiverLeavePct: pct1(paidCaregiverLeaveCount, total),
    anyStatutoryCarerSupportCount,
    anyStatutoryCarerSupportPct: pct1(anyStatutoryCarerSupportCount, total),
    patientOnlyProtectionCount,
    patientOnlyProtectionPct: pct1(patientOnlyProtectionCount, total),
    hcch35NationwideCount,
    hcch35NationwidePct: pct1(hcch35NationwideCount, total),
    hcch35WithoutNationwideForceCount,
    hcch35WithoutNationwideForcePct: pct1(
      hcch35WithoutNationwideForceCount,
      total,
    ),
    apostilleInForceCount,
    apostilleInForcePct: pct1(apostilleInForceCount, total),
    postFeb2027ApostillePct: pct1(
      apostilleInForceCount + thailandTransitionCount,
      total,
    ),
    corridorMutualHcch35Count,
    corridorMutualHcch35Pct,
    corridorPartialUkScotlandCount,
    corridorPartialUkScotlandPct: pct1(
      corridorPartialUkScotlandCount,
      totalCorridors,
    ),
    corridorNoBilateralHcch35Count,
    corridorNoBilateralHcch35Pct: pct1(
      corridorNoBilateralHcch35Count,
      totalCorridors,
    ),
    corridorMutualApostilleCount,
    corridorMutualApostillePct,
    corridorApostilleVsPortabilityGapPts: round1(
      corridorMutualApostillePct - corridorMutualHcch35Pct,
    ),
    advanceDirectiveDistribution,
    incapacityMandateDistribution,
    caregiverProtectionDistribution,
    hcch35Distribution,
    apostilleDistribution,
    corridorPortabilityDistribution,
    macroRegionSummaries,
    rows,
    corridorRows,
    referenceSources: STUDY_3_REFERENCE_SOURCES,
  };

  return cachedStudy3;
}

function csvCell(value: string | number | boolean): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Serialize all 196 countries in Study 3 as RFC-4180 UTF-8 CSV. */
export function serializeStudy3RowsToCsv(
  study: AdvanceDirectivesIncapacityStudy = getAdvanceDirectivesIncapacityStudy(),
): string {
  const header = [
    "country_code",
    "country_name",
    "macro_region",
    "guide_slug",
    "guide_url",
    "advance_directive_regime",
    "advance_directive_label",
    "advance_directive_summary",
    "incapacity_mandate_regime",
    "incapacity_mandate_label",
    "incapacity_mandate_summary",
    "caregiver_protection_regime",
    "caregiver_protection_label",
    "hcch_35_adults_status",
    "hcch_35_adults_label",
    "apostille_status",
    "apostille_status_label",
    "verified_official_sources",
    "verified_authority_contacts",
    "locale_count",
    "primary_source_title",
    "primary_source_publisher",
    "primary_source_url",
    "last_reviewed",
  ];

  const lines = [header.join(",")];
  for (const r of study.rows) {
    lines.push(
      [
        csvCell(r.countryCode),
        csvCell(r.countryName),
        csvCell(r.macroRegion),
        csvCell(r.guideSlug),
        csvCell(`https://clarvia.org${r.guideHref}`),
        csvCell(r.advanceDirectiveRegime),
        csvCell(r.advanceDirectiveLabel),
        csvCell(r.advanceDirectiveSummary),
        csvCell(r.incapacityMandateRegime),
        csvCell(r.incapacityMandateLabel),
        csvCell(r.incapacityMandateSummary),
        csvCell(r.caregiverProtectionRegime),
        csvCell(r.caregiverProtectionLabel),
        csvCell(r.hcch35Status),
        csvCell(r.hcch35StatusLabel),
        csvCell(r.apostilleStatus),
        csvCell(r.apostilleStatusLabel),
        csvCell(r.verifiedSourcesCount),
        csvCell(r.verifiedContactsCount),
        csvCell(r.localeCount),
        csvCell(r.primarySourceTitle),
        csvCell(r.primarySourcePublisher),
        csvCell(r.primarySourceUrl),
        csvCell(r.lastReviewed),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Serialize Study 3 metadata, distributions, regional summaries, 40 corridors, and all 196 country rows as JSON. */
export function serializeStudy3ToJson(
  study: AdvanceDirectivesIncapacityStudy = getAdvanceDirectivesIncapacityStudy(),
): string {
  const payload = {
    title:
      "Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (2026)",
    publisher: "Clarvia ASBL (RCS Luxembourg F15680)",
    license: "CC-BY-4.0",
    publishedDate: study.publishedDate,
    verifySnapshot: study.verifySnapshot,
    canonicalUrl: STUDY_3_CANONICAL_URL,
    csvUrl: `https://clarvia.org${STUDY_3_CSV_PATH}`,
    jsonUrl: `https://clarvia.org${STUDY_3_JSON_PATH}`,
    zenodoDatasetDoi: ZENODO_STUDY_CORPUS_DOI,
    zenodoDatasetRecordUrl: ZENODO_RECORD_URL,
    zenodoSoftwareDoi: ZENODO_SOFTWARE_DOI,
    zenodoSoftwareRecordUrl: ZENODO_SOFTWARE_RECORD_URL,
    sourceCodeUrl: GITHUB_STUDY_3_SOURCE_URL,
    summary: {
      totalCountries: study.totalCountries,
      totalCorridors: study.totalCorridors,
      totalGuidesInStudy: study.totalGuidesInStudy,
      macroRegionCount: study.macroRegionCount,
      totalVerifiedCitationsIn196Guides:
        study.totalVerifiedCitationsIn196Guides,
      totalVerifiedContactsIn196Guides: study.totalVerifiedContactsIn196Guides,
      totalVerifiedCitationsIn40Corridors:
        study.totalVerifiedCitationsIn40Corridors,
      totalVerifiedContactsIn40Corridors:
        study.totalVerifiedContactsIn40Corridors,
      totalVerifiedCitationsCombined: study.totalVerifiedCitationsCombined,
      totalVerifiedContactsCombined: study.totalVerifiedContactsCombined,
      fullCorpusCanonicalGuides: CORPUS_STATS.canonicalGuides,
      fullCorpusLocalizedPages: CORPUS_STATS.localizedPages,
      fullCorpusVerifiedOfficialCitations:
        CORPUS_STATS.verifiedOfficialCitations,
      nationalAhdRegisterCount: study.nationalAhdRegisterCount,
      nationalAhdRegisterPct: study.nationalAhdRegisterPct,
      bindingStatutoryAhdCount: study.bindingStatutoryAhdCount,
      bindingStatutoryAhdPct: study.bindingStatutoryAhdPct,
      continuingPoaCount: study.continuingPoaCount,
      continuingPoaPct: study.continuingPoaPct,
      voluntaryGuardianOrSupportCount: study.voluntaryGuardianOrSupportCount,
      voluntaryGuardianOrSupportPct: study.voluntaryGuardianOrSupportPct,
      anyIncapacityPlanningCount: study.anyIncapacityPlanningCount,
      anyIncapacityPlanningPct: study.anyIncapacityPlanningPct,
      ordinaryPoaLapsesCount: study.ordinaryPoaLapsesCount,
      ordinaryPoaLapsesPct: study.ordinaryPoaLapsesPct,
      paidCaregiverLeaveCount: study.paidCaregiverLeaveCount,
      paidCaregiverLeavePct: study.paidCaregiverLeavePct,
      anyStatutoryCarerSupportCount: study.anyStatutoryCarerSupportCount,
      anyStatutoryCarerSupportPct: study.anyStatutoryCarerSupportPct,
      patientOnlyProtectionCount: study.patientOnlyProtectionCount,
      patientOnlyProtectionPct: study.patientOnlyProtectionPct,
      hcch35NationwideCount: study.hcch35NationwideCount,
      hcch35NationwidePct: study.hcch35NationwidePct,
      hcch35WithoutNationwideForceCount:
        study.hcch35WithoutNationwideForceCount,
      hcch35WithoutNationwideForcePct: study.hcch35WithoutNationwideForcePct,
      apostilleInForceCount: study.apostilleInForceCount,
      apostilleInForcePct: study.apostilleInForcePct,
      postFeb2027ApostillePct: study.postFeb2027ApostillePct,
      corridorMutualHcch35Count: study.corridorMutualHcch35Count,
      corridorMutualHcch35Pct: study.corridorMutualHcch35Pct,
      corridorPartialUkScotlandCount: study.corridorPartialUkScotlandCount,
      corridorPartialUkScotlandPct: study.corridorPartialUkScotlandPct,
      corridorNoBilateralHcch35Count: study.corridorNoBilateralHcch35Count,
      corridorNoBilateralHcch35Pct: study.corridorNoBilateralHcch35Pct,
      corridorMutualApostilleCount: study.corridorMutualApostilleCount,
      corridorMutualApostillePct: study.corridorMutualApostillePct,
      corridorApostilleVsPortabilityGapPts:
        study.corridorApostilleVsPortabilityGapPts,
    },
    advanceDirectiveDistribution: study.advanceDirectiveDistribution,
    incapacityMandateDistribution: study.incapacityMandateDistribution,
    caregiverProtectionDistribution: study.caregiverProtectionDistribution,
    hcch35Distribution: study.hcch35Distribution,
    apostilleDistribution: study.apostilleDistribution,
    corridorPortabilityDistribution: study.corridorPortabilityDistribution,
    macroRegionSummaries: study.macroRegionSummaries,
    referenceSources: study.referenceSources,
    corridorRows: study.corridorRows,
    rows: study.rows,
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}
