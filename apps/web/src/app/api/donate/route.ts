import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit("donate", 10, 60_000);

function getProductDescription(type: "monthly" | "onetime", lang: string, amount: number): string {
  if (type === "monthly") {
    if (lang === "fr" || lang === "lu") return `${amount} \u20AC/mois`;
    if (lang === "de") return `${amount} \u20AC/Monat`;
    return `\u20AC${amount}/month`;
  }
  if (lang === "fr" || lang === "lu") return `Don unique de ${amount} \u20AC`;
  if (lang === "de") return `Einmalige Spende von ${amount} \u20AC`;
  return `\u20AC${amount} one-time donation`;
}

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
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = limiter(ip);
  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: retryAfterMs
          ? { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) }
          : undefined,
      }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please try bank transfer." },
      { status: 503 }
    );
  }

  let body: {
    amount?: number;
    type?: string;
    lang?: string;
    marketingOptIn?: boolean;
    consentTextVersion?: string;
    landingVariant?: string;
    attribution?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
      gclid?: string;
    };
  };
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
  const successUrl = `${baseUrl}/${lang}/support?donated=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/${lang}/support`;

  // Map site language to Stripe Checkout locale
  const stripeLocale: Stripe.Checkout.SessionCreateParams["locale"] =
    lang === "fr" || lang === "lu" ? "fr" : lang === "de" ? "de" : "en";

  // Translated product names for Stripe Checkout line items
  const productName = type === "monthly"
    ? lang === "fr" || lang === "lu" ? "Don mensuel \u00e0 Clarvia ASBL"
      : lang === "de" ? "Monatliche Spende an Clarvia ASBL"
      : "Monthly donation to Clarvia ASBL"
    : lang === "fr" || lang === "lu" ? "Don \u00e0 Clarvia ASBL"
      : lang === "de" ? "Spende an Clarvia ASBL"
      : "Donation to Clarvia ASBL";

  const productDesc = getProductDescription(type, lang, amount);

  // Compile Stripe metadata from incoming body parameters
  const metadata: Record<string, string> = {
    donation_type: type,
    locale: lang,
  };

  if (body.marketingOptIn !== undefined) {
    metadata.marketing_opt_in = body.marketingOptIn ? "true" : "false";
  }
  if (body.consentTextVersion) {
    metadata.consent_text_version = body.consentTextVersion;
  }
  if (body.landingVariant) {
    metadata.landing_variant = body.landingVariant;
  }
  if (body.attribution) {
    const attr = body.attribution;
    if (attr.source) metadata.utm_source = attr.source;
    if (attr.medium) metadata.utm_medium = attr.medium;
    if (attr.campaign) metadata.utm_campaign = attr.campaign;
    if (attr.term) metadata.utm_term = attr.term;
    if (attr.content) metadata.utm_content = attr.content;
    if (attr.gclid) metadata.gclid = attr.gclid;
  }

  try {
    if (type === "monthly") {
      // Subscription via Checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        metadata,
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
        metadata,
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

/**
 * GET /api/donate
 *
 * Retrieves the status and verified details of a Stripe Checkout Session.
 */
export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency?.toUpperCase(),
    });
  } catch (err) {
    console.error("Failed to retrieve Stripe session:", err);
    return NextResponse.json(
      { error: "Invalid or expired session ID." },
      { status: 400 }
    );
  }
}

