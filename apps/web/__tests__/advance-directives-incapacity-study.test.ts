import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdvanceDirectivesAtlasTable from "@/app/[lang]/research/global-advance-directives-incapacity-mandates-atlas/AdvanceDirectivesAtlasTable";
import {
  buildCompactRowSearchText,
  toCompactAdvanceDirectivesRows,
} from "@/app/[lang]/research/global-advance-directives-incapacity-mandates-atlas/compact-atlas-rows";
import Study3Page, {
  generateMetadata as generateStudy3Metadata,
} from "@/app/[lang]/research/global-advance-directives-incapacity-mandates-atlas/page";
import {
  allCorridorGuides,
  getCorridorGuideBySlug,
} from "@/content/corridor-guides";
import {
  HCCH_12_IN_FORCE_2026_11,
  HCCH_35_IN_FORCE_NATIONWIDE_2026_11,
  MACRO_REGION_ORDER,
  getAdvanceDirectivesIncapacityStudy,
  serializeStudy3RowsToCsv,
  serializeStudy3ToJson,
} from "@/content/research/advance-directives-incapacity-study";

const APOSTILLE_NEGATION_RE =
  /\b(not (?:currently |listed as )?(?:a |an )?(?:contracting )?(?:apostille (?:convention )?)?(?:party|state|signatory|member)|non-party|non-apostille|no apostille|cannot (?:be apostilled|receive an apostille|rely on an apostille)|apostille(?:s| sticker| certificate| certificates| stamp| stamps)? (?:are|is|cannot|do not|has no|have no)|rather than (?:a |an |receiving )?(?:hague )?apostille|instead of (?:a |an )?apostille|not yet|28 february 2027|consular legali[sz]ation)\b/i;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|#39|apos|nbsp);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (196 Countries + 40 Corridors)", () => {
  it("covers all 196 sovereign terminal-illness-admin guides and all 40 cross-border-terminal-illness corridors (236 guides, 1,938 citations, 1,170 contacts)", () => {
    const study = getAdvanceDirectivesIncapacityStudy();

    expect(study.totalCountries).toBe(196);
    expect(study.totalCorridors).toBe(40);
    expect(study.totalGuidesInStudy).toBe(236);
    expect(study.macroRegionCount).toBe(5);
    expect(study.totalVerifiedCitationsIn196Guides).toBe(1541);
    expect(study.totalVerifiedContactsIn196Guides).toBe(852);
    expect(study.totalVerifiedCitationsIn40Corridors).toBe(397);
    expect(study.totalVerifiedContactsIn40Corridors).toBe(318);
    expect(study.totalVerifiedCitationsCombined).toBe(1938);
    expect(study.totalVerifiedContactsCombined).toBe(1170);
    expect(study.rows).toHaveLength(196);
    expect(study.corridorRows).toHaveLength(40);

    const seenCodes = new Set<string>();
    for (const row of study.rows) {
      expect(seenCodes.has(row.countryCode), `Duplicate ${row.countryCode}`).toBe(
        false,
      );
      seenCodes.add(row.countryCode);

      const guide = getCorridorGuideBySlug(row.guideSlug, "en");
      expect(guide, `Missing guide ${row.guideSlug}`).toBeDefined();
      expect(guide?.category).toBe("terminal-illness-admin");
      expect(guide?.countryOfDeathCode).toBe(guide?.citizenshipCountryCode);
      expect(row.guideHref).toBe(`/en/guide/${row.guideSlug}`);
      expect(row.primarySourceUrl).toMatch(/^https?:\/\//);
    }
    expect(seenCodes.size).toBe(196);

    for (const cb of study.corridorRows) {
      const guide = getCorridorGuideBySlug(cb.slug, "en");
      expect(guide, `Missing corridor guide ${cb.slug}`).toBeDefined();
      expect(guide?.category).toBe("cross-border-terminal-illness");
      expect(cb.guideHref).toBe(`/en/guide/${cb.slug}`);
    }
  });

  it("matches exact partition sums across all 5 country pillars, 40 corridors, and 5 macro-regions", () => {
    const study = getAdvanceDirectivesIncapacityStudy();

    const ahdMap = Object.fromEntries(
      study.advanceDirectiveDistribution.map((b) => [b.code, b.count]),
    );
    expect(ahdMap).toEqual({
      statute_with_national_register: 19,
      binding_statute_local_or_subnational: 20,
      patients_rights_or_clinical_framework: 67,
      general_consent_or_family_consultation: 90,
    });
    expect(Object.values(ahdMap).reduce((a, b) => a + b, 0)).toBe(196);
    expect(study.bindingStatutoryAhdCount).toBe(39);
    expect(study.bindingStatutoryAhdPct).toBe(19.9);
    expect(study.nationalAhdRegisterPct).toBe(9.7);

    const imMap = Object.fromEntries(
      study.incapacityMandateDistribution.map((b) => [b.code, b.count]),
    );
    expect(imMap).toEqual({
      continuing_or_lasting_poa: 22,
      advance_guardian_or_support_designation: 14,
      ordinary_poa_court_guardianship: 160,
    });
    expect(Object.values(imMap).reduce((a, b) => a + b, 0)).toBe(196);
    expect(study.anyIncapacityPlanningCount).toBe(36);
    expect(study.ordinaryPoaLapsesPct).toBe(81.6);

    const cpMap = Object.fromEntries(
      study.caregiverProtectionDistribution.map((b) => [b.code, b.count]),
    );
    expect(cpMap).toEqual({
      paid_caregiver_or_palliative_leave: 40,
      carer_allowance_or_job_protected_leave: 54,
      patient_sick_or_invalidity_only: 102,
    });
    expect(Object.values(cpMap).reduce((a, b) => a + b, 0)).toBe(196);
    expect(study.anyStatutoryCarerSupportCount).toBe(94);
    expect(study.paidCaregiverLeavePct).toBe(20.4);

    const h35Map = Object.fromEntries(
      study.hcch35Distribution.map((b) => [b.code, b.count]),
    );
    expect(h35Map).toEqual({
      in_force_nationwide: 15,
      in_force_scotland_only: 1,
      acceded_eif_aug_2027: 1,
      signed_not_ratified: 5,
      non_party: 174,
    });
    expect(Object.values(h35Map).reduce((a, b) => a + b, 0)).toBe(196);
    expect(study.hcch35WithoutNationwideForceCount).toBe(181);
    expect(study.hcch35WithoutNationwideForcePct).toBe(92.3);

    const cbMap = Object.fromEntries(
      study.corridorPortabilityDistribution.map((b) => [b.code, b.count]),
    );
    expect(cbMap).toEqual({
      mutual_nationwide: 5,
      partial_uk_scotland: 3,
      one_sided_party: 19,
      neither_party: 13,
    });
    expect(Object.values(cbMap).reduce((a, b) => a + b, 0)).toBe(40);
    expect(study.corridorMutualApostilleCount).toBe(39);
    expect(study.corridorMutualApostillePct).toBe(97.5);
    expect(study.corridorMutualHcch35Pct).toBe(12.5);
    expect(study.corridorApostilleVsPortabilityGapPts).toBe(85);
  });

  it("cross-validates classifications, clickable citations, and treaty claims against the corridor-guides corpus", () => {
    const study = getAdvanceDirectivesIncapacityStudy();
    const guidesBySlug = new Map(
      allCorridorGuides().map((g) => [g.slug, g]),
    );
    const groupedCiteRe = /\[\d+(?:\s*,\s*\d+)+\]/;

    // Zero unlinked grouped citations across all 592 guides in the entire corpus
    for (const g of allCorridorGuides()) {
      const raw = `${g.introHtml} ${g.steps.map((s) => s.html).join(" ")}`;
      expect(groupedCiteRe.test(raw), `${g.slug} raw grouped citation`).toBe(
        false,
      );
    }

    for (const row of study.rows) {
      const guide = guidesBySlug.get(row.guideSlug)!;
      const combinedRaw = `${guide.introHtml} ${guide.steps.map((s) => `${s.title} ${s.html}`).join(" ")}`;
      const low = stripHtml(combinedRaw).toLowerCase();

      if (row.advanceDirectiveRegime === "statute_with_national_register") {
        expect(
          /register|registry|database|mykanta|omakanta|mon espace santé|sundhed|heilsuvera|lífsskrá|rentev|elga|zvr|rnip|nhi ic card|electronic medical record|e-living will|nehr|zzzs/.test(
            low,
          ),
          `${row.countryCode} national register prose check`,
        ).toBe(true);
      }

      if (
        row.advanceDirectiveRegime === "binding_statute_local_or_subnational"
      ) {
        expect(
          /advance|directive|patientenverfügung|autoprotección|dříve vyslovené|anticipirana|előzetes|living will|wilsverklaring|behandelverbod/.test(
            low,
          ),
          `${row.countryCode} binding statutory directive prose check`,
        ).toBe(true);
      }

      if (row.incapacityMandateRegime === "continuing_or_lasting_poa") {
        expect(
          /lasting|enduring|durable|vorsorgevollmacht|vorsorgeauftrag|mandat de protection|zorgvolmacht|fremtidsfuldmagt|fremtidsfullmakt|framtidsfullmakt|edunvalvontavaltuutus|vedurfarandi|nākotnes pilnvarojums|levenstestament|poder preventivo/.test(
            low,
          ),
          `${row.countryCode} continuing_or_lasting_poa prose check`,
        ).toBe(true);
      }

      if (
        row.incapacityMandateRegime ===
        "advance_guardian_or_support_designation"
      ) {
        expect(
          /voluntary guardianship|yiding jianhu|nin'i koken|im-ui hugyeon|acuerdo de apoyo|apoyos y salvaguardias|autoprotección|předběžné prohlášení|anticipirana naredba|előzetes jognyilatkozat|amministratore di sostegno|išankstinis nurodymas|mandato com vista a acompanhamento|law no\. 9379/.test(
            low,
          ),
          `${row.countryCode} voluntary guardian / support prose check`,
        ).toBe(true);
      }

      if (
        row.caregiverProtectionRegime === "paid_caregiver_or_palliative_leave"
      ) {
        expect(
          /paid|allowance|benefit|subsidy|compensation|plejevederlag|pleiepenger|närståendepenning|pflegeunterstützungsgeld|pflegekarenzgeld|ajap|congé d'accompagnement|omaishoidon|dlouhodobé ošetřovné|dlhodobé ošetrovné|zasiłek opiekuńczy|bolovanje|болничен лист|mehnatga layoqatsizlik/.test(
            low,
          ),
          `${row.countryCode} paid caregiver leave prose check`,
        ).toBe(true);
      }

      if (
        row.caregiverProtectionRegime ===
        "carer_allowance_or_job_protected_leave"
      ) {
        expect(
          /caregiver|caregiving|carer|attendance|third-party|tierce personne|25%|40%|ápolási|evde bakım|hilflosenentschädigung|kopšana|mukhassas|group 1|group i|fmla|gajok dolbom|jiating zhaogu|companion|murafiq|accompaniment|personal assistant|disability/.test(
            low,
          ),
          `${row.countryCode} carer allowance / protected leave prose check`,
        ).toBe(true);
      }

      expect(HCCH_35_IN_FORCE_NATIONWIDE_2026_11.has(row.countryCode)).toBe(
        row.hcch35Status === "in_force_nationwide",
      );

      if (!HCCH_12_IN_FORCE_2026_11.has(row.countryCode)) {
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
  });

  it("renders accessible SSR table HTML with all 196 guide links and sortable-table semantics", () => {
    const study = getAdvanceDirectivesIncapacityStudy();
    const html = renderToStaticMarkup(
      createElement(AdvanceDirectivesAtlasTable, {
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

    const compact = toCompactAdvanceDirectivesRows(study.rows);
    expect(compact).toHaveLength(study.rows.length);
    for (let i = 0; i < study.rows.length; i += 1) {
      expect(buildCompactRowSearchText(compact[i]!)).toBe(
        study.rows[i]!.searchText,
      );
    }

    for (const q of [
      "lpa",
      "amd",
      "dss",
      "authority",
      "primary authority",
      "germany de",
      "non-party consular",
      "statute + national registry binding",
    ]) {
      const expectedCodes = study.rows
        .filter((r) => r.searchText.includes(q))
        .map((r) => r.countryCode);
      const compactCodes = compact
        .filter((row) => buildCompactRowSearchText(row).includes(q))
        .map((row) => row[0]);
      expect(compactCodes, `Compact search mismatch for "${q}"`).toEqual(
        expectedCodes,
      );
    }
  });

  it("keeps public downloadable CSV and JSON exports byte-for-byte synced and free of em-dashes", () => {
    const study = getAdvanceDirectivesIncapacityStudy();
    const researchDataDir = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "research",
    );
    const csvPath = path.join(
      researchDataDir,
      "global-advance-directives-incapacity-mandates-2026.csv",
    );
    const jsonPath = path.join(
      researchDataDir,
      "global-advance-directives-incapacity-mandates-2026.json",
    );

    const diskCsv = fs.readFileSync(csvPath, "utf8").replace(/\r\n/g, "\n");
    const diskJson = fs.readFileSync(jsonPath, "utf8").replace(/\r\n/g, "\n");

    expect(diskCsv).toBe(serializeStudy3RowsToCsv(study));
    expect(diskJson).toBe(serializeStudy3ToJson(study));

    const nonEmptyCsvLines = diskCsv.trimEnd().split("\n");
    expect(nonEmptyCsvLines).toHaveLength(197);

    const parsedJson = JSON.parse(diskJson) as {
      summary: {
        totalCountries: number;
        totalCorridors: number;
        totalVerifiedCitationsCombined: number;
      };
      rows: unknown[];
      corridorRows: unknown[];
    };
    expect(parsedJson.summary.totalCountries).toBe(196);
    expect(parsedJson.summary.totalCorridors).toBe(40);
    expect(parsedJson.summary.totalVerifiedCitationsCombined).toBe(1938);
    expect(parsedJson.rows).toHaveLength(196);
    expect(parsedJson.corridorRows).toHaveLength(40);

    for (const relPath of [
      "src/content/research/advance-directives-incapacity-study.ts",
      "src/app/[lang]/research/page.tsx",
      "src/app/[lang]/research/global-advance-directives-incapacity-mandates-atlas/page.tsx",
      "src/app/[lang]/research/global-advance-directives-incapacity-mandates-atlas/AdvanceDirectivesAtlasTable.tsx",
      "src/app/[lang]/research/global-advance-directives-incapacity-mandates-atlas/compact-atlas-rows.ts",
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

  it("publishes valid PDF working paper and Highwire Press scholar metadata", async () => {
    const pdfPath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "research",
      "global-advance-directives-incapacity-mandates-2026.pdf",
    );
    const bytes = fs.readFileSync(pdfPath);
    expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(50_000);

    const meta = await generateStudy3Metadata({
      params: Promise.resolve({ lang: "en" }),
    });
    expect(meta.other?.citation_title).toBe(
      "Global Atlas of Advance Directives, Incapacity Mandates & Cross-Border Portability (2026)",
    );
    expect(meta.other?.citation_doi).toBe("10.5281/zenodo.24388599");
    expect(meta.other?.citation_pdf_url).toBe(
      "https://clarvia.org/data/research/global-advance-directives-incapacity-mandates-2026.pdf",
    );
    expect(meta.other?.citation_author).toEqual([
      "Tommi Lindfors",
      "Clarvia ASBL",
    ]);

    const pageHtml = renderToStaticMarkup(
      await Study3Page({ params: Promise.resolve({ lang: "en" }) }),
    );
    const jsonLdMatch = pageHtml.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(jsonLdMatch).not.toBeNull();
    const jsonLd = JSON.parse(jsonLdMatch![1]) as {
      "@graph": Array<{
        "@type"?: string;
        isBasedOn?: string;
        sameAs?: string | string[];
        author?: Array<{
          "@type"?: string;
          "@id"?: string;
          name?: string;
          url?: string;
          sameAs?: string;
          affiliation?: {
            "@type"?: string;
            "@id"?: string;
            name?: string;
            url?: string;
          };
        }>;
        creator?: Array<{
          "@type"?: string;
          "@id"?: string;
          name?: string;
          url?: string;
          sameAs?: string;
          affiliation?: {
            "@type"?: string;
            "@id"?: string;
            name?: string;
            url?: string;
          };
        }>;
      }>;
    };
    const articleNode = jsonLd["@graph"].find(
      (node) => node["@type"] === "ScholarlyArticle",
    );
    const datasetNode = jsonLd["@graph"].find(
      (node) => node["@type"] === "Dataset",
    );
    expect(articleNode?.isBasedOn).toBe("https://doi.org/10.5281/zenodo.24245341");
    expect(articleNode?.sameAs).toEqual([
      "https://doi.org/10.5281/zenodo.24388599",
      "https://zenodo.org/records/24388599",
    ]);
    expect(articleNode?.author?.map((a) => a.sameAs ?? a["@id"])).toEqual([
      "https://orcid.org/0009-0002-2467-4045",
      "https://clarvia.org/#organization",
    ]);
    expect(datasetNode?.creator?.map((c) => c["@type"])).toEqual([
      "Person",
      "Organization",
    ]);
    expect(datasetNode?.creator?.map((c) => c.name)).toEqual([
      "Tommi Lindfors",
      "Clarvia ASBL",
    ]);
    expect(datasetNode?.creator?.map((c) => c.url)).toEqual([
      "https://orcid.org/0009-0002-2467-4045",
      "https://clarvia.org",
    ]);
    expect(datasetNode?.creator?.map((c) => c["@id"])).toEqual([
      "https://clarvia.org/#tommi-lindfors",
      "https://clarvia.org/#organization",
    ]);
    expect(datasetNode?.creator?.[0]?.affiliation).toEqual({
      "@type": "Organization",
      "@id": "https://clarvia.org/#organization",
      name: "Clarvia ASBL",
      url: "https://clarvia.org",
    });
    expect(datasetNode?.isBasedOn).toBe("https://doi.org/10.5281/zenodo.24245341");
    expect(datasetNode?.sameAs).toEqual([
      "https://zenodo.org/records/24388599",
      "https://doi.org/10.5281/zenodo.24388599",
      "https://data.public.lu/fr/datasets/global-atlas-of-advance-directives-incapacity-mandates-cross-border-portability-2026/",
    ]);
    expect(datasetNode?.sameAs).not.toContain(
      "https://doi.org/10.5281/zenodo.24245341",
    );
    expect(datasetNode?.sameAs).not.toContain(
      "https://zenodo.org/records/24245341",
    );
  });
});
