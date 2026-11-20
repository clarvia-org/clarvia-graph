import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLARVIA_LINKEDIN_URL } from "@/components/LinkedInLink";
import {
  classifyMembershipSessionResponse,
  COHORT_ARCHETYPE_SLOTS,
  computeMemberInitials,
  getRemainingArchetypeSlots,
  normalizeLinkedInProfileUrl,
} from "@/content/associate-members";

const mockSessionCreate = vi.fn();
const mockSessionRetrieve = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockSessionCreate,
        retrieve: mockSessionRetrieve,
      },
    },
  }),
}));

import { GET, POST } from "@/app/api/donate/route";

describe("associate-members helpers", () => {
  it("normalizes personal LinkedIn profile URLs and strips tracking parameters", () => {
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/in/jane-doe/"),
    ).toBe("https://www.linkedin.com/in/jane-doe");
    expect(
      normalizeLinkedInProfileUrl("linkedin.com/in/jean_dupont-lu?trk=public_profile"),
    ).toBe("https://www.linkedin.com/in/jean_dupont-lu");
    expect(
      normalizeLinkedInProfileUrl("https://lu.linkedin.com/in/claire-martin#experience"),
    ).toBe("https://www.linkedin.com/in/claire-martin");
    expect(
      normalizeLinkedInProfileUrl("HTTPS://www.linkedin.com/in/jane-doe"),
    ).toBe("https://www.linkedin.com/in/jane-doe");
  });

  it("rejects company pages, non-LinkedIn domains, credentials, and malformed handles", () => {
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/company/clarvia/"),
    ).toBeNull();
    expect(
      normalizeLinkedInProfileUrl("https://evil-linkedin.com/in/jane-doe"),
    ).toBeNull();
    expect(
      normalizeLinkedInProfileUrl("https://user:pass@www.linkedin.com/in/jane-doe"),
    ).toBeNull();
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/in/ab"),
    ).toBeNull();
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/in/jane/extra"),
    ).toBeNull();
    expect(normalizeLinkedInProfileUrl("")).toBeNull();
  });

  it("computes initials cleanly while skipping honorifics", () => {
    expect(computeMemberInitials("Dr. Claire Martin")).toBe("CM");
    expect(computeMemberInitials("Günther Schriver")).toBe("GS");
    expect(computeMemberInitials("   ")).toBe("AM");
  });

  it("replaces illustrative cohort archetype slots 1-for-1 as members publish", () => {
    expect(getRemainingArchetypeSlots(0)).toHaveLength(
      COHORT_ARCHETYPE_SLOTS.length,
    );
    expect(getRemainingArchetypeSlots(2)).toHaveLength(
      COHORT_ARCHETYPE_SLOTS.length - 2,
    );
    expect(getRemainingArchetypeSlots(99)).toHaveLength(0);
  });

  it("classifies membership session verification strictly by program and settlement status", () => {
    expect(
      classifyMembershipSessionResponse(true, {
        program: "associate_membership",
        payment_status: "paid",
        status: "complete",
        amount: 480,
        currency: "EUR",
        created_date: "2026-11-20",
      }),
    ).toEqual({
      kind: "paid",
      amount: 480,
      currency: "EUR",
      admittedDate: "2026-11-20",
    });

    expect(
      classifyMembershipSessionResponse(true, {
        program: "associate_membership",
        payment_status: "unpaid",
        status: "complete",
      }),
    ).toEqual({ kind: "pending_settlement" });

    // Rejects general /support donations even when paid
    expect(
      classifyMembershipSessionResponse(true, {
        program: "donation",
        payment_status: "paid",
        status: "complete",
      }),
    ).toEqual({ kind: "rejected" });

    // Rejects failed HTTP or missing payloads
    expect(classifyMembershipSessionResponse(false, null)).toEqual({
      kind: "rejected",
    });
  });

  it("wires MembershipSuccessKit to canonical CLARVIA_LINKEDIN_URL", () => {
    expect(CLARVIA_LINKEDIN_URL).toBe(
      "https://www.linkedin.com/company/clarvia-org",
    );
    const kitSource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "features",
        "membership",
        "MembershipSuccessKit.tsx",
      ),
      "utf8",
    );
    expect(kitSource).toContain("CLARVIA_LINKEDIN_URL");
    expect(kitSource).not.toContain("linkedin.com/company/clarvia/");
  });

  it("enforces clean editorial invariants across membership UI (no em-dashes, no RCS/Matricule/Account-7200 jargon, clear non-profit framing, 96px portraits)", () => {
    const uiFiles = [
      "AssociateMembershipPage.tsx",
      "CohortShowcase.tsx",
      "MembershipForm.tsx",
      "MembershipSuccessKit.tsx",
      "membership-copy.ts",
    ];
    for (const file of uiFiles) {
      const content = fs.readFileSync(
        path.join(__dirname, "..", "src", "features", "membership", file),
        "utf8",
      );
      expect(content, `${file} must not contain em-dash`).not.toContain("\u2014");
      expect(content, `${file} must not contain en-dash`).not.toContain("\u2013");
      expect(content, `${file} must not repeat RCS number`).not.toMatch(
        /RCS|F15680|Matricule/i,
      );
      expect(content, `${file} must not expose accounting code 7200`).not.toContain(
        "7200",
      );
      expect(content, `${file} must not contain AI disclaimer`).not.toMatch(
        /synthetic|AI-generated/i,
      );
      expect(content, `${file} must leave tax note to TrustStrip`).not.toMatch(
        /tax-deductible|tax certificate|certificat fiscal|Spendenbescheinigung|Steierzertifikat/i,
      );
    }

    const pageSource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "features",
        "membership",
        "AssociateMembershipPage.tsx",
      ),
      "utf8",
    );
    expect(pageSource).toContain("Registered European Non-Profit");

    const showcaseSource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "features",
        "membership",
        "CohortShowcase.tsx",
      ),
      "utf8",
    );
    expect(showcaseSource).toContain("w-24 h-24");
  });
});

describe("/api/donate associate_membership branch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });
  });

  function makePostRequest(body: Record<string, unknown>, ip = "198.51.100.10") {
    return new NextRequest("https://clarvia.org/api/donate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    });
  }

  it("creates an annual €480 Stripe subscription tagged with Account 7200 and subscription_data metadata", async () => {
    const res = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          type: "annual",
          lang: "fr",
          memberName: "Dr. Claire Martin",
          ambassadorAgreed: true,
          publishMember: true,
          linkedinUrl: "fr.linkedin.com/in/claire-martin?utm_source=share",
          marketingOptIn: true,
          amount: 1, // Tampered client amount must be ignored
        },
        "198.51.100.11",
      ),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");

    expect(mockSessionCreate).toHaveBeenCalledTimes(1);
    const arg = mockSessionCreate.mock.calls[0][0];
    expect(arg.mode).toBe("subscription");
    expect(arg.line_items[0].price_data.unit_amount).toBe(48000);
    expect(arg.line_items[0].price_data.recurring.interval).toBe("year");
    expect(arg.success_url).toBe(
      "https://clarvia.org/fr/membership?joined=true&session_id={CHECKOUT_SESSION_ID}",
    );
    expect(arg.metadata).toMatchObject({
      program: "associate_membership",
      accounting_code: "7200",
      billing_interval: "year",
      member_display_name: "Dr. Claire Martin",
      ambassador_agreed: "true",
      publish_member: "true",
      linkedin_url: "https://www.linkedin.com/in/claire-martin",
      marketing_opt_in: "true",
    });
    expect(arg.metadata.donation_type).toBeUndefined();
    expect(arg.subscription_data.metadata).toEqual(arg.metadata);
  });

  it("creates a monthly €40 Stripe subscription for private registration without LinkedIn URL", async () => {
    const res = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          type: "monthly",
          lang: "../../evil", // Unsafe lang must sanitize to "en"
          memberName: "Jean Dupont",
          ambassadorAgreed: true,
          publishMember: false,
        },
        "198.51.100.12",
      ),
    );

    expect(res.status).toBe(200);
    const arg = mockSessionCreate.mock.calls[0][0];
    expect(arg.line_items[0].price_data.unit_amount).toBe(4000);
    expect(arg.line_items[0].price_data.recurring.interval).toBe("month");
    expect(arg.success_url).toBe(
      "https://clarvia.org/en/membership?joined=true&session_id={CHECKOUT_SESSION_ID}",
    );
    expect(arg.metadata.donation_type).toBe("monthly");
    expect(arg.metadata.publish_member).toBe("false");
    expect(arg.metadata.linkedin_url).toBeUndefined();
  });

  it("rejects missing ambassador agreement or invalid LinkedIn URL when publishMember is true", async () => {
    const noCharter = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          type: "monthly",
          memberName: "Jean Dupont",
          ambassadorAgreed: false,
        },
        "198.51.100.13",
      ),
    );
    expect(noCharter.status).toBe(400);

    const badLinkedIn = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          type: "monthly",
          memberName: "Jean Dupont",
          ambassadorAgreed: true,
          publishMember: true,
          linkedinUrl: "https://www.linkedin.com/company/acme",
        },
        "198.51.100.14",
      ),
    );
    expect(badLinkedIn.status).toBe(400);
  });

  it("returns non-PII verification metadata from GET /api/donate", async () => {
    mockSessionRetrieve.mockResolvedValue({
      id: "cs_test_verified",
      payment_status: "paid",
      status: "complete",
      amount_total: 48000,
      currency: "eur",
      created: 1795132800,
      customer_details: {
        name: "Dr. Secret Name",
        email: "secret@example.org",
      },
      metadata: {
        program: "associate_membership",
        billing_interval: "year",
      },
    });

    const req = new NextRequest(
      "https://clarvia.org/api/donate?session_id=cs_test_verified",
      { headers: { "x-forwarded-for": "198.51.100.15" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      id: "cs_test_verified",
      payment_status: "paid",
      status: "complete",
      amount: 480,
      currency: "EUR",
      program: "associate_membership",
      billing_interval: "year",
      created_date: "2026-11-20",
    });
    expect(data.name).toBeUndefined();
    expect(data.email).toBeUndefined();
  });
});
