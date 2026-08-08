# Security Policy

## Supported repositories

This policy applies to `workflow-web`.

---

## Reporting a vulnerability

Please do not report security vulnerabilities through public GitHub issues.

If GitHub private vulnerability reporting is enabled, use that channel.

If private vulnerability reporting is not available, report the issue privately to a Clarvia maintainer or organization owner.

A dedicated security reporting address will be published once available.

---

## What to report

Please report:

- exposed secrets,
- dependency vulnerabilities,
- build or deployment misconfigurations,
- authentication or authorization issues,
- data exposure risks,
- supply-chain risks,
- or vulnerabilities affecting the public website or generated outputs.

---

## Sensitive data

Clarvia does not intend to collect personal bereavement case data in phase one.

Please do not submit:

- identity documents,
- death certificates,
- personal legal documents,
- family details,
- addresses,
- medical information,
- financial records,
- or private correspondence

through public issues, pull requests, or discussions.

---

## Response expectations

Clarvia is a small nonprofit project.

We will make a good-faith effort to:

- acknowledge valid reports,
- assess impact,
- prioritize remediation,
- and publish security-relevant updates where appropriate.

---

## Public disclosure

Please do not publicly disclose unresolved vulnerabilities before maintainers have had a reasonable opportunity to assess and address them.

---

## Accepted risks

### In-memory API rate limiting (`src/lib/rate-limit.ts`)

**Status:** Accepted for the current single-instance Coolify/Hetzner deployment.

`rateLimit()` uses a process-local `Map`. Limits are not shared across multiple Node processes or serverless instances.

**Why accepted**

- Production website currently runs as one long-lived container; per-process limits are global for that deployment.
- Contact, subscribe, and feedback already use Cloudflare Turnstile as the primary bot control.
- Donate only creates Stripe Checkout sessions; Stripe remains the payment gate.
- A shared store (Redis/Upstash/Postgres) would add infra and ops cost without a current multi-instance need.

**Revisit when**

- The website is scaled to multiple replicas or serverless instances, or
- Sustained abuse bypasses Turnstile / edge controls.

Until then, scanner findings that only note “in-memory rate limit is not cluster-global” are expected and should not reopen this decision.
