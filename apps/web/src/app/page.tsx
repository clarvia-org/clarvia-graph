import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language") || "";

  // Check for Luxembourgish, French or German preference, otherwise default to English
  if (/(^|,\s*)lb\b/i.test(acceptLang)) redirect("/fr");
  if (/(^|,\s*)fr\b/i.test(acceptLang)) redirect("/fr");
  if (/(^|,\s*)de\b/i.test(acceptLang)) redirect("/de");
  redirect("/en");
}
