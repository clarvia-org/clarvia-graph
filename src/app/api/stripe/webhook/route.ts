import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events and verifies their signatures.
 * Currently logs events for monitoring; GA4 Measurement Protocol
 * integration will be added in a follow-up PR.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 503 }
    );
  }

  // Stripe requires the raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 }
    );
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationType = session.metadata?.donation_type || "unknown";
      const amount = session.amount_total
        ? (session.amount_total / 100).toFixed(2)
        : "unknown";
      console.log(
        `[webhook] checkout.session.completed: ${donationType} donation of €${amount}` +
          ` (customer: ${session.customer}, session: ${session.id})`
      );
      // TODO: Fire GA4 donation_completed / monthly_started via Measurement Protocol
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        `[webhook] customer.subscription.created: ${subscription.id}` +
          ` (customer: ${subscription.customer}, status: ${subscription.status})`
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        `[webhook] customer.subscription.deleted: ${subscription.id}` +
          ` (customer: ${subscription.customer})`
      );
      break;
    }

    default:
      console.log(`[webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
