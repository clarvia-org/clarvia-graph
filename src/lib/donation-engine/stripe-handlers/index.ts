import type { HandlerContext, HandlerResult, StripeEventHandler } from "./types";
import {
  handleCheckoutSessionAsyncPaymentFailed,
  handleCheckoutSessionAsyncPaymentSucceeded,
  handleCheckoutSessionCompleted,
} from "./handlers/checkout-session";
import {
  handleCustomerSubscriptionCreated,
  handleCustomerSubscriptionDeleted,
  handleCustomerSubscriptionUpdated,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
} from "./handlers/subscription-invoice";
import {
  handleChargeDisputeCreated,
  handleChargeRefunded,
  handlePaymentIntentPaymentFailed,
} from "./handlers/charge-payment";

const HANDLERS: Record<string, StripeEventHandler> = {
  "checkout.session.completed": handleCheckoutSessionCompleted,
  "checkout.session.async_payment_succeeded":
    handleCheckoutSessionAsyncPaymentSucceeded,
  "checkout.session.async_payment_failed":
    handleCheckoutSessionAsyncPaymentFailed,
  "invoice.payment_succeeded": handleInvoicePaymentSucceeded,
  "customer.subscription.created": handleCustomerSubscriptionCreated,
  "customer.subscription.updated": handleCustomerSubscriptionUpdated,
  "customer.subscription.deleted": handleCustomerSubscriptionDeleted,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "charge.refunded": handleChargeRefunded,
  "charge.dispute.created": handleChargeDisputeCreated,
  "payment_intent.payment_failed": handlePaymentIntentPaymentFailed,
};

export function getStripeEventHandler(
  eventType: string,
): StripeEventHandler | null {
  return HANDLERS[eventType] ?? null;
}

export async function dispatchStripeEvent(
  ctx: HandlerContext,
): Promise<HandlerResult> {
  const handler = getStripeEventHandler(ctx.stripeEvent.type);
  if (!handler) {
    return {
      outcome: "ignored",
      reason: `unsupported_event_type:${ctx.stripeEvent.type}`,
    };
  }
  return handler(ctx);
}

export { HANDLERS };
