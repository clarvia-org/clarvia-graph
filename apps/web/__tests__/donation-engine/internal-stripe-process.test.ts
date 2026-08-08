import { describe, it, expect, vi, beforeEach } from "vitest";
import { signPayload } from "@/lib/donation-engine/internal-auth";

const SECRET = "test-hmac-secret";
const JOB_ID = "11111111-1111-4111-8111-111111111111";
const WORKER = "n8n-dispatcher-test";

const mockProcessStripeAutomationJob = vi.fn();
vi.mock("@/lib/donation-engine/stripe-handlers/process-job", () => ({
  processStripeAutomationJob: (...args: unknown[]) =>
    mockProcessStripeAutomationJob(...args),
  JobValidationError: class JobValidationError extends Error {
    code: string;
    httpStatus: number;
    constructor(message: string, code: string, httpStatus: number) {
      super(message);
      this.code = code;
      this.httpStatus = httpStatus;
    }
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({}),
}));

vi.stubEnv("INTERNAL_HMAC_SECRET", SECRET);

import { POST } from "@/app/api/internal/automation/stripe/process/route";
import { NextRequest } from "next/server";
import { JobValidationError } from "@/lib/donation-engine/stripe-handlers/process-job";

function signedRequest(body: object): NextRequest {
  const rawBody = JSON.stringify(body);
  const timestamp = new Date().toISOString();
  const signature = signPayload(SECRET, timestamp, rawBody);
  return new NextRequest(
    "http://localhost:3000/api/internal/automation/stripe/process",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-clarvia-timestamp": timestamp,
        "x-clarvia-signature": signature,
      },
      body: rawBody,
    },
  );
}

describe("POST /api/internal/automation/stripe/process", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessStripeAutomationJob.mockResolvedValue({
      status: "processed",
      eventType: "checkout.session.completed",
    });
  });

  it("returns 401 without HMAC headers", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/internal/automation/stripe/process",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId: JOB_ID, worker: WORKER }),
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const rawBody = JSON.stringify({ worker: WORKER });
    const timestamp = new Date().toISOString();
    const signature = signPayload(SECRET, timestamp, rawBody);
    const req = new NextRequest(
      "http://localhost:3000/api/internal/automation/stripe/process",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-clarvia-timestamp": timestamp,
          "x-clarvia-signature": signature,
        },
        body: rawBody,
      },
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when job is not leased", async () => {
    mockProcessStripeAutomationJob.mockRejectedValue(
      new JobValidationError("Job is not in leased state", "job_not_leased", 409),
    );

    const res = await POST(signedRequest({ jobId: JOB_ID, worker: WORKER }));
    expect(res.status).toBe(409);
  });

  it("returns 200 for successful processing", async () => {
    const res = await POST(signedRequest({ jobId: JOB_ID, worker: WORKER }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.status).toBe("processed");
    expect(mockProcessStripeAutomationJob).toHaveBeenCalledWith(
      { jobId: JOB_ID, worker: WORKER },
      expect.any(Object),
    );
  });
});
