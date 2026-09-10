import translations from "@/content/ask-entry-translations.json";
import {
  type AskLocale,
  siteLangForAskLocale,
  siteLangToAskLocale,
} from "@/lib/ask-entry";
import type { Lang } from "@/lib/i18n";

export type AskCopyId = keyof (typeof translations)["en"];

const ERROR_KEYS: Record<string, AskCopyId> = {
  "Please wait a bit before asking again.": "error_rate_limit",
  "We're temporarily unable to take questions. Please try again shortly.": "error_unavailable",
  "Consent is required.": "error_consent",
  "Please enter a valid email address.": "error_email",
  "Please describe your situation in at least a sentence or two.": "error_short",
  "Please shorten your question a little.": "error_long",
  "Bot check failed": "error_bot",
  "Please check your question and email, then try again.": "error_check",
  "Something went wrong.": "error_generic",
};

export function askCopy(locale: AskLocale, id: AskCopyId): string {
  return translations[locale as keyof typeof translations]?.[id] ?? translations.en[id];
}

export function askErrorCopy(locale: AskLocale, message: string): string {
  const key = ERROR_KEYS[message];
  return key ? askCopy(locale, key) : askCopy(locale, "error_generic");
}

export type AskFormCopy = {
  situationLabel: string;
  situationPlaceholder: string;
  minHint: string;
  placeHint: string;
  emailLabel: string;
  emailPlaceholder: string;
  consent: string;
  privacy: string;
  privacyHref: string;
  submit: string;
  sending: string;
  formFooter: string;
  error: (raw: string) => string;
};

export function askFormCopy(locale: AskLocale): AskFormCopy {
  const siteLang = siteLangForAskLocale(locale);
  return {
    situationLabel: askCopy(locale, "situation_label"),
    situationPlaceholder: askCopy(locale, "situation_placeholder"),
    minHint: askCopy(locale, "min_hint"),
    placeHint: askCopy(locale, "place_hint"),
    emailLabel: askCopy(locale, "email_label"),
    emailPlaceholder: askCopy(locale, "email_placeholder"),
    consent: askCopy(locale, "consent"),
    privacy: askCopy(locale, "privacy"),
    privacyHref: `/${siteLang}/privacy`,
    submit: askCopy(locale, "submit"),
    sending: askCopy(locale, "sending"),
    formFooter: askCopy(locale, "form_footer"),
    error: (raw) => askErrorCopy(locale, raw),
  };
}

export function homepageAskFormCopy(lang: Lang): AskFormCopy {
  return askFormCopy(siteLangToAskLocale(lang));
}
