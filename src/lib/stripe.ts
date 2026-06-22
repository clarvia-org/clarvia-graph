import Stripe from "stripe";

/**
 * Shared Stripe client instance.
 *
 * Requires STRIPE_SECRET_KEY environment variable.
 * Returns null if the key is not configured, allowing routes
 * to return a graceful 503 instead of crashing.
 */
export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}
