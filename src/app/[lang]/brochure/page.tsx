"use client";

import { useEffect } from "react";

/**
 * Redirect /{lang}/brochure → /brochure.html
 *
 * The brochure is a standalone static HTML page served from public/.
 * Next.js app router intercepts /{lang}/brochure before it can reach
 * the public directory, so this page component redirects to the
 * static file.
 */
export default function BrochureRedirect() {
  useEffect(() => {
    window.location.replace("/brochure.html");
  }, []);

  return null;
}
