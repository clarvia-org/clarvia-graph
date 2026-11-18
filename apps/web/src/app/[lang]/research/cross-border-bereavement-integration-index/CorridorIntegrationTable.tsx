"use client";

import Link from "next/link";
import { type HTMLAttributes, useCallback, useEffect, useId, useRef } from "react";
import { headlineStyle } from "../../data";
import type { CorridorIntegrationRow } from "@/content/research/cross-border-integration-study";

interface InvokerCommandEvent extends Event {
  command?: string;
  source?: Element | null;
}

type SortDirection = "ascending" | "descending";

const COLLATOR = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const SCORE_PILL_CLASS = (score: number): string => {
  if (score >= 3.0) {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (score >= 1.5) {
    return "bg-calm-blue-50 text-calm-blue-800 border-calm-blue-200";
  }
  if (score >= 0.5) {
    return "bg-amber-50 text-amber-900 border-amber-200";
  }
  return "bg-slate-100 text-slate-800 border-slate-300";
};

function matchesBridgeFilter(tr: HTMLTableRowElement, bridgeFilter: string): boolean {
  switch (bridgeFilter) {
    case "high_integration":
      return Number(tr.dataset.score ?? "0") >= 3.5;
    case "consular_legalization":
      return tr.dataset.doc === "consular_legalization";
    case "thailand_2027":
      return tr.dataset.thailand === "1";
    case "unified_estate_or_hcch":
      return (
        tr.dataset.continuity === "eu_650_ecs" ||
        tr.dataset.continuity === "hcch_2000_adults"
      );
    case "multilateral_repatriation":
      return tr.dataset.repat === "multilateral_laissez_passer";
    default:
      return true;
  }
}

export default function CorridorIntegrationTable({
  rows,
  countries,
}: {
  rows: readonly CorridorIntegrationRow[];
  countries: readonly { code: string; name: string }[];
}) {
  const baseId = useId();
  const tableId = `${baseId}-table`;
  const captionId = `${baseId}-caption`;
  const headingId = `${baseId}-heading`;
  const queryId = `${baseId}-query`;
  const trackId = `${baseId}-track`;
  const countryId = `${baseId}-country`;
  const bridgeId = `${baseId}-bridge`;

  const tableRef = useRef<HTMLTableElement | null>(null);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const queryRef = useRef<HTMLInputElement | null>(null);
  const trackRef = useRef<HTMLSelectElement | null>(null);
  const countryRef = useRef<HTMLSelectElement | null>(null);
  const bridgeRef = useRef<HTMLSelectElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const emptyRef = useRef<HTMLParagraphElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
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
      const track = trackRef.current?.value ?? "all";
      const country = countryRef.current?.value ?? "all";
      const bridge = bridgeRef.current?.value ?? "all";

      const trs = Array.from(tbody.querySelectorAll("tr"));
      let visible = 0;

      for (const tr of trs) {
        const matchesQuery =
          !query || (tr.dataset.search ?? "").includes(query);
        const matchesTrack = track === "all" || tr.dataset.track === track;
        const matchesCountry =
          country === "all" ||
          tr.dataset.c1 === country ||
          tr.dataset.c2 === country;
        const matchesBridge = matchesBridgeFilter(tr, bridge);

        const show =
          matchesQuery && matchesTrack && matchesCountry && matchesBridge;
        tr.hidden = !show;
        if (show) visible += 1;
      }

      if (countRef.current) {
        countRef.current.textContent = `Showing ${visible} of ${rows.length} bilateral corridors`;
      }
      if (emptyRef.current) {
        emptyRef.current.hidden = visible > 0;
      }
      if (regionRef.current) {
        regionRef.current.hidden = visible === 0;
      }
      if (shouldAnnounce) {
        announce(`Showing ${visible} of ${rows.length} corridors`);
      }
    },
    [announce, rows.length],
  );

  const handleReset = useCallback(() => {
    if (queryRef.current) queryRef.current.value = "";
    if (trackRef.current) trackRef.current.value = "all";
    if (countryRef.current) countryRef.current.value = "all";
    if (bridgeRef.current) bridgeRef.current.value = "all";
    applyFilters(true);
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
        th.dataset.defaultOrder === "ascending" ? "ascending" : "descending";
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

        // Deterministic tie-breaker: composite score desc, then corridor name asc.
        const scoreDiff =
          Number(rowB.dataset.score ?? "0") -
          Number(rowA.dataset.score ?? "0");
        if (scoreDiff !== 0) return scoreDiff;
        return COLLATOR.compare(
          rowA.cells[0]?.dataset.sortValue ?? "",
          rowB.cells[0]?.dataset.sortValue ?? "",
        );
      });

      // Reorder existing DOM nodes without recreating rows (dynamic-sort: skip view transitions for 200-row table).
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
    { label: "Corridor", type: "text", defaultOrder: "ascending" },
    { label: "Lifecycle Track", type: "text", defaultOrder: "ascending" },
    {
      label: "Integration Score",
      type: "number",
      defaultOrder: "descending",
      initialSorted: "descending",
    },
    { label: "Document Bridge", type: "number", defaultOrder: "descending" },
    { label: "Estate / Incapacity", type: "number", defaultOrder: "descending" },
    { label: "Repatriation Treaty", type: "number", defaultOrder: "descending" },
    { label: "Language Bridge", type: "number", defaultOrder: "descending" },
  ];

  return (
    <section aria-labelledby={headingId} className="mb-14">
      <div className="max-w-3xl mb-5">
        <h2
          id={headingId}
          className="text-2xl sm:text-3xl font-semibold text-calm-blue-800 mb-2"
          style={headlineStyle}
        >
          Complete 200-Corridor Integration Index Dataset
        </h2>
        <p className="text-base text-calm-blue-600 leading-relaxed">
          Sort any column or filter by country, lifecycle track, or treaty
          bridge. Every row links directly to Clarvia’s verified statutory
          guide for that bilateral corridor.
        </p>
      </div>

      <search
        aria-label="Filter the 200-corridor integration index"
        className="mb-4 rounded-xl border border-calm-blue-200 bg-white/80 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label
            htmlFor={queryId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Search country or treaty
          </label>
          <input
            ref={queryRef}
            id={queryId}
            type="search"
            placeholder="e.g. Germany, Thailand, HCCH…"
            onInput={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor={trackId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Lifecycle track
          </label>
          <select
            ref={trackRef}
            id={trackId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All {rows.length} corridors</option>
            <option value="cross-border-bereavement">
              After a death (Bereavement)
            </option>
            <option value="cross-border-terminal-illness">
              Serious or terminal illness
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor={countryId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Country ({countries.length})
          </label>
          <select
            ref={countryRef}
            id={countryId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All {countries.length} countries</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={bridgeId}
            className="block text-xs font-semibold text-calm-blue-700 mb-1"
          >
            Treaty focus
          </label>
          <select
            ref={bridgeRef}
            id={bridgeId}
            defaultValue="all"
            onChange={() => applyFilters(true)}
            className="w-full min-h-11 rounded-lg border border-calm-blue-200 bg-white px-3 py-2 text-sm text-calm-blue-800 focus-visible:outline-2 focus-visible:outline-calm-blue-500"
          >
            <option value="all">All treaty statuses</option>
            <option value="high_integration">
              High integration (3.50 – 4.00)
            </option>
            <option value="consular_legalization">
              Consular legalization required (0.0 doc)
            </option>
            <option value="thailand_2027">
              Thailand HCCH #12 transition (28 Feb 2027)
            </option>
            <option value="unified_estate_or_hcch">
              Unified EU 650/2012 or HCCH 2000
            </option>
            <option value="multilateral_repatriation">
              Multilateral corpse laissez-passer
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
          className="w-full min-w-[64rem] border-collapse text-left text-xs sm:text-sm"
        >
          <caption
            id={captionId}
            className="px-4 py-3 text-left text-sm font-semibold text-calm-blue-800 border-b border-calm-blue-200 bg-calm-blue-50/70"
          >
            <span>Cross-Border Administrative Integration Index (November 2026): </span>
            <span ref={countRef} className="font-normal text-calm-blue-600">
              Showing {rows.length} of {rows.length} bilateral corridors
            </span>
          </caption>
          <thead className="sticky top-0 z-10 bg-calm-blue-50 border-b-2 border-calm-blue-200 text-calm-blue-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.label}
                  scope="col"
                  aria-sort={col.initialSorted}
                  data-type={col.type}
                  data-default-order={col.defaultOrder}
                  className="p-0 align-bottom whitespace-nowrap"
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
          <tbody ref={tbodyRef} className="divide-y divide-calm-blue-100">
            {rows.map((row) => (
              <tr
                key={row.id}
                data-track={row.category}
                data-c1={row.countryOfDeathCode}
                data-c2={row.citizenshipCountryCode}
                data-doc={row.docBridge.code}
                data-continuity={row.continuityBridge.code}
                data-repat={row.repatriationBridge.code}
                data-thailand={row.thailandFeb2027Transition ? "1" : "0"}
                data-score={row.compositeScore}
                data-search={row.searchText}
                className="hover:bg-calm-blue-50/50 transition-colors"
              >
                <th
                  scope="row"
                  data-sort-value={row.corridorLabel}
                  className="px-3 py-3 align-top font-normal text-calm-blue-800 min-w-[14rem]"
                >
                  <Link
                    href={row.guideHref}
                    className="font-semibold text-calm-blue-800 underline decoration-calm-blue-300 hover:decoration-calm-blue-700 hover:text-calm-blue-900"
                  >
                    {row.corridorLabel}
                  </Link>
                  <div className="text-[11px] text-calm-blue-500 mt-0.5 tabular-nums">
                    {row.countryOfDeathCode} → {row.citizenshipCountryCode} ·{" "}
                    {row.sourceCount} official sources
                  </div>
                </th>
                <td
                  data-sort-value={row.trackLabel}
                  className="px-3 py-3 align-top text-calm-blue-700 whitespace-nowrap"
                >
                  {row.trackLabel}
                </td>
                <td
                  data-value={row.compositeScore}
                  className="px-3 py-3 align-top whitespace-nowrap tabular-nums"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${SCORE_PILL_CLASS(row.compositeScore)}`}
                  >
                    {row.compositeScore.toFixed(2)} / 4.00
                  </span>
                </td>
                <td
                  data-value={row.docBridge.score}
                  className="px-3 py-3 align-top text-calm-blue-800 min-w-[10rem]"
                >
                  <span className="font-semibold tabular-nums">
                    {row.docBridge.shortLabel}
                  </span>
                  <div className="text-[11px] text-calm-blue-600 mt-0.5 leading-snug">
                    {row.docBridge.instrument}
                  </div>
                </td>
                <td
                  data-value={row.continuityBridge.score}
                  className="px-3 py-3 align-top text-calm-blue-800 min-w-[10rem]"
                >
                  <span className="font-semibold tabular-nums">
                    {row.continuityBridge.shortLabel}
                  </span>
                  <div className="text-[11px] text-calm-blue-600 mt-0.5 leading-snug">
                    {row.continuityBridge.instrument}
                  </div>
                </td>
                <td
                  data-value={row.repatriationBridge.score}
                  className="px-3 py-3 align-top text-calm-blue-800 min-w-[10rem]"
                >
                  <span className="font-semibold tabular-nums">
                    {row.repatriationBridge.shortLabel}
                  </span>
                  <div className="text-[11px] text-calm-blue-600 mt-0.5 leading-snug">
                    {row.repatriationBridge.instrument}
                  </div>
                </td>
                <td
                  data-value={row.languageBridge.score}
                  className="px-3 py-3 align-top text-calm-blue-800 min-w-[10rem]"
                >
                  <span className="font-semibold tabular-nums">
                    {row.languageBridge.shortLabel}
                  </span>
                  <div className="text-[11px] text-calm-blue-600 mt-0.5 leading-snug">
                    {row.languageBridge.instrument}
                  </div>
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
        No bilateral corridors match your current filters. Use{" "}
        <button
          type="button"
          onClick={handleReset}
          className="font-semibold underline text-calm-blue-800 cursor-pointer"
        >
          Reset filters
        </button>{" "}
        to restore all {rows.length} corridors.
      </p>

      <p ref={statusRef} role="status" className="sr-only" />
    </section>
  );
}
