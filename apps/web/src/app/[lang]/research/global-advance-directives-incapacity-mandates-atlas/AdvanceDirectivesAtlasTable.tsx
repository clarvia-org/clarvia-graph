"use client";

import {
  type HTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { headlineStyle } from "../../data";
import type {
  AdvanceDirectiveRegime,
  AdvanceDirectivesCountryRow,
  ApostilleStatus,
  CaregiverProtectionRegime,
  Hcch35Status,
  IncapacityMandateRegime,
  MacroRegion,
} from "@/content/research/advance-directives-incapacity-study";
import {
  AHD_META,
  APOSTILLE_SHORT_LABEL,
  CARER_META,
  type CompactAdvanceDirectivesRow,
  HCCH35_META,
  MANDATE_META,
  buildCompactRowSearchText,
  expandCompactGuideHref,
  toCompactAdvanceDirectivesRows,
} from "./compact-atlas-rows";

interface InvokerCommandEvent extends Event {
  command?: string;
  source?: Element | null;
}

type SortDirection = "ascending" | "descending";

const COLLATOR = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const AHD_BADGE_CLASS = (regime: AdvanceDirectiveRegime): string => {
  switch (regime) {
    case "statute_with_national_register":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "binding_statute_local_or_subnational":
      return "bg-calm-blue-50 text-calm-blue-800 border-calm-blue-200";
    case "patients_rights_or_clinical_framework":
      return "bg-sky-50 text-sky-900 border-sky-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
};

const MANDATE_BADGE_CLASS = (regime: IncapacityMandateRegime): string => {
  switch (regime) {
    case "continuing_or_lasting_poa":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "advance_guardian_or_support_designation":
      return "bg-calm-blue-50 text-calm-blue-800 border-calm-blue-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
};

const CAREGIVER_BADGE_CLASS = (regime: CaregiverProtectionRegime): string => {
  switch (regime) {
    case "paid_caregiver_or_palliative_leave":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "carer_allowance_or_job_protected_leave":
      return "bg-sky-50 text-sky-900 border-sky-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const HCCH35_BADGE_CLASS = (status: Hcch35Status): string => {
  switch (status) {
    case "in_force_nationwide":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "in_force_scotland_only":
      return "bg-indigo-50 text-indigo-900 border-indigo-200";
    case "acceded_eif_aug_2027":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "signed_not_ratified":
      return "bg-orange-50 text-orange-900 border-orange-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
};

const APOSTILLE_BADGE_CLASS = (status: ApostilleStatus): string => {
  if (status === "in_force_2026") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (status === "entering_force_feb_2027") {
    return "bg-amber-50 text-amber-900 border-amber-200";
  }
  return "bg-slate-100 text-slate-800 border-slate-300";
};

function matchesCombinedFilter(
  tr: HTMLTableRowElement,
  combinedFilter: string,
): boolean {
  if (combinedFilter === "all") return true;
  if (combinedFilter.startsWith("carer:")) {
    return tr.dataset.carer === combinedFilter.slice("carer:".length);
  }
  if (combinedFilter.startsWith("hcch35:")) {
    return tr.dataset.hcch35 === combinedFilter.slice("hcch35:".length);
  }
  if (combinedFilter.startsWith("apostille:")) {
    return tr.dataset.apostille === combinedFilter.slice("apostille:".length);
  }
  return true;
}

export default function AdvanceDirectivesAtlasTable({
  compactRows,
  rows,
  regions,
}: {
  compactRows?: readonly CompactAdvanceDirectivesRow[];
  rows?: readonly AdvanceDirectivesCountryRow[];
  regions: readonly MacroRegion[];
}) {
  const normalizedRows = useMemo(
    () => compactRows ?? (rows ? toCompactAdvanceDirectivesRows(rows) : []),
    [compactRows, rows],
  );

  const baseId = useId();
  const tableId = `${baseId}-table`;
  const captionId = `${baseId}-caption`;
  const headingId = `${baseId}-heading`;
  const queryId = `${baseId}-query`;
  const regionFilterId = `${baseId}-region`;
  const ahdFilterId = `${baseId}-ahd`;
  const mandateFilterId = `${baseId}-mandate`;
  const combinedFilterId = `${baseId}-combined`;

  const tableRef = useRef<HTMLTableElement | null>(null);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const queryRef = useRef<HTMLInputElement | null>(null);
  const regionSelectRef = useRef<HTMLSelectElement | null>(null);
  const ahdSelectRef = useRef<HTMLSelectElement | null>(null);
  const mandateSelectRef = useRef<HTMLSelectElement | null>(null);
  const combinedSelectRef = useRef<HTMLSelectElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const emptyRef = useRef<HTMLParagraphElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const lastAnnouncementRef = useRef("");
  const searchIndexRef = useRef<{
    rows: readonly CompactAdvanceDirectivesRow[];
    map: Map<string, string>;
  } | null>(null);

  const announce = useCallback((message: string) => {
    const status = statusRef.current;
    if (!status) return;
    const text =
      message === lastAnnouncementRef.current ? `${message}\u00A0` : message;
    lastAnnouncementRef.current = text;
    status.textContent = text;
  }, []);

  const applyFilters = useCallback(
    (shouldAnnounce = true) => {
      const tbody = tbodyRef.current;
      if (!tbody) return;

      const query = (queryRef.current?.value ?? "").trim().toLowerCase();
      const regionVal = regionSelectRef.current?.value ?? "all";
      const ahdVal = ahdSelectRef.current?.value ?? "all";
      const mandateVal = mandateSelectRef.current?.value ?? "all";
      const combinedVal = combinedSelectRef.current?.value ?? "all";

      let searchMap: Map<string, string> | null = null;
      if (query) {
        if (
          !searchIndexRef.current ||
          searchIndexRef.current.rows !== normalizedRows
        ) {
          const map = new Map<string, string>();
          for (const row of normalizedRows) {
            map.set(row[0], buildCompactRowSearchText(row));
          }
          searchIndexRef.current = { rows: normalizedRows, map };
        }
        searchMap = searchIndexRef.current.map;
      }

      const trs = Array.from(tbody.querySelectorAll("tr"));
      let visible = 0;

      for (const tr of trs) {
        const matchesQuery =
          !query ||
          (searchMap?.get(tr.dataset.code ?? "") ?? "").includes(query);
        const matchesRegion =
          regionVal === "all" || tr.dataset.region === regionVal;
        const matchesAhd = ahdVal === "all" || tr.dataset.ahd === ahdVal;
        const matchesMandate =
          mandateVal === "all" || tr.dataset.mandate === mandateVal;
        const matchesCombined = matchesCombinedFilter(tr, combinedVal);

        const show =
          matchesQuery &&
          matchesRegion &&
          matchesAhd &&
          matchesMandate &&
          matchesCombined;
        tr.hidden = !show;
        if (show) visible += 1;
      }

      if (countRef.current) {
        countRef.current.textContent = `Showing ${visible} of ${normalizedRows.length} countries`;
      }
      if (emptyRef.current) {
        emptyRef.current.hidden = visible > 0;
      }
      if (regionRef.current) {
        regionRef.current.hidden = visible === 0;
      }
      if (shouldAnnounce) {
        announce(`Showing ${visible} of ${normalizedRows.length} countries`);
      }
    },
    [announce, normalizedRows],
  );

  const handleReset = useCallback(() => {
    if (queryRef.current) queryRef.current.value = "";
    if (regionSelectRef.current) regionSelectRef.current.value = "all";
    if (ahdSelectRef.current) ahdSelectRef.current.value = "all";
    if (mandateSelectRef.current) mandateSelectRef.current.value = "all";
    if (combinedSelectRef.current) combinedSelectRef.current.value = "all";
    applyFilters(true);
    queryRef.current?.focus();
  }, [applyFilters]);

  useEffect(() => {
    const query = (queryRef.current?.value ?? "").trim();
    const regionVal = regionSelectRef.current?.value ?? "all";
    const ahdVal = ahdSelectRef.current?.value ?? "all";
    const mandateVal = mandateSelectRef.current?.value ?? "all";
    const combinedVal = combinedSelectRef.current?.value ?? "all";
    if (
      !query &&
      regionVal === "all" &&
      ahdVal === "all" &&
      mandateVal === "all" &&
      combinedVal === "all"
    ) {
      return;
    }
    applyFilters(false);
  }, [applyFilters]);

  useEffect(() => {
    const table = tableRef.current;
    const tbody = tbodyRef.current;
    if (!table || !tbody) return;

    const thead = table.tHead;

    function handleSort(button: HTMLButtonElement) {
      if (!tbody || !thead) return;
      const th = button.closest("th");
      if (!(th instanceof HTMLTableCellElement)) return;

      const colIndex = Number(button.dataset.colIndex ?? "-1");
      if (colIndex < 0) return;

      const currentSort = th.getAttribute("aria-sort");
      const defaultDir: SortDirection =
        th.dataset.defaultOrder === "descending" ? "descending" : "ascending";
      const nextDir: SortDirection =
        currentSort === "ascending"
          ? "descending"
          : currentSort === "descending"
            ? "ascending"
            : defaultDir;

      for (const header of Array.from(thead.querySelectorAll("th"))) {
        const glyph = header.querySelector("[data-sort-glyph]");
        if (header === th) {
          header.setAttribute("aria-sort", nextDir);
          if (glyph) {
            glyph.textContent = nextDir === "ascending" ? "↑" : "↓";
          }
        } else {
          header.removeAttribute("aria-sort");
          if (glyph) {
            glyph.textContent = "↕";
          }
        }
      }

      const isNumeric = th.dataset.type === "number";
      const trs = Array.from(tbody.querySelectorAll("tr"));

      trs.sort((rowA, rowB) => {
        const cellA = rowA.cells[colIndex];
        const cellB = rowB.cells[colIndex];
        let cmp = 0;

        if (isNumeric) {
          const valA = Number(cellA?.dataset.value ?? "0");
          const valB = Number(cellB?.dataset.value ?? "0");
          cmp = valA - valB;
        } else {
          const strA =
            cellA?.dataset.sortValue ?? cellA?.textContent?.trim() ?? "";
          const strB =
            cellB?.dataset.sortValue ?? cellB?.textContent?.trim() ?? "";
          cmp = COLLATOR.compare(strA, strB);
        }

        if (nextDir === "descending") {
          cmp = -cmp;
        }
        if (cmp !== 0) return cmp;

        return COLLATOR.compare(
          rowA.cells[0]?.dataset.sortValue ?? "",
          rowB.cells[0]?.dataset.sortValue ?? "",
        );
      });

      const moveBeforeFn = (
        tbody as HTMLTableSectionElement & {
          moveBefore?: (node: Node, child: Node | null) => void;
        }
      ).moveBefore;

      for (const tr of trs) {
        if (typeof moveBeforeFn === "function") {
          moveBeforeFn.call(tbody, tr, null);
        } else {
          tbody.append(tr);
        }
      }

      const colLabel =
        button.dataset.label ?? button.textContent?.trim() ?? "column";
      announce(`Sorted by ${colLabel}, ${nextDir}`);
    }

    if ("CommandEvent" in window) {
      const onCommand = (event: Event) => {
        const cmdEvent = event as InvokerCommandEvent;
        if (cmdEvent.command !== "--sort") return;
        const source = cmdEvent.source;
        if (source instanceof HTMLButtonElement) {
          handleSort(source);
        }
      };
      table.addEventListener("command", onCommand);
      return () => {
        table.removeEventListener("command", onCommand);
      };
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest('button[command="--sort"]');
      if (button instanceof HTMLButtonElement) {
        handleSort(button);
      }
    };
    table.addEventListener("click", onClick);
    return () => {
      table.removeEventListener("click", onClick);
    };
  }, [announce]);

  const sortInvokerProps = {
    command: "--sort",
    commandfor: tableId,
  } as unknown as HTMLAttributes<HTMLButtonElement>;

  const columns: ReadonlyArray<{
    label: string;
    type: "text" | "number";
    defaultOrder: SortDirection;
    initialSorted?: SortDirection;
  }> = [
    {
      label: "Country",
      type: "text",
      defaultOrder: "ascending",
      initialSorted: "ascending",
    },
    { label: "Advance Directive", type: "number", defaultOrder: "ascending" },
    { label: "Incapacity Mandate", type: "number", defaultOrder: "ascending" },
    { label: "Caregiver Support", type: "number", defaultOrder: "ascending" },
    { label: "HCCH #35 Adults", type: "number", defaultOrder: "ascending" },
    { label: "Hague Apostille", type: "text", defaultOrder: "ascending" },
  ];

  const ahdCounts: Record<AdvanceDirectiveRegime, number> = {
    statute_with_national_register: 0,
    binding_statute_local_or_subnational: 0,
    patients_rights_or_clinical_framework: 0,
    general_consent_or_family_consultation: 0,
  };
  const mandateCounts: Record<IncapacityMandateRegime, number> = {
    continuing_or_lasting_poa: 0,
    advance_guardian_or_support_designation: 0,
    ordinary_poa_court_guardianship: 0,
  };
  const carerCounts: Record<CaregiverProtectionRegime, number> = {
    paid_caregiver_or_palliative_leave: 0,
    carer_allowance_or_job_protected_leave: 0,
    patient_sick_or_invalidity_only: 0,
  };
  const hcch35Counts: Record<Hcch35Status, number> = {
    in_force_nationwide: 0,
    in_force_scotland_only: 0,
    acceded_eif_aug_2027: 0,
    signed_not_ratified: 0,
    non_party: 0,
  };
  const regionCounts = new Map<string, number>();

  for (const row of normalizedRows) {
    ahdCounts[row[4]] += 1;
    mandateCounts[row[6]] += 1;
    carerCounts[row[8]] += 1;
    hcch35Counts[row[9]] += 1;
    regionCounts.set(row[2], (regionCounts.get(row[2]) ?? 0) + 1);
  }

  return (
    <section
      aria-labelledby={headingId}
      className="mb-14"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto none auto 240rem",
      }}
    >
      <div className="max-w-3xl mb-5">
        <h2
          id={headingId}
          className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-2"
          style={headlineStyle}
        >
          Complete 196-Country Advance Directives &amp; Incapacity Mandates Atlas
        </h2>
        <p className="text-base text-calm-blue-600 leading-relaxed">
          Sort any column or filter by region, statutory advance healthcare
          directive model, incapacity mandate continuity, family caregiver
          protection, or 2000 Hague Protection of Adults treaty status. Every
          row links directly to Clarvia’s source-cited serious-illness guide and
          primary official authority link.
        </p>
      </div>

      <search
        aria-label="Filter the 196-country advance directives and incapacity mandates atlas"
        className="mb-4 rounded-xl border border-calm-blue-200 bg-white/80 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label
            htmlFor={queryId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Search country or instrument
          </label>
          <input
            ref={queryRef}
            id={queryId}
            type="search"
            placeholder="e.g. Vorsorgevollmacht, LPA, Japan..."
            onInput={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor={regionFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Macro-region
          </label>
          <select
            ref={regionSelectRef}
            id={regionFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All {normalizedRows.length} countries</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region} ({regionCounts.get(region) ?? 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={ahdFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Advance directive model
          </label>
          <select
            ref={ahdSelectRef}
            id={ahdFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All 4 directive models</option>
            <option value="statute_with_national_register">
              Statute + national registry (
              {ahdCounts.statute_with_national_register})
            </option>
            <option value="binding_statute_local_or_subnational">
              Binding statute, local/state (
              {ahdCounts.binding_statute_local_or_subnational})
            </option>
            <option value="patients_rights_or_clinical_framework">
              Patients&apos; rights / clinical (
              {ahdCounts.patients_rights_or_clinical_framework})
            </option>
            <option value="general_consent_or_family_consultation">
              Consent &amp; family consult (
              {ahdCounts.general_consent_or_family_consultation})
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor={mandateFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Incapacity mandate
          </label>
          <select
            ref={mandateSelectRef}
            id={mandateFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All mandate models</option>
            <option value="continuing_or_lasting_poa">
              Continuing / lasting PoA ({mandateCounts.continuing_or_lasting_poa}
              )
            </option>
            <option value="advance_guardian_or_support_designation">
              Voluntary guardian / support (
              {mandateCounts.advance_guardian_or_support_designation})
            </option>
            <option value="ordinary_poa_court_guardianship">
              Ordinary PoA lapses ({mandateCounts.ordinary_poa_court_guardianship}
              )
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor={combinedFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Carer &amp; treaty status
          </label>
          <select
            ref={combinedSelectRef}
            id={combinedFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All carer &amp; treaty tiers</option>
            <option value="carer:paid_caregiver_or_palliative_leave">
              Carer: Paid caregiver leave (
              {carerCounts.paid_caregiver_or_palliative_leave})
            </option>
            <option value="carer:carer_allowance_or_job_protected_leave">
              Carer: Allowance / protected leave (
              {carerCounts.carer_allowance_or_job_protected_leave})
            </option>
            <option value="carer:patient_sick_or_invalidity_only">
              Carer: Patient sick/invalidity only (
              {carerCounts.patient_sick_or_invalidity_only})
            </option>
            <option value="hcch35:in_force_nationwide">
              HCCH #35: Nationwide in force ({hcch35Counts.in_force_nationwide})
            </option>
            <option value="hcch35:in_force_scotland_only">
              HCCH #35: UK Scotland only ({hcch35Counts.in_force_scotland_only})
            </option>
            <option value="hcch35:acceded_eif_aug_2027">
              HCCH #35: Montenegro Aug 2027 ({hcch35Counts.acceded_eif_aug_2027}
              )
            </option>
            <option value="hcch35:signed_not_ratified">
              HCCH #35: Signed, not ratified ({hcch35Counts.signed_not_ratified}
              )
            </option>
            <option value="hcch35:non_party">
              HCCH #35: Non-party ({hcch35Counts.non_party})
            </option>
            <option value="apostille:in_force_2026">
              HCCH #12: Apostille in force
            </option>
            <option value="apostille:entering_force_feb_2027">
              HCCH #12: Thailand Feb 2027
            </option>
            <option value="apostille:consular_legalization_required">
              HCCH #12: Consular legalization
            </option>
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full min-h-11 rounded-lg border border-calm-blue-300 bg-white hover:bg-calm-blue-50 px-3 py-2 text-sm font-semibold text-calm-blue-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            Reset filters
          </button>
        </div>
      </search>

      <div
        ref={regionRef}
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-calm-blue-200 bg-white shadow-xs focus-visible:outline-2 focus-visible:outline-calm-blue-500"
      >
        <table
          ref={tableRef}
          id={tableId}
          className="w-full min-w-[68rem] border-separate border-spacing-0 text-left text-xs sm:text-sm"
        >
          <caption
            id={captionId}
            className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
          >
            <span>
              Global Advance Directives, Incapacity Mandates &amp; Cross-Border
              Portability Atlas (November 2026):{" "}
            </span>
            <span ref={countRef} className="font-normal text-calm-blue-600">
              Showing {normalizedRows.length} of {normalizedRows.length}{" "}
              countries
            </span>
          </caption>
          <thead className="sticky top-0 z-10 bg-calm-blue-50 border-b border-calm-blue-200 text-calm-blue-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.label}
                  scope="col"
                  aria-sort={col.initialSorted}
                  data-type={col.type}
                  data-default-order={col.defaultOrder}
                  className={`p-0 align-bottom whitespace-nowrap border-b border-calm-blue-200 bg-calm-blue-50 ${idx === 0 ? "md:sticky md:left-0 md:z-20" : ""}`}
                >
                  <button
                    type="button"
                    {...sortInvokerProps}
                    data-col-index={idx}
                    data-label={col.label}
                    className="w-full min-h-11 px-3 py-2.5 flex items-center justify-between gap-2 text-left text-xs font-semibold text-calm-blue-800 hover:bg-calm-blue-100/70 cursor-pointer focus-visible:outline-2 focus-visible:outline-calm-blue-500"
                  >
                    <span>{col.label}</span>
                    <span
                      aria-hidden="true"
                      data-sort-glyph
                      className="text-calm-blue-500 font-mono text-xs shrink-0"
                    >
                      {col.initialSorted === "descending"
                        ? "↓"
                        : col.initialSorted === "ascending"
                          ? "↑"
                          : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {normalizedRows.map(
              ([
                countryCode,
                countryName,
                macroRegion,
                guideSlugSuffix,
                ahdRegime,
                ahdCustomSummary,
                mandateRegime,
                mandateCustomSummary,
                carerRegime,
                hcch35Status,
                apostilleStatus,
                verifiedSourcesCount,
                primarySourceUrl,
              ]) => {
                const ahdInfo = AHD_META[ahdRegime];
                const mandateInfo = MANDATE_META[mandateRegime];
                const carerInfo = CARER_META[carerRegime];
                const hcch35Info = HCCH35_META[hcch35Status];
                const ahdSummary = ahdCustomSummary || ahdInfo.defaultSummary;
                const mandateSummary =
                  mandateCustomSummary || mandateInfo.defaultSummary;
                const apostilleLabel = APOSTILLE_SHORT_LABEL[apostilleStatus];
                const guideHref = expandCompactGuideHref(guideSlugSuffix);

                return (
                  <tr
                    key={countryCode}
                    data-code={countryCode}
                    data-region={macroRegion}
                    data-ahd={ahdRegime}
                    data-mandate={mandateRegime}
                    data-carer={carerRegime}
                    data-hcch35={hcch35Status}
                    data-apostille={apostilleStatus}
                    className="hover:bg-calm-blue-50/50 transition-colors"
                  >
                    <th
                      scope="row"
                      data-sort-value={countryName}
                      className="md:sticky md:left-0 bg-white px-3 py-3 align-top font-normal text-calm-blue-800 min-w-[13rem] border-b border-calm-blue-100"
                    >
                      <a
                        href={guideHref}
                        className="font-semibold text-calm-blue-800 underline decoration-calm-blue-300 hover:decoration-calm-blue-700 hover:text-calm-blue-900"
                      >
                        {countryName}
                      </a>
                      <div className="text-[11px] text-calm-blue-500 mt-0.5 tabular-nums">
                        {countryCode} · {macroRegion}
                      </div>
                      <div className="text-[11px] text-calm-blue-600 mt-0.5">
                        <a
                          href={primarySourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-calm-blue-900"
                        >
                          Primary authority ({verifiedSourcesCount} sources)
                        </a>
                      </div>
                    </th>
                    <td
                      data-value={ahdInfo.rank}
                      className="px-3 py-3 align-top text-calm-blue-800 min-w-[14rem] border-b border-calm-blue-100"
                    >
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${AHD_BADGE_CLASS(ahdRegime)}`}
                      >
                        {ahdInfo.shortLabel}
                      </span>
                      <div className="text-[11px] text-calm-blue-600 mt-1 leading-snug">
                        {ahdSummary}
                      </div>
                    </td>
                    <td
                      data-value={mandateInfo.rank}
                      className="px-3 py-3 align-top text-calm-blue-800 min-w-[14rem] border-b border-calm-blue-100"
                    >
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${MANDATE_BADGE_CLASS(mandateRegime)}`}
                      >
                        {mandateInfo.shortLabel}
                      </span>
                      <div className="text-[11px] text-calm-blue-600 mt-1 leading-snug">
                        {mandateSummary}
                      </div>
                    </td>
                    <td
                      data-value={carerInfo.rank}
                      className="px-3 py-3 align-top text-calm-blue-700 min-w-[11rem] border-b border-calm-blue-100"
                    >
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${CAREGIVER_BADGE_CLASS(carerRegime)}`}
                      >
                        {carerInfo.shortLabel}
                      </span>
                    </td>
                    <td
                      data-value={hcch35Info.rank}
                      className="px-3 py-3 align-top text-calm-blue-700 min-w-[10rem] border-b border-calm-blue-100 whitespace-nowrap"
                    >
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${HCCH35_BADGE_CLASS(hcch35Status)}`}
                      >
                        {hcch35Info.shortLabel}
                      </span>
                    </td>
                    <td
                      data-sort-value={apostilleLabel}
                      className="px-3 py-3 align-top text-calm-blue-700 min-w-[9.5rem] border-b border-calm-blue-100 whitespace-nowrap"
                    >
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${APOSTILLE_BADGE_CLASS(apostilleStatus)}`}
                      >
                        {apostilleLabel}
                      </span>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <p
        ref={emptyRef}
        hidden
        className="mt-4 rounded-xl border border-calm-blue-200 bg-white/80 p-6 text-center text-sm text-calm-blue-700"
      >
        No countries match your current filters. Use{" "}
        <button
          type="button"
          onClick={handleReset}
          className="font-semibold underline text-calm-blue-800 cursor-pointer"
        >
          Reset filters
        </button>{" "}
        to restore all {normalizedRows.length} countries.
      </p>

      <p ref={statusRef} role="status" className="sr-only" />
    </section>
  );
}
