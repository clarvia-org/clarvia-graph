"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ContactRedirect() {
  const params = useParams();
  const lang = typeof params.lang === "string" ? params.lang : "en";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.location.replace(`/${lang}#contact`);
  }, [lang]);

  return null;
}
