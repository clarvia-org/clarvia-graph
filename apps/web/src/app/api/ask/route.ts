import { createHmac } from "node:crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { signPayload } from "@/lib/donation-engine/internal-auth";
import { isPlausibleEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const DATA_DIR = path.join(process.cwd(), ".data");
const CONSENT_FILE = path.join(DATA_DIR, "ask-consent.json");

export const CONSENT_TEXT_VERSION = "ask-consent-v1";
export const MIN_QUESTION_CHARS = 20;
export const MAX_QUESTION_CHARS = 100_000;

const limiter = rateLimit("ask", 3, 60 * 60 * 1000);

interface ConsentLedgerEntry {
  timestamp: string;
  consent_text_version: string;
  channel: "web";
  sender_hmac: string;
  turnstile_passed: boolean;
  ip_hmac: string;
}

async function verifyTurnstile(secret: string, token: string): Promise<boolean> {
  if (!secret) return true;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

function hmacHex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

async function googleIdentityToken(audience: string): Promise<string | undefined> {
  const explicit = process.env.LEX_ASK_ID_TOKEN;
  if (explicit) return explicit;
  try {
    const res = await fetch(
      `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`,
      {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(2000),
      }
    );
    if (res.status === 200) {
      const token = (await res.text()).trim();
      return token || undefined;
    }
  } catch {
    /* Local runs and hosts without the GCE metadata server. */
  }
  return undefined;
}

async function appendConsent(entry: ConsentLedgerEntry): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let entries: ConsentLedgerEntry[] = [];
  try {
    const raw = await fs.readFile(CONSENT_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) entries = parsed;
  } catch {
    /* file doesn't exist yet */
  }
  entries.push(entry);
  await fs.writeFile(CONSENT_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(req: NextRequest) {
  const turnstileSecret = process.env.TURNSTILE_SECRET || "";
  const lexAskUrl = process.env.LEX_ASK_URL || "";
  const websiteHmacSecret = process.env.LEX_WEBSITE_HMAC_SECRET || "";

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = limiter(ip);
  if (!allowed) {
    return Response.json(
      { error: "Please wait a bit before asking again." },
      {
        status: 429,
        headers: retryAfterMs
          ? { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) }
          : undefined,
      }
    );
  }

  if (!lexAskUrl || !websiteHmacSecret) {
    console.error("Ask ingest is not configured (LEX_ASK_URL / LEX_WEBSITE_HMAC_SECRET).");
    return NextResponse.json(
      { error: "We're temporarily unable to take questions. Please try again shortly." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const consent = body.consent === true;
    const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";

    if (!consent) {
      return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    }
    if (!isPlausibleEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (question.length < MIN_QUESTION_CHARS) {
      return NextResponse.json(
        { error: "Please describe your situation in at least a sentence or two." },
        { status: 400 }
      );
    }
    if (question.length > MAX_QUESTION_CHARS) {
      return NextResponse.json({ error: "Please shorten your question a little." }, { status: 400 });
    }
    if (turnstileSecret && !turnstileToken) {
      return NextResponse.json({ error: "Bot check failed" }, { status: 400 });
    }
    if (turnstileSecret) {
      const ok = await verifyTurnstile(turnstileSecret, turnstileToken);
      if (!ok) return NextResponse.json({ error: "Bot check failed" }, { status: 403 });
    }

    const payload = JSON.stringify({ email, question, consent: true });
    const timestamp = new Date().toISOString();
    const signature = signPayload(websiteHmacSecret, timestamp, payload);
    const audience = new URL(lexAskUrl).origin;
    const identityToken = await googleIdentityToken(audience);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Lex-Timestamp": timestamp,
      "X-Lex-Signature": signature,
    };
    if (identityToken) {
      headers.Authorization = `Bearer ${identityToken}`;
    }

    const lexRes = await fetch(lexAskUrl, {
      method: "POST",
      headers,
      body: payload,
    });

    if (lexRes.status === 202) {
      await appendConsent({
        timestamp,
        consent_text_version: CONSENT_TEXT_VERSION,
        channel: "web",
        sender_hmac: hmacHex(websiteHmacSecret, email),
        turnstile_passed: true,
        ip_hmac: hmacHex(websiteHmacSecret, ip),
      });
      return NextResponse.json({ ok: true });
    }

    if (lexRes.status === 503) {
      return NextResponse.json(
        { error: "We're temporarily unable to take questions. Please try again shortly." },
        { status: 503 }
      );
    }

    if (lexRes.status === 400) {
      let code = "";
      try {
        const lexBody = await lexRes.json();
        code = typeof lexBody.code === "string" ? lexBody.code : "";
      } catch {
        /* ignore */
      }
      if (code === "consent_required") {
        return NextResponse.json({ error: "Consent is required." }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Please check your question and email, then try again." },
        { status: 400 }
      );
    }

    console.error("Lex ask ingest failed", { status: lexRes.status });
    return NextResponse.json(
      { error: "We're temporarily unable to take questions. Please try again shortly." },
      { status: 503 }
    );
  } catch (err: unknown) {
    console.error("Ask error:", err);
    return NextResponse.json(
      { error: "We're temporarily unable to take questions. Please try again shortly." },
      { status: 500 }
    );
  }
}
