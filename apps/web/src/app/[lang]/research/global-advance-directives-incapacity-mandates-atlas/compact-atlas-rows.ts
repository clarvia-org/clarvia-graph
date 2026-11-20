import type {
  AdvanceDirectiveRegime,
  AdvanceDirectivesCountryRow,
  ApostilleStatus,
  CaregiverProtectionRegime,
  Hcch35Status,
  IncapacityMandateRegime,
  MacroRegion,
} from "@/content/research/advance-directives-incapacity-study";

export type CompactAdvanceDirectivesRow = readonly [
  countryCode: string,
  countryName: string,
  macroRegion: MacroRegion,
  guideSlugSuffix: string,
  ahdRegime: AdvanceDirectiveRegime,
  ahdCustomSummary: string,
  mandateRegime: IncapacityMandateRegime,
  mandateCustomSummary: string,
  carerRegime: CaregiverProtectionRegime,
  hcch35Status: Hcch35Status,
  apostilleStatus: ApostilleStatus,
  verifiedSourcesCount: number,
  primarySourceUrl: string,
  extraSearch: string,
];

const GUIDE_HREF_PREFIX = "/en/guide/terminal-illness-admin-";

export const AHD_META: Record<
  AdvanceDirectiveRegime,
  { rank: number; shortLabel: string; defaultSummary: string }
> = {
  statute_with_national_register: {
    rank: 1,
    shortLabel: "Statute + national registry",
    defaultSummary: "",
  },
  binding_statute_local_or_subnational: {
    rank: 2,
    shortLabel: "Binding statute (local / state)",
    defaultSummary: "",
  },
  patients_rights_or_clinical_framework: {
    rank: 3,
    shortLabel: "Patients' rights / clinical rules",
    defaultSummary:
      "Patients' rights or health-law written treatment-refusal and clinical spokesperson rules (no standalone national living-will register)",
  },
  general_consent_or_family_consultation: {
    rank: 4,
    shortLabel: "Clinical consent & family consult",
    defaultSummary:
      "Contemporaneous clinical consent and family/physician consultation recorded in hospital chart",
  },
};

export const MANDATE_META: Record<
  IncapacityMandateRegime,
  { rank: number; shortLabel: string; defaultSummary: string }
> = {
  continuing_or_lasting_poa: {
    rank: 1,
    shortLabel: "Continuing / lasting PoA",
    defaultSummary: "",
  },
  advance_guardian_or_support_designation: {
    rank: 2,
    shortLabel: "Voluntary guardian / support deed",
    defaultSummary: "",
  },
  ordinary_poa_court_guardianship: {
    rank: 3,
    shortLabel: "Ordinary PoA (court guardianship)",
    defaultSummary:
      "Ordinary mandate requires ongoing capacity; judicial guardianship, curatorship, or interdiction required upon incapacity",
  },
};

export const CARER_META: Record<
  CaregiverProtectionRegime,
  { rank: number; shortLabel: string }
> = {
  paid_caregiver_or_palliative_leave: {
    rank: 1,
    shortLabel: "Paid caregiver / palliative leave",
  },
  carer_allowance_or_job_protected_leave: {
    rank: 2,
    shortLabel: "Carer allowance / protected leave",
  },
  patient_sick_or_invalidity_only: {
    rank: 3,
    shortLabel: "Patient sick / invalidity cover",
  },
};

export const HCCH35_META: Record<
  Hcch35Status,
  { rank: number; shortLabel: string }
> = {
  in_force_nationwide: { rank: 1, shortLabel: "HCCH #35 nationwide" },
  in_force_scotland_only: { rank: 2, shortLabel: "HCCH #35 (Scotland only)" },
  acceded_eif_aug_2027: { rank: 3, shortLabel: "EIF 1 Aug 2027 (ME)" },
  signed_not_ratified: { rank: 4, shortLabel: "Signed, not ratified" },
  non_party: { rank: 5, shortLabel: "Non-party" },
};

export const APOSTILLE_SHORT_LABEL: Record<ApostilleStatus, string> = {
  in_force_2026: "HCCH #12 in force",
  entering_force_feb_2027: "EIF 28 Feb 2027 (TH)",
  consular_legalization_required: "Consular legalization",
};

export function toCompactAdvanceDirectivesRows(
  rows: readonly AdvanceDirectivesCountryRow[],
): CompactAdvanceDirectivesRow[] {
  return rows.map((row) => {
    const guideSlugSuffix = row.guideHref.startsWith(GUIDE_HREF_PREFIX)
      ? row.guideHref.slice(GUIDE_HREF_PREFIX.length)
      : row.guideHref;
    const ahdCustomSummary =
      row.advanceDirectiveSummary ===
      AHD_META[row.advanceDirectiveRegime].defaultSummary
        ? ""
        : row.advanceDirectiveSummary;
    const mandateCustomSummary =
      row.incapacityMandateSummary ===
      MANDATE_META[row.incapacityMandateRegime].defaultSummary
        ? ""
        : row.incapacityMandateSummary;
    const visiblePrefix = [
      row.countryName,
      row.countryCode,
      row.macroRegion,
      row.advanceDirectiveLabel,
      row.advanceDirectiveSummary,
      row.incapacityMandateLabel,
      row.incapacityMandateSummary,
      row.caregiverProtectionLabel,
      row.hcch35StatusLabel,
      row.apostilleStatusLabel,
    ]
      .join(" ")
      .toLowerCase();
    const extraSearch = row.searchText.startsWith(visiblePrefix)
      ? row.searchText.slice(visiblePrefix.length).trim()
      : row.searchText;

    return [
      row.countryCode,
      row.countryName,
      row.macroRegion,
      guideSlugSuffix,
      row.advanceDirectiveRegime,
      ahdCustomSummary,
      row.incapacityMandateRegime,
      mandateCustomSummary,
      row.caregiverProtectionRegime,
      row.hcch35Status,
      row.apostilleStatus,
      row.verifiedSourcesCount,
      row.primarySourceUrl,
      extraSearch,
    ];
  });
}

export function expandCompactGuideHref(suffix: string): string {
  return suffix.startsWith("/") ? suffix : `${GUIDE_HREF_PREFIX}${suffix}`;
}
