import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/consent";

export const GA_MEASUREMENT_ID = "G-K67M5B4932";

/** sessionStorage flag: Ask question succeeded; thank-you page may fire the conversion. */
export const ASK_SUBMITTED_STORAGE_KEY = "clarvia-ask-submitted";

const ADS_ID_PATTERN = /^AW-\d+$/;
const ADS_CONVERSION_PATTERN = /^AW-\d+\/[A-Za-z0-9_-]+$/;

export const DEFAULT_ADS_MEMBERSHIP_PAID_CONVERSION =
  "AW-18472344537/zv56CIq4pbwdENm3puhE";
export const DEFAULT_ADS_MEMBERSHIP_CHECKOUT_CONVERSION =
  "AW-18472344537/oxOBCPrwq7wdENm3puhE";
export const CHECKOUT_BEACON_TIMEOUT_MS = 350;

export function sanitizeAdsId(raw: string | undefined | null): string | undefined {
  const id = raw?.trim();
  return id && ADS_ID_PATTERN.test(id) ? id : undefined;
}

export function sanitizeAdsConversion(raw: string | undefined | null): string | undefined {
  const id = raw?.trim();
  return id && ADS_CONVERSION_PATTERN.test(id) ? id : undefined;
}

export function adsMeasurementId(): string | undefined {
  return sanitizeAdsId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
}

export function adsAskConversionSendTo(): string | undefined {
  return sanitizeAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_ASK_CONVERSION);
}

export function adsDonateConversionSendTo(): string | undefined {
  return sanitizeAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_DONATE_CONVERSION);
}

export function adsGuideConversionSendTo(): string | undefined {
  return sanitizeAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_GUIDE_CONVERSION);
}

export function adsMembershipPaidConversionSendTo(): string | undefined {
  return sanitizeAdsConversion(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_MEMBERSHIP_PAID_CONVERSION ||
      DEFAULT_ADS_MEMBERSHIP_PAID_CONVERSION,
  );
}

export function adsMembershipCheckoutConversionSendTo(): string | undefined {
  return sanitizeAdsConversion(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_MEMBERSHIP_CHECKOUT_CONVERSION ||
      DEFAULT_ADS_MEMBERSHIP_CHECKOUT_CONVERSION,
  );
}

/** EEA (EU-27 + IS, LI, NO) + UK + Switzerland require prior opt-in for analytics/ads cookies. */
export const EEA_UK_CH_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU",
  "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "GB", "CH",
] as const;

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag(...args);
    return;
  }
  window.dataLayer.push(args);
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  gtag("event", name, params);
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  trackEvent("page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackAskSubmitted(params: {
  source_page: string;
  language?: string;
  ref?: string;
  market?: string;
}): void {
  const leadParams: Record<string, unknown> = {
    lead_source: "ask_clarvia",
    source_page: params.source_page,
  };
  if (params.language) leadParams.language = params.language;
  if (params.ref) leadParams.ref = params.ref;
  if (params.market) leadParams.market = params.market;
  trackEvent("generate_lead", leadParams);
  trackEvent("ask_submitted", {
    event_category: "engagement",
    event_label: "Ask Clarvia submit",
    source_page: params.source_page,
    consent_type: "ask-consent-v1",
    ...(params.ref ? { ref: params.ref } : {}),
    ...(params.market ? { market: params.market } : {}),
  });
  const sendTo = adsAskConversionSendTo();
  if (sendTo) {
    trackEvent("conversion", { send_to: sendTo });
  }
}

function buildPaymentPayload(params: {
  value?: number | null;
  currency?: string | null;
  transaction_id: string;
}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    currency: (params.currency || "EUR").toUpperCase(),
    transaction_id: params.transaction_id,
  };
  if (typeof params.value === "number" && Number.isFinite(params.value)) {
    payload.value = params.value;
  }
  return payload;
}

export function trackBeginCheckout(params: {
  value: number;
  currency?: string;
  frequency: "monthly" | "annual" | "onetime";
  landing_variant?: string;
  item_category?: "donation" | "associate_membership";
}): Promise<void> {
  const currency = (params.currency || "EUR").toUpperCase();
  const baseCheckoutParams = {
    currency,
    value: params.value,
    item_category: params.item_category || "donation",
    frequency: params.frequency,
    landing_variant: params.landing_variant,
    transport_type: "beacon",
  };
  // Scope Ads checkout ping strictly to Associate Membership so donation flows stay isolated.
  const sendTo =
    params.item_category === "associate_membership"
      ? adsMembershipCheckoutConversionSendTo()
      : undefined;
  const hasLiveGtag =
    typeof window !== "undefined" && typeof window.gtag === "function";

  if (!hasLiveGtag) {
    trackEvent("begin_checkout", baseCheckoutParams);
    if (sendTo) {
      trackEvent("conversion", {
        send_to: sendTo,
        value: params.value,
        currency,
        transport_type: "beacon",
      });
    }
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    let remaining = sendTo ? 2 : 1;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };

    const timer = setTimeout(finish, CHECKOUT_BEACON_TIMEOUT_MS);

    const makeStepCallback = () => {
      let stepDone = false;
      return () => {
        if (stepDone || settled) return;
        stepDone = true;
        remaining -= 1;
        if (remaining <= 0) finish();
      };
    };

    trackEvent("begin_checkout", {
      ...baseCheckoutParams,
      event_callback: makeStepCallback(),
      event_timeout: CHECKOUT_BEACON_TIMEOUT_MS,
    });
    if (sendTo) {
      trackEvent("conversion", {
        send_to: sendTo,
        value: params.value,
        currency,
        transport_type: "beacon",
        event_callback: makeStepCallback(),
        event_timeout: CHECKOUT_BEACON_TIMEOUT_MS,
      });
    }
  });
}

export function trackDonationComplete(params: {
  value?: number | null;
  currency?: string | null;
  transaction_id: string;
}): void {
  const payload = buildPaymentPayload(params);

  trackEvent("donate", payload);
  trackEvent("donation_complete", {
    event_category: "engagement",
    event_label: "Stripe Donation Success",
    ...payload,
  });
  const sendTo = adsDonateConversionSendTo();
  if (sendTo) {
    trackEvent("conversion", { send_to: sendTo, ...payload });
  }
}

export function trackMembershipComplete(params: {
  value?: number | null;
  currency?: string | null;
  transaction_id: string;
}): void {
  const payload = buildPaymentPayload(params);

  trackEvent("purchase", {
    ...payload,
    item_category: "associate_membership",
  });
  const sendTo = adsMembershipPaidConversionSendTo();
  if (sendTo) {
    trackEvent("conversion", { send_to: sendTo, ...payload });
  }
}

export function trackOfficialSourceClick(params: {
  slug: string;
  language?: string;
  destination: string;
  link_kind: "authority" | "source";
}): void {
  let destinationHost = "";
  try {
    destinationHost = new URL(params.destination).hostname;
  } catch {
    destinationHost = "";
  }
  const payload: Record<string, unknown> = {
    guide_slug: params.slug.slice(0, 80),
    link_kind: params.link_kind,
    ...(destinationHost ? { destination_host: destinationHost } : {}),
    ...(params.language ? { language: params.language } : {}),
  };
  trackEvent("official_source_click", payload);
  const sendTo = adsGuideConversionSendTo();
  if (sendTo) {
    trackEvent("conversion", { send_to: sendTo });
  }
}

export function trackGuideShareCopy(params: {
  slug: string;
  language?: string;
  copy_format: "url" | "html" | "text";
}): void {
  trackEvent("guide_share_copy", {
    guide_slug: params.slug.slice(0, 80),
    copy_format: params.copy_format,
    ...(params.language ? { language: params.language } : {}),
  });
}

/**
 * Consent Mode v2 + Google tag bootstrap. Must run in <head> before gtag.js.
 * EEA/UK/CH default to denied until opt-in; rest-of-world defaults to measurement
 * granted unless user opted out. Ad personalization / remarketing is always denied globally.
 */
export function googleTagBootstrapScript(options?: { adsId?: string | null }): string {
  const adsId = sanitizeAdsId(options?.adsId);
  const adsConfig = adsId
    ? `gtag('config','${adsId}',{send_page_view:false});`
    : "";

  return `(function(){
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
var savedChoice=null;
try{
  var saved=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
  if(saved){
    var parsed=JSON.parse(saved);
    if(parsed&&parsed.version===${JSON.stringify(CONSENT_VERSION)}&&(parsed.status==='granted'||parsed.status==='denied')){
      savedChoice=parsed.status;
    }
  }
}catch(e){}
var eeaMeasure=savedChoice==='granted'?'granted':'denied';
var globalMeasure=savedChoice==='denied'?'denied':'granted';
gtag('consent','default',{
  ad_storage:eeaMeasure,
  ad_user_data:eeaMeasure,
  ad_personalization:'denied',
  analytics_storage:eeaMeasure,
  functionality_storage:'granted',
  security_storage:'granted',
  personalization_storage:'denied',
  wait_for_update:500,
  region:${JSON.stringify(EEA_UK_CH_REGIONS)}
});
gtag('consent','default',{
  ad_storage:globalMeasure,
  ad_user_data:globalMeasure,
  ad_personalization:'denied',
  analytics_storage:globalMeasure,
  functionality_storage:'granted',
  security_storage:'granted',
  personalization_storage:'denied'
});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
gtag('js',new Date());
gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)},{send_page_view:false,anonymize_ip:true});
${adsConfig}
})();`;
}
