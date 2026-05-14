import { PageHeader } from "@/components/PageHeader";

const jurisdictions = [
  {
    name: "Luxembourg",
    status: "Alpha source registry and workflow data in progress",
    flag: "🇱🇺"
  },
  {
    name: "France",
    status: "Source mapping planned",
    flag: "🇫🇷"
  },
  {
    name: "Belgium",
    status: "Jurisdiction modeling planned",
    flag: "🇧🇪"
  },
  {
    name: "Germany",
    status: "Federal-core and state-overlay modeling planned",
    flag: "🇩🇪"
  },
  {
    name: "Portugal",
    status: "Source mapping planned",
    flag: "🇵🇹"
  }
];

export default function CoveragePage() {
  return (
    <div className="px-6 py-16">
      <PageHeader
        eyebrow="Coverage"
        title="Starting narrow, building for cross-border reuse"
        description="Clarvia starts from Luxembourg and the Greater Region, then expands through source-backed corridor packs and reviewed jurisdiction models."
      />

      <section className="mx-auto mt-12 grid max-w-4xl gap-4">
        {jurisdictions.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-line bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl" aria-hidden="true">
                {item.flag}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="mt-2 text-muted">{item.status}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
