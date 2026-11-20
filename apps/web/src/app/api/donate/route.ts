import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  ASSOCIATE_ANNUAL_EUR,
  ASSOCIATE_MONTHLY_EUR,
  normalizeLinkedInProfileUrl,
} from "@/content/associate-members";
import { isLang, type Lang } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";

const limiter = rateLimit("donate", 10, 60_000);
const verifyLimiter = rateLimit("donate-verify", 30, 60_000);

function sanitizeDisplayName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let cleaned = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code >= 32 && code !== 127) {
      cleaned += raw[i];
    }
  }
  const normalized = cleaned.replace(/\s+/g, " ").trim();
  if (normalized.length < 2 || normalized.length > 120) return null;
  return normalized;
}

function getDonationDescription(
  type: "monthly" | "onetime",
  lang: Lang,
  amount: number,
): string {
  if (type === "monthly") {
    if (lang === "fr" || lang === "lu") return `${amount} \u20AC/mois`;
    if (lang === "de") return `${amount} \u20AC/Monat`;
    return `\u20AC${amount}/month`;
  }
  if (lang === "fr" || lang === "lu") return `Don unique de ${amount} \u20AC`;
  if (lang === "de") return `Einmalige Spende von ${amount} \u20AC`;
  return `\u20AC${amount} one-time donation`;
}

function getMembershipProductCopy(
  interval: "month" | "year",
  lang: Lang,
  amount: number,
): { name: string; description: string } {
  if (lang === "fr" || lang === "lu") {
    return {
      name: "Clarvia (association \u00e0 but non lucratif) : Membre adh\u00e9rent",
      description:
        interval === "year"
          ? `${amount} \u20AC/an \u00b7 Cotisation de membre adh\u00e9rent sans droit de vote`
          : `${amount} \u20AC/mois \u00b7 Cotisation de membre adh\u00e9rent sans droit de vote`,
    };
  }
  if (lang === "de") {
    return {
      name: "Clarvia Non-Profit: Assoziiertes Mitglied",
      description:
        interval === "year"
          ? `${amount} \u20AC/Jahr \u00b7 Satzungsm\u00e4\u00dfiger Beitrag ohne Stimmrecht`
          : `${amount} \u20AC/Monat \u00b7 Satzungsm\u00e4\u00dfiger Beitrag ohne Stimmrecht`,
    };
  }
  return {
    name: "Clarvia Non-Profit: Associate Membership",
    description:
      interval === "year"
        ? `\u20AC${amount}/year \u00b7 Non-voting Associate Member contribution`
        : `\u20AC${amount}/month \u00b7 Non-voting Associate Member contribution`,
  };
}

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function attachSharedMetadata(
  metadata: Record<string, string>,
  body: {
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
  },
): void {
  if (body.marketingOptIn !== undefined) {
    metadata.marketing_opt_in = body.marketingOptIn ? "true" : "false";
  }
  if (body.consentTextVersion && typeof body.consentTextVersion === "string") {
    metadata.consent_text_version = body.consentTextVersion.slice(0, 80);
  }
  if (body.landingVariant && typeof body.landingVariant === "string") {
    metadata.landing_variant = body.landingVariant.slice(0, 80);
  }
  if (body.attribution) {
    const attr = body.attribution;
    if (attr.source) metadata.utm_source = String(attr.source).slice(0, 120);
    if (attr.medium) metadata.utm_medium = String(attr.medium).slice(0, 120);
    if (attr.campaign) metadata.utm_campaign = String(attr.campaign).slice(0, 120);
    if (attr.term) metadata.utm_term = String(attr.term).slice(0, 120);
    if (attr.content) metadata.utm_content = String(attr.content).slice(0, 120);
    if (attr.gclid) metadata.gclid = String(attr.gclid).slice(0, 160);
  }
}

/**
 * POST /api/donate
 *
 * Creates a Stripe Checkout Session for:
 *  - Standard donations (`onetime` or `monthly`) from /[lang]/support
 *  - Statutory Associate Membership subscriptions (`monthly` €40 or `annual` €480, Account 7200)
 *    from /[lang]/membership
 */
export async function POST(req: NextRequest) {
  const ip = extractClientIp(req);
  const { allowed, retryAfterMs } = limiter(ip);
  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: retryAfterMs
          ? { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) }
          : undefined,
      },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please try bank transfer." },
      { status: 503 },
    );
  }

  let body: {
    program?: string;
    amount?: number;
    type?: string;
    lang?: string;
    memberName?: string;
    ambassadorAgreed?: boolean;
    publishMember?: boolean;
    linkedinUrl?: string;
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

  const lang: Lang = body.lang && isLang(body.lang) ? body.lang : "en";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://clarvia.org";
  const stripeLocale: Stripe.Checkout.SessionCreateParams["locale"] =
    lang === "fr" || lang === "lu" ? "fr" : lang === "de" ? "de" : "en";

  // ── Branch 1: Statutory Associate Membership (Account 7200) ───────────
  if (body.program === "associate_membership") {
    if (body.type !== "monthly" && body.type !== "annual") {
      return NextResponse.json(
        { error: "Invalid membership billing interval." },
        { status: 400 },
      );
    }

    if (body.ambassadorAgreed !== true) {
      return NextResponse.json(
        { error: "Ambassador charter agreement is required." },
        { status: 400 },
      );
    }

    const cleanMemberName = sanitizeDisplayName(body.memberName);
    if (!cleanMemberName) {
      return NextResponse.json(
        { error: "Please enter your full name (2 to 120 characters)." },
        { status: 400 },
      );
    }

    const publishMember = body.publishMember === true;
    let normalizedLinkedIn: string | null = null;
    if (publishMember) {
      normalizedLinkedIn = normalizeLinkedInProfileUrl(body.linkedinUrl ?? "");
      if (!normalizedLinkedIn) {
        return NextResponse.json(
          { error: "Please enter a valid personal LinkedIn profile URL (linkedin.com/in/...)." },
          { status: 400 },
        );
      }
    }

    const billingInterval: "month" | "year" =
      body.type === "annual" ? "year" : "month";
    const amount =
      billingInterval === "year" ? ASSOCIATE_ANNUAL_EUR : ASSOCIATE_MONTHLY_EUR;
    const amountCents = amount * 100;

    const metadata: Record<string, string> = {
      program: "associate_membership",
      accounting_code: "7200",
      billing_interval: billingInterval,
      locale: lang,
      member_display_name: cleanMemberName,
      ambassador_agreed: "true",
      publish_member: publishMember ? "true" : "false",
    };

    if (billingInterval === "month") {
      metadata.donation_type = "monthly";
    }
    if (normalizedLinkedIn) {
      metadata.linkedin_url = normalizedLinkedIn;
    }

    attachSharedMetadata(metadata, {
      ...body,
      consentTextVersion: body.consentTextVersion || "associate-member-v1",
      landingVariant: body.landingVariant || "membership",
    });

    const { name: productName, description: productDesc } =
      getMembershipProductCopy(billingInterval, lang, amount);
    const successUrl = `${baseUrl}/${lang}/membership?joined=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${lang}/membership`;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        metadata,
        subscription_data: {
          metadata,
        },
        line_items: [
          {
            price_data: {
              currency: "eur",
              recurring: { interval: billingInterval },
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
        console.error(
          "Stripe session creation returned null URL for associate membership.",
        );
        return NextResponse.json(
          { error: "Could not create payment session. Please try bank transfer." },
          { status: 500 },
        );
      }

      return NextResponse.json({ url: session.url });
    } catch (err) {
      console.error("Stripe membership session creation failed:", err);
      return NextResponse.json(
        { error: "Could not create payment session. Please try bank transfer." },
        { status: 500 },
      );
    }
  }

  // ── Branch 2: Standard Donations (/support) ───────────────────────────
  const amount = body.amount;
  const type = body.type === "monthly" ? "monthly" : "onetime";

  if (!amount || typeof amount !== "number" || amount < 1 || amount > 100000) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const amountCents = Math.round(amount * 100);
  const successUrl = `${baseUrl}/${lang}/support?donated=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/${lang}/support`;

  const productName =
    type === "monthly"
      ? lang === "fr" || lang === "lu"
        ? "Don mensuel \u00e0 Clarvia ASBL"
        : lang === "de"
          ? "Monatliche Spende an Clarvia ASBL"
          : "Monthly donation to Clarvia ASBL"
      : lang === "fr" || lang === "lu"
        ? "Don \u00e0 Clarvia ASBL"
        : lang === "de"
          ? "Spende an Clarvia ASBL"
          : "Donation to Clarvia ASBL";

  const productDesc = getDonationDescription(type, lang, amount);

  const metadata: Record<string, string> = {
    donation_type: type,
    locale: lang,
  };
  attachSharedMetadata(metadata, body);

  try {
    if (type === "monthly") {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        metadata,
        subscription_data: {
          metadata,
        },
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
        console.error(
          "Stripe session creation returned null URL for monthly donation.",
        );
        return NextResponse.json(
          { error: "Could not create payment session. Please try bank transfer." },
          { status: 500 },
        );
      }
      return NextResponse.json({ url: session.url });
    }

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
      console.error(
        "Stripe session creation returned null URL for one-time donation.",
      );
      return NextResponse.json(
        { error: "Could not create payment session. Please try bank transfer." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    return NextResponse.json(
      { error: "Could not create payment session. Please try bank transfer." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/donate
 *
 * Retrieves non-PII verification details of a Stripe Checkout Session.
 */
export async function GET(req: NextRequest) {
  const ip = extractClientIp(req);
  const { allowed, retryAfterMs } = verifyLimiter(ip);
  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: retryAfterMs
          ? { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) }
          : undefined,
      },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id")?.trim();

  if (!sessionId || !sessionId.startsWith("cs_") || sessionId.length > 200) {
    return NextResponse.json(
      { error: "Missing or invalid session_id." },
      { status: 400 },
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
      program:
        session.metadata?.program === "associate_membership"
          ? "associate_membership"
          : "donation",
      billing_interval: session.metadata?.billing_interval ?? null,
      created_date: session.created
        ? new Date(session.created * 1000).toISOString().slice(0, 10)
        : null,
    });
  } catch (err) {
    console.error("Failed to retrieve Stripe session:", err);
    return NextResponse.json(
      { error: "Invalid or expired session ID." },
      { status: 400 },
    );
  }
}
