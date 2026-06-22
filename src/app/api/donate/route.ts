import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * POST /api/donate
 *
 * Creates a Stripe Checkout Session for a one-time or monthly donation.
 *
 * Body: { amount: number, type: "monthly" | "onetime", lang?: string }
 * - amount in EUR (integer, e.g. 25 for €25)
 * - type determines whether to create a subscription or one-time payment
 * - lang for redirect URL language prefix (defaults to "en")
 *
 * Returns: { url: string } - the Stripe Checkout URL to redirect the donor to.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please try bank transfer." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);

  let body: { amount?: number; type?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = body.amount;
  const type = body.type === "monthly" ? "monthly" : "onetime";
  const lang = body.lang || "en";

  if (!amount || typeof amount !== "number" || amount < 1 || amount > 100000) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const amountCents = Math.round(amount * 100);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://clarvia.org";
  const successUrl = `${baseUrl}/${lang}/support?donated=true`;
  const cancelUrl = `${baseUrl}/${lang}/support`;

  try {
    if (type === "monthly") {
      // Subscription via Checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              recurring: { interval: "month" },
              product_data: {
                name: "Monthly donation to Clarvia ASBL",
                description: `€${amount}/month - supporting free bereavement guidance infrastructure`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return NextResponse.json({ url: session.url });
    } else {
      // One-time payment via Checkout
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Donation to Clarvia ASBL",
                description: `€${amount} one-time donation - supporting free bereavement guidance infrastructure`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        submit_type: "donate",
      });
      return NextResponse.json({ url: session.url });
    }
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    return NextResponse.json(
      { error: "Could not create payment session. Please try bank transfer." },
      { status: 500 }
    );
  }
}
