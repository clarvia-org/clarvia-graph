/**
 * Job queue — best-effort kick to n8n.
 *
 * `kickAutomation()` sends a fire-and-forget POST to the n8n webhook URL.
 * It never throws — correctness depends on the committed automation_jobs
 * row plus n8n's scheduled sweep, not on this kick succeeding.
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * Best-effort POST to n8n with the automation job ID.
 * Fire-and-forget — never throws.
 */
export async function kickAutomation(
  jobId: string | null,
): Promise<void> {
  if (!jobId || !N8N_WEBHOOK_URL) return;

  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Fire-and-forget: n8n's scheduled sweep will pick up the job.
  }
}
