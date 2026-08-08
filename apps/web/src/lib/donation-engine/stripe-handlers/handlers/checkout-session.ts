import type Stripe from "stripe";
import type { HandlerContext, HandlerResult } from "../types";
import {
  appendDonationEvent,
  donatedAtFromUnix,
  metadataDonationType,
  minorFromStripeAmount,
  normalizeLocale,
  touchContactDonationTimestamps,
  upsertCheckoutSession,
  upsertContact,
  upsertDonation,
  upsertRecurringCommitment,
  upsertStripeCustomer,
} from "../shared/domain";
import { subscriptionPeriodBounds } from "../shared/stripe-objects";

async function resolveCheckoutSession(
  ctx: HandlerContext,
  sessionInput: Stripe.Checkout.Session,
): Promise<Stripe.Checkout.Session> {
  if (
    sessionInput.customer &&
    (sessionInput.payment_intent || sessionInput.subscription)
  ) {
    return sessionInput;
  }

  return ctx.stripe.checkout.sessions.retrieve(sessionInput.id, {
    expand: ["customer", "payment_intent", "subscription"],
  });
}

function sessionEmail(session: Stripe.Checkout.Session): string | null {
  return (
    session.customer_details?.email ??
    session.customer_email ??
    null
  );
}

function sessionCustomerId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.customer === "string") return session.customer;
  return session.customer?.id ?? null;
}

function sessionPaymentIntentId(
  session: Stripe.Checkout.Session,
): string | null {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }
  return session.payment_intent?.id ?? null;
}

function sessionSubscriptionId(
  session: Stripe.Checkout.Session,
): string | null {
  if (typeof session.subscription === "string") {
    return session.subscription;
  }
  return session.subscription?.id ?? null;
}

export async function processCheckoutSession(
  ctx: HandlerContext,
  sessionInput: Stripe.Checkout.Session,
  opts: { createDonation: boolean },
): Promise<HandlerResult> {
  const session = await resolveCheckoutSession(ctx, sessionInput);
  const email = sessionEmail(session);
  const stripeCustomerId = sessionCustomerId(session);
  const livemode = session.livemode ?? ctx.webhookEvent.livemode ?? false;
  const donatedAt = donatedAtFromUnix(session.created);
  const donationType =
    metadataDonationType(session.metadata) ??
    (session.mode === "subscription" ? "monthly" : "onetime");

  const contactId = await upsertContact(ctx.tx, {
    email,
    displayName: session.customer_details?.name ?? null,
    preferredLocale: normalizeLocale(session.locale ?? undefined),
  });

  if (contactId && stripeCustomerId) {
    await upsertStripeCustomer(ctx.tx, {
      contactId,
      stripeCustomerId,
      livemode,
      emailSnapshot: email,
    });
  }

  await upsertCheckoutSession(ctx.tx, {
    stripeSessionId: session.id,
    contactId,
    stripeCustomerId,
    stripePaymentIntentId: sessionPaymentIntentId(session),
    stripeSubscriptionId: sessionSubscriptionId(session),
    mode: session.mode as "payment" | "subscription" | "setup",
    donationType,
    paymentStatus: session.payment_status ?? null,
    sessionStatus: session.status ?? null,
    amountTotalMinor: minorFromStripeAmount(session.amount_total),
    currency: session.currency ?? null,
    marketingOptIn: session.metadata?.marketing_opt_in === "true",
    consentTextVersion:
      typeof session.metadata?.consent_text_version === "string"
        ? session.metadata.consent_text_version
        : null,
    locale: normalizeLocale(session.locale ?? undefined),
    landingVariant:
      typeof session.metadata?.landing_variant === "string"
        ? session.metadata.landing_variant
        : null,
    attribution: {
      ...(session.metadata ?? {}),
    },
    sourceWebhookEventId: ctx.webhookEvent.id,
    completedAt:
      session.status === "complete" ? donatedAt : null,
  });

  if (session.mode === "subscription" && contactId && stripeCustomerId) {
    const subscriptionId = sessionSubscriptionId(session);
    if (subscriptionId) {
      let subscription: Stripe.Subscription;
      if (typeof session.subscription === "object" && session.subscription) {
        subscription = session.subscription;
      } else {
        subscription = await ctx.stripe.subscriptions.retrieve(subscriptionId);
      }

      const item = subscription.items.data[0];
      const period = subscriptionPeriodBounds(subscription);
      await upsertRecurringCommitment(ctx.tx, {
        contactId,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        amountMinor: item?.price?.unit_amount ?? null,
        currency: item?.price?.currency ?? session.currency ?? null,
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
    }
  }

  const shouldCreateDonation =
    opts.createDonation &&
    session.mode === "payment" &&
    session.payment_status === "paid" &&
    session.amount_total != null &&
    session.currency;

  if (shouldCreateDonation) {
    const donationId = await upsertDonation(ctx.tx, {
      contactId,
      donationKind: "one_time",
      status: "succeeded",
      currency: session.currency!,
      amountGrossMinor: session.amount_total!,
      donatedAt,
      stripeCustomerId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: sessionPaymentIntentId(session),
      sourceWebhookEventId: ctx.webhookEvent.id,
      metadata: session.metadata ?? {},
    });

    if (contactId) {
      await touchContactDonationTimestamps(ctx.tx, contactId, donatedAt);
    }

    await appendDonationEvent(ctx.tx, {
      donationId,
      sourceWebhookEventId: ctx.webhookEvent.id,
      eventType: "donation.succeeded",
      providerObjectType: "checkout.session",
      providerObjectId: session.id,
      occurredAt: donatedAt,
      details: { mode: session.mode },
    });
  }

  return { outcome: "processed" };
}

export async function handleCheckoutSessionCompleted(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const session = ctx.stripeEvent.data.object as Stripe.Checkout.Session;
  return processCheckoutSession(ctx, session, {
    createDonation: true,
  });
}

export async function handleCheckoutSessionAsyncPaymentSucceeded(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const session = ctx.stripeEvent.data.object as Stripe.Checkout.Session;
  return processCheckoutSession(ctx, session, {
    createDonation: true,
  });
}

export async function handleCheckoutSessionAsyncPaymentFailed(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const session = ctx.stripeEvent.data.object as Stripe.Checkout.Session;
  const donatedAt = donatedAtFromUnix(session.created);

  await upsertCheckoutSession(ctx.tx, {
    stripeSessionId: session.id,
    mode: session.mode as "payment" | "subscription" | "setup",
    donationType: metadataDonationType(session.metadata),
    paymentStatus: session.payment_status ?? "unpaid",
    sessionStatus: session.status ?? null,
    amountTotalMinor: minorFromStripeAmount(session.amount_total),
    currency: session.currency ?? null,
    sourceWebhookEventId: ctx.webhookEvent.id,
  });

  await appendDonationEvent(ctx.tx, {
    sourceWebhookEventId: ctx.webhookEvent.id,
    eventType: "checkout.async_payment_failed",
    providerObjectType: "checkout.session",
    providerObjectId: session.id,
    occurredAt: donatedAt,
    details: { payment_status: session.payment_status },
  });

  return { outcome: "processed" };
}
