"use client";

import { useEffect } from "react";
import { trackOfficialSourceClick } from "@/lib/analytics";

export default function GuideOutboundTracker({
  slug,
  lang,
}: {
  slug: string;
  lang: string;
}) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!/^https?:\/\//i.test(href)) return;

      const inContacts = Boolean(anchor.closest('[aria-labelledby="official-contacts-heading"]'));
      const inSources = Boolean(anchor.closest('[aria-labelledby="official-sources-heading"]'));
      if (!inContacts && !inSources) return;

      trackOfficialSourceClick({
        slug,
        language: lang === "lu" ? "lb" : lang,
        destination: href,
        link_kind: inContacts ? "authority" : "source",
      });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [slug, lang]);

  return null;
}
