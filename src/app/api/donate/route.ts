import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

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
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please try bank transfer." },
      { status: 503 }
    );
  }

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

  // Map site language to Stripe Checkout locale
  const stripeLocale: Stripe.Checkout.SessionCreateParams["locale"] =
    lang === "fr" ? "fr" : lang === "de" ? "de" : "en";

  // Translated product names for Stripe Checkout line items
  const productName = type === "monthly"
    ? lang === "fr" ? "Don mensuel \u00e0 Clarvia ASBL"
      : lang === "de" ? "Monatliche Spende an Clarvia ASBL"
      : "Monthly donation to Clarvia ASBL"
    : lang === "fr" ? "Don \u00e0 Clarvia ASBL"
      : lang === "de" ? "Spende an Clarvia ASBL"
      : "Donation to Clarvia ASBL";

  const productDesc = type === "monthly"
    ? lang === "fr" ? `${amount} \u20AC/mois`
      : lang === "de" ? `${amount} \u20AC/Monat`
      : `\u20AC${amount}/month`
    : lang === "fr" ? `Don unique de ${amount} \u20AC`
      : lang === "de" ? `Einmalige Spende von ${amount} \u20AC`
      : `\u20AC${amount} one-time donation`;

  try {
    if (type === "monthly") {
      // Subscription via Checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        metadata: { donation_type: "monthly" },
        line_items: [
          {
            price_data: {
              currency: "eur",
              recurring: { interval: "month" },
              product_data: {
                name: productName,
                description: productDesc,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: stripeLocale,
      });
      if (!session.url) {
        console.error("Stripe session creation returned null URL for monthly donation.");
        return NextResponse.json(
          { error: "Could not create payment session. Please try bank transfer." },
          { status: 500 }
        );
      }
      return NextResponse.json({ url: session.url });
    } else {
      // One-time payment via Checkout
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_creation: "always",
        metadata: { donation_type: "onetime" },
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: productName,
                description: productDesc,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: stripeLocale,
        submit_type: "donate",
      });
      if (!session.url) {
        console.error("Stripe session creation returned null URL for one-time donation.");
        return NextResponse.json(
          { error: "Could not create payment session. Please try bank transfer." },
          { status: 500 }
        );
      }
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
