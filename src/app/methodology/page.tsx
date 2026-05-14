import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PageHeader } from "@/components/PageHeader";

const steps = [
  "Find official or authoritative sources",
  "Create structured source objects",
  "Extract administrative facts into workflow data",
  "Attach provenance, jurisdiction, language, and access-date metadata",
  "Validate schemas and required fields",
  "Require human review before publication",
  "Monitor sources for change and mark stale items"
];

export default function MethodologyPage() {
  return (
    <div className="px-6 py-16">
      <PageHeader
        eyebrow="Methodology"
        title="Source-backed workflow production"
        description="Clarvia's methodology is designed to make bereavement administration guidance traceable, reviewable, reusable, and safe to publish."
      />

      <div className="mx-auto mt-10 max-w-3xl">
        <DisclaimerBanner />
      </div>

      <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Production loop</h2>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-muted">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Verification states</h2>
        <div className="mt-6 grid gap-3 text-sm text-muted">
          <p><strong>discovered:</strong> A source or claim has been identified but not yet structured.</p>
          <p><strong>structured-from-source:</strong> A fact has been extracted into structured data.</p>
          <p><strong>source-checked:</strong> A human has checked the structured data against the source.</p>
          <p><strong>expert-reviewed:</strong> A qualified reviewer has reviewed the item.</p>
          <p><strong>published:</strong> A maintainer has approved the item for public output.</p>
          <p><strong>stale-review:</strong> The review is outdated or the source may have changed.</p>
          <p><strong>superseded:</strong> The item has been replaced or is no longer current.</p>
        </div>
      </section>
    </div>
  );
}
