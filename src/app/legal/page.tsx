import { PageHeader } from "@/components/PageHeader";

export default function LegalPage() {
  return (
    <div className="px-6 py-16">
      <PageHeader
        eyebrow="Important limitation"
        title="Administrative guidance, not legal advice"
        description="Clarvia publishes source-backed administrative workflow information. It does not provide individualized legal, tax, inheritance, emergency, counselling, or case-management services."
      />

      <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">What Clarvia provides</h2>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-muted">
          <li>Administrative workflow information based on official sources</li>
          <li>Structured task and source metadata</li>
          <li>Public checklists and reusable workflow views</li>
          <li>Source citations and verification status where available</li>
        </ul>
      </section>

      <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">What Clarvia does not provide</h2>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-muted">
          <li>Individualized legal advice</li>
          <li>Tax advice</li>
          <li>Inheritance advice</li>
          <li>Emergency assistance</li>
          <li>Grief counselling</li>
          <li>Personal case management</li>
          <li>Storage or review of private family documents</li>
        </ul>
      </section>
    </div>
  );
}
