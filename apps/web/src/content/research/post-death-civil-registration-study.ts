import {
  corridorGuidePath,
  publishedCorridorGuides,
  type CorridorGuide,
} from "@/content/corridor-guides";
import {
  AUTHOR_TOMMI_ORCID,
  AUTHOR_TOMMI_ORCID_URL,
  CORPUS_STATS,
  DATA_EUROPA_URL,
  DATA_PUBLIC_LU_URL,
  EC_OSOR_URL,
  GITHUB_REPO_URL,
  STUDY_AUTHORS_JSONLD,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
} from "./cross-border-integration-study";

export {
  AUTHOR_TOMMI_ORCID,
  AUTHOR_TOMMI_ORCID_URL,
  CORPUS_STATS,
  DATA_EUROPA_URL,
  DATA_PUBLIC_LU_URL,
  EC_OSOR_URL,
  GITHUB_REPO_URL,
  STUDY_AUTHORS_JSONLD,
  ZENODO_RECORD_URL,
  ZENODO_SOFTWARE_DOI,
  ZENODO_SOFTWARE_RECORD_URL,
  ZENODO_STUDY_CORPUS_DOI,
  ZENODO_STUDY_CORPUS_DOI_URL,
};

export const STUDY_2_PUBLISHED_DATE = "2026-11-18";
export const STUDY_2_VERIFY_SNAPSHOT = "November 2026";
export const STUDY_2_SLUG = "global-post-death-civil-registration-atlas";
export const STUDY_2_CANONICAL_URL =
  "https://clarvia.org/en/research/global-post-death-civil-registration-atlas";
export const STUDY_2_CSV_PATH =
  "/data/research/global-post-death-civil-registration-2026.csv";
export const STUDY_2_JSON_PATH =
  "/data/research/global-post-death-civil-registration-2026.json";
export const STUDY_2_PDF_PATH =
  "/data/research/global-post-death-civil-registration-2026.pdf";
export const STUDY_2_ZENODO_DOI = "10.5281/zenodo.24388597";
export const STUDY_2_ZENODO_DOI_URL = "https://doi.org/10.5281/zenodo.24388597";
export const STUDY_2_ZENODO_RECORD_URL = "https://zenodo.org/records/24388597";
export const STUDY_2_DATA_PUBLIC_LU_URL =
  "https://data.public.lu/fr/datasets/global-post-death-civil-registration-estate-administration-atlas-2026/";
export const GITHUB_STUDY_2_SOURCE_URL =
  "https://github.com/clarvia-org/clarvia-graph/blob/main/apps/web/src/content/research/post-death-civil-registration-study.ts";

export type MacroRegion =
  | "Sub-Saharan Africa"
  | "Asia-Pacific"
  | "Europe"
  | "Americas"
  | "Middle East & North Africa";

export type RegistrationWindowTier =
  | "automatic_digital"
  | "within_48h"
  | "days_3_to_7"
  | "days_8_to_35"
  | "extended_42d_to_12m"
  | "disposition_or_prompt"
  | "subnational_federal";

export type FilingChannel =
  | "digital_health_or_portal"
  | "funeral_director_or_facility"
  | "in_person_informant";

export type AgencyPropagation =
  | "automated_or_one_stop"
  | "manual_agency_by_agency";

export type EstateGatekeeper =
  | "ex_officio_court_or_notary"
  | "civil_law_notary"
  | "common_law_probate_court"
  | "civil_judicial_or_registry"
  | "personal_status_or_plural";

export type ApostilleStatus =
  | "in_force_2026"
  | "entering_force_feb_2027"
  | "consular_legalization_required";

export const MACRO_REGION_ORDER: readonly MacroRegion[] = [
  "Sub-Saharan Africa",
  "Asia-Pacific",
  "Europe",
  "Americas",
  "Middle East & North Africa",
];

export const MACRO_REGION_BY_ISO: Record<string, MacroRegion> = {
  ...Object.fromEntries(
    [
      "AO","BF","BI","BJ","BW","CD","CF","CG","CI","CM","CV","DJ","ER","ET","GA",
      "GH","GM","GN","GQ","GW","KE","KM","LR","LS","MG","ML","MR","MU","MW","MZ",
      "NA","NE","NG","RW","SC","SD","SL","SN","SO","SS","ST","SZ","TD","TG","TZ",
      "UG","ZA","ZM","ZW",
    ].map((c) => [c, "Sub-Saharan Africa" as const]),
  ),
  ...Object.fromEntries(
    [
      "AF","AM","AU","AZ","BD","BN","BT","CN","FJ","FM","GE","ID","IN","JP","KG",
      "KH","KI","KP","KR","KZ","LA","LK","MH","MM","MN","MV","MY","NP","NR","NZ",
      "PG","PH","PK","PW","SB","SG","TH","TJ","TL","TM","TO","TR","TV","TW","UZ",
      "VN","VU","WS",
    ].map((c) => [c, "Asia-Pacific" as const]),
  ),
  ...Object.fromEntries(
    [
      "AD","AL","AT","BA","BE","BG","BY","CH","CY","CZ","DE","DK","EE","ES","FI",
      "FR","GB","GR","HR","HU","IE","IS","IT","LI","LT","LU","LV","MC","MD","ME",
      "MK","MT","NL","NO","PL","PT","RO","RS","RU","SE","SI","SK","SM","UA","XK",
    ].map((c) => [c, "Europe" as const]),
  ),
  ...Object.fromEntries(
    [
      "AG","AR","BB","BO","BR","BS","BZ","CA","CL","CO","CR","CU","DM","DO","EC",
      "GD","GT","GY","HN","HT","JM","KN","LC","MX","NI","PA","PE","PY","SR","SV",
      "TT","US","UY","VC","VE",
    ].map((c) => [c, "Americas" as const]),
  ),
  ...Object.fromEntries(
    [
      "AE","BH","DZ","EG","IL","IQ","IR","JO","KW","LB","LY","MA","OM","PS","QA",
      "SA","SY","TN","YE",
    ].map((c) => [c, "Middle East & North Africa" as const]),
  ),
};

/** Official HCCH #12 Contracting Parties in force among all 196 sovereign countries (November 2026). */
export const HCCH_12_IN_FORCE_2026_11 = new Set([
  "AL","DZ","AD","AG","AR","AM","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BO","BA","BW","BR",
  "BN","BG","BI","CV","CA","CL","CN","CO","CR","HR","CY","CZ","DK","DM","DO","EC","SV","EE","SZ","FJ",
  "FI","FR","GE","DE","GR","GD","GT","GY","HN","HU","IS","IN","ID","IE","IL","IT","JM","JP","KZ","XK",
  "KG","LV","LS","LR","LI","LT","LU","MW","MT","MH","MU","MX","MC","MN","ME","MA","NA","NL","NZ","NI",
  "MK","NO","OM","PK","PW","PA","PY","PE","PH","PL","PT","KR","MD","RO","RU","RW","KN","LC","VC","WS",
  "SM","ST","SA","SN","RS","SC","SG","SK","SI","ZA","ES","SR","SE","CH","TJ","TO","TT","TN","TR","UA",
  "GB","US","UY","UZ","VU","VE","VN",
]);

export const REGISTRATION_WINDOW_META: Record<
  RegistrationWindowTier,
  { rank: number; label: string; rationale: string }
> = {
  automatic_digital: {
    rank: 1,
    label: "Automatic digital registration",
    rationale:
      "Attending physician or hospital transmits an electronic medical notice directly into the national civil/population register, removing a separate family registry visit.",
  },
  within_48h: {
    rank: 2,
    label: "Within 48 hours / next working day",
    rationale:
      "Statutory civil registration is coupled tightly with sanitary burial or cremation clearance, so filings occur within 12 to 48 hours.",
  },
  days_3_to_7: {
    rank: 3,
    label: "3 to 7 days",
    rationale:
      "Allows several working days after medical certification (or after burial/cremation in countries like New Zealand) for families or funeral directors to file.",
  },
  days_8_to_35: {
    rank: 4,
    label: "8 to 35 days (up to 1 month)",
    rationale:
      "Accommodates larger territorial distances, commune/district reporting chains, or family travel before civil registration fees apply.",
  },
  extended_42d_to_12m: {
    rank: 5,
    label: "6 weeks to 12 months",
    rationale:
      "Provides extended statutory free-registration windows (6 weeks to 12 months) while medical or municipal burial orders still govern immediate interment.",
  },
  disposition_or_prompt: {
    rank: 6,
    label: "Prior to burial / prompt statutory filing",
    rationale:
      "Statute requires registration promptly or prior to the municipal burial/cremation order without prescribing a uniform nationwide day count.",
  },
  subnational_federal: {
    rank: 7,
    label: "Sub-national (state, provincial, or emirate)",
    rationale:
      "Constitutional division allocates vital-statistics deadlines to states, provinces, emirates, or autonomous island states rather than one federal statute.",
  },
};

export const STATUTORY_WINDOW_SPEC_BY_ISO: Record<
  string,
  { tier: RegistrationWindowTier; summary: string }
> = {
  // automatic_digital (10)
  CR: { tier: "automatic_digital", summary: "Automatic via SEDIMEC digital declaration to TSE Civil Registry" },
  DK: { tier: "automatic_digital", summary: "Automatic CPR update upon electronic physician dødsattest (burial request within 2 working days)" },
  EE: { tier: "automatic_digital", summary: "Automatic Population Register entry from digital health death notice" },
  FI: { tier: "automatic_digital", summary: "Automatic healthcare transmission to DVV Population Information System" },
  IL: { tier: "automatic_digital", summary: "Direct hospital/burial-society transmission to PIBA Population Registry (promptly before burial outside hospital)" },
  LT: { tier: "automatic_digital", summary: "Automatic e-health transmission to Population Register and Civil Registry" },
  NO: { tier: "automatic_digital", summary: "Automatic Folkeregisteret registration via electronic physician notice to Skatteetaten" },
  PE: { tier: "automatic_digital", summary: "Automatic RENIEC death record generation upon digital SINADEF signature" },
  SE: { tier: "automatic_digital", summary: "Automatic Skatteverket Population Register update from physician dödsbevis" },
  SG: { tier: "automatic_digital", summary: "Automatic ICA registration within 24 hours of online CCOD (30-day MyLegacy download)" },

  // subnational_federal (5)
  AE: { tier: "subnational_federal", summary: "Emirate-level digital portals (TAMM Abu Dhabi, DHA Dubai, MOHAP/EHS Northern Emirates) prior to burial/repatriation" },
  AU: { tier: "subnational_federal", summary: "State or territory BDM via funeral director (typically 7 days in NSW; 14 days in VIC and QLD)" },
  CA: { tier: "subnational_federal", summary: "Provincial or territorial Vital Statistics registration via licensed funeral provider" },
  FM: { tier: "subnational_federal", summary: "State-level filing with Chuuk, Kosrae, Pohnpei, or Yap State Supreme Court Clerk" },
  US: { tier: "subnational_federal", summary: "State or county Vital Records via funeral director (typically 3 to 5 days by state statute)" },

  // within_48h (36)
  AR: { tier: "within_48h", summary: "Within 48 business hours of medical verification (Law 26.413)" },
  AT: { tier: "within_48h", summary: "No later than the next working day at the Standesamt" },
  BG: { tier: "within_48h", summary: "Within 48 hours at the municipal civil status registrar (GRAO)" },
  BN: { tier: "within_48h", summary: "Initial 12-hour reporting window (late recording up to 3 days under Cap. 79)" },
  BR: { tier: "within_48h", summary: "Prior to burial and within 24 hours ordinarily (up to 15 days where immediate filing is impossible, Law 6.015/1973)" },
  CH: { tier: "within_48h", summary: "Within 2 days (48 hours) at the Zivilstandsamt" },
  CO: { tier: "within_48h", summary: "Within 2 business days before the Registraduría or Notary (Decree-Law 1260/1970)" },
  CU: { tier: "within_48h", summary: "Within 24 hours and prior to burial or cremation (MINJUS)" },
  CV: { tier: "within_48h", summary: "Within 48 hours at the Civil Registry and Notary Office" },
  DZ: { tier: "within_48h", summary: "Within 24 hours in northern wilayas (extended statutory window in southern wilayas)" },
  EC: { tier: "within_48h", summary: "Within 48 hours ordinary registration before the Civil Registry" },
  EG: { tier: "within_48h", summary: "Within 24 hours at the local Health Office (Maktab El-Seha)" },
  ES: { tier: "within_48h", summary: "Generally within 24 hours and always prior to burial or cremation at the Registro Civil" },
  FR: { tier: "within_48h", summary: "Within 24 hours (excluding weekends and public holidays) at the municipal mairie" },
  GQ: { tier: "within_48h", summary: "Within 24 to 48 hours in practice and strictly prior to burial at the Registro Civil" },
  GR: { tier: "within_48h", summary: "Within 24 hours of death or forensic release and prior to burial (Law 344/1976)" },
  GW: { tier: "within_48h", summary: "Within 48 hours following death or medical certification at the Conservatória" },
  HU: { tier: "within_48h", summary: "On the first working day following post-mortem examination before the anyakönyvvezető" },
  IT: { tier: "within_48h", summary: "Within 24 hours of death at the municipal Ufficio di Stato Civile (D.P.R. 396/2000)" },
  LI: { tier: "within_48h", summary: "Within 2 days (48 hours) at the Zivilstandsamt Liechtenstein" },
  LU: { tier: "within_48h", summary: "Normally within 24 hours of medical certification at the municipal civil registrar" },
  LY: { tier: "within_48h", summary: "Within 24 hours at the municipal Civil Registry Authority (Law No. 36 of 1968)" },
  MC: { tier: "within_48h", summary: "Within 24 hours (excluding weekends and holidays) and prior to funeral at the Mairie de Monaco" },
  MT: { tier: "within_48h", summary: "Within 2 working days of medical certification with Identità (Public Registry)" },
  MU: { tier: "within_48h", summary: "Normally within 24 to 48 hours and prior to burial or cremation at the Civil Status Division" },
  NI: { tier: "within_48h", summary: "Immediately (generally within 24 to 48 hours for burial/cremation permits) at the Municipal Civil Registry" },
  PA: { tier: "within_48h", summary: "Within 24 to 48 hours before the Civil Registry of the Electoral Tribunal" },
  PT: { tier: "within_48h", summary: "Within 48 hours of death, discovery, or autopsy before any Conservatória do Registo Civil (IRN)" },
  PY: { tier: "within_48h", summary: "Normally within 24 to 48 hours prior to burial or cremation before the Civil Registry (REC)" },
  SC: { tier: "within_48h", summary: "Normally within 24 hours at the Civil Status Office" },
  SI: { tier: "within_48h", summary: "Within 2 days of death before the Administrative Unit (Zakon o matičnem registru)" },
  SR: { tier: "within_48h", summary: "Within 24 hours in Paramaribo (up to 7 days in outer districts) at CBB" },
  ST: { tier: "within_48h", summary: "Within 48 hours following death or medical verification at the Conservatória" },
  TH: { tier: "within_48h", summary: "Within 24 hours of death or discovery (extendable up to 7 days in remote areas)" },
  TL: { tier: "within_48h", summary: "Within 48 hours following death or discovery at the Conservatória or Balkaun Úniku" },
  VE: { tier: "within_48h", summary: "Within 48 hours before the municipal or parish Civil Registry (CNE)" },

  // days_3_to_7 (43)
  AG: { tier: "days_3_to_7", summary: "Within 5 days of death or Coroner's finding (CRVS Act)" },
  AO: { tier: "days_3_to_7", summary: "Within 72 hours at the Conservatória do Registo Civil or SIAC" },
  BA: { tier: "days_3_to_7", summary: "Within 3 days of death (or 24 hours under urgent sanitary rules) at the Matični ured" },
  BB: { tier: "days_3_to_7", summary: "Within 5 days of occurrence at the Registration Department" },
  BH: { tier: "days_3_to_7", summary: "Within 72 hours via the Information & eGovernment Authority (Law No. 7 of 2019)" },
  BZ: { tier: "days_3_to_7", summary: "Within 5 days with the Vital Statistics Unit or District Registry" },
  CL: { tier: "days_3_to_7", summary: "Within 72 hours of medical certification at the Servicio de Registro Civil e Identificación" },
  CZ: { tier: "days_3_to_7", summary: "Within 3 working days reported to the matriční úřad (Act No. 301/2000 Coll.)" },
  DE: { tier: "days_3_to_7", summary: "No later than the 3rd working day following death at the Standesamt (Section 28 PStG)" },
  FJ: { tier: "days_3_to_7", summary: "Within 7 days from date of death at the BDM Registry (Cap. 49 s. 18(1))" },
  GA: { tier: "days_3_to_7", summary: "Ordinarily within 72 hours at the municipal civil status center" },
  GB: { tier: "days_3_to_7", summary: "Within 5 days in England, Wales & Northern Ireland; within 8 days in Scotland" },
  GD: { tier: "days_3_to_7", summary: "Within 5 days to the District Registrar of the parish (Cap. 280)" },
  GE: { tier: "days_3_to_7", summary: "Within 5 business days electronic medical notice to Public Service Hall / Civil Registry (Art. 71)" },
  HR: { tier: "days_3_to_7", summary: "Within 3 days to the municipal matični ured" },
  JM: { tier: "days_3_to_7", summary: "Within 5 days notice/certificate delivery to the Local District Registrar (RGD)" },
  JP: { tier: "days_3_to_7", summary: "Within 7 days of learning of the death at the municipal office (Koseki-ho Art. 86)" },
  KG: { tier: "days_3_to_7", summary: "Within 3 days at ZAGS or Public Service Centers (TSON)" },
  KN: { tier: "days_3_to_7", summary: "Normally within 5 days with the District Registrar or Registrar General" },
  LC: { tier: "days_3_to_7", summary: "Before burial or within 5 days of death notice at the Civil Status Registry" },
  LK: { tier: "days_3_to_7", summary: "Notification within 5 days to Grama Niladhari or Divisional Registrar (free registration within 3 months)" },
  LV: { tier: "days_3_to_7", summary: "No later than 6 working days at any municipal Dzimtsarakstu nodaļa" },
  MD: { tier: "days_3_to_7", summary: "Within 3 days at Agenția Servicii Publice multifunctional centers or primărie" },
  ME: { tier: "days_3_to_7", summary: "Within 3 days of death (or before earlier burial) at MUP Crne Gore" },
  MK: { tier: "days_3_to_7", summary: "Within 3 days of death or discovery at the municipal UVMK office" },
  MN: { tier: "days_3_to_7", summary: "Within 3 working days in Ulaanbaatar/aimag centers (7 working days in rural soums)" },
  MV: { tier: "days_3_to_7", summary: "Immediate burial reporting; formal registration typically within 7 days via City or Island Council" },
  MY: { tier: "days_3_to_7", summary: "Within 7 days in Peninsular Malaysia via JPN (Act 299; regional ordinances in Sabah & Sarawak)" },
  NL: { tier: "days_3_to_7", summary: "Prior to burial/cremation and no later than the 6th working day (Wet op de lijkbezorging)" },
  NZ: { tier: "days_3_to_7", summary: "Within 3 working days after burial or cremation with DIA Births, Deaths and Marriages" },
  PL: { tier: "days_3_to_7", summary: "Within 3 days of karta zgonu issuance (24 hours for specified infectious diseases) at USC" },
  PS: { tier: "days_3_to_7", summary: "Within 7 days at the Ministry of Interior Directorate of Civil Status (Law No. 2 of 1999)" },
  QA: { tier: "days_3_to_7", summary: "Within 7 days (practically 24 to 48 hours for burial/repatriation) at MoPH Humanitarian Services Office" },
  RO: { tier: "days_3_to_7", summary: "Within 3 days of death (or 48 hours of forensic clearance) at SPCLEP / primăria" },
  RS: { tier: "days_3_to_7", summary: "Within 3 days of death at the municipal Matična služba" },
  RU: { tier: "days_3_to_7", summary: "Within 3 days of death or discovery at ZAGS or MFC Moi Dokumenty (Art. 66 Law 143-FZ)" },
  SK: { tier: "days_3_to_7", summary: "Within 3 working days notification to the local matričný úrad" },
  TJ: { tier: "days_3_to_7", summary: "Within 3 days at local ZAGS (Law No. 2117 of 2025)" },
  TN: { tier: "days_3_to_7", summary: "Within 3 days at the municipal civil registrar" },
  TT: { tier: "days_3_to_7", summary: "Within 5 days with the District Registrar (Registrar General's Department)" },
  UA: { tier: "days_3_to_7", summary: "Within 3 days standard civil registration at DRACS or TsNAP (extraterritorial filing under martial law)" },
  UZ: { tier: "days_3_to_7", summary: "Within 3 days with electronic hospital transmission to FHDYO / ZAGS" },
  VC: { tier: "days_3_to_7", summary: "Within 3 days and prior to burial/cremation at the Civil Registry" },

  // days_8_to_35 (49)
  AL: { tier: "days_8_to_35", summary: "Within 10 days at the municipal Civil Status Office (Law No. 10129)" },
  AZ: { tier: "days_8_to_35", summary: "Promptly (typically within 10 days) via ASAN Service or Ministry of Justice registry" },
  BI: { tier: "days_8_to_35", summary: "Within 15 calendar days before the commune civil status officer (Decree-Law 1/024)" },
  BW: { tier: "days_8_to_35", summary: "Within 30 days at the Department of Civil and National Registration (Cap. 30:01)" },
  CD: { tier: "days_8_to_35", summary: "Within 30 days before the commune, sector, or chiefdom civil registrar (Family Code)" },
  CF: { tier: "days_8_to_35", summary: "Within 1 month before the municipal civil status officer (Law No. 97.013)" },
  CG: { tier: "days_8_to_35", summary: "Within 1 month before the commune or district civil registrar (Family Code Law 073/84)" },
  CI: { tier: "days_8_to_35", summary: "Within 15 days at the mairie or sous-préfecture (Law No. 2018-862)" },
  CY: { tier: "days_8_to_35", summary: "Within 15 days at the District Administration Civil Registry" },
  ET: { tier: "days_8_to_35", summary: "Within 30 days at Kebele/Woreda Vital Events office or AACRRSA (Proclamation 760/2012)" },
  GH: { tier: "days_8_to_35", summary: "Before burial and within 14 days standard registration at Births and Deaths Registry (Act 1027)" },
  GM: { tier: "days_8_to_35", summary: "Within 14 to 30 days with the Office of the Registrar of Births and Deaths" },
  GT: { tier: "days_8_to_35", summary: "Within 30 days with RENAP (within 24 hours in practice for burial permits)" },
  ID: { tier: "days_8_to_35", summary: "Within 30 days to local Disdukcapil (Population Administration Law No. 24 of 2013)" },
  IN: { tier: "days_8_to_35", summary: "Within 21 days with the local Registrar of Births and Deaths (Act of 1969)" },
  IQ: { tier: "days_8_to_35", summary: "Within 30 days at local health statistics offices (Law No. 21 of 2024)" },
  JO: { tier: "days_8_to_35", summary: "Within 30 days at any Civil Status and Passports Department office (Law No. 9 of 2001)" },
  KH: { tier: "days_8_to_35", summary: "Within 15 days before the Commune or Sangkat Civil Registrar" },
  KI: { tier: "days_8_to_35", summary: "Within 10 days with the Civil Registration Office or Island Council District Registrar (Cap. 5)" },
  KR: { tier: "days_8_to_35", summary: "Within 1 month of learning of the death at the community center or Si/Gu/Eup/Myeon office" },
  LA: { tier: "days_8_to_35", summary: "Within 30 days at the District Office of Home Affairs" },
  LB: { tier: "days_8_to_35", summary: "Within 30 days via the mukhtar and Directorate General of Personal Status" },
  MA: { tier: "days_8_to_35", summary: "Within 30 days to the municipal civil status officer or alhalalmadania.ma portal" },
  MG: { tier: "days_8_to_35", summary: "No later than 12 days statutory deadline (within 24 hours in practice for burial permit)" },
  ML: { tier: "days_8_to_35", summary: "Within 30 clear days (48 hours hospital notice) under Code of Persons and the Family Art. 185" },
  MR: { tier: "days_8_to_35", summary: "Within 30 clear days at the Citizen Reception Center (ANRPTS)" },
  NA: { tier: "days_8_to_35", summary: "Within 24 to 72 hours in urban areas and up to 14 days in rural districts (prior to burial)" },
  NG: { tier: "days_8_to_35", summary: "Within 48 hours in urban/hospital settings or within 30 days at local NPC eCRVS centers" },
  NP: { tier: "days_8_to_35", summary: "Within 35 days free statutory window at the municipal/rural Ward Office (Act 2076)" },
  NR: { tier: "days_8_to_35", summary: "Within 14 days with the Registrar of Births, Deaths and Marriages (BDM Act 2017)" },
  OM: { tier: "days_8_to_35", summary: "Within 14 days with Royal Oman Police Directorate General of Civil Status (RD 66/99)" },
  PG: { tier: "days_8_to_35", summary: "Within 21 days through the PNG Civil and Identity Registry (PNGCIR)" },
  PH: { tier: "days_8_to_35", summary: "Within 30 days at the Local Civil Registry Office (Act No. 3753; 48h health officer review)" },
  RW: { tier: "days_8_to_35", summary: "Within 30 days at the Sector (Umurenge) office, health facility, or IremboGov" },
  SA: { tier: "days_8_to_35", summary: "Within 30 days via Absher / Ahwal Madaniyah (with direct electronic hospital notification)" },
  SN: { tier: "days_8_to_35", summary: "Within 1 month (45 days in certain rural areas) with the municipal registrar / ANEC" },
  SV: { tier: "days_8_to_35", summary: "Within 15 business days at the Municipal Family Status Registry (Alcaldía)" },
  SY: { tier: "days_8_to_35", summary: "Within 30 days at Syrian Civil Affairs Directorates (Civil Status Law No. 13 of 2021)" },
  SZ: { tier: "days_8_to_35", summary: "Typically within 30 days with Ministry of Home Affairs CRVS service centers" },
  TG: { tier: "days_8_to_35", summary: "Within 15 clear days before the municipal civil registrar" },
  TR: { tier: "days_8_to_35", summary: "Within 10 days notification to District Civil Registry (MERNİS) via electronic ÖBS" },
  TW: { tier: "days_8_to_35", summary: "Within 30 days at any Household Registration Office nationwide" },
  TZ: { tier: "days_8_to_35", summary: "Within 30 days in Mainland Tanzania with RITA / eRITA (Cap. 108)" },
  UY: { tier: "days_8_to_35", summary: "Within 10 working days in urban areas (20 working days in rural areas)" },
  VN: { tier: "days_8_to_35", summary: "Within 15 days at the Commune-level People's Committee (Law No. 60/2014/QH13)" },
  VU: { tier: "days_8_to_35", summary: "Within 21 days standard statutory practice with Department of Civil Registration (CRIM)" },
  WS: { tier: "days_8_to_35", summary: "Within 14 days with the BDM Division of the Samoa Bureau of Statistics (Act 2002)" },
  XK: { tier: "days_8_to_35", summary: "Within 15 days at the Municipal Civil Status Office (Law No. 04/L-003)" },
  ZM: { tier: "days_8_to_35", summary: "Within 1 calendar month on-time notification with DNRPC (Cap. 51 s. 18(1))" },

  // extended_42d_to_12m (15)
  BD: { tier: "extended_42d_to_12m", summary: "Within 45 days free statutory window via BDRIS (Births and Deaths Registration Act 2004)" },
  CM: { tier: "extended_42d_to_12m", summary: "Within 90 days before the civil status officer / BUNEC (Ordinance 81-02 as amended)" },
  DO: { tier: "extended_42d_to_12m", summary: "Within 60 calendar days at the JCE Oficialía del Estado Civil or hospital desk (Law 4-23)" },
  GN: { tier: "extended_42d_to_12m", summary: "Within 2 months statutory window under 2019 Civil Code Art. 218 (burial permit prior to interment)" },
  GY: { tier: "extended_42d_to_12m", summary: "Up to 12 months before specialized Late Registration rules apply at the General Register Office" },
  HN: { tier: "extended_42d_to_12m", summary: "Up to 6 months ordinary RNP window under Decree 62-2004 (24 to 48 hours in practice for burial permit)" },
  IE: { tier: "extended_42d_to_12m", summary: "Within 3 months with the HSE Civil Registration Service (Civil Registration Act 2004)" },
  KE: { tier: "extended_42d_to_12m", summary: "Within 6 months current registration window via Civil Registration Services / eCitizen (Cap. 149)" },
  MW: { tier: "extended_42d_to_12m", summary: "Within 6 weeks free registration window with the National Registration Bureau" },
  MZ: { tier: "extended_42d_to_12m", summary: "Immediately and within the 90-day statutory period at the Conservatória (SiRCEV)" },
  NE: { tier: "extended_42d_to_12m", summary: "Within 60 days at the local Civil Registry Declaration Center (Law 2019-29; burial permit prior)" },
  PK: { tier: "extended_42d_to_12m", summary: "Within 60 days standard registration at the Union Council / NADRA CRMS" },
  TD: { tier: "extended_42d_to_12m", summary: "Within 90 clear days at ANATS civil registry centers (Ordonnance No. 002/PR/2020 Art. 52)" },
  TV: { tier: "extended_42d_to_12m", summary: "Within 12 months via Funafuti Birth Registry or outer-island Kaupule (Cap. 17.10)" },
  UG: { tier: "extended_42d_to_12m", summary: "Immediate notice and formal registration within 3 months with NIRA (Act 2015)" },

  // disposition_or_prompt (38)
  AD: { tier: "disposition_or_prompt", summary: "Mandatory declaration prior to burial or cremation with Registre Civil d'Andorra" },
  AF: { tier: "disposition_or_prompt", summary: "In-person local Tazkira / NSIA civil registry filing (prompt Islamic burial practice)" },
  AM: { tier: "disposition_or_prompt", summary: "Prompt registration after electronic ArMed medical certificate via Hartak / e-gov portal prior to burial permit" },
  BE: { tier: "disposition_or_prompt", summary: "As soon as possible at the municipal état civil prior to municipal burial or cremation permit" },
  BF: { tier: "disposition_or_prompt", summary: "Facility report without delay and municipal civil registry declaration prior to burial permit" },
  BJ: { tier: "disposition_or_prompt", summary: "Within statutory period prior to burial permit at mairie / arrondissement with ANIP" },
  BO: { tier: "disposition_or_prompt", summary: "Declaration before SERECI Official Registry Office prior to 24 to 48 hour burial or cremation order" },
  BS: { tier: "disposition_or_prompt", summary: "Submitted by funeral director to Registrar General's Department prior to burial permit" },
  BT: { tier: "disposition_or_prompt", summary: "Prompt filing with DCRC / Thromde / Dzongkhag census office rather than waiting for Annual Census" },
  BY: { tier: "disposition_or_prompt", summary: "Same-day registration upon application at ZAGS prior to municipal cemetery or crematory permit" },
  CN: { tier: "disposition_or_prompt", summary: "Medical Death Certificate & Hukou cancellation prior to cremation/interment permit (Decree No. 824)" },
  DJ: { tier: "disposition_or_prompt", summary: "Within statutory period before communal civil registrar or prefecture prior to burial" },
  DM: { tier: "disposition_or_prompt", summary: "Within statutory timeframe prior to interment and Burial Order with District Registrar" },
  ER: { tier: "disposition_or_prompt", summary: "Prompt registration across Public Registration Office and Zoba / sub-Zoba administrations" },
  HT: { tier: "disposition_or_prompt", summary: "Prior to burial before the municipal Civil Status Officer (with National Archives extract)" },
  IR: { tier: "disposition_or_prompt", summary: "Prompt Sabte Ahval civil registration and Shenasnameh cancellation following medical release" },
  IS: { tier: "disposition_or_prompt", summary: "Prior to funeral, cremation, or transport permit (jarðarfararleyfi) with Sýslumenn / Ísland.is" },
  KM: { tier: "disposition_or_prompt", summary: "Declaration before municipal civil registrar under Law No. 84-10" },
  KP: { tier: "disposition_or_prompt", summary: "In-person reporting through hospital and city/county People's Committee civil registration office" },
  KW: { tier: "disposition_or_prompt", summary: "Promptly (customarily within 24h for burial permitting) at MoH Central Registry of Births and Deaths" },
  KZ: { tier: "disposition_or_prompt", summary: "Prompt registration via PSC, eGov.kz, or proactive SMS once medical death certificate is issued" },
  LR: { tier: "disposition_or_prompt", summary: "Prompt declaration to Ministry of Health Bureau of Vital Statistics or County Service Center" },
  LS: { tier: "disposition_or_prompt", summary: "Immediate submission of sealed medical certificate to National Identity and Civil Registration (NICR)" },
  MH: { tier: "disposition_or_prompt", summary: "Promptly following death and prior to final disposition or export with Registrar General" },
  MM: { tier: "disposition_or_prompt", summary: "Reported via Ward/Village Tract Administrator to Township Public Health Office (certificate in 1 to 2 days)" },
  MX: { tier: "disposition_or_prompt", summary: "Before local Registro Civil prior to 12 to 48 hour COFEPRIS sanitary burial or cremation window" },
  PW: { tier: "disposition_or_prompt", summary: "Coordinated with hospital notice via Palau Supreme Court Clerk of Courts (Vital Statistics)" },
  SB: { tier: "disposition_or_prompt", summary: "CRVS Death Form filing with Registrar General's Office and Ministry of Home Affairs" },
  SD: { tier: "disposition_or_prompt", summary: "Civil Registry Authority (al-Sijil al-Madani) filing via active state hubs following medical notice" },
  SL: { tier: "disposition_or_prompt", summary: "As soon as medical/coroner certificate is issued and prior to municipal Burial Permit at NCRA" },
  SM: { tier: "disposition_or_prompt", summary: "Prompt declaration at central Ufficio Stato Civile in Borgo Maggiore prior to burial/cremation authorization" },
  SO: { tier: "disposition_or_prompt", summary: "As soon as possible with Municipal Directorate of Civil Registration / NIRA (burial within 24 hours)" },
  SS: { tier: "disposition_or_prompt", summary: "Hospital senior medical certification and Ministry of Health death certificate / burial permit" },
  TM: { tier: "disposition_or_prompt", summary: "Registration with local ZAGS following medical or police verification prior to burial clearance" },
  TO: { tier: "disposition_or_prompt", summary: "Registration with Ministry of Justice Registrar General's Office (Cap. 42) prior to burial" },
  YE: { tier: "disposition_or_prompt", summary: "Governorate Civil Registry Office filing with medical notice and ID (prompt burial practice)" },
  ZA: { tier: "disposition_or_prompt", summary: "Prior to burial or cremation (Form DHA-1663 to Department of Home Affairs for Burial Order BI-14)" },
  ZW: { tier: "disposition_or_prompt", summary: "Notice of death to District Registrar (Cap. 5:02) to obtain Burial Order and Death Certificate" },
};

export const DIGITAL_CHANNEL_COUNTRIES = new Set([
  "AE","AM","AZ","BH","CL","CO","CR","DK","EE","FI","FR","GE","HU","IL","IN","IS",
  "KR","KZ","LT","LV","MA","NG","NO","PE","PT","QA","RU","RW","SA","SE","SG","SI",
  "TR","UA","US","UY","UZ",
]);

export const FUNERAL_OR_FACILITY_CHANNEL_COUNTRIES = new Set([
  "AD","AR","AT","AU","BE","BG","BR","BS","CA","CH","CU","CZ","DE","ES","GB","GR",
  "HR","IE","IT","LU","MC","MT","MX","NL","NZ","PA","PH","PL","PY","RS","SK","ZA",
]);

export const AUTO_PROPAGATION_COUNTRIES = new Set([
  "AM","AT","BE","BG","BH","BR","CH","CR","DE","DK","EE","FI","GB","HR","IL","IS",
  "IT","KR","KZ","LT","LV","ME","MU","NL","NO","PE","PT","RS","RW","SA","SE","SG",
  "SI","SK","TW","UY","UZ",
]);

export const EX_OFFICIO_PROBATE_COUNTRIES = new Set([
  "AT","BA","CZ","DK","HR","HU","LI","ME","MK","NO","RS","SI","SK",
]);

export const PERSONAL_STATUS_OR_PLURAL_COUNTRIES = new Set([
  "AE","AF","BD","BH","BN","DJ","DZ","EG","ID","IN","IQ","IR","JO","KM","KW","LB",
  "LY","MA","MM","MR","MV","MY","OM","PS","QA","SA","SD","SO","SY","TN","YE",
]);

export const COMMON_LAW_PROBATE_COUNTRIES = new Set([
  "AG","AU","BB","BS","BW","BZ","CA","CY","DM","FJ","FM","GB","GD","GH","GM","GY",
  "IE","JM","KE","KI","KN","LC","LK","LR","LS","MH","MW","NA","NG","NR","NZ","PG",
  "PW","SB","SG","SL","SS","SZ","TO","TT","TV","TZ","UG","US","VC","VU","WS","ZA",
  "ZM","ZW",
]);

export const CIVIL_LAW_NOTARY_COUNTRIES = new Set([
  "AD","AL","AM","AO","AZ","BE","BG","BI","BJ","BO","BR","BY","CO","CU","CV","DO",
  "EC","EE","ES","FR","GE","GQ","GR","GT","GW","HN","HT","IT","KG","KZ","LA","LT",
  "LU","LV","MC","MD","MG","MN","MT","MU","MX","MZ","NI","NL","PE","PH","PL","PT",
  "RO","RU","SR","ST","SV","TJ","TL","TM","TR","UA","UZ","VN","XK",
]);

export const CIVIL_JUDICIAL_OR_REGISTRY_COUNTRIES = new Set([
  "AR","BF","BT","CD","CF","CG","CH","CI","CL","CM","CN","CR","DE","ER","ET","FI",
  "GA","GN","IL","IS","JP","KH","KP","KR","ML","NE","NP","PA","PK","PY","RW","SC",
  "SE","SM","SN","TD","TG","TH","TW","UY","VE",
]);

export const FILING_CHANNEL_META: Record<
  FilingChannel,
  { label: string; shortLabel: string; description: string }
> = {
  digital_health_or_portal: {
    label: "Electronic health feed or national e-portal",
    shortLabel: "Digital health / e-portal",
    description:
      "Physicians, hospitals, or citizens submit death notices electronically through interconnected health-to-registry platforms or national e-government portals.",
  },
  funeral_director_or_facility: {
    label: "Funeral director or care facility intermediary",
    shortLabel: "Funeral director / facility",
    description:
      "Licensed funeral directors or hospital administrations routinely submit the formal declaration to the civil registrar on behalf of the bereaved family.",
  },
  in_person_informant: {
    label: "In-person family or local informant",
    shortLabel: "In-person family informant",
    description:
      "A surviving relative or statutory informant typically attends a municipal, district, or civil registry counter in person with paper medical proof.",
  },
};

export const AGENCY_PROPAGATION_META: Record<
  AgencyPropagation,
  { label: string; shortLabel: string; description: string }
> = {
  automated_or_one_stop: {
    label: "Automated register propagation or one-stop desk",
    shortLabel: "Automated / one-stop",
    description:
      "Civil registration triggers automatic population-register broadcasts to tax, pension, or social-insurance agencies, or provides a consolidated government Tell-Us-Once desk.",
  },
  manual_agency_by_agency: {
    label: "Manual agency-by-agency notifications",
    shortLabel: "Manual agency-by-agency",
    description:
      "Families must carry certified death certificates separately to social security funds, pension offices, tax authorities, and banks to stop benefits and open claims.",
  },
};

export const ESTATE_GATEKEEPER_META: Record<
  EstateGatekeeper,
  { label: string; shortLabel: string; description: string }
> = {
  civil_law_notary: {
    label: "Civil-law notary / extrajudicial deed",
    shortLabel: "Civil-law notary",
    description:
      "Public or sworn notaries issue certificates of heirship, execute extrajudicial partitions (when adult heirs agree), and search national will registers.",
  },
  common_law_probate_court: {
    label: "Common-law probate court / Master of High Court",
    shortLabel: "Common-law probate court",
    description:
      "Executors apply to High Court / Supreme Court Probate Registries (or the Master of the High Court) for a Grant of Probate or Letters of Administration.",
  },
  civil_judicial_or_registry: {
    label: "Civil court heirship decree or statutory registry",
    shortLabel: "Civil court / statutory registry",
    description:
      "Judicial succession declarations, municipal/tax estate inventories (such as Scandinavian bouppteckning / perunkirjoitus), or administrative succession desks establish heirship.",
  },
  personal_status_or_plural: {
    label: "Personal-status / Sharia court or plural legal system",
    shortLabel: "Personal-status / plural",
    description:
      "Heirship determination (such as Hasr al-Waratha or Faraid certificates) flows through Sharia, confessional, or community-specific personal-law courts.",
  },
  ex_officio_court_or_notary: {
    label: "Ex-officio court or court-commissioner initiation",
    shortLabel: "Ex-officio court initiation",
    description:
      "Once civil registration occurs, the registrar transmits the death record directly to the district probate court, which initiates succession without a family petition.",
  },
};

export const APOSTILLE_STATUS_META: Record<
  ApostilleStatus,
  { label: string; shortLabel: string }
> = {
  in_force_2026: {
    label: "1961 Hague Apostille Convention in force (November 2026)",
    shortLabel: "Hague Apostille in force",
  },
  entering_force_feb_2027: {
    label: "Acceded 30 June 2026; enters into force 28 February 2027",
    shortLabel: "Thailand (Feb 2027)",
  },
  consular_legalization_required: {
    label: "Non-party: MFA & embassy consular legalization required",
    shortLabel: "Consular legalization",
  },
};

export type AtlasReferenceSource = {
  id: string;
  title: string;
  issuer: string;
  scope: string;
  url: string;
};

export const ATLAS_REFERENCE_SOURCES: readonly AtlasReferenceSource[] = [
  {
    id: "hcch-12-atlas",
    title:
      "Convention of 5 October 1961 Abolishing the Requirement of Legalisation for Foreign Public Documents (HCCH #12 Status Table)",
    issuer: "Hague Conference on Private International Law (HCCH)",
    scope:
      "Verified 130 contracting parties globally (including 127 sovereign countries in force among our 196 guides as of November 2026, plus Thailand entering into force 28 February 2027).",
    url: "https://www.hcch.net/en/instruments/conventions/status-table/?cid=41",
  },
  {
    id: "unsd-crvs",
    title:
      "Principles and Recommendations for a Vital Statistics System, Revision 3 (Series M, No. 19/Rev.3)",
    issuer: "United Nations Statistics Division (UN DESA)",
    scope:
      "Global international standards for civil death registration, timeliness, health-to-registry interoperability, and vital statistics completeness.",
    url: "https://unstats.un.org/unsd/demographic-social/Standards-and-Methods/files/Principles_and_Recommendations/CRVS/M19Rev3-E.pdf",
  },
  {
    id: "un-legal-identity",
    title: "United Nations Legal Identity Agenda (CRVS & Identity Systems)",
    issuer: "United Nations Legal Identity Task Force",
    scope:
      "Interoperability benchmarks connecting civil registration systems from birth through death with legal identity and public administration.",
    url: "https://unstats.un.org/legal-identity-agenda/",
  },
  {
    id: "eu-sdg-ootp",
    title:
      "Regulation (EU) 2018/1724 establishing a Single Digital Gateway and the cross-border Once-Only Technical System",
    issuer: "Official Journal of the European Union (EUR-Lex)",
    scope:
      "European legal framework for digital life-event procedures and automated public-register exchange reducing duplicate citizen submissions.",
    url: "https://eur-lex.europa.eu/eli/reg/2018/1724/oj",
  },
  {
    id: "eu-2016-1191-atlas",
    title:
      "Regulation (EU) 2016/1191 on Promoting the Free Movement of Public Documents",
    issuer: "Official Journal of the European Union (EUR-Lex)",
    scope:
      "Intra-EU apostille exemptions and multilingual standard forms supporting cross-border circulation of domestic death certificates.",
    url: "https://eur-lex.europa.eu/eli/reg/2016/1191/oj",
  },
];

export type CountryRegistrationAtlasRow = {
  id: string;
  countryCode: string;
  countryName: string;
  macroRegion: MacroRegion;
  guideSlug: string;
  guideHref: string;
  registrationWindowTier: RegistrationWindowTier;
  registrationWindowLabel: string;
  registrationWindowRank: number;
  statutoryWindowSummary: string;
  filingChannel: FilingChannel;
  filingChannelLabel: string;
  agencyPropagation: AgencyPropagation;
  agencyPropagationLabel: string;
  estateGatekeeper: EstateGatekeeper;
  estateGatekeeperLabel: string;
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

export type AtlasDistributionBucket<Code extends string> = {
  code: Code;
  label: string;
  description: string;
  count: number;
  pct: number;
};

export type MacroRegionSummary = {
  region: MacroRegion;
  countryCount: number;
  automaticOrWithin48hCount: number;
  automaticOrWithin48hPct: number;
  digitalFilingCount: number;
  digitalFilingPct: number;
  automatedPropagationCount: number;
  automatedPropagationPct: number;
  apostilleInForceCount: number;
  apostilleInForcePct: number;
  verifiedSourcesCount: number;
  verifiedContactsCount: number;
};

export type PostDeathCivilRegistrationStudy = {
  publishedDate: string;
  verifySnapshot: string;
  totalCountries: number;
  macroRegionCount: number;
  totalVerifiedCitationsIn196Guides: number;
  totalVerifiedContactsIn196Guides: number;
  automaticDigitalCount: number;
  automaticDigitalPct: number;
  digitalOrIntermediaryFilingCount: number;
  digitalOrIntermediaryFilingPct: number;
  digitalFilingCount: number;
  digitalFilingPct: number;
  automatedPropagationCount: number;
  automatedPropagationPct: number;
  manualPropagationCount: number;
  manualPropagationPct: number;
  exOfficioProbateCount: number;
  exOfficioProbatePct: number;
  apostilleInForceCount: number;
  apostilleInForcePct: number;
  postFeb2027ApostillePct: number;
  consularOnlyCount: number;
  consularOnlyPct: number;
  registrationWindowDistribution: AtlasDistributionBucket<RegistrationWindowTier>[];
  filingChannelDistribution: AtlasDistributionBucket<FilingChannel>[];
  agencyPropagationDistribution: AtlasDistributionBucket<AgencyPropagation>[];
  estateGatekeeperDistribution: AtlasDistributionBucket<EstateGatekeeper>[];
  apostilleDistribution: AtlasDistributionBucket<ApostilleStatus>[];
  macroRegionSummaries: MacroRegionSummary[];
  rows: CountryRegistrationAtlasRow[];
  referenceSources: readonly AtlasReferenceSource[];
};

let cachedStudy2: PostDeathCivilRegistrationStudy | null = null;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function pct1(part: number, total: number): number {
  return total > 0 ? round1((part / total) * 100) : 0;
}

function classifyCountryGuide(guide: CorridorGuide): CountryRegistrationAtlasRow {
  const code = guide.countryOfDeathCode;
  const macroRegion = MACRO_REGION_BY_ISO[code];
  if (!macroRegion) {
    throw new Error(`Missing macro-region classification for country code: ${code}`);
  }

  const windowSpec = STATUTORY_WINDOW_SPEC_BY_ISO[code];
  if (!windowSpec) {
    throw new Error(`Missing registration window spec for country code: ${code}`);
  }
  const windowMeta = REGISTRATION_WINDOW_META[windowSpec.tier];

  const filingChannel: FilingChannel = DIGITAL_CHANNEL_COUNTRIES.has(code)
    ? "digital_health_or_portal"
    : FUNERAL_OR_FACILITY_CHANNEL_COUNTRIES.has(code)
      ? "funeral_director_or_facility"
      : "in_person_informant";

  const agencyPropagation: AgencyPropagation = AUTO_PROPAGATION_COUNTRIES.has(code)
    ? "automated_or_one_stop"
    : "manual_agency_by_agency";

  let estateGatekeeper: EstateGatekeeper;
  if (EX_OFFICIO_PROBATE_COUNTRIES.has(code)) {
    estateGatekeeper = "ex_officio_court_or_notary";
  } else if (PERSONAL_STATUS_OR_PLURAL_COUNTRIES.has(code)) {
    estateGatekeeper = "personal_status_or_plural";
  } else if (COMMON_LAW_PROBATE_COUNTRIES.has(code)) {
    estateGatekeeper = "common_law_probate_court";
  } else if (CIVIL_LAW_NOTARY_COUNTRIES.has(code)) {
    estateGatekeeper = "civil_law_notary";
  } else if (CIVIL_JUDICIAL_OR_REGISTRY_COUNTRIES.has(code)) {
    estateGatekeeper = "civil_judicial_or_registry";
  } else {
    throw new Error(`Missing estate gatekeeper classification for country code: ${code}`);
  }

  const apostilleStatus: ApostilleStatus = HCCH_12_IN_FORCE_2026_11.has(code)
    ? "in_force_2026"
    : code === "TH"
      ? "entering_force_feb_2027"
      : "consular_legalization_required";

  const primarySource = guide.sources[0];
  if (!primarySource) {
    throw new Error(`Guide ${guide.slug} (${code}) is missing primary source`);
  }

  const primaryContactNames = guide.contacts
    .slice(0, 3)
    .map((c) => c.name)
    .join(" ");

  const searchText = [
    guide.countryOfDeath,
    code,
    macroRegion,
    windowMeta.label,
    windowSpec.summary,
    FILING_CHANNEL_META[filingChannel].shortLabel,
    AGENCY_PROPAGATION_META[agencyPropagation].shortLabel,
    ESTATE_GATEKEEPER_META[estateGatekeeper].shortLabel,
    APOSTILLE_STATUS_META[apostilleStatus].shortLabel,
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
    registrationWindowTier: windowSpec.tier,
    registrationWindowLabel: windowMeta.label,
    registrationWindowRank: windowMeta.rank,
    statutoryWindowSummary: windowSpec.summary,
    filingChannel,
    filingChannelLabel: FILING_CHANNEL_META[filingChannel].shortLabel,
    agencyPropagation,
    agencyPropagationLabel: AGENCY_PROPAGATION_META[agencyPropagation].shortLabel,
    estateGatekeeper,
    estateGatekeeperLabel: ESTATE_GATEKEEPER_META[estateGatekeeper].shortLabel,
    apostilleStatus,
    apostilleStatusLabel: APOSTILLE_STATUS_META[apostilleStatus].shortLabel,
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

function buildDistribution<Code extends string>(
  values: readonly Code[],
  total: number,
  defs: ReadonlyArray<{ code: Code; label: string; description: string }>,
): AtlasDistributionBucket<Code>[] {
  const counts = new Map<Code, number>();
  for (const val of values) {
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  return defs.map((d) => {
    const count = counts.get(d.code) ?? 0;
    return {
      code: d.code,
      label: d.label,
      description: d.description,
      count,
      pct: pct1(count, total),
    };
  });
}

/**
 * Deterministic 196-country study quantifying post-death statutory registration windows,
 * filing channels, inter-agency propagation, estate gatekeepers, and Hague Apostille reach.
 */
export function getPostDeathCivilRegistrationStudy(): PostDeathCivilRegistrationStudy {
  if (cachedStudy2) return cachedStudy2;

  const domesticBereavementGuides = publishedCorridorGuides("en").filter(
    (g) =>
      g.category === "domestic-bereavement" &&
      g.countryOfDeathCode === g.citizenshipCountryCode,
  );

  const rows = domesticBereavementGuides
    .map(classifyCountryGuide)
    .sort((a, b) => a.countryName.localeCompare(b.countryName, "en"));

  const total = rows.length;
  const totalVerifiedCitations = rows.reduce(
    (acc, r) => acc + r.verifiedSourcesCount,
    0,
  );
  const totalVerifiedContacts = rows.reduce(
    (acc, r) => acc + r.verifiedContactsCount,
    0,
  );

  const registrationWindowDistribution = buildDistribution<RegistrationWindowTier>(
    rows.map((r) => r.registrationWindowTier),
    total,
    (
      [
        "automatic_digital",
        "within_48h",
        "days_3_to_7",
        "days_8_to_35",
        "extended_42d_to_12m",
        "disposition_or_prompt",
        "subnational_federal",
      ] as const
    ).map((code) => ({
      code,
      label: REGISTRATION_WINDOW_META[code].label,
      description: REGISTRATION_WINDOW_META[code].rationale,
    })),
  );

  const filingChannelDistribution = buildDistribution<FilingChannel>(
    rows.map((r) => r.filingChannel),
    total,
    (
      [
        "digital_health_or_portal",
        "funeral_director_or_facility",
        "in_person_informant",
      ] as const
    ).map((code) => ({
      code,
      label: FILING_CHANNEL_META[code].label,
      description: FILING_CHANNEL_META[code].description,
    })),
  );

  const agencyPropagationDistribution = buildDistribution<AgencyPropagation>(
    rows.map((r) => r.agencyPropagation),
    total,
    (
      ["automated_or_one_stop", "manual_agency_by_agency"] as const
    ).map((code) => ({
      code,
      label: AGENCY_PROPAGATION_META[code].label,
      description: AGENCY_PROPAGATION_META[code].description,
    })),
  );

  const estateGatekeeperDistribution = buildDistribution<EstateGatekeeper>(
    rows.map((r) => r.estateGatekeeper),
    total,
    (
      [
        "civil_law_notary",
        "common_law_probate_court",
        "civil_judicial_or_registry",
        "personal_status_or_plural",
        "ex_officio_court_or_notary",
      ] as const
    ).map((code) => ({
      code,
      label: ESTATE_GATEKEEPER_META[code].label,
      description: ESTATE_GATEKEEPER_META[code].description,
    })),
  );

  const apostilleDistribution = buildDistribution<ApostilleStatus>(
    rows.map((r) => r.apostilleStatus),
    total,
    [
      {
        code: "in_force_2026",
        label: APOSTILLE_STATUS_META.in_force_2026.label,
        description:
          "Death certificates and probate grants circulate with a single Apostille stamp across fellow contracting states.",
      },
      {
        code: "entering_force_feb_2027",
        label: APOSTILLE_STATUS_META.entering_force_feb_2027.label,
        description:
          "Thailand acceded on 30 June 2026; consular legalization applies until entry into force on 28 February 2027.",
      },
      {
        code: "consular_legalization_required",
        label: APOSTILLE_STATUS_META.consular_legalization_required.label,
        description:
          "Cross-border death and estate records still require multi-step Foreign Ministry and destination embassy legalization unless bilaterally exempt.",
      },
    ],
  );

  const macroRegionSummaries: MacroRegionSummary[] = MACRO_REGION_ORDER.map(
    (region) => {
      const subset = rows.filter((r) => r.macroRegion === region);
      const count = subset.length;
      const auto48 = subset.filter(
        (r) =>
          r.registrationWindowTier === "automatic_digital" ||
          r.registrationWindowTier === "within_48h",
      ).length;
      const digCount = subset.filter(
        (r) => r.filingChannel === "digital_health_or_portal",
      ).length;
      const propCount = subset.filter(
        (r) => r.agencyPropagation === "automated_or_one_stop",
      ).length;
      const apoCount = subset.filter(
        (r) => r.apostilleStatus === "in_force_2026",
      ).length;

      return {
        region,
        countryCount: count,
        automaticOrWithin48hCount: auto48,
        automaticOrWithin48hPct: pct1(auto48, count),
        digitalFilingCount: digCount,
        digitalFilingPct: pct1(digCount, count),
        automatedPropagationCount: propCount,
        automatedPropagationPct: pct1(propCount, count),
        apostilleInForceCount: apoCount,
        apostilleInForcePct: pct1(apoCount, count),
        verifiedSourcesCount: subset.reduce(
          (acc, r) => acc + r.verifiedSourcesCount,
          0,
        ),
        verifiedContactsCount: subset.reduce(
          (acc, r) => acc + r.verifiedContactsCount,
          0,
        ),
      };
    },
  );

  const automaticDigitalCount =
    registrationWindowDistribution.find((d) => d.code === "automatic_digital")
      ?.count ?? 0;
  const digitalFilingCount =
    filingChannelDistribution.find((d) => d.code === "digital_health_or_portal")
      ?.count ?? 0;
  const intermediaryCount =
    filingChannelDistribution.find(
      (d) => d.code === "funeral_director_or_facility",
    )?.count ?? 0;
  const automatedPropagationCount =
    agencyPropagationDistribution.find(
      (d) => d.code === "automated_or_one_stop",
    )?.count ?? 0;
  const manualPropagationCount = total - automatedPropagationCount;
  const exOfficioProbateCount =
    estateGatekeeperDistribution.find(
      (d) => d.code === "ex_officio_court_or_notary",
    )?.count ?? 0;
  const apostilleInForceCount =
    apostilleDistribution.find((d) => d.code === "in_force_2026")?.count ?? 0;
  const thailandTransitionCount =
    apostilleDistribution.find((d) => d.code === "entering_force_feb_2027")
      ?.count ?? 0;
  const consularOnlyCount =
    apostilleDistribution.find(
      (d) => d.code === "consular_legalization_required",
    )?.count ?? 0;

  cachedStudy2 = {
    publishedDate: STUDY_2_PUBLISHED_DATE,
    verifySnapshot: STUDY_2_VERIFY_SNAPSHOT,
    totalCountries: total,
    macroRegionCount: macroRegionSummaries.length,
    totalVerifiedCitationsIn196Guides: totalVerifiedCitations,
    totalVerifiedContactsIn196Guides: totalVerifiedContacts,
    automaticDigitalCount,
    automaticDigitalPct: pct1(automaticDigitalCount, total),
    digitalOrIntermediaryFilingCount: digitalFilingCount + intermediaryCount,
    digitalOrIntermediaryFilingPct: pct1(
      digitalFilingCount + intermediaryCount,
      total,
    ),
    digitalFilingCount,
    digitalFilingPct: pct1(digitalFilingCount, total),
    automatedPropagationCount,
    automatedPropagationPct: pct1(automatedPropagationCount, total),
    manualPropagationCount,
    manualPropagationPct: pct1(manualPropagationCount, total),
    exOfficioProbateCount,
    exOfficioProbatePct: pct1(exOfficioProbateCount, total),
    apostilleInForceCount,
    apostilleInForcePct: pct1(apostilleInForceCount, total),
    postFeb2027ApostillePct: pct1(
      apostilleInForceCount + thailandTransitionCount,
      total,
    ),
    consularOnlyCount,
    consularOnlyPct: pct1(consularOnlyCount, total),
    registrationWindowDistribution,
    filingChannelDistribution,
    agencyPropagationDistribution,
    estateGatekeeperDistribution,
    apostilleDistribution,
    macroRegionSummaries,
    rows,
    referenceSources: ATLAS_REFERENCE_SOURCES,
  };

  return cachedStudy2;
}

function csvCell(value: string | number | boolean): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Serialize all 196 countries in Study 2 as RFC-4180 UTF-8 CSV. */
export function serializeStudy2RowsToCsv(
  study: PostDeathCivilRegistrationStudy = getPostDeathCivilRegistrationStudy(),
): string {
  const header = [
    "country_code",
    "country_name",
    "macro_region",
    "guide_slug",
    "guide_url",
    "registration_window_tier",
    "registration_window_label",
    "statutory_window_summary",
    "filing_channel",
    "filing_channel_label",
    "agency_propagation",
    "agency_propagation_label",
    "estate_gatekeeper",
    "estate_gatekeeper_label",
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
        csvCell(r.registrationWindowTier),
        csvCell(r.registrationWindowLabel),
        csvCell(r.statutoryWindowSummary),
        csvCell(r.filingChannel),
        csvCell(r.filingChannelLabel),
        csvCell(r.agencyPropagation),
        csvCell(r.agencyPropagationLabel),
        csvCell(r.estateGatekeeper),
        csvCell(r.estateGatekeeperLabel),
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

/** Serialize Study 2 metadata, distributions, regional summaries, and all 196 rows as reproducible JSON. */
export function serializeStudy2ToJson(
  study: PostDeathCivilRegistrationStudy = getPostDeathCivilRegistrationStudy(),
): string {
  const payload = {
    title:
      "Global Post-Death Civil Registration & Estate Administration Atlas (2026)",
    publisher: "Clarvia ASBL (RCS Luxembourg F15680)",
    license: "CC-BY-4.0",
    publishedDate: study.publishedDate,
    verifySnapshot: study.verifySnapshot,
    canonicalUrl: STUDY_2_CANONICAL_URL,
    csvUrl: `https://clarvia.org${STUDY_2_CSV_PATH}`,
    jsonUrl: `https://clarvia.org${STUDY_2_JSON_PATH}`,
    zenodoDatasetDoi: ZENODO_STUDY_CORPUS_DOI,
    zenodoDatasetRecordUrl: ZENODO_RECORD_URL,
    zenodoSoftwareDoi: ZENODO_SOFTWARE_DOI,
    zenodoSoftwareRecordUrl: ZENODO_SOFTWARE_RECORD_URL,
    sourceCodeUrl: GITHUB_STUDY_2_SOURCE_URL,
    summary: {
      totalCountries: study.totalCountries,
      macroRegionCount: study.macroRegionCount,
      totalVerifiedCitationsIn196Guides:
        study.totalVerifiedCitationsIn196Guides,
      totalVerifiedContactsIn196Guides: study.totalVerifiedContactsIn196Guides,
      fullCorpusCanonicalGuides: CORPUS_STATS.canonicalGuides,
      fullCorpusLocalizedPages: CORPUS_STATS.localizedPages,
      fullCorpusVerifiedOfficialCitations:
        CORPUS_STATS.verifiedOfficialCitations,
      automaticDigitalCount: study.automaticDigitalCount,
      automaticDigitalPct: study.automaticDigitalPct,
      digitalFilingCount: study.digitalFilingCount,
      digitalFilingPct: study.digitalFilingPct,
      digitalOrIntermediaryFilingCount: study.digitalOrIntermediaryFilingCount,
      digitalOrIntermediaryFilingPct: study.digitalOrIntermediaryFilingPct,
      automatedPropagationCount: study.automatedPropagationCount,
      automatedPropagationPct: study.automatedPropagationPct,
      manualPropagationCount: study.manualPropagationCount,
      manualPropagationPct: study.manualPropagationPct,
      exOfficioProbateCount: study.exOfficioProbateCount,
      exOfficioProbatePct: study.exOfficioProbatePct,
      apostilleInForceCount: study.apostilleInForceCount,
      apostilleInForcePct: study.apostilleInForcePct,
      postFeb2027ApostillePct: study.postFeb2027ApostillePct,
      consularOnlyCount: study.consularOnlyCount,
      consularOnlyPct: study.consularOnlyPct,
    },
    registrationWindowDistribution: study.registrationWindowDistribution,
    filingChannelDistribution: study.filingChannelDistribution,
    agencyPropagationDistribution: study.agencyPropagationDistribution,
    estateGatekeeperDistribution: study.estateGatekeeperDistribution,
    apostilleDistribution: study.apostilleDistribution,
    macroRegionSummaries: study.macroRegionSummaries,
    referenceSources: study.referenceSources,
    rows: study.rows,
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}
