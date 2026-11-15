import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MAX_QUESTION_CHARS } from "@/app/api/ask/route";
import { GUIDE_UI_COPY, getGuideUiCopy } from "@/content/corridor-guide-ui";
import { getAnyCorridorGuideBySlug } from "@/content/corridor-guides";
import { MIN_QUESTION_CHARS, PLACE_HINT_RE } from "@/lib/ask-entry";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/script", () => ({
  default: () => null,
}));

import GuideCtaClient, {
  applyFocusItemSelection,
  buildGuideFocusPrompt,
  formatInitialGuidePrefill,
} from "@/app/[lang]/guide/[slug]/GuideCtaClient";

describe("GuideCtaClient", () => {
  it("normalizes initial prefill whitespace and legacy trailing colons/semicolons", () => {
    expect(formatInitialGuidePrefill("  A family member has died in Sudan.  ")).toBe(
      "A family member has died in Sudan. ",
    );
    expect(formatInitialGuidePrefill("We need guidance in France:")).toBe(
      "We need guidance in France. ",
    );
    expect(formatInitialGuidePrefill("We need guidance in France;")).toBe(
      "We need guidance in France. ",
    );
  });

  it("builds valid focus-item prompts across all 14 guide UI locales without double colons", () => {
    const enPrefill =
      "A family member has died in Spain. We need an overview of the main official steps and authorities in Spain.";
    const item = "Statutory civil death registration deadline and burial permit rules in Spain.";

    for (const [lang, ui] of Object.entries(GUIDE_UI_COPY)) {
      const prompt = buildGuideFocusPrompt(enPrefill, ui.ctaSpecificPrefix, item);
      expect(prompt.endsWith(". "), lang).toBe(true);
      expect(prompt.includes(`: ${ui.ctaSpecificPrefix}`), lang).toBe(false);
      expect(prompt.includes(".."), lang).toBe(false);
      expect(prompt.trim().length, lang).toBeGreaterThanOrEqual(MIN_QUESTION_CHARS);
      expect(prompt.trim().length, lang).toBeLessThanOrEqual(MAX_QUESTION_CHARS);
      expect(PLACE_HINT_RE.test(prompt.trim()), lang).toBe(true);
    }

    expect(
      buildGuideFocusPrompt(
        "Legacy prefill ending with colon:",
        GUIDE_UI_COPY.en.ctaSpecificPrefix,
        "Funeral permits in France:",
      ),
    ).toBe(
      "Legacy prefill ending with colon. Specifically regarding: Funeral permits in France. ",
    );
  });

  it("updates AskForm via fillHandle and scrolls/focuses the textarea when a chip is selected", () => {
    const fillQuestion = vi.fn();
    const scrollIntoView = vi.fn();
    const focus = vi.fn();

    const prompt = applyFocusItemSelection({
      prefillQuestion: "A family member has died in France.",
      ctaSpecificPrefix: GUIDE_UI_COPY.fr.ctaSpecificPrefix,
      itemText: "Déclaration de décès en mairie",
      fillHandle: { fillQuestion },
      questionElement: { scrollIntoView, focus },
    });

    expect(prompt).toBe(
      "A family member has died in France. Plus précisément concernant : Déclaration de décès en mairie. ",
    );
    expect(fillQuestion).toHaveBeenCalledTimes(1);
    expect(fillQuestion).toHaveBeenCalledWith(prompt);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(focus).toHaveBeenCalledTimes(1);

    expect(() =>
      applyFocusItemSelection({
        prefillQuestion: "A family member has died in France.",
        ctaSpecificPrefix: GUIDE_UI_COPY.en.ctaSpecificPrefix,
        itemText: "Estate probate",
        fillHandle: null,
        questionElement: null,
      }),
    ).not.toThrow();
  });

  it("renders localized CTA heading, focus chips, optional closingQuestion, and AskForm across locales", () => {
    const cases: Array<{ lang: string; slug: string; showClosing: boolean }> = [
      { lang: "en", slug: "sudan-bereavement-checklist", showClosing: true },
      { lang: "fr", slug: "guinea-bereavement-checklist", showClosing: true },
      { lang: "ar", slug: "sudan-bereavement-checklist", showClosing: false },
      { lang: "lu", slug: "luxembourg-bereavement-checklist", showClosing: true },
    ];

    for (const { lang, slug, showClosing } of cases) {
      const guide = getAnyCorridorGuideBySlug(slug, lang)!;
      const ui = getGuideUiCopy(lang);
      const html = renderToStaticMarkup(
        createElement(GuideCtaClient, {
          slug,
          lang,
          prefillQuestion: guide.prefillQuestion,
          closingQuestion: showClosing ? guide.closingQuestion : "",
          caseDependentItems: guide.caseDependentItems,
        }),
      );
      const decodedHtml = html
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&");

      expect(decodedHtml, `${lang}/${slug}`).toContain(`id="guide-ask-form"`);
      expect(decodedHtml, `${lang}/${slug}`).toContain(ui.ctaHeading);
      expect(decodedHtml, `${lang}/${slug}`).toContain(ui.ctaFocusLabel);
      for (const item of guide.caseDependentItems) {
        expect(decodedHtml, `${lang}/${slug}`).toContain(item);
      }
      if (showClosing) {
        expect(decodedHtml, `${lang}/${slug}`).toContain(guide.closingQuestion);
      } else {
        expect(decodedHtml, `${lang}/${slug}`).not.toContain("“”");
      }
    }
  });
});
