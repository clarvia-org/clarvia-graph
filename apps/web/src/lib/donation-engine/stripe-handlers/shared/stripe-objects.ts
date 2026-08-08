import type Stripe from "stripe";

type InvoiceWithLegacyRefs = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription;
  charge?: string | Stripe.Charge;
  payment_intent?: string | Stripe.PaymentIntent;
};

export function subscriptionPeriodBounds(subscription: Stripe.Subscription): {
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
} {
  const item = subscription.items?.data?.[0];
  return {
    currentPeriodStart: item?.current_period_start ?? null,
    currentPeriodEnd: item?.current_period_end ?? null,
  };
}

export function invoiceSubscriptionId(
  invoice: Stripe.Invoice,
): string | null {
  const legacy = (invoice as InvoiceWithLegacyRefs).subscription;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object") return legacy.id;

  const parentSub = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSub === "string") return parentSub;
  if (parentSub && typeof parentSub === "object") return parentSub.id;

  return null;
}

export function invoiceChargeId(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as InvoiceWithLegacyRefs).charge;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object") return legacy.id;
  return null;
}

export function invoicePaymentIntentId(
  invoice: Stripe.Invoice,
): string | null {
  const legacy = (invoice as InvoiceWithLegacyRefs).payment_intent;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object") return legacy.id;
  return null;
}
