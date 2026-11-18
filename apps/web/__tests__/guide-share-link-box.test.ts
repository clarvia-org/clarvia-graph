import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GuideShareLinkBox, {
  buildGuideHtmlSnippet,
  buildGuideTextSnippet,
  escapeHtml,
} from "@/app/[lang]/guide/[slug]/GuideShareLinkBox";
import { GUIDE_UI_COPY, type GuideUiCopy } from "@/content/corridor-guide-ui";
import { parseAskLocale, siteLangForAskLocale } from "@/lib/ask-entry";

function decodeEntities(html: string): string {
  return html
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const SHARE_COPY_KEYS = [
  "shareBoxHeading",
  "shareBoxBody",
  "shareUrlLabel",
  "shareCopyUrlButton",
  "shareCopyHtmlButton",
  "shareCopyTextButton",
  "shareCopiedStatus",
  "shareCopyFailedStatus",
  "sharePreviewSummary",
  "shareHtmlLabel",
  "shareTextLabel",
  "shareSnippetSuffix",
  "sharePartnersLinkLabel",
] as const satisfies ReadonlyArray<keyof GuideUiCopy>;

describe("GuideShareLinkBox", () => {
  it("escapes HTML special characters cleanly", () => {
    expect(escapeHtml(`A & B <tag> "quoted" 'single'`)).toBe(
      "A &amp; B &lt;tag&gt; &quot;quoted&quot; &#39;single&#39;",
    );
  });

  it("builds a clean dofollow HTML anchor snippet without <p> wrapper or nofollow/ugc", () => {
    const snippet = buildGuideHtmlSnippet({
      canonicalUrl: "https://clarvia.org/en/guide/spain-uk-bereavement?a=1&b=2",
      anchorTitle: `Spain & UK "Bereavement" <Guide>'s`,
      suffix: "free official-source guide by Clarvia ASBL",
    });

    expect(snippet).toBe(
      `<a href="https://clarvia.org/en/guide/spain-uk-bereavement?a=1&amp;b=2">Spain &amp; UK &quot;Bereavement&quot; &lt;Guide&gt;&#39;s</a> — free official-source guide by Clarvia ASBL`,
    );
    expect(snippet).not.toMatch(/nofollow|ugc|<p[\s>]/i);
  });

  it("builds a clean plain-text reference snippet", () => {
    expect(
      buildGuideTextSnippet({
        canonicalUrl: "https://clarvia.org/de/guide/germany-bereavement-checklist",
        anchorTitle: "Todesfall in Deutschland",
        suffix: "kostenfreier Leitfaden mit amtlichen Quellen von Clarvia ASBL",
      }),
    ).toBe(
      "Todesfall in Deutschland — kostenfreier Leitfaden mit amtlichen Quellen von Clarvia ASBL: https://clarvia.org/de/guide/germany-bereavement-checklist",
    );
  });

  it("renders valid accessible markup and translations across all 14 guide UI locales", () => {
    const entries = Object.entries(GUIDE_UI_COPY);
    expect(entries).toHaveLength(14);

    for (const [lang, ui] of entries) {
      for (const key of SHARE_COPY_KEYS) {
        expect(ui[key].trim().length, `${lang}.${key}`).toBeGreaterThan(0);
      }

      const siteLang = siteLangForAskLocale(parseAskLocale(lang) ?? "en");
      const canonicalUrl = `https://clarvia.org/${lang}/guide/sample-guide`;
      const anchorTitle = "Sample Guide Title";

      const rawHtml = renderToStaticMarkup(
        createElement(GuideShareLinkBox, {
          slug: "sample-guide",
          lang,
          siteLang,
          canonicalUrl,
          anchorTitle,
        }),
      );
      const decoded = decodeEntities(rawHtml);

      expect(decoded, lang).toContain(ui.shareBoxHeading);
      expect(decoded, lang).toContain(ui.sharePreviewSummary);

      // Read-only LTR URL input with matching <label for=...>
      const inputMatch = rawHtml.match(/<input[^>]*id="([^"]+)"[^>]*>/);
      expect(inputMatch, `${lang} input`).toBeTruthy();
      const urlInputId = inputMatch![1];
      expect(inputMatch![0], `${lang} input dir`).toContain('dir="ltr"');
      expect(inputMatch![0], `${lang} input readonly`).toMatch(/\breadonly(?:="")?/i);
      expect(inputMatch![0], `${lang} input value`).toContain(`value="${canonicalUrl}"`);
      expect(rawHtml, `${lang} label`).toContain(`for="${urlInputId}"`);

      // Invoker command buttons targeting existing IDs inside the same block
      for (const cmd of ["--copy-url", "--copy-html", "--copy-text"] as const) {
        const btnRegex = new RegExp(
          `<button[^>]*command="${cmd}"[^>]*commandfor="([^"]+)"[^>]*>[\\s\\S]*?<\\/button>`,
        );
        const match = rawHtml.match(btnRegex);
        expect(match, `${lang} ${cmd}`).toBeTruthy();
        const targetId = match![1];
        expect(rawHtml, `${lang} ${cmd} target`).toContain(`id="${targetId}"`);
        // Live region must be outside <button>, never inside
        expect(match![0], `${lang} ${cmd} no status inside button`).not.toContain('role="status"');
      }

      // Sibling role="status" live regions are placed outside <button> and empty at rest
      const statusMatches = [...rawHtml.matchAll(/<\/button><span role="status"[^>]*>(.*?)<\/span>/g)];
      expect(statusMatches, `${lang} status count`).toHaveLength(3);
      for (const m of statusMatches) {
        expect(m[1], `${lang} empty status at rest`).toBe("");
      }

      // Collapsible <details> + <summary> with no headings inside <summary>
      const summaryMatch = rawHtml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
      expect(summaryMatch, `${lang} summary`).toBeTruthy();
      expect(summaryMatch![1], `${lang} no headings in summary`).not.toMatch(/<h[1-6]\b/i);

      // Scrollable code blocks use <pre role="region" tabindex="0"> wrapping <code>
      const preMatches = [...rawHtml.matchAll(/<pre\b([^>]*)><code id="([^"]+)">/g)];
      expect(preMatches, `${lang} pre regions`).toHaveLength(2);
      expect(preMatches[0][1], `${lang} html pre ltr`).toContain('dir="ltr"');
      for (const m of preMatches) {
        expect(m[1], `${lang} pre role`).toContain('role="region"');
        expect(m[1], `${lang} pre tabindex`).toContain('tabindex="0"');
        expect(m[1], `${lang} pre labelledby`).toMatch(/aria-labelledby="[^"]+"/);
      }

      // Partners link targets the mapped UI siteLang
      expect(rawHtml, `${lang} partners link`).toContain(`href="/${siteLang}/partners"`);
    }
  });

  it("maps Arabic guide pages to /en/partners while keeping Arabic UI text and LTR code blocks", () => {
    const siteLang = siteLangForAskLocale(parseAskLocale("ar") ?? "en");
    expect(siteLang).toBe("en");

    const html = renderToStaticMarkup(
      createElement(GuideShareLinkBox, {
        slug: "egypt-bereavement-checklist",
        lang: "ar",
        siteLang,
        canonicalUrl: "https://clarvia.org/ar/guide/egypt-bereavement-checklist",
        anchorTitle: "إجراءات الوفاة في مصر",
      }),
    );

    expect(html).toContain(GUIDE_UI_COPY.ar.shareBoxHeading);
    expect(html).toContain('href="/en/partners"');
    expect(html).toContain('dir="ltr"');
  });
});
