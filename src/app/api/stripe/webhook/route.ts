/**
 * Stripe webhook ingress route — durable inbox/outbox pattern.
 *
 * Replaces the previous JSON-file handler with a PostgreSQL-backed
 * durable ingestion route per blueprint §5.1–5.2.
 *
 * Behaviour:
 *   1. Read raw body and verify Stripe signature.
 *   2. Single DB transaction: insert webhook_events, webhook_processing,
 *      and automation_jobs.
 *   3. Return 200 only after commit.
 *   4. Use after() for best-effort n8n kick.
 *
 * Response codes (§5.1):
 *   - 400: Missing or invalid signature
 *   - 200: Valid event committed (new or duplicate)
 *   - 500: Database unavailable or transaction failure
 *   - 503: Stripe not configured
 *
 * n8n availability must never influence whether Stripe receives a
 * success response.
 */

import { after, NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/donation-engine/db";
import { ingestWebhookEvent } from "@/lib/donation-engine/webhook-inbox";
import { kickAutomation } from "@/lib/donation-engine/job-queue";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Webhook unavailable" },
      { status: 503 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  const signatureHash = createHash("sha256")
    .update(signature)
    .digest("hex");

  try {
    const result = await db.transaction(async (tx) => {
      return ingestWebhookEvent(tx, {
        provider: "stripe",
        externalEventId: event.id,
        eventType: event.type,
        apiVersion: event.api_version ?? null,
        livemode: event.livemode ?? null,
        occurredAt: event.created ?? null,
        signatureMetadata: {
          signature_header_sha256: signatureHash,
        },
        rawBody,
        payload: event,
      });
    });

    if (result.jobId) {
      after(async () => {
        await kickAutomation(result.jobId).catch(() => undefined);
      });
    }

    return NextResponse.json({
      received: true,
      duplicate: result.duplicate,
    });
  } catch (error) {
    // Log the error for operational visibility but do not leak internals.
    console.error("[stripe-webhook] Durable ingestion failed:", error);
    return NextResponse.json(
      { error: "Durable ingestion failed" },
      { status: 500 },
    );
  }
}
