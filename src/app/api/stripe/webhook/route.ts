import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), ".data");
const DONATIONS_FILE = path.join(DATA_DIR, "donations.json");

interface DonationRecord {
  date: string;
  email: string;
  amount: number;
  currency: string;
  type: "onetime" | "monthly" | "recurring_charge";
  stripe_session?: string;
  stripe_customer: string;
  stripe_invoice?: string;
}

async function saveDonation(record: DonationRecord): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  let entries: DonationRecord[] = [];
  try {
    const raw = await fs.readFile(DONATIONS_FILE, "utf-8");
    entries = JSON.parse(raw);
  } catch {
    /* file doesn't exist yet */
  }

  entries.push(record);
  await fs.writeFile(DONATIONS_FILE, JSON.stringify(entries, null, 2));
}

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events, verifies signatures, and records donations.
 *
 * Handled events:
 * - checkout.session.completed: Initial one-time or first monthly payment
 * - invoice.payment_succeeded: Subsequent recurring monthly charges
 * - customer.subscription.created / deleted: Logged for monitoring
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
        ? session.amount_total / 100
        : 0;
      const email = session.customer_details?.email || "";

      console.log(
        `[webhook] checkout.session.completed: ${donationType} donation of €${amount.toFixed(2)}` +
          ` (customer: ${session.customer}, email: ${email}, session: ${session.id})`
      );

      try {
        await saveDonation({
          date: new Date().toISOString(),
          email,
          amount,
          currency: session.currency || "eur",
          type: donationType === "monthly" ? "monthly" : "onetime",
          stripe_session: session.id,
          stripe_customer: String(session.customer || ""),
        });
        console.log(`[webhook] Donation record saved for ${email}`);
      } catch (err) {
        console.error("[webhook] Failed to save donation record:", err);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // Only record subscription invoices (recurring charges), not the first one
      // which is already captured by checkout.session.completed
      if (invoice.billing_reason === "subscription_cycle") {
        const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
        const email = invoice.customer_email || "";

        console.log(
          `[webhook] invoice.payment_succeeded: recurring charge of €${amount.toFixed(2)}` +
            ` (customer: ${invoice.customer}, email: ${email}, invoice: ${invoice.id})`
        );

        try {
          await saveDonation({
            date: new Date().toISOString(),
            email,
            amount,
            currency: invoice.currency || "eur",
            type: "recurring_charge",
            stripe_customer: String(invoice.customer || ""),
            stripe_invoice: invoice.id,
          });
          console.log(`[webhook] Recurring donation record saved for ${email}`);
        } catch (err) {
          console.error("[webhook] Failed to save recurring donation record:", err);
        }
      }
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
