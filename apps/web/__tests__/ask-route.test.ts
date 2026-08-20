import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("fs", () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockRejectedValue(new Error("missing")),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

import { POST } from "@/app/api/ask/route";

const QUESTION =
  "My father died last week in Paris. I live in France. What do I need to do first?";

function askRequest(
  body: object,
  ip = `203.0.113.${Math.ceil(Math.random() * 200)}`
): NextRequest {
  return new NextRequest("http://localhost:3000/api/ask", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ask", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("LEX_ASK_URL", "https://lex.example.test/v1/ask");
    vi.stubEnv("LEX_WEBSITE_HMAC_SECRET", "ask-test-secret");
    vi.stubEnv("TURNSTILE_SECRET", "");
  });

  it("returns 400 without consent", async () => {
    const res = await POST(
      askRequest({
        email: "user@example.com",
        question: QUESTION,
        consent: false,
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/consent/i);
  });

  it("returns 400 for an invalid email", async () => {
    const res = await POST(
      askRequest({
        email: "not-an-email",
        question: QUESTION,
        consent: true,
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/email/i);
  });

  it("returns 400 for a short question", async () => {
    const res = await POST(
      askRequest({
        email: "user@example.com",
        question: "too short",
        consent: true,
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/sentence/i);
  });

  it("returns 503 when Lex ingest is not configured", async () => {
    vi.stubEnv("LEX_ASK_URL", "");
    vi.stubEnv("LEX_WEBSITE_HMAC_SECRET", "");
    const res = await POST(
      askRequest({
        email: "user@example.com",
        question: QUESTION,
        consent: true,
      })
    );
    expect(res.status).toBe(503);
  });

  it("forwards a signed payload to Lex", async () => {
    const fetchMock = vi.fn(
      async (url: string | URL, _init?: RequestInit): Promise<Response> => {
        const href = String(url);
        if (href.includes("metadata.google.internal")) {
          return new Response("missing", { status: 404 });
        }
        return new Response(JSON.stringify({ status: "accepted" }), { status: 202 });
      }
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      askRequest({
        email: "user@example.com",
        question: QUESTION,
        consent: true,
      })
    );
    expect(res.status).toBe(200);
    const lexCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/v1/ask")
    );
    expect(lexCalls).toHaveLength(1);
    const init = lexCalls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Lex-Signature"]).toMatch(/^[a-f0-9]+$/);
    expect(headers["X-Lex-Timestamp"]).toBeTruthy();
    const sent = JSON.parse(String(init.body));
    expect(sent.email).toBe("user@example.com");
    expect(sent.question).toBe(QUESTION);
    expect(sent.consent).toBe(true);
  });
});
