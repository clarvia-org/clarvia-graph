import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { rateLimit } from "@/lib/rate-limit";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "";
const DATA_DIR = path.join(process.cwd(), ".data");
const SUBS_FILE = path.join(DATA_DIR, "subscribers.json");

const limiter = rateLimit("subscribe", 5, 60_000);

async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // skip in dev
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

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

  try {
    const body = await req.json();
    const { email, turnstileToken } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (TURNSTILE_SECRET && !turnstileToken) {
      return NextResponse.json({ error: "Bot check failed" }, { status: 400 });
    }

    if (TURNSTILE_SECRET) {
      const ok = await verifyTurnstile(turnstileToken);
      if (!ok) return NextResponse.json({ error: "Bot check failed" }, { status: 403 });
    }

    // Ensure data dir exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Read existing subscribers
    let subscribers: { email: string; date: string }[] = [];
    try {
      const raw = await fs.readFile(SUBS_FILE, "utf-8");
      subscribers = JSON.parse(raw);
    } catch { /* file doesn't exist yet */ }

    // Deduplicate
    if (subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ ok: true, message: "Already subscribed" });
    }

    subscribers.push({ email: email.trim().toLowerCase(), date: new Date().toISOString() });
    await fs.writeFile(SUBS_FILE, JSON.stringify(subscribers, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
