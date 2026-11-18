import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CountryRegistrationAtlasTable from "@/app/[lang]/research/global-post-death-civil-registration-atlas/CountryRegistrationAtlasTable";
import {
  allCorridorGuides,
  getCorridorGuideBySlug,
} from "@/content/corridor-guides";
import {
  HCCH_12_IN_FORCE_2026_11,
  MACRO_REGION_ORDER,
  getPostDeathCivilRegistrationStudy,
  serializeStudy2RowsToCsv,
  serializeStudy2ToJson,
} from "@/content/research/post-death-civil-registration-study";

const APOSTILLE_NEGATION_RE =
  /\b(not (?:currently |listed as )?(?:a |an )?(?:contracting )?(?:apostille (?:convention )?)?(?:party|state|signatory|member)|non-party|non-apostille|no apostille|cannot (?:be apostilled|receive an apostille|rely on an apostille)|apostille(?:s| sticker| certificate| certificates| stamp| stamps)? (?:are|is|cannot|do not|has no|have no)|rather than (?:a |an |receiving )?(?:hague )?apostille|instead of (?:a |an )?apostille|not yet|28 february 2027|consular legali[sz]ation)\b/i;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|#39|apos|nbsp);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("Global Post-Death Civil Registration & Estate Administration Atlas (196 Countries)", () => {
  it("covers all 196 sovereign domestic-bereavement guides with 1,432 citations and 811 contacts", () => {
    const study = getPostDeathCivilRegistrationStudy();

    expect(study.totalCountries).toBe(196);
    expect(study.macroRegionCount).toBe(5);
    expect(study.totalVerifiedCitationsIn196Guides).toBe(1432);
    expect(study.totalVerifiedContactsIn196Guides).toBe(811);
    expect(study.rows).toHaveLength(196);

    const seenCodes = new Set<string>();
    for (const row of study.rows) {
      expect(seenCodes.has(row.countryCode), `Duplicate ${row.countryCode}`).toBe(
        false,
      );
      seenCodes.add(row.countryCode);

      const guide = getCorridorGuideBySlug(row.guideSlug, "en");
      expect(guide, `Missing guide ${row.guideSlug}`).toBeDefined();
      expect(guide?.category).toBe("domestic-bereavement");
      expect(guide?.countryOfDeathCode).toBe(guide?.citizenshipCountryCode);
      expect(row.guideHref).toBe(`/en/guide/${row.guideSlug}`);
      expect(row.primarySourceUrl).toMatch(/^https?:\/\//);
    }
    expect(seenCodes.size).toBe(196);
  });

  it("matches exact partition sums across all 5 institutional pillars and macro-regions", () => {
    const study = getPostDeathCivilRegistrationStudy();

    const rwMap = Object.fromEntries(
      study.registrationWindowDistribution.map((b) => [b.code, b.count]),
    );
    expect(rwMap).toEqual({
      automatic_digital: 10,
      within_48h: 36,
      days_3_to_7: 43,
      days_8_to_35: 49,
      extended_42d_to_12m: 15,
      disposition_or_prompt: 38,
      subnational_federal: 5,
    });
    expect(
      Object.values(rwMap).reduce((a, b) => a + b, 0),
    ).toBe(196);

    const fcMap = Object.fromEntries(
      study.filingChannelDistribution.map((b) => [b.code, b.count]),
    );
    expect(fcMap).toEqual({
      digital_health_or_portal: 37,
      funeral_director_or_facility: 32,
      in_person_informant: 127,
    });
    expect(Object.values(fcMap).reduce((a, b) => a + b, 0)).toBe(196);

    const apMap = Object.fromEntries(
      study.agencyPropagationDistribution.map((b) => [b.code, b.count]),
    );
    expect(apMap).toEqual({
      automated_or_one_stop: 37,
      manual_agency_by_agency: 159,
    });
    expect(study.automatedPropagationCount + study.manualPropagationCount).toBe(
      196,
    );

    const egMap = Object.fromEntries(
      study.estateGatekeeperDistribution.map((b) => [b.code, b.count]),
    );
    expect(egMap).toEqual({
      civil_law_notary: 61,
      common_law_probate_court: 50,
      civil_judicial_or_registry: 41,
      personal_status_or_plural: 31,
      ex_officio_court_or_notary: 13,
    });
    expect(Object.values(egMap).reduce((a, b) => a + b, 0)).toBe(196);

    const haMap = Object.fromEntries(
      study.apostilleDistribution.map((b) => [b.code, b.count]),
    );
    expect(haMap).toEqual({
      in_force_2026: 127,
      entering_force_feb_2027: 1,
      consular_legalization_required: 68,
    });
    expect(study.postFeb2027ApostillePct).toBe(65.3);

    const regionMap = Object.fromEntries(
      study.macroRegionSummaries.map((r) => [r.region, r.countryCount]),
    );
    expect(regionMap).toEqual({
      "Sub-Saharan Africa": 49,
      "Asia-Pacific": 48,
      Europe: 45,
      Americas: 35,
      "Middle East & North Africa": 19,
    });
    expect(Object.values(regionMap).reduce((a, b) => a + b, 0)).toBe(196);
  });

  it("cross-validates classifications, clickable citations, and HCCH #12 claims against corridor-guides.json", () => {
    const study = getPostDeathCivilRegistrationStudy();
    const guidesBySlug = new Map(
      allCorridorGuides().map((g) => [g.slug, g]),
    );
    const groupedCiteRe = /\[\d+(?:\s*,\s*\d+)+\]/;

    for (const row of study.rows) {
      const guide = guidesBySlug.get(row.guideSlug)!;
      const combinedRaw = `${guide.introHtml} ${guide.steps.map((s) => s.html).join(" ")}`;
      const low = stripHtml(combinedRaw).toLowerCase();

      // Zero unlinked comma-grouped [1, 2] plain-text citations remain
      expect(groupedCiteRe.test(combinedRaw), `${row.guideSlug} raw citations`).toBe(
        false,
      );

      if (row.filingChannel === "digital_health_or_portal") {
        expect(
          /electronic|digital|online|automatic|sedimec|sinadef|sico|mylegacy|certdc|absher|egov|irembo|obs|ruaf|armed|vital records/.test(
            low,
          ),
          `${row.countryCode} digital_health_or_portal prose check`,
        ).toBe(true);
      }

      if (row.filingChannel === "funeral_director_or_facility") {
        expect(
          /funeral|undertaker|mortician|facility|hospital/.test(low),
          `${row.countryCode} funeral_director_or_facility prose check`,
        ).toBe(true);
      }

      if (row.agencyPropagation === "automated_or_one_stop") {
        expect(
          /automatic|automated|electronic|tell us once|one-stop|ansim|mylegacy|population register|central population|absher|egov/.test(
            low,
          ),
          `${row.countryCode} automated_or_one_stop prose check`,
        ).toBe(true);
      }

      if (row.estateGatekeeper === "ex_officio_court_or_notary") {
        expect(
          /ex officio|automatically|skifteretten|tingretten|smrtovnica|смртовница/.test(
            low,
          ),
          `${row.countryCode} ex_officio prose check`,
        ).toBe(true);
      }

      if (row.estateGatekeeper === "civil_law_notary") {
        expect(
          /notar|cartório|extrajudicial|extrajudicially/.test(low),
          `${row.countryCode} civil_law_notary prose check`,
        ).toBe(true);
      }

      if (row.estateGatekeeper === "common_law_probate_court") {
        expect(
          /probate|letters of administration|master of the high court|supreme court|high court|clerk of courts|curator/.test(
            low,
          ),
          `${row.countryCode} common_law_probate_court prose check`,
        ).toBe(true);
      }
    }

    // Check HCCH #12 party accuracy across single-country guides + TH Feb 2027
    for (const guide of allCorridorGuides()) {
      if (guide.countryOfDeathCode !== guide.citizenshipCountryCode) continue;
      const code = guide.countryOfDeathCode;
      if (!HCCH_12_IN_FORCE_2026_11.has(code)) {
        const plain = stripHtml(
          `${guide.introHtml} ${guide.steps.map((s) => s.html).join(" ")}`,
        );
        for (const sent of plain.split(/(?<=[.;])\s+/)) {
          if (/\bapostille/i.test(sent) && !APOSTILLE_NEGATION_RE.test(sent)) {
            throw new Error(
              `Unexpected affirmative Apostille sentence in ${guide.slug}: ${sent}`,
            );
          }
        }
      }
    }

    const thGuide = getCorridorGuideBySlug("thailand-bereavement-checklist", "en")!;
    expect(stripHtml(thGuide.steps[2].html)).toContain("28 February 2027");
    const psGuide = getCorridorGuideBySlug("palestine-bereavement-checklist", "en")!;
    expect(stripHtml(psGuide.steps[2].html)).not.toContain(
      "Palestine acceded to the 1961 Hague Apostille Convention",
    );
  });

  it("renders accessible SSR table HTML with all 196 guide links and sortable-table semantics", () => {
    const study = getPostDeathCivilRegistrationStudy();
    const html = renderToStaticMarkup(
      createElement(CountryRegistrationAtlasTable, {
        rows: study.rows,
        regions: MACRO_REGION_ORDER,
      }),
    );

    expect(html).toContain("<search");
    expect(html).toContain('role="region"');
    expect(html).toMatch(/\btabindex="0"/i);
    expect(html).toContain("<caption");
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).toContain('command="--sort"');
    expect(html).toContain('commandfor="');
    expect(html).toContain('role="status"');

    const ariaSortMatches = html.match(/aria-sort="[^"]+"/g) ?? [];
    expect(ariaSortMatches).toEqual(['aria-sort="ascending"']);
    expect(html).not.toContain('aria-sort="none"');

    for (const row of study.rows) {
      expect(html).toContain(`href="${row.guideHref}"`);
    }
    expect(html).not.toContain("—");
  });

  it("keeps public downloadable CSV and JSON exports byte-for-byte synced and free of em-dashes", () => {
    const study = getPostDeathCivilRegistrationStudy();
    const researchDataDir = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "research",
    );
    const csvPath = path.join(
      researchDataDir,
      "global-post-death-civil-registration-2026.csv",
    );
    const jsonPath = path.join(
      researchDataDir,
      "global-post-death-civil-registration-2026.json",
    );

    const diskCsv = fs.readFileSync(csvPath, "utf8");
    const diskJson = fs.readFileSync(jsonPath, "utf8");

    expect(diskCsv).toBe(serializeStudy2RowsToCsv(study));
    expect(diskJson).toBe(serializeStudy2ToJson(study));

    const nonEmptyCsvLines = diskCsv.trimEnd().split("\n");
    expect(nonEmptyCsvLines).toHaveLength(197);

    const parsedJson = JSON.parse(diskJson) as {
      summary: {
        totalCountries: number;
        totalVerifiedCitationsIn196Guides: number;
      };
      rows: unknown[];
    };
    expect(parsedJson.summary.totalCountries).toBe(196);
    expect(parsedJson.summary.totalVerifiedCitationsIn196Guides).toBe(1432);
    expect(parsedJson.rows).toHaveLength(196);

    for (const relPath of [
      "src/content/research/post-death-civil-registration-study.ts",
      "src/app/[lang]/research/page.tsx",
      "src/app/[lang]/research/global-post-death-civil-registration-atlas/page.tsx",
      "src/app/[lang]/research/global-post-death-civil-registration-atlas/CountryRegistrationAtlasTable.tsx",
    ]) {
      const content = fs.readFileSync(
        path.join(__dirname, "..", relPath),
        "utf8",
      );
      expect(content, `Unexpected em-dash in ${relPath}`).not.toContain("—");
    }
    expect(diskCsv).not.toContain("—");
    expect(diskJson).not.toContain("—");
  });
});
