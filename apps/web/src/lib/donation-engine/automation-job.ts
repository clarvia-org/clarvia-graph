/**
 * Automation job loading and lease verification for internal API calls.
 *
 * Per blueprint §5.3: accept job ID only; verify the job is currently leased.
 */

import type { TransactionClient } from "./db";

export const STRIPE_PROCESS_TOPIC = "stripe.event.process";

export interface LeasedAutomationJob {
  id: string;
  topic: string;
  state: string;
  lockedBy: string;
  sourceWebhookEventId: string;
}

export interface WebhookProcessingRow {
  webhookEventId: string;
  state: string;
}

export interface WebhookEventRow {
  id: string;
  externalEventId: string;
  eventType: string;
  livemode: boolean | null;
  occurredAt: Date | null;
  payload: StripeWebhookPayload;
}

/** Parsed Stripe event stored in webhook_events.payload (jsonb). */
export interface StripeWebhookPayload {
  id: string;
  type: string;
  created?: number;
  livemode?: boolean;
  data: {
    object: Record<string, unknown>;
  };
}

export class JobValidationError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = "JobValidationError";
  }
}

/**
 * Load and lock an automation job inside an existing transaction.
 * Throws JobValidationError when the job cannot be processed.
 */
export async function loadLeasedJob(
  tx: TransactionClient,
  jobId: string,
  worker: string,
): Promise<LeasedAutomationJob> {
  const job = await tx.oneOrNone<{
    id: string;
    topic: string;
    state: string;
    locked_by: string | null;
    source_webhook_event_id: string | null;
  }>(
    `
    SELECT id, topic, state, locked_by, source_webhook_event_id
    FROM clarvia.automation_jobs
    WHERE id = $1
    FOR UPDATE
    `,
    [jobId],
  );

  if (!job) {
    throw new JobValidationError("Job not found", "job_not_found", 404);
  }

  if (job.topic !== STRIPE_PROCESS_TOPIC) {
    throw new JobValidationError(
      "Job topic is not stripe.event.process",
      "invalid_topic",
      422,
    );
  }

  if (job.state !== "leased") {
    throw new JobValidationError(
      "Job is not in leased state",
      "job_not_leased",
      409,
    );
  }

  if (job.locked_by !== worker) {
    throw new JobValidationError(
      "Job is not leased by this worker",
      "worker_mismatch",
      409,
    );
  }

  if (!job.source_webhook_event_id) {
    throw new JobValidationError(
      "Job has no linked webhook event",
      "missing_source_event",
      422,
    );
  }

  return {
    id: job.id,
    topic: job.topic,
    state: job.state,
    lockedBy: job.locked_by!,
    sourceWebhookEventId: job.source_webhook_event_id,
  };
}

export async function loadWebhookEvent(
  tx: TransactionClient,
  webhookEventId: string,
): Promise<WebhookEventRow> {
  const row = await tx.oneOrNone<{
    id: string;
    external_event_id: string;
    event_type: string;
    livemode: boolean | null;
    occurred_at: Date | null;
    payload: StripeWebhookPayload;
  }>(
    `
    SELECT id, external_event_id, event_type, livemode, occurred_at, payload
    FROM clarvia.webhook_events
    WHERE id = $1
    `,
    [webhookEventId],
  );

  if (!row) {
    throw new JobValidationError(
      "Webhook event not found",
      "webhook_event_not_found",
      422,
    );
  }

  return {
    id: row.id,
    externalEventId: row.external_event_id,
    eventType: row.event_type,
    livemode: row.livemode,
    occurredAt: row.occurred_at,
    payload: row.payload,
  };
}

export async function lockWebhookProcessing(
  tx: TransactionClient,
  webhookEventId: string,
): Promise<WebhookProcessingRow> {
  const row = await tx.oneOrNone<{ webhook_event_id: string; state: string }>(
    `
    SELECT webhook_event_id, state
    FROM clarvia.webhook_processing
    WHERE webhook_event_id = $1
    FOR UPDATE
    `,
    [webhookEventId],
  );

  if (!row) {
    throw new JobValidationError(
      "Webhook processing record not found",
      "webhook_processing_not_found",
      422,
    );
  }

  return {
    webhookEventId: row.webhook_event_id,
    state: row.state,
  };
}

export async function markWebhookProcessing(
  tx: TransactionClient,
  webhookEventId: string,
  state: "processed" | "ignored",
): Promise<void> {
  await tx.none(
    `
    UPDATE clarvia.webhook_processing
    SET state = $2,
        processed_at = now(),
        updated_at = now()
    WHERE webhook_event_id = $1
    `,
    [webhookEventId, state],
  );
}

export async function completeAutomationJob(
  tx: TransactionClient,
  jobId: string,
  worker: string,
): Promise<void> {
  await tx.none(`SELECT clarvia.complete_automation_job($1, $2)`, [
    jobId,
    worker,
  ]);
}
