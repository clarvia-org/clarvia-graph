import { type Metadata } from "next";
import AskEntryClient from "./AskEntryClient";

const BASE_URL = "https://clarvia.org";

export const metadata: Metadata = {
  title: "Ask Clarvia | Clarvia",
  description:
    "Free bereavement guidance. If someone you love is terminally ill or has died, ask Clarvia in your own language. Lex replies by email.",
  alternates: {
    canonical: `${BASE_URL}/ask`,
  },
  openGraph: {
    title: "Ask Clarvia | Clarvia",
    description:
      "Free bereavement guidance. If someone you love is terminally ill or has died, ask Clarvia in your own language. Lex replies by email.",
    url: `${BASE_URL}/ask`,
    siteName: "Clarvia",
    type: "website",
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
};

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[]; ref?: string | string[]; market?: string | string[] }>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? null : null;
  return (
    <AskEntryClient
      linkHint={first(params.lang)}
      refHint={first(params.ref)}
      marketHint={first(params.market)}
    />
  );
}
