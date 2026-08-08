import type Stripe from "stripe";
import type { HandlerContext, HandlerResult } from "../types";
import {
  appendDonationEvent,
  donatedAtFromUnix,
  normalizeLocale,
  touchContactDonationTimestamps,
  upsertContact,
  upsertDonation,
  upsertRecurringCommitment,
  upsertStripeCustomer,
} from "../shared/domain";
import {
  invoiceChargeId,
  invoicePaymentIntentId,
  invoiceSubscriptionId,
  subscriptionPeriodBounds,
} from "../shared/stripe-objects";

async function resolveSubscription(
  ctx: HandlerContext,
  subscriptionInput: Stripe.Subscription,
): Promise<Stripe.Subscription> {
  if (subscriptionInput.items?.data?.length) {
    return subscriptionInput;
  }
  return ctx.stripe.subscriptions.retrieve(subscriptionInput.id, {
    expand: ["items.data.price"],
  });
}

export async function upsertSubscriptionCommitment(
  ctx: HandlerContext,
  subscriptionInput: Stripe.Subscription,
): Promise<{ contactId: string; commitmentId: string }> {
  const subscription = await resolveSubscription(ctx, subscriptionInput);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const customer = await ctx.stripe.customers.retrieve(customerId);
  const email =
    !("deleted" in customer && customer.deleted)
      ? (customer.email ?? null)
      : null;

  const contactId = await upsertContact(ctx.tx, {
    email,
    displayName:
      !("deleted" in customer && customer.deleted)
        ? (customer.name ?? null)
        : null,
    preferredLocale: normalizeLocale(
      !("deleted" in customer && customer.deleted)
        ? (customer.preferred_locales?.[0] ?? undefined)
        : undefined,
    ),
  });

  if (!contactId) {
    throw new Error("Subscription requires a contact with email");
  }

  await upsertStripeCustomer(ctx.tx, {
    contactId,
    stripeCustomerId: customerId,
    livemode: subscription.livemode,
    emailSnapshot: email,
  });

  const item = subscription.items.data[0];
  const period = subscriptionPeriodBounds(subscription);
  const commitmentId = await upsertRecurringCommitment(ctx.tx, {
    contactId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    amountMinor: item?.price?.unit_amount ?? null,
    currency: item?.price?.currency ?? null,
    intervalName: item?.price?.recurring?.interval ?? null,
    intervalCount: item?.price?.recurring?.interval_count ?? null,
    currentPeriodStart: donatedAtFromUnix(period.currentPeriodStart),
    currentPeriodEnd: donatedAtFromUnix(period.currentPeriodEnd),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    cancelAt: subscription.cancel_at
      ? donatedAtFromUnix(subscription.cancel_at)
      : null,
    canceledAt: subscription.canceled_at
      ? donatedAtFromUnix(subscription.canceled_at)
      : null,
    endedAt: subscription.ended_at
      ? donatedAtFromUnix(subscription.ended_at)
      : null,
    metadata: subscription.metadata ?? {},
    sourceWebhookEventId: ctx.webhookEvent.id,
  });

  return { contactId, commitmentId };
}

export async function handleCustomerSubscriptionCreated(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const subscription = ctx.stripeEvent.data.object as Stripe.Subscription;
  await upsertSubscriptionCommitment(ctx, subscription);
  return { outcome: "processed" };
}

export async function handleCustomerSubscriptionUpdated(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const subscription = ctx.stripeEvent.data.object as Stripe.Subscription;
  await upsertSubscriptionCommitment(ctx, subscription);
  return { outcome: "processed" };
}

export async function handleCustomerSubscriptionDeleted(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const subscription = ctx.stripeEvent.data.object as Stripe.Subscription;
  const { commitmentId } = await upsertSubscriptionCommitment(
    ctx,
    subscription,
  );

  await ctx.tx.none(
    `
    UPDATE clarvia.recurring_commitments
    SET status = 'canceled',
        ended_at = COALESCE(ended_at, now()),
        canceled_at = COALESCE(canceled_at, now()),
        updated_at = now()
    WHERE id = $1
    `,
    [commitmentId],
  );

  return { outcome: "processed" };
}

export async function handleInvoicePaymentSucceeded(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const invoice = ctx.stripeEvent.data
    .object as Stripe.Invoice;
  const donatedAt = donatedAtFromUnix(
    invoice.status_transitions?.paid_at ?? invoice.created,
  );

  if (!invoice.id || !invoice.currency || invoice.amount_paid == null) {
    return { outcome: "ignored", reason: "invoice_missing_payment_fields" };
  }

  const subscriptionId = invoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return { outcome: "ignored", reason: "invoice_without_subscription" };
  }

  const subscription = await ctx.stripe.subscriptions.retrieve(subscriptionId);
  const { contactId, commitmentId } = await upsertSubscriptionCommitment(
    ctx,
    subscription,
  );

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  const chargeId = invoiceChargeId(invoice);
  const paymentIntentId = invoicePaymentIntentId(invoice);

  const donationId = await upsertDonation(ctx.tx, {
    contactId,
    recurringCommitmentId: commitmentId,
    donationKind: "recurring_payment",
    status: "succeeded",
    currency: invoice.currency,
    amountGrossMinor: invoice.amount_paid,
    donatedAt,
    stripeCustomerId: customerId,
    stripePaymentIntentId: paymentIntentId,
    stripeChargeId: chargeId,
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subscriptionId,
    sourceWebhookEventId: ctx.webhookEvent.id,
    metadata: {
      billing_reason: invoice.billing_reason,
    },
  });

  await touchContactDonationTimestamps(ctx.tx, contactId, donatedAt);

  await appendDonationEvent(ctx.tx, {
    donationId,
    sourceWebhookEventId: ctx.webhookEvent.id,
    eventType: "donation.succeeded",
    providerObjectType: "invoice",
    providerObjectId: invoice.id,
    occurredAt: donatedAt,
    details: { billing_reason: invoice.billing_reason },
  });

  return { outcome: "processed" };
}

export async function handleInvoicePaymentFailed(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const invoice = ctx.stripeEvent.data.object as Stripe.Invoice;
  const occurredAt = donatedAtFromUnix(invoice.created);

  const subscriptionId = invoiceSubscriptionId(invoice);

  if (subscriptionId) {
    const subscription =
      await ctx.stripe.subscriptions.retrieve(subscriptionId);
    await upsertSubscriptionCommitment(ctx, subscription);
  }

  await appendDonationEvent(ctx.tx, {
    sourceWebhookEventId: ctx.webhookEvent.id,
    eventType: "invoice.payment_failed",
    providerObjectType: "invoice",
    providerObjectId: invoice.id,
    occurredAt,
    details: {
      subscription_id: subscriptionId,
      attempt_count: invoice.attempt_count,
    },
  });

  return { outcome: "processed" };
}
