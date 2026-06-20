"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirect /{lang}/contact → /{lang}#contact
 *
 * This page exists so that printed materials (brochures, flyers)
 * can reference a clean URL like clarvia.org/en/contact without
 * relying on a hash fragment, which is awkward on paper.
 *
 * The redirect happens client-side because Next.js redirects
 * do not support hash fragments in the destination.
 */
export default function ContactRedirect() {
  const params = useParams();
  const lang = typeof params.lang === "string" ? params.lang : "en";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.location.replace(`/${lang}#contact`);
  }, [lang]);

  return null;
}
