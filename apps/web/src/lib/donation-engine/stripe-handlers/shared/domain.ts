/**
 * Shared upsert helpers for Stripe domain handlers.
 */

import type { TransactionClient } from "../../db";

const LOCALE_VALUES = new Set(["en", "fr", "de", "lu"]);

export function normalizeLocale(
  value: string | null | undefined,
): "en" | "fr" | "de" | "lu" {
  if (!value) return "en";
  const base = value.toLowerCase().split("-")[0];
  if (base === "fr" || base === "de" || base === "lu") return base;
  return "en";
}

export function minorFromStripeAmount(
  amount: number | null | undefined,
): number | null {
  if (amount == null) return null;
  return amount;
}

export function donatedAtFromUnix(
  seconds: number | null | undefined,
): Date {
  if (seconds == null) return new Date();
  return new Date(seconds * 1000);
}

export async function upsertContact(
  tx: TransactionClient,
  opts: {
    email: string | null;
    displayName?: string | null;
    preferredLocale?: string | null;
  },
): Promise<string | null> {
  if (!opts.email) return null;

  const locale = normalizeLocale(opts.preferredLocale);
  const row = await tx.one<{ id: string }>(
    `
    INSERT INTO clarvia.contacts (
      email,
      display_name,
      preferred_locale
    )
    VALUES ($1, $2, $3)
    ON CONFLICT (email)
    WHERE email IS NOT NULL AND state = 'active'
    DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, clarvia.contacts.display_name),
      preferred_locale = CASE
        WHEN EXCLUDED.preferred_locale IN ('en', 'fr', 'de', 'lu')
        THEN EXCLUDED.preferred_locale
        ELSE clarvia.contacts.preferred_locale
      END,
      updated_at = now()
    RETURNING id
    `,
    [opts.email, opts.displayName ?? null, locale],
  );

  return row.id;
}

export async function touchContactDonationTimestamps(
  tx: TransactionClient,
  contactId: string,
  donatedAt: Date,
): Promise<void> {
  await tx.none(
    `
    UPDATE clarvia.contacts
    SET first_donation_at = COALESCE(first_donation_at, $2),
        last_donation_at = GREATEST(COALESCE(last_donation_at, $2), $2),
        updated_at = now()
    WHERE id = $1
    `,
    [contactId, donatedAt],
  );
}

export async function upsertStripeCustomer(
  tx: TransactionClient,
  opts: {
    contactId: string;
    stripeCustomerId: string;
    livemode: boolean;
    emailSnapshot?: string | null;
  },
): Promise<void> {
  await tx.none(
    `
    INSERT INTO clarvia.stripe_customers (
      contact_id,
      stripe_customer_id,
      livemode,
      email_snapshot
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (stripe_customer_id)
    DO UPDATE SET
      contact_id = EXCLUDED.contact_id,
      email_snapshot = COALESCE(EXCLUDED.email_snapshot, clarvia.stripe_customers.email_snapshot),
      updated_at = now()
    `,
    [
      opts.contactId,
      opts.stripeCustomerId,
      opts.livemode,
      opts.emailSnapshot ?? null,
    ],
  );
}

export async function upsertCheckoutSession(
  tx: TransactionClient,
  opts: {
    stripeSessionId: string;
    contactId?: string | null;
    stripeCustomerId?: string | null;
    stripePaymentIntentId?: string | null;
    stripeSubscriptionId?: string | null;
    mode: "payment" | "subscription" | "setup";
    donationType?: "onetime" | "monthly" | null;
    paymentStatus?: string | null;
    sessionStatus?: string | null;
    amountTotalMinor?: number | null;
    currency?: string | null;
    marketingOptIn?: boolean;
    consentTextVersion?: string | null;
    locale?: string | null;
    landingVariant?: string | null;
    attribution?: Record<string, unknown>;
    sourceWebhookEventId: string;
    completedAt?: Date | null;
  },
): Promise<string> {
  const locale =
    opts.locale && LOCALE_VALUES.has(opts.locale) ? opts.locale : null;

  const row = await tx.one<{ id: string }>(
    `
    INSERT INTO clarvia.stripe_checkout_sessions (
      stripe_session_id,
      contact_id,
      stripe_customer_id,
      stripe_payment_intent_id,
      stripe_subscription_id,
      mode,
      donation_type,
      payment_status,
      session_status,
      amount_total_minor,
      currency,
      marketing_opt_in,
      consent_text_version,
      locale,
      landing_variant,
      attribution,
      source_webhook_event_id,
      completed_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16::jsonb, $17, $18
    )
    ON CONFLICT (stripe_session_id)
    DO UPDATE SET
      contact_id = COALESCE(EXCLUDED.contact_id, clarvia.stripe_checkout_sessions.contact_id),
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, clarvia.stripe_checkout_sessions.stripe_customer_id),
      stripe_payment_intent_id = COALESCE(EXCLUDED.stripe_payment_intent_id, clarvia.stripe_checkout_sessions.stripe_payment_intent_id),
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, clarvia.stripe_checkout_sessions.stripe_subscription_id),
      payment_status = COALESCE(EXCLUDED.payment_status, clarvia.stripe_checkout_sessions.payment_status),
      session_status = COALESCE(EXCLUDED.session_status, clarvia.stripe_checkout_sessions.session_status),
      amount_total_minor = COALESCE(EXCLUDED.amount_total_minor, clarvia.stripe_checkout_sessions.amount_total_minor),
      currency = COALESCE(EXCLUDED.currency, clarvia.stripe_checkout_sessions.currency),
      marketing_opt_in = EXCLUDED.marketing_opt_in,
      consent_text_version = COALESCE(EXCLUDED.consent_text_version, clarvia.stripe_checkout_sessions.consent_text_version),
      locale = COALESCE(EXCLUDED.locale, clarvia.stripe_checkout_sessions.locale),
      landing_variant = COALESCE(EXCLUDED.landing_variant, clarvia.stripe_checkout_sessions.landing_variant),
      attribution = clarvia.stripe_checkout_sessions.attribution || EXCLUDED.attribution,
      source_webhook_event_id = EXCLUDED.source_webhook_event_id,
      completed_at = COALESCE(EXCLUDED.completed_at, clarvia.stripe_checkout_sessions.completed_at),
      updated_at = now()
    RETURNING id
    `,
    [
      opts.stripeSessionId,
      opts.contactId ?? null,
      opts.stripeCustomerId ?? null,
      opts.stripePaymentIntentId ?? null,
      opts.stripeSubscriptionId ?? null,
      opts.mode,
      opts.donationType ?? null,
      opts.paymentStatus ?? null,
      opts.sessionStatus ?? null,
      opts.amountTotalMinor ?? null,
      opts.currency?.toUpperCase() ?? null,
      opts.marketingOptIn ?? false,
      opts.consentTextVersion ?? null,
      locale,
      opts.landingVariant ?? null,
      JSON.stringify(opts.attribution ?? {}),
      opts.sourceWebhookEventId,
      opts.completedAt ?? null,
    ],
  );

  return row.id;
}

export async function upsertRecurringCommitment(
  tx: TransactionClient,
  opts: {
    contactId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: string;
    amountMinor?: number | null;
    currency?: string | null;
    intervalName?: string | null;
    intervalCount?: number | null;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
    cancelAt?: Date | null;
    canceledAt?: Date | null;
    endedAt?: Date | null;
    metadata?: Record<string, unknown>;
    sourceWebhookEventId: string;
  },
): Promise<string> {
  const row = await tx.one<{ id: string }>(
    `
    INSERT INTO clarvia.recurring_commitments (
      contact_id,
      stripe_customer_id,
      stripe_subscription_id,
      status,
      amount_minor,
      currency,
      interval_name,
      interval_count,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      cancel_at,
      canceled_at,
      ended_at,
      metadata,
      source_webhook_event_id
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      $15::jsonb, $16
    )
    ON CONFLICT (stripe_subscription_id)
    DO UPDATE SET
      contact_id = EXCLUDED.contact_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      status = EXCLUDED.status,
      amount_minor = COALESCE(EXCLUDED.amount_minor, clarvia.recurring_commitments.amount_minor),
      currency = COALESCE(EXCLUDED.currency, clarvia.recurring_commitments.currency),
      interval_name = COALESCE(EXCLUDED.interval_name, clarvia.recurring_commitments.interval_name),
      interval_count = COALESCE(EXCLUDED.interval_count, clarvia.recurring_commitments.interval_count),
      current_period_start = COALESCE(EXCLUDED.current_period_start, clarvia.recurring_commitments.current_period_start),
      current_period_end = COALESCE(EXCLUDED.current_period_end, clarvia.recurring_commitments.current_period_end),
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      cancel_at = COALESCE(EXCLUDED.cancel_at, clarvia.recurring_commitments.cancel_at),
      canceled_at = COALESCE(EXCLUDED.canceled_at, clarvia.recurring_commitments.canceled_at),
      ended_at = COALESCE(EXCLUDED.ended_at, clarvia.recurring_commitments.ended_at),
      metadata = clarvia.recurring_commitments.metadata || EXCLUDED.metadata,
      source_webhook_event_id = EXCLUDED.source_webhook_event_id,
      updated_at = now()
    RETURNING id
    `,
    [
      opts.contactId,
      opts.stripeCustomerId,
      opts.stripeSubscriptionId,
      opts.status,
      opts.amountMinor ?? null,
      opts.currency?.toUpperCase() ?? null,
      opts.intervalName ?? null,
      opts.intervalCount ?? null,
      opts.currentPeriodStart ?? null,
      opts.currentPeriodEnd ?? null,
      opts.cancelAtPeriodEnd ?? false,
      opts.cancelAt ?? null,
      opts.canceledAt ?? null,
      opts.endedAt ?? null,
      JSON.stringify(opts.metadata ?? {}),
      opts.sourceWebhookEventId,
    ],
  );

  return row.id;
}

export async function upsertDonation(
  tx: TransactionClient,
  opts: {
    contactId?: string | null;
    recurringCommitmentId?: string | null;
    donationKind: "one_time" | "recurring_payment";
    status: string;
    currency: string;
    amountGrossMinor: number;
    donatedAt: Date;
    stripeCustomerId?: string | null;
    stripeCheckoutSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    stripeChargeId?: string | null;
    stripeInvoiceId?: string | null;
    stripeSubscriptionId?: string | null;
    sourceWebhookEventId: string;
    metadata?: Record<string, unknown>;
  },
): Promise<string> {
  const conflictTarget = opts.stripeInvoiceId
    ? "invoice"
    : opts.stripePaymentIntentId
      ? "payment_intent"
      : opts.stripeCheckoutSessionId
        ? "checkout_session"
        : opts.stripeChargeId
          ? "charge"
          : null;

  const baseParams = [
    opts.contactId ?? null,
    opts.recurringCommitmentId ?? null,
    opts.donationKind,
    opts.status,
    opts.currency.toUpperCase(),
    opts.amountGrossMinor,
    opts.donatedAt,
    opts.stripeCustomerId ?? null,
    opts.stripeCheckoutSessionId ?? null,
    opts.stripePaymentIntentId ?? null,
    opts.stripeChargeId ?? null,
    opts.stripeInvoiceId ?? null,
    opts.stripeSubscriptionId ?? null,
    opts.sourceWebhookEventId,
    JSON.stringify(opts.metadata ?? {}),
  ];

  let row: { id: string };

  if (conflictTarget === "invoice") {
    row = await tx.one<{ id: string }>(
      `
      INSERT INTO clarvia.donations (
        contact_id, recurring_commitment_id, provider, donation_kind, status,
        currency, amount_gross_minor, donated_at, stripe_customer_id,
        stripe_checkout_session_id, stripe_payment_intent_id, stripe_charge_id,
        stripe_invoice_id, stripe_subscription_id, source_webhook_event_id, metadata
      )
      VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb)
      ON CONFLICT (stripe_invoice_id)
      WHERE provider = 'stripe' AND stripe_invoice_id IS NOT NULL
      DO UPDATE SET
        status = EXCLUDED.status,
        amount_gross_minor = EXCLUDED.amount_gross_minor,
        contact_id = COALESCE(EXCLUDED.contact_id, clarvia.donations.contact_id),
        recurring_commitment_id = COALESCE(EXCLUDED.recurring_commitment_id, clarvia.donations.recurring_commitment_id),
        stripe_charge_id = COALESCE(EXCLUDED.stripe_charge_id, clarvia.donations.stripe_charge_id),
        source_webhook_event_id = EXCLUDED.source_webhook_event_id,
        updated_at = now()
      RETURNING id
      `,
      baseParams,
    );
  } else if (conflictTarget === "payment_intent") {
    row = await tx.one<{ id: string }>(
      `
      INSERT INTO clarvia.donations (
        contact_id, recurring_commitment_id, provider, donation_kind, status,
        currency, amount_gross_minor, donated_at, stripe_customer_id,
        stripe_checkout_session_id, stripe_payment_intent_id, stripe_charge_id,
        stripe_invoice_id, stripe_subscription_id, source_webhook_event_id, metadata
      )
      VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb)
      ON CONFLICT (stripe_payment_intent_id)
      WHERE provider = 'stripe' AND stripe_payment_intent_id IS NOT NULL
      DO UPDATE SET
        status = EXCLUDED.status,
        amount_gross_minor = EXCLUDED.amount_gross_minor,
        contact_id = COALESCE(EXCLUDED.contact_id, clarvia.donations.contact_id),
        stripe_charge_id = COALESCE(EXCLUDED.stripe_charge_id, clarvia.donations.stripe_charge_id),
        source_webhook_event_id = EXCLUDED.source_webhook_event_id,
        updated_at = now()
      RETURNING id
      `,
      baseParams,
    );
  } else if (conflictTarget === "checkout_session") {
    row = await tx.one<{ id: string }>(
      `
      INSERT INTO clarvia.donations (
        contact_id, recurring_commitment_id, provider, donation_kind, status,
        currency, amount_gross_minor, donated_at, stripe_customer_id,
        stripe_checkout_session_id, stripe_payment_intent_id, stripe_charge_id,
        stripe_invoice_id, stripe_subscription_id, source_webhook_event_id, metadata
      )
      VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb)
      ON CONFLICT (stripe_checkout_session_id)
      WHERE provider = 'stripe' AND stripe_checkout_session_id IS NOT NULL
      DO UPDATE SET
        status = EXCLUDED.status,
        amount_gross_minor = EXCLUDED.amount_gross_minor,
        contact_id = COALESCE(EXCLUDED.contact_id, clarvia.donations.contact_id),
        stripe_payment_intent_id = COALESCE(EXCLUDED.stripe_payment_intent_id, clarvia.donations.stripe_payment_intent_id),
        source_webhook_event_id = EXCLUDED.source_webhook_event_id,
        updated_at = now()
      RETURNING id
      `,
      baseParams,
    );
  } else if (conflictTarget === "charge") {
    row = await tx.one<{ id: string }>(
      `
      INSERT INTO clarvia.donations (
        contact_id, recurring_commitment_id, provider, donation_kind, status,
        currency, amount_gross_minor, donated_at, stripe_customer_id,
        stripe_checkout_session_id, stripe_payment_intent_id, stripe_charge_id,
        stripe_invoice_id, stripe_subscription_id, source_webhook_event_id, metadata
      )
      VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb)
      ON CONFLICT (stripe_charge_id)
      WHERE provider = 'stripe' AND stripe_charge_id IS NOT NULL
      DO UPDATE SET
        status = EXCLUDED.status,
        amount_gross_minor = EXCLUDED.amount_gross_minor,
        source_webhook_event_id = EXCLUDED.source_webhook_event_id,
        updated_at = now()
      RETURNING id
      `,
      baseParams,
    );
  } else {
    row = await tx.one<{ id: string }>(
      `
      INSERT INTO clarvia.donations (
        contact_id, recurring_commitment_id, provider, donation_kind, status,
        currency, amount_gross_minor, donated_at, stripe_customer_id,
        stripe_checkout_session_id, stripe_payment_intent_id, stripe_charge_id,
        stripe_invoice_id, stripe_subscription_id, source_webhook_event_id, metadata
      )
      VALUES ($1, $2, 'stripe', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb)
      RETURNING id
      `,
      baseParams,
    );
  }

  return row.id;
}

export async function appendDonationEvent(
  tx: TransactionClient,
  opts: {
    donationId?: string | null;
    sourceWebhookEventId: string;
    eventType: string;
    providerObjectType?: string | null;
    providerObjectId?: string | null;
    occurredAt: Date;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  await tx.none(
    `
    INSERT INTO clarvia.donation_events (
      donation_id,
      source_webhook_event_id,
      event_type,
      provider_object_type,
      provider_object_id,
      occurred_at,
      details
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    ON CONFLICT (
      source_webhook_event_id,
      event_type,
      coalesce(provider_object_id, '')
    )
    DO NOTHING
    `,
    [
      opts.donationId ?? null,
      opts.sourceWebhookEventId,
      opts.eventType,
      opts.providerObjectType ?? null,
      opts.providerObjectId ?? null,
      opts.occurredAt,
      JSON.stringify(opts.details ?? {}),
    ],
  );
}

export async function findDonationByStripeRefs(
  tx: TransactionClient,
  refs: {
    chargeId?: string | null;
    paymentIntentId?: string | null;
    invoiceId?: string | null;
  },
): Promise<{ id: string; amount_gross_minor: number; amount_refunded_minor: number } | null> {
  if (refs.chargeId) {
    return tx.oneOrNone(
      `SELECT id, amount_gross_minor, amount_refunded_minor
       FROM clarvia.donations
       WHERE stripe_charge_id = $1`,
      [refs.chargeId],
    );
  }
  if (refs.paymentIntentId) {
    return tx.oneOrNone(
      `SELECT id, amount_gross_minor, amount_refunded_minor
       FROM clarvia.donations
       WHERE stripe_payment_intent_id = $1`,
      [refs.paymentIntentId],
    );
  }
  if (refs.invoiceId) {
    return tx.oneOrNone(
      `SELECT id, amount_gross_minor, amount_refunded_minor
       FROM clarvia.donations
       WHERE stripe_invoice_id = $1`,
      [refs.invoiceId],
    );
  }
  return null;
}

export async function updateDonationRefund(
  tx: TransactionClient,
  donationId: string,
  amountRefundedMinor: number,
  sourceWebhookEventId: string,
  occurredAt: Date,
): Promise<void> {
  const status =
    amountRefundedMinor > 0 ? "partially_refunded" : "succeeded";

  await tx.none(
    `
    UPDATE clarvia.donations
    SET amount_refunded_minor = $2,
        status = CASE
          WHEN $2 >= amount_gross_minor THEN 'refunded'
          WHEN $2 > 0 THEN 'partially_refunded'
          ELSE status
        END,
        source_webhook_event_id = $3,
        updated_at = now()
    WHERE id = $1
    `,
    [donationId, amountRefundedMinor, sourceWebhookEventId],
  );

  await appendDonationEvent(tx, {
    donationId,
    sourceWebhookEventId,
    eventType: "refund.updated",
    providerObjectType: "donation",
    providerObjectId: donationId,
    occurredAt,
    details: { amount_refunded_minor: amountRefundedMinor, status },
  });
}

export async function markDonationDisputed(
  tx: TransactionClient,
  donationId: string,
  sourceWebhookEventId: string,
  occurredAt: Date,
  disputeId: string,
): Promise<void> {
  await tx.none(
    `
    UPDATE clarvia.donations
    SET status = 'disputed',
        source_webhook_event_id = $2,
        updated_at = now()
    WHERE id = $1
    `,
    [donationId, sourceWebhookEventId],
  );

  await appendDonationEvent(tx, {
    donationId,
    sourceWebhookEventId,
    eventType: "dispute.created",
    providerObjectType: "dispute",
    providerObjectId: disputeId,
    occurredAt,
    details: { dispute_id: disputeId },
  });
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function metadataDonationType(
  metadata: Record<string, unknown> | null | undefined,
): "onetime" | "monthly" | null {
  const raw = metadata?.donation_type;
  if (raw === "monthly") return "monthly";
  if (raw === "onetime") return "onetime";
  return null;
}
