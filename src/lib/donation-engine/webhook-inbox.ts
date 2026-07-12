/**
 * Webhook inbox — durable ingestion for Stripe and Resend webhooks.
 *
 * Implements the single-transaction pattern from blueprint §5.2:
 * INSERT webhook_events + webhook_processing + automation_jobs in one transaction.
 * Uses ON CONFLICT DO NOTHING for duplicate delivery detection.
 */

import { createHash } from "node:crypto";
import type { TransactionClient } from "./db";

export interface WebhookIngestionParams {
  provider: "stripe" | "resend";
  externalEventId: string;
  eventType: string;
  apiVersion: string | null;
  livemode: boolean | null;
  occurredAt: number | null; // Unix timestamp
  signatureMetadata: Record<string, string>;
  rawBody: string;
  payload: unknown;
}

export interface WebhookIngestionResult {
  duplicate: boolean;
  jobId: string | null;
}

/**
 * Ingest a webhook event in a single database transaction.
 *
 * Must be called inside a `db.transaction()` — the caller provides
 * the transaction client.
 *
 * Returns whether the event was a duplicate and the automation job ID
 * (null if duplicate).
 */
export async function ingestWebhookEvent(
  tx: TransactionClient,
  params: WebhookIngestionParams,
): Promise<WebhookIngestionResult> {
  const payloadHash = createHash("sha256")
    .update(params.rawBody)
    .digest("hex");

  // 1. Insert webhook event (ON CONFLICT DO NOTHING for duplicate detection)
  const inserted = await tx.oneOrNone<{ event_id: string }>(
    `
    INSERT INTO clarvia.webhook_events (
      provider,
      external_event_id,
      event_type,
      api_version,
      livemode,
      occurred_at,
      signature_metadata,
      payload,
      payload_sha256
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      to_timestamp($6),
      $7::jsonb,
      $8::jsonb,
      $9
    )
    ON CONFLICT (provider, external_event_id)
    DO NOTHING
    RETURNING id AS event_id
    `,
    [
      params.provider,
      params.externalEventId,
      params.eventType,
      params.apiVersion,
      params.livemode,
      params.occurredAt,
      JSON.stringify(params.signatureMetadata),
      params.rawBody,
      payloadHash,
    ],
  );

  if (!inserted) {
    return { duplicate: true, jobId: null };
  }

  // 2. Insert webhook processing record
  await tx.none(
    `
    INSERT INTO clarvia.webhook_processing (
      webhook_event_id
    )
    VALUES ($1)
    `,
    [inserted.event_id],
  );

  // 3. Insert automation job
  const job = await tx.one<{ id: string }>(
    `
    INSERT INTO clarvia.automation_jobs (
      topic,
      dedupe_key,
      source_webhook_event_id,
      payload
    )
    VALUES (
      $1,
      $2,
      $3,
      jsonb_build_object('webhook_event_id', $3)
    )
    RETURNING id
    `,
    [
      `${params.provider}.event.process`,
      `${params.provider}:${params.externalEventId}:process:v1`,
      inserted.event_id,
    ],
  );

  return { duplicate: false, jobId: job.id };
}
