import type Stripe from "stripe";
import type { HandlerContext, HandlerResult } from "../types";
import {
  appendDonationEvent,
  donatedAtFromUnix,
  findDonationByStripeRefs,
  markDonationDisputed,
  updateDonationRefund,
} from "../shared/domain";

export async function handleChargeRefunded(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const charge = ctx.stripeEvent.data.object as Stripe.Charge;
  const occurredAt = donatedAtFromUnix(charge.created);

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;

  const donation = await findDonationByStripeRefs(ctx.tx, {
    chargeId: charge.id,
    paymentIntentId,
  });

  if (!donation) {
    return { outcome: "ignored", reason: "donation_not_found_for_refund" };
  }

  await updateDonationRefund(
    ctx.tx,
    donation.id,
    charge.amount_refunded,
    ctx.webhookEvent.id,
    occurredAt,
  );

  return { outcome: "processed" };
}

export async function handleChargeDisputeCreated(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const dispute = ctx.stripeEvent.data.object as Stripe.Dispute;
  const occurredAt = donatedAtFromUnix(dispute.created);

  const chargeId =
    typeof dispute.charge === "string"
      ? dispute.charge
      : dispute.charge?.id ?? null;

  const donation = await findDonationByStripeRefs(ctx.tx, {
    chargeId,
  });

  if (!donation) {
    return { outcome: "ignored", reason: "donation_not_found_for_dispute" };
  }

  await markDonationDisputed(
    ctx.tx,
    donation.id,
    ctx.webhookEvent.id,
    occurredAt,
    dispute.id,
  );

  return { outcome: "processed" };
}

export async function handlePaymentIntentPaymentFailed(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const paymentIntent = ctx.stripeEvent.data
    .object as Stripe.PaymentIntent;
  const occurredAt = donatedAtFromUnix(paymentIntent.created);

  await appendDonationEvent(ctx.tx, {
    sourceWebhookEventId: ctx.webhookEvent.id,
    eventType: "payment_intent.payment_failed",
    providerObjectType: "payment_intent",
    providerObjectId: paymentIntent.id,
    occurredAt,
    details: {
      last_payment_error: paymentIntent.last_payment_error?.code ?? null,
    },
  });

  return { outcome: "processed" };
}
