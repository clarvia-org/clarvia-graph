import { redirect } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://clarvia.org/brochure.html",
  },
};

export default async function BrochurePage() {
  redirect("/brochure.html");
}
