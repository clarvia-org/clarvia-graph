import { type Lang, l } from "@/lib/i18n";

export const ASSOCIATE_MONTHLY_EUR = 40;
export const ASSOCIATE_ANNUAL_EUR = 480;
export const FOUNDING_COHORT_YEARS = "2026-2027";

export type MemberKind = "individual" | "organization";

export type LocalisedMemberCopy = {
  en: string;
  fr: string;
  de: string;
  lu: string;
};

export interface AssociateMember {
  slug: string;
  name: string;
  memberKind?: MemberKind;
  headline?: LocalisedMemberCopy;
  /** Local WebP portrait or logo path under public/ (e.g. "/members/jane-doe.webp"). */
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
 * Curated Associate Members (individuals and companies) who opted in to public recognition.
 * Each entry replaces one illustrative Founding Cohort slot automatically.
 */
export const PUBLISHED_ASSOCIATE_MEMBERS: readonly AssociateMember[] = [];

const OPEN_SEAT_DESCRIPTOR: LocalisedMemberCopy = {
  en: "Open Founding Seat*",
  fr: "Siège fondateur ouvert*",
  de: "Offener Kohortenplatz*",
  lu: "Oppen Grënnerplaz*",
};

export const COHORT_ARCHETYPE_SLOTS: readonly CohortArchetypeSlot[] = [
  {
    id: "legal-estate",
    sector: {
      en: "Cross-Border Law & Estate Practice",
      fr: "Droit international et successions",
      de: "Internationales Recht & Nachlass",
      lu: "Internationalt Recht & Successiounen",
    },
    descriptor: OPEN_SEAT_DESCRIPTOR,
  },
  {
    id: "healthcare-palliative",
    sector: {
      en: "Healthcare & Palliative Care",
      fr: "Santé et soins palliatifs",
      de: "Gesundheitswesen & Palliativpflege",
      lu: "Gesondheetswiesen & Palliativfleeg",
    },
    descriptor: OPEN_SEAT_DESCRIPTOR,
  },
  {
    id: "civic-tech",
    sector: {
      en: "Civic Tech & Open Data",
      fr: "Civic tech et données ouvertes",
      de: "Civic Tech & Open Data",
      lu: "Civic Tech & Open Data",
    },
    descriptor: OPEN_SEAT_DESCRIPTOR,
  },
  {
    id: "global-mobility",
    sector: {
      en: "Global Mobility & Expat Advisory",
      fr: "Mobilité internationale et expatriation",
      de: "Globale Mobilität & Expat-Beratung",
      lu: "Global Mobilitéit & Expat-Berodung",
    },
    descriptor: OPEN_SEAT_DESCRIPTOR,
  },
  {
    id: "philanthropy",
    sector: {
      en: "Corporate & Philanthropic Partners",
      fr: "Entreprises et mécénat",
      de: "Unternehmen & Philanthropie",
      lu: "Entreprisen & Philanthropie",
    },
    descriptor: OPEN_SEAT_DESCRIPTOR,
  },
  {
    id: "workplace-hr",
    sector: {
      en: "Workplace & People Leadership",
      fr: "Ressources humaines et employeurs",
      de: "Personalwesen & Arbeitgeber",
      lu: "Personalwiesen & Employeuren",
    },
    descriptor: OPEN_SEAT_DESCRIPTOR,
  },
];

export function localizeMemberCopy(lang: Lang, copy: LocalisedMemberCopy): string {
  return l(lang, copy.en, copy.fr, copy.de, copy.lu);
}

export function getRemainingArchetypeSlots(
  publishedCount: number = PUBLISHED_ASSOCIATE_MEMBERS.length,
): readonly CohortArchetypeSlot[] {
  const safeCount = Math.max(0, Math.min(publishedCount, COHORT_ARCHETYPE_SLOTS.length));
  return COHORT_ARCHETYPE_SLOTS.slice(safeCount);
}

function isAllowedHandleChar(code: number): boolean {
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
  if (sub.length < 2 || sub.length > 3) return false;
  for (let i = 0; i < sub.length; i++) {
    const c = sub.charCodeAt(i);
    if (c < 97 || c > 122) return false;
  }
  return true;
}

const ALLOWED_LINKEDIN_SECTIONS = new Set(["in", "company", "school"]);

/**
 * Linear, non-backtracking validator and normalizer for LinkedIn personal (/in/)
 * and organization (/company/, /school/) URLs.
 * Strips tracking query strings/fragments into canonical https://www.linkedin.com/<kind>/<handle>.
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
  if (segments.length !== 2) return null;

  const section = segments[0].toLowerCase();
  if (!ALLOWED_LINKEDIN_SECTIONS.has(section)) return null;

  const handle = segments[1];
  const minLen = section === "in" ? 3 : 2;
  if (handle.length < minLen || handle.length > 100) return null;
  if (handle === "." || handle === "..") return null;

  for (let i = 0; i < handle.length; i++) {
    const code = handle.charCodeAt(i);
    if (code <= 32 || !isAllowedHandleChar(code)) {
      return null;
    }
  }

  return `https://www.linkedin.com/${section}/${handle}`;
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
