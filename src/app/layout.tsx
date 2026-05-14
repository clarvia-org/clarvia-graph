import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clarvia",
    template: "%s | Clarvia"
  },
  description:
    "Open workflow infrastructure for verified, source-backed bereavement administration across Europe.",
  metadataBase: new URL("https://clarvia.org")
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/methodology", label: "Methodology" },
  { href: "/coverage", label: "Coverage" },
  { href: "/workflows/luxembourg", label: "Luxembourg alpha" },
  { href: "/status", label: "Status" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Clarvia
            </Link>

            <nav aria-label="Main navigation">
              <ul className="flex flex-wrap gap-4 text-sm text-muted">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-ink">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 text-sm text-muted md:grid-cols-2">
            <p>
              Clarvia provides administrative guidance based on official sources.
              It is not a substitute for individualized legal advice.
            </p>
            <p className="md:text-right">
              Maintained by CLARVIA ASBL. Source-backed workflow infrastructure
              for public-interest use.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
