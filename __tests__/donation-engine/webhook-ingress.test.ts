/**
 * Tests for the Stripe webhook durable ingress route.
 *
 * Tests:
 *   1. Webhook duplicate delivery → one inbox row, one job
 *   2. DB transaction failure → 500 response
 *   3. Valid event → 200 with { received: true, duplicate: false }
 *   4. Duplicate event → 200 with { received: true, duplicate: true }
 *   5. Missing/invalid Stripe signature → 400
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be defined before importing the route
// ---------------------------------------------------------------------------

// Mock the db module
const mockTransaction = vi.fn();
vi.mock("@/lib/donation-engine/db", () => ({
  db: {
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

// Mock the webhook inbox
const mockIngestWebhookEvent = vi.fn();
vi.mock("@/lib/donation-engine/webhook-inbox", () => ({
  ingestWebhookEvent: (...args: unknown[]) =>
    mockIngestWebhookEvent(...args),
}));

// Mock the job queue
const mockKickAutomation = vi.fn();
vi.mock("@/lib/donation-engine/job-queue", () => ({
  kickAutomation: (...args: unknown[]) => mockKickAutomation(...args),
}));

// Mock Stripe client
const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  }),
}));

// Mock next/server's after()
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>(
    "next/server",
  );
  return {
    ...actual,
    after: (fn: () => Promise<void>) => {
      // Execute immediately in tests
      fn().catch(() => {});
    },
  };
});

// Set env before importing route
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret");

// Import the route handler
import { POST } from "@/app/api/stripe/webhook/route";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(opts?: {
  body?: string;
  signature?: string | null;
}): NextRequest {
  const body = opts?.body ?? '{"id":"evt_test","type":"checkout.session.completed"}';
  const headers = new Headers({
    "content-type": "application/json",
  });
  if (opts?.signature !== null) {
    headers.set("stripe-signature", opts?.signature ?? "t=1234,v1=abcdef");
  }

  return new NextRequest("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    headers,
    body,
  });
}

const MOCK_STRIPE_EVENT = {
  id: "evt_test_123",
  type: "checkout.session.completed",
  api_version: "2024-06-20",
  livemode: false,
  created: 1720000000,
  data: { object: {} },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: Stripe signature verification succeeds
    mockConstructEvent.mockReturnValue(MOCK_STRIPE_EVENT);

    // Default: db.transaction calls the callback with a mock tx
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({});
    });

    // Default: ingestWebhookEvent returns a new event
    mockIngestWebhookEvent.mockResolvedValue({
      duplicate: false,
      jobId: "job_test_123",
    });

    // Default: kickAutomation resolves
    mockKickAutomation.mockResolvedValue(undefined);
  });

  // -------------------------------------------------------------------------
  // Test 1: Missing Stripe signature → 400
  // -------------------------------------------------------------------------
  it("returns 400 when stripe-signature header is missing", async () => {
    // Remove the signature header
    const headersInit = new Headers({ "content-type": "application/json" });
    const reqNoSig = new NextRequest(
      "http://localhost:3000/api/stripe/webhook",
      { method: "POST", headers: headersInit, body: "{}" },
    );

    const res = await POST(reqNoSig);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing signature");
  });

  // -------------------------------------------------------------------------
  // Test 2: Invalid Stripe signature → 400
  // -------------------------------------------------------------------------
  it("returns 400 when Stripe signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const req = createRequest();
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid signature");
  });

  // -------------------------------------------------------------------------
  // Test 3: Valid event → 200 with { received: true, duplicate: false }
  // -------------------------------------------------------------------------
  it("returns 200 with received:true and duplicate:false for a valid new event", async () => {
    const req = createRequest();
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ received: true, duplicate: false });

    // Verify the transaction was called
    expect(mockTransaction).toHaveBeenCalledOnce();

    // Verify ingestWebhookEvent was called with correct params
    expect(mockIngestWebhookEvent).toHaveBeenCalledOnce();
    const [, params] = mockIngestWebhookEvent.mock.calls[0];
    expect(params.provider).toBe("stripe");
    expect(params.externalEventId).toBe("evt_test_123");
    expect(params.eventType).toBe("checkout.session.completed");

    // Verify kickAutomation was called for the new job
    expect(mockKickAutomation).toHaveBeenCalledWith("job_test_123");
  });

  // -------------------------------------------------------------------------
  // Test 4: Duplicate event → 200 with { received: true, duplicate: true }
  // -------------------------------------------------------------------------
  it("returns 200 with received:true and duplicate:true for a duplicate event", async () => {
    mockIngestWebhookEvent.mockResolvedValue({
      duplicate: true,
      jobId: null,
    });

    const req = createRequest();
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ received: true, duplicate: true });

    // Should NOT kick automation for a duplicate
    expect(mockKickAutomation).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Test 5: DB transaction failure → 500 response
  // -------------------------------------------------------------------------
  it("returns 500 when database transaction fails", async () => {
    mockTransaction.mockRejectedValue(
      new Error("Connection refused"),
    );

    const req = createRequest();
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Durable ingestion failed");
  });

  // -------------------------------------------------------------------------
  // Test 6: Duplicate delivery produces one inbox row, one job
  // -------------------------------------------------------------------------
  it("calls ingestWebhookEvent once per request, even for the same event", async () => {
    // First delivery — new event
    mockIngestWebhookEvent.mockResolvedValueOnce({
      duplicate: false,
      jobId: "job_1",
    });

    const req1 = createRequest();
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    expect((await res1.json()).duplicate).toBe(false);

    // Second delivery — same event, now a duplicate
    mockIngestWebhookEvent.mockResolvedValueOnce({
      duplicate: true,
      jobId: null,
    });

    const req2 = createRequest();
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    expect((await res2.json()).duplicate).toBe(true);

    // ingestWebhookEvent was called twice total
    expect(mockIngestWebhookEvent).toHaveBeenCalledTimes(2);

    // kickAutomation was called only once (for the first non-duplicate)
    expect(mockKickAutomation).toHaveBeenCalledTimes(1);
    expect(mockKickAutomation).toHaveBeenCalledWith("job_1");
  });
});
