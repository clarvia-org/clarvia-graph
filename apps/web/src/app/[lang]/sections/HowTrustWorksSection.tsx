import Link from "next/link";
import { type Lang, s1 } from "@/lib/i18n";
import { headlineStyle } from "../data";

export default function HowTrustWorksSection({ lang }: { lang: Lang }) {
  const items = [
    { href: `/${lang}/how-it-works#official-sources`, label: s1("Official sources") },
    { href: `/${lang}/how-it-works#human-review`, label: s1("Human publication gate") },
    { href: `/${lang}/how-it-works#privacy`, label: s1("Privacy split") },
  ];

  return (
    <section className="mb-16" aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="text-2xl sm:text-3xl font-semibold text-center mb-6" style={headlineStyle}>
        {s1("How trust works")}
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass-panel px-5 py-3 text-sm font-medium text-calm-blue-700 hover:text-calm-blue-900"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
