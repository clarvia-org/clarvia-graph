/** Coarse attribution only: never retain or send a Google click identifier. */
export type AskSource = "google_ads" | "unknown";

export function askSourceFromSearch(search: string): AskSource {
  const params = new URLSearchParams(search);
  const hasClickMarker = ["gclid", "gbraid", "wbraid"].some((key) =>
    Boolean(params.get(key)?.trim()),
  );
  const hasPaidGoogleTag =
    params.get("utm_source")?.toLowerCase() === "google" &&
    ["cpc", "ppc", "paidsearch"].includes(params.get("utm_medium")?.toLowerCase() ?? "");
  return hasClickMarker || hasPaidGoogleTag ? "google_ads" : "unknown";
}

// Page-lifetime memory survives client-side navigation, without cookies or
// browser storage. Reloads/return visits without a marker remain unknown.
let visitSource: AskSource = "unknown";

export function captureAskSource(search: string): void {
  if (askSourceFromSearch(search) === "google_ads") visitSource = "google_ads";
}

export function currentAskSource(): AskSource {
  if (typeof window === "undefined") return "unknown";
  captureAskSource(window.location.search);
  return visitSource;
}
