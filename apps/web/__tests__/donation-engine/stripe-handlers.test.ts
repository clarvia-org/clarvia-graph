import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";
import { handleCheckoutSessionCompleted } from "@/lib/donation-engine/stripe-handlers/handlers/checkout-session";
import { handleInvoicePaymentSucceeded } from "@/lib/donation-engine/stripe-handlers/handlers/subscription-invoice";
import type { HandlerContext } from "@/lib/donation-engine/stripe-handlers/types";

function createMockTx() {
  const calls: { sql: string; values?: unknown[] }[] = [];
  const tx = {
    calls,
    one: vi.fn(async (sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
      if (sql.includes("INSERT INTO clarvia.contacts")) {
        return { id: "contact-1" };
      }
      if (sql.includes("INSERT INTO clarvia.stripe_checkout_sessions")) {
        return { id: "session-row-1" };
      }
      if (sql.includes("INSERT INTO clarvia.donations")) {
        return { id: "donation-1" };
      }
      if (sql.includes("INSERT INTO clarvia.recurring_commitments")) {
        return { id: "commitment-1" };
      }
      throw new Error(`Unexpected one(): ${sql.slice(0, 80)}`);
    }),
    oneOrNone: vi.fn(async () => null),
    none: vi.fn(async (sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
    }),
    query: vi.fn(),
  };
  return tx;
}

function baseContext(
  tx: ReturnType<typeof createMockTx>,
  stripeEvent: Stripe.Event,
): HandlerContext {
  return {
    tx: tx as unknown as HandlerContext["tx"],
    stripe: {
      checkout: {
        sessions: {
          retrieve: vi.fn(async (id: string) => ({
            id,
            mode: "payment",
            payment_status: "paid",
            status: "complete",
            amount_total: 2500,
            currency: "eur",
            customer: "cus_test",
            customer_details: { email: "donor@example.com", name: "Donor" },
            payment_intent: "pi_test",
            metadata: { donation_type: "onetime" },
            livemode: false,
            created: 1720000000,
            locale: "en",
          })),
        },
      },
      customers: {
        retrieve: vi.fn(),
      },
      subscriptions: {
        retrieve: vi.fn(),
      },
    } as unknown as Stripe,
    webhookEvent: {
      id: "we-1",
      externalEventId: "evt_1",
      eventType: stripeEvent.type,
      livemode: false,
      occurredAt: new Date(),
      payload: stripeEvent as unknown as HandlerContext["webhookEvent"]["payload"],
    },
    stripeEvent,
  };
}

describe("stripe handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checkout.session.completed creates a one-time donation when paid", async () => {
    const tx = createMockTx();
    const event = {
      id: "evt_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test",
          mode: "payment",
          payment_status: "paid",
          status: "complete",
          amount_total: 2500,
          currency: "eur",
          customer: "cus_test",
          customer_details: { email: "donor@example.com" },
          payment_intent: "pi_test",
          metadata: { donation_type: "onetime" },
          livemode: false,
          created: 1720000000,
        },
      },
    } as unknown as Stripe.Event;

    const result = await handleCheckoutSessionCompleted(
      baseContext(tx, event),
    );

    expect(result.outcome).toBe("processed");
    expect(tx.one).toHaveBeenCalled();
    const donationInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.donations"),
    );
    expect(donationInsert).toBeDefined();
    expect(donationInsert?.values?.[2]).toBe("one_time");
  });

  it("checkout.session.completed for subscription does not insert donation", async () => {
    const tx = createMockTx();
    const stripe = {
      checkout: {
        sessions: {
          retrieve: vi.fn(async () => ({
            id: "cs_sub",
            mode: "subscription",
            payment_status: "paid",
            status: "complete",
            amount_total: 1000,
            currency: "eur",
            customer: "cus_sub",
            customer_details: { email: "sub@example.com" },
            subscription: "sub_test",
            metadata: { donation_type: "monthly" },
            livemode: false,
            created: 1720000000,
            locale: "en",
          })),
        },
      },
      subscriptions: {
        retrieve: vi.fn(async () => ({
          id: "sub_test",
          customer: "cus_sub",
          status: "active",
          livemode: false,
          current_period_start: 1720000000,
          current_period_end: 1722592000,
          cancel_at_period_end: false,
          items: {
            data: [
              {
                price: {
                  unit_amount: 1000,
                  currency: "eur",
                  recurring: { interval: "month", interval_count: 1 },
                },
              },
            ],
          },
          metadata: {},
        })),
      },
      customers: { retrieve: vi.fn() },
    } as unknown as Stripe;

    const event = {
      id: "evt_sub",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_sub",
          mode: "subscription",
          payment_status: "paid",
          subscription: "sub_test",
          customer: "cus_sub",
          customer_details: { email: "sub@example.com" },
          metadata: { donation_type: "monthly" },
          livemode: false,
          created: 1720000000,
        },
      },
    } as unknown as Stripe.Event;

    const ctx = baseContext(tx, event);
    ctx.stripe = stripe;

    const result = await handleCheckoutSessionCompleted(ctx);
    expect(result.outcome).toBe("processed");

    const donationInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.donations"),
    );
    expect(donationInsert).toBeUndefined();

    const commitmentInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.recurring_commitments"),
    );
    expect(commitmentInsert).toBeDefined();
  });

  it("invoice.payment_succeeded creates recurring donation keyed by invoice", async () => {
    const tx = createMockTx();
    const stripe = {
      subscriptions: {
        retrieve: vi.fn(async () => ({
          id: "sub_test",
          customer: "cus_sub",
          status: "active",
          livemode: false,
          current_period_start: 1720000000,
          current_period_end: 1722592000,
          cancel_at_period_end: false,
          items: {
            data: [
              {
                price: {
                  unit_amount: 1000,
                  currency: "eur",
                  recurring: { interval: "month", interval_count: 1 },
                },
              },
            ],
          },
          metadata: {},
        })),
      },
      customers: {
        retrieve: vi.fn(async () => ({
          id: "cus_sub",
          email: "sub@example.com",
          name: "Subscriber",
          deleted: false,
        })),
      },
      checkout: { sessions: { retrieve: vi.fn() } },
    } as unknown as Stripe;

    const event = {
      id: "evt_inv",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_test",
          currency: "eur",
          amount_paid: 1000,
          subscription: "sub_test",
          customer: "cus_sub",
          billing_reason: "subscription_create",
          created: 1720000000,
          status_transitions: { paid_at: 1720000000 },
        },
      },
    } as unknown as Stripe.Event;

    const ctx = baseContext(tx, event);
    ctx.stripe = stripe;

    const result = await handleInvoicePaymentSucceeded(ctx);
    expect(result.outcome).toBe("processed");

    const donationInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.donations"),
    );
    expect(donationInsert).toBeDefined();
    expect(donationInsert?.values?.[2]).toBe("recurring_payment");
    expect(donationInsert?.sql).toContain("stripe_invoice_id");
  });

  it("checkout.session.completed handles annual associate membership with null donation_type and member_display_name", async () => {
    const tx = createMockTx();
    const event = {
      id: "evt_member_annual",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_member_annual",
          mode: "subscription",
          payment_status: "paid",
          status: "complete",
          amount_total: 48000,
          currency: "eur",
          customer: "cus_member",
          customer_details: {
            email: "member@example.org",
            name: "ACME Holding S.A.",
          },
          subscription: {
            id: "sub_annual_1",
            customer: "cus_member",
            status: "active",
            livemode: false,
            current_period_start: 1720000000,
            current_period_end: 1751536000,
            cancel_at_period_end: false,
            items: {
              data: [
                {
                  price: {
                    unit_amount: 48000,
                    currency: "eur",
                    recurring: { interval: "year", interval_count: 1 },
                  },
                },
              ],
            },
            metadata: {
              program: "associate_membership",
              accounting_code: "7200",
              billing_interval: "year",
            },
          },
          metadata: {
            program: "associate_membership",
            accounting_code: "7200",
            billing_interval: "year",
            member_display_name: "Dr. Claire Martin",
            ambassador_agreed: "true",
            publish_member: "true",
            linkedin_url: "https://www.linkedin.com/in/claire-martin",
          },
          livemode: false,
          created: 1720000000,
          locale: "fr",
        },
      },
    } as unknown as Stripe.Event;

    const result = await handleCheckoutSessionCompleted(
      baseContext(tx, event),
    );
    expect(result.outcome).toBe("processed");

    const contactInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.contacts"),
    );
    expect(contactInsert?.values?.[1]).toBe("Dr. Claire Martin");

    const sessionInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.stripe_checkout_sessions"),
    );
    // Annual subscription keeps donation_type NULL to satisfy CHECK (donation_type IN ('onetime', 'monthly'))
    expect(sessionInsert?.values?.[6]).toBeNull();

    const commitmentInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.recurring_commitments"),
    );
    expect(commitmentInsert?.values?.[6]).toBe("year");
    expect(String(commitmentInsert?.values?.[14])).toContain("7200");
  });

  it("preserves member_display_name and lu locale across checkout.session.completed and invoice.payment_succeeded even when customer.name is a company", async () => {
    const tx = createMockTx();
    const subMetadata = {
      program: "associate_membership",
      accounting_code: "7200",
      billing_interval: "year",
      member_display_name: "Dr. Claire Martin",
      locale: "lu",
    };

    const checkoutEvent = {
      id: "evt_lu_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_lu_1",
          mode: "subscription",
          payment_status: "paid",
          status: "complete",
          amount_total: 48000,
          currency: "eur",
          customer: "cus_corp_1",
          customer_details: {
            email: "claire@example.lu",
            name: "ACME Holding S.A.",
          },
          subscription: {
            id: "sub_lu_1",
            customer: "cus_corp_1",
            status: "active",
            livemode: false,
            current_period_start: 1720000000,
            current_period_end: 1751536000,
            cancel_at_period_end: false,
            items: {
              data: [
                {
                  price: {
                    unit_amount: 48000,
                    currency: "eur",
                    recurring: { interval: "year", interval_count: 1 },
                  },
                },
              ],
            },
            metadata: subMetadata,
          },
          metadata: subMetadata,
          livemode: false,
          created: 1720000000,
          locale: "fr",
        },
      },
    } as unknown as Stripe.Event;

    await handleCheckoutSessionCompleted(baseContext(tx, checkoutEvent));

    const invoiceStripe = {
      subscriptions: {
        retrieve: vi.fn(async () => ({
          id: "sub_lu_1",
          customer: "cus_corp_1",
          status: "active",
          livemode: false,
          current_period_start: 1720000000,
          current_period_end: 1751536000,
          cancel_at_period_end: false,
          items: {
            data: [
              {
                price: {
                  unit_amount: 48000,
                  currency: "eur",
                  recurring: { interval: "year", interval_count: 1 },
                },
              },
            ],
          },
          metadata: subMetadata,
        })),
      },
      customers: {
        retrieve: vi.fn(async () => ({
          id: "cus_corp_1",
          email: "claire@example.lu",
          name: "ACME Holding S.A.",
          preferred_locales: ["fr"],
          deleted: false,
        })),
      },
      checkout: { sessions: { retrieve: vi.fn() } },
    } as unknown as Stripe;

    const invoiceEvent = {
      id: "evt_lu_inv",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_lu_1",
          currency: "eur",
          amount_paid: 48000,
          subscription: "sub_lu_1",
          customer: "cus_corp_1",
          billing_reason: "subscription_create",
          created: 1720000000,
          status_transitions: { paid_at: 1720000000 },
        },
      },
    } as unknown as Stripe.Event;

    const invCtx = baseContext(tx, invoiceEvent);
    invCtx.stripe = invoiceStripe;
    await handleInvoicePaymentSucceeded(invCtx);

    const contactInserts = tx.calls.filter((c) =>
      c.sql.includes("INSERT INTO clarvia.contacts"),
    );
    expect(contactInserts).toHaveLength(2);
    for (const call of contactInserts) {
      expect(call.values?.[1]).toBe("Dr. Claire Martin");
      expect(call.values?.[2]).toBe("lu");
    }

    const sessionInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.stripe_checkout_sessions"),
    );
    expect(sessionInsert?.values?.[13]).toBe("lu");
  });

  it("invoice.payment_succeeded propagates program and accounting_code=7200 from subscription metadata", async () => {
    const tx = createMockTx();
    const stripe = {
      subscriptions: {
        retrieve: vi.fn(async () => ({
          id: "sub_member",
          customer: "cus_member",
          status: "active",
          livemode: false,
          current_period_start: 1720000000,
          current_period_end: 1751536000,
          cancel_at_period_end: false,
          items: {
            data: [
              {
                price: {
                  unit_amount: 48000,
                  currency: "eur",
                  recurring: { interval: "year", interval_count: 1 },
                },
              },
            ],
          },
          metadata: {
            program: "associate_membership",
            accounting_code: "7200",
          },
        })),
      },
      customers: {
        retrieve: vi.fn(async () => ({
          id: "cus_member",
          email: "member@example.org",
          name: "Dr. Claire Martin",
          deleted: false,
        })),
      },
      checkout: { sessions: { retrieve: vi.fn() } },
    } as unknown as Stripe;

    const event = {
      id: "evt_inv_member",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_member_1",
          currency: "eur",
          amount_paid: 48000,
          subscription: "sub_member",
          customer: "cus_member",
          billing_reason: "subscription_create",
          created: 1720000000,
          status_transitions: { paid_at: 1720000000 },
        },
      },
    } as unknown as Stripe.Event;

    const ctx = baseContext(tx, event);
    ctx.stripe = stripe;

    const result = await handleInvoicePaymentSucceeded(ctx);
    expect(result.outcome).toBe("processed");

    const donationInsert = tx.calls.find((c) =>
      c.sql.includes("INSERT INTO clarvia.donations"),
    );
    expect(String(donationInsert?.values?.[14])).toContain('"accounting_code":"7200"');
    expect(String(donationInsert?.values?.[14])).toContain('"program":"associate_membership"');
  });
});
