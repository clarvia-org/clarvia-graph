import type { Task } from "@/lib/workflow-types";
import { VerificationBadge } from "./VerificationBadge";

export function WorkflowTaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-moss">
            Step {index + 1} · {task.phase}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{task.title}</h3>
          {task.summary ? (
            <p className="mt-3 leading-7 text-muted">{task.summary}</p>
          ) : null}
        </div>

        <VerificationBadge status={task.verification_status} />
      </div>

      {task.user_actions.length > 0 ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold">Current guidance status</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
            {task.user_actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-muted">
        Publication status: {task.publication_status}
      </p>
    </article>
  );
}
