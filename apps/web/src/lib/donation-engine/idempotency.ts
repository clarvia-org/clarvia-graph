/**
 * Side-effect idempotency helpers.
 *
 * Uses the clarvia.side_effects table for Layer 3 idempotency (blueprint §6.3).
 * Semantic key patterns:
 *   donation:{donation_id}:nurture-enrol:v1
 *   email:{email_message_id}:resend-send:v1
 *   reconciliation:{run_id}:{stripe_object_id}:repair:v1
 */

import type { TransactionClient } from "./db";

// ---------------------------------------------------------------------------
// Semantic key generators
// ---------------------------------------------------------------------------

export function donationNurtureEnrolKey(donationId: string): string {
  return `donation:${donationId}:nurture-enrol:v1`;
}

export function emailResendSendKey(emailMessageId: string): string {
  return `email:${emailMessageId}:resend-send:v1`;
}

export function reconciliationRepairKey(
  runId: string,
  stripeObjectId: string,
): string {
  return `reconciliation:${runId}:${stripeObjectId}:repair:v1`;
}

// ---------------------------------------------------------------------------
// Claim / Complete / Fail
// ---------------------------------------------------------------------------

export interface ClaimResult {
  /** True if a new side-effect record was created (proceed with work). */
  claimed: boolean;
  /** The current state of the side-effect record. */
  state: string;
}

/**
 * Claim a side-effect key. Returns { claimed: true } if the key was
 * newly inserted (caller should proceed). Returns { claimed: false }
 * if the key already exists (caller should skip).
 */
export async function claimSideEffect(
  tx: TransactionClient,
  opts: {
    idempotencyKey: string;
    actionType: string;
    aggregateType?: string;
    aggregateId?: string;
    sourceWebhookEventId?: string;
    requestSha256?: string;
  },
): Promise<ClaimResult> {
  // Try to insert; if already exists, return existing state.
  const existing = await tx.oneOrNone<{ state: string }>(
    `SELECT state FROM clarvia.side_effects WHERE idempotency_key = $1`,
    [opts.idempotencyKey],
  );

  if (existing) {
    return { claimed: false, state: existing.state };
  }

  await tx.none(
    `
    INSERT INTO clarvia.side_effects (
      idempotency_key,
      action_type,
      aggregate_type,
      aggregate_id,
      source_webhook_event_id,
      request_sha256
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      opts.idempotencyKey,
      opts.actionType,
      opts.aggregateType ?? null,
      opts.aggregateId ?? null,
      opts.sourceWebhookEventId ?? null,
      opts.requestSha256 ?? null,
    ],
  );

  return { claimed: true, state: "started" };
}

/**
 * Mark a side-effect as successfully completed.
 */
export async function completeSideEffect(
  tx: TransactionClient,
  idempotencyKey: string,
  opts?: {
    providerReference?: string;
    responseSummary?: Record<string, unknown>;
  },
): Promise<void> {
  await tx.none(
    `
    UPDATE clarvia.side_effects
    SET state = 'succeeded',
        completed_at = now(),
        provider_reference = $2,
        response_summary = COALESCE($3::jsonb, '{}'::jsonb)
    WHERE idempotency_key = $1
      AND state = 'started'
    `,
    [
      idempotencyKey,
      opts?.providerReference ?? null,
      opts?.responseSummary ? JSON.stringify(opts.responseSummary) : null,
    ],
  );
}

/**
 * Mark a side-effect as failed.
 */
export async function failSideEffect(
  tx: TransactionClient,
  idempotencyKey: string,
  opts: {
    permanent: boolean;
    errorCode?: string;
    errorMessage?: string;
  },
): Promise<void> {
  const nextState = opts.permanent
    ? "permanent_failure"
    : "retryable_failure";

  await tx.none(
    `
    UPDATE clarvia.side_effects
    SET state = $2,
        completed_at = now(),
        attempt_count = attempt_count + 1,
        last_error_code = $3,
        last_error_message = $4
    WHERE idempotency_key = $1
      AND state IN ('started', 'retryable_failure')
    `,
    [
      idempotencyKey,
      nextState,
      opts.errorCode ?? null,
      opts.errorMessage ?? null,
    ],
  );
}
