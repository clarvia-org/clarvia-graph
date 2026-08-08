export type ConsentStatus = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "clarvia-consent";
export const CONSENT_VERSION = "2026-07-clarvia-consent-v1";

export interface StoredConsent {
  status: ConsentStatus;
  version: string;
  timestamp: string;
  categories: {
    analytics: boolean;
    adsMeasurement: boolean;
    adPersonalization: boolean;
  };
}

/**
 * Update the Google Consent state dynamically.
 */
export function updateGoogleConsent(status: ConsentStatus) {
  if (typeof window === "undefined" || !window.gtag) return;

  if (status === "granted") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
      personalization_storage: "granted",
    });
  } else {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      personalization_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
    });
  }
}

/**
 * Save user's consent preference to localStorage.
 */
export function saveConsentPreference(status: ConsentStatus) {
  if (typeof window === "undefined") return;

  const consentObj: StoredConsent = {
    status,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: {
      analytics: status === "granted",
      adsMeasurement: status === "granted",
      adPersonalization: false,
    },
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentObj));
  } catch (e) {
    console.error("Failed to save consent to localStorage", e);
  }
}
