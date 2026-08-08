import { redirect } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}#contact`);
}
