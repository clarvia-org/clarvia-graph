/**
 * Sentry PII scrubber for the Clarvia donation engine.
 *
 * Strips sensitive data from error context before Sentry capture,
 * per blueprint §16.
 *
 * Scrub:
 *   - Donor names and email addresses
 *   - Request bodies for donation and webhook endpoints
 *   - Cookies and authorization headers
 *   - Stripe customer metadata
 *   - Raw webhook payloads
 *   - URL query values (session IDs, tokens)
 *   - Resend payloads
 *   - n8n execution links containing parameters
 *
 * Retain:
 *   - Event type, internal job ID, donation ID
 *   - HTTP status, database error class
 *   - Retry attempt, workflow name/version
 */

/** Paths that contain sensitive request bodies. */
const SENSITIVE_PATHS = [
  "/api/stripe/webhook",
  "/api/resend/webhook",
  "/api/donate",
  "/api/contact",
  "/api/subscribe",
  "/api/feedback",
  "/api/internal/",
];

/** Query parameter keys to redact. */
const REDACTED_QUERY_PARAMS = new Set([
  "session_id",
  "token",
  "email",
  "donated",
  "payment_intent",
  "payment_intent_client_secret",
]);

/**
 * Scrub PII from an error event before sending to Sentry.
 *
 * Use as the `beforeSend` hook in Sentry configuration:
 * ```ts
 * Sentry.init({
 *   beforeSend: scrubSentryEvent,
 *   sendDefaultPii: false,
 * });
 * ```
 */
export function scrubSentryEvent(
  event: Record<string, unknown>,
): Record<string, unknown> {
  // Deep clone to avoid mutating the original
  const scrubbed = JSON.parse(JSON.stringify(event)) as Record<
    string,
    unknown
  >;

  // Scrub request data
  const request = scrubbed.request as
    | Record<string, unknown>
    | undefined;
  if (request) {
    // Remove cookies
    delete request.cookies;

    // Remove authorization headers
    const headers = request.headers as
      | Record<string, string>
      | undefined;
    if (headers) {
      delete headers.authorization;
      delete headers.cookie;
      delete headers["stripe-signature"];
      delete headers["x-clarvia-signature"];
    }

    // Remove request body for sensitive paths
    const url = (request.url as string) ?? "";
    const isSensitive = SENSITIVE_PATHS.some((p) => url.includes(p));
    if (isSensitive) {
      request.data = "[Scrubbed]";
    }

    // Redact sensitive query parameters from URL
    if (request.query_string) {
      request.query_string = scrubQueryString(
        request.query_string as string,
      );
    }
    if (typeof request.url === "string") {
      request.url = scrubUrl(request.url);
    }
  }

  // Scrub user context
  const user = scrubbed.user as Record<string, unknown> | undefined;
  if (user) {
    delete user.email;
    delete user.username;
    delete user.ip_address;
  }

  // Scrub breadcrumbs that might contain PII
  const breadcrumbs = scrubbed.breadcrumbs as
    | { values?: Array<Record<string, unknown>> }
    | undefined;
  if (breadcrumbs?.values) {
    for (const crumb of breadcrumbs.values) {
      if (typeof crumb.message === "string") {
        crumb.message = scrubPiiFromString(crumb.message);
      }
      if (crumb.data && typeof crumb.data === "object") {
        const data = crumb.data as Record<string, unknown>;
        delete data.email;
        delete data.body;
        if (typeof data.url === "string") {
          data.url = scrubUrl(data.url);
        }
      }
    }
  }

  // Scrub extra context
  const extra = scrubbed.extra as Record<string, unknown> | undefined;
  if (extra) {
    for (const key of Object.keys(extra)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("email") ||
        lowerKey.includes("name") ||
        lowerKey.includes("body") ||
        lowerKey.includes("payload") ||
        lowerKey.includes("cookie") ||
        lowerKey.includes("customer_metadata")
      ) {
        extra[key] = "[Scrubbed]";
      }
    }
  }

  return scrubbed;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function scrubQueryString(qs: string): string {
  const params = new URLSearchParams(qs);
  for (const key of params.keys()) {
    if (REDACTED_QUERY_PARAMS.has(key.toLowerCase())) {
      params.set(key, "[REDACTED]");
    }
  }
  return params.toString();
}

function scrubUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const key of u.searchParams.keys()) {
      if (REDACTED_QUERY_PARAMS.has(key.toLowerCase())) {
        u.searchParams.set(key, "[REDACTED]");
      }
    }
    return u.toString();
  } catch {
    // Not a valid URL, return as-is
    return url;
  }
}

/** Redact email-like patterns from a freeform string. */
function scrubPiiFromString(str: string): string {
  // Redact email addresses
  return str.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[email]",
  );
}
