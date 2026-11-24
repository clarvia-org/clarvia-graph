import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CorridorIntegrationTable from "@/app/[lang]/research/cross-border-bereavement-integration-index/CorridorIntegrationTable";
import Study1Page, {
  generateMetadata as generateStudy1Metadata,
} from "@/app/[lang]/research/cross-border-bereavement-integration-index/page";
import {
  allCorridorGuides,
  getCorridorGuideBySlug,
} from "@/content/corridor-guides";
import {
  BERLIN_1937_CORPSE_TRANSIT,
  CIEC_VIENNA_1976_FORM_C,
  STRASBOURG_1973_CORPSE_TRANSIT,
  getCrossBorderIntegrationStudy,
  serializeCrossBorderStudyCsv,
  serializeCrossBorderStudyJson,
} from "@/content/research/cross-border-integration-study";

const APOSTILLE_NEGATION_RE =
  /\b(not a (?:party|signatory|contracting|member)|not party|non-party|non-signatory|neither .* nor|do not apply|does not apply|not issued|not applicable|cannot be apostilled|does not issue apostilles|rather than an apostille|instead of an apostille|no apostille|not yet|until february 2027|28 february 2027|consular legali[sz]ation|embassy legali[sz]ation|attestation)\b/i;

const CIEC_NEGATION_RE =
  /\b(not a (?:party|signatory|contracting|member|bound)|not party|non-party|non-signatory|did not ratify|signed but did not ratify|not bound|neither .* nor|do not apply|does not apply|not issued)\b/i;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("Cross-Border Bereavement & Serious Illness Administrative Integration Study", () => {
  it("matches exact 200-corridor corpus counts and resolves every guide link", () => {
    const study = getCrossBorderIntegrationStudy();

    expect(study.totalCorridors).toBe(200);
    expect(study.bereavementCount).toBe(160);
    expect(study.terminalCount).toBe(40);
    expect(study.uniqueCountryCount).toBe(38);
    expect(study.uniquePairCount).toBe(111);
    expect(study.countries).toHaveLength(38);
    expect(study.rows).toHaveLength(200);

    for (const row of study.rows) {
      const guide = getCorridorGuideBySlug(row.slug, "en");
      expect(guide, `Missing guide for ${row.slug}`).toBeDefined();
      expect(row.guideHref).toBe(`/en/guide/${row.slug}`);
      expect(guide?.countryOfDeathCode).not.toBe(guide?.citizenshipCountryCode);

      const expectedSum =
        Math.round(
          (row.docBridge.score +
            row.continuityBridge.score +
            row.repatriationBridge.score +
            row.languageBridge.score) *
            100,
        ) / 100;
      expect(row.compositeScore).toBe(expectedSum);
      expect(row.compositeScore).toBeGreaterThanOrEqual(0);
      expect(row.compositeScore).toBeLessThanOrEqual(4);
    }
  });

  it("computes exact bridge distributions and cohort means without drift", () => {
    const study = getCrossBorderIntegrationStudy();

    const b1Map = Object.fromEntries(
      study.bridge1Distribution.map((b) => [b.code, b.count]),
    );
    expect(b1Map).toEqual({
      exempt_from_legalization: 51,
      hague_apostille: 136,
      consular_legalization: 13,
    });
    expect(study.thailandFeb2027Count).toBe(5);
    expect(study.apostilleOrExemptCount).toBe(187);
    expect(study.apostilleOrExemptPct).toBe(93.5);
    expect(study.postFeb2027ApostilleOrExemptPct).toBe(96.0);

    const b2bMap = Object.fromEntries(
      study.bridge2BereavementDistribution.map((b) => [b.code, b.count]),
    );
    expect(b2bMap).toEqual({
      eu_650_ecs: 36,
      commonwealth_reseal: 10,
      parallel_domestic: 114,
    });

    const b2tMap = Object.fromEntries(
      study.bridge2TerminalDistribution.map((b) => [b.code, b.count]),
    );
    expect(b2tMap).toEqual({
      hcch_2000_adults: 5,
      hcch_2000_scotland_only: 3,
      separate_domestic_poa: 32,
    });

    const b3Map = Object.fromEntries(
      study.bridge3Distribution.map((b) => [b.code, b.count]),
    );
    expect(b3Map).toEqual({
      multilateral_laissez_passer: 51,
      consular_mortuary_clearance: 149,
    });

    const b4Map = Object.fromEntries(
      study.bridge4Distribution.map((b) => [b.code, b.count]),
    );
    expect(b4Map).toEqual({
      shared_official_lang: 74,
      multilingual_civil_form: 36,
      certified_translation: 90,
    });

    const cohortMeans = Object.fromEntries(
      study.cohorts.map((c) => [c.id, { count: c.count, mean: c.meanScore }]),
    );
    expect(study.overallMeanScore).toBe(1.55);
    expect(study.bereavementMeanScore).toBe(1.58);
    expect(study.terminalMeanScore).toBe(1.4);
    expect(study.fullScoreCount).toBe(6);
    expect(study.zeroScoreCount).toBe(11);
    expect(cohortMeans).toEqual({
      intra_eu_efta: { count: 54, mean: 3.01 },
      commonwealth_reseal: { count: 13, mean: 1.88 },
      uk_eu_efta: { count: 24, mean: 0.69 },
      other_global: { count: 109, mean: 0.97 },
    });
  });

  it("cross-validates treaty scores against corridor-guides prose", () => {
    const study = getCrossBorderIntegrationStudy();
    const guidesBySlug = new Map(
      allCorridorGuides().map((g) => [g.slug, g]),
    );

    for (const row of study.rows) {
      const guide = guidesBySlug.get(row.slug)!;
      const prose = stripHtml(
        `${guide.introHtml} ${guide.steps.map((s) => s.html).join(" ")}`,
      );
      const sentences = prose.split(/(?<=[.;])\s+/);

      // 1. Consular legalization corridors must not claim active Hague Apostilles
      if (row.docBridge.code === "consular_legalization") {
        for (const sent of sentences) {
          if (
            /\bapostille/i.test(sent) &&
            !APOSTILLE_NEGATION_RE.test(sent)
          ) {
            throw new Error(
              `Unexpected affirmative Apostille sentence in ${row.slug}: ${sent}`,
            );
          }
        }
      }

      // 2. Bilateral CIEC Convention No. 16 contracting-state claims must match verified treaty membership
      for (const sent of sentences) {
        if (CIEC_NEGATION_RE.test(sent)) continue;
        if (
          /contracting states? to the .*?(?:1976 )?vienna|to which both .*? are contracting states/i.test(
            sent,
          ) &&
          /vienna|1976|ciec|form c/i.test(sent)
        ) {
          expect(
            CIEC_VIENNA_1976_FORM_C.has(row.countryOfDeathCode) &&
              CIEC_VIENNA_1976_FORM_C.has(row.citizenshipCountryCode),
            `${row.slug} mutual CIEC 1976 contracting claim: ${sent}`,
          ).toBe(true);
        }
      }

      // 3. Bridge 3 matches Strasbourg 1973 / Berlin 1937 pair membership exactly
      const pairInTreaty =
        (STRASBOURG_1973_CORPSE_TRANSIT.has(row.countryOfDeathCode) &&
          STRASBOURG_1973_CORPSE_TRANSIT.has(row.citizenshipCountryCode)) ||
        (BERLIN_1937_CORPSE_TRANSIT.has(row.countryOfDeathCode) &&
          BERLIN_1937_CORPSE_TRANSIT.has(row.citizenshipCountryCode));
      expect(row.repatriationBridge.code === "multilateral_laissez_passer").toBe(
        pairInTreaty,
      );
    }
  });

  it("renders accessible SSR table HTML with all 200 guide links and sortable-table semantics", () => {
    const study = getCrossBorderIntegrationStudy();
    const html = renderToStaticMarkup(
      createElement(CorridorIntegrationTable, {
        rows: study.rows,
        countries: study.countries,
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

    // Only Integration Score has aria-sort="descending" initially; never aria-sort="none"
    const ariaSortMatches = html.match(/aria-sort="[^"]+"/g) ?? [];
    expect(ariaSortMatches).toEqual(['aria-sort="descending"']);
    expect(html).not.toContain('aria-sort="none"');

    // All 200 /en/guide/[slug] hrefs are present in initial static HTML
    for (const row of study.rows) {
      expect(html).toContain(`href="${row.guideHref}"`);
    }
    expect(html).not.toContain("—");
  });

  it("keeps public downloadable CSV and JSON exports byte-for-byte synced and free of em-dashes", () => {
    const study = getCrossBorderIntegrationStudy();
    const researchDataDir = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "research",
    );
    const csvPath = path.join(
      researchDataDir,
      "cross-border-integration-index-2026.csv",
    );
    const jsonPath = path.join(
      researchDataDir,
      "cross-border-integration-index-2026.json",
    );

    const diskCsv = fs.readFileSync(csvPath, "utf8").replace(/\r\n/g, "\n");
    const diskJson = fs.readFileSync(jsonPath, "utf8").replace(/\r\n/g, "\n");

    expect(diskCsv).toBe(serializeCrossBorderStudyCsv(study));
    expect(diskJson).toBe(serializeCrossBorderStudyJson(study));

    const nonEmptyCsvLines = diskCsv.trimEnd().split("\n");
    expect(nonEmptyCsvLines).toHaveLength(201);

    const parsedJson = JSON.parse(diskJson) as {
      summary: {
        totalCorridors: number;
        totalVerifiedCitationsInStudyCorridors: number;
      };
      rows: unknown[];
    };
    expect(parsedJson.summary.totalCorridors).toBe(200);
    expect(parsedJson.summary.totalVerifiedCitationsInStudyCorridors).toBe(
      study.totalVerifiedCitationsInStudyCorridors,
    );
    expect(parsedJson.summary.totalVerifiedCitationsInStudyCorridors).toBe(
      2423,
    );
    expect(parsedJson.rows).toHaveLength(200);

    for (const relPath of [
      "src/content/research/cross-border-integration-study.ts",
      "src/app/[lang]/research/page.tsx",
      "src/app/[lang]/research/cross-border-bereavement-integration-index/page.tsx",
      "src/app/[lang]/research/cross-border-bereavement-integration-index/CorridorIntegrationTable.tsx",
    ]) {
      const content = fs.readFileSync(
        path.join(__dirname, "..", relPath),
        "utf8",
      );
      expect(content, `Unexpected em-dash in ${relPath}`).not.toContain("—");
    }
  });

  it("publishes valid PDF working paper and Highwire Press scholar metadata", async () => {
    const pdfPath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "research",
      "cross-border-integration-index-2026.pdf",
    );
    const bytes = fs.readFileSync(pdfPath);
    expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(50_000);

    const meta = await generateStudy1Metadata({
      params: Promise.resolve({ lang: "en" }),
    });
    expect(meta.other?.citation_title).toBe(
      "Cross-Border Bereavement & Serious Illness Administrative Integration Index (2026)",
    );
    expect(meta.other?.citation_doi).toBe("10.5281/zenodo.24388595");
    expect(meta.other?.citation_pdf_url).toBe(
      "https://clarvia.org/data/research/cross-border-integration-index-2026.pdf",
    );
    expect(meta.other?.citation_author).toEqual([
      "Tommi Lindfors",
      "Clarvia ASBL",
    ]);

    const pageHtml = renderToStaticMarkup(
      await Study1Page({ params: Promise.resolve({ lang: "en" }) }),
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
      "https://doi.org/10.5281/zenodo.24388595",
      "https://zenodo.org/records/24388595",
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
      "https://zenodo.org/records/24388595",
      "https://doi.org/10.5281/zenodo.24388595",
      "https://data.public.lu/fr/datasets/cross-border-bereavement-serious-illness-administrative-integration-index-2026/",
    ]);
    expect(datasetNode?.sameAs).not.toContain(
      "https://doi.org/10.5281/zenodo.24245341",
    );
    expect(datasetNode?.sameAs).not.toContain(
      "https://zenodo.org/records/24245341",
    );
  });
});
