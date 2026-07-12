import type Stripe from "stripe";
import type { TransactionClient } from "../db";
import type { WebhookEventRow } from "../automation-job";

export const SUPPORTED_STRIPE_EVENT_TYPES = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "invoice.payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "payment_intent.payment_failed",
] as const;

export type SupportedStripeEventType =
  (typeof SUPPORTED_STRIPE_EVENT_TYPES)[number];

export function isSupportedStripeEventType(
  eventType: string,
): eventType is SupportedStripeEventType {
  return (SUPPORTED_STRIPE_EVENT_TYPES as readonly string[]).includes(
    eventType,
  );
}

export interface HandlerContext {
  tx: TransactionClient;
  stripe: Stripe;
  webhookEvent: WebhookEventRow;
  stripeEvent: Stripe.Event;
}

export type HandlerResult =
  | { outcome: "processed" }
  | { outcome: "ignored"; reason: string };

export type StripeEventHandler = (
  ctx: HandlerContext,
) => Promise<HandlerResult>;

export interface ProcessStripeJobInput {
  jobId: string;
  worker: string;
}

export type ProcessStripeJobResult =
  | { status: "processed"; eventType: string }
  | { status: "ignored"; eventType: string; reason: string }
  | { status: "already_done"; eventType: string; processingState: string };

export class HandlerPermanentError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "HandlerPermanentError";
  }
}
