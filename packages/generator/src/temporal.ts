/**
 * Temporal filtering utility for graph records.
 * Compares record validity against asOfDate and legal effectiveness against eventDate.
 */

export interface TemporalContext {
  asOfDate: string;
  eventDate: string;
}

/** Returns true if `fieldValue` is after `referenceDate` (ISO string comparison). */
function isAfterDate(fieldValue: unknown, referenceDate: string): boolean {
  if (fieldValue === undefined || fieldValue === null) return false;
  return String(fieldValue) > referenceDate;
}

/** Returns true if `fieldValue` is on or before `referenceDate` (ISO string comparison). */
function isOnOrBeforeDate(fieldValue: unknown, referenceDate: string): boolean {
  if (fieldValue === undefined || fieldValue === null) return false;
  return String(fieldValue) <= referenceDate;
}

export function recordApplies(record: Record<string, unknown>, ctx: TemporalContext): boolean {
  if (!record || typeof record !== "object") return true;

  // 1. Record validity check (against asOfDate)
  if (isAfterDate(record.record_valid_from, ctx.asOfDate)) return false;
  if (isOnOrBeforeDate(record.record_valid_to, ctx.asOfDate)) return false;

  // 2. Legal effectiveness check (against eventDate)
  if (isAfterDate(record.legal_effective_from, ctx.eventDate)) return false;
  if (isOnOrBeforeDate(record.legal_effective_to, ctx.eventDate)) return false;

  return true;
}
