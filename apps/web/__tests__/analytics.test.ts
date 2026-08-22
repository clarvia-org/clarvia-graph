import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GA_MEASUREMENT_ID,
  googleTagBootstrapScript,
  sanitizeAdsConversion,
  sanitizeAdsId,
  trackAskSubmitted,
  trackBeginCheckout,
  trackDonationComplete,
  trackPageView,
} from "@/lib/analytics";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/consent";

function installWindow(gtag: (...args: unknown[]) => void) {
  vi.stubGlobal("window", {
    gtag,
    dataLayer: [] as unknown[],
    location: { href: "https://clarvia.org/en" },
  });
  vi.stubGlobal("document", { title: "Clarvia" });
}

describe("Google Ads / GA4 helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("accepts only well-formed Ads IDs and conversion send_to values", () => {
    expect(sanitizeAdsId("AW-123456789")).toBe("AW-123456789");
    expect(sanitizeAdsId(" AW-1 ")).toBe("AW-1");
    expect(sanitizeAdsId("G-K67M5B4932")).toBeUndefined();
    expect(sanitizeAdsId("AW-123';alert(1)//")).toBeUndefined();
    expect(sanitizeAdsConversion("AW-123456789/AbC_dEf-12")).toBe("AW-123456789/AbC_dEf-12");
    expect(sanitizeAdsConversion("AW-123456789")).toBeUndefined();
  });

  it("bootstraps Consent Mode without ad personalization, with page_view off", () => {
    const script = googleTagBootstrapScript({ adsId: "AW-999" });
    expect(script).toContain(GA_MEASUREMENT_ID);
    expect(script).toContain(CONSENT_STORAGE_KEY);
    expect(script).toContain(CONSENT_VERSION);
    expect(script).toContain("send_page_view:false");
    expect(script).toContain("url_passthrough");
    expect(script).toContain("ad_personalization:'denied'");
    expect(script).not.toMatch(/ad_personalization:'granted'/);
    expect(script).not.toMatch(/personalization_storage:'granted'/);
    expect(script).toContain("gtag('config','AW-999',{send_page_view:false})");
  });

  it("omits an invalid Ads ID from the bootstrap script", () => {
    const script = googleTagBootstrapScript({ adsId: "AW-1</script><script>alert(1)" });
    expect(script).not.toContain("alert(1)");
    expect(script).not.toContain("gtag('config','AW-");
  });

  describe("event payloads", () => {
    let gtag: ReturnType<typeof vi.fn<(...args: unknown[]) => void>>;

    beforeEach(() => {
      gtag = vi.fn<(...args: unknown[]) => void>();
      installWindow(gtag);
    });

    it("fires generate_lead for Ask Clarvia, keeping ask_submitted as an extra event", () => {
      trackAskSubmitted({ source_page: "/en" });
      expect(gtag).toHaveBeenCalledWith("event", "generate_lead", {
        lead_source: "ask_clarvia",
        source_page: "/en",
      });
      expect(gtag).toHaveBeenCalledWith(
        "event",
        "ask_submitted",
        expect.objectContaining({ source_page: "/en" })
      );
      expect(gtag.mock.calls.some((call) => call[1] === "conversion")).toBe(false);
    });

    it("fires a Google Ads conversion for Ask when the env send_to is set", () => {
      vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_ASK_CONVERSION", "AW-111/asklabel");
      trackAskSubmitted({ source_page: "/fr" });
      expect(gtag).toHaveBeenCalledWith("event", "conversion", {
        send_to: "AW-111/asklabel",
      });
    });

    it("fires donate with transaction_id for completed Stripe donations", () => {
      trackDonationComplete({
        value: 25,
        currency: "eur",
        transaction_id: "cs_test_123",
      });
      expect(gtag).toHaveBeenCalledWith("event", "donate", {
        currency: "EUR",
        value: 25,
        transaction_id: "cs_test_123",
      });
      expect(gtag).toHaveBeenCalledWith(
        "event",
        "donation_complete",
        expect.objectContaining({ transaction_id: "cs_test_123", value: 25 })
      );
    });

    it("omits donate value when Stripe did not return an amount", () => {
      trackDonationComplete({
        value: null,
        currency: "EUR",
        transaction_id: "cs_test_empty",
      });
      expect(gtag).toHaveBeenCalledWith("event", "donate", {
        currency: "EUR",
        transaction_id: "cs_test_empty",
      });
    });

    it("fires begin_checkout before Stripe redirect", () => {
      trackBeginCheckout({
        value: 50,
        frequency: "onetime",
        landing_variant: "support",
      });
      expect(gtag).toHaveBeenCalledWith(
        "event",
        "begin_checkout",
        expect.objectContaining({
          currency: "EUR",
          value: 50,
          frequency: "onetime",
          landing_variant: "support",
        })
      );
    });

    it("records client route page views with the current URL", () => {
      trackPageView("/en/ask/sent");
      expect(gtag).toHaveBeenCalledWith("event", "page_view", {
        page_path: "/en/ask/sent",
        page_location: "https://clarvia.org/en",
        page_title: "Clarvia",
      });
    });
  });
});
