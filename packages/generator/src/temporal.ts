/**
 * Temporal filtering utility for graph records.
 * Compares record validity against asOfDate and legal effectiveness against eventDate.
 */

export interface TemporalContext {
  asOfDate: string;
  eventDate: string;
}

export function recordApplies(record: Record<string, unknown>, ctx: TemporalContext): boolean {
  if (!record || typeof record !== "object") return true;

  // 1. Record validity check (against asOfDate)
  if (record.record_valid_from !== undefined && record.record_valid_from !== null) {
    if (String(record.record_valid_from) > ctx.asOfDate) {
      return false;
    }
  }
  if (record.record_valid_to !== undefined && record.record_valid_to !== null) {
    if (String(record.record_valid_to) <= ctx.asOfDate) {
      return false;
    }
  }

  // 2. Legal effectiveness check (against eventDate)
  if (record.legal_effective_from !== undefined && record.legal_effective_from !== null) {
    if (String(record.legal_effective_from) > ctx.eventDate) {
      return false;
    }
  }
  if (record.legal_effective_to !== undefined && record.legal_effective_to !== null) {
    if (String(record.legal_effective_to) <= ctx.eventDate) {
      return false;
    }
  }

  return true;
}
