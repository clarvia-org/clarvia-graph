"use client";

import Link from "next/link";
import { type HTMLAttributes, useCallback, useEffect, useId, useRef } from "react";
import { headlineStyle } from "../../data";
import type {
  ApostilleStatus,
  CountryRegistrationAtlasRow,
  MacroRegion,
  RegistrationWindowTier,
} from "@/content/research/post-death-civil-registration-study";

interface InvokerCommandEvent extends Event {
  command?: string;
  source?: Element | null;
}

type SortDirection = "ascending" | "descending";

const COLLATOR = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const WINDOW_BADGE_CLASS = (tier: RegistrationWindowTier): string => {
  switch (tier) {
    case "automatic_digital":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "within_48h":
      return "bg-calm-blue-50 text-calm-blue-800 border-calm-blue-200";
    case "days_3_to_7":
      return "bg-sky-50 text-sky-900 border-sky-200";
    case "days_8_to_35":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "extended_42d_to_12m":
      return "bg-orange-50 text-orange-900 border-orange-200";
    case "subnational_federal":
      return "bg-indigo-50 text-indigo-900 border-indigo-200";
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

function matchesLegalFilter(tr: HTMLTableRowElement, legalFilter: string): boolean {
  if (legalFilter === "all") return true;
  if (legalFilter.startsWith("estate:")) {
    return tr.dataset.estate === legalFilter.slice("estate:".length);
  }
  if (legalFilter.startsWith("apostille:")) {
    return tr.dataset.apostille === legalFilter.slice("apostille:".length);
  }
  return true;
}

export default function CountryRegistrationAtlasTable({
  rows,
  regions,
}: {
  rows: readonly CountryRegistrationAtlasRow[];
  regions: readonly MacroRegion[];
}) {
  const baseId = useId();
  const tableId = `${baseId}-table`;
  const captionId = `${baseId}-caption`;
  const headingId = `${baseId}-heading`;
  const queryId = `${baseId}-query`;
  const regionFilterId = `${baseId}-region`;
  const windowFilterId = `${baseId}-window`;
  const propFilterId = `${baseId}-propagation`;
  const legalFilterId = `${baseId}-legal`;

  const tableRef = useRef<HTMLTableElement | null>(null);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const queryRef = useRef<HTMLInputElement | null>(null);
  const regionSelectRef = useRef<HTMLSelectElement | null>(null);
  const windowSelectRef = useRef<HTMLSelectElement | null>(null);
  const propSelectRef = useRef<HTMLSelectElement | null>(null);
  const legalSelectRef = useRef<HTMLSelectElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const emptyRef = useRef<HTMLParagraphElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const lastAnnouncementRef = useRef("");

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
      const windowVal = windowSelectRef.current?.value ?? "all";
      const propVal = propSelectRef.current?.value ?? "all";
      const legalVal = legalSelectRef.current?.value ?? "all";

      const trs = Array.from(tbody.querySelectorAll("tr"));
      let visible = 0;

      for (const tr of trs) {
        const matchesQuery =
          !query || (tr.dataset.search ?? "").includes(query);
        const matchesRegion =
          regionVal === "all" || tr.dataset.region === regionVal;
        const matchesWindow =
          windowVal === "all" || tr.dataset.window === windowVal;
        const matchesProp =
          propVal === "all" || tr.dataset.propagation === propVal;
        const matchesLegal = matchesLegalFilter(tr, legalVal);

        const show =
          matchesQuery &&
          matchesRegion &&
          matchesWindow &&
          matchesProp &&
          matchesLegal;
        tr.hidden = !show;
        if (show) visible += 1;
      }

      if (countRef.current) {
        countRef.current.textContent = `Showing ${visible} of ${rows.length} countries`;
      }
      if (emptyRef.current) {
        emptyRef.current.hidden = visible > 0;
      }
      if (regionRef.current) {
        regionRef.current.hidden = visible === 0;
      }
      if (shouldAnnounce) {
        announce(`Showing ${visible} of ${rows.length} countries`);
      }
    },
    [announce, rows.length],
  );

  const handleReset = useCallback(() => {
    if (queryRef.current) queryRef.current.value = "";
    if (regionSelectRef.current) regionSelectRef.current.value = "all";
    if (windowSelectRef.current) windowSelectRef.current.value = "all";
    if (propSelectRef.current) propSelectRef.current.value = "all";
    if (legalSelectRef.current) legalSelectRef.current.value = "all";
    applyFilters(true);
    queryRef.current?.focus();
  }, [applyFilters]);

  useEffect(() => {
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
    { label: "Registration Window", type: "number", defaultOrder: "ascending" },
    { label: "Filing Channel", type: "text", defaultOrder: "ascending" },
    { label: "Agency Notification", type: "text", defaultOrder: "ascending" },
    { label: "Estate Gatekeeper", type: "text", defaultOrder: "ascending" },
    { label: "Hague Apostille", type: "text", defaultOrder: "ascending" },
  ];

  return (
    <section aria-labelledby={headingId} className="mb-14">
      <div className="max-w-3xl mb-5">
        <h2
          id={headingId}
          className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-2"
          style={headlineStyle}
        >
          Complete 196-Country Post-Death Administration Atlas
        </h2>
        <p className="text-base text-calm-blue-600 leading-relaxed">
          Sort any column or filter by region, statutory registration window,
          inter-agency automation, succession model, or Hague Apostille status.
          Every row links directly to Clarvia’s source-cited domestic guide and
          primary official authority link.
        </p>
      </div>

      <search
        aria-label="Filter the 196-country post-death administration atlas"
        className="mb-4 rounded-xl border border-calm-blue-200 bg-white/80 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label
            htmlFor={queryId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Search country or statute
          </label>
          <input
            ref={queryRef}
            id={queryId}
            type="search"
            placeholder="e.g. Norway, notary, Standesamt..."
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
            <option value="all">All {rows.length} countries</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={windowFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Registration window
          </label>
          <select
            ref={windowSelectRef}
            id={windowFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All 7 window regimes</option>
            <option value="automatic_digital">
              Automatic digital registration
            </option>
            <option value="within_48h">Within 48 hours / next day</option>
            <option value="days_3_to_7">3 to 7 days</option>
            <option value="days_8_to_35">8 to 35 days (up to 1 month)</option>
            <option value="extended_42d_to_12m">6 weeks to 12 months</option>
            <option value="disposition_or_prompt">
              Prior to burial / prompt
            </option>
            <option value="subnational_federal">
              Sub-national / federal
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor={propFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Agency notification
          </label>
          <select
            ref={propSelectRef}
            id={propFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All notification models</option>
            <option value="automated_or_one_stop">
              Automated / one-stop (
              {
                rows.filter((r) => r.agencyPropagation === "automated_or_one_stop")
                  .length
              }
              )
            </option>
            <option value="manual_agency_by_agency">
              Manual agency-by-agency (
              {
                rows.filter(
                  (r) => r.agencyPropagation === "manual_agency_by_agency",
                ).length
              }
              )
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor={legalFilterId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Estate model / Apostille
          </label>
          <select
            ref={legalSelectRef}
            id={legalFilterId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All legal systems</option>
            <option value="estate:ex_officio_court_or_notary">
              Estate: Ex-officio court initiation
            </option>
            <option value="estate:civil_law_notary">
              Estate: Civil-law notary
            </option>
            <option value="estate:common_law_probate_court">
              Estate: Common-law probate court
            </option>
            <option value="estate:civil_judicial_or_registry">
              Estate: Civil court / registry
            </option>
            <option value="estate:personal_status_or_plural">
              Estate: Sharia / personal-status
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
          className="w-full min-w-[66rem] border-separate border-spacing-0 text-left text-xs sm:text-sm"
        >
          <caption
            id={captionId}
            className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
          >
            <span>
              Global Post-Death Civil Registration &amp; Estate Administration Atlas
              (November 2026):{" "}
            </span>
            <span ref={countRef} className="font-normal text-calm-blue-600">
              Showing {rows.length} of {rows.length} countries
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
            {rows.map((row) => (
              <tr
                key={row.id}
                data-region={row.macroRegion}
                data-window={row.registrationWindowTier}
                data-channel={row.filingChannel}
                data-propagation={row.agencyPropagation}
                data-estate={row.estateGatekeeper}
                data-apostille={row.apostilleStatus}
                data-search={row.searchText}
                className="hover:bg-calm-blue-50/50 transition-colors"
              >
                <th
                  scope="row"
                  data-sort-value={row.countryName}
                  className="md:sticky md:left-0 bg-white px-3 py-3 align-top font-normal text-calm-blue-800 min-w-[13rem] border-b border-calm-blue-100"
                >
                  <Link
                    href={row.guideHref}
                    className="font-semibold text-calm-blue-800 underline decoration-calm-blue-300 hover:decoration-calm-blue-700 hover:text-calm-blue-900"
                  >
                    {row.countryName}
                  </Link>
                  <div className="text-[11px] text-calm-blue-500 mt-0.5 tabular-nums">
                    {row.countryCode} · {row.macroRegion}
                  </div>
                  <div className="text-[11px] text-calm-blue-600 mt-0.5">
                    <a
                      href={row.primarySourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-calm-blue-900"
                    >
                      Primary authority ({row.verifiedSourcesCount} sources)
                    </a>
                  </div>
                </th>
                <td
                  data-value={row.registrationWindowRank}
                  className="px-3 py-3 align-top text-calm-blue-800 min-w-[14rem] border-b border-calm-blue-100"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${WINDOW_BADGE_CLASS(row.registrationWindowTier)}`}
                  >
                    {row.registrationWindowLabel}
                  </span>
                  <div className="text-[11px] text-calm-blue-600 mt-1 leading-snug">
                    {row.statutoryWindowSummary}
                  </div>
                </td>
                <td
                  data-sort-value={row.filingChannelLabel}
                  className="px-3 py-3 align-top text-calm-blue-700 min-w-[10rem] border-b border-calm-blue-100"
                >
                  <span className="font-medium text-calm-blue-800">
                    {row.filingChannelLabel}
                  </span>
                </td>
                <td
                  data-sort-value={row.agencyPropagationLabel}
                  className="px-3 py-3 align-top text-calm-blue-700 min-w-[10rem] border-b border-calm-blue-100"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      row.agencyPropagation === "automated_or_one_stop"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {row.agencyPropagationLabel}
                  </span>
                </td>
                <td
                  data-sort-value={row.estateGatekeeperLabel}
                  className="px-3 py-3 align-top text-calm-blue-700 min-w-[10.5rem] border-b border-calm-blue-100"
                >
                  <span className="font-medium text-calm-blue-800">
                    {row.estateGatekeeperLabel}
                  </span>
                </td>
                <td
                  data-sort-value={row.apostilleStatusLabel}
                  className="px-3 py-3 align-top text-calm-blue-700 min-w-[9.5rem] border-b border-calm-blue-100 whitespace-nowrap"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${APOSTILLE_BADGE_CLASS(row.apostilleStatus)}`}
                  >
                    {row.apostilleStatusLabel}
                  </span>
                </td>
              </tr>
            ))}
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
        to restore all {rows.length} countries.
      </p>

      <p ref={statusRef} role="status" className="sr-only" />
    </section>
  );
}
