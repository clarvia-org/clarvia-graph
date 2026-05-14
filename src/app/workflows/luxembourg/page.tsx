import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PageHeader } from "@/components/PageHeader";
import { SourceList } from "@/components/SourceList";
import { VerificationBadge } from "@/components/VerificationBadge";
import { WorkflowTaskCard } from "@/components/WorkflowTaskCard";
import { sampleSources, sampleTasks, sampleWorkflow } from "@/data/sample-workflow";

export default function LuxembourgWorkflowPage() {
  return (
    <div className="px-6 py-16">
      <PageHeader
        eyebrow="Luxembourg alpha"
        title="Luxembourg bereavement administration workflow"
        description="This is an early alpha scaffold for a source-backed Luxembourg workflow. It is not complete, not fully reviewed, and not published as final guidance."
      />

      <div className="mx-auto mt-10 max-w-3xl">
        <DisclaimerBanner />
      </div>

      <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{sampleWorkflow.title}</h2>
            <p className="mt-3 leading-7 text-muted">{sampleWorkflow.description}</p>
          </div>
          <VerificationBadge status={sampleWorkflow.verification_status} />
        </div>

        <p className="mt-5 text-sm text-muted">
          Publication status: {sampleWorkflow.publication_status}
        </p>
      </section>

      <section className="mx-auto mt-8 grid max-w-3xl gap-4">
        <h2 className="text-2xl font-semibold">Workflow tasks</h2>
        {sampleTasks.map((task, index) => (
          <WorkflowTaskCard key={task.id} task={task} index={index} />
        ))}
      </section>

      <div className="mx-auto mt-8 max-w-3xl">
        <SourceList sources={sampleSources} />
      </div>

      <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Corrections</h2>
        <p className="mt-3 leading-7 text-muted">
          If you find a possible source, workflow, or display issue, please open a GitHub issue.
          Do not include personal bereavement cases or sensitive personal information.
        </p>
      </section>
    </div>
  );
}
