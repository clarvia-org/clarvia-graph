/**
 * Internal authentication for n8n-to-website calls.
 *
 * Uses HMAC-SHA256 signing per blueprint §5.3:
 *   X-Clarvia-Timestamp: 2026-07-11T12:34:56Z
 *   X-Clarvia-Signature: hex(HMAC-SHA256(secret, timestamp + "." + rawBody))
 *
 * The app must:
 *   - Reject timestamps older than five minutes
 *   - Compare signatures in constant time
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Signing (used by tests or internal callers)
// ---------------------------------------------------------------------------

/**
 * Create an HMAC-SHA256 signature for the given timestamp and body.
 */
export function signPayload(
  secret: string,
  timestamp: string,
  body: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

export interface VerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify an incoming internal API request.
 *
 * Reads `X-Clarvia-Timestamp` and `X-Clarvia-Signature` headers,
 * checks timestamp freshness, and performs constant-time signature
 * comparison.
 */
export function verifyInternalAuth(
  headers: {
    get(name: string): string | null;
  },
  rawBody: string,
  secret?: string,
): VerificationResult {
  const hmacSecret = secret ?? process.env.INTERNAL_HMAC_SECRET;
  if (!hmacSecret) {
    return { valid: false, error: "INTERNAL_HMAC_SECRET is not configured" };
  }

  const timestamp = headers.get("x-clarvia-timestamp");
  const signature = headers.get("x-clarvia-signature");

  if (!timestamp) {
    return { valid: false, error: "Missing X-Clarvia-Timestamp header" };
  }

  if (!signature) {
    return { valid: false, error: "Missing X-Clarvia-Signature header" };
  }

  // Reject timestamps older than 5 minutes
  const requestTime = new Date(timestamp).getTime();
  if (isNaN(requestTime)) {
    return { valid: false, error: "Invalid timestamp format" };
  }

  const age = Date.now() - requestTime;
  if (age > MAX_AGE_MS || age < -MAX_AGE_MS) {
    return { valid: false, error: "Timestamp outside allowed window" };
  }

  // Constant-time comparison
  const expected = signPayload(hmacSecret, timestamp, rawBody);

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: "Invalid signature" };
  }

  if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true };
}
