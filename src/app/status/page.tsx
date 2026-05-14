import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const repositories = [
  {
    name: "workflow-data",
    href: "https://github.com/clarvia-org/workflow-data",
    description: "Source-backed workflow data, schemas, provenance, exports, and validation"
  },
  {
    name: "workflow-web",
    href: "https://github.com/clarvia-org/workflow-web",
    description: "Static web layer for publishing workflows, checklists, and generated API views"
  }
];

export default function StatusPage() {
  return (
    <div className="px-6 py-16">
      <PageHeader
        eyebrow="Project status"
        title="Early infrastructure setup"
        description="Clarvia is currently building its initial repository structure, source-backed data model, and Luxembourg alpha workflow."
      />

      <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Current phase</h2>
        <p className="mt-4 leading-7 text-muted">
          Clarvia is in alpha infrastructure setup. Public workflow outputs should be treated
          as drafts unless clearly marked as published and reviewed.
        </p>
      </section>

      <section className="mx-auto mt-8 grid max-w-3xl gap-4">
        <h2 className="text-2xl font-semibold">Repositories</h2>
        {repositories.map((repo) => (
          <article
            key={repo.name}
            className="rounded-2xl border border-line bg-white p-5 shadow-sm"
          >
            <h3 className="text-xl font-semibold">
              <Link href={repo.href} className="underline decoration-line underline-offset-4">
                {repo.name}
              </Link>
            </h3>
            <p className="mt-2 text-muted">{repo.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
