import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLARVIA_LINKEDIN_URL } from "@/components/LinkedInLink";
import { CLARVIA_BANK_ACCOUNT } from "@/features/donations/BankTransferDetails";
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
  it("normalizes personal and organization LinkedIn URLs and strips tracking parameters", () => {
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
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/company/clarvia/"),
    ).toBe("https://www.linkedin.com/company/clarvia");
    expect(
      normalizeLinkedInProfileUrl("linkedin.com/company/ey?trk=x"),
    ).toBe("https://www.linkedin.com/company/ey");
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/school/insead/"),
    ).toBe("https://www.linkedin.com/school/insead");
  });

  it("rejects feed/post URLs, non-LinkedIn domains, credentials, and malformed handles", () => {
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/posts/update-123"),
    ).toBeNull();
    expect(
      normalizeLinkedInProfileUrl("https://www.linkedin.com/feed/"),
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
      normalizeLinkedInProfileUrl("https://www.linkedin.com/company/a"),
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

  it("enforces editorial, SEO, and Ad Grants semantic invariants across membership UI", () => {
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
      expect(content, `${file} must not expose Matricule`).not.toMatch(/Matricule/i);
      expect(content, `${file} must not expose accounting code 7200`).not.toContain(
        "7200",
      );
      expect(content, `${file} must not contain AI disclaimer`).not.toMatch(
        /synthetic|AI-generated/i,
      );
      expect(
        content,
        `${file} must never claim tax deductibility or French RUP`,
      ).not.toMatch(
        /tax-deductible|tax certificate|déduction fiscale|reçu fiscal|certificat fiscal|utilité publique|steuerlich absetzbar|Spendenbescheinigung|Steierzertifikat/i,
      );
      expect(
        content,
        `${file} must never restrict mission geographically as European`,
      ).not.toMatch(/European|européen|europäisch|europäesch/i);
      expect(
        content,
        `${file} must never promote Ask Clarvia LLM compute on /membership`,
      ).not.toMatch(/Ask Clarvia/i);
    }

    const heroAndFormFiles = [
      "AssociateMembershipPage.tsx",
      "CohortShowcase.tsx",
      "MembershipForm.tsx",
      "MembershipSuccessKit.tsx",
    ];
    for (const file of heroAndFormFiles) {
      const content = fs.readFileSync(
        path.join(__dirname, "..", "src", "features", "membership", file),
        "utf8",
      );
      expect(
        content,
        `${file} must keep Hero, Form, and Cohort Showcase globally positioned without Luxembourg/RCS`,
      ).not.toMatch(/Luxembourg|Luxemburg|Lëtzebuerg|RCS|F15680/i);
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
    expect(pageSource).toContain("Registered Nonprofit Organization");
    // Ensure <dl> proof strip only wraps <dt> and <dd> inside <div> (valid HTML5 + axe definition-list)
    const dlMatch = pageSource.match(/<dl[\s\S]*?<\/dl>/);
    expect(dlMatch).not.toBeNull();
    expect(dlMatch?.[0]).not.toContain("<p");

    const copySource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "features",
        "membership",
        "membership-copy.ts",
      ),
      "utf8",
    );
    for (const phrase of [
      "nonprofit organization",
      "corporate social responsibility",
      "corporate philanthropy",
      "ESG strategy",
      "charity partner",
      "nonprofit partner",
      "charity trustee",
      "philanthropy foundation",
      "international NGO",
      "legacy giving",
      "Luxembourg ASBL",
      "RCS F15680",
      "association à but non lucratif",
      "responsabilité sociétale",
      "mécénat d'entreprise",
      "intérêt général",
      "gemeinnütziger Verein",
      "Fördermitgliedschaft",
      "CSR-Strategie",
      "soziales Engagement",
    ]) {
      expect(copySource, `membership-copy.ts must include "${phrase}"`).toContain(
        phrase,
      );
    }

    const routePageSource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "app",
        "[lang]",
        "membership",
        "page.tsx",
      ),
      "utf8",
    );
    expect(routePageSource).toContain("robots: { index: true, follow: true }");
    expect(routePageSource).toContain("https://clarvia.org/#organization");
    expect(routePageSource).toContain("https://clarvia.org/#website");
    expect(routePageSource).not.toContain("NonprofitType");

    const formSource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "features",
        "membership",
        "MembershipForm.tsx",
      ),
      "utf8",
    );
    expect(formSource).not.toContain("MarketingConsent");

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

  it("creates an organization €480 Stripe subscription with normalized company LinkedIn URL", async () => {
    const res = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          memberKind: "organization",
          type: "annual",
          lang: "en",
          memberName: "Nordisk Care Partners",
          ambassadorAgreed: true,
          publishMember: true,
          linkedinUrl: "linkedin.com/company/nordisk-care?trk=org",
        },
        "198.51.100.16",
      ),
    );

    expect(res.status).toBe(200);
    const arg = mockSessionCreate.mock.calls[0][0];
    expect(arg.metadata).toMatchObject({
      program: "associate_membership",
      accounting_code: "7200",
      member_kind: "organization",
      billing_interval: "year",
      member_display_name: "Nordisk Care Partners",
      publish_member: "true",
      linkedin_url: "https://www.linkedin.com/company/nordisk-care",
    });
    expect(arg.metadata.marketing_opt_in).toBeUndefined();
    expect(arg.subscription_data.metadata).toEqual(arg.metadata);
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
          linkedinUrl: "https://www.linkedin.com/posts/update-123",
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

  it("preserves valid gclid across Stripe success_url and cancel_url without encoding CHECKOUT_SESSION_ID", async () => {
    const gclid = "EAIaIQobChMI1234567890_abc-XYZ";
    const membershipRes = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          type: "annual",
          lang: "de",
          memberName: "Dr. Lukas Weber",
          ambassadorAgreed: true,
          publishMember: false,
          attribution: { gclid },
        },
        "198.51.100.16",
      ),
    );
    expect(membershipRes.status).toBe(200);
    const membershipArg = mockSessionCreate.mock.calls[0][0];
    expect(membershipArg.success_url).toBe(
      `https://clarvia.org/de/membership?joined=true&session_id={CHECKOUT_SESSION_ID}&gclid=${gclid}`,
    );
    expect(membershipArg.cancel_url).toBe(
      `https://clarvia.org/de/membership?gclid=${gclid}`,
    );

    const donationRes = await POST(
      makePostRequest(
        {
          amount: 25,
          type: "onetime",
          lang: "en",
          attribution: { gclid },
        },
        "198.51.100.17",
      ),
    );
    expect(donationRes.status).toBe(200);
    const donationArg = mockSessionCreate.mock.calls[1][0];
    expect(donationArg.success_url).toBe(
      `https://clarvia.org/en/support?donated=true&session_id={CHECKOUT_SESSION_ID}&gclid=${gclid}`,
    );
    expect(donationArg.cancel_url).toBe(
      `https://clarvia.org/en/support?gclid=${gclid}`,
    );
  });

  it("drops malformed attribution gclid from Stripe redirect URLs", async () => {
    const res = await POST(
      makePostRequest(
        {
          program: "associate_membership",
          type: "monthly",
          lang: "en",
          memberName: "Marie Claire",
          ambassadorAgreed: true,
          publishMember: false,
          attribution: { gclid: "bad&next=https://evil.example" },
        },
        "198.51.100.18",
      ),
    );
    expect(res.status).toBe(200);
    const arg = mockSessionCreate.mock.calls[0][0];
    expect(arg.success_url).toBe(
      "https://clarvia.org/en/membership?joined=true&session_id={CHECKOUT_SESSION_ID}",
    );
    expect(arg.cancel_url).toBe("https://clarvia.org/en/membership");
  });

  it("wires trackMembershipComplete rather than trackDonationComplete in MembershipSuccessKit", async () => {
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
    expect(kitSource).toContain("trackMembershipComplete");
    expect(kitSource).not.toContain("trackDonationComplete");

    const formSource = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "src",
        "features",
        "membership",
        "MembershipForm.tsx",
      ),
      "utf8",
    );
    expect(formSource).toContain("await trackBeginCheckout(");
  });

  it("uses POST Luxembourg bank details and comfort note without legacy Paysera references", () => {
    expect(CLARVIA_BANK_ACCOUNT).toEqual({
      iban: "LU21 1114 0008 4156 0000",
      bic: "CCPLLULLXXX",
      holder: "Clarvia ASBL",
      rcs: "F15680",
      bankName: "POST Luxembourg",
      bankUrl: "https://www.post.lu/",
    });

    const bankFiles = [
      path.join("donations", "BankTransferDetails.tsx"),
      path.join("donations", "DonationLandingPage.tsx"),
      path.join("membership", "AssociateMembershipPage.tsx"),
    ];
    for (const relPath of bankFiles) {
      const content = fs.readFileSync(
        path.join(__dirname, "..", "src", "features", relPath),
        "utf8",
      );
      expect(content, `${relPath} must not contain Paysera`).not.toMatch(/Paysera/i);
      expect(content, `${relPath} must not contain old BIC`).not.toContain("EVIULT2VXXX");
      expect(content, `${relPath} must not contain old IBAN`).not.toContain("LT09 3500 0100 1903 8740");
    }

    const bankDetailsSource = fs.readFileSync(
      path.join(__dirname, "..", "src", "features", "donations", "BankTransferDetails.tsx"),
      "utf8",
    );
    expect(bankDetailsSource).toContain("We bank with ");
    expect(bankDetailsSource).toContain(
      ", a state-owned postal financial institution founded in 1842 that supports nonprofits and provides no-barrier banking access regardless of income.",
    );
    expect(bankDetailsSource).not.toContain("\u2014");
    expect(bankDetailsSource).not.toContain("\u2013");
  });
});
