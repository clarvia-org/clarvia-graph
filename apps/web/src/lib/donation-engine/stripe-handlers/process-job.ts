/**
 * Stripe automation job processing — blueprint §6.4 domain transaction pattern.
 */

import type Stripe from "stripe";
import { db } from "../db";
import {
  completeAutomationJob,
  JobValidationError,
  loadLeasedJob,
  loadWebhookEvent,
  lockWebhookProcessing,
  markWebhookProcessing,
} from "../automation-job";
import { claimSideEffect, completeSideEffect } from "../idempotency";
import { dispatchStripeEvent } from "./index";
import type {
  HandlerPermanentError,
  ProcessStripeJobInput,
  ProcessStripeJobResult,
} from "./types";

function stripeProcessSideEffectKey(externalEventId: string): string {
  return `stripe:${externalEventId}:process:v1`;
}

function payloadToStripeEvent(
  payload: Record<string, unknown>,
): Stripe.Event {
  return payload as unknown as Stripe.Event;
}

export async function processStripeAutomationJob(
  input: ProcessStripeJobInput,
  stripe: Stripe,
): Promise<ProcessStripeJobResult> {
  return db.transaction(async (tx) => {
    const job = await loadLeasedJob(tx, input.jobId, input.worker);
    const webhookEvent = await loadWebhookEvent(tx, job.sourceWebhookEventId);
    const processing = await lockWebhookProcessing(
      tx,
      webhookEvent.id,
    );

    if (processing.state === "processed" || processing.state === "ignored") {
      await completeAutomationJob(tx, job.id, input.worker);
      return {
        status: "already_done",
        eventType: webhookEvent.eventType,
        processingState: processing.state,
      };
    }

    const sideEffectKey = stripeProcessSideEffectKey(
      webhookEvent.externalEventId,
    );
    const claim = await claimSideEffect(tx, {
      idempotencyKey: sideEffectKey,
      actionType: "stripe.event.process",
      aggregateType: "webhook_event",
      aggregateId: webhookEvent.id,
      sourceWebhookEventId: webhookEvent.id,
    });

    if (!claim.claimed && claim.state === "succeeded") {
      await markWebhookProcessing(tx, webhookEvent.id, "processed");
      await completeAutomationJob(tx, job.id, input.worker);
      return {
        status: "already_done",
        eventType: webhookEvent.eventType,
        processingState: "processed",
      };
    }

    const stripeEvent = payloadToStripeEvent(
      webhookEvent.payload as unknown as Record<string, unknown>,
    );

    const handlerResult = await dispatchStripeEvent({
      tx,
      stripe,
      webhookEvent,
      stripeEvent,
    });

    const processingState =
      handlerResult.outcome === "ignored" ? "ignored" : "processed";

    await markWebhookProcessing(tx, webhookEvent.id, processingState);
    await completeSideEffect(tx, sideEffectKey, {
      responseSummary: {
        event_type: webhookEvent.eventType,
        outcome: handlerResult.outcome,
      },
    });
    await completeAutomationJob(tx, job.id, input.worker);

    if (handlerResult.outcome === "ignored") {
      return {
        status: "ignored",
        eventType: webhookEvent.eventType,
        reason: handlerResult.reason,
      };
    }

    return {
      status: "processed",
      eventType: webhookEvent.eventType,
    };
  });
}

export { JobValidationError };
export type { HandlerPermanentError };
