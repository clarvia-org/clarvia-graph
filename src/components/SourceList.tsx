import type { Source } from "@/lib/workflow-types";
import { formatDate } from "@/lib/format";
import { VerificationBadge } from "./VerificationBadge";

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted">
        No public source references are attached yet.
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Sources</h2>
      <ul className="mt-4 space-y-4">
        {sources.map((source) => (
          <li key={source.id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <a
                  href={source.url}
                  className="font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.title}
                </a>
                <p className="mt-1 text-sm text-muted">
                  Jurisdiction: {source.jurisdiction.country} · Language:{" "}
                  {source.languages.join(", ")} · Accessed:{" "}
                  {formatDate(source.accessed_at)}
                </p>
                {source.last_verified_at ? (
                  <p className="mt-1 text-sm text-muted">
                    Last verified: {formatDate(source.last_verified_at)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">
                    Last verified: not yet reviewed
                  </p>
                )}
              </div>
              <VerificationBadge status={source.verification_status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
