import { type Lang, l } from "@/lib/i18n";

export const ASSOCIATE_MONTHLY_EUR = 40;
export const ASSOCIATE_ANNUAL_EUR = 480;
export const FOUNDING_COHORT_YEARS = "2026-2027";

export type LocalisedMemberCopy = {
  en: string;
  fr: string;
  de: string;
  lu: string;
};

export interface AssociateMember {
  slug: string;
  name: string;
  headline?: LocalisedMemberCopy;
  /** Local WebP path under public/ (e.g. "/members/jane-doe.webp"). Falls back to initials if omitted. */
  photo?: string;
  linkedinUrl: string;
  cohort: string;
  admittedYear: number;
}

export interface CohortArchetypeSlot {
  id:
    | "legal-estate"
    | "healthcare-palliative"
    | "civic-tech"
    | "global-mobility"
    | "philanthropy"
    | "workplace-hr";
  sector: LocalisedMemberCopy;
  descriptor: LocalisedMemberCopy;
}

/**
 * Curated Associate Members who opted in to public recognition on clarvia.org.
 * Each entry added here replaces one illustrative Founding Cohort slot automatically.
 */
export const PUBLISHED_ASSOCIATE_MEMBERS: readonly AssociateMember[] = [];

export const COHORT_ARCHETYPE_SLOTS: readonly CohortArchetypeSlot[] = [
  {
    id: "legal-estate",
    sector: {
      en: "Cross-Border Law & Estate Practice",
      fr: "Droit transfrontalier et successions",
      de: "Grenzüberschreitendes Recht & Nachlass",
      lu: "Grenziwwerschreidend Recht & Successiounen",
    },
    descriptor: {
      en: "Founding Cohort Seat · Open for admission*",
      fr: "Siège de la cohorte fondatrice · Ouvert*",
      de: "Platz der Gründerkohorte · Offen*",
      lu: "Plaz an der Grënnerkohort · Oppen*",
    },
  },
  {
    id: "healthcare-palliative",
    sector: {
      en: "Healthcare & Palliative Care Leadership",
      fr: "Direction hospitalière et soins palliatifs",
      de: "Gesundheitswesen & Palliativversorgung",
      lu: "Gesondheetswiesen & Palliativfleeg",
    },
    descriptor: {
      en: "Founding Cohort Seat · Open for admission*",
      fr: "Siège de la cohorte fondatrice · Ouvert*",
      de: "Platz der Gründerkohorte · Offen*",
      lu: "Plaz an der Grënnerkohort · Oppen*",
    },
  },
  {
    id: "civic-tech",
    sector: {
      en: "European Civic Tech & Open Data",
      fr: "Civic tech européenne et données ouvertes",
      de: "Europäische Civic Tech & Open Data",
      lu: "Europäesch Civic Tech & Open Data",
    },
    descriptor: {
      en: "Founding Cohort Seat · Open for admission*",
      fr: "Siège de la cohorte fondatrice · Ouvert*",
      de: "Platz der Gründerkohorte · Offen*",
      lu: "Plaz an der Grënnerkohort · Oppen*",
    },
  },
  {
    id: "global-mobility",
    sector: {
      en: "Expatriate & Global Mobility Advisory",
      fr: "Mobilité internationale et expatriation",
      de: "Internationale Mobilität & Expat-Beratung",
      lu: "International Mobilitéit & Expat-Berodung",
    },
    descriptor: {
      en: "Founding Cohort Seat · Open for admission*",
      fr: "Siège de la cohorte fondatrice · Ouvert*",
      de: "Platz der Gründerkohorte · Offen*",
      lu: "Plaz an der Grënnerkohort · Oppen*",
    },
  },
  {
    id: "philanthropy",
    sector: {
      en: "Philanthropic & Family Stewardship",
      fr: "Philanthropie et mécénat d'intérêt général",
      de: "Philanthropie & gemeinnütziges Engagement",
      lu: "Philanthropie & Engagement am ëffentlechen Interessi",
    },
    descriptor: {
      en: "Founding Cohort Seat · Open for admission*",
      fr: "Siège de la cohorte fondatrice · Ouvert*",
      de: "Platz der Gründerkohorte · Offen*",
      lu: "Plaz an der Grënnerkohort · Oppen*",
    },
  },
  {
    id: "workplace-hr",
    sector: {
      en: "Workplace Wellbeing & People Leadership",
      fr: "Ressources humaines et soutien aux salariés",
      de: "Personalwesen & Mitarbeitendenfürsorge",
      lu: "Personalwiesen & Ënnerstëtzung um Aarbechtsplaz",
    },
    descriptor: {
      en: "Founding Cohort Seat · Open for admission*",
      fr: "Siège de la cohorte fondatrice · Ouvert*",
      de: "Platz der Gründerkohorte · Offen*",
      lu: "Plaz an der Grënnerkohort · Oppen*",
    },
  },
];

export function localizeMemberCopy(lang: Lang, copy: LocalisedMemberCopy): string {
  return l(lang, copy.en, copy.fr, copy.de, copy.lu);
}

/**
 * Returns remaining illustrative cohort slots after subtracting published members.
 */
export function getRemainingArchetypeSlots(
  publishedCount: number = PUBLISHED_ASSOCIATE_MEMBERS.length,
): readonly CohortArchetypeSlot[] {
  const safeCount = Math.max(0, Math.min(publishedCount, COHORT_ARCHETYPE_SLOTS.length));
  return COHORT_ARCHETYPE_SLOTS.slice(safeCount);
}

function isAllowedHandleChar(code: number): boolean {
  // ASCII letters, digits, hyphen, underscore, percent-encoding, or non-ASCII Unicode letters
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 45 || // -
    code === 95 || // _
    code === 37 || // %
    code >= 128
  );
}

function isPlausibleLinkedInHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "linkedin.com" || host === "www.linkedin.com") return true;
  if (!host.endsWith(".linkedin.com")) return false;
  const sub = host.slice(0, -".linkedin.com".length);
  // Allow 2-3 letter country subdomains such as lu.linkedin.com, de.linkedin.com, uk.linkedin.com
  if (sub.length < 2 || sub.length > 3) return false;
  for (let i = 0; i < sub.length; i++) {
    const c = sub.charCodeAt(i);
    if (c < 97 || c > 122) return false;
  }
  return true;
}

/**
 * Linear, non-backtracking validator and normalizer for personal LinkedIn profile URLs.
 * Accepts https://(www|<cc>).linkedin.com/in/<handle> (with or without leading https://)
 * and strips tracking query strings/fragments into canonical https://www.linkedin.com/in/<handle>.
 */
export function normalizeLinkedInProfileUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 250) return null;

  const lower = trimmed.toLowerCase();
  const withScheme =
    lower.startsWith("http://") || lower.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (parsed.username || parsed.password || parsed.port) return null;
  if (!isPlausibleLinkedInHost(parsed.hostname)) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0].toLowerCase() !== "in") {
    return null;
  }

  const handle = segments[1];
  if (handle.length < 3 || handle.length > 100) return null;
  if (handle === "." || handle === "..") return null;

  for (let i = 0; i < handle.length; i++) {
    const code = handle.charCodeAt(i);
    if (code <= 32 || !isAllowedHandleChar(code)) {
      return null;
    }
  }

  return `https://www.linkedin.com/in/${handle}`;
}

const HONORIFIC_PREFIXES = new Set([
  "dr",
  "dr.",
  "prof",
  "prof.",
  "mr",
  "mr.",
  "mrs",
  "mrs.",
  "ms",
  "ms.",
  "mx",
  "mx.",
  "me",
  "m.",
  "mme",
]);

/**
 * Extracts 1-2 uppercase initials from a person's display name, skipping common honorifics.
 */
export function computeMemberInitials(rawName: string): string {
  const parts = rawName
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !HONORIFIC_PREFIXES.has(token.toLowerCase()));

  if (parts.length === 0) return "AM";
  const first = Array.from(parts[0])[0] ?? "A";
  if (parts.length === 1) return first.toUpperCase();
  const last = Array.from(parts[parts.length - 1])[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export type MembershipVerificationOutcome =
  | { kind: "paid"; amount: number | null; currency: string; admittedDate: string }
  | { kind: "pending_settlement" }
  | { kind: "rejected" };

/**
 * Classifies a `GET /api/donate?session_id=...` payload for `/[lang]/membership`.
 * Rejects non-200 responses, general `/support` donation sessions, and incomplete checkouts;
 * separates settled (`payment_status === "paid"`) from async pending settlement (`status === "complete"`).
 */
export function classifyMembershipSessionResponse(
  resOk: boolean,
  data: Record<string, unknown> | null | undefined,
): MembershipVerificationOutcome {
  if (!resOk || !data || data.program !== "associate_membership") {
    return { kind: "rejected" };
  }

  if (data.payment_status === "paid") {
    return {
      kind: "paid",
      amount: typeof data.amount === "number" ? data.amount : null,
      currency:
        typeof data.currency === "string" && data.currency
          ? data.currency
          : "EUR",
      admittedDate:
        typeof data.created_date === "string" && data.created_date
          ? data.created_date
          : new Date().toISOString().slice(0, 10),
    };
  }

  if (data.status === "complete") {
    return { kind: "pending_settlement" };
  }

  return { kind: "rejected" };
}
