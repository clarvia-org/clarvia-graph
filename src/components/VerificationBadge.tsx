import type { VerificationStatus } from "@/lib/workflow-types";

const labels: Record<VerificationStatus, string> = {
  discovered: "Discovered",
  "structured-from-source": "Structured from source",
  "source-checked": "Source checked",
  "expert-reviewed": "Expert reviewed",
  published: "Published",
  "stale-review": "Stale review",
  superseded: "Superseded"
};

export function VerificationBadge({
  status
}: {
  status: VerificationStatus;
}) {
  return (
    <span className="inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
      {labels[status]}
    </span>
  );
}
