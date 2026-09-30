"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";
import { captureAskSource } from "@/lib/ask-source";

function RouteTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParams.toString();
    captureAskSource(search);
    const path = search ? `${pathname}?${search}` : pathname;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsRouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTrackerInner />
    </Suspense>
  );
}
