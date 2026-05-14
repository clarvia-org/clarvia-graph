import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "";
const DATA_DIR = path.join(process.cwd(), ".data");
const CONTACT_FILE = path.join(DATA_DIR, "contact.json");

async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, turnstileToken } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (TURNSTILE_SECRET && !turnstileToken) {
      return NextResponse.json({ error: "Bot check failed" }, { status: 400 });
    }

    if (TURNSTILE_SECRET) {
      const ok = await verifyTurnstile(turnstileToken);
      if (!ok) return NextResponse.json({ error: "Bot check failed" }, { status: 403 });
    }

    await fs.mkdir(DATA_DIR, { recursive: true });

    let entries: any[] = [];
    try {
      const raw = await fs.readFile(CONTACT_FILE, "utf-8");
      entries = JSON.parse(raw);
    } catch { /* file doesn't exist yet */ }

    entries.push({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || "",
      message: message.trim(),
      date: new Date().toISOString(),
    });

    await fs.writeFile(CONTACT_FILE, JSON.stringify(entries, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
