import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PageHeader } from "@/components/PageHeader";

const principles = [
  "Source-backed administrative workflow data",
  "Visible provenance and verification status",
  "Static public outputs and future machine-readable exports",
  "Human review before publication",
  "No personal case intake in phase one"
];

export default function HomePage() {
  return (
    <div>
      <section className="px-6 py-20 md:py-28">
        <PageHeader
          eyebrow="Open public-interest infrastructure"
          title="Bereavement administration should be clear, source-backed, and reusable."
          description="Clarvia is building open workflow infrastructure for verified, source-backed bereavement administration across Europe, starting from Luxembourg."
        />

        <div className="mx-auto mt-10 max-w-3xl">
          <DisclaimerBanner />
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/workflows/luxembourg"
            className="rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white"
          >
            View Luxembourg alpha
          </Link>
          <Link
            href="/methodology"
            className="rounded-full border border-line bg-white px-5 py-3 text-center text-sm font-semibold"
          >
            Read methodology
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold">Infrastructure, not just content</h2>
          </div>
          <div className="md:col-span-2">
            <p className="text-lg leading-8 text-muted">
              Clarvia models administrative steps as structured workflow data with sources,
              review status, deadlines, conditions, institutions, and reusable scenarios.
              The website is a publication layer for that data.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold">Project principles</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <div
                key={principle}
                className="rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <p className="font-medium">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
