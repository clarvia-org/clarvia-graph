import { type Metadata } from "next";
import { Suspense } from "react";
import AskEntryClient from "./AskEntryClient";

const BASE_URL = "https://clarvia.org";

export const metadata: Metadata = {
  title: "Ask Clarvia | Clarvia",
  description:
    "Describe what happened in your own language. Clarvia replies by email with source-linked next steps. Free, no account.",
  alternates: {
    canonical: `${BASE_URL}/ask`,
  },
  openGraph: {
    title: "Ask Clarvia | Clarvia",
    description:
      "Describe what happened in your own language. Clarvia replies by email with source-linked next steps. Free, no account.",
    url: `${BASE_URL}/ask`,
    siteName: "Clarvia",
    type: "website",
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
};

export default function AskPage() {
  return (
    <Suspense fallback={null}>
      <AskEntryClient />
    </Suspense>
  );
}
