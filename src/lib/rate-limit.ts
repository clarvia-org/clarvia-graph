/**
 * Process-local sliding-window limiter.
 *
 * Not shared across replicas/serverless instances. That is an accepted risk
 * for the current single-instance Coolify deployment — see SECURITY.md
 * ("Accepted risks"). Revisit before horizontal scale-out.
 */
const limiters = new Map<string, Map<string, number[]>>();

export function rateLimit(
  name: string,
  limit: number,
  windowMs: number
): (ip: string) => { allowed: boolean; retryAfterMs?: number } {
  if (!limiters.has(name)) limiters.set(name, new Map());
  const store = limiters.get(name)!;

  return (ip: string) => {
    const now = Date.now();
    const timestamps = store.get(ip)?.filter((t) => t > now - windowMs) || [];
    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      return { allowed: false, retryAfterMs: oldest + windowMs - now };
    }
    timestamps.push(now);
    store.set(ip, timestamps);
    return { allowed: true };
  };
}
