/**
 * Internal Stripe event processor — called by n8n dispatcher.
 *
 * Auth: HMAC per blueprint §5.3.
 * Body: { jobId, worker } only — no donor data.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { verifyInternalAuth } from "@/lib/donation-engine/internal-auth";
import {
  JobValidationError,
  processStripeAutomationJob,
} from "@/lib/donation-engine/stripe-handlers/process-job";

export const runtime = "nodejs";

const requestSchema = z.object({
  jobId: z.uuid(),
  worker: z.string().min(1).max(120),
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const auth = verifyInternalAuth(req.headers, rawBody);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: 401 },
    );
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  try {
    const result = await processStripeAutomationJob(
      {
        jobId: parsed.jobId,
        worker: parsed.worker,
      },
      stripe,
    );

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof JobValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.httpStatus },
      );
    }

    console.error("[internal/stripe/process] Processing failed:", error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 },
    );
  }
}
