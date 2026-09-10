import { type Metadata } from "next";
import { Suspense } from "react";
import AskSentClient from "./AskSentClient";

const BASE_URL = "https://clarvia.org";

export const metadata: Metadata = {
  title: "We’re on it. | Clarvia",
  robots: { index: false, follow: false, nocache: true },
  alternates: {
    canonical: `${BASE_URL}/ask/sent`,
  },
};

export default function AskSentPage() {
  return (
    <Suspense fallback={null}>
      <AskSentClient />
    </Suspense>
  );
}
