import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/consent";

export const GA_MEASUREMENT_ID = "G-K67M5B4932";

/** sessionStorage flag: homepage Ask us succeeded; thank-you page may fire the conversion. */
export const ASK_SUBMITTED_STORAGE_KEY = "clarvia-ask-submitted";

const ADS_ID_PATTERN = /^AW-\d+$/;
const ADS_CONVERSION_PATTERN = /^AW-\d+\/[A-Za-z0-9_-]+$/;

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

export function trackAskSubmitted(params: { source_page: string; language?: string }): void {
  const leadParams: Record<string, unknown> = {
    lead_source: "ask_clarvia",
    source_page: params.source_page,
  };
  if (params.language) leadParams.language = params.language;
  trackEvent("generate_lead", leadParams);
  trackEvent("ask_submitted", {
    event_category: "engagement",
    event_label: "Ask Clarvia submit",
    source_page: params.source_page,
    consent_type: "ask-consent-v1",
  });
  const sendTo = adsAskConversionSendTo();
  if (sendTo) {
    trackEvent("conversion", { send_to: sendTo });
  }
}

export function trackBeginCheckout(params: {
  value: number;
  currency?: string;
  frequency: "monthly" | "onetime";
  landing_variant?: string;
}): void {
  trackEvent("begin_checkout", {
    currency: (params.currency || "EUR").toUpperCase(),
    value: params.value,
    item_category: "donation",
    frequency: params.frequency,
    landing_variant: params.landing_variant,
  });
}

export function trackDonationComplete(params: {
  value?: number | null;
  currency?: string | null;
  transaction_id: string;
}): void {
  const payload: Record<string, unknown> = {
    currency: (params.currency || "EUR").toUpperCase(),
    transaction_id: params.transaction_id,
  };
  if (typeof params.value === "number" && Number.isFinite(params.value)) {
    payload.value = params.value;
  }

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

/**
 * Consent Mode v2 + Google tag bootstrap. Must run in <head> before gtag.js.
 * Accept-all restores analytics and ads *measurement* only — not ad personalization.
 */
export function googleTagBootstrapScript(options?: { adsId?: string | null }): string {
  const adsId = sanitizeAdsId(options?.adsId);
  const adsConfig = adsId
    ? `gtag('config','${adsId}',{send_page_view:false});`
    : "";

  return `(function(){
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
var consentState={
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  personalization_storage:'denied',
  wait_for_update:500
};
try{
  var saved=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
  if(saved){
    var parsed=JSON.parse(saved);
    if(parsed&&parsed.version===${JSON.stringify(CONSENT_VERSION)}&&parsed.status==='granted'){
      consentState.analytics_storage='granted';
      consentState.ad_storage='granted';
      consentState.ad_user_data='granted';
    }
  }
}catch(e){}
gtag('consent','default',consentState);
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
gtag('js',new Date());
gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)},{send_page_view:false,anonymize_ip:true});
${adsConfig}
})();`;
}
