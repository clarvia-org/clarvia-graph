import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_DENIED_UPDATE,
  CONSENT_GRANTED_UPDATE,
  saveConsentPreference,
  updateGoogleConsent,
} from "@/lib/consent";

describe("cookie consent vs Ads measurement", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never grants ad personalization or remarketing storage", () => {
    expect(CONSENT_GRANTED_UPDATE.ad_personalization).toBe("denied");
    expect(CONSENT_GRANTED_UPDATE.personalization_storage).toBe("denied");
    expect(CONSENT_GRANTED_UPDATE.ad_storage).toBe("granted");
    expect(CONSENT_GRANTED_UPDATE.ad_user_data).toBe("granted");
    expect(CONSENT_GRANTED_UPDATE.analytics_storage).toBe("granted");
    expect(CONSENT_DENIED_UPDATE.ad_storage).toBe("denied");
    expect(CONSENT_DENIED_UPDATE.analytics_storage).toBe("denied");
  });

  it("sends the granted update without turning on personalization", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    updateGoogleConsent("granted");
    expect(gtag).toHaveBeenCalledWith("consent", "update", CONSENT_GRANTED_UPDATE);
  });

  it("stores ads measurement on accept and personalization off", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      getItem: (key: string) => store.get(key) ?? null,
    });
    saveConsentPreference("granted");
    const saved = JSON.parse(store.values().next().value as string);
    expect(saved.categories.analytics).toBe(true);
    expect(saved.categories.adsMeasurement).toBe(true);
    expect(saved.categories.adPersonalization).toBe(false);
  });
});
