import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language") || "";

  // Check for Luxembourgish, French or German preference, otherwise default to English
  if (/^lb|,\s*lb/i.test(acceptLang)) redirect("/fr");
  if (/^fr|,\s*fr/i.test(acceptLang)) redirect("/fr");
  if (/^de|,\s*de/i.test(acceptLang)) redirect("/de");
  redirect("/en");
}
