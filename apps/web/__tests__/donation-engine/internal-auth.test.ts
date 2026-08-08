import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  signPayload,
  verifyInternalAuth,
} from "@/lib/donation-engine/internal-auth";

const SECRET = "test-hmac-secret";

function headersFor(body: string, timestamp?: string) {
  const ts = timestamp ?? new Date().toISOString();
  const signature = signPayload(SECRET, ts, body);
  return new Headers({
    "x-clarvia-timestamp": ts,
    "x-clarvia-signature": signature,
  });
}

describe("internal-auth", () => {
  beforeEach(() => {
    vi.stubEnv("INTERNAL_HMAC_SECRET", SECRET);
  });

  it("accepts a valid signature", () => {
    const body = JSON.stringify({ jobId: "00000000-0000-4000-8000-000000000001", worker: "n8n" });
    const result = verifyInternalAuth(headersFor(body), body, SECRET);
    expect(result.valid).toBe(true);
  });

  it("rejects missing timestamp", () => {
    const body = "{}";
    const headers = new Headers({
      "x-clarvia-signature": "abc",
    });
    const result = verifyInternalAuth(headers, body, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Timestamp/i);
  });

  it("rejects missing signature", () => {
    const body = "{}";
    const headers = new Headers({
      "x-clarvia-timestamp": new Date().toISOString(),
    });
    const result = verifyInternalAuth(headers, body, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Signature/i);
  });

  it("rejects expired timestamp", () => {
    const body = "{}";
    const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const result = verifyInternalAuth(headersFor(body, old), body, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/window/i);
  });

  it("rejects invalid signature", () => {
    const body = "{}";
    const ts = new Date().toISOString();
    const headers = new Headers({
      "x-clarvia-timestamp": ts,
      "x-clarvia-signature": "00".repeat(32),
    });
    const result = verifyInternalAuth(headers, body, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/signature/i);
  });
});
